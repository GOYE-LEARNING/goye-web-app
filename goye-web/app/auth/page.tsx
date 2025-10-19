"use client";
import { MdCopyright } from "react-icons/md";
import AuthHeader from "../component/auth_header";
import Login from "./login";
import Signin from "./signin";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ForgotPassword from "./forgot_password";
import LinkSent from "./link_sent";
import PasswordReset from "./password_reset";

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState<boolean>(true);
  const [showSignin, setShowSignin] = useState<boolean>(false);

  const changeContentLogin = () => {
    setShowLogin(false);
    setShowSignin(true);
  };

  const changeContentSignin = () => {
    setShowLogin(true);
    setShowSignin(false);
  };
  return (
    <>
      <AuthHeader
        changeTextToLogin={changeContentLogin}
        changeTextToSignin={changeContentSignin}
      />
      <div className="w-full flex justify-center items-center">
        {/** <AnimatePresence mode="wait">
          {showLogin && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{opacity: 0, x: -50}}
              transition={{ duration: 0.3, ease: "easeIn" }}
            >
              <Login />
            </motion.div>
          )}
          {showSignin && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{opacity: 0, x: -50}}
              transition={{ duration: 0.3, ease: "easeIn" }}
            >
              <Signin />
            </motion.div>
          )}
        </AnimatePresence>  */}
        <PasswordReset />
      </div>
      <div className="flex justify-center items-center ">
        <span className="flex gap-2 items-center text-[#7174bc] absolute bottom-[calc(1000px-995.51px)]">
          <MdCopyright size={18} />
          GOYE,2025
        </span>
      </div>
    </>
  );
}
