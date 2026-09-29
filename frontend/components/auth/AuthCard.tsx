"use client";

import React from "react";

interface AuthCardProps {
  category?: string;
  badge?: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthCard({
  category = "01 / AUTHENTICATION",
  badge,
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="relative border border-white/10 bg-[#080e11]/95 backdrop-blur-xl shadow-2xl shadow-black/80 p-6 sm:p-8">
      {/* Precision Reticle Corner Brackets (from profile/page.tsx) */}
      <span
        className="absolute left-0 top-0 h-3.5 w-3.5 -translate-x-px -translate-y-px border-l-2 border-t-2 border-circuit/80"
        aria-hidden="true"
      />
      <span
        className="absolute bottom-0 right-0 h-3.5 w-3.5 translate-x-px translate-y-px border-b-2 border-r-2 border-marigold/70"
        aria-hidden="true"
      />

      {/* Card Header */}
      <div className="mb-6 sm:mb-8 border-b border-white/10 pb-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-oxanium text-[10px] font-bold uppercase tracking-[0.2em] text-marigold">
            {category}
          </span>
          {badge && (
            <span className="border border-circuit/40 bg-circuit/[0.08] px-2 py-0.5 font-oxanium text-[9px] font-bold uppercase tracking-wider text-circuit">
              {badge}
            </span>
          )}
        </div>
        <h2 className="font-sora text-xl sm:text-2xl font-semibold text-white tracking-tight">
          {title}
        </h2>
        <p className="mt-1.5 font-space text-xs sm:text-sm leading-relaxed text-slate-400">
          {description}
        </p>
      </div>

      {/* Main Content / Form */}
      <div>{children}</div>

      {/* Card Footer */}
      {footer && (
        <div className="mt-6 pt-5 border-t border-white/10 text-center sm:text-left">
          {footer}
        </div>
      )}
    </div>
  );
}
