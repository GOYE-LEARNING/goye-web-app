import { useState } from "react";
import DashboardCheckPassword from "./dashboard_checkpassword";
import { AnimatePresence, motion } from "framer-motion";
import DashboardChangePassword from "../auth/dashboard_change_password";
interface Props {
  backFunction: () => void;
}
export default function DashboardProfilePassword({ backFunction }: Props) {
  const [showCurrentPasswordPage, setShowCurrentPasswordPage] =
    useState<boolean>(true);
  const [showChangePasswordPage, setShowChangePasswordPage] =
    useState<boolean>(false);

  const openChangePasswordPage = () => {
    setShowCurrentPasswordPage(false);
    setShowChangePasswordPage(true);
  };
  return (
    <div>
      <AnimatePresence mode="wait">
        {showCurrentPasswordPage && (
          <motion.div
            key="check-password"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeIn" }}
          >
            <DashboardCheckPassword
              submitFunc={openChangePasswordPage}
              backFunc={backFunction}
            />
          </motion.div>
        )}

        {showChangePasswordPage && (
          <motion.div
            key="change-password"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeIn" }}
          >
            <DashboardChangePassword backFunction={backFunction}/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
