"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import type { LoginMethod } from "@/types/auth";

const METHOD_LABELS: Record<LoginMethod, string> = {
  google: "Google",
  phone: "Phone + OTP",
  email: "Email + OTP",
};

const METHOD_ICONS: Record<LoginMethod, string> = {
  google: "G",
  phone: "📱",
  email: "✉️",
};

export default function AppPage() {
  const { user, isAuthenticated, isHydrated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (!isHydrated || !user) return <LoadingScreen />;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const loginTime = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(user.loginAt));

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <BackgroundGrid />

      <div className="relative z-10 w-full max-w-sm space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center space-y-1"
        >
          <p className="text-xs font-mono text-[var(--color-brand)] uppercase tracking-widest">
            Welcome back
          </p>
          <h1 className="font-mono text-2xl font-bold text-[var(--color-text)] tracking-wide">
            You&apos;re in.
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/30 flex items-center justify-center flex-shrink-0">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="font-mono font-bold text-lg text-[var(--color-brand)]">
                  {initials}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-mono font-bold text-[var(--color-text)] truncate">{user.name}</p>
              <p className="text-xs font-mono text-[var(--color-muted)] truncate">{user.email}</p>
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] pt-4 space-y-3">
            <InfoRow label="Signed in via" value={METHOD_LABELS[user.loginMethod]} icon={METHOD_ICONS[user.loginMethod]} />
            <InfoRow label="Login time" value={loginTime} icon="🕐" />
            <InfoRow label="Session" value="Active" icon="🟢" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 font-mono text-sm text-[var(--color-muted)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--color-error)] focus-visible:outline-none"
          >
            Sign out
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-mono text-[var(--color-muted)] uppercase tracking-widest">
        {label}
      </span>
      <span className="text-xs font-mono text-[var(--color-text)] flex items-center gap-1.5">
        <span>{icon}</span>
        <span>{value}</span>
      </span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--color-brand)]/30 border-t-[var(--color-brand)] rounded-full animate-spin" />
        <span className="text-xs font-mono text-[var(--color-muted)] uppercase tracking-widest">
          Loading…
        </span>
      </div>
    </div>
  );
}

function BackgroundGrid() {
  return (
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, var(--color-brand) 0px, transparent 1px, transparent 28px, var(--color-brand) 29px), repeating-linear-gradient(90deg, var(--color-brand) 0px, transparent 1px, transparent 28px, var(--color-brand) 29px)",
      }}
      aria-hidden="true"
    />
  );
}
