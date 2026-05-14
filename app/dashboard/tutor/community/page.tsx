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
  updatedAt?: string;
}

export default function TutorCommunity() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [group, setGroup] = useState<GroupData[]>([]);
  const [groupId, setGroupId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCommunityGroup, setShowCommunityGroup] = useState<boolean>(false);
  const [showCommunity, setShowCommunity] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [showGroup, setShowGroup] = useState<boolean>(false);

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
      const res = await fetch(
        `${API_URL}/api/socials/get-groups-created-by-tutor`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.log("An error occurred");
        setIsLoading(false);
        return;
      }

      let groupsArray: GroupData[] = [];

      if (Array.isArray(data)) {
        groupsArray = data;
      } else if (Array.isArray(data.data)) {
        groupsArray = data.data;
      } else if (Array.isArray(data.groups)) {
        groupsArray = data.groups;
      }

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
        _count: {
          member: group._count?.member || group.memberCount || 0,
        },
        updatedAt: group.updatedAt || group.createdAt || "",
      }));

      setGroup(transformedGroups);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const refreshGroup = () => {
    fetchGroups();
  };

  const onAddGroup = (newGroup: GroupData) => {
    setGroup((prev) => [newGroup, ...prev]);
  };

  const onEditGroup = (updatedGroup: GroupData) => {
    setGroup((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  };

  const deleteGroup = (groupIdToDelete?: string) => {
    if (groupIdToDelete) {
      setGroup((prev) => prev.filter((g) => g.id !== groupIdToDelete));
    }
  };

  const backToMainPage = () => {
    setShowCommunity(true);
    setShowCommunityGroup(false);
    setShowGroup(false);
    setGroupId(""); // Reset groupId when going back
  };

  const showCreateGroup = () => {
    setGroupId(""); // Clear groupId for create mode
    setShowCommunity(false);
    setShowCommunityGroup(false);
    setShowGroup(true);
  };

  const handleEditGroup = (groupIdToEdit: string) => {
    setGroupId(groupIdToEdit);
    setShowCommunity(false);
    setShowCommunityGroup(false);
    setShowGroup(true);
  };

  const filterCourse = group.filter((groups) =>
    groups.group_title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className=" w-full">
        {showCommunity && (
          <>
            <div className="h-full flex justify-between items-center overflow-auto">
              <h1 className="dashboard_h1">Community</h1>
              <div className="flex items-center gap-3">
                <span
                  className="bg-secondaryColors-0/50 backdrop-blur-md text-white border border-[#ccc] font-semibold flex items-center gap-2 md:hidden cursor-pointer"
                  onClick={showCreateGroup}
                >
                  <MdAdd /> New Group
                </span>
                <span
                  className="text-white h-[35px] w-[35px] bg-primaryColors-0 rounded-full font-semibold flex items-center justify-center gap-2 md:hidden cursor-pointer"
                  onClick={refreshGroup}
                >
                  <IoMdRefresh />
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center gap-4">
              <div className="md:w-[75%] w-full">
                <DashboardSearch
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  placeholder="Search community..."
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="md:flex items-center justify-center gap-2 border border-white/10 bg-secondaryColors-0/50 backdrop-blur-md h-[36px] md:w-[131px] hidden text-primaryColors-0 cursor-pointer"
                  onClick={showCreateGroup}
                >
                  <MdAdd /> New Group
                </button>
                <span
                  className="text-white h-[35px] w-[35px] bg-primaryColors-0 rounded-full font-semibold md:flex items-center justify-center gap-2 hidden cursor-pointer"
                  onClick={refreshGroup}
                >
                  <IoMdRefresh />
                </span>
              </div>
            </div>
           <div className="">
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
                    {filterCourse.map((data, i) => (
                      <div
                        className="border border-[#D2D5DA]/10 bg-secondaryColors-0/50 backdrop-blur-md py-[20px] px-[16px] flex flex-col gap-1 cursor-pointer my-4"
                        key={i}
                        onClick={() => {
                          setShowCommunity(false);
                          setShowCommunityGroup(true);
                          setGroupId(data.id);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <h1 className="font-bold text-white">
                            {data.group_title}
                          </h1>
                          <div className="flex gap-2">
                            <span className="text-white text-[12px] font-[600] cursor-pointer bg-secondaryColors-0/50 backdrop-blur-md border border-[#ccc]/10 px-[4px]">
                              Moderator
                            </span>
                          </div>
                        </div>

                        <div className="text-white font-[400] text-[12px] my-1">
                          <p>{data.group_short_description}</p>
                        </div>
                        <p className="flex items-center gap-5 text-white text-[14px]">
                          <span className="flex items-center gap-2">
                            <RiGroupLine />
                            {data._count?.member || 0} members
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
              <div className="flex justify-center">
                <Loader
                  full_border_color="transparent"
                  small_border_color="#49151B"
                  height={30}
                  width={30}
                  border_width={3}
                />
              </div>
            )}
           </div>
          </>
        )}

        {showCommunityGroup && (
          <div>
            <TutorCommunityGroup
              openEditGroup={() => {
                handleEditGroup(groupId);
              }}
              onDeleteGroup={() => deleteGroup(groupId)}
              groupId={groupId}
              backToMainPage={backToMainPage}
            />
          </div>
        )}
      </div>
      {showGroup && (
        <DashboardTutorCreateGroup
          groupId={groupId}
          onAddGroup={onAddGroup}
          onEditGroup={onEditGroup}
          cancel={backToMainPage}
        />
      )}
    </>
  );
}