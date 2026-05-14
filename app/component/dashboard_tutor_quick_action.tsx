import { useRouter } from "next/navigation";
import { GoPeople } from "react-icons/go";
import { MdAdd } from "react-icons/md";
interface Props {
  createCourse: () => void
}
export default function DashboardTutorQuickAction({createCourse} : Props) {
  const router = useRouter();
  return (
    <>
      <div className="cr_box my-5">
        <h1 className="text-textSlightDark-0 text-[14px] font-[600]">
          Quick Actions
        </h1>

        <div className="my-[20px] grid grid-cols-2 gap-[8px] text-primaryColors-0 text-[13px]">
          <div className="flex justify-center items-center flex-col gap-3 h-[72px] border border-[#49151B0D] bg-shadyColor-0 cursor-pointer" onClick={createCourse}>
            <MdAdd /> Create Course
          </div>
          <div
            className="flex justify-center items-center flex-col gap-3 h-[72px] border border-[#49151B0D] bg-shadyColor-0 cursor-pointer"
            onClick={() => router.push("../../dashboard/tutor/student")}
          >
            <GoPeople />
            My Student
          </div>
        </div>
      </div>
    </>
  );
}
