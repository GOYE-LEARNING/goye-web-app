"use client";

import React, {
  createContext,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaCheck } from "react-icons/fa6";
import Sidenav from "./sidenav";
import OrgTooltip from "@/app/component/organization_form_component/org_tooltip";
import { form } from "framer-motion/client";
import ErrorComponent from "@/app/component/organization_component/dashboard_error_component";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/app/utils/checkLanguages";

//for background slide
const bgImages = [
  "/images/img7.jpg",
  "/images/img8.jpg",
  "/images/img9.jpg",
  "/images/img5.jpg",
  "/images/img6.jpg",
];

interface FormData {
  main_type: string;
  type: string;
  // For org info
  org_name: string;
  org_type: string;
  org_email: string;
  org_phone_number: string;
  org_country: string;
  org_state: string;
  org_description: string;
  org_year: string;
  org_role: string;
  //User Information
  user_first_name: string;
  user_last_name: string;
  user_email_address: string;
  user_country: string;
  user_state: string;
  user_role: string; //As an admin
  user_phone_number: string;
  user_form_type: string; // organizaton
  // For church
  church_min_name?: string;
  church_ld_pastor?: string;
  church_leader_ship_role?: string;
  church_address?: string;
  church_weekly_service?: string;
  church_website?: string;
  church_email?: string;
  church_logo?: string | File;
  // For school
  school_name?: string;
  school_type?: string; // Teritary, Secondary or primary
  school_address?: string;
  school_admin_name?: string;
  school_role?: string;
  school_email?: string;
  school_website?: string;
  school_accreditation_number?: string;
  school_document?: string | File;
  // For club
  club_name?: string;
  club_type?: string;
  club_leader_name?: string;
  club_role?: string;
  club_meeting_frequency?: string;
  club_social_link?: string;
  club_parent_org?: string;
  club_description?: string;
  club_document?: string | File;
  [key: string]: any;
}

interface OrgContextType {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  isOrgInfoComplete: boolean;
  isChurchComplete: boolean;
  isSchoolComplete: boolean;
  isClubComplete: boolean;
  isUserComplete: boolean;
  isVerifying: boolean;
  setIsVerifying: React.Dispatch<SetStateAction<boolean>>;
  isVerifyComplete: boolean;
  setIsVerifyingComplete: React.Dispatch<SetStateAction<boolean>>;
  clearFormData: () => void;
}

const OrganizationContext = createContext<OrgContextType | null>(null);

export const INITIAL_FORM_DATA: FormData = {
  main_type: "",
  type: "",
  org_name: "",
  org_type: "",
  org_email: "",
  org_phone_number: "",
  org_country: "",
  org_state: "",
  org_description: "",
  org_year: "",
  org_role: "",
  user_first_name: "",
  user_last_name: "",
  user_email_address: "",
  user_country: "",
  user_state: "",
  user_phone_number: "",
  user_role: "organization_admin",
  user_form_type: "organization",
  church_min_name: "",
  church_ld_pastor: "",
  church_leader_ship_role: "",
  church_address: "",
  church_weekly_service: "",
  church_website: "",
  church_email: "",
  church_logo: "",
  school_name: "",
  school_type: "",
  school_address: "",
  school_admin_name: "",
  school_role: "",
  school_email: "",
  school_website: "",
  school_accreditation_number: "",
  school_document: "",
  club_name: "",
  club_type: "",
  club_leader_name: "",
  club_role: "",
  club_meeting_frequency: "",
  club_social_link: "",
  club_parent_org: "",
  club_description: "",
  club_document: "",
};

export default function BodyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { translate } = useLanguage();
  const [index, setIndex] = useState<number>(0);
  const toolTipRef = useRef<HTMLDivElement | null>(null);
  const [toggleIndex, setToogleIndex] = useState<number[]>([]);
  const [showError, setError] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [translatedSteps, setTranslatedSteps] = useState<{ name: string; path: string }[]>([]);
  const [translationsLoaded, setTranslationsLoaded] = useState<boolean>(false);

  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isVerifyComplete, setIsVerifyingComplete] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>(() => {
    try {
      if (typeof window !== "undefined") {
        const savedFormData = localStorage.getItem("orgFormData");
        if (savedFormData) {
          return JSON.parse(savedFormData);
        }
      }
    } catch (error) {
      console.error("Failed to load form data from localStorage:", error);
    }
    return INITIAL_FORM_DATA;
  });

  // Set isClient to true after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("orgFormData", JSON.stringify(formData));
      }
    } catch (error) {
      console.error("Failed to save form data to localStorage:", error);
    }
  }, [formData]);

  const orgPaths = [
    "/auth/organization/organization-church",
    "/auth/organization/organization-school",
    "/auth/organization/organization-club",
  ];

  const steps = [
    { name: "Organization Type", path: "/auth/organization" },
    {
      name: "Organization Information",
      path: "/auth/organization/organization-information",
    },
    {
      name: "User Information",
      path: "/auth/organization/user-information",
    },
    {
      name: "Organization Type Validation",
      path: "/auth/organization/organization-church",
    },
    {
      name: "Verification",
      path: "/auth/organization/organization-verification",
    },
  ];

  // Load translations for steps
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translated = await Promise.all(
          steps.map(async (step) => ({
            ...step,
            name: await translate(step.name),
          }))
        );
        setTranslatedSteps(translated);
        setTranslationsLoaded(true);
      } catch (error) {
        console.error("Failed to load step translations:", error);
        setTranslatedSteps(steps);
        setTranslationsLoaded(true);
      }
    };

    loadTranslations();
  }, [translate]);

  const isOrgInfoComplete =
    !!formData.org_name &&
    !!formData.org_type &&
    !!formData.org_email &&
    !!formData.org_phone_number &&
    !!formData.org_country &&
    !!formData.org_state &&
    !!formData.org_role &&
    !!formData.org_description &&
    !!formData.org_year;

  const isUserComplete =
    !!formData.user_first_name &&
    !!formData.user_last_name &&
    !!formData.user_email_address &&
    !!formData.user_country &&
    !!formData.user_state &&
    !!formData.user_role &&
    !!formData.user_phone_number &&
    !!formData.user_form_type;

  const isChurchComplete =
    !!formData.church_address &&
    !!formData.church_logo &&
    !!formData.church_ld_pastor &&
    !!formData.church_leader_ship_role &&
    !!formData.church_min_name &&
    !!formData.church_website &&
    !!formData.church_email &&
    !!formData.church_weekly_service;

  const isSchoolComplete =
    !!formData.school_accreditation_number &&
    !!formData.school_address &&
    !!formData.school_admin_name &&
    !!formData.school_role &&
    !!formData.school_email &&
    !!formData.school_name &&
    !!formData.school_type &&
    !!formData.school_document &&
    !!formData.school_website;

  const isClubComplete =
    !!formData.club_name &&
    !!formData.club_type &&
    !!formData.club_leader_name &&
    !!formData.club_role &&
    !!formData.club_meeting_frequency &&
    !!formData.club_social_link &&
    !!formData.club_parent_org &&
    !!formData.club_description &&
    !!formData.club_document;

  const mainType = !!formData.main_type;

  const isStepComplete = (index: number): boolean => {
    if (index === 0) return mainType;
    if (index === 1) return isOrgInfoComplete;
    if (index === 2) return isUserComplete;
    if (index === 3)
      // "other" organizations have no dedicated info step to fill in, so
      // there's nothing to be incomplete about — treat it as satisfied.
      return isChurchComplete || isSchoolComplete || isClubComplete || formData.main_type === "other";
    if (index === 4) return false;
    return false;
  };

  const closeToolTip = (e: MouseEvent) => {
    if (toolTipRef.current && !toolTipRef.current.contains(e.target as Node)) {
      setToogleIndex([]);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % bgImages.length);
    }, 6000);

    document.addEventListener("mousedown", closeToolTip);
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", closeToolTip);
    };
  }, []);

  const errorTimeout = () => {
    setError(true);
    setTimeout(() => {
      setError(false);
    }, 3000);
  };

  const clearFormData = () => {
    localStorage.removeItem("orgFormData");
    setFormData(INITIAL_FORM_DATA);
  };

  const openFirstStep = () => {
    router.push("/auth/organization");
  };

  const openSecondStep = () => {
    if (formData.main_type) {
      router.push("/auth/organization/organization-information");
    } else {
      return errorTimeout();
    }
  };

  const openThirdStep = () => {
    if (isOrgInfoComplete && formData.main_type) {
      router.push("/auth/organization/user-information");
    } else {
      return errorTimeout();
    }
  };

  const openFourthStep = () => {
    if (isOrgInfoComplete && isUserComplete && formData.main_type) {
      if (formData.main_type === "church") {
        router.push("/auth/organization/organization-church");
      } else if (formData.main_type === "school") {
        router.push("/auth/organization/organization-school");
      } else if (formData.main_type === "club") {
        router.push("/auth/organization/organization-club");
      } else if (formData.main_type === "other") {
        // "other" has no dedicated info step — go straight to verification.
        router.push("/auth/organization/organization-verification");
      }
    } else {
      return errorTimeout();
    }
  };

  const openFifthStep = () => {
    if (
      isOrgInfoComplete &&
      isUserComplete &&
      formData.main_type &&
      (isChurchComplete || isSchoolComplete || isClubComplete || formData.main_type === "other")
    ) {
      router.push("/auth/organization/organization-verification");
    } else {
      return errorTimeout();
    }
  };

  // Use translated steps or fallback to original
  const displaySteps = translationsLoaded ? translatedSteps : steps;

  return (
    <OrganizationContext.Provider
      value={{
        formData,
        setFormData,
        isOrgInfoComplete,
        isUserComplete,
        isChurchComplete,
        isSchoolComplete,
        isClubComplete,
        isVerifying,
        setIsVerifying,
        isVerifyComplete,
        setIsVerifyingComplete,
        clearFormData,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="error"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 w-full  z-50 "
        >
          {showError && (
            <ErrorComponent
              message="Please complete the previous form to proceed."
              status="Oops"
              cancelFunc={() => {
                setError(false);
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center items-center min-h-screen w-full fixed inset-0">
        {bgImages.map((bg, i) => (
          <div
            key={i}
            className={`fixed h-full w-full top-0 left-0 -z-10 transition-opacity duration-1000 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/55"></div>
          </div>
        ))}

        <div className="bg-transparent lg:w-[85%] lg:h-[98vh] w-full h-[100vh] drop-shadow-2xl relative ">
          {/* SIDE NAV */}
          <div className="lg:absolute md:z-20 fixed h-full lg:flex justify-center items-center flex-col lg:w-[6%] w-[14%]">
            <div
              className={`lg:h-[89%] h-full w-full   
glass_effect 
    relative
    overflow-hidden
    lg:rounded-full rounded-tr-[30px] rounded-br-[30px] 
    flex justify-center items-center`}
            >
              <Sidenav />
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div
            className="lg:absolute fixed h-full lg:w-[90%] w-[84%]
lg:glass_effect top-0 right-0 grid lg:grid-cols-[70%,_30%] gap-4 lg:p-[30px]   lg:drop-shadow-none rounded-[30px]"
          >
            <div className="lg:h-full h-full w-full grid lg:block grid-rows-[10%_90%] lg:grid-rows-none lg:overflow-hidden overflow-y-auto overflow-x-hidden bg-transparent scrollbar2">
              {/* MOBILE PROGRESS */}
              <div className="glass_effect rounded-full my-2 w-full flex items-center sticky top-0 z-20 lg:hidden py-[1rem] scrollbar2">
                {displaySteps.map((step, i) => {
                  const isStepTwoActive =
                    i === 3 && orgPaths.includes(pathname);
                  const isActive = step.path === pathname || isStepTwoActive;
                  const completed = isStepComplete(i);
                  
                  if (!isClient) {
                    return (
                      <div key={i} className="flex items-center justify-center gap-3 relative w-full">
                        <span className="h-[35px] w-[35px] flex justify-center items-center rounded-full text-[0.8rem] border backdrop-blur-lg border border-slate-300/25 shadow-inner text-white">
                          <span className="text-[0.9rem]">{i + 1}</span>
                        </span>
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      onClick={() => {
                        if (i === 0) openFirstStep();
                        else if (i === 1) openSecondStep();
                        else if (i === 2) openThirdStep();
                        else if (i === 3) openFourthStep();
                        else if (i === 4) openFifthStep();
                      }}
                      key={i}
                      className="flex items-center justify-center gap-3 relative w-full cursor-pointer"
                    >
                      <span
                        className={`transition-all duration-200 h-[35px] w-[35px] flex justify-center items-center rounded-full text-[0.8rem] border
                          ${
                            isActive
                              ? "bg-black text-white border-none"
                              : completed
                                ? "border-green-500 bg-slate-800 border"
                                : "backdrop-blur-lg border border-slate-300/25 shadow-inner text-white"
                          }`}
                      >
                        {completed ? (
                          <div className="h-[40px] w-[40px] flex justify-center items-center bg-slate-800 absolute border-[1px] border-green-500 rounded-full">
                            <FaCheck className="text-green-500" />
                          </div>
                        ) : (
                          <span className="text-[0.9rem]">
                            {i == 4 ? (
                              <div>
                                {!isVerifying ? (
                                  <span>{i + 1}</span>
                                ) : (
                                  <span className="border-[2px] border-r-yellow-500 rounded-full h-full w-full animate-spin absolute top-0 left-0 bg-slate-800"></span>
                                )}
                              </div>
                            ) : (
                              <div>{i + 1}</div>
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="h-full">{children}</div>
            </div>

            {/* DESKTOP PROGRESS PANEL */}
            <div className="overflow-x-hidden scrollbar2 glass_effect rounded-[30px] lg:h-[65%] px-[20px] lg:flex flex-col justify-center hidden">
              <div className="flex flex-col gap-3">
                {displaySteps.map((step, i) => {
                  const isStepTwoActive =
                    i === 3 && orgPaths.includes(pathname);
                  const isActive = step.path === pathname || isStepTwoActive;
                  const completed = isStepComplete(i);
                  
                  if (!isClient) {
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="h-[40px] w-[40px] flex justify-center items-center rounded-full text-[0.8rem] border backdrop-blur-lg border border-slate-300/25 shadow-inner bg-slate-200/25">
                          <span className="text-[0.9rem]">{i + 1}</span>
                        </span>
                        <span className="text-[0.8rem] text-white">{step.name}</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (i === 0) openFirstStep();
                        else if (i === 1) openSecondStep();
                        else if (i === 2) openThirdStep();
                        else if (i === 3) openFourthStep();
                        else if (i === 4) openFifthStep();
                      }}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <span
                        className={`relative transition-all duration-200 h-[40px] w-[40px] flex justify-center items-center rounded-full text-[0.8rem] border
                          ${
                            isActive
                              ? "bg-black text-white border-none"
                              : completed
                                ? "border-green-500 glass_effect relative border"
                                : "backdrop-blur-lg border border-slate-300/25 shadow-inner bg-slate-200/25"
                          }`}
                      >
                        {completed ? (
                          <div className="h-[40px] w-[40px] flex justify-center items-center bg-transparent absolute border-[2px] bg-slate-800 border-green-500 rounded-full">
                            <FaCheck className="text-green-500" />
                          </div>
                        ) : (
                          <span className="text-[0.9rem]">
                            {i === 4 ? (
                              <div>
                                {!isVerifying ? (
                                  <span>{i + 1}</span>
                                ) : (
                                  <span className="border-[2px] border-r-yellow-500 rounded-full h-full w-full animate-spin absolute top-0 left-0 bg-slate-800"></span>
                                )}
                              </div>
                            ) : (
                              <div>{i + 1}</div>
                            )}
                          </span>
                        )}
                      </span>

                      <span className="text-[0.8rem] text-white">
                        {i == 4 ? (
                          <div>
                            {!isVerifying ? (
                              <span>{step.name}</span>
                            ) : (
                              <span>Verifying...</span>
                            )}
                          </div>
                        ) : (
                          <div>{step.name}</div>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </OrganizationContext.Provider>
  );
}

export function OrgSignUp() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("OrgSignUp must be used inside BodyProvider");
  }
  return context;
}