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

  // Refresh the access token
  const refreshToken = React.useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/verify/refresh-token`, {
        method: "POST",
        credentials: "include", // Sends cookies automatically
      });
      
      if (response.ok) {
        const data = await response.json();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }, []);

  // Check authentication status by calling backend
  const checkAuth = React.useCallback(async (): Promise<boolean> => {
    setAuthStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      // First try to access a protected endpoint
      const response = await fetch(`${API_URL}/api/user/profile`, {
        credentials: 'include', // Sends HTTP-only cookies automatically
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuthStatus({
          isExistingUser: true,
          isProfileComplete: data.user?.isProfileComplete || false,
          requiresProfileCompletion: !data.user?.isProfileComplete,
          isLoading: false,
          user: data.user,
        });
        return true;
      } else if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await refreshToken();
        
        if (refreshed) {
          // Retry the profile request
          const retryResponse = await fetch(`${API_URL}/api/user/profile`, {
            credentials: 'include',
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            setAuthStatus({
              isExistingUser: true,
              isProfileComplete: retryData.user?.isProfileComplete || false,
              requiresProfileCompletion: !retryData.user?.isProfileComplete,
              isLoading: false,
              user: retryData.user,
            });
            return true;
          }
        }
        
        // Refresh failed or retry failed - redirect to auth
        setAuthStatus({
          isExistingUser: false,
          isProfileComplete: false,
          requiresProfileCompletion: false,
          isLoading: false,
          user: undefined,
        });
        
        // Redirect to auth page
        router.push("/auth");
        return false;
      } else {
        setAuthStatus({
          isExistingUser: false,
          isProfileComplete: false,
          requiresProfileCompletion: false,
          isLoading: false,
          user: undefined,
        });
        return false;
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthStatus({
        isExistingUser: false,
        isProfileComplete: false,
        requiresProfileCompletion: false,
        isLoading: false,
        user: undefined,
      });
      return false;
    }
  }, [refreshToken, router]);

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

  const updateAuthStatus = (status: Partial<AuthContextType>) => {
    setAuthStatus((prev) => ({ ...prev, ...status }));
  };

  const clearAuth = () => {
    setAuthStatus({
      isExistingUser: false,
      isProfileComplete: false,
      requiresProfileCompletion: false,
      isLoading: false,
      user: undefined,
    });
  };

  // Check auth on app load
  React.useEffect(() => {
    checkAuth();
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