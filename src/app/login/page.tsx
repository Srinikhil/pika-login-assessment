"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoginScreen from "@/components/login/LoginScreen";

export default function LoginPage() {
  const { isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace("/app");
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated) return <LoadingScreen />;

  return <LoginScreen />;
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
