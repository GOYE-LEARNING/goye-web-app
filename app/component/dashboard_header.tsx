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

  // 2. Invited member — checked BEFORE the owner test.
  //
  // The owner test used to accept `organization.userType ===
  // "ORGANIZATION_OWNER"`, which describes the organisation record rather than
  // this person's relationship to it. An invited member of a church therefore
  // matched the owner branch and was shown as "Church Admin".
  if (user?.userType === "INVITED_MEMBER") {
    return { label: "Invited Member" };
  }

  // 3. Organisation owner. Decided only from the signed-in user.
  const isOrgAdmin =
    user?.userType === "ORGANIZATION_OWNER" ||
    user?.role === "org_admin" ||
    user?.role === "org_owner";

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

  // 4. Tutor
  if (user?.role === "instructor" || user?.role === "tutor") {
    return { label: "Tutor" };
  }

  // 5. Default. Reached when the role is absent or unrecognised, so it has to
  // be the least-privileged label — guessing upwards tells someone they are an
  // admin when nothing said so.
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
  const { authStatus, logout } = useAuthContext();
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
  const fetchOrganizationProfile = async (orgIdFromProfile?: string | null) => {
    try {
      const tokens = await getAuthTokens();
      // Takes the id from the signed-in profile. It used to read
      // localStorage.organizationId, which outlives a sign-out and so could
      // belong to a completely different account.
      const orgId = orgIdFromProfile;

      if (!orgId || !tokens?.accessToken) {
        return null;
      }

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

  /**
   * Loads who is signed in, for the header only.
   *
   * The signed-in profile is the source of truth for identity and role, and
   * organisation data only decorates an account that actually belongs to one.
   * This used to work the other way round — it fetched the organisation first
   * and, whenever that returned anything, hardcoded `role: "org_admin"`. Three
   * consequences, all of which showed the wrong person in the header:
   *
   *  - The organisation lookup keys off `localStorage.organizationId`, which
   *    survives a sign-out. Signing out of an org account and back in as a
   *    student re-fetched the *previous* account's organisation and rendered
   *    its name, email and logo over the student's own.
   *  - Both fallback branches defaulted to `userType: "ORGANIZATION_OWNER"`
   *    and `role: "org_admin"`, so any user whose stored profile simply had no
   *    role — a normal state right after signup — was labelled an
   *    organisation admin.
   *  - The last branch only ran `if (localOrgId)`, so a student with no
   *    organisation never set `isAuthReady` and sat on the skeleton forever.
   */
  const loadAuthData = async () => {
    try {
      const session = await getSessionState();
      const profile = await getUserProfile();

      if (!session?.isAuthenticated || !profile) {
        setIsChecking(false);
        return;
      }

      const userData = {
        id: profile.userId || "",
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email_address: profile.email_address || "",
        // No invented defaults. An absent role means "not an org account",
        // which resolveRole reads as Student — the safe, least-privileged
        // label — rather than promoting them to admin in the UI.
        role: profile.role || "",
        userType: profile.userType || "",
        adminRole: profile.adminRole,
        organizationId: profile.organizationId || undefined,
      };

      setAuthUser(userData);
      setIsAuthReady(true);
      setIsChecking(false);

      // Only an account that genuinely belongs to an organisation gets the
      // organisation lookup. Keyed off this session's profile, never off a
      // localStorage value left behind by a previous one.
      const belongsToOrg =
        !!profile.organizationId ||
        profile.userType === "ORGANIZATION_OWNER" ||
        profile.userType === "INVITED_MEMBER" ||
        profile.role === "org_admin" ||
        profile.role === "org_owner";

      if (!belongsToOrg) {
        setAuthOrg(null);
        return;
      }

      const orgData = await fetchOrganizationProfile(profile.organizationId);
      if (!orgData) return;

      const orgId = orgData.id || orgData.organizationId || profile.organizationId;
      setAuthOrg({
        id: orgId,
        organization_name: orgData.organization_name || orgData.name || "",
        organization_email: orgData.organization_email || orgData.email || "",
        organization_image: orgData.organization_image || orgData.image || "",
        organization_type: orgData.organization_type || orgData.type || "",
        userType: orgData.userType || profile.userType || "",
      });

      // Keep the user's own name and picture; fill in only what the profile
      // is missing. Overwriting first_name with the organisation's name is
      // what made the header greet a person by their church's name.
      setAuthUser((prev: any) => ({
        ...prev,
        organizationId: orgId,
        user_pic: prev?.user_pic || orgData.user?.user_pic || "",
      }));
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

  const { label: displayRole } = resolveRole(user, organization);

  // The header identifies the signed-in *person*. It previously read:
  //
  //   organization?.organization_name || user?.first_name
  //     ? `${first} ${last}`.trim()
  //     : "User"
  //
  // which groups as `(orgName || firstName) ? "<first last>" : "User"` — the
  // organisation name is only ever tested, never displayed, and an org account
  // whose user record had no first_name rendered an empty string rather than
  // falling back to "User".
  const personName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
  const userDisplayName = personName || organization?.organization_name || "User";

  // The person's own email and picture. The organisation's are a fallback for
  // an org account that has none of its own, not an override — showing the
  // church's address where the member's should be is the same bug in a
  // different field.
  const userEmail =
    user?.email_address || organization?.organization_email || "";
  const userPic = user?.user_pic || organization?.organization_image || "";

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
                  {/*
                    Calls the real logout. This used to be a bare
                    router.push("/auth"), which navigated away while leaving
                    the session, the cached profile and the stored
                    organizationId / org_name / role exactly where they were.
                    The next person to sign in on the device inherited them —
                    the most likely way a header ends up showing someone
                    else's organisation and role.
                  */}
                  <button
                    onClick={() => {
                      setShowProfileBox(false);
                      void logout();
                    }}
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
