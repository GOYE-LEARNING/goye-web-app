// services/socketService.ts
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

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  user_pic: string;
  role: string;
  online?: boolean;
  lastSeen?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isAuthenticated = false;
  private currentUserId: string | null = null;

  // ✅ Fetch token from backend since accessToken cookie is httpOnly
  // (httpOnly cookies cannot be read by JavaScript via document.cookie)
  private async fetchSocketToken(): Promise<string | null> {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

      const res = await fetch(`${API_URL}/api/user/socket-token`, {
        method: "GET",
        credentials: "include", // sends the httpOnly cookie to backend automatically
      });

      if (!res.ok) {
        console.error("❌ Failed to fetch socket token:", res.status);
        return null;
      }

      const data = await res.json();
      return data.token || null;
    } catch (err) {
      console.error("❌ Error fetching socket token:", err);
      return null;
    }
  }

  // ✅ connect() is now async so it can fetch the token before connecting
  async connect() {
    if (this.socket?.connected) {
      console.log("✅ Socket already connected");
      return;
    }

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

    console.log("🔌 Attempting to connect to socket server...");

    // Fetch token BEFORE opening the socket connection
    const token = await this.fetchSocketToken();

    if (!token) {
      console.error(
        "❌ Cannot connect to socket: no token available. Is the user logged in?"
      );
      this.emit("auth_error", {
        message: "No authentication token available. Please log in.",
      });
      return;
    }

    // Store token on instance so we can resend it on reconnect
    this.socket = io(API_URL, {
      // ✅ polling FIRST so the initial HTTP handshake carries cookies,
      // then upgrades to websocket
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: true, // send cookies with every request
    });

    // ─── Connection lifecycle ────────────────────────────────────────────────

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket?.id);
      this.reconnectAttempts = 0;

      // ✅ Send authenticate event immediately after connecting
      // Backend will verify this token and mark the socket as authenticated
      console.log("🔐 Sending authenticate event...");
      this.socket?.emit("authenticate", { token });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      this.isAuthenticated = false;
      this.currentUserId = null;
      this.emit("disconnected", { reason });
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error?.message || error);
      this.reconnectAttempts++;
      console.log(
        `🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );
      this.emit("error", { message: error?.message || "Connection error" });
    });

    // ─── Authentication response ─────────────────────────────────────────────

    this.socket.on(
      "authenticated",
      (data: { success: boolean; userId?: string; error?: string }) => {
        if (data.success) {
          console.log("✅ Socket authenticated for user:", data.userId);
          this.isAuthenticated = true;
          this.currentUserId = data.userId || null;
          this.emit("authenticated", data);

          // Request online users list right after auth succeeds
          this.socket?.emit("users:online");
        } else {
          console.error("❌ Socket authentication failed:", data.error);
          this.isAuthenticated = false;
          this.emit("auth_error", data);
        }
      }
    );

    this.socket.on("auth_timeout", (data: { message: string }) => {
      console.error("⏰ Authentication timeout:", data.message);
      this.isAuthenticated = false;
      this.emit("auth_timeout", data);
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

    this.socket.on(
      "private:message:updated",
      (data: { id: string; content: string; isEdited: boolean }) => {
        console.log("✏️ Message updated:", data.id);
        this.emit("private:message:updated", data);
      }
    );

    this.socket.on(
      "private:message:deleted",
      (data: { id: string; isDeleted: boolean }) => {
        console.log("🗑️ Message deleted:", data.id);
        this.emit("private:message:deleted", data);
      }
    );

    this.socket.on(
      "private:chat:cleared",
      (data: { with: string; clearedAt: string }) => {
        console.log("🧹 Chat cleared with:", data.with);
        this.emit("private:chat:cleared", data);
      }
    );

    this.socket.on(
      "private:typing",
      (data: { userId: string; isTyping: boolean }) => {
        this.emit("private:typing", data);
      }
    );

    this.socket.on(
      "private:read",
      (data: { messageIds: string[]; readBy: string; readAt: string }) => {
        this.emit("private:read", data);
      }
    );

    this.socket.on("private:error", (data: { message: string }) => {
      console.error("⚠️ Private message error:", data.message);
      this.emit("private:error", data);
    });

    // ─── Presence events ─────────────────────────────────────────────────────

    this.socket.on(
      "user:online",
      (data: { userId: string; online: boolean; lastSeen: string }) => {
        this.emit("user:online", data);
      }
    );

    this.socket.on("users:online:list", (users: string[]) => {
      console.log("👥 Online users list received:", users.length, "users");
      this.emit("users:online:list", users);
    });
  }

  // ─── Re-authenticate (e.g. after token refresh) ──────────────────────────

  async reauthenticate() {
    if (this.socket?.connected) {
      const token = await this.fetchSocketToken();
      if (token) {
        this.socket.emit("authenticate", { token });
      }
    } else {
      await this.connect();
    }
  }

  // ─── Disconnect ───────────────────────────────────────────────────────────

  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting socket...");
      this.isAuthenticated = false;
      this.currentUserId = null;
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
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
    return this.socket?.connected || false;
  }

  isAuth(): boolean {
    return this.isAuthenticated;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
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
      callbacks.forEach((callback) => callback(data));
    }
  }
}

export const socketService = new SocketService();