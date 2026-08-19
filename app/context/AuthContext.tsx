// src/context/AuthContext.tsx
"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { dispatchAPIError } from "@/app/hook/useAPIErrorHandler";
import {
  getUserProfile,
  clearUserProfile,
  saveUserProfile,
  getSessionState,
  updateSessionState,
  clearAllData,
  getOrCreateDeviceId,
  getAuthTokens,
  saveAuthTokens,
} from "@/app/utils/database/db";

interface Props {
  children: React.ReactNode;
}

export interface AuthContextType {
  isExistingUser: boolean;
  isProfileComplete: boolean;
  requiresProfileCompletion: boolean;
  isLoading?: boolean;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email_address: string;
    role: string;
    user_pic?: string;
    type?: string;
    level?: string;
    organizationId?: string;
    userType?: string;
    organizationMemberships?: Array<{ organizationId: string }>;
  };
  organization?: {
    id: string;
    organization_name: string;
    organization_email: string;
    organization_image?: string;
    organization_type?: string;
    user?: {
      id: string;
      first_name: string;
      last_name: string;
      email_address: string;
    };
  };
}

interface AuthState {
  authStatus: AuthContextType;
  setAuthStatus: React.Dispatch<React.SetStateAction<AuthContextType>>;
  updateAuthStatus: (status: Partial<AuthContextType>) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  logout: () => Promise<void>;
  getDeviceId: () => Promise<string>;
  login: (userData: any, orgData?: any) => Promise<boolean>;
}

const AuthContext = React.createContext<AuthState | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://goye-platform-backend.onrender.com";

const PUBLIC_ROUTES = ['/login', '/signup', '/auth', '/', '/about', '/contact', '/forgot-password'];

export default function AuthProvider({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = React.useState<AuthContextType>({
    isExistingUser: false,
    isProfileComplete: false,
    requiresProfileCompletion: false,
    isLoading: true,
    user: undefined,
    organization: undefined,
  });

  const isInitializedRef = React.useRef(false);
  const isCheckingRef = React.useRef(false);

  const isPublicRoute = React.useCallback(() => {
    if (!pathname) return true;
    return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  }, [pathname]);

  const getDeviceId = React.useCallback(async (): Promise<string> => {
    return await getOrCreateDeviceId();
  }, []);

  // Helper — every authenticated fetch in this file goes through this so
  // headers are never forgotten again. Cookies still ride along via
  // credentials: 'include' as a fallback, but headers are the primary,
  // reliable channel across browsers that restrict cross-site cookies.
  const authHeaders = React.useCallback(async (): Promise<HeadersInit> => {
    const deviceId = await getOrCreateDeviceId();
    const tokens = await getAuthTokens();
    return {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
      ...(tokens?.accessToken && { 'Authorization': `Bearer ${tokens.accessToken}` }),
      ...(tokens?.refreshToken && { 'x-refresh-token': tokens.refreshToken }),
    };
  }, []);

  const refreshToken = React.useCallback(async (): Promise<boolean> => {
    if (isPublicRoute()) return false;

    try {
      console.log("🔄 Attempting to refresh token...");

      const deviceId = await getOrCreateDeviceId();
      const tokens = await getAuthTokens();

      const response = await fetch(`${API_URL}/api/verify/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
          ...(tokens?.refreshToken && { 'x-refresh-token': tokens.refreshToken }),
        }
      });

      if (response.ok) {
        const data = await response.json();

        if (data.accessToken) {
          await saveAuthTokens({ accessToken: data.accessToken });
        }

        console.log("✅ Token refresh successful");
        await updateSessionState({
          isAuthenticated: true,
          lastActivity: new Date().toISOString(),
        });
        return true;
      }
      console.log("❌ Token refresh failed with status:", response.status);
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }, [isPublicRoute]);

const getUserType = React.useCallback(async (): Promise<string> => {
  const profile = await getUserProfile();
  const type = profile?.userType || '';
  const role = profile?.role || '';

  if (type === 'admin' || role === 'goye_admin') return 'admin';
  if (type === 'organization' || type === 'invited_user' || role === 'org_admin') return 'organization';
  return 'individual';
}, []);
  // Extracted so it can be called twice (once normally, once after a
  // successful refresh) WITHOUT re-entering the isCheckingRef guard that
  // wraps the public checkAuth() below.
  const runAuthCheck = React.useCallback(async (): Promise<boolean> => {
    const session = await getSessionState();
    if (!session?.isAuthenticated) {
      setAuthStatus({
        isExistingUser: false,
        isProfileComplete: false,
        requiresProfileCompletion: false,
        isLoading: false,
        user: undefined,
        organization: undefined,
      });
      if (!isPublicRoute()) {
        router.push('/login');
      }
      return false;
    }

    const userType = getUserType();

    // Admin
    if (userType === 'admin' as any) {
      const profile = await getUserProfile();
      setAuthStatus({
        isExistingUser: true,
        isProfileComplete: true,
        requiresProfileCompletion: false,
        isLoading: false,
        user: {
          id: profile?.userId || '',
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          email_address: profile?.email_address || '',
          role: localStorage.getItem('role') || 'goye_admin',
          type: 'admin',
        } as any,
      });
      return true;
    }

    // Individual
    if (userType === 'individual' as any) {
      const headers = await authHeaders();
      const response = await fetch(`${API_URL}/api/user/profile`, {
        credentials: 'include',
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user;

        await saveUserProfile({
          userId: userData?.id,
          first_name: userData?.first_name,
          last_name: userData?.last_name,
          email_address: userData?.email_address,
          userType: 'user',
          role: userData?.role || 'student',
        });

        setAuthStatus({
          isExistingUser: true,
          isProfileComplete: userData?.isProfileComplete || false,
          requiresProfileCompletion: !userData?.isProfileComplete,
          isLoading: false,
          user: userData,
        });
        return true;
      }

      // ✅ Don't give up on a 401 — try refreshing once before failing.
      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const retryHeaders = await authHeaders();
          const retryResponse = await fetch(`${API_URL}/api/user/profile`, {
            credentials: 'include',
            headers: retryHeaders,
          });

          if (retryResponse.ok) {
            const data = await retryResponse.json();
            const userData = data.user;

            await saveUserProfile({
              userId: userData?.id,
              first_name: userData?.first_name,
              last_name: userData?.last_name,
              email_address: userData?.email_address,
              userType: 'user',
              role: userData?.role || 'student',
            });

            setAuthStatus({
              isExistingUser: true,
              isProfileComplete: userData?.isProfileComplete || false,
              requiresProfileCompletion: !userData?.isProfileComplete,
              isLoading: false,
              user: userData,
            });
            return true;
          }
        }
      }
    }

    // Organization
    if (userType === 'organization' as any) {
      const headers = await authHeaders();
      const response = await fetch(`${API_URL}/api/organizations/profile`, {
        credentials: 'include',
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        const orgData = data.organization;

        await saveUserProfile({
          userId: orgData?.user?.id,
          first_name: orgData?.organization_name,
          last_name: '',
          email_address: orgData?.organization_email,
          userType: 'organization',
          role: orgData?.organization_role || 'admin',
          organizationId: orgData?.id,
        });

        setAuthStatus({
          isExistingUser: true,
          isProfileComplete: true,
          requiresProfileCompletion: false,
          isLoading: false,
          user: orgData?.user,
          organization: orgData,
        });
        return true;
      }

      // ✅ Same retry-after-refresh treatment for the org branch.
      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const retryHeaders = await authHeaders();
          const retryResponse = await fetch(`${API_URL}/api/organizations/profile`, {
            credentials: 'include',
            headers: retryHeaders,
          });

          if (retryResponse.ok) {
            const data = await retryResponse.json();
            const orgData = data.organization;

            await saveUserProfile({
              userId: orgData?.user?.id,
              first_name: orgData?.organization_name,
              last_name: '',
              email_address: orgData?.organization_email,
              userType: 'organization',
              role: orgData?.organization_role || 'admin',
              organizationId: orgData?.id,
            });

            setAuthStatus({
              isExistingUser: true,
              isProfileComplete: true,
              requiresProfileCompletion: false,
              isLoading: false,
              user: orgData?.user,
              organization: orgData,
            });
            return true;
          }
        }
      }
    }

    // Auth genuinely failed, even after a refresh attempt
    await clearAllData();
    setAuthStatus({
      isExistingUser: false,
      isProfileComplete: false,
      requiresProfileCompletion: false,
      isLoading: false,
      user: undefined,
      organization: undefined,
    });
    if (!isPublicRoute()) {
      router.push('/login');
    }
    return false;
  }, [isPublicRoute, getUserType, router, authHeaders, refreshToken]);

  const checkAuth = React.useCallback(async (): Promise<boolean> => {
    if (isPublicRoute()) {
      setAuthStatus(prev => ({ ...prev, isLoading: false }));
      return false;
    }

    if (isCheckingRef.current) {
      return authStatus.isExistingUser;
    }

    isCheckingRef.current = true;
    setAuthStatus(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await runAuthCheck();
      isCheckingRef.current = false;
      return result;
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthStatus(prev => ({ ...prev, isLoading: false }));
      isCheckingRef.current = false;
      return false;
    }
  }, [isPublicRoute, runAuthCheck, authStatus.isExistingUser]);

  const login = React.useCallback(async (userData: any, orgData?: any): Promise<boolean> => {
  try {
    console.log("🔐 Login function called with:", { userData, orgData });

    if (userData) {
      await saveUserProfile({
        userId: userData.id,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email_address: userData.email_address || userData.email || '',
        userType: userData.type || userData.userType || 'user',
        role: userData.role || 'student',
        organizationId: userData.organizationId || null,
        isProfileComplete: userData.isProfileComplete ?? true,
        level: userData.level,
        adminRole: userData.adminRole,
      });
    } else if (orgData) {
      await saveUserProfile({
        userId: orgData.userId || orgData.id,
        first_name: orgData.organization_name || '',
        last_name: '',
        email_address: orgData.organization_email || '',
        userType: 'organization',
        role: orgData.organization_role || 'admin',
        organizationId: orgData.id,
        organizationName: orgData.organization_name,
        isProfileComplete: true,
      });
    }

    await updateSessionState({
      isAuthenticated: true,
      lastActivity: new Date().toISOString(),
    });

    setAuthStatus({
      isExistingUser: true,
      isProfileComplete: userData?.isProfileComplete !== undefined ? userData.isProfileComplete : true,
      requiresProfileCompletion: userData?.isProfileComplete === false,
      isLoading: false,
      user: userData,
      organization: orgData,
    });

    console.log("✅ Login successful, auth status updated");
    return true;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
}, []);

  React.useEffect(() => {
    if (isPublicRoute()) {
      setAuthStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const timer = setTimeout(() => {
      checkAuth();
    }, 300);

    return () => clearTimeout(timer);
  }, [isPublicRoute, checkAuth]);

 const logout = React.useCallback(async (): Promise<void> => {
  try {
    const headers = await authHeaders();
    await fetch(`${API_URL}/api/user/logout`, {
      method: "POST",
      credentials: "include",
      headers,
    });

    await clearAllData(); // ✅ this alone is now sufficient

    setAuthStatus({
      isExistingUser: false,
      isProfileComplete: false,
      requiresProfileCompletion: false,
      isLoading: false,
      user: undefined,
      organization: undefined,
    });

    router.push("/login");
  } catch (error) {
    console.error("Logout error:", error);
    await clearAllData();
    router.push("/login");
  }
}, [router, authHeaders]);

  const updateAuthStatus = React.useCallback((status: Partial<AuthContextType>) => {
    setAuthStatus((prev) => ({ ...prev, ...status, isLoading: false }));
  }, []);

  const clearAuth = React.useCallback(() => {
    setAuthStatus({
      isExistingUser: false,
      isProfileComplete: false,
      requiresProfileCompletion: false,
      isLoading: false,
      user: undefined,
      organization: undefined,
    });
  }, []);

  const contextValue: AuthState = {
    authStatus,
    setAuthStatus,
    updateAuthStatus,
    clearAuth,
    checkAuth,
    refreshToken,
    logout,
    getDeviceId,
    login,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};