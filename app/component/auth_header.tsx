"use client";
import Image from "next/image";
import { useState } from "react";
import { useTheme } from "../context/theme_provider";
import logoDarkMode from "@/public/images/goye_white.png";
import logoLightMode from "@/public/images/goye-removebg-preview.png";
import ToogleDarkMode from "./toogleDarkMode";
interface Props {
  changeTextToLogin: () => void;
  changeTextToSignin: () => void;
}
export default function AuthHeader({
  changeTextToLogin,
  changeTextToSignin,
}: Props) {
  const [changeHeaderToLogin, setChangeHeaderToLogin] =
    useState<boolean>(false);
  const [changeHeaderToSignin, setChangeHeaderToSignin] =
    useState<boolean>(true);
  const { darkMode, setDarkMode } = useTheme();

  return (
    <>
      <div className="pt-[48px] md:flex justify-between items-center font-[400] hidden relative z-[10] w-full">
        <Image
          src={darkMode ? logoDarkMode : logoLightMode}
          alt="logo"
          height={100}
          width={100}
        />
        {changeHeaderToSignin && (
          <div className="flex items-center gap-3">
            <ToogleDarkMode
              toogleDarkMode={() => {
                setDarkMode(!darkMode);
              }}
            />
            <span className="text-nearTextColors-0">
              New user ?{" "}
              <span
                className="text-primaryColors-0 cursor-pointer font-semibold"
                onClick={() => {
                  changeTextToLogin();
                  setChangeHeaderToLogin(true);
                  setChangeHeaderToSignin(false);
                }}
              >
                Create Account
              </span>
            </span>
          </div>
        )}
        {changeHeaderToLogin && (
          <span className="text-nearTextColors-0" >
            Have an account ?{" "}
            <span
              className="text-primaryColors-0 cursor-pointer font-semibold"
              onClick={() => {
                changeTextToSignin();
                setChangeHeaderToSignin(true);
                setChangeHeaderToLogin(false);
              }}
            >
              Login
            </span>
          </span>
        )}
      </div>
    </>
  );
}
