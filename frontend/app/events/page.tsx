import { redirect } from "next/navigation";
import { POSTPONEMENT_MODE } from "@/lib/siteMode";
import PostponementLandingPage from "@/components/home/PostponementLandingPage";

/** The event directory now lives under Tracks & Events. */
export default function EventsPage() {
  if (POSTPONEMENT_MODE) return <PostponementLandingPage />;
  redirect("/tracks");
}
