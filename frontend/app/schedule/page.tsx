import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CosmosBackdrop from "@/components/experience/CosmosBackdrop";
import DataStreams from "@/components/effects/DataStreams";
import ScheduleClient from "./ScheduleClient";
import { Metadata } from "next";
import { POSTPONEMENT_MODE } from "@/lib/siteMode";
import PostponementLandingPage from "@/components/home/PostponementLandingPage";

export const metadata: Metadata = POSTPONEMENT_MODE ? {
  title: "XAVITECH 2026 — Postponement Update",
  description: "XAVITECH 2026 has been postponed until further notice.",
} : {
  title: "Event Schedule & Timetable — XAVITECH '26 | Xavier University, Patna",
  description:
    "Official XAVITECH 2026 event timetable. Complete searchable timing matrix and venues for all 13 events across 5 tracks at Xavier University, Patna.",
};

export default function SchedulePage() {
  if (POSTPONEMENT_MODE) return <PostponementLandingPage />;
  return (
    <>
      <CosmosBackdrop />
      <DataStreams variant="edge" count={10} />
      <Navbar />

      <div className="relative z-10">
        <main>
          <ScheduleClient />
        </main>
        <Footer />
      </div>
    </>
  );
}
