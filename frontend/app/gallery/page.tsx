import type { Metadata } from "next";
import StubPage from "@/components/ui/StubPage";

export const metadata: Metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <StubPage eyebrowN="00" title="Gallery">
      <p>
        Photos and clips from the day go up here afterwards — the builds,
        the stage events, the crowd. Nothing to show before 31 October.
      </p>
    </StubPage>
  );
}
