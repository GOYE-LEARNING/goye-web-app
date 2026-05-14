"use client";

import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import VerifyEmail from "./verify_email";
import { useSignup } from "../context/SignupContext";
import Intro from "./intro";
import { useAuthContext } from "../context/AuthContext";
import AuthLoader from "./auth_loader";
import { useRouter } from "next/navigation";
import AuthHeader from "../component/auth_header";
import AuthWelcomeHeader from "../component/auth_welcome_header";
interface Props {
  changeContentLogin: () => void
}
export default function Signin({changeContentLogin} : Props) {
  const [showEmail, setShowEmail] = useState<boolean>(false);
  const [showSignup, setShowSignup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { authStatus } = useAuthContext();
  const router = useRouter();
  const showEmailFunc = () => {
    setShowEmail(true);
    setShowSignup(false);
    console.log("showing email component");
  };

  const roleFunc = () => {
    setShowSignup(true);
    setShowRoleModal(false);
  };
  
  const { formData, setFormData } = useSignup();
  
  useEffect(() => {
    if (authStatus.requiresProfileCompletion) {
      setFormData((prev: any) => ({
        ...prev,
        firstname: authStatus.user?.first_name || "",
        lastname: authStatus.user?.last_name || "",
        email: authStatus.user?.email_address || "",
      }));
    } else {
      console.log("No need to prefill form data");
    }
  }, [authStatus]);
  
  const sendOTP = async () => {
    setIsLoading(true);
    setShowSignup(false);
    try {
      const res = await fetch(`${API_URL}/api/user/sendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      localStorage.setItem("otp-token", data.sessionToken);
      localStorage.setItem("otp-email", data.email);

      console.log(data);
      setIsLoading(false);
      showEmailFunc();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendOTP();
  };

  const signinComponent = [
    {
      id: 1,
      label: "First name",
      type: "text",
      name: "firstname",
      value: formData["firstname"] as string,
      handlechange: handleChange,
    },
    {
      id: 2,
      label: "Last name",
      type: "text",
      name: "lastname",
      value: formData["lastname"] as string,
      handlechange: handleChange,
    },
    {
      id: 3,
      label: "Email address",
      type: "email",
      name: "email",
      value: formData["email"] as string,
      handlechange: handleChange,
    },
  ];

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
    transition: { duration: 0.4, ease: "easeInOut" }
  };

  const fadeInScale = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const inputVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 }
  };

  const buttonVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
  };

  const loaderVariants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.5,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence mode="wait">
  
      {/* Signup Form */}
      {showSignup && (
        <motion.div
          key="signup-form"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          exit="exit"
          className="form_container"
        >
          <motion.h1 
            className="form_h1"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Signin
          </motion.h1>
          
          <motion.p 
            className="form-p"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Let's get you started on your discipleship journey
          </motion.p>
          
          <motion.form
            method="POST"
            onSubmit={handleSubmit}
            noValidate
            className="form"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {signinComponent.map((form, index) => (
              <motion.div 
                key={form.id} 
                className="form_label"
                variants={inputVariants}
                custom={index}
              >
                <input
                  type={form.type}
                  name={form.name}
                  value={form.value}
                  onChange={handleChange}
                  placeholder=" "
                  required
                  className={`form_input peer focus:outline-none`}
                />
                <motion.label
                  htmlFor={form.name}
                  className={`absolute left-[12px] label peer-focus:text-[14px] peer-focus:top-[10px] transition-all duration-300 ease-in-out md:peer-placeholder-shown:top-[18px] peer-placeholder-shown:top-[19.8px] peer-placeholder-shown:text-[16px] ${
                    form.value
                      ? "top-[2px] text-[14px]"
                      : "top-[15px] text-[16px]"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {form.label}
                </motion.label>
              </motion.div>
            ))}
            
            <motion.button 
              className="form_btn md:mt-0 mt-[3rem]"
              type="button"
              onClick={handleSubmit}
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
            >
              Next <FaArrowRight size={13} />
            </motion.button>
          </motion.form>

         
        </motion.div>
      )}

      {/* Loading Spinner */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="flex items-center justify-center"
            variants={loaderVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <AuthLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Verification Component */}
      <AnimatePresence>
        {showEmail && (
          <motion.div
            key="verify-email"
            variants={fadeInScale}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <VerifyEmail openSignup={() => {
              router.push("/auth/welcome");
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Modal / Intro */}
      <AnimatePresence>
        {showRoleModal && (
          <motion.div
            key="intro-modal"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Intro openSignup={roleFunc} changeContentLogin={changeContentLogin}/>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}