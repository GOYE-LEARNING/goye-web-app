"use client";
import Image from "next/image";
import logo from "@/public/images/goye-removebg-preview.png";
import { useState } from "react";

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

  return (
    <>
      <div className="px-[48px] md:flex justify-between items-center font-[400] hidden">
        <Image src={logo} alt="logo" height={100} width={100} />
        {changeHeaderToSignin && (
          <span className="text-nearTextColors-0">
            New user ?{" "}
            <span
              className="text-primaryColors-0 cursor-pointer font-semibold"
              onClick={() => {
                changeTextToLogin()
                setChangeHeaderToLogin(true);
                setChangeHeaderToSignin(false);
              }}
            >
              Create Account
            </span>
          </span>
        )}
        {changeHeaderToLogin && (
          <span className="text-nearTextColors-0">
            Have an account ?{" "}
            <span
              className="text-primaryColors-0 cursor-pointer font-semibold"
              onClick={() => {
                changeTextToSignin()
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
