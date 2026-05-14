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

  connect(userId: string, token: string) {
    if (this.socket?.connected) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

    this.socket = io(API_URL, {
      auth: {
        token,
        userId,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("🔌 Socket connected");
      this.emit("connected", { socketId: this.socket?.id });
    });

    this.socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
      this.emit("disconnected", {});
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.emit("error", { message: error.message });
    });

    // Private message events
    this.socket.on("private:message", (message: Message) => {
      this.emit("private:message", message);
    });

    this.socket.on("private:message:sent", (message: Message) => {
      this.emit("private:message:sent", message);
    });

    this.socket.on("private:typing", (data: { userId: string; isTyping: boolean }) => {
      this.emit("private:typing", data);
    });

    this.socket.on("private:read", (data: { messageIds: string[]; readBy: string; readAt: string }) => {
      this.emit("private:read", data);
    });

    this.socket.on("private:error", (data: { message: string }) => {
      this.emit("private:error", data);
    });

    // User status events
    this.socket.on("user:online", (data: { userId: string; online: boolean; lastSeen: string }) => {
      this.emit("user:online", data);
    });

    this.socket.on("users:online:list", (users: string[]) => {
      this.emit("users:online:list", users);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  sendPrivateMessage(receiverId: string, content: string, mediaUrls?: any[]) {
    this.socket?.emit("private:message", {
      receiverId,
      content,
      mediaUrls: mediaUrls || [],
    });
  }

  sendTypingIndicator(receiverId: string, isTyping: boolean) {
    this.socket?.emit("private:typing", { receiverId, isTyping });
  }

  markMessagesAsRead(messageIds: string[], senderId: string) {
    this.socket?.emit("private:read", { messageIds, senderId });
  }

  getOnlineUsers() {
    this.socket?.emit("users:online");
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const socketService = new SocketService();