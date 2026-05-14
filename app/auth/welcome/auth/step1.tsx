"use client";

import DropDowns from "@/app/component/drop_downs";
import React, { useEffect, useState } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa";
import { Country, State, City } from "country-state-city";

interface CountryType {
  name: string;
  iso2: string;
}

export default function Step1({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}) {
  const [countries, setCountries] = useState<CountryType[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [searchCountry, setSearchCountry] = useState<string>("");
  const [searchCity, setSearchCity] = useState<string>("");

  const selectedCountry = formData.country;
  const selectedCity = formData.state; // we keep city in state field
  const phoneNumber = formData.phone;

  // Load all countries
  useEffect(() => {
    const allCountries = Country.getAllCountries().map((c) => ({
      name: c.name,
      iso2: c.isoCode,
    }));
    setCountries(allCountries);
  }, []);

  // Filter countries
  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchCountry.toLowerCase())
  );

  // Filter cities
  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(searchCity.toLowerCase())
  );

  // When a country is selected
  const handleChangeCountry = (countryName: string, iso2: string) => {
    setFormData({ ...formData, country: countryName, state: "" });
    setSearchCountry(countryName);
    setShowCountryDropdown(false);

    // Get all cities of the country
    const countryCities: any[] = [];
    const countryStates = State.getStatesOfCountry(iso2);
    countryStates.forEach((state) => {
      const stateCities = City.getCitiesOfState(iso2, state.isoCode);
      countryCities.push(...stateCities);
    });
    setCities(countryCities);
  };

  // When a city is selected
  const handleChangeCity = (cityName: string) => {
    setFormData({ ...formData, city: cityName });
    setSearchCity(cityName);
    setShowCityDropdown(false);
  };

  const handleChangePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone: e.target.value });
  };

  const handleChangeSearchCountry = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setSearchCountry(value);
    setFormData({ ...formData, country: value });
  };

  const handleChangeSearchCity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchCity(value);
    setFormData({ ...formData, city: value });
  };

  return (
    <div className="w-full">
      <h1 className="form_h1">Tell us more about you.</h1>
      <p className="form-p my-5">
        Share your contact where you are coming from.
      </p>

      <form className="flex flex-col gap-4 my-4">
        {/* COUNTRY DROPDOWN */}
        <div className="relative">
          <input
            type="text"
            value={searchCountry || selectedCountry || ""}
            onChange={handleChangeSearchCountry}
            placeholder="Select Country"
            className="form_input flex justify-between items-center cursor-pointer"
            onClick={() => setShowCountryDropdown(true)}
          />
          <FaChevronDown className="absolute top-[23px] right-[15px] text-textGrey-0" />

          {showCountryDropdown && (
            <DropDowns
              value={selectedCountry}
              onChange={() => {}}
              countries={filteredCountries.map((c, i) => (
                <div
                  key={i}
                  onClick={() => handleChangeCountry(c.name, c.iso2)}
                  className="flex justify-between items-center w-full p-3 hover:bg-secondaryColors-0 cursor-pointer"
                >
                  <div className="dark:text-white text-lightBoldText-0">{c.name}</div>
                  {selectedCountry === c.name && (
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
          <input
            type="text"
            value={searchCity || selectedCity || ""}
            onChange={handleChangeSearchCity}
            placeholder="Select City"
            className={`form_input peer flex justify-between items-center cursor-pointer ${
              !cities.length ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => cities.length && setShowCityDropdown(true)}
          />
          <FaChevronDown className="absolute top-[23px] right-[15px] text-textGrey-0" />

          {showCityDropdown && (
            <DropDowns
              onChange={() => {}}
              value={selectedCity}
              countries={filteredCities.map((city, i) => (
                <div
                  key={i}
                  onClick={() => handleChangeCity(city.name)}
                  className="flex justify-between items-center w-full p-3 hover:bg-secondaryColors-0 cursor-pointer"
                >
                  <div className="dark:text-white text-lightBoldText-0">{city.name}</div>
                  {selectedCity === city.name && (
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
            value={phoneNumber || ""}
            onChange={handleChangePhoneNumber}
            placeholder=" "
            className="form_input peer focus:outline-none"
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
