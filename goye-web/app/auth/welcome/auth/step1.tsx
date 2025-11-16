"use client";

import DropDowns from "@/app/component/drop_downs";
import { useEffect, useState } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa";

interface Country {
  iso2?: string;
  iso3?: string;
  country: string;
  cities: string[];
}

export default function Step1({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}) {
  const [country, setCountry] = useState<Country[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const selectedCountry = formData.country;
  const selectedCity = formData.city;
  const phoneNumber = formData.phone;

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
  }, []);

  const handleChangeCountry = (countryName: string) => {
    setFormData({ ...formData, country: countryName, city: "" });
    const selected = country.find((c) => c.country === countryName);
    if (selected) setCities(selected.cities || []);
    setShowCountryDropdown(false);
  };

  const handleChangeCity = (cityName: string) => {
    setFormData({ ...formData, city: cityName });
    setShowCityDropdown(false);
  };

  const handleChangePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone: e.target.value });
  };

  return (
    <div className="w-full">
      <h1 className="form_h1">Tell us more about you.</h1>
      <p className="form-p my-5">Share your contact where you are coming from.</p>

      <form className="flex flex-col gap-4 my-4">
        {/* COUNTRY DROPDOWN */}
        <div className="relative">
          <div
            className="form_input peer flex justify-between items-center cursor-pointer"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
          >
            <span>{selectedCountry}</span>
            <FaChevronDown />
          </div>
          <label
            className={`absolute top-[15px] left-[12px] label transition-all duration-300 ease-in-out
              ${
                showCountryDropdown || selectedCountry
                  ? "top-[2px] text-[14px]"
                  : "top-[15px] text-[16px]"
              }`}
          >
            Select Country
          </label>

          {showCountryDropdown && (
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
          )}
        </div>

        {/* CITY DROPDOWN */}
        <div className="relative">
          <div
            className={`form_input peer flex justify-between items-center cursor-pointer ${
              !cities.length ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => cities.length && setShowCityDropdown(!showCityDropdown)}
          >
            <span>{selectedCity}</span>
            <FaChevronDown />
          </div>

          <label
            className={`absolute top-[15px] left-[12px] label transition-all duration-300 ease-in-out
              ${
                showCityDropdown || selectedCity
                  ? "top-[2px] text-[14px]"
                  : "top-[15px] text-[16px]"
              }`}
          >
            Select City
          </label>

          {showCityDropdown && (
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
          )}
        </div>

        {/* PHONE INPUT */}
        <div className="relative">
          <input
            type="tel"
            name="phone"
            value={phoneNumber as any}
            onChange={handleChangePhoneNumber}
            placeholder=" "
            className={`form_input peer focus:outline-none`}
          />
          <label
            htmlFor="phone"
            className={`absolute top-[15px] left-[12px] label peer-focus:text-[14px] peer-focus:top-[2px] transition-all duration-300 ease-in-out peer-placeholder-shown:top-[15px] peer-placeholder-shown:text-[16px] ${
              phoneNumber ? "top-[2px] text-[14px]" : "top-[15px] text-[16px]"
            }`}
          >
            Phone Number
          </label>
        </div>
      </form>
    </div>
  );
}
