"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, ApiError } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanSecret = secretKey.trim();

    if (!cleanEmail || !cleanPassword || !cleanSecret) {
      setErrorMessage("All authentication fields are required.");
      return;
    }

    setIsLoading(true);

    try {
      await adminLogin({
        email: cleanEmail,
        password: cleanPassword,
        secretKey: cleanSecret,
      });

      // Redirect to protected admin dashboard upon successful login
      router.push("/xavitech-superadmin/dashboard");
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Invalid admin credentials.");
      } else {
        setErrorMessage("Invalid admin credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 py-16 bg-[#080b11] text-white relative overflow-hidden select-none">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#35e0c9]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Admin Portal Header */}
      <div className="mb-8 text-center relative z-10 max-w-md">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono uppercase">
          XAVITECH <span className="text-[#35e0c9]">Admin</span>
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Authorized Festival Operations & Coordination Console
        </p>
      </div>

      {/* Admin Auth Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0e131f]/90 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/80">
          {/* Error Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-start gap-3 animate-in fade-in duration-200"
            >
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2"
              >
                Coordinator Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="coordinator@college.edu"
                className="w-full px-4 py-3 bg-[#131929] border border-neutral-700/80 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#35e0c9] focus:ring-1 focus:ring-[#35e0c9] transition disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2"
              >
                Admin Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-[#131929] border border-neutral-700/80 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#35e0c9] focus:ring-1 focus:ring-[#35e0c9] transition disabled:opacity-50"
              />
            </div>

            {/* Secret Key Field */}
            <div>
              <label
                htmlFor="admin-secret"
                className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2"
              >
                Backend Secret Key
              </label>
              <input
                id="admin-secret"
                type="password"
                autoComplete="off"
                required
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                disabled={isLoading}
                placeholder="Server secret key"
                className="w-full px-4 py-3 bg-[#131929] border border-neutral-700/80 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#35e0c9] focus:ring-1 focus:ring-[#35e0c9] transition disabled:opacity-50 font-mono"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-[#35e0c9] hover:bg-[#2bc4b0] text-black font-semibold rounded-xl text-sm transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#35e0c9]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-black"
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
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Authenticate Administrator</span>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-neutral-800 text-center">
            <p className="text-[11px] text-neutral-500 font-mono">
              XAVITECH-2026 Internal Security System • Multi-Device Session Enabled
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
