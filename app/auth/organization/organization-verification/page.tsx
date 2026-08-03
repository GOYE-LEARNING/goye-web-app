"use client";

import { useEffect, useRef, useState } from "react";
import { OrgSignUp, INITIAL_FORM_DATA } from "../BodyProvider";
import OrgInfo from "../organization-information/OrgInfo";
import ChurchInfo from "../organization-church/ChurchInfo";
import SchoolInfo from "../organization-school/SchoolInfo";
import ClubInfo from "../organization-club/ClubInfo";
import { IoReload, IoCopy } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheck, FaEye, FaEyeSlash } from "react-icons/fa6";
import { useOrganizationContext } from "@/app/component/organization_component/organanization_context";
import UserInfo from "../user-information/UserInfo";
import { useModal } from "@/app/context/SimpleModalContext";
import Portal from "@/app/component/Portal";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/utils/checkLanguages";

export default function PreviewVerification() {
  const {
    formData,
    setFormData,
    isVerifying,
    setIsVerifying,
    isVerifyComplete,
    setIsVerifyingComplete,
  } = OrgSignUp();

  const { showModal } = useModal();
  const { translate } = useLanguage();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const modalRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [newOrganizationId, setNewOrganizationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [orgName, setOrgName] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const router = useRouter();
  const { organizationId, setOrganizationId } = useOrganizationContext();
  const [editingSection, setEditingSection] = useState({
    user_info: false,
    org: false,
    church: false,
    school: false,
    club: false,
  });

  const [isClient, setIsClient] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>("");

  // Translation states
  const [translatedTitle, setTranslatedTitle] = useState("Preview & Verification Information");
  const [translatedOrgInfo, setTranslatedOrgInfo] = useState("Organization Information");
  const [translatedUserInfo, setTranslatedUserInfo] = useState("User Information");
  const [translatedChurchInfo, setTranslatedChurchInfo] = useState("Church Information");
  const [translatedSchoolInfo, setTranslatedSchoolInfo] = useState("School Information");
  const [translatedClubInfo, setTranslatedClubInfo] = useState("Club Information");
  const [translatedEditInfo, setTranslatedEditInfo] = useState("Edit Information");
  const [translatedBackToPreview, setTranslatedBackToPreview] = useState("← Back to Preview");
  const [translatedVerifySubmit, setTranslatedVerifySubmit] = useState("Verify & Submit");
  const [translatedVerifying, setTranslatedVerifying] = useState("Verifying...");
  const [translatedVerifyOTP, setTranslatedVerifyOTP] = useState("Verify OTP");
  const [translatedResendOTP, setTranslatedResendOTP] = useState("Resend OTP");
  const [translatedResendIn, setTranslatedResendIn] = useState("Resend in");
  const [translatedEnterOTP, setTranslatedEnterOTP] = useState("Enter the 6-digit code sent to");
  const [translatedCheckEmail, setTranslatedCheckEmail] = useState("Please check your email or paste the code below");
  const [translatedDidntReceive, setTranslatedDidntReceive] = useState("Didn't receive the code? Check your spam folder or contact support");
  const [translatedCancel, setTranslatedCancel] = useState("Cancel");
  const [translatedOrgVerified, setTranslatedOrgVerified] = useState("Organization Verified! 🎉");
  const [translatedHasBeenVerified, setTranslatedHasBeenVerified] = useState("has been successfully verified");
  const [translatedPasswordGenerated, setTranslatedPasswordGenerated] = useState("Your organization password has been generated");
  const [translatedSavePassword, setTranslatedSavePassword] = useState("Please save this password. You'll need it to login to your organization account.");
  const [translatedContinueToLogin, setTranslatedContinueToLogin] = useState("Continue to Login");
  const [translatedSaveLater, setTranslatedSaveLater] = useState("I'll save this later");
  const [translatedCopy, setTranslatedCopy] = useState("Copy");
  const [translatedCopied, setTranslatedCopied] = useState("Copied!");
  const [translatedNoLogo, setTranslatedNoLogo] = useState("No logo uploaded");
  const [translatedNoDocument, setTranslatedNoDocument] = useState("No document uploaded");
  const [translatedDocumentReady, setTranslatedDocumentReady] = useState("Document ready for upload");
  const [translatedViewDocument, setTranslatedViewDocument] = useState("View uploaded document");
  const [translatedFieldLabels, setTranslatedFieldLabels] = useState<Record<string, string>>({});
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // Main titles
        const title = await translate("Preview & Verification Information");
        setTranslatedTitle(title);

        const orgInfo = await translate("Organization Information");
        setTranslatedOrgInfo(orgInfo);

        const userInfo = await translate("User Information");
        setTranslatedUserInfo(userInfo);

        const churchInfo = await translate("Church Information");
        setTranslatedChurchInfo(churchInfo);

        const schoolInfo = await translate("School Information");
        setTranslatedSchoolInfo(schoolInfo);

        const clubInfo = await translate("Club Information");
        setTranslatedClubInfo(clubInfo);

        // Buttons and actions
        const editInfo = await translate("Edit Information");
        setTranslatedEditInfo(editInfo);

        const backToPreview = await translate("← Back to Preview");
        setTranslatedBackToPreview(backToPreview);

        const verifySubmit = await translate("Verify & Submit");
        setTranslatedVerifySubmit(verifySubmit);

        const verifying = await translate("Verifying...");
        setTranslatedVerifying(verifying);

        const verifyOTP = await translate("Verify OTP");
        setTranslatedVerifyOTP(verifyOTP);

        const resendOTP = await translate("Resend OTP");
        setTranslatedResendOTP(resendOTP);

        const resendIn = await translate("Resend in");
        setTranslatedResendIn(resendIn);

        // OTP modal
        const enterOTP = await translate("Enter the 6-digit code sent to");
        setTranslatedEnterOTP(enterOTP);

        const checkEmail = await translate("Please check your email or paste the code below");
        setTranslatedCheckEmail(checkEmail);

        const didntReceive = await translate("Didn't receive the code? Check your spam folder or contact support");
        setTranslatedDidntReceive(didntReceive);

        const cancel = await translate("Cancel");
        setTranslatedCancel(cancel);

        // Password modal
        const orgVerified = await translate("Organization Verified! 🎉");
        setTranslatedOrgVerified(orgVerified);

        const hasBeenVerified = await translate("has been successfully verified");
        setTranslatedHasBeenVerified(hasBeenVerified);

        const passwordGenerated = await translate("Your organization password has been generated");
        setTranslatedPasswordGenerated(passwordGenerated);

        const savePassword = await translate("Please save this password. You'll need it to login to your organization account.");
        setTranslatedSavePassword(savePassword);

        const continueToLogin = await translate("Continue to Login");
        setTranslatedContinueToLogin(continueToLogin);

        const saveLater = await translate("I'll save this later");
        setTranslatedSaveLater(saveLater);

        const copy = await translate("Copy");
        setTranslatedCopy(copy);

        const copied = await translate("Copied!");
        setTranslatedCopied(copied);

        // File upload labels
        const noLogo = await translate("No logo uploaded");
        setTranslatedNoLogo(noLogo);

        const noDocument = await translate("No document uploaded");
        setTranslatedNoDocument(noDocument);

        const documentReady = await translate("Document ready for upload");
        setTranslatedDocumentReady(documentReady);

        const viewDocument = await translate("View uploaded document");
        setTranslatedViewDocument(viewDocument);

        // Field labels for organization info
        const fieldLabels: Record<string, string> = {};
        const fields = [
          "Organization Name",
          "Organization Type",
          "Email Address",
          "Phone Number",
          "Country",
          "State",
          "Role",
          "Year Established",
          "Description",
          "First Name",
          "Last Name",
          "User Email Address",
          "User Phone Number",
          "User Country",
          "User State",
          "Ministry Name",
          "Lead Pastor",
          "Leadership Role",
          "Address",
          "Weekly Service",
          "Email",
          "Website",
          "Church Logo",
          "School Name",
          "School Type",
          "Admin Name",
          "Admin Role",
          "Email Domain",
          "Accreditation Number",
          "Official Document",
          "Club Name",
          "Club Type",
          "Leader Name",
          "Leader Role",
          "Meeting Frequency",
          "Social Link",
          "Parent Organization",
          "Club Description",
          "Club Document"
        ];

        await Promise.all(
          fields.map(async (field) => {
            const translated = await translate(field);
            fieldLabels[field] = translated;
          })
        );

        setTranslatedFieldLabels(fieldLabels);
        setTranslationsLoaded(true);
      } catch (error) {
        console.error("Failed to load translations:", error);
        setTranslationsLoaded(true);
      }
    };

    loadTranslations();
  }, [translate]);

  useEffect(() => {
    if (formData.church_logo && formData.church_logo instanceof File) {
      const url = URL.createObjectURL(formData.church_logo);
      setLogoPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (
      typeof formData.church_logo === "string" &&
      formData.church_logo
    ) {
      setLogoPreviewUrl(formData.church_logo);
    } else {
      setLogoPreviewUrl("");
    }
  }, [formData.church_logo]);

  // Timer for OTP expiry
  useEffect(() => {
    if (showOTPModal && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showOTPModal]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper function to get translated field label
  const getTranslatedLabel = (originalLabel: string): string => {
    return translationsLoaded ? translatedFieldLabels[originalLabel] || originalLabel : originalLabel;
  };

  // Rest of the functions remain the same...
  const closeModal = (e?: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e?.target as Node)) {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    closeModal();
    setOrganizationId(newOrganizationId);
  }, [newOrganizationId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const convertFileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const base64String = reader.result.split(",")[1] || reader.result;
          resolve(base64String);
        } else reject(new Error("Failed to convert file to base64"));
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async (file: File, endpoint: string): Promise<string> => {
    if (!file) throw new Error("No file provided");
    const base64String = await convertFileToBase64(file);

    const payload = {
      file: base64String,
      fileName: file.name,
      mimeType: file.type,
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    const data = await res.json();
    if (!data.url) throw new Error("No valid file URL returned");
    return data.url;
  };

  const sendOTP = async (organizationId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/api/organizations/auth/send-verification-otp/${organizationId}`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!res.ok) {
        const errorMsg = await translate("Failed to send OTP");
        showModal("OTP Error", data.message || errorMsg, "error");
        return false;
      }

      return true;
    } catch (error: any) {
      const errorMsg = await translate("Failed to send OTP");
      showModal("Error", error.message || errorMsg, "error");
      return false;
    }
  };

  const resendOTP = async () => {
    if (!newOrganizationId) return;

    setOtpError("");
    setOtpSuccess("");

    try {
      const res = await fetch(
        `${API_URL}/api/organizations/auth/resend-verification-otp/${newOrganizationId}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        const failedMsg = await translate("Failed to resend OTP");
        setOtpError(data.message || failedMsg);
        return;
      }

      setResendCount((prev) => prev + 1);
      setTimeLeft(600);
      setCanResend(false);
      const successMsg = await translate("New OTP sent successfully!");
      setOtpSuccess(successMsg);

      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      setTimeout(() => setOtpSuccess(""), 3000);
    } catch (error: any) {
      const failedMsg = await translate("Failed to resend OTP");
      setOtpError(error.message || failedMsg);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData("text").trim();
    if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      const digits = pastedData.split("");
      const newOtp = [...otp];
      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      const errorMsg = await translate("Please enter a valid 6-digit OTP");
      setOtpError(errorMsg);
      return;
    }

    setIsVerifyingOTP(true);
    setOtpError("");
    setOtpSuccess("");

    try {
      const res = await fetch(
        `${API_URL}/api/organizations/auth/verify-organization-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            organizationId: newOrganizationId,
            otp: otpString,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        const invalidMsg = await translate("Invalid OTP. Please try again.");
        setOtpError(data.message || invalidMsg);
        return;
      }

      const successMsg = await translate("Organization verified successfully!");
      setOtpSuccess(successMsg);

      try {
        const passRes = await fetch(
          `${API_URL}/api/organizations/organization-password-generated/${newOrganizationId}`,
          {
            method: "POST",
            credentials: "include",
          },
        );
        const passData = await passRes.json();

        if (passRes.ok && passData.generatedPassword) {
          setGeneratedPassword(passData.generatedPassword);
        } else {
          console.error("Password generation failed:", passData);
        }
      } catch (err) {
        console.error("Password generation failed", err);
      }

      setTimeout(() => {
        setShowOTPModal(false);
        setIsVerifyingComplete(true);
        const orgNameValue = formData.org_name || "Your Organization";
        setOrgName(orgNameValue);
        setShowPasswordModal(true);
      }, 1500);
    } catch (error: any) {
      const failedMsg = await translate("Failed to verify OTP");
      setOtpError(error.message || failedMsg);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleOTPInputChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, "");
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasswordCopy = () => {
    navigator.clipboard.writeText(generatedPassword).then(() => {
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 3000);
    });
  };

  const validateForm = () => {
    // Check organization fields
    if (!formData.org_name?.trim()) {
      const errorMsg = "Organization name is required";
      showModal("Missing Information", errorMsg, "error");
      return false;
    }
    if (!formData.org_type?.trim()) {
      const errorMsg = "Organization type is required";
      showModal("Missing Information", errorMsg, "error");
      return false;
    }
    if (!formData.org_email?.trim()) {
      const errorMsg = "Organization email is required";
      showModal("Missing Information", errorMsg, "error");
      return false;
    }
    if (!formData.org_phone_number?.trim()) {
      const errorMsg = "Organization phone number is required";
      showModal("Missing Information", errorMsg, "error");
      return false;
    }
    if (!formData.org_country?.trim()) {
      const errorMsg = "Organization country is required";
      showModal("Missing Information", errorMsg, "error");
      return false;
    }
    if (!formData.org_state?.trim()) {
      const errorMsg = "Organization state is required";
      showModal("Missing Information", errorMsg, "error");
      return false;
    }
    if (!formData.org_description?.trim()) {
      const errorMsg = "Organization description is required";
      showModal("Missing Information", errorMsg, "error");
      return false;
    }
    if (!formData.org_year?.trim()) {
      const errorMsg = "Organization year is required";
      showModal("Missing Information", errorMsg, "error");
      return false;
    }

    // Check user fields
    if (!formData.user_first_name?.trim()) {
      const errorMsg = "User first name is required";
      showModal("Missing Information", errorMsg, "error");
      return false;
    }
    if (!formData.user_last_name?.trim()) {
      const errorMsg = "User last name is required";
      showModal("Missing Information", errorMsg, "error");
      return false;
    }
    if (!formData.user_email_address?.trim()) {
      const errorMsg = "User email address is required";
      showModal("Missing Information", errorMsg, "error");
      return false;
    }
    if (!formData.user_phone_number?.trim()) {
      const errorMsg = "User phone number is required";
      showModal("Missing Information", errorMsg, "error");
      return false;
    }
    if (!formData.user_country?.trim()) {
      const errorMsg = "User country is required";
      showModal("Missing Information", errorMsg, "error");
      return false;
    }
    if (!formData.user_state?.trim()) {
      const errorMsg = "User state is required";
      showModal("Missing Information", errorMsg, "error");
      return false;
    }

    // Check type-specific fields
    if (formData.main_type === "church") {
      if (!formData.church_min_name?.trim()) {
        const errorMsg = "Church ministry name is required";
        showModal("Missing Information", errorMsg, "error");
        return false;
      }
      if (!formData.church_ld_pastor?.trim()) {
        const errorMsg = "Church lead pastor is required";
        showModal("Missing Information", errorMsg, "error");
        return false;
      }
      if (!formData.church_address?.trim()) {
        const errorMsg = "Church address is required";
        showModal("Missing Information", errorMsg, "error");
        return false;
      }
      if (!formData.church_email?.trim()) {
        const errorMsg = "Church email is required";
        showModal("Missing Information", errorMsg, "error");
        return false;
      }
    }

    if (formData.main_type === "school") {
      if (!formData.school_name?.trim()) {
        const errorMsg = "School name is required";
        showModal("Missing Information", errorMsg, "error");
        return false;
      }
      if (!formData.school_type?.trim()) {
        const errorMsg = "School type is required";
        showModal("Missing Information", errorMsg, "error");
        return false;
      }
      if (!formData.school_address?.trim()) {
        const errorMsg = "School address is required";
        showModal("Missing Information", errorMsg, "error");
        return false;
      }
      if (!formData.school_admin_name?.trim()) {
        const errorMsg = "School admin name is required";
        showModal("Missing Information", errorMsg, "error");
        return false;
      }
    }

    if (formData.main_type === "club") {
      if (!formData.club_name?.trim()) {
        const errorMsg = "Club name is required";
        showModal("Missing Information", errorMsg, "error");
        return false;
      }
      if (!formData.club_type?.trim()) {
        const errorMsg = "Club type is required";
        showModal("Missing Information", errorMsg, "error");
        return false;
      }
      if (!formData.club_leader_name?.trim()) {
        const errorMsg = "Club leader name is required";
        showModal("Missing Information", errorMsg, "error");
        return false;
      }
    }

    return true;
  };

  const verifyFunc = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
  // Get language from localStorage
  const language = localStorage.getItem('lang') || 'English';
  const languageCode = localStorage.getItem('langCode') || 'en';
    const bodyDTO = {
      organization_name: formData.org_name,
      organization_type: formData.main_type,
      organization_email: formData.org_email,
      organization_phone_number: formData.org_phone_number,
      organization_country: formData.org_country,
      organization_role: formData.org_role,
      organization_state: formData.org_state,
      organization_description: formData.org_description,
         language: language,
    languageCode: languageCode,
      organization_year: formData.org_year,
      user_first_name: formData.user_first_name,
      user_last_name: formData.user_last_name,
      user_email_address: formData.user_email_address,
      user_country: formData.user_country,
      user_state: formData.user_state,
      user_role: formData.user_role,
      user_phone_number: formData.user_phone_number,
      user_form_type: formData.user_form_type,
      ...(formData.main_type === "church" && {
        church: {
          church_ministry_name: formData.church_min_name,
          church_lead_pastor: formData.church_ld_pastor,
          church_leadership_role: formData.church_leader_ship_role,
          church_address: formData.church_address,
          church_weekly_service: formData.church_weekly_service,
          church_website: formData.church_website,
          church_email: formData.church_email,
          church_logo: "",
        },
      }),
      ...(formData.main_type === "school" && {
        school: {
          school_name: formData.school_name,
          school_type: formData.school_type,
          school_address: formData.school_address,
          school_admin_name: formData.school_admin_name,
          school_role: formData.school_role,
          school_website: formData.school_website,
          school_accreditation_number: formData.school_accreditation_number,
          school_document: "",
          school_email: formData.school_email,
        },
      }),
      ...(formData.main_type === "club" && {
        club: {
          club_name: formData.club_name,
          club_type: formData.club_type,
          club_leader_name: formData.club_leader_name,
          club_meeting_frequency: formData.club_meeting_frequency,
          club_social_link: formData.club_social_link,
          club_description: formData.club_description,
          club_document: "",
          club_role: formData.club_role,
        },
      }),
    };

    try {
      const res = await fetch(
        `${API_URL}/api/organizations/auth/create-organization`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(bodyDTO),
        },
      );

      const orgData = await res.json();
console.log(orgData)
      if (!res.ok) {
        const errorMessage = orgData.message || orgData.error || "Failed to create organization";
        const translatedError = await translate("Creation Failed");
        showModal(translatedError, errorMessage, "error");
        setLoading(false);
        return;
      }

      const orgId = orgData.data?.id;
      if (!orgId) {
        const errorMsg = orgData.message || "No organization ID returned";
        const translatedError = await translate("Error");
        showModal(translatedError, errorMsg, "error");
        setLoading(false);
        return;
      }

      setNewOrganizationId(orgId);
      setOrganizationId(orgId);

      const otpSent = await sendOTP(orgId);
      if (!otpSent) {
        setLoading(false);
        return;
      }

      const updates: any = {};
      let uploadErrors: string[] = [];

      if (formData.church_logo && formData.church_logo instanceof File) {
        try {
          updates.church = {
            church_logo: await uploadFile(
              formData.church_logo as File,
              `/api/organizations/upload-church-logo/${orgId}`,
            ),
          };
        } catch (error: any) {
          uploadErrors.push(`Church logo: ${error.message}`);
        }
      }

      if (
        formData.school_document &&
        formData.school_document instanceof File
      ) {
        try {
          updates.school = {
            school_document: await uploadFile(
              formData.school_document as File,
              `/api/organizations/upload-school-document/${orgId}`,
            ),
          };
        } catch (error: any) {
          uploadErrors.push(`School document: ${error.message}`);
        }
      }

      if (formData.club_document && formData.club_document instanceof File) {
        try {
          updates.club = {
            club_document: await uploadFile(
              formData.club_document as File,
              `/api/organizations/upload-club-document/${orgId}`,
            ),
          };
        } catch (error: any) {
          uploadErrors.push(`Club document: ${error.message}`);
        }
      }

      if (Object.keys(updates).length > 0) {
        try {
          const updateRes = await fetch(
            `${API_URL}/api/organizations/update-organization/${orgId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(updates),
            },
          );

          if (!updateRes.ok) {
            const errorData = await updateRes.json();
            uploadErrors.push(
              `Update: ${errorData.message || "Failed to update organization"}`,
            );
          }
        } catch (error: any) {
          uploadErrors.push(`Update: ${error.message}`);
        }
      }

      if (uploadErrors.length > 0) {
        const warningTitle = await translate("Upload Warnings");
        const warningMsg = `Organization created but some files failed to upload:\n${uploadErrors.join("\n")}`;
        showModal(warningTitle, warningMsg, "error");
      }

      setFormData(INITIAL_FORM_DATA);
      setShowOTPModal(true);
    } catch (error: any) {
      const errorTitle = await translate("Error");
      const errorMsg = error.message || "An unexpected error occurred";
      showModal(errorTitle, errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const renderValue = (value: any) => {
    if (!isClient) {
      return "----";
    }
    return value || "----";
  };

  // Define field groups for rendering
  const orgFields = [
    ["Organization Name", formData.org_name],
    ["Organization Type", formData.org_type],
    ["Email Address", formData.org_email],
    ["Phone Number", formData.org_phone_number],
    ["Country", formData.org_country],
    ["State", formData.org_state],
    ["Role", formData.org_role],
    ["Year Established", formData.org_year],
  ];

  const userFields = [
    ["First Name", formData.user_first_name],
    ["Last Name", formData.user_last_name],
    ["User Email Address", formData.user_email_address],
    ["User Phone Number", formData.user_phone_number],
    ["User Country", formData.user_country],
    ["User State", formData.user_state],
  ];

  const churchFields = [
    ["Ministry Name", formData.church_min_name],
    ["Lead Pastor", formData.church_ld_pastor],
    ["Leadership Role", formData.church_leader_ship_role],
    ["Address", formData.church_address],
    ["Weekly Service", formData.church_weekly_service],
    ["Email", formData.church_email],
    ["Website", formData.church_website],
  ];

  const schoolFields = [
    ["School Name", formData.school_name],
    ["School Type", formData.school_type],
    ["Address", formData.school_address],
    ["Admin Name", formData.school_admin_name],
    ["Admin Role", formData.school_role],
    ["Email Domain", formData.school_email_domain],
    ["Website", formData.school_website],
    ["Accreditation Number", formData.school_accreditation_number],
  ];

  const clubFields = [
    ["Club Name", formData.club_name],
    ["Club Type", formData.club_type],
    ["Leader Name", formData.club_leader_name],
    ["Leader Role", formData.club_role],
    ["Meeting Frequency", formData.club_meeting_frequency],
    ["Social Link", formData.club_social_link],
    ["Parent Organization", formData.club_parent_org],
    ["Description", formData.club_description],
  ];

  return (
    <>
      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <Portal>
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 h-full w-full bg-black/70 backdrop-blur-sm z-[9999] flex justify-center items-center"
                onClick={() => {}}
              />
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className=" z-[9999] relative min-h-screen flex justify-center items-center h-full"
              >
                <div className="bg-[#1a1d26] rounded-xl shadow-2xl overflow-hidden border border-[#252830] p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCheck className="text-green-500 text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {translatedOrgVerified}
                    </h2>
                    <p className="text-[#B8BCC8] text-sm mt-2">
                      <span className="text-orange-500 font-semibold">
                        {orgName || formData.org_name}
                      </span>{" "}
                      {translatedHasBeenVerified}
                    </p>
                  </div>

                  <div className="bg-[#252830] rounded-lg p-4 mb-6 border border-[#3a3d4a]">
                    <p className="text-[#B8BCC8] text-sm mb-2 text-center">
                      {translatedPasswordGenerated}
                    </p>
                    <div className="flex items-center justify-between gap-2 bg-[#121318] rounded-lg px-4 py-3 border border-[#3a3d4a]">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[#9CA3B0] hover:text-white transition-colors"
                        >
                          {showPassword ? (
                            <FaEyeSlash size={18} />
                          ) : (
                            <FaEye size={18} />
                          )}
                        </button>
                        <span className="font-mono text-lg text-white tracking-wider select-all">
                          {showPassword
                            ? generatedPassword
                            : "•".repeat(generatedPassword.length || 12)}
                        </span>
                      </div>
                      <button
                        onClick={handlePasswordCopy}
                        className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors"
                      >
                        <IoCopy size={18} />
                        <span className="text-sm">
                          {passwordCopied ? translatedCopied : translatedCopy}
                        </span>
                      </button>
                    </div>
                    <p className="text-[#9CA3B0] text-xs mt-2 text-center">
                      {translatedSavePassword}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setShowPasswordModal(false);
                        setIsVerifyingComplete(true);
                        showModal(
                          "Verification Complete",
                          `Organization "${orgName || formData.org_name}" has been successfully verified!`,
                          "success",
                        );
                        router.push("/auth");
                      }}
                      className="w-full bg-orange-500 text-[#121318] py-3 rounded-lg font-semibold hover:bg-orange-400 transition-colors"
                    >
                      {translatedContinueToLogin}
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordModal(false);
                        setIsVerifyingComplete(false);
                      }}
                      className="w-full text-[#9CA3B0] hover:text-white transition-colors text-sm"
                    >
                      {translatedSaveLater}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          </Portal>
        )}
      </AnimatePresence>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOTPModal && (
          <Portal>
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 h-full w-full bg-black/70 backdrop-blur-sm z-[9999] flex justify-center items-center"
                onClick={() => setShowOTPModal(false)}
              />
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className=" z-[9999] relative min-h-screen flex justify-center items-center h-full"
              >
                <div className="bg-[#1a1d26] rounded-xl shadow-2xl overflow-hidden border border-[#252830] p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCheck className="text-orange-500 text-2xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {translatedVerifyOTP}
                    </h2>
                    <p className="text-[#B8BCC8] text-sm mt-2">
                      {translatedEnterOTP}{" "}
                      <span className="text-orange-500">
                        {formData.org_email}
                      </span>
                    </p>
                    <p className="text-[#9CA3B0] text-xs mt-1">
                      {translatedCheckEmail}
                    </p>
                  </div>

                  {otpError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
                      {otpError}
                    </div>
                  )}

                  {otpSuccess && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-sm">
                      {otpSuccess}
                    </div>
                  )}

                  <div className="flex justify-center gap-2 mb-6">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleOTPInputChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-12 h-14 text-center text-xl bg-[#252830] border border-[#3a3d4a] rounded-lg text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                        autoFocus={index === 0}
                        disabled={timeLeft === 0}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-[#B8BCC8] mb-6">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {formatTime(timeLeft)}
                    </span>
                    <button
                      onClick={resendOTP}
                      disabled={!canResend || isVerifyingOTP}
                      className={`flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors ${
                        !canResend ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <IoReload
                        className={`${isVerifyingOTP ? "animate-spin" : ""}`}
                      />
                      {canResend
                        ? translatedResendOTP
                        : `${translatedResendIn} ${formatTime(timeLeft)}`}
                    </button>
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={isVerifyingOTP || timeLeft === 0}
                    className="w-full bg-orange-500 text-[#121318] py-3 rounded-lg font-semibold hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifyingOTP ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#121318] border-t-transparent"></span>
                        {translatedVerifying}
                      </span>
                    ) : (
                      translatedVerifyOTP
                    )}
                  </button>

                  <div className="mt-4 text-center">
                    <p className="text-[#9CA3B0] text-xs">
                      {translatedDidntReceive}
                    </p>
                    <button
                      onClick={() => {
                        setShowOTPModal(false);
                        setIsVerifyingComplete(false);
                      }}
                      className="text-[#9CA3B0] text-sm hover:text-white transition-colors mt-2"
                    >
                      {translatedCancel}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          </Portal>
        )}
      </AnimatePresence>

      <div className="glass_effect text-white relative rounded-[30px] w-full h-full p-[20px] overflow-y-auto overflow-x-hidden chat_scroll3">
        <h1 className="md:text-[24px] text-[20px] font-semibold pb-[20px] relative org_h1">
          {translatedTitle}
        </h1>

        {/* -------------------- ORGANIZATION -------------------- */}
        <div
          className={`mb-6 ${editingSection.org ? "border-0 pb-0" : "border-b pb-4"}`}
        >
          {!editingSection.org ? (
            <div className="flex justify-between items-center">
              <h2 className="text-[20px] font-semibold">
                {translatedOrgInfo}
              </h2>
              <span
                className="text-white underline cursor-pointer"
                onClick={() =>
                  setEditingSection({ ...editingSection, org: true })
                }
              >
                {translatedEditInfo}
              </span>
            </div>
          ) : (
            <div>
              <button
                className="text-primaryColors-0 underline mb-4"
                onClick={() =>
                  setEditingSection({ ...editingSection, org: false })
                }
              >
                {translatedBackToPreview}
              </button>
              <OrgInfo hideButton={true} />
            </div>
          )}

          {!editingSection.org && (
            <div className="md:grid md:grid-cols-2 flex flex-col gap-3 text-[0.9rem] mt-3">
              {orgFields.map(([label, value], i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="md:text-[0.8rem] text-[0.95rem]">
                    {getTranslatedLabel(label)}
                  </span>
                  <div className="glass_input flex justify-start items-center">
                    {renderValue(value)}
                  </div>
                </div>
              ))}
              <div className="col-span-2 flex flex-col gap-1">
                <span className="md:text-[0.8rem] text-[0.95rem]">
                  {getTranslatedLabel("Description")}
                </span>
                <div className="glass_input h-[100px] flex justify-start items-center overflow-y-auto">
                  {renderValue(formData.org_description)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* -------------------- USER INFORMATION -------------------- */}
        <div
          className={`mb-6 ${editingSection.user_info ? "border-0 pb-0" : "border-b pb-4"}`}
        >
          {!editingSection.user_info ? (
            <div className="flex justify-between items-center">
              <h2 className="text-[20px] font-semibold">
                {translatedUserInfo}
              </h2>
              <button
                className="text-white underline cursor-pointer"
                onClick={() =>
                  setEditingSection({ ...editingSection, user_info: true })
                }
              >
                {translatedEditInfo}
              </button>
            </div>
          ) : (
            <div>
              <button
                className="text-primaryColors-0 underline mb-4"
                onClick={() =>
                  setEditingSection({ ...editingSection, user_info: false })
                }
              >
                {translatedBackToPreview}
              </button>
              <UserInfo hideButton={true} />
            </div>
          )}

          {!editingSection.user_info && (
            <div className="md:grid md:grid-cols-2 flex flex-col gap-3 text-[0.9rem] mt-3">
              {userFields.map(([label, value], i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="md:text-[0.8rem] text-[0.95rem]">
                    {getTranslatedLabel(label)}
                  </span>
                  <div className="glass_input flex justify-start items-center">
                    {renderValue(value)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* -------------------- CHURCH -------------------- */}
        {formData.main_type === "church" && (
          <div
            className={`mb-6 ${editingSection.church ? "border-0 pb-0" : "border-b pb-4"}`}
          >
            {!editingSection.church ? (
              <div className="flex justify-between items-center">
                <h2 className="text-[20px] font-semibold">
                  {translatedChurchInfo}
                </h2>
                <button
                  className="text-white underline cursor-pointer"
                  onClick={() =>
                    setEditingSection({ ...editingSection, church: true })
                  }
                >
                  {translatedEditInfo}
                </button>
              </div>
            ) : (
              <div>
                <button
                  className="text-primaryColors-0 underline mb-4"
                  onClick={() =>
                    setEditingSection({ ...editingSection, church: false })
                  }
                >
                  {translatedBackToPreview}
                </button>
                <ChurchInfo hideButton={true} />
              </div>
            )}

            {!editingSection.church && (
              <div className="md:grid md:grid-cols-2 flex flex-col gap-3 text-[0.9rem] mt-3">
                {churchFields.map(([label, value], i) => (
                  <div
                    key={i}
                    className={`flex flex-col gap-1 ${label === "Website" ? "col-span-2" : ""}`}
                  >
                    <span className="md:text-[0.8rem] text-[0.95rem]">
                      {getTranslatedLabel(label as any)}
                    </span>
                    <div className="glass_input flex justify-start items-center">
                      {renderValue(value)}
                    </div>
                  </div>
                ))}
                <div className="col-span-2 flex flex-col gap-1">
                  <span className="md:text-[0.8rem] text-[0.95rem]">
                    {getTranslatedLabel("Church Logo")}
                  </span>
                  <div className="border bg-secondaryColors-0 p-3 flex justify-center">
                    {isClient && logoPreviewUrl ? (
                      <img
                        src={logoPreviewUrl}
                        alt="Church Logo"
                        className="h-[100px] object-contain"
                      />
                    ) : (
                      <span className="text-gray-400">{translatedNoLogo}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------- SCHOOL -------------------- */}
        {formData.main_type === "school" && (
          <div
            className={`mb-6 ${editingSection.school ? "border-0 pb-0" : "border-b pb-4"}`}
          >
            {!editingSection.school ? (
              <div className="flex justify-between items-center">
                <h2 className="text-[20px] font-semibold">
                  {translatedSchoolInfo}
                </h2>
                <button
                  className="text-white underline cursor-pointer"
                  onClick={() =>
                    setEditingSection({ ...editingSection, school: true })
                  }
                >
                  {translatedEditInfo}
                </button>
              </div>
            ) : (
              <div>
                <button
                  className="text-primaryColors-0 underline mb-4"
                  onClick={() =>
                    setEditingSection({ ...editingSection, school: false })
                  }
                >
                  {translatedBackToPreview}
                </button>
                <SchoolInfo hideButton={true} />
              </div>
            )}

            {!editingSection.school && (
              <div className="md:grid md:grid-cols-2 flex flex-col gap-3 text-[0.9rem] mt-3">
                {schoolFields.map(([label, value], i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="md:text-[0.8rem] text-[0.95rem]">
                      {getTranslatedLabel(label)}
                    </span>
                    <div className="glass_input flex justify-start items-center">
                      {renderValue(value)}
                    </div>
                  </div>
                ))}
                <div className="col-span-2 flex flex-col gap-1">
                  <span className="md:text-[0.8rem] text-[0.95rem]">
                    {getTranslatedLabel("Official Document")}
                  </span>
                  <div className="border bg-secondaryColors-0 p-3">
                    {isClient &&
                    formData.school_document &&
                    typeof formData.school_document === "string" ? (
                      <a
                        href={formData.school_document as string}
                        target="_blank"
                        className="text-primaryColors-0 underline"
                      >
                        {translatedViewDocument}
                      </a>
                    ) : formData.school_document instanceof File ? (
                      <span className="text-gray-400">
                        {translatedDocumentReady}
                      </span>
                    ) : (
                      <span className="text-gray-400">
                        {translatedNoDocument}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------- CLUB -------------------- */}
        {formData.main_type === "club" && (
          <div
            className={`mb-6 ${editingSection.club ? "border-0 pb-0" : "border-b pb-4"}`}
          >
            {!editingSection.club ? (
              <div className="flex justify-between items-center">
                <h2 className="text-[20px] font-semibold">
                  {translatedClubInfo}
                </h2>
                <button
                  className="text-white underline cursor-pointer"
                  onClick={() =>
                    setEditingSection({ ...editingSection, club: true })
                  }
                >
                  {translatedEditInfo}
                </button>
              </div>
            ) : (
              <div>
                <button
                  className="text-primaryColors-0 underline mb-4"
                  onClick={() =>
                    setEditingSection({ ...editingSection, club: false })
                  }
                >
                  {translatedBackToPreview}
                </button>
                <ClubInfo hideButton={true} />
              </div>
            )}

            {!editingSection.club && (
              <div className="md:grid md:grid-cols-2 flex flex-col gap-3 text-[0.9rem] mt-3">
                {clubFields.map(([label, value], i) => (
                  <div
                    key={i}
                    className={
                      label === "Description"
                        ? "col-span-2 flex flex-col gap-1"
                        : "flex flex-col gap-1"
                    }
                  >
                    <span className="md:text-[0.8rem] text-[0.95rem]">
                      {getTranslatedLabel(label as any)}
                    </span>
                    <div className="glass_input flex justify-start items-center">
                      {renderValue(value)}
                    </div>
                  </div>
                ))}
                <div className="col-span-2 flex flex-col gap-1">
                  <span className="md:text-[0.8rem] text-[0.95rem]">
                    {getTranslatedLabel("Club Document")}
                  </span>
                  <div className="border bg-secondaryColors-0 p-3">
                    {isClient &&
                    formData.club_document &&
                    typeof formData.club_document === "string" ? (
                      <a
                        href={formData.club_document as string}
                        target="_blank"
                        className="text-primaryColors-0 underline"
                      >
                        {translatedViewDocument}
                      </a>
                    ) : formData.club_document instanceof File ? (
                      <span className="text-gray-400">
                        {translatedDocumentReady}
                      </span>
                    ) : (
                      <span className="text-gray-400">
                        {translatedNoDocument}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          className="float-right w-[200px] bg-black text-white h-[44px] rounded-xl hover:bg-black/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={loading ? undefined : verifyFunc}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              {translatedVerifying}
            </span>
          ) : (
            translatedVerifySubmit
          )}
        </button>
      </div>
    </>
  );
}