// app/hooks/useLogin.ts
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveUserProfile,
  updateSessionState,
  broadcastLogin,
  getOrCreateDeviceId,
   saveAuthTokens,
} from "@/app/utils/database/db";
import { useAuthContext } from "../context/AuthContext";

interface LoginCredentials {
  email: string;
  password: string;
}

export function useLogin() {
  const router = useRouter();
  const { updateAuthStatus } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://goye-platform-backend.onrender.com";
      const deviceId = await getOrCreateDeviceId();

      const response = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Id": deviceId,
        },
        body: JSON.stringify({
          ...credentials,
          deviceId: deviceId,
        }),
        credentials: "include",
      });

      const data = await response.json();
      const responseData = data.data || data;

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid email or password. Please try again.");
        } else if (response.status === 429) {
          throw new Error("Too many login attempts. Please try again later.");
        } else {
          throw new Error(responseData.message || "Login failed");
        }
      }

      if (responseData.accessToken || responseData.refreshToken) {
  await saveAuthTokens({
    accessToken: responseData.accessToken,
    refreshToken: responseData.refreshToken,
  });
}

      // Process user data
      let userProfileData: any = null;

      if (responseData.user) {
        const userData = responseData.user;
        userProfileData = {
          userId: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email_address: userData.email_address || userData.email,
          userType: userData.type || userData.userType || "user",
          role: userData.role || "student",
          organizationId:
            userData.organizationId || userData.organization_id || null,
        };

        // Save to Dexie
        await saveUserProfile(userProfileData);
        await updateSessionState({
          isAuthenticated: true,
          lastActivity: new Date().toISOString(),
        });

        // Broadcast to other tabs
        await broadcastLogin(userProfileData);

        // Update AuthContext
        updateAuthStatus({
          isExistingUser: true,
          isProfileComplete: userData.isProfileComplete || false,
          requiresProfileCompletion: !userData.isProfileComplete,
          isLoading: false,
          user: userData,
        });

        // Store non-sensitive data
        localStorage.setItem("type", userData.type || "user");
        localStorage.setItem("role", userData.role || "student");
        if (userData.organizationId) {
          localStorage.setItem("organization_id", userData.organizationId);
        }
      } else if (responseData.organization) {
        // Organization login
        const orgData = responseData.organization;
        userProfileData = {
          userId: orgData.id || orgData.userId,
          first_name: orgData.organization_name,
          last_name: "",
          email_address: orgData.organization_email,
          userType: "organization",
          role: orgData.organization_role || "admin",
          organizationId: orgData.id,
        };

        await saveUserProfile(userProfileData);
        await updateSessionState({
          isAuthenticated: true,
          lastActivity: new Date().toISOString(),
        });

        await broadcastLogin(userProfileData);

        updateAuthStatus({
          isExistingUser: true,
          isProfileComplete: true,
          requiresProfileCompletion: false,
          isLoading: false,
          organization: orgData,
        });

        localStorage.setItem("type", "organization");
        localStorage.setItem("organization_id", orgData.id);
        localStorage.setItem("organization_name", orgData.organization_name);
      }

      // Redirect based on user type
      const userType = userProfileData?.userType || "user";
      const role = userProfileData?.role || "student";

      if (userType === "organization") {
        router.push("/organization/dashboard");
      } else if (userType === "ADMIN" || role === "goye_admin") {
        router.push("/dashboard/super-admin");
      } else if (userType === "INVITED_USER" || userType === "INVITED_MEMBER") {
        router.push("/invited/dashboard");
      } else if (role === "instructor" || role === "tutor") {
        router.push("/instructor/dashboard");
      } else {
        router.push("/dashboard/user");
      }

      return { success: true, data: responseData };
    } catch (error: any) {
      setError(error.message || "An error occurred during login");
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}
