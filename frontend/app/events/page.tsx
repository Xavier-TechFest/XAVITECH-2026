import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventsShowcase from "@/components/sections/EventsShowcase";
import CosmosBackdrop from "@/components/experience/CosmosBackdrop";
import DataStreams from "@/components/effects/DataStreams";

export const metadata = {
  title: "Events Directory — XAVITECH '26 | Xavier University Patna",
  description:
    "Explore 15 futuristic technology arenas, hackathons, coding duels, esports, and MUNs at XAVITECH 2026.",
};

export default function EventsPage() {
  return (
    <>
      <CosmosBackdrop />
      <DataStreams variant="edge" count={10} />
      <Navbar />

      <div className="relative z-10">
        <main>
          <EventsShowcase />
        </main>
        <Footer />
      </div>
    </>
  );
}
