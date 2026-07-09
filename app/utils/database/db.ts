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

// Single database with multiple tables (recommended approach)
export class AppDatabase extends Dexie {
  courses!: Table<Course, string>;
  translations!: Table<TranslationCache, number>;
  languages!: Table<StoreLanguage, string>; // Added languages table

  constructor() {
    super("AppDatabase");
    this.version(1).stores({
      courses: "id, course_title, course_level, createdAt, updatedAt",
      translations: "++id, text, language, languageCode, timestamp",
      languages: "id, language, languageCode, createdAt, updatedAt", // Added languages store
    });
  }
}

// Create a single instance
export const db = new AppDatabase();

// For backward compatibility
export const Coursedb = db;
export const LanguageDb = db; // Now both point to the same instance