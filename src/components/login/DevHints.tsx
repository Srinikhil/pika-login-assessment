"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Hint {
  label: string;
  field: string;
  value: string;
  error: string;
  step: "contact" | "otp";
}

const HINTS: Hint[] = [
  {
    label: "Happy path",
    field: "Any email",
    value: "user@example.com",
    error: "✅ Success — then enter OTP 123456",
    step: "contact",
  },
  {
    label: "401 — Invalid OTP",
    field: "OTP (any email)",
    value: "000000",
    error: "Invalid verification code",
    step: "otp",
  },
  {
    label: "403 — Email not verified",
    field: "Email",
    value: "unverified@test.com",
    error: "Then enter OTP 111111 → Email not verified",
    step: "contact",
  },
  {
    label: "500 — Server error (email)",
    field: "Email",
    value: "error@test.com",
    error: "Something went wrong on our end",
    step: "contact",
  },
  {
    label: "500 — Server error (phone)",
    field: "Phone",
    value: "0000000000",
    error: "Something went wrong on our end",
    step: "contact",
  },
  {
    label: "Timeout — Network timeout",
    field: "Email",
    value: "timeout@test.com",
    error: "Request timed out (~5s)",
    step: "contact",
  },
];

export default function DevHints() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  if (process.env.NODE_ENV !== "development") return null;

  const copyValue = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(value);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-mono text-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-[var(--color-brand)]/30 rounded-full text-[var(--color-brand)] hover:border-[var(--color-brand)] transition-colors"
        aria-expanded={open}
        aria-label="Toggle dev hints panel"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] animate-pulse" />
        DEV
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-10 right-0 w-80 bg-[#111] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
              <span className="text-[var(--color-brand)] font-bold tracking-widest uppercase text-[10px]">
                Error Simulation
              </span>
              <span className="text-[var(--color-muted)] text-[10px]">click value to copy</span>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {HINTS.map((hint) => (
                <div key={hint.label} className="px-4 py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        hint.label.startsWith("Happy")
                          ? "text-[var(--color-brand)] font-bold"
                          : "text-[var(--color-text)]"
                      }
                    >
                      {hint.label}
                    </span>
                    <span className="text-[var(--color-muted)] uppercase tracking-widest text-[9px] border border-[var(--color-border)] px-1.5 py-0.5 rounded">
                      {hint.step}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[var(--color-muted)]">{hint.field}:</span>
                    <button
                      onClick={() => copyValue(hint.value)}
                      className="bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-0.5 rounded hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors font-bold tracking-wide"
                    >
                      {copied === hint.value ? "✓ copied" : hint.value}
                    </button>
                  </div>

                  <p className="text-[var(--color-muted)] text-[10px] leading-relaxed">
                    → {hint.error}
                  </p>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
            <p className="text-[var(--color-muted)] text-[10px] leading-relaxed space-y-1">
              <span className="block">
                Success OTP:{" "}
                <button onClick={() => copyValue("123456")} className="text-[var(--color-brand)] hover:underline">
                  {copied === "123456" ? "✓ copied" : "123456"}
                </button>
              </span>
              <span className="block">
                403 OTP:{" "}
                <button onClick={() => copyValue("111111")} className="text-[var(--color-brand)] hover:underline">
                  {copied === "111111" ? "✓ copied" : "111111"}
                </button>{" "}
                (use with unverified@test.com)
              </span>
              <span className="block opacity-60">Any other OTP → 401.</span>
            </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
