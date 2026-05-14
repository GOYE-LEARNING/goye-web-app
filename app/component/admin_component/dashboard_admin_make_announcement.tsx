"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa6";
import DropDowns from "../drop_downs";

interface Props {
  backFunc: () => void;
}

interface Announcement {
  announcement_title: string;
  announcement_description: string;
  annoucement_category: string;
  announcement_name: string;
}

export default function DashboardAdminMakeAnnouncement({ backFunc }: Props) {
  const [selectedValue, setSelectedValue] = useState<string[]>([]);
  const types = [
    "All Users",
    "Student Only",
    ,
    "Instructors Only",
    ,
    "Specific Student",
    "Specific Instructor",
  ];
  const [getRoles, setRoles] = useState<
    | "All Users"
    | "Student Only"
    | "Instructors Only"
    | "Specific Student"
    | "Specific Instructor"
    | null
  >(null);
  const roleArray = ["Student", "Instructor"];
  const [role, setRole] = useState<string[]>([]);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const boxRef2 = useRef<HTMLDivElement | null>(null);

  const [showNames, setShowNames] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [disableBtn, setDisableBtn] = useState<boolean>(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Announcement>({
    announcement_title: "",
    announcement_description: "",
    annoucement_category: "",
    announcement_name: "",
  });

  const selected = formData.annoucement_category;
  const specific = formData.announcement_name;

  const ifSelected =
    selected == "Specific Student"
      ? `border border-[#D2D5DA] flex justify-between items-center w-full py-[8px] px-[12px] relative`
      : selected == "Specific Instructor"
      ? `border border-[#D2D5DA] flex justify-between items-center w-full py-[8px] px-[12px] relative`
      : "bg-slate-100 opacity-60";

  const selectedFunc = (role: string) => {
    if (role == "Specific Student") {
      setDisableBtn(false);
      setShowNames(true);
      setRole(["Student"]);
    } else if (role == "Specific Instructor") {
      setShowNames(true);
      setDisableBtn(false);
      setRole(["Instructor"]);
    } else {
      setDisableBtn(true);
      setShowNames(false);
      setFormData((prev) => ({ ...prev, announcement_name: "" }));
      setRole(["Role"])
    }
  };
  const selectValue = (value: string) => {
    setFormData({ ...formData, annoucement_category: value });
    setSelectedValue([value]);
    setShowDropdown(false);
  };

  const selectValueForNames = (value: string) => {
    setFormData({ ...formData, announcement_name: value });
    setShowDropdown(false);
  };

  const closeDropdown = (e: MouseEvent) => {
    if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
      setShowDropdown(false);
    } else if (boxRef2.current && !boxRef2.current.contains(e.target as Node)) {
      setShowNames(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData({ ...formData, announcement_description: value });
  };

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const form = [
    {
      label: "Header",
      type: "text",
      name: "announcement_title",
      value: formData.announcement_title,
    },
    {
      label: "Description",
      name: "announcement_description",
      value: formData.announcement_description,
    },
    {
      label: "User Category",
      name: "announcement_category",
      value: formData.annoucement_category,
    },
    {
      label: `Select Specific ${role.length == 0 ? "Role" : role}`,
      name: "announcement_name",
      value: formData.announcement_name,
    },
  ];

  return (
    <div className="fixed bg-white right-0 top-0 md:w-[350px] w-[300px] min-h-[100vh] drop-shadow-xl">
      <div className="p-[25px] flex justify-between items-center border-b border-[#F1F1F4]">
        <h1 className="font-bold text-textSlightDark-0 text-[24px]">Announcement</h1>
        <span
          onClick={backFunc}
          className="h-[40px] w-[40px] flex justify-center items-center rounded-[4px] bg-[#F5F5F5]"
        >
          &times;
        </span>
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-[32px] flex flex-col gap-2"
        noValidate
      >
        {form.map((f, i) => (
          <div
            key={i}
            className={`${
              f.name == "announcement_name" ? ifSelected : ""
            } border border-[#D2D5DA] flex justify-between items-center w-full py-[8px] px-[12px] relative`}
          >
            <div
              className={`flex flex-col w-full ${
                f.name == "annoucement_category"
                  ? "h-[48px]"
                  : f.name == "annoucement_name"
                  ? "h-[48px]"
                  : ""
              }`}
            >
              <label className="text-textGrey-0 text-[12px]">{f.label}</label>
              {f.name == "announcement_description" ? (
                <textarea
                  name={f.name}
                  value={formData.announcement_description}
                  onChange={handleTextArea}
                  className="border-none outline-none text-textSlightDark-0 h-[74px] font-[500] resize-none"
                />
              ) : f.name == "announcement_category" ? (
                <div>
                  <span className="text-[16px]">
                    {selected as string | " "}
                  </span>
                  {showDropdown && (
                    <div ref={boxRef}>
                      <DropDowns
                        value={selected}
                        onChange={() => {}}
                        countries={types.map((t, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              selectValue(t as any);
                              selectedFunc(t as any);
                            }}
                            className={`${selected == t ? "bg-[#F6F3F4]" : ""} flex justify-between items-center w-full p-3 hover:bg-secondaryColors-0 cursor-pointer`}
                          >
                            <div className="text-[14px]">{t}</div>
                            {selected == t ? <FaCheck size={13}/> : ''}
                          </div>
                        ))}
                      />
                    </div>
                  )}
                </div>
              ) : f.name == "announcement_name" ? (
                <div>
                  {specific}
                  {showNames && (
                    <div ref={boxRef2}>
                      <DropDowns
                        value={specific}
                        onChange={() => {}}
                        countries={roleArray.map((t, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              selectValueForNames(t as any);
                              setShowNames(false);
                            }}
                            className="flex justify-between items-center w-full p-3 hover:bg-secondaryColors-0 cursor-pointer"
                          >
                            <div className="text-[14px]">{t}</div>
                          </div>
                        ))}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type={f.type}
                  name={f.name}
                  value={f.value}
                  onChange={handleChange}
                  className=" border-none outline-none w-full text-textSlightDark-0 font-[500] text-[16px]"
                />
              )}
            </div>
            {f.name == "announcement_category" ? (
              <div className="">
                <FaChevronDown onClick={() => setShowDropdown(true)} />
              </div>
            ) : f.name == "announcement_name" ? (
              <button className="" disabled={disableBtn}>
                <FaChevronDown onClick={() => setShowNames(true)} />
              </button>
            ) : (
              ""
            )}
          </div>
        ))}

        <div className="flex flex-col gap-2 mt-[25%]">
          <button
            type="submit"
            className="form_more bg-primaryColors-0 text-white flex items-center gap-2"
          >
            Submit
          </button>

          <button
            type="button"
            onClick={() => {
              setFormData({
                annoucement_category: "",
                announcement_description: "",
                announcement_name: "",
                announcement_title: ""
              })
            }}
            className="form_more bg-[#F5F5F5] text-primaryColors-0 flex items-center gap-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
