"use client";

import { useCallback, useEffect, useState } from "react";
import SubHeader from "../component/dashboard_subheader";
import { AnimatePresence, motion } from "framer-motion";
import { IoIosInformationCircle } from "react-icons/io";
import VerifyEmail from "./verify_email";
import DashboardProfileResetPassword from "../component/dashboard_profile_reset_password";
import DashboardProfileVerifyEmail from "../component/dashboard_profile_verify_email";

interface FormData {
  emailAddress: string;
}

interface Props {
  backFunction: () => void;
}

export default function DashboardChangePassword({ backFunction }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [mainContainer, setMainContainer] = useState<boolean>(true);
  const [showVerifyEmail, setShowVerifyEmail] = useState<boolean>(false);
  const [resetPassword, setResetPassword] = useState<boolean>(false);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [status, setStatus] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    emailAddress: "",
  });
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`${API_URL}/api/user/profile`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        setFormData((prev) => ({
          ...prev,
          emailAddress: data.user.email_address,
        }));

        setIsLoading(false)
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false)
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = (): boolean => {
    if (formData.emailAddress == null || formData.emailAddress == "") {
      return false;
    }

    return true;
  };

  const messageFunc = (message: string, status: number) => {
    setMessage(message);
    setShowMessage(true);
    setStatus(status);
    setTimeout(() => {
      setShowMessage(false);
      setStatus(null);
      setMessage("");
    }, 2000);
  };

  const openOtpContainer = useCallback(() => {
    setShowVerifyEmail(true);
    setMainContainer(false);
    setResetPassword(false);
  }, []);

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    if (validate()) {
      try {
        const res = await fetch(`${API_URL}/api/user/sendOtp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.emailAddress,
          }),
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          console.log("Error updating password");
          messageFunc("Error updating Password", 400);
          return;
        }

        setIsLoading(false);

        messageFunc("We just send an OTP to your gmail", 200);
        setFormData({
          emailAddress: "",
        });
        console.log(data);
        localStorage.setItem("otp-token", data.sessionToken);
        openOtpContainer();
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Define all password input fields
  const forms = [
    {
      label: "Email address",
      name: "email_address",
      key: "email" as const,
    },
  ];

  const createNewPassword = useCallback(() => {
    setShowVerifyEmail(false);
    setMainContainer(false);
    setResetPassword(true);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {showMessage && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeIn" }}
            exit={{ opacity: 0, y: -30 }}
            className="bg-green-500 text-white w-full px-3 py-6 flex justify-between items-center"
          >
            <p>{message}</p>
            <span>&times;</span>
          </motion.div>
        )}
      </AnimatePresence>
      {mainContainer && (
        <div>
          <SubHeader header="Verify Gmail" backFunction={backFunction} />
          <div className="dashboard_content_mainbox">
            <div className="flex items-center gap-2 my-3">
              <IoIosInformationCircle color="gold" size={20} />
              <p className="text-nearTextColors-0 text-[12px]">
                We will be sending you an OTP to this email
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
              noValidate
            >
              {forms.map((form, i) => (
                <div
                  key={i}
                  className="w-full h-[63px] border dark:border-[#ccc]/10 border-lightBoldText-0/10 py-[8px] px-[12px] flex items-center relative"
                >
                  <div className="flex flex-col w-full">
                    <label className="text-[#1F2937]/20 dark:text-white/50 text-[12px]">
                      {form.label}
                    </label>
                    <input
                      type="email"
                      name={form.name}
                      onChange={handleChange}
                      value={isLoading ? 'Loading...' : formData.emailAddress}
                      disabled={true}
                      className={`text-[#1F2937]/20 dark:text-white/50 text-[16px] font-[500] outline-none border-none bg-transparent`}
                      required
                    />
                  </div>
                </div>
              ))}

              <div className="">
                <div>
                  {isLoading == true ? (
                    <div className="form_more md:mt-0 opacity-70">
                      <div className="animate-spin h-[30px] w-[30px] border-[4px] border-r-[white] rounded-full bg-transparent"></div>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="form_more text-white bg-primaryColors-0 md:mt-0"
                    >
                      Send OTP
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {showVerifyEmail && (
        <DashboardProfileVerifyEmail
          openSignup={() => {}}
          openCreateNewPassword={createNewPassword}
          type="fg_password"
        />
      )}
      {resetPassword && <DashboardProfileResetPassword />}
    </>
  );
}
