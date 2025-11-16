"use client";
import DashboardChangeLanguage from "@/app/component/dashboard_change_language";
import DashboardChangePassword from "@/app/component/dashboard_change_password";
import DashboardEditProfile from "@/app/component/dashboard_editprofile";
import DashboardNotificationSettings from "@/app/component/dashboard_notification_settings";
import React, { useEffect, useState } from "react";
import { HiUserCircle } from "react-icons/hi";
import { IoIosAddCircle, IoMdGlobe } from "react-icons/io";
import { LuSquareUserRound } from "react-icons/lu";
import { formatDistanceToNow } from "date-fns";
import {
  MdChevronRight,
  MdLogout,
  MdNotifications,
  MdSecurity,
} from "react-icons/md";

interface Details {
  first_name?: string;
  last_name?: string;
  email_address: string;
  phone_number: string;
  country: string;
  state: string;
  updatedAt?: string;
}

export default function Profile() {
  const [showProfile, setShowProfile] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);
  const [profilePic, setProfilePic] = useState<string>("");
  const [date, setDate] = useState<string>("")
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [details, setDetails] = useState<Details>({
    first_name: "",
    last_name: "",
    email_address: "",
    phone_number: "",
    country: "",
    state: "",
    updatedAt: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [activePages, setActivePages] = useState<
    "edit" | "password" | "notification" | "language"
  >();
  const [showActivePages, setShowActivePages] = useState<boolean>(false);

  const handleClickPage = (
    tab: "edit" | "password" | "notification" | "language"
  ) => {
    setShowProfile(false);
    setShowActivePages(true);
    setActivePages(tab);
  };

  const formatPhone = (phone: string) =>
    phone.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");

  const formateDate = (formatedString: any) => {
  if (!formatedString) return "Never"; // Handle null/undefined/empty
  
  try {
    const date = new Date(formatedString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

  useEffect(() => {
    const fetchSomeDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/user/profile`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Profile error", res.status, err);
          return;
        }

        const data = await res.json();
        console.log(data);
        setDetails(data.user);
        setDate(data.user.updatedAt)
        if (data.user.user_pic) setProfilePic(data.user.user_pic);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSomeDetails();
  }, []);

  // Handle file selection
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      await handleUpload(event.target.files[0]); // Upload immediately after selecting
    }
  };

  // Upload the image
  const handleUpload = async (selectedFile?: File) => {
    const uploadFile = selectedFile || file;
    if (!uploadFile) return;

    setLoading(true);
    try {
      const arrayBuffer = await uploadFile.arrayBuffer();
      const base64String = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      );
      const payload = {
        mimeType: uploadFile.type,
        fileName: uploadFile.name,
        file: base64String,
      };

      const res = await fetch(`${API_URL}/api/user/upload-profile-picture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Upload failed", data);
      } else {
        setProfilePic(data.user.user_pic); // Update the profile picture preview
        setDetails((prev) => ({ ...prev, user_pic: data.user.user_pic }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showProfile && (
        <>
          <h1 className="dashboard_h1 ">Profile</h1>
          <div className="bg-[#ffffff] p-[24px] w-full my-5">
            <div className="flex justify-center items-center flex-col mb-4">
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="h-[130px] w-[130px] object-cover rounded-full"
                  />
                ) : (
                  <HiUserCircle size={130} color="#D5D5DD" />
                )}
                <span className="absolute top-3 right-8">
                  <IoIosAddCircle color="#30A46F" />
                </span>
              </label>
            </div>

            <div className="bg-[#FAF8F8] p-[16px] flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <p className="text-[#41415A] text-[14px]">Email</p>
                <span className="text-[#41415A] font-[600] text-[14px]">
                  {loading ? (
                    <div className="animate-spin h-[20px] w-[20px] bg-transparent border-2 border-t-primaryColors-0 border-r-white border-b-white border-l-white rounded-full"></div>
                  ) : (
                    details.email_address
                  )}
                </span>
              </div>
              <div className="dashboard_hr"></div>
              <div className="flex justify-between items-center">
                <p className="text-[#41415A] text-[14px]">Phone Number</p>
                <span className="text-[#41415A] font-[600] text-[14px]">
                  {loading ? (
                    <div className="animate-spin h-[20px] w-[20px] bg-transparent border-2 border-t-primaryColors-0 border-r-white border-b-white border-l-white rounded-full"></div>
                  ) : (
                    formatPhone(details.phone_number)
                  )}{" "}
                </span>
              </div>
              <div className="dashboard_hr"></div>
              <div className="flex justify-between items-center">
                <p className="text-[#41415A] text-[14px]">Location</p>
                <span className="text-[#41415A] font-[600] text-[14px]">
                  {loading ? (
                    <div className="animate-spin h-[20px] w-[20px] bg-transparent border-2 border-t-primaryColors-0 border-r-white border-b-white border-l-white rounded-full"></div>
                  ) : (
                    <div>
                      {details.state}, {details.country}
                    </div>
                  )}{" "}
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
                      Last changed {formateDate(date)}
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
                  profile_pic={profilePic}
                  first_name={details.first_name as string}
                  last_name={details.last_name as string}
                  email_address={details.email_address as string}
                  country={details.country as string}
                  state={details.state as string}
                  phone_number={details.phone_number as string}
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
