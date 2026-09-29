"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTrackLeader } from "@/context/TrackLeaderContext";
import { AuthShell, AuthCard, AuthField, AuthButton, AuthAlert } from "@/components/auth";

export default function TrackLeaderLoginPage() {
  const { login } = useTrackLeader();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your registered email and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid track leader credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell portalType="track-leader" backHref="/" backLabel="Back to Festival">
      <AuthCard
        category="TRACK OPERATIONS // AUTH"
        badge="COORDINATOR ROLE"
        title="Track Leader Login"
        description="Access your assigned track management console and registration roster."
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-space text-slate-500">
            <span>Temporary credentials issued by admin?</span>
            <Link
              href="/track-leader/forgot-password"
              className="font-oxanium text-[10px] font-bold uppercase tracking-wider text-circuit hover:text-cyan-200 transition-colors"
            >
              Need Help / Reset?
            </Link>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {errorMessage && <AuthAlert type="error" message={errorMessage} />}

          {/* Email Address */}
          <AuthField
            id="tl-email"
            label="Track Leader Email"
            type="email"
            required
            autoComplete="email"
            disabled={isSubmitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="leader@xavitech.org"
          />

          {/* Password with Visibility Toggle */}
          <div>
            <AuthField
              id="tl-password"
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              disabled={isSubmitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />
            <div className="flex justify-end mt-1.5">
              <Link
                href="/track-leader/forgot-password"
                className="font-space text-xs text-slate-400 hover:text-circuit transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <AuthButton
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              loadingText="Authenticating Track Leader..."
            >
              Sign In to Console →
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
