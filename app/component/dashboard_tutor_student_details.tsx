"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaAngleDoubleUp, FaRegCommentDots } from "react-icons/fa";
import { MdOutlineCancel, MdNotificationsActive } from "react-icons/md";
import DashboardTutorStudentDetailsCourse from "./dashboard_tutor_student_details_course";
import DashboardTutorStudentDetailsGroup from "./dashboard_tutor_student_details_groups";
import Loader from "./loader";
import { FaCircleUser } from "react-icons/fa6";
import MessagesModal from "./MessagesModal";
import { useModal } from "@/app/context/SimpleModalContext";
import { useI18n } from "@/app/context/I18nContext";
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

interface StudentEnrollment {
  course_title: string;
  course_level: string;
  progress: string;
}

interface StudentGroup {
  group_title: string;
  joined_at: string;
}

interface StudentData {
  student: StudentDetails;
  enrollments: StudentEnrollment[];
  groups: StudentGroup[];
}

export default function DashboardTutorStudentDetails({
  cancel,
  studentId,
}: Props) {
  const [showCourse, setShowCourse] = useState<boolean>(true);
  const [showGroups, setShowGroups] = useState<boolean>(false);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showMessages, setShowMessages] = useState<boolean>(false);
  const [isNotifying, setIsNotifying] = useState<boolean>(false);
  const { showModal } = useModal();
  const { t } = useI18n();

  const notifyStudent = async () => {
    if (isNotifying) return;
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setIsNotifying(true);
    try {
      const res = await fetch(
        `${API_URL}/api/enroll/notify-student/${studentId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        showModal(
          t("Couldn't send"),
          data?.message || t("Failed to notify this student. Please try again."),
          "error",
        );
        return;
      }
      showModal(
        t("Notification sent"),
        `${studentData?.student?.full_name || t("The student")} ${t("has been reminded to keep learning.")}`,
        "success",
      );
    } catch (error) {
      console.error("Error notifying student:", error);
      showModal(t("Error"), t("An unexpected error occurred."), "error");
    } finally {
      setIsNotifying(false);
    }
  };

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
        console.log("An error occurred while fetching student details");
        setIsLoading(false);
        return;
      }

      // Store all data at once - student, enrollments, and groups
      setStudentData({
        student: data.data.student,
        enrollments: data.data.enrollments || [],
        groups: data.data.groups || [],
      });
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
    <div className="w-full h-full bg-white dark:bg-secondaryColors-0 border border-[#E3E3E833] p-[32px] overflow-y-auto">
      {!isLoading ? (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-lightBoldText-0 dark:text-textSlightDark-0 font-bold text-[24px]">
              {t("Student Details")}
            </h1>
            <span onClick={cancel} className="cursor-pointer text-lightBoldText-0 dark:text-textSlightDark-0">
              <MdOutlineCancel size={20} className="text-[18px]" />
            </span>
          </div>

          <div className="dashboard_hr mt-[32px]"></div>
          <div className="flex justify-center items-center flex-col gap-2 my-5">
            <div className="h-[64px] w-[64px] rounded-full overflow-hidden flex justify-center items-center bg-gray-200 dark:bg-gray-700">
              {studentData?.student?.profile_pic ? (
                <img
                  src={studentData?.student?.profile_pic}
                  alt={t("pic")}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FaCircleUser size={40} className="text-gray-400"/>
              )}
            </div>
            <h1 className="font-semibold text-[22px] text-lightBoldText-0 dark:text-textSlightDark-0">
              {studentData?.student?.full_name || "—"}
            </h1>
            <p className="text-[14px] text-textGrey-0">
              {studentData?.student?.email || ""}
            </p>
            <span className="text-[13px] flex items-center gap-2 text-boldGreen-0">
              <FaAngleDoubleUp /> {studentData?.student?.level || "—"}
            </span>

            {/* Communicate with / notify this student */}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => setShowMessages(true)}
                className="flex items-center gap-2 text-[13px] font-semibold text-primaryColors-0 border border-primaryColors-0/40 rounded-full px-4 py-[6px] hover:bg-primaryColors-0/10 transition-colors"
              >
                <FaRegCommentDots size={14} /> {t("Chat")}
              </button>
              <button
                onClick={notifyStudent}
                disabled={isNotifying}
                className="flex items-center gap-2 text-[13px] font-semibold text-primaryColors-0 border border-primaryColors-0/40 rounded-full px-4 py-[6px] hover:bg-primaryColors-0/10 transition-colors disabled:opacity-50"
              >
                <MdNotificationsActive size={15} />
                {isNotifying ? t("Sending…") : t("Notify")}
              </button>
            </div>
          </div>

          <div className="bg-primaryColors-0 grid grid-cols-2 h-[32px] p-[4px] text-[12px] gap-2">
            <button
              onClick={() => {
                setShowCourse(true);
                setShowGroups(false);
              }}
              className={` ${showCourse && "bg-[#ffffff] text-secondaryColors-0 drop-shadow-sm"}`}
            >
              {t("Courses")}
            </button>
            <button
              onClick={() => {
                setShowCourse(false);
                setShowGroups(true);
              }}
              className={` ${showGroups && "bg-[#ffffff] text-secondaryColors-0 drop-shadow-sm"}`}
            >
              {t("Group")}
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
                <DashboardTutorStudentDetailsCourse enrollments={studentData?.enrollments || []} isLoading={false}/>
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
                <DashboardTutorStudentDetailsGroup groups={studentData?.groups || []} isLoading={false}/>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="flex justify-center items-center h-full mt-9">
          <Loader
            full_border_color="transparent"
            height={30}
            width={30}
            border_width={4}
            small_border_color="#49151B"
          />
        </div>
      )}

      <MessagesModal
        isOpen={showMessages}
        onClose={() => setShowMessages(false)}
        initialContact={
          studentData?.student
            ? {
                id: studentId,
                name: studentData.student.full_name,
                first_name: studentData.student.full_name.split(" ")[0] || studentData.student.full_name,
                avatar: studentData.student.profile_pic,
              }
            : null
        }
      />
    </div>
  );
}
