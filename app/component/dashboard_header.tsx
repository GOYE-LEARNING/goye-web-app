"use client";

import { useEffect, useRef, useState } from "react";
import { IoChatboxSharp, IoChevronDown } from "react-icons/io5";
import { MdNotifications } from "react-icons/md";
import DashboardNotification from "./dashboard_notification";
import { FaBell, FaRocket } from "react-icons/fa";
import { HiUserCircle } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/theme_provider";
import { FiMoon, FiSun } from "react-icons/fi";
import ToogleDarkMode from "./toogleDarkMode";
import { dispatchAPIError } from "@/app/hook/useAPIErrorHandler";

interface Details {
  first_name?: string;
  last_name?: string;
  email?: string;
  user_pic?: string;
  organization_name?: string;
  organization_email?: string;
  organization_image?: string;
  organization_administrator_firstname?: string;
  organization_administrator_lastname?: string;
}

export default function DashboardHeader() {
  const { darkMode, setDarkMode } = useTheme();

  const [showNotification, setShowNotification] = useState(false);
  const [showProfileBox, setShowProfileBox] = useState(false);

  const [details, setDetails] = useState<Details>({});
  const [getHours, setGetHours] = useState("");
  const [user, setUser] = useState("");
  const [type, setType] = useState("");
  const [formType, setFormType] = useState("");
  const [org_name, setOrg_name] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const router = useRouter();

  const scrollRefs = useRef<HTMLDivElement | null>(null);
  const profileBoxRef = useRef<HTMLDivElement | null>(null);

  const desktopNotificationBtnRef = useRef<HTMLButtonElement | null>(null);
  const mobileNotificationBtnRef = useRef<HTMLButtonElement | null>(null);

  const desktopNotificationRef = useRef<HTMLDivElement | null>(null);
  const mobileNotificationRef = useRef<HTMLDivElement | null>(null);

  // ================= SCROLL EFFECT =================
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ================= PROFILE FETCH =================
  useEffect(() => {
    const savedUser = localStorage.getItem("first_name");
    const savedOrg = localStorage.getItem("organization_name");

    if (savedUser) setUser(savedUser);
    else if (savedOrg) setOrg_name(savedOrg);

    const h = new Date().getHours();
    setGetHours(
      h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening",
    );

    const fetchProfile = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      const role = localStorage.getItem("type") || localStorage.getItem("role");

      const normalized = role?.toLowerCase();
      setType(role || "");

      const isUser = normalized === "user" || normalized === "invited_user";

      const endpoint = isUser
        ? `${API_URL}/api/user/profile`
        : `${API_URL}/api/organizations/profile`;

      try {
        const res = await fetch(endpoint, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 429) {
            dispatchAPIError({
              status: 429,
              message: "Too many requests, please slow down and try again later.",
              retryAfter: 5,
              endpoint: endpoint.split("/api")[1] || "unknown"
            });
          } else {
            console.error(`API Error: ${res.status}`);
          }
          return;
        }

        const data = await res.json();

        setFormType(data?.user?.form_type || "ORGANIZATION");
        console.log(data);
        if (isUser) {
          setDetails({
            first_name: data.user?.first_name,
            last_name: data.user?.last_name,
            email: data.user?.email_address,
            user_pic: data.user?.user_pic,
          });
        } else {
          setDetails({
            organization_name: data.organization?.organization_name,
            organization_email: data.organization?.organization_email,
            organization_image: data.organization?.organization_image,
            organization_administrator_firstname:
              data.organization?.user?.first_name,
            organization_administrator_lastname:
              data.organization?.user?.last_name,
          });
        }
      } catch (error: any) {
        if (error?.status === 429) {
          dispatchAPIError({
            status: 429,
            message: "Too many requests, please slow down and try again later.",
            retryAfter: 5,
            endpoint: endpoint.split("/api")[1] || "unknown"
          });
        } else {
          console.error("Error fetching profile:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ================= OUTSIDE CLICK FIX =================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;

      const clickedDesktopBtn = desktopNotificationBtnRef.current?.contains(t);
      const clickedMobileBtn = mobileNotificationBtnRef.current?.contains(t);

      const clickedDesktopPanel = desktopNotificationRef.current?.contains(t);
      const clickedMobilePanel = mobileNotificationRef.current?.contains(t);

      const clickedProfile = profileBoxRef.current?.contains(t);

      const clickedNotification = clickedDesktopPanel || clickedMobilePanel;

      if (
        showNotification &&
        !clickedDesktopBtn &&
        !clickedMobileBtn &&
        !clickedNotification
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

  // ================= LOADING SKELETON =================
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

  // ================= UI =================
  return (
    <>
      {/* Spacer to prevent content from going under the fixed header */}
      <div className="h-[73px] md:h-[73px]" />
      
      <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "shadow-lg backdrop-blur-xl bg-white/80 dark:bg-secondaryColors-0/80" 
          : "backdrop-blur-md bg-white/30 dark:bg-gray-900/30"
      } border-b border-white/20`}>
        {/* ================= DESKTOP ================= */}
        <div className="hidden md:flex justify-end items-center gap-5 px-8 py-3 relative">
          <ToogleDarkMode toogleDarkMode={() => setDarkMode(!darkMode)} />

          {/* NOTIFICATION */}
          <div className="relative">
            <button
              ref={desktopNotificationBtnRef}
              onClick={toggleNotification}
              className="text-gray-700 dark:text-gray-200 hover:text-primaryColors-0 transition-colors"
            >
              <MdNotifications size={23} />
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

          <button 
            onClick={() => router.push("/dashboard/student/chat")}
            className="text-gray-700 dark:text-gray-200 hover:text-primaryColors-0 transition-colors"
          >
            <IoChatboxSharp size={23} />
          </button>

          {/* PROFILE */}
          <div ref={profileBoxRef} className="relative">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setShowProfileBox((p) => !p)}
            >
              <div className="w-[45px] h-[45px] rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ring-2 ring-transparent group-hover:ring-primaryColors-0 transition-all">
                {details.user_pic || details.organization_image ? (
                  <img
                    src={details.user_pic || details.organization_image}
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
                  {details.first_name
                    ? `${details.first_name} ${details.last_name}`
                    : details.organization_name || details.organization_administrator_firstname}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-words">
                  {details.email || details.organization_email}
                </p>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                  <button
                    onClick={() => {
                      localStorage.clear();
                      router.push("/");
                    }}
                    className="text-xs text-red-500 hover:text-red-600 w-full text-left"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="md:hidden flex justify-between items-center px-[16px] py-[12px]">
          <div className="flex items-center gap-2">
            <div className="w-[45px] h-[45px] rounded-full overflow-hidden bg-gray-200 ring-2 ring-white/30">
              {details.user_pic || details.organization_image ? (
                <img
                  src={details.user_pic || details.organization_image}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              ) : (
                <HiUserCircle size={45} className="text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-[10px] text-white/70">{getHours}</p>
              <p className="text-[16px] font-semibold text-white">
                {user || details.organization_administrator_firstname || "User"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">


            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            <div className="relative">
              <button 
                ref={mobileNotificationBtnRef} 
                onClick={toggleNotification}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaBell size={18} />
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

            <button 
              onClick={() => router.push("/dashboard/student/chat")}
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