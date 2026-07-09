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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = async () => {
    setTimeoutError(null);
    
    timeoutRef.current = setTimeout(() => {
      setTimeoutError("Google sign-in is taking too long. Please check your internet connection and try again.");
      onError("Google sign-in is taking too long. Please check your internet connection and try again.");
    }, 20000);

    try {
      const result = await signInWithGoogle();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
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
        <div className="mb-3 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm text-center">
          ⚠️ {timeoutError}
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