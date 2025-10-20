import { PiThumbsUpLight } from "react-icons/pi";
import { RiCheckDoubleFill } from "react-icons/ri";

export default function DashboardStudentNotification() {
  return (
    <div className="bg-[#ffffff] drop-shadow-lg h-[769px] w-[500px] z-30 -right-[120px] top-10 absolute p-[24px]">
      <div className="dashboard_triangle absolute right-[123px] -top-[0.9rem]"></div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="bg-[#FAF8F8] p-[10px] flex gap-3 items-center justify-center">
            <p className="text-[#49151B] font-[600]">All</p>
            <span className="w-[24px] h-[19px] flex justify-center items-center flex-col pt-[4px] bg-[#49151B] text-[#ffffff] text-[12px] rounded-[2px]">
              0
            </span>
          </div>
          <div className="bg-[#F9F9FB] p-[10px] flex gap-3 items-center justify-center">
            <p className="text-[#49151B] font-[500]">Unread</p>
            <span className="w-[24px] h-[19px] flex justify-center items-center flex-col pt-[4px] bg-[#E4E6E9] text-primaryColors-0 text-[12px] rounded-[2px]">
              0
            </span>
          </div>
        </div>
        <div className="h-[36px] py-[17px] px-[10px] border border-[#D9D9D9] flex justify-center items-center text-primaryColors-0 text-[13px] gap-2">
          <RiCheckDoubleFill />
          <span>Mark All Read</span>
        </div>
      </div>

      <div className="h-full flex justify-center items-center flex-col gap-3 w-full">
        <div className="h-[100px] w-[100px] bg-[#F1F1F4B2] rounded-full flex justify-center items-center flex-col">
          <div className="w-[76px] h-[76px] bg-[#ffffff] rounded-full border-[5px] border-[#F1F1F4] flex justify-center items-center flex-col text-[#71748C]">
            <span>
              <PiThumbsUpLight size={40} />
            </span>
          </div>
        </div>
        <h1 className="text-[32px] text-[#111827] font-[500]">All Caught Up</h1>
        <p className="text-[16px] text-[#41415A]">No notifications yet.</p>
      </div>
    </div>
  );
}
