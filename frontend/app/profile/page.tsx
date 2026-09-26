"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import Navbar from "@/components/layout/Navbar";

/**
 * Validates a mobile number according to the rules:
 * - Optional: empty or whitespace string is valid (returns isValid: true, error: null)
 * - If provided:
 *   - Only numeric digits 0-9
 *   - Exactly 10 digits
 *   - No +91, spaces, hyphens, brackets, alphabets, or special characters
 */
function validatePhoneNumber(value: string): { isValid: boolean; error: string | null } {
  const trimmed = value.trim();

  // Optional: empty is valid
  if (!trimmed) {
    return { isValid: true, error: null };
  }

  // Exactly 10 numeric digits, no other characters permitted
  if (!/^\d{10}$/.test(trimmed)) {
    return {
      isValid: false,
      error: "Enter a valid 10-digit mobile number.",
    };
  }

  return { isValid: true, error: null };
}

export default function ProfilePage() {
  const { user, loading, isAuthenticated, updateProfile, logout } = useAuth();
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeName, setCollegeName] = useState("");

  // Validation states
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);

  // UI feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect unauthenticated visitors
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Sync form inputs when user profile loads
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setCollegeName(user.collegeName || "");
      setPhoneError(null);
    }
  }, [user]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Check if input contains non-digits or exceeds 10 digits (e.g. pasted or typed)
    if (raw && (!/^\d*$/.test(raw) || raw.length > 10)) {
      setPhone(raw);
      setPhoneError("Enter a valid 10-digit mobile number.");
      return;
    }

    setPhone(raw);

    if (!raw.trim()) {
      setPhoneError(null);
      return;
    }

    if (raw.length === 10) {
      setPhoneError(null);
    } else if (phoneTouched) {
      setPhoneError("Enter a valid 10-digit mobile number.");
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow control and navigation keys
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "Escape" ||
      e.key === "Enter" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Home" ||
      e.key === "End" ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    // Restrict input to digits 0-9
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      setPhoneError("Enter a valid 10-digit mobile number.");
    }
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
    const validation = validatePhoneNumber(phone);
    setPhoneError(validation.error);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneTouched(true);

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error);
      return;
    }
    setPhoneError(null);

    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const trimmedPhone = phone.trim();
      const trimmedCollege = collegeName.trim();

      const updated = await updateProfile({
        name: name.trim() || user?.name || "",
        phone: trimmedPhone,
        college_name: trimmedCollege,
      });

      setPhone(updated.phone || trimmedPhone);
      setSuccessMessage("Your profile has been updated successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error("Profile update error:", err);
      setErrorMessage(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } catch (err: any) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  // Full page skeleton while authentication resolves
  if (loading || (!user && isAuthenticated)) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-bg flex items-center justify-center p-4 pt-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-circuit/30 border-t-circuit animate-spin" />
            <span className="text-xs text-muted font-mono tracking-wider">
              Loading your profile...
            </span>
          </div>
        </main>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg text-ink pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-line">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-circuit transition-colors"
          >
            <span>← Back to Festival Home</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded-lg border border-line bg-surface text-muted hover:text-signal hover:border-signal/40 transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>

        {/* Top Profile Summary Card */}
        <div className="bg-surface border border-line rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Initial Avatar */}
            <div
              role="img"
              aria-label={`Avatar for ${user.name?.trim() || "user"}`}
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-line bg-surface-raised shrink-0 flex items-center justify-center select-none"
            >
              <span className="font-display text-3xl sm:text-4xl font-bold text-circuit">
                {(user.name?.trim() || "U").charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Meta */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                <h1 className="font-display text-2xl font-bold text-ink">
                  {user.name || "Participant"}
                </h1>
                <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-circuit/10 border border-circuit/30 text-circuit font-medium">
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-muted font-body mb-3">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-muted">
                <span>Account ID: {user.id ? `${user.id.slice(0, 8)}...` : "—"}</span>
                <span className="text-circuit/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-circuit inline-block animate-pulse" />
                  Verified via Google
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-circuit/10 border border-circuit/30 text-circuit text-xs flex items-center gap-3">
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-signal/10 border border-signal/30 text-signal text-xs flex items-center gap-3">
            <svg
              className="w-4 h-4 shrink-0"
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
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Profile Edit Form Card */}
        <div className="bg-surface border border-line rounded-2xl p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="font-display text-lg font-bold text-ink">
              Participant Information
            </h2>
            <p className="text-xs text-muted mt-1">
              Keep your contact and college information accurate so event coordinators can reach your team during tech fest activities.
            </p>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-xs font-mono uppercase tracking-wider text-muted"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abhi Sharma"
                  className="w-full h-11 px-4 rounded-xl bg-surface-raised border border-line text-sm text-ink placeholder:text-muted/40 focus:outline-none focus:border-circuit transition-colors"
                />
              </div>

              {/* Email (Read-Only) */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs font-mono uppercase tracking-wider text-muted flex items-center justify-between"
                >
                  <span>Google Email</span>
                  <span className="text-[10px] text-circuit">Verified</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full h-11 px-4 rounded-xl bg-surface-raised/40 border border-line/50 text-sm text-muted cursor-not-allowed"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block text-xs font-mono uppercase tracking-wider text-muted flex items-center justify-between"
                >
                  <span>Contact Number</span>
                  <span className="text-[10px] text-muted/70 font-mono">Optional • 10 digits</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyDown={handlePhoneKeyDown}
                  onBlur={handlePhoneBlur}
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  className={`w-full h-11 px-4 rounded-xl bg-surface-raised border text-sm text-ink placeholder:text-muted/40 focus:outline-none transition-colors ${
                    phoneError
                      ? "border-signal/80 focus:border-signal"
                      : "border-line focus:border-circuit"
                  }`}
                />
                {phoneError && (
                  <p className="text-xs text-signal font-body flex items-center gap-1.5 mt-1.5">
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
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
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>

              {/* Institution Name */}
              <div className="space-y-2">
                <label
                  htmlFor="college"
                  className="block text-xs font-mono uppercase tracking-wider text-muted flex items-center justify-between"
                >
                  <span>Institution Name</span>
                  <span className="text-[10px] text-muted/70 font-mono">Optional</span>
                </label>
                <input
                  id="college"
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. Xavier University, Patna / ABC School"
                  className="w-full h-11 px-4 rounded-xl bg-surface-raised border border-line text-sm text-ink placeholder:text-muted/40 focus:outline-none focus:border-circuit transition-colors"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-line/60">
              <button
                type="submit"
                disabled={isSaving}
                className="h-11 px-6 rounded-xl bg-circuit text-bg font-body font-semibold text-sm transition-all duration-200 hover:bg-circuit/90 active:scale-[0.98] disabled:opacity-60 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-bg"
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
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </>
);
}
