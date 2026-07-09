// components/dashboard_admin_users_details_course.tsx
import { useEffect, useState } from "react";
import DashboardProgressBar from "../dashboard_progress_bar";
import Loader from "../loader";

interface Props {
  userId: string;
}

interface CourseEnrollment {
  id: string;
  title: string;
  description: string;
  image: string;
  level: string;
  createdBy: string;
  status: string;
  enrolledAt: string;
  completedAt: string | null;
  progress: number;
  moduleCount: number;
  lessonCount: number;
}

export default function DashboardAdminUsersDetailsCourse({
  userId,
}: Props) {
  const [courseDetails, setCourseDetails] = useState<CourseEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserCourses = async () => {
      setIsLoading(true);
      setError(null);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      try {
        const res = await fetch(
          `${API_URL}/api/organizations/user-details/${userId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "An error occurred while fetching courses");
          setIsLoading(false);
          return;
        }

        // Extract enrolled courses from the response
        const enrolledCourses = data.data?.courses?.enrolled || [];
        setCourseDetails(enrolledCourses);
        console.log("Fetched user courses:", enrolledCourses);
      } catch (error) {
        console.error("Error fetching user courses:", error);
        setError("Failed to load courses");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserCourses();
    }
  }, [userId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <p className="bg-green-500 text-white text-[12px] px-[8px] py-1 rounded-[2px]">
            Completed
          </p>
        );
      case "IN_PROGRESS":
        return (
          <p className="bg-blue-500 text-white text-[12px] px-[8px] py-1 rounded-[2px]">
            In Progress
          </p>
        );
      case "ENROLLED":
        return (
          <p className="bg-yellow-500 text-white text-[12px] px-[8px] py-1 rounded-[2px]">
            Enrolled
          </p>
        );
      default:
        return (
          <p className="bg-gray-500 text-white text-[12px] px-[8px] py-1 rounded-[2px]">
            Not Started
          </p>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
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
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        <button
          onClick={() => {
            // Trigger re-fetch
            const fetchUserCourses = async () => {
              setIsLoading(true);
              setError(null);
              const API_URL = process.env.NEXT_PUBLIC_API_URL;
              try {
                const res = await fetch(
                  `${API_URL}/api/organizations/user-details/${userId}`,
                  {
                    method: "GET",
                    credentials: "include",
                  }
                );
                const data = await res.json();
                if (!res.ok) {
                  setError(data.message || "An error occurred");
                  setIsLoading(false);
                  return;
                }
                const enrolledCourses = data.data?.courses?.enrolled || [];
                setCourseDetails(enrolledCourses);
              } catch (error) {
                console.error("Error fetching user courses:", error);
                setError("Failed to load courses");
              } finally {
                setIsLoading(false);
              }
            };
            fetchUserCourses();
          }}
          className="mt-2 px-4 py-2 bg-primaryColors-0 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {courseDetails.length === 0 ? (
        <div className="text-center py-4 text-textGrey-0 dark:text-gray-400 text-sm">
          No courses enrolled yet
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {courseDetails.map((course, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 bg-shadyColor-0 dark:bg-shadyColor-0 p-[16px] rounded-lg"
            >
              <div className="flex justify-between items-center">
                <h1 className="font-semibold text-textSlightDark-0 dark:text-white text-[13px] truncate flex-1 mr-2">
                  {course.title}
                </h1>
                {getStatusBadge(course.status)}
              </div>
              <div className="flex justify-between items-center">
                <h1 className="text-textSlightDark-0 dark:text-gray-300 text-[12px] font-semibold">
                  {course.level}
                </h1>
                <p className="text-textGrey-0 dark:text-gray-400 text-[12px]">
                  {course.progress}%
                </p>
              </div>
              <DashboardProgressBar
                backgroundColor="#FFA500"
                width={course.progress}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}