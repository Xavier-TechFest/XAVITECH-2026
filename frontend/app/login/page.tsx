"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import Navbar from "@/components/layout/Navbar";

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
        setErrorMessage("Sign-in cancelled. Please complete the Google sign-in popup to continue.");
      } else if (err.code === "auth/popup-blocked") {
        setErrorMessage("The sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else if (err.code === "auth/network-request-failed") {
        setErrorMessage("Network error. Please check your internet connection and try again.");
      } else if (err.status === 401 || err.status === 500) {
        setErrorMessage(`Backend authentication error: ${err.message || "Failed to synchronize profile."}`);
      } else {
        setErrorMessage(err.message || "An unexpected error occurred during Google sign-in. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 pt-24 pb-16 bg-bg relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-circuit/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-marigold/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-3 text-xs tracking-wider uppercase text-circuit font-mono font-medium px-3 py-1 rounded-full border border-circuit/30 bg-circuit/5 transition-colors hover:border-circuit/60"
        >
          <span>← Back to festival</span>
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mt-2">
          XAVITECH <span className="text-marigold">2026</span>
        </h1>
        <p className="text-sm text-muted mt-2 max-w-sm mx-auto">
          The Annual Technology Festival of Xavier University, Patna
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-surface border border-line rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="text-center mb-6">
          <h2 className="font-display text-xl font-bold text-ink">
            Participant Portal
          </h2>
          <p className="text-xs text-muted mt-1.5 leading-relaxed">
            Sign in with your Google account to register for competitive events, access digital passes, and manage your festival identity.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-signal/10 border border-signal/30 text-signal text-xs flex items-start gap-3">
            <svg
              className="w-4 h-4 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn || loading}
            className="w-full h-12 flex items-center justify-center gap-3 rounded-xl bg-ink text-bg font-body font-semibold text-sm transition-all duration-200 hover:bg-white hover:shadow-lg hover:shadow-ink/10 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none border border-line"
          >
            {isSigningIn || loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-bg"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Authenticating with Google...</span>
              </>
            ) : (
              <>
                {/* Official Google G Icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-6 pt-6 border-t border-line/60 flex items-center justify-center gap-2 text-xs text-muted">
          <svg
            className="w-3.5 h-3.5 text-circuit shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>Encrypted token authentication via Firebase & Supabase</span>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <main className="min-h-screen bg-bg flex items-center justify-center p-4 pt-24">
            <div className="w-8 h-8 rounded-full border-2 border-circuit/30 border-t-circuit animate-spin" />
          </main>
        }
      >
        <LoginForm />
      </Suspense>
    </>
  );
}
