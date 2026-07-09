"use client";

import { FaArrowRight } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { IoIosRefresh } from "react-icons/io";
import { OrgSignUp } from "../BodyProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/utils/checkLanguages";

export default function SchoolInfo({
  hideButton = false,
}: {
  hideButton?: boolean;
}) {
  const router = useRouter();
  const { formData, setFormData, isSchoolComplete } = OrgSignUp();
  const { translate } = useLanguage();
  const [docFile, setDocFile] = useState<File | null>(null);

  // Translation states
  const [translatedTitle, setTranslatedTitle] = useState("School Information");
  const [translatedContinue, setTranslatedContinue] = useState("Continue");
  const [translatedUploadDoc, setTranslatedUploadDoc] = useState("Upload school document");
  const [translatedFileTypes, setTranslatedFileTypes] = useState("PDF, PNG, JPG");
  const [translatedDocSelected, setTranslatedDocSelected] = useState("Document selected");
  const [translatedRemove, setTranslatedRemove] = useState("Remove");
  const [translatedReplace, setTranslatedReplace] = useState("Replace");
  const [translatedPlaceholder, setTranslatedPlaceholder] = useState("What your role here ?");
  const [translatedFieldLabels, setTranslatedFieldLabels] = useState<Record<string, string>>({});
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // Main title
        const title = await translate("School Information");
        setTranslatedTitle(title);

        // Buttons
        const continueText = await translate("Continue");
        setTranslatedContinue(continueText);

        // File upload
        const uploadDoc = await translate("Upload school document");
        setTranslatedUploadDoc(uploadDoc);

        const fileTypes = await translate("PDF, PNG, JPG");
        setTranslatedFileTypes(fileTypes);

        const docSelected = await translate("Document selected");
        setTranslatedDocSelected(docSelected);

        const remove = await translate("Remove");
        setTranslatedRemove(remove);

        const replace = await translate("Replace");
        setTranslatedReplace(replace);

        const placeholder = await translate("What your role here ?");
        setTranslatedPlaceholder(placeholder);

        // Field labels
        const fieldLabels: Record<string, string> = {};
        const fields = [
          "School Name",
          "Type of School",
          "School Address",
          "Administrator Name",
          "School Role",
          "Official School Email Domain",
          "School Website/Social media",
          "Accreditation / Registration Number",
          "Upload Official Document / ID (blurred)"
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle document upload
  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setDocFile(file);
    setFormData({
      ...formData,
      school_document: file,
    });
  };

  // Remove document
  const removeDoc = () => {
    if (
      typeof formData.school_document === "string" &&
      formData.school_document?.startsWith("blob:")
    ) {
      URL.revokeObjectURL(formData.school_document);
    }

    setDocFile(null);
    setFormData({
      ...formData,
      school_document: "",
    });
  };

  useEffect(() => {
    setFormData({ ...formData, school_email: formData.org_email });
  }, [formData.org_email]);

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  // Helper function to get translated label
  const getTranslatedLabel = (originalLabel: string): string => {
    return translationsLoaded ? translatedFieldLabels[originalLabel] || originalLabel : originalLabel;
  };

  const form = [
    {
      label: "School Name",
      name: "school_name",
      type: "text",
      value: formData.school_name,
    },
    {
      label: "Type of School",
      name: "school_type",
      type: "text",
      value: formData.school_type,
    },
    {
      label: "School Address",
      name: "school_address",
      type: "text",
      value: formData.school_address,
    },
    {
      label: "Administrator Name",
      name: "school_admin_name",
      type: "text",
      value: formData.school_admin_name,
    },
    {
      label: "School Role",
      name: "school_role",
      type: "text",
      value: formData.school_role,
    },
    {
      label: "Official School Email Domain",
      name: "school_email",
      type: "email",
      value: formData.school_email,
    },
    {
      label: "School Website/Social media",
      name: "school_website",
      type: "text",
      value: formData.school_website,
    },
    {
      label: "Accreditation / Registration Number",
      name: "school_accreditation_number",
      type: "text",
      value: formData.school_accreditation_number,
    },
    {
      label: "Upload Official Document / ID (blurred)",
      name: "school_document",
      type: "file",
      value: formData.school_document,
    },
  ];

  return (
    <div
      className="
          glass_effect
          relative
          text-white
        rounded-[30px]
        w-full h-full
        p-[20px]
        overflow-y-auto
        overflow-x-hidden
        chat_scroll3
    "
    >
      <h1 className="md:text-[24px] text-[20px] text-white font-semibold pb-[20px]">
        {translatedTitle}
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="md:grid md:grid-cols-2 flex flex-col gap-5 w-full mt-3">
          {form.map((data, i) => (
            <div
              key={i}
              className={`flex flex-col gap-1 ${
                data.type === "file" ? "col-span-2" : ""
              }`}
            >
              <label className="md:text-[0.8rem] text-[0.95rem]">
                {getTranslatedLabel(data.label)}
              </label>

              {/* Document Upload */}
              {data.type === "file" ? (
                <div
                  className="
                   relative
                    h-[140px]
                    rounded-2xl
                    bg-white/20
                    backdrop-blur-lg
                    backdrop-saturate-150
                    border border-white/30
                    shadow-inner
                    overflow-hidden
                "
                >
                  {!formData.school_document ? (
                    <>
                      <label
                        htmlFor="school-doc"
                        className="absolute inset-0 flex flex-col justify-center items-center cursor-pointer"
                      >
                        <span className="text-[14px] font-medium">
                          {translatedUploadDoc}
                        </span>
                        <span className="text-[12px] text-white">
                          {translatedFileTypes}
                        </span>
                      </label>

                      <input
                        id="school-doc"
                        type="file"
                        accept="image/png, image/jpeg, application/pdf"
                        className="hidden"
                        onChange={handleDocChange}
                      />
                    </>
                  ) : (
                    <div className="relative w-full h-full flex justify-center items-center bg-[#eaeaea]">
                      <span className="text-[14px] text-textGrey-0">
                        {translatedDocSelected}
                      </span>

                      <div className="absolute inset-0 bg-black/40 flex justify-center items-center gap-3">
                        <button
                          type="button"
                          onClick={removeDoc}
                          className="px-4 py-1
                            rounded-xl
                            bg-white/70
                            backdrop-blur-md
                            hover:bg-white
                            flex items-center gap-2"
                        >
                          <MdDelete /> {translatedRemove}
                        </button>

                        <label
                          htmlFor="school-doc-replace"
                          className="px-4 py-1
                            rounded-xl
                            bg-white/70
                            backdrop-blur-md
                            hover:bg-white
                            flex items-center gap-2 cursor-pointer"
                        >
                          <IoIosRefresh /> {translatedReplace}
                        </label>

                        <input
                          id="school-doc-replace"
                          type="file"
                          accept="image/png, image/jpeg, application/pdf"
                          className="hidden"
                          onChange={handleDocChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type={data.type}
                  name={data.name}
                  value={(data.value as any) || ""}
                  onChange={handleChange}
                  className="glass_input"
                  placeholder={
                    data.name == "school_role" ? translatedPlaceholder : ""
                  }
                />
              )}
            </div>
          ))}
        </div>

        {!hideButton && (
          <button
            onClick={() =>
              router.push("/auth/organization/organization-verification")
            }
            disabled={!isSchoolComplete}
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
                       !isSchoolComplete
                         ? "opacity-50 cursor-not-allowed"
                         : "hover:bg-black"
                     }
                   `}
          >
            {translatedContinue} <FaArrowRight />
          </button>
        )}
      </form>
    </div>
  );
}