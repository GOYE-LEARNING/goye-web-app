import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaAngleDoubleUp } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import DashboardTutorStudentDetailsCourse from "./dashboard_tutor_student_details_course";
import DashboardTutorStudentDetailsGroup from "./dashboard_tutor_student_details_groups";
import Loader from "./loader";
import { FaCircleUser } from "react-icons/fa6";
interface Props {
  cancel: () => void;
  studentId: string;
}

interface StudentDetails {
  full_name: string;
  email: string;
  level: string;
  profile_pic: string;
}


interface StudentEnrollmentForGroupDetails {
  group_title: string;
  joined_at: string;
}

export default function DashboardTutorStudentDetails({
  cancel,
  studentId,
}: Props) {
  const [showCourse, setShowCourse] = useState<boolean>(true);
  const [showGroups, setShowGroups] = useState<boolean>(false);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);


  const fetchStudentDetails = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_URL) {
      console.error('NEXT_PUBLIC_API_URL is not defined');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(
        `${API_URL}/api/enroll/fetch-student-details/${studentId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.log("An error occured while fetching student details");
        setIsLoading(false);
        return;
      }

      console.log("Student details:", data);
      setStudentDetails(data.data.student);
    } catch (error) {
      console.error("Error fetching student details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  return (
    <>
      {!isLoading ? (
        <div className="md:w-[390px] w-full fixed top-0 right-0 h-full bg-white dark:bg-secondaryColors-0 drop-shadow-2xl p-[32px] border border-[#E3E3E833] transition-all duration-300 ease-in-out overflow-y-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-textSlightDark-0 dark:text-white font-bold text-[24px]">
              Student Details
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
                <FaCircleUser size={40}/>
              )}
            </div>
            <h1 className="font-semibold text-[22px] text-textSlightDark-0 dark:text-white">
              {studentDetails?.full_name || "Loading..."}
            </h1>
            <p className="text-[14px] text-textGrey-0 dark:text-gray-400">
              {studentDetails?.email || ""}
            </p>
            <span className="text-[13px] flex items-center gap-2 text-boldGreen-0">
              <FaAngleDoubleUp /> {studentDetails?.level}
            </span>
          </div>

          <div className="bg-primaryColors-0 grid grid-cols-2 h-[32px] p-[4px] text-[12px] gap-2">
            <button
              onClick={() => {
                setShowCourse(true);
                setShowGroups(false);
              }}
              className={` ${showCourse && "bg-[#ffffff] text-secondaryColors-0 drop-shadow-sm"}`}
            >
              Courses
            </button>
            <button
              onClick={() => {
                setShowCourse(false);
                setShowGroups(true);
              }}
              className={` ${showGroups && "bg-[#ffffff] text-secondaryColors-0 drop-shadow-sm"}`}
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
                <DashboardTutorStudentDetailsCourse studentId={studentId}/>
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
                <DashboardTutorStudentDetailsGroup />
              </motion.div>
            )}
          </AnimatePresence>
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
