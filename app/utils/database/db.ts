// db.ts - Complete with Cross-Tab Device Sync
import Dexie, { Table } from "dexie";

export interface Course {
  id: string;
  course_title: string;
  course_short_description: string;
  course_description: string;
  course_level: string;
  course_image: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdUserId: string;
  organizationName: string | null;
  organizationId: string | null;
  point: number;
  progressId: string | null;
  savedCoursesId: string | null;
  module: any[];
}

export interface TranslationCache {
  id?: number;
  text: string;
  language: string;
  languageCode: string;
  translatedText: string;
  timestamp: number;
}

export interface StoreLanguage {
  id?: string;
  language: string;
  languageCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId?: string;
  first_name?: string;
  last_name?: string;
  email_address?: string;
  userType?: string;
  role?: string;
  organizationId?: string | null;
  updatedAt: string;
}

export interface DeviceInfo {
  id: string;
  deviceId: string;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId?: string;
  first_name?: string;
  last_name?: string;
  email_address?: string;
  userType?: string;
  role?: string;
  organizationId?: string | null;
  organizationName?: string;      // ✅ added
  isProfileComplete?: boolean;    // ✅ added
  level?: string;                 // ✅ added
  adminRole?: string;             // ✅ added
  updatedAt: string;
}

export interface SessionState {
  id: string;
  isAuthenticated: boolean;
  lastActivity: string;
  tabId: string;
}

export interface OtpSession {
  id: string;
  token: string;
  updatedAt: string;
}

export interface AuthTokens {
  id: string;
  accessToken?: string;
  refreshToken?: string;
  updatedAt: string;
}

export class AppDatabase extends Dexie {
  courses!: Table<Course, string>;
  translations!: Table<TranslationCache, number>;
  languages!: Table<StoreLanguage, string>;
  userProfile!: Table<UserProfile, string>;
  deviceInfo!: Table<DeviceInfo, string>;
  sessionState!: Table<SessionState, string>;
  otpSession!: Table<OtpSession, string>;
  authTokens!: Table<AuthTokens, string>;
  constructor() {
    super("AppDatabase");

    this.version(1).stores({
      courses: "id, course_title, course_level, createdAt, updatedAt",
      translations: "++id, text, language, languageCode, timestamp",
      languages: "id, language, languageCode, createdAt, updatedAt",
    });

    this.version(2).stores({
      courses: "id, course_title, course_level, createdAt, updatedAt",
      translations: "++id, text, language, languageCode, timestamp",
      languages: "id, language, languageCode, createdAt, updatedAt",
      userProfile: "id",
      otpSession: "id",
    });

    this.version(3).stores({
      courses: "id, course_title, course_level, createdAt, updatedAt",
      translations: "++id, text, language, languageCode, timestamp",
      languages: "id, language, languageCode, createdAt, updatedAt",
      userProfile: "id",
      deviceInfo: "id",
      sessionState: "id",
      otpSession: "id",
    });

    this.version(4).stores({
      courses: "id, course_title, course_level, createdAt, updatedAt",
      translations: "++id, text, language, languageCode, timestamp",
      languages: "id, language, languageCode, createdAt, updatedAt",
      userProfile: "id",
      deviceInfo: "id",
      sessionState: "id",
      otpSession: "id",
      authTokens: "id",
    });
  }
}

export const db = new AppDatabase();

// Constants
const CURRENT_PROFILE_ID = "current";
const CURRENT_DEVICE_ID = "current";
const CURRENT_SESSION_ID = "current";
const CURRENT_OTP_SESSION_ID = "current";

// ==================== User Profile Functions ====================
export async function saveUserProfile(
  profile: Partial<Pick<UserProfile,
    "userId" | "first_name" | "last_name" | "email_address" |
    "userType" | "role" | "organizationId" | "organizationName" |
    "isProfileComplete" | "level" | "adminRole"
  >>,
): Promise<void> {
  const existing = await db.userProfile.get(CURRENT_PROFILE_ID);
  await db.userProfile.put({
    id: CURRENT_PROFILE_ID,
    userId: existing?.userId || profile.userId,
    first_name: existing?.first_name || profile.first_name,
    last_name: existing?.last_name || profile.last_name,
    email_address: existing?.email_address || profile.email_address,
    userType: profile.userType ?? existing?.userType,
    role: profile.role ?? existing?.role,
    organizationId: profile.organizationId !== undefined ? profile.organizationId : existing?.organizationId,
    organizationName: profile.organizationName ?? existing?.organizationName,
    isProfileComplete: profile.isProfileComplete !== undefined ? profile.isProfileComplete : existing?.isProfileComplete,
    level: profile.level ?? existing?.level,
    adminRole: profile.adminRole ?? existing?.adminRole,
    updatedAt: new Date().toISOString(),
  });
}

export async function getUserProfile(): Promise<UserProfile | undefined> {
  return db.userProfile.get(CURRENT_PROFILE_ID);
}

export async function clearUserProfile(): Promise<void> {
  await db.userProfile.delete(CURRENT_PROFILE_ID);
}

// ==================== Device Management ====================
export function generateDeviceId(): string {
  const fingerprint = [
    navigator.userAgent,
    navigator.platform,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ].join("|");

  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return `device_${Math.abs(hash)}_${Date.now().toString(36)}`;
}

export async function getOrCreateDeviceId(): Promise<string> {
  // Dexie/IndexedDB is the single source of truth for deviceId — it's
  // genuinely per-device and persists reliably, unlike a cross-domain
  // cookie which browsers like Safari/Firefox/Brave frequently block or
  // expire for SameSite=None cookies set from a different origin.
  let deviceInfo = await db.deviceInfo.get(CURRENT_DEVICE_ID);

  if (!deviceInfo) {
    const newDeviceId = generateDeviceId();
    deviceInfo = {
      id: CURRENT_DEVICE_ID,
      deviceId: newDeviceId,
      fingerprint: navigator.userAgent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.deviceInfo.put(deviceInfo);
  }

  return deviceInfo.deviceId;
}

// ✅ Helper: Get cookie
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

// ✅ Helper: Set cookie
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

// ✅ Force sync device ID across tabs (call this when a tab loads)
export async function syncDeviceIdAcrossTabs(): Promise<void> {
  const deviceId = await getOrCreateDeviceId();

  // Broadcast to other tabs
  if (typeof window !== "undefined") {
    try {
      const channel = new BroadcastChannel("device_sync");
      channel.postMessage({
        type: "DEVICE_ID_SYNC",
        deviceId: deviceId,
        timestamp: Date.now(),
      });
      channel.close();
    } catch (e) {
      // BroadcastChannel not supported - cookies will handle it
    }
  }
}

export function setupDeviceIdSync(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;

  try {
    const channel = new BroadcastChannel("device_sync");

    channel.onmessage = async (event) => {
      if (event.data.type === "DEVICE_ID_SYNC") {
        const newDeviceId = event.data.deviceId;
        const currentDeviceId = await getOrCreateDeviceId();

        if (currentDeviceId !== newDeviceId) {
          console.log("🔄 Syncing device ID from another tab:", newDeviceId);

          await db.deviceInfo.put({
            id: CURRENT_DEVICE_ID,
            deviceId: newDeviceId,
            fingerprint: navigator.userAgent,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          // ❌ removed: setCookie('deviceId', newDeviceId, 365);
        }
      }
    };

    return channel;
  } catch (e) {
    console.warn("BroadcastChannel not supported");
    return null;
  }
}
export async function getDeviceInfo(): Promise<DeviceInfo | undefined> {
  return db.deviceInfo.get(CURRENT_DEVICE_ID);
}

// ==================== Session State ====================
export async function getOrCreateSessionState(): Promise<SessionState> {
  let session = await db.sessionState.get(CURRENT_SESSION_ID);

  if (!session) {
    const tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    session = {
      id: CURRENT_SESSION_ID,
      isAuthenticated: false,
      lastActivity: new Date().toISOString(),
      tabId: tabId,
    };
    await db.sessionState.put(session);
  }

  return session;
}

export async function updateSessionState(
  updates: Partial<Omit<SessionState, "id">>,
): Promise<void> {
  const existing = await db.sessionState.get(CURRENT_SESSION_ID);

  if (!existing) {
    const newSession: SessionState = {
      id: CURRENT_SESSION_ID,
      isAuthenticated: updates.isAuthenticated ?? false,
      lastActivity: updates.lastActivity ?? new Date().toISOString(),
      tabId:
        updates.tabId ??
        `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    await db.sessionState.put(newSession);
    return;
  }

  const updatedSession: SessionState = {
    id: CURRENT_SESSION_ID,
    isAuthenticated:
      updates.isAuthenticated !== undefined
        ? updates.isAuthenticated
        : existing.isAuthenticated,
    lastActivity:
      updates.lastActivity !== undefined
        ? updates.lastActivity
        : existing.lastActivity,
    tabId: updates.tabId !== undefined ? updates.tabId : existing.tabId,
  };

  await db.sessionState.put(updatedSession);
}

export async function getSessionState(): Promise<SessionState | undefined> {
  return db.sessionState.get(CURRENT_SESSION_ID);
}

export async function clearSessionState(): Promise<void> {
  await db.sessionState.delete(CURRENT_SESSION_ID);
}

// ==================== OTP Functions ====================
export async function saveOtpToken(token: string): Promise<void> {
  await db.otpSession.put({
    id: CURRENT_OTP_SESSION_ID,
    token,
    updatedAt: new Date().toISOString(),
  });
}

export async function getOtpToken(): Promise<string | undefined> {
  const session = await db.otpSession.get(CURRENT_OTP_SESSION_ID);
  return session?.token;
}

export async function clearOtpToken(): Promise<void> {
  await db.otpSession.delete(CURRENT_OTP_SESSION_ID);
}

// ==================== Cross-Tab Communication ====================
export function setupCrossTabSync() {
  if (typeof window === "undefined") {
    return { close: () => {} } as BroadcastChannel;
  }

  const channel = new BroadcastChannel("auth_events");

  channel.onmessage = async (event) => {
    if (event.data.type === "LOGIN_SUCCESS") {
      await updateSessionState({
        isAuthenticated: true,
        lastActivity: new Date().toISOString(),
      });
      if (event.data.userProfile) {
        await saveUserProfile(event.data.userProfile);
      }
      // Also sync device ID
      await syncDeviceIdAcrossTabs();
    }

    if (event.data.type === "LOGOUT") {
      await clearSessionState();
      await clearUserProfile();
      window.location.href = "";
    }

    if (event.data.type === "TAB_ACTIVITY") {
      await updateSessionState({
        lastActivity: new Date().toISOString(),
      });
    }
  };

  return channel;
}

export async function broadcastLogin(
  userProfile: Partial<UserProfile>,
): Promise<void> {
  if (typeof window === "undefined") return;

  const channel = new BroadcastChannel("auth_events");
  channel.postMessage({
    type: "LOGIN_SUCCESS",
    userProfile: userProfile,
    timestamp: new Date().toISOString(),
  });
  channel.close();
}

export async function broadcastLogout(): Promise<void> {
  if (typeof window === "undefined") return;

  const channel = new BroadcastChannel("auth_events");
  channel.postMessage({
    type: "LOGOUT",
    timestamp: new Date().toISOString(),
  });
  channel.close();
}

// ==================== Helper to clear all data ====================
export async function clearAllData(): Promise<void> {
  await Promise.all([
    clearUserProfile(),
    clearSessionState(),
    clearOtpToken(),
    clearAuthTokens(),
  ]);
}

const CURRENT_TOKENS_ID = "current";

export async function saveAuthTokens(tokens: {
  accessToken?: string;
  refreshToken?: string;
}): Promise<void> {
  const existing = await db.authTokens.get(CURRENT_TOKENS_ID);
  await db.authTokens.put({
    id: CURRENT_TOKENS_ID,
    accessToken: tokens.accessToken ?? existing?.accessToken,
    refreshToken: tokens.refreshToken ?? existing?.refreshToken,
    updatedAt: new Date().toISOString(),
  });
}

export async function getAuthTokens(): Promise<AuthTokens | undefined> {
  return db.authTokens.get(CURRENT_TOKENS_ID);
}

export async function clearAuthTokens(): Promise<void> {
  await db.authTokens.delete(CURRENT_TOKENS_ID);
}
