/**
 * Repairs identity values left in localStorage by a previous session.
 *
 * Background: "Sign Out" used to be a bare router.push, so it navigated away
 * without clearing anything. The keys below outlived the account that wrote
 * them, and the next person to sign in on the device inherited them — most
 * visibly in the header, which fetched an organisation using a stale
 * `organizationId` and then rendered someone else's name, email and logo.
 *
 * The header no longer trusts these keys, but 28 other read sites across the
 * app still do, `role` alone in 14 places. So this reconciles rather than
 * purges: every key is rewritten from the signed-in profile, which is the
 * authoritative record, and only values with no counterpart there are removed.
 * A blanket wipe would take working state away from all those readers.
 *
 * Safe to run on every load — it is idempotent and derives everything from the
 * profile — but it is gated behind a version key so the one-off repair happens
 * once per browser and costs nothing afterwards.
 */
import { getSessionState, getUserProfile, saveUserProfile } from "./database/db";

/** Keys that describe *who is signed in*, and so must never outlive a session. */
const IDENTITY_KEYS = [
  "organizationId",
  "org_name",
  "org_email",
  "role",
  "userId",
  "userType",
] as const;

/** Bump this to re-run the repair after changing what it does. */
const RECONCILE_VERSION = "1";
const VERSION_KEY = "goye_identity_reconciled";

function remove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* private mode / storage disabled */
  }
}

function write(key: string, value?: string | null) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    /* private mode / storage disabled */
  }
}

export async function reconcileStoredIdentity(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    if (localStorage.getItem(VERSION_KEY) === RECONCILE_VERSION) return;
  } catch {
    // Storage unavailable: nothing stored means nothing to reconcile.
    return;
  }

  try {
    const [session, profile] = await Promise.all([
      getSessionState(),
      getUserProfile(),
    ]);

    if (!session?.isAuthenticated || !profile) {
      // Nobody is signed in, so anything still here belongs to someone who
      // isn't. This is the case that leaked one account's organisation into
      // the next sign-in.
      IDENTITY_KEYS.forEach(remove);
    } else {
      // Repair a profile poisoned by the old login defaults.
      //
      // AuthContext.login used to write `userType: "ORGANIZATION_OWNER"` and
      // `role: "org_admin"` for anyone whose login response carried neither,
      // which covered every ordinary student and tutor. That value is already
      // sitting in IndexedDB on existing devices, and it is what the header
      // reads — so fixing the write path alone would leave those users
      // mislabelled until they next signed in. An account with no
      // organizationId cannot be an organisation owner, which makes this
      // safe to assert rather than guess.
      if (!profile.organizationId) {
        const wasMislabelled =
          profile.userType === "ORGANIZATION_OWNER" ||
          profile.role === "org_admin" ||
          profile.role === "org_owner";

        if (wasMislabelled) {
          // Only the two fields being corrected — saveUserProfile merges with
          // what is already stored, and "" is not nullish so it wins over the
          // existing value rather than being ignored.
          await saveUserProfile({ userType: "", role: "" });
          profile.userType = "";
          profile.role = "";
        }
      }

      write("userId", profile.userId);
      write("role", profile.role);
      write("userType", profile.userType);

      if (profile.organizationId) {
        write("organizationId", profile.organizationId);
        // org_name / org_email are refreshed from the API when the header
        // loads the organisation; leave whatever is cached for this org.
      } else {
        // This account has no organisation, so any org values present came
        // from a different one.
        remove("organizationId");
        remove("org_name");
        remove("org_email");
      }
    }

    localStorage.setItem(VERSION_KEY, RECONCILE_VERSION);
  } catch (error) {
    // Never block app start over a storage repair.
    console.error("[identity] reconcile failed:", error);
  }
}
