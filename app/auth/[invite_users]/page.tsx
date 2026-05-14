"use client";
import Image from "next/image";
import pic from "@/public/images/nhbc.jpg";
import React, { useState, useEffect } from "react";
import { FaCheck, FaChevronDown, FaEye, FaEyeSlash } from "react-icons/fa";
import { Country, State } from "country-state-city";
import { useRouter } from "next/navigation";

interface FormData {
  first_name: string;
  last_name: string;
  email_address: string;
  password: string;
  confirm_password: string;
  country: string;
  state: string;
  phone_number: string;
  role: string;
  level: string;
}

interface CountryType {
  name: string;
  iso2: string;
}

interface StateType {
  name: string;
  isoCode: string;
}

interface ApiResponse {
  message: string;
  token?: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email_address: string;
  };
}

export default function Page() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email_address: "",
    password: "",
    confirm_password: "",
    country: "",
    state: "",
    phone_number: "",
    role: "Member",
    level: "Beginner",
  });

  const [countries, setCountries] = useState<CountryType[]>([]);
  const [states, setStates] = useState<StateType[]>([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [searchCountry, setSearchCountry] = useState<string>("");
  const [searchState, setSearchState] = useState<string>("");
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load all countries
  useEffect(() => {
    const allCountries = Country.getAllCountries().map((c) => ({
      name: c.name,
      iso2: c.isoCode,
    }));
    setCountries(allCountries);
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (formData.country) {
      const selectedCountry = countries.find(
        (c) => c.name === formData.country,
      );
      if (selectedCountry) {
        const countryStates = State.getStatesOfCountry(
          selectedCountry.iso2,
        ).map((s) => ({
          name: s.name,
          isoCode: s.isoCode,
        }));
        setStates(countryStates);
      }
    } else {
      setStates([]);
    }
  }, [formData.country, countries]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear general error when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = (): string | null => {
    if (!formData.first_name.trim()) return "First name is required";
    if (!formData.last_name.trim()) return "Last name is required";
    if (!formData.email_address.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email_address)) return "Email is invalid";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (!formData.confirm_password) return "Please confirm your password";
    if (formData.password !== formData.confirm_password) return "Passwords do not match";
    if (!formData.country) return "Country is required";
    if (!formData.state) return "State is required";
    if (!formData.phone_number) return "Phone number is required";
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const { confirm_password, ...apiData } = formData;

      const payload = {
        ...apiData,
      };

      console.log("Sending payload:", payload); // For debugging
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${API_URL}/api/organizations/invite-user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include', // Important for cookies
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess(data.message || 'Account created successfully!');
      router.push('/auth')
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter countries based on search
  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchCountry.toLowerCase()),
  );

  // Filter states based on search
  const filteredStates = states.filter((s) =>
    s.name.toLowerCase().includes(searchState.toLowerCase()),
  );

  // Handle country selection
  const handleChangeCountry = (countryName: string) => {
    setFormData((prev) => ({ ...prev, country: countryName, state: "" }));
    setSearchCountry(countryName);
    setShowCountryDropdown(false);
    setSearchState("");
    if (error) setError(null);
  };

  // Handle state selection
  const handleChangeState = (stateName: string) => {
    setFormData((prev) => ({ ...prev, state: stateName }));
    setSearchState(stateName);
    setShowStateDropdown(false);
    if (error) setError(null);
  };

  // Handle country input change
  const handleChangeSearchCountry = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setSearchCountry(value);
    setFormData((prev) => ({ ...prev, country: value }));
    if (!value) {
      setStates([]);
    }
  };

  // Handle state input change
  const handleChangeSearchState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchState(value);
    setFormData((prev) => ({ ...prev, state: value }));
  };

  const forms = [
    {
      label: "First name",
      name: "first_name",
      type: "text",
      onchange: handleChange,
      value: formData.first_name,
    },
    {
      label: "Last name",
      name: "last_name",
      type: "text",
      onchange: handleChange,
      value: formData.last_name,
    },
    {
      label: "Email address",
      name: "email_address",
      type: "email",
      onchange: handleChange,
      value: formData.email_address,
    },
    {
      label: "Phone number",
      name: "phone_number",
      type: "tel",
      onchange: handleChange,
      value: formData.phone_number,
    },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-black/20">
      {/* Main Container - Responsive grid that stacks on mobile */}
      <div className="relative w-full max-w-6xl bg-black/30 backdrop-blur-md rounded-2xl drop-shadow-2xl flex flex-col lg:grid lg:grid-cols-2 overflow-hidden">
        
        {/* Error Toast - Top Right Corner (Fixed positioning relative to viewport) */}
        {error && (
          <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-slideIn">
            <div className="bg-red-500/90 backdrop-blur-sm border border-red-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 max-w-md mx-auto sm:mx-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="flex-1 text-sm sm:text-base">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="hover:bg-red-600 rounded p-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Success Toast - Top Right Corner */}
        {success && (
          <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-slideIn">
            <div className="bg-green-500/90 backdrop-blur-sm border border-green-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 max-w-md mx-auto sm:mx-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="flex-1 text-sm sm:text-base">{success}</span>
              <button 
                onClick={() => setSuccess(null)}
                className="hover:bg-green-600 rounded p-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Left Section - Welcome Message */}
        <div className="w-full h-full flex justify-center items-center p-6 lg:p-8 order lg:order-1">
          <div className="flex justify-center lg:justify-start items-center lg:items-start flex-col w-full max-w-md text-center lg:text-left">
            <Image
              src={pic}
              alt="logo"
              className="h-[60px] w-[60px] rounded-full mb-4 mx-auto lg:mx-0"
            />
            <h1 className="bg-clip-text bg-gradient-to-tr text-transparent from-white text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Welcome Sean!
            </h1>
            <p className="text-white/60 text-sm sm:text-base lg:text-lg mt-2">
              You were invited to NHBC New Heritage Baptist Church. Please fill the form to accept your invitation.
            </p>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="bg-black/60 w-full h-full flex justify-center items-center p-6 lg:p-8 order-1 lg:order-2">
          <form
            onSubmit={handleSubmit}
            className="flex justify-start items-start flex-col w-full max-w-lg"
          >
            <h1 className="bg-clip-text bg-gradient-to-tr text-transparent from-white text-2xl sm:text-3xl font-bold mb-6">
              Sign Up
            </h1>
            
            {/* Form Fields - Responsive grid: 1 column on mobile, 2 on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {/* Regular input fields */}
              {forms.map((f, i) => (
                <div key={i} className="flex flex-col w-full">
                  <input
                    type={f.type}
                    onChange={f.onchange}
                    name={f.name}
                    value={f.value}
                    placeholder={f.label}
                    className="border-none outline-none bg-[#222222] px-2 h-[45px] rounded-md text-white focus:border-b-blue-500 transition-colors text-sm sm:text-base"
                  />
                </div>
              ))}

              {/* Password field with toggle */}
              <div className="flex flex-col relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  onChange={handleChange}
                  name="password"
                  value={formData.password}
                  placeholder="Password"
                  className="border-none outline-none bg-[#222222] px-2 h-[45px] rounded-md text-white pr-10 focus:border-b-blue-500 transition-colors text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-3 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              {/* Confirm Password field with toggle */}
              <div className="flex flex-col relative w-full">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  onChange={handleChange}
                  name="confirm_password"
                  value={formData.confirm_password}
                  placeholder="Confirm Password"
                  className="border-none outline-none bg-[#222222] px-2 h-[45px] rounded-md text-white pr-10 focus:border-b-blue-500 transition-colors text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-3 text-white/60 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              {/* Country Dropdown */}
              <div className="flex flex-col relative w-full">
                <input
                  type="text"
                  name="country"
                  value={searchCountry || formData.country || ""}
                  onChange={handleChangeSearchCountry}
                  placeholder="Country"
                  className="border-none outline-none bg-[#222222] px-2 h-[45px] rounded-md text-white cursor-pointer focus:border-b-blue-500 transition-colors text-sm sm:text-base"
                  onClick={() => setShowCountryDropdown(true)}
                />
                <FaChevronDown className="absolute right-2 top-4 text-white/60" size={14} />

                {showCountryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-y-auto top-[50px]">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country, i) => (
                        <div
                          key={i}
                          onClick={() => handleChangeCountry(country.name)}
                          className="flex justify-between items-center w-full p-2 sm:p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 text-white text-sm sm:text-base"
                        >
                          <div className="truncate">{country.name}</div>
                          {formData.country === country.name && (
                            <span className="text-green-500 flex-shrink-0 ml-2">
                              <FaCheck size={12} />
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-gray-400 text-sm">No countries found</div>
                    )}
                  </div>
                )}
              </div>

              {/* State Dropdown */}
              <div className="flex flex-col relative w-full">
                <input
                  type="text"
                  name="state"
                  value={searchState || formData.state || ""}
                  onChange={handleChangeSearchState}
                  placeholder="State"
                  className={`border-none outline-none bg-[#222222] px-2 h-[45px] rounded-md text-white ${
                    !formData.country ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  } focus:border-b-blue-500 transition-colors text-sm sm:text-base`}
                  onClick={() => formData.country && setShowStateDropdown(true)}
                  readOnly={!formData.country}
                />
                <FaChevronDown className="absolute right-2 top-4 text-white/60" size={14} />

                {showStateDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-y-auto top-[50px]">
                    {filteredStates.length > 0 ? (
                      filteredStates.map((state, i) => (
                        <div
                          key={i}
                          onClick={() => handleChangeState(state.name)}
                          className="flex justify-between items-center w-full p-2 sm:p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 text-white text-sm sm:text-base"
                        >
                          <div className="truncate">{state.name}</div>
                          {formData.state === state.name && (
                            <span className="text-green-500 flex-shrink-0 ml-2">
                              <FaCheck size={12} />
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-gray-400 text-sm">No states found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Level field (readonly) */}
              <div className="flex flex-col w-full">
                <input
                  type="text"
                  name="level"
                  value={formData.level}
                  readOnly
                  placeholder="Level"
                  className="border-l-0 border-r-0 border-t-0 border-b border-b-white/20 bg-transparent text-white/60 h-[50px] w-full outline-none cursor-not-allowed text-sm sm:text-base"
                />
              </div>

              {/* Role field (readonly) */}
              <div className="flex flex-col w-full">
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  readOnly
                  placeholder="Role"
                  className="border-l-0 border-r-0 border-t-0 border-b border-b-white/20 bg-transparent text-white/60 h-[50px] w-full outline-none cursor-not-allowed text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-primaryColors-0 h-[50px] sm:h-[55px] w-full text-white mt-6 rounded-lg disabled:bg-primaryColors-0/60 disabled:cursor-not-allowed hover:bg-primaryColors-0/70 transition-colors text-sm sm:text-base font-medium"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}