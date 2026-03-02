"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import type { AuthUser, Session } from "@/types/auth";
import { logout as apiLogout } from "@/api/auth";

const SESSION_KEY = "pika_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours, matches session expiresAt

function setSessionCookie(session: Session): void {
  document.cookie = [
    `${SESSION_KEY}=${encodeURIComponent(JSON.stringify(session))}`,
    "path=/",
    `max-age=${SESSION_MAX_AGE}`,
    "SameSite=Strict",
  ].join("; ");
}

function clearSessionCookie(): void {
  document.cookie = `${SESSION_KEY}=; path=/; max-age=0`;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;
}

type AuthAction =
  | { type: "HYDRATE"; payload: { user: AuthUser; token: string } | null }
  | { type: "LOGIN"; payload: Session }
  | { type: "LOGOUT" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...state,
        user: action.payload?.user ?? null,
        token: action.payload?.token ?? null,
        isLoading: false,
        isHydrated: true,
      };
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
      };
    default:
      return state;
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (session: Session) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isLoading: true,
    isHydrated: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session: Session = JSON.parse(raw);
        const isExpired = new Date(session.expiresAt) < new Date();
        if (!isExpired) {
          dispatch({ type: "HYDRATE", payload: { user: session.user, token: session.token } });
          return;
        }
        localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    dispatch({ type: "HYDRATE", payload: null });
  }, []);

  const login = useCallback((session: Session) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setSessionCookie(session);
    } catch {
      // storage unavailable — session lives in memory only
    }
    dispatch({ type: "LOGIN", payload: session });
  }, []);

  const logoutHandler = useCallback(async () => {
    await apiLogout();
    localStorage.removeItem(SESSION_KEY);
    clearSessionCookie();
    dispatch({ type: "LOGOUT" });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        isAuthenticated: !!state.user,
        isHydrated: state.isHydrated,
        login,
        logout: logoutHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
