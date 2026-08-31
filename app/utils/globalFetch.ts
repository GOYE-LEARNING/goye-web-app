// app/utils/globalFetch.ts
import { getAuthTokens, saveAuthTokens, getOrCreateDeviceId } from "./database/db";

const originalFetch = typeof window !== "undefined" ? window.fetch : null;
let installed = false;

function getUrlString(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

let refreshPromise: Promise<boolean> | null = null;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 2;

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    return exp - Date.now() < 300000;
  } catch {
    return true;
  }
}

async function clearAuthTokens() {
  try {
    await saveAuthTokens({ accessToken: "", refreshToken: "" });
    localStorage.removeItem("authTokens");
  } catch (error) {
    console.error("❌ Failed to clear tokens:", error);
  }
}

async function doRefresh(API_URL: string): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
    refreshAttempts = 0;
    return false;
  }

  refreshAttempts++;
  refreshPromise = (async () => {
    try {
      const tokens = await getAuthTokens();
      const deviceId = await getOrCreateDeviceId();

      if (!tokens?.refreshToken) {
        refreshAttempts = 0;
        refreshPromise = null;
        return false;
      }

      const res = await originalFetch!(`${API_URL}/api/verify/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-refresh-token": tokens.refreshToken,
          "x-device-id": deviceId,
          "X-Device-Id": deviceId,
        },
      });

      if (res.status === 401 || res.status === 403 || !res.ok) {
        if (res.status === 401 || res.status === 403) await clearAuthTokens();
        refreshAttempts = 0;
        refreshPromise = null;
        return false;
      }

      const data = await res.json();
      if (data.success && data.accessToken) {
        await saveAuthTokens({
          accessToken: data.accessToken,
          refreshToken: tokens.refreshToken,
        });
        refreshAttempts = 0;
        refreshPromise = null;
        return true;
      }
      refreshAttempts = 0;
      refreshPromise = null;
      return false;
    } catch {
      refreshAttempts = 0;
      refreshPromise = null;
      return false;
    }
  })();

  return refreshPromise;
}

export function setupGlobalFetchInterceptor() {
  if (typeof window === "undefined" || !originalFetch || installed) return;
  installed = true;

  window.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const urlString = getUrlString(input);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!urlString.includes(API_URL as any) && !urlString.includes("/api/")) {
      return originalFetch(input, init);
    }

    try {
      let tokens = await getAuthTokens();
      const deviceId = await getOrCreateDeviceId();

      if (urlString.includes("/refresh-token")) {
        return originalFetch(input, init);
      }

      if (tokens?.accessToken && isTokenExpired(tokens.accessToken)) {
        const refreshed = await doRefresh(API_URL as any);
        if (refreshed) tokens = await getAuthTokens();
      }

      const headers = new Headers(init?.headers || {});
      
      // ✅ Always attach device ID to headers
      if (deviceId) {
        headers.set("x-device-id", deviceId);
        headers.set("X-Device-Id", deviceId);
      }

      if (tokens?.accessToken) {
        headers.set("Authorization", `Bearer ${tokens.accessToken}`);
      }

      if (tokens?.refreshToken && !headers.has("x-refresh-token")) {
        headers.set("x-refresh-token", tokens.refreshToken);
      }

      let sanitizedBody = init?.body;

      // 🧹 Strip deviceId out of JSON request bodies so validation schemas pass
      if (init?.body && typeof init.body === "string") {
        try {
          const parsedBody = JSON.parse(init.body);
          if (parsedBody && typeof parsedBody === "object" && "deviceId" in parsedBody) {
            delete parsedBody.deviceId;
            sanitizedBody = JSON.stringify(parsedBody);
          }
        } catch {
          // Non-JSON body
        }
      }

      const options: RequestInit = {
        ...init,
        body: sanitizedBody,
        credentials: "include",
        headers,
      };

      let response = await originalFetch(input, options);

      const isAuthEndpoint =
        urlString.includes("/login") ||
        urlString.includes("/signup") ||
        urlString.includes("/refresh-token");

      if (response.status === 401 && !isAuthEndpoint) {
        const refreshed = await doRefresh(API_URL as any);
        if (refreshed) {
          const retryTokens = await getAuthTokens();
          const retryHeaders = new Headers(options.headers);
          retryHeaders.set("Authorization", `Bearer ${retryTokens?.accessToken}`);

          response = await originalFetch(input, {
            ...options,
            headers: retryHeaders,
          });
        }
      }

      return response;
    } catch (error) {
      return originalFetch(input, init);
    }
  };
}

setupGlobalFetchInterceptor();