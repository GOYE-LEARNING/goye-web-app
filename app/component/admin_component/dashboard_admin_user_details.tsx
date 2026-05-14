import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaAngleDoubleUp } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import DashboardAdminUsersDetailsGroup from "./dashboard_admin_user_group_details";
import DashboardAdminUsersDetailsCourse from "./dashboard_admin_user_courses_details";
import Loader from "../loader";
import { FaCircleUser } from "react-icons/fa6";
import { FcCancel } from "react-icons/fc";
import { IoMdRefresh } from "react-icons/io";
interface Props {
  cancel: () => void;
  userId: string;
  suspendUserFunc: () => void;
  checkSuspendedUser: boolean
}

interface UserDetails {
  full_name: string;
  email: string;
  level: string;
  profile_pic: string;
}

interface UserForGroupDetails {
  group_title: string;
  joined_at: string;
}

export default function DashboardAdminUserDetails({ cancel, userId, suspendUserFunc, checkSuspendedUser }: Props) {
  const [showCourse, setShowCourse] = useState<boolean>(true);
  const [showGroups, setShowGroups] = useState<boolean>(false);
  const [studentDetails, setStudentDetails] = useState<UserDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchStudentDetails = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      setIsLoading(false);
      const res = await fetch(`${API_URL}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      setIsLoading(false);
      if (!res.ok) {
        console.log("An error occured while fetching student details");
        return;
      }

      console.log(data);
      setStudentDetails(data.data.student);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="md:w-[390px] w-full fixed top-0 right-0 h-full bg-white drop-shadow-2xl p-[32px] border border-[#E3E3E833] transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center">
            <h1 className="text-textSlightDark-0 font-bold text-[24px]">
              User Details
            </h1>
            <span onClick={cancel} className="cursor-pointer">
              <MdOutlineCancel size={20} className="text-[18px]" />
            </span>
          </div>

          <div className="dashboard_hr mt-[32px]"></div>
          <div className="flex justify-center items-center flex-col gap-2 my-5">
            <div className="h-[64px] w-[64px] rounded-full overflow-hidden flex justify-center items-center">
              {studentDetails?.profile_pic ? (
                <img
                  src={studentDetails?.profile_pic}
                  alt="pic"
                  className="h-full w-full"
                />
              ) : (
                <FaCircleUser size={40} />
              )}
            </div>
            <h1 className="font-semibold text-[22px] text-textSlightDark-0">
              {studentDetails?.full_name.replace(" ", "")}
            </h1>
            <p className="text-[14px] text-textGrey-0">
              {studentDetails?.email}
            </p>
            <span className="text-[13px] flex items-center gap-2 text-boldGreen-0">
              <FaAngleDoubleUp /> {studentDetails?.level}
            </span>
          </div>

          <div className="bg-[#F1F1F4CC] grid grid-cols-2 h-[32px] p-[4px] text-[12px] gap-2">
            <button
              onClick={() => {
                setShowCourse(true);
                setShowGroups(false);
              }}
              className={` ${showCourse && "bg-[#ffffff] drop-shadow-sm"}`}
            >
              Courses
            </button>
            <button
              onClick={() => {
                setShowCourse(false);
                setShowGroups(true);
              }}
              className={` ${showGroups && "bg-[#ffffff] drop-shadow-sm"}`}
            >
              Group
            </button>
          </div>

          <AnimatePresence mode="wait">
            {showCourse && (
              <motion.div
                key="course"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeIn" }}
              >
                <DashboardAdminUsersDetailsCourse userId={userId} />
              </motion.div>
            )}
            {showGroups && (
              <motion.div
                key="group"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeIn" }}
              >
                <DashboardAdminUsersDetailsGroup />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
            <button className="h-[50px] border border-[#D9D9D9] text-[14px] text-textSlightDark-0 font-[600]">
              Done
            </button>
            {!checkSuspendedUser ? (
              <button className="h-[50px] border border-[#D9D9D9] text-[#DA0E29] text-[14px] flex justify-center items-center gap-2 font-[600]" onClick={() => {
                suspendUserFunc()
              }}>
                <FcCancel /> Suspend Access
              </button>
            ) : (
              <button className="h-[50px] border border-[#D9D9D9] text-[#065BCD] text-[14px] flex justify-center items-center gap-2 font-[600] ">
                <IoMdRefresh /> Restore User
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-9">
          <Loader
            full_border_color="transparent"
            height={30}
            width={30}
            border_width={4}
            small_border_color="#49151B"
          />
        </div>
      )}
    </>
  );
}
