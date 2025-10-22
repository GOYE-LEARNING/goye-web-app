"use client";

import React, { useEffect, useRef, useState } from "react";
import SubHeader from "./dashboard_subheader";
import { FaChevronDown } from "react-icons/fa6";
import DropDowns from "./drop_downs";
import { FaCheck } from "react-icons/fa";
interface Props {
  backFunction: () => void;
}
interface formData {
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  state: string;
  phone_number: string;
}

interface Country {
  iso2?: string;
  iso3?: string;
  country: string;
  cities: string[];
}

export default function DashboardEditProfile({ backFunction }: Props) {
  const [dropDownCountry, setDropDownCountry] = useState<boolean>(false);
  const [dropDownState, setDropState] = useState<boolean>(false);
  const [country, setCountry] = useState<Country[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [formData, setFormData] = useState<formData>({
    first_name: "Alex",
    last_name: "Hamilton",
    email: "alexhamilton@gmail.com",
    country: "Nigeria",
    state: "Lagos",
    phone_number: "0802 313 4756",
  });

  const fetchCountry = async () => {
    try {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries");
      const data = await res.json();
      if (res.ok) setCountry(data.data);
    } catch (error) {
      console.error("Error loading countries", error);
    }
  };

  useEffect(() => {
    fetchCountry();
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setDropDownCountry(false);
        setDropState(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCountry = formData.country;
  const selectedCity = formData.state;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleChangeCountry = (countryName: string) => {
    setFormData({ ...formData, country: countryName, state: "" });
    const selected = country.find((c) => c.country === countryName);
    if (selected) setCities(selected.cities || []);
    setDropDownCountry(false);
  };

  const handleChangeCity = (cityName: string) => {
    setFormData({ ...formData, state: cityName });
    setDropState(false);
  };
  const backFunc = () => {
    backFunction();
  };

  useEffect(() => {}, []);
  const forms = [
    {
      label: "First name",
      type: "text",
      name: "first_name",
      onchange: handleChange,
    },
    {
      label: "Last name",
      type: "text",
      name: "last_name",
      onchange: handleChange,
    },
    {
      label: "Email address",
      type: "email",
      name: "email",
      onchange: handleChange,
    },
    {
      label: "Country",
      type: "text",
      name: "country",
      onchange: handleChange,
    },
    {
      label: "State",
      type: "text",
      name: "state",
      onchange: handleChange,
    },
    {
      label: "Phone Number",
      type: "text",
      name: "phone_number",
      onchange: handleChange,
    },
  ];
  return (
    <>
      <div>
        <SubHeader header="Edit Profile" backFunction={backFunc} />
        <div className="bg-[#ffffff] p-[24px] w-full my-5">
          <div className="w-full flex justify-center items-center">
            <div className="h-[72px] w-[72px] bg-[#D9D9D9] rounded-full"></div>
          </div>
          <form className="my-5 flex flex-col gap-5">
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
                    type={form.type}
                    name={form.name}
                    onChange={form.onchange}
                    value={(formData as any)[form.name]}
                    className={`text-[#1F2937] text-[16px] font-[500] outline-none border-none ${form.name == 'email' ? 'text-[#71748C] bg-transparent' : ''}`}
                    disabled={form.name == 'email'}
                  />
                </div>

                {form.label == "Country" && (
                  <div>
                    <div onClick={() => setDropDownCountry(true)}>
                      <FaChevronDown size={14} />
                    </div>
                    {dropDownCountry && (
                      <div className="mt-[3.1rem]" ref={boxRef}>
                        <DropDowns
                          value={selectedCountry}
                          onChange={() => {}}
                          countries={country.map((c, i) => (
                            <div
                              key={i}
                              onClick={() => handleChangeCountry(c.country)}
                              className="flex justify-between items-center w-full p-3 hover:bg-secondaryColors-0 cursor-pointer"
                            >
                              <div>{c.country}</div>
                              {selectedCountry === c.country && (
                                <span className="text-primaryColors-0">
                                  <FaCheck size={12} />
                                </span>
                              )}
                            </div>
                          ))}
                        />
                      </div>
                    )}
                  </div>
                )}

                {form.label == "State" && (
                  <div>
                    <FaChevronDown
                      size={14}
                      onClick={() => setDropState(true)}
                    />
                    {dropDownState && (
                      <div ref={boxRef} className="mt-[3.1rem]">
                        <DropDowns
                          value={selectedCity}
                          onChange={() => {}}
                          countries={cities.map((city, i) => (
                            <div
                              key={i}
                              onClick={() => handleChangeCity(city)}
                              className="flex justify-between items-center w-full p-3 hover:bg-secondaryColors-0 cursor-pointer"
                            >
                              <div>{city}</div>
                              {selectedCity === city && (
                                <span className="text-primaryColors-0">
                                  <FaCheck size={12} />
                                </span>
                              )}
                            </div>
                          ))}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <span className="form_more bg-[#ffffff] text-[#71748C] border border-[#D9D9D9]">
                Cancel
              </span>
              <span className="form_more text-plainColors-0 bg-primaryColors-0">
                Save Changes
              </span>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
