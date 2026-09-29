"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { AuthShell, AuthCard, AuthAlert } from "@/components/auth";

function LoginForm() {
  const { user, isAuthenticated, loading, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/profile";

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.replace(redirectTarget);
    }
  }, [loading, isAuthenticated, user, router, redirectTarget]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);

    try {
      await loginWithGoogle();
      router.push(redirectTarget);
    } catch (err: any) {
      console.error("Google sign in error:", err);

      if (err.code === "auth/popup-closed-by-user") {
        setErrorMessage("Sign-in cancelled. Please complete the Google sign-in window to continue.");
      } else if (err.code === "auth/popup-blocked") {
        setErrorMessage("The sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else if (err.code === "auth/network-request-failed") {
        setErrorMessage("Network connection error. Please check your connectivity and try again.");
      } else if (err.status === 401 || err.status === 500) {
        setErrorMessage(`Backend sync error: ${err.message || "Failed to synchronize participant profile."}`);
      } else {
        setErrorMessage(err.message || "An unexpected authentication error occurred. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <AuthShell portalType="participant" backHref="/" backLabel="Back to Festival">
      <AuthCard
        category="01 / PARTICIPANT ACCESS"
        badge="GOOGLE OAUTH2"
        title="Welcome to XAVITECH"
        description="Sign in to continue to your participant portal, access digital event passes, and manage registrations."
        footer={
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-[11px] font-space text-slate-500">
              <svg className="w-3.5 h-3.5 text-circuit shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Encrypted token authentication via Firebase & Supabase</span>
            </div>
            <p className="text-[10px] font-mono text-slate-600 text-center">
              By proceeding, you agree to official XAVITECH 2026 festival code of conduct.
            </p>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Error Alert */}
          {errorMessage && <AuthAlert type="error" message={errorMessage} />}

          {/* Google Sign-in Action */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn || loading}
              className="w-full min-h-[50px] flex items-center justify-center gap-3 px-5 border border-white/15 bg-white/[0.04] hover:bg-white/[0.09] hover:border-circuit/60 text-white font-space text-sm font-semibold transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSigningIn || loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-circuit" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-300">
                    Authenticating with Google...
                  </span>
                </>
              ) : (
                <>
                  {/* Official Google G Logo */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="text-[#ece8de]">Continue with Google</span>
                </>
              )}
            </button>

            {/* Supporting explanation */}
            <p className="text-[11px] font-space text-slate-500 text-center leading-relaxed">
              Google Single Sign-On (SSO) securely verifies your email and creates your festival participant profile without requiring a new password.
            </p>
          </div>
        </div>
      </AuthCard>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <main className="min-h-screen bg-[#05090b] flex items-center justify-center p-4">
            <div className="flex items-center gap-3 text-sm text-slate-400 font-mono">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-circuit/30 border-t-circuit" />
              Loading festival portal...
            </div>
          </main>
        }
      >
        <LoginForm />
      </Suspense>
    </>
  );
}
