// context/SocketContext.tsx - COMPLETE FIXED VERSION WITH ORG-SCOPED PRESENCE
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { socketService } from "@/app/services/socketService";

export interface Notification {
  id: string;
  title: string;
  message: string;
  courseId?: string;
  groupId?: string;
  type?: string;
  achievementId?: string;
  createdAt?: string;
  isRead?: boolean;
  read?: boolean;
  userId?: string;
  organizationId?: string;
  role?: string;
  to?: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    user_pic: string | null;
  };
  course?: {
    id: string;
    course_title: string;
    course_image: string | null;
  };
  group?: {
    id: string;
    group_title: string;
    group_image: string | null;
  };
  organization?: {
    id: string;
    organization_name: string;
    organization_image: string | null;
  };
}

export interface OnlineUser {
  userId: string;
  userType?: string;
  firstName?: string;
  lastName?: string;
  userPic?: string;
  lastSeen?: string;
}

interface SocketContextType {
  isConnected: boolean;
  isAuthenticated: boolean;
  unreadCount: number;
  notifications: Notification[];
  onlineUsers: OnlineUser[];
  organizationOnlineUsers: OnlineUser[]; // ✅ NEW: org-scoped list
  organizationOnlineCount: number; // ✅ NEW: derived count
  userType: string | null;
  userId: string | null;
  organizationId: string | null;
  isIndividualUser: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  joinOrganization: (organizationId: string) => void;
  joinCourse: (courseId: string) => void;
  joinGroup: (groupId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  sendPrivateMessage: (
    receiverId: string,
    content: string,
    replyToId?: string,
  ) => boolean;
  getOnlineUsers: () => void;
  getUserStatus: (userId: string) => void;
  isUserOnline: (userId: string) => boolean;
  refreshOrganizationOnlineUsers: () => void; // ✅ NEW
  refreshNotifications: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

interface SocketProviderProps {
  children: ReactNode;
  userType?: string;
  userId?: string;
  organizationId?: string | null;
  autoConnect?: boolean;
}

export function SocketProvider({
  children,
  userType,
  userId,
  organizationId = null,
  autoConnect = true,
}: SocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [organizationOnlineUsers, setOrganizationOnlineUsers] = useState<
    OnlineUser[]
  >([]); // ✅ NEW
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  const [loading, setLoading] = useState(true);

  const notificationCache = useRef<Set<string>>(new Set());
  const isMounted = useRef(true);
  const orgIdRef = useRef(organizationId);
  const userTypeRef = useRef(userType);
  const userIdRef = useRef(userId);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const authCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if user is an individual (student, tutor only)
  const isIndividualUser = userType === "student" || userType === "tutor";

  // Update refs
  useEffect(() => {
    orgIdRef.current = organizationId;
    userTypeRef.current = userType;
    userIdRef.current = userId;
  }, [organizationId, userType, userId]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (authCheckIntervalRef.current) {
        clearInterval(authCheckIntervalRef.current);
      }
    };
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL;

      const endpoint = `${API_URL}/api/notifications/fetch-all-notification`;

      const res = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch notifications");

      const data = await res.json();
      if (isMounted.current && data.success) {
        const notifs = data.data || [];
        setNotifications(notifs);
        const unread = notifs.filter(
          (n: Notification) => !n.isRead && !n.read,
        ).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Refresh notifications
  const refreshNotifications = async () => {
    setLoading(true);
    await fetchNotifications();
    setLoading(false);
  };

  // ✅ NEW: helper to (re)request the org-scoped online list on demand
  const refreshOrganizationOnlineUsers = () => {
    if (organizationId) {
      socketService.getOrganizationOnlineUsers(organizationId);
    }
  };

  // Connect to socket
  const connect = async () => {
    if (connectionAttempted) {
      console.log("⚠️ Connection already attempted, skipping...");
      return;
    }

    try {
      setConnectionAttempted(true);
      console.log(`🔄 Connecting socket for ${userType || "user"}...`);
      await socketService.connect();

      // ✅ Set connected state immediately
      setIsConnected(true);

      console.log(`⏳ Waiting for authentication...`);

      if (authCheckIntervalRef.current) {
        clearInterval(authCheckIntervalRef.current);
      }

      let attempts = 0;
      authCheckIntervalRef.current = setInterval(() => {
        attempts++;
        if (socketService.isAuth()) {
          clearInterval(authCheckIntervalRef.current!);
          authCheckIntervalRef.current = null;

          if (organizationId) {
            socketService.joinOrganization(organizationId);
            console.log(`🏢 Joined organization room: ${organizationId}`);
          } else {
            console.log(
              `👤 Connected as individual user (${userType || "user"})`,
            );
          }

          socketService.getOnlineUsers();

          // ✅ NEW: also request the org-scoped online list right after join
          if (organizationId) {
            socketService.getOrganizationOnlineUsers(organizationId);
          }

          console.log(`✅ Socket connected for ${userType || "user"}`);
        } else if (attempts > 10) {
          clearInterval(authCheckIntervalRef.current!);
          authCheckIntervalRef.current = null;
          console.log(`⏰ Authentication timeout, retrying...`);
          setConnectionAttempted(false);
          if (autoConnect) {
            connect();
          }
        }
      }, 500);
    } catch (error) {
      console.error("Error connecting socket:", error);
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      connectionTimeoutRef.current = setTimeout(() => {
        setConnectionAttempted(false);
        if (autoConnect) {
          connect();
        }
      }, 5000);
    }
  };

  // Disconnect
  const disconnect = () => {
    socketService.disconnect();
    setIsConnected(false);
    setIsAuthenticated(false);
    setConnectionAttempted(false);
    setOnlineUsers([]);
    setOrganizationOnlineUsers([]); // ✅ NEW: clear on disconnect
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }
    if (authCheckIntervalRef.current) {
      clearInterval(authCheckIntervalRef.current);
      authCheckIntervalRef.current = null;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    // Connection events
    cleanupFunctions.push(
      socketService.on("connected", (data: { socketId: string }) => {
        if (isMounted.current) {
          console.log("✅ Socket connected event received:", data);
          setIsConnected(true);
        }
      }),
    );

    cleanupFunctions.push(
      socketService.on("disconnected", (data: { reason: string }) => {
        if (isMounted.current) {
          console.log("❌ Socket disconnected event received:", data.reason);
          setIsConnected(false);
          setIsAuthenticated(false);
          setConnectionAttempted(false);
          setOnlineUsers([]);
          setOrganizationOnlineUsers([]); // ✅ NEW
        }
      }),
    );

    cleanupFunctions.push(
      socketService.on(
        "authenticated",
        (data: {
          success: boolean;
          userId?: string;
          user?: any;
          error?: string;
        }) => {
          if (isMounted.current) {
            if (data.success) {
              console.log(
                `✅ Socket authenticated for ${userType || "user"}:`,
                data.userId,
              );
              setIsAuthenticated(true);
              setIsConnected(true);
              socketService.getOnlineUsers();

              // ✅ NEW: request org-scoped list right after auth too,
              // in case the connect() polling loop missed the window
              if (organizationId) {
                socketService.getOrganizationOnlineUsers(organizationId);
              }
            } else {
              console.error("❌ Socket authentication failed:", data.error);
              setIsAuthenticated(false);
            }
          }
        },
      ),
    );

    // Notification events
    cleanupFunctions.push(
      socketService.on("notification", (notification: Notification) => {
        if (!isMounted.current) return;

        if (notificationCache.current.has(notification.id)) return;
        notificationCache.current.add(notification.id);

        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        console.log(
          `🔔 New notification for ${userType || "user"}:`,
          notification.type,
        );
      }),
    );

    cleanupFunctions.push(
      socketService.on("notification_count", (data: { unread: number }) => {
        if (isMounted.current) {
          setUnreadCount(data.unread);
        }
      }),
    );

    cleanupFunctions.push(
      socketService.on(
        "notification_read",
        (data: { notificationId: string }) => {
          if (isMounted.current) {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === data.notificationId
                  ? { ...n, isRead: true, read: true }
                  : n,
              ),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        },
      ),
    );

    cleanupFunctions.push(
      socketService.on("all_notifications_read", () => {
        if (isMounted.current) {
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, isRead: true, read: true })),
          );
          setUnreadCount(0);
        }
      }),
    );

    // Online users events (GLOBAL list — used for chat/DMs etc)
    cleanupFunctions.push(
      socketService.on("users:online:list", (users: OnlineUser[]) => {
        if (isMounted.current) {
          console.log(`👥 Online users list received:`, users.length);
          setOnlineUsers(users);
        }
      }),
    );

    cleanupFunctions.push(
      socketService.on("user:online", (data: any) => {
        if (isMounted.current) {
          setOnlineUsers((prev) => {
            const exists = prev.some((u) => u.userId === data.userId);
            if (exists) {
              return prev.map((u) =>
                u.userId === data.userId
                  ? {
                      ...u,
                      lastSeen: data.lastSeen,
                      firstName: data.firstName ?? u.firstName,
                      lastName: data.lastName ?? u.lastName,
                      userPic: data.userPic ?? u.userPic,
                      userType: data.userType ?? u.userType,
                    }
                  : u,
              );
            }
            return [
              ...prev,
              {
                userId: data.userId,
                firstName: data.firstName,
                lastName: data.lastName,
                userPic: data.userPic,
                userType: data.userType,
                lastSeen: data.lastSeen,
              },
            ];
          });

          // ✅ NEW: keep the org-scoped list in sync too — whenever
          // anyone comes online, re-request the org-scoped snapshot.
          // This is simple and correct; the backend does the actual
          // organizationId filtering so this stays lightweight.
          if (organizationId) {
            socketService.getOrganizationOnlineUsers(organizationId);
          }
        }
      }),
    );

    cleanupFunctions.push(
      socketService.on(
        "user:offline",
        (data: { userId: string; lastSeen: string }) => {
          if (isMounted.current) {
            setOnlineUsers((prev) =>
              prev.filter((u) => u.userId !== data.userId),
            );

            // ✅ NEW: re-sync org-scoped list on every offline event too
            if (organizationId) {
              socketService.getOrganizationOnlineUsers(organizationId);
            }
          }
        },
      ),
    );

    // ✅ NEW: listen for the org-scoped response and store it separately
    cleanupFunctions.push(
      socketService.on(
        "organization_online_response",
        (data: {
          organizationId: string;
          onlineCount: number;
          users: OnlineUser[];
        }) => {
          if (isMounted.current && data.organizationId === organizationId) {
            console.log(
              `🏢 Org ${data.organizationId} online response:`,
              data.onlineCount,
            );
            setOrganizationOnlineUsers(data.users);
          }
        },
      ),
    );

    // Sync state with socket service every 500ms
    const syncInterval = setInterval(() => {
      if (isMounted.current) {
        const connected = socketService.isConnected();
        if (connected !== isConnected) {
          console.log(
            "🔄 Syncing connection state from interval:",
            connected,
            "current:",
            isConnected,
          );
          setIsConnected(connected);
        }
      }
    }, 500);

    // Cleanup
    return () => {
      clearInterval(syncInterval);
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [isConnected, userType, organizationId]);
  // ✅ NEW: if organizationId becomes available (or changes) AFTER the
  // socket already connected/authenticated, join the org room and
  // fetch its online list. Handles the case where authStatus resolves
  // asynchronously after SocketProvider already mounted/connected.
  useEffect(() => {
    if (isAuthenticated && organizationId) {
      socketService.joinOrganization(organizationId);
      socketService.getOrganizationOnlineUsers(organizationId);
    }
  }, [isAuthenticated, organizationId]);
  // Auto-connect based on user type
  useEffect(() => {
    const shouldConnect = autoConnect && !connectionAttempted && userId;

    if (!shouldConnect) return;

    if (isIndividualUser) {
      console.log(
        `👤 Auto-connecting socket for individual ${userType || "user"}...`,
      );
      connect();
    } else if (organizationId) {
      console.log(
        `🏢 Auto-connecting socket for organization user (${userType})...`,
      );
      connect();
    } else {
      console.log(
        `⏳ Waiting for organization ID for ${userType || "user"}...`,
      );
    }
  }, [
    userId,
    organizationId,
    autoConnect,
    connectionAttempted,
    userType,
    isIndividualUser,
  ]);

  const isUserOnline = (targetUserId: string): boolean => {
    return onlineUsers.some((u) => u.userId === targetUserId);
  };

  const value: SocketContextType = {
    isConnected,
    isAuthenticated,
    unreadCount,
    notifications,
    onlineUsers,
    organizationOnlineUsers, // ✅ NEW
    organizationOnlineCount: organizationOnlineUsers.length, // ✅ NEW
    userType: userType || null,
    userId: userId || null,
    organizationId: organizationId || null,
    isIndividualUser,
    connect,
    disconnect,
    joinOrganization: socketService.joinOrganization.bind(socketService),
    joinCourse: socketService.joinCourse.bind(socketService),
    joinGroup: socketService.joinGroup.bind(socketService),
    markNotificationRead:
      socketService.markNotificationRead.bind(socketService),
    markAllNotificationsRead:
      socketService.markAllNotificationsRead.bind(socketService),
    sendPrivateMessage: socketService.sendPrivateMessage.bind(socketService),
    getOnlineUsers: socketService.getOnlineUsers.bind(socketService),
    getUserStatus: socketService.getUserStatus.bind(socketService),
    isUserOnline,
    refreshOrganizationOnlineUsers, // ✅ NEW
    refreshNotifications,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
