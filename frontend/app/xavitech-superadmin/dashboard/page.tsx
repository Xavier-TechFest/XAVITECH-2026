"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminGetMe, adminLogout, AdminProfile, ApiError } from "@/lib/api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAdminSession() {
      try {
        const profile = await adminGetMe();
        if (isMounted) {
          setAdmin(profile);
          setIsLoading(false);
        }
      } catch (err) {
        // If not authenticated or not an admin, immediately redirect to login
        router.replace("/xavitech-superadmin");
      }
    }

    loadAdminSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await adminLogout();
    } catch (err) {
      console.error("Error logging out session:", err);
    } finally {
      router.replace("/xavitech-superadmin");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#080b11] text-white">
        <div className="flex items-center gap-3 text-sm text-neutral-400 font-mono">
          <svg
            className="animate-spin h-5 w-5 text-[#35e0c9]"
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
          <span>Verifying administrator session...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080b11] text-white p-6 sm:p-12 relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#35e0c9]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-neutral-800 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#35e0c9]/30 bg-[#35e0c9]/10 text-[#35e0c9] text-xs font-mono uppercase tracking-widest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#35e0c9]" />
              Active Admin Session
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-mono uppercase tracking-tight">
              XAVITECH Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Festival Central Operations & Administration
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="self-start sm:self-auto px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-mono uppercase tracking-wider transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isLoggingOut ? (
              <span>Logging out...</span>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout Session</span>
              </>
            )}
          </button>
        </div>

        {/* Minimal Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Identity Card */}
          <div className="bg-[#0e131f]/90 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#35e0c9]" />
              Administrator Identity
            </h2>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                  Coordinator Name
                </span>
                <p className="text-lg font-bold text-white mt-0.5">
                  Welcome, {admin?.name || "Administrator"}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                  Coordinator Email
                </span>
                <p className="text-sm font-mono text-[#35e0c9] mt-0.5">
                  {admin?.email}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                  System Role
                </span>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#35e0c9]/10 text-[#35e0c9] border border-[#35e0c9]/30 mt-1">
                  {admin?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Concurrent Session Details */}
          <div className="bg-[#0e131f]/90 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Concurrent Session Status
            </h2>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                  Current Session Identifier
                </span>
                <p className="text-xs font-mono text-neutral-300 mt-0.5 truncate">
                  {admin?.sessionId || "Active Authenticated Session"}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                  Multi-Device State
                </span>
                <p className="text-sm text-neutral-300 mt-0.5">
                  Active simultaneous sessions supported. Logging out here invalidates only this device.
                </p>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                  Console Scope
                </span>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Phase 6 Foundation: Management controls, participant exports, and verification modules will activate in forthcoming phases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
