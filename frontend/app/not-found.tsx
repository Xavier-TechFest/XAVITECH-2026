import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-extrabold text-cyan-400 font-mono">404</h1>
        <h2 className="text-xl font-bold text-white mt-4">Page Not Found</h2>
        <p className="text-slate-400 text-sm mt-2">
          The requested page could not be located.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-semibold text-sm hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-950/40"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
