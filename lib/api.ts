/**
 * FaceJob Admin API Client - V1 Enhanced Security
 * 
 * Centralized API client for admin panel communications
 * Handles authentication, error handling, and security headers
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
}

class AdminAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/${API_VERSION}`;
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try multiple storage locations
    return (
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken') ||
      document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1] ||
      null
    );
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T = any>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      requireAuth = true
    } = options;

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers
    };

    // Add authentication if required
    if (requireAuth) {
      const token = this.getAuthToken();
      if (!token) {
        return {
          status: 401,
          error: 'Authentication required'
        };
      }
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Prepare request body
    let requestBody: string | FormData | undefined;
    if (body) {
      if (body instanceof FormData) {
        requestBody = body;
        delete requestHeaders['Content-Type']; // Let browser set it for FormData
      } else {
        requestBody = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: requestBody,
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          // Redirect to login if in browser
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }

        return {
          status: response.status,
          error: responseData.message || responseData.error || 'Request failed',
          data: responseData
        };
      }

      return {
        status: response.status,
        data: responseData,
        message: responseData.message
      };

    } catch (error) {
      console.error('API Request Error:', error);
      return {
        status: 500,
        error: 'Network error or server unavailable'
      };
    }
  }

  // Admin Authentication
  public async adminLogin(credentials: { email: string; password: string }) {
    return this.makeRequest('/auth/admin/login', {
      method: 'POST',
      body: credentials,
      requireAuth: false
    });
  }

  public async logout() {
    return this.makeRequest('/logout', { method: 'GET' });
  }

  // Public endpoints (no auth required)
  public async getPublicData(endpoint: string) {
    return this.makeRequest(endpoint, { requireAuth: false });
  }

  public async getSectors() {
    return this.makeRequest('/sectors', { requireAuth: false });
  }

  public async getPlans() {
    return this.makeRequest('/plans', { requireAuth: false });
  }

  // Admin endpoints (auth required)
  public async getCandidates() {
    return this.makeRequest('/admin/candidates');
  }

  public async getCandidate(id: string) {
    return this.makeRequest(`/candidate/${id}`);
  }

  public async deleteCandidate(id: string) {
    return this.makeRequest(`/admin/candidate/delete/${id}`, { method: 'DELETE' });
  }

  public async getEnterprises() {
    return this.makeRequest('/admin/entreprises');
  }

  public async getEnterprise(id: string) {
    return this.makeRequest(`/enterprise/${id}`);
  }

  public async deleteEnterprise(id: string) {
    return this.makeRequest(`/admin/enterprise/delete/${id}`, { method: 'DELETE' });
  }

  public async acceptEnterprise(id: string) {
    return this.makeRequest(`/admin/enterprise/accept/${id}`, { method: 'PUT' });
  }

  public async getJobs() {
    return this.makeRequest('/offres');
  }

  public async getJob(id: string) {
    return this.makeRequest(`/admin/offres_by_id/${id}`);
  }

  public async acceptJob(id: string) {
    return this.makeRequest(`/admin/job/accept/${id}`, { method: 'PUT' });
  }

  public async getCandidateVideos() {
    return this.makeRequest('/admin/candidate-videos');
  }

  public async deleteCandidateVideo(id: string) {
    return this.makeRequest(`/admin/delete_cv/${id}`, { method: 'DELETE' });
  }

  public async verifyCandidateVideo(id: string) {
    return this.makeRequest(`/admin/verify/${id}`, { method: 'PUT' });
  }

  public async getPayments() {
    return this.makeRequest('/admin/payments');
  }

  public async getPayment(id: string) {
    return this.makeRequest(`/admin/payment/${id}`);
  }

  public async acceptPayment(id: string) {
    return this.makeRequest(`/admin/payments/accept/${id}`, { method: 'PUT' });
  }

  public async updateCandidate(id: string, data: any) {
    return this.makeRequest(`/candidate/updateId/${id}`, {
      method: 'PUT',
      body: data
    });
  }

  public async updateEnterprise(id: string, data: any) {
    return this.makeRequest(`/enterprise/updateId/${id}`, {
      method: 'PUT',
      body: data
    });
  }

  public async changeEnterprisePlan(enterpriseId: string, data: any) {
    return this.makeRequest(`/enterprise/${enterpriseId}/change-plan`, {
      method: 'POST',
      body: data
    });
  }

  // Generic request method for custom endpoints
  public async request<T = any>(endpoint: string, options: RequestOptions = {}) {
    return this.makeRequest<T>(endpoint, options);
  }
}

// Export singleton instance
export const adminApi = new AdminAPI();

// Export types for use in components
export type { ApiResponse, RequestOptions };

// Helper function for backward compatibility
export function makeApiCall(endpoint: string, options: RequestOptions = {}) {
  return adminApi.request(endpoint, options);
}