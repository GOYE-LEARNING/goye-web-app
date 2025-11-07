"use client";

import pic from "@/public/images/goye-removebg-preview.png";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { MdMenu, MdSearch } from "react-icons/md";

export default function LandingPageNavBar() {
  const [box, showBox] = useState<boolean>(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const childrenVariant = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: { opacity: 1, y: 0 },
  };

  const parentVaraiants = {
    kids: {
      staggerChildren: 0.3,
    },
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    showBox((prev) => !prev);
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const removeDropdown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        showBox(false);
      }
    };
    document.addEventListener("mousedown", removeDropdown);
    return () => document.removeEventListener("mousedown", removeDropdown);
  }, []);

  return (
    <div
      className={`bg-[#ffffff] sticky top-0 left-0 w-full py-[20px] px-[24px] md:py-[25px] gap-5 flex md:justify-around  items-center z-40 drop-shadow-sm`}
    >
      {/* Logo */}
      <div>
        <Image src={pic} alt="logo" height={100} width={100} />
      </div>

      {/* Search Input */}
      <div className="relative bg-white flex gap-2 items-center border border-[#D2D5DA] h-[40px] p-[20px] max-md:hidden">
        <MdSearch />
        <input
          type="text"
          placeholder="Foundation of Discipleship"
          className="bg-transparent border-none outline-none w-[514px]"
        />
      </div>

      {/* Main Buttons (Desktop) */}
      <div className="hidden md:flex items-center md:flex-row flex-col md:justify-start justify-center gap-3">
        <button className="nav_btn md:w-[93px] w-full md:border md:border-primaryColors-0">
          Login
        </button>
        <button className="nav_btn md:w-[93px] w-full md:bg-primaryColors-0 md:text-white text-primaryColors-0">
          Signup
        </button>
      </div>

      {/* Mobile Menu Icon */}

      <div className="flex items-center justify-end md:hidden w-full gap-2">
        <motion.div
          className={`transform transition-all duration-200 ${
            showSearch
              ? "w-[40px] p-[5px] flex justify-center items-center border-none"
              : "w-full px-2 py-3 h-[40px] flex items-center gap-2"
          } flex border`}
        >
          <span className="" onClick={toggleSearch}>
            <CiSearch size={28} />
          </span>
          <input
            type="text"
            placeholder="Foundation of Discipleship"
            className={` ${
              showSearch
                ? "w-0"
                : "bg-transparent border-none outline-none w-full"
            }`}
          />
        </motion.div>
        <div
          className="md:hidden block cursor-pointer"
          onClick={toggleDropdown}
          ref={boxRef}
        >
          <MdMenu size={28} />
          <AnimatePresence mode="wait">
            {box && (
              <motion.div
                key="nav_btn"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute bottom-[-125px] left-0 bg-white flex flex-col justify-center items-center w-full py-5 px-4 drop-shadow-sm rounded-md"
              >
                <button className="nav_btn w-full border border-primaryColors-0 mb-2">
                  Login
                </button>
                <button className="nav_btn w-full bg-primaryColors-0 text-white">
                  Signup
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
