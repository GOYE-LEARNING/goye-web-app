"use client";

import { FaArrowRight } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { IoIosRefresh } from "react-icons/io";
import { OrgSignUp } from "../BodyProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/utils/checkLanguages";

export default function ChurchInfo({
  hideButton = false,
}: {
  hideButton?: boolean;
}) {
  const router = useRouter();
  const { formData, setFormData, isChurchComplete } = OrgSignUp();
  const { translate } = useLanguage();
  const [logoUrl, setLogoUrl] = useState<string>("");

  // Translation states
  const [translatedTitle, setTranslatedTitle] = useState("Church Information");
  const [translatedContinue, setTranslatedContinue] = useState("Continue");
  const [translatedUploadLogo, setTranslatedUploadLogo] = useState("Upload church logo");
  const [translatedFileTypes, setTranslatedFileTypes] = useState("PNG or JPG");
  const [translatedRemove, setTranslatedRemove] = useState("Remove");
  const [translatedReplace, setTranslatedReplace] = useState("Replace");
  const [translatedFieldLabels, setTranslatedFieldLabels] = useState<Record<string, string>>({});
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // Main title
        const title = await translate("Church Information");
        setTranslatedTitle(title);

        // Buttons
        const continueText = await translate("Continue");
        setTranslatedContinue(continueText);

        // File upload
        const uploadLogo = await translate("Upload church logo");
        setTranslatedUploadLogo(uploadLogo);

        const fileTypes = await translate("PNG or JPG");
        setTranslatedFileTypes(fileTypes);

        const remove = await translate("Remove");
        setTranslatedRemove(remove);

        const replace = await translate("Replace");
        setTranslatedReplace(replace);

        // Field labels
        const fieldLabels: Record<string, string> = {};
        const fields = [
          "Church / Ministry Name",
          "Church Lead Pastor",
          "Church Address",
          "Church Role",
          "Church Weekly Service",
          "Church Email",
          "Church Website/social media",
          "Church Logo"
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
    setFormData({ ...formData, church_email: formData.org_email });
  }, [formData.org_email]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (logoUrl && logoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(logoUrl);
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setLogoUrl(previewUrl);
    setFormData({
      ...formData,
      church_logo: selectedFile,
      church_logo_url: previewUrl,
    });
  };

  const removeLogo = () => {
    if (logoUrl && logoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(logoUrl);
    }
    setLogoUrl("");
    setFormData({ ...formData, church_logo: "", church_logo_url: "" });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  useEffect(() => {
    return () => {
      if (logoUrl && logoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, [logoUrl]);

  // Helper function to get translated label
  const getTranslatedLabel = (originalLabel: string): string => {
    return translationsLoaded ? translatedFieldLabels[originalLabel] || originalLabel : originalLabel;
  };

  const form = [
    {
      type: "text",
      name: "church_min_name",
      label: "Church / Ministry Name",
      value: formData.church_min_name,
    },
    {
      type: "text",
      name: "church_ld_pastor",
      label: "Church Lead Pastor",
      value: formData.church_ld_pastor,
    },
    {
      type: "text",
      name: "church_address",
      label: "Church Address",
      value: formData.church_address,
    },
    {
      type: "text",
      name: "church_leader_ship_role",
      label: "Church Role",
      value: formData.church_leader_ship_role,
    },
    {
      type: "text",
      name: "church_weekly_service",
      label: "Church Weekly Service",
      value: formData.church_weekly_service,
    },
    {
      type: "email",
      name: "church_email",
      label: "Church Email",
      value: formData.church_email,
    },
    {
      type: "text",
      name: "church_website",
      label: "Church Website/social media",
      value: formData.church_website,
    },
    {
      type: "file",
      name: "church_logo",
      label: "Church Logo",
      value: formData.church_logo,
    },
  ];

  return (
    <div
      className="
          glass_effect
          relative
          text-white
          rounded-[30px]
          w-full h-full p-6 overflow-y-auto chat_scroll3"
    >
      <div>
        <h1 className="text-[22px] font-semibold text-white mb-6">
          {translatedTitle}
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="md:grid md:grid-cols-2 flex flex-col gap-6">
            {form.map((data, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1 ${
                  data.name === "church_logo" || data.name === "church_website"
                    ? "md:col-span-2"
                    : ""
                }`}
              >
                <label className="md:text-[0.8rem] text-[0.95rem] text-white">
                  {getTranslatedLabel(data.label)}
                </label>

                {/* LOGO UPLOAD */}
                {data.name === "church_logo" ? (
                  <div
                    className="
                      relative h-[150px]
                      bg-white/15
                      backdrop-blur-lg
                      border border-dashed border-white/30
                      rounded-2xl
                      shadow-inner
                      overflow-hidden
                    "
                  >
                    {!logoUrl ? (
                      <>
                        <label
                          htmlFor="church-logo"
                          className="absolute inset-0 flex flex-col justify-center items-center cursor-pointer text-white/80"
                        >
                          <span className="font-medium">
                            {translatedUploadLogo}
                          </span>
                          <span className="text-[12px] opacity-70">
                            {translatedFileTypes}
                          </span>
                        </label>
                        <input
                          id="church-logo"
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </>
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src={logoUrl}
                          alt="Church logo"
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-4">
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="
                              px-4 py-1.5
                              bg-white/25
                              backdrop-blur-md
                              border border-white/30
                              rounded-lg
                              text-white
                              flex items-center gap-2
                              hover:bg-white/35
                            "
                          >
                            <MdDelete /> {translatedRemove}
                          </button>

                          <label
                            htmlFor="church-logo-replace"
                            className="
                              px-4 py-1.5
                              bg-white/25
                              backdrop-blur-md
                              border border-white/30
                              rounded-lg
                              text-white
                              flex items-center gap-2
                              cursor-pointer
                              hover:bg-white/35
                            "
                          >
                            <IoIosRefresh /> {translatedReplace}
                          </label>

                          <input
                            id="church-logo-replace"
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type={data.type}
                    value={typeof data.value === "string" ? data.value : ""}
                    onChange={handleChange}
                    name={data.name}
                    className="glass_input"
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
              disabled={!isChurchComplete}
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
                    !isChurchComplete
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
    </div>
  );
}