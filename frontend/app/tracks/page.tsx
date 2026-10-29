import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventsDirectory from "@/components/sections/EventsDirectory";
import CosmosBackdrop from "@/components/experience/CosmosBackdrop";
import DataStreams from "@/components/effects/DataStreams";
import { Suspense } from "react";
import { POSTPONEMENT_MODE } from "@/lib/siteMode";
import PostponementLandingPage from "@/components/home/PostponementLandingPage";

export const metadata = POSTPONEMENT_MODE ? {
  title: "XAVITECH 2026 — Postponement Update",
  description: "XAVITECH 2026 has been postponed until further notice.",
} : {
  title: "Tracks & Events — XAVITECH '26 | Xavier University Patna",
  description:
    "Explore 15 futuristic technology arenas, hackathons, coding duels, esports, and MUNs at XAVITECH 2026.",
};

export default function TracksPage() {
  if (POSTPONEMENT_MODE) return <PostponementLandingPage />;
  return (
    <>
      <CosmosBackdrop />
      <DataStreams variant="edge" count={10} />
      <Navbar />

      <div className="relative z-10">
        <main>
          <Suspense fallback={<div className="min-h-[60vh]" />}>
            <EventsDirectory />
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
}
