"use client";
import AuthHeader from "../component/auth_header";
import Login from "./login";
import Signin from "./signup";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthContext } from "../context/AuthContext";
import AuthWelcomeHeader from "../component/auth_welcome_header";
import SelectLanguageContext from "../component/select_languages_context";

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState<boolean>(true);
  const [showSignin, setShowSignin] = useState<boolean>(false);
  const [showLanguage, setShowLanguage] = useState<boolean>(false);
  const [checkRequireComplete, setRequireComplete] = useState<boolean>(false);
  const [hasLanguage, setHasLanguage] = useState<boolean>(false);
  const { authStatus } = useAuthContext();

  // Check for language on mount and when localStorage changes
  useEffect(() => {
    const checkLanguage = () => {
      const lang = localStorage.getItem("lang");
      const langCode = localStorage.getItem("langCode");
      setHasLanguage(!!(lang && langCode));
    };

    checkLanguage();

    // Listen for storage changes (when other tabs change localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lang" || e.key === "langCode") {
        checkLanguage();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Custom event for same-tab updates
    const handleLanguageUpdate = () => checkLanguage();
    window.addEventListener("languageUpdated", handleLanguageUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("languageUpdated", handleLanguageUpdate);
    };
  }, []);

  const changeContentLogin = () => {
    setShowLogin(false);
    setShowSignin(true);
  };

  const changeContentSignin = () => {
    setShowLogin(true);
    setShowSignin(false);
  };

  const openLanguage = () => {
    console.log("Opening language modal"); // Debug log
    setShowLanguage(true);
  };

  const closeLanguage = () => {
    console.log("Closing language modal"); // Debug log
    setShowLanguage(false);
  };

  useEffect(() => {
    console.log("AuthStatus changed:", authStatus);
    if (authStatus.requiresProfileCompletion) {
      setShowLogin(false);
      setShowSignin(true);
    } else {
      setShowLogin(true);
      setShowSignin(false);
    }
  }, [authStatus]);

  return (
    <>
      {/* Remove !hasLanguage condition - always show when showLanguage is true */}
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
      <div className="w-full flex justify-center items-center md:mt-[0] mt-[100px] overflow-hidden flex-col ">
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
            <div>
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeIn" }}
                className="w-[350px] md:w-auto"
              >
                <Signin changeContentLogin={changeContentSignin} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
