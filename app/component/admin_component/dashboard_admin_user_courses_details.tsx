import { useEffect, useState } from "react";
import DashboardProgressBar from "../dashboard_progress_bar";
import Loader from "../loader";
interface Props {
  userId: string;
}

interface UserForCourseDetails {
  course_title: string;
  course_level: string;
  progress: string;
}

export default function DashboardAdminUsersDetailsCourse({
  userId,
}: Props) {
  const [courseDetails, setCourseDetails] = useState<
    UserForCourseDetails[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(
        `${API_URL}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.log("An error occured while fetching the group details");
      }

      setIsLoading(false);
      setCourseDetails(data.data.enrollments);
    };

    fetchGroupDetails();
  }, []);
  return (
    <>
      {!isLoading ? (
        <div>
          {courseDetails.length === 0 ? (
            <div>No courses yet</div>
          ) : (
            <div>
              {courseDetails.map((c, i) => (
                <div key={i}>
                  <div className="flex flex-col gap-2 bg-shadyColor-0 my-5 p-[16px]">
                    <div className="flex justify-between items-center">
                      <h1 className="font-semibold text-textSlightDark-0 text-[13px]">
                        {c.course_title}
                      </h1>
                      <p className="bg-boldGreen-0 text-white text-[12px] px-[8px] rounded-[2px]">
                        Not done
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <h1 className="text-textSlightDark-0 text-[12px] font-semibold">
                        {c.course_level}
                      </h1>
                      <p className="text-textGrey-0 text-[12px] ">
                        {c.progress}
                      </p>
                    </div>
                    <DashboardProgressBar
                      backgroundColor="#FFA500"
                      width={c.progress as any}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <Loader
            full_border_color="transparent"
            height={30}
            width={30}
            border_width={4}
            small_border_color="#49151B"
          />
        </div>
      )}
    </>
  );
}
