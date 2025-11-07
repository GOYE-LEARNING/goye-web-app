import { supabase, BUCKETS } from "../utils/supabase.js";
export class MediaService {
  static async uploadUserAvatar(
    userId: string,
    file: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<{ url: string; error: string | null }> {
    try {
      const fileTxt = fileName.split(".").pop();
      const filePath = `${userId}/avatar-${Date.now()}.${fileTxt}`;

      const { data, error } = await supabase.storage
        .from(BUCKETS.USER_AVATARS)
        .upload(filePath, file, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        return { url: "", error: error.message };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKETS.USER_AVATARS).getPublicUrl(filePath);
      return { url: publicUrl, error: null };
    } catch (error: any) {
      return { url: "", error: error.message };
    }
  }
}
