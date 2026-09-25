// src/context/AuthContext.tsx
"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { dispatchAPIError } from "@/app/hook/useAPIErrorHandler";
import { useI18n } from "@/app/context/I18nContext";
import {
  getUserProfile,
  clearUserProfile,
  saveUserProfile,
  getSessionState,
  updateSessionState,
  clearAllData,
  getOrCreateDeviceId,
  getAuthTokens,
  saveAuthTokens,
} from "@/app/utils/database/db";
import { isPublicRoute as isPublicRoutePath } from "@/app/utils/publicRoutes";
import { resolveRedirectPathFromProfile } from "@/app/utils/roleRedirect";

interface Props {
  children: React.ReactNode;
}

export interface AuthContextType {
  isExistingUser: boolean;
  isProfileComplete: boolean;
  requiresProfileCompletion: boolean;
  isLoading?: boolean;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email_address: string;
    role: string;
    user_pic?: string;
    type?: string;
    level?: string;
    organizationId?: string;
    userType?: string;
    organizationMemberships?: Array<{ organizationId: string }>;
  };
  organization?: {
    id: string;
    organization_name: string;
    organization_email: string;
    organization_image?: string;
    organization_type?: string;
    user?: {
      id: string;
      first_name: string;
      last_name: string;
      email_address: string;
    };
  };
}

interface AuthState {
  authStatus: AuthContextType;
  setAuthStatus: React.Dispatch<React.SetStateAction<AuthContextType>>;
  updateAuthStatus: (status: Partial<AuthContextType>) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  logout: () => Promise<void>;
  getDeviceId: () => Promise<string>;
  login: (userData: any, orgData?: any) => Promise<boolean>;
  // A read-only session probe for public pages (the landing page) — unlike
  // checkAuth()/runAuthCheck(), it never redirects on failure. A visitor
  // with no session is a normal, expected outcome here, not an error state.
  checkPublicSession: () => Promise<{ authenticated: boolean; redirectPath: string | null }>;
  // Set when an auth check failed because we couldn't reliably talk to the
  // server (network drop, timeout, 5xx) — as opposed to the server
  // explicitly saying the session is invalid. Callers should show this as
  // an error state with a retry option instead of bouncing to /auth: a
  // request that never got an answer is not proof the user is logged out.
  authError: string | null;
  clearAuthError: () => void;
  // Synchronous read of the same value, backed by a ref rather than state —
  // for callers that need the up-to-the-moment result right after awaiting
  // checkAuth()/refreshToken(), where the `authError` prop from this same
  // render would still be one render behind.
  getAuthError: () => string | null;
}

const AuthContext = React.createContext<AuthState | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AuthProvider({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { setLanguage, refreshFromBackend } = useI18n();
  // Any backend response that carries a real language/languageCode adopts it
  // into I18nContext right away — this is the "fetch the backend and
  // retrieve the language" step, run wherever a session gets resolved
  // (initial check, refresh, login) instead of trusting localStorage.
  const syncLanguageFromProfile = React.useCallback(
    (data: any) => {
      const code = data?.languageCode;
      if (code && code !== "unknown") {
        setLanguage(data?.language || code, code);
      }
    },
    [setLanguage],
  );
  const [authStatus, setAuthStatus] = React.useState<AuthContextType>({
    isExistingUser: false,
    isProfileComplete: false,
    requiresProfileCompletion: false,
    isLoading: true,
    user: undefined,
    organization: undefined,
  });

  const isInitializedRef = React.useRef(false);
  const isCheckingRef = React.useRef(false);
  const [authError, setAuthErrorState] = React.useState<string | null>(null);
  // Mirrors authError for synchronous reads within the same async chain —
  // the state setter's update isn't visible to a closure later in the same
  // function, but this ref is, which is what lets runAuthCheck tell "the
  // server rejected this" apart from "refreshToken never got an answer"
  // immediately after calling it.
  const authErrorRef = React.useRef<string | null>(null);
  const setAuthError = React.useCallback((message: string | null) => {
    authErrorRef.current = message;
    setAuthErrorState(message);
  }, []);
  const clearAuthError = React.useCallback(() => setAuthError(null), [setAuthError]);
  const getAuthError = React.useCallback(() => authErrorRef.current, []);

  const isPublicRoute = React.useCallback(() => {
    return isPublicRoutePath(pathname);
  }, [pathname]);

  const getDeviceId = React.useCallback(async (): Promise<string> => {
    return await getOrCreateDeviceId();
  }, []);

  const authHeaders = React.useCallback(async (): Promise<HeadersInit> => {
    const deviceId = await getOrCreateDeviceId();
    const tokens = await getAuthTokens();
    return {
      "Content-Type": "application/json",
      "X-Device-Id": deviceId,
      ...(tokens?.accessToken && {
        Authorization: `Bearer ${tokens.accessToken}`,
      }),
      ...(tokens?.refreshToken && { "x-refresh-token": tokens.refreshToken }),
    };
  }, []);

  const refreshToken = React.useCallback(async (): Promise<boolean> => {
    if (isPublicRoute()) return false;

    try {
      console.log("🔄 Attempting to refresh token...");

      const deviceId = await getOrCreateDeviceId();
      const tokens = await getAuthTokens();

      const response = await fetch(`${API_URL}/api/verify/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Id": deviceId,
          ...(tokens?.refreshToken && {
            "x-refresh-token": tokens.refreshToken,
          }),
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.accessToken) {
          await saveAuthTokens({ accessToken: data.accessToken });
        }

        console.log("✅ Token refresh successful");
        await updateSessionState({
          isAuthenticated: true,
          lastActivity: new Date().toISOString(),
        });
        setAuthError(null);
        return true;
      }

      console.log("❌ Token refresh failed with status:", response.status);

      // A 401/403 here is the server explicitly saying the refresh token is
      // gone, expired, or revoked — that's a real "you are logged out."
      // Anything else (5xx, a proxy timeout page, etc.) is the server
      // failing to answer the question, not answering "no" — treat that as
      // an error to retry, not as proof the session is invalid.
      if (response.status !== 401 && response.status !== 403) {
        setAuthError(
          "We're having trouble reaching the server. Please try again.",
        );
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // The request itself never completed — offline, DNS, CORS, backend
      // down. Same reasoning as a 5xx above: not evidence of a bad session.
      setAuthError(
        "We couldn't reach the server. Check your connection and try again.",
      );
      return false;
    }
  }, [isPublicRoute]);

  const getUserType = React.useCallback(async (): Promise<string> => {
    const profile = await getUserProfile();
    const type = profile?.userType || "";
    const role = profile?.role || "";

    if (type === "admin" || role === "goye_admin") return "admin";
    if (
      type === "organization" ||
      type === "invited_user" ||
      role === "org_admin"
    )
      return "organization";
    return "individual";
  }, []);

  // Read-only session probe for public pages: tries the individual-user
  // profile endpoint, then the organization one, and never redirects or
  // mutates auth state — a visitor with no session at all is the normal
  // case here, not a failure to recover from.
  const checkPublicSession = React.useCallback(async (): Promise<{
    authenticated: boolean;
    redirectPath: string | null;
  }> => {
    try {
      const headers = await authHeaders();

      const userRes = await fetch(`${API_URL}/api/user/profile`, {
        credentials: "include",
        headers,
      });
      if (userRes.ok) {
        const data = await userRes.json();
        const userData = data.user;
        return {
          authenticated: true,
          redirectPath: resolveRedirectPathFromProfile(userData),
        };
      }

      const orgRes = await fetch(`${API_URL}/api/organizations/profile`, {
        credentials: "include",
        headers,
      });
      if (orgRes.ok) {
        const data = await orgRes.json();
        const orgData = data.organization || data.data?.organization || data;
        const pseudoUser = {
          role: "org_admin",
          userType: orgData?.userType || "ORGANIZATION_OWNER",
        };
        return {
          authenticated: true,
          redirectPath: resolveRedirectPathFromProfile(pseudoUser, orgData),
        };
      }

      return { authenticated: false, redirectPath: null };
    } catch (error) {
      console.error("Public session check failed:", error);
      return { authenticated: false, redirectPath: null };
    }
  }, [authHeaders]);

  const runAuthCheck = React.useCallback(async (): Promise<boolean> => {
    // Start clean so a stale error from a previous, now-resolved check
    // doesn't stick around and keep showing an error screen.
    setAuthError(null);

    const session = await getSessionState();
    if (!session?.isAuthenticated) {
      setAuthStatus({
        isExistingUser: false,
        isProfileComplete: false,
        requiresProfileCompletion: false,
        isLoading: false,
        user: undefined,
        organization: undefined,
      });
      if (!isPublicRoute()) {
        router.push("/auth");
      }
      return false;
    }

    const userType = await getUserType();

    // Admin
    if (userType === "admin") {
      const profile = await getUserProfile();
      setAuthStatus({
        isExistingUser: true,
        isProfileComplete: true,
        requiresProfileCompletion: false,
        isLoading: false,
        user: {
          id: profile?.userId || "",
          first_name: profile?.first_name || "",
          last_name: profile?.last_name || "",
          email_address: profile?.email_address || "",
          role: localStorage.getItem("role") || "goye_admin",
          type: "admin",
        } as any,
        organization: undefined,
      });
      return true;
    }

    // Individual
    if (userType === "individual") {
      try {
        const headers = await authHeaders();
        const response = await fetch(`${API_URL}/api/user/profile`, {
          credentials: "include",
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          const userData = data.user;

          await saveUserProfile({
            userId: userData?.id,
            first_name: userData?.first_name,
            last_name: userData?.last_name,
            email_address: userData?.email_address,
            userType: "user",
            role: userData?.role || "student",
          });

          setAuthStatus({
            isExistingUser: true,
            isProfileComplete: userData?.isProfileComplete || false,
            requiresProfileCompletion: !userData?.isProfileComplete,
            isLoading: false,
            user: userData,
            organization: undefined,
          });
          syncLanguageFromProfile(userData);
          return true;
        }

        if (response.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            const retryHeaders = await authHeaders();
            const retryResponse = await fetch(`${API_URL}/api/user/profile`, {
              credentials: "include",
              headers: retryHeaders,
            });

            if (retryResponse.ok) {
              const data = await retryResponse.json();
              const userData = data.user;

              await saveUserProfile({
                userId: userData?.id,
                first_name: userData?.first_name,
                last_name: userData?.last_name,
                email_address: userData?.email_address,
                userType: "user",
                role: userData?.role || "student",
              });

              setAuthStatus({
                isExistingUser: true,
                isProfileComplete: userData?.isProfileComplete || false,
                requiresProfileCompletion: !userData?.isProfileComplete,
                isLoading: false,
                user: userData,
                organization: undefined,
              });
              syncLanguageFromProfile(userData);
              return true;
            }
          }

          // refreshToken() itself already distinguished "server said no"
          // from "couldn't reach the server" and set authError accordingly.
          // If it's set, this isn't a confirmed logout — surface the error
          // instead of falling through to a full sign-out below.
          if (authErrorRef.current) {
            setAuthStatus((prev) => ({ ...prev, isLoading: false }));
            return false;
          }
          // Otherwise the refresh was explicitly rejected — genuinely logged out.
        } else {
          // Non-401 failure (5xx, etc.) from a server that did answer — not
          // proof the session is bad, just proof something's wrong right now.
          setAuthError(
            "We're having trouble reaching the server. Please try again.",
          );
          setAuthStatus((prev) => ({ ...prev, isLoading: false }));
          return false;
        }
      } catch (error) {
        console.error("Profile check failed:", error);
        setAuthError(
          "We couldn't reach the server. Check your connection and try again.",
        );
        setAuthStatus((prev) => ({ ...prev, isLoading: false }));
        return false;
      }
    }

    // Organization
    if (userType === "organization") {
      try {
      const headers = await authHeaders();
      const response = await fetch(`${API_URL}/api/organizations/profile`, {
        credentials: "include",
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        const orgData = data.organization || data.data?.organization || data;

        console.log("✅ Organization profile fetched:", orgData);

        const orgId = orgData.id || orgData.organizationId;
        const orgName = orgData.organization_name || orgData.name;

        if (orgId) {
          localStorage.setItem("organizationId", orgId);
        }
        if (orgName) {
          localStorage.setItem("org_name", orgName);
        }

        await saveUserProfile({
          userId: orgData?.user?.id || orgData?.userId,
          first_name: orgData?.organization_name || orgName || "",
          last_name: "",
          email_address: orgData?.organization_email || orgData?.email || "",
          userType: orgData?.userType || "ORGANIZATION_OWNER", // ✅ ADD THIS
          role: orgData?.organization_role || "org_admin",
          organizationId: orgId,
        });

        // ✅ Build user data from organization with userType
        const userData = {
          id: orgData?.user?.id || orgData?.userId,
          first_name:
            orgData?.user?.first_name || orgData?.organization_name || "",
          last_name: orgData?.user?.last_name || "",
          email_address:
            orgData?.user?.email_address || orgData?.organization_email || "",
          role: "org_admin",
          organizationId: orgId,
          userType: orgData?.userType || "ORGANIZATION_OWNER", // ✅ ADD THIS
        };

        setAuthStatus({
          isExistingUser: true,
          isProfileComplete: true,
          requiresProfileCompletion: false,
          isLoading: false,
          user: userData,
          organization: orgData,
        });
        return true;
      }

      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const retryHeaders = await authHeaders();
          const retryResponse = await fetch(
            `${API_URL}/api/organizations/profile`,
            {
              credentials: "include",
              headers: retryHeaders,
            },
          );

          if (retryResponse.ok) {
            const data = await retryResponse.json();
            const orgData =
              data.organization || data.data?.organization || data;

            const orgId = orgData.id || orgData.organizationId;
            const orgName = orgData.organization_name || orgData.name;

            if (orgId) {
              localStorage.setItem("organizationId", orgId);
            }
            if (orgName) {
              localStorage.setItem("org_name", orgName);
            }

            await saveUserProfile({
              userId: orgData?.user?.id || orgData?.userId,
              first_name: orgData?.organization_name || orgName || "",
              last_name: "",
              email_address:
                orgData?.organization_email || orgData?.email || "",
              userType: "organization",
              role: orgData?.organization_role || "org_admin",
              organizationId: orgId,
            });

            const userData = {
              id: orgData?.user?.id || orgData?.userId,
              first_name:
                orgData?.user?.first_name || orgData?.organization_name || "",
              last_name: orgData?.user?.last_name || "",
              email_address:
                orgData?.user?.email_address ||
                orgData?.organization_email ||
                "",
              role: "org_admin",
              organizationId: orgId,
            };

            setAuthStatus({
              isExistingUser: true,
              isProfileComplete: true,
              requiresProfileCompletion: false,
              isLoading: false,
              user: userData,
              organization: orgData,
            });
            return true;
          }
        }

        // Same reasoning as the individual branch: only fall through to a
        // full sign-out when refreshToken() explicitly rejected the
        // session, not when it merely failed to get an answer.
        if (authErrorRef.current) {
          setAuthStatus((prev) => ({ ...prev, isLoading: false }));
          return false;
        }
      } else {
        setAuthError(
          "We're having trouble reaching the server. Please try again.",
        );
        setAuthStatus((prev) => ({ ...prev, isLoading: false }));
        return false;
      }
      } catch (error) {
        console.error("Organization profile check failed:", error);
        setAuthError(
          "We couldn't reach the server. Check your connection and try again.",
        );
        setAuthStatus((prev) => ({ ...prev, isLoading: false }));
        return false;
      }
    }

    // Auth failed
    await clearAllData();
    setAuthStatus({
      isExistingUser: false,
      isProfileComplete: false,
      requiresProfileCompletion: false,
      isLoading: false,
      user: undefined,
      organization: undefined,
    });
    if (!isPublicRoute()) {
      router.push("/auth");
    }
    return false;
  }, [isPublicRoute, getUserType, router, authHeaders, refreshToken, syncLanguageFromProfile]);

  const checkAuth = React.useCallback(async (): Promise<boolean> => {
    if (isPublicRoute()) {
      setAuthStatus((prev) => ({ ...prev, isLoading: false }));
      return false;
    }

    if (isCheckingRef.current) {
      return authStatus.isExistingUser;
    }

    isCheckingRef.current = true;
    setAuthStatus((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await runAuthCheck();
      isCheckingRef.current = false;
      return result;
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthStatus((prev) => ({ ...prev, isLoading: false }));
      isCheckingRef.current = false;
      return false;
    }
  }, [isPublicRoute, runAuthCheck, authStatus.isExistingUser]);

  const login = React.useCallback(
    async (userData: any, orgData?: any): Promise<boolean> => {
      try {
        // ✅ Extract organization ID from userData if available
        const orgId =
          userData?.organizationId || orgData?.id || orgData?.organizationId;

        // Only assume an organisation user type when there is actually an
        // organisation. This used to default to "ORGANIZATION_OWNER"
        // unconditionally, so every student and tutor whose login response
        // carried no userType was written into the local profile as an
        // organisation owner — and since the profile is what the header reads,
        // they were then shown as an org admin for the rest of the session.
        userData.userType =
          userData.userType || userData.type || (orgId ? "ORGANIZATION_OWNER" : "");
        const orgName =
          userData?.organizationName ||
          orgData?.organization_name ||
          orgData?.name;

        if (orgId) {
          localStorage.setItem("organizationId", orgId);
          console.log("✅ Stored organizationId:", orgId);
        }
        if (orgName) {
          localStorage.setItem("org_name", orgName);
          console.log("✅ Stored org_name:", orgName);
        }

        if (userData) {
          await saveUserProfile({
            userId: userData.id,
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            email_address: userData.email_address || userData.email || "",
            // Both of these previously defaulted to organisation values for
            // every account. This profile is the record the header trusts, so
            // an invented role here is not a display quirk — it is the wrong
            // answer stored on the device until the next sign-in.
            userType: userData.userType || userData.type || "",
            role: userData.role || (orgId ? "org_admin" : ""),
            organizationId: orgId || null,
            level: userData.level,
            adminRole: userData.adminRole,
            organizationName: orgName || null,
          });
        } else if (orgData) {
          await saveUserProfile({
            userId: orgData.userId || orgData.id,
            first_name: orgData.organization_name || "",
            last_name: "",
            email_address: orgData.organization_email || "",
            userType: "organization",
            role: orgData.organization_role || "admin",
            organizationId: orgData.id,
            organizationName: orgData.organization_name,
            isProfileComplete: true,
          });
        }

        await updateSessionState({
          isAuthenticated: true,
          lastActivity: new Date().toISOString(),
        });

        // ✅ Build organization data for auth status
        const organizationData = orgData || {
          id: orgId,
          organization_name: orgName,
          organization_email: userData?.email || "",
        };

        // Carry userType through to auth status, without inventing one for an
        // account that has no organisation.
        const userWithType = {
          ...userData,
          userType:
            userData?.userType ||
            userData?.type ||
            (orgId ? "ORGANIZATION_OWNER" : ""),
        };

        setAuthStatus({
          isExistingUser: true,
          isProfileComplete:
            userData?.isProfileComplete !== undefined
              ? userData.isProfileComplete
              : true,
          requiresProfileCompletion: userData?.isProfileComplete === false,
          isLoading: false,
          user: userWithType, // ✅ Use the user with explicit userType
          organization: organizationData,
        });

        console.log(
          "✅ Login successful, auth status updated with userType:",
          userWithType.userType,
        );
        console.log("✅ Auth status user:", userWithType);

        // Login responses don't reliably carry language/languageCode, so
        // rather than guess at their shape, ask the backend directly for
        // the account's stored language right after a session exists.
        void refreshFromBackend();
        return true;
      } catch (error) {
        console.error("Login error:", error);
        return false;
      }
    },
    [refreshFromBackend],
  );
  React.useEffect(() => {
    if (isPublicRoute()) {
      setAuthStatus((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const timer = setTimeout(() => {
      checkAuth();
    }, 300);

    return () => clearTimeout(timer);
  }, [isPublicRoute, checkAuth]);

  const logout = React.useCallback(async (): Promise<void> => {
    try {
      const headers = await authHeaders();
      await fetch(`${API_URL}/api/user/logout`, {
        method: "POST",
        credentials: "include",
        headers,
      });

      await clearAllData();

      // ✅ Clear localStorage items
      //
      // Every key that identifies the person who was signed in, not just the
      // four that were listed here. `userType` and `org_email` were being left
      // behind, and components read them as fallbacks — so the next account to
      // sign in on this device picked up the previous one's organisation email
      // and user type.
      [
        "organizationId",
        "org_name",
        "org_email",
        "role",
        "userId",
        "userType",
      ].forEach((key) => localStorage.removeItem(key));

      setAuthStatus({
        isExistingUser: false,
        isProfileComplete: false,
        requiresProfileCompletion: false,
        isLoading: false,
        user: undefined,
        organization: undefined,
      });

      router.push("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      await clearAllData();
      router.push("/auth");
    }
  }, [router, authHeaders]);

  const updateAuthStatus = React.useCallback(
    (status: Partial<AuthContextType>) => {
      setAuthStatus((prev) => ({ ...prev, ...status, isLoading: false }));
    },
    [],
  );

  const clearAuth = React.useCallback(() => {
    setAuthStatus({
      isExistingUser: false,
      isProfileComplete: false,
      requiresProfileCompletion: false,
      isLoading: false,
      user: undefined,
      organization: undefined,
    });
  }, []);

  const contextValue: AuthState = {
    authStatus,
    setAuthStatus,
    updateAuthStatus,
    clearAuth,
    checkAuth,
    refreshToken,
    logout,
    getDeviceId,
    login,
    checkPublicSession,
    authError,
    clearAuthError,
    getAuthError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
