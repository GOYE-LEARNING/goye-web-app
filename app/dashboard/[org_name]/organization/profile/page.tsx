"use client";
import DashboardAdminNotificationSettings from "@/app/component/admin_component/dashboard_admin_notification_settings";
import DashboardChangeLanguage from "@/app/component/dashboard_change_language";
import DashboardEditProfile from "@/app/component/dashboard_editprofile";
import DashboardNotificationSettings from "@/app/component/dashboard_notification_settings";
import { useOrganizationContext } from "@/app/component/organization_component/organanization_context";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { HiUserCircle } from "react-icons/hi";
import { IoIosAddCircle, IoMdGlobe } from "react-icons/io";
import { LuSquareUserRound } from "react-icons/lu";
import {
  MdChevronRight,
  MdLogout,
  MdNotifications,
  MdSecurity,
} from "react-icons/md";
import { useRouter } from "next/navigation";
import DashboardChangePassword from "@/app/auth/dashboard_change_password";

interface Church {
  church_min_name?: string;
  church_ld_pastor?: string;
  church_leadership_role?: string;
  church_email?: string;
  church_address?: string;
  church_weekly_service?: string;
  church_website?: string;
  church_logo?: string;
}

interface School {
  school_name?: string;
  school_type?: string;
  school_address?: string;
  school_admin_name?: string;
  school_role?: string;
  school_website?: string;
  school_accreditation_number?: string;
  school_document?: string;
  school_email?: string;
}

interface Club {
  club_name?: string;
  club_type?: string;
  club_leader_name?: string;
  club_meeting_frequency?: string;
  club_social_link?: string;
  club_parent_org?: string;
  club_description?: string;
  club_document?: string;
  club_role?: string;
}

interface Details {
  organization_name: string;
  organization_phone_number: string;
  organization_email?: string;
  organization_state?: string;
  organization_country?: string;
  organization_image?: string;
  organization_description?: string;
  organization_role?: string;
  organization_year?: string;
  organization_type?: string;
  isOnline?: boolean;
  user?: User;
  Church?: Church;
  school?: School;
  Club?: Club;
}

interface Organization {
  organization_name: string;
  organization_phone_number: string;
  organization_email?: string;
  organization_state?: string;
  organization_country?: string;
  organization_image?: string;
  organization_description?: string;
  organization_role?: string;
  organization_year?: string;
  organization_type?: string;
  isOnline?: boolean;
  Church?: Church;
  school?: School;
  Club?: Club;
}

interface User {
  first_name?: string;
  last_name?: string;
  email_address?: string;
  country?: string;
  state?: string;
  phone_number?: string;
  level?: string;
  profile_pic?: string;
  organization?: Organization;
}

export default function OrgProfile() {
  const [showProfile, setShowProfile] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);
  const [profilePic, setProfilePic] = useState<string>("");
  const params = useParams<{ org_name: string }>();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [details, setDetails] = useState<User>({
 organization: {
     organization_name: "",
    organization_email: "",
    organization_phone_number: "",
    organization_image: "",
    organization_country: "",
    organization_description: "",
    organization_state: "",
    organization_role: "",
    organization_year: "",
 },
 
      first_name: "",
      last_name: "",
      email_address: "",
      phone_number: "",
      country: "",
      state: "",
      profile_pic: "",
      level: "",
    
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [activePages, setActivePages] = useState<
    "edit" | "password" | "notification" | "language"
  >();
  const [showActivePages, setShowActivePages] = useState<boolean>(false);
  const logout = async () => {
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${API_URL}/api/user/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        return;
      }

      const data = await res.json();
      router.push("/");
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };
  const handleClickPage = (
    tab: "edit" | "password" | "notification" | "language",
  ) => {
    setShowProfile(false);
    setShowActivePages(true);
    setActivePages(tab);
  };

  const formatPhone = (phone: string) =>
    phone.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");

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
        if (data.user)
          setProfilePic(data.user.profile_pic);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSomeDetails();
  }, [API_URL]);

  // Handle file selection
  // Upload the image
  const handleUpload = async (selectedFile?: File) => {
    const uploadFile = selectedFile || file;
    if (!uploadFile) return;

    setLoading(true);
    try {
      const arrayBuffer = await uploadFile.arrayBuffer();
      const base64String = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer)),
      );
      const payload = {
        mimeType: uploadFile.type,
        fileName: uploadFile.name,
        file: base64String,
      };

      const res = await fetch(
        `${API_URL}/api/user/upload-profile-picture`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        console.error("Upload failed", data);
      } else {
        console.log(data);
        setProfilePic(data.user_pic); // Update the profile picture preview
        setDetails((prev) => ({ ...prev, organization_image: data.url }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      await handleUpload(event.target.files[0]); // Upload immediately after selecting
    }
  };

  return (
    <>
      {showProfile && (
        <>
          <h1 className="dashboard_h1 ">Profile</h1>
          <div className="bg-[#ffffff] dark:bg-secondaryColors-0 p-[24px] w-full my-5">
            <div className="flex justify-center items-center flex-col">
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
                  <HiUserCircle size={130} color="#ccc" />
                )}
                <span className="absolute top-3 right-8">
                  <IoIosAddCircle color="#30A46F" />
                </span>
              </label>
              <p className="dark:text-white text-lightBoldText-0/80 my-2">Upload profile picture</p>
            </div>

            <div className="dark:bg-shadyColor-0 bg-lightWhite-0 p-[16px] flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <p className="dark:text-white text-lightBoldText-0 text-[14px]">
                  Email
                </p>
                <span className="dark:text-white text-lightBoldText-0 font-[600] text-[14px]">
                  {loading ? (
                    <div className="animate-spin h-[20px] w-[20px] bg-transparent border-2 border-t-primaryColors-0 border-r-white border-b-white border-l-white rounded-full"></div>
                  ) : (
                    details.email_address
                  )}
                </span>
              </div>
              <div className="dashboard_hr"></div>
              <div className="flex justify-between items-center">
                <p className="dark:text-white text-lightBoldText-0 text-[14px]">
                  Phone Number
                </p>
                <span className="dark:text-white text-lightBoldText-0 font-[600] text-[14px]">
                  {loading ? (
                    <div className="animate-spin h-[20px] w-[20px] bg-transparent border-2 border-t-primaryColors-0 border-r-white border-b-white border-l-white rounded-full"></div>
                  ) : (
                    formatPhone(details.phone_number as any)
                  )}{" "}
                </span>
              </div>
              <div className="dashboard_hr"></div>
              <div className="flex justify-between items-center">
                <p className="dark:text-white text-lightBoldText-0 text-[14px]">
                  Location
                </p>
                <span className="dark:text-white text-lightBoldText-0 font-[600] text-[14px]">
                  {loading ? (
                    <div className="animate-spin h-[20px] w-[20px] bg-transparent border-2 border-t-primaryColors-0 border-r-white border-b-white border-l-white rounded-full"></div>
                  ) : (
                    <div>
                      {details.state},{" "}
                      {details.country}
                    </div>
                  )}{" "}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 my-5">
              <div
                className="flex gap-2 items-center justify-between border py-[24px] px-[16px] border-[#ccc]/20"
                onClick={() => handleClickPage("edit")}
              >
                <div className="flex gap-2 items-center">
                  <div className="dark:bg-shadyColor-0 bg-lightWhite-0 h-[40px] w-[40px] flex justify-center items-center text-primaryColors-0">
                    <LuSquareUserRound />
                  </div>
                  <div className="flex justify-start items-start flex-col gap-1">
                    <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 font-[600] text-[14px]">
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
                className="flex gap-2 items-center justify-between border py-[24px] px-[16px] border-[#ccc]/20"
                onClick={() => handleClickPage("password")}
              >
                <div className="flex gap-2 items-center">
                  <div className="dark:bg-shadyColor-0 bg-lightWhite-0 h-[40px] w-[40px] flex justify-center items-center text-primaryColors-0">
                    <MdSecurity />
                  </div>
                  <div className="flex justify-start items-start flex-col gap-1">
                    <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 font-[600] text-[14px]">
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
                className="flex gap-2 items-center justify-between border py-[24px] px-[16px] border-[#ccc]/20"
                onClick={() => handleClickPage("notification")}
              >
                <div className="flex gap-2 items-center">
                  <div className="dark:bg-shadyColor-0 bg-lightWhite-0 h-[40px] w-[40px] flex justify-center items-center text-primaryColors-0">
                    <MdNotifications />
                  </div>
                  <div className="flex justify-start items-start flex-col gap-1">
                    <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 font-[600] text-[14px]">
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
                className="flex gap-2 items-center justify-between border py-[24px] px-[16px] border-[#ccc]/20"
                onClick={() => handleClickPage("language")}
              >
                <div className="flex gap-2 items-center">
                  <div className="dark:bg-shadyColor-0 bg-lightWhite-0 h-[40px] w-[40px] flex justify-center items-center text-primaryColors-0">
                    <IoMdGlobe />
                  </div>
                  <div className="flex justify-start items-start flex-col gap-1">
                    <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 font-[600] text-[14px]">
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
              <button
                className="text-[#DA0E29] border border-[#ccc]/20 h-[48px] w-full flex justify-center items-center gap-2 font-[600] text-[13px]"
                onClick={logout}
              >
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
                  isOnline={details.organization?.isOnline}
                  profile_pic={profilePic}
                  first_name={details.first_name}
                  last_name={details.last_name as string}
                  email_address={details.email_address as string}
                  country={details.country as string}
                  state={details.state as string}
                  level={details?.level as string}
                  phone_number={details?.phone_number as string}
                  organization_name={details?.organization?.organization_name as string}
                  organization_phone_number={details?.organization?.organization_phone_number}
                  organization_country={details?.organization?.organization_country}
                  organization_description={details?.organization?.organization_description}
                  organization_role={details?.organization?.organization_role}
                  organization_state={details?.organization?.organization_state}
                  organization_email={details?.organization?.organization_email}
                  organization_year={details?.organization?.organization_year}
                  organization_type={details?.organization?.organization_type}
                  Church={details?.organization?.Church}
                  school={details?.organization?.school}
                  Club={details?.organization?.Club}
                  backFunction={() => {
                    setShowProfile(true);
                    setShowActivePages(false);
                  }}
                  onProfileUpdate={(updatedData) => {
                    setDetails((prev) => ({ ...prev, ...updatedData }));
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
                <DashboardAdminNotificationSettings
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
