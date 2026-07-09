"use client";
import church from "@/public/images/church.png";
import school from "@/public/images/school.png";
import club from "@/public/images/club2.png";
import Image from "next/image";
import { useEffect, useState } from "react";
import { OrgSignUp } from "./BodyProvider";
import { LuChurch } from "react-icons/lu";
import { IoSchoolOutline } from "react-icons/io5";
import { SiClubhouse } from "react-icons/si";
import { MdAdd } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa";
import { useRouter } from "next/dist/client/components/navigation";
import { useLanguage } from "@/app/utils/checkLanguages";

interface Props {
  types: string;
}

interface TypeData {
  name: string;
  pic: any;
  value: string;
  p?: string;
}

export default function OrganizationType({ types }: Props) {
  const [type, setType] = useState<string>("");
  const { formData, setFormData } = OrgSignUp();
  const router = useRouter();
  const { translate } = useLanguage();
  const [translatedTypeData, setTranslatedTypeData] = useState<TypeData[]>([]);
  const [translatedTitle, setTranslatedTitle] = useState<string>("Organization Type");
  const [translatedOtherLabel, setTranslatedOtherLabel] = useState<string>("Please specify");
  const [translatedContinue, setTranslatedContinue] = useState<string>("Continue");
  const [translationsLoaded, setTranslationsLoaded] = useState<boolean>(false);

  const typeData: TypeData[] = [
    { name: "Church", pic: <LuChurch size={60} />, value: "church" },
    { name: "School", pic: <IoSchoolOutline size={60} />, value: "school" },
    { name: "Club", pic: <SiClubhouse size={60} />, value: "club" },
    {
      name: "Other",
      pic: <MdAdd size={30} />,
      value: "other",
      p: "Please specify",
    },
  ];

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // Translate the title
        const titleTranslation = await translate("Organization Type");
        setTranslatedTitle(titleTranslation);

        // Translate "Please specify"
        const otherTranslation = await translate("Please specify");
        setTranslatedOtherLabel(otherTranslation);

        // Translate "Continue"
        const continueTranslation = await translate("Continue");
        setTranslatedContinue(continueTranslation);

        // Translate each type name
        const translatedTypes = await Promise.all(
          typeData.map(async (item) => {
            const translatedName = await translate(item.name);
            return {
              ...item,
              name: translatedName,
              p: item.p ? await translate(item.p) : undefined,
            };
          })
        );
        setTranslatedTypeData(translatedTypes);
        setTranslationsLoaded(true);
      } catch (error) {
        console.error("Failed to load translations:", error);
        // Fallback to original text
        setTranslatedTypeData(typeData);
        setTranslatedTitle("Organization Type");
        setTranslatedOtherLabel("Please specify");
        setTranslatedContinue("Continue");
        setTranslationsLoaded(true);
      }
    };

    loadTranslations();
  }, [translate]);

  const selectType = (value: string) => {
    setType(value);
    setFormData((prev: any) => ({
      ...prev,
      org_type: value,
      main_type: value,
    }));

    console.log(formData.type);
  };

  // Use translated data or fallback to original
  const displayData = translationsLoaded ? translatedTypeData : typeData;
  const displayTitle = translationsLoaded ? translatedTitle : "Organization Type";
  const displayOtherLabel = translationsLoaded ? translatedOtherLabel : "Please specify";
  const displayContinue = translationsLoaded ? translatedContinue : "Continue";

  return (
    <div
      className="glass_effect relative text-white rounded-[30px] w-full h-full p-[25px] overflow-y-auto chat_scroll3"
    >
      <h1 className="md:text-[24px] text-[19px] font-semibold">
        {displayTitle}
      </h1>
      <div className="grid md:grid-cols-3 gap-5 mt-4">
        {displayData.map((t, i) => (
          <div
            key={i}
            className={`org_type_box ${
              formData.main_type == t.value && "org_shadow"
            } ${
              t.value == "other" && "border-dashed border-[2px]"
            } transition-all duration-200 rounded-[15px] h-[200px] cursor-pointer`}
            onClick={() => selectType(t.value)}
          >
            <div className="transition-all duration-200 flex flex-col justify-center items-center h-full w-full">
              <span
                className={`${
                  t.value == "other" &&
                  "h-[45px] w-[45px] rounded-full bg-black text-white flex justify-center items-center flex-col"
                } text-white`}
              >
                {t.pic}
              </span>

              <span className="text-[18px] font-semibold text-white">
                {t.name}
              </span>
              <p className="text-white text-[0.9rem]">
                {t.value === "other" ? displayOtherLabel : t.p}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full">
        <button
          disabled={!formData.main_type}
          onClick={() => {
            router.push("/auth/organization/organization-information");
          }}
          className={`
            float-right
            my-8
            margin-left-auto
            w-[200px]
            h-[44px]
            rounded-xl
            flex items-center justify-center gap-2
            bg-black/80
            backdrop-blur-md
            text-white
            transition-all
            ${
              !formData.main_type
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-black"
            }
          `}
        >
          {displayContinue} <FaArrowRight />
        </button>
      </div>
    </div>
  );
}