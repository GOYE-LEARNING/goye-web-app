"use client";
interface Props {
  openStudent: (studentId: string) => void;
  search: string;
}
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardProgressBar from "./dashboard_progress_bar";
import { CgProfile } from "react-icons/cg";
import Loader from "./loader";
interface StudentDetails {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  level: string;
  profile_picture: string;
  is_online: boolean;
  total_completed_courses: number;
  total_courses_enrolled: number;
  total_in_progress_courses: number;
}
export default function DashboardTutorAllTab({
  openStudent,
  search,
}: Props) {
  const [studentDetails, setStudentDetails] = useState<StudentDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const fetchStudent = async () => {
    if (!API_URL) {
      console.error('NEXT_PUBLIC_API_URL is not defined');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/enroll/fetch-all-students`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok || !data?.data?.students) {
        console.log("An error occurred while fetching students");
        return;
      }

      setStudentDetails(data.data.students);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtererStudent = studentDetails.filter(
    (s) =>
      s.first_name.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name.toLowerCase().includes(search.toLowerCase())
  );

  const openStudentId = (id?: string) => {
    openStudent(id as any);
  };


  useEffect(() => {
    fetchStudent();
  }, []);
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
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

  if (studentDetails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
        <p className="text-textSlightDark-0 dark:text-white font-semibold">No students yet</p>
        <p className="text-textGrey-0 dark:text-gray-400 text-[13px]">
          Students will appear here once they enroll in one of your courses.
        </p>
        <button
          onClick={() => router.push("/dashboard/tutor/course")}
          className="mt-2 bg-primaryColors-0 text-white text-[13px] font-semibold px-5 py-2 rounded-md"
        >
          Create a Course
        </button>
      </div>
    );
  }

  if (filtererStudent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-center px-4">
        <p className="text-textGrey-0 dark:text-gray-400 text-[13px]">
          No students match your search.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard_content_mainbox">
        {filtererStudent.map((s, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 cursor-pointer md:p-0 p-4"
            onClick={() => {
              openStudentId(s.student_id)
            }}
          >
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <div className="h-[40px] w-[40px] bg-textGrey-0 rounded-full overflow-hidden flex justify-center items-center">
                  {s.profile_picture ? (
                    <img
                      src={s.profile_picture}
                      alt="pic"
                      className="h-full w-full"
                    />
                  ) : (
                    <CgProfile size={40} />
                  )}
                </div>
                <div>
                  <h1 className="text-textSlightDark-0 font-bold text-[14px]">
                    {s.last_name} {s.first_name}
                  </h1>
                  <p className="text-[13px] text-textSlightDark-0">{s.email}</p>
                </div>
              </div>
              <p className="bg-boldGreen-0 text-white rounded-[2px] font-[600] text-[12px] px-[6px]">
                {s.is_online == true ? "ACTIVE" : "NOT ACTIVE"}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <h1 className="font-[600] text-[13px] text-textSlightDark-0 capitalize">
                {s.level}
              </h1>
              <p className="text-[13px] text-textGrey-0">Last Active</p>
            </div>
            <DashboardProgressBar backgroundColor="#30A46F" width={s.total_in_progress_courses} />
            <div className="flex justify-around items-center w-full my-2">
              <div className="flex flex-col gap-1 items-center text-textSlightDark-0">
                <h1 className="font-[700]  text-[18px]">
                  {s.total_courses_enrolled}
                </h1>
                <p className="text-textGrey-0 text-[13px]">Enrolled</p>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <h1 className="font-[700]  text-[18px]">
                  {s.total_completed_courses}
                </h1>
                <p className="text-textGrey-0 text-[13px]">Completed</p>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <h1 className="font-[700]  text-[18px]">
                  {s.total_in_progress_courses}%
                </h1>
                <p className="text-textGrey-0 tedxt-[13px]">Avg Progress</p>
              </div>
            </div>
            <div className="dashboard_thick_hr my-5"></div>
          </div>
        ))}
      </div>
    </>
  );
}
