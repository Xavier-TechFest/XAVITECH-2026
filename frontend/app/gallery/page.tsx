import type { Metadata } from "next";
import StubPage from "@/components/ui/StubPage";
import { POSTPONEMENT_MODE } from "@/lib/siteMode";
import PostponementLandingPage from "@/components/home/PostponementLandingPage";

export const metadata: Metadata = { title: POSTPONEMENT_MODE ? "XAVITECH 2026 — Postponement Update" : "Gallery" };

export default function GalleryPage() {
  if (POSTPONEMENT_MODE) return <PostponementLandingPage />;
  return (
    <StubPage eyebrowN="00" title="Gallery">
      <p>
        Photos and clips from the day go up here afterwards — the builds,
        the stage events, the crowd. Nothing to show before 31 October.
      </p>
    </StubPage>
  );
}
