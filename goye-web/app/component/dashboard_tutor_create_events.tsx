"use client";

import React, { useState } from "react";
import { FaCheck, FaChevronDown, FaReply } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import DropDowns from "./drop_downs";

interface Props {
  cancel: () => void;
}

interface Form {
  event_title: string;
  event_description: string;
  event_time: string;
  event_date: string;
  event_type: string;
  event_link: string;
}

interface FormType {
  label: string;
  type: string;
  name: string;
  value: string;
  onchange: (e: any) => void;
}

export default function DashboardTutorCreateEvent({ cancel }: Props) {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string[]>([]);
  const [formData, setFormData] = useState<Form>({
    event_title: "",
    event_description: "",
    event_time: "",
    event_date: "",
    event_type: "",
    event_link: "",
  });
  const eventType = formData.event_type;

  const handleChangeType = (type: string) => {
    setFormData({ ...formData, event_type: type });
    setSelectedValue(type as any);
    setShowDropdown(false);
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  const form: FormType[] = [
    {
      label: "Event Title",
      type: "text",
      name: "event_title",
      value: formData.event_title,
      onchange: handleChange,
    },
    {
      label: "Description",
      type: "text",
      name: "event_description",
      value: formData.event_description,
      onchange: handleChange,
    },

    {
      label: "Time",
      type: "text",
      name: "event_time",
      value: formData.event_time,
      onchange: handleChange,
    },

    {
      label: "Date",
      type: "date",
      name: "event_date",
      value: formData.event_date,
      onchange: handleChange,
    },
    {
      label: "Event Type",
      type: "text",
      name: "event_type",
      value: formData.event_type,
      onchange: handleChange,
    },
    {
      label: "Event Link",
      type: "text",
      name: "event_link",
      value: formData.event_link,
      onchange: handleChange,
    },
  ];
  const type = ["Meetings"];

  return (
    <>
      <div className="w-[390px] fixed top-0 right-0 h-full bg-white drop-shadow-2xl p-[32px] border border-[#E3E3E833] transition-all duration-300 ease-in-out scrollbar2 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-[#1F2130] font-bold text-[24px]">Create Event</h1>
          <span onClick={cancel} className="cursor-pointer">
            <MdOutlineCancel size={20} className="text-[18px]" />
          </span>
        </div>

        <div className="dashboard_hr my-5"></div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
          noValidate
        >
          {/* Content Input */}
          {form.map((data, i) => {
            return (
              <div
                key={i}
                className={`border border-[#D2D5DA] flex justify-between items-center w-full py-[8px] px-[12px]`}
              >
                <div
                  className={`flex flex-col w-full ${
                    data.name == "event_type" ? "h-[48px]" : ""
                  }`}
                >
                  <label className="text-textGrey-0 text-[12px]">
                    {data.label}
                  </label>

                  {/* DESCRIPTION FIELD */}
                  {data.name === "event_description" ? (
                    <textarea
                      name={data.name}
                      value={data.value}
                      onChange={data.onchange}
                      className="border-none outline-none text-textSlightDark-0 h-[74px] font-[500] resize-none"
                    />
                  ) : data.name == "event_type" ? (
                    <div className="relative w-full">
                      {showDropdown && (
                        <div>
                          {" "}
                          <DropDowns
                            value={eventType}
                            onChange={() => {}}
                            countries={type.map((type, i) => {
                              return (
                                <div
                                  key={i}
                                  onClick={() => handleChangeType(type)}
                                  className="flex justify-between items-center w-full p-3 hover:bg-secondaryColors-0 cursor-pointer"
                                >
                                  <div>{type}</div>
                                  {eventType === type && (
                                    <span className="text-primaryColors-0">
                                      <FaCheck size={12} />
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          />{" "}
                        </div>
                      )}
                      {selectedValue}
                    </div>
                  ) : data.name == "event_type" ? (
                    selectedValue
                  ) : (
                    /* TEXT INPUT FIELDS */
                    <input
                      type={data.type}
                      name={data.name}
                      value={data.value}
                      onChange={data.onchange}
                      className="border-none outline-none w-full text-textSlightDark-0 font-[500] text-[16px]"
                    />
                  )}
                </div>
                {data.name == "event_type" ? (
                  <div className="">
                    <FaChevronDown onClick={() => setShowDropdown(true)} />
                  </div>
                ) : (
                  ""
                )}
              </div>
            );
          })}
          {/* Buttons */}
          <div className="flex flex-col gap-2 mt-[25%]">
            <button
              type="submit"
              className="form_more bg-primaryColors-0 text-white flex items-center gap-2"
            >
              Create Event
            </button>

            <button
              type="button"
              onClick={cancel}
              className="form_more bg-[#F5F5F5] text-primaryColors-0 flex items-center gap-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
