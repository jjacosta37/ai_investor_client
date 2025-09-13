import { User } from 'firebase/auth';
import { apiConfig, getAuthHeaders, getDefaultHeaders } from '../config/api';
import { RequestConfig } from '@/types/api';

export class BaseApiService {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;

  constructor() {
    this.baseURL = apiConfig.baseURL;
    this.defaultTimeout = apiConfig.timeout;
    this.defaultRetries = apiConfig.retries;
  }

  // Get Firebase auth token
  private async getAuthToken(user: User | null): Promise<string | null> {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const token = await user.getIdToken();
      return token;
    } catch (error) {
      console.error('Failed to get Firebase auth token:', error);
      throw new Error('Authentication failed');
    }
  }

  // Make authenticated request
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    user: User | null,
    config?: RequestConfig,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const timeout = config?.timeout || this.defaultTimeout;
    const retries = config?.retries || this.defaultRetries;

    let headers = getDefaultHeaders();

    // Add auth token if user is provided
    if (user) {
      const token = await this.getAuthToken(user);
      if (token) {
        headers = getAuthHeaders(token);
      }
    }

    // Merge custom headers
    if (config?.headers) {
      headers = { ...headers, ...config.headers };
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
    };

    return this.executeWithRetry(url, requestOptions, timeout, retries);
  }

  // Execute request with retry logic
  private async executeWithRetry<T>(
    url: string,
    options: RequestInit,
    timeout: number,
    retries: number,
  ): Promise<T> {
    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            errorData.error || 'Request failed',
            errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`,
            errorData,
          );
        }

        // Handle 204 No Content response (common for DELETE operations)
        if (response.status === 204) {
          return undefined as T;
        }

        // Check if response has content before parsing JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // If not JSON, return empty object or text content
          const text = await response.text();
          return (text ? { message: text } : {}) as T;
        }

        const responseData = await response.json();
        return responseData;
      } catch (error) {
        if (i === retries) {
          if (error instanceof ApiError) {
            throw error;
          }
          throw new ApiError(
            'Network Error',
            error instanceof Error ? error.message : 'Unknown error occurred',
            error,
          );
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, i) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new ApiError(
      'Max retries reached',
      'Request failed after multiple attempts',
    );
  }

  // GET request
  protected async get<T>(
    endpoint: string,
    user: User | null,
    config?: RequestConfig,
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' }, user, config);
  }

  // POST request
  protected async post<T>(
    endpoint: string,
    data: any,
    user: User | null,
    config?: RequestConfig,
  ): Promise<T> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      user,
      config,
    );
  }

  // PUT request
  protected async put<T>(
    endpoint: string,
    data: any,
    user: User | null,
    config?: RequestConfig,
  ): Promise<T> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      user,
      config,
    );
  }

  // DELETE request
  protected async delete<T>(
    endpoint: string,
    user: User | null,
    config?: RequestConfig,
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' }, user, config);
  }

  // PATCH request
  protected async patch<T>(
    endpoint: string,
    data: any,
    user: User | null,
    config?: RequestConfig,
  ): Promise<T> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      user,
      config,
    );
  }
}

// Custom API Error class
export class ApiError extends Error {
  public readonly details?: any;
  public readonly originalMessage: string;

  constructor(error: string, message: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.originalMessage = error;
    this.details = details;
  }
}
