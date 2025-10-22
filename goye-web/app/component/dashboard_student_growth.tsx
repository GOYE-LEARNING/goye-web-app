'use client'
interface Props {
  openGrowth: () => void
}
export default function DashboardStudentGrowth({openGrowth} : Props) {
  return (
    <>
      <div className="dashboard_content_box">
        <div className="dashboard_content_header">
          <h1>Spiritual Growth Milestone</h1>
        </div>

        <div className="dashboard_content_subbox">
          <div className="dashboard_content_progress">
            <h3>Beginner</h3>
            <div className="w-full h-[8px] bg-[#E8E1E2] relative">
                <div className="h-[8px] w-[55%] bg-[#30A46F]"></div>
            </div>
            <div className="bg-[#EFEFF2] h-[1px] w-full"></div>
          </div>
          <div className="flex justify-around items-center w-full">
            <div className="flex flex-col justify-center items-center gap-2  ">
                <span className="font-[700]">1</span>
                <p className="font-[400] text-[#71748C]">Acheivement</p>
            </div>

                <div className="flex flex-col justify-center items-center gap-2  ">
                <span className="font-[700]">3</span>
                <p className="font-[400] text-[#71748C]">Certificate</p>
            </div>

                <div className="flex flex-col justify-center items-center gap-2  ">
                <span className="font-[700]">0</span>
                <p className="font-[400] text-[#71748C]">Badges</p>
            </div>
                <div className="flex flex-col justify-center items-center gap-2  ">
                <span className="font-[700]">24</span>
                <p className="font-[400] text-[#71748C] text-[10px]">Total Point</p>
            </div>
          </div>
          <button className="h-[36px] py-[17px] bg-[#EBE5E7] flex justify-center items-center w-full text-primaryColors-0 font-[600] cursor-pointer" onClick={openGrowth}>View Growth</button>
        </div>
      </div>
    </>
  );
}
