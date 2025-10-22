import { IoBookOutline } from "react-icons/io5";

interface Props {
    openEvent: () => void
}
export default function DashboardStudentEvent({openEvent} : Props) {
  return (
    <>
      <div className="dashboard_content_box">
        <div className="dashboard_content_header">
          <h1>Upcoming Events</h1>
          <span onClick={openEvent} className="cursor-pointer">View All</span>
        </div>

        <div className="dashboard_content_subbox">
          <div className="flex justify-between items-start w-full">
            <div className="flex justify-start items-start gap-[12px]">
              <span className="pt-1">
                <IoBookOutline />
              </span>
              <div className="flex justify-start items-start flex-col gap-[12px]">
                {" "}
                <h1 className="text-[14px] font-[600] text-[#41415A]">
                  Inroduction to Discipleship
                </h1>
                <p className="text-[12px]">
                  Sun, Aug 24 <span className="text-[8px]">|</span> 4:30 AM
                </p>
              </div>
            </div>
            <span className="text-[#ffffff] py-[0.1rem] px-2 bg-[#FF6B30] text-center rounded-[2px]">
              Session
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
