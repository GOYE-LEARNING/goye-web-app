// db.ts
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

// Signed-in user's identity (database id, name, email). Access/refresh
// tokens never live here or anywhere client-side — the backend issues them
// as httpOnly cookies, so the browser JS layer can't read them at all.
export interface UserProfile {
  id: string; // Dexie's own key, fixed "current" — one record for whoever is signed in
  userId?: string; // the actual User.id from the backend, NOT this record's key
  first_name?: string;
  last_name?: string;
  email_address?: string;
  updatedAt: string;
}

// Short-lived OTP verification session (invite-accept flow).
export interface OtpSession {
  id: string; // fixed "current"
  token: string;
  updatedAt: string;
}

// Single database with multiple tables (recommended approach)
export class AppDatabase extends Dexie {
  courses!: Table<Course, string>;
  translations!: Table<TranslationCache, number>;
  languages!: Table<StoreLanguage, string>; // Added languages table
  userProfile!: Table<UserProfile, string>;
  otpSession!: Table<OtpSession, string>;

  constructor() {
    super("AppDatabase");
    this.version(1).stores({
      courses: "id, course_title, course_level, createdAt, updatedAt",
      translations: "++id, text, language, languageCode, timestamp",
      languages: "id, language, languageCode, createdAt, updatedAt", // Added languages store
    });
    this.version(2).stores({
      courses: "id, course_title, course_level, createdAt, updatedAt",
      translations: "++id, text, language, languageCode, timestamp",
      languages: "id, language, languageCode, createdAt, updatedAt",
      userProfile: "id",
      otpSession: "id",
    });
  }
}

// Create a single instance
export const db = new AppDatabase();

// For backward compatibility
export const Coursedb = db;
export const LanguageDb = db; // Now both point to the same instance

const CURRENT_PROFILE_ID = "current";
const CURRENT_OTP_SESSION_ID = "current";

// Merges into the existing record so a caller that only has first/last name
// (e.g. the profile-edit form) doesn't clobber the email saved at login.
export async function saveUserProfile(
  profile: Partial<Pick<UserProfile, "userId" | "first_name" | "last_name" | "email_address">>,
): Promise<void> {
  const existing = await db.userProfile.get(CURRENT_PROFILE_ID);
  await db.userProfile.put({
    id: CURRENT_PROFILE_ID,
    ...existing,
    ...profile,
    updatedAt: new Date().toISOString(),
  });
}

export async function getUserProfile(): Promise<UserProfile | undefined> {
  return db.userProfile.get(CURRENT_PROFILE_ID);
}

export async function clearUserProfile(): Promise<void> {
  await db.userProfile.delete(CURRENT_PROFILE_ID);
}

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