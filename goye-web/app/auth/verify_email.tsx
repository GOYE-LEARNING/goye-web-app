"use client";

import React, { useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import OtpLength from "../component/auth_otp_input";


export default function VerifyEmail() {

  const onComplete = (otp: string) => {
  
  };

  return (
    <>
      <div className="form_container">
        <h1 className="form_h1">Verify Email</h1>
        <p className="form-p">
            A one-time password has been sent to your email.
        </p>
        <form noValidate className="form">
       <OtpLength length={6} onComplete={onComplete}/>
          <span className="form_btn">
            Verify
          </span>
        </form>
      </div>
    </>
  );
}
