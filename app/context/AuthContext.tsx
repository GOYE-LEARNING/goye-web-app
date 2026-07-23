// src/context/AuthContext.tsx - FIXED WITH PROPER DEBOUNCING
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { dispatchAPIError } from "@/app/hook/useAPIErrorHandler";
import { getUserProfile, clearUserProfile } from "@/app/utils/database/db";

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
}

const AuthContext = React.createContext<AuthState | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AuthProvider({ children }: Props) {
  const router = useRouter();
  const [authStatus, setAuthStatus] = React.useState<AuthContextType>({
    isExistingUser: false,
    isProfileComplete: false,
    requiresProfileCompletion: false,
    isLoading: true,
    user: undefined,
    organization: undefined,
  });
  
  const isCheckingRef = React.useRef(false);
  const checkTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastCheckTimeRef = React.useRef<number>(0);
  const checkCountRef = React.useRef<number>(0);

  // Refresh the access token
  const refreshToken = React.useCallback(async (): Promise<boolean> => {
    try {
      console.log("🔄 Attempting to refresh token...");
      const response = await fetch(`${API_URL}/api/verify/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log("Refresh token response status:", response.status);
      
      if (response.status === 429) {
        console.warn("⚠️ Rate limited on token refresh");
        dispatchAPIError({
          status: 429,
          message: "Too many requests, please slow down and try again later.",
          retryAfter: 5,
          endpoint: "/api/verify/refresh-token"
        });
        return false;
      }
      
      if (response.ok) {
        console.log("✅ Token refresh successful");
        return true;
      }
      console.log("❌ Token refresh failed with status:", response.status);
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }, []);

  // Determine user type so checkAuth knows which profile endpoint to call.
  //
  // Reads localStorage directly rather than trusting authStatus.user: every
  // call site (loading page, every dashboard layout) calls updateAuthStatus()
  // and then immediately awaits checkAuth() in the same synchronous block.
  // setAuthStatus is async, so the already-memoized checkAuth closure still
  // sees the *previous* render's authStatus (user: undefined) — not what
  // updateAuthStatus just set. That silently sent every non-admin,
  // non-plain-student/tutor account (organization owners, invited members)
  // through the 'individual' default below, hitting /api/user/profile and
  // getting a 400 back. localStorage is written synchronously at login,
  // before checkAuth is ever called, so it isn't subject to that race.
  //
  // "type" is the frontend's own normalized classifier, written identically
  // by every login path (see login.tsx / useGoogleSignupButton.tsx) to
  // exactly one of "admin" | "organization" | "invited_user" | "user" — a
  // more reliable signal than exact-matching backend role/userType strings,
  // which vary and may not even be present yet.
  const getUserType = React.useCallback(() => {
    const type = (localStorage.getItem('type') || authStatus?.user?.type || '').toLowerCase();
    const role = localStorage.getItem('role') || authStatus?.user?.role;
    const userType = authStatus?.user?.userType;

    if (type === 'admin' || role === 'goye_admin') {
      return 'admin';
    }

    if (
      type === 'organization' ||
      type === 'invited_user' ||
      userType === 'INVITED_MEMBER' ||
      userType === 'ORGANIZATION_OWNER' ||
      role === 'org_admin'
    ) {
      return 'organization';
    }

    if (type === 'user' || role === 'student' || role === 'tutor' || userType === 'INDIVIDUAL') {
      return 'individual';
    }

    // Default to individual (student/tutor) when nothing is known yet.
    return 'individual';
  }, [authStatus]);

  // Check authentication status - with proper debouncing and rate limiting
  const checkAuth = React.useCallback(async (): Promise<boolean> => {
    // Clear any pending check
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
      checkTimeoutRef.current = null;
    }

    // Prevent multiple concurrent checks
    if (isCheckingRef.current) {
      console.log("Auth check already in progress, skipping...");
      return authStatus.isExistingUser;
    }
    
    // Rate limit: Only allow check every 5 seconds
    const now = Date.now();
    if (now - lastCheckTimeRef.current < 5000) {
      console.log(`⏳ Rate limiting auth check. Last check was ${(now - lastCheckTimeRef.current) / 1000}s ago`);
      return authStatus.isExistingUser;
    }
    
    // Increment check counter
    checkCountRef.current += 1;
    console.log(`🔍 Auth check #${checkCountRef.current} starting...`);
    
    isCheckingRef.current = true;
    lastCheckTimeRef.current = now;
    setAuthStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      const userType = getUserType();

      // Platform admins have no profile-fetch endpoint of their own (see
      // getUserType above) — every real API call still enforces auth via
      // the httpOnly session cookie server-side regardless of this local
      // status, so we trust the identity already captured at login rather
      // than calling an endpoint built for a different role.
      if (userType === 'admin') {
        console.log("🛡️ Platform admin - skipping profile fetch, trusting session cookie");
        const profile = await getUserProfile();
        setAuthStatus({
          isExistingUser: true,
          isProfileComplete: true,
          requiresProfileCompletion: false,
          isLoading: false,
          user: {
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
            role: localStorage.getItem('role') || 'goye_admin',
          } as any,
          organization: undefined,
        });
        isCheckingRef.current = false;
        return true;
      }

      // Students and Tutors use /api/user/profile
      if (userType === 'individual') {
        console.log("📡 Individual user (student/tutor) - Using /api/user/profile");
        const response = await fetch(`${API_URL}/api/user/profile`, {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          }
        });
        
        console.log("📡 /api/user/profile response status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("✅ Auth check successful via /api/user/profile");
          
          setAuthStatus({
            isExistingUser: true,
            isProfileComplete: data.user?.isProfileComplete || false,
            requiresProfileCompletion: !data.user?.isProfileComplete,
            isLoading: false,
            user: data.user || undefined,
            organization: undefined,
          });
          isCheckingRef.current = false;
          return true;
        }
        
        if (response.status === 429) {
          console.warn("⚠️ Rate limited on auth check");
          dispatchAPIError({
            status: 429,
            message: "Too many requests, please slow down and try again later.",
            retryAfter: 5,
            endpoint: "/api/user/profile"
          });
          setAuthStatus(prev => ({ ...prev, isLoading: false }));
          isCheckingRef.current = false;
          return authStatus.isExistingUser;
        }
        
        if (response.status === 401) {
          console.log("⚠️ Unauthorized, attempting refresh...");
          const refreshed = await refreshToken();
          
          if (refreshed) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const retryResponse = await fetch(`${API_URL}/api/user/profile`, {
              credentials: 'include',
            });
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              console.log("✅ Auth check successful after refresh");
              
              setAuthStatus({
                isExistingUser: true,
                isProfileComplete: retryData.user?.isProfileComplete || false,
                requiresProfileCompletion: !retryData.user?.isProfileComplete,
                isLoading: false,
                user: retryData.user || undefined,
                organization: undefined,
              });
              isCheckingRef.current = false;
              return true;
            }
          }
        }
        
        console.log("❌ Auth check failed");
        setAuthStatus({
          isExistingUser: false,
          isProfileComplete: false,
          requiresProfileCompletion: false,
          isLoading: false,
          user: undefined,
          organization: undefined,
        });
        isCheckingRef.current = false;
        return false;
      }
      
      // Invited Users and Organization Admins use /api/organizations/profile
      console.log("🏢 Organization user (invited/org_admin) - Using /api/organizations/profile");
      const response = await fetch(`${API_URL}/api/organizations/profile`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      });
      
      console.log("📡 /api/organizations/profile response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Auth check successful via /api/organizations/profile");
        
        setAuthStatus({
          isExistingUser: true,
          isProfileComplete: true,
          requiresProfileCompletion: false,
          isLoading: false,
          user: data.organization?.user || undefined,
          organization: data.organization || undefined,
        });
        isCheckingRef.current = false;
        return true;
      }
      
      if (response.status === 429) {
        console.warn("⚠️ Rate limited on auth check");
        dispatchAPIError({
          status: 429,
          message: "Too many requests, please slow down and try again later.",
          retryAfter: 5,
          endpoint: "/api/organizations/profile"
        });
        setAuthStatus(prev => ({ ...prev, isLoading: false }));
        isCheckingRef.current = false;
        return authStatus.isExistingUser;
      }
      
      if (response.status === 401) {
        console.log("⚠️ Unauthorized, attempting refresh...");
        const refreshed = await refreshToken();
        
        if (refreshed) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const retryResponse = await fetch(`${API_URL}/api/organizations/profile`, {
            credentials: 'include',
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            console.log("✅ Auth check successful after refresh");
            
            setAuthStatus({
              isExistingUser: true,
              isProfileComplete: true,
              requiresProfileCompletion: false,
              isLoading: false,
              user: retryData.organization?.user || undefined,
              organization: retryData.organization || undefined,
            });
            isCheckingRef.current = false;
            return true;
          }
        }
      }
      
      console.log("❌ Auth check failed with status:", response.status);
      setAuthStatus({
        isExistingUser: false,
        isProfileComplete: false,
        requiresProfileCompletion: false,
        isLoading: false,
        user: undefined,
        organization: undefined,
      });
      isCheckingRef.current = false;
      return false;
      
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthStatus(prev => ({ ...prev, isLoading: false }));
      isCheckingRef.current = false;
      return authStatus.isExistingUser;
    }
  }, [refreshToken, authStatus.isExistingUser, getUserType]);

  // Debounced version of checkAuth - with longer delay
  const debouncedCheckAuth = React.useCallback(() => {
    // Clear any pending check
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
      checkTimeoutRef.current = null;
    }
    
    // Check if we already have user data
    if (authStatus.isExistingUser && authStatus.user) {
      console.log("✅ Already have auth data, skipping check");
      return;
    }
    
    // Check if we recently checked
    const now = Date.now();
    if (now - lastCheckTimeRef.current < 3000) {
      console.log(`⏳ Skipping check, last check was ${(now - lastCheckTimeRef.current) / 1000}s ago`);
      return;
    }
    
    console.log("⏰ Scheduling auth check...");
    checkTimeoutRef.current = setTimeout(() => {
      checkAuth();
      checkTimeoutRef.current = null;
    }, 500); // 500ms delay
  }, [checkAuth, authStatus.isExistingUser, authStatus.user]);

  const logout = React.useCallback(async (): Promise<void> => {
    try {
      await fetch(`${API_URL}/api/user/logout`, {
        method: "POST",
        credentials: "include",
      });

      await clearUserProfile();

      setAuthStatus({
        isExistingUser: false,
        isProfileComplete: false,
        requiresProfileCompletion: false,
        isLoading: false,
        user: undefined,
        organization: undefined,
      });
      
      router.push("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [router]);

  const updateAuthStatus = React.useCallback((status: Partial<AuthContextType>) => {
    console.log("📝 Updating auth status:", status);
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

  // Check auth once on mount with debounce - only once
  React.useEffect(() => {
    // Only check if we don't have auth data
    if (!authStatus.isExistingUser && !authStatus.user) {
      debouncedCheckAuth();
    }
    
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
        checkTimeoutRef.current = null;
      }
    };
  }, []); // Empty dependency array - ONLY RUNS ONCE

  return (
    <AuthContext.Provider value={{ 
      authStatus, 
      setAuthStatus, 
      updateAuthStatus, 
      clearAuth,
      checkAuth,
      refreshToken,
      logout
    }}>
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