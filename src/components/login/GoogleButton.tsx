"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { loginWithGoogle } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import type { AuthError } from "@/types/auth";
import type { Session } from "@/types/auth";

export default function GoogleButton() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    const result = await loginWithGoogle();
    setIsLoading(false);
    if (!result.success) { setError(result.error); return; }

    const session: Session = {
      user: result.data.user,
      token: `google_mock_${Math.random().toString(36).slice(2)}`,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    };
    login(session);
  };

  return (
    <div className="space-y-3">
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
        <Button variant="ghost" onClick={handleGoogleLogin} isLoading={isLoading}>
          <span className="flex items-center gap-3">
            <GoogleIcon />
            <span>Continue with Google</span>
          </span>
        </Button>
      </motion.div>
      <ErrorBanner error={error} />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" />
    </svg>
  );
}
