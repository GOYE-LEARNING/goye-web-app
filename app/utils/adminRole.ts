// app/utils/adminRole.ts
import {
  getUserProfile,
  saveUserProfile,
  getAuthTokens,
  getOrCreateDeviceId,
} from "@/app/utils/database/db";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * The signed-in admin's role ("super_admin" | "content_admin" | "user_admin"),
 * or null if it can't be determined.
 *
 * Reads the local profile first. If `adminRole` isn't saved there (older
 * sessions, or a login path that didn't pass it through), it asks the backend
 * once and saves the answer so later calls are instant.
 */
export async function resolveAdminRole(): Promise<string | null> {
  const profile: any = await getUserProfile();
  if (!profile) return null;
  if (profile.adminRole) return profile.adminRole;

  try {
    const [deviceId, tokens] = await Promise.all([
      getOrCreateDeviceId(),
      getAuthTokens(),
    ]);

    const res = await fetch(`${API_URL}/api/user/profile`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Device-Id": deviceId,
        ...(tokens?.accessToken && {
          Authorization: `Bearer ${tokens.accessToken}`,
        }),
      },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const adminRole: string | null = data?.user?.adminRole ?? null;

    if (adminRole) {
      // Spread the existing profile so nothing else is lost by the save.
      try {
        await saveUserProfile({ ...profile, adminRole } as any);
      } catch (e) {
        console.warn("Could not cache adminRole locally:", e);
      }
    }
    return adminRole;
  } catch (e) {
    console.warn("resolveAdminRole failed:", e);
    return null;
  }
}