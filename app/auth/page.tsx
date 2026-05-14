"use client";
import AuthHeader from "../component/auth_header";
import Login from "./login";
import Signin from "./signup";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthContext } from "../context/AuthContext";
import AuthWelcomeHeader from "../component/auth_welcome_header";

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState<boolean>(true);
  const [showSignin, setShowSignin] = useState<boolean>(false);
  const [checkRequireComplete, setRequireComplete] = useState<boolean>(false);
  const { authStatus } = useAuthContext();
  const changeContentLogin = () => {
    setShowLogin(false);
    setShowSignin(true);
  };

  const changeContentSignin = () => {
    setShowLogin(true);
    setShowSignin(false);
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
      <AuthHeader
        changeTextToLogin={changeContentLogin}
        changeTextToSignin={changeContentSignin}
      />
          <div className="md:hidden block w-full">
            <AuthWelcomeHeader />
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
              <Login setRequireProfileCompletion={setRequireComplete} changeContentSignin={changeContentLogin}/>
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
                <Signin changeContentLogin={changeContentSignin}/>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
     
    </>
  );
}
