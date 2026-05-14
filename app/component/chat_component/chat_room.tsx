// app/component/chat_component/chat_room.tsx
"use client";

interface Props {
  clientId: string;
  onClose?: () => void;
}

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { BiSend, BiTrash, BiEdit } from "react-icons/bi";
import {
  BsThreeDotsVertical,
  BsReply,
  BsTrash,
  BsCheck,
  BsCheckAll,
} from "react-icons/bs";
import { v4 as uuidv4 } from "uuid";
import { io, Socket } from "socket.io-client";
import { FaArrowLeft } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";

interface Message {
  id: string;
  text: string;
  time: Date;
  senderId: string;
  isDeleted?: boolean;
  isEdited?: boolean;
  delivered?: boolean;
  read?: boolean;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
    senderId: string;
  };
}

interface ChatUser {
  id: string;
  first_name: string;
  last_name: string;
  user_pic: string;
  role: string;
  isOnline: boolean;
  lastActive: string;
}

export default function ChatRoom({ clientId, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [showChatMenu, setShowChatMenu] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch current user
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setCurrentUserId(data.user.id);
      setIsAuthReady(true);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  // Fetch the user we're chatting with
  const fetchChatUser = async () => {
    if (!clientId) return;
    try {
      const res = await fetch(`${API_URL}/api/discussion/profile/${clientId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setChatUser(data.data);
    } catch (err) {
      console.error("Failed to fetch chat user:", err);
    }
  };

  // Fetch message history
  const fetchMessages = async () => {
    if (!clientId) return;
    setIsLoadingMessages(true);
    try {
      const res = await fetch(
        `${API_URL}/api/discussion/tutors/${clientId}/conversation`,
        { method: "GET", credentials: "include" }
      );
      const data = await res.json();
      if (data.data?.messages) {
        setMessages(
          data.data.messages.map((m: any) => ({
            id: m.id,
            text: m.content,
            time: new Date(m.createdAt),
            senderId: m.sender.id,
            delivered: true,
            read: m.readAt !== null,
            isEdited: m.isEdited || false,
            replyTo: m.replyTo
              ? {
                  id: m.replyTo.id,
                  text: m.replyTo.text,
                  senderName: m.replyTo.senderName,
                  senderId: m.replyTo.senderId,
                }
              : undefined,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (isAuthReady && clientId) {
      fetchMessages();
      fetchChatUser();
    }
  }, [isAuthReady, clientId]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      prevMessagesLengthRef.current = messages.length;
      return;
    }

    const wasEmpty = prevMessagesLengthRef.current === 0;
    const lastMsg = messages[messages.length - 1];
    const isFromCurrentUser = lastMsg?.senderId === currentUserId;

    const threshold = 150;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold;

    if (wasEmpty || isFromCurrentUser || isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, currentUserId]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setShowActionMenu(null);
      }
      if (
        chatMenuRef.current &&
        !chatMenuRef.current.contains(event.target as Node)
      ) {
        setShowChatMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Socket connection
  useEffect(() => {
    if (!isAuthReady) return;

    socketRef.current = io(
      API_URL || "https://goye-platform-backend.onrender.com",
      {
        withCredentials: true,
      }
    );

    socketRef.current.on("connect", () => {
      console.log("Connected:", socketRef.current?.id);
    });

    socketRef.current.on("private:message", (data) => {
      if (data.sender.id === clientId || data.receiver.id === clientId) {
        const incoming: Message = {
          id: data.id,
          text: data.content,
          time: new Date(data.createdAt),
          senderId: data.sender.id,
          delivered: true,
          isEdited: data.isEdited || false,
          replyTo: data.replyTo,
        };
        setMessages((prev) => [...prev, incoming]);
      }
    });

    socketRef.current.on("private:message:sent", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.id ? { ...msg, delivered: true } : msg
        )
      );
    });

    socketRef.current.on("private:message:updated", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.id
            ? { ...msg, text: data.content, isEdited: true }
            : msg
        )
      );
    });

    socketRef.current.on("private:message:deleted", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.id
            ? { ...msg, text: "This message was deleted", isDeleted: true }
            : msg
        )
      );
    });

    socketRef.current.on("private:message:read", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          data.messageIds.includes(msg.id) ? { ...msg, read: true } : msg
        )
      );
    });

    socketRef.current.on("private:chat:cleared", (data) => {
      if (data.with === clientId) {
        setMessages([]);
      }
    });

    socketRef.current.on("user:online", (data) => {
      if (data.userId === clientId) {
        setChatUser((prev) =>
          prev
            ? { ...prev, isOnline: data.online, lastActive: data.lastSeen }
            : prev
        );
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [isAuthReady, clientId, API_URL]);

  // Send message
  const createMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageInput.trim() || !socketRef.current || !clientId) return;

    const tempId = uuidv4();
    const newMessage: Message = {
      id: tempId,
      text: messageInput,
      time: new Date(),
      senderId: currentUserId,
      delivered: false,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            text: replyingTo.text.substring(0, 80),
            senderName:
              replyingTo.senderId === currentUserId
                ? "You"
                : `${chatUser?.first_name}`,
            senderId: replyingTo.senderId,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, newMessage]);

    socketRef.current.emit("private:message", {
      receiverId: clientId,
      content: messageInput,
      replyToId: replyingTo?.id,
      tempId,
    });

    setMessageInput("");
    setReplyingTo(null);
  };

  // Edit message
  const handleEditMessage = async () => {
    if (!selectedMessage || !editingMessage?.text.trim()) return;

    const newText = editingMessage.text;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === selectedMessage.id
          ? { ...msg, text: newText, isEdited: true }
          : msg
      )
    );

    socketRef.current?.emit("private:message:updated", {
      messageId: selectedMessage.id,
      content: newText,
    });

    setShowActionMenu(null);
    setEditingMessage(null);
    setSelectedMessage(null);
  };

  // Delete message
  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === selectedMessage.id
          ? { ...msg, text: "This message was deleted", isDeleted: true }
          : msg
      )
    );

    socketRef.current?.emit("private:message:delete", {
      messageId: selectedMessage.id,
    });

    setShowActionMenu(null);
    setSelectedMessage(null);
  };

  // Clear chat
  const handleClearChat = async () => {
    if (!confirm(`Clear all messages with ${chatUser?.first_name}?`)) return;

    setMessages([]);
    socketRef.current?.emit("private:clear", { receiverId: clientId });
    setShowChatMenu(false);
  };

  // Reply to message
  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setShowActionMenu(null);
    setTimeout(() => {
      const input = document.querySelector(
        "input[type='text']"
      ) as HTMLInputElement;
      input?.focus();
    }, 100);
  };

  // Show action menu on click (own messages only)
  const handleMessageClick = (e: React.MouseEvent, message: Message) => {
    e.stopPropagation();
    if (message.senderId !== currentUserId) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = isMobile ? rect.left + 20 : rect.right - 150;
    const y = rect.top - 10;
    
    setShowActionMenu({
      id: message.id,
      x: x,
      y: y,
    });
    setSelectedMessage(message);
    setEditingMessage(null);
  };

  // Quick reply on double click (others' messages only)
  const handleMessageDoubleClick = (e: React.MouseEvent, message: Message) => {
    e.stopPropagation();
    if (message.senderId !== currentUserId && !message.isDeleted) {
      handleReply(message);
    }
  };

  const startEditing = () => {
    if (selectedMessage) {
      setEditingMessage(selectedMessage);
      setShowActionMenu(null);
      setTimeout(() => editInputRef.current?.focus(), 100);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000)
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    return date.toLocaleDateString();
  };

  const formatLastSeen = (lastActive: string) => {
    if (!lastActive) return "Offline";
    const date = new Date(lastActive);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "Last seen just now";
    if (diff < 3600000) return `Last seen ${Math.floor(diff / 60000)}m ago`;
    return `Last seen ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const Avatar = ({
    user,
    size = "md",
  }: {
    user: ChatUser | null;
    size?: "sm" | "md";
  }) => {
    const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-[45px] w-[45px] text-lg";
    if (user?.user_pic) {
      return (
        <div
          className={`${dim} rounded-full overflow-hidden flex-shrink-0 bg-gray-200`}
        >
          <img
            src={user.user_pic}
            alt="avatar"
            className="h-full w-full object-cover"
          />
        </div>
      );
    }
    return (
      <div
        className={`${dim} rounded-full bg-primaryColors-0/20 flex items-center justify-center font-semibold text-primaryColors-0 flex-shrink-0`}
      >
        {user?.first_name?.charAt(0).toUpperCase() || "?"}
      </div>
    );
  };

  const MessageStatus = ({ message }: { message: Message }) => {
    if (message.senderId !== currentUserId) return null;
    if (message.isDeleted) return null;
    if (message.read)
      return <BsCheckAll className="text-blue-500 text-xs ml-1" />;
    if (message.delivered)
      return <BsCheckAll className="text-gray-400 text-xs ml-1" />;
    return <BsCheck className="text-gray-400 text-xs ml-1" />;
  };

  const getReplySenderName = (replyTo: Message["replyTo"]) => {
    if (!replyTo) return "";
    if (replyTo.senderId === currentUserId) return "You";
    if (replyTo.senderId === clientId) return chatUser?.first_name || "User";
    return replyTo.senderName;
  };

  const renderMessage = (msg: Message, index: number) => {
    const isCurrentUser = msg.senderId === currentUserId;
    const showAvatar =
      !isCurrentUser &&
      (index === 0 || messages[index - 1]?.senderId !== msg.senderId);
    const showName =
      !isCurrentUser &&
      (index === 0 || messages[index - 1]?.senderId !== msg.senderId);

    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} items-end gap-2 group`}
      >
        {!isCurrentUser && showAvatar && <Avatar user={chatUser} size="sm" />}
        {!isCurrentUser && !showAvatar && <div className="w-8 flex-shrink-0" />}

        <div
          className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
        >
          {showName && !isCurrentUser && (
            <p className="text-xs text-gray-500 mb-1 ml-1">
              {chatUser ? `${chatUser.first_name} ${chatUser.last_name}` : ""}
            </p>
          )}

          {/* Reply Preview */}
          {msg.replyTo && !msg.isDeleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-xs mb-1 px-3 py-1.5 rounded-lg flex flex-col gap-0.5 ${
                isCurrentUser
                  ? "bg-primaryColors-0/30 rounded-tr-none"
                  : "bg-gray-700 rounded-tl-none"
              }`}
            >
              <div className="flex items-center gap-1">
                <BsReply
                  size={10}
                  className={isCurrentUser ? "text-white/70" : "text-gray-400"}
                />
                <span
                  className={`font-medium text-xs ${isCurrentUser ? "text-white/80" : "text-gray-300"}`}
                >
                  {getReplySenderName(msg.replyTo)}
                </span>
              </div>
              <p
                className={`text-xs line-clamp-2 ${isCurrentUser ? "text-white/60" : "text-gray-400"}`}
              >
                {msg.replyTo.text}
              </p>
            </motion.div>
          )}

          {/* Message Bubble */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={(e) => handleMessageClick(e, msg)}
            onDoubleClick={(e) => handleMessageDoubleClick(e, msg)}
            className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl break-words cursor-pointer transition-all ${
              isCurrentUser
                ? "bg-primaryColors-0 text-white rounded-br-none"
                : "bg-gray-800 text-white rounded-bl-none"
            } ${showActionMenu?.id === msg.id ? "ring-2 ring-primaryColors-0" : ""}`}
          >
            {msg.isDeleted ? (
              <p className="text-sm italic opacity-60">{msg.text}</p>
            ) : editingMessage?.id === msg.id ? (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingMessage.text}
                  onChange={(e) =>
                    setEditingMessage({
                      ...editingMessage,
                      text: e.target.value,
                    })
                  }
                  className="bg-transparent text-white outline-none border-b border-white/50 min-w-[120px] flex-1"
                  autoFocus
                  onKeyPress={(e) => e.key === "Enter" && handleEditMessage()}
                />
                <button
                  onClick={handleEditMessage}
                  className="text-xs bg-white/20 px-2 py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingMessage(null)}
                  className="text-xs bg-white/20 px-2 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {msg.text}
                {msg.isEdited && !msg.isDeleted && (
                  <span className="text-xs ml-1 opacity-60">(edited)</span>
                )}
              </p>
            )}
          </motion.div>

          <div
            className={`flex items-center gap-1 mt-1 ${isCurrentUser ? "justify-end" : "justify-start"}`}
          >
            <p className="text-[0.6rem] sm:text-[0.62rem] text-gray-500">
              {formatTime(msg.time)}
            </p>
            <MessageStatus message={msg} />
          </div>
        </div>

        {isCurrentUser && <div className="w-8 flex-shrink-0" />}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full  w-full bg-shadyColor-0/50 backdrop-blur-md lg:rounded-[20px] lg:border lg:border-boldShadyColor-0/80 lg:shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#ccc]/15 bg-shadyColor-0 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition active:bg-gray-200"
              >
                <FaArrowLeft size={18} className="text-gray-600" />
              </button>
            )}

            <Avatar user={chatUser} size={isMobile ? "sm" : "md"} />

            <div>
              <h1 className="font-semibold text-textSlightDark-0 text-[14px] sm:text-[15px]">
                {chatUser
                  ? `${chatUser.first_name} ${chatUser.last_name}`
                  : "Loading..."}
              </h1>
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full flex-shrink-0 ${
                    chatUser?.isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <p className="text-[0.6rem] sm:text-[0.68rem] text-nearTextColors-0">
                  {chatUser?.isOnline
                    ? "Online"
                    : formatLastSeen(chatUser?.lastActive || "")}
                </p>
              </div>
            </div>
          </div>

          {/* Chat Menu */}
          <div className="relative">
            <button
              onClick={() => setShowChatMenu(!showChatMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition active:bg-gray-200"
            >
              <BsThreeDotsVertical className="text-gray-500" />
            </button>

            <AnimatePresence>
              {showChatMenu && (
                <motion.div
                  ref={chatMenuRef}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="absolute right-0 top-10 mt-1 bg-white rounded-xl shadow-lg border py-2 min-w-[140px] z-50"
                >
                  <button
                    onClick={handleClearChat}
                    className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                  >
                    <BsTrash size={16} /> Clear Chat
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Reply Preview Bar */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="px-3 sm:px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between flex-shrink-0"
          >
            <div className="flex-1">
              <p className="text-xs font-medium text-primaryColors-0">
                Replying to{" "}
                {replyingTo.senderId === currentUserId
                  ? "yourself"
                  : chatUser?.first_name}
              </p>
              <p className="text-xs sm:text-sm text-gray-400 line-clamp-1">
                {replyingTo.text}
              </p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 hover:bg-gray-700 rounded-full text-gray-400"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container - Scrollable area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 scrollbar2 min-h-0"
      >
        {isLoadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
            <div className="h-6 w-6 rounded-full border-2 border-gray-300 border-t-primaryColors-0 animate-spin" />
            <p className="text-xs">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-2">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <BiSend className="text-gray-300" size={18} />
            </div>
            <p className="text-xs sm:text-sm font-medium">No messages yet</p>
            <p className="text-xs">
              Say hi to {chatUser ? chatUser.first_name : "them"}!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => renderMessage(msg, idx))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Fixed at bottom */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-t border-boldShadyColor-0 bg-boldShadyColor-0">
        <form onSubmit={createMessage} className="w-full">
          <div className="relative w-full">
            <input
              type="text"
              placeholder={`Message ${chatUser?.first_name || ""}...`}
              className="bg-primaryColors-0/5 rounded-full h-[42px] sm:h-[48px] w-full border-none outline-none pl-4 sm:pl-5 pr-12 sm:pr-14 text-sm"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="h-[32px] w-[32px] sm:h-[38px] sm:w-[38px] bg-primaryColors-0 rounded-full flex justify-center items-center absolute top-[5px] right-[5px] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primaryColors-0/90 transition active:scale-95"
            >
              <BiSend size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* Action Menu */}
      <AnimatePresence>
        {showActionMenu && (
          <motion.div
            ref={actionMenuRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              position: "fixed",
              top: showActionMenu.y,
              left: isMobile ? 20 : showActionMenu.x,
              right: isMobile ? "auto" : "auto",
              zIndex: 1000,
            }}
            className="bg-white rounded-xl shadow-lg border py-2 min-w-[140px]"
          >
            <button
              onClick={startEditing}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <BiEdit size={16} /> Edit
            </button>
            <button
              onClick={() => selectedMessage && handleReply(selectedMessage)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <BsReply size={14} /> Reply
            </button>
            <button
              onClick={handleDeleteMessage}
              className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
            >
              <BiTrash size={16} /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}