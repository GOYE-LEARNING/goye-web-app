import { useEffect, useState } from "react";
import Loader from "./loader";
import { formatDistanceToNow } from "date-fns";

interface Props {
  studentId: string;
}

interface StudentGroupDetails {
  group_title: string;
  joined_at: string;
}

export default function DashboardTutorStudentDetailsGroup({ studentId }: Props) {
  const [groupDetails, setGroupDetails] = useState<StudentGroupDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        console.error('NEXT_PUBLIC_API_URL is not defined');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(
          `${API_URL}/api/enroll/fetch-student-details/${studentId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.log("An error occurred while fetching group details");
          setIsLoading(false);
          return;
        }

        console.log("Group enrollments:", data.data.groups);
        setGroupDetails(data.data.groups || []);
      } catch (error) {
        console.error("Error fetching group details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId) {
      fetchGroupDetails();
    }
  }, [studentId]);

  return (
    <>
      {!isLoading ? (
        <div className="flex flex-col gap-2 my-5">
          {groupDetails && groupDetails.length > 0 ? (
            groupDetails.map((group, i) => (
              <div key={i} className="flex justify-between items-start bg-shadyColor-0 dark:bg-gray-700 p-[16px] rounded-lg">
                <div className="flex flex-col gap-2">
                  <h1 className="text-textSlightDark-0 dark:text-white font-bold text-[14px]">
                    {group.group_title}
                  </h1>
                  <p className="text-textGrey-0 dark:text-gray-400 text-[12px]">
                    Joined {formatDistanceToNow(new Date(group.joined_at), { addSuffix: true })}
                  </p>
                </div>
                <p className="px-[8px] py-[4px] bg-primaryColors-0 text-white text-[12px] rounded">
                  Member
                </p>
              </div>
            ))
          ) : (
            <p className="text-textGrey-0 dark:text-gray-400 text-center py-8">
              No groups joined yet
            </p>
          )}
        </div>
      ) : (
        <div className="flex justify-center py-8">
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