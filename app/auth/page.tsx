"use client";

import AuthHeader from "../component/auth_header";
import Login from "./login";
import Signin from "./signup";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthContext } from "../context/AuthContext";
import AuthWelcomeHeader from "../component/auth_welcome_header";
import SelectLanguageContext from "../component/select_languages_context";
import { useRouter } from "next/navigation";

// Helper to get cookie
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Helper to get profile path based on role
function getProfilePath(role?: string | null, org_name?: string | null) {
  if (role === "student") {
    return "/dashboard/student/profile";
  } else if (role === "instructor" || role === "tutor") {
    return "/dashboard/tutor/profile";
  } else if (role === "invited_user") {
    return `/dashboard/${org_name}/organization/profile`;
  } else if (role === "org_admin") {
    return `/dashboard/${org_name}/admin/profile`;
  }
  return "/dashboard";
}

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState<boolean>(true);
  const [showSignin, setShowSignin] = useState<boolean>(false);
  const [showLanguage, setShowLanguage] = useState<boolean>(false);
  const [checkRequireComplete, setRequireComplete] = useState<boolean>(false);
  const [hasLanguage, setHasLanguage] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const { authStatus } = useAuthContext(); // ✅ Only destructure authStatus
  const router = useRouter();

  // ✅ Check if already logged in and redirect
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = getCookie('accessToken');
      
      if (accessToken) {
        const role = localStorage.getItem('role');
        const org_name = localStorage.getItem('org_name');
        const profilePath = getProfilePath(role, org_name);
        await router.replace(profilePath);
        return;
      }
      
      setIsCheckingAuth(false);
    };
    
    checkAuth();
  }, [router]);

  // Check for language on mount
  useEffect(() => {
    const checkLanguage = () => {
      const lang = localStorage.getItem("lang");
      const langCode = localStorage.getItem("langCode");
      setHasLanguage(!!(lang && langCode));
    };

    checkLanguage();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lang" || e.key === "langCode") {
        checkLanguage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    const handleLanguageUpdate = () => checkLanguage();
    window.addEventListener("languageUpdated", handleLanguageUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("languageUpdated", handleLanguageUpdate);
    };
  }, []);

  // ✅ Handle auth status changes for profile completion
  useEffect(() => {
    if (!isCheckingAuth && authStatus) {
      console.log("AuthStatus changed:", authStatus);
      
      // If profile needs completion, show signup
      if (authStatus.requiresProfileCompletion) {
        setShowLogin(false);
        setShowSignin(true);
      } else if (authStatus.isExistingUser) { // ✅ Use isExistingUser instead of isAuthenticated
        // If authenticated but profile is complete, redirect to dashboard
        const role = localStorage.getItem('role');
        const org_name = localStorage.getItem('org_name');
        const profilePath = getProfilePath(role, org_name);
        router.replace(profilePath);
      } else {
        // Not authenticated, show login
        setShowLogin(true);
        setShowSignin(false);
      }
    }
  }, [authStatus, isCheckingAuth, router]);

  const changeContentLogin = () => {
    setShowLogin(false);
    setShowSignin(true);
  };

  const changeContentSignin = () => {
    setShowLogin(true);
    setShowSignin(false);
  };

  const openLanguage = () => {
    setShowLanguage(true);
  };

  const closeLanguage = () => {
    setShowLanguage(false);
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primaryColors-0 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showLanguage && <SelectLanguageContext closeLanguage={closeLanguage} />}

      <AuthHeader
        changeTextToLogin={changeContentLogin}
        changeTextToSignin={changeContentSignin}
        openLanguage={openLanguage}
        hasLanguage={hasLanguage}
        isSignupOpen={showSignin}
      />
      
      <div className="md:hidden block w-full">
        <AuthWelcomeHeader
          openLanguage={openLanguage}
          hasLanguage={hasLanguage}
        />
      </div>
      
      <div className="w-full flex justify-center items-center md:mt-[0] mt-[100px] overflow-hidden flex-col">
        <AnimatePresence mode="wait">
          {showLogin && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeIn" }}
              className="w-[350px] md:w-auto"
            >
              <Login
                setRequireProfileCompletion={setRequireComplete}
                changeContentSignin={changeContentLogin}
              />
            </motion.div>
          )}

          {showSignin && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeIn" }}
              className="w-[350px] md:w-auto"
            >
              <Signin 
                changeContentLogin={changeContentSignin}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}