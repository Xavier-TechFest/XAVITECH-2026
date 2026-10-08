import { redirect } from "next/navigation";

/** The event directory now lives under Tracks & Events. */
export default function EventsPage() {
  redirect("/tracks");
}
