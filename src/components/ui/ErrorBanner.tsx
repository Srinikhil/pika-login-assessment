"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { AuthError } from "@/types/auth";

interface ErrorBannerProps {
  error: AuthError | null;
  id?: string;
}

const errorLabels: Record<number | string, string> = {
  401: "Authentication failed",
  403: "Access denied",
  500: "Server error",
  TIMEOUT: "Connection timeout",
  VALIDATION: "Validation error",
};

export default function ErrorBanner({ error, id = "auth-error" }: ErrorBannerProps) {
  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          key={error.message}
          id={id}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="w-full px-4 py-3 rounded-lg border border-[var(--color-error)]/40 bg-[var(--color-error)]/10 text-[var(--color-error)] font-mono text-sm"
        >
          <span className="opacity-60 text-xs uppercase tracking-widest block mb-0.5">
            {errorLabels[error.code] ?? "Error"}
          </span>
          {error.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
