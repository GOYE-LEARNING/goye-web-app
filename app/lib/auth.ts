// lib/auth.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Important: send cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Try to refresh
      const refreshResponse = await fetch(`${API_URL}/api/user/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        // Retry original request
        return fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
      } else {
        // Redirect to login
        window.location.href = '/auth';
        throw new Error('Session expired');
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
}