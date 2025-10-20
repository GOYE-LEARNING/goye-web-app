import DashboardStudentAnnouncement from "@/app/component/dashboard_student_announcement";
import DashboardStudentCourse from "@/app/component/dashboard_student_course";
import DashboardStudentEvent from "@/app/component/dashboard_student_event";
import DashboardStudentGrowth from "@/app/component/dashboard_student_growth";

export default function Dashboard() {
  return (
    <>
      <div>
        {" "}
        <h1 className="dashboard_h1">Dashboard</h1>
        <DashboardStudentAnnouncement />
        <DashboardStudentCourse /> <DashboardStudentGrowth />
        <DashboardStudentEvent />
      </div>
    </>
  );
}
