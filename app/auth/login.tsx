"use client";

import { useRouter } from "next/navigation";
import React, { SetStateAction, useState, useEffect, useRef } from "react";
import AuthLoader from "./auth_loader";
import { FaArrowRight } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import ForgotPassword from "./forgot_password";
import Message from "../component/message";
import { FaCheck } from "react-icons/fa6";
import { useOrganizationContext } from "@/app/component/organization_component/organanization_context";
import GoogleSignInButton from "../component/google_btn";
import useGoogleSignupButton from "../hook/useGoogleSignupButton";

interface formData {
  email: string;
  password: string;
}

interface Props {
  setRequireProfileCompletion?: React.Dispatch<SetStateAction<boolean>>;
  changeContentSignin: () => void;
}

export default function Login({
  setRequireProfileCompletion,
  changeContentSignin,
}: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<formData>({
    email: "",
    password: "",
  });
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [showForgotPasswordPage, setForgotPassowrdPage] =
    useState<boolean>(false);
  const [showLoginPage, setShowLoginPage] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginTimeout, setLoginTimeout] = useState<boolean>(false);

  // Get Google sign-in hook
  const {
    signInWithGoogle,
    loading: googleLoading,
    error: googleError,
  } = useGoogleSignupButton();

  // Add a ref to track if we're already processing Google auth
  const isProcessingGoogleRef = useRef(false);
  const loginTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Google loading state
  useEffect(() => {
    if (googleLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [googleLoading]);

  // Handle Google errors
  useEffect(() => {
    if (googleError) {
      setError(true);
      setMessage(googleError);
      setShowMessage(true);
      setIsLoading(false);
      isProcessingGoogleRef.current = false;
    }
  }, [googleError]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const showForgotPage = () => {
    setForgotPassowrdPage(true);
    setShowLoginPage(false);
  };

  const showLoginFunc = () => {
    setForgotPassowrdPage(false);
    setShowLoginPage(true);
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { setOrganizationId } = useOrganizationContext();
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);
    setShowMessage(false);
    setLoginTimeout(false);

    // Set timeout for login (15 seconds)
    loginTimeoutRef.current = setTimeout(() => {
      setLoginTimeout(true);
      setError(true);
      setMessage(
        "Login is taking too long. Please check your internet connection and try again.",
      );
      setShowMessage(true);
      setIsLoading(false);
    }, 15000);

    try {
      const res = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      // Clear timeout since we got a response
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }

      const data = await res.json();
      const responseData = data.data || data;

      if (!res.ok) {
        // Handle specific error codes
        if (res.status === 401) {
          setMessage("Invalid email or password. Please try again.");
        } else if (res.status === 429) {
          setMessage("Too many login attempts. Please try again later.");
        } else {
          setMessage(responseData.message || "Login failed");
        }
        setError(true);
        setShowMessage(true);
        setIsLoading(false);
        return;
      }

      if (responseData.user) {
        const userData = responseData.user;
        const userType = userData.type;

        localStorage.setItem("user_id", userData.id);
        localStorage.setItem("first_name", userData.first_name);
        localStorage.setItem("last_name", userData.last_name);
        localStorage.setItem("role", userData.role);

        if (userType === "ADMIN") {
          localStorage.setItem("type", "admin");
        } else if (userType === "INVITED_USER") {
          localStorage.setItem("type", "invited_user");
          if (userData.organizationId) {
            localStorage.setItem("organization_id", userData.organizationId);
            setOrganizationId(userData.organizationId);
          }
        } else {
          localStorage.setItem("type", "user");
        }
      } else if (responseData.organization) {
        console.log(responseData.organization);
        localStorage.setItem("type", "organization");
        localStorage.setItem("organization_id", responseData.organization.id);
        localStorage.setItem(
          "organization_name",
          responseData.organization.organization_name,
        );
        localStorage.setItem(
          "organization_email",
          responseData.organization.organization_email,
        );
        if (responseData.organization.organization_role) {
          localStorage.setItem(
            "role",
            responseData.organization.organization_role,
          );
        }
        if (responseData.organization.id) {
          setOrganizationId(responseData.organization.id);
        }
      }

      router.push("/loading");
    } catch (error: any) {
      // Clear timeout on error
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }

      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setMessage("Network error. Please check your internet connection.");
      } else {
        setMessage(error.message || "An error occurred during login");
      }
      setError(true);
      setShowMessage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (data: any) => {
    // Prevent duplicate calls
    if (isProcessingGoogleRef.current) {
      console.log("Already processing Google auth, ignoring duplicate call");
      return;
    }

    isProcessingGoogleRef.current = true;

    console.log("Google auth success:", data);

    const { userData, status } = data;

    // Save user data to localStorage
    if (userData) {
      localStorage.setItem("user_id", userData.id);
      localStorage.setItem("first_name", userData.first_name || "");
      localStorage.setItem("last_name", userData.last_name || "");
      localStorage.setItem("role", userData.role || "student");
      localStorage.setItem("type", userData.type || "user");
      localStorage.setItem(
        "isProfileComplete",
        String(status?.isProfileComplete || false),
      );

      if (userData.organizationId) {
        localStorage.setItem("organization_id", userData.organizationId);
        setOrganizationId(userData.organizationId);
      }

      if (userData.user_pic) {
        localStorage.setItem("user_pic", userData.user_pic);
      }

      if (userData.level) {
        localStorage.setItem("level", userData.level);
      }

      console.log("✅ Saved user data to localStorage");
    }

    // Clear any existing redirect timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    // ✅ CRITICAL: Wait for cookies to be fully set before redirecting
    // Give the backend time to set cookies properly
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Determine next step - let the GoogleSignInButton handle the redirect
    // Only handle profile completion here
    if (status && !status.isProfileComplete) {
      console.log("Profile incomplete, showing signup form");
      if (setRequireProfileCompletion) {
        setRequireProfileCompletion(true);
      }
      changeContentSignin();
    }
    // For complete profiles, the GoogleSignInButton will handle the redirect

    setTimeout(() => {
      isProcessingGoogleRef.current = false;
    }, 2000);
  };

  const handleGoogleNewUser = (data: any) => {
    console.log("New Google user - showing signup form");
    if (setRequireProfileCompletion) {
      setRequireProfileCompletion(true);
    }
    changeContentSignin();
  };

  const handleGoogleExistingUser = (data: any) => {
    console.log("Existing Google user");
    // The GoogleSignInButton will handle redirect
    // Just clear any processing flag if needed
    setTimeout(() => {
      isProcessingGoogleRef.current = false;
    }, 500);
  };

  const handleGoogleError = (error: string) => {
    console.error("Google auth error:", error);
    setError(true);
    setMessage(error);
    setShowMessage(true);
    setIsLoading(false);
    isProcessingGoogleRef.current = false;
  };

  const loginComponent = [
    {
      id: 1,
      label: "Email address",
      type: "email",
      name: "email",
      value: formData["email"] as string,
      handlechange: handleChange,
    },
    {
      id: 2,
      label: "Password",
      type: !showPassword ? "password" : "text",
      name: "password",
      value: formData["password"] as string,
      handlechange: handleChange,
      iconChange: !showPassword ? <IoMdEye /> : <IoMdEyeOff />,
    },
  ];

  // Show AuthLoader when loading (including Google auth)
  if (isLoading || googleLoading) {
    return <AuthLoader />;
  }

  return (
    <div className="md:p-[60px] p-[15px]">
      {showMessage && (
        <Message
          icon={error ? <span>&times;</span> : <FaCheck color="white" />}
          color={error ? "#DA0E29" : "#007E50"}
          message={message}
          width={100}
        />
      )}
      {loginTimeout && (
        <Message
          icon={<span>⚠️</span>}
          color="#F59E0B"
          message="Login is taking longer than expected. Please check your connection."
          width={100}
        />
      )}
      {showLoginPage && (
        <div className="form_container z-20">
          <h1 className="form_h1">Login</h1>
          <p className="form-p">Enter your details below to sign in</p>
          <form
            method="POST"
            onSubmit={handleSubmit}
            noValidate
            className="form"
          >
            {loginComponent.map((form) => (
              <div key={form.id} className="form_label">
                <input
                  type={form.type}
                  name={form.name}
                  value={form.value}
                  onChange={handleChange}
                  placeholder=" "
                  required
                  className="form_input peer focus:outline-none"
                />
                <label
                  htmlFor={form.name}
                  className={`absolute left-[12px] label peer-focus:text-[14px] peer-focus:top-[10px] transition-all duration-300 ease-in-out md:peer-placeholder-shown:top-[18px] peer-placeholder-shown:top-[19.8px] peer-placeholder-shown:text-[16px] ${
                    form.value
                      ? "top-[2px] text-[14px]"
                      : "top-[15px] text-[16px]"
                  }`}
                >
                  {form.label}
                </label>

                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowPassword(!showPassword);
                  }}
                  className="cursor-pointer absolute right-[17px] top-[22px] flex justify-center items-center"
                >
                  {form.iconChange}
                </div>
              </div>
            ))}
            <span className="form_link" onClick={showForgotPage}>
              Forgot Password ?
            </span>
            <button type="submit" className="form_btn mt-[2rem] md:mt-0">
              Login <FaArrowRight size={13} />
            </button>
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onNewUser={handleGoogleNewUser}
              onExistingUser={handleGoogleExistingUser}
              onError={handleGoogleError}
              requireProfileCompletion={setRequireProfileCompletion}
            />

            <div className="flex items-center gap-2 md:hidden">
              <p className="text-textGrey-0">Don't have an account?</p>
              <span
                className="text-primaryColors-0 font-semibold cursor-pointer"
                onClick={() => {
                  changeContentSignin();
                }}
              >
                Sign up
              </span>
            </div>
          </form>
        </div>
      )}
      {showForgotPasswordPage && (
        <ForgotPassword showLoginPage={showLoginFunc} />
      )}
    </div>
  );
}
