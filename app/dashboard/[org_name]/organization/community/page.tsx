"use client";
import TutorCommunityGroup from "@/app/component/dashboard_tutor_community_group";
import { useEffect, useState } from "react";
import { FaRegClock } from "react-icons/fa";
import { RiGroupLine } from "react-icons/ri";
import { MdAdd } from "react-icons/md";
import DashboardSearch from "@/app/component/dashboard_search";
import DashboardTutorCreateGroup from "@/app/component/dashboard_tutor_create-group";
import { formatDistanceToNow } from "date-fns";
import Loader from "@/app/component/loader";
import Image from "next/image";
import pic2 from "@/public/images/notfound.png";
import { IoMdRefresh } from "react-icons/io";
import StudentCommunityGroup from "@/app/component/dashboard_student_community_group";
import { useRouter } from "next/navigation";

interface User {
  first_name: string;
  last_name: string;
  user_pic: string;
}

interface GroupCount {
  member: number;
}

interface GroupData {
  id: string;
  group_title: string;
  group_short_description: string;
  group_description: string;
  group_image: string;
  createdBy: User;
  _count: GroupCount;
  hasJoined?: boolean;
  updatedAt?: string; // You might need this for the "active" time
}

export default function StudentCommunity() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [group, setGroup] = useState<GroupData[]>([]);
  const [groupId, setGroupId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCommunityGroup, setShowCommunityGroup] = useState<boolean>(false);
  const [showCommunity, setShowCommunity] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  //To fetch groups

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Invalid Date";
    }
  };

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/socials/get-groups`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("An error occurred");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);

      // FIX: Check the actual response structure
      console.log("API Response:", data);

      let groupsArray: GroupData[] = [];

      if (Array.isArray(data)) {
        // Case 1: Response is directly an array
        groupsArray = data;
      } else if (Array.isArray(data.data)) {
        // Case 2: Response has data property with array
        groupsArray = data.data;
      } else if (Array.isArray(data.groups)) {
        // Case 3: Response has groups property with array
        groupsArray = data.groups;
      }

      // Transform the data to ensure it has the expected structure
      const transformedGroups = groupsArray.map((group: any) => ({
        id: group.id || "",
        group_title: group.group_title || "",
        group_short_description: group.group_short_description || "",
        group_description: group.group_description || "",
        group_image: group.group_image || "",
        createdBy: group.createdBy || {
          first_name: "",
          last_name: "",
          user_pic: "",
        },
        hasJoined: group.hasJoined === true,
        _count: {
          member: group._count?.member || group.memberCount || 0,
          // Add other counts if needed
        },
        updatedAt: group.updatedAt || group.createdAt || "",
      }));

      setGroup(transformedGroups);
    } catch (error) {
      console.error("Fetch error:", error);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchGroups();
  }, []);

  const refreshGroup = () => {
    fetchGroups();
  };

  const backToMainPage = () => {
    setShowCommunity(true);
    setShowCommunityGroup(false);
  };

  const filterCourse = group.filter((groups) =>
    groups.group_title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div>
        {showCommunity && (
          <>
            {" "}
            <div className="flex justify-between items-center">
              <h1 className="dashboard_h1">Community</h1>
              <div className="flex items-center gap-3">
                <span
                  className="text-white h-[35px] w-[35px] bg-primaryColors-0 rounded-full font-semibold flex items-center justify-center gap-2 md:hidden cursor-pointer"
                  onClick={refreshGroup}
                >
                  <IoMdRefresh />
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center gap-4">
              <div className="w-full">
                <DashboardSearch
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  placeholder="Search community..."
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-white h-[35px] w-[35px] bg-primaryColors-0 rounded-full font-semibold md:flex items-center justify-center gap-2 hidden cursor-pointer"
                  onClick={refreshGroup}
                >
                  <IoMdRefresh />
                </span>
              </div>
            </div>
            {!isLoading ? (
              <div>
                {filterCourse.length == 0 ? (
                  <div className="flex justify-center items-center flex-col gap-1 md:mt-10 mt-[8rem]">
                    <Image src={pic2} alt="pic" height={100} width={100} />
                    <h1 className="text-textSlightDark-0 font-semibold text-[18px]">
                      No Community Found
                    </h1>
                    <p className="text-textGrey-0">Create a Community</p>
                  </div>
                ) : (
                  <div>
                    {" "}
                    {filterCourse.map((data, i) => (
                      <div
                        className="cursor-pointer border border-[#D2D5DA] bg-[#ffffff] py-[20px] px-[16px] flex flex-col gap-1  my-4"
                        key={i}
                        onClick={() => {
                          setShowCommunity(false);
                          setShowCommunityGroup(true);
                          setGroupId(data.id);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <h1 className="font-bold text-[#41415A]">
                            {data.group_title}
                          </h1>

                          {data.hasJoined == false && (
                            <div>
                              <span
                                className="cursor-pointer"
                                onClick={() => {
                                  setShowCommunity(false);
                                  setShowCommunityGroup(true);
                                  setGroupId(data.id);
                                }}
                              >
                                <p className="flex items-center gap-[0.4rem] text-primaryColors-0 cursor-pointer">
                                  <MdAdd /> Join
                                </p>
                              </span>
                            </div>
                          )}
                          {data.hasJoined == true && (
                            <div className="bg-secondaryColors-0 py-[0.3rem] px-1 rounded uppercase font-semibold text-[0.5rem]">
                              Joined
                            </div>
                          )}
                        </div>

                        <div className="text-[#71748C] font-[400] text-[12px] my-1">
                          <p>{data.group_short_description}</p>
                        </div>
                        <p className="flex items-center gap-5 text-[#71748C] text-[14px]">
                          <span className="flex items-center gap-2">
                            <RiGroupLine />
                            {data._count?.member || 0} members{" "}
                            {/* FIXED: Optional chaining */}
                          </span>
                          <span className="flex items-center gap-2">
                            <FaRegClock />
                            {formatDate(data.updatedAt as any)}
                          </span>
                        </p>
                        <div className="dashboard_hr my-3"></div>
                        <div className="flex items-center gap-3">
                          <span className="h-[35px] w-[35px] bg-secondaryColors-0 rounded-full overflow-hidden">
                            {data.createdBy?.user_pic ? (
                              <img
                                src={data.createdBy.user_pic}
                                className="h-full w-full object-cover"
                                alt="Creator"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500">
                                  {data.createdBy?.first_name?.[0] || "G"}
                                </span>
                              </div>
                            )}
                          </span>
                          <p className="text-[#71748C] text-[14px] font-[400]">
                            {data.createdBy?.first_name || ""}{" "}
                            {data.createdBy?.last_name || ""}
                          </p>
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
                  small_border_color="#49151B"
                  height={30}
                  width={30}
                  border_width={3}
                />
              </div>
            )}
          </>
        )}

        {showCommunityGroup && (
          <div>
            <StudentCommunityGroup
              backToMainPage={backToMainPage}
              groupId={groupId}
            />
          </div>
        )}
      </div>
    </>
  );
}
