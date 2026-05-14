// useGoogleSignupButton.ts
import { useState, useRef, useCallback } from "react";
import axios from "axios";
import { auth, googleProvider, signInWithPopup } from "../config/firebase";
import { useAuthContext } from "../context/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Configure axios defaults
axios.defaults.withCredentials = true;

interface GoogleSignInResult {
  success: boolean;
  error?: string;
  data?: any;
  requiresProfileCompletion?: boolean;
  isProfileComplete?: boolean;
  userData?: any;
  status?: {
    isExistingUser: boolean;
    isProfileComplete: boolean;
    requiresProfileCompletion: boolean;
    userStatusMessage?: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

const useGoogleSignupButton = () => {
  const { updateAuthStatus } = useAuthContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isSigningInRef = useRef<boolean>(false);

  const signInWithGoogle = useCallback(async (): Promise<GoogleSignInResult> => {
    // Prevent concurrent sign-in attempts
    if (isSigningInRef.current || loading) {
      console.log("Sign-in already in progress, ignoring request");
      return { 
        success: false, 
        error: "Sign-in already in progress. Please wait." 
      };
    }

    isSigningInRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Open Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // Send token to backend
      const response = await axios.post(
        `${API_BASE_URL}/api/user/auth/google`,
        { idToken },
        { withCredentials: true }
      );

      console.log("Google auth response:", response.data);

      if (response.data.success) {
        const { status, user, accessToken, refreshToken } = response.data;

        // Save user data to localStorage
        if (user) {
          // Core user data
          localStorage.setItem("user_id", user.id);
          localStorage.setItem("first_name", user.first_name || "");
          localStorage.setItem("last_name", user.last_name || "");
          localStorage.setItem("email", user.email_address || "");
          localStorage.setItem("role", user.role || "student");
          localStorage.setItem("type", user.type || "user");
          
          // Optional data
          if (user.progressId) {
            localStorage.setItem("progress_id", user.progressId);
          }
          
          if (user.planId) {
            localStorage.setItem("plan_id", user.planId);
          }
          
          if (user.organizationId) {
            localStorage.setItem("organization_id", user.organizationId);
          }
          
          if (user.organization_name) {
            localStorage.setItem("organization_name", user.organization_name);
          }
          
          if (user.user_pic) {
            localStorage.setItem("user_pic", user.user_pic);
          }
          
          console.log("✅ Saved to localStorage:", {
            user_id: user.id,
            role: user.role,
            type: user.type,
            isProfileComplete: status?.isProfileComplete
          });
        }

        // Save tokens if they exist
        if (accessToken) {
          localStorage.setItem("access_token", accessToken);
        }
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }

        // Update auth context
        updateAuthStatus({
          isExistingUser: status.isExistingUser,
          isProfileComplete: status.isProfileComplete,
          requiresProfileCompletion: status.requiresProfileCompletion,
          user: user,
        });

        // Return comprehensive result
        return { 
          success: true, 
          data: response.data,
          requiresProfileCompletion: status.requiresProfileCompletion,
          isProfileComplete: status.isProfileComplete,
          userData: user,
          status: status,
          accessToken,
          refreshToken
        };
      }
      
      // Authentication failed
      return { 
        success: false, 
        error: response.data.message || "Authentication failed" 
      };
      
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      
      // Handle specific Firebase errors
      if (err.code === 'auth/popup-closed-by-user') {
        return { 
          success: false, 
          error: "Sign-in popup was closed before completing. Please try again." 
        };
      }
      
      if (err.code === 'auth/popup-blocked') {
        return { 
          success: false, 
          error: "Pop-up was blocked by your browser. Please allow popups for this site and try again." 
        };
      }
      
      if (err.code === 'auth/cancelled-popup-request') {
        return { 
          success: false, 
          error: "Sign-in was cancelled. Please try again." 
        };
      }
      
      if (err.code === 'auth/network-request-failed') {
        return { 
          success: false, 
          error: "Network error. Please check your internet connection and try again." 
        };
      }
      
      // Handle axios/network errors
      if (err.response) {
        // Server responded with error status
        return { 
          success: false, 
          error: err.response.data?.message || `Server error: ${err.response.status}` 
        };
      } else if (err.request) {
        // Request made but no response
        return { 
          success: false, 
          error: "Unable to connect to server. Please check your connection." 
        };
      }
      
      // Generic error
      return { 
        success: false, 
        error: err.message || "An unexpected error occurred during Google sign-in" 
      };
      
    } finally {
      setLoading(false);
      // Reset the signing in ref after a delay to prevent rapid retries
      setTimeout(() => {
        isSigningInRef.current = false;
      }, 1000);
    }
  }, [loading, updateAuthStatus]);

  // Function to clear Google auth state
  const resetGoogleAuth = useCallback(() => {
    setLoading(false);
    setError(null);
    isSigningInRef.current = false;
  }, []);

  return {
    signInWithGoogle,
    resetGoogleAuth,
    loading,
    error,
    isSigningIn: isSigningInRef.current,
  };
};

export default useGoogleSignupButton;