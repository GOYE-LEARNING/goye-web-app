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
import TranslatedText from "../hook/translateText";
import { useAuthContext } from "../context/AuthContext";
import { getOrCreateDeviceId, saveAuthTokens } from "../utils/database/db";
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
  const { login } = useAuthContext();
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
  const { loading: googleLoading, error: googleError } =
    useGoogleSignupButton();

  // Refs for cleanup
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

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://goye-platform-backend.onrender.com";
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
      const deviceId = await getOrCreateDeviceId(); // add this above, or reuse if already in scope

      const res = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Id": deviceId,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          deviceId: deviceId,
        }),
        credentials: "include",
      });

      // Clear timeout since we got a response
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }

      const data = await res.json();
      const responseData = data.data || data;
      console.log("Login response:", data);

      if (!res.ok) {
        if (res.status === 401) {
          setMessage("Invalid email or password. Please try again.");
        } else if (res.status === 429) {
          setMessage("Too many login attempts. Please try again later.");
        } else if (res.status === 403) {
          setMessage("Your account has been locked. Please contact support.");
        } else {
          setMessage(responseData.message || "Login failed");
        }
        setError(true);
        setShowMessage(true);
        setIsLoading(false);
        return;
      }

      if (responseData.accessToken || responseData.refreshToken) {
  await saveAuthTokens({
    accessToken: responseData.accessToken,
    refreshToken: responseData.refreshToken,
  });
}

      // Process user data - NO localStorage, just Dexie
      let userData = null;
      let orgData = null;

      if (responseData.user) {
        userData = responseData.user;
        // Store organization ID in context if needed
        if (userData.organizationId) {
          setOrganizationId(userData.organizationId);
        }
        // Check if profile is complete
        const isProfileComplete = userData.isProfileComplete || false;
        if (!isProfileComplete && setRequireProfileCompletion) {
          setRequireProfileCompletion(true);
          changeContentSignin();
          setIsLoading(false);
          return;
        }
      } else if (responseData.organization) {
        orgData = responseData.organization;
        if (orgData.id) {
          setOrganizationId(orgData.id);
        }
      }

      // Call login from AuthContext - this handles Dexie storage
      const success = await login(userData, orgData);

      if (success) {
        // Redirect to loading page
        router.push("/loading");
      } else {
        setError(true);
        setMessage("Failed to save session. Please try again.");
        setShowMessage(true);
        setIsLoading(false);
      }
    } catch (error: any) {
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }

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

  // Handle Google auth - NO localStorage
  const handleGoogleSuccess = async (data: any) => {
    if (isProcessingGoogleRef.current) {
      console.log("Already processing Google auth, ignoring duplicate call");
      return;
    }

    isProcessingGoogleRef.current = true;
    console.log("Google auth success:", data);

    const { userData, status } = data;
 if (data.accessToken || data.refreshToken) {
    await saveAuthTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check if profile needs completion
    if (status && !status.isProfileComplete) {
      console.log("Profile incomplete, showing signup form");
      if (setRequireProfileCompletion) {
        setRequireProfileCompletion(true);
      }
      changeContentSignin();
      isProcessingGoogleRef.current = false;
      return;
    }

    // Call login from AuthContext
    if (userData) {
      const success = await login(userData, null);
      if (success) {
        // Store organization ID in context if needed
        if (userData.organizationId) {
          setOrganizationId(userData.organizationId);
        }
        router.push("/loading");
      } else {
        setError(true);
        setMessage("Failed to save session. Please try again.");
        setShowMessage(true);
      }
    }

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
          <h1>
            <TranslatedText text="Log in" className="form_h1" />
          </h1>
          <p>
            <TranslatedText
              text="Enter your details below to sign in"
              className="form-p"
            />
          </p>
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
                  <TranslatedText text={form.label} />
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
              <TranslatedText text="Forgot Password ?" />
            </span>
            <button type="submit" className="form_btn mt-[2rem] md:mt-0">
              <TranslatedText text="Login" /> <FaArrowRight size={13} />
            </button>
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onNewUser={handleGoogleNewUser}
              onExistingUser={handleGoogleExistingUser}
              onError={handleGoogleError}
              requireProfileCompletion={setRequireProfileCompletion}
            />

            <div className="flex items-center gap-2 md:hidden">
              <p className="text-textGrey-0">
                <TranslatedText text="Don't have an account?" />
              </p>
              <span
                className="text-primaryColors-0 font-semibold cursor-pointer"
                onClick={() => {
                  changeContentSignin();
                }}
              >
                <TranslatedText text="Sign Up" />
              </span>
            </div>
          </form>
        </div>
      )}
      {showForgotPasswordPage && (
        <ForgotPassword
          showLoginPage={showLoginFunc}
          onForgotPasswordSuccess={(email: any) => {
            setMessage(`Password reset link sent to ${email}`);
            setError(false);
            setShowMessage(true);
          }}
        />
      )}
    </div>
  );
}
