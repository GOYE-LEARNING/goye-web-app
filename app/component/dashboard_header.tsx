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
import { useResizable } from "../context/resizeAbleContext";
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
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [details, setDetails] = useState<Details>({});
  const [getHours, setGetHours] = useState<string>("");
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const notificationButtonRef = useRef<HTMLDivElement | null>(null);
  const profileBoxRef = useRef<HTMLDivElement | null>(null);
  const [showProfileBox, setShowProfileBox] = useState<boolean>(false);
  const [user, setUser] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [formType, setFormType] = useState<string>("");
  const [org_name, setOrg_name] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const scrollRefs = useRef<HTMLDivElement | null>(null);
  const maxRetries = 3;
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("first_name");
    const savedOrgniazation = localStorage.getItem("organization_name");
    if (savedUser) {
      setUser(savedUser);
    } else if (savedOrgniazation) {
      setOrg_name(savedOrgniazation);
    }

    scrollRefs.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // Fetch profile with retry logic
    const fetchWithRetry = async (retryAttempt = 0) => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const role = localStorage.getItem("type");
      setType(role as any);

      try {
        if (retryAttempt > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, 500 * retryAttempt),
          );
        }

        const res = await fetch(
          role == "user" || role == "invited_user"
            ? `${API_URL}/api/user/profile`
            : `${API_URL}/api/organizations/profile`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          },
        );

        if (!res.ok) {
          if (res.status === 401 && retryAttempt < maxRetries) {
            console.log(
              `🔄 Retry ${retryAttempt + 1}/${maxRetries} for profile fetch...`,
            );
            await fetchWithRetry(retryAttempt + 1);
            return;
          }

          const err = await res.json().catch(() => ({}));
          console.error("Profile error", res.status, err);
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        console.log(data);
        setFormType(
          data?.user?.form_type ? data?.user?.form_type : "ORGANIZATION",
        );

        if (role == "user" || role == "invited_user") {
          const user_pic = data.user?.user_pic;
          setDetails({
            first_name: data.user?.first_name,
            last_name: data.user?.last_name,
            email: data.user?.email_address,
            user_pic: user_pic,
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

        setIsLoading(false);
        console.log("✅ Profile fetched successfully");
      } catch (error) {
        console.error("Fetch error:", error);
        if (retryAttempt < maxRetries) {
          console.log(
            `🔄 Retry ${retryAttempt + 1}/${maxRetries} due to error...`,
          );
          await fetchWithRetry(retryAttempt + 1);
        } else {
          setIsLoading(false);
        }
      }
    };

    setTimeout(() => {
      fetchWithRetry(0);
    }, 300);

    const hours = new Date().getHours();
    if (hours < 12) {
      setGetHours("Good morning");
    } else if (hours < 17) {
      setGetHours("Good afternoon");
    } else {
      setGetHours("Good evening");
    }

    // Click outside handler for both mobile and desktop
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      // Check for notification click outside
      if (showNotification) {
        // Check if click is inside notification panel or on the notification button
        const isClickInsideNotification =
          notificationRef.current?.contains(target);
        const isClickOnNotificationButton =
          notificationButtonRef.current?.contains(target);

        // Only close if click is outside both the notification panel AND the button
        if (!isClickInsideNotification && !isClickOnNotificationButton) {
          setShowNotification(false);
        }
      }

      // Check for profile box click outside
      if (showProfileBox) {
        const isClickInsideProfile = profileBoxRef.current?.contains(target);
        if (!isClickInsideProfile) {
          setShowProfileBox(false);
        }
      }
    };

    // Use a slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showNotification, showProfileBox]);

  const toggleNotification = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotification(!showNotification);
  };

  if (isLoading) {
    return (
      <div className="md:px-8 md:py-2 md:bg-lightSecondaryColor-0 py-[25px] px-[16px] md:h-auto bg-primaryColors-0 md:static sticky top-0 left-0 h-[10%] w-full flex md:block justify-between md:justify-end items-center">
        <div className="flex items-center gap-4">
          <div className="w-[50px] h-[50px] rounded-full bg-gray-300 animate-pulse"></div>
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
            <div className="h-6 w-32 bg-gray-300 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={scrollRefs}
        className=" md:px-8 md:py-2 dark:md:bg-secondaryColors-0/20 md:bg-white/50 border-b border-b-[#ccc]/20 md:backdrop-blur-md  py-[25px] px-[16px] md:h-auto bg-primaryColors-0 sticky top-0 left-0 h-[10%] z-[20] w-full flex md:block justify-between md:justify-end items-center"
      >
        <div className="md:flex justify-end items-center gap-5 hidden relative text-textSlightDark-0">
          <ToogleDarkMode toogleDarkMode={() => setDarkMode(!darkMode)} />
          <div className="dark:text-textSlightDark-0/90 text-lightBoldText-0/50 relative">
            <div
              ref={notificationButtonRef}
              onClick={toggleNotification}
              className="cursor-pointer"
            >
              <MdNotifications size={23} />
            </div>
            {showNotification && (
              <div ref={notificationRef} className="absolute right-0 z-50">
                <DashboardNotification
                  onClose={() => setShowNotification(false)}
                />
              </div>
            )}
          </div>
          <div
            className="dark:text-textSlightDark-0/90 text-lightBoldText-0/50 cursor-pointer"
            onClick={() => router.push("/dashboard/student/chat")}
          >
            <IoChatboxSharp size={23} />
          </div>
          <div className="h-[40px] w-[1px] bg-[#71748C]/25"></div>

          <div className="flex items-center gap-3 relative">
            <div
              ref={profileBoxRef as any}
              className={`flex justify-center gap-3 items-center ${
                showProfileBox == true
                  ? "absolute transition-all duration-150 drop-shadow-xl w-[auto] right-[8px] dark:bg-boldShadyColor-0 bg-white border dark:border-boldShadyColor-0 border-[#ccc]/20 text-textSlightDark-0 p-3 rounded-md top-6"
                  : ""
              }`}
            >
              <div
                className={`h-[45px] w-[45px] bg-[#71748C]/10 rounded-full overflow-hidden relative`}
              >
                {details.user_pic || details.organization_image ? (
                  <img
                    src={details.user_pic || details.organization_image}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    {type == "user" || type == "invited_user" ? (
                      <span className="font-semibold text-lg">
                        {details.first_name?.charAt(0)}
                        {details.last_name?.charAt(0)}
                      </span>
                    ) : (
                      <div className="font-bold text-lg">
                        {details.organization_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {showProfileBox && (
                <div>
                  <h1 className="font-semibold text-[0.9rem] dark:text-white text-lightBoldText-0">
                    {type == "user" || type == "invited_user" ? (
                      <span>
                        {details.first_name} {details.last_name}
                      </span>
                    ) : (
                      <div className="line-clamp-1">
                        {details.organization_name}
                      </div>
                    )}
                  </h1>
                  <span className="text-textGrey-0 text-[0.8rem]">
                    {type == "user" || type == "invited_user" ? (
                      <span>{details.email}</span>
                    ) : (
                      <span>{details.organization_email}</span>
                    )}
                  </span>
                </div>
              )}
            </div>
            <IoChevronDown
              onClick={() => setShowProfileBox(true)}
              className="cursor-pointer"
            />
          </div>
        </div>
        <div className="md:hidden flex items-center justify-between text-white w-full">
          <div className="flex items-center gap-4">
            <span className="w-[50px] h-[50px] rounded-full border-2 border-white overflow-hidden">
              {details.user_pic || details.organization_image ? (
                <img
                  src={details.user_pic || details.organization_image}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <HiUserCircle size={24} color="#666" />
                </div>
              )}
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="text-[12px]">{getHours}</h1>
              <p className="font-semibold text-[22px]">
                {formType == "INVITED" || formType == "INDIVIDUAL"
                  ? ""
                  : formType == "ORGANIZATION"
                    ? "Pst"
                    : ""}
                {type == "user" || type == "invited_user" ? (
                  user
                ) : (
                  <span>
                    {details.organization_administrator_firstname}{" "}
                    {details.organization_administrator_lastname}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="h-[34px] w-[34px] rounded-full bg-white/15 text-white flex items-center justify-center"
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>
            <div className="relative">
              <div onClick={toggleNotification} className="cursor-pointer">
                <FaBell />
              </div>
              {showNotification && (
                <div ref={notificationRef} className="absolute right-0 z-50">
                  <DashboardNotification
                    onClose={() => setShowNotification(false)}
                  />
                </div>
              )}
            </div>
            <div>
              <IoChatboxSharp size={23} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
