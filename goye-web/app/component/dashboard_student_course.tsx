'use client'

import { useRouter } from "next/navigation";
interface Props {
  openCourse: () => void
}
export default function DashboardStudentCourse({openCourse} : Props) {
  const navigate = useRouter()
  return (
    <>
      <div className="dashboard_content_box">
        <div className="dashboard_content_header">
          <h1>My Courses</h1>
          <span className="cursor-pointer" onClick={() => navigate.push('../../dashboard/student/course')}>View All</span>
        </div>

        <div className="dashboard_content_subbox">
          <h1>Empowering Children To Lead</h1>
          <h2>Introduction to Discipleship</h2>
          <p>
            This introduces the meaning of discipleship, exploring its biblical
            foundation and the call to follow Jesus.
          </p>
          <div className="dashboard_content_progress">
            <h3>Your Progress</h3>
            <div className="w-full h-[8px] bg-[#E8E1E2] relative">
                <div className="h-[8px] w-[15%] bg-[#30A46F]"></div>
            </div>
          </div>
          <button className="h-[36px] py-[17px] bg-primaryColors-0 flex justify-center items-center w-full text-[#ffffff]" onClick={openCourse}>Continue Course</button>
        </div>
      </div>
    </>
  );
}
