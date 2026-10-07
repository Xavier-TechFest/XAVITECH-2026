"use client";

import React from "react";

interface AuthAlertProps {
  type?: "error" | "success" | "warning" | "info";
  message: string;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function AuthAlert({
  type = "error",
  message,
  className = "",
  action,
}: AuthAlertProps) {
  if (!message) return null;

  const styles = {
    error: {
      container: "border-rose-400/40 bg-rose-400/[0.06] text-rose-200",
      iconColor: "text-rose-400",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      role: "alert",
    },
    success: {
      container: "border-circuit/40 bg-circuit/[0.06] text-cyan-100",
      iconColor: "text-circuit",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      role: "status",
    },
    warning: {
      container: "border-marigold/40 bg-marigold/[0.06] text-amber-200",
      iconColor: "text-marigold",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      ),
      role: "status",
    },
    info: {
      container: "border-circuit/40 bg-circuit/[0.06] text-cyan-100",
      iconColor: "text-circuit",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      role: "status",
    },
  }[type];

  return (
    <div
      role={styles.role}
      className={`border p-3 sm:p-3.5 font-body text-xs flex items-start gap-3 leading-relaxed ${styles.container} ${className}`}
    >
      <svg
        className={`w-4 h-4 shrink-0 mt-0.5 ${styles.iconColor}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {styles.icon}
      </svg>
      <div className="flex-1 min-w-0">{message}</div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="underline hover:no-underline font-semibold font-mono text-[11px] shrink-0 cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
