import { useEffect, useState } from "react";
import DashboardProgressBar from "./dashboard_progress_bar";
import Loader from "./loader";
interface Props {
  studentId: string;
}

interface StudentEnrollmentForCourseDetails {
  course_title: string;
  course_level: string;
  progress: string;
}

export default function DashboardTutorStudentDetailsCourse({
  studentId,
}: Props) {
  const [courseDetails, setCourseDetails] = useState<
    StudentEnrollmentForCourseDetails[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
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
          console.log("An error occurred while fetching course details");
          setIsLoading(false);
          return;
        }

        console.log("Course enrollments:", data.data.enrollments);
        setCourseDetails(data.data.enrollments);
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId) {
      fetchCourseDetails();
    }
  }, [studentId]);
  return (
    <>
      {!isLoading ? (
        <div>
          {courseDetails.map((c, i) => (
            <div key={i}>
              <div className="flex flex-col gap-2 bg-shadyColor-0 my-5 p-[16px]">
                <div className="flex justify-between items-center">
                  <h1 className="font-semibold text-textSlightDark-0 text-[13px]">
                    {c.course_title}
                  </h1>
                  <p className="bg-boldGreen-0 text-white text-[12px] px-[8px] rounded-[2px]">
                    In Progress
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <h1 className="text-textSlightDark-0 text-[12px] font-semibold">
                    {c.course_level}
                  </h1>
                  <p className="text-textGrey-0 text-[12px] ">{c.progress}</p>
                </div>
                <DashboardProgressBar
                  backgroundColor="#FFA500"
                  width={c.progress as any}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
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
