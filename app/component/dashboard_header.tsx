// components/DashboardHeader.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { IoChatboxSharp, IoChevronDown, IoLanguage } from "react-icons/io5";
import { MdNotifications } from "react-icons/md";
import DashboardNotification from "./dashboard_notification";
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

// ── Role resolution ───────────────────────────────────────────
// Priority order:
// 1. ADMIN
// 2. ORGANIZATION_OWNER (resolved by org type)
// 3. INVITED_MEMBER
// 4. Tutor (role field)
// 5. Student / INDIVIDUAL (default)

type ResolvedRole = {
  label: string;       // shown in the UI
  chatPath: string;    // where the chat icon routes
}

function resolveRole(user: any, organization: any): ResolvedRole {

  // 1. Platform admin (goye_admin). The DB userType for these accounts is
  // often INDIVIDUAL, so we key off the role + adminRole the profile
  // endpoint returns, not userType. Label reflects the specific admin tier.
  if (user?.role === "goye_admin" || user?.userType === "ADMIN") {
    const adminLabelMap: Record<string, string> = {
      super_admin: "Super Admin",
      content_admin: "Content Admin",
      user_admin: "User Admin",
    };
    return {
      label: adminLabelMap[user?.adminRole] ?? "Admin",
      chatPath: "/dashboard/super-admin",
    };
  }

  // 2. Organisation owner — label depends on org type
  if (user?.userType === "ORGANIZATION_OWNER" && organization) {
    const orgType = organization?.organization_type;

    const labelMap: Record<string, string> = {
      CHURCH: "Church Admin",
      SCHOOL: "School Admin",
      CLUB:   "Club Admin",
    };

    return {
      label: labelMap[orgType] ?? "Organisation Admin",
      chatPath: "/dashboard/organization/chat",
    };
  }

  // 3. Invited member — belongs to an org but is not the owner
  if (user?.userType === "INVITED_MEMBER") {
    return {
      label: "Invited Member",
      chatPath: "/dashboard/student/chat",
    };
  }

  // 4. Tutor — individual account with tutor role
  if (user?.role === "tutor") {
    return {
      label: "Tutor",
      chatPath: "/dashboard/tutor/chat",
    };
  }

  // 5. Default — student / individual
  return {
    label: "Student",
    chatPath: "/dashboard/student/chat",
  };
}

// ─────────────────────────────────────────────────────────────

export default function DashboardHeader() {
  const { darkMode, setDarkMode } = useTheme();
  const { isConnected, unreadCount, connect } = useSocket();
  const { authStatus } = useAuthContext();
  const { openLanguageSelector } = useLanguage();
  const { t } = useI18n();

  const [showNotification, setShowNotification] = useState(false);
  const [showProfileBox, setShowProfileBox]     = useState(false);
  const [getHours, setGetHours]                 = useState("");
  const [isLoading, setIsLoading]               = useState(true);

  const router = useRouter();

  const profileBoxRef              = useRef<HTMLDivElement | null>(null);
  const desktopNotificationBtnRef  = useRef<HTMLButtonElement | null>(null);
  const mobileNotificationBtnRef   = useRef<HTMLButtonElement | null>(null);
  const desktopNotificationRef     = useRef<HTMLDivElement | null>(null);
  const mobileNotificationRef      = useRef<HTMLDivElement | null>(null);

  const user         = authStatus?.user;
  const organization = authStatus?.organization;

  // ── Resolved display values ───────────────────────────────
  const userId          = user?.id;
  const userDisplayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : organization?.organization_name || "User";
  const userEmail = user?.email_address
    || organization?.organization_email
    || "";
  const userPic   = user?.user_pic
    || organization?.organization_image
    || "";

  const { label: displayRole, chatPath } = resolveRole(user, organization);

  // ── Greeting ──────────────────────────────────────────────
  useEffect(() => {
    const h = new Date().getHours();
    setGetHours(
      h < 12 ? "Good morning"
      : h < 17 ? "Good afternoon"
      : "Good evening"
    );
    setIsLoading(false);
  }, []);

  // ── Socket reconnect on refresh ───────────────────────────
  useEffect(() => {
    if (userId) {
      const timer = setTimeout(() => {
        connect();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userId, connect]);

  // ── Outside click handler ─────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;

      const clickedDesktopBtn   = desktopNotificationBtnRef.current?.contains(t);
      const clickedMobileBtn    = mobileNotificationBtnRef.current?.contains(t);
      const clickedDesktopPanel = desktopNotificationRef.current?.contains(t);
      const clickedMobilePanel  = mobileNotificationRef.current?.contains(t);
      const clickedProfile      = profileBoxRef.current?.contains(t);

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

  // ── Loading skeleton ──────────────────────────────────────
  if (isLoading) {
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

          {/* Language selector — globally reachable from any dashboard */}
          <button
            onClick={openLanguageSelector}
            title="Change language"
            aria-label="Change language"
            className="text-gray-700 dark:text-gray-200 hover:text-primaryColors-0 transition-colors"
          >
            <IoLanguage size={22} />
          </button>

          {/* Connection status */}
          <div className="flex items-center justify-center gap-1">
            <span className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`} />
            <span className="text-sm text-gray-700 dark:text-gray-200">
              {isConnected ? t("Online") : t("Offline")}
            </span>
          </div>

          {/* Notification */}
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
              <div ref={desktopNotificationRef} className="absolute right-0 top-12 z-[99999]">
                <DashboardNotification onClose={() => setShowNotification(false)} />
              </div>
            )}
          </div>

          {/* Chat — role-aware path */}
          <button
            onClick={() => router.push(chatPath)}
            className="text-gray-700 dark:text-gray-200 hover:text-primaryColors-0 transition-colors"
          >
            <IoChatboxSharp size={23} />
          </button>

          {/* Profile */}
          <div ref={profileBoxRef} className="relative">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={toggleProfileBox}
            >
              <div className="w-[45px] h-[45px] rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ring-2 ring-transparent group-hover:ring-primaryColors-0 transition-all">
                {userPic ? (
                  <img src={userPic} className="w-full h-full object-cover" alt="Profile" />
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
                {/* Role badge */}
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
                <img src={userPic} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <HiUserCircle size={45} className="text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-[10px] text-white/70">{t(getHours)}</p>
              <p className="text-[16px] font-semibold text-white">{userDisplayName}</p>
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

            {/* Language selector — globally reachable from any dashboard */}
            <button
              onClick={openLanguageSelector}
              title="Change language"
              aria-label="Change language"
              className="text-white hover:text-gray-200 transition-colors"
            >
              <IoLanguage size={18} />
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
                <div ref={mobileNotificationRef} className="absolute right-0 top-10 z-[99999]">
                  <DashboardNotification onClose={() => setShowNotification(false)} />
                </div>
              )}
            </div>

            {/* Chat — role-aware path */}
            <button
              onClick={() => router.push(chatPath)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <IoChatboxSharp size={18} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}