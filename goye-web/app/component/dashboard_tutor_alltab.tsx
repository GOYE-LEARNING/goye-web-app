'use client'
interface Props {
    openStudent: () => void
}
import DashboardProgressBar from "./dashboard_progress_bar";

export default function DashboardTutorAllTab({openStudent} : Props) {
  return (
    <>
      <div className="dashboard_content_mainbox">
        <div className="flex flex-col gap-2 cursor-pointer" onClick={openStudent}>
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <div className="h-[40px] w-[40px] bg-textGrey-0 rounded-full"></div>
              <div>
                <h1 className="text-textSlightDark-0 font-bold text-[14px]">
                  Kurt Bates
                </h1>
                <p className="text-[13px] text-textSlightDark-0">
                  kurk-bates@gmail.com
                </p>
              </div>
            </div>
            <p className="bg-boldGreen-0 text-white rounded-[2px] font-[600] text-[12px] px-[6px]">
              Active
            </p>
          </div>

          <div className="flex justify-between items-center">
            <h1 className="font-[600] text-[13px] text-textSlightDark-0">
              Beginner
            </h1>
            <p className="text-[13px] text-textGrey-0">Last Active</p>
          </div>
          <DashboardProgressBar backgroundColor="#30A46F" width={75} />
          <div className="flex justify-around items-center w-full my-2">
            <div className="flex flex-col gap-1 items-center text-textSlightDark-0">
              <h1 className="font-[700]  text-[18px]">10</h1>
              <p className="text-textGrey-0 text-[13px]">Enrolled</p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <h1 className="font-[700]  text-[18px]">1</h1>
              <p className="text-textGrey-0 text-[13px]">Completed</p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <h1 className="font-[700]  text-[18px]">75%</h1>
              <p className="text-textGrey-0 tedxt-[13px]">Avg Progress</p>
            </div>
          </div>
          <div className="dashboard_thick_hr"></div>
        </div>
      </div>
    </>
  );
}
