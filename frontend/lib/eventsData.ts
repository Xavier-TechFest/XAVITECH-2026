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

/** Reader-friendly sections for long event briefs shown in Explore. */
export interface EventExploreSection {
  title: string;
  items: string[];
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
  exploreSections?: EventExploreSection[];
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
  { id: "hackerRank", label: "HackerRank username / account email", type: "text", required: true, placeholder: "Valid HackerRank account" },
  { id: "language", label: "Programming language", type: "text", required: true, placeholder: "A language enabled for the contest" },
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
    fullTitle: "INNOCRAFT — Hackathon",
    badge: "Track A",
    badgeLevel: "Crucible",
    trackId: "track-a",
    trackName: "TRACK A",
    shortDesc: "Hackathon",
    fullDesc: "InnoCraft is a team hackathon for school and college participants. Teams register together through one team leader.",
    date: "31st Oct",
    time: "TBA",
    prize: "Exciting Gifts & Prizes",
    price: "₹800 per school team / ₹1,000 per college team",
    team: "4 participants",
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
      total: "Exciting Gifts & Prizes",
      note: "Exciting gifts and prizes await participants.",
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
    fullTitle: "WEBWEAVE — Web Development Challenge",
    badge: "Track B",
    badgeLevel: "Intermediate",
    trackId: "track-b",
    trackName: "TRACK B",
    shortDesc: "Web Development Challenge",
    fullDesc: "WebWeave is a team web development challenge for school students in Class 10 and above and undergraduate students, including BCA students. Teams of two bring their own laptop and charger, then build around one shared theme in a four-hour build phase.",
    date: "31st Oct",
    time: "TBA",
    prize: "Exciting Gifts & Prizes",
    price: "₹300 registration fee",
    team: "2 participants",
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
      total: "Exciting Gifts & Prizes",
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
    fullTitle: "RUNTIME RUSH — Code Sprint",
    badge: "Track B",
    badgeLevel: "Advanced",
    trackId: "track-b",
    trackName: "TRACK B",
    shortDesc: "Code Sprint",
    fullDesc: "Runtime Rush is a coding challenge open to school and college students. Participate individually or register with one teammate. Participants compete using Java, C, C++, Python, or JavaScript.",
    date: "31st Oct",
    time: "TBA",
    prize: "Exciting Gifts & Prizes",
    price: "₹150 per participant",
    team: "1–2 participants",
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
      total: "Exciting Gifts & Prizes",
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
      feeAmount: 150,
      feeBasis: "per_participant",
      feeDisplay: "₹150 per participant",
      deadline: "TBA",
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
    name: "VLOOKUP",
    aliases: ["data-analytics"],
    fullTitle: "VLookUp — Data Analytics",
    badge: "Track B",
    badgeLevel: "Intermediate",
    trackId: "track-b",
    trackName: "TRACK B",
    shortDesc: "Data Analytics",
    fullDesc: "XAVITECH 2026 Data Analytics is a team competition for pairs. Participants should know Excel and Power BI. The event is open to Class 7–12, undergraduate, and postgraduate students over 16 years old.",
    date: "31st Oct",
    time: "TBA",
    prize: "Exciting Gifts & Prizes",
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
      total: "Exciting Gifts & Prizes",
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
      deadline: "TBA",
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
    fullTitle: "DEBUG DERBY — Debugging Challenge",
    badge: "Track B",
    badgeLevel: "Advanced",
    trackId: "track-b",
    trackName: "TRACK B",
    shortDesc: "Debugging Challenge",
    fullDesc: "Debug Derby is an individual debugging challenge for Class 11, Class 12, and undergraduate students. Qualify through a pen-and-paper MCQ round, then solve coding and debugging problems on HackerRank.",
    date: "31st Oct",
    time: "09:30 AM – 11:30 AM",
    prize: "Exciting Gifts & Prizes",
    price: "₹150 per participant",
    team: "1 participant",
    venue: "TBA",
    accentColor: "#35e0c9",
    glowColor: "rgba(53,224,201,.2)",
    borderColor: "rgba(53,224,201,.4)",
    image: "/images/events/event-02.jpeg",
    highlights: [
      "Two rounds · 31 October 2026 · 09:30 AM–11:30 AM.",
      "Round 1 qualifiers advance to HackerRank-based Round 2.",
      "Prizes: 1st ₹3,000, 2nd ₹2,000, and 3rd ₹1,000.",
    ],
    rules: [
      "Individual participation only. Use your own valid HackerRank account and work independently.",
      "AI assistants, code-generation tools, collaboration, copied code, and other unauthorized assistance are prohibited and may lead to immediate disqualification.",
      "Report technical failures to an invigilator immediately. The event team will verify reported issues and follow the event policy for confirmed event/system failures.",
    ],
    eligibility: [
      "Eligible participants are Class 11, Class 12, and undergraduate students.",
      "Participants should know at least one programming language supported by the HackerRank contest and be familiar with basic submissions.",
    ],
    registrationInfo: [
      "Register as an individual for ₹150.",
      "Bring a valid HackerRank account for Round 2 and know your login credentials.",
    ],
    requirements: [
      "Required: full name, current school/college/university, class/course, mobile number, email, valid school/college ID, HackerRank username/account email, and a programming language enabled for the contest.",
      "Year/semester, profile photo, and city are optional.",
      "Know at least one programming language. Supported languages: TBA.",
    ],
    exploreSections: [
      { title: "Who can participate?", items: [
        "Open to Class 11, Class 12, and undergraduate students.",
        "Registration is individual. Participants should know at least one programming language and the basics of submitting code on HackerRank.",
        "Carry a valid student ID when required.",
      ] },
      { title: "How does the challenge work?", items: [
        "The competition has two rounds. You must qualify in Round 1 to continue to Round 2.",
        "Round 1 — Bug Hunt: pen-and-paper multiple-choice questions on programming and debugging fundamentals.",
        "Round 2 — Code Rescue: coding and debugging problems on HackerRank.",
      ] },
      { title: "Round 1: Bug Hunt", items: [
        "Time: 09:30 AM–10:15 AM. The round tests basic programming concepts and your ability to spot common errors.",
        "Topics may include syntax errors, variables and declarations, input/output, conditionals, loops, arrays, strings, basic logic errors, and programming fundamentals.",
        "Bring your own pen and mark answers on the provided sheet. Electronic devices cannot be used to solve this round, and answers are not accepted after time is called.",
        "Round 1 evaluation and qualification: 10:15 AM–10:25 AM.",
      ] },
      { title: "Round 2: Code Rescue", items: [
        "Time: 10:25 AM–11:25 AM, followed by submission closure from 11:25 AM–11:30 AM.",
        "Problems may cover complex logic and runtime errors, array indexing, string manipulation, nested loops, algorithms, edge cases, and programs with multiple bugs.",
        "Submit all Round 2 solutions through HackerRank. Supported languages: TBA.",
      ] },
      { title: "How are results decided?", items: [
        "Round 1 is evaluated from the MCQ answers on the provided sheet. Round 2 is evaluated using HackerRank test cases and automated scoring.",
        "Marking distribution: TBA.",
        "For a tie, completely solved questions are considered first, followed by successful submission time. Additional tie-breaker: TBA.",
        "Prizes: 1st ₹3,000, 2nd ₹2,000, and 3rd ₹1,000.",
      ] },
      { title: "How do I register?", items: [
        "Register individually. The registration fee is ₹150 per participant.",
        "Provide your name, institution, class/course, contact details, HackerRank username or account email, and a valid school/college ID.",
        "Have a valid HackerRank account ready for Round 2. Know your login details, test your account before the event, and practise the basic submission process.",
      ] },
      { title: "When and where is the event?", items: [
        "Date: 31 October 2026. Competition hours: 09:30 AM–11:30 AM.",
        "Venue: TBA.",
        "09:30–10:15 AM: Bug Hunt · 10:15–10:25 AM: evaluation and qualification · 10:25–11:25 AM: Code Rescue · 11:25–11:30 AM: submission closure and conclusion.",
      ] },
      { title: "Full rules and participant guide", items: [
        "Work independently. Do not communicate with other participants, copy answers or code, or share or receive solutions.",
        "AI and code-generation tools are prohibited, including ChatGPT, Google Gemini, GitHub Copilot, and other online assistance. Unauthorized electronic devices or assistance are not allowed.",
        "Do not access another participant’s system or account, interfere with another participant’s computer or HackerRank account, or violate any competition rule. Violations may result in disqualification.",
        "Follow coordinator and invigilator instructions, stop when time is called, respect other participants, and keep your assigned workspace clean. Event coordinators/faculty make the final decision on rule violations.",
        "Bring a valid student ID, a pen, registration confirmation/details, and your HackerRank login credentials.",
        "If a computer or internet problem occurs during Round 2, tell an invigilator immediately and do not make unauthorized system changes. The event team will verify the issue. Backup system and time compensation: TBA.",
      ] },
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
      feeAmount: 150,
      feeBasis: "per_participant",
      feeDisplay: "₹150 per participant",
      deadline: "TBA",
      participantFields: debugDerbyFields,
      coordinator: {
        name: "Priyanshu Kumar",
        phone: "8677931410",
        email: "Priyanshuk092005@gmail.com",
        coCoordinator: "Akshat Raj",
      },
      details: {
        duration: "31 October 2026 · 09:30 AM–11:30 AM",
        format: "Round 1: Bug Hunt (pen-and-paper MCQ) · Round 2: Code Rescue (HackerRank)",
      },
      declarations: baseDeclarations,
      customDeclaration: "I will use my own valid HackerRank account during the competition.",
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
    name: "UNSCRIPTED NATIONS",
    aliases: ["model-united-nations", "mun"],
    fullTitle: "UNSCRIPTED NATIONS — MUN",
    badge: "Track D",
    badgeLevel: "Advanced",
    trackId: "track-d",
    trackName: "TRACK D",
    shortDesc: "MUN",
    fullDesc: "XAVITECH 2026 Model United Nations (MUN) is an individual delegate event for the United Nations Commission on Science and Technology for Development (CSTD).",
    date: "31st Oct",
    time: "TBA",
    prize: "Exciting Gifts & Prizes",
    price: "₹500 per delegate",
    team: "1 participant",
    venue: "TBA",
    accentColor: "#34d399",
    glowColor: "rgba(52,211,153,.2)",
    borderColor: "rgba(52,211,153,.4)",
    image: "/events/MUN.jpg",
    highlights: [
      "Expected participation: TBA.",
    ],
    rules: [],
    eligibility: [
      "Open to college/university students. Course, academic-year, external-participant, and age restrictions: TBA.",
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
      total: "Exciting Gifts & Prizes",
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
      feeAmount: 500,
      feeBasis: "per_participant",
      feeDisplay: "₹500 per delegate",
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
    name: "CIRCUIT OF MINDS",
    aliases: ["tech-quiz"],
    fullTitle: "CIRCUIT OF MINDS — Tech Quiz",
    badge: "Track D",
    badgeLevel: "Beginner",
    trackId: "track-d",
    trackName: "TRACK D",
    shortDesc: "Tech Quiz",
    fullDesc: "Tech Quiz is a team-based event with fixed two-member teams.",
    date: "31st Oct",
    time: "TBA",
    prize: "Exciting Gifts & Prizes",
    price: "₹300 per team",
    team: "2 participants",
    venue: "TBA",
    accentColor: "#34d399",
    glowColor: "rgba(52,211,153,.2)",
    borderColor: "rgba(52,211,153,.4)",
    image: "/images/events/event-09.jpeg",
    highlights: [
      "Expected participation: TBA.",
    ],
    rules: [],
    eligibility: [
      "Open to college/university students. Course, academic-year, external-participant, and age restrictions: TBA.",
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
      total: "Exciting Gifts & Prizes",
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
    fullTitle: "BATTLE OF BOTS — Battle of Prompts",
    badge: "Track B",
    badgeLevel: "Intermediate",
    trackId: "track-b",
    trackName: "TRACK B",
    shortDesc: "Battle of Prompts",
    fullDesc: "Battle of Bots is a battle of prompts. During the event, participating teams receive unlimited access to Claude and use their creativity to build a website, web page, or web app.",
    date: "31st Oct",
    time: "TBA",
    prize: "Exciting Gifts & Prizes",
    price: "₹550 registration fee",
    team: "1–3 participants",
    venue: "TBA",
    accentColor: "#34d399",
    glowColor: "rgba(52,211,153,.2)",
    borderColor: "rgba(52,211,153,.4)",
    image: "/images/events/event-10.jpeg",
    highlights: [
      "We provide the machine.",
      "We provide AI access.",
      "All you need to bring is your creativity.",
    ],
    rules: [
      "Event rules and regulations: TBA.",
      "Team leaders are responsible for the accuracy of submitted team information and must follow the event rules.",
    ],
    eligibility: [
      "Open to participants from all courses and academic years. External participants are allowed.",
      "No age restriction is specified.",
    ],
    registrationInfo: [
      "Choose individual registration or a team of up to three. A team leader submits team registration and enters all members during registration.",
      "A team name and team leader are required for teams. Separate member registrations and joining multiple teams are not allowed.",
      "Registration deadline: 27 October 2026. Registration fee: ₹550. Fee basis: TBA.",
    ],
    requirements: [
      "Each participant must provide full name, institution, department/course, year/semester, mobile number, email address, and a valid college ID card.",
      "Section, student ID/roll number, profile photo, and city are not collected. Email/mobile verification is not required.",
    ],
    coordinatorRequirements: [
      "Coordinator access should include participant and team lists, contact details, uploaded ID cards, submitted project/material files, registration and attendance status, and CSV/Excel export.",
    ],
    prizeBreakdown: {
      total: "Exciting Gifts & Prizes",
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
    name: "THOUGHTLAB",
    aliases: ["ideathon"],
    fullTitle: "THOUGHTLAB — Ideathon",
    badge: "Track D",
    badgeLevel: "Intermediate",
    trackId: "track-d",
    trackName: "TRACK D",
    shortDesc: "Ideathon",
    fullDesc: "XAVITECH 2026 Ideathon is a team event for groups of two to four. A team leader submits the registration, adds one teammate, and invites any remaining members to join through a link.",
    date: "31st Oct",
    time: "TBA",
    prize: "Exciting Gifts & Prizes",
    price: "₹500 per team",
    team: "2–4 participants",
    venue: "TBA",
    accentColor: "#34d399",
    glowColor: "rgba(52,211,153,.2)",
    borderColor: "rgba(52,211,153,.4)",
    image: "/images/events/event-12.jpeg",
    highlights: [],
    rules: [
      "Follow the event rules and code of conduct. Additional restrictions: TBA.",
    ],
    eligibility: [
      "Eligible participants: college/university students. Course, academic-year, external-participant, and age restrictions: TBA.",
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
      total: "Exciting Gifts & Prizes",
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
    fullTitle: "BATTLEFIELD BLITZ — BGMI",
    badge: "Track C",
    badgeLevel: "Crucible",
    trackId: "track-c",
    trackName: "TRACK C",
    shortDesc: "BGMI",
    fullDesc: "Battlefield Blitz is XAVITECH 2026's squad-based Battlegrounds Mobile India tournament. Up to 25 squads play one Best-of-3 series across Erangel, Miramar, and Rondo. The winner is decided by cumulative placement and kill points, with live coverage for spectators at De Nobili Hall.",
    date: "31st Oct",
    time: "8:00 AM–1:00 PM",
    prize: "Exciting Gifts & Prizes",
    price: "₹200 per player",
    team: "4–5 participants",
    venue: "De Nobili Hall (Track C)",
    accentColor: "#60a5fa",
    glowColor: "rgba(96,165,250,.2)",
    borderColor: "rgba(96,165,250,.4)",
    image: "/events/Bgmi.jpg",
    highlights: [
      "One three-map series · all registered squads play all three maps.",
      "4 main players + 1 optional substitute · ₹200 per registered player · 25-squad cap.",
      "Cumulative placement and kill points decide the standings.",
      "Prize pool: ₹12,000 · 1st ₹6,000 · 2nd ₹4,000 · MVP ₹2,000.",
    ],
    rules: [
      "Advanced Custom Room restrictions apply. Emulators, unauthorized peripherals, macros, hacks, cheats, exploits, and unauthorized software/hardware are prohibited.",
      "Match-fixing, account sharing, ID spoofing, and impersonation are prohibited. Violations may result in disqualification, forfeiture of prizes/certificates, and referral to university administration.",
    ],
    eligibility: [
      "Open to Xavier University Patna students and external participants of all skill levels.",
      "All courses, departments, and academic years are eligible. No age restriction is specified.",
    ],
    registrationInfo: [
      "Register one squad with four main players and up to one optional substitute. Provide a team name and choose one team leader to submit the squad registration.",
      "The fee is ₹200 per registered player, payable through the official Tech Fest portal. A player may not join more than one squad.",
      "Entries are limited to 25 squads and accepted first come, first served. Registration closes on 20 October 2026 or when all places are filled.",
      "Fees are non-refundable. The organising committee may accept or decline an entry without stating a reason.",
    ],
    requirements: [
      "Each player must provide full name, institution, active mobile number, verified email, BGMI IGN, and Character ID/UID. Department/course, year/semester, profile photo, and city are optional; section is not collected.",
      "Every player must provide valid ID: XUP students upload their college ID, and external players upload a government-issued photo ID. Student ID/roll number is required only for XUP students.",
      "Four core-player entries are required. The P5 substitute's fields are optional.",
    ],
    exploreSections: [
      {
        title: "Eligibility",
        items: [
          "Open to Xavier University Patna students and external participants of all skill levels. All courses, departments, and academic years are eligible; no age restriction is specified.",
          "Each squad has 4 main players and may register 1 optional substitute. The tournament is capped at 25 squads; entries are accepted first come, first served.",
        ],
      },
      {
        title: "How does the tournament work?",
        items: [
          "All registered squads play together in one custom-room lobby. There are no qualifying or elimination rounds: each squad plays all three maps in the Best-of-3 (BO3) series.",
          "Map order: Erangel → Miramar → Rondo. Scores from all three maps are added together to determine the final standings.",
          "The custom-room ID and password are shared with squad leaders before each map. Allow 15–20 minutes between maps for breaks and score updates.",
        ],
      },
      {
        title: "Which maps will we play?",
        items: [
          "Map 1 · Erangel — the opening match.",
          "Map 2 · Miramar — the second match.",
          "Map 3 · Rondo — the deciding match.",
          "All registered squads compete in all three matches. The 25-squad cap fits the stated custom-room capacity.",
        ],
      },
      {
        title: "What device do I need?",
        items: [
          "Play on your own physical mobile device. Emulators are not allowed for players or room hosting; BGMI permanently bans accounts played on emulators.",
          "The host room runs on a high-performance physical phone or tablet; an iPhone or iPad is preferred. An Advance Room Pass is required to host the custom room.",
          "The venue provides dedicated high-speed internet, with a backup hotspot/dongle. Charging stations are available between maps; players are responsible for bringing their own devices.",
        ],
      },
      {
        title: "How is the winner decided?",
        items: [
          "The tournament uses placement-plus-kill scoring. Placement points per map: 1st place — 10; 2nd — 6; 3rd — 5; 4th — 4; 5th — 3; 6th — 2; 7th–8th — 1; 9th place and below — 0.",
          "Add 1 point for every kill. Each squad's placement and kill points are totalled across Erangel, Miramar, and Rondo; the highest combined score wins.",
          "Tie-breakers: 1) total kills across all three maps; 2) number of Chicken Dinners (first-place finishes); 3) a short decider match during the scheduled buffer if the tie remains.",
        ],
      },
      {
        title: "How do I register my squad?",
        items: [
          "One team leader submits one registration for the squad. Register 4 main players and, if needed, 1 substitute. A player cannot be registered on more than one squad.",
          "Registration costs ₹200 per player through the official Tech Fest portal. The 25-squad cap is first come, first served; registration closes 20 October 2026 or once all places are filled. Fees are non-refundable.",
          "A Squad ID is generated after registration. The custom-room ID and password are shared with the squad leader before each map.",
          "Provide each player's full name, institution, active mobile number, verified email, BGMI in-game name (IGN), and Character ID/UID. Department/course, year/semester, profile photo, and city are optional; no section field is required.",
          "Upload valid ID for every player: Xavier University Patna students use their college ID; external players use a government-issued photo ID. XUP student ID/roll number is required for XUP students.",
          "All squad members must check in together with valid college/school ID. Arrive by 8:30 AM, at least 30 minutes before the 9:00 AM tournament start.",
        ],
      },
      {
        title: "When and where is it happening?",
        items: [
          "Date: 31 October 2026 · Venue: De Nobili Hall, Track C · Tournament and result window: 8:00 AM–1:00 PM.",
          "8:00–8:30 AM · Squad check-in, ID and device verification at the De Nobili Hall entrance. Check in together and bring valid college/school ID.",
          "8:30–8:45 AM · Briefing on the BO3 format, maps, scoring, and conduct rules.",
          "8:45–9:00 AM · Lobby setup, room details, and warm-up.",
          "9:00–9:45 AM · Erangel · 9:45–10:00 AM · Break and standings update.",
          "10:00–10:50 AM · Miramar · 10:50–11:05 AM · Break, standings update, and refreshments.",
          "11:05–11:50 AM · Rondo · 11:50 AM–12:15 PM · Final scoring and tie-breaker check.",
          "12:15–12:45 PM · Buffer for a decider match if scores remain tied · 12:45–1:00 PM · Final results and winner announcement.",
        ],
      },
      {
        title: "Full rules and participant guide",
        items: [
          "Be at your station at least 15 minutes before each map. Squads that do not join the room on time receive zero points for that map.",
          "Aimbots, trigger-bots, ESP, hacks, and other third-party software result in instant disqualification and may incur an additional committee-decided penalty.",
          "Macros, unauthorized peripherals or software/hardware, match-fixing, account sharing, ID spoofing, impersonation, exploiting glitches, or leaving a match without a valid reason result in disqualification. All squads involved in teaming are disqualified.",
          "Violations may also lead to prize or certificate forfeiture, additional committee penalties, or referral to the university administration.",
          "Treat players, referees, and volunteers respectfully. Toxicity or abusive behaviour may result in a penalty or disqualification. Referees may disqualify squads involved in unfair play.",
          "Raise disputes promptly at the admin/referee table after a match. The referee panel's decision is final; unresolved disputes may be escalated to Track C Leader Bittu Raj.",
          "Player-side connectivity problems do not qualify for a replay. Players are responsible for their own devices; the event team does not provide backup devices. If a device fails, the squad continues with its remaining functional devices and players.",
          "For a venue internet outage, a backup hotspot/dongle is available. Matches are paused and resumed where possible rather than replayed.",
          "Venue zones include player stations with charging access, a spectator seating area facing the large display, a streaming/casting desk, and a central admin/referee table. Directional signs guide attendees to De Nobili Hall; spectator capacity is enforced and volunteers manage seating and entry.",
          "The host device streams with PRISM Mobile, paired through the app's CONNECT feature with PRISM Live Studio on a laptop. The laptop sends the feed to the large display; screen recordings provide a backup if the stream drops.",
          "A live scoring sheet is updated after every map and shown at the admin table. Power backup (UPS/generator) covers charging stations, the streaming desk, and displays.",
          "A sound system supports announcements, commentary, and result calls. First aid, water, and refreshments are available at the venue.",
          "Seventeen event volunteers support check-in (2), device checks (2), refereeing (3), streaming/AV (2), commentary (2), scoring (2), crowd management (2), and logistics (2). Referees handle disputes; the Track C Leader monitors the schedule and any overrun.",
          "Live commentary supports the in-venue audience and social-media coverage. Certificates are issued to all registered squads; formal prize distribution takes place at the Valedictory Ceremony. The event schedule is coordinated with Death Race and Tech Treasure Hunt in Track C.",
        ],
      },
    ],
    prizeBreakdown: {
      total: "Exciting Gifts & Prizes",
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
        note: "The custom-room ID and password are shared with squad leaders before each map.",
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
    fullTitle: "CIPHER CHASE — Tech Treasure Hunt",
    badge: "Track C",
    badgeLevel: "Intermediate",
    trackId: "track-c",
    trackName: "TRACK C",
    shortDesc: "Tech Treasure Hunt",
    fullDesc: "Cipher Chase is a team-based campus treasure hunt with club-based eliminations. Teams follow clues through the Green Card round, a QR-code Smiley, and three hunts before the six surviving teams enter the final rounds.",
    date: "31st Oct",
    time: "TBA",
    prize: "Exciting Gifts & Prizes",
    price: "₹400 per team",
    team: "4 participants",
    venue: "TBA",
    accentColor: "#60a5fa",
    glowColor: "rgba(96,165,250,.2)",
    borderColor: "rgba(96,165,250,.4)",
    image: "/images/events/event-07.jpeg",
    highlights: [
      "Teams of 4 · ₹400 per team.",
      "Club groupings organize elimination rounds; teams in a club do not play as one combined team.",
      "Winning team prize: ₹4,000. Participants receive participation certificates.",
      "Clues may use QR codes, Morse code, binary code, and other puzzle formats.",
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
      "Register exactly 4 members. A team name is not required; choose one team leader to submit the team's registration.",
      "The team leader registers all four members together. Separate member registrations and joining multiple teams are not allowed.",
      "Use an email address and mobile number that are not already registered to another team.",
      "The fee is ₹400 per team. Register before 30 October 2026.",
    ],
    requirements: [
      "Every member must provide full name, institution, student ID/roll number, city, and a valid college ID card. Department/course is optional.",
      "Only the team leader must provide a mobile number, email address, and optional profile photo. Year/semester and section are not collected.",
    ],
    exploreSections: [
      {
        title: "Eligibility",
        items: [
          "Open to students in Classes 9–12 and undergraduate or postgraduate students. All courses and departments are eligible; external participants are welcome. No age restriction is specified.",
          "Each registered team has exactly 4 members. The registration fee is ₹400 per team.",
        ],
      },
      {
        title: "How does the club system work?",
        items: [
          "Clubs are groups used to organize the elimination rounds. Teams assigned to the same club remain separate teams; they do not play as one combined team.",
          "The number of clubs depends on participation. For example, 30 teams are divided into 6 clubs of 5 teams each. Each club competes independently during elimination stages.",
          "Follow the clues and instructions given by the organizers at every stage. The organizing committee makes the final decisions on qualification and elimination.",
        ],
      },
      {
        title: "Round 1: How do teams find the Green Card?",
        items: [
          "Each club is assigned a different location on campus, and teams receive clues leading to their club’s location.",
          "At a five-team club’s location, 4 Green Cards are placed. Find a card, return to De Nobili Hall, and submit it to the designated volunteers.",
          "The first 4 teams in each club to submit a valid Green Card qualify. The remaining team is eliminated, reducing the 30-team example from 30 teams to 24.",
        ],
      },
      {
        title: "What happens at the Smiley and during Hunts 1–3?",
        items: [
          "Qualified teams receive a clue to a Smiley placed somewhere on campus. Scan its QR code to get the next instruction.",
          "After the Smiley stage, teams continue directly from the QR-code instructions; they do not need to return to De Nobili Hall after each hunt.",
          "Complete Hunt 1, Hunt 2, and Hunt 3 by following the clues and instructions. One team from each club is eliminated after each hunt.",
          "In the 30-team example, the count progresses: 30 start → 24 after the Green Card round → 18 after Hunt 1 → 12 after Hunt 2 → 6 after Hunt 3.",
          "After Hunt 3, the remaining teams return to De Nobili Hall at the designated time for the Final Round.",
        ],
      },
      {
        title: "What happens in the Final Round?",
        items: [
          "Mind Game: all 6 remaining teams compete and are evaluated by score. The team with the lowest score is eliminated; the other 5 advance.",
          "Physical Game: the qualified teams take part in a Physical/Run-to-Hunt challenge.",
          "Physical Game rules, scoring, and elimination criteria: TBA.",
          "The overall winning team receives the ₹4,000 prize.",
        ],
      },
      {
        title: "How do I register my team?",
        items: [
          "Register exactly 4 team members. One team leader submits all four members in a single registration; a team name is not required.",
          "The fee is ₹400 per team. Register before 30 October 2026. Fees are non-refundable after cancellation.",
          "Each member provides their full name, institution, student ID/roll number, city, and a valid college ID. Department/course is optional.",
          "The team leader provides a mobile number and email address that are not used by another team. A profile photo is optional; year/semester and section are not collected.",
          "Separate member registrations and participation on multiple teams are not allowed.",
        ],
      },
      {
        title: "What prizes and certificates are provided?",
        items: [
          "The winning team receives a prize of ₹4,000 and a winning certificate. A trophy is optional.",
          "Participants receive participation certificates.",
          "Participation ID and refreshments: TBA.",
        ],
      },
      {
        title: "When and where is it happening?",
        items: [
          "Venue and event time: TBA.",
          "The event takes place on campus. Follow your club's clue set and proceed only to the locations assigned to your team.",
        ],
      },
      {
        title: "Full rules and participant guide",
        items: [
          "Stay within your team's assigned area. Leaving it eliminates the entire team.",
          "Do not damage college property. Damage may result in a penalty or fine.",
          "Cheating, disrupting equipment, or using a proxy disqualifies the entire team.",
          "Teams may visit campus before their assigned time to become familiar with it, but must not search for clues. Anyone caught searching for clues early is immediately eliminated.",
          "Follow organizers’ and volunteers’ instructions and your team’s clues at every stage. Qualification and elimination decisions made by the organizing committee are final.",
          "Do not tamper with clues, QR codes, Green Cards, or other game materials. Disrupting the game or obstructing other teams may lead to disqualification.",
          "Physical/Run-to-Hunt rules, scoring, and elimination criteria: TBA. The organizing committee may make necessary changes to the format; its decision is final.",
        ],
      },
    ],
    coordinatorRequirements: [
      "Provide coordinators with team-wise participant lists, contact details, uploaded ID cards, registration/payment/check-in status, and records for cancelled teams.",
    ],
    prizeBreakdown: {
      total: "₹4,000 for the winning team",
      first: "₹4,000",
      note: "The winning team receives a certificate; a trophy is optional. Participants receive participation certificates.",
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
      minTeamSize: 4,
      maxTeamSize: 4,
      feeAmount: 400,
      feeBasis: "per_team",
      feeDisplay: "₹400 per team",
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
    name: "VELOCITYX",
    aliases: ["death-race"],
    fullTitle: "VELOCITYX — Death Race",
    badge: "Track C",
    badgeLevel: "Advanced",
    trackId: "track-c",
    trackName: "TRACK C",
    shortDesc: "Death Race",
    fullDesc: "Build. Pilot. Survive the Track. Death Race is a robotic obstacle race that tests engineering, durability, and piloting skill. Teams guide their custom-built robots through rough terrain, a shallow water pit, an incline, and other challenges on one modular course.",
    date: "31st Oct",
    time: "TBA",
    prize: "Exciting Gifts & Prizes",
    price: "₹700 per team",
    team: "2–4 participants",
    venue: "TBA",
    accentColor: "#60a5fa",
    glowColor: "rgba(96,165,250,.2)",
    borderColor: "rgba(96,165,250,.4)",
    image: "/images/events/event-08.jpeg",
    highlights: [
      "Pilot a custom robot through a timed, five-zone obstacle course.",
      "Teams of 2–4 · ₹700 per team · 31 October 2026.",
      "The course tests robot control, traction, durability, and driving precision.",
    ],
    rules: [
      "Pilots must stand behind the marked control barrier and operate by remote control or approved onboard automation.",
      "Do not touch the robot after a run begins. A pilot may request one manual reset if the robot is trapped; a 15-second penalty applies.",
      "Runs have a five-minute time limit. An unfinished run is recorded as incomplete.",
      "Interfering with marshals, timing equipment, or another lane results in disqualification.",
      "Robots must not use weapons, sharp exposed edges, liquid sprays, combustion engines, flames, or untethered projectiles.",
      "Robots must have a clearly marked master power cutoff and a securely fastened battery enclosure. Unsafe operation or fire risk results in disqualification.",
    ],
    registrationInfo: [
      "Choose one team leader to submit a single registration for the team.",
      "Register all 2–4 team members together and provide a team name. Duplicate registrations are not allowed.",
      "The fee is ₹700 per team.",
    ],
    requirements: [
      "Bring a custom-built terrestrial robot no larger than 30 cm long × 30 cm wide × 30 cm high. Maximum weight: TBA.",
      "Robots must use onboard rechargeable batteries only (LiPo, NiMH, or sealed lead-acid), at no more than 24 V.",
      "Manual wired, manual wireless (RF, Bluetooth, Wi-Fi), or fully autonomous control is allowed.",
      "Each member provides their name, institution, mobile number, and student ID/roll number; each uploads a valid college ID and verifies email/mobile.",
    ],
    eligibility: [
      "Designed for engineering students, robotics enthusiasts, and student clubs. Spectators are welcome to watch from the designated area.",
      "Each competing team must register 2–4 members and bring a robot that passes the safety and technical inspection.",
    ],
    prizeBreakdown: {
      total: "Exciting Gifts & Prizes",
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
    exploreSections: [
      {
        title: "Eligibility",
        items: [
          "The event is designed for engineering students, robotics enthusiasts, and student clubs. Spectators can watch from the designated area.",
          "Competing teams must have 2–4 members and bring a robot that passes the safety and technical inspection.",
        ],
      },
      {
        title: "How does the competition work?",
        items: [
          "Qualifiers: each team completes an individual timed run. Time begins at the green start signal, and penalties are added to the run time.",
          "Knockouts: teams advance through elimination heats, semifinals, and a final. Number of qualifying teams and knockout bracket size: TBA.",
          "For a course at least 1.2 m wide, teams race in parallel lanes. For a course under 1 m wide, teams make back-to-back timed runs. Lane format for a course between 1 m and 1.2 m: TBA.",
          "Final: two-lap endurance run. Number of finalists: TBA.",
        ],
      },
      {
        title: "What are the five course zones?",
        items: [
          "1. Start signal: begin when the light turns green. A false start adds 5 seconds.",
          "2. Zig-zag and rough terrain: steer around bends, wooden cleats, sand, gravel, and small tyres without getting stuck or crossing the track boundary.",
          "3. Water pit: cross a lined tray with water up to 3 cm deep. Protect electrical components and maintain wheel traction.",
          "4. Incline: climb and descend a 30° ramp with a high-grip surface. Avoid slipping, rolling backwards, or tipping over.",
          "5. Endurance finish: cross staggered wooden blocks and a ground-level rope 1–2 cm high, then reach the timing checkpoint.",
        ],
      },
      {
        title: "What robot can I bring?",
        items: [
          "Robot type: custom-built terrestrial robot. Maximum dimensions: 30 cm long × 30 cm wide × 30 cm high.",
          "Maximum weight: TBA.",
          "Power: onboard rechargeable batteries only (LiPo, NiMH, or sealed lead-acid), at a maximum of 24 V.",
          "Control: manual wired, manual wireless (RF, Bluetooth, or Wi-Fi), or fully autonomous.",
        ],
      },
      {
        title: "What are the safety rules?",
        items: [
          "Weapons and destructive mechanisms, including wedges, spinners, and saws, are prohibited.",
          "Do not use exposed sharp metal edges, untaped glass or hard acrylic corners, liquid sprays, combustion engines, flames, or untethered projectiles.",
          "Fit a clearly marked master power cutoff switch and secure the battery enclosure. Protect electrical components, especially when crossing the water pit.",
          "Pilots must remain behind the marked control barrier. Do not touch the robot after a run begins; request a manual reset if it is trapped. A reset adds 15 seconds.",
          "Do not interfere with marshals, timing equipment, or another lane. Unsafe operation or fire risk results in disqualification.",
        ],
      },
      {
        title: "How is the winner decided?",
        items: [
          "Complete the full course to qualify. Your adjusted run time starts with your raw time and includes any time penalties.",
          "False start: +5 seconds. Stalling: +5 seconds for each 5-second interval. Skipped obstacle: +20 seconds. Manual reset: +15 seconds. Boundary violation: +5 seconds.",
          "A boundary violation occurs when all of the robot’s wheels or tracks cross outside the marked course.",
          "The fastest time is the ranking baseline; final placements also consider completion efficiency and penalty count. Unsafe operation or fire risk results in disqualification.",
          "A run is limited to 5 minutes. An unfinished run is recorded as incomplete.",
        ],
      },
      {
        title: "How do I register?",
        items: [
          "Register one team of 2–4 members. One team leader submits a single registration with every member’s details; a team name is required.",
          "Each member provides their name, institution, mobile number, and student ID or roll number, and uploads a valid college ID.",
          "The fee is ₹700 per team. Verify the email address and mobile number provided during registration.",
          "Registration deadline: TBA.",
        ],
      },
      {
        title: "When and where is it happening?",
        items: [
          "Date: 31 October 2026 · Event time: TBA.",
          "Venue: TBA.",
          "Event schedule: TBA.",
        ],
      },
      {
        title: "Full rules and event guide",
        items: [
          "The course is one continuous 20–30 m modular route, arranged as a straight or U-shaped track. Sections may be adjusted between qualifying runs.",
          "Track materials include 12 mm plywood, 2×4 timber studs, PVC framing pipes, rubber sheets, plastic lining, tarpaulin, used tyres, gravel, sand, sandbags, and wooden slats. Track assembly takes about 3 hours; dismantling takes under 1.5 hours.",
          "Timing and safety equipment includes a handheld red/green light controller, digital stopwatch or infrared timing gate, safety mesh, and a public-address speaker.",
          "The pit area has workbenches, extension power boards, multi-plug extension cords, and a battery-charging mat. Spectator seating is provided.",
          "Seven event volunteers support the race: two track marshals monitor zones and penalties; one controller manages starts and lap times; one safety controller oversees hazards and cutoff; two registration/pit managers manage the queue; and one crowd manager guides spectators. Volunteers also build the track before the event.",
          "A manual reset may be requested if a robot is permanently trapped. The reset adds 15 seconds; team members must not touch the robot without requesting it.",
          "Knockout heats use parallel lanes when the track is at least 1.2 m wide and back-to-back timed runs when it is under 1 m wide. Lane format for widths between 1 m and 1.2 m: TBA.",
          "Spectators must remain in the designated viewing area and follow marshal instructions.",
        ],
      },
    ],
    registrationConfig: {
      eventFormat: "team",
      minTeamSize: 2,
      maxTeamSize: 4,
      feeAmount: 700,
      feeBasis: "per_team",
      feeDisplay: "₹700 per team",
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
        coCoordinator: "Ayush Kumar",
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
    name: "HACK THE SKILL",
    aliases: ["hack-the-skills"],
    fullTitle: "HACK THE SKILL — Workshop",
    badge: "Track E",
    badgeLevel: "Intermediate",
    trackId: "track-e",
    trackName: "TRACK E",
    shortDesc: "Workshop",
    fullDesc: "Hack the Skills is a technical workshop open to students from Class 8 through postgraduate level. Register individually or as a team of two to four. Schedule and venue: TBA.",
    date: "31st Oct",
    time: "TBA",
    prize: "Exciting Gifts & Prizes",
    price: "₹300 registration fee",
    team: "1–4 participants",
    venue: "TBA",
    accentColor: "#f472b6",
    glowColor: "rgba(244,114,182,.2)",
    borderColor: "rgba(244,114,182,.4)",
    image: "/events/hack-the-skill.png",
    highlights: [
      "Technical workshop · Schedule and venue: TBA.",
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
