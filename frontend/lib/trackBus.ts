import type { TrackId } from "./fest";

/**
 * Tiny contract between the Tracks section and the Events carousel:
 * tapping a track card calls openTrackEvents(); the carousel listens,
 * filters itself to that track, and the page scrolls down to it.
 */
export const TRACK_EVENT = "xavitech:track";

const TRACK_PAGE_IDS: Record<TrackId, string> = {
  hackathon: "track-a",
  coding: "track-b",
  gaming: "track-c",
  stage: "track-d",
  workshops: "track-e",
};

/** Link from the homepage's track cards to the matching filtered track page. */
export function trackPageHref(track: TrackId) {
  return `/tracks?track=${TRACK_PAGE_IDS[track]}`;
}
