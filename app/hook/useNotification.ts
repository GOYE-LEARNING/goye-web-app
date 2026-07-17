// app/hook/useNotification.ts - COMPLETE FIXED VERSION
import { useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '@/app/services/socketService';

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

interface UseNotificationsOptions {
  autoConnect?: boolean;
  organizationId?: string;
  onNotification?: (notification: Notification) => void;
  onSystemAnnouncement?: (notification: Notification) => void;
  onOnlineUsersChange?: (users: OnlineUser[]) => void;
  onUserOnline?: (data: any) => void;
  onUserOffline?: (data: any) => void;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isConnected, setIsConnected] = useState(() => socketService.isConnected());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  
  const optionsRef = useRef(options);
  const notificationCache = useRef<Set<string>>(new Set());
  const isMounted = useRef(true);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update options ref
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  // Fetch initial notifications from API
  const fetchAllNotifications = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        console.error('NEXT_PUBLIC_API_URL is not defined');
        return;
      }
      const res = await fetch(`${API_URL}/api/notifications/fetch-all-notification`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) throw new Error('Failed to fetch notifications');
      
      const data = await res.json();
      if (isMounted.current && data.success) {
        const notifs = data.data || [];
        setNotifications(notifs);
        const unread = notifs.filter((n: Notification) => !n.isRead && !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        console.error('NEXT_PUBLIC_API_URL is not defined');
        return;
      }
      const res = await fetch(`${API_URL}/api/notifications/unread`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) throw new Error('Failed to fetch unread notifications');
      
      const data = await res.json();
      if (isMounted.current && data.success) {
        const unreadNotifs = data.data || [];
        setUnreadCount(unreadNotifs.length);
      }
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  }, []);

  // Connect to socket
  const connectSocket = useCallback(async () => {
    if (connectionAttempted) {
      console.log('⚠️ Connection already attempted, skipping...');
      return;
    }
    
    try {
      setConnectionAttempted(true);
      console.log('🔄 Connecting socket...');
      await socketService.connect();
    } catch (error) {
      console.error('Error connecting socket:', error);
      // Retry after 5 seconds if failed
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      connectionTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Retrying socket connection...');
        setConnectionAttempted(false);
        if (options.autoConnect !== false) {
          connectSocket();
        }
      }, 5000);
    }
  }, [connectionAttempted, options.autoConnect]);

  // Disconnect socket
  const disconnectSocket = useCallback(() => {
    socketService.disconnect();
    if (isMounted.current) {
      setIsConnected(false);
      setIsAuthenticated(false);
      setConnectionAttempted(false);
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }
  }, []);

  // Initialize - only fetch notifications on mount
  useEffect(() => {
    const init = async () => {
      await fetchAllNotifications();
      await fetchUnreadNotifications();
    };
    
    init();

    return () => {
      disconnectSocket();
    };
  }, [fetchAllNotifications, fetchUnreadNotifications, disconnectSocket]);

  // Socket event listeners
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    // Connection events - UPDATE isConnected state correctly
    cleanupFunctions.push(
      socketService.on('connected', (data: { socketId: string }) => {
        if (isMounted.current) {
          console.log('✅ Socket connected event received:', data);
          setIsConnected(true);
        }
      })
    );

    cleanupFunctions.push(
      socketService.on('disconnected', (data: { reason: string }) => {
        if (isMounted.current) {
          console.log('❌ Socket disconnected event received:', data.reason);
          setIsConnected(false);
          setIsAuthenticated(false);
          setConnectionAttempted(false);
        }
      })
    );

    cleanupFunctions.push(
      socketService.on('authenticated', (data: { success: boolean; userId?: string; user?: any; error?: string }) => {
        if (isMounted.current) {
          if (data.success) {
            console.log('✅ Socket authenticated event received for user:', data.userId);
            setIsAuthenticated(true);
            setIsConnected(true);
          } else {
            console.error('❌ Socket authentication failed:', data.error);
            setIsAuthenticated(false);
          }
        }
      })
    );

    cleanupFunctions.push(
      socketService.on('auth_error', (data: any) => {
        if (isMounted.current) {
          console.error('❌ Auth error event received:', data);
          setIsAuthenticated(false);
          setIsConnected(false);
        }
      })
    );

    // Notification events - triggers real-time updates
    cleanupFunctions.push(
      socketService.on('notification', (notification: Notification) => {
        if (!isMounted.current) return;
        
        // Prevent duplicate notifications
        if (notificationCache.current.has(notification.id)) return;
        notificationCache.current.add(notification.id);

        // Add to notifications list
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Call callback
        optionsRef.current.onNotification?.(notification);
      })
    );

    cleanupFunctions.push(
      socketService.on('system_announcement', (notification: Notification) => {
        if (!isMounted.current) return;
        
        setNotifications(prev => [notification, ...prev]);
        optionsRef.current.onSystemAnnouncement?.(notification);
      })
    );

    cleanupFunctions.push(
      socketService.on('notification_count', (data: { unread: number }) => {
        if (isMounted.current) {
          setUnreadCount(data.unread);
        }
      })
    );

    cleanupFunctions.push(
      socketService.on('notification_read', (data: { notificationId: string }) => {
        if (isMounted.current) {
          setNotifications(prev => 
            prev.map(n => 
              n.id === data.notificationId ? { ...n, isRead: true, read: true } : n
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      })
    );

    cleanupFunctions.push(
      socketService.on('all_notifications_read', () => {
        if (isMounted.current) {
          setNotifications(prev => 
            prev.map(n => ({ ...n, isRead: true, read: true }))
          );
          setUnreadCount(0);
        }
      })
    );

    // Online users events
    cleanupFunctions.push(
      socketService.on('users:online:list', (users: OnlineUser[]) => {
        if (isMounted.current) {
          console.log('👥 Online users list received:', users.length);
          setOnlineUsers(users);
          optionsRef.current.onOnlineUsersChange?.(users);
        }
      })
    );

    cleanupFunctions.push(
      socketService.on('user:online', (data: any) => {
        if (isMounted.current) {
          console.log('🟢 User online:', data.userId);
          setOnlineUsers(prev => {
            const exists = prev.some(u => u.userId === data.userId);
            if (!exists) {
              return [...prev, {
                userId: data.userId,
                firstName: data.firstName,
                lastName: data.lastName,
                userPic: data.userPic,
                userType: data.userType,
                lastSeen: data.lastSeen,
              }];
            }
            return prev.map(u => 
              u.userId === data.userId 
                ? { ...u, online: true, lastSeen: data.lastSeen }
                : u
            );
          });
          optionsRef.current.onUserOnline?.(data);
        }
      })
    );

    cleanupFunctions.push(
      socketService.on('user:offline', (data: any) => {
        if (isMounted.current) {
          console.log('🔴 User offline:', data.userId);
          setOnlineUsers(prev => 
            prev.map(u => 
              u.userId === data.userId 
                ? { ...u, online: false, lastSeen: data.lastSeen }
                : u
            )
          );
          optionsRef.current.onUserOffline?.(data);
        }
      })
    );

    // Sync state with socket service every second
    const syncInterval = setInterval(() => {
      if (isMounted.current) {
        const connected = socketService.isConnected();
        if (connected !== isConnected) {
          console.log('🔄 Syncing connection state from interval:', connected, 'current:', isConnected);
          setIsConnected(connected);
        }
      }
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(syncInterval);
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [isConnected]);

  // Connect socket when organizationId is available and autoConnect is true
  useEffect(() => {
    if (options.autoConnect && options.organizationId && !connectionAttempted) {
      console.log(`🏢 Organization ID available: ${options.organizationId}, connecting socket...`);
      connectSocket();
    }
  }, [options.organizationId, options.autoConnect, connectSocket, connectionAttempted]);

  // ========== PUBLIC METHODS ==========

  // Mark a single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        console.error('NEXT_PUBLIC_API_URL is not defined');
        return;
      }
      const res = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (res.ok) {
        if (isMounted.current) {
          setNotifications(prev => 
            prev.map(n => 
              n.id === notificationId ? { ...n, isRead: true, read: true } : n
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        // Also notify via socket
        socketService.markNotificationRead(notificationId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        console.error('NEXT_PUBLIC_API_URL is not defined');
        return;
      }
      const res = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (res.ok) {
        if (isMounted.current) {
          setNotifications(prev => 
            prev.map(n => ({ ...n, isRead: true, read: true }))
          );
          setUnreadCount(0);
        }
        
        // Also notify via socket
        socketService.markAllNotificationsRead();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }, []);

  // Clear all notifications (delete)
  const clearAll = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        console.error('NEXT_PUBLIC_API_URL is not defined');
        return;
      }
      const res = await fetch(`${API_URL}/api/notifications/clear-all`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (res.ok) {
        if (isMounted.current) {
          setNotifications([]);
          setUnreadCount(0);
          notificationCache.current.clear();
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return false;
    }
  }, []);

  // Delete a single notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        console.error('NEXT_PUBLIC_API_URL is not defined');
        return;
      }
      const res = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (res.ok) {
        if (isMounted.current) {
          const notif = notifications.find(n => n.id === notificationId);
          setNotifications(prev => prev.filter(n => n.id !== notificationId));
          if (notif && !notif.isRead && !notif.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }, [notifications]);

  // Archive a notification
  const archiveNotification = useCallback(async (notificationId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        console.error('NEXT_PUBLIC_API_URL is not defined');
        return;
      }
      const res = await fetch(`${API_URL}/api/notifications/${notificationId}/archive`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (res.ok) {
        if (isMounted.current) {
          setNotifications(prev => 
            prev.map(n => 
              n.id === notificationId ? { ...n, isRead: true, read: true } : n
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error archiving notification:', error);
      return false;
    }
  }, []);

  // Refresh notifications
  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchAllNotifications();
    await fetchUnreadNotifications();
    setLoading(false);
  }, [fetchAllNotifications, fetchUnreadNotifications]);

  // Get notification stats
  const getStats = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        console.error('NEXT_PUBLIC_API_URL is not defined');
        return;
      }
      const res = await fetch(`${API_URL}/api/notifications/stats`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) throw new Error('Failed to fetch stats');
      
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  }, []);

  // Get unread count
  const getUnreadCount = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        console.error('NEXT_PUBLIC_API_URL is not defined');
        return;
      }
      const res = await fetch(`${API_URL}/api/notifications/unread-count`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) throw new Error('Failed to fetch unread count');
      
      const data = await res.json();
      if (data.success && isMounted.current) {
        setUnreadCount(data.data?.totalUnread || 0);
        return data.data?.totalUnread || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }, []);

  return {
    // State
    notifications,
    unreadCount,
    onlineUsers,
    isConnected,
    isAuthenticated,
    loading,
    connectionAttempted,
    
    // Methods
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    archiveNotification,
    refresh,
    getStats,
    getUnreadCount,
    
    // Socket methods
    connect: connectSocket,
    disconnect: disconnectSocket,
    joinOrganization: socketService.joinOrganization.bind(socketService),
    joinCourse: socketService.joinCourse.bind(socketService),
    joinGroup: socketService.joinGroup.bind(socketService),
    sendPrivateMessage: socketService.sendPrivateMessage.bind(socketService),
    getOnlineUsers: socketService.getOnlineUsers.bind(socketService),
    getUserStatus: socketService.getUserStatus.bind(socketService),
  };
}