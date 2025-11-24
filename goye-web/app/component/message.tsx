import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  color: string;
  message: string;
  width: number;
  icon: React.ReactNode;
}

export default function Message({ color, message, width, icon }: Props) {
  const [showMessage, setShowMessage] = useState<boolean>(true);

  const cancel = () => {
    setShowMessage(false);
    // ✅ ADDED: Call the onClose callback if provided
  };

  // ✅ ADDED: Auto-hide after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {showMessage && (
        <motion.div
          key="message"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.4, ease: "easeIn" }}
          className={`h-[56px] text-[white] flex justify-between items-center p-[10px] my-5`}
          style={{ backgroundColor: color, width: width + "%" }}
        >
          <div className="flex items-center gap-4">
            <span>{icon}</span>
            {message}
          </div>
          <div className="h-full w-[35px] border-l-[1px] border-l-[white] flex justify-center items-center text-white">
            <span className="cursor-pointer pl-2" onClick={cancel}>
              &times;
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
