"use client";

import { useState, createContext, useContext } from "react";
import { IoClose } from "react-icons/io5";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaQuestionCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

type ModalType = "info" | "success" | "error" | "confirm";

interface ModalContextType {
  showModal: (title: string, message: string, type: ModalType, onConfirm?: () => void) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
}

const ModalIcons = {
  info: { icon: FaInfoCircle, color: "text-blue-500", bg: "bg-blue-50" },
  success: { icon: FaCheckCircle, color: "text-green-500", bg: "bg-green-50" },
  error: { icon: FaExclamationCircle, color: "text-red-500", bg: "bg-red-50" },
  confirm: { icon: FaQuestionCircle, color: "text-purple-500", bg: "bg-purple-50" },
};

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ModalType;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showModal = (title: string, message: string, type: ModalType, onConfirm?: () => void) => {
    setModal({ isOpen: true, title, message, type, onConfirm });
  };

  const hideModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const handleConfirm = () => {
    if (modal.onConfirm) modal.onConfirm();
    hideModal();
  };

  const Icon = ModalIcons[modal.type].icon;
  const iconColor = ModalIcons[modal.type].color;
  const iconBg = ModalIcons[modal.type].bg;

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <AnimatePresence>
        {modal.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
              onClick={hideModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-5 pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${iconBg}`}>
                      <Icon className={`${iconColor} text-xl`} />
                    </div>
                    <h2 className="text-lg font-semibold dark:text-white">{modal.title}</h2>
                  </div>
                  <button onClick={hideModal} className="text-gray-400 hover:text-gray-600">
                    <IoClose size={24} />
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-gray-600 dark:text-gray-300">{modal.message}</p>
                </div>
                <div className="flex justify-end gap-3 p-5 pt-0">
                  {modal.type === "confirm" && (
                    <button
                      onClick={hideModal}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleConfirm}
                    className={`px-4 py-2 rounded-lg text-white ${
                      modal.type === "error"
                        ? "bg-red-500 hover:bg-red-600"
                        : modal.type === "success"
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-primaryColors-0 hover:bg-primaryColors-0/90"
                    }`}
                  >
                    {modal.type === "confirm" ? "Confirm" : "Got it"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}