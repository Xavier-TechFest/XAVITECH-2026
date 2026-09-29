import { notFound } from "next/navigation";
import { EVENTS } from "@/lib/eventsData";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventDetailView from "@/components/sections/EventDetailView";
import CosmosBackdrop from "@/components/experience/CosmosBackdrop";
import DataStreams from "@/components/effects/DataStreams";

interface EventDetailPageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  return EVENTS.map((event) => ({
    id: event.id,
  }));
}

export function generateMetadata({ params }: EventDetailPageProps) {
  const event = EVENTS.find((e) => e.id === params.id);
  if (!event) return { title: "Event Details — XAVITECH '26" };

  return {
    title: `${event.fullTitle} — XAVITECH '26 | Xavier University Patna`,
    description: event.fullDesc,
  };
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const event = EVENTS.find((e) => e.id === params.id);

  if (!event) {
    notFound();
  }

  return (
    <>
      <CosmosBackdrop />
      <DataStreams variant="edge" count={8} />
      <Navbar />

      <div className="relative z-10">
        <main>
          <EventDetailView event={event} />
        </main>
        <Footer />
      </div>
    </>
  );
}
