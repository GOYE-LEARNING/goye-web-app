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
  const { login, authStatus } = useAuthContext();
  const [formData, setFormData] = useState<formData>({
    email: "",
    password: "",
  });
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [showForgotPasswordPage, setForgotPasswordPage] =
    useState<boolean>(false);
  const [showLoginPage, setShowLoginPage] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginTimeout, setLoginTimeout] = useState<boolean>(false);

  const { loading: googleLoading, error: googleError } =
    useGoogleSignupButton();

  const isProcessingGoogleRef = useRef(false);
  const loginTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (googleLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [googleLoading]);

  useEffect(() => {
    if (googleError) {
      setError(true);
      setMessage(googleError);
      setShowMessage(true);
      setIsLoading(false);
      isProcessingGoogleRef.current = false;
    }
  }, [googleError]);

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
    setForgotPasswordPage(true);
    setShowLoginPage(false);
  };

  const showLoginFunc = () => {
    setForgotPasswordPage(false);
    setShowLoginPage(true);
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://goye-platform-backend.onrender.com";
  const { setOrganizationId } = useOrganizationContext();
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // ✅ FIXED: Use ORGANIZATION ID, not name
  function getProfilePath(role?: string | null, orgId?: string | null) {
    if (role === "student") {
      return "/dashboard/student";
    } else if (role === "instructor" || role === "tutor") {
      return "/dashboard/tutor";
    } else if (role === "invited_user") {
      return `/dashboard/${orgId}/organization`;
    } else if (role === "org_admin") {
      return `/dashboard/${orgId}/admin`; // ✅ Use ID, not name
    }
    return "/dashboard";
  }

  // ✅ Helper to decode JWT
  function decodeJWT(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  }

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

    loginTimeoutRef.current = setTimeout(() => {
      setLoginTimeout(true);
      setError(true);
      setMessage("Login is taking too long. Please check your internet connection and try again.");
      setShowMessage(true);
      setIsLoading(false);
    }, 15000);

    try {
      const deviceId = await getOrCreateDeviceId();

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

      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }

      const data = await res.json();
      const responseData = data.data || data;
      console.log("Login response:", responseData);

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

      // ✅ Save tokens
      if (responseData.accessToken || responseData.refreshToken) {
        await saveAuthTokens({
          accessToken: responseData.accessToken,
          refreshToken: responseData.refreshToken,
        });
      }

      // ✅ Extract user data from JWT token
      let userData = null;
      let orgData = null;
      let organizationId = null;

      // ✅ Decode the JWT to get user info
      if (responseData.accessToken) {
        const decoded = decodeJWT(responseData.accessToken);
        console.log("=== DECODED JWT ===");
        console.log("Full decoded:", decoded);
        console.log("Organization ID:", decoded.organizationId);
        console.log("===================");
        
        if (decoded) {
          const fullName = decoded.full_name || '';
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          // ✅ Store organization ID from JWT
          organizationId = decoded.organizationId;

          userData = {
            id: decoded.userId || decoded.id,
            email: decoded.email,
            first_name: firstName,
            last_name: lastName,
            role: decoded.role || 'org_admin',
            organizationId: decoded.organizationId,
            organizationName: responseData.organization?.organization_name || '',
            isProfileComplete: true,
          };
          
          console.log("Built user data from JWT:", userData);
        }
      }

      // ✅ If organization data is available, use it
      if (responseData.organization) {
        orgData = responseData.organization;
        const orgId = orgData.id || orgData.organizationId;
        if (orgId) {
          organizationId = orgId;
          setOrganizationId(orgId);
        }
        if (userData && orgData.organization_name) {
          userData.organizationName = orgData.organization_name;
        }
      }

      // ✅ If we still don't have user data, try to use organization data
      if (!userData && responseData.organization) {
        const org = responseData.organization;
        organizationId = org.id || org.organizationId;
        userData = {
          id: org.id || org.organizationId,
          email: org.organization_email || formData.email,
          first_name: org.organization_name || '',
          last_name: '',
          role: 'org_admin',
          organizationId: organizationId,
          organizationName: org.organization_name || '',
          isProfileComplete: true,
        };
        console.log("Built user data from organization:", userData);
      }

      // ✅ If still no user data, show error
      if (!userData) {
        console.error("No user data could be extracted from response:", responseData);
        setError(true);
        setMessage("Could not extract user data from login response. Please contact support.");
        setShowMessage(true);
        setIsLoading(false);
        return;
      }

      // ✅ Save to localStorage - use ID for organizationId
      if (organizationId) {
        localStorage.setItem('organizationId', organizationId);
      }
      if (userData.role) {
        localStorage.setItem('role', userData.role);
      }
      if (userData.organizationName) {
        localStorage.setItem('org_name', userData.organizationName);
      }
      if (userData.id) {
        localStorage.setItem('userId', userData.id);
      }

      console.log("✅ Stored organizationId:", organizationId);
      console.log("✅ Stored org_name:", userData.organizationName);

      // ✅ Login the user
      const loginSuccess = await login(userData, orgData);

      if (!loginSuccess) {
        setError(true);
        setMessage("Failed to save session. Please try again.");
        setShowMessage(true);
        setIsLoading(false);
        return;
      }

      // ✅ Handle profile completion
      const isProfileComplete = userData.isProfileComplete !== false;
      if (!isProfileComplete && setRequireProfileCompletion) {
        setRequireProfileCompletion(true);
        setIsLoading(false);
        sessionStorage.setItem('profileCompletionData', JSON.stringify({
          firstname: userData.first_name || '',
          lastname: userData.last_name || '',
          email: userData.email || '',
        }));
        changeContentSignin();
        return;
      }

      // ✅ FIXED: Redirect using ORGANIZATION ID
      const role = userData.role || localStorage.getItem('role');
      const orgId = organizationId || localStorage.getItem('organizationId');
      const profilePath = getProfilePath(role, orgId); // ← Pass ID, not name
      
      console.log("✅ Redirecting to:", profilePath);
      console.log("✅ User role:", role);
      console.log("✅ Organization ID:", orgId);
      
      setTimeout(() => {
        router.replace(profilePath);
      }, 100);
      
      setIsLoading(false);

    } catch (error: any) {
      console.error("Login error:", error);
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
      setIsLoading(false);
    }
  };

  // ✅ Handle Google auth - also use ID
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

    if (status && !status.isProfileComplete) {
      console.log("Profile incomplete, showing signup form");
      if (setRequireProfileCompletion) {
        setRequireProfileCompletion(true);
      }
      
      if (userData) {
        sessionStorage.setItem('profileCompletionData', JSON.stringify({
          firstname: userData.first_name || '',
          lastname: userData.last_name || '',
          email: userData.email || '',
        }));
        
        if (userData.role) {
          localStorage.setItem('role', userData.role);
        }
        if (userData.organizationName) {
          localStorage.setItem('org_name', userData.organizationName);
        }
        if (userData.organizationId) {
          localStorage.setItem('organizationId', userData.organizationId);
        }
      }
      
      changeContentSignin();
      isProcessingGoogleRef.current = false;
      return;
    }

    if (userData) {
      const success = await login(userData, null);
      if (success) {
        if (userData.organizationId) {
          setOrganizationId(userData.organizationId);
          localStorage.setItem('organizationId', userData.organizationId);
        }
        
        if (userData.role) {
          localStorage.setItem('role', userData.role);
        }
        if (userData.organizationName) {
          localStorage.setItem('org_name', userData.organizationName);
        }
        
        // ✅ Use ID, not name
        const role = userData.role || localStorage.getItem('role');
        const orgId = userData.organizationId || localStorage.getItem('organizationId');
        const profilePath = getProfilePath(role, orgId);
        
        setTimeout(() => {
          router.replace(profilePath);
        }, 100);
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

  // Show AuthLoader when loading
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