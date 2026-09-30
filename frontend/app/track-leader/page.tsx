"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTrackLeader } from "@/context/TrackLeaderContext";

export default function TrackLeaderRootPage() {
  const router = useRouter();
  const { trackLeader, loading } = useTrackLeader();

  useEffect(() => {
    if (loading) return;

    if (trackLeader) {
      if (trackLeader.must_change_password) {
        router.replace("/track-leader/change-password");
      } else {
        router.replace("/track-leader/dashboard");
      }
    } else {
      router.replace("/track-leader/login");
    }
  }, [trackLeader, loading, router]);

  return (
    <div className="min-h-screen bg-[#080b11] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#35e0c9]/20 border-t-[#35e0c9] animate-spin" />
    </div>
  );
}
