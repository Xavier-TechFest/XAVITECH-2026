"use client";

import React, { useState } from "react";
import Link from "next/link";
import { trackLeaderForgotPassword } from "@/lib/api";
import { AuthShell, AuthCard, AuthField, AuthButton, AuthAlert } from "@/components/auth";

export default function TrackLeaderForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your registered Track Leader email address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await trackLeaderForgotPassword(cleanEmail);
      const safeSuccess =
        (res && typeof res.message === "string" && res.message) ||
        (res && typeof res.data?.message === "string" && res.data.message) ||
        "If a Track Leader account exists for this email, a password reset link has been dispatched.";
      setSuccessMessage(safeSuccess);
    } catch (err: any) {
      const fallbackMsg = "Unable to process password recovery request. Please try again.";
      const safeError =
        (err && typeof err.message === "string" && err.message) ||
        (err?.data && typeof err.data.message === "string" && err.data.message) ||
        (err?.data?.error && typeof err.data.error.message === "string" && err.data.error.message) ||
        (err?.data && typeof err.data.error === "string" && err.data.error) ||
        fallbackMsg;
      setErrorMessage(safeError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      portalType="track-leader"
      backHref="/track-leader/login"
      backLabel="Back to Login"
      technicalMeta={[
        { label: "RECOVERY", value: "CRYPTO RESET TOKEN" },
        { label: "EXPIRY", value: "30 MINUTES STRICT" },
        { label: "SECURITY", value: "ACCOUNT ENUMERATION SAFE" },
      ]}
    >
      <AuthCard
        category="RECOVERY // CREDENTIALS"
        badge="PASSWORD RESET"
        title="Forgot Password?"
        description="Enter your registered Track Leader email address and we will dispatch a secure recovery link."
        footer={
          <div className="flex items-center justify-between gap-3 text-xs font-body text-slate-500">
            <span>Remembered your credentials?</span>
            <Link
              href="/track-leader/login"
              className="font-oxanium text-[10px] font-bold uppercase tracking-wider text-circuit hover:text-cyan-200 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        }
      >
        {successMessage ? (
          <div className="space-y-6">
            <AuthAlert
              type="success"
              message={successMessage}
            />

            <div className="p-4 border border-white/10 bg-white/[0.02] font-body text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-200">Security Guidance:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Please inspect both your inbox and spam folder.</li>
                <li>The recovery link remains active for exactly 30 minutes.</li>
                <li>Single-use cryptographic token security is enforced.</li>
              </ul>
            </div>

            <Link
              href="/track-leader/login"
              className="min-h-12 w-full flex items-center justify-center gap-2 border border-circuit/60 bg-circuit px-5 font-body text-sm font-semibold text-[#04100f] transition-all duration-200 hover:bg-cyan-200 hover:shadow-lg hover:shadow-circuit/20"
            >
              Return to Login →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && <AuthAlert type="error" message={errorMessage} />}

            <AuthField
              id="recovery-email"
              label="Track Leader Email"
              type="email"
              required
              autoComplete="email"
              disabled={isSubmitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="leader@xavitech.org"
              helperText="Enter the official email associated with your track assignment."
            />

            <div className="pt-1">
              <AuthButton
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                loadingText="Dispatching Reset Link..."
              >
                Send Reset Link →
              </AuthButton>
            </div>
          </form>
        )}
      </AuthCard>
    </AuthShell>
  );
}
