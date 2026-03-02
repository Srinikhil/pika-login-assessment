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

export default function PhoneFlow() {
  const { login } = useAuth();
  const [step, setStep] = useState<LoginFlowStep>("contact");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [phoneError, setPhoneError] = useState("");
  const phoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    phoneRef.current?.focus();
  }, []);

  const validatePhone = (value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) return "Phone number is required.";
    if (clean.length < 10) return "Enter a valid 10-digit phone number.";
    return "";
  };

  const handleSendOtp = useCallback(async () => {
    const err = validatePhone(phone);
    if (err) { setPhoneError(err); return; }
    const clean = phone.replace(/\D/g, "");
    setPhoneError("");
    setError(null);
    setIsLoading(true);
    const result = await sendOtp({ method: "phone", contact: clean });
    setIsLoading(false);
    if (!result.success) { setError(result.error); return; }
    setStep("otp");
  }, [phone]);

  const handleVerifyOtp = useCallback(async () => {
    if (otp.length < 6) return;
    setError(null);
    setIsLoading(true);
    const result = await verifyOtp({ method: "phone", contact: phone.replace(/\D/g, ""), otp });
    setIsLoading(false);
    if (!result.success) { setError(result.error); setOtp(""); return; }
    login(result.data);
  }, [otp, phone, login]);

  useEffect(() => {
    if (otp.length === 6) handleVerifyOtp();
  }, [otp, handleVerifyOtp]);

  return (
    <div className="w-full space-y-4">
      <AnimatePresence mode="wait">
        {step === "contact" && (
          <motion.div
            key="phone-contact"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <Input
              ref={phoneRef}
              id="phone"
              type="tel"
              label="Phone number"
              placeholder="(555) 000-0000"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              error={phoneError}
              prefix={<span className="text-xs">🇺🇸 +1</span>}
              autoComplete="tel"
            />
            <ErrorBanner error={error} />
            <Button onClick={handleSendOtp} isLoading={isLoading}>
              Send Code →
            </Button>
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div
            key="phone-otp"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <p className="text-xs font-mono text-[var(--color-muted)] text-center">
              Code sent to{" "}
              <span className="text-[var(--color-brand)]">+1 {phone}</span>
            </p>
            <OtpInput
              id="phone-otp"
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
              ← Change number
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
