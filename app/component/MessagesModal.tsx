"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Portal from "@/app/component/Portal";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaEllipsis,
  FaPaperclip,
  FaArrowRight,
  FaTrash,
  FaCheck,
  FaCheckDouble,
  FaChalkboardUser,
  FaUsers,
} from "react-icons/fa6";
import { CiSearch } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { socketService, Message } from "@/app/services/socketService";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { MessageActions } from "@/app/component/MessageActions";
import { useModal } from "../context/SimpleModalContext";

interface Contact {
  id: string;
  name: string;
  first_name: string;
  avatar?: string;
  online?: boolean;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isTyping?: boolean;
  lastSeen?: string;
  role?: string;
  source?: string;
}

// Edit message inline modal
interface EditModalProps {
  message: Message;
  onConfirm: (newContent: string) => void;
  onClose: () => void;
}

const EditMessageModal = ({ message, onConfirm, onClose }: EditModalProps) => {
  const [value, setValue] = useState(message.content);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-md px-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center p-5 pb-0">
            <h2 className="text-lg font-semibold dark:text-white">
              Edit Message
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <IoClose size={24} />
            </button>
          </div>
          <div className="p-5">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={3}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primaryColors-0 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 p-5 pt-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (value.trim() && value !== message.content) {
                  onConfirm(value.trim());
                }
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-primaryColors-0 hover:bg-primaryColors-0/90 text-white text-sm"
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString();
};

export default function MessagesModal({ isOpen, onClose }: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { showModal } = useModal();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showActionsFor, setShowActionsFor] = useState<string | null>(null);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedContact && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [selectedContact]);

  // ── Fetch current user ────────────────────────────────────────────────────
  const fetchCurrentUserProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
      const data = await res.json();
      if (data?.user?.id) {
        setCurrentUserId(data.user.id);
        setCurrentUser(data.user);
        setCurrentUserRole(data.user.role || "student");
        return data.user.id;
      } else if (data?.id) {
        setCurrentUserId(data.id);
        setCurrentUser(data);
        setCurrentUserRole(data.role || "student");
        return data.id;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }, [API_URL]);

  const isTutor = useMemo(
    () =>
      currentUserRole === "instructor" ||
      currentUserRole === "tutor" ||
      currentUserRole === "admin",
    [currentUserRole],
  );

  useEffect(() => {
    if (isOpen && !currentUserId) fetchCurrentUserProfile();
  }, [isOpen, currentUserId, fetchCurrentUserProfile]);

  // ── Socket ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !currentUserId) return;

    socketService
      .connect()
      .catch((err) => console.error("Socket connect failed:", err));

    const handleConnected = () => {
      setSocketConnected(true);
      setSocketError(null);
    };
    const handleAuthenticated = () => {
      setSocketConnected(true);
      setSocketError(null);
      socketService.getOnlineUsers();
    };
    const handleAuthError = (error: any) => {
      setSocketError(error?.message || "Authentication failed");
      setSocketConnected(false);
    };
    const handleAuthTimeout = () => {
      setSocketError("Authentication timeout");
      setSocketConnected(false);
    };
    const handleConnectError = (error: any) => {
      setSocketError(error?.message || "Socket connection failed");
      setSocketConnected(false);
    };
    const handleDisconnect = () => setSocketConnected(false);

    const handleUserOnline = (data: any) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (data.online) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
      setContacts((prev) =>
        prev.map((c) =>
          c.id === data.userId
            ? { ...c, online: data.online, isTyping: false }
            : c,
        ),
      );
    };

    const handleUsersOnlineList = (users: string[]) => {
      setOnlineUsers(new Set(users));
      setContacts((prev) =>
        prev.map((c) => ({ ...c, online: users.includes(c.id) })),
      );
    };

    const handlePrivateMessage = (message: Message) => {
      if (
        selectedContact &&
        (message.senderId === selectedContact.id ||
          message.receiverId === selectedContact.id)
      ) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
      setContacts((prev) =>
        prev.map((c) =>
          c.id === message.senderId
            ? {
                ...c,
                lastMessage: message.content,
                time: formatTime(new Date(message.createdAt)),
                unreadCount:
                  selectedContact?.id === message.senderId
                    ? 0
                    : (c.unreadCount || 0) + 1,
              }
            : c,
        ),
      );
    };

    const handleMessageSent = (message: Message) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id.startsWith("temp-") && msg.content === message.content
            ? message
            : msg,
        ),
      );
    };

    const handleMessageDeleted = (data: { id: string; isDeleted: boolean }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.id
            ? { ...msg, content: "This message was deleted", isDeleted: true }
            : msg,
        ),
      );
    };

    const handleMessageEdited = (data: {
      id: string;
      content: string;
      isEdited: boolean;
    }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.id
            ? { ...msg, content: data.content, isEdited: true }
            : msg,
        ),
      );
    };

    const handleChatCleared = (data: { with: string }) => {
      if (selectedContact?.id === data.with) setMessages([]);
    };

    const handlePrivateTyping = (data: {
      userId: string;
      isTyping: boolean;
    }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (data.isTyping) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
      setContacts((prev) =>
        prev.map((c) =>
          c.id === data.userId ? { ...c, isTyping: data.isTyping } : c,
        ),
      );
    };

    const handlePrivateError = (data: { message: string }) => {
      setSocketError(data.message);
    };

    socketService.on("connected", handleConnected);
    socketService.on("authenticated", handleAuthenticated);
    socketService.on("auth_error", handleAuthError);
    socketService.on("auth_timeout", handleAuthTimeout);
    socketService.on("connect_error", handleConnectError);
    socketService.on("disconnect", handleDisconnect);
    socketService.on("user:online", handleUserOnline);
    socketService.on("users:online:list", handleUsersOnlineList);
    socketService.on("private:message", handlePrivateMessage);
    socketService.on("private:message:sent", handleMessageSent);
    socketService.on("private:message:deleted", handleMessageDeleted);
    socketService.on("private:message:updated", handleMessageEdited);
    socketService.on("private:chat:cleared", handleChatCleared);
    socketService.on("private:typing", handlePrivateTyping);
    socketService.on("private:error", handlePrivateError);

    return () => {
      socketService.off("connected", handleConnected);
      socketService.off("authenticated", handleAuthenticated);
      socketService.off("auth_error", handleAuthError);
      socketService.off("auth_timeout", handleAuthTimeout);
      socketService.off("connect_error", handleConnectError);
      socketService.off("disconnect", handleDisconnect);
      socketService.off("user:online", handleUserOnline);
      socketService.off("users:online:list", handleUsersOnlineList);
      socketService.off("private:message", handlePrivateMessage);
      socketService.off("private:message:sent", handleMessageSent);
      socketService.off("private:message:deleted", handleMessageDeleted);
      socketService.off("private:message:updated", handleMessageEdited);
      socketService.off("private:chat:cleared", handleChatCleared);
      socketService.off("private:typing", handlePrivateTyping);
      socketService.off("private:error", handlePrivateError);
      socketService.disconnect();
    };
  }, [isOpen, currentUserId, selectedContact]);

  // ── Fetch contacts ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const fetchContacts = async () => {
      try {
        setIsLoadingContacts(true);
        const endpoint = isTutor
          ? `${API_URL}/api/discussion/students`
          : `${API_URL}/api/discussion/tutors`;
        const res = await fetch(endpoint, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        let list: Contact[] = [];
        if (data.data?.today || data.data?.yesterday || data.data?.persons) {
          const all = [
            ...(data.data.today || []),
            ...(data.data.yesterday || []),
            ...(data.data.persons || []),
          ];
          list = all.map((item: any) => ({
            id: item.id,
            name: `${item.first_name} ${item.last_name}`,
            first_name: item.first_name,
            avatar: item.user_pic,
            online: item.online || false,
            lastMessage: item.lastMessage?.text || "Start a conversation",
            time: item.lastMessage?.time
              ? formatTime(new Date(item.lastMessage.time))
              : "",
            unreadCount: item.unreadCount || 0,
            isTyping: false,
            lastSeen: item.lastActive,
            role: item.role,
            source: item.sources?.join(", "),
          }));
        } else if (Array.isArray(data.data)) {
          list = data.data.map((item: any) => ({
            id: item.id,
            name: `${item.first_name} ${item.last_name}`,
            first_name: item.first_name,
            avatar: item.user_pic,
            online: item.online || false,
            lastMessage: "Start a conversation",
            time: "",
            unreadCount: 0,
            isTyping: false,
            lastSeen: item.lastActive,
            role: item.role,
          }));
        }
        setContacts(list);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setIsLoadingContacts(false);
      }
    };
    if (currentUserId || isOpen) fetchContacts();
  }, [isOpen, API_URL, currentUserId, isTutor]);

  // ── Fetch messages ────────────────────────────────────────────────────────
  const fetchMessages = useCallback(
    async (contactId: string) => {
      setIsLoadingMessages(true);
      try {
        const res = await fetch(
          `${API_URL}/api/discussion/private/${contactId}`,
          { method: "GET", credentials: "include" },
        );
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        setMessages(data.data?.messages || data.data || []);
        setContacts((prev) =>
          prev.map((c) => (c.id === contactId ? { ...c, unreadCount: 0 } : c)),
        );
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [API_URL],
  );

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setReplyingTo(null);
    setEditingMessage(null);
    fetchMessages(contact.id);
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;
    if (!currentUserId) {
      const uid = await fetchCurrentUserProfile();
      if (!uid) {
        showModal("Error", "Unable to identify user. Please refresh.", "error");
        return;
      }
    }

    setIsSending(true);
    const messageContent = newMessage.trim();
    const messageData: any = {
      receiverId: selectedContact.id,
      content: messageContent,
    };
    if (replyingTo) messageData.replyToId = replyingTo.id;

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      senderId: currentUserId,
      receiverId: selectedContact.id,
      createdAt: new Date().toISOString(),
      replyToId: replyingTo?.id,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            text: replyingTo.content,
            senderName: replyingTo.sender?.first_name || "Someone",
            senderId: replyingTo.senderId,
          }
        : undefined,
      sender: {
        id: currentUserId,
        first_name: currentUser?.first_name || "Me",
        last_name: currentUser?.last_name || "",
        user_pic: currentUser?.user_pic || "",
        role: currentUser?.role || "",
      },
      receiver: {
        id: selectedContact.id,
        first_name: selectedContact.first_name,
        last_name: "",
        user_pic: selectedContact.avatar || "",
        role: selectedContact.role || "",
      },
    };

    setNewMessage("");
    setShowEmojiPicker(false);
    setReplyingTo(null);
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const res = await fetch(`${API_URL}/api/discussion/private`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id ? data.data : msg,
          ),
        );
        if (socketConnected) {
          socketService.sendPrivateMessage(
            selectedContact.id,
            messageContent,
            replyingTo?.id,
          );
        }
      } else {
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticMessage.id),
        );
        showModal(
          "Send failed",
          "Failed to send message. Please try again.",
          "error",
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== optimisticMessage.id),
      );
      showModal("Error", "An unexpected error occurred.", "error");
    } finally {
      setIsSending(false);
    }
  };

  // ── Edit message ──────────────────────────────────────────────────────────
  const handleEditMessage = async (message: Message) => {
    // Opens the inline EditMessageModal — see editingMessage state
    setEditingMessage(message);
    setShowActionsFor(null);
  };

  const handleEditConfirm = async (newContent: string) => {
    if (!editingMessage) return;
    try {
      const res = await fetch(
        `${API_URL}/api/discussion/private/message/${editingMessage.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newContent }),
          credentials: "include",
        },
      );
      if (res.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === editingMessage.id
              ? { ...msg, content: newContent, isEdited: true }
              : msg,
          ),
        );
        if (socketConnected)
          socketService.editMessage(editingMessage.id, newContent);
      } else {
        showModal(
          "Edit failed",
          "Could not edit your message. Please try again.",
          "error",
        );
      }
    } catch (error) {
      console.error("Error editing message:", error);
      showModal(
        "Error",
        "An unexpected error occurred while editing.",
        "error",
      );
    } finally {
      setEditingMessage(null);
    }
  };

  // MessagesModal.tsx - handleDeleteForMe
  const handleDeleteForMe = (messageId: string) => {
    showModal(
      "Delete for me",
      "Remove this message from your view? Others will still see it.",
      "confirm",
      async () => {
        try {
          const res = await fetch(
            `${API_URL}/api/discussion/private/message/${messageId}?deleteType=me`,
            { method: "DELETE", credentials: "include" },
          );
          if (res.ok) {
            // Remove from UI
            setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
            setShowActionsFor(null);
          } else {
            showModal("Failed", "Could not hide the message.", "error");
          }
        } catch (error) {
          showModal("Error", "An unexpected error occurred.", "error");
        }
      },
    );
  };

  // handleDeleteForEveryone - add deleteType=everyone to be explicit
 // MessagesModal.tsx
const handleDeleteForEveryone = (messageId: string) => {
  showModal(
    "Delete for everyone",
    "This message will be permanently deleted for all participants.",
    "confirm",
    async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/discussion/private/message/${messageId}?deleteType=everyone`,
          { method: "DELETE", credentials: "include" },
        );
        if (res.ok) {
          // Update own UI immediately
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: "This message was deleted", isDeleted: true }
                : msg,
            ),
          );
          setShowActionsFor(null);

          // Notify receiver via socket — backend socket handler will
          // emit "private:message:deleted" to both users
          if (socketConnected) socketService.deleteMessage(messageId);
        } else {
          showModal("Delete failed", "Failed to delete. Please try again.", "error");
        }
      } catch (error) {
        showModal("Error", "An unexpected error occurred.", "error");
      }
    },
  );
};

  // ── Clear chat ────────────────────────────────────────────────────────────
  const handleClearChat = () => {
    if (!selectedContact) return;
    showModal(
      "Clear chat",
      `Clear all messages with ${selectedContact.name}? This cannot be undone.`,
      "confirm",
      async () => {
        try {
          const res = await fetch(
            `${API_URL}/api/discussion/private/clear/${selectedContact.id}`,
            { method: "DELETE", credentials: "include" },
          );
          if (res.ok) {
            setMessages([]);
            if (socketConnected) socketService.clearChat(selectedContact.id);
            showModal("Done", "Chat has been cleared.", "success");
          } else {
            showModal(
              "Failed",
              "Could not clear the chat. Please try again.",
              "error",
            );
          }
        } catch (error) {
          console.error("Error clearing chat:", error);
          showModal("Error", "An unexpected error occurred.", "error");
        }
      },
    );
  };

  // ── Typing indicator ──────────────────────────────────────────────────────
  const handleTyping = () => {
    if (!selectedContact || !socketConnected) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketService.sendTypingIndicator(selectedContact.id, true);
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendTypingIndicator(selectedContact.id, false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const onEmojiClick = (emojiObject: any) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    return contacts.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [contacts, searchQuery]);

  const isSelectedContactOnline = selectedContact
    ? onlineUsers.has(selectedContact.id)
    : false;
  const isSelectedContactTyping = selectedContact
    ? typingUsers.has(selectedContact.id)
    : false;

  const headerIcon = isTutor ? (
    <FaUsers className="inline mr-2" />
  ) : (
    <FaChalkboardUser className="inline mr-2" />
  );
  const headerTitle = isTutor ? "Your Students" : "Your Tutors";
  const emptyStateIcon = isTutor ? "👨‍🎓" : "👨‍🏫";
  const emptyStateText = isTutor ? "No students found" : "No tutors found";
  const emptyStateSubtext = isTutor
    ? "Enroll students in your courses to connect with them"
    : "Enroll in courses or join groups to connect with tutors";
  const selectPrompt = isTutor ? "Select a student" : "Select a tutor";
  const selectDescription = isTutor
    ? "Choose a student from the list to start messaging"
    : "Choose a tutor from the list to start messaging";

  if (!isOpen) return null;

  return (
    <Portal containerId="messages-modal-root">
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            {/* Edit message modal — rendered on top */}
            <AnimatePresence>
              {editingMessage && (
                <EditMessageModal
                  message={editingMessage}
                  onConfirm={handleEditConfirm}
                  onClose={() => setEditingMessage(null)}
                />
              )}
            </AnimatePresence>

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 dark:bg-black/40 bg-white/40 backdrop-blur-sm z-40"
            />

            {/* Main modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-0"
            >
              <div className="w-full h-full lg:w-[90%] lg:h-[85vh] max-w-6xl bg-white dark:bg-secondaryColors-0 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
                {/* ── Contacts Sidebar ────────────────────────────────────── */}
                <div
                  className={`w-full lg:w-[35%] h-full bg-white dark:bg-shadyColor-0 border-r border-boldShadyColor-0/20 flex flex-col overflow-hidden ${selectedContact ? "hidden lg:flex" : "flex"}`}
                >
                  <div className="px-4 py-3 border-b border-boldShadyColor-0/20 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-lightBoldText-0 dark:text-white">
                      {headerIcon} {headerTitle}
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition"
                    >
                      <FaArrowLeft
                        size={18}
                        className="text-gray-600 dark:text-gray-400"
                      />
                    </button>
                  </div>

                  <div className="px-4 py-3 border-b border-boldShadyColor-0/20">
                    <div className="relative">
                      <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm" />
                      <input
                        type="text"
                        placeholder={
                          isTutor ? "Search students..." : "Search tutors..."
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-boldShadyColor-0/10 rounded-full text-sm text-lightBoldText-0 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primaryColors-0"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto scrollbar2">
                    {isLoadingContacts ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-10 h-10 border-4 border-primaryColors-0/20 border-t-primaryColors-0 rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isTutor
                              ? "Loading students..."
                              : "Loading tutors..."}
                          </p>
                        </div>
                      </div>
                    ) : filteredContacts.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <CiSearch className="text-4xl text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {emptyStateText}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {emptyStateSubtext}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-boldShadyColor-0/10">
                        {filteredContacts.map((contact) => (
                          <motion.div
                            key={contact.id}
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                            className={`px-4 py-3 cursor-pointer transition-colors ${selectedContact?.id === contact.id ? "bg-primaryColors-0/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
                            onClick={() => handleSelectContact(contact)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative flex-shrink-0">
                                <div className="h-12 w-12 bg-gradient-to-br from-primaryColors-0 to-primaryColors-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                                  {contact.avatar ? (
                                    <img
                                      src={contact.avatar}
                                      alt={contact.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span>
                                      {contact.first_name
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                {(contact.online ||
                                  onlineUsers.has(contact.id)) && (
                                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-secondaryColors-0 animate-pulse" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h3 className="font-semibold text-lightBoldText-0 dark:text-white truncate">
                                    {contact.name}
                                  </h3>
                                  {contact.time && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                      {contact.time}
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={`text-sm truncate line-clamp-1 ${contact.unreadCount ? "font-semibold text-lightBoldText-0 dark:text-white" : "text-nearTextColors-0 dark:text-gray-400"}`}
                                >
                                  {contact.isTyping ? (
                                    <span className="text-primaryColors-0 flex items-center gap-1">
                                      <span className="animate-pulse">●</span>{" "}
                                      typing...
                                    </span>
                                  ) : (
                                    contact.lastMessage
                                  )}
                                </p>
                                {contact.source && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    via {contact.source}
                                  </p>
                                )}
                              </div>
                              {(contact.unreadCount ?? 0) > 0 && (
                                <div className="w-6 h-6 bg-primaryColors-0 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {(contact.unreadCount ?? 0) > 99
                                    ? "99+"
                                    : contact.unreadCount}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Chat Area ───────────────────────────────────────────── */}
                <div className="w-full lg:w-[65%] h-full flex flex-col bg-lightWhite-0 dark:bg-secondaryColors-0 overflow-hidden">
                  {selectedContact ? (
                    <>
                      {/* Chat header */}
                      <div className="px-4 py-3 border-b border-boldShadyColor-0/20 flex items-center justify-between bg-white dark:bg-shadyColor-0">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => setSelectedContact(null)}
                            className="lg:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition"
                          >
                            <FaArrowLeft
                              size={18}
                              className="text-gray-600 dark:text-gray-400"
                            />
                          </button>
                          <div className="relative flex-shrink-0">
                            <div className="h-10 w-10 bg-gradient-to-br from-primaryColors-0 to-primaryColors-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                              {selectedContact.avatar ? (
                                <img
                                  src={selectedContact.avatar}
                                  alt={selectedContact.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span>
                                  {selectedContact.first_name
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              )}
                            </div>
                            {isSelectedContactOnline && (
                              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-lightBoldText-0 dark:text-white truncate">
                              {selectedContact.name}
                            </h3>
                            <p className="text-xs text-nearTextColors-0 dark:text-gray-400">
                              {isSelectedContactTyping ? (
                                <span className="text-primaryColors-0 flex items-center gap-1">
                                  <span className="animate-pulse">●</span>{" "}
                                  typing...
                                </span>
                              ) : isSelectedContactOnline ? (
                                <span className="text-green-500 flex items-center gap-1">
                                  <span className="animate-pulse">●</span>{" "}
                                  Active now
                                </span>
                              ) : (
                                `Last seen ${selectedContact.lastSeen || "recently"}`
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleClearChat}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition text-red-500"
                            title="Clear chat"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Reply preview bar */}
                      {replyingTo && (
                        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-primaryColors-0 font-medium">
                              Replying to{" "}
                              {replyingTo.sender?.first_name || "Someone"}:{" "}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300 italic">
                              {replyingTo.content.substring(0, 60)}
                              {replyingTo.content.length > 60 ? "…" : ""}
                            </span>
                          </div>
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2 flex-shrink-0"
                          >
                            <IoClose size={16} />
                          </button>
                        </div>
                      )}

                      {/* Socket error banner */}
                      {socketError && (
                        <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-2 text-center">
                          ⚠️ {socketError}
                        </div>
                      )}

                      {/* Messages list */}
                      {/* Messages list */}
                      <div className="flex-1 overflow-y-auto scrollbar2 p-4 space-y-3">
                        {isLoadingMessages ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="w-10 h-10 border-4 border-primaryColors-0/20 border-t-primaryColors-0 rounded-full animate-spin mx-auto mb-2" />
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Loading messages...
                              </p>
                            </div>
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="text-4xl mb-3">👋</div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                No messages yet
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Start the conversation!
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            {messages.map((message) => {
                              const isOwnMessage =
                                message.senderId === currentUserId;
                              const isDeleted = message.isDeleted;
                              return (
                                <div
                                  key={message.id}
                                  className="relative group"
                                >
                                  <div
                                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                                  >
                                    <div className="relative max-w-[70%]">
                                      {/* Reply preview inside bubble */}
                                      {message.replyTo && !isDeleted && (
                                        <div
                                          className={`text-xs mb-1 px-3 py-1.5 rounded-t-lg border-l-2 border-primaryColors-0 ${
                                            isOwnMessage
                                              ? "bg-primaryColors-0/20 text-right"
                                              : "bg-gray-300 dark:bg-gray-600"
                                          }`}
                                        >
                                          <p className="font-medium text-primaryColors-0 text-left">
                                            {message.replyTo.senderName ||
                                              "Someone"}
                                          </p>
                                          <p className="text-gray-600 dark:text-gray-300 italic truncate text-left">
                                            {(
                                              message.replyTo.text ?? ""
                                            ).substring(0, 50)}
                                            {(message.replyTo.text ?? "")
                                              .length > 50
                                              ? "…"
                                              : ""}
                                          </p>
                                        </div>
                                      )}

                                      {/* Bubble */}
                                      <div
                                        className={`px-4 py-2 rounded-2xl ${
                                          isOwnMessage
                                            ? "bg-primaryColors-0 text-white rounded-br-none"
                                            : "bg-gray-200 dark:bg-gray-700 text-lightBoldText-0 dark:text-white rounded-bl-none"
                                        } ${isDeleted ? "opacity-60 italic" : ""}`}
                                      >
                                        <p className="text-sm break-words whitespace-pre-wrap">
                                          {isDeleted
                                            ? "This message was deleted"
                                            : message.content}
                                        </p>
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                          {message.isEdited && !isDeleted && (
                                            <span className="text-xs opacity-70">
                                              (edited)
                                            </span>
                                          )}
                                          <span className="text-xs opacity-70">
                                            {formatTime(
                                              new Date(message.createdAt),
                                            )}
                                          </span>
                                          {isOwnMessage && !isDeleted && (
                                            <span className="text-xs">
                                              {message.readAt ? (
                                                <FaCheckDouble className="text-blue-300" />
                                              ) : (
                                                <FaCheck className="opacity-70" />
                                              )}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions button - NOW USING FOCUS/CLICK INSTEAD OF HOVER */}
                                  {!isDeleted && (
                                    <>
                                      {/* Mobile/Desktop: Click/tap to show actions */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowActionsFor(
                                            showActionsFor === message.id
                                              ? null
                                              : message.id,
                                          );
                                        }}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                          ) {
                                            e.preventDefault();
                                            setShowActionsFor(
                                              showActionsFor === message.id
                                                ? null
                                                : message.id,
                                            );
                                          }
                                        }}
                                        aria-label="Message actions"
                                        className={`absolute top-0 ${
                                          isOwnMessage
                                            ? "right-0 -translate-x-2"
                                            : "left-0 translate-x-2"
                                        } p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md 
                  hover:bg-gray-100 dark:hover:bg-gray-700 
                  focus:outline-none focus:ring-2 focus:ring-primaryColors-0
                  transition-all duration-200
                  ${showActionsFor === message.id ? "opacity-100 scale-110" : "opacity-0 scale-95 group-focus-within:opacity-100 group-hover:opacity-100"}`}
                                      >
                                        <FaEllipsis
                                          size={14}
                                          className="text-gray-500"
                                        />
                                      </button>

                                      {/* For touch devices - make the entire message bubble tappable */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Only show if not already shown and if clicked on bubble area
                                          if (showActionsFor !== message.id) {
                                            setShowActionsFor(message.id);
                                            // Auto-hide after 5 seconds on mobile
                                            setTimeout(() => {
                                              setShowActionsFor((prev) =>
                                                prev === message.id
                                                  ? null
                                                  : prev,
                                              );
                                            }, 5000);
                                          }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer lg:hidden"
                                        aria-label="Show message options"
                                      />

                                      {showActionsFor === message.id && (
                                        <MessageActions
                                          message={message}
                                          isOwnMessage={isOwnMessage}
                                          onEdit={handleEditMessage}
                                          onDeleteForMe={handleDeleteForMe}
                                          onDeleteForEveryone={
                                            handleDeleteForEveryone
                                          }
                                          onReply={(msg) => {
                                            setReplyingTo(msg);
                                            setShowActionsFor(null);
                                          }}
                                          onClose={() =>
                                            setShowActionsFor(null)
                                          }
                                        />
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })}
                            <div ref={messagesEndRef} />
                          </>
                        )}
                      </div>

                      {/* Input area */}
                      <div className="px-4 py-3 border-t border-boldShadyColor-0/20 bg-white dark:bg-shadyColor-0">
                        <div className="flex items-end gap-2">
                          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition flex-shrink-0">
                            <FaPaperclip
                              size={18}
                              className="text-primaryColors-0"
                            />
                          </button>

                          <div className="relative">
                            <button
                              ref={emojiButtonRef}
                              onClick={() =>
                                setShowEmojiPicker(!showEmojiPicker)
                              }
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition flex-shrink-0 text-xl"
                            >
                              😊
                            </button>
                            {showEmojiPicker && (
                              <div className="absolute bottom-full mb-2 left-0 z-50">
                                <EmojiPicker
                                  onEmojiClick={onEmojiClick}
                                  autoFocusSearch={false}
                                  theme={Theme.AUTO}
                                />
                              </div>
                            )}
                          </div>

                          <textarea
                            ref={messageInputRef}
                            value={newMessage}
                            onChange={(e) => {
                              setNewMessage(e.target.value);
                              handleTyping();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={
                              replyingTo
                                ? "Type your reply..."
                                : "Type a message..."
                            }
                            className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-boldShadyColor-0/10 rounded-full text-sm text-lightBoldText-0 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primaryColors-0 resize-none max-h-24"
                            rows={1}
                          />

                          <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || isSending}
                            className="p-2 bg-primaryColors-0 hover:bg-primaryColors-600 disabled:bg-primaryColors-300 rounded-full transition flex-shrink-0 disabled:cursor-not-allowed"
                          >
                            <FaArrowRight size={18} className="text-white" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">{emptyStateIcon}</div>
                        <h3 className="text-xl font-semibold text-lightBoldText-0 dark:text-white mb-2">
                          {selectPrompt}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectDescription}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
}
