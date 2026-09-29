"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackLeaderResetPassword } from "@/lib/api";
import { AuthShell, AuthCard, AuthField, AuthButton, AuthAlert } from "@/components/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasNoToken = !token.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasNoToken) {
      setErrorMessage("Password reset token is missing. Please request a new link.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await trackLeaderResetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to reset password. The link may be expired or already used."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasNoToken) {
    return (
      <div className="space-y-6">
        <AuthAlert
          type="error"
          message="No valid reset token was detected in your link. The link may have expired, been truncated, or already consumed."
        />
        <div className="p-4 border border-white/10 bg-white/[0.02] font-space text-xs text-slate-400 leading-relaxed">
          For security, single-use tokens expire after 30 minutes. Request a fresh link below.
        </div>
        <Link
          href="/track-leader/forgot-password"
          className="min-h-[48px] w-full flex items-center justify-center gap-2 border border-circuit/60 bg-circuit px-5 font-space text-sm font-semibold text-[#04100f] transition-all duration-200 hover:bg-cyan-200 hover:shadow-lg hover:shadow-circuit/20"
        >
          Request New Reset Link →
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <AuthAlert
          type="success"
          message="Password reset successfully completed. All previous sessions have been terminated for security."
        />
        <div className="p-4 border border-white/10 bg-white/[0.02] font-space text-xs text-slate-400">
          You can now authenticate into the Track Leader portal using your new credentials.
        </div>
        <Link
          href="/track-leader/login"
          className="min-h-[48px] w-full flex items-center justify-center gap-2 border border-circuit/60 bg-circuit px-5 font-space text-sm font-semibold text-[#04100f] transition-all duration-200 hover:bg-cyan-200 hover:shadow-lg hover:shadow-circuit/20"
        >
          Sign In with New Password →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && <AuthAlert type="error" message={errorMessage} />}

      <AuthField
        id="reset-new-password"
        label="New Password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        disabled={isSubmitting}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="At least 8 characters"
        helperText="Create a strong password containing at least 8 characters."
      />

      <AuthField
        id="reset-confirm-password"
        label="Confirm New Password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        disabled={isSubmitting}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Re-enter your new password"
      />

      {/* Password Checklist */}
      <div className="p-3 border border-white/[0.06] bg-white/[0.015] font-space text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-2">
          <span className={newPassword.length >= 8 ? "text-circuit" : "text-slate-600"}>
            {newPassword.length >= 8 ? "✓" : "○"}
          </span>
          <span>Minimum 8 characters</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={
              confirmPassword && newPassword === confirmPassword ? "text-circuit" : "text-slate-600"
            }
          >
            {confirmPassword && newPassword === confirmPassword ? "✓" : "○"}
          </span>
          <span>Both passwords match</span>
        </div>
      </div>

      <div className="pt-1">
        <AuthButton
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          loadingText="Resetting Password..."
        >
          Reset Password & Continue →
        </AuthButton>
      </div>
    </form>
  );
}

export default function TrackLeaderResetPasswordPage() {
  return (
    <AuthShell
      portalType="track-leader"
      backHref="/track-leader/login"
      backLabel="Back to Login"
    >
      <AuthCard
        category="SECURITY // RESET"
        badge="TOKEN VERIFIED"
        title="Reset Password"
        description="Create a new secure password for your Track Leader account."
        footer={
          <div className="flex items-center justify-between gap-3 text-xs font-space text-slate-500">
            <span>Remembered your password?</span>
            <Link
              href="/track-leader/login"
              className="font-oxanium text-[10px] font-bold uppercase tracking-wider text-circuit hover:text-cyan-200 transition-colors"
            >
              Sign In Instead
            </Link>
          </div>
        }
      >
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-8 space-y-3 font-mono text-xs text-slate-400">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-circuit/30 border-t-circuit" />
              <span>Verifying cryptographic reset token...</span>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </AuthCard>
    </AuthShell>
  );
}
