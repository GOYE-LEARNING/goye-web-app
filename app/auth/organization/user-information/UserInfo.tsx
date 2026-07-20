"use client";

import { FaArrowRight, FaCheck } from "react-icons/fa6";
import { OrgSignUp } from "../BodyProvider";
import { FiChevronDown } from "react-icons/fi";
import { Country, State } from "country-state-city";
import { useEffect, useRef, useState } from "react";
import DropDowns from "@/app/component/drop_downs";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/app/utils/checkLanguages";

interface CountryType {
  name: string;
  iso2: string;
}

interface StateType {
  name: string;
  isoCode: string;
}

interface Props {
  hideButton?: boolean;
}

interface FormField {
  type: string;
  name: string;
  label: string;
  value?: string;
}

export default function UserInfo({ hideButton = false }: Props) {
  const { formData, setFormData, isUserComplete } = OrgSignUp();
  const { translate } = useLanguage();
  const dropDownCountryRef = useRef<HTMLDivElement | null>(null);
  const dropDownStateRef = useRef<HTMLDivElement | null>(null);

  const [countries, setCountries] = useState<CountryType[]>([]);
  const [states, setStates] = useState<StateType[]>([]);

  const [countryDropdown, setCountryDropdown] = useState(false);
  const [stateDropdown, setStateDropdown] = useState(false);
  const [selectedCountryISO, setSelectedCountryISO] = useState<string>("");

  const [showBtn, setShowBtn] = useState(true);
  const [translatedLabels, setTranslatedLabels] = useState<Record<string, string>>({});
  const [translationsLoaded, setTranslationsLoaded] = useState<boolean>(false);
  const [translatedPlaceholder, setTranslatedPlaceholder] = useState<string>("Enter phone number (numbers only)");
  const [translatedNoState, setTranslatedNoState] = useState<string>("No state or city is in this country.");
  const [translatedTitle, setTranslatedTitle] = useState<string>("User Information");
  const [translatedContinue, setTranslatedContinue] = useState<string>("Continue");

  const pathname = usePathname();
  const path = "/auth/organization/organization-verification";
  const router = useRouter();

  useEffect(() => {
    if (pathname === path) setShowBtn(false);
  }, [pathname]);

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // Translate title
        const titleTranslation = await translate("User Information");
        setTranslatedTitle(titleTranslation);

        // Translate continue button
        const continueTranslation = await translate("Continue");
        setTranslatedContinue(continueTranslation);

        // Translate placeholder
        const placeholderTranslation = await translate("Enter phone number (numbers only)");
        setTranslatedPlaceholder(placeholderTranslation);

        // Translate no state message
        const noStateTranslation = await translate("No state or city is in this country.");
        setTranslatedNoState(noStateTranslation);

        // Translate form labels
        const labelTranslations: Record<string, string> = {};
        const labels = [
          "First Name",
          "Last Name",
          "Email Address",
          "Phone Number",
          "Country",
          "State/City",
          "Default Role(Cannot be changed)",
          "Form Type (Cannot be changed)",
        ];

        await Promise.all(
          labels.map(async (label) => {
            const translated = await translate(label);
            labelTranslations[label] = translated;
          })
        );

        setTranslatedLabels(labelTranslations);
        setTranslationsLoaded(true);
      } catch (error) {
        console.error("Failed to load translations:", error);
        setTranslationsLoaded(true);
      }
    };

    loadTranslations();
  }, [translate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "user_phone_number") {
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

    setCountryDropdown(false);
    setStateDropdown(false);
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

  const filterCountry = countries.filter((c) =>
    c.name.toLowerCase().includes(formData.user_country?.toLowerCase() || ""),
  );

  const filterState = states.filter((s) =>
    s.name.toLowerCase().includes(formData.user_state?.toLowerCase() || ""),
  );

  const handleCountrySelect = (country: CountryType) => {
    setFormData({ ...formData, user_country: country.name, user_state: "" });
    setSelectedCountryISO(country.iso2);
    setCountryDropdown(false);
    setStateDropdown(false);
  };

  const handleStateSelect = (state: StateType) => {
    setFormData({ ...formData, user_state: state.name });
    setCountryDropdown(false);
    setStateDropdown(false);
  };

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) =>
    e.preventDefault();

  // Helper function to get translated label
  const getTranslatedLabel = (originalLabel: string): string => {
    return translationsLoaded ? translatedLabels[originalLabel] || originalLabel : originalLabel;
  };

  const form: FormField[] = [
    { type: "text", name: "user_first_name", label: "First Name" },
    { type: "text", name: "user_last_name", label: "Last Name" },
    { type: "email", name: "user_email_address", label: "Email Address" },
    { type: "tel", name: "user_phone_number", label: "Phone Number" },
    { type: "text", name: "user_country", label: "Country" },
    { type: "text", name: "user_state", label: "State/City" },
    {
      type: "text",
      name: "user_role",
      label: "Default Role(Cannot be changed)",
    },
    {
      type: "text",
      name: "user_form_type",
      label: "Form Type (Cannot be changed)",
      value: "organization",
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
        {translatedTitle}
      </h1>

      <form onSubmit={handleSubmit} className="py-3" noValidate>
        <div className="md:grid md:grid-cols-2 flex flex-col gap-5">
          {form.map((data, i) => (
            <div key={i} className="flex flex-col gap-1">
              <label className="md:text-[0.8rem] text-[0.95rem]">
                {getTranslatedLabel(data.label)}
              </label>

              {data.name == "user_role" ? (
                <input
                  value={formData[data.name]}
                  name={data.name}
                  onChange={handleChange}
                  className={`${glassTextArea} opacity-70 cursor-not-allowed`}
                  disabled
                />
              ) : data.name === "user_form_type" ? (
                <div>
                  <input
                    value={formData[data.name]}
                    name={data.name}
                    onChange={handleChange}
                    className={`${glassTextArea} opacity-70`}
                    disabled
                  />
                </div>
              ) : data.name === "user_country" ? (
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
                    placeholder={getTranslatedLabel("Search country...")}
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
                            {formData.user_country === c.name && (
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
              ) : data.name === "user_state" ? (
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
                    placeholder={getTranslatedLabel("Search state...")}
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
                        countries={
                          filterState.length == 0 ? (
                            <div className="text-center my-[2rem] text-white text-[15px]">
                              {translatedNoState}
                            </div>
                          ) : (
                            <div>
                              {filterState.map((s, i) => (
                                <div
                                  key={i}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStateSelect(s);
                                  }}
                                  className="flex justify-between items-center py-2 px-3 text-white text-[0.9rem] hover:bg-secondaryColors-0 hover:text-slate-800 parent_check transition-all duration-200"
                                >
                                  {s.name}
                                  {formData.user_state === s.name && (
                                    <FaCheck
                                      size={12}
                                      className="text-white type_check"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )
                        }
                      />
                    )}
                  </div>
                </div>
              ) : (
                <input
                  type={data.type}
                  value={formData[data.name] || ""}
                  onChange={handleChange}
                  name={data.name}
                  maxLength={data.type === "tel" ? 15 : undefined}
                  className="glass_input focus:ring-2 focus:ring-primaryColors-0 focus:ring-offset-0 focus:bg-white/40"
                  placeholder={
                    data.type === "tel" ? translatedPlaceholder : ""
                  }
                />
              )}
            </div>
          ))}
        </div>

        {hideButton ? (
          ""
        ) : (
          <div>
            {showBtn && (
              <button
                onClick={() => {
                  if (formData.org_type == "church") {
                    router.push("/auth/organization/organization-church");
                  } else if (formData.org_type == "school") {
                    router.push("/auth/organization/organization-school");
                  } else if (formData.org_type == "club") {
                    router.push("/auth/organization/organization-club");
                  } else {
                    // "other" (and anything unrecognized) has no dedicated
                    // info step, so it goes straight to verification.
                    router.push(path);
                  }
                }}
                disabled={!isUserComplete}
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
                !isUserComplete
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-black"
              }
            `}
              >
                {translatedContinue} <FaArrowRight />
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}