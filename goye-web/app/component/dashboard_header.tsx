"use client";

import { useEffect, useRef, useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import { MdNotifications } from "react-icons/md";
import DashboardNotification from "./dashboard_notification";
import { FaBell } from "react-icons/fa";
import { HiUserCircle } from "react-icons/hi";
import {motion} from 'framer-motion'
interface Details {
  first_name?: string;
  profile_pic?: string;
}
export default function DashboardHeader() {
  //TO SHOW NOTIFICATION
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [details, setDetails] = useState<Details>({
    first_name: "",
    profile_pic: "",
  });
  //greeting
  const [getHours, setGetHours] = useState<string>("");
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<string>("");

  useEffect(() => {
    const savedUser = localStorage.getItem("first_name");
    if (savedUser) {
      setUser(savedUser);
    }
    //fetch mere details
    const fetchSomeDetails = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
        const profilePic = data.user?.user_pic;
        setDetails({
          profile_pic: profilePic,
        });
      } catch (error) {
        console.error(error);
      }
    };
    fetchSomeDetails();

    //grettings
    const hours = new Date().getHours();
    if (hours < 12) {
      setGetHours("Good mourning");
    } else if (hours < 17) {
      setGetHours("Good afternoon");
    } else {
      setGetHours("Good evening");
    }
    //click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setShowNotification(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <>
      <div className=" md:px-8 md:py-2 md:bg-secondaryColors-0 py-[25px] px-[16px] md:h-auto bg-primaryColors-0 md:static absolute top-0 left-0 h-[10%] w-full flex md:block justify-between md:justify-end items-center">
        <div className="md:flex justify-end items-center gap-5 hidden">
          <div className="text-[#71748C]/20 relative">
            <div onClick={() => setShowNotification(!showNotification)}>
              <MdNotifications color="" size={23} />
            </div>
            {showNotification && (
              <div ref={boxRef}>
                <DashboardNotification />
              </div>
            )}
          </div>
          <div className="h-[40px] w-[1px] bg-[#71748C]/10"></div>
          <div className="h-[45px] w-[45px] bg-[#71748C]/10 rounded-full overflow-hidden">
            {details.profile_pic ? (
              <img
                src={details.profile_pic}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                {/* Optional: Add a placeholder icon */}
                <HiUserCircle size={24} color="#666" />
              </div>
            )}
          </div>
          <IoChevronDown />
        </div>
        <div className="md:hidden flex items-center justify-between text-white w-full">
          <div className="flex items-center gap-4">
            <span className="w-[50px] h-[50px] rounded-full border-2 border-white overflow-hidden">
              {details.profile_pic ? (
                <img
                  src={details.profile_pic}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  {/* Optional: Add a placeholder icon */}
                  <HiUserCircle size={24} color="#666" />
                </div>
              )}
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="text-[12px]">{getHours}</h1>
              <p className="font-semibold text-[22px]">Pst {user}</p>
            </div>
          </div>
          <div>
            <FaBell />
          </div>
        </div>
      </div>
    </>
  );
}
