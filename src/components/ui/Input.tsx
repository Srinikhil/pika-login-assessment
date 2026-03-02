"use client";

import React, { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  id: string;
  prefix?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, prefix, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-mono uppercase tracking-widest text-[var(--color-muted)] mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[var(--color-muted)] font-mono text-sm">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={!!error}
            className={[
              "w-full bg-[var(--color-surface)] border font-mono text-sm",
              "text-[var(--color-text)] placeholder:text-[var(--color-muted)]",
              "rounded-lg px-4 py-3 outline-none transition-all duration-200",
              "focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:border-[var(--color-brand)]",
              error
                ? "border-[var(--color-error)]"
                : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]",
              prefix ? "pl-16" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />
        </div>
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key={error}
              id={`${id}-error`}
              role="alert"
              aria-live="polite"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="mt-1.5 text-xs font-mono text-[var(--color-error)]"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
