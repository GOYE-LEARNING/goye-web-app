"use client";
import React, { useState, useRef, useEffect } from "react";
import useGoogleSignupButton from "../hook/useGoogleSignupButton";
import Image from "next/image";
import googleIcon from "@/public/images/google_logo2.png";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../context/AuthContext";
import TranslatedText from "../hook/translateText";

const GoogleSignInButton = ({
  onSuccess,
  onNewUser,
  onExistingUser,
  onError,
  requireProfileCompletion,
}: {
  onSuccess: (data: any) => void;
  onNewUser: (data: any) => void;
  onExistingUser: (data: any) => void;
  onError: (error: string) => void;
  requireProfileCompletion?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { signInWithGoogle, loading } = useGoogleSignupButton();
  const { updateAuthStatus, checkAuth } = useAuthContext();
  const router = useRouter();
  const [timeoutError, setTimeoutError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timedOutRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = async () => {
    setTimeoutError(null);
    timedOutRef.current = false;

    timeoutRef.current = setTimeout(() => {
      timedOutRef.current = true;
      setTimeoutError(
        "This is taking longer than usual. You can keep waiting, or try again.",
      );
    }, 20000);

    try {
      const result = await signInWithGoogle();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (timedOutRef.current) {
        setTimeoutError(null);
      }

      // ─── Cancelled — deliberate popup close, no banner ────────────────
      if (!result.success && result.cancelled) {
        return;
      }

      // ─── Backend error / unexpected shape ─────────────────────────────
      if (!result.success) {
        onError(result.error || "Google sign-in failed");
        return;
      }

      // ─── NEW USER → hand the payload to the caller to prefill ─────────
      // result = { success: true, kind: "new", googleUid, profile }
      // No cookies, no auth check — the account does not exist yet.
      if (result.kind === "new") {
        if (requireProfileCompletion) {
          requireProfileCompletion(true);
        }
        onNewUser(result);
        onSuccess(result);
        return;
      }

      // ─── EXISTING USER → cookies set, verify auth then route ──────────
      const { userData, status } = result;

      updateAuthStatus({
        isExistingUser: status?.isExistingUser ?? true,
        isProfileComplete: status?.isProfileComplete ?? true,
        requiresProfileCompletion: status?.requiresProfileCompletion ?? false,
        user: userData,
        isLoading: false,
      });

      // Give the browser a moment to commit Set-Cookie before checkAuth
      await new Promise((resolve) => setTimeout(resolve, 800));

      let isAuthenticated = false;
      let retryCount = 0;
      const maxRetries = 3;

      while (!isAuthenticated && retryCount < maxRetries) {
        try {
          isAuthenticated = await checkAuth();
          if (!isAuthenticated && retryCount < maxRetries - 1) {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        } catch (err) {
          console.error(`Auth check attempt ${retryCount + 1} failed:`, err);
        }
        retryCount++;
      }

      if (!isAuthenticated) {
        onError("Authentication failed. Please try again.");
        return;
      }

      onSuccess(result);
      onExistingUser(result);

      if (status?.isProfileComplete) {
        router.push("/loading");
      } else {
        if (requireProfileCompletion) {
          requireProfileCompletion(true);
        }
        onNewUser(result);
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      onError(err.message || "An unexpected error occurred during Google sign-in");
    }
  };

  return (
    <div className="w-full">
      {timeoutError && (
        <div className="mb-3 p-3 bg-primaryColors-0/10 border border-primaryColors-0/40 rounded-lg text-primaryColors-0 text-sm text-center">
          {timeoutError}
        </div>
      )}
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full dark:bg-secondaryColors-0 bg-white dark:hover:bg-secondaryColors-0/50 hover:bg-lightWhite-0 border border-[#ccc]/10 rounded-[10px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-center gap-2 py-3">
          {loading ? (
            <>
              <div className="animate-spin h-[20px] w-[20px] border-[2px] border-white border-t-transparent rounded-full"></div>
              <span><TranslatedText text="Signing in..." /></span>
            </>
          ) : (
            <>
              <Image src={googleIcon} alt="google_icon" height={30} width={30} />
              <span className="dark:text-white text-lightBoldText-0">
                <TranslatedText text="Sign in with Google" />
              </span>
            </>
          )}
        </div>
      </button>
    </div>
  );
};

export default GoogleSignInButton;