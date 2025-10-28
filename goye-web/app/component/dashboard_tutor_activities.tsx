import { CiClock2 } from "react-icons/ci";
import { HiOutlineBookOpen } from "react-icons/hi";

export default function DashboardTutorActivities() {
  return (
    <>
      <div className="cr_box ">
        <h1 className="text-textSlightDark-0 text-[14px] font-[600]">
          Activities
        </h1>
        <div className="mt-[20px] flex flex-col gap-3">
            <div className="flex gap-[12px] items-start">
                <span className="h-[32px] w-[32px] bg-shadyBlue-0 text-boldBlue-0 flex justify-center items-center"><HiOutlineBookOpen /></span>
                <div className="flex flex-col gap-1">
                    <h1 className="text-textSlightDark-0 text-[14px] font-[600]">3 students completed “Biblical Foundation” quiz</h1>
                    <p className="flex items-center text-textGrey-0 text-[14px] gap-2"><CiClock2 /> 10hr ago</p>
                </div>
            </div>
          <div className="dashboard_hr"></div>
        </div>
      </div>
    </>
  );
}
