import type { Metadata } from "next";
import StubPage from "@/components/ui/StubPage";
import { POSTPONEMENT_MODE } from "@/lib/siteMode";
import PostponementLandingPage from "@/components/home/PostponementLandingPage";

export const metadata: Metadata = { title: POSTPONEMENT_MODE ? "XAVITECH 2026 — Postponement Update" : "Announcements" };

export default function AnnouncementsPage() {
  if (POSTPONEMENT_MODE) return <PostponementLandingPage />;
  return (
    <StubPage eyebrowN="00" title="Announcements">
      <p>
        Schedule changes, venue shifts, last-minute rule clarifications —
        anything that needs to reach everyone at once will be posted here
        first.
      </p>
      <p>Nothing's gone out yet. Check back closer to 31 October.</p>
    </StubPage>
  );
}
