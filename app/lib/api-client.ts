// lib/api-client.ts
"use client";

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number; // milliseconds
  priority?: 'high' | 'normal' | 'low';
}

interface QueuedRequest {
  id: string;
  url: string;
  options: RequestInit;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timestamp: number;
  priority: number;
}

class GlobalAPIClient {
  private static instance: GlobalAPIClient;
  private requestQueue: QueuedRequest[] = [];
  private isProcessing = false;
  private requestTimestamps: Map<string, number[]> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  
  // Rate limit configuration per endpoint category
  private rateLimits: Record<string, RateLimitConfig> = {
    // Social endpoints - most restrictive (frequent calls)
    'socials': { maxRequests: 5, timeWindow: 60000, priority: 'normal' },
    'socials.get-groups': { maxRequests: 3, timeWindow: 60000, priority: 'low' },
    'socials.check-joined': { maxRequests: 10, timeWindow: 60000, priority: 'normal' },
    'socials.join-group': { maxRequests: 2, timeWindow: 60000, priority: 'high' },
    'socials.exit-group': { maxRequests: 2, timeWindow: 60000, priority: 'high' },
    'socials.create-group': { maxRequests: 1, timeWindow: 60000, priority: 'high' },
    
    // User endpoints
    'user': { maxRequests: 10, timeWindow: 60000, priority: 'high' },
    'user.profile': { maxRequests: 5, timeWindow: 60000, priority: 'high' },
    
    // Course endpoints
    'course': { maxRequests: 15, timeWindow: 60000, priority: 'normal' },
    'course.get-course': { maxRequests: 20, timeWindow: 60000, priority: 'normal' },
    
    // Enrollment endpoints
    'enroll': { maxRequests: 10, timeWindow: 60000, priority: 'normal' },
    'enroll.check-if-enrolled': { maxRequests: 15, timeWindow: 60000, priority: 'normal' },
    
    // Default
    'default': { maxRequests: 20, timeWindow: 60000, priority: 'normal' },
  };

  private constructor() {}

  static getInstance(): GlobalAPIClient {
    if (!GlobalAPIClient.instance) {
      GlobalAPIClient.instance = new GlobalAPIClient();
    }
    return GlobalAPIClient.instance;
  }

  private getEndpointCategory(url: string, method: HttpMethod): string {
    const urlLower = url.toLowerCase();
    
    // Social endpoints
    if (urlLower.includes('/api/socials/')) {
      if (urlLower.includes('/get-groups')) return 'socials.get-groups';
      if (urlLower.includes('/check-joined')) return 'socials.check-joined';
      if (urlLower.includes('/join-group')) return 'socials.join-group';
      if (urlLower.includes('/exit-group')) return 'socials.exit-group';
      if (urlLower.includes('/create-group')) return 'socials.create-group';
      return 'socials';
    }
    
    // User endpoints
    if (urlLower.includes('/api/user/')) {
      if (urlLower.includes('/profile')) return 'user.profile';
      return 'user';
    }
    
    // Course endpoints
    if (urlLower.includes('/api/course/')) {
      if (urlLower.includes('/get-course')) return 'course.get-course';
      return 'course';
    }
    
    // Enrollment endpoints
    if (urlLower.includes('/api/enroll/')) {
      if (urlLower.includes('/check-if-enrolled')) return 'enroll.check-if-enrolled';
      return 'enroll';
    }
    
    return 'default';
  }

  private getPriorityValue(priority?: string): number {
    switch (priority) {
      case 'high': return 0;
      case 'normal': return 1;
      case 'low': return 2;
      default: return 1;
    }
  }

  private checkRateLimit(category: string): { allowed: boolean; waitTime?: number } {
    const now = Date.now();
    const config = this.rateLimits[category] || this.rateLimits.default;
    const timestamps = this.requestTimestamps.get(category) || [];
    
    // Clean old timestamps
    const recentTimestamps = timestamps.filter(ts => now - ts < config.timeWindow);
    
    if (recentTimestamps.length >= config.maxRequests) {
      const oldestTimestamp = recentTimestamps[0];
      const waitTime = config.timeWindow - (now - oldestTimestamp);
      return { allowed: false, waitTime };
    }
    
    return { allowed: true };
  }

  private recordRequest(category: string): void {
    const now = Date.now();
    const timestamps = this.requestTimestamps.get(category) || [];
    const config = this.rateLimits[category] || this.rateLimits.default;
    
    // Keep only recent timestamps
    const recentTimestamps = timestamps.filter(ts => now - ts < config.timeWindow);
    recentTimestamps.push(now);
    this.requestTimestamps.set(category, recentTimestamps);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    
    // Sort by priority (lower number = higher priority)
    this.requestQueue.sort((a, b) => a.priority - b.priority);
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (!request) continue;
      
      const category = this.getEndpointCategory(request.url, request.options.method as HttpMethod || 'GET');
      const { allowed, waitTime } = this.checkRateLimit(category);
      
      if (!allowed && waitTime) {
        // Re-queue with delay
        console.log(`Rate limit for ${category}. Waiting ${Math.ceil(waitTime / 1000)}s`);
        this.requestQueue.unshift(request);
        await this.delay(Math.min(waitTime, 5000));
        continue;
      }
      
      try {
        this.recordRequest(category);
        const result = await this.executeRequest(request.url, request.options);
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
      
      // Add delay between requests to prevent bursts
      await this.delay(500);
    }
    
    this.isProcessing = false;
  }

  private async executeRequest(url: string, options: RequestInit, retryCount = 0): Promise<any> {
    const maxRetries = 3;
    const baseDelay = 1000;
    
    try {
      const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay * Math.pow(2, retryCount);
        
        console.log(`Rate limited (429). Retry ${retryCount + 1}/${maxRetries} after ${delay}ms`);
        
        if (retryCount < maxRetries) {
          await this.delay(delay);
          return this.executeRequest(url, options, retryCount + 1);
        }
        
        throw {
          status: 429,
          message: "Too many requests. Please try again in a moment.",
          retryAfter: Math.ceil(delay / 1000)
        };
      }

      if (!response.ok) {
        throw {
          status: response.status,
          message: response.statusText || `Request failed with status ${response.status}`
        };
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error: any) {
      if (error.status === 429 && retryCount < maxRetries) {
        // Already handled above, but keep for safety
        const delay = baseDelay * Math.pow(2, retryCount);
        await this.delay(delay);
        return this.executeRequest(url, options, retryCount + 1);
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async request(url: string, options: RequestInit = {}): Promise<any> {
    const requestKey = `${options.method || 'GET'}-${url}`;
    
    // Check for duplicate pending request
    if (this.pendingRequests.has(requestKey)) {
      console.log(`🔄 Duplicate request detected: ${requestKey}. Waiting for existing request.`);
      return this.pendingRequests.get(requestKey);
    }

    const category = this.getEndpointCategory(url, options.method as HttpMethod || 'GET');
    const config = this.rateLimits[category] || this.rateLimits.default;
    
    const requestPromise = new Promise((resolve, reject) => {
      this.requestQueue.push({
        id: Date.now().toString(),
        url,
        options,
        resolve,
        reject,
        timestamp: Date.now(),
        priority: this.getPriorityValue(config.priority),
      });
      
      this.processQueue();
    });
    
    this.pendingRequests.set(requestKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  // Convenience methods for your specific API endpoints
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

  // Specific API methods for common endpoints
  async getGroups() {
    return this.get('/api/socials/get-groups');
  }

  async getGroupsByTutor() {
    return this.get('/api/socials/get-groups-created-by-tutor');
  }

  async getGroupById(groupId: string) {
    return this.get(`/api/socials/get-group/${groupId}`);
  }

  async checkIfJoined(groupId: string) {
    return this.get(`/api/socials/check-joined/${groupId}`);
  }

  async joinGroup(groupId: string) {
    return this.post(`/api/socials/join-group/${groupId}`);
  }

  async exitGroup(groupId: string) {
    return this.delete(`/api/socials/exit-group/${groupId}`);
  }

  async getUserProfile() {
    return this.get('/api/user/profile');
  }

  async getCourse(courseId: string) {
    return this.get(`/api/course/get-course/${courseId}`);
  }

  async checkEnrollment(courseId: string) {
    return this.get(`/api/enroll/check-if-enrolled/${courseId}`);
  }
}

export const api = GlobalAPIClient.getInstance();