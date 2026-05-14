"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { GoOrganization } from "react-icons/go";
import { IoMdSchool } from "react-icons/io";
import { PiStudent } from "react-icons/pi";

type Roles = "student" | "tutor" | "organization";

interface PricingData {
  id: string;
  pricing_title: string;
  monthly_price: string;
  annually_price: string;
  pricing_description: string;
  pricing_offers: PricingOffers;
  section_roles: Roles;
}

interface PricingOffers {
  list: string[];
}

// Animation variants with stagger for children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Stagger children appearance
      delayChildren: 0.2,
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1, // Reverse stagger on exit
      duration: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smoother motion
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

// Card variants for individual pricing cards
const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.5,
    },
  },
};

export default function HeroPricingSection() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
  const [princingData, setPricingData] = useState<PricingData[]>([]);
  const [roles, setRoles] = useState<"student" | "tutor" | "organization">(
    "student",
  );
  const [showText, setShowText] = useState<string>("");
  const cardRef = useRef<HTMLDivElement | null>(null);

  const openRoleFunc = (roles: "student" | "tutor" | "organization") => {
    setRoles(roles);
  };

  const fetchPricingData = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/pricing/fetch-pricing-details`,
      );
      const data = await response.json();
      setPricingData(data.data);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPricingData();
  }, []);

  const organizationData = princingData.filter(
    (d) => d.section_roles === "organization",
  );
  const studentData = princingData.filter((d) => d.section_roles === "student");
  const tutorData = princingData.filter((d) => d.section_roles === "tutor");

  const pricing_grid =
    "flex flex-wrap md:gap-6 gap-3 mt-5 justify-center items-center relative z-20";
  const pricing_content =
    "dark:bg-secondaryColors-0/80 bg-white/40 backdrop-blur-md border border-[#ccc]/10 drop-shadow-2xl rounded-[15px] md:w-[340px] h-[420px] w-full py-6 px-5 hover: transition-all duration-300 dark:hover:bg-white/10 hover:bg-white/30 hover:backdrop-blur-lg hover:border-[#ccc]/20 cursor-pointer flex items-start justify-start gap-1 flex-col pricing_card";

  // Get current data based on selected role
  const getCurrentData = () => {
    switch (roles) {
      case "student":
        return studentData;
      case "tutor":
        return tutorData;
      case "organization":
        return organizationData;
      default:
        return studentData;
    }
  };

  return (
    <div className="py-[88px] relative radial-gradient dark:bg-secondaryColors-0/80 backdrop-blur-md bg-lightSecondaryColor-0">
      <div className="relative px-[45px] md:px-0 md:w-full flex justify-center items-center flex-col z-20">
        {/* Header animations */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={containerVariants}
          className="text-center"
        >
          <motion.h1
            variants={itemVariants as any}
            className="dark:text-white text-secondaryColors-0/70 font-medium md:text-[48px] text-[35px]"
          >
            Invest in the Great Commission
          </motion.h1>
          <motion.p
            variants={itemVariants as any}
            className="dark:text-white text-lightBoldText-0/50 text-center text-[15px] md:mt-0 mt-[1rem] md:w-[750px]"
          >
            Knowledge of God will never cost you a thing here. We charge only
            for the tools that help you go where He is sending you.
          </motion.p>
        </motion.div>

        {/* Role selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="h-[50px] md:w-[435px] dark:bg-shadyColor-0/80 bg-lightSecondaryColor-0/80 backdrop-blur-md grid grid-cols-3 gap-2 justify-center items-center px-1 py-1 my-8 rounded-[40px] overflow-hidden drop-shadow-2xl border border-[#ccc]/5 "
        >
          <div
            className={`flex justify-center items-center gap-1 h-[100%] rounded-[40px] cursor-pointer transition-all duration-300 hover:bg-primaryColors-0 dark:hover:text-white ${
              roles === "student" ? "bg-primaryColors-0  text-white" : ""
            }`}
            onClick={() => openRoleFunc("student")}
          >
            <PiStudent />
            Student
          </div>
          <div
            className={`flex justify-center items-center gap-1 h-[100%] rounded-[40px] cursor-pointer transition-all duration-300 hover:bg-primaryColors-0 hover:text-white ${
              roles === "tutor" ? "bg-primaryColors-0 " : ""
            }`}
            onClick={() => openRoleFunc("tutor")}
          >
            <IoMdSchool />
            Tutor
          </div>
          <div
            className={`flex justify-center items-center gap-1 h-[100%] rounded-[40px] cursor-pointer transition-all duration-300 hover:bg-primaryColors-0 hover:text-white ${
              roles === "organization" ? "bg-primaryColors-0 " : ""
            }`}
            onClick={() => openRoleFunc("organization")}
          >
            <GoOrganization />
            Organization
          </div>
        </motion.div>

        {/* Pricing cards with smooth stagger animations */}
        <div className="w-full flex justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              ref={cardRef as any}
              key={roles}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileInView="visible"
              className={pricing_grid}
            >
              {getCurrentData().map((d, index) => (
                <motion.div
                  key={d.id || `${roles}-${index}`}
                  variants={cardVariants as any}
                  custom={index}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  className={pricing_content}
                >
                  <h1 className="dark:text-white/80 text-lightBoldText-0/80">{d.pricing_title}</h1>
                  <div className="flex items-center justify-start gap-3">
                    <h2 className="text-[2.1rem] dark:text-white text-lightBoldText-0/80 font-bold">
                      {d.section_roles == "organization" ? (
                        "Let's Talk"
                      ) : (
                        <div>{d.monthly_price}</div>
                      )}
                    </h2>
                  </div>
                  <p className="dark:text-white/50 text-lightBoldText-0/50 text-[0.8rem]">
                    {d.pricing_description}
                  </p>
                  <button
                    className={`h-[45px] w-[200px] text-white rounded-full flex justify-center items-center dark:bg-secondaryColors-0 bg-primaryColors-0 my-[1rem] transition-all duration-200 border border-[#ccc]/10 drop-shadow-2xl`}
                  >
                    {d.pricing_title == "Free"
                      ? "Try it for Free"
                      : d.pricing_title == "enterprice"
                        ? "Let Talk"
                        : d.section_roles == "organization"
                          ? "Explore More"
                          : "Purchase Now"}
                  </button>
                  <div>
                    <ul
                      className={`flex flex-col gap-3 ${d.section_roles == "organization" ? "my-[1rem" : "my-0"}`}
                    >
                      {d.pricing_offers.list.map((l, index) => (
                        <li
                          className="flex items-center gap-2 text-[0.9rem] dark:text-white/80 text-lightBoldText-0/50"
                          key={index}
                        >
                          <FaCheck /> {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
