// src/context/AuthContext.tsx
import React from "react";
import { useRouter } from "next/navigation";

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
    level?: string
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
  });
  
  // Add a ref to prevent multiple auth checks
  const isCheckingRef = React.useRef(false);

  // Refresh the access token
  const refreshToken = React.useCallback(async (): Promise<boolean> => {
    try {
      console.log("🔄 Attempting to refresh token...");
      const response = await fetch(`${API_URL}/api/verify/refresh-token`, {
        method: "POST",
        credentials: "include",
      });
      
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

  // Check authentication status by calling backend
  const checkAuth = React.useCallback(async (): Promise<boolean> => {
    // Prevent multiple concurrent checks
    if (isCheckingRef.current) {
      console.log("Auth check already in progress, skipping...");
      return false;
    }
    
    isCheckingRef.current = true;
    setAuthStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Check if we have cookies
      const hasAccessToken = document.cookie.includes("accessToken");
      const hasRefreshToken = document.cookie.includes("refreshToken");
      
      console.log("🔍 Checking auth - Cookies:", { hasAccessToken, hasRefreshToken });
      
      // If no tokens at all, don't even try
      if (!hasAccessToken && !hasRefreshToken) {
        console.log("No tokens found, skipping auth check");
        setAuthStatus({
          isExistingUser: false,
          isProfileComplete: false,
          requiresProfileCompletion: false,
          isLoading: false,
          user: undefined,
        });
        isCheckingRef.current = false;
        return false;
      }
      
      // Try to get user profile
      const response = await fetch(`${API_URL}/api/user/profile`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      console.log("📡 Profile response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Auth check successful:", data.user?.email);
        setAuthStatus({
          isExistingUser: true,
          isProfileComplete: data.user?.isProfileComplete || false,
          requiresProfileCompletion: !data.user?.isProfileComplete,
          isLoading: false,
          user: data.user,
        });
        isCheckingRef.current = false;
        return true;
      } 
      
      if (response.status === 401) {
        console.log("⚠️ Token expired, attempting refresh...");
        // Token expired, try to refresh
        const refreshed = await refreshToken();
        
        if (refreshed) {
          // Retry the profile request
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
              user: retryData.user,
            });
            isCheckingRef.current = false;
            return true;
          }
        }
        
        // Refresh failed
        console.log("❌ Auth check failed - not authenticated");
        setAuthStatus({
          isExistingUser: false,
          isProfileComplete: false,
          requiresProfileCompletion: false,
          isLoading: false,
          user: undefined,
        });
        isCheckingRef.current = false;
        return false;
      }
      
      console.log("❌ Auth check failed with status:", response.status);
      setAuthStatus({
        isExistingUser: false,
        isProfileComplete: false,
        requiresProfileCompletion: false,
        isLoading: false,
        user: undefined,
      });
      isCheckingRef.current = false;
      return false;
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthStatus({
        isExistingUser: false,
        isProfileComplete: false,
        requiresProfileCompletion: false,
        isLoading: false,
        user: undefined,
      });
      isCheckingRef.current = false;
      return false;
    }
  }, [refreshToken]);

  // Logout function
  const logout = React.useCallback(async (): Promise<void> => {
    try {
      await fetch(`${API_URL}/api/user/logout`, {
        method: "POST",
        credentials: "include",
      });
      
      // Clear local storage
      localStorage.clear();
      
      // Reset auth status
      setAuthStatus({
        isExistingUser: false,
        isProfileComplete: false,
        requiresProfileCompletion: false,
        isLoading: false,
        user: undefined,
      });
      
      // Redirect to auth page
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
    });
  }, []);

  // Only check auth once on mount, not on every render
  React.useEffect(() => {
    // Small delay to allow cookies to be set from previous session
    const timer = setTimeout(() => {
      checkAuth();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [checkAuth]);

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