// src/context/AuthContext.tsx - WITH LOGIN FUNCTION
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
  clearAllData
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

// Add login to the AuthState interface
interface AuthState {
  authStatus: AuthContextType;
  setAuthStatus: React.Dispatch<React.SetStateAction<AuthContextType>>;
  updateAuthStatus: (status: Partial<AuthContextType>) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  logout: () => Promise<void>;
  getDeviceId: () => Promise<string>;
  login: (userData: any, orgData?: any) => Promise<boolean>; // Add this
}

const AuthContext = React.createContext<AuthState | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://goye-platform-backend.onrender.com";

// Define public routes
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

  // Check if current route is public
  const isPublicRoute = React.useCallback(() => {
    if (!pathname) return true;
    return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  }, [pathname]);

  const getDeviceId = React.useCallback(async (): Promise<string> => {
    const { getOrCreateDeviceId } = await import("@/app/utils/database/db");
    return await getOrCreateDeviceId();
  }, []);

  // Refresh token
 const refreshToken = React.useCallback(async (): Promise<boolean> => {
  if (isPublicRoute()) return false;

  try {
    console.log("🔄 Attempting to refresh token...");
    
    const { getOrCreateDeviceId, getAuthTokens, saveAuthTokens } = await import("@/app/utils/database/db");
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
      
      // ✅ Save the freshly rotated accessToken
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

  const getUserType = React.useCallback(() => {
    const type = localStorage.getItem('type') || '';
    const role = localStorage.getItem('role') || '';
    
    if (type === 'admin' || role === 'goye_admin') return 'admin';
    if (type === 'organization' || type === 'invited_user' || role === 'org_admin') return 'organization';
    return 'individual';
  }, []);

  // Check authentication - only on protected routes
  const checkAuth = React.useCallback(async (): Promise<boolean> => {
    // CRITICAL: Skip completely on public routes
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
        isCheckingRef.current = false;
        if (!isPublicRoute()) {
          router.push('/login');
        }
        return false;
      }

      const userType = getUserType();

      // Admin
      if (userType === 'admin') {
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
        isCheckingRef.current = false;
        return true;
      }

      // Individual
      if (userType === 'individual') {
        const response = await fetch(`${API_URL}/api/user/profile`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
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
          isCheckingRef.current = false;
          return true;
        }
      }

      // Organization
      if (userType === 'organization') {
        const response = await fetch(`${API_URL}/api/organizations/profile`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
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
          isCheckingRef.current = false;
          return true;
        }
      }

      // Auth failed
      await clearAllData();
      setAuthStatus({
        isExistingUser: false,
        isProfileComplete: false,
        requiresProfileCompletion: false,
        isLoading: false,
        user: undefined,
        organization: undefined,
      });
      isCheckingRef.current = false;
      if (!isPublicRoute()) {
        router.push('/login');
      }
      return false;

    } catch (error) {
      console.error("Auth check error:", error);
      setAuthStatus(prev => ({ ...prev, isLoading: false }));
      isCheckingRef.current = false;
      return false;
    }
  }, [isPublicRoute, getUserType, router, authStatus.isExistingUser]);

  // Login function - called from login component
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

  // Initialize - ONLY runs on protected routes
  React.useEffect(() => {
    // Skip entirely on public routes
    if (isPublicRoute()) {
      setAuthStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Only initialize once
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Check auth after a small delay
    const timer = setTimeout(() => {
      checkAuth();
    }, 300);

    return () => clearTimeout(timer);
  }, [isPublicRoute, checkAuth]);

  const logout = React.useCallback(async (): Promise<void> => {
    try {
      await fetch(`${API_URL}/api/user/logout`, {
        method: "POST",
        credentials: "include",
        headers: { 'Content-Type': 'application/json' }
      });

      await clearAllData();
      localStorage.removeItem('type');
      localStorage.removeItem('role');
      localStorage.removeItem('organization_id');
      localStorage.removeItem('organization_name');

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
  }, [router]);

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

  // Provide login in the context
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