export default function DashboardStudentGrowthMore() {
  return (
    <>
      <div className="dashboard_content_box">
        <div className="dashboard_content_progress">
          <div className="dashboard_content_header">
            <h1 className="text-[#41415A] font-[600]">Begineer</h1>
            <span className="font-[500] text-[12px] text-[#71748C]">
              100 points
            </span>
          </div>
          <div className="w-full h-[8px] bg-[#E8E1E2] relative">

            <div className="h-[8px] w-[55%] bg-[#30A46F]"></div>
          </div>
          <div className="text-[#41415A] font-[600] text-center">85 points to level 2</div>
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
      </div>
    </>
  );
}
