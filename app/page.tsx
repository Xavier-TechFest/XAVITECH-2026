import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Introduction from "@/components/sections/Introduction";
import Tracks from "@/components/sections/Tracks";
import EventsPreview from "@/components/sections/EventsPreview";
import Schedule from "@/components/sections/Schedule";
import CosmosBackdrop from "@/components/experience/CosmosBackdrop";
import HudFrame from "@/components/effects/HudFrame";
import DataStreams from "@/components/effects/DataStreams";

export default function Home() {
  return (
    <>
      {/* fixed layers behind the page: z-0 scroll-driven 3D sky, z-5 data streams */}
      <CosmosBackdrop />
      <DataStreams variant="edge" count={10} />

      <Navbar />
      <HudFrame />

      {/* all real content sits above the fixed layers (z-10) */}
      <div className="relative z-10">
        <main>
          <Hero />
          <Introduction />
          <Tracks />
          <EventsPreview />
          <Schedule />
        </main>
        <Footer />
      </div>
    </>
  );
}
