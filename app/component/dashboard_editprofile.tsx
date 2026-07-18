"use client";

import React, { useEffect, useRef, useState } from "react";
import SubHeader from "./dashboard_subheader";
import { FaChevronDown } from "react-icons/fa6";
import DropDowns from "./drop_downs";
import { FaCheck } from "react-icons/fa";
import Loader from "./loader";
import { useParams } from "next/navigation";
import { IoDocumentText } from "react-icons/io5";

interface Props {
  backFunction: () => void;
  organization_name?: string;
  organization_email?: string;
  organization_phone_number?: string;
  organization_country?: string;
  organization_state?: string;
  organization_password?: string;
  organization_description?: string;
  organization_role?: string;
  organization_type?: string;
  organization_year?: string;
  isOnline?: boolean;
  first_name?: string;
  last_name?: string;
  level?: string;
  email_address?: string;
  country?: string;
  state?: string;
  phone_number?: string;
  profile_pic?: string;
  Church?: Church;
  school?: School;
  Club?: Club;
  onProfileUpdate?: (profileUpdate: any) => void;
}

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

interface FormData {
  first_name: string;
  last_name: string;
  email_address: string;
  country: string;
  state: string;
  phone_number: string;
  organization_name?: string;
  organization_email?: string;
  organization_phone_number?: string;
  organization_description?: string;
  organization_country?: string;
  organization_state?: string;
  organization_role?: string;
  organization_year?: string;
  organization_type: string;
  Church?: Church;
  school?: School;
  Club?: Club;
}

interface Country {
  iso2?: string;
  iso3?: string;
  country: string;
  cities: string[];
}

interface UpdateOrganizationData {
  organization_name?: string;
  organization_type?: string;
  organization_email?: string;
  organization_phone_number?: string;
  organization_country?: string;
  organization_state?: string;
  organization_description?: string;
  organization_role?: string;
  organization_year?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_email_address?: string;
  user_country?: string;
  user_state?: string;
  user_role?: string;
  user_phone_number?: string;
  user_form_type?: string;
  church?: {
    church_ministry_name?: string;
    church_lead_pastor?: string;
    church_leadership_role?: string;
    church_email?: string;
    church_address?: string;
    church_weekly_service?: string;
    church_website?: string;
    church_logo?: string;
  };
  school?: {
    school_name?: string;
    school_type?: string;
    school_address?: string;
    school_admin_name?: string;
    school_role?: string;
    school_website?: string;
    school_accreditation_number?: string;
    school_document?: string;
    school_email?: string;
  };
  club?: {
    club_name?: string;
    club_type?: string;
    club_leader_name?: string;
    club_meeting_frequency?: string;
    club_social_link?: string;
    club_parent_org?: string;
    club_description?: string;
    club_document?: string;
    club_role?: string;
  };
}

export default function DashboardEditProfile({
  backFunction,
  organization_name,
  organization_email,
  organization_description,
  organization_country,
  organization_state,
  organization_phone_number,
  organization_role,
  organization_type,
  organization_password,
  organization_year,
  Church,
  school,
  Club,
  first_name,
  last_name,
  email_address,
  country,
  state,
  level,
  phone_number,
  profile_pic,
  onProfileUpdate,
}: Props) {
  const [dropDownCountry, setDropDownCountry] = useState<boolean>(false);
  const [dropDownState, setDropState] = useState<boolean>(false);
  const [countries, setCountry] = useState<Country[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const params = useParams<{ org_name: string }>();
  const typeFromLocalStorage = localStorage.getItem("type");
  const [type, setType] = useState<"ORGANIZATION" | "INDIVIDUAL" | null>(null);

  const boxRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check if user is invited_user
  const isInvitedUser = typeFromLocalStorage === "invited_user";

  const [formData, setFormData] = useState<FormData>({
    first_name: first_name || "",
    last_name: last_name || "",
    email_address: email_address || "",
    country: country || "",
    state: state || "",
    phone_number: phone_number || "",
    organization_name: organization_name || "",
    organization_email: organization_email || "",
    organization_phone_number: organization_phone_number || "",
    organization_country: organization_country || "",
    organization_state: organization_state || "",
    organization_description: organization_description || "",
    organization_role: organization_role || "",
    organization_year: organization_year || "",
    organization_type: organization_type || "",
    Church: Church
      ? {
          church_min_name: Church.church_min_name || "",
          church_ld_pastor: Church.church_ld_pastor || "",
          church_email: Church.church_email || "",
          church_address: Church.church_address || "",
          church_website: Church.church_website || "",
          church_weekly_service: Church.church_weekly_service || "",
        }
      : undefined,
    school: school || undefined,
    Club: Club || undefined,
  });

  const fetchCountry = async () => {
    try {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries");
      const data = await res.json();
      if (res.ok) setCountry(data.data);
    } catch (error) {
      console.error("Error loading countries", error);
    }
  };

  const updateProfile = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      setIsLoading(true);

      const res = await fetch(`${API_URL}/api/user/update-user`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          country: formData.country,
          state: formData.state,
          phone_number: formData.phone_number,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      localStorage.setItem("first_name", data.data.first_name);
      localStorage.setItem("last_name", data.data.last_name);

      if (onProfileUpdate) {
        onProfileUpdate(formData);
      }

      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrganization = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const organizationId = params?.org_name;

    if (!organizationId) {
      console.error("Organization ID not found");
      alert("Organization ID not found");
      return;
    }

    let userFormType = "";

    if (type === "ORGANIZATION") {
      userFormType = "ORGANIZATION";
    } else if (type === "INDIVIDUAL") {
      userFormType = "INDIVIDUAL";
    }
    try {
      setIsLoading(true);

      const updateData: UpdateOrganizationData = {
        organization_name: formData.organization_name,
        organization_type: organization_type,
        organization_phone_number: formData.organization_phone_number,
        organization_country: formData.organization_country,
        organization_state: formData.organization_state,
        organization_description: formData.organization_description,
        organization_role: formData.organization_role,
        organization_year: formData.organization_year,

        user_first_name: formData.first_name,
        user_last_name: formData.last_name,
        user_email_address: formData.email_address,
        user_country: formData.country,
        user_state: formData.state,
        user_phone_number: formData.phone_number,
        user_role: formData.organization_role,
        user_form_type: userFormType,
      };

      if (organization_type === "CHURCH" && formData.Church) {
        updateData.church = {
          church_ministry_name: formData.Church.church_min_name,
          church_lead_pastor: formData.Church.church_ld_pastor,
          church_leadership_role: formData.organization_role,
          church_address: formData.Church.church_address,
          church_weekly_service: formData.Church.church_weekly_service,
          church_website: formData.Church.church_website,
          church_logo: Church?.church_logo,
        };
      }

      if (organization_type === "SCHOOL" && formData.school) {
        updateData.school = {
          school_name: formData.school.school_name,
          school_type: formData.school.school_type,
          school_address: formData.school.school_address,
          school_admin_name: formData.school.school_admin_name,
          school_role: formData.school.school_role,
          school_website: formData.school.school_website,
          school_accreditation_number:
            formData.school.school_accreditation_number,
          school_document: formData.school.school_document,
        };
      }

      if (organization_type === "CLUB" && formData.Club) {
        updateData.club = {
          club_name: formData.Club.club_name,
          club_type: formData.Club.club_type,
          club_leader_name: formData.Club.club_leader_name,
          club_meeting_frequency: formData.Club.club_meeting_frequency,
          club_social_link: formData.Club.club_social_link,
          club_parent_org: formData.Club.club_parent_org,
          club_description: formData.Club.club_description,
          club_document: formData.Club.club_document,
          club_role: formData.Club.club_role,
        };
      }

      // For invited users, only update their own data
      const res = await fetch(
        isInvitedUser
          ? `${API_URL}/api/user/update-user`
          : `${API_URL}/api/organizations/update-organization/${organizationId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isInvitedUser
              ? {
                  phone_number: formData.phone_number,
                  state: formData.state,
                  country: formData.country,
                  last_name: formData.last_name,
                  first_name: formData.first_name,
                }
              : updateData,
          ),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      if (isInvitedUser) {
        if (onProfileUpdate) {
          onProfileUpdate({
            ...formData,
            organization_type,
          });
        }
        alert("Profile updated successfully!");
      } else {
        alert("Organization updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // For invited users, always use updateProfile
    if (isInvitedUser || type === "INDIVIDUAL") {
      await updateProfile();
    } else {
      await updateOrganization();
    }
  };

  const handleOrganizationDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    documentType: "school" | "club",
  ) => {
    // Prevent document upload for invited users
    if (isInvitedUser) {
      alert("You don't have permission to upload documents.");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);

      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        console.error('NEXT_PUBLIC_API_URL is not defined');
        return;
      }

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1] || result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const organizationId = params?.org_name as string;
      const endpoint =
        documentType === "school"
          ? `${API_URL}/api/organizations/upload-school-document/${organizationId}`
          : `${API_URL}/api/organizations/upload-club-document/${organizationId}`;

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64,
          fileName: file.name,
          mimeType: file.type,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to upload document");
      }

      if (documentType === "school") {
        setFormData((prev) => ({
          ...prev,
          school: {
            ...prev.school,
            school_document: data.url,
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          Club: {
            ...prev.Club,
            club_document: data.url,
          },
        }));
      }

      alert("Document uploaded successfully!");
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCountry();
    setType(level as any);
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setDropDownCountry(false);
        setDropState(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [level]);

  const selectedCountry = formData.country;
  const selectedCity = formData.state;

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNestedChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section: "Church" | "school" | "Club",
  ) => {
    // Prevent nested changes for invited users
    if (isInvitedUser) {
      alert("You don't have permission to edit organization data.");
      return;
    }

    const { name, value } = e.target;

    setFormData((prev: FormData) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [name]: value,
      },
    }));
  };

  const handleChangeCountry = (countryName: string) => {
    setFormData({ ...formData, country: countryName, state: "" });
    const selected = countries.find((c) => c.country === countryName);
    if (selected) setCities(selected.cities || []);
    setDropDownCountry(false);
  };

  const handleChangeCity = (cityName: string) => {
    setFormData({ ...formData, state: cityName });
    setDropState(false);
  };

  const backFunc = () => {
    backFunction();
  };

  const forms = [
    {
      label: "First name",
      type: "text",
      name: "first_name",
      onchange: handleChange,
    },
    {
      label: "Last name",
      type: "text",
      name: "last_name",
      onchange: handleChange,
    },

    {
      label: "Phone Number",
      type: "text",
      name: "phone_number",
      onchange: handleChange,
    },
    {
      label: "Country",
      type: "text",
      name: "country",
      onchange: handleChange,
    },
    {
      label: "State",
      type: "text",
      name: "state",
      onchange: handleChange,
    },
    {
      label: "Email address",
      type: "email",
      name: "email_address",
      onchange: handleChange,
    },
  ];

  const orgForms = [
    {
      label: "Organization Name",
      type: "text",
      name: "organization_name",
      onchange: handleChange,
    },
    {
      label: "Organization Email",
      type: "text",
      name: "organization_email",
      onchange: handleChange,
    },
    {
      label: "Organization Phone Number",
      type: "text",
      name: "organization_phone_number",
      onchange: handleChange,
    },
    {
      label: "Organization Role",
      type: "text",
      name: "organization_role",
      onchange: handleChange,
    },
    {
      label: "Organization Country",
      type: "text",
      name: "organization_country",
      onchange: handleChange,
    },
    {
      label: "Organization State",
      type: "text",
      name: "organization_state",
      onchange: handleChange,
    },
    {
      label: "Organization Year Established",
      type: "text",
      name: "organization_year",
      onchange: handleChange,
    },
    {
      label: "Organization Type",
      type: "text",
      name: "organization_type",
      onchange: handleChange,
    },
    {
      label: "Organization Description",
      type: "text",
      name: "organization_description",
      onchange: handleChange,
    },
  ];

  const orgFormChurchType = [
    {
      label: "Church Ministry Name",
      type: "text",
      name: "organization_name",
      onchange: (e: any) => handleNestedChange(e, "Church"),
    },
    {
      label: "Church Lead Pastor",
      type: "text",
      name: "church_ld_pastor",
      onchange: (e: any) => handleNestedChange(e, "Church"),
    },
    {
      label: "Church Role",
      type: "text",
      name: "organization_role",
      onchange: handleChange,
    },
    {
      label: "Church Email",
      type: "text",
      name: "church_email",
      onchange: (e: any) => handleNestedChange(e, "Church"),
    },
    {
      label: "Church Address",
      type: "text",
      name: "church_address",
      onchange: (e: any) => handleNestedChange(e, "Church"),
    },
    {
      label: "Church Weekly Service",
      type: "text",
      name: "church_weekly_service",
      onchange: (e: any) => handleNestedChange(e, "Church"),
    },
    {
      label: "Church Website",
      type: "text",
      name: "church_website",
      onchange: (e: any) => handleNestedChange(e, "Church"),
    },
  ];

  const orgFormTypeSchool = [
    {
      label: "School Name",
      type: "text",
      name: "school_name",
      onchange: (e: any) => handleNestedChange(e, "school"),
    },
    {
      label: "School Email",
      type: "text",
      name: "school_email",
      onchange: (e: any) => handleNestedChange(e, "school"),
    },
    {
      label: "School Type",
      type: "text",
      name: "school_type",
      onchange: (e: any) => handleNestedChange(e, "school"),
    },
    {
      label: "School Address",
      type: "text",
      name: "school_address",
      onchange: (e: any) => handleNestedChange(e, "school"),
    },
    {
      label: "School Role",
      type: "text",
      name: "school_role",
      onchange: (e: any) => handleNestedChange(e, "school"),
    },
    {
      label: "School Website",
      type: "text",
      name: "school_website",
      onchange: (e: any) => handleNestedChange(e, "school"),
    },
    {
      label: "School Accreditation Number",
      type: "text",
      name: "school_accreditation_number",
      onchange: (e: any) => handleNestedChange(e, "school"),
    },
    {
      label: "School Admin Name",
      type: "text",
      name: "school_admin_name",
      onchange: (e: any) => handleNestedChange(e, "school"),
    },
    {
      label: "School Document",
      type: "file",
      name: "school_document",
      onchange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleOrganizationDocumentUpload(e, "school"),
    },
  ];

  const orgFormTypeClub = [
    {
      label: "Club Name",
      type: "text",
      name: "club_name",
      onchange: (e: any) => handleNestedChange(e, "Club"),
    },
    {
      label: "Club Type",
      type: "text",
      name: "club_type",
      onchange: (e: any) => handleNestedChange(e, "Club"),
    },
    {
      label: "Club Leader Name",
      type: "text",
      name: "club_leader_name",
      onchange: (e: any) => handleNestedChange(e, "Club"),
    },
    {
      label: "Club Meeting Frequency",
      type: "text",
      name: "club_meeting_frequency",
      onchange: (e: any) => handleNestedChange(e, "Club"),
    },
    {
      label: "Club Social Link",
      type: "text",
      name: "club_social_link",
      onchange: (e: any) => handleNestedChange(e, "Club"),
    },
    {
      label: "Club Parent Organization",
      type: "text",
      name: "club_parent_org",
      onchange: (e: any) => handleNestedChange(e, "Club"),
    },
    {
      label: "Club Role",
      type: "text",
      name: "club_role",
      onchange: (e: any) => handleNestedChange(e, "Club"),
    },
    {
      label: "Club Description",
      type: "text",
      name: "club_description",
      onchange: (e: any) => handleNestedChange(e, "Club"),
    },
    {
      label: "Club Document",
      type: "file",
      name: "club_document",
      onchange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleOrganizationDocumentUpload(e, "club"),
    },
  ];

  // Add these render functions for invited user view (replace the existing ones)

  // Render read-only organization info as disabled form fields (like profile view)
  const renderOrganizationInfo = () => {
    return (
      <div className="w-full mb-6">
        <h2 className="text-[16px] font-semibold text-lightBoldText-0 dark:text-white mb-4">
          Organization Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Organization Name
            </label>
            <input
              type="text"
              value={formData.organization_name || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Organization Email
            </label>
            <input
              type="text"
              value={formData.organization_email || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.organization_phone_number || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Role
            </label>
            <input
              type="text"
              value={formData.organization_role || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Country
            </label>
            <input
              type="text"
              value={formData.organization_country || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              State
            </label>
            <input
              type="text"
              value={formData.organization_state || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Year Established
            </label>
            <input
              type="text"
              value={formData.organization_year || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Organization Type
            </label>
            <input
              type="text"
              value={formData.organization_type || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full md:col-span-2 border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Description
            </label>
            <textarea
              value={formData.organization_description || "N/A"}
              disabled
              rows={3}
              className="w-full resize-none border-none outline-none text-[14px] bg-transparent disabled:opacity-60"
            />
          </div>
        </div>
      </div>
    );
  };

  // Render read-only church info
  const renderChurchInfo = () => {
    if (!formData.Church) return null;
    return (
      <div className="w-full mb-6">
        <h2 className="text-[16px] font-semibold text-lightBoldText-0 dark:text-white mb-4">
          Church Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Ministry Name
            </label>
            <input
              type="text"
              value={formData.Church.church_min_name || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Lead Pastor
            </label>
            <input
              type="text"
              value={formData.Church.church_ld_pastor || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Email
            </label>
            <input
              type="text"
              value={formData.Church.church_email || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Address
            </label>
            <input
              type="text"
              value={formData.Church.church_address || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Weekly Service
            </label>
            <input
              type="text"
              value={formData.Church.church_weekly_service || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Website
            </label>
            <input
              type="text"
              value={formData.Church.church_website || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
        </div>
      </div>
    );
  };

  // Render read-only school info
  const renderSchoolInfo = () => {
    if (!formData.school) return null;
    return (
      <div className="w-full mb-6">
        <h2 className="text-[16px] font-semibold text-lightBoldText-0 dark:text-white mb-4">
          School Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              School Name
            </label>
            <input
              type="text"
              value={formData.school.school_name || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              School Type
            </label>
            <input
              type="text"
              value={formData.school.school_type || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Email
            </label>
            <input
              type="text"
              value={formData.school.school_email || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Address
            </label>
            <input
              type="text"
              value={formData.school.school_address || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Admin Name
            </label>
            <input
              type="text"
              value={formData.school.school_admin_name || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Website
            </label>
            <input
              type="text"
              value={formData.school.school_website || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Accreditation Number
            </label>
            <input
              type="text"
              value={formData.school.school_accreditation_number || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Role
            </label>
            <input
              type="text"
              value={formData.school.school_role || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          {formData.school.school_document && (
            <div className="w-full md:col-span-2 border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
              <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
                Document
              </label>
              <a
                href={formData.school.school_document}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-[14px]"
              >
                View Document
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render read-only club info
  const renderClubInfo = () => {
    if (!formData.Club) return null;
    return (
      <div className="w-full mb-6">
        <h2 className="text-[16px] font-semibold text-lightBoldText-0 dark:text-white mb-4">
          Club Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Club Name
            </label>
            <input
              type="text"
              value={formData.Club.club_name || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Club Type
            </label>
            <input
              type="text"
              value={formData.Club.club_type || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Leader Name
            </label>
            <input
              type="text"
              value={formData.Club.club_leader_name || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Meeting Frequency
            </label>
            <input
              type="text"
              value={formData.Club.club_meeting_frequency || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Social Link
            </label>
            <input
              type="text"
              value={formData.Club.club_social_link || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Parent Organization
            </label>
            <input
              type="text"
              value={formData.Club.club_parent_org || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Role
            </label>
            <input
              type="text"
              value={formData.Club.club_role || "N/A"}
              disabled
              className="w-full bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none disabled:opacity-60"
            />
          </div>
          <div className="w-full md:col-span-2 border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
            <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
              Description
            </label>
            <textarea
              value={formData.Club.club_description || "N/A"}
              disabled
              rows={3}
              className="w-full resize-none border-none outline-none text-[14px] bg-transparent disabled:opacity-60"
            />
          </div>
          {formData.Club.club_document && (
            <div className="w-full md:col-span-2 border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px]">
              <label className="text-lightBoldText-0 dark:text-white text-[12px] block">
                Document
              </label>
              <a
                href={formData.Club.club_document}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-[14px]"
              >
                View Document
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div>
        <SubHeader header="Edit Profile" backFunction={backFunc} />
        <div className="bg-[#ffffff] dark:bg-secondaryColors-0 p-[24px] w-full my-5">
          <div className="w-full flex justify-center items-center overflow-hidden">
            <div className="h-[72px] w-[72px] bg-[#D9D9D9] rounded-full overflow-hidden">
              <img
                src={profile_pic || "/default-avatar.png"}
                alt="pic"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {isInvitedUser && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg my-4">
              <p className="text-blue-700 dark:text-blue-300 text-sm flex items-center gap-2">
                <span className="font-semibold">👤 Invited User:</span>
                You can only edit your personal information. Organization data
                is read-only.
              </p>
            </div>
          )}

          {isInvitedUser ? (
            // Invited User View - Only personal info editable
            <form onSubmit={handleSubmit} className="my-5" noValidate>
              {/* Show organization info as read-only with disabled inputs */}

              <h2 className="text-[16px] font-semibold text-lightBoldText-0 dark:text-white mb-4">
                Your Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {forms.map((form, i) => (
                  <div
                    key={i}
                    className={`w-full border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px] 
                    `}
                  >
                    <div className="flex flex-col w-full">
                      <label className="text-lightBoldText-0 dark:text-white text-[12px]">
                        {form.label}
                      </label>
                      <input
                        type={form.type}
                        name={form.name}
                        onChange={form.onchange}
                        value={(formData as any)[form.name] || ""}
                        className={`bg-transparent text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none w-full ${
                          form.name == "email_address"
                            ? "text-lightBoldText-0 dark:text-white bg-transparent opacity-60"
                            : "dark:text-white"
                        }`}
                        disabled={form.name == "email_address"}
                        required
                      />
                    </div>

                    {form.label == "Country" && (
                      <div>
                        <div
                          className="absolute right-2 top-[19px] cursor-pointer"
                          onClick={() => setDropDownCountry(true)}
                        >
                          <FaChevronDown size={14} />
                        </div>
                        {dropDownCountry && (
                          <div className="mt-[3.1rem]" ref={boxRef}>
                            <DropDowns
                              value={selectedCountry}
                              onChange={() => {}}
                              countries={countries.map((c, i) => (
                                <div
                                  key={i}
                                  onClick={() => handleChangeCountry(c.country)}
                                  className="flex justify-between items-center w-full p-3 hover:bg-secondaryColors-0 cursor-pointer"
                                >
                                  <div>{c.country}</div>
                                  {selectedCountry === c.country && (
                                    <span className="text-primaryColors-0">
                                      <FaCheck size={12} />
                                    </span>
                                  )}
                                </div>
                              ))}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {form.label == "State" && (
                      <div>
                        <FaChevronDown
                          size={14}
                          className="absolute right-2 top-[19px] cursor-pointer"
                          onClick={() => setDropState(true)}
                        />
                        {dropDownState && (
                          <div ref={boxRef} className="mt-[3.1rem]">
                            <DropDowns
                              value={selectedCity}
                              onChange={() => {}}
                              countries={cities.map((city, i) => (
                                <div
                                  key={i}
                                  onClick={() => handleChangeCity(city)}
                                  className="flex justify-between items-center w-full p-3 hover:bg-secondaryColors-0 cursor-pointer"
                                >
                                  <div>{city}</div>
                                  {selectedCity === city && (
                                    <span className="text-primaryColors-0">
                                      <FaCheck size={12} />
                                    </span>
                                  )}
                                </div>
                              ))}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="dashboard_hr my-6"></div>

              {renderOrganizationInfo()}
              {organization_type === "CHURCH" && renderChurchInfo()}
              {organization_type === "SCHOOL" && renderSchoolInfo()}
              {organization_type === "CLUB" && renderClubInfo()}

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  onClick={backFunc}
                  className="form_more bg-[#ffffff] dark:bg-shadyColor-0 text-lightBoldText-0 dark:text-white border border-[#D9D9D9] dark:border-[#ccc]/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="form_more text-plainColors-0 bg-primaryColors-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader
                      height={30}
                      width={30}
                      border_width={2}
                      full_border_color="white"
                      small_border_color="#FFA500"
                    />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          ) : type == "INDIVIDUAL" || typeFromLocalStorage == "user" ? (
            // Regular Individual User View
            <form
              onSubmit={handleSubmit}
              className="my-5 flex flex-col gap-5"
              noValidate
            >
              {forms.map((form, i) => (
                <div
                  key={i}
                  className="w-full h-[63px] border border-[#ccc]/20 dark:border-[#ccc]/10 py-[8px] px-[12px] flex items-center relative"
                >
                  <div className="flex flex-col w-full">
                    <label className="text-lightBoldText-0 dark:text-white text-[12px]">
                      {form.label}
                    </label>
                    <input
                      type={form.type}
                      name={form.name}
                      onChange={form.onchange}
                      value={(formData as any)[form.name] || ""}
                      className={`bg-transparent text-lightBoldText-0 dark:text-white/80 text-[16px] font-[500] outline-none border-none ${
                        form.name == "email_address"
                          ? "text-lightBoldText-0 dark:text-white bg-transparent"
                          : "dark:text-white"
                      }`}
                      disabled={form.name == "email_address"}
                      required
                    />
                  </div>

                  {form.label == "Country" && (
                    <div>
                      <div
                        className="absolute right-2 top-[19px] cursor-pointer"
                        onClick={() => setDropDownCountry(true)}
                      >
                        <FaChevronDown size={14} />
                      </div>
                      {dropDownCountry && (
                        <div className="mt-[3.1rem]" ref={boxRef}>
                          <DropDowns
                            value={selectedCountry}
                            onChange={() => {}}
                            countries={countries.map((c, i) => (
                              <div
                                key={i}
                                onClick={() => handleChangeCountry(c.country)}
                                className="flex justify-between items-center w-full p-3 hover:bg-secondaryColors-0 cursor-pointer"
                              >
                                <div>{c.country}</div>
                                {selectedCountry === c.country && (
                                  <span className="text-primaryColors-0">
                                    <FaCheck size={12} />
                                  </span>
                                )}
                              </div>
                            ))}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {form.label == "State" && (
                    <div>
                      <FaChevronDown
                        size={14}
                        className="absolute right-2 top-[19px] cursor-pointer"
                        onClick={() => setDropState(true)}
                      />
                      {dropDownState && (
                        <div ref={boxRef} className="mt-[3.1rem]">
                          <DropDowns
                            value={selectedCity}
                            onChange={() => {}}
                            countries={cities.map((city, i) => (
                              <div
                                key={i}
                                onClick={() => handleChangeCity(city)}
                                className="flex justify-between items-center w-full p-3 hover:bg-secondaryColors-0 cursor-pointer"
                              >
                                <div>{city}</div>
                                {selectedCity === city && (
                                  <span className="text-primaryColors-0">
                                    <FaCheck size={12} />
                                  </span>
                                )}
                              </div>
                            ))}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={backFunc}
                  className="form_more bg-[#ffffff] dark:bg-shadyColor-0 text-lightBoldText-0 dark:text-white border border-[#D9D9D9] dark:border-[#ccc]/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="form_more text-plainColors-0 bg-primaryColors-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader
                      height={30}
                      width={30}
                      border_width={2}
                      full_border_color="white"
                      small_border_color="#FFA500"
                    />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          ) : (
            // Organization View (Full edit)
            <form onSubmit={handleSubmit}>
              <div>
                <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 font-semibold text-[20px] md:mb-4 my-3">
                  Organization Information
                </h1>
                <div className="md:grid md:grid-cols-2 flex flex-col md:gap-2 gap-3">
                  {orgForms.map((form, i) => (
                    <div
                      key={i}
                      className={`w-full ${form.name == "organization_description" ? "col-span-2" : "h-[50px]"} border border-[#ccc]/20 py-[8px] px-[12px] flex items-center relative`}
                    >
                      {form.name == "organization_description" ? (
                        <div className="flex flex-col w-full">
                          <label className="text-lightBoldText-0 dark:text-white text-[12px]">
                            {form.label}
                          </label>
                          <textarea
                            onChange={handleChange}
                            name="organization_description"
                            value={(formData as any)[form.name] || ""}
                            className="resize-none border-none outline-none text-[14px] bg-transparent"
                            rows={6}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col w-full">
                          <label className="text-lightBoldText-0 dark:text-white text-[12px]">
                            {form.label}
                          </label>
                          <input
                            type={form.type}
                            name={form.name}
                            onChange={form.onchange}
                            value={(formData as any)[form.name] || ""}
                            className={`text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none bg-transparent ${
                              form.name == "organization_email"
                                ? "text-lightBoldText-0 dark:text-white bg-transparent"
                                : ""
                            }`}
                            disabled={form.name == "organization_email"}
                            required
                          />
                        </div>
                      )}
                      {form.name == "organization_country" && (
                        <div>
                          <div
                            onClick={() => setDropDownCountry(true)}
                            className="absolute right-2 top-[19px] cursor-pointer"
                          >
                            <FaChevronDown size={14} />
                          </div>
                          {dropDownCountry && (
                            <div className="mt-[3.1rem]" ref={boxRef}>
                              <DropDowns
                                value={selectedCountry}
                                onChange={() => {}}
                                countries={countries.map((c, i) => (
                                  <div
                                    key={i}
                                    onClick={() =>
                                      handleChangeCountry(c.country)
                                    }
                                    className="flex justify-between items-center w-full p-3 hover:bg-secondaryColors-0 cursor-pointer"
                                  >
                                    <div>{c.country}</div>
                                    {selectedCountry === c.country && (
                                      <span className="text-primaryColors-0">
                                        <FaCheck size={12} />
                                      </span>
                                    )}
                                  </div>
                                ))}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {form.name == "organization_state" && (
                        <div>
                          <FaChevronDown
                            size={14}
                            onClick={() => setDropState(true)}
                            className="absolute right-2 top-[19px] cursor-pointer"
                          />
                          {dropDownState && (
                            <div ref={boxRef} className="mt-[3.1rem]">
                              <DropDowns
                                value={selectedCity}
                                onChange={() => {}}
                                countries={cities.map((city, i) => (
                                  <div
                                    key={i}
                                    onClick={() => handleChangeCity(city)}
                                    className="flex justify-between items-center w-full p-3 hover:bg-secondaryColors-0 cursor-pointer"
                                  >
                                    <div>{city}</div>
                                    {selectedCity === city && (
                                      <span className="text-primaryColors-0">
                                        <FaCheck size={12} />
                                      </span>
                                    )}
                                  </div>
                                ))}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="dashboard_hr mt-4"></div>
              <div>
                <div className="dark:text-textSlightDark-0 text-lightBoldText-0 font-semibold text-[20px] my-3">
                  User Information
                </div>
                <div className="md:grid md:grid-cols-2 flex flex-col md:gap-2 gap-3">
                  {forms.map((form, i) => (
                    <div
                      key={i}
                      className="w-full h-[50px] border border-[#ccc]/20 py-[8px] px-[12px] flex items-center relative"
                    >
                      <div className="flex flex-col w-full">
                        <label className="text-lightBoldText-0 dark:text-white text-[12px]">
                          {form.label}
                        </label>
                        <input
                          type={form.type}
                          name={form.name}
                          onChange={form.onchange}
                          value={(formData as any)[form.name] || ""}
                          className={`text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none bg-transparent${
                            form.name == "email_address"
                              ? "text-lightBoldText-0 dark:text-white bg-transparent"
                              : ""
                          }`}
                          disabled={form.name == "email_address"}
                          required
                        />
                      </div>

                      {form.label == "Country" && (
                        <div>
                          <div
                            className="absolute right-2 top-[19px] cursor-pointer"
                            onClick={() => setDropDownCountry(true)}
                          >
                            <FaChevronDown size={14} />
                          </div>
                          {dropDownCountry && (
                            <div className="mt-[3.1rem]" ref={boxRef}>
                              <DropDowns
                                value={selectedCountry}
                                onChange={() => {}}
                                countries={countries.map((c, i) => (
                                  <div
                                    key={i}
                                    onClick={() =>
                                      handleChangeCountry(c.country)
                                    }
                                    className="flex justify-between items-center w-full p-3 hover:bg-secondaryColors-0 cursor-pointer"
                                  >
                                    <div>{c.country}</div>
                                    {selectedCountry === c.country && (
                                      <span className="text-primaryColors-0">
                                        <FaCheck size={12} />
                                      </span>
                                    )}
                                  </div>
                                ))}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {form.label == "State" && (
                        <div>
                          <FaChevronDown
                            className="absolute right-2 top-[19px] cursor-pointer"
                            size={14}
                            onClick={() => setDropState(true)}
                          />
                          {dropDownState && (
                            <div ref={boxRef} className="mt-[3.1rem]">
                              <DropDowns
                                value={selectedCity}
                                onChange={() => {}}
                                countries={cities.map((city, i) => (
                                  <div
                                    key={i}
                                    onClick={() => handleChangeCity(city)}
                                    className="flex justify-between items-center w-full p-3 hover:bg-secondaryColors-0 cursor-pointer"
                                  >
                                    <div>{city}</div>
                                    {selectedCity === city && (
                                      <span className="text-primaryColors-0">
                                        <FaCheck size={12} />
                                      </span>
                                    )}
                                  </div>
                                ))}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="dashboard_hr mt-4"></div>

              {organization_type == "CHURCH" && (
                <div>
                  <div className="dark:text-textSlightDark-0 text-lightBoldText-0 font-semibold text-[20px] my-3">
                    Church Information
                  </div>
                  <div className="md:grid md:grid-cols-2 flex flex-col md:gap-2 gap-3">
                    {orgFormChurchType.map((form, i) => (
                      <div
                        key={i}
                        className={`w-full h-[50px] ${form.name == "church_website" ? "col-span-2" : ""} border border-[#ccc]/20 py-[8px] px-[12px] flex items-center relative`}
                      >
                        <div className="flex flex-col w-full">
                          <label className="text-lightBoldText-0 dark:text-white text-[12px]">
                            {form.label}
                          </label>
                          <input
                            type={form.type}
                            name={form.name}
                            onChange={form.onchange}
                            value={
                              form.name.includes("church")
                                ? (formData.Church as any)?.[form.name] || ""
                                : (formData as any)[form.name] || ""
                            }
                            className={`text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none bg-transparent${
                              form.name == "church_email"
                                ? "text-lightBoldText-0 dark:text-white bg-transparent"
                                : ""
                            }`}
                            disabled={form.name == "church_email"}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {organization_type == "SCHOOL" && (
                <div>
                  <div className="text-textSlightDark-0 font-semibold text-[20px] my-3">
                    School Information
                  </div>
                  <div className="md:grid md:grid-cols-2 flex flex-col md:gap-2 gap-3">
                    {orgFormTypeSchool.map((form, i) => (
                      <div
                        key={i}
                        className={`w-full ${form.name == "school_document" ? "col-span-2 h-[190px] border-dashed border" : "h-[50px] border"} border-[#ccc]/20 py-[8px] px-[12px] flex items-center relative`}
                      >
                        {form.name == "school_document" ? (
                          <div className="flex flex-col w-full">
                            <input
                              type="file"
                              id="school-document"
                              className="hidden"
                              onChange={form.onchange}
                              accept=".pdf,.doc,.docx"
                            />
                            <label
                              htmlFor="school-document"
                              className="flex justify-center items-center flex-col w-full h-full cursor-pointer"
                            >
                              {formData.school?.school_document ? (
                                <div className="text-center">
                                  <IoDocumentText size={40} color="#4F46E5" />
                                  <span className="text-[16px] text-[#4F46E5] block mt-2">
                                    Document Uploaded
                                  </span>
                                  <span className="text-[12px] text-lightBoldText-0 dark:text-white">
                                    Click to replace
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <IoDocumentText size={30} color="#D2D5DA" />
                                  <span className="text-[14px] text-[#D2D5DA] mt-2">
                                    Click to upload document
                                  </span>
                                  <span className="text-[12px] text-[#D2D5DA]">
                                    PDF, DOC, DOCX (Max 5MB)
                                  </span>
                                </>
                              )}
                            </label>
                          </div>
                        ) : (
                          <div className="flex flex-col w-full">
                            <label className="text-lightBoldText-0 dark:text-white text-[12px]">
                              {form.label}
                            </label>
                            <input
                              type={form.type}
                              name={form.name}
                              onChange={form.onchange}
                              value={
                                (formData.school as any)?.[form.name] || ""
                              }
                              className={`text-lightBoldText-0 dark:text-white/80 text-[14px] font-[500] outline-none border-none bg-transparent${
                                form.name == "school_email"
                                  ? "text-lightBoldText-0 dark:text-white bg-transparent"
                                  : ""
                              }`}
                              disabled={form.name == "school_email"}
                              required
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {organization_type == "CLUB" && (
                <div>
                  <div className="text-textSlightDark-0 font-semibold text-[20px] my-3">
                    Club Information
                  </div>
                  <div className="md:grid md:grid-cols-2 flex flex-col md:gap-2 gap-3">
                    {orgFormTypeClub.map((form, i) => (
                      <div
                        key={i}
                        className={`w-full ${form.name == "club_document" ? "col-span-2 h-[190px] border-dashed border" : "h-[50px] border"} border-[#ccc]/20 py-[8px] px-[12px] flex items-center relative`}
                      >
                        {form.name == "club_document" ? (
                          <div className="flex flex-col w-full">
                            <input
                              type="file"
                              id="club-document"
                              className="hidden"
                              onChange={form.onchange}
                              accept=".pdf,.doc,.docx"
                            />
                            <label
                              htmlFor="club-document"
                              className="flex justify-center items-center flex-col w-full h-full cursor-pointer"
                            >
                              {formData.Club?.club_document ? (
                                <div className="text-center">
                                  <IoDocumentText size={40} color="#4F46E5" />
                                  <span className="text-[16px] text-[#4F46E5] block mt-2">
                                    Document Uploaded
                                  </span>
                                  <span className="text-[12px] text-lightBoldText-0 dark:text-white">
                                    Click to replace
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <IoDocumentText size={30} color="#D2D5DA" />
                                  <span className="text-[14px] text-[#D2D5DA] mt-2">
                                    Click to upload document
                                  </span>
                                  <span className="text-[12px] text-[#D2D5DA]">
                                    PDF, DOC, DOCX (Max 5MB)
                                  </span>
                                </>
                              )}
                            </label>
                          </div>
                        ) : (
                          <div className="flex flex-col w-full">
                            <label className="text-lightBoldText-0 dark:text-white text-[12px]">
                              {form.label}
                            </label>
                            <input
                              type={form.type}
                              name={form.name}
                              onChange={form.onchange}
                              value={(formData.Club as any)?.[form.name] || ""}
                              className="text-lightBoldText-0 dark:text-white/80 text-[16px] font-[500] outline-none border-none"
                              required
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="dashboard_hr mt-4"></div>

              <div className="grid grid-cols-2 gap-3 w-full mt-4">
                <button
                  type="button"
                  onClick={backFunc}
                  className="form_more bg-[#ffffff] text-lightBoldText-0 dark:text-white border border-[#D9D9D9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="form_more text-plainColors-0 bg-primaryColors-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader
                      height={30}
                      width={30}
                      border_width={2}
                      full_border_color="white"
                      small_border_color="#FFA500"
                    />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
