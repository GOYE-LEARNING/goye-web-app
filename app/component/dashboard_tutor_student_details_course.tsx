import DashboardProgressBar from "./dashboard_progress_bar";

interface StudentEnrollment {
  course_title: string;
  course_level: string;
  progress: string;
}

interface Props {
  enrollments: StudentEnrollment[];
  isLoading: boolean;
}

export default function DashboardTutorStudentDetailsCourse({
  enrollments,
  isLoading,
}: Props) {
  return (
    <>
      {!isLoading ? (
        <>
          {enrollments && enrollments.length > 0 ? (
            <div>
              {enrollments.map((c, i) => (
                <div key={i}>
                  <div className="flex flex-col gap-2 bg-shadyColor-0 dark:bg-gray-700 my-5 p-[16px] rounded-lg">
                    <div className="flex justify-between items-center">
                      <h1 className="font-semibold text-textSlightDark-0 dark:text-white text-[13px]">
                        {c.course_title}
                      </h1>
                      <p className="bg-boldGreen-0 text-white text-[12px] px-[8px] py-[2px] rounded-[2px]">
                        In Progress
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <h1 className="text-textSlightDark-0 dark:text-gray-300 text-[12px] font-semibold">
                        {c.course_level}
                      </h1>
                      <p className="text-textGrey-0 dark:text-gray-400 text-[12px]">{c.progress}%</p>
                    </div>
                    <DashboardProgressBar
                      backgroundColor="#FFA500"
                      width={c.progress as any}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-textGrey-0 dark:text-gray-400">No courses enrolled</p>
            </div>
          )}
        </>
      ) : null}
    </>
  );
}
