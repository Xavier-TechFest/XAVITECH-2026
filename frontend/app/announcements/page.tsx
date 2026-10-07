import type { Metadata } from "next";
import StubPage from "@/components/ui/StubPage";

export const metadata: Metadata = { title: "Announcements" };

export default function AnnouncementsPage() {
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
