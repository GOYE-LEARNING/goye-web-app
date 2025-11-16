"use client";

import { useEffect, useState } from "react";
import SubHeader from "./dashboard_subheader";
import { IoEye, IoEyeOff } from "react-icons/io5";
import Loader from "./loader";

interface Props {
  backFunction: () => void;
}

interface FormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function DashboardChangePassword({ backFunction }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Track which field is visible
  const [activeShowPassword, setActiveShowPassword] = useState<
    "current" | "new" | "confirm" | null
  >(null);

  const handleClick = (tab: "current" | "new" | "confirm") => {
    // Toggle logic: if already open, close it
    setActiveShowPassword((prev) => (prev === tab ? null : tab));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = (): boolean => {
    if (formData.new_password !== formData.new_password) {
      return false;
    }

    return true;
  };

  const backFunc = () => {
    backFunction();
  };

  useEffect(() => {
    const fetchPassword = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/user/get-user-password`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) {
          console.log("Error fetching data");
        }

        setIsLoading(false);

        setFormData((prev) => ({
          ...prev,
          confirm_password: data.password,
          current_password: data.password,
          new_password: data.password,
        }));
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPassword();
  }, []);

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      try {
        const res = await fetch(`${API_URL}/api/user/update-password`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newPassword: formData.new_password,
          }),
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          console.log("Error updating passowrd");
          return;
        }

      } catch (error) {
        console.error(error);
      }
    }
  };

  // Define all password input fields
  const forms = [
    {
      label: "Current password",
      name: "current_password",
      key: "current" as const,
    },
    {
      label: "New password",
      name: "new_password",
      key: "new" as const,
    },
    {
      label: "Confirm password",
      name: "confirm_password",
      key: "confirm" as const,
    },
  ];

  return (
    <>
      <div>
        <SubHeader header="Change Password" backFunction={backFunc} />
        <div className="dashboard_content_mainbox">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            noValidate
          >
            {forms.map((form, i) => (
              <div
                key={i}
                className="w-full h-[63px] border border-[#D2D5DA] py-[8px] px-[12px] flex items-center relative"
              >
                <div className="flex flex-col w-full">
                  <label className="text-[#71748C] text-[12px]">
                    {form.label}
                  </label>
                  <input
                    type={activeShowPassword === form.key ? "text" : "password"} // ✅ correct logic
                    name={form.name}
                    onChange={handleChange}
                    value={(formData as any)[form.name]}
                    className={`text-[#1F2937] text-[16px] font-[500] outline-none border-none ${
                      form.name === "current_password"
                        ? "text-[#71748C] bg-transparent"
                        : ""
                    }`}
                    disabled={form.name === "current_password"}
                    required
                  />
                </div>

                {/* 👁 Show/Hide button */}
                <div>
                  {isLoading ? (
                    <Loader
                      height={20}
                      width={20}
                      border_width={2}
                      full_border_color="white"
                      small_border_color="#3F1F22"
                    />
                  ) : (
                    <div
                      className="cursor-pointer ml-2"
                      onClick={() => handleClick(form.key)}
                    >
                      {activeShowPassword === form.key ? (
                        <IoEyeOff className="text-[#6B7280]" />
                      ) : (
                        <IoEye className="text-[#6B7280]" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <span className="form_more bg-[#ffffff] text-[#71748C] border border-[#D9D9D9]">
                Cancel
              </span>
              <button
                type="submit"
                className="form_more text-plainColors-0 bg-primaryColors-0"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
