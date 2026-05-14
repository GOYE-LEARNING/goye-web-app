"use client";

import { useEffect, useRef, useState } from "react";
import { OrgSignUp, INITIAL_FORM_DATA } from "../BodyProvider";
import OrgInfo from "../organization-information/page";
import ChurchInfo from "../organization-church/page";
import SchoolInfo from "../organization-school/page";
import ClubInfo from "../organization-club/page";
import VerifyModal from "@/app/component/organization_form_component/verify_modal";
import { IoCopy } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheck } from "react-icons/fa6";
import { useOrganizationContext } from "@/app/component/organization_component/organanization_context";

export default function PreviewVerification() {
  const {
    formData,
    setFormData,
    isVerifying,
    setIsVerifying,
    isVerifyComplete,
    setIsVerifyingComplete,
  } = OrgSignUp();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const modalRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [newOrganizationId, setNewOrganizationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const {organizationId, setOrganizationId} = useOrganizationContext()
  const [editingSection, setEditingSection] = useState({
    org: false,
    church: false,
    school: false,
    club: false,
  });
  
  // Add this to track client-side hydration
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const closeModal = (e?: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e?.target as Node)) {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    closeModal();
    setOrganizationId(newOrganizationId)
    console.log(organizationId)
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

  const verifyFunc = async () => {

    setLoading(true);

    const bodyDTO = {
      organization_name: formData.org_name,
      organization_type: formData.main_type,
      organization_email: formData.org_email,
      organization_phone_number: formData.org_phone_number,
      organization_country: formData.org_country,
      organization_role: formData.org_role,
      organization_state: formData.org_state,
      organization_description: formData.org_description,
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
          school_email: formData.school_email_domain,
        },
      }),
      ...(formData.main_type === "club" && {
        club: {
          club_name: formData.club_name,
          club_type: formData.club_type,
          club_leader_name: formData.club_leader_name,
          club_meeting_frequency: formData.club_meeting_frequency,
          club_social_link: formData.club_social_link,
          club_parent_org: formData.club_parent_org,
          club_dscription: formData.club_description,
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
          body: JSON.stringify(bodyDTO),
        }
      );

      if (!res.ok) throw new Error("Failed to create organization");

      const orgData = await res.json();
      const orgId = orgData.data?.id;
      setNewOrganizationId(orgId);
      setOrganizationId(orgId)
      // Generate password
      try {
        const passRes = await fetch(
          `${API_URL}/api/organizations/organization-password-generated/${orgId}`,
          { method: "POST" }
        );
        const passData = await passRes.json();
        setGeneratedPassword(passData.generatedPassword);
        setShowPasswordModal(true);
      } catch (err) {
        console.error("Password generation failed", err);
      }

      // Upload all files sequentially
      const updates: any = {};
      if (formData.church_logo) {
        updates.church = {
          church_logo: await uploadFile(
            formData.church_logo as File,
            `/api/organizations/upload-church-logo/${orgId}`
          ),
        };
      }
      if (formData.school_document) {
        updates.school = {
          school_document: await uploadFile(
            formData.school_document as File,
            `/api/organizations/upload-school_document/${orgId}`
          ),
        };
      }
      if (formData.club_document) {
        updates.club = {
          club_document: await uploadFile(
            formData.club_document as File,
            `/api/organizations/upload-club-document/${orgId}`
          ),
        };
      }

      if (Object.keys(updates).length > 0) {
        await fetch(`${API_URL}/api/organizations/update-organization/${orgId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updates),
        });
      }

      setFormData(INITIAL_FORM_DATA);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render value with hydration safety
  const renderValue = (value: any) => {
    // During server render or initial hydration, show placeholder
    if (!isClient) {
      return "----";
    }
    // After hydration, show actual value or placeholder
    return value || "----";
  };

  return (
    <>
      <AnimatePresence>
        {showPasswordModal && generatedPassword && (
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="fixed inset-0 flex justify-center items-center z-50"
          >
            <VerifyModal
              cancel={() => {
                setShowPasswordModal(false);
                setIsVerifyingComplete(true);
              }}
              icon={<FaCheck className="text-green-500" size={60} />}
              header="Your Organization Password"
              text={
                <div className="text-center">
                  <p className="text-[0.9rem] mb-4">
                    Your organization password has been generated. Please copy
                    and store it securely.
                  </p>
                  <div className="bg-secondaryColors-0 px-3 py-3 rounded text-textSlightDark-0 flex justify-between items-center gap-2 mb-2">
                    <div className="font-semibold text-lg tracking-wide">
                      {generatedPassword}
                    </div>
                    <IoCopy
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopy(generatedPassword)
                      }}
                    />
                  </div>
                  <span className="text-[0.85rem] text-green-500">
                    {copied ? "Copied!" : "Click to copy"}
                  </span>
                </div>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass_effect text-white relative rounded-[30px] w-full h-full p-[20px] overflow-y-auto overflow-x-hidden chat_scroll3">
        <h1 className="md:text-[24px] text-[20px] font-semibold pb-[20px] relative org_h1">
          Preview & Verification Information
        </h1>

        {/* -------------------- ORGANIZATION -------------------- */}
        <div className={`mb-6 ${editingSection.org ? "border-0 pb-0" : "border-b pb-4"}`}>
          {!editingSection.org ? (
            <div className="flex justify-between items-center">
              <h2 className="text-[20px] font-semibold ">Organization Information</h2>
              <span
                className="text-white underline cursor-pointer"
                onClick={() => setEditingSection({ ...editingSection, org: true })}
              >
                Edit Information
              </span>
            </div>
          ) : (
            <div>
              <button
                className="text-primaryColors-0 underline mb-4"
                onClick={() => setEditingSection({ ...editingSection, org: false })}
              >
                ← Back to Preview
              </button>
              <OrgInfo hideButton={true} />
            </div>
          )}

          {!editingSection.org && (
            <div className="md:grid md:grid-cols-2 flex flex-col gap-3 text-[0.9rem] mt-3">
              {[
                ["Organization Name", formData.org_name],
                ["Organization Type", formData.org_type],
                ["Email Address", formData.org_email],
                ["Phone Number", formData.org_phone_number],
                ["Country", formData.org_country],
                ["State", formData.org_state],
                ["Role", formData.org_role],
                ["Year Established", formData.org_year],
              ].map(([label, value], i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="md:text-[0.8rem] text-[0.95rem]">{label}</span>
                  <div className="glass_input">{renderValue(value)}</div>
                </div>
              ))}
              <div className="col-span-2 flex flex-col gap-1">
                <span className="md:text-[0.8rem] text-[0.95rem]">Description</span>
                <div className="glass_input">{renderValue(formData.org_description)}</div>
              </div>
            </div>
          )}
        </div>

        {/* -------------------- CHURCH -------------------- */}
        {formData.main_type === "church" && (
          <div className={`mb-6 ${editingSection.church ? "border-0 pb-0" : "border-b pb-4"}`}>
            {!editingSection.church ? (
              <div className="flex justify-between items-center">
                <h2 className="text-[20px] font-semibold ">Church Information</h2>
                <button
                  className="text-primaryColors-0 underline"
                  onClick={() => setEditingSection({ ...editingSection, church: true })}
                >
                  Edit
                </button>
              </div>
            ) : (
              <div>
                <button
                  className="text-primaryColors-0 underline mb-4"
                  onClick={() => setEditingSection({ ...editingSection, church: false })}
                >
                  ← Back to Preview
                </button>
                <ChurchInfo hideButton={true} />
              </div>
            )}

            {!editingSection.church && (
              <div className="md:grid md:grid-cols-2 flex flex-col gap-3 text-[0.9rem] mt-3">
                {[
                  ["Ministry Name", formData.church_min_name],
                  ["Lead Pastor", formData.church_ld_pastor],
                  ["Leadership Role", formData.church_leader_ship_role],
                  ["Address", formData.church_address],
                  ["Weekly Service", formData.church_weekly_service],
                  ["Email", formData.church_email],
                  ["Website", formData.church_website],
                ].map(([label, value], i) => (
                  <div key={i} className={`flex flex-col gap-1 ${label === "Website" ? "col-span-2" : ""}`}>
                    <span className="md:text-[0.8rem] text-[0.95rem]">{label}</span>
                    <div className="glass_input">{renderValue(value)}</div>
                  </div>
                ))}
                <div className="col-span-2 flex flex-col gap-1">
                  <span className="md:text-[0.8rem] text-[0.95rem]">Church Logo</span>
                  <div className="border bg-secondaryColors-0 p-3 flex justify-center">
                    {isClient && formData.church_logo ? (
                      <img src={formData.church_logo as string} alt="Church Logo" className="h-[100px] object-contain" />
                    ) : (
                      <span className="text-gray-400">No logo uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------- SCHOOL -------------------- */}
        {formData.main_type === "school" && (
          <div className={`mb-6 ${editingSection.school ? "border-0 pb-0" : "border-b pb-4"}`}>
            {!editingSection.school ? (
              <div className="flex justify-between items-center">
                <h2 className="text-[20px] font-semibold ">School Information</h2>
                <button
                  className="text-primaryColors-0 underline"
                  onClick={() => setEditingSection({ ...editingSection, school: true })}
                >
                  Edit
                </button>
              </div>
            ) : (
              <div>
                <button
                  className="text-primaryColors-0 underline mb-4"
                  onClick={() => setEditingSection({ ...editingSection, school: false })}
                >
                  ← Back to Preview
                </button>
                <SchoolInfo hideButton={true} />
              </div>
            )}

            {!editingSection.school && (
              <div className="md:grid md:grid-cols-2 flex flex-col gap-3 text-[0.9rem] mt-3">
                {[
                  ["School Name", formData.school_name],
                  ["School Type", formData.school_type],
                  ["Address", formData.school_address],
                  ["Admin Name", formData.school_admin_name],
                  ["Admin Role", formData.school_role],
                  ["Email Domain", formData.school_email_domain],
                  ["Website", formData.school_website],
                  ["Accreditation Number", formData.school_accreditation_number],
                ].map(([label, value], i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="md:text-[0.8rem] text-[0.95rem]">{label}</span>
                    <div className="glass_input">{renderValue(value)}</div>
                  </div>
                ))}
                <div className="col-span-2 flex flex-col gap-1">
                  <span className="md:text-[0.8rem] text-[0.95rem]">Official Document</span>
                  <div className="border bg-secondaryColors-0 p-3">
                    {isClient && formData.school_document ? (
                      <a href={formData.school_document as string} target="_blank" className="text-primaryColors-0 underline">
                        View uploaded document
                      </a>
                    ) : (
                      <span className="text-gray-400">No document uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------- CLUB -------------------- */}
        {formData.main_type === "club" && (
          <div className={`mb-6 ${editingSection.club ? "border-0 pb-0" : "border-b pb-4"}`}>
            {!editingSection.club ? (
              <div className="flex justify-between items-center">
                <h2 className="text-[20px] font-semibold ">Club Information</h2>
                <button
                  className="text-primaryColors-0 underline"
                  onClick={() => setEditingSection({ ...editingSection, club: true })}
                >
                  Edit
                </button>
              </div>
            ) : (
              <div>
                <button
                  className="text-primaryColors-0 underline mb-4"
                  onClick={() => setEditingSection({ ...editingSection, club: false })}
                >
                  ← Back to Preview
                </button>
                <ClubInfo hideButton={true} />
              </div>
            )}

            {!editingSection.club && (
              <div className="md:grid md:grid-cols-2 flex flex-col gap-3 text-[0.9rem] mt-3">
                {[
                  ["Club Name", formData.club_name],
                  ["Club Type", formData.club_type],
                  ["Leader Name", formData.club_leader_name],
                  ["Leader Role", formData.club_role],
                  ["Meeting Frequency", formData.club_meeting_frequency],
                  ["Social Link", formData.club_social_link],
                  ["Parent Organization", formData.club_parent_org],
                  ["Description", formData.club_description],
                ].map(([label, value], i) => (
                  <div key={i} className={label === "Description" ? "col-span-2 flex flex-col gap-1" : "flex flex-col gap-1"}>
                    <span className="md:text-[0.8rem] text-[0.95rem]">{label}</span>
                    <div className="glass_input">{renderValue(value)}</div>
                  </div>
                ))}
                <div className="col-span-2 flex flex-col gap-1">
                  <span className="md:text-[0.8rem] text-[0.95rem]">Club Document</span>
                  <div className="border bg-secondaryColors-0 p-3">
                    {isClient && formData.club_document ? (
                      <a href={formData.club_document as string} target="_blank" className="text-primaryColors-0 underline">
                        View uploaded document
                      </a>
                    ) : (
                      <span className="text-gray-400">No document uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          className="float-right w-[200px] bg-black text-white h-[44px]"
          onClick={loading ? undefined : verifyFunc}
        >
          {loading ? "Verifying..." : "Verify & Submit"}
        </button>
      </div>
    </>
  );
}