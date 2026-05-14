export default function DashboardAdminUserBreakdown() {
  return (
    <div className="dashboard_content_box">
      <h1 className="font-semibold text-textSlightDark-0 text-[14px]">
        Users Breakdown
      </h1>
      <div className="flex flex-col gap-3 mt-2">
        <div className="admin_dashboard_data2">
          <div className="flex flex-col gap-1 items-center justify-center md:w-[206.3333282470703px] w-[100.66666412353516px]">
            <h1 className="font-bold text-textSlightDark-0 text-[18px]">190</h1>
            <span className="text-[#71748C] text-[12px]">All Users</span>
          </div>
          <div className="flex flex-col gap-1 items-center justify-center md:w-[206.3333282470703px] w-[100.66666412353516px]">
            <h1 className="font-bold text-textSlightDark-0 text-[18px]">100</h1>
            <span className="text-[#71748C] text-[12px]">Student</span>
          </div>

          <div className="flex flex-col gap-1 items-center justify-center md:w-[206.3333282470703px] w-[100.66666412353516px]">
            <h1 className="font-bold text-textSlightDark-0 text-[18px]">90</h1>
            <span className="text-[#71748C] text-[12px]">Instructors</span>
          </div>
        </div>

          <div className="admin_dashboard_data2">
          <div className="flex flex-col gap-1 items-center justify-center md:w-[206.3333282470703px] w-[100.66666412353516px]">
            <h1 className="font-bold text-textSlightDark-0 text-[18px]">590</h1>
            <span className="text-[#71748C] text-[12px]">Beginners</span>
          </div>
          <div className="flex flex-col gap-1 items-center justify-center md:w-[206.3333282470703px] w-[100.66666412353516px]">
            <h1 className="font-bold text-textSlightDark-0 text-[18px]">150</h1>
            <span className="text-[#71748C] text-[12px]">Intermediate</span>
          </div>

          <div className="flex flex-col gap-1 items-center justify-center md:w-[206.3333282470703px] w-[100.66666412353516px]">
            <h1 className="font-bold text-textSlightDark-0 text-[18px]">920</h1>
            <span className="text-[#71748C] text-[12px]">Advanced</span>
          </div>
        </div>
      </div>
    </div>
  );
}
