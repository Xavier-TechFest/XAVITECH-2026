"use client";

import React, { useState } from "react";

interface AuthFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  error?: string | null;
  helperText?: string;
  badge?: string;
  className?: string;
  fontMono?: boolean;
  minLength?: number;
  maxLength?: number;
}

export default function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  disabled = false,
  error,
  helperText,
  badge,
  className = "",
  fontMono = false,
  minLength,
  maxLength,
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label Row */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block font-oxanium text-[10px] font-bold uppercase tracking-[0.17em] text-slate-300"
        >
          {label} {required && <span className="text-circuit ml-0.5">*</span>}
        </label>
        {badge && (
          <span className="font-oxanium text-[9px] uppercase tracking-wider text-slate-500">
            {badge}
          </span>
        )}
      </div>

      {/* Input Container */}
      <div className="relative">
        <input
          id={id}
          type={actualType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          minLength={minLength}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className={`h-12 w-full min-w-0 border bg-[#080e11]/90 px-3.5 sm:px-4 font-body text-base sm:text-sm text-[#ece8de] placeholder:text-slate-600 outline-none transition-all duration-200 focus:bg-[#0a1517] disabled:opacity-50 disabled:cursor-not-allowed ${
            fontMono ? "font-mono" : ""
          } ${
            isPassword ? "pr-11" : ""
          } ${
            error
              ? "border-rose-400/80 focus:border-rose-300 focus:ring-1 focus:ring-rose-400/30 text-rose-100"
              : "border-white/10 hover:border-white/20 focus:border-circuit/70 focus:ring-1 focus:ring-circuit/30"
          }`}
        />

        {/* Password Visibility Toggle Button */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-0 top-0 h-12 w-11 flex items-center justify-center text-slate-400 hover:text-circuit transition-colors focus:outline-none focus:text-circuit"
          >
            {showPassword ? (
              /* Eye-off icon */
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                />
              </svg>
            ) : (
              /* Eye icon */
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Error or Helper Message */}
      {error ? (
        <p id={`${id}-error`} className="font-body text-xs text-rose-300">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="font-body text-[11px] text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
