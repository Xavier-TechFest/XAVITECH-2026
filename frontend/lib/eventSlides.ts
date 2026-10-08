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
 * - Put your image in /public/events/ (JPEG / WebP, 4:3 like 1200x900, ideally under 100 KB). The `file` name must match exactly, including the extension.
 * - Change `file` below (and `title` / `track` if needed). Order here = order shown.
 */

export interface EventSlide {
  title: string;
  track: string;
  file: string; // file name inside /public/events/
}

// Official event names (as announced by the Overall Coordinators).
// Image numbers follow /public/events/details.txt. Slide 13 (Workshop — Hack the Skill)
// has no image file yet, so it is left out; add `event-13.jpeg` and the line below
// to bring it into the rotation.
export const EVENT_SLIDES: EventSlide[] = [
  { title: "Innocraft", track: "HACKATHON", file: "event-01.jpeg" },
  { title: "Debug Derby", track: "CODING & DEVELOPMENT", file: "event-02.jpeg" },
  { title: "WebWeave", track: "CODING & DEVELOPMENT", file: "event-03.jpeg" },
  { title: "VLookUp", track: "CODING & DEVELOPMENT", file: "event-04.jpeg" },
  { title: "Runtime Rush", track: "CODING & DEVELOPMENT", file: "event-05.jpeg" },
  { title: "BattleGround Blitz", track: "GAMING & ADVENTURE", file: "event-06.jpeg" },
  { title: "Cipher Chase", track: "GAMING & ADVENTURE", file: "event-07.jpeg" },
  { title: "VelocityX", track: "GAMING & ADVENTURE", file: "event-08.jpeg" },
  { title: "Circuit of Minds", track: "CENTRAL EVENTS", file: "event-09.jpeg" },
  { title: "Battle of Bots", track: "CENTRAL EVENTS", file: "event-10.jpeg" },
  { title: "Unscripted Nations", track: "CENTRAL EVENTS", file: "event-11.jpeg" },
  { title: "ThoughtLab", track: "CENTRAL EVENTS", file: "event-12.jpeg" },
  // { title: "Hack the Skill", track: "KNOWLEDGE", file: "event-13.jpeg" }, // image not added yet
  { title: "Innocraft", track: "HACKATHON", file: "event-14.jpeg" },
  { title: "Debug Derby", track: "CODING & DEVELOPMENT", file: "event-15.jpeg" },
  { title: "WebWeave", track: "CODING & DEVELOPMENT", file: "event-16.jpeg" },
  { title: "VLookUp", track: "CODING & DEVELOPMENT", file: "event-17.jpeg" },
  { title: "Runtime Rush", track: "CODING & DEVELOPMENT", file: "event-18.jpeg" },
  { title: "BattleGround Blitz", track: "GAMING & ADVENTURE", file: "event-19.jpeg" },
  { title: "Cipher Chase", track: "GAMING & ADVENTURE", file: "event-20.jpeg" },
  { title: "VelocityX", track: "GAMING & ADVENTURE", file: "event-21.jpeg" },
  { title: "Circuit of Minds", track: "CENTRAL EVENTS", file: "event-22.jpeg" },
  { title: "Battle of Bots", track: "CENTRAL EVENTS", file: "event-23.jpeg" },
  { title: "Unscripted Nations", track: "CENTRAL EVENTS", file: "event-24.jpeg" },
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
