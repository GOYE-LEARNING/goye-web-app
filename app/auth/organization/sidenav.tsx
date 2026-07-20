"use client";

import { MdOutlineShield } from "react-icons/md";
import { FaArrowLeft, FaRegBuilding } from "react-icons/fa6";
import { LuChurch, LuUserRound } from "react-icons/lu";
import { IoSchoolOutline } from "react-icons/io5";
import { SiClubhouse } from "react-icons/si";
import { IoIosInformationCircleOutline } from "react-icons/io";
import Link from "./sidenav_component"; // your updated Link component
import { OrgSignUp } from "./BodyProvider";
import { useState } from "react";
import ErrorComponent from "@/app/component/organization_component/dashboard_error_component";

export default function Sidenav() {
  const { formData, setFormData, isOrgInfoComplete, isUserComplete, isChurchComplete, isSchoolComplete, isClubComplete } = OrgSignUp();
  const [error, setError] = useState<{ message: string; show: boolean }>({ message: "", show: false });

  const handleTypeClick = (orgType: string) => {
    setFormData({ ...formData, main_type: orgType });
  };

  const handleNavigationClick = (stepName: string, canNavigate: boolean, errorMessage: string) => {
    if (!canNavigate) {
      setError({ message: errorMessage, show: true });
      return false;
    }
    return true;
  };

  return (
    <>
      {error.show && (
        <ErrorComponent
          message={error.message}
          status="error"
          cancelFunc={() => setError({ ...error, show: false })}
        />
      )}
      <ul className="flex flex-col md:gap-2 gap-[1.4rem] z-10">
        {/* Back */}
        <li className="md:static absolute top-5">
          <Link path="/auth" icon={<FaArrowLeft size={19} />} />
        </li>

        {/* Organization Home */}
        <li>
          <Link path="/auth/organization" icon={<FaRegBuilding size={19} />} />
        </li>

        {/* Information */}
        <li>
          <Link
            path="/auth/organization/organization-information"
            icon={<IoIosInformationCircleOutline size={19} />}
          />
        </li>

        {/* User Information */}
        <li>
          <Link
            path="/auth/organization/user-information"
            icon={<LuUserRound size={19} />}
            disabled={!isOrgInfoComplete}
            onClick={() => handleNavigationClick("User Information", isOrgInfoComplete, "Please complete Organization Information first")}
          />
        </li>

        {/* CHURCH */}
        <li>
          <Link
            path="/auth/organization/organization-church"
            icon={<LuChurch size={19} />}
            onClick={() => {
              if (handleNavigationClick("Church", isOrgInfoComplete && isUserComplete, "Please complete Organization Information and User Information first")) {
                handleTypeClick("church");
              }
            }}
            disabled={(!isOrgInfoComplete || !isUserComplete) || (!!formData.main_type && formData.main_type !== "church")}
          />
        </li>

        {/* SCHOOL */}
        <li>
          <Link
            path="/auth/organization/organization-school"
            icon={<IoSchoolOutline size={19} />}
            onClick={() => {
              if (handleNavigationClick("School", isOrgInfoComplete && isUserComplete, "Please complete Organization Information and User Information first")) {
                handleTypeClick("school");
              }
            }}
            disabled={(!isOrgInfoComplete || !isUserComplete) || (!!formData.main_type && formData.main_type !== "school")}
          />
        </li>

        {/* CLUB */}
        <li>
          <Link
            path="/auth/organization/organization-club"
            icon={<SiClubhouse size={19} />}
            onClick={() => {
              if (handleNavigationClick("Club", isOrgInfoComplete && isUserComplete, "Please complete Organization Information and User Information first")) {
                handleTypeClick("club");
              }
            }}
            disabled={(!isOrgInfoComplete || !isUserComplete) || (!!formData.main_type && formData.main_type !== "club")}
          />
        </li>

        {/* Verification */}
        <li>
          <Link
            path="/auth/organization/organization-verification"
            icon={<MdOutlineShield size={19} />}
            disabled={!isOrgInfoComplete || !isUserComplete || (formData.main_type === "church" && !isChurchComplete) || (formData.main_type === "school" && !isSchoolComplete) || (formData.main_type === "club" && !isClubComplete)}
            onClick={() => {
              // "other" has no dedicated info step, so there's nothing
              // further to complete beyond Org Info + User Info.
              const typeComplete = formData.main_type === "church" ? isChurchComplete : formData.main_type === "school" ? isSchoolComplete : formData.main_type === "club" ? isClubComplete : formData.main_type === "other" ? true : false;
              handleNavigationClick("Verification", isOrgInfoComplete && isUserComplete && typeComplete, "Please complete all previous forms first");
            }}
          />
        </li>
      </ul>
    </>
  );
}
