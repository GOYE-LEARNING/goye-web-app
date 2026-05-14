import { CiSun } from "react-icons/ci";
import { useTheme } from "../context/theme_provider";
import { FaMoon } from "react-icons/fa6";

interface Props {
  toogleDarkMode: () => void;
}
export default function ToogleDarkMode({ toogleDarkMode }: Props) {
  const { darkMode, setDarkMode } = useTheme();
  return (
    <div
      className="h-[40px] w-[80px] p-3 dark:bg-secondaryColors-0 bg-lightWhite-0 border border-[#ccc]/10 rounded-full flex items-center justify-center relative drop-shadow-xl overflow-hidden"
      onClick={toogleDarkMode}
    >
      <div
        className={`h-[30px] w-[30px] flex justify-center items-center  drop-shadow-2xl rounded-full absolute ${darkMode ? "-translate-x-[70%] text-white dark:bg-primaryColors-0" : "translate-x-[70%] bg-white text-lightBoldText-0"} transition-all duration-200 `}
      >
        {darkMode ? <CiSun size={20}/> : <FaMoon size={20}/>}
      </div>
    </div>
  );
}
