"use client";

import { useRouter } from "next/navigation";
import {  useState } from "react";
import { CiUser } from "react-icons/ci";
import { FaArrowRight } from "react-icons/fa6";
import { GoOrganization } from "react-icons/go";
import { IoInformationCircle } from "react-icons/io5";
import { useI18n } from "@/app/context/I18nContext";
interface Props {
  openSignup: () => void;
  changeContentLogin: () => void;
}
export default function Intro({ openSignup, changeContentLogin }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [role, setRole] = useState<string>("");
  const selectRole = (value: string) => {
    setRole(value);
  };

  const roleData = [
    {
      icon: <CiUser size={45} />,
      header: t("Individual"),
      value: "individual",
    },
    {
      icon: <GoOrganization size={45} />,
      header: t("Organization"),
      value: "organization",
    },
  ];

  const continueFunc = (role: string) => {
    if (role == "individual") {
      openSignup();
    } else if (role == "organization") {
      router.push("/auth/organization");
    }
  };

  return (
    <div className="h-full flex justify-center items-center flex-col z-10 md:mt-[100px] md:p-[30px] p-[15px]">
      <div className="dark:bg-shadyColor-0/50 bg-white/70 backdrop-blur-md md:w-[650px] w-full h-[95%] p-[24px]">
        <div>
          <h1 className="text-[24px] font-semibold dark:text-textSlightDark-0 text-lightBoldText-0">
            {t("Create account")}
          </h1>
          <div className="flex items-start gap-2 text-textGrey-0 my-1">
            <span>
              <IoInformationCircle />
            </span>
            {t("Please do well to select what your role is.")}
          </div>

          <div className="grid md:grid-cols-[repeat(2,_40%)] grid-cols-[repeat(1,_100%)] gap-4 md:h-[200px] h-[300px] justify-center my-5">
            {roleData.map((r, i) => (
              <div
                className={`form_box ${
                  role == r.value
                    ? "border-primaryColors-0"
                    : "dark:border-[#f1eded] border-lightBoldText-0/20"
                }`}
                key={i}
                onClick={() => selectRole(r.value)}
              >
                <div
                  className={`flex justify-center items-center flex-col gap-2 ${role == r.value ? "text-primaryColors-0" : "dark:text-textSlightDark-0 text-lightBoldText-0"}`}
                >
                  {r.icon}{" "}
                  <h1
                    className={`text-[18px] font-[500] ${role == r.value ? "text-primaryColors-0" : "dark:text-textSlightDark-0 text-lightBoldText-0"}`}
                  >
                    {r.header}
                  </h1>
                </div>
              </div>
            ))}
          </div>
          <button
            className="form_more bg-primaryColors-0 text-white"
            onClick={() => continueFunc(role)}
          >
            {t("Continue")} <FaArrowRight />
          </button>

          <div className="md:hidden flex items-center gap-2 pt-[24px]">
            {" "}
            <p className="text-textGrey-0">{t("Have an account?")}</p>
            <span
              className="text-primaryColors-0 font-semibold cursor-pointer"
              onClick={changeContentLogin}
            >
              {t("Log in")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
