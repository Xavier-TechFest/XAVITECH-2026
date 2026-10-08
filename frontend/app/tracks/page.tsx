import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventsDirectory from "@/components/sections/EventsDirectory";
import CosmosBackdrop from "@/components/experience/CosmosBackdrop";
import DataStreams from "@/components/effects/DataStreams";
import { Suspense } from "react";

export const metadata = {
  title: "Tracks & Events — XAVITECH '26 | Xavier University Patna",
  description:
    "Explore 15 futuristic technology arenas, hackathons, coding duels, esports, and MUNs at XAVITECH 2026.",
};

export default function TracksPage() {
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
