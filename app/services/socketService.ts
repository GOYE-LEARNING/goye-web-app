// services/socketService.ts - COMPLETE SINGLETON VERSION
import { io, Socket } from "socket.io-client";

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  mediaUrls?: any[];
  createdAt: string;
  readAt?: string;
  delivered?: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
  replyToId?: string;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
    senderId: string;
  };
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    user_pic: string;
    role: string;
  };
  receiver: {
    id: string;
    first_name: string;
    last_name: string;
    user_pic: string;
    role: string;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  userId: string;
  courseId?: string;
  groupId?: string;
  postId?: string;
  replyId?: string;
  organizationId?: string;
  createdAt: string;
  read: boolean;
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

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isAuthenticated = false;
  private currentUserId: string | null = null;
  private currentOrganizationId: string | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private authToken: string | null = null;
  private connectionAttempts = 0;
  private _isConnected = false;

  // Singleton pattern - get instance
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  private constructor() {
    console.log("🔧 SocketService singleton created");
  }

  // ✅ Fetch token from backend since accessToken cookie is httpOnly
  private async fetchSocketToken(): Promise<string | null> {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        console.error("❌ NEXT_PUBLIC_API_URL is not defined");
        return null;
      }

      console.log("🔑 Fetching socket token...");
      const res = await fetch(`${API_URL}/api/user/socket-token`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) {
        console.error("❌ Failed to fetch socket token:", res.status, res.statusText);
        return null;
      }

      const data = await res.json();
      console.log("✅ Socket token received:", data.token ? "Yes" : "No");
      return data.token || null;
    } catch (err) {
      console.error("❌ Error fetching socket token:", err);
      return null;
    }
  }

  // ✅ connect() with better error handling
  async connect() {
    if (this.socket?.connected) {
      console.log("✅ Socket already connected");
      this._isConnected = true;
      this.emit("connected", { socketId: this.socket?.id });
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_URL) {
      console.error("❌ NEXT_PUBLIC_API_URL is not defined");
      this._isConnected = false;
      return;
    }

    console.log("🔌 Attempting to connect to socket server...");

    // Fetch token BEFORE opening the socket connection
    const token = await this.fetchSocketToken();

    if (!token) {
      console.error("❌ Cannot connect to socket: no token available. Is the user logged in?");
      this.emit("auth_error", {
        message: "No authentication token available. Please log in.",
      });
      return;
    }

    this.authToken = token;

    // If socket exists but is disconnected, remove it
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(API_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: true,
      autoConnect: true,
    });

    // ─── Connection lifecycle ────────────────────────────────────────────────

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket?.id);
      this.reconnectAttempts = 0;
      this.connectionAttempts = 0;
      this._isConnected = true;
      this.emit("connected", { socketId: this.socket?.id });

      // ✅ Send authenticate event immediately after connecting
      console.log("🔐 Sending authenticate event with token...");
      if (this.authToken) {
        this.socket?.emit("authenticate", { token: this.authToken });
      } else {
        console.error("❌ No auth token available to send");
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      this.isAuthenticated = false;
      this.currentUserId = null;
      this._isConnected = false;
      this.emit("disconnected", { reason });
      
      // If disconnect was not intentional, try to reconnect
      if (reason !== "io client disconnect") {
        this.connectionAttempts++;
        if (this.connectionAttempts < 3) {
          setTimeout(() => {
            console.log(`🔄 Reconnecting attempt ${this.connectionAttempts + 1}...`);
            this.connect();
          }, 2000);
        }
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error?.message || error);
      this.reconnectAttempts++;
      console.log(`🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      this.emit("error", { message: error?.message || "Connection error" });
    });

    // ─── Authentication response ─────────────────────────────────────────────

    this.socket.on(
      "authenticated",
      (data: { 
        success: boolean; 
        userId?: string; 
        user?: any;
        error?: string 
      }) => {
        if (data.success) {
          console.log("✅ Socket authenticated for user:", data.userId);
          this.isAuthenticated = true;
          this.currentUserId = data.userId || null;
          this._isConnected = true;
          this.emit("authenticated", data);

          // Request online users list right after auth succeeds
          setTimeout(() => {
            this.socket?.emit("users:online");
          }, 500);
        } else {
          console.error("❌ Socket authentication failed:", data.error);
          this.isAuthenticated = false;
          this.emit("auth_error", data);
          
          // Retry authentication with a new token
          setTimeout(async () => {
            console.log("🔄 Retrying authentication...");
            const newToken = await this.fetchSocketToken();
            if (newToken) {
              this.authToken = newToken;
              this.socket?.emit("authenticate", { token: newToken });
            }
          }, 3000);
        }
      }
    );

    this.socket.on("auth_timeout", (data: { message: string }) => {
      console.error("⏰ Authentication timeout:", data.message);
      this.isAuthenticated = false;
      this.emit("auth_timeout", data);
      
      // Try to re-authenticate
      setTimeout(async () => {
        console.log("🔄 Re-authenticating after timeout...");
        const newToken = await this.fetchSocketToken();
        if (newToken) {
          this.authToken = newToken;
          this.socket?.emit("authenticate", { token: newToken });
        }
      }, 2000);
    });

    // ─── Notification events ──────────────────────────────────────────────────

    this.socket.on("notification", (notification: Notification) => {
      console.log("🔔 New notification:", notification.type, notification.id);
      this.emit("notification", notification);
    });

    this.socket.on("notification_count", (data: { unread: number; userId: string }) => {
      console.log("📊 Unread notification count:", data.unread);
      this.emit("notification_count", data);
    });

    this.socket.on("notification_read", (data: { notificationId: string; read: boolean }) => {
      console.log("✅ Notification marked as read:", data.notificationId);
      this.emit("notification_read", data);
    });

    this.socket.on("all_notifications_read", (data: { userId: string; timestamp: string }) => {
      console.log("📚 All notifications marked as read");
      this.emit("all_notifications_read", data);
    });

    this.socket.on("system_announcement", (notification: Notification) => {
      console.log("📢 System announcement:", notification.title);
      this.emit("system_announcement", notification);
    });

    // ─── Presence events ─────────────────────────────────────────────────────

    this.socket.on("user:online", (data: { 
      userId: string; 
      online: boolean; 
      lastSeen: string;
      firstName?: string;
      lastName?: string;
      userPic?: string;
      userType?: string;
    }) => {
      this.emit("user:online", data);
    });

    this.socket.on("user:offline", (data: { userId: string; lastSeen: string }) => {
      this.emit("user:offline", data);
    });

    this.socket.on("users:online:list", (users: OnlineUser[]) => {
      console.log("👥 Online users list received:", users.length, "users");
      this.emit("users:online:list", users);
    });

    this.socket.on("organization_online_response", (data: { 
      organizationId: string; 
      onlineCount: number; 
      users: OnlineUser[] 
    }) => {
      console.log(`🏢 Organization ${data.organizationId} has ${data.onlineCount} online users`);
      this.emit("organization_online_response", data);
    });

    this.socket.on("user_status_response", (data: { 
      userId: string; 
      online: boolean; 
      lastSeen: string | null;
      firstName?: string;
      lastName?: string;
      userPic?: string;
      userType?: string;
    }) => {
      this.emit("user_status_response", data);
    });

    // ─── Private message events ──────────────────────────────────────────────

    this.socket.on("private:message", (message: Message) => {
      console.log("📩 Received private message:", message.id);
      this.emit("private:message", message);
    });

    this.socket.on("private:message:sent", (message: Message) => {
      console.log("✅ Message sent confirmation:", message.id);
      this.emit("private:message:sent", message);
    });

    this.socket.on("private:message:updated", (data: { 
      id: string; 
      content: string; 
      isEdited: boolean;
      senderId: string;
      receiverId: string;
      time: string;
    }) => {
      console.log("✏️ Message updated:", data.id);
      this.emit("private:message:updated", data);
    });

    this.socket.on("private:message:deleted", (data: { 
      id: string; 
      isDeleted: boolean;
      senderId: string;
      receiverId: string;
      time: string;
    }) => {
      console.log("🗑️ Message deleted:", data.id);
      this.emit("private:message:deleted", data);
    });

    this.socket.on("private:chat:cleared", (data: { with: string; clearedAt: string }) => {
      console.log("🧹 Chat cleared with:", data.with);
      this.emit("private:chat:cleared", data);
    });

    this.socket.on("private:typing", (data: { 
      userId: string; 
      isTyping: boolean;
      firstName?: string;
      lastName?: string;
    }) => {
      this.emit("private:typing", data);
    });

    this.socket.on("private:read", (data: { 
      messageIds: string[]; 
      readBy: string; 
      readAt: string;
    }) => {
      this.emit("private:read", data);
    });

    this.socket.on("private:error", (data: { message: string }) => {
      console.error("⚠️ Private message error:", data.message);
      this.emit("private:error", data);
    });

    // ─── Ping/Pong for connection health ────────────────────────────────────

    this.socket.on("ping", (data: { timestamp: string }) => {
      this.socket?.emit("pong", { timestamp: new Date().toISOString() });
    });
  }

  // ─── Re-authenticate (e.g. after token refresh) ──────────────────────────

  async reauthenticate() {
    console.log("🔄 Re-authenticating socket...");
    const token = await this.fetchSocketToken();
    if (token) {
      this.authToken = token;
      if (this.socket?.connected) {
        this.socket.emit("authenticate", { token });
      } else {
        await this.connect();
      }
    } else {
      console.error("❌ Failed to get new token for re-authentication");
    }
  }

  // ─── Disconnect ───────────────────────────────────────────────────────────

  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting socket...");
      this.isAuthenticated = false;
      this.currentUserId = null;
      this.authToken = null;
      this._isConnected = false;
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.listeners.clear();
  }

  // ─── Room Management ──────────────────────────────────────────────────────

  joinOrganization(organizationId: string) {
    if (!this.socket?.connected || !this.isAuthenticated) {
      console.warn("⚠️ Cannot join organization: not connected/authenticated");
      return;
    }
    this.currentOrganizationId = organizationId;
    this.socket.emit("join_organization", { organizationId });
    console.log(`🏢 Joined organization room: ${organizationId}`);
  }

  joinCourse(courseId: string) {
    if (!this.socket?.connected || !this.isAuthenticated) {
      console.warn("⚠️ Cannot join course: not connected/authenticated");
      return;
    }
    this.socket.emit("join_course", { courseId });
    console.log(`📚 Joined course room: ${courseId}`);
  }

  joinGroup(groupId: string) {
    if (!this.socket?.connected || !this.isAuthenticated) {
      console.warn("⚠️ Cannot join group: not connected/authenticated");
      return;
    }
    this.socket.emit("join_group", { groupId });
    console.log(`👥 Joined group room: ${groupId}`);
  }

  leaveRoom(room: string) {
    if (!this.socket?.connected || !this.isAuthenticated) return;
    this.socket.emit("leave_room", { room });
    console.log(`🚪 Left room: ${room}`);
  }

  // ─── Notification Methods ────────────────────────────────────────────────

  markNotificationRead(notificationId: string) {
    if (!this.socket?.connected || !this.isAuthenticated) {
      console.warn("⚠️ Cannot mark notification as read: not connected/authenticated");
      return;
    }
    this.socket.emit("mark_notification_read", { notificationId });
  }

  markAllNotificationsRead() {
    if (!this.socket?.connected || !this.isAuthenticated) {
      console.warn("⚠️ Cannot mark all notifications as read: not connected/authenticated");
      return;
    }
    this.socket.emit("mark_all_notifications_read");
  }

  getOrganizationOnlineUsers(organizationId: string) {
    if (!this.socket?.connected || !this.isAuthenticated) {
      console.warn("⚠️ Cannot get organization online users: not connected/authenticated");
      return;
    }
    this.socket.emit("get_organization_online", { organizationId });
  }

  getUserStatus(userId: string) {
    if (!this.socket?.connected || !this.isAuthenticated) {
      console.warn("⚠️ Cannot get user status: not connected/authenticated");
      return;
    }
    this.socket.emit("get_user_status", { userId });
  }

  // ─── Messaging methods ────────────────────────────────────────────────────

  sendPrivateMessage(
    receiverId: string,
    content: string,
    replyToId?: string
  ): boolean {
    if (!this.socket?.connected) {
      console.warn("⚠️ Cannot send message: socket not connected");
      return false;
    }
    if (!this.isAuthenticated) {
      console.warn("⚠️ Cannot send message: not authenticated");
      return false;
    }
    this.socket.emit("private:message", { receiverId, content, replyToId });
    return true;
  }

  editMessage(messageId: string, content: string) {
    if (!this.socket?.connected || !this.isAuthenticated) {
      console.warn("⚠️ Cannot edit message: not connected/authenticated");
      return;
    }
    this.socket.emit("private:message:updated", { messageId, content });
  }

  deleteMessage(messageId: string) {
    if (!this.socket?.connected || !this.isAuthenticated) {
      console.warn("⚠️ Cannot delete message: not connected/authenticated");
      return;
    }
    this.socket.emit("private:message:delete", { messageId });
  }

  clearChat(receiverId: string) {
    if (!this.socket?.connected || !this.isAuthenticated) {
      console.warn("⚠️ Cannot clear chat: not connected/authenticated");
      return;
    }
    this.socket.emit("private:clear", { receiverId });
  }

  sendTypingIndicator(receiverId: string, isTyping: boolean) {
    if (!this.socket?.connected || !this.isAuthenticated) return;
    this.socket.emit("private:typing", { receiverId, isTyping });
  }

  markMessagesAsRead(messageIds: string[], senderId: string) {
    if (!this.socket?.connected || !this.isAuthenticated) return;
    this.socket.emit("private:read", { messageIds, senderId });
  }

  getOnlineUsers() {
    if (!this.socket?.connected || !this.isAuthenticated) return;
    this.socket.emit("users:online");
  }

  // ─── Status helpers ───────────────────────────────────────────────────────

  isConnected(): boolean {
    return this._isConnected || this.socket?.connected || false;
  }

  isAuth(): boolean {
    return this.isAuthenticated;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  getCurrentOrganizationId(): string | null {
    return this.currentOrganizationId;
  }

  // ─── Event emitter ────────────────────────────────────────────────────────

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
    // Return cleanup function
    return () => this.off(event, callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
}

// Export the singleton instance
export const socketService = SocketService.getInstance();