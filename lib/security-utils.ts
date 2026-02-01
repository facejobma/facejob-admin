/**
 * Security utilities for sanitizing data before sending to API
 */

/**
 * Sanitize string input to remove potentially suspicious patterns
 */
export function sanitizeString(input: string): string {
  if (!input) return input;
  
  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Remove potential XSS patterns while preserving legitimate content
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Remove potential SQL injection patterns
  sanitized = sanitized.replace(/(\-\-|\#|\/\*|\*\/)/g, '');
  
  // Remove potential command injection patterns
  sanitized = sanitized.replace(/(\||&|;|`|\$\(|\${)/g, '');
  
  return sanitized.trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize both key and value
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Create safe headers for API requests
 */
export function createSafeHeaders(authToken: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Cache-Control': 'no-cache',
  };
}

/**
 * Check if a string contains potentially suspicious patterns
 */
export function containsSuspiciousPatterns(input: string): boolean {
  if (!input) return false;
  
  const suspiciousPatterns = [
    // XSS patterns
    /<script[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    
    // SQL injection patterns
    /(\bunion\b.*\bselect\b)|(\bselect\b.*\bunion\b)/i,
    /\b(drop|delete|insert|update)\b.*\b(table|from|into)\b/i,
    /(\-\-|\#|\/\*|\*\/)/,
    
    // Command injection patterns
    /(\||&|;|`|\$\(|\${)/,
    /\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ping|nslookup|dig)\b/i,
    
    // Path traversal patterns
    /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\\/i,
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate and sanitize request body before sending
 */
export function sanitizeRequestBody(body: any): any {
  if (!body) return body;
  
  // Convert to string to check for suspicious patterns
  const bodyString = JSON.stringify(body);
  
  if (containsSuspiciousPatterns(bodyString)) {
    console.warn('Suspicious patterns detected in request body, sanitizing...');
  }
  
  return sanitizeObject(body);
}

/**
 * Create a safe fetch wrapper that sanitizes data
 */
export async function safeFetch(
  url: string, 
  options: Omit<RequestInit, 'body'> & { body?: any } = {}
): Promise<Response> {
  const { body, headers, ...restOptions } = options;
  
  const safeOptions: RequestInit = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  
  // Sanitize body if present
  if (body && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
    const sanitizedBody = sanitizeRequestBody(body);
    safeOptions.body = JSON.stringify(sanitizedBody);
  }
  
  return fetch(url, safeOptions);
}

export default {
  sanitizeString,
  sanitizeObject,
  createSafeHeaders,
  containsSuspiciousPatterns,
  sanitizeRequestBody,
  safeFetch,
};