// app/component/chat_component/discussion/discussion_dropdown.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { BsThreeDots, BsTrash, BsPencil } from "react-icons/bs";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  discussionId: string;
  authorId: string;
  currentUserId: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function DiscussionDropdown({
  discussionId,
  authorId,
  currentUserId,
  onDelete,
  onEdit,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Only show dropdown if current user is the author
  const isAuthor = currentUserId === authorId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthor) return null;

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      onDelete?.(discussionId);
      setIsOpen(false);
    }
  };

  const handleEdit = () => {
    onEdit?.(discussionId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition"
      >
        <BsThreeDots className="text-gray-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-8 mt-1 bg-black/20 backdrop-blur-md rounded-xl shadow-lg border border-[#ccc]/10 py-1 min-w-[140px] z-50"
          >
            <button
              onClick={handleEdit}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-100 flex items-center gap-2"
            >
              <BsPencil size={14} /> Edit
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
            >
              <BsTrash size={14} /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}