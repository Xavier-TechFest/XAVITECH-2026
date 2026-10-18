// ==============================================================================
// XAVITECH 2026 — Student Event Timetable & Programme Flow
// Single Source of Truth: DOC/program-flow.md (Preserved Timings)
// Date: Saturday, 31 October 2026 | Campus: Xavier University Campus
// ==============================================================================

export interface DayScheduleMilestone {
  id: string;
  time: string;
  programme: string;
  venue: string;
  description: string;
  badge: string;
}

export interface SplitSession {
  sessionName: string;
  time: string;
  venue: string;
  duration: string;
  note?: string;
}

export interface ScheduleEvent {
  id: string; // matches eventsData.ts id
  name: string;
  type: string;
  trackLetter: "A" | "B" | "C" | "D" | "E";
  trackName: string;
  time: string;
  duration: string;
  venue: string;
  isFullDay: boolean;
  accentColor: string;
  image: string;
  isSplit?: boolean;
  sessions?: SplitSession[];
  venueNote?: string;
  clashWarning?: string;
}

// ------------------------------------------------------------------------------
// Compact Day Milestones for Students
// ------------------------------------------------------------------------------
export const DAY_SCHEDULE: DayScheduleMilestone[] = [
  {
    id: "registration",
    time: "8:00–8:30 AM",
    programme: "Registration & Check-in",
    venue: "Xavier University Campus",
    description: "Participant check-in, credential verification and fest kit collection.",
    badge: "Check-in",
  },
  {
    id: "opening-ceremony",
    time: "8:35–9:00 AM",
    programme: "Opening Ceremony",
    venue: "Xavier University Campus",
    description: "Official festival inauguration, lamp lighting, and welcome address.",
    badge: "Inauguration",
  },
  {
    id: "valedictory",
    time: "5:30 PM onwards",
    programme: "Valedictory & Prize Distribution",
    venue: "Xavier University Campus",
    description: "Grand award ceremony, felicitation, and prize distribution.",
    badge: "Awards Gala",
  },
];

// ------------------------------------------------------------------------------
// All 13 Events Timing Matrix (Preserved Timings from DOC/program-flow.md)
// ------------------------------------------------------------------------------
export const SCHEDULE_EVENTS: ScheduleEvent[] = [
  // TRACK A — FLAGSHIP INNOVATION
  {
    id: "innocraft",
    name: "Innocraft",
    type: "Hackathon",
    trackLetter: "A",
    trackName: "Track A — Flagship Innovation",
    time: "9:00 AM–4:30 PM",
    duration: "Full day",
    venue: "Xavier University Campus",
    isFullDay: true,
    accentColor: "#ff6848",
    image: "/images/events/event-01.jpeg",
    clashWarning: "Full-day hackathon; participants cannot enter parallel timed events.",
  },

  // TRACK B — CODING & DEVELOPMENT
  {
    id: "webweave",
    name: "WebWeave",
    type: "Web Development",
    trackLetter: "B",
    trackName: "Track B — Coding & Development",
    time: "9:00 AM–12:30 PM",
    duration: "3 hrs 30 mins",
    venue: "Xavier University Campus",
    isFullDay: false,
    accentColor: "#f0a15b",
    image: "/images/events/event-03.jpeg",
    clashWarning: "Concurrent with Runtime Rush (9:30–11:30 AM) and Debug Derby (11:30 AM–1:30 PM).",
  },
  {
    id: "runtime-rush",
    name: "Runtime Rush",
    type: "Code Sprint",
    trackLetter: "B",
    trackName: "Track B — Coding & Development",
    time: "9:30 AM–11:30 AM",
    duration: "2 hrs",
    venue: "Xavier University Campus",
    isFullDay: false,
    accentColor: "#f0a15b",
    image: "/images/events/event-05.jpeg",
    clashWarning: "Runs parallel to WebWeave (9:00 AM–12:30 PM).",
  },
  {
    id: "debug-derby",
    name: "Debug Derby",
    type: "Debugging",
    trackLetter: "B",
    trackName: "Track B — Coding & Development",
    time: "11:30 AM–1:30 PM",
    duration: "2 hrs",
    venue: "Xavier University Campus",
    isFullDay: false,
    accentColor: "#f0a15b",
    image: "/images/events/event-04.jpeg",
    clashWarning: "Overlaps with WebWeave (until 12:30 PM) and VLookUp (12:30–1:30 PM).",
  },
  {
    id: "vlookup",
    name: "VLookUp",
    type: "Data Analytics",
    trackLetter: "B",
    trackName: "Track B — Coding & Development",
    time: "12:30 PM–3:30 PM",
    duration: "3 hrs",
    venue: "Xavier University Campus",
    isFullDay: false,
    accentColor: "#f0a15b",
    image: "/images/events/event-02.jpeg",
    clashWarning: "Overlaps with Debug Derby (12:30–1:30 PM) and Battle of Bots (1:30–3:30 PM).",
  },
  {
    id: "battle-of-bots",
    name: "Battle of Bots",
    type: "AI Prompt Battle",
    trackLetter: "B",
    trackName: "Track B — Coding & Development",
    time: "1:30 PM–3:30 PM",
    duration: "2 hrs",
    venue: "Xavier University Campus",
    isFullDay: false,
    accentColor: "#f0a15b",
    image: "/images/events/event-12.jpeg",
    clashWarning: "Runs concurrently with VLookUp (12:30–3:30 PM).",
  },

  // TRACK C — GAMING & ADVENTURE
  {
    id: "battleground-blitz",
    name: "Battleground Blitz",
    type: "BGMI",
    trackLetter: "C",
    trackName: "Track C — Gaming & Adventure",
    time: "9:00 AM–1:00 PM",
    duration: "4 hrs",
    venue: "Xavier University Campus",
    isFullDay: false,
    accentColor: "#60a5fa",
    image: "/events/Bgmi.jpg",
  },
  {
    id: "cipher-chase",
    name: "Cipher Chase",
    type: "Tech Treasure Hunt",
    trackLetter: "C",
    trackName: "Track C — Gaming & Adventure",
    time: "1:30 PM–4:00 PM",
    duration: "2.5 hrs",
    venue: "Xavier University Campus",
    isFullDay: false,
    accentColor: "#60a5fa",
    image: "/images/events/event-07.jpeg",
    clashWarning: "Overlaps with VelocityX (2:00–4:00 PM).",
  },
  {
    id: "velocityx",
    name: "VelocityX",
    type: "Death Race",
    trackLetter: "C",
    trackName: "Track C — Gaming & Adventure",
    time: "2:00 PM–4:00 PM",
    duration: "2 hrs",
    venue: "Xavier University Campus",
    isFullDay: false,
    accentColor: "#60a5fa",
    image: "/images/events/event-08.jpeg",
    clashWarning: "Overlaps with Cipher Chase (1:30–4:00 PM).",
  },

  // TRACK D — STAGE & CENTRAL EVENTS
  {
    id: "unscripted-nations",
    name: "Unscripted Nations",
    type: "MUN",
    trackLetter: "D",
    trackName: "Track D — Stage & Central Events",
    time: "9:00 AM–4:30 PM",
    duration: "Full day",
    venue: "Xavier University Patna",
    isFullDay: true,
    accentColor: "#34d399",
    image: "/events/MUN.jpg",
    clashWarning: "Full-day committee sessions; participants cannot join parallel timed events.",
  },
  {
    id: "thoughtlab",
    name: "ThoughtLab",
    type: "Ideathon",
    trackLetter: "D",
    trackName: "Track D — Stage & Central Events",
    time: "9:00 AM–11:00 AM",
    duration: "2 hrs",
    venue: "Xavier University Campus",
    isFullDay: false,
    accentColor: "#34d399",
    image: "/images/events/event-09.jpeg",
  },
  {
    id: "circuit-of-minds",
    name: "Circuit of Minds",
    type: "Tech Quiz",
    trackLetter: "D",
    trackName: "Track D — Stage & Central Events",
    time: "9:00–9:30 AM & 2:30–4:30 PM",
    duration: "2.5 hrs + 30-min proctor",
    venue: "Xavier University Campus",
    isFullDay: false,
    accentColor: "#34d399",
    image: "/images/events/event-10.jpeg",
    isSplit: true,
    sessions: [
      {
        sessionName: "Preliminary Round",
        time: "9:00–9:30 AM",
        venue: "Xavier University Campus",
        duration: "30 mins",
        note: "Online proctored preliminary screening round.",
      },
      {
        sessionName: "Stage Finals",
        time: "2:30–4:30 PM",
        venue: "Xavier University Campus",
        duration: "2 hrs",
        note: "Onstage buzzer rounds for qualifying finalists.",
      },
    ],
    clashWarning: "Split schedule: morning screening & afternoon stage finals.",
  },

  // TRACK E — WORKSHOPS & KNOWLEDGE
  {
    id: "hack-the-skill",
    name: "Hack the Skill",
    type: "Workshop",
    trackLetter: "E",
    trackName: "Track E — Workshops & Knowledge",
    time: "9:00 AM–4:30 PM",
    duration: "Full day",
    venue: "Xavier University Campus",
    isFullDay: true,
    accentColor: "#f472b6",
    image: "/events/hack-the-skill.png",
    clashWarning: "Full-day masterclass; participants cannot enter parallel timed competitions.",
  },
];

// Track list for fast filtering
export const TRACK_FILTERS = [
  { letter: "ALL", label: "All Tracks", count: 13, color: "#35e0c9" },
  { letter: "A", label: "Track A", fullName: "Flagship Innovation", count: 1, color: "#ff6848" },
  { letter: "B", label: "Track B", fullName: "Coding & Development", count: 5, color: "#f0a15b" },
  { letter: "C", label: "Track C", fullName: "Gaming & Adventure", count: 3, color: "#60a5fa" },
  { letter: "D", label: "Track D", fullName: "Stage & Central Events", count: 3, color: "#34d399" },
  { letter: "E", label: "Track E", fullName: "Workshops & Knowledge", count: 1, color: "#f472b6" },
] as const;
