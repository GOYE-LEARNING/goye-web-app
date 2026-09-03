// components/DashboardHeader.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { IoChevronDown, IoLanguage } from "react-icons/io5";
import { MdNotifications } from "react-icons/md";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import DashboardNotification from "./dashboard_notification";
import FeedbackModal from "./feedback_modal";
import { FaBell } from "react-icons/fa";
import { HiUserCircle } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/theme_provider";
import { FiMoon, FiSun } from "react-icons/fi";
import ToogleDarkMode from "./toogleDarkMode";
import { useSocket } from "@/app/context/SocketContext";
import { useAuthContext } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useI18n } from "@/app/context/I18nContext";
import {
  getUserProfile,
  getSessionState,
  getAuthTokens,
} from "@/app/utils/database/db";

// ── Role resolution ───────────────────────────────────────────
type ResolvedRole = {
  label: string;
};

function resolveRole(user: any, organization: any): ResolvedRole {
  // 1. Platform admin
  if (user?.role === "goye_admin" || user?.userType === "ADMIN") {
    const adminLabelMap: Record<string, string> = {
      super_admin: "Super Admin",
      content_admin: "Content Admin",
      user_admin: "User Admin",
    };
    return { label: adminLabelMap[user?.adminRole] ?? "Admin" };
  }

  // 2. Organisation owner
  const isOrgAdmin =
    user?.userType === "ORGANIZATION_OWNER" ||
    user?.role === "org_admin" ||
    user?.role === "org_owner" ||
    organization?.userType === "ORGANIZATION_OWNER";

  if (isOrgAdmin) {
    const rawOrgType =
      organization?.organization_type ??
      organization?.organizationType ??
      organization?.type ??
      "";
    const orgType = rawOrgType.toString().toUpperCase();

    const labelMap: Record<string, string> = {
      CHURCH: "Church Admin",
      SCHOOL: "School Admin",
      CLUB: "Club Admin",
    };

    return { label: labelMap[orgType] ?? "Organisation Admin" };
  }

  // 3. Invited member
  if (
    user?.userType === "INVITED_MEMBER" ||
    organization?.userType === "INVITED_MEMBER"
  ) {
    return { label: "Invited Member" };
  }

  // 4. Tutor
  if (user?.role === "instructor" || user?.role === "tutor") {
    return { label: "Tutor" };
  }

  // 5. Default
  return { label: "Student" };
}

// ── Loading Skeleton ──────────────────────────────────────────
function HeaderSkeleton() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full">
      <div className="backdrop-blur-md bg-white/30 dark:bg-gray-900/30 border-b border-white/20">
        <div className="md:px-8 md:py-2 py-[25px] px-[16px] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-[45px] h-[45px] rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
            <div className="flex flex-col gap-2">
              <div className="w-[100px] h-[10px] bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-[140px] h-[14px] bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-[35px] h-[35px] rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
            <div className="w-[35px] h-[35px] rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
            <div className="w-[35px] h-[35px] rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────
export default function DashboardHeader() {
  const { darkMode, setDarkMode } = useTheme();
  const { isConnected, unreadCount, connect } = useSocket();
  const { authStatus } = useAuthContext();
  const { openLanguageSelector } = useLanguage();
  const { t } = useI18n();

  const [showNotification, setShowNotification] = useState(false);
  const [showProfileBox, setShowProfileBox] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [getHours, setGetHours] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Auth state
  const [authUser, setAuthUser] = useState<any>(null);
  const [authOrg, setAuthOrg] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const router = useRouter();

  const profileBoxRef = useRef<HTMLDivElement | null>(null);
  const desktopNotificationBtnRef = useRef<HTMLButtonElement | null>(null);
  const mobileNotificationBtnRef = useRef<HTMLButtonElement | null>(null);
  const desktopNotificationRef = useRef<HTMLDivElement | null>(null);
  const mobileNotificationRef = useRef<HTMLDivElement | null>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL

  // ✅ Fetch organization profile from API
  const fetchOrganizationProfile = async () => {
    try {
      const tokens = await getAuthTokens();
      const orgId = localStorage.getItem("organizationId");

      if (!orgId || !tokens?.accessToken) {
        console.log("⚠️ No orgId or token found");
        return null;
      }

      console.log("🔄 Fetching organization profile for:", orgId);

      const response = await fetch(`${API_URL}/api/organizations/profile`, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const orgData = data.organization || data.data?.organization || data;
        console.log("✅ Organization profile fetched:", orgData);
        return orgData;
      } else {
        console.log(
          "❌ Failed to fetch organization profile:",
          response.status,
        );
        return null;
      }
    } catch (error) {
      console.error("❌ Error fetching organization profile:", error);
      return null;
    }
  };

  // ✅ Load auth data - PRIORITIZE ORGANIZATION
  const loadAuthData = async () => {
    try {
      console.log("🔄 DashboardHeader: Loading auth data...");

      // 1️⃣ First, try to get organization data from API
      const orgData = await fetchOrganizationProfile();

      if (orgData) {
        console.log("✅ Using organization data from API:", orgData);

        const orgId = orgData.id || orgData.organizationId;
        const orgName = orgData.organization_name || orgData.name;
        const orgEmail = orgData.organization_email || orgData.email;
        const orgImage = orgData.organization_image || orgData.image;
        const userType = orgData.userType || "ORGANIZATION_OWNER";

        // Build user data from organization
        const userData = {
          id: orgData.user?.id || orgData.userId || orgId,
          first_name: orgData.user?.first_name || orgName || "",
          last_name: orgData.user?.last_name || "",
          email_address: orgData.user?.email_address || orgEmail || "",
          role: "org_admin",
          userType: userType,
          organizationId: orgId,
          user_pic: orgData.user?.user_pic || orgImage || "",
        };

        const organizationData = {
          id: orgId,
          organization_name: orgName || "",
          organization_email: orgEmail || "",
          organization_image: orgImage || "",
          organization_type: orgData.organization_type || orgData.type || "",
          userType: userType,
        };

        // ✅ Save to localStorage for fallback
        if (orgId) localStorage.setItem("organizationId", orgId);
        if (orgName) localStorage.setItem("org_name", orgName);
        if (orgEmail) localStorage.setItem("org_email", orgEmail);
        if (userType) localStorage.setItem("userType", userType);

        setAuthUser(userData);
        setAuthOrg(organizationData);
        setIsAuthReady(true);
        setIsChecking(false);
        return;
      }

      // 2️⃣ Fallback: Try IndexedDB
      console.log("🔄 Fallback: Loading from IndexedDB...");
      const session = await getSessionState();
      const profile = await getUserProfile();

      if (session?.isAuthenticated && profile) {
        const orgId =
          profile.organizationId || localStorage.getItem("organizationId");
        const orgName =
          profile.organizationName || localStorage.getItem("org_name");
        const orgEmail =
          localStorage.getItem("org_email") || profile.email_address || "";
        const userType =
          profile.userType ||
          localStorage.getItem("userType") ||
          "ORGANIZATION_OWNER";
        const role =
          profile.role || localStorage.getItem("role") || "org_admin";

        const userData = {
          id: profile.userId || "",
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          email_address: profile.email_address || orgEmail,
          role: role,
          userType: userType,
          organizationId: orgId || undefined,
        };

        const organizationData = orgId
          ? {
              id: orgId,
              organization_name: orgName || "",
              organization_email: orgEmail,
              userType: userType,
            }
          : undefined;

        console.log("✅ Loaded from IndexedDB:", {
          userData,
          organizationData,
        });

        setAuthUser(userData);
        setAuthOrg(organizationData);
        setIsAuthReady(true);
        setIsChecking(false);
        return;
      }

      // 3️⃣ Last resort: localStorage only
      console.log("🔄 Last resort: Loading from localStorage...");
      const localOrgId = localStorage.getItem("organizationId");
      const localOrgName = localStorage.getItem("org_name");
      const localOrgEmail = localStorage.getItem("org_email");
      const localUserType =
        localStorage.getItem("userType") || "ORGANIZATION_OWNER";
      const localRole = localStorage.getItem("role") || "org_admin";

      if (localOrgId) {
        const userData = {
          id: localOrgId,
          first_name: localOrgName || "",
          last_name: "",
          email_address: localOrgEmail || "",
          role: localRole,
          userType: localUserType,
          organizationId: localOrgId,
        };

        const organizationData = {
          id: localOrgId,
          organization_name: localOrgName || "",
          organization_email: localOrgEmail || "",
          userType: localUserType,
        };

        console.log("✅ Loaded from localStorage:", {
          userData,
          organizationData,
        });

        setAuthUser(userData);
        setAuthOrg(organizationData);
        setIsAuthReady(true);
      }

      setIsChecking(false);
    } catch (error) {
      console.error("❌ DashboardHeader: Failed to load auth data:", error);
      setIsChecking(false);
    }
  };

  // ✅ Load auth data on mount
  useEffect(() => {
    loadAuthData();
  }, []);

  // ✅ Sync when authStatus changes from context
  useEffect(() => {
    if (authStatus && authStatus.user) {
      console.log("🔄 DashboardHeader: authStatus updated via context");

      // Only use context if we don't have better data
      if (!authUser || !authUser.email_address) {
        setAuthUser(authStatus.user);
        setAuthOrg(authStatus.organization);
        setIsAuthReady(true);
        setIsChecking(false);
      }
    }
  }, [authStatus]);

  // ── Use local state for display ──────────────────────────
  const user = authUser;
  const organization = authOrg;

  // ── Resolved display values ──────────────────────────────
  // ✅ PRIORITIZE ORGANIZATION DATA OVER USER DATA
  const userId = user?.id || organization?.id;

  // ✅ Display name: Organization name > User name
  const userDisplayName =
    organization?.organization_name || user?.first_name
      ? `${user?.first_name || ""} ${user?.last_name || ""}`.trim()
      : "User";

  // ✅ Email: Organization email > User email
  const userEmail =
    organization?.organization_email || user?.email_address || "";

  // ✅ Profile picture: Organization image > User picture
  const userPic = organization?.organization_image || user?.user_pic || "";

  const { label: displayRole } = resolveRole(user, organization);

  // 🔍 Debug final display values
  console.log("📊 DashboardHeader final display:", {
    user,
    organization,
    displayRole,
    userType: user?.userType,
    role: user?.role,
    userDisplayName,
    userEmail,
    userPic,
    isAuthReady,
    isChecking,
  });

  // ── Greeting ──────────────────────────────────────────────
  useEffect(() => {
    const h = new Date().getHours();
    setGetHours(
      h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening",
    );
    setIsLoading(false);
  }, []);

  // ── Socket reconnect on refresh ──────────────────────────
  useEffect(() => {
    if (userId) {
      const timer = setTimeout(() => {
        connect();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userId, connect]);

  // ── Outside click handler ────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;

      const clickedDesktopBtn = desktopNotificationBtnRef.current?.contains(t);
      const clickedMobileBtn = mobileNotificationBtnRef.current?.contains(t);
      const clickedDesktopPanel = desktopNotificationRef.current?.contains(t);
      const clickedMobilePanel = mobileNotificationRef.current?.contains(t);
      const clickedProfile = profileBoxRef.current?.contains(t);

      if (
        showNotification &&
        !clickedDesktopBtn &&
        !clickedMobileBtn &&
        !clickedDesktopPanel &&
        !clickedMobilePanel
      ) {
        setShowNotification(false);
      }

      if (showProfileBox && !clickedProfile) {
        setShowProfileBox(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotification, showProfileBox]);

  const toggleNotification = () => {
    setShowNotification((p) => !p);
    setShowProfileBox(false);
  };

  const toggleProfileBox = () => {
    setShowProfileBox((p) => !p);
    setShowNotification(false);
  };

  // ── Loading states ────────────────────────────────────────
  if (isChecking || !isAuthReady || !user) {
    console.log("⏳ DashboardHeader: Rendering skeleton", {
      isChecking,
      isAuthReady,
      hasUser: !!user,
    });
    return <HeaderSkeleton />;
  }

  if (isLoading) {
    return <HeaderSkeleton />;
  }

  // ── UI ────────────────────────────────────────────────────
  return (
    <>
      <div className="h-[73px] md:h-[73px]" />

      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300
          shadow-lg backdrop-blur-xl bg-white/80 dark:bg-secondaryColors-0/80
          border-b border-white/20`}
      >
        {/* ── DESKTOP ── */}
        <div className="hidden md:flex justify-end items-center gap-5 px-8 py-3 relative">
          <ToogleDarkMode toogleDarkMode={() => setDarkMode(!darkMode)} />

          <button
            onClick={openLanguageSelector}
            title="Change language"
            aria-label="Change language"
            className="text-gray-700 dark:text-gray-200 hover:text-primaryColors-0 transition-colors"
          >
            <IoLanguage size={22} />
          </button>

          <button
            onClick={() => setShowFeedback(true)}
            title="Send feedback"
            aria-label="Send feedback"
            className="text-gray-700 dark:text-gray-200 hover:text-primaryColors-0 transition-colors"
          >
            <HiOutlineChatAlt2 size={22} />
          </button>

          <div className="flex items-center justify-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-700 dark:text-gray-200">
              {isConnected ? t("Online") : t("Offline")}
            </span>
          </div>

          <div className="relative">
            <button
              ref={desktopNotificationBtnRef}
              onClick={toggleNotification}
              className="relative text-gray-700 dark:text-gray-200 hover:text-primaryColors-0 transition-colors"
            >
              <MdNotifications size={23} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            {showNotification && (
              <div
                ref={desktopNotificationRef}
                className="absolute right-0 top-12 z-[99999]"
              >
                <DashboardNotification
                  onClose={() => setShowNotification(false)}
                />
              </div>
            )}
          </div>

          <div ref={profileBoxRef} className="relative">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={toggleProfileBox}
            >
              <div className="w-[45px] h-[45px] rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ring-2 ring-transparent group-hover:ring-primaryColors-0 transition-all">
                {userPic ? (
                  <img
                    src={userPic}
                    className="w-full h-full object-cover"
                    alt="Profile"
                  />
                ) : (
                  <HiUserCircle size={45} className="text-gray-400" />
                )}
              </div>
              <IoChevronDown className="text-gray-600 dark:text-gray-300 text-sm group-hover:text-primaryColors-0 transition-colors" />
            </div>

            {showProfileBox && (
              <div className="absolute right-0 top-14 w-[240px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg rounded-xl p-3 z-[99999] border border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-gray-800 dark:text-white">
                  {userDisplayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-words">
                  {userEmail}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primaryColors-0/10 text-primaryColors-0">
                  {t(displayRole)}
                </span>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                  <button
                    onClick={() => router.push("/auth")}
                    className="text-xs text-red-500 hover:text-red-600 w-full text-left"
                  >
                    {t("Sign Out")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MOBILE ── */}
        <div className="md:hidden flex justify-between items-center px-[16px] py-[12px]">
          <div className="flex items-center gap-2">
            <div className="w-[45px] h-[45px] rounded-full overflow-hidden bg-gray-200 ring-2 ring-white/30">
              {userPic ? (
                <img
                  src={userPic}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              ) : (
                <HiUserCircle size={45} className="text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-[10px] text-white/70">{t(getHours)}</p>
              <p className="text-[16px] font-semibold text-white">
                {userDisplayName}
              </p>
              <p className="text-[10px] text-white/60">{t(displayRole)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            <button
              onClick={openLanguageSelector}
              title="Change language"
              aria-label="Change language"
              className="text-white hover:text-gray-200 transition-colors"
            >
              <IoLanguage size={18} />
            </button>

            <button
              onClick={() => setShowFeedback(true)}
              title="Send feedback"
              aria-label="Send feedback"
              className="text-white hover:text-gray-200 transition-colors"
            >
              <HiOutlineChatAlt2 size={18} />
            </button>

            <div className="relative">
              <button
                ref={mobileNotificationBtnRef}
                onClick={toggleNotification}
                className="relative text-white hover:text-gray-200 transition-colors"
              >
                <FaBell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotification && (
                <div
                  ref={mobileNotificationRef}
                  className="absolute right-0 top-10 z-[99999]"
                >
                  <DashboardNotification
                    onClose={() => setShowNotification(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </>
  );
}
