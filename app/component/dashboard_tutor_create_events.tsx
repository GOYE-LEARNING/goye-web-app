"use client";

import React, { useEffect, useState } from "react";
import { FaCheck, FaChevronDown, FaReply } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import DropDowns from "./drop_downs";
import Loader from "./loader";

interface Props {
  cancel: () => void;
  groupId: string;
  eventId: string;
  onAddEvent: (addEvent?: any) => void;
  onEditEvent: (editEvent?: any) => void;
}

interface Event {
  id?: string;
  event_name?: string;
  event_description?: string;
  event_time?: string;
  event_date?: string;
  event_type?: string;
  event_link?: string;
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

export default function DashboardTutorCreateEvent({
  cancel,
  groupId,
  onAddEvent,
  onEditEvent,
  eventId,
}: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [updateEventValues, setUpdateEventValues] = useState<Event>({
    event_name: "",
    event_description: "",
    event_date: "",
    event_link: "",
    event_time: "",
    event_type: "",
  });
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false)
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

  // Separate function to fetch event data for editing
  const fetchEventData = async () => {
    if (!eventId) {
      console.log("No eventId provided, staying in create mode");
      setIsEditMode(false);
      return;
    }

    console.log("🔄 Fetching event data for editing, eventId:", eventId);
    
    try {
      const res = await fetch(
        `${API_URL}/api/socials/get-event/${eventId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();
      
      if (!res.ok) {
        console.log("Error fetching event data");
        setIsEditMode(false);
        return;
      }

      
      // Populate form with existing event data
      if (data.data) {
        setUpdateEventValues(data.data);
        setFormData({
          event_title: data.data.event_name || "",
          event_description: data.data.event_description || "",
          event_time: data.data.event_time || "",
          event_date: data.data.event_date || "",
          event_type: data.data.event_type || "",
          event_link: data.data.event_link || "",
        });
        
        if (data.data.event_type) {
          setSelectedValue([data.data.event_type]);
        }
        
        setIsEditMode(true);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      setIsEditMode(false);
    }
  };

  // FIXED: Fetch event data when eventId changes
  useEffect(() => {
    fetchEventData();
  }, [eventId]); // ✅ Only depend on eventId

  const handleChangeType = (type: string) => {
    setFormData({ ...formData, event_type: type });
    setSelectedValue([type]);
    setShowDropdown(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isEditMode && eventId) {
      // Handle UPDATE
      await handleUpdateEvent();
    } else {
      // Handle CREATE
      await handleCreateEvent();
    }
  };

  const handleCreateEvent = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(
        `${API_URL}/api/socials/create-event/${groupId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            event_name: formData.event_title,
            event_description: formData.event_description,
            event_time: formData.event_time,
            event_date: formData.event_date,
            event_type: formData.event_type,
            event_link: formData.event_link,
          }),
        }
      );

      const data = await res.json();

      setIsLoading(false)
      if (!res.ok) {
        console.log("An error occurred");
        return;
      }

      if (onAddEvent) {
        onAddEvent(data.data);
      }

      resetForm();
      cancel();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false)
    }
  };

  const handleUpdateEvent = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(
        `${API_URL}/api/socials/update-event/${eventId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            event_name: formData.event_title,
            event_description: formData.event_description,
            event_time: formData.event_time,
            event_date: formData.event_date,
            event_type: formData.event_type,
            event_link: formData.event_link,
          }),
        }
      );

      const data = await res.json();

      setIsLoading(false)
      if (!res.ok) {
        console.log("An error occurred while updating event");
        return;
      }

      
      // Call the edit callback if provided
      if (onEditEvent) {
        onEditEvent(data.data);
      }

      resetForm();
      cancel();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false)
    }
  };

  const resetForm = () => {
    setFormData({
      event_title: "",
      event_date: "",
      event_description: "",
      event_link: "",
      event_time: "",
      event_type: "",
    });
    setSelectedValue([]);
    setIsEditMode(false);
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
  
  const type = ["Meetings", "Prayer", "Fellowship"];

  return (
    <>
      <div className="w-[390px] fixed top-0 right-0 h-full bg-white drop-shadow-2xl p-[32px] border border-[#E3E3E833] transition-all duration-300 ease-in-out scrollbar2 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-textSlightDark-0 font-bold text-[24px]">
            {isEditMode ? "Edit Event" : "Create Event"}
          </h1>
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
                          />
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
                      placeholder={`${
                        data.name == "event_time" ? "6:00 AM - 12:00 PM" : ""
                      }`}
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
              <div>{isLoading ? <Loader height={20} width={20} full_border_color="white" small_border_color="transparent" border_width={2}/> : ''}</div>
              {isEditMode ? "Update Event" : "Create Event"}
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