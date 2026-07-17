import { formatDistanceToNow } from "date-fns";

interface StudentGroup {
  group_title: string;
  joined_at: string;
}

interface Props {
  groups: StudentGroup[];
  isLoading: boolean;
}

export default function DashboardTutorStudentDetailsGroup({ groups, isLoading }: Props) {
  return (
    <>
      {!isLoading ? (
        <div className="flex flex-col gap-2 my-5">
          {groups && groups.length > 0 ? (
            groups.map((group, i) => (
              <div key={i} className="flex justify-between items-start bg-shadyColor-0 dark:bg-gray-700 p-[16px] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex flex-col gap-2 flex-1">
                  <h1 className="text-textSlightDark-0 dark:text-white font-bold text-[14px]">
                    {group.group_title}
                  </h1>
                  <p className="text-textGrey-0 dark:text-gray-400 text-[12px]">
                    Joined {formatDistanceToNow(new Date(group.joined_at), { addSuffix: true })}
                  </p>
                </div>
                <p className="px-[8px] py-[4px] bg-primaryColors-0 text-white text-[12px] rounded ml-2 whitespace-nowrap">
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
      ) : null}
    </>
  );
}