import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Cookies from 'js-cookie';

interface UseApiWithRateLimitOptions {
  minInterval?: number; // Minimum time between requests in milliseconds
  maxRetries?: number; // Maximum number of retries for rate limited requests
}

interface ApiCallOptions {
  showRefreshToast?: boolean;
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export function useApiWithRateLimit(options: UseApiWithRateLimitOptions = {}) {
  const { minInterval = 5000, maxRetries = 3 } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCallTime, setLastCallTime] = useState<number>(0);
  const { toast } = useToast();

  const makeApiCall = useCallback(async <T = any>(
    callOptions: ApiCallOptions
  ): Promise<T | null> => {
    const { 
      showRefreshToast = false, 
      endpoint, 
      method = 'GET', 
      body, 
      headers = {} 
    } = callOptions;

    // Check rate limiting
    const now = Date.now();
    if (now - lastCallTime < minInterval && showRefreshToast) {
      const remainingTime = Math.ceil((minInterval - (now - lastCallTime)) / 1000);
      toast({
        title: "Actualisation trop fréquente",
        description: `Veuillez attendre ${remainingTime} seconde${remainingTime > 1 ? 's' : ''} avant de réactualiser.`,
        variant: "destructive",
      });
      return null;
    }

    const authToken = Cookies.get("authToken");
    let retryCount = 0;

    const attemptRequest = async (): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        setLastCallTime(now);

        const requestOptions: RequestInit = {
          method,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            ...headers,
          },
        };

        if (body && method !== 'GET') {
          requestOptions.body = JSON.stringify(body);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`,
          requestOptions
        );

        if (response.status === 429) {
          // Rate limit exceeded
          if (retryCount < maxRetries) {
            const retryAfter = response.headers.get('Retry-After') || '5';
            const waitTime = parseInt(retryAfter) * 1000;
            
            toast({
              title: "Limite de requêtes atteinte",
              description: `Nouvelle tentative ${retryCount + 1}/${maxRetries} dans ${retryAfter} secondes...`,
              variant: "destructive",
            });
            
            retryCount++;
            
            // Wait and retry
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return attemptRequest();
          } else {
            throw new Error(`Limite de requêtes dépassée. Veuillez réessayer plus tard.`);
          }
        }

        if (response.status === 400) {
          // Check if it's a security-related error
          const errorData = await response.json().catch(() => ({}));
          if (errorData.error_code === 'CLIENT_ERROR' && errorData.message?.includes('Suspicious activity')) {
            throw new Error('Accès temporairement restreint en raison d\'une activité suspecte détectée. Veuillez réessayer dans quelques minutes.');
          }
          // Re-throw the response for other 400 errors
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (showRefreshToast) {
          toast({
            title: "Données actualisées",
            description: "Les données ont été mises à jour avec succès.",
          });
        }

        return result;
      } catch (error) {
        console.error("API call error:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur lors de la requête.";
        setError(errorMessage);
        
        // Don't show toast for rate limit errors as we handle them above
        if (!errorMessage.includes('429') && !errorMessage.includes('Limite de requêtes')) {
          toast({
            title: "Erreur",
            variant: "destructive",
            description: errorMessage,
          });
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    };

    return attemptRequest();
  }, [minInterval, maxRetries, lastCallTime, toast]);

  return {
    makeApiCall,
    loading,
    error,
    clearError: () => setError(null),
  };
}

export default useApiWithRateLimit;