"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhoneFlow from "./PhoneFlow";
import EmailFlow from "./EmailFlow";
import GoogleButton from "./GoogleButton";
import DevHints from "./DevHints";
import type { LoginMethod } from "@/types/auth";

const HEADLINES = [
  "What if you could get a new nose without the surgery?",
  "What if you could be in two places at once?",
  "What if you could speak every language fluently?",
  "What if your past self could see you now?",
  "What if you could start over, differently?",
];

type ActiveMethod = LoginMethod | null;

export default function LoginScreen() {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [activeMethod, setActiveMethod] = useState<ActiveMethod>(null);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const current = HEADLINES[headlineIndex];
    let i = 0;
    setDisplayedText("");
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      if (i < current.length) {
        setDisplayedText(current.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        const pause = setTimeout(() => {
          setHeadlineIndex((prev) => (prev + 1) % HEADLINES.length);
        }, 3500);
        return () => clearTimeout(pause);
      }
    }, 38);

    return () => clearInterval(typeInterval);
  }, [headlineIndex]);

  const selectMethod = (method: LoginMethod) => {
    setActiveMethod((prev) => (prev === method ? null : method));
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <BackgroundGrid />
      <DevHints />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">
        <Logo />

        <div className="text-center min-h-[6rem] flex items-center">
          <h1 className="font-mono text-[var(--color-brand)] text-xl sm:text-2xl font-bold tracking-wider uppercase leading-tight">
            {displayedText}
            <motion.span
              animate={{ opacity: isTyping ? 1 : [1, 0, 1] }}
              transition={isTyping ? {} : { repeat: Infinity, duration: 0.9 }}
              className="inline-block w-0.5 h-5 bg-[var(--color-brand)] ml-1 align-middle"
            />
          </h1>
        </div>

        <div className="w-full space-y-3">
          <AnimatePresence mode="wait">
            {!activeMethod && (
              <motion.div
                key="method-select"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <GoogleButton />
                <Divider />
                <MethodButton
                  label="Continue with Phone"
                  icon="📱"
                  onClick={() => selectMethod("phone")}
                />
                <MethodButton
                  label="Continue with Email"
                  icon="✉️"
                  onClick={() => selectMethod("email")}
                />
              </motion.div>
            )}

            {activeMethod === "phone" && (
              <motion.div
                key="phone-flow"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <BackButton onClick={() => setActiveMethod(null)} />
                <PhoneFlow />
              </motion.div>
            )}

            {activeMethod === "email" && (
              <motion.div
                key="email-flow"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <BackButton onClick={() => setActiveMethod(null)} />
                <EmailFlow />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-[10px] font-mono text-[var(--color-muted)] text-center">
          By continuing, you agree to Pika&apos;s{" "}
          <span className="underline cursor-pointer hover:text-[var(--color-text)]">Terms</span>{" "}
          &amp;{" "}
          <span className="underline cursor-pointer hover:text-[var(--color-text)]">Privacy</span>
          .
        </p>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-md bg-[var(--color-brand)]/20 border border-[var(--color-brand)]/40 flex items-center justify-center">
        <span className="text-[var(--color-brand)] text-sm">☁</span>
      </div>
      <span className="font-mono text-[var(--color-text)] font-bold tracking-widest text-sm uppercase">
        Pika
      </span>
      <span className="text-[9px] font-mono bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted)] px-1.5 py-0.5 rounded uppercase tracking-widest">
        Beta
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-[var(--color-border)]" />
      <span className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-widest">
        or
      </span>
      <div className="flex-1 h-px bg-[var(--color-border)]" />
    </div>
  );
}

function MethodButton({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg font-mono text-sm text-[var(--color-text)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:outline-none"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </motion.button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-mono text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:underline"
    >
      ← All sign-in options
    </button>
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
