import { useState, useRef, useCallback } from "react";
import axios from "axios";
import { auth, googleProvider, signInWithPopup } from "../config/firebase";
import { useAuthContext } from "../context/AuthContext";
import { saveUserProfile } from "@/app/utils/database/db";

// Falls back to the known production backend so a missing/misconfigured
// NEXT_PUBLIC_API_URL doesn't leave axios's baseURL undefined — which makes
// every request resolve as a relative path against this app's own origin
// (no matching route there, so it 404s) instead of the actual backend.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      console.log("Starting Google sign-in...");
      
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      console.log("Got Google token, sending to backend...");

      const response = await apiClient.post('/api/user/auth/google', { idToken });

      console.log("Google auth response:", response.data);

      if (response.data.success) {
        const { status, user } = response.data;

        // ✅ ONLY save user data, NO tokens
        if (user) {
          // Without userId here, /loading's `if (userId && role)` gate never
          // passes for a Google sign-in — the auth check itself succeeds
          // (cookies are set correctly), but the very next page bounces back
          // to /auth with "No user data found" because it was never written.
          // The email/password flow in login.tsx already sets this.
          await saveUserProfile({
            userId: user.id,
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email_address: user.email_address || "",
          });
          localStorage.setItem("role", user.role || "student");
          localStorage.setItem("type", user.type || "user");
          localStorage.setItem("isProfileComplete", String(status?.isProfileComplete || false));
          
          if (user.organizationId) localStorage.setItem("organization_id", user.organizationId);
          if (user.user_pic) localStorage.setItem("user_pic", user.user_pic);
          if (user.level) localStorage.setItem("level", user.level);
          
          console.log("✅ Saved user data to localStorage");
        }

        // Update auth context
        updateAuthStatus({
          isExistingUser: status.isExistingUser,
          isProfileComplete: status.isProfileComplete,
          requiresProfileCompletion: status.requiresProfileCompletion,
          user: user,
          isLoading: false,
        });

        return { 
          success: true, 
          data: response.data,
          requiresProfileCompletion: status.requiresProfileCompletion,
          isProfileComplete: status.isProfileComplete,
          userData: user,
          status: status,
        };
      }
      
      return { 
        success: false, 
        error: response.data.message || "Authentication failed" 
      };
      
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: "Sign-in popup was closed. Please try again." };
      }
      if (err.code === 'auth/popup-blocked') {
        return { success: false, error: "Pop-up was blocked. Please allow popups." };
      }
      if (err.code === 'auth/network-request-failed') {
        return { success: false, error: "Network error. Please check your connection." };
      }
      
      if (err.response) {
        return { success: false, error: err.response.data?.message || `Server error: ${err.response.status}` };
      }
      
      return { success: false, error: err.message || "An unexpected error occurred" };
      
    } finally {
      setLoading(false);
      setTimeout(() => {
        isSigningInRef.current = false;
      }, 1000);
    }
  }, [loading, updateAuthStatus]);

  return {
    signInWithGoogle,
    resetGoogleAuth: () => {
      setLoading(false);
      setError(null);
      isSigningInRef.current = false;
    },
    loading,
    error,
    isSigningIn: isSigningInRef.current,
  };
};

export default useGoogleSignupButton;