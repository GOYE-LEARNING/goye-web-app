"use client";

import ChatRoom from "@/app/component/chat_component/chat_room";
import GeneralPost from "@/app/component/chat_component/general_post";
import PrivateChat from "@/app/component/chat_component/private_chat";
import { useCallback, useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaArrowLeft, FaPen, FaRegCommentDots } from "react-icons/fa6";
import { MdAdd } from "react-icons/md";

export default function SocialMode() {
  const [showPrivateMessages, setShowPrivateMessages] = useState<boolean>(false);
  const [showGeneralContainer, setShowGeneralContainer] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [privateChatContainer, setPrivateChatContainer] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [openSelections, setOpenSelections] = useState<boolean>(false);
  const [triggerCreatePost, setTriggerCreatePost] = useState<boolean>(false);
  const selectionButtonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Lock body scroll on mobile when chat sidebar is open
  useEffect(() => {
    if (isMobile && privateChatContainer) {
      document.body.classList.add("chat-open");
    } else {
      document.body.classList.remove("chat-open");
    }
    return () => {
      document.body.classList.remove("chat-open");
    };
  }, [isMobile, privateChatContainer]);

  // Close outside click for selection menu
  const closeOutside = (e: MouseEvent) => {
    if (
      selectionButtonRef.current &&
      !selectionButtonRef.current.contains(e.target as Node)
    ) {
      setOpenSelections(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);

  const openPrivateMessage = useCallback(
    (userId?: string, userName?: string) => {
      if (userId) {
        setSelectedUser({ id: userId, name: userName || "User" });
        setShowPrivateMessages(true);
        setShowGeneralContainer(false);
        // Close the sidebar on mobile when opening a chat
        if (isMobile) {
          setPrivateChatContainer(false);
        }
      }
    },
    [isMobile]
  );

  const closePrivateMessage = useCallback(() => {
    setShowPrivateMessages(false);
    setShowGeneralContainer(true);
    setSelectedUser(null);
  }, []);

  const openPrivateMessagesContainer = () => {
    setPrivateChatContainer(true);
  };

  const closePrivateMessagesContainer = () => {
    setPrivateChatContainer(false);
  };

  const openCreatePost = () => {
    setTriggerCreatePost(true);
    setOpenSelections(false);
  };

  const resetCreatePostTrigger = () => {
    setTriggerCreatePost(false);
  };

  const generalPostVariants = {
    initial: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  const chatRoomVariants = {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  const sidebarVariants = {
    closed: { x: "100%", opacity: 0 },
    open: { x: 0, opacity: 1 },
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const MobileHeader = () => {
    if (!isMobile) return null;
    
    if (showPrivateMessages && selectedUser) {
      return (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-shadyColor-0 border-b border-boldShadyColor-0/80 px-4 py-3 flex items-center gap-3"
          style={{ height: "60px" }}
        >
          <button
            onClick={closePrivateMessage}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
          >
            <FaArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="font-semibold text-textSlightDark-0 dark:text-white">
            {selectedUser.name}
          </h1>
        </motion.div>
      );
    }
    
    if (privateChatContainer) {
      return (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-shadyColor-0 border-b border-boldShadyColor-0/80 py-3 flex items-center gap-3"
          style={{ height: "60px" }}
        >
          <button
            onClick={closePrivateMessagesContainer}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
          >
            <FaArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="font-semibold text-textSlightDark-0 dark:text-white">Messages</h1>
        </motion.div>
      );
    }
    
    return null;
  };

  return (
    <div className="h-full w-full md:mt-2">
      {/* Animated FAB Menu */}
      <div
        style={{
          pointerEvents: openSelections ? "auto" : "none",
        }}
        className="bg-transparent fixed bottom-[7rem] right-[1.4rem] p-[1rem] md:right-[2rem] h-[150px] w-[150px] overflow-hidden z-10"
      >
        <AnimatePresence mode="wait">
          {openSelections && (
            <motion.div
              ref={selectionButtonRef}
              key="select-animation"
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              transition={{ stiffness: 100, damping: 10, duration: 0.5 }}
              exit={{ rotate: -180 }}
              className="absolute left-[62px] top-[62px] h-[150px] w-[150px] z-30 rounded-[50%]"
            >
              <div
                onClick={openCreatePost}
                style={{ pointerEvents: "auto" }}
                className="box circle absolute left-[32%] top-0"
              >
                <FaPen size={18} />
              </div>
              <div
                onClick={() => setOpenSelections(false)}
                style={{ pointerEvents: "auto" }}
                className="md:flex hidden box circle absolute top-[32%]"
              >
                &times;
              </div>
              <div
                onClick={() => {
                  setOpenSelections(false);
                  openPrivateMessagesContainer();
                }}
                style={{ pointerEvents: "auto" }}
                className="md:hidden box circle absolute top-[32%]"
              >
                <FaRegCommentDots size={18} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div
          onClick={() => setOpenSelections(true)}
          className="box circle absolute bottom-0 right-0 z-30 transition-all duration-150"
          style={{
            transform: !openSelections ? "scale(1)" : "scale(0.9)",
            pointerEvents: "auto",
          }}
        >
          <MdAdd size={18} />
        </div>
      </div>

      {!isMobile ? (
        // Desktop Layout
        <div className="w-full h-full md:bg-transparent bg-shadyColor-0 backdrop-blur-md ">
          <div className="flex w-full h-full">
            <div className="w-full h-full overflow-auto scrollbar2">
              <AnimatePresence mode="wait">
                {showGeneralContainer && !showPrivateMessages && (
                  <motion.div
                    key="general-post"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full"
                  >
                    <GeneralPost
                      openPrivateMessages={openPrivateMessagesContainer}
                      triggerCreatePost={triggerCreatePost}
                      onTriggerClose={resetCreatePostTrigger}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {showPrivateMessages && selectedUser && (
                  <motion.div
                    key="chat-room"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full"
                  >
                    <ChatRoom
                      clientId={selectedUser.id}
                      onClose={closePrivateMessage}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-[35%] h-full overflow-y-auto px-3 py-4 md:py-0 md:hidden">
              <PrivateChat
                openPrivateMessage={openPrivateMessage}
                closePrivateMessages={closePrivateMessagesContainer}
              />
            </div>
          </div>
        </div>
      ) : (
        // Mobile Layout
        <>
          <MobileHeader />

          <div className="pb-20 h-full">
            <AnimatePresence mode="wait">
              {showGeneralContainer && !showPrivateMessages && (
                <motion.div
                  key="general-post"
                  variants={generalPostVariants}
                  initial="initial"
                  animate="initial"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-full h-full"
                >
                  <GeneralPost
                    openPrivateMessages={openPrivateMessagesContainer}
                    triggerCreatePost={triggerCreatePost}
                    onTriggerClose={resetCreatePostTrigger}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {showPrivateMessages && selectedUser && (
                <motion.div
                  key="chat-room"
                  variants={chatRoomVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-full"
                >
                  <ChatRoom
                    clientId={selectedUser.id}
                    onClose={closePrivateMessage}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Private Chat List Sidebar - Slide in */}
          <AnimatePresence>
            {privateChatContainer && (
              <>
                <motion.div
                  variants={overlayVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={closePrivateMessagesContainer}
                />
                <motion.div
                  key="private-chat-sidebar"
                  variants={sidebarVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="fixed inset-y-0 right-0 w-full bg-shadyColor-0 dark:bg-secondaryColors-0 border-l border-boldShadyColor-0/80 overflow-y-auto z-50 pt-16"
                >
                  <div className="px-3 py-4">
                    <PrivateChat
                      openPrivateMessage={openPrivateMessage}
                      closePrivateMessages={closePrivateMessagesContainer}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}