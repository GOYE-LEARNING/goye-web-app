"use client";

import { useState, createContext, useContext, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaQuestionCircle,
  FaTimes 
} from "react-icons/fa";
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
  info: { icon: FaInfoCircle, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  success: { icon: FaCheckCircle, color: "text-green-500", bg: "bg-green-50", border: "border-green-200" },
  error: { icon: FaExclamationCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  confirm: { icon: FaQuestionCircle, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-200" },
};

// Toast notification for top-right corner
function ToastNotification({ 
  title, 
  message, 
  type, 
  onClose 
}: { 
  title: string; 
  message: string; 
  type: ModalType; 
  onClose: () => void;
}) {
  const Icon = ModalIcons[type].icon;
  const iconColor = ModalIcons[type].color;
  const iconBg = ModalIcons[type].bg;
  const borderColor = ModalIcons[type].border;

  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Determine background color based on type
  const getBgColor = () => {
    switch (type) {
      case "error":
        return "bg-red-50 dark:bg-red-900/20";
      case "success":
        return "bg-green-50 dark:bg-green-900/20";
      case "info":
        return "bg-blue-50 dark:bg-blue-900/20";
      case "confirm":
        return "bg-purple-50 dark:bg-purple-900/20";
      default:
        return "bg-white dark:bg-gray-800";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 100, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`fixed top-4 right-4 z-[9999] w-full max-w-sm rounded-xl shadow-2xl border ${borderColor} ${getBgColor()} overflow-hidden`}
    >
      <div className="flex items-start p-4">
        <div className={`flex-shrink-0 p-2 rounded-full ${iconBg} mr-3`}>
          <Icon className={`${iconColor} text-xl`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${type === 'error' ? 'text-red-800 dark:text-red-200' : type === 'success' ? 'text-green-800 dark:text-green-200' : type === 'info' ? 'text-blue-800 dark:text-blue-200' : 'text-purple-800 dark:text-purple-200'}`}>
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 break-words">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <FaTimes size={16} />
        </button>
      </div>
      {/* Progress bar for auto-close */}
      <div className="h-1 w-full bg-gray-200 dark:bg-gray-700">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 5, ease: "linear" }}
          className={`h-full ${
            type === "error" ? "bg-red-500" :
            type === "success" ? "bg-green-500" :
            type === "info" ? "bg-blue-500" :
            "bg-purple-500"
          }`}
        />
      </div>
    </motion.div>
  );
}

// Modal dialog for confirm actions
function ConfirmModal({
  title,
  message,
  type,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  type: ModalType;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const Icon = ModalIcons[type].icon;
  const iconColor = ModalIcons[type].color;
  const iconBg = ModalIcons[type].bg;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center p-5 pb-0">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${iconBg}`}>
                <Icon className={`${iconColor} text-xl`} />
              </div>
              <h2 className="text-lg font-semibold dark:text-white">{title}</h2>
            </div>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
              <IoClose size={24} />
            </button>
          </div>
          <div className="p-5">
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
          </div>
          <div className="flex justify-end gap-3 p-5 pt-0">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                type === "error"
                  ? "bg-red-500 hover:bg-red-600"
                  : type === "success"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ModalType;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ModalType;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "confirm",
  });

  const showModal = (title: string, message: string, type: ModalType, onConfirm?: () => void) => {
    // For confirm type, show the modal dialog
    if (type === "confirm") {
      setConfirmModal({
        isOpen: true,
        title,
        message,
        type,
        onConfirm,
      });
      return;
    }

    // For other types, show toast notification
    setToast({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const hideModal = () => {
    setToast({ ...toast, isOpen: false });
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  const handleConfirm = () => {
    if (confirmModal.onConfirm) confirmModal.onConfirm();
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      
      {/* Toast Notifications - Top Right */}
      <AnimatePresence>
        {toast.isOpen && (
          <ToastNotification
            title={toast.title}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, isOpen: false })}
          />
        )}
      </AnimatePresence>

      {/* Confirm Modal - Center */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <ConfirmModal
            title={confirmModal.title}
            message={confirmModal.message}
            type={confirmModal.type}
            onConfirm={handleConfirm}
            onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          />
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}