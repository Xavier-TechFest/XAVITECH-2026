export interface Person {
  name: string;
  email?: string;
  linkedin?: string; // full URL, e.g. "https://www.linkedin.com/in/username"
  image?: string;
}

// Committee member helper. Add email / linkedin when you have them:
// m("Utkarsh Gupta", "utkarsh@gmail.com", "https://www.linkedin.com/in/utkarsh")
const m = (name: string, email?: string, linkedin?: string): Person => ({ name, email, linkedin });

export const patron: Person = { name: "Fr. Dr. Martin Poras SJ", email: "[patron@xup.ac.in]" };
export const convenor: Person = { name: "Dr. Piyush Verma", email: "[convenor@xup.ac.in]" };

export const overallCoordinators: Person[] = [
  { name: "Shlok Dhadhich", email: "[coordinator1@xup.ac.in]" },
  { name: "Vaishnavi Ambastha", email: "[coordinator2@xup.ac.in]" },
];

export interface TrackData {
  name: string;
  leads: Person[];
  events: { name: string; leads: Person[] }[];
}

const p = (label: string): Person => ({
  name: `[${label} Name]`,
  email: `[${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}@gmail.com]`,
});

export const tracks: TrackData[] = [
  {
    name: "Hackathon",
    leads: [m("Utkarsh Gupta"), m("Rajnish Kumar")],
    events: [],
  },
  {
    name: "Coding & Development",
    leads: [m("Priyanshu John Thakur")],
    events: [
      { name: "Debugging Challenge", leads: [m("Priyanshu Kumar"), m("Akshat Raj")] },
      { name: "Web Development", leads: [m("Divyanka Keshri"), m("Ashu Kumar")] },
      { name: "Data Analytics Challenge", leads: [m("Komal Anand"), m("Aditya Raj")] },
      { name: "Code Sprint", leads: [m("Kunal"), m("Aadya Ayushi")] },
    ],
  },
  {
    name: "Gaming & Adventure",
    leads: [m("Bittu Raj")],
    events: [
      { name: "Gaming Competition", leads: [m("Umang Sahni"), m("Joshua Singh")] },
      { name: "Tech Treasure Hunt", leads: [m("Sunny Kumar"), m("Shristi Singh")] },
      { name: "Death Race", leads: [m("Jai Vardhan"), m("Ayush Kumar")] },
    ],
  },
  {
    name: "Stage & Central Events",
    leads: [m("Shourya Shresth"), m("Shivanshu Gupta")],
    events: [
      { name: "Tech Quiz", leads: [m("Aman Raj"), m("Princy Kumari")] },
      { name: "AI Prompt Battle / AI Movies Quest", leads: [m("Ayush Kumar"), m("Krishna")] },
      { name: "Model United Nations", leads: [m("Zoha Ashraf Azad"), m("Archie Mrinal")] },
      { name: "Ideathon", leads: [m("Reianna Kumari")] },
    ],
  },
  {
    name: "Workshops & Knowledge",
    leads: [m("Unnati Singh"), m("Srishti Sharma")],
    events: [],
  },
];

export const webTeam: Person[] = [p("Web Team Member 1"), p("Web Team Member 2"), p("Web Team Member 3")];
