import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import CosmosBackdrop from "@/components/experience/CosmosBackdrop";
import DataStreams from "@/components/effects/DataStreams";
import PostponementFooter from "@/components/home/PostponementFooter";

export default function PostponementLandingPage() {
  return (
    <>
      <CosmosBackdrop />
      <DataStreams variant="edge" count={10} />
      <Navbar postponed />
      <div className="relative z-10">
        <main>
          <Hero postponed />
        </main>
        <PostponementFooter />
      </div>
    </>
  );
}
