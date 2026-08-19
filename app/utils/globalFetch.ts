import { getOrCreateDeviceId } from "./database/db";

const originalFetch = typeof window !== 'undefined' ? window.fetch : null;

function getUrlString(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

// Shared across all callers — if a refresh is already in flight, everyone
// else waits on the SAME promise instead of firing their own request.
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(API_URL: string, deviceId: string): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await originalFetch!(`${API_URL}/api/verify/refresh-token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
        },
      });
      return res.ok;
    } catch (e) {
      console.error('Refresh failed:', e);
      return false;
    } finally {
      // Clear after a short delay so a burst of near-simultaneous 401s
      // still share one refresh, but the NEXT genuine refresh later isn't
      // permanently blocked by a stale promise.
      setTimeout(() => { refreshPromise = null; }, 100);
    }
  })();

  return refreshPromise;
}

export function setupGlobalFetchInterceptor() {
  if (typeof window === 'undefined' || !originalFetch) return;

  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlString = getUrlString(input);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://goye-platform-backend.onrender.com";
    
    if (!urlString.includes(API_URL) && !urlString.includes('/api/')) {
      return originalFetch(input, init);
    }

    try {
      const deviceId = await getOrCreateDeviceId();

      const headers = new Headers(init?.headers || {});
      headers.set('X-Device-Id', deviceId);

      const options: RequestInit = {
        ...init,
        credentials: 'include',
        headers: headers,
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

      // Don't even attempt a refresh for the refresh endpoint itself or
      // auth endpoints — avoids any chance of recursive refresh loops.
      const isAuthEndpoint = urlString.includes('/login') ||
                              urlString.includes('/signup') ||
                              urlString.includes('/refresh-token');

      if (response.status === 401 && !isAuthEndpoint) {
        const refreshed = await doRefresh(API_URL, deviceId);

        if (refreshed) {
          response = await originalFetch(input, options);
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

  console.log('✅ Global fetch interceptor installed (X-Device-Id enabled, refresh deduped)');
}

export function restoreGlobalFetch() {
  if (typeof window !== 'undefined' && originalFetch) {
    window.fetch = originalFetch;
  }
}