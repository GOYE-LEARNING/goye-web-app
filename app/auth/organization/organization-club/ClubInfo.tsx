"use client";

import { FaArrowRight } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { IoIosRefresh } from "react-icons/io";
import { OrgSignUp } from "../BodyProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/utils/checkLanguages";

export default function ClubInfo({
  hideButton = false,
}: {
  hideButton?: boolean;
}) {
  const router = useRouter();
  const { formData, setFormData, isClubComplete } = OrgSignUp();
  const { translate } = useLanguage();
  const [docFile, setDocFile] = useState<File | null>(null);

  // Translation states
  const [translatedTitle, setTranslatedTitle] = useState("Club Information");
  const [translatedContinue, setTranslatedContinue] = useState("Continue");
  const [translatedUploadDoc, setTranslatedUploadDoc] = useState("Upload document");
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
        const title = await translate("Club Information");
        setTranslatedTitle(title);

        // Buttons
        const continueText = await translate("Continue");
        setTranslatedContinue(continueText);

        // File upload
        const uploadDoc = await translate("Upload document");
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
          "Club Name",
          "Club Type",
          "Club Leader Name",
          "Club Role",
          "Meeting Frequency",
          "Social Media / Messaging Group Link",
          "Parent Church / School",
          "Short Description of Activities",
          "Upload Document"
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

  useEffect(() => {
    setFormData({ ...formData, club_email: formData.org_email });
  }, [formData.org_email]);

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setDocFile(file);
    setFormData({ ...formData, club_document: file });
  };

  const removeDoc = () => {
    if (
      typeof formData.club_document === "string" &&
      formData.club_document?.startsWith("blob:")
    ) {
      URL.revokeObjectURL(formData.club_document);
    }
    setDocFile(null);
    setFormData({ ...formData, club_document: "" });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  // Helper function to get translated label
  const getTranslatedLabel = (originalLabel: string): string => {
    return translationsLoaded ? translatedFieldLabels[originalLabel] || originalLabel : originalLabel;
  };

  const form = [
    { label: "Club Name", name: "club_name", type: "text" },
    { label: "Club Type", name: "club_type", type: "text" },
    { label: "Club Leader Name", name: "club_leader_name", type: "text" },
    { label: "Club Role", name: "club_role", type: "text" },
    {
      label: "Meeting Frequency",
      name: "club_meeting_frequency",
      type: "text",
    },
    {
      label: "Social Media / Messaging Group Link",
      name: "club_social_link",
      type: "text",
    },
    { label: "Parent Church / School", name: "club_parent_org", type: "text" },
    {
      label: "Short Description of Activities",
      name: "club_description",
      type: "text",
    },
    { label: "Upload Document", name: "club_document", type: "file" },
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
      <h1 className="text-[20px] md:text-[24px] font-semibold pb-5">
        {translatedTitle}
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="md:grid md:grid-cols-2 flex flex-col gap-5">
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
                  {!formData.club_document ? (
                    <>
                      <label
                        htmlFor="club-doc"
                        className="absolute inset-0 text-white flex flex-col justify-center items-center cursor-pointer"
                      >
                        <span className="font-medium">{translatedUploadDoc}</span>
                        <span className="text-[12px] opacity-70">
                          {translatedFileTypes}
                        </span>
                      </label>

                      <input
                        id="club-doc"
                        type="file"
                        accept="image/png, image/jpeg, application/pdf"
                        className="hidden"
                        onChange={handleDocChange}
                      />
                    </>
                  ) : (
                    <div className="relative w-full h-full flex justify-center items-center">
                      <span className="text-sm opacity-80">
                        {translatedDocSelected}
                      </span>

                      <div className="absolute inset-0 bg-black/40 flex justify-center items-center gap-3">
                        <button
                          type="button"
                          onClick={removeDoc}
                          className="
                            px-4 py-1
                            rounded-xl
                            bg-white/70
                            backdrop-blur-md
                            hover:bg-white
                            flex items-center gap-2
                          "
                        >
                          <MdDelete /> {translatedRemove}
                        </button>

                        <label
                          htmlFor="club-doc-replace"
                          className="
                            px-4 py-1
                            rounded-xl
                            bg-white/70
                            backdrop-blur-md
                            hover:bg-white
                            cursor-pointer
                            flex items-center gap-2
                          "
                        >
                          <IoIosRefresh /> {translatedReplace}
                        </label>

                        <input
                          id="club-doc-replace"
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
                  value={(formData as any)[data.name] || ""}
                  onChange={handleChange}
                  className="glass_input"
                  placeholder={
                    data.name == "club_role" ? translatedPlaceholder : ""
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
            disabled={!isClubComplete}
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
                !isClubComplete
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