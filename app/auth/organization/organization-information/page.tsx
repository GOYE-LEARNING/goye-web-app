"use client";

import { FaArrowRight, FaCheck } from "react-icons/fa6";
import { OrgSignUp } from "../BodyProvider";
import { FiChevronDown } from "react-icons/fi";
import { Country, State } from "country-state-city";
import { useEffect, useRef, useState } from "react";
import DropDowns from "@/app/component/drop_downs";
import { useRouter } from "next/navigation";
import { useSignup } from "@/app/context/SignupContext";

interface CountryType {
  name: string;
  iso2: string;
}

interface StateType {
  name: string;
  isoCode: string;
}

export default function OrgInfo({ hideButton = false }: { hideButton?: boolean }) {
  const { formData, setFormData, isOrgInfoComplete } = OrgSignUp();
  const dropDownCountryRef = useRef<HTMLDivElement | null>(null);
  const dropDownStateRef = useRef<HTMLDivElement | null>(null);
  const dropDownOrgType = useRef<HTMLDivElement | null>(null);

  const [countries, setCountries] = useState<CountryType[]>([]);
  const [states, setStates] = useState<StateType[]>([]);
  const [orgTypesState, setOrgTypeState] = useState<string>("");

  const [countryDropdown, setCountryDropdown] = useState(false);
  const [stateDropdown, setStateDropdown] = useState(false);
  const [OrgTypeDropdown, setOrgTypeDropdown] = useState(false);
  const [selectedCountryISO, setSelectedCountryISO] = useState<string>("");
  const showBtn = !hideButton;
  const router = useRouter();

  const orgTypes = ["church", "school", "club", "other"];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    // Only allow numbers for phone number field
    if (name === "org_phone_number") {
      const numbersOnly = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numbersOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const closeDropdown = (e: MouseEvent) => {
    const target = e.target as Node;
    if (dropDownCountryRef.current?.contains(target)) return;
    if (dropDownStateRef.current?.contains(target)) return;
    if (dropDownOrgType.current?.contains(target)) return;

    setCountryDropdown(false);
    setStateDropdown(false);
    setOrgTypeDropdown(false);
  };

  useEffect(() => {
    const allCountries = Country.getAllCountries().map((c) => ({
      name: c.name,
      iso2: c.isoCode,
    }));
    setCountries(allCountries);
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  useEffect(() => {
    if (!selectedCountryISO) return;
    const allStates = State.getStatesOfCountry(selectedCountryISO);
    setStates(allStates);
  }, [selectedCountryISO]);

  useEffect(() => {
    if (formData.main_type == "organization") {
      setFormData((prev) => ({...prev, org_email: ""}))
    }
  }, [formData.main_type])

  const filterCountry = countries.filter((c) =>
    c.name.toLowerCase().includes(formData.org_country?.toLowerCase() || ""),
  );

  const filterState = states.filter((s) =>
    s.name.toLowerCase().includes(formData.org_state?.toLowerCase() || ""),
  );

  const handleOrgTypeSelect = (type: string) => {
    if (formData.main_type) {
      setFormData({ ...formData, org_type: type });
    } else {
      setFormData({ ...formData, org_type: type, main_type: type });
    }
    setOrgTypeDropdown(false);
    setOrgTypeState(type);
  };

  const handleCountrySelect = (country: CountryType) => {
    setFormData({ ...formData, org_country: country.name, org_state: "" });
    setSelectedCountryISO(country.iso2);
    setCountryDropdown(false);
    setStateDropdown(false);
  };

  const handleStateSelect = (state: StateType) => {
    setFormData({ ...formData, org_state: state.name });
    setCountryDropdown(false);
    setStateDropdown(false);
  };

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) =>
    e.preventDefault();

  const continueFunc = () => {
    if (hideButton) return;
    if (formData.org_type === "church")
      router.push("/auth/organization/organization-church");
    else if (formData.org_type === "school")
      router.push("/auth/organization/organization-school");
    else if (formData.org_type === "club")
      router.push("/auth/organization/organization-club");
    else router.push("/auth/organization/organization-verification");
  };

  const form = [
    { type: "text", name: "org_name", label: "Organization Name" },
    { type: "text", name: "org_type", label: "Organization Type" },
    { type: "email", name: "org_email", label: "Official Email Address" },
    { type: "tel", name: "org_phone_number", label: "Phone Number" },
    { type: "text", name: "org_country", label: "Country" },
    { type: "text", name: "org_state", label: "State/City" },
    { type: "year", name: "org_year", label: "Year Established" },

    { type: "text", name: "org_role", label: "Your Role" },

    {
      type: "text",
      name: "org_description",
      label: "Organization Description",
    },
  ];

  const glassTextArea =
    "rounded-xl bg-white/25 backdrop-blur-md backdrop-saturate-150 border border-white/30 shadow-inner outline-none p-3 resize-none w-full text-[0.9rem] focus:bg-white/30 focus:border-white/50 transition-all";

  return (
    <div
      className="
        glass_effect
        relative
        rounded-[30px]
        w-full h-full
        p-[20px]
        overflow-y-auto
        overflow-x-hidden
        chat_scroll3
        text-white
    "
    >
      <h1 className="md:text-[24px] text-[20px] font-semibold pb-5">
        Organization Information
      </h1>

      <form onSubmit={handleSubmit} className="py-3" noValidate>
        <div className="md:grid md:grid-cols-2 flex flex-col gap-5">
          {form.map((data, i) => (
            <div
              key={i}
              className={`flex flex-col gap-1 ${data.name == "org_description" ? "col-span-2" : ""}`}
            >
              <label className="md:text-[0.8rem] text-[0.95rem]">
                {data.label}
              </label>

              {data.name === "org_description" ? (
                <textarea
                  rows={5}
                  value={formData[data.name] || ""}
                  name={data.name}
                  onChange={handleChange}
                  className={glassTextArea}
                />
              ) : data.name === "org_country" ? (
                <div
                  className={`glass_input w-full relative flex justify-start items-center z-10`}
                >
                  <input
                    type="text"
                    value={formData[data.name] || ""}
                    onChange={handleChange}
                    name={data.name}
                    onClick={() => setCountryDropdown(true)}
                    className="bg-transparent border-none outline-none w-full py-2"
                  />
                  <span
                    className="absolute right-3 top-[28%] h-full"
                    onClick={() => setCountryDropdown(true)}
                  >
                    <FiChevronDown />
                  </span>
                  <div ref={dropDownCountryRef} className="mt-9">
                    {countryDropdown && (
                      <DropDowns
                        value={formData[data.name]}
                        onChange={() => {}}
                        countries={filterCountry.map((c, i) => (
                          <div
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCountrySelect(c);
                            }}
                            className="flex justify-between items-center py-2 px-3 text-white text-[0.9rem] parent_check hover:bg-secondaryColors-0 hover:text-slate-800 transition-all duration-200"
                          >
                            {c.name}
                            {formData.org_country === c.name && (
                              <FaCheck
                                size={12}
                                className="text-white type_check"
                              />
                            )}
                          </div>
                        ))}
                      />
                    )}
                  </div>
                </div>
              ) : data.name === "org_state" ? (
                <div
                  className={`glass_input w-full relative flex justify-start items-center z-10`}
                >
                  <input
                    type="text"
                    value={formData[data.name] || ""}
                    onChange={handleChange}
                    name={data.name}
                    onClick={() => selectedCountryISO && setStateDropdown(true)}
                    className="bg-transparent border-none outline-none w-full py-2"
                  />
                  <span
                    className="absolute right-3 top-[28%] h-full"
                    onClick={() => selectedCountryISO && setStateDropdown(true)}
                  >
                    <FiChevronDown />
                  </span>
                  <div ref={dropDownStateRef} className="mt-9">
                    {stateDropdown && (
                      <DropDowns
                        value={formData[data.name]}
                        onChange={() => {}}
                        countries={filterState.map((s, i) => (
                          <div
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStateSelect(s);
                            }}
                            className="flex justify-between items-center py-2 px-3 text-white text-[0.9rem] hover:bg-secondaryColors-0 hover:text-slate-800 parent_check transition-all duration-200"
                          >
                            {s.name}
                            {formData.org_state === s.name && (
                              <FaCheck
                                size={12}
                                className="text-white type_check"
                              />
                            )}
                          </div>
                        ))}
                      />
                    )}
                  </div>
                </div>
              ) : data.name === "org_type" ? (
                <div
                  className={`glass_input w-full relative flex justify-start items-center z-20`}
                >
                  <input
                    type="text"
                    value={formData.main_type || orgTypesState || ""}
                    onChange={handleChange}
                    name={data.name}
                    onClick={() => setOrgTypeDropdown(true)}
                    className="bg-transparent border-none outline-none w-full py-2"
                  />
                  <span
                    className="absolute right-3 top-[28%] h-full"
                    onClick={() => setOrgTypeDropdown(true)}
                  >
                    <FiChevronDown />
                  </span>
                  <div ref={dropDownOrgType} className="mt-9 z-10">
                    {OrgTypeDropdown && (
                      <DropDowns
                        value={formData[data.name]}
                        onChange={() => {}}
                        countries={orgTypes.map((c, i) => (
                          <div
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOrgTypeSelect(c);
                            }}
                            className="flex justify-between items-center py-2 px-3 parent_type text-white text-[0.9rem] hover:bg-secondaryColors-0 hover:text-slate-800 transition-all duration-200"
                          >
                            <span className="uppercase">{c}</span>
                            {formData.main_type === c && (
                              <FaCheck
                                size={12}
                                className="text-white type_check"
                              />
                            )}
                          </div>
                        ))}
                      />
                    )}
                  </div>
                </div>
              ) : data.name === "org_role" ? (
                <input
                  type={data.type}
                  value="admin"
                  onChange={handleChange}
                  name={data.name}
                  disabled
                  className="glass_input opacity-60 cursor-not-allowed"
                  placeholder="Default: Admin"
                />
              ) : (
                <input
                  type={data.type}
                  value={formData[data.name] || ""}
                  onChange={handleChange}
                  name={data.name}
                  maxLength={data.type === "tel" ? 15 : undefined}
                  inputMode={data.type === "tel" ? "numeric" : "text"}
                  className="glass_input focus:ring-2 focus:ring-primaryColors-0 focus:ring-offset-0 focus:bg-white/40"
                  placeholder={`${
                    data.type === "tel" ? "Enter phone number (numbers only)" : ""
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {showBtn && (
          <button
            onClick={continueFunc}
            disabled={!isOrgInfoComplete}
            className={`
              float-right
              mt-8
              w-[200px]
              h-[44px]
              rounded-xl
              flex items-center justify-center gap-2
              bg-black/80
              backdrop-blur-md
              text-white
              transition-all
              ${
                !isOrgInfoComplete
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-black"
              }
            `}
          >
            Continue <FaArrowRight />
          </button>
        )}
      </form>
    </div>
  );
}
