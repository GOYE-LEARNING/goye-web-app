import { GiOpenBook } from "react-icons/gi";
import { GrGroup } from "react-icons/gr";
import { HiOutlineBookOpen } from "react-icons/hi";
import { RiGroupLine } from "react-icons/ri";
import { PiSpeakerNoneLight } from "react-icons/pi";
import { useEffect } from "react";
interface Props {
  manageUsers: () => void;
  reviewCourses: () => void;
  manageGroups: () => void;
  makeAnnoucement: () => void;
}
export default function DashboardAdminQuickActions({
  manageUsers,
  reviewCourses,
  manageGroups,
  makeAnnoucement,
}: Props) {
  return (
    <div className="dashboard_content_box">
      <h1 className="font-semibold text-textSlightDark-0 text-[14px]">
        Quick Actions
      </h1>
      <div className="mt-2 grid grid-cols-2 gap-[8px]">
        <div className="admin_dashboard_data3" onClick={manageUsers}>
          <RiGroupLine />
          <h1 className="text-[12px] font-[600]">Manage Users</h1>
        </div>
        <div className="admin_dashboard_data3" onClick={reviewCourses}>
          <HiOutlineBookOpen />
          <h1 className="text-[12px] font-[600]">Review Courses</h1>
        </div>
        <div className="admin_dashboard_data3" onClick={manageGroups}>
          <GrGroup />
          <h1 className="text-[12px] font-[600]">Manage Groups</h1>
        </div>
        <div className="admin_dashboard_data3" onClick={makeAnnoucement}>
          <PiSpeakerNoneLight />
          <h1 className="text-[12px] font-[600]">Make an Annoucement</h1>
        </div>
      </div>
    </div>
  );
}
