"use client"
import { FaReply, FaTrash } from "react-icons/fa";
import { Message } from "../services/socketService";
import { useEffect, useRef } from "react";
import { BiEdit } from "react-icons/bi";

// Replace MessageActions component entirely
export const MessageActions = ({
  message,
  isOwnMessage,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
  onReply,
  onClose,
}: {
  message: Message;
  isOwnMessage: boolean;
  onEdit: (message: Message) => void;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
  onReply: (message: Message) => void;
  onClose: () => void;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-8 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]"
    >
      <button
        onClick={() => { onReply(message); onClose(); }}
        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
      >
        <FaReply size={12} /> Reply
      </button>

      {isOwnMessage && (
        <button
          onClick={() => { onEdit(message); onClose(); }}
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <BiEdit size={12} /> Edit
        </button>
      )}

      {/* Delete for me — available to everyone */}
      <button
        onClick={() => { onDeleteForMe(message.id); onClose(); }}
        className="w-full px-3 py-2 text-left text-sm text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
      >
        <FaTrash size={12} /> Delete for me
      </button>

      {/* Delete for everyone — only message sender */}
      {isOwnMessage && (
        <button
          onClick={() => { onDeleteForEveryone(message.id); onClose(); }}
          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <FaTrash size={12} /> Delete for everyone
        </button>
      )}
    </div>
  );
};