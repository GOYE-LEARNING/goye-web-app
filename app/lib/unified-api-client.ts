// lib/unified-api-client.ts - SINGLE UNIFIED CLIENT
"use client";

import { dispatchAPIError } from "@/app/hook/useAPIErrorHandler";
import { getAuthTokens, getOrCreateDeviceId } from "@/app/utils/database/db";

interface RequestOptions extends RequestInit {
  skipRateLimit?: boolean;
  retryCount?: number;
}

class UnifiedAPIClient {
  private static instance: UnifiedAPIClient;
  private requestQueue: Map<string, Promise<any>> = new Map();
  private requestTimestamps: Map<string, number[]> = new Map();
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    url: string;
    options: RequestOptions;
  }> = [];
  private readonly MAX_RETRIES = 3;
  private readonly MIN_DELAY = 1000;

  private constructor() {}

  static getInstance(): UnifiedAPIClient {
    if (!UnifiedAPIClient.instance) {
      UnifiedAPIClient.instance = new UnifiedAPIClient();
    }
    return UnifiedAPIClient.instance;
  }

  private getBaseURL(): string {
    return (
      process.env.NEXT_PUBLIC_API_URL ||
      "https://goye-platform-backend.onrender.com"
    );
  }

  private getEndpointKey(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const segments = pathname.split("/").filter(Boolean);
      return segments.slice(0, 3).join("/") || "default";
    } catch {
      return "default";
    }
  }

  private async checkRateLimit(url: string): Promise<void> {
    const endpointKey = this.getEndpointKey(url);
    const now = Date.now();
    const timestamps = this.requestTimestamps.get(endpointKey) || [];

    const validTimestamps = timestamps.filter((ts) => now - ts < 5000);

    if (validTimestamps.length >= 5) {
      const waitTime = 5000 - (now - validTimestamps[0]);
      if (waitTime > 0) {
        console.log(
          `⏳ Rate limiting: waiting ${waitTime}ms for ${endpointKey}`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.checkRateLimit(url);
      }
    }

    validTimestamps.push(now);
    this.requestTimestamps.set(endpointKey, validTimestamps);
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const deviceId = await getOrCreateDeviceId();
      const tokens = await getAuthTokens();

      console.log("🔄 Attempting to refresh token...");
      const response = await fetch(
        `${this.getBaseURL()}/api/verify/refresh-token`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-Device-Id": deviceId,
            ...(tokens?.refreshToken && {
              "x-refresh-token": tokens.refreshToken,
            }),
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const { saveAuthTokens } = await import("@/app/utils/database/db");
        if (data.accessToken) {
          await saveAuthTokens({ accessToken: data.accessToken });
        }
        console.log("✅ Token refreshed successfully");
        return true;
      }

      console.log("❌ Token refresh failed with status:", response.status);
      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  }

  private processQueue(error: any = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        this.executeRequest(prom.url, prom.options)
          .then(prom.resolve)
          .catch(prom.reject);
      }
    });
    this.failedQueue = [];
  }

  private async executeRequest(
    url: string,
    options: RequestOptions = {},
    retryCount = 0,
  ): Promise<any> {
    const fullUrl = url.startsWith("http") ? url : `${this.getBaseURL()}${url}`;
    const requestKey = `${options.method || "GET"}-${fullUrl}`;

    if (this.requestQueue.has(requestKey)) {
      console.log(`⏳ Waiting for pending request: ${requestKey}`);
      return this.requestQueue.get(requestKey);
    }

    try {
      const isAuthEndpoint =
        fullUrl.includes("/login") ||
        fullUrl.includes("/signup") ||
        fullUrl.includes("/refresh-token");

      if (!isAuthEndpoint && !options.skipRateLimit) {
        await this.checkRateLimit(fullUrl);
      }
      const deviceId = await getOrCreateDeviceId();
      const tokens = await getAuthTokens();

      const requestOptions: RequestInit = {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Id": deviceId,
          ...(tokens?.accessToken && {
            Authorization: `Bearer ${tokens.accessToken}`,
          }),
          ...(tokens?.refreshToken && {
            "x-refresh-token": tokens.refreshToken,
          }),
          ...options.headers,
        },
      };

      // ❌ REMOVED: Injected deviceId inside the body was causing excess property validation failure.

      const requestPromise = fetch(fullUrl, requestOptions);
      this.requestQueue.set(requestKey, requestPromise);

      const response = await requestPromise;

      if (response.status === 401 && retryCount < this.MAX_RETRIES) {
        console.log(
          `🔑 Unauthorized, attempting refresh... (Attempt ${retryCount + 1})`,
        );

        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject, url: fullUrl, options });
          });
        }

        this.isRefreshing = true;

        try {
          const refreshed = await this.refreshToken();

          if (refreshed) {
            this.processQueue(null);
            return this.executeRequest(
              fullUrl,
              { ...options, retryCount: retryCount + 1 },
              retryCount + 1,
            );
          } else {
            throw new Error("Refresh token failed");
          }
        } catch (refreshError) {
          this.processQueue(refreshError);
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.includes("/login")
          ) {
            window.location.href = "/login";
          }
          throw refreshError;
        } finally {
          this.isRefreshing = false;
        }
      }

      if (response.status === 429 && retryCount < this.MAX_RETRIES) {
        const retryAfter = response.headers.get("retry-after") || "5";
        const waitTime = parseInt(retryAfter) * 1000;

        console.log(
          `⏳ Rate limited. Waiting ${waitTime}ms before retry ${retryCount + 1}`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));

        return this.executeRequest(
          fullUrl,
          { ...options, retryCount: retryCount + 1 },
          retryCount + 1,
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = {
          status: response.status,
          message: errorData.message || response.statusText || `Request failed`,
          data: errorData,
          url: fullUrl,
        };

        if (typeof window !== "undefined") {
          dispatchAPIError(error);
        }

        throw error;
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      }

      return await response.text();
    } catch (error: any) {
      if (error.status === 401) {
        throw error;
      }

      if (
        error.name === "TypeError" &&
        error.message.includes("fetch") &&
        retryCount < this.MAX_RETRIES
      ) {
        console.log(
          `🌐 Network error, retrying ${retryCount + 1}/${this.MAX_RETRIES}`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, retryCount)),
        );
        return this.executeRequest(
          fullUrl,
          { ...options, retryCount: retryCount + 1 },
          retryCount + 1,
        );
      }

      throw error;
    } finally {
      this.requestQueue.delete(requestKey);
    }
  }

  async request(url: string, options: RequestOptions = {}): Promise<any> {
    return this.executeRequest(url, options, options.retryCount || 0);
  }

  async get(url: string, options?: RequestOptions): Promise<any> {
    return this.request(url, { ...options, method: "GET" });
  }

  async post(url: string, body?: any, options?: RequestOptions): Promise<any> {
    return this.request(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put(url: string, body?: any, options?: RequestOptions): Promise<any> {
    return this.request(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch(url: string, body?: any, options?: RequestOptions): Promise<any> {
    return this.request(url, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete(url: string, options?: RequestOptions): Promise<any> {
    return this.request(url, { ...options, method: "DELETE" });
  }
}

export const api = UnifiedAPIClient.getInstance();
export default api;