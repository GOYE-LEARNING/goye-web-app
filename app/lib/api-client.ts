// lib/api-client.ts
"use client";

import { dispatchAPIError } from "@/app/hook/useAPIErrorHandler";

interface QueuedRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  config: RequestInit;
  url: string;
}

class APIClient {
  private static instance: APIClient;
  private isRefreshing = false;
  private failedQueue: QueuedRequest[] = [];
  private refreshPromise: Promise<any> | null = null;
  private readonly MAX_RETRY = 2;

  private constructor() {}

  static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  private processQueue(error: any = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        this.executeRequest(prom.url, prom.config)
          .then(prom.resolve)
          .catch(prom.reject);
      }
    });
    this.failedQueue = [];
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verify/refresh-token`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Refresh token failed");
      }

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  private async executeRequest(url: string, options: RequestInit, retryCount = 0): Promise<any> {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      // Handle 401 - Unauthorized (token expired)
      if (response.status === 401 && retryCount < this.MAX_RETRY) {
        console.log(`🔑 Token expired, attempting refresh... (Attempt ${retryCount + 1}/${this.MAX_RETRY})`);
        
        // If already refreshing, queue the request
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject, config: options, url });
          });
        }

        this.isRefreshing = true;

        try {
          const refreshed = await this.refreshToken();
          
          if (refreshed) {
            console.log("✅ Token refreshed successfully");
            this.processQueue(null);
            // Retry the original request
            return this.executeRequest(url, options, retryCount + 1);
          } else {
            throw new Error("Refresh token failed");
          }
        } catch (refreshError) {
          this.processQueue(refreshError);
          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = "/auth?session=expired";
          }
          throw refreshError;
        } finally {
          this.isRefreshing = false;
        }
      }

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after") || "5";
        const waitTime = parseInt(retryAfter) * 1000;
        
        if (retryCount < this.MAX_RETRY) {
          console.log(`⏳ Rate limited. Waiting ${waitTime}ms before retry`);
          await this.delay(waitTime);
          return this.executeRequest(url, options, retryCount + 1);
        }
        
        throw {
          status: 429,
          message: "Too many requests. Please try again later.",
          retryAfter: parseInt(retryAfter)
        };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.message || response.statusText || `Request failed with status ${response.status}`,
          data: errorData
        };
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      }
      
      return await response.text();

    } catch (error: any) {
      // If it's a 401 and we still have retries, try again
      if (error.status === 401 && retryCount < this.MAX_RETRY) {
        console.log(`🔄 Retrying request (${retryCount + 1}/${this.MAX_RETRY})`);
        return this.executeRequest(url, options, retryCount + 1);
      }
      
      // Dispatch error for global handling
      if (typeof window !== 'undefined') {
        dispatchAPIError(error);
      }
      
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async request(url: string, options: RequestInit = {}): Promise<any> {
    // Ensure URL is absolute
    const fullUrl = url.startsWith('http') 
      ? url 
      : `${process.env.NEXT_PUBLIC_API_URL}${url.startsWith('/') ? url : '/' + url}`;
    
    return this.executeRequest(fullUrl, options);
  }

  // Convenience methods
  get(url: string) {
    return this.request(url, { method: "GET" });
  }

  post(url: string, body?: any) {
    return this.request(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put(url: string, body?: any) {
    return this.request(url, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete(url: string) {
    return this.request(url, { method: "DELETE" });
  }
}

export const api = APIClient.getInstance();

// Export a default instance
export default api;