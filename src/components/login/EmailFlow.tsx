"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Input from "@/components/ui/Input";
import OtpInput from "@/components/ui/OtpInput";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { sendOtp, verifyOtp } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import type { AuthError, LoginFlowStep } from "@/types/auth";

const slideVariants = {
  enter: { x: 20, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailFlow() {
  const { login } = useAuth();
  const [step, setStep] = useState<LoginFlowStep>("contact");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [emailError, setEmailError] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Email address is required.";
    if (!EMAIL_REGEX.test(value)) return "Enter a valid email address.";
    return "";
  };

  const handleSendOtp = useCallback(async () => {
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setEmailError("");
    setError(null);
    setIsLoading(true);
    const result = await sendOtp({ method: "email", contact: email });
    setIsLoading(false);
    if (!result.success) { setError(result.error); return; }
    setStep("otp");
  }, [email]);

  const handleVerifyOtp = useCallback(async () => {
    if (otp.length < 6) return;
    setError(null);
    setIsLoading(true);
    const result = await verifyOtp({ method: "email", contact: email, otp });
    setIsLoading(false);
    if (!result.success) { setError(result.error); setOtp(""); return; }
    login(result.data);
  }, [otp, email, login]);

  useEffect(() => {
    if (otp.length === 6) handleVerifyOtp();
  }, [otp, handleVerifyOtp]);

  return (
    <div className="w-full space-y-4">
      <AnimatePresence mode="wait">
        {step === "contact" && (
          <motion.div
            key="email-contact"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <Input
              ref={emailRef}
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              error={emailError}
              autoComplete="email"
            />
            <ErrorBanner error={error} />
            <Button onClick={handleSendOtp} isLoading={isLoading}>
              Send Code →
            </Button>
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div
            key="email-otp"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <p className="text-xs font-mono text-[var(--color-muted)] text-center">
              Code sent to{" "}
              <span className="text-[var(--color-brand)]">{email}</span>
            </p>
            <OtpInput
              id="email-otp"
              value={otp}
              onChange={setOtp}
              error={!!error}
              disabled={isLoading}
            />
            <ErrorBanner error={error} />
            <Button onClick={handleVerifyOtp} isLoading={isLoading} disabled={otp.length < 6}>
              Verify →
            </Button>
            <button
              type="button"
              onClick={() => { setStep("contact"); setError(null); setOtp(""); }}
              className="w-full text-xs font-mono text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors focus-visible:outline-none focus-visible:underline"
            >
              ← Change email
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
