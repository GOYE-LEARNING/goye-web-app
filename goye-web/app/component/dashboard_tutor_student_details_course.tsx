import DashboardProgressBar from "./dashboard_progress_bar";

export default function DashboardTutorStudentDetailsCourse() {
  return (
    <>
      <div className="flex flex-col gap-2 bg-shadyColor-0 my-5 p-[16px]">
        <div className="flex justify-between items-center">
          <h1 className="font-semibold text-textSlightDark-0 text-[13px]">Introduction to Discipleship</h1>
          <p className="bg-boldGreen-0 text-white text-[12px] px-[8px] rounded-[2px]">Done</p>
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-textSlightDark-0 text-[12px] font-semibold">Beginner</h1>
          <p className="text-textGrey-0 text-[12px] ">100% completed</p>
        </div>
        <DashboardProgressBar backgroundColor="#3F1F22" width={100} />
      </div>
    </>
  );
}
