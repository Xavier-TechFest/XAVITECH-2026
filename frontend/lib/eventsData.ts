// ==============================================================================
// XAVITECH 2026 — Official Events & Tracks Data Architecture
// Primary Source of Truth: Consolidated Track Leader Event Specifications
// ==============================================================================

/**
 * Specification for an individual participant or team input field in registration forms.
 */
export interface ParticipantFieldSpec {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "select" | "file" | "textarea";
  required: boolean;
  placeholder?: string;
  options?: string[];
  helpText?: string;
  accept?: string;
  pattern?: string;
}

/**
 * Structured document requirement abstraction.
 */
export interface DocumentRequirement {
  key: string; // e.g. "collegeId", "profilePhoto", "governmentId", "undertaking"
  label: string;
  type: "image" | "pdf" | "image_or_pdf";
  required: boolean;
  helpText?: string;
  accept?: string;
}

/**
 * Structured prize breakdown specification.
 */
export interface PrizeBreakdown {
  total?: string;
  first?: string;
  second?: string;
  third?: string;
  mvp?: string;
  special?: string;
  note?: string;
}

/**
 * Event-specific registration policy and workflow rules.
 */
export interface RegistrationPolicy {
  /**
   * Team name rule:
   * - "always": Team name is always required (even for minimum team size)
   * - "if_team": Required only when participating as a team (teamSize > 1)
   * - "never": Team name is not collected/required
   */
  teamNamePolicy?: "always" | "never" | "if_team";

  /**
   * For events like Ideathon (where leader adds 1 teammate in form, remaining join via link)
   * or Cipher Chase (leader adds up to 4 in form, remaining join via link):
   * Maximum participants entered directly during initial registration form.
   */
  maxInitialFormParticipants?: number;

  /**
   * Whether substitute players can be entered (e.g. P5 for Battlefield Blitz)
   */
  hasSubstitute?: boolean;
  substituteOptional?: boolean;

  /**
   * Minimum participant age if applicable (e.g. 16 for Data Analytics)
   */
  minimumAge?: number;
  minAge?: number;

  /**
   * Whether additional team members join by invite link after creation
   */
  joinByInviteAfterCreation?: boolean;

  /**
   * Whether school/college pool selection applies (e.g. InnoCraft)
   */
  poolOptions?: Array<{
    id: string;
    label: string;
    fee: number;
    feeDisplay: string;
    classOptions?: string[];
  }>;

  /**
   * Whether all participants must belong to the exact same institution
   */
  sameInstitutionRequired?: boolean;
}

/**
 * Configuration for event registration workflows.
 */
export interface RegistrationConfig {
  eventFormat: "individual" | "team";
  minTeamSize?: number;
  maxTeamSize?: number;
  feeAmount?: number;
  feeBasis?: "per_team" | "per_player" | "per_participant";
  feeDisplay: string;
  deadline: string;
  deadlineDate?: string;
  teamNameRequired?: boolean;
  participantFields: ParticipantFieldSpec[];
  teamFields?: ParticipantFieldSpec[];
  coordinator?: {
    name: string;
    phone?: string;
    email?: string;
    coCoordinator?: string;
  };
  details?: {
    committee?: string;
    agenda?: string;
    duration?: string;
    game?: string;
    maps?: string[];
    format?: string;
    note?: string;
  };
  declarations?: string[];
  customDeclaration?: string;
  documents?: DocumentRequirement[];
  policy?: RegistrationPolicy;
}

/**
 * Comprehensive event item entity.
 */
export interface EventItem {
  id: string;
  name: string;
  fullTitle: string;
  badge: string;
  badgeLevel: "Crucible" | "Advanced" | "Intermediate" | "Beginner";
  aliases?: string[];
  isFlagship?: boolean;
  trackId: string;
  trackName: string;
  shortDesc: string;
  fullDesc: string;
  time: string;
  date: string;
  prize: string;
  price: string;
  team: string;
  venue: string;
  accentColor: string;
  glowColor: string;
  borderColor: string;
  image: string;
  imagePosition?: string;
  imageScale?: number;
  highlights: string[];
  rules: string[];
  registrationConfig?: RegistrationConfig;
  coordinatorRequirements?: string[];
  eligibility?: string[];
  registrationInfo?: string[];
  requirements?: string[];
  prizeBreakdown?: PrizeBreakdown;
  documents?: DocumentRequirement[];
}

/**
 * Track definition entity.
 */
export interface TrackItem {
  id: string;
  num: string;
  letter: string;
  name: string;
  subtitle: string;
  description: string;
  accentColor: string;
  badgeClass: string;
}

// ==============================================================================
// 1. TRACKS
// ==============================================================================

export const TRACKS: TrackItem[] = [
  {
    id: "all",
    num: "00",
    letter: "ALL",
    name: "ALL EVENTS",
    subtitle: "XAVITECH 2026",
    description: "Explore all 13 confirmed event listings across five tracks.",
    accentColor: "#35e0c9",
    badgeClass: "border-circuit/60 text-circuit bg-circuit/10",
  },
  {
    id: "track-a",
    num: "01",
    letter: "A",
    name: "HACKATHON",
    subtitle: "Build and create",
    description: "Hackathon event",
    accentColor: "#ff6848",
    badgeClass: "border-orange-400/60 text-orange-300 bg-orange-500/10",
  },
  {
    id: "track-b",
    num: "02",
    letter: "B",
    name: "CODING & DEVELOPMENT",
    subtitle: "Code and solve",
    description: "Coding and development events",
    accentColor: "#35e0c9",
    badgeClass: "border-cyan-400/60 text-cyan-300 bg-cyan-500/10",
  },
  {
    id: "track-c",
    num: "03",
    letter: "C",
    name: "GAMING & ADVENTURE",
    subtitle: "Play and explore",
    description: "Gaming and adventure events",
    accentColor: "#60a5fa",
    badgeClass: "border-blue-400/60 text-blue-300 bg-blue-500/10",
  },
  {
    id: "track-d",
    num: "04",
    letter: "D",
    name: "STAGE & CENTRAL EVENTS",
    subtitle: "Ideas and competition",
    description: "Stage and central events",
    accentColor: "#34d399",
    badgeClass: "border-emerald-400/60 text-emerald-300 bg-emerald-500/10",
  },
  {
    id: "track-e",
    num: "05",
    letter: "E",
    name: "WORKSHOPS & KNOWLEDGE",
    subtitle: "Learn by doing",
    description: "Workshops and knowledge events",
    accentColor: "#f472b6",
    badgeClass: "border-pink-400/60 text-pink-300 bg-pink-500/10",
  },
];

// ==============================================================================
// 2. REUSABLE FIELD & DECLARATION DEFINITIONS
// ==============================================================================

const common: ParticipantFieldSpec[] = [
  { id: "fullName", label: "Full name", type: "text", required: true },
  { id: "college", label: "Institution name", type: "text", required: true },
  { id: "course", label: "Department / Course / Class", type: "text", required: true },
  { id: "year", label: "Year / Semester", type: "text", required: true },
  { id: "mobile", label: "Mobile number", type: "tel", required: true, placeholder: "10-digit Indian mobile number", pattern: "[6-9][0-9]{9}" },
  { id: "email", label: "Email address", type: "email", required: true },
  { id: "city", label: "City", type: "text", required: true },
];

const idPhoto: ParticipantFieldSpec = {
  id: "collegeId",
  label: "College ID card",
  type: "file",
  required: true,
  accept: "image/*,.pdf",
  helpText: "Upload a clear image or PDF.",
};

const profilePhoto: ParticipantFieldSpec = {
  id: "profilePhoto",
  label: "Profile photo",
  type: "file",
  required: true,
  accept: "image/*",
  helpText: "Recent, clear passport-style photo.",
};

const baseDeclarations = [
  "I confirm that the information I provided is accurate.",
  "I agree to follow the event rules.",
  "I agree to follow the event code of conduct.",
  "I consent to the use of my information for event administration.",
  "I consent to the use of event photos/videos featuring me for official promotion.",
];

const deathRaceDeclarations = [
  "I confirm that the information I provided is accurate.",
  "I agree to follow the event rules.",
  "I agree to follow the event code of conduct.",
  "I consent to the use of event photos/videos featuring me for official promotion.",
];

// ==============================================================================
// 3. EVENT-SPECIFIC PARTICIPANT FIELD SETS
// ==============================================================================

const techQuizFields: ParticipantFieldSpec[] = [
  ...common,
  { id: "section", label: "Section (optional)", type: "text", required: false },
  { id: "studentId", label: "Student ID / Roll number", type: "text", required: true },
  idPhoto,
  profilePhoto,
];

const hackTheSkillFields: ParticipantFieldSpec[] = [
  { id: "fullName", label: "Full name", type: "text", required: true },
  { id: "college", label: "Institution name", type: "text", required: true },
  { id: "course", label: "Department / Course / Class", type: "text", required: true },
  { id: "year", label: "Year / Semester (optional)", type: "text", required: false },
  { id: "section", label: "Section (optional)", type: "text", required: false },
  { id: "mobile", label: "Mobile number", type: "tel", required: true, placeholder: "Valid mobile number" },
  { id: "email", label: "Email address", type: "email", required: true },
  { id: "studentId", label: "Student ID / Roll number (optional)", type: "text", required: false },
  { id: "city", label: "City", type: "text", required: true },
  { ...idPhoto, label: "Valid school / college ID card" },
  profilePhoto,
];

const battleOfBotsFields: ParticipantFieldSpec[] = [
  { id: "fullName", label: "Full name", type: "text", required: true },
  { id: "college", label: "Institution name", type: "text", required: true },
  { id: "course", label: "Department / Course", type: "text", required: true },
  { id: "year", label: "Year / Semester", type: "text", required: true },
  { id: "mobile", label: "Mobile number", type: "tel", required: true, placeholder: "Valid mobile number" },
  { id: "email", label: "Email address", type: "email", required: true },
  { id: "collegeId", label: "Valid college ID card", type: "file", required: true, accept: "image/*,.pdf", helpText: "Upload a clear image or PDF." },
];

const debugDerbyFields: ParticipantFieldSpec[] = [
  { id: "fullName", label: "Full name", type: "text", required: true },
  { id: "college", label: "Institution name", type: "text", required: true, placeholder: "Current school, college, or university" },
  { id: "course", label: "Department / Course / Class", type: "text", required: true, placeholder: "e.g. Class 11, Class 12, BCA, B.Tech" },
  { id: "year", label: "Year / Semester (optional)", type: "text", required: false, placeholder: "For undergraduate participants, if applicable" },
  { id: "mobile", label: "Mobile number", type: "tel", required: true, placeholder: "Valid mobile number" },
  { id: "email", label: "Email address", type: "email", required: true, placeholder: "For event updates" },
  { id: "city", label: "City (optional)", type: "text", required: false, placeholder: "Home city" },
  { id: "hackerRank", label: "HackerRank username / account email", type: "text", required: true, placeholder: "Verified HackerRank account" },
  { id: "language", label: "Debugging language", type: "select", required: true, options: ["Python", "Java", "C", "C++", "JavaScript"] },
  { ...idPhoto, label: "Valid School / College ID Card" },
  { ...profilePhoto, label: "Profile photo (optional)", required: false },
];

const runtimeRushFields: ParticipantFieldSpec[] = [
  { id: "fullName", label: "Full name", type: "text", required: true },
  { id: "college", label: "Institution name", type: "text", required: true },
  { id: "course", label: "Department / Course / Class", type: "text", required: true, placeholder: "e.g. Class 11, BCA, B.Tech" },
  { id: "year", label: "Year / Semester (optional)", type: "text", required: false },
  { id: "mobile", label: "Mobile number", type: "tel", required: true, placeholder: "Valid mobile number" },
  { id: "email", label: "Email address", type: "email", required: true },
  { id: "studentId", label: "Student ID / Roll number (optional)", type: "text", required: false },
  { id: "city", label: "City (optional)", type: "text", required: false },
  { id: "language", label: "Programming language", type: "select", required: true, options: ["Java", "C", "C++", "Python", "JavaScript"] },
  { id: "collegeId", label: "Student ID card or signed institutional undertaking", type: "file", required: true, accept: "image/*,.pdf", helpText: "Each participant must have a valid school/college ID. If unavailable, upload an undertaking signed by their current or previous institution." },
  { id: "profilePhoto", label: "Profile photo (optional)", type: "file", required: false, accept: "image/*" },
];

const dataAnalyticsFields: ParticipantFieldSpec[] = [
  { id: "fullName", label: "Full name", type: "text", required: true },
  { id: "college", label: "Institution name", type: "text", required: true },
  { id: "course", label: "Department / Course / Class", type: "text", required: true },
  { id: "birthDate", label: "Date of birth", type: "date", required: true, helpText: "Select your date of birth from the calendar. Participants must be over 16." },
  { id: "year", label: "Year / Semester (optional)", type: "text", required: false },
  { id: "section", label: "Section (optional)", type: "text", required: false },
  { id: "mobile", label: "Mobile number", type: "tel", required: true, placeholder: "Valid mobile number" },
  { id: "email", label: "Email address", type: "email", required: true },
  { id: "studentId", label: "Student ID / Roll number (optional)", type: "text", required: false },
  { id: "city", label: "City", type: "text", required: true },
  { ...idPhoto, label: "Student ID card or signed institutional undertaking", helpText: "Upload a valid, unexpired ID card. If unavailable, upload an undertaking signed by your current or previous institution." },
  { ...profilePhoto, required: false },
];

const webWeaveFields: ParticipantFieldSpec[] = [
  { id: "fullName", label: "Full name", type: "text", required: true, placeholder: "As shown on your ID" },
  { id: "college", label: "Institution name", type: "text", required: true, placeholder: "School or college name" },
  { id: "course", label: "Department / Course", type: "text", required: true, placeholder: "For school students, enter School; e.g. BCA" },
  { id: "year", label: "Class / Year / Semester", type: "select", required: true, options: ["Class 10", "Class 11", "Class 12", "UG Year 1", "UG Year 2", "UG Year 3", "UG Year 4", "UG Semester 1", "UG Semester 2", "UG Semester 3", "UG Semester 4", "UG Semester 5", "UG Semester 6", "UG Semester 7", "UG Semester 8", "Other"] },
  { id: "mobile", label: "Mobile number", type: "tel", required: true, placeholder: "10-digit mobile number", pattern: "[0-9]{10}" },
  { id: "email", label: "Email address", type: "email", required: true, placeholder: "Confirmation will be sent to the team leader" },
  { id: "studentId", label: "Student ID / Roll number (optional)", type: "text", required: false, placeholder: "Letters and numbers", pattern: "[A-Za-z0-9]+" },
  { id: "collegeId", label: "School / College ID card", type: "file", required: true, accept: ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf", helpText: "Required for both participants. School ID is accepted for Class 10 and above." },
];

const cipherChaseFields: ParticipantFieldSpec[] = [
  { id: "fullName", label: "Full name", type: "text", required: true },
  { id: "college", label: "Institution name", type: "text", required: true },
  { id: "course", label: "Department / Course (optional)", type: "text", required: false },
  { id: "mobile", label: "Team leader mobile number", type: "tel", required: true },
  { id: "email", label: "Team leader email address", type: "email", required: true },
  { id: "studentId", label: "Student ID / Roll number", type: "text", required: true },
  { id: "city", label: "City", type: "text", required: true },
  { id: "profilePhoto", label: "Team leader profile photo (optional)", type: "file", required: false, accept: "image/*" },
  { id: "collegeId", label: "College ID card", type: "file", required: true, accept: "image/*,.pdf", helpText: "Required for every team member." },
];

const velocityXFields: ParticipantFieldSpec[] = [
  { id: "fullName", label: "Full name", type: "text", required: true },
  { id: "college", label: "Institution name", type: "text", required: true },
  { id: "mobile", label: "Mobile number", type: "tel", required: true, placeholder: "10-digit Indian mobile number", pattern: "[6-9][0-9]{9}" },
  { id: "studentId", label: "Student ID / Roll number", type: "text", required: true },
  { id: "year", label: "Year / Semester (optional)", type: "text", required: false },
  { id: "email", label: "Email address (optional)", type: "email", required: false },
  { id: "city", label: "City (optional)", type: "text", required: false },
  { ...profilePhoto, required: false },
  idPhoto,
];

// Alias for backwards compatibility
const deathRaceFields: ParticipantFieldSpec[] = velocityXFields;

const lootGoblinsFields: ParticipantFieldSpec[] = [
  { id: "fullName", label: "Full name", type: "text", required: true },
  { id: "college", label: "Institution name", type: "text", required: true },
  { id: "course", label: "Department / Course (optional)", type: "text", required: false },
  { id: "year", label: "Year / Semester (optional)", type: "text", required: false },
  { id: "mobile", label: "Mobile number", type: "tel", required: true, placeholder: "10-digit Indian mobile number", pattern: "[6-9][0-9]{9}" },
  { id: "email", label: "Email address", type: "email", required: true },
  { id: "studentId", label: "Student ID / Roll number (XUP students)", type: "text", required: false, helpText: "Required for Xavier University Patna students; leave blank if you are an external participant." },
  { id: "city", label: "City (optional)", type: "text", required: false },
  { id: "ign", label: "BGMI In-Game Name (IGN)", type: "text", required: true },
  { id: "uid", label: "BGMI Character ID / UID", type: "text", required: true },
  { ...profilePhoto, required: false },
  { ...idPhoto, label: "College ID or Government Photo ID", helpText: "XUP students: upload college ID. External players: upload a government-issued photo ID." },
];

// ==============================================================================
// 4. THE 13 OFFICIAL XAVITECH 2026 EVENTS
// ==============================================================================

export const EVENTS: EventItem[] = [
  // ----------------------------------------------------------------------------
  // 1. INNOCRAFT (Hackathon) — Track A
  // ----------------------------------------------------------------------------
  {
    id: "innocraft",
    name: "INNOCRAFT",
    fullTitle: "Innocraft — Hackathon",
    badge: "Track A",
    badgeLevel: "Crucible",
    trackId: "track-a",
    trackName: "TRACK A — HACKATHON",
    shortDesc: "A team hackathon for school and college participants.",
    fullDesc: "InnoCraft is a team hackathon for school and college participants. Teams register together through one team leader.",
    date: "TBA",
    time: "TBA",
    prize: "To Be Announced",
    price: "₹800 per school team / ₹1,000 per college team",
    team: "Exactly 4 members",
    venue: "TBA",
    accentColor: "#ff6848",
    glowColor: "rgba(255,104,72,.25)",
    borderColor: "rgba(255,104,72,.5)",
    image: "/images/events/event-01.jpeg",
    highlights: [],
    rules: [],
    eligibility: [
      "School Teams: Open to Classes 9–12. All members must belong to the same school.",
      "College Teams: Open to undergraduate and postgraduate students; external participants are allowed.",
      "All courses and academic years/semesters are eligible. There is no age restriction.",
    ],
    registrationInfo: [
      "The team leader submits one registration for all four participants. Separate member registrations are not allowed.",
      "Team name is required. A participant cannot join multiple teams.",
    ],
    requirements: [
      "Every participant must provide full name, institution, course/department, year/semester, mobile number, email, student ID/roll number, and city.",
      "Every participant must verify email/mobile and upload a valid school/college ID card.",
    ],
    prizeBreakdown: {
      total: "To Be Announced",
      note: "Prizes will be announced closer to the event date.",
    },
    documents: [
      {
        key: "collegeId",
        label: "Valid School / College ID Card",
        type: "image_or_pdf",
        required: true,
        accept: "image/*,.pdf",
        helpText: "Upload a clear image or PDF.",
      },
    ],
    registrationConfig: {
      eventFormat: "team",
      minTeamSize: 4,
      maxTeamSize: 4,
      feeDisplay: "₹800 per school team / ₹1,000 per college team",
      deadline: "TBA",
      teamNameRequired: true,
      teamFields: [
        { id: "pool", label: "Participant pool", type: "select", required: true, options: ["School", "College"] },
        { id: "teamName", label: "Team name", type: "text", required: true },
      ],
      participantFields: [
        ...common,
        { id: "studentId", label: "Student ID / Roll number", type: "text", required: true },
        { ...idPhoto, label: "Valid School / College ID Card" },
      ],
      coordinator: {
        name: "Utkarsh Gupta",
        phone: "8252210728",
        email: "utkarshgupta1821@gmail.com",
        coCoordinator: "Rajnish Kumar",
      },
      declarations: baseDeclarations,
      documents: [
        {
          key: "collegeId",
          label: "Valid School / College ID Card",
          type: "image_or_pdf",
          required: true,
          accept: "image/*,.pdf",
          helpText: "Upload a clear image or PDF.",
        },
      ],
      policy: {
        teamNamePolicy: "always",
        sameInstitutionRequired: true,
        poolOptions: [
          {
            id: "School",
            label: "School Teams (Classes 9–12)",
            fee: 800,
            feeDisplay: "₹800 per school team",
            classOptions: ["Class 9", "Class 10", "Class 11", "Class 12"],
          },
          {
            id: "College",
            label: "College Teams (UG & PG)",
            fee: 1000,
            feeDisplay: "₹1,000 per college team",
          },
        ],
      },
    },
  },

  // ----------------------------------------------------------------------------
  // 2. WEBWEAVE (Web Development Challenge) — Track B
  // ----------------------------------------------------------------------------
  {
    id: "webweave",
    name: "WEBWEAVE",
    fullTitle: "WebWeave: Web Development Challenge",
    badge: "Track B",
    badgeLevel: "Intermediate",
    trackId: "track-b",
    trackName: "TRACK B — CODING & DEVELOPMENT",
    shortDesc: "A two-person web development challenge.",
    fullDesc: "WebWeave is a team web development challenge for school students in Class 10 and above and undergraduate students, including BCA students. Teams of two bring their own laptop and charger, then build around one shared theme in a four-hour build phase.",
    date: "TBA",
    time: "TBA",
    prize: "To Be Announced",
    price: "₹300 registration fee",
    team: "Exactly 2 members",
    venue: "TBA",
    accentColor: "#35e0c9",
    glowColor: "rgba(53,224,201,.2)",
    borderColor: "rgba(53,224,201,.4)",
    image: "/images/events/event-03.jpeg",
    highlights: [
      "Four-hour build phase.",
      "Teams must bring their own laptop and charger.",
    ],
    rules: [
      "Internet access and AI tools are not allowed during the four-hour build phase.",
      "All teams receive the same theme. Theme-specific resources may be downloaded only during the designated short download window.",
      "Do not bring a pre-built solution for the theme.",
    ],
    eligibility: [
      "Open to students in Class 10 and above and undergraduate students, including BCA students, with basic web development knowledge. Anyone interested in web development may participate.",
      "All courses and departments are eligible. There is no age restriction. External participants are allowed.",
    ],
    registrationInfo: [
      "Teams must have exactly two participants. The team leader enters both members during registration; separate registrations are not allowed.",
      "A team name and team leader are required. Participants cannot join more than one team.",
      "After successful registration, a unique team/registration ID and confirmation email will be sent to the team leader.",
    ],
    requirements: [
      "Both participants must provide full name, institution, course/department, class/year/semester, 10-digit mobile number, email, and a school/college ID card.",
      "Student ID/roll number is optional. Section, profile photo, city, and other participant fields are not required.",
      "Basic HTML, CSS, and JavaScript knowledge is required. Bring one laptop and charger per team.",
    ],
    prizeBreakdown: {
      total: "To Be Announced",
    },
    documents: [
      {
        key: "collegeId",
        label: "School / College ID card",
        type: "image_or_pdf",
        required: true,
        accept: ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf",
        helpText: "Required for both participants. School ID is accepted for Class 10 and above.",
      },
    ],
    registrationConfig: {
      eventFormat: "team",
      minTeamSize: 2,
      maxTeamSize: 2,
      feeAmount: 300,
      feeBasis: "per_team",
      feeDisplay: "₹300 registration fee",
      deadline: "25 October 2026",
      deadlineDate: "2026-10-25",
      teamNameRequired: true,
      teamFields: [
        { id: "teamName", label: "Team name", type: "text", required: true },
      ],
      participantFields: webWeaveFields,
      coordinator: {
        name: "Divyanka Keshri",
        phone: "9263641089",
        email: "divyankakeshri8@gmail.com",
        coCoordinator: "Ashu Kumar",
      },
      details: {
        duration: "4-hour build phase",
        format: "Shared theme · HTML, CSS, and JavaScript",
      },
      declarations: baseDeclarations,
      customDeclaration: "I confirm that both team members have read and agree to follow the event rules.",
      documents: [
        {
          key: "collegeId",
          label: "School / College ID card",
          type: "image_or_pdf",
          required: true,
          accept: ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf",
          helpText: "Required for both participants. School ID is accepted for Class 10 and above.",
        },
      ],
      policy: {
        teamNamePolicy: "always",
      },
    },
  },

  // ----------------------------------------------------------------------------
  // 3. RUNTIME RUSH (Coding Challenge) — Track B
  // ----------------------------------------------------------------------------
  {
    id: "runtime-rush",
    name: "RUNTIME RUSH",
    fullTitle: "Runtime Rush — The Coding Challenge",
    badge: "Track B",
    badgeLevel: "Advanced",
    trackId: "track-b",
    trackName: "TRACK B — CODING & DEVELOPMENT",
    shortDesc: "An individual or two-person coding challenge for school and college students.",
    fullDesc: "Runtime Rush is a coding challenge open to school and college students. Participate individually or register with one teammate. Participants compete using Java, C, C++, Python, or JavaScript.",
    date: "TBA",
    time: "TBA",
    prize: "To Be Announced",
    price: "₹300 registration fee",
    team: "Individual or 2 participants",
    venue: "TBA",
    accentColor: "#35e0c9",
    glowColor: "rgba(53,224,201,.2)",
    borderColor: "rgba(53,224,201,.4)",
    image: "/images/events/event-05.jpeg",
    highlights: [
      "Choose individual participation or a team of two.",
      "Supported languages: Java, C, C++, Python, JavaScript.",
    ],
    rules: [
      "Participants must hold a valid school/college ID card. If they do not have an ID card, they must provide a proper undertaking signed by their current or previous institution.",
    ],
    eligibility: [
      "Open to school and college students with a valid student ID card or the required signed institutional undertaking.",
      "All courses and years/semesters are eligible. External participants are allowed. No age restriction.",
    ],
    registrationInfo: [
      "Register individually or enter both participants during registration. Participants may not join multiple teams.",
      "A team name is required for two-person teams. No team leader designation is required; either member may submit the team registration.",
    ],
    requirements: [
      "For each participant: full name, school/college/university, department/course/class, programming language, and valid student ID card or signed institutional undertaking are required.",
      "Mobile number and email are required for the registering participant. Year/semester, student ID/roll number, profile photo, and city are optional. Section is not collected.",
      "Programming language options: Java, C, C++, Python, and JavaScript.",
    ],
    prizeBreakdown: {
      total: "To Be Announced",
    },
    documents: [
      {
        key: "collegeId",
        label: "Student ID card or signed institutional undertaking",
        type: "image_or_pdf",
        required: true,
        accept: "image/*,.pdf",
        helpText: "Each participant must have a valid school/college ID. If unavailable, upload an undertaking signed by their current or previous institution.",
      },
      {
        key: "profilePhoto",
        label: "Profile photo (optional)",
        type: "image",
        required: false,
        accept: "image/*",
      },
    ],
    registrationConfig: {
      eventFormat: "team",
      minTeamSize: 1,
      maxTeamSize: 2,
      feeAmount: 300,
      feeDisplay: "₹300 registration fee",
      deadline: "To be decided by Overall Coordinators",
      teamNameRequired: true,
      teamFields: [
        { id: "teamName", label: "Team name", type: "text", required: true },
      ],
      participantFields: runtimeRushFields,
      coordinator: {
        name: "Kunal",
        phone: "6369933612",
        email: "k8847139@gmail.com",
        coCoordinator: "Aadya Ayushi",
      },
      details: {
        format: "Individual or two participants",
      },
      declarations: baseDeclarations,
      documents: [
        {
          key: "collegeId",
          label: "Student ID card or signed institutional undertaking",
          type: "image_or_pdf",
          required: true,
          accept: "image/*,.pdf",
        },
        {
          key: "profilePhoto",
          label: "Profile photo (optional)",
          type: "image",
          required: false,
          accept: "image/*",
        },
      ],
      policy: {
        teamNamePolicy: "if_team",
      },
    },
  },

  // ----------------------------------------------------------------------------
  // 4. DATA ANALYTICS (VLookUp) — Track B
  // ----------------------------------------------------------------------------
  {
    id: "vlookup",
    name: "DATA ANALYTICS",
    aliases: ["data-analytics"],
    fullTitle: "XAVITECH 2026 — Data Analytics",
    badge: "Track B",
    badgeLevel: "Intermediate",
    trackId: "track-b",
    trackName: "TRACK B — CODING & DEVELOPMENT",
    shortDesc: "A two-person data analytics competition using Excel and Power BI.",
    fullDesc: "XAVITECH 2026 Data Analytics is a team competition for pairs. Participants should know Excel and Power BI. The event is open to Class 7–12, undergraduate, and postgraduate students over 16 years old.",
    date: "TBA",
    time: "TBA",
    prize: "To Be Announced",
    price: "₹300 registration fee",
    team: "2 participants",
    venue: "TBA",
    accentColor: "#35e0c9",
    glowColor: "rgba(53,224,201,.2)",
    borderColor: "rgba(53,224,201,.4)",
    image: "/images/events/event-04.jpeg",
    highlights: [
      "Team of two · Excel and Power BI knowledge required.",
    ],
    rules: [
      "Every participant must be over 16 years old.",
      "Participants must have a valid, unexpired school/college ID card. If unavailable, provide a proper undertaking signed by the current or previous institution.",
    ],
    eligibility: [
      "Open to Class 7–12, undergraduate, and postgraduate students over 16 years old.",
      "Any course or department is eligible; all years/semesters are eligible. External participants are allowed.",
      "Participants must know Excel and Power BI.",
    ],
    registrationInfo: [
      "Team participation only; teams must have exactly two members. One team member submits registration and enters both participants.",
      "A team name and team leader are required. Separate member registrations and participation on multiple teams are not allowed.",
    ],
    requirements: [
      "For both participants: full name, school/college/university, department/course/class, date of birth, mobile, email, city, and a valid unexpired school/college ID card or signed institutional undertaking.",
      "Year/semester, section, student ID/roll number, and profile photo are optional. Both participants must verify email/mobile and upload ID proof.",
      "Prerequisite: knowledge of Excel and Power BI.",
    ],
    prizeBreakdown: {
      total: "To Be Announced",
    },
    documents: [
      {
        key: "collegeId",
        label: "Student ID card or signed institutional undertaking",
        type: "image_or_pdf",
        required: true,
        accept: "image/*,.pdf",
        helpText: "Upload a valid, unexpired ID card. If unavailable, upload an undertaking signed by your current or previous institution.",
      },
      {
        key: "profilePhoto",
        label: "Profile photo (optional)",
        type: "image",
        required: false,
        accept: "image/*",
      },
    ],
    registrationConfig: {
      eventFormat: "team",
      minTeamSize: 2,
      maxTeamSize: 2,
      feeAmount: 300,
      feeBasis: "per_team",
      feeDisplay: "₹300 registration fee",
      deadline: "To be decided by overall coordinators",
      teamNameRequired: true,
      teamFields: [
        { id: "teamName", label: "Team name", type: "text", required: true },
      ],
      participantFields: dataAnalyticsFields,
      coordinator: {
        name: "Komal Anand",
        phone: "7493024995",
        email: "komalanandd01@gmail.com",
        coCoordinator: "Aditya",
      },
      declarations: baseDeclarations,
      customDeclaration: "I confirm that each uploaded ID card is valid and has not expired.",
      documents: [
        {
          key: "collegeId",
          label: "Student ID card or signed institutional undertaking",
          type: "image_or_pdf",
          required: true,
          accept: "image/*,.pdf",
        },
        {
          key: "profilePhoto",
          label: "Profile photo (optional)",
          type: "image",
          required: false,
          accept: "image/*",
        },
      ],
      policy: {
        teamNamePolicy: "always",
        minimumAge: 16,
      },
    },
  },

  // ----------------------------------------------------------------------------
  // 5. DEBUG DERBY (Debugging Challenge) — Track B
  // ----------------------------------------------------------------------------
  {
    id: "debug-derby",
    name: "DEBUG DERBY",
    fullTitle: "XAVITECH 2026 — Debug Derby: The Debugging Challenge",
    badge: "Track B",
    badgeLevel: "Advanced",
    trackId: "track-b",
    trackName: "TRACK B — CODING & DEVELOPMENT",
    shortDesc: "An individual debugging challenge for school and undergraduate students.",
    fullDesc: "Debug Derby is an individual programming challenge for Class 11, Class 12, and undergraduate students. Participants compete in two debugging rounds with a combined duration of 90 minutes: basic debugging followed by advanced debugging. A verified HackerRank account is required at least 24 hours before the event.",
    date: "TBA",
    time: "TBA",
    prize: "₹3,000",
    price: "₹200 per participant",
    team: "Individual",
    venue: "TBA",
    accentColor: "#35e0c9",
    glowColor: "rgba(53,224,201,.2)",
    borderColor: "rgba(53,224,201,.4)",
    image: "/images/events/event-02.jpeg",
    highlights: [
      "Two debugging rounds · 90 minutes combined.",
      "Round 1: basic debugging. Round 2: advanced debugging.",
      "Prizes: 1st ₹3,000, 2nd ₹2,000, and 3rd ₹1,000.",
    ],
    rules: [
      "Individual participation only. Use your own verified HackerRank account and work independently.",
      "AI assistants, code-generation tools, collaboration, copied code, and other unauthorized assistance are prohibited and may lead to immediate disqualification.",
      "Report technical failures to an invigilator immediately. Verified organizer-side infrastructure failures may receive time compensation or a move to a pre-tested backup computer. HackerRank-wide outages are handled by the faculty/event coordinator.",
    ],
    eligibility: [
      "Eligible participants are Class 11, Class 12, and undergraduate students.",
      "No department restriction; participants should have basic programming knowledge. All UG years/semesters are eligible.",
      "No separate age restriction is specified; eligibility is based on the stated education categories.",
    ],
    registrationInfo: [
      "Individual registration only.",
      "Create and verify your HackerRank account at least 24 hours before the competition. Use that account during the event.",
    ],
    requirements: [
      "Required: full name, current school/college/university, class/course, mobile number, email, valid school/college ID, HackerRank username/account email, and selected debugging language.",
      "Year/semester, profile photo, and city are optional. Student ID/roll number and section are not collected.",
      "Supported debugging languages: Python, Java, C, C++, and JavaScript. Basic knowledge of at least one is a prerequisite.",
    ],
    prizeBreakdown: {
      total: "₹6,000 combined across 3 places",
      first: "₹3,000",
      second: "₹2,000",
      third: "₹1,000",
      note: "1st ₹3,000, 2nd ₹2,000, and 3rd ₹1,000",
    },
    documents: [
      {
        key: "collegeId",
        label: "Valid School / College ID Card",
        type: "image_or_pdf",
        required: true,
        accept: "image/*,.pdf",
      },
      {
        key: "profilePhoto",
        label: "Profile photo (optional)",
        type: "image",
        required: false,
        accept: "image/*",
      },
    ],
    registrationConfig: {
      eventFormat: "individual",
      minTeamSize: 1,
      maxTeamSize: 1,
      feeAmount: 200,
      feeBasis: "per_participant",
      feeDisplay: "₹200 per participant",
      deadline: "As announced by the Tech Fest organizers",
      participantFields: debugDerbyFields,
      coordinator: {
        name: "Priyanshu Kumar",
        phone: "8677931410",
        email: "Priyanshuk092005@gmail.com",
        coCoordinator: "Akshat Raj",
      },
      details: {
        duration: "Two rounds · 90 minutes combined",
        format: "Round 1: basic debugging · Round 2: advanced debugging",
      },
      declarations: baseDeclarations,
      customDeclaration: "I will use my own verified HackerRank account during the competition.",
      documents: [
        {
          key: "collegeId",
          label: "Valid School / College ID Card",
          type: "image_or_pdf",
          required: true,
          accept: "image/*,.pdf",
        },
        {
          key: "profilePhoto",
          label: "Profile photo (optional)",
          type: "image",
          required: false,
          accept: "image/*",
        },
      ],
      policy: {
        teamNamePolicy: "never",
      },
    },
  },

  // ----------------------------------------------------------------------------
  // 6. MODEL UNITED NATIONS (Unscripted Nations) — Track D
  // ----------------------------------------------------------------------------
  {
    id: "unscripted-nations",
    name: "MODEL UNITED NATIONS",
    aliases: ["model-united-nations", "mun"],
    fullTitle: "XAVITECH 2026 — Model United Nations (MUN)",
    badge: "Track D",
    badgeLevel: "Advanced",
    trackId: "track-d",
    trackName: "TRACK D — STAGE & CENTRAL EVENTS",
    shortDesc: "Individual delegate event of XAVITECH 2026 Model United Nations.",
    fullDesc: "XAVITECH 2026 Model United Nations (MUN) is an individual delegate event for the United Nations Commission on Science and Technology for Development (CSTD).",
    date: "TBA",
    time: "TBA",
    prize: "To Be Announced",
    price: "₹400",
    team: "Individual",
    venue: "TBA",
    accentColor: "#34d399",
    glowColor: "rgba(52,211,153,.2)",
    borderColor: "rgba(52,211,153,.4)",
    image: "/images/events/event-11.jpeg",
    highlights: [
      "Expected participation: 60–70 delegates.",
    ],
    rules: [],
    eligibility: [
      "Open to eligible college/university students. All courses and academic years/semesters are eligible unless restricted by the final event policy.",
      "External participants are allowed subject to final Techfest eligibility and organiser approval. No separate age restriction is proposed.",
    ],
    registrationInfo: [
      "Individual delegate registration; one registration per delegate.",
    ],
    requirements: [
      "Required participant details: full name, college/university, department/course, year/semester, mobile number, email, student ID/roll number, and city. Section is optional.",
      "Upload a valid college ID card and a recent passport-style profile photo.",
      "Delegates must follow committee rules, the event code of conduct, and organiser instructions.",
    ],
    prizeBreakdown: {
      total: "To Be Announced",
    },
    documents: [
      {
        key: "collegeId",
        label: "College ID card",
        type: "image_or_pdf",
        required: true,
        accept: "image/*,.pdf",
      },
      {
        key: "profilePhoto",
        label: "Profile photo",
        type: "image",
        required: true,
        accept: "image/*",
      },
    ],
    registrationConfig: {
      eventFormat: "individual",
      feeAmount: 400,
      feeBasis: "per_participant",
      feeDisplay: "₹400 per delegate",
      deadline: "TBA",
      participantFields: [
        ...common,
        { id: "section", label: "Section (optional)", type: "text", required: false, placeholder: "If applicable" },
        { id: "studentId", label: "Student ID / Roll number", type: "text", required: true },
        idPhoto,
        profilePhoto,
      ],
      coordinator: {
        name: "Zoha Ashraf Azad",
        phone: "8935987885",
        email: "zohaashrafazad11@gmail.com",
        coCoordinator: "Archie",
      },
      details: {
        committee: "United Nations Commission on Science and Technology for Development (CSTD)",
        agenda: "Addressing the Opportunities and Risks of Artificial Intelligence and Emerging Technologies for Inclusive and Sustainable Development",
        duration: "5–5.5 hours",
      },
      declarations: baseDeclarations,
      documents: [
        {
          key: "collegeId",
          label: "College ID card",
          type: "image_or_pdf",
          required: true,
          accept: "image/*,.pdf",
        },
        {
          key: "profilePhoto",
          label: "Profile photo",
          type: "image",
          required: true,
          accept: "image/*",
        },
      ],
      policy: {
        teamNamePolicy: "never",
      },
    },
  },

  // ----------------------------------------------------------------------------
  // 7. TECH QUIZ (Circuit of Minds) — Track D
  // ----------------------------------------------------------------------------
  {
    id: "circuit-of-minds",
    name: "TECH QUIZ",
    aliases: ["tech-quiz"],
    fullTitle: "XAVITECH 2026 — Tech Quiz",
    badge: "Track D",
    badgeLevel: "Beginner",
    trackId: "track-d",
    trackName: "TRACK D — STAGE & CENTRAL EVENTS",
    shortDesc: "A tech quiz competition.",
    fullDesc: "Tech Quiz is a team-based event with fixed two-member teams.",
    date: "TBA",
    time: "TBA",
    prize: "To Be Announced",
    price: "₹300 per team",
    team: "Exactly 2 members",
    venue: "TBA",
    accentColor: "#34d399",
    glowColor: "rgba(52,211,153,.2)",
    borderColor: "rgba(52,211,153,.4)",
    image: "/images/events/event-09.jpeg",
    highlights: [
      "Expected participation: 20–30 teams (approximately 40–60 participants).",
    ],
    rules: [],
    eligibility: [
      "Open to eligible college/university students. All courses and academic years/semesters are eligible unless restricted by final event policy.",
      "External participants are allowed subject to final XAVITECH eligibility rules and organiser approval. No separate age restriction has been proposed.",
    ],
    registrationInfo: [
      "One team member submits a single registration for the team and enters the second member’s details during the same form.",
      "Separate registrations are not allowed. A team name and team leader designation are not required.",
    ],
    requirements: [
      "Both participants must provide full name, college/university, department/course, year/semester, mobile number, email, student ID/roll number, and city. Section is optional.",
      "Both participants must verify email/mobile and upload a valid college ID card and recent passport-style profile photo.",
      "Valid student identity proof and completion of the online registration form are prerequisites.",
    ],
    prizeBreakdown: {
      total: "To Be Announced",
    },
    documents: [
      {
        key: "collegeId",
        label: "College ID card",
        type: "image_or_pdf",
        required: true,
        accept: "image/*,.pdf",
      },
      {
        key: "profilePhoto",
        label: "Profile photo",
        type: "image",
        required: true,
        accept: "image/*",
      },
    ],
    registrationConfig: {
      eventFormat: "team",
      minTeamSize: 2,
      maxTeamSize: 2,
      feeAmount: 300,
      feeBasis: "per_team",
      feeDisplay: "₹300 per team",
      deadline: "TBA",
      teamNameRequired: false,
      participantFields: techQuizFields,
      coordinator: {
        name: "Aman Raj",
        phone: "9523780498",
        email: "drrajaman31@gmail.com",
        coCoordinator: "Princy Kumari",
      },
      details: {
        duration: "TBA",
      },
      declarations: baseDeclarations,
      customDeclaration: "I agree to follow the committee procedure and instructions from the organising team.",
      documents: [
        {
          key: "collegeId",
          label: "College ID card",
          type: "image_or_pdf",
          required: true,
          accept: "image/*,.pdf",
        },
        {
          key: "profilePhoto",
          label: "Profile photo",
          type: "image",
          required: true,
          accept: "image/*",
        },
      ],
      policy: {
        teamNamePolicy: "never",
      },
    },
  },

  // ----------------------------------------------------------------------------
  // 8. BATTLE OF BOTS — Track B (Remapped to Coding & Development Track)
  // ----------------------------------------------------------------------------
  {
    id: "battle-of-bots",
    name: "BATTLE OF BOTS",
    fullTitle: "XAVITECH 2026 — Battle of Bots",
    badge: "Track B",
    badgeLevel: "Intermediate",
    trackId: "track-b",
    trackName: "TRACK B — CODING & DEVELOPMENT",
    shortDesc: "An AI prompt battle for individual participants and small teams.",
    fullDesc: "Battle of Bots is an AI prompt battle open to individual participants and teams of up to three. Event rules will be shared by the organizers. Further event details are to be announced.",
    date: "TBA",
    time: "TBA",
    prize: "To Be Announced",
    price: "₹550 registration fee",
    team: "Individual or teams of 2–3",
    venue: "TBA",
    accentColor: "#34d399",
    glowColor: "rgba(52,211,153,.2)",
    borderColor: "rgba(52,211,153,.4)",
    image: "/images/events/event-10.jpeg",
    highlights: [],
    rules: [
      "Event rules and regulations will be shared by the organizers.",
      "Team leaders are responsible for the accuracy of submitted team information and must follow the event rules.",
    ],
    eligibility: [
      "Open to participants from all courses and academic years. External participants are allowed.",
      "No age restriction is specified.",
    ],
    registrationInfo: [
      "Choose individual registration or a team of up to three. A team leader submits team registration and enters all members during registration.",
      "A team name and team leader are required for teams. Separate member registrations and joining multiple teams are not allowed.",
      "Registration deadline: 27 October 2026. Registration fee: ₹550; the source does not specify whether this is charged per participant or per team.",
    ],
    requirements: [
      "Each participant must provide full name, institution, department/course, year/semester, mobile number, email address, and a valid college ID card.",
      "Section, student ID/roll number, profile photo, and city are not collected. Email/mobile verification is not required.",
    ],
    coordinatorRequirements: [
      "Coordinator access should include participant and team lists, contact details, uploaded ID cards, submitted project/material files, registration and attendance status, and CSV/Excel export.",
    ],
    prizeBreakdown: {
      total: "To Be Announced",
    },
    documents: [
      {
        key: "collegeId",
        label: "Valid college ID card",
        type: "image_or_pdf",
        required: true,
        accept: "image/*,.pdf",
      },
    ],
    registrationConfig: {
      eventFormat: "team",
      minTeamSize: 1,
      maxTeamSize: 3,
      feeAmount: 550,
      feeDisplay: "₹550 registration fee",
      deadline: "27 October 2026",
      deadlineDate: "2026-10-27",
      teamNameRequired: true,
      teamFields: [
        { id: "teamName", label: "Team name", type: "text", required: true },
      ],
      participantFields: battleOfBotsFields,
      coordinator: {
        name: "Krishna Kumar",
        phone: "8877828185",
        email: "krsna6366@gmail.com",
      },
      declarations: baseDeclarations,
      customDeclaration: "I confirm that my team’s submitted information is accurate and agree to follow the event rules.",
      documents: [
        {
          key: "collegeId",
          label: "Valid college ID card",
          type: "image_or_pdf",
          required: true,
          accept: "image/*,.pdf",
        },
      ],
      policy: {
        teamNamePolicy: "if_team",
      },
    },
  },

  // ----------------------------------------------------------------------------
  // 9. IDEATHON (ThoughtLab) — Track D
  // ----------------------------------------------------------------------------
  {
    id: "thoughtlab",
    name: "IDEATHON",
    aliases: ["ideathon"],
    fullTitle: "XAVITECH 2026 — Ideathon",
    badge: "Track D",
    badgeLevel: "Intermediate",
    trackId: "track-d",
    trackName: "TRACK D — STAGE & CENTRAL EVENTS",
    shortDesc: "A team ideathon for college and university students.",
    fullDesc: "XAVITECH 2026 Ideathon is a team event for groups of two to four. A team leader submits the registration, adds one teammate, and invites any remaining members to join through a link.",
    date: "TBA",
    time: "TBA",
    prize: "To Be Announced",
    price: "₹500 per team",
    team: "2–4 members",
    venue: "TBA",
    accentColor: "#34d399",
    glowColor: "rgba(52,211,153,.2)",
    borderColor: "rgba(52,211,153,.4)",
    image: "/images/events/event-12.jpeg",
    highlights: [],
    rules: [
      "Participants must follow the event rules and code of conduct. No additional restriction is proposed unless required by the final event policy.",
    ],
    eligibility: [
      "Open to eligible college/university students, subject to final event eligibility rules.",
      "All courses/departments and academic years/semesters are eligible unless restricted by the final policy. No separate age restriction is proposed.",
      "External participants are allowed, subject to applicable event eligibility requirements.",
    ],
    registrationInfo: [
      "Team name and team leader are required. One team leader submits the registration and enters one additional member; remaining members join through an invite/link workflow.",
      "Separate member registrations are not allowed, and a participant cannot join multiple teams.",
    ],
    requirements: [
      "Every member must provide full name, college/university, department/course, year/semester, 10-digit mobile number, email address, city, a valid college ID card, and a recent passport-style profile photo.",
      "Every member must verify email/mobile and upload their own ID. Section and student ID/roll number are not collected.",
      "A valid student identity proof and completed online registration are required.",
    ],
    prizeBreakdown: {
      total: "To Be Announced",
    },
    documents: [
      {
        key: "collegeId",
        label: "College ID card",
        type: "image_or_pdf",
        required: true,
        accept: "image/*,.pdf",
      },
      {
        key: "profilePhoto",
        label: "Profile photo",
        type: "image",
        required: true,
        accept: "image/*",
      },
    ],
    registrationConfig: {
      eventFormat: "team",
      minTeamSize: 2,
      maxTeamSize: 4,
      feeAmount: 500,
      feeBasis: "per_team",
      feeDisplay: "₹500 total per team",
      deadline: "TBA",
      teamNameRequired: true,
      teamFields: [
        { id: "teamName", label: "Team name", type: "text", required: true },
        { id: "proposedIdea", label: "Proposed idea (optional)", type: "textarea", required: false, placeholder: "Briefly describe your team's proposed idea" },
      ],
      participantFields: [...common, idPhoto, profilePhoto],
      coordinator: {
        name: "Amanjeet Sinha",
        phone: "7970499973",
        email: "sinhaamanjeet@gmail.com",
      },
      declarations: baseDeclarations,
      customDeclaration: "I agree to follow the committee procedure and instructions from the organising team.",
      documents: [
        {
          key: "collegeId",
          label: "College ID card",
          type: "image_or_pdf",
          required: true,
          accept: "image/*,.pdf",
        },
        {
          key: "profilePhoto",
          label: "Profile photo",
          type: "image",
          required: true,
          accept: "image/*",
        },
      ],
      policy: {
        teamNamePolicy: "always",
        maxInitialFormParticipants: 2,
      },
    },
  },

  // ----------------------------------------------------------------------------
  // 10. BATTLEFIELD BLITZ (Loot Goblins - BGMI Esports) — Track C
  // ----------------------------------------------------------------------------
  {
    id: "loot-goblins",
    name: "BATTLEFIELD BLITZ",
    aliases: ["battlefield-blitz", "bgmi", "battleground-blitz"],
    fullTitle: "XAVITECH 2026 — Battlefield Blitz (BGMI Esports)",
    badge: "Track C",
    badgeLevel: "Crucible",
    trackId: "track-c",
    trackName: "TRACK C — GAMING & ADVENTURE",
    shortDesc: "A BGMI esports squad competition.",
    fullDesc: "Battlefield Blitz is XAVITECH 2026's BGMI esports competition. Each squad registers four core players and may add one optional substitute. Matches use Advanced Custom Rooms in a best-of-three format across Erangel, Miramar, and Rondo.",
    date: "TBA",
    time: "TBA",
    prize: "₹6,000",
    price: "₹200 per player",
    team: "4 core players + 1 optional substitute",
    venue: "TBA",
    accentColor: "#60a5fa",
    glowColor: "rgba(96,165,250,.2)",
    borderColor: "rgba(96,165,250,.4)",
    image: "/assets/event-images/LootGoblins.png",
    highlights: [
      "Best of 3 across Erangel, Miramar, and Rondo.",
      "Prize standings: 1st ₹6,000, 2nd ₹4,000, MVP ₹2,000.",
    ],
    rules: [
      "Advanced Custom Room restrictions apply. Emulators, unauthorized peripherals, macros, hacks, cheats, exploits, and unauthorized software/hardware are prohibited.",
      "Match-fixing, account sharing, ID spoofing, and impersonation are prohibited. Violations may result in disqualification, forfeiture of prizes/certificates, and referral to university administration.",
    ],
    eligibility: [
      "Open to Xavier University Patna students and external participants.",
      "All courses/departments and years/semesters are eligible. No age restriction is specified.",
    ],
    registrationInfo: [
      "Team name and team leader are required. The team leader submits registration for the squad; separate member registrations and participation on multiple teams are not allowed.",
      "Four core players are compulsory. One substitute (P5) may be added during registration.",
    ],
    requirements: [
      "Each player must provide full name, institution, active mobile number, verified email, BGMI IGN, and Character ID/UID. Department/course, year/semester, profile photo, and city are optional; section is not collected.",
      "Every player must provide valid ID: XUP students upload their college ID, and external players upload a government-issued photo ID. Student ID/roll number is required only for XUP students.",
      "Four core-player entries are required. The P5 substitute's fields are optional.",
    ],
    prizeBreakdown: {
      total: "₹12,000 prize pool",
      first: "₹6,000",
      second: "₹4,000",
      mvp: "₹2,000",
      note: "1st ₹6,000, 2nd ₹4,000, MVP ₹2,000",
    },
    documents: [
      {
        key: "collegeId",
        label: "College ID or Government Photo ID",
        type: "image_or_pdf",
        required: true,
        accept: "image/*,.pdf",
        helpText: "XUP students: upload college ID. External players: upload a government-issued photo ID.",
      },
      {
        key: "profilePhoto",
        label: "Profile photo (optional)",
        type: "image",
        required: false,
        accept: "image/*",
      },
    ],
    registrationConfig: {
      eventFormat: "team",
      minTeamSize: 4,
      maxTeamSize: 5,
      feeAmount: 200,
      feeBasis: "per_player",
      feeDisplay: "₹200 per player",
      deadline: "20 October 2026",
      deadlineDate: "2026-10-20",
      teamNameRequired: true,
      teamFields: [
        { id: "teamName", label: "Team name", type: "text", required: true },
      ],
      participantFields: lootGoblinsFields,
      coordinator: {
        name: "Umang Sahni",
        phone: "9308463995",
        email: "umangsahni2008@gmail.com",
        coCoordinator: "Joshua Singh",
      },
      details: {
        game: "BGMI",
        maps: ["Erangel", "Miramar", "Rondo"],
        format: "Best of 3 · Advanced Custom Room",
        note: "Room ID/password should be sent to the registered team leader shortly before each round. Round schedule confirmation and Squad ID are generated after registration.",
      },
      declarations: baseDeclarations,
      customDeclaration: "I confirm that the squad details are accurate and each member has agreed to participate.",
      documents: [
        {
          key: "collegeId",
          label: "College ID or Government Photo ID",
          type: "image_or_pdf",
          required: true,
          accept: "image/*,.pdf",
        },
        {
          key: "profilePhoto",
          label: "Profile photo (optional)",
          type: "image",
          required: false,
          accept: "image/*",
        },
      ],
      policy: {
        teamNamePolicy: "always",
        hasSubstitute: true,
        substituteOptional: true,
      },
    },
  },

  // ----------------------------------------------------------------------------
  // 11. CIPHER CHASE (Tech Treasure Hunt) — Track C
  // ----------------------------------------------------------------------------
  {
    id: "cipher-chase",
    name: "CIPHER CHASE",
    fullTitle: "Cipher Chase — Tech Treasure Hunt",
    badge: "Track C",
    badgeLevel: "Intermediate",
    trackId: "track-c",
    trackName: "TRACK C — GAMING & ADVENTURE",
    shortDesc: "A large-team campus treasure hunt.",
    fullDesc: "Cipher Chase is a campus treasure hunt for teams of 20–30 students. Clues may use QR codes, Morse code, binary code, and other puzzle formats. Teams must stay within their assigned area and follow the event rules.",
    date: "TBA",
    time: "TBA",
    prize: "To Be Announced",
    price: "₹200 registration fee",
    team: "20–30 members",
    venue: "Campus",
    accentColor: "#60a5fa",
    glowColor: "rgba(96,165,250,.2)",
    borderColor: "rgba(96,165,250,.4)",
    image: "/images/events/event-07.jpeg",
    highlights: [
      "Clues may use QR codes, Morse code, binary code, and similar formats.",
      "Team leader enters up to four members; the rest join by invite or coordinator entry.",
    ],
    rules: [
      "Do not damage college property. Damage may result in a penalty or fine.",
      "Registration fees are non-refundable after cancellation.",
      "Stay within the team's assigned area. Leaving it will eliminate the entire team.",
      "Cheating, causing malfunctions, or using a proxy will disqualify the entire team.",
      "Teams may visit the campus before their assigned time to become familiar with it, but must not search for clues. Anyone caught searching for clues in advance will be immediately eliminated.",
    ],
    eligibility: [
      "Open to students in Classes 9–12 and undergraduate or postgraduate students.",
      "All courses and departments are eligible. External participants are allowed. No age restriction is specified.",
    ],
    registrationInfo: [
      "A team must have 20–30 members. Team name is not required; a team leader is required.",
      "The team leader submits one registration and enters up to four members. Remaining members join by invite/link or are added by the coordinator later. Separate registrations and joining multiple teams are not allowed.",
      "Use an email address and mobile number that are not already registered to another team.",
      "The registration fee is ₹200. The deadline is before 30 October 2026.",
    ],
    requirements: [
      "Every member must provide full name, institution, student ID/roll number, city, and a valid college ID card. Department/course is optional.",
      "Only the team leader must provide a mobile number, email address, and optional profile photo. Year/semester and section are not collected.",
    ],
    coordinatorRequirements: [
      "Provide coordinators with team-wise participant lists, contact details, uploaded ID cards, registration/payment/check-in status, and records for cancelled teams.",
    ],
    prizeBreakdown: {
      total: "To Be Announced",
    },
    documents: [
      {
        key: "collegeId",
        label: "College ID card",
        type: "image_or_pdf",
        required: true,
        accept: "image/*,.pdf",
        helpText: "Required for every team member.",
      },
      {
        key: "profilePhoto",
        label: "Team leader profile photo (optional)",
        type: "image",
        required: false,
        accept: "image/*",
      },
    ],
    registrationConfig: {
      eventFormat: "team",
      minTeamSize: 20,
      maxTeamSize: 30,
      feeAmount: 200,
      feeDisplay: "₹200 registration fee",
      deadline: "Before 30 October 2026",
      deadlineDate: "2026-10-29",
      teamNameRequired: false,
      teamFields: [],
      participantFields: cipherChaseFields,
      coordinator: {
        name: "Sunny Kumar & Shristi Singh",
        phone: "7280929939 / 9241065537",
        email: "Sunnykumar221973@gmail.com",
      },
      details: {
        format: "Campus treasure hunt · QR codes · Morse code · Binary code",
      },
      declarations: baseDeclarations,
      customDeclaration: "I confirm that I have read and understood the event rules and agree to follow them. I accept responsibility for my team's conduct.",
      documents: [
        {
          key: "collegeId",
          label: "College ID card",
          type: "image_or_pdf",
          required: true,
          accept: "image/*,.pdf",
        },
        {
          key: "profilePhoto",
          label: "Team leader profile photo (optional)",
          type: "image",
          required: false,
          accept: "image/*",
        },
      ],
      policy: {
        teamNamePolicy: "never",
        maxInitialFormParticipants: 4,
      },
    },
  },

  // ----------------------------------------------------------------------------
  // 12. DEATH RACE (VelocityX) — Track C
  // ----------------------------------------------------------------------------
  {
    id: "velocityx",
    name: "DEATH RACE",
    aliases: ["death-race"],
    fullTitle: "Death Race",
    badge: "Track C",
    badgeLevel: "Advanced",
    trackId: "track-c",
    trackName: "TRACK C — GAMING & ADVENTURE",
    shortDesc: "A Death Race competition.",
    fullDesc: "Death Race is a team-based competition.",
    date: "TBA",
    time: "TBA",
    prize: "To Be Announced",
    price: "Paid (Amount TBA)",
    team: "2–3 members",
    venue: "TBA",
    accentColor: "#60a5fa",
    glowColor: "rgba(96,165,250,.2)",
    borderColor: "rgba(96,165,250,.4)",
    image: "/images/events/event-08.jpeg",
    highlights: [],
    rules: [],
    registrationInfo: [
      "Team name and team leader are required.",
      "The team leader submits one registration for the team and enters the other members during registration. Separate member registrations are not allowed.",
      "Teams must have 2–3 participants.",
    ],
    requirements: [
      "Each member must provide full name, college/university, mobile number, and student ID/roll number.",
      "Each member must upload a valid college ID card and verify email/mobile.",
      "Department/course is not required; year/semester, email, profile photo, and city are optional.",
    ],
    prizeBreakdown: {
      total: "To Be Announced",
    },
    documents: [
      {
        key: "collegeId",
        label: "College ID card",
        type: "image_or_pdf",
        required: true,
        accept: "image/*,.pdf",
      },
      {
        key: "profilePhoto",
        label: "Profile photo (optional)",
        type: "image",
        required: false,
        accept: "image/*",
      },
    ],
    registrationConfig: {
      eventFormat: "team",
      minTeamSize: 2,
      maxTeamSize: 3,
      feeDisplay: "Paid (Amount TBA)",
      deadline: "TBA",
      teamNameRequired: true,
      teamFields: [
        { id: "teamName", label: "Team name", type: "text", required: true },
      ],
      participantFields: velocityXFields,
      coordinator: {
        name: "Jai Vardhan",
        phone: "7856802097",
        email: "jaivardhan27062007@gmail.com",
        coCoordinator: "Kaushik",
      },
      declarations: deathRaceDeclarations,
      documents: [
        {
          key: "collegeId",
          label: "College ID card",
          type: "image_or_pdf",
          required: true,
          accept: "image/*,.pdf",
        },
        {
          key: "profilePhoto",
          label: "Profile photo (optional)",
          type: "image",
          required: false,
          accept: "image/*",
        },
      ],
      policy: {
        teamNamePolicy: "always",
      },
    },
  },

  // ----------------------------------------------------------------------------
  // 13. HACK THE SKILLS (Workshop) — Track E
  // ----------------------------------------------------------------------------
  {
    id: "hack-the-skill",
    name: "HACK THE SKILLS",
    aliases: ["hack-the-skills"],
    fullTitle: "XAVITECH 2026 — Hack the Skills Workshop",
    badge: "Track E",
    badgeLevel: "Intermediate",
    trackId: "track-e",
    trackName: "TRACK E — WORKSHOPS & KNOWLEDGE",
    shortDesc: "A hands-on technical workshop for school and college students.",
    fullDesc: "Hack the Skills is a technical workshop open to students from Class 8 through postgraduate level. Register individually or as a team of two to four. Workshop schedule and venue details will be announced later.",
    date: "TBA",
    time: "TBA",
    prize: "No prize",
    price: "₹300 registration fee",
    team: "Individual or teams of 2–4",
    venue: "TBA",
    accentColor: "#f472b6",
    glowColor: "rgba(244,114,182,.2)",
    borderColor: "rgba(244,114,182,.4)",
    image: "/images/events/event-13.jpeg",
    highlights: [
      "Technical workshop · Schedule and venue to be announced.",
    ],
    rules: [],
    eligibility: [
      "Open to school students in Classes 8–12 and college/university students, including undergraduate and postgraduate students.",
      "All courses and departments are eligible. Participants should have an interest in technical workshops.",
      "External participants are welcome. No age restriction is specified.",
    ],
    registrationInfo: [
      "Choose individual registration or a team of 2–4. Team members are entered during registration; invite/link joining is also supported.",
      "A team name and team leader are required for team registrations. Separate individual registration is allowed, but a participant cannot join multiple teams.",
      "Registration fee: ₹300. The form does not specify whether the fee is per participant or team.",
    ],
    requirements: [
      "Each participant must provide full name, institution, department/course/class, mobile number, email address, city, a valid school/college ID card, and a recent profile photo.",
      "Year/semester, section, and student ID/roll number are optional. Year/semester is requested from the team leader.",
    ],
    coordinatorRequirements: [
      "Coordinator access should include participant and team lists, contact details, uploaded ID cards, registration/payment/check-in status, and CSV/Excel export.",
    ],
    prizeBreakdown: {
      note: "Technical workshop with certificate of participation; no cash prize.",
    },
    documents: [
      {
        key: "collegeId",
        label: "Valid school / college ID card",
        type: "image_or_pdf",
        required: true,
        accept: "image/*,.pdf",
      },
      {
        key: "profilePhoto",
        label: "Profile photo",
        type: "image",
        required: true,
        accept: "image/*",
      },
    ],
    registrationConfig: {
      eventFormat: "team",
      minTeamSize: 1,
      maxTeamSize: 4,
      feeAmount: 300,
      feeDisplay: "₹300 registration fee",
      deadline: "TBA",
      teamNameRequired: true,
      teamFields: [
        { id: "teamName", label: "Team name", type: "text", required: true },
      ],
      participantFields: hackTheSkillFields,
      coordinator: {
        name: "Unnati Singh",
        phone: "9199511866",
        email: "Unnati31march@gmail.com",
        coCoordinator: "Srishti Sharma",
      },
      declarations: baseDeclarations,
      customDeclaration: "I understand workshop arrangements may change and agree to follow event instructions.",
      documents: [
        {
          key: "collegeId",
          label: "Valid school / college ID card",
          type: "image_or_pdf",
          required: true,
          accept: "image/*,.pdf",
        },
        {
          key: "profilePhoto",
          label: "Profile photo",
          type: "image",
          required: true,
          accept: "image/*",
        },
      ],
      policy: {
        teamNamePolicy: "if_team",
      },
    },
  },
];

// ==============================================================================
// 5. HELPER UTILITY FUNCTIONS
// ==============================================================================

/**
 * Look up an event by its unique ID, slug, or known alias (case-insensitive).
 */
export function getEventByIdOrSlug(idOrSlug: string): EventItem | undefined {
  if (!idOrSlug) return undefined;
  const normalized = idOrSlug.trim().toLowerCase();
  return EVENTS.find(
    (event) =>
      event.id.toLowerCase() === normalized ||
      event.aliases?.some((a) => a.toLowerCase() === normalized)
  );
}

/**
 * Look up a track by its track ID (e.g. "track-a", "track-b").
 */
export function getTrackById(trackId: string): TrackItem | undefined {
  if (!trackId) return undefined;
  return TRACKS.find((t) => t.id === trackId);
}

/**
 * Get all document requirements for an event.
 */
export function getEventDocuments(event: EventItem): DocumentRequirement[] {
  if (event.documents && event.documents.length > 0) {
    return event.documents;
  }
  if (event.registrationConfig?.documents && event.registrationConfig.documents.length > 0) {
    return event.registrationConfig.documents;
  }
  // Fallback: derive from file fields in participantFields
  const fields = event.registrationConfig?.participantFields ?? [];
  return fields
    .filter((f) => f.type === "file")
    .map((f) => ({
      key: f.id,
      label: f.label,
      type: (f.accept?.includes("pdf") ? "image_or_pdf" : "image") as DocumentRequirement["type"],
      required: f.required,
      helpText: f.helpText,
      accept: f.accept,
    }));
}

/**
 * Get structured prize breakdown for an event.
 */
export function getEventPrizeBreakdown(event: EventItem): PrizeBreakdown | undefined {
  return event.prizeBreakdown;
}

/**
 * Determine if team name is required for an event given the chosen team size.
 */
export function isTeamNameRequired(event: EventItem, teamSize?: number): boolean {
  const size = teamSize ?? event.registrationConfig?.minTeamSize ?? 1;
  const policy = event.registrationConfig?.policy?.teamNamePolicy;
  if (policy === "never") return false;
  if (policy === "always") return true;
  if (policy === "if_team") return size > 1;
  return event.registrationConfig?.teamNameRequired ?? (size > 1);
}

/**
 * Determine how many participants should be collected in the initial registration form.
 */
export function getFormParticipantCount(event: EventItem, selectedTeamSize?: number): number {
  const size = selectedTeamSize ?? event.registrationConfig?.minTeamSize ?? 1;
  const maxInitial = event.registrationConfig?.policy?.maxInitialFormParticipants;
  if (maxInitial && maxInitial > 0) {
    return Math.min(size, maxInitial);
  }
  return size;
}
