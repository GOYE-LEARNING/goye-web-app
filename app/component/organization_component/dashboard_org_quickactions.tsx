import { GrGroup } from "react-icons/gr";
import { HiOutlineBookOpen } from "react-icons/hi";
import { RiGroupLine } from "react-icons/ri";
import { PiSpeakerNoneLight } from "react-icons/pi";
import { MdEvent } from "react-icons/md";
interface Props {
  manageMembers: () => void;
  reviewCourses: () => void;
  manageEvents: () => void;
  makeAnnoucement: () => void;
}
export default function DashboardOrgAdminQuickActions({
  manageMembers,
  reviewCourses,
  manageEvents,
  makeAnnoucement,
}: Props) {
  return (
    <div className="dashboard_content_box">
      <h1 className="font-semibold text-textSlightDark-0 text-[14px]">
        Quick Actions
      </h1>
      <div className="mt-2 grid grid-cols-2 gap-[8px]">
        <div className="admin_dashboard_data3" onClick={manageMembers}>
          <RiGroupLine />
          <h1 className="text-[12px] font-[600]">Manage Members</h1>
        </div>
        <div className="admin_dashboard_data3" onClick={reviewCourses}>
          <HiOutlineBookOpen />
          <h1 className="text-[12px] font-[600]">Review Courses</h1>
        </div>
        <div className="admin_dashboard_data3" onClick={manageEvents}>
          <MdEvent />
          <h1 className="text-[12px] font-[600]">Manage Event</h1>
        </div>
        <div className="admin_dashboard_data3" onClick={makeAnnoucement}>
          <PiSpeakerNoneLight />
          <h1 className="text-[12px] font-[600]">Make an Annoucement</h1>
        </div>
      </div>
    </div>
  );
}
