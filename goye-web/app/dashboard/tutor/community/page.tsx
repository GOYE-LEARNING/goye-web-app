"use client";
import TutorCommunityGroup from "@/app/component/dashboard_tutor_community_group";
import SearchCourse from "@/app/component/dashboard_search";
import StudentCommunityGroup from "@/app/component/dashboard_student_community_group";
import { useState } from "react";
import { FaRegClock } from "react-icons/fa";
import { RiGroupLine } from "react-icons/ri";
import { MdAdd } from "react-icons/md";
import DashboardSearch from "@/app/component/dashboard_search";
import DashboardTutorCreateGroup from "@/app/component/dashboard_tutor_create-group";
interface Group {
  header: string;
  switch: string;
  paragraph: React.ReactElement;
  members: string;
  active: string;
  tutorPic: React.ReactElement;
  tutorName: string;
}
export default function TutorCommunity() {
  const [showCommunityGroup, setShowCommunityGroup] = useState<boolean>(false);
  const [showCommunity, setShowCommunity] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [showGroup, setShowGroup] = useState<boolean>(false);
  const bactToMainPage = () => {
    setShowCommunity(true);
    setShowCommunityGroup(false);
    setShowGroup(false);
  };

  const showCreateGroup = () => {
    setShowCommunity(false);
    setShowCommunityGroup(false);
    setShowGroup(true);
  };

  const groups: Group[] = [
    {
      header: "Young Adult Fellowship",
      switch: "Moderator",
      paragraph: (
        <div className="flex items-center gap-2">
          <p className="text-[#71748C] text-[14px]">
            Weekly Bible Study & Prayers
          </p>
          <span className="mb-1 text-[12px] text-[#71748C]">.</span>
          <p className="font-[400] text-[#71748C] text-[14px]">Age 18 - 30</p>
        </div>
      ),
      members: "24 members",
      active: "5 days ago",
      tutorPic: <div></div>,
      tutorName: "Pst. Rhonda Rhodes",
    },
  ];
  const filterCourse = groups.filter((groups) =>
    groups.header.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div>
        {showCommunity && (
          <>
            {" "}
            <div className="flex justify-between items-center">
              <h1 className="dashboard_h1">Community</h1>
              <span
                className="text-primaryColors-0 font-semibold flex items-center gap-2 md:hidden"
                onClick={showCreateGroup}
              >
                <MdAdd /> New Group
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <div className="md:w-[78%] w-full">
                <DashboardSearch
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  placeholder="Search courses..."
                />
              </div>
              <button
                className="md:flex items-center justify-center gap-2 border border-[#D9D9D9] bg-white h-[36px] md:w-[131px] hidden text-primaryColors-0"
                onClick={showCreateGroup}
              >
                <MdAdd /> New Group
              </button>
            </div>
            {filterCourse.map((data, i) => (
              <div
                className="border border-[#D2D5DA] bg-[#ffffff] py-[20px] px-[16px] flex flex-col gap-1 cursor-pointer"
                key={i}
                onClick={() => {
                  setShowCommunity(false);
                  setShowCommunityGroup(true);
                }}
              >
                <div className="flex justify-between items-center">
                  <h1>{data.header}</h1>
                  <span className="">
                    <p className="text-textSlightDark-0 text-[12px] font-[600] cursor-pointer bg-[#F1F1F4] px-[4px]">
                      {data.switch}
                    </p>
                  </span>
                </div>
                <div>{data.paragraph}</div>
                <p className="flex items-center gap-5 text-[#71748C] text-[14px]">
                  <span className="flex items-center gap-2">
                    <RiGroupLine />
                    {data.members}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaRegClock />
                    {data.active}
                  </span>
                </p>
                <div className="dashboard_hr my-3"></div>
                <div className="flex items-center gap-3">
                  <span className="h-[35px] w-[35px] bg-secondaryColors-0 rounded-full">
                    {data.tutorPic}
                  </span>
                  <p className="text-[#71748C] text-[14px] font-[400]">
                    {data.tutorName}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        {showCommunityGroup && (
          <div>
            <TutorCommunityGroup backToMainPage={bactToMainPage} />
          </div>
        )}
      </div>
      {showGroup && <DashboardTutorCreateGroup cancel={bactToMainPage} />}
    </>
  );
}
