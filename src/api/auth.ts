/**
 * Mock Auth API
 *
 * Simulates network latency (300–1200ms) and returns structured typed results.
 *
 * Error trigger cheat-sheet (for README / testing):
 *   email: "timeout@test.com"      → TIMEOUT (client-side)
 *   email: "unverified@test.com"   → 403 Email Not Verified
 *   email: "error@test.com"        → 500 Server Error
 *   phone: "0000000000"            → 500 Server Error
 *   otp:   "000000"                → 401 Invalid Code
 *   Any other valid input          → Success (OTP hint shown in dev console)
 */

import type {
  AuthResult,
  AuthUser,
  Session,
  SendOtpPayload,
  VerifyOtpPayload,
  GoogleLoginResult,
} from "@/types/auth";

const MOCK_OTP = "123456";
const TIMEOUT_MS = 5000;

function randomLatency(): number {
  return Math.floor(Math.random() * 900) + 300;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeToken(): string {
  return `mock_token_${Math.random().toString(36).slice(2)}`;
}

function makeSession(user: AuthUser): Session {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
  return { user, token: makeToken(), expiresAt };
}

export async function sendOtp(
  payload: SendOtpPayload
): Promise<AuthResult<{ sent: boolean }>> {
  const { method, contact } = payload;

  if (method === "email" && contact === "timeout@test.com") {
    await Promise.race([
      delay(TIMEOUT_MS),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS)
      ),
    ]).catch(() => {});
    return {
      success: false,
      error: { code: "TIMEOUT", message: "Request timed out. Please try again." },
    };
  }

  if (method === "email" && contact === "error@test.com") {
    await delay(randomLatency());
    return {
      success: false,
      error: { code: 500, message: "Something went wrong on our end. Please try again." },
    };
  }

  if (method === "phone" && contact === "0000000000") {
    await delay(randomLatency());
    return {
      success: false,
      error: { code: 500, message: "Something went wrong on our end. Please try again." },
    };
  }

  await delay(randomLatency());

  if (process.env.NODE_ENV === "development") {
    console.info(`[mock-auth] OTP for ${contact}: ${MOCK_OTP}`);
  }

  return { success: true, data: { sent: true } };
}

export async function verifyOtp(
  payload: VerifyOtpPayload
): Promise<AuthResult<Session>> {
  const { method, contact, otp } = payload;

  await delay(randomLatency());

  if (otp === "000000") {
    return {
      success: false,
      error: { code: 401, message: "Invalid verification code. Please try again." },
    };
  }

  if (method === "email" && contact === "unverified@test.com") {
    return {
      success: false,
      error: {
        code: 403,
        message: "Email not verified. Please check your inbox for a verification link.",
      },
    };
  }

  if (otp !== MOCK_OTP) {
    return {
      success: false,
      error: { code: 401, message: "Invalid verification code. Please try again." },
    };
  }

  const user: AuthUser = {
    id: `user_${Math.random().toString(36).slice(2)}`,
    name: method === "phone" ? "Phone User" : contact.split("@")[0],
    email:
      method === "email"
        ? contact
        : `${contact.slice(-4)}@phone.pika.me`,
    loginMethod: method,
    loginAt: new Date().toISOString(),
  };

  return { success: true, data: makeSession(user) };
}

export async function loginWithGoogle(): Promise<AuthResult<GoogleLoginResult>> {
  await delay(randomLatency());

  const user: AuthUser = {
    id: "google_user_001",
    name: "Google User",
    email: "user@gmail.com",
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=GU&backgroundColor=1a1a1a&textColor=4ade80`,
    loginMethod: "google",
    loginAt: new Date().toISOString(),
  };

  return { success: true, data: { user } };
}

export async function logout(): Promise<void> {
  await delay(200);
}
