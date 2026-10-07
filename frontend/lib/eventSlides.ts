/**
 * Event promo images shown in the About section frame.
 *
 * HOW IT WORKS
 * - The image changes every 2 hours, on the clock: 12:00 AM, 2:00 AM, 4:00 AM ... 10:00 PM
 *   (12 changes per day). It is computed from the wall clock, NOT from how long a visitor
 *   has been on the site, so everyone sees the same image at the same time.
 * - Time is always read in Indian Standard Time (IST), whatever the visitor's device timezone.
 * - With 24 images and 12 slots per day, the list is shown across 2 days
 *   (images 1-12 on one day, 13-24 on the next), then repeats. With 12 images it repeats daily.
 *   Any number of images works.
 *
 * HOW TO EDIT
 * - Put your image in /public/assets/event-images/ (WebP/SVG/JPEG, 4:3 like 1200x900).
 * - Change `file` below (and `title` / `track` if needed). Order here = order shown.
 */

export interface EventSlide {
  title: string;
  track: string;
  file: string; // file name inside /public/assets/event-images/
}

export const EVENT_SLIDES: EventSlide[] = [
  { title: "Hackathon", track: "HACKATHON", file: "event-01.svg" },
  { title: "Debugging Challenge", track: "CODING & DEVELOPMENT", file: "event-02.svg" },
  { title: "Web Development", track: "CODING & DEVELOPMENT", file: "event-03.svg" },
  { title: "Data Analytics Challenge", track: "CODING & DEVELOPMENT", file: "event-04.svg" },
  { title: "Code Sprint", track: "CODING & DEVELOPMENT", file: "event-05.svg" },
  { title: "Gaming", track: "GAMING & ADVENTURE", file: "event-06.svg" },
  { title: "Tech Treasure Hunt", track: "GAMING & ADVENTURE", file: "event-07.svg" },
  { title: "Death Race", track: "GAMING & ADVENTURE", file: "event-08.svg" },
  { title: "Tech Quiz", track: "CENTRAL EVENTS", file: "event-09.svg" },
  { title: "AI Prompt Battle", track: "CENTRAL EVENTS", file: "event-10.svg" },
  { title: "MUN", track: "CENTRAL EVENTS", file: "event-11.svg" },
  { title: "Ideathon", track: "CENTRAL EVENTS", file: "event-12.svg" },
  { title: "Workshop", track: "KNOWLEDGE", file: "event-13.svg" },
  { title: "Hackathon", track: "HACKATHON", file: "event-14.svg" },
  { title: "Debugging Challenge", track: "CODING & DEVELOPMENT", file: "event-15.svg" },
  { title: "Web Development", track: "CODING & DEVELOPMENT", file: "event-16.svg" },
  { title: "Data Analytics Challenge", track: "CODING & DEVELOPMENT", file: "event-17.svg" },
  { title: "Code Sprint", track: "CODING & DEVELOPMENT", file: "event-18.svg" },
  { title: "Gaming", track: "GAMING & ADVENTURE", file: "event-19.svg" },
  { title: "Tech Treasure Hunt", track: "GAMING & ADVENTURE", file: "event-20.svg" },
  { title: "Death Race", track: "GAMING & ADVENTURE", file: "event-21.svg" },
  { title: "Tech Quiz", track: "CENTRAL EVENTS", file: "event-22.svg" },
  { title: "AI Prompt Battle", track: "CENTRAL EVENTS", file: "event-23.svg" },
  { title: "MUN", track: "CENTRAL EVENTS", file: "event-24.svg" },
];

/** The first midnight (IST) of the rotation: image #1 appears at 12:00 AM on this date. */
const ROTATION_START = { year: 2026, month: 10, day: 1 };

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
export const SLOT_MS = 2 * 60 * 60 * 1000;
const SLOTS_PER_DAY = DAY_MS / SLOT_MS; // 12

/** Index into EVENT_SLIDES for the given moment. */
export function slideIndexAt(now: number, count: number): number {
  const ist = now + IST_OFFSET_MS; // "clock reading" in IST, expressed as a UTC-style timestamp
  const start = Date.UTC(ROTATION_START.year, ROTATION_START.month - 1, ROTATION_START.day);
  const day = Math.floor((ist - start) / DAY_MS);
  const slot = Math.floor((((ist % DAY_MS) + DAY_MS) % DAY_MS) / SLOT_MS);
  const n = day * SLOTS_PER_DAY + slot;
  return ((n % count) + count) % count;
}

/** Milliseconds until the next 2-hour boundary (12 AM, 2 AM, 4 AM ... IST). */
export function msUntilNextSlot(now: number): number {
  const ist = now + IST_OFFSET_MS;
  return SLOT_MS - (((ist % SLOT_MS) + SLOT_MS) % SLOT_MS);
}
