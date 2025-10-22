"use client";
import DashboardChangeLanguage from "@/app/component/dashboard_change_language";
import DashboardChangePassword from "@/app/component/dashboard_change_password";
import DashboardEditProfile from "@/app/component/dashboard_editprofile";
import DashboardNotificationSettings from "@/app/component/dashboard_notification_settings";
import { useState } from "react";
import { HiUserCircle } from "react-icons/hi";
import { IoIosAddCircle, IoMdGlobe } from "react-icons/io";
import { LuSquareUserRound } from "react-icons/lu";
import {
  MdChevronRight,
  MdLogout,
  MdNotifications,
  MdSecurity,
} from "react-icons/md";

export default function Profile() {
  const [showProfile, setShowProfile] = useState<boolean>(true);
  const [activePages, setActivePages] = useState<
    "edit" | "password" | "notification" | "language"
  >();
  const [showActivePages, setShowActivePages] = useState<boolean>(false);
  const handleClickPage = (
    tab: "edit" | "password" | "notification" | "language"
  ) => {
    setShowProfile(false);
    setShowActivePages(true)
    setActivePages(tab);
  };
  return (
    <>
      {showProfile && (
        <>
          {" "}
          <h1 className="dashboard_h1 ">Profile</h1>
          <div className="bg-[#ffffff] p-[24px] w-full my-5">
            <div className="flex justify-center items-center flex-col">
              <div className="relative">
                <HiUserCircle size={130} color="#D5D5DD" />
                <span className="absolute top-3 right-8">
                  <IoIosAddCircle color="#30A46F" />
                </span>
              </div>
            </div>
            <div className="bg-[#FAF8F8] p-[16px] flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <p className="text-[#41415A] text-[14px]">Email</p>
                <span className="text-[#41415A] font-[600] text-[14px]">
                  seanimayi@gmail.com
                </span>
              </div>
              <div className="dashboard_hr"></div>
              <div className="flex justify-between items-center">
                <p className="text-[#41415A] text-[14px]">Phone Number</p>
                <span className="text-[#41415A] font-[600] text-[14px]">
                  0802 313 4756
                </span>
              </div>
              <div className="dashboard_hr"></div>
              <div className="flex justify-between items-center">
                <p className="text-[#41415A] text-[14px]">Location</p>
                <span className="text-[#41415A] font-[600] text-[14px]">
                  Lagos, Nigeria
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 my-5">
              <div
                className="flex gap-2 items-center justify-between border py-[24px] px-[16px] border-[#F1F1F1]"
                onClick={() => handleClickPage("edit")}
              >
                <div className="flex gap-2 items-center">
                  <div className="bg-[#FAF8F8] h-[40px] w-[40px] flex justify-center items-center text-primaryColors-0">
                    <LuSquareUserRound />
                  </div>
                  <div className="flex justify-start items-start flex-col gap-1">
                    <h1 className="text-[#1F2130] font-[600] text-[14px]">
                      Profile
                    </h1>
                    <p className="text-[#71748C] text-[12px] font-[400]">
                      Edit personal information
                    </p>
                  </div>
                </div>
                <span>
                  <MdChevronRight size={29} />
                </span>
              </div>
              <div
                className="flex gap-2 items-center justify-between border py-[24px] px-[16px] border-[#F1F1F1]"
                onClick={() => handleClickPage("password")}
              >
                <div className="flex gap-2 items-center">
                  <div className="bg-[#FAF8F8] h-[40px] w-[40px] flex justify-center items-center text-primaryColors-0">
                    <MdSecurity />
                  </div>
                  <div className="flex justify-start items-start flex-col gap-1">
                    <h1 className="text-[#1F2130] font-[600] text-[14px]">
                      Password
                    </h1>
                    <p className="text-[#71748C] text-[12px] font-[400]">
                      Last changed 1 day ago
                    </p>
                  </div>
                </div>
                <span>
                  <MdChevronRight size={29} />
                </span>
              </div>
              <div
                className="flex gap-2 items-center justify-between border py-[24px] px-[16px] border-[#F1F1F1]"
                onClick={() => handleClickPage("notification")}
              >
                <div className="flex gap-2 items-center">
                  <div className="bg-[#FAF8F8] h-[40px] w-[40px] flex justify-center items-center text-primaryColors-0">
                    <MdNotifications />
                  </div>
                  <div className="flex justify-start items-start flex-col gap-1">
                    <h1 className="text-[#1F2130] font-[600] text-[14px]">
                      Notifications
                    </h1>
                    <p className="text-[#71748C] text-[12px] font-[400]">
                      Manage in-app and email notifications
                    </p>
                  </div>
                </div>
                <span>
                  <MdChevronRight size={29} />
                </span>
              </div>
              <div
                className="flex gap-2 items-center justify-between border py-[24px] px-[16px] border-[#F1F1F1]"
                onClick={() => handleClickPage("language")}
              >
                <div className="flex gap-2 items-center">
                  <div className="bg-[#FAF8F8] h-[40px] w-[40px] flex justify-center items-center text-primaryColors-0">
                    <IoMdGlobe />
                  </div>
                  <div className="flex justify-start items-start flex-col gap-1">
                    <h1 className="text-[#1F2130] font-[600] text-[14px]">
                      Language
                    </h1>
                    <p className="text-[#71748C] text-[12px] font-[400]">
                      English
                    </p>
                  </div>
                </div>
                <span>
                  <MdChevronRight size={29} />
                </span>
              </div>
              <button className="text-[#DA0E29] border border-[#D9D9D9] h-[48px] w-full flex justify-center items-center gap-2 font-[600] text-[13px]">
                <MdLogout /> Logout
              </button>
            </div>
          </div>
        </>
      )}
      {showActivePages && (
        <div>
          {activePages && (
            <div>
              {activePages === "edit" ? (
                <DashboardEditProfile
                  backFunction={() => {
                    setShowProfile(true);
                    setShowActivePages(false);
                  }}
                />
              ) : activePages == "password" ? (
                <DashboardChangePassword
                  backFunction={() => {
                    setShowProfile(true);
                    setShowActivePages(false);
                  }}
                />
              ) : activePages === "notification" ? (
                <DashboardNotificationSettings
                  backFunction={() => {
                    setShowProfile(true);
                    setShowActivePages(false);
                  }}
                />
              ) : activePages === "language" ? (
                <DashboardChangeLanguage
                  backFunction={() => {
                    setShowProfile(true);
                    setShowActivePages(false);
                  }}
                />
              ) : (
                ""
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
