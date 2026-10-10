/**
 * Single source of truth for the five tracks and the events under them.
 * Used by the Tracks section, the Events carousel and (via names) the rest of the site.
 *
 * `name`     = the official, fancy event name.
 * `realName` = what the event actually is, in plain words, so a first-time
 *              visitor understands it at a glance. Shown on every card.
 */

export type TrackId = "hackathon" | "coding" | "gaming" | "stage" | "workshops";

export interface Track {
  id: TrackId;
  /** Full name — matches the Committee page exactly. */
  name: string;
  /** Short label for the filter chips. */
  short: string;
  /** Upper-case label printed on event cards. */
  tag: string;
  detail: string;
  blurb: string;
}

export const TRACKS: Track[] = [
  {
    id: "hackathon",
    name: "Hackathon",
    short: "Hackathon",
    tag: "HACKATHON",
    detail: "Build, ship and pitch in one stretch",
    blurb:
      "Build something that works in a single stretch. Bring a team of four, pick a problem, ship a working prototype by judging.",
  },
  {
    id: "coding",
    name: "Coding & Development",
    short: "Coding",
    tag: "CODING & DEVELOPMENT",
    detail: "Debugging, web, data and code sprints",
    blurb:
      "Debugging derbies, web builds, data challenges and code sprints — for people who'd rather solve it in the editor than on a whiteboard.",
  },
  {
    id: "gaming",
    name: "Gaming & Adventure",
    short: "Gaming",
    tag: "GAMING & ADVENTURE",
    detail: "BGMI, treasure hunt and death race",
    blurb:
      "Treasure hunts, elimination races, and head-to-head gaming rounds spread across the day. Team up or go solo.",
  },
  {
    id: "stage",
    name: "Stage & Central Events",
    short: "Stage",
    tag: "STAGE & CENTRAL EVENTS",
    detail: "Quiz, MUN, prompt battle and ideathon",
    blurb:
      "The main-stage lineup — quizzes, debates, prompt battles, and the events everyone ends up watching between their own rounds.",
  },
  {
    id: "workshops",
    name: "Workshops & Knowledge",
    short: "Workshops",
    tag: "WORKSHOPS & KNOWLEDGE",
    detail: "Hands-on skill-building session",
    blurb:
      "Hands-on sessions run by people who do this for a living. Walk in knowing the basics, walk out having built something.",
  },
];

export interface FestEvent {
  slug: string;
  name: string;
  realName: string;
  track: TrackId;
  status: "Registration open" | "Opens soon";
  format: string;
  /** Card background (public/events/cards). Omit for a generated pattern. */
  image?: string;
}

const card = (slug: string) => `/events/cards/${slug}.webp`;

export const EVENTS: FestEvent[] = [
  { slug: "innocraft", name: "INNOCRAFT", realName: "Hackathon", track: "hackathon", status: "Registration open", format: "4 participants", image: card("innocraft") },
  { slug: "webweave", name: "WEBWEAVE", realName: "Web Development Challenge", track: "coding", status: "Registration open", format: "2 participants", image: card("webweave") },
  { slug: "runtime-rush", name: "RUNTIME RUSH", realName: "Code Sprint", track: "coding", status: "Registration open", format: "1–2 participants", image: card("runtime-rush") },
  { slug: "vlookup", name: "VLookUp", realName: "Data Analytics", track: "coding", status: "Registration open", format: "2 participants", image: card("vlookup") },
  { slug: "debug-derby", name: "DEBUG DERBY", realName: "Debugging Challenge", track: "coding", status: "Registration open", format: "1 participant", image: card("debug-derby") },
  { slug: "battle-of-bots", name: "BATTLE OF BOTS", realName: "AI Prompt Battle", track: "coding", status: "Registration open", format: "1–3 participants", image: card("battle-of-bots") },
  { slug: "loot-goblins", name: "Battleground Blitz", realName: "BGMI", track: "gaming", status: "Registration open", format: "4–5 participants", image: "/events/Bgmi.jpg" },
  { slug: "cipher-chase", name: "CIPHER CHASE", realName: "Tech Treasure Hunt", track: "gaming", status: "Registration open", format: "4 participants", image: card("cipher-chase") },
  { slug: "velocityx", name: "VelocityX", realName: "Death Race", track: "gaming", status: "Registration open", format: "2–4 participants", image: card("velocityx") },
  { slug: "unscripted-nations", name: "Unscripted Nations", realName: "MUN", track: "stage", status: "Registration open", format: "1–2 participants", image: "/events/MUN.jpg" },
  { slug: "circuit-of-minds", name: "Circuit of Minds", realName: "Tech Quiz", track: "stage", status: "Registration open", format: "2 participants", image: card("circuit-of-minds") },
  { slug: "thoughtlab", name: "ThoughtLab", realName: "Ideathon", track: "stage", status: "Registration open", format: "2–4 participants", image: card("thoughtlab") },
  { slug: "hack-the-skill", name: "Hack the Skill", realName: "Workshop", track: "workshops", status: "Registration open", format: "1–4 participants" },
];

export const trackById = (id: TrackId) => TRACKS.find((t) => t.id === id)!;
export const eventsOf = (id: TrackId) => EVENTS.filter((e) => e.track === id);
