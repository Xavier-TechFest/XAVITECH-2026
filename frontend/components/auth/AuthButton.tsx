"use client";

import React from "react";

interface AuthButtonProps {
  type?: "submit" | "button";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  icon?: React.ReactNode;
}

export default function AuthButton({
  type = "submit",
  onClick,
  disabled = false,
  loading = false,
  loadingText = "Authenticating...",
  children,
  variant = "primary",
  className = "",
  icon,
}: AuthButtonProps) {
  const baseClass =
    "min-h-[48px] w-full flex items-center justify-center gap-2 px-5 font-space text-sm font-semibold transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed select-none";

  const variantClasses = {
    primary:
      "border border-circuit/60 bg-circuit text-[#04100f] hover:bg-cyan-200 hover:shadow-lg hover:shadow-circuit/20 disabled:opacity-50",
    secondary:
      "border border-white/15 bg-white/[0.04] text-slate-200 hover:border-circuit/60 hover:text-circuit hover:bg-white/[0.08] disabled:opacity-40",
    danger:
      "border border-rose-500/50 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 hover:border-rose-400 disabled:opacity-40",
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${variantClasses} ${className}`}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 shrink-0"
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
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {icon}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
