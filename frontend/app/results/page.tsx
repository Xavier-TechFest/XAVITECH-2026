import type { Metadata } from "next";
import StubPage from "@/components/ui/StubPage";

export const metadata: Metadata = { title: "Results" };

export default function ResultsPage() {
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
