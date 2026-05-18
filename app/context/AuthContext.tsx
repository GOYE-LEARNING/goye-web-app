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
  
  const isCheckingRef = React.useRef(false);

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
      
      if (response.ok) {
        const data = await response.json();
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
      return authStatus.isExistingUser;
    }
    
    isCheckingRef.current = true;
    setAuthStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      // First check if we have user data in localStorage (fallback)
      const userId = localStorage.getItem("user_id");
      const userRole = localStorage.getItem("role");
      const userType = localStorage.getItem("type");
      const isProfileComplete = localStorage.getItem("isProfileComplete") === "true";
      
      console.log("🔍 Checking auth - LocalStorage user data:", { 
        userId, 
        userRole, 
        userType, 
        isProfileComplete 
      });
      
      // Check cookies
      const cookies = document.cookie;
      const hasAccessToken = cookies.includes("accessToken");
      const hasRefreshToken = cookies.includes("refreshToken");
      
      console.log("🔍 Checking auth - Cookies present:", { 
        hasAccessToken, 
        hasRefreshToken,
        cookieLength: cookies.length,
        allCookies: cookies
      });
      
      // If we have user data in localStorage but no cookies, still consider authenticated
      // This is a fallback for when cookies are set but not readable (httpOnly)
      if (userId && userRole) {
        console.log("✅ Found user data in localStorage, checking backend...");
        
        // Still try to verify with backend
        try {
          const response = await fetch(`${API_URL}/api/user/profile`, {
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            }
          });
          
          console.log("📡 Profile response status:", response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log("✅ Backend verification successful:", data.user?.email);
            setAuthStatus({
              isExistingUser: true,
              isProfileComplete: data.user?.isProfileComplete || isProfileComplete,
              requiresProfileCompletion: !(data.user?.isProfileComplete || isProfileComplete),
              isLoading: false,
              user: data.user || {
                id: userId,
                first_name: localStorage.getItem("first_name") || "",
                last_name: localStorage.getItem("last_name") || "",
                email_address: localStorage.getItem("email") || "",
                role: userRole,
                type: userType || "user",
                level: localStorage.getItem("level") || "Beginners"
              },
            });
            isCheckingRef.current = false;
            return true;
          }
        } catch (backendError) {
          console.log("Backend verification failed, using localStorage data as fallback");
        }
        
        // Use localStorage data as fallback
        console.log("✅ Using localStorage data as fallback");
        setAuthStatus({
          isExistingUser: true,
          isProfileComplete: isProfileComplete,
          requiresProfileCompletion: !isProfileComplete,
          isLoading: false,
          user: {
            id: userId,
            first_name: localStorage.getItem("first_name") || "",
            last_name: localStorage.getItem("last_name") || "",
            email_address: localStorage.getItem("email") || "",
            role: userRole,
            type: userType || "user",
            level: localStorage.getItem("level") || "Beginners"
          },
        });
        isCheckingRef.current = false;
        return true;
      }
      
      // If no user data in localStorage, try to get from backend
      if (!hasAccessToken && !hasRefreshToken) {
        console.log("No tokens found and no localStorage data");
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
        
        // Save to localStorage for fallback
        if (data.user) {
          localStorage.setItem("user_id", data.user.id);
          localStorage.setItem("first_name", data.user.first_name || "");
          localStorage.setItem("last_name", data.user.last_name || "");
          localStorage.setItem("email", data.user.email_address || "");
          localStorage.setItem("role", data.user.role || "student");
          localStorage.setItem("type", data.user.type || "user");
          localStorage.setItem("isProfileComplete", String(data.user?.isProfileComplete || false));
          if (data.user.level) localStorage.setItem("level", data.user.level);
        }
        
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
        const refreshed = await refreshToken();
        
        if (refreshed) {
          const retryResponse = await fetch(`${API_URL}/api/user/profile`, {
            credentials: 'include',
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            console.log("✅ Auth check successful after refresh");
            
            if (retryData.user) {
              localStorage.setItem("user_id", retryData.user.id);
              localStorage.setItem("first_name", retryData.user.first_name || "");
              localStorage.setItem("last_name", retryData.user.last_name || "");
              localStorage.setItem("email", retryData.user.email_address || "");
              localStorage.setItem("role", retryData.user.role || "student");
              localStorage.setItem("type", retryData.user.type || "user");
              localStorage.setItem("isProfileComplete", String(retryData.user?.isProfileComplete || false));
            }
            
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
      // Don't clear auth status on error, keep existing if any
      setAuthStatus(prev => ({ ...prev, isLoading: false }));
      isCheckingRef.current = false;
      return authStatus.isExistingUser;
    }
  }, [refreshToken, authStatus.isExistingUser]);

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

  // Only check auth once on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    
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