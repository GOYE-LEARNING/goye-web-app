"use client";

import { RiGroupLine } from "react-icons/ri";
import SubHeader from "./dashboard_subheader";
import { FaExternalLinkAlt, FaRegBell, FaRegClock } from "react-icons/fa";
import { CiCalendar, CiLock } from "react-icons/ci";
import { GoVideo } from "react-icons/go";
import { useEffect, useState } from "react";
import { MdLogout, MdOutlineChat } from "react-icons/md";
import { formatDistanceToNow } from "date-fns";
import { IoIosChatboxes, IoMdCalendar } from "react-icons/io";
import Loader from "./loader";
import { useRouter } from "next/navigation";
interface Props {
  backToMainPage: () => void;
  groupId: string;
}

interface Event {
  event_name: string;
  event_description: string;
  event_type: string;
  event_time: string;
  event_date: string;
  event_link: string;
}

interface User {
  first_name: string;
  last_name: string;
  user_pic: string;
}

interface GroupCount {
  member: number;
  event: number;
}

interface GroupData {
  id: string;
  group_title: string;
  group_short_description: string;
  group_description: string;
  group_image: string;
  createdBy: User;
  _count: GroupCount;
  createdAt?: string;
  updatedAt?: string; // You might need this for the "active" time
  event: Event[];
}

export default function StudentCommunityGroup({
  backToMainPage,
  groupId,
}: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [groups, setGroups] = useState<GroupData | null>(null);
  const [joinGroup, setShowJoinGroup] = useState<boolean>(false);
  const [exitGroup, setShowExitGroup] = useState<boolean>(false);
  const [isJoinedGroup, setIsJoinedGroup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const backFunc = () => {
    backToMainPage();
  };

  const router = useRouter();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Invalid Date";
    }
  };

  const formateDate2 = (dateString: string) => {
    const date = new Date(dateString);
    date.toLocaleDateString("en-us", {
      day: "numeric",
      month: "short",
      weekday: "short",
    });
  };

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/socials/get-group/${groupId}`, {
        method: "GET",
        credentials: "include",
      });

      setIsLoading(false);
      const data = await res.json();
      setGroups(data.data);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const checkGroup = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/socials/check-joined/${groupId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        return;
      }
      const data = await res.json();
      if (data.data == true) {
        setShowJoinGroup(false);
        setShowExitGroup(true);
      } else {
        setShowExitGroup(false);
        setShowJoinGroup(true);
      }
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    checkGroup();
    fetchGroups();
    console.log(isJoinedGroup);
  }, [groupId]);

  const joinGroupFunc = async (groupId: string) => {
    const res = await fetch(`${API_URL}/api/socials/join-group/${groupId}`, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      return;
    }

    setGroups((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        _count: {
          ...prev._count,
          member: prev._count.member + 1,
        },
      };
    });

    console.log(data);
  };

  const exitGroupFunc = async (groupId: string) => {
    const res = await fetch(`${API_URL}/api/socials/exit-group/${groupId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      return;
    }

    setGroups((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        _count: {
          ...prev._count,
          member: prev._count.member - 1,
        },
      };
    });
    console.log(data);
  };

  return (
    <>
      {!isLoading ? (
        <div>
          <div>
            <SubHeader
              header={groups?.group_title as string}
              backFunction={backFunc}
            />
            <p className="flex items-center gap-5 text-[#71748C] text-[14px]">
              <span className="flex items-center gap-2">
                <RiGroupLine />
                {groups?._count.member} members
              </span>
              <span className="flex items-center gap-2">
                <FaRegClock />
                {formatDate(groups?.createdAt as string)}
              </span>
            </p>
            <div className="flex items-center gap-3 my-5">
              <span className="h-[35px] w-[35px] bg-plainColors-0 rounded-full overflow-hidden">
                <img src={groups?.createdBy.user_pic} alt="creator_pic" />
              </span>
              <p className="text-[#71748C] text-[14px] font-[400]">
                {groups?.createdBy.last_name} {groups?.createdBy.first_name}
              </p>
            </div>
            <div className="bg-[#ffffff] md:p-[24px] drop-shadow-sm">
              <div className="w-full h-[220px] relative ">
                <img
                  src={groups?.group_image as string}
                  alt="pic_info"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-[14px] text-[#71748C] font-[400] my-4">
                {groups?.group_description}
              </p>

              {joinGroup && (
                <button
                  className="form_more text-[#ffffff] bg-primaryColors-0 flex items-center justify-center gap-2 mb-2"
                  onClick={() => {
                    setShowExitGroup(true);
                    setShowJoinGroup(false);
                    joinGroupFunc(groupId);
                  }}
                >
                  + Join
                </button>
              )}
              {exitGroup && (
                <div className="grid grid-cols-2 gap-1">
                  <button
                    className="form_more w-full text-primaryColors-0 bg-[#ffffff] border border-[#D9D9D9] flex items-center justify-center"
                    onClick={() => {
                      setShowExitGroup(false);
                      setShowJoinGroup(true);
                      exitGroupFunc(groupId);
                    }}
                  >
                    <MdLogout /> Exit Group
                  </button>
                  <button
                    className="form_more bg-primaryColors-0 text-white flex items-center justify-center"
                    onClick={() => router.push("../../dashboard/student/chat")}
                  >
                    <MdOutlineChat /> Chat
                  </button>
                </div>
              )}

              <section className="grid grid-cols-3 my-5 bg-[#FAF8F8] p-[16px]">
                <div className="flex justify-center items-center flex-col">
                  <span className="text-textSlightDark-0 text-[18px] font-bold">
                    0
                  </span>
                  <p className="text-[#71748C] text-[14px] font-[400]">
                    Posts the Week
                  </p>
                </div>
                <div className="flex justify-center items-center flex-col">
                  <span className="text-textSlightDark-0 text-[18px] font-bold">
                    {groups?._count.member}
                  </span>
                  <p className="text-[#71748C] text-[14px] font-[400]">
                    Members
                  </p>
                </div>
                <div className="flex justify-center items-center flex-col">
                  <span className="text-textSlightDark-0 text-[18px] font-bold">
                    {groups?._count.event}
                  </span>
                  <p className="text-[#71748C] text-[14px] font-[400]">
                    Upccoming Events
                  </p>
                </div>
              </section>

              <div className="h-[16px] w-full bg-[#FAFAFA] border-t border-b border-t-[#F1F1F4] border-b-[#F1F1F4]"></div>
              {groups?.event.length == 0 ? (
                <div className="flex justify-center items-center flex-col gap-1 my-4">
                  <IoMdCalendar size={80} className="text-nearTextColors-0" />
                  <p className="text-[0.9rem] text-textSlightDark-0">
                    No Event here yet
                  </p>
                </div>
              ) : (
                <div>
                  {groups?.event.map((e, i) => (
                    <div className="w-full flex flex-col gap-1 my-5" key={i}>
                      <div className="w-full flex items-center justify-between">
                        <h1 className="text-[14px] font-[600] text-textSlightDark-0">
                          {e.event_name}
                        </h1>
                        <span className="bg-[#FF6B30] text-[#ffffff] px-[4px] text-[12px] rounded-[2px]">
                          {e.event_type}
                        </span>
                      </div>
                      <p className="text-[14px] text-[#71748C] font-[400]">
                        {e.event_description}
                      </p>
                      <div className="flex gap-3 items-center text-[14px] font-[400] text-[#71748C] my-2">
                        <span className="flex items-center gap-1">
                          <CiCalendar className="mb-1" />{" "}
                          {formateDate2(e.event_date) as any}
                        </span>
                        <span className="flex items-center gap-1">
                          <GoVideo className="mb-1" /> {e.event_time}
                        </span>
                      </div>

                      {joinGroup && (
                        <button className="h-[40px] bg-[#EBE5E7] text-primaryColors-0 my-3 flex items-center justify-center gap-2 text-[13px] font-[600]">
                          <p className="mt-1">Event Link </p>
                          <CiLock />
                        </button>
                      )}

                      {exitGroup && (
                        <div className="w-full flex justify-between items-center gap-3">
                          <button className="h-[40px] bg-[#EBE5E7] text-primaryColors-0 my-3 flex items-center justify-center gap-2 text-[13px] font-[600] w-full">
                            <p className="mt-1">Event Link </p>
                            <FaExternalLinkAlt />
                          </button>
                          <button className="h-[40px] w-[40px] bg-[#ffffff] border border-[#D9D9D9] flex justify-center items-center">
                            <FaRegBell color="#41415A" />
                          </button>
                        </div>
                      )}

                      <div className="h-[1px] w-full bg-[#EFEFF2]"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
  );
}
