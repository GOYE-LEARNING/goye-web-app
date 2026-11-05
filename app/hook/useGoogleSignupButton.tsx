import { useState, useRef, useCallback } from "react";
import axios from "axios";
import { auth, googleProvider, signInWithPopup } from "../config/firebase";
import { useAuthContext } from "../context/AuthContext";
import {
  saveUserProfile,
  saveAuthTokens,
  updateSessionState,
  getOrCreateDeviceId,
} from "@/app/utils/database/db";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export interface GoogleProfile {
  email: string;
  first_name: string;
  last_name: string;
  picture: string | null;
  email_verified: boolean;
}

export type GoogleSignInResult =
  | { success: true; kind: "new"; googleUid: string; profile: GoogleProfile }
  | { success: true; kind: "existing"; data: any; userData: any; status: any }
  | { success: false; error?: string; cancelled?: boolean };

const useGoogleSignupButton = () => {
  const { updateAuthStatus } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSigningInRef = useRef(false);

  const signInWithGoogle = useCallback(async (): Promise<GoogleSignInResult> => {
    if (isSigningInRef.current || loading) {
      return { success: false, error: "Sign-in already in progress. Please wait." };
    }
    isSigningInRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // Send the client's own device ID so /auth/google keys the userSession
      // to the same device that /refresh and /api/user/profile will query.
      // Without this header, the server invents an ID the client never sees
      // and refresh fails on the very next request.
      const deviceId = await getOrCreateDeviceId();

      const response = await apiClient.post(
        "/api/user/auth/google",
        { idToken },
        { headers: { "X-Device-Id": deviceId } },
      );

      const data = response.data;

      // ─── NEW USER ─────────────────────────────────────────────────────
      if (data.success && data.isNewUser) {
        const profile: GoogleProfile = data.profile;

        updateAuthStatus({
          isExistingUser: false,
          isProfileComplete: false,
          requiresProfileCompletion: true,
          user: {
            first_name: profile.first_name,
            last_name: profile.last_name,
            email_address: profile.email,
            user_pic: profile.picture,
            firebase_uid: data.googleUid,
            provider: "GOOGLE",
            isProfileComplete: false,
          } as any,
          isLoading: false,
        });

        return {
          success: true,
          kind: "new",
          googleUid: data.googleUid,
          profile,
        };
      }

      // ─── EXISTING USER ────────────────────────────────────────────────
      if (data.success && !data.isNewUser) {
        const { status, user, accessToken, refreshToken } = data;

        if (accessToken || refreshToken) {
          await saveAuthTokens({ accessToken, refreshToken });
        }

        if (user) {
          await saveUserProfile({
            userId: user.id,
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email_address: user.email_address || "",
          });
          localStorage.setItem("role", user.role || "student");
          localStorage.setItem("type", user.type || "user");
          localStorage.setItem(
            "isProfileComplete",
            String(status?.isProfileComplete || false),
          );
          if (user.organizationId)
            localStorage.setItem("organization_id", user.organizationId);
          if (user.user_pic) localStorage.setItem("user_pic", user.user_pic);
          if (user.level) localStorage.setItem("level", user.level);
        }

        // Mark the local session authenticated BEFORE returning to the
        // caller, so AuthGuard on the next navigation reads a settled
        // session instead of racing the IndexedDB write.
        try {
          await updateSessionState({
            isAuthenticated: true,
            lastActivity: new Date().toISOString(),
          });
        } catch (e) {
          console.warn("updateSessionState failed after Google sign-in", e);
        }

        updateAuthStatus({
          isExistingUser: status?.isExistingUser ?? true,
          isProfileComplete: status?.isProfileComplete ?? true,
          requiresProfileCompletion: status?.requiresProfileCompletion ?? false,
          user,
          isLoading: false,
        });

        return { success: true, kind: "existing", data, userData: user, status };
      }

      return { success: false, error: data.message || "Authentication failed" };
    } catch (err: any) {
      console.error("Google sign-in error:", err);

      if (
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        return { success: false, cancelled: true, error: "Sign-in was cancelled." };
      }
      if (err.code === "auth/popup-blocked") {
        return { success: false, error: "Pop-up was blocked. Please allow popups." };
      }
      if (err.code === "auth/network-request-failed") {
        return {
          success: false,
          error: "Network error. Please check your connection.",
        };
      }
      if (err.response) {
        return {
          success: false,
          error: err.response.data?.message || `Server error: ${err.response.status}`,
        };
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