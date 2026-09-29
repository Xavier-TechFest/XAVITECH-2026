"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TrackLeaderRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/track-leader/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#080b11] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
    </div>
  );
}
