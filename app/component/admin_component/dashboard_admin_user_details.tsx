// components/dashboard_admin_user_details.tsx
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
  checkSuspendedUser: boolean;
}

interface UserDetails {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email_address: string;
  phone_number: string;
  country: string;
  state: string;
  user_pic: string | null;
  role: string;
  userType: string;
  level: string;
  isOnline: boolean;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
  isProfileComplete: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
}

interface OrganizationData {
  role: string;
  joinedAt: string;
  joinedVia: string;
  isActive: boolean;
}

interface StatsData {
  totalEnrolledCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalLessons: number;
  completedLessons: number;
  overallProgress: number;
  averageQuizScore: number;
  totalQuizAttempts: number;
  totalAchievements: number;
  totalBadges: number;
  coursesCreated: number;
}

interface UserDetailsResponse {
  user: UserDetails;
  organization: OrganizationData;
  stats: StatsData;
  courses: {
    enrolled: any[];
    created: any[];
  };
  achievements: any[];
  badges: any[];
  settings: any;
  quizHistory: any[];
  invitation: any;
}

export default function DashboardAdminUserDetails({
  cancel,
  userId,
  suspendUserFunc,
  checkSuspendedUser,
}: Props) {
  const [showCourse, setShowCourse] = useState<boolean>(true);
  const [showGroups, setShowGroups] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<UserDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(
        `${API_URL}/api/organizations/user-details/${userId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();
      setIsLoading(false);
      
      if (!res.ok) {
        setError(data.message || "An error occurred while fetching user details");
        return;
      }

      console.log("User details response:", data);
      setUserDetails(data.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Failed to load user details");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "org_admin":
        return "Organization Admin";
      case "admin":
        return "Admin";
      case "instructor":
      case "tutor":
        return "Instructor";
      case "student":
        return "Student";
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  if (isLoading) {
    return (
      <div className="md:w-[390px] w-full fixed top-0 right-0 h-full bg-white dark:bg-secondaryColors-0 drop-shadow-2xl p-[32px] border border-[#E3E3E833] transition-all duration-300 ease-in-out flex justify-center items-center">
        <Loader
          full_border_color="transparent"
          height={30}
          width={30}
          border_width={4}
          small_border_color="#49151B"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="md:w-[390px] w-full fixed top-0 right-0 h-full bg-white dark:bg-secondaryColors-0 drop-shadow-2xl p-[32px] border border-[#E3E3E833] transition-all duration-300 ease-in-out flex flex-col justify-center items-center">
        <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        <button
          onClick={fetchUserDetails}
          className="mt-4 px-4 py-2 bg-primaryColors-0 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="md:w-[390px] w-full fixed top-0 right-0 h-full bg-white dark:bg-secondaryColors-0 drop-shadow-2xl p-[32px] border border-[#E3E3E833] transition-all duration-300 ease-in-out flex flex-col justify-center items-center">
        <p className="text-gray-500 dark:text-gray-400">No user data available</p>
      </div>
    );
  }

  const { user, stats } = userDetails;

  return (
    <div className="md:w-[390px] w-full fixed top-0 right-0 h-full bg-white dark:bg-secondaryColors-0 drop-shadow-2xl p-[32px] border border-[#E3E3E833] transition-all duration-300 ease-in-out overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-textSlightDark-0 dark:text-white font-bold text-[24px]">
          User Details
        </h1>
        <span onClick={cancel} className="cursor-pointer">
          <MdOutlineCancel size={20} className="text-[18px] dark:text-gray-400" />
        </span>
      </div>

      <div className="dashboard_hr mt-[32px] dark:border-gray-700"></div>

      {/* User Profile */}
      <div className="flex justify-center items-center flex-col gap-2 my-5">
        <div className="h-[80px] w-[80px] rounded-full overflow-hidden flex justify-center items-center bg-gray-200 dark:bg-gray-700 border-4 border-primaryColors-0">
          {user?.user_pic ? (
            <img
              src={user.user_pic}
              alt={user.full_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <FaCircleUser size={50} className="text-gray-400 dark:text-gray-500" />
          )}
        </div>
        <h1 className="font-semibold text-[22px] text-textSlightDark-0 dark:text-white">
          {user?.full_name || "User"}
        </h1>
        <p className="text-[14px] text-textGrey-0 dark:text-gray-400">
          {user?.email_address || "No email provided"}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          <span className="text-[13px] flex items-center gap-2 text-boldGreen-0 dark:text-green-400">
            <FaAngleDoubleUp /> {user?.level || "Beginner"}
          </span>
          <span className="text-xs md:text-[13px] flex items-center gap-2 text-purple-600 dark:text-purple-400">
            {getRoleDisplayName(user?.role || "member")}
          </span>
          {user?.isOnline && (
            <span className="text-xs flex items-center gap-1 text-green-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Online
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2 my-4">
        <div className="bg-gray-50 dark:bg-shadyColor-0 p-3 rounded-lg text-center">
          <p className="text-xl font-bold text-primaryColors-0">{stats?.totalEnrolledCourses || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Enrolled</p>
        </div>
        <div className="bg-gray-50 dark:bg-shadyColor-0 p-3 rounded-lg text-center">
          <p className="text-xl font-bold text-green-500">{stats?.completedCourses || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
        </div>
        <div className="bg-gray-50 dark:bg-shadyColor-0 p-3 rounded-lg text-center">
          <p className="text-xl font-bold text-blue-500">{stats?.overallProgress || 0}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
        </div>
        <div className="bg-gray-50 dark:bg-shadyColor-0 p-3 rounded-lg text-center">
          <p className="text-xl font-bold text-purple-500">{stats?.totalAchievements || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Achievements</p>
        </div>
      </div>

      <div className="bg-primaryColors-0 grid grid-cols-2 h-[32px] p-[4px] text-[12px] gap-2 rounded-lg">
        <button
          onClick={() => {
            setShowCourse(true);
            setShowGroups(false);
          }}
          className={`rounded-md transition-all ${
            showCourse
              ? "bg-[#ffffff] text-secondaryColors-0 drop-shadow-sm"
              : "text-white/80 hover:text-white"
          }`}
        >
          Courses ({stats?.totalEnrolledCourses || 0})
        </button>
        <button
          onClick={() => {
            setShowCourse(false);
            setShowGroups(true);
          }}
          className={`rounded-md transition-all ${
            showGroups
              ? "bg-[#ffffff] text-secondaryColors-0 drop-shadow-sm"
              : "text-white/80 hover:text-white"
          }`}
        >
          Groups
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
            className="mt-4"
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
            className="mt-4"
          >
            <DashboardAdminUsersDetailsGroup />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          onClick={cancel}
          className="h-[50px] border border-[#D9D9D9] dark:border-gray-700 text-[14px] text-textSlightDark-0 dark:text-gray-300 font-[600] rounded-lg hover:bg-gray-50 dark:hover:bg-shadyColor-0 transition-colors"
        >
          Done
        </button>
        {!checkSuspendedUser ? (
          <button
            className="h-[50px] border border-[#D9D9D9] dark:border-gray-700 text-[#DA0E29] text-[14px] flex justify-center items-center gap-2 font-[600] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            onClick={suspendUserFunc}
          >
            <FcCancel /> Suspend Access
          </button>
        ) : (
          <button className="h-[50px] border border-[#D9D9D9] dark:border-gray-700 text-[#065BCD] dark:text-blue-400 text-[14px] flex justify-center items-center gap-2 font-[600] rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <IoMdRefresh /> Restore User
          </button>
        )}
      </div>
    </div>
  );
}