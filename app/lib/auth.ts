// lib/auth.ts
import { getOrCreateDeviceId } from "@/app/utils/database/db";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const deviceId = await getOrCreateDeviceId();

  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Id': deviceId,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // ✅ Use the correct, header-aware refresh endpoint — /api/user/refresh
      // reads deviceId from cookies only, which fails cross-domain on
      // browsers that block SameSite=None cookies (Safari/Firefox/Brave).
      const refreshResponse = await fetch(`${API_URL}/api/verify/refresh-token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
        },
      });

      if (refreshResponse.ok) {
        return fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Id': deviceId,
            ...options.headers,
          },
        });
      } else {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
          window.location.href = '/auth';
        }
        throw new Error('Session expired');
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
}