import type { Metadata } from "next";
import StubPage from "@/components/ui/StubPage";
import { POSTPONEMENT_MODE } from "@/lib/siteMode";
import PostponementLandingPage from "@/components/home/PostponementLandingPage";

export const metadata: Metadata = { title: POSTPONEMENT_MODE ? "XAVITECH 2026 — Postponement Update" : "Results" };

export default function ResultsPage() {
  if (POSTPONEMENT_MODE) return <PostponementLandingPage />;
  return (
    <StubPage eyebrowN="00" title="Results">
      <p>
        Results go up here as each event finishes judging on 31 October —
        nothing to show yet. Once the day starts, this page will list
        winners by event as they're announced.
      </p>
      <p>
        Watching for a specific event? The fastest update on the day itself
        will be announced from the main stage and posted on our socials.
      </p>
    </StubPage>
  );
}
