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
  const { signInWithGoogle, loading, error } = useGoogleSignupButton();
  const { updateAuthStatus, checkAuth } = useAuthContext();
  const router = useRouter();
  const [timeoutError, setTimeoutError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Once the timeout banner has shown, a same-flow success/failure that
  // resolves late shouldn't also trigger the page-level error banner —
  // that's the "two messages for one event" complaint. A late success still
  // goes ahead (no reason to punish someone who did eventually finish).
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

    // A single, calm message scoped to this button — not also routed through
    // onError's page-level banner, which used to show a second, near-
    // identical error for the exact same event.
    timeoutRef.current = setTimeout(() => {
      timedOutRef.current = true;
      setTimeoutError("This is taking longer than usual. You can keep waiting, or try again.");
    }, 20000);

    try {
      const result = await signInWithGoogle();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Resolved after all, even though the timeout banner already showed —
      // clear it and let a genuine success/cancel proceed normally instead
      // of leaving a stale "taking too long" message on screen.
      if (timedOutRef.current) {
        setTimeoutError(null);
      }

      if (result?.cancelled) {
        // The user closed the popup themselves — a normal choice, not an
        // error. No banner, just let them try again whenever they want.
        return;
      }

      if (result?.success) {
        const { userData, status } = result;
        
        const isProfileComplete = status?.isProfileComplete;
        const isExistingUser = status?.isExistingUser;

        console.log("Google auth result:", {
          isProfileComplete,
          isExistingUser,
          userData
        });

        // Update auth context
        updateAuthStatus({
          isExistingUser: isExistingUser,
          isProfileComplete: isProfileComplete,
          requiresProfileCompletion: !isProfileComplete,
          user: userData,
          isLoading: false,
        });

        // ✅ Wait for cookies to be set
        console.log("Waiting for cookies to be set...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // ✅ Verify authentication
        console.log("Verifying authentication...");
        let isAuthenticated = false;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (!isAuthenticated && retryCount < maxRetries) {
          try {
            isAuthenticated = await checkAuth();
            console.log(`Auth check attempt ${retryCount + 1}:`, isAuthenticated);
            
            if (!isAuthenticated && retryCount < maxRetries - 1) {
              console.log("Waiting before retry...");
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            retryCount++;
          } catch (err) {
            console.error(`Auth check attempt ${retryCount + 1} failed:`, err);
            retryCount++;
          }
        }
        
        if (!isAuthenticated) {
          console.error("Authentication verification failed after retries");
          onError("Authentication failed. Please try again.");
          return;
        }

        console.log("✅ Authentication verified successfully!");

        // Now decide where to go
        if (isProfileComplete && isExistingUser) {
          console.log("Profile complete, redirecting to loading...");
          router.push("/loading");
        } else {
          console.log("Profile incomplete, showing signup form...");
          if (requireProfileCompletion) {
            requireProfileCompletion(true);
          }
          onNewUser(result);
        }
        
        onSuccess(result);
        if (isExistingUser) {
          onExistingUser(result);
        }
      } else if (result?.error) {
        onError(result.error);
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
              <span><TranslatedText text="Signing in..."/></span>
            </>
          ) : (
            <>
              <Image src={googleIcon} alt="google_icon" height={30} width={30} />
              <span className="dark:text-white text-lightBoldText-0">
                <TranslatedText text="Sign in with Google"/>
              </span>
            </>
          )}
        </div>
      </button>
    </div>
  );
};

export default GoogleSignInButton;