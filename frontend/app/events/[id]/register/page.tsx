import { notFound } from "next/navigation";
import { EVENTS } from "@/lib/eventsData";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RegistrationForm from "@/components/sections/RegistrationForm";
import ShardsBackdrop from "@/components/experience/ShardsBackdrop";

interface RegisterPageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  return EVENTS.map((event) => ({
    id: event.id,
  }));
}

export function generateMetadata({ params }: RegisterPageProps) {
  const event = EVENTS.find((e) => e.id === params.id);
  if (!event) return { title: "Event Registration — YANTRA '26" };

  return {
    title: `Register for ${event.name} — YANTRA '26`,
    description: `Official registration form for ${event.name} at Xavier University Patna.`,
  };
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const event = EVENTS.find((e) => e.id === params.id) || EVENTS[0];

  if (!event) {
    notFound();
  }

  return (
    <>
      {/* 3D Floating Shards backdrop */}
      <ShardsBackdrop />
      <Navbar />

      <div className="relative z-10">
        <main>
          <RegistrationForm event={event} />
        </main>
        <Footer />
      </div>
    </>
  );
}
