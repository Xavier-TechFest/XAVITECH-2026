"use client";

import React, { useState } from "react";
import { useTrackLeader } from "@/context/TrackLeaderContext";
import { AuthShell, AuthCard, AuthField, AuthButton, AuthAlert } from "@/components/auth";

export default function TrackLeaderChangePasswordPage() {
  const { changePassword, trackLeader, logout } = useTrackLeader();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("All password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage("New password must be different from your temporary password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(currentPassword, newPassword);
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to change password. Please verify current credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell portalType="track-leader">
      <AuthCard
        category="SECURITY // FIRST LOGIN"
        badge="PASSWORD UPDATE"
        title="Set Your New Password"
        description="For security, you must replace your administrator-issued temporary password before accessing your track console."
        footer={
          <div className="flex items-center justify-between gap-3 text-xs font-space text-slate-500">
            <span>Wrong account signed in?</span>
            <button
              type="button"
              onClick={logout}
              className="font-oxanium text-[10px] font-bold uppercase tracking-wider text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
            >
              Sign out instead
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Account Indicator Banner */}
          {trackLeader?.email && (
            <div className="flex items-center justify-between p-3 border border-white/10 bg-white/[0.02] font-space text-xs">
              <span className="text-slate-400">Account:</span>
              <span className="font-mono font-semibold text-circuit truncate max-w-[220px]">
                {trackLeader.email}
              </span>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && <AuthAlert type="error" message={errorMessage} />}

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthField
              id="current-password"
              label="Current / Temporary Password"
              type="password"
              required
              autoComplete="current-password"
              disabled={isSubmitting}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter temporary password"
            />

            <AuthField
              id="new-password"
              label="New Password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={isSubmitting}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              helperText="Must be at least 8 characters and different from temporary password."
            />

            <AuthField
              id="confirm-password"
              label="Confirm New Password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={isSubmitting}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
            />

            {/* Checklist indicator */}
            <div className="p-3 border border-white/[0.06] bg-white/[0.015] font-space text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-2">
                <span className={newPassword.length >= 8 ? "text-circuit" : "text-slate-600"}>
                  {newPassword.length >= 8 ? "✓" : "○"}
                </span>
                <span>Minimum 8 characters length</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    confirmPassword && newPassword === confirmPassword
                      ? "text-circuit"
                      : "text-slate-600"
                  }
                >
                  {confirmPassword && newPassword === confirmPassword ? "✓" : "○"}
                </span>
                <span>Both passwords match</span>
              </div>
            </div>

            <div className="pt-2">
              <AuthButton
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                loadingText="Updating Password..."
              >
                Save New Password & Continue →
              </AuthButton>
            </div>
          </form>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
