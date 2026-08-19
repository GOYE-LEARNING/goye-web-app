// lib/rate-limited-api.ts
"use client";

import { dispatchAPIError } from "@/app/hook/useAPIErrorHandler";
import { getOrCreateDeviceId } from "@/app/utils/database/db";
class RateLimitedAPI {
  private static instance: RateLimitedAPI;
  private requestLogs: Map<string, number[]> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private rateLimitConfig: Map<string, { maxRequests: number; timeWindow: number }> = new Map();

  private constructor() {
    this.initializeRateLimits();
  }

  static getInstance(): RateLimitedAPI {
    if (!RateLimitedAPI.instance) {
      RateLimitedAPI.instance = new RateLimitedAPI();
    }
    return RateLimitedAPI.instance;
  }

  private initializeRateLimits() {
    // High traffic endpoints
    const highEndpoints = [
      '/socials/get-groups',
      '/socials/get-groups-created-by-tutor',
      '/user/profile',
      '/course/get-all-courses',
      '/course/get-courses-by-tutor'
    ];
    highEndpoints.forEach(endpoint => {
      this.rateLimitConfig.set(endpoint, { maxRequests: 5, timeWindow: 60000 });
    });

    // Medium traffic endpoints
    const mediumEndpoints = [
      '/socials/get-group',
      '/socials/check-joined',
      '/enroll/check-if-enrolled',
      '/course/get-course'
    ];
    mediumEndpoints.forEach(endpoint => {
      this.rateLimitConfig.set(endpoint, { maxRequests: 10, timeWindow: 60000 });
    });

    // Mutation endpoints
    const mutationEndpoints = [
      '/socials/join-group',
      '/socials/exit-group',
      '/enroll/student-enroll',
      '/course/save-course',
      '/api/user/profile',
    ];
    mutationEndpoints.forEach(endpoint => {
      this.rateLimitConfig.set(endpoint, { maxRequests: 3, timeWindow: 60000 });
    });
  }

  private getEndpointKey(url: string): string {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.replace('/api', '');
    
    // Find matching endpoint pattern
    for (const [pattern] of this.rateLimitConfig) {
      if (pathname.includes(pattern)) {
        return pattern;
      }
    }
    return 'default';
  }

  private async checkRateLimit(endpointKey: string): Promise<void> {
    const config = this.rateLimitConfig.get(endpointKey);
    if (!config) return;

    const now = Date.now();
    const timestamps = this.requestLogs.get(endpointKey) || [];
    
    // Clean old timestamps
    const validTimestamps = timestamps.filter(ts => now - ts < config.timeWindow);
    
    if (validTimestamps.length >= config.maxRequests) {
      const oldestTimestamp = validTimestamps[0];
      const waitTime = config.timeWindow - (now - oldestTimestamp);
      const error = {
        status: 429,
        message: `Rate limit exceeded for ${endpointKey}. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
        retryAfter: Math.ceil(waitTime / 1000),
        endpoint: endpointKey
      };
      dispatchAPIError(error);
      throw error;
    }
    
    validTimestamps.push(now);
    this.requestLogs.set(endpointKey, validTimestamps);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async request(url: string, options: RequestInit = {}, retryCount = 0): Promise<any> {
    const endpointKey = this.getEndpointKey(url);
    const requestKey = `${options.method || 'GET'}-${url}`;
    
    // Check for duplicate pending requests
    if (this.pendingRequests.has(requestKey)) {
      console.log(`🔄 Waiting for pending request: ${requestKey}`);
      return this.pendingRequests.get(requestKey);
    }

    try {
      await this.checkRateLimit(endpointKey);
    } catch (rateLimitError: any) {
      // If rate limited, wait and retry
      if (retryCount < 3 && rateLimitError.status === 429) {
        const waitTime = rateLimitError.retryAfter * 1000;
        console.log(`⏳ Rate limited. Waiting ${waitTime}ms before retry ${retryCount + 1}/3`);
        await this.delay(waitTime);
        return this.request(url, options, retryCount + 1);
      }
      throw rateLimitError;
    }

    const requestPromise = this.executeRequest(url, options, endpointKey, retryCount);
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  private async executeRequest(url: string, options: RequestInit, endpointKey: string, retryCount: number): Promise<any> {
  try {
    const deviceId = await getOrCreateDeviceId();
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Device-Id": deviceId,
        ...options.headers,
      },
    });

       if (response.status === 401 && retryCount < 3) {
      const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verify/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Id": deviceId,
        },
      });

      if (refreshResponse.ok) {
        return this.executeRequest(url, options, endpointKey, retryCount + 1);
      } else {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
          window.location.href = '/auth';
        }
        throw { status: 401, message: "Session expired" };
      }
    }

      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after") || "5";
        const waitTime = parseInt(retryAfter) * 1000;
        
        if (retryCount < 3) {
          console.log(`⚠️ Got 429. Waiting ${waitTime}ms before retry ${retryCount + 1}/3`);
          await this.delay(waitTime);
          return this.request(url, options, retryCount + 1);
        } else {
          const error = {
            status: 429,
            message: "Too many requests, please slow down and try again later.",
            retryAfter: parseInt(retryAfter),
            endpoint: endpointKey
          };
          dispatchAPIError(error);
          throw error;
        }
      }

      if (!response.ok) {
        throw {
          status: response.status,
          message: response.statusText || `Request failed with status ${response.status}`
        };
      }

      const data = await response.json();
      
      // Log success for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ API call successful: ${options.method || 'GET'} ${url.split('/api')[1]}`);
      }
      
      return data;
    } catch (error: any) {
      if (error.status === 429 && retryCount < 3) {
        return this.request(url, options, retryCount + 1);
      }
      throw error;
    }
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

export const api = RateLimitedAPI.getInstance();