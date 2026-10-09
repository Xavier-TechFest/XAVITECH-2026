"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, ApiError } from "@/lib/api";
import { useAdmin } from "@/context/AdminContext";
import { AuthShell, AuthCard, AuthField, AuthButton, AuthAlert } from "@/components/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { admin, isLoadingAdmin, login } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!isLoadingAdmin && admin) {
      router.replace("/xavitech-superadmin/dashboard");
    }
  }, [admin, isLoadingAdmin, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanSecret = secretKey.trim();

    if (!cleanEmail || !cleanPassword || !cleanSecret) {
      setErrorMessage("All authentication credentials are required for administrator access.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await adminLogin({
        email: cleanEmail,
        password: cleanPassword,
        secretKey: cleanSecret,
      });

      if (data?.admin) {
        login(data.admin);
      }

      // Redirect to protected admin dashboard upon successful login
      router.push("/xavitech-superadmin/dashboard");
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Invalid administrative credentials.");
      } else {
        setErrorMessage("Invalid administrative credentials or network error.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      portalType="superadmin"
      backHref="/"
      backLabel="Return to public portal"
      technicalMeta={[
        { label: "SECURITY", value: "MULTI-SECRET / TLS 1.3" },
        { label: "ROLE", value: "FESTIVAL SUPERADMIN" },
        { label: "GATEWAY", value: "XVT-ROOT-ADMIN-00" },
      ]}
    >
      <AuthCard
        category="RESTRICTED // ROOT ACCESS"
        badge="LEVEL 4 SECURITY"
        title="Administrator Access"
        description="Verify central coordinator identity and administrative secret key to unlock system controls."
        footer={
          <div className="space-y-2 text-center">
            <p className="font-oxanium text-[10px] uppercase tracking-wider text-slate-400">
              XAVITECH-2026 INTERNAL CONTROL SYSTEM
            </p>
            <p className="font-body text-[11px] text-slate-500">
              Multi-Device Session Enabled • Unauthorized intrusion attempts are permanently logged and flagged.
            </p>
          </div>
        }
      >
        {errorMessage && (
          <div className="mb-5">
            <AuthAlert
              type="error"
              message={errorMessage}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthField
            id="admin-email"
            label="Coordinator Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            placeholder="coordinator@college.edu"
            helperText="Registered institution or festival coordinator address"
          />

          <AuthField
            id="admin-password"
            label="Admin Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="••••••••••••"
          />

          <AuthField
            id="admin-secret"
            label="Backend Secret Key"
            type="password"
            autoComplete="off"
            required
            fontMono
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            disabled={isLoading}
            placeholder="Root server security key"
            helperText="Confidential cluster authorization phrase"
          />

          <div className="pt-2">
            <AuthButton
              type="submit"
              variant="primary"
              loading={isLoading}
              loadingText="Verifying Root Credentials..."
            >
              Authenticate Administrator →
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
