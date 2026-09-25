const FLAG_KEY = "goye_otp_verified";

// Marks that the current tab just passed OTP verification, so the
// create-password → welcome → welcome/auth steps can be reached.
export function markOtpVerified() {
  try {
    sessionStorage.setItem(FLAG_KEY, "1");
  } catch {}
}

export function hasVerifiedOtp(): boolean {
  try {
    return sessionStorage.getItem(FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearOtpVerified() {
  try {
    sessionStorage.removeItem(FLAG_KEY);
  } catch {}
}
