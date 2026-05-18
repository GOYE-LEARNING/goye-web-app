"use client";

import { useEffect, useRef, useState } from "react";
import { IoChatboxSharp, IoChevronDown } from "react-icons/io5";
import { MdNotifications } from "react-icons/md";
import DashboardNotification from "./dashboard_notification";
import { FaBell } from "react-icons/fa";
import { HiUserCircle } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/theme_provider";
import { FiMoon, FiSun } from "react-icons/fi";
import ToogleDarkMode from "./toogleDarkMode";

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

  const router = useRouter();

  const scrollRefs = useRef<HTMLDivElement | null>(null);
  const profileBoxRef = useRef<HTMLDivElement | null>(null);

  const desktopNotificationBtnRef = useRef<HTMLButtonElement | null>(null);
  const mobileNotificationBtnRef = useRef<HTMLButtonElement | null>(null);

  const desktopNotificationRef = useRef<HTMLDivElement | null>(null);
  const mobileNotificationRef = useRef<HTMLDivElement | null>(null);

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

  // ================= LOADING (MATCH YOUR UI) =================
  if (isLoading) {
    return (
      <div className="md:px-8 md:py-2 py-[25px] px-[16px] bg-primaryColors-0 md:bg-white/50 dark:md:bg-secondaryColors-0 border-b border-b-[#ccc]/20 flex justify-between items-center sticky top-0 z-[9999]">
        {/* left skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-[45px] h-[45px] rounded-full bg-gray-300 animate-pulse" />

          <div className="flex flex-col gap-2">
            <div className="w-[100px] h-[10px] bg-gray-300 rounded animate-pulse" />
            <div className="w-[140px] h-[14px] bg-gray-300 rounded animate-pulse" />
          </div>
        </div>

        {/* right skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-[35px] h-[35px] rounded-full bg-gray-300 animate-pulse" />
          <div className="w-[35px] h-[35px] rounded-full bg-gray-300 animate-pulse" />
          <div className="w-[35px] h-[35px] rounded-full bg-gray-300 animate-pulse" />
        </div>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div ref={scrollRefs} className="w-full sticky top-0 z-[9999] bg-primaryColors-0 md:bg-white/50 dark:md:bg-secondaryColors-0 border-b border-b-[#ccc]/20 ">
      {/* ================= DESKTOP ================= */}
      <div className="hidden md:flex justify-end items-center gap-5 px-8 py-3 relative">
        <ToogleDarkMode toogleDarkMode={() => setDarkMode(!darkMode)} />

        {/* NOTIFICATION */}
        <div className="relative">
          <button
            ref={desktopNotificationBtnRef}
            onClick={toggleNotification}
            className="text-textSlightDark-0/90"
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

        <button onClick={() => router.push("/dashboard/student/chat")}>
          <IoChatboxSharp size={23} />
        </button>

        {/* PROFILE */}
        <div ref={profileBoxRef} className="relative">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setShowProfileBox((p) => !p)}
          >
            <div className="w-[45px] h-[45px] rounded-full overflow-hidden bg-gray-200">
              {details.user_pic || details.organization_image ? (
                <img
                  src={details.user_pic || details.organization_image}
                  className="w-full h-full object-cover"
                />
              ) : (
                <HiUserCircle size={35} />
              )}
            </div>

            <IoChevronDown />
          </div>

          {showProfileBox && (
            <div className="absolute right-0 top-12 w-[220px] bg-white dark:bg-[#1f1f1f] shadow-lg rounded-md p-3 z-[99999]">
              <p className="font-semibold">
                {details.first_name
                  ? `${details.first_name} ${details.last_name}`
                  : details.organization_name}
              </p>
              <p className="text-xs text-gray-500">
                {details.email || details.organization_email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="md:hidden flex justify-between items-center px-[16px] py-[20px] bg-primaryColors-0 text-white">
        <div>
          <p className="text-[12px]">{getHours}</p>
          <p className="text-[20px] font-semibold">
            {user || details.organization_administrator_firstname}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>

          <button ref={mobileNotificationBtnRef} onClick={toggleNotification}>
            <FaBell size={20} />
          </button>

          {showNotification && (
            <div
              ref={mobileNotificationRef}
              className="absolute right-3 top-16 z-[99999]"
            >
              <DashboardNotification
                onClose={() => setShowNotification(false)}
              />
            </div>
          )}

          <button onClick={() => router.push("/dashboard/student/chat")}>
            <IoChatboxSharp size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
