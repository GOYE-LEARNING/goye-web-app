"use client";
import { MdCopyright } from "react-icons/md";
import AuthHeader from "../component/auth_header";
import Login from "./login";
import Signin from "./signup";
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
      <div className="w-full flex justify-center items-center pt-[128px] md:pt-0">
        <AnimatePresence mode="wait">
          {showLogin && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeIn" }}
              className="w-[360px] md:w-auto"
            >
              <Login />
            </motion.div>
          )}
          {showSignin && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeIn" }}
              className="w-[360px] md:w-auto"
            >
              <Signin />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="md:flex justify-center items-center hidden">
        <span className="flex gap-2 items-center text-[#7174bc] absolute bottom-[calc(1000px-995.51px)]">
          <MdCopyright size={18} />
          GOYE,2025
        </span>
      </div>

      <div className="flex justify-center items-center md:hidden">
        <span className="flex gap-2 items-center text-[#7174bc] absolute bottom-[calc(1000px-975.51px)]">
          {showLogin && (
            <>
              {" "}
              <p className="text-textGrey-0">Have an account?</p>
              <span className="text-primaryColors-0 font-semibold cursor-pointer" onClick={changeContentLogin}>
                Sign up
              </span>
            </>
          )}
          {showSignin && (
            <>
              {" "}
              <p className="text-textGrey-0">Don't have an account?</p>
              <span className="text-primaryColors-0 font-semibold cursor-pointer" onClick={changeContentSignin}>
                Log in
              </span>
            </>
          )}
        </span>
      </div>
    </>
  );
}
