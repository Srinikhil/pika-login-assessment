"use client";

import React, { useRef, useCallback } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
  id?: string;
}

export default function OtpInput({
  value,
  onChange,
  length = 6,
  error = false,
  disabled = false,
  id = "otp",
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focusAt = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  const handleChange = useCallback(
    (index: number, raw: string) => {
      const char = raw.replace(/\D/g, "").slice(-1);
      const next = Array.from({ length }, (_, i) => (i === index ? char : (value[i] ?? "")));
      onChange(next.join("").slice(0, length));
      if (char && index < length - 1) focusAt(index + 1);
    },
    [value, length, onChange, focusAt]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        if (value[index]) {
          const next = Array.from({ length }, (_, i) => (i === index ? "" : (value[i] ?? "")));
          onChange(next.join(""));
        } else if (index > 0) {
          focusAt(index - 1);
          const next = Array.from({ length }, (_, i) => (i === index - 1 ? "" : (value[i] ?? "")));
          onChange(next.join(""));
        }
      }
      if (e.key === "ArrowLeft" && index > 0) focusAt(index - 1);
      if (e.key === "ArrowRight" && index < length - 1) focusAt(index + 1);
    },
    [value, length, onChange, focusAt]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      onChange(pasted);
      const focusIndex = Math.min(pasted.length, length - 1);
      focusAt(focusIndex);
    },
    [length, onChange, focusAt]
  );

  return (
    <div
      role="group"
      aria-label="Verification code"
      className="flex gap-2 justify-center"
      onPaste={handlePaste}
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          id={i === 0 ? id : undefined}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digits[i]}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={error}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={[
            "w-11 h-14 text-center font-mono text-xl font-bold",
            "bg-[var(--color-surface)] border rounded-lg",
            "text-[var(--color-text)] outline-none transition-all duration-150",
            "focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:border-[var(--color-brand)]",
            "disabled:opacity-40",
            error
              ? "border-[var(--color-error)] text-[var(--color-error)]"
              : digits[i]
              ? "border-[var(--color-brand)]"
              : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ))}
    </div>
  );
}
