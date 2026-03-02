"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

type ButtonVariant = "primary" | "ghost" | "icon";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  isLoading = false,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "relative inline-flex items-center justify-center font-mono text-sm rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:opacity-40 disabled:cursor-not-allowed select-none";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "w-full px-4 py-3 bg-[var(--color-brand)] text-[var(--color-bg)] font-semibold tracking-wider uppercase hover:bg-[var(--color-brand-hover)] active:scale-[0.98]",
    ghost:
      "w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] active:scale-[0.98]",
    icon: "w-12 h-12 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] active:scale-[0.95] rounded-full",
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Spinner />
          <span>Please wait…</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-current"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
