// app/component/chat_component/student_tutors.tsx
"use client";

import { useEffect, useState } from "react";
import { socketService } from "@/app/services/socketService";
import { FaArrowLeft } from "react-icons/fa6";

interface Props {
  openPrivateMessages: (userId: string, userName: string) => void;
  closePrivateMessageContainer?: () => void;
}

interface Contact {
  id: string;
  name: string;
  first_name: string;
  lastMessage: string;
  time: string;
  avatar?: string;
  online?: boolean;
  unreadCount?: number;
  isTyping?: boolean;
}

export default function StudentTutors({ openPrivateMessages, closePrivateMessageContainer }: Props) {
  const [todayContacts, setTodayContacts] = useState<Contact[]>([]);
  const [yesterdayContacts, setYesterdayContacts] = useState<Contact[]>([]);
  const [persons, setPersons] = useState<Contact[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update a specific contact's last message
  const updateContactMessage = (userId: string, message: string, time: Date) => {
    const updateContactList = (contacts: Contact[]) =>
      contacts.map(contact =>
        contact.id === userId
          ? {
              ...contact,
              lastMessage: message,
              time: formatTime(time),
              unreadCount: (contact.unreadCount || 0) + 1,
            }
          : contact
      );

    setTodayContacts(prev => updateContactList(prev));
    setYesterdayContacts(prev => updateContactList(prev));
    setPersons(prev => updateContactList(prev));
  };

  // Move contact to top of today list when new message arrives
  const moveContactToTop = (userId: string, message: string, time: Date) => {
    let contactToMove: Contact | null = null;
    
    const findAndRemove = (contacts: Contact[]): [Contact[], Contact | null] => {
      const index = contacts.findIndex(c => c.id === userId);
      if (index !== -1) {
        const found = contacts[index];
        const updated = [...contacts];
        updated.splice(index, 1);
        return [updated, found];
      }
      return [contacts, null];
    };

    let [newToday, found] = findAndRemove(todayContacts);
    if (!found) {
      let [newYesterday, found2] = findAndRemove(yesterdayContacts);
      if (found2) {
        found = found2;
        setYesterdayContacts(newYesterday);
      } else {
        let [newPersons, found3] = findAndRemove(persons);
        if (found3) {
          found = found3;
          setPersons(newPersons);
        }
      }
    }

    if (found) {
      const updatedContact = {
        ...found,
        lastMessage: message,
        time: formatTime(time),
        unreadCount: (found.unreadCount || 0) + 1,
      };
      setTodayContacts([updatedContact, ...newToday]);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString();
  };

  const getUnreadBadge = (unreadCount: number) => {
    if (unreadCount === 0) return null;
    return (
      <span className="bg-primaryColors-0 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    );
  };

  useEffect(() => {
    const fetchContacts = async () => {
      const role = localStorage.getItem("role") || "";
      const userId = localStorage.getItem("userId") || "";
      setCurrentUserId(userId);
      setUserRole(role);

      const endpoint =
        role === "instructor" || role === "tutor" || role === "admin"
          ? `${API_URL}/api/discussion/students`
          : `${API_URL}/api/discussion/tutors`;

      try {
        const res = await fetch(endpoint, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        console.log(data);

        const mapContacts = (list: any[]): Contact[] =>
          list.map((t) => ({
            id: t.id,
            name: `${t.first_name} ${t.last_name}`,
            first_name: t.first_name,
            lastMessage: t.lastMessage?.text || "Start a conversation",
            time: t.lastMessage?.time
              ? formatTime(new Date(t.lastMessage.time))
              : "",
            avatar: t.user_pic || "",
            unreadCount: t.unreadCount || 0,
            online: t.online || false,
            isTyping: false,
          }));

        setTodayContacts(mapContacts(data.data.today || []));
        setYesterdayContacts(mapContacts(data.data.yesterday || []));
        setPersons(mapContacts(data.data.persons || []));
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    };

    fetchContacts();

    // Socket connection (use cookies first, fall back to localStorage)
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const cookieUserId = getCookie("userId") || getCookie("user_id");
    const cookieToken = getCookie("accessToken") || getCookie("token") || getCookie("access_token");

    const storedUserId = cookieUserId || localStorage.getItem("userId");
    const storedToken = cookieToken || localStorage.getItem("token");

    if (storedUserId && storedToken) {
      socketService.connect(storedUserId, storedToken);
    } else {
      console.warn("Skipping socket connect: missing userId or token");
    }
    
    // Listen for online status updates
    const unsubscribeOnline = socketService.on("user:online", (data: { userId: string; online: boolean }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.online) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    // Listen for online users list
    const unsubscribeList = socketService.on("users:online:list", (users: string[]) => {
      setOnlineUsers(new Set(users));
    });

    // Listen for new private messages
    const unsubscribeMessage = socketService.on("private:message", (data: any) => {
      const senderId = data.sender.id;
      if (senderId !== currentUserId) {
        updateContactMessage(senderId, data.content, new Date(data.createdAt));
        moveContactToTop(senderId, data.content, new Date(data.createdAt));
      }
    });

    // Listen for typing indicators
    const unsubscribeTyping = socketService.on("private:typing", (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        if (data.isTyping) {
          setTimeout(() => {
            setTypingUsers(prevSet => {
              const updated = new Set(prevSet);
              updated.delete(data.userId);
              return updated;
            });
          }, 3000);
        }
        return newSet;
      });
    });

    // Listen for message updates (edits)
    const unsubscribeMessageUpdated = socketService.on("private:message:updated", (data: any) => {
      const senderId = data.senderId;
      if (senderId !== currentUserId) {
        updateContactMessage(senderId, `${data.content} (edited)`, new Date());
      }
    });

    // Listen for message deletions
    const unsubscribeMessageDeleted = socketService.on("private:message:deleted", (data: any) => {
      const senderId = data.senderId;
      if (senderId !== currentUserId) {
        updateContactMessage(senderId, "This message was deleted", new Date());
      }
    });

    return () => {
      unsubscribeOnline();
      unsubscribeList();
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeMessageUpdated();
      unsubscribeMessageDeleted();
    };
  }, [currentUserId]);

  const handleContactClick = (contactId: string, contactName: string) => {
    // Open the private message
    openPrivateMessages(contactId, contactName);
    
    // On mobile, close the sidebar after clicking a contact
    if (isMobile && closePrivateMessageContainer) {
      closePrivateMessageContainer();
    }
  };

  const ContactCard = ({ contact }: { contact: Contact }) => {
    const isOnline = onlineUsers.has(contact.id) || contact.online;
    const isTyping = typingUsers.has(contact.id);
    
    return (
      <div
      style={{pointerEvents: 'auto'}}
        className="flex items-center justify-between gap-2 cursor-pointer hover:bg-secondaryColors-0 p-2 rounded-lg transition group z-10"
        onClick={() => handleContactClick(contact.id, contact.name)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar with online indicator */}
          <div className="relative flex-shrink-0">
            <div className="h-[45px] w-[45px] bg-gradient-to-br from-primaryColors-0 to-primaryColors-0/70 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
              {contact.avatar ? (
                <img src={contact.avatar} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span>{contact.first_name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-textSlightDark-0 text-[14px] font-medium truncate">
                {contact.name}
              </div>
              {(contact.unreadCount ?? 0) > 0 && getUnreadBadge(contact.unreadCount!)}
            </div>
            <div className="text-nearTextColors-0 text-[12px] truncate flex items-center gap-1">
              {isTyping ? (
                <span className="text-primaryColors-0 flex items-center gap-1">
                  <span className="animate-pulse">●</span>
                  <span>typing...</span>
                </span>
              ) : (
                <span>{contact.lastMessage}</span>
              )}
            </div>
          </div>
        </div>
        {!isTyping && (
          <p className="text-nearTextColors-0 text-[0.65rem] flex-shrink-0">
            {contact.time}
          </p>
        )}
      </div>
    );
  };

  const isInstructor = userRole === "instructor" || userRole === "tutor" || userRole === "admin";

  return (
    <div className="space-y-4 px-3 lg:px-0">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1">
          {isMobile && closePrivateMessageContainer && (
            <FaArrowLeft 
              className="text-gray-600 cursor-pointer" 
              onClick={closePrivateMessageContainer} 
            />
          )}
          <h1 className="font-semibold text-textSlightDark-0 text-[1.2rem]">
            Messages
          </h1>
        </div>
        <p className="text-[0.8rem] text-nearTextColors-0 break-words mt-1">
          {isInstructor
            ? "Your students from courses and groups you manage."
            : "Your tutors from groups and courses you joined and enrolled in."}
        </p>
      </div>

      {/* Today */}
      {todayContacts.length > 0 && (
        <div>
          <h2 className="text-[0.75rem] font-semibold text-nearTextColors-0 uppercase tracking-wide mb-2">
            Today
          </h2>
          <div className="space-y-1">
            {todayContacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </div>
      )}

      {/* Yesterday */}
      {yesterdayContacts.length > 0 && (
        <div>
          <h2 className="text-[0.75rem] font-semibold text-nearTextColors-0 uppercase tracking-wide mb-2">
            Yesterday
          </h2>
          <div className="space-y-1">
            {yesterdayContacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </div>
      )}

      {/* Persons / Older */}
      {persons.length > 0 && (
        <div>
          <h2 className="text-[0.75rem] font-semibold text-nearTextColors-0 uppercase tracking-wide mb-2">
            {isInstructor ? "Students To Chat With" : "Tutors To Chat With"}
          </h2>
          <div className="space-y-1">
            {persons.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {todayContacts.length === 0 && yesterdayContacts.length === 0 && persons.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-primaryColors-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <p className="text-sm">No contacts yet</p>
          <p className="text-xs mt-1 text-center max-w-[200px]">
            {isInstructor
              ? "Students will appear here once they enroll in your courses."
              : "Tutors will appear here once you enroll in a course or join a group."}
          </p>
        </div>
      )}
    </div>
  );
}