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
      setSuccessMessage(
        res.message ||
          "If a Track Leader account exists for this email, a password reset link has been dispatched."
      );
    } catch (err: any) {
      setErrorMessage(
        err.message || "Unable to process password recovery request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      portalType="track-leader"
      backHref="/track-leader/login"
      backLabel="Back to Login"
    >
      <AuthCard
        category="RECOVERY // CREDENTIALS"
        badge="PASSWORD RESET"
        title="Forgot Password?"
        description="Enter your registered Track Leader email address and we will dispatch a secure recovery link."
        footer={
          <div className="flex items-center justify-between gap-3 text-xs font-space text-slate-500">
            <span>Remembered your password?</span>
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

            <div className="p-4 border border-white/10 bg-white/[0.02] font-space text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-200">Security Guidance:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Please check both your inbox and spam folder.</li>
                <li>The recovery link remains active for exactly 30 minutes.</li>
                <li>Single-use cryptographic token security is enforced.</li>
              </ul>
            </div>

            <Link
              href="/track-leader/login"
              className="min-h-[48px] w-full flex items-center justify-center gap-2 border border-circuit/60 bg-circuit px-5 font-space text-sm font-semibold text-[#04100f] transition-all duration-200 hover:bg-cyan-200 hover:shadow-lg hover:shadow-circuit/20"
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
