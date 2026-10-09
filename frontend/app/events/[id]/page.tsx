import { notFound } from "next/navigation";
import { EVENTS, getEventByIdOrSlug } from "@/lib/eventsData";
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
  const params: { id: string }[] = [];
  EVENTS.forEach((event) => {
    params.push({ id: event.id });
    event.aliases?.forEach((alias) => {
      params.push({ id: alias });
    });
  });
  return params;
}

export function generateMetadata({ params }: EventDetailPageProps) {
  const event = getEventByIdOrSlug(params.id);
  if (!event) return { title: "Event Details — XAVITECH '26" };

  return {
    title: `${event.fullTitle} — XAVITECH '26 | Xavier University Patna`,
    description: event.fullDesc,
  };
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const event = getEventByIdOrSlug(params.id);

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
