export type LoginMethod = "google" | "phone" | "email";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  loginMethod: LoginMethod;
  loginAt: string;
}

export type AuthErrorCode = 401 | 403 | 500 | "TIMEOUT" | "VALIDATION";

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

export type AuthResult<T> =
  | { success: true; data: T }
  | { success: false; error: AuthError };

export interface SendOtpPayload {
  method: "phone" | "email";
  contact: string;
}

export interface VerifyOtpPayload {
  method: "phone" | "email";
  contact: string;
  otp: string;
}

export interface GoogleLoginResult {
  user: AuthUser;
}

export interface Session {
  user: AuthUser;
  token: string;
  expiresAt: string;
}

export type LoginFlowStep = "idle" | "contact" | "otp" | "success" | "error";
