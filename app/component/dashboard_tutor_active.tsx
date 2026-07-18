"use client";

import { useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import DashboardProgressBar from "./dashboard_progress_bar";
import Loader from "./loader";

interface Props {
  openStudent?: (studentId: string) => void;
}

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

export default function DashboardTutorActive({ openStudent }: Props) {
  const [studentDetails, setStudentDetails] = useState<StudentDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchStudent = async () => {
    if (!API_URL) {
      console.error('NEXT_PUBLIC_API_URL is not defined');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/enroll/fetch-all-students`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        console.log("Error fetching students");
        setIsLoading(false);
        return;
      }

      // Filter only online (active) students
      const activeStudents = data.data.students.filter((s: StudentDetails) => s.is_online === true);
      setStudentDetails(activeStudents);
    } catch (error) {
      console.error("Error fetching active students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openStudentId = (id: string) => {
    if (openStudent) {
      openStudent(id);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  return (
    <>
      {!isLoading ? (
        <>
          {studentDetails.length > 0 ? (
            <div className="dashboard_content_mainbox">
              {studentDetails.map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 cursor-pointer md:p-0 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => openStudentId(s.student_id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <div className="h-[40px] w-[40px] bg-textGrey-0 rounded-full overflow-hidden flex justify-center items-center">
                        {s.profile_picture ? (
                          <img
                            src={s.profile_picture}
                            alt="pic"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <CgProfile size={40} />
                        )}
                      </div>
                      <div>
                        <h1 className="text-textSlightDark-0 dark:text-white font-bold text-[14px]">
                          {s.last_name} {s.first_name}
                        </h1>
                        <p className="text-[13px] text-textSlightDark-0 dark:text-gray-400">{s.email}</p>
                      </div>
                    </div>
                    <p className="bg-green-500 text-white rounded-[2px] font-[600] text-[12px] px-[8px] py-[4px]">
                      🟢 ONLINE
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <h1 className="font-[600] text-[13px] text-textSlightDark-0 dark:text-gray-300 capitalize">
                      {s.level}
                    </h1>
                    <p className="text-[13px] text-textGrey-0 dark:text-gray-400">Last Active: Now</p>
                  </div>
                  <DashboardProgressBar backgroundColor="#30A46F" width={s.total_in_progress_courses} />
                  <div className="flex justify-around items-center w-full my-2">
                    <div className="flex flex-col gap-1 items-center text-textSlightDark-0 dark:text-white">
                      <h1 className="font-[700] text-[18px]">{s.total_courses_enrolled}</h1>
                      <p className="text-textGrey-0 dark:text-gray-400 text-[13px]">Enrolled</p>
                    </div>
                    <div className="flex flex-col gap-1 items-center text-textSlightDark-0 dark:text-white">
                      <h1 className="font-[700] text-[18px]">{s.total_completed_courses}</h1>
                      <p className="text-textGrey-0 dark:text-gray-400 text-[13px]">Completed</p>
                    </div>
                    <div className="flex flex-col gap-1 items-center text-textSlightDark-0 dark:text-white">
                      <h1 className="font-[700] text-[18px]">{s.total_in_progress_courses}%</h1>
                      <p className="text-textGrey-0 dark:text-gray-400 text-[13px]">Avg Progress</p>
                    </div>
                  </div>
                  <div className="dashboard_thick_hr my-5"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-textGrey-0 dark:text-gray-400">No active students at the moment</p>
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center py-12">
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