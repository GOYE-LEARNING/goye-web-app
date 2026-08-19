// app/utils/globalFetch.ts
import { getOrCreateDeviceId, getAuthTokens, saveAuthTokens } from "./database/db";

const originalFetch = typeof window !== 'undefined' ? window.fetch : null;
let installed = false;

function getUrlString(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(API_URL: string, deviceId: string): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const tokens = await getAuthTokens();
      const res = await originalFetch!(`${API_URL}/api/verify/refresh-token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
          ...(tokens?.refreshToken && { 'x-refresh-token': tokens.refreshToken }),
        },
      });

      if (!res.ok) return false;

      const data = await res.json().catch(() => ({}));
      if (data.accessToken) {
        await saveAuthTokens({ accessToken: data.accessToken });
      }
      return true;
    } catch (e) {
      console.error('Refresh failed:', e);
      return false;
    } finally {
      setTimeout(() => { refreshPromise = null; }, 100);
    }
  })();

  return refreshPromise;
}

export function setupGlobalFetchInterceptor() {
  if (typeof window === 'undefined' || !originalFetch || installed) return;
  installed = true;

  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlString = getUrlString(input);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://goye-platform-backend.onrender.com";

    // Only intercept calls to our own backend
    if (!urlString.includes(API_URL) && !urlString.includes('/api/')) {
      return originalFetch(input, init);
    }

    try {
      const deviceId = await getOrCreateDeviceId();
      const tokens = await getAuthTokens();

      const headers = new Headers(init?.headers || {});
      headers.set('X-Device-Id', deviceId);
      if (tokens?.accessToken && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${tokens.accessToken}`);
      }
      if (tokens?.refreshToken && !headers.has('x-refresh-token')) {
        headers.set('x-refresh-token', tokens.refreshToken);
      }

      const options: RequestInit = {
        ...init,
        credentials: 'include',
        headers,
      };

      if (options.body && typeof options.body === 'string') {
        try {
          const body = JSON.parse(options.body);
          if (!body.deviceId) {
            body.deviceId = deviceId;
            options.body = JSON.stringify(body);
          }
        } catch (e) {}
      }

      if (!options.body && ['POST', 'PUT', 'PATCH'].includes(options.method || 'GET')) {
        options.body = JSON.stringify({ deviceId });
      }

      let response = await originalFetch(input, options);

      const isAuthEndpoint = urlString.includes('/login') ||
                              urlString.includes('/signup') ||
                              urlString.includes('/refresh-token');

      if (response.status === 401 && !isAuthEndpoint) {
        const refreshed = await doRefresh(API_URL, deviceId);

        if (refreshed) {
          // Rebuild headers with the freshly rotated accessToken
          const retryTokens = await getAuthTokens();
          const retryHeaders = new Headers(init?.headers || {});
          retryHeaders.set('X-Device-Id', deviceId);
          if (retryTokens?.accessToken) {
            retryHeaders.set('Authorization', `Bearer ${retryTokens.accessToken}`);
          }
          if (retryTokens?.refreshToken) {
            retryHeaders.set('x-refresh-token', retryTokens.refreshToken);
          }

          response = await originalFetch(input, { ...options, headers: retryHeaders });
        } else {
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
            window.location.href = '/auth';
          }
        }
      }

      return response;
    } catch (error) {
      console.error('Global fetch interceptor error:', error);
      return originalFetch(input, init);
    }
  };

  console.log('✅ Global fetch interceptor installed (device + auth headers, refresh deduped)');
}

export function restoreGlobalFetch() {
  if (typeof window !== 'undefined' && originalFetch) {
    window.fetch = originalFetch;
    installed = false;
  }
}

// ✅ Install immediately on module load — not inside a component, not
// inside a useEffect, not gated behind any async auth check. This runs
// the moment this file is first imported, which we guarantee happens
// before any other app code by importing it at the very top of the root
// layout (see instructions below). This closes the timing gap where
// early fetches (checkAuth, page-load org lookups, etc.) were bypassing
// the interceptor because it hadn't been installed yet.
setupGlobalFetchInterceptor();