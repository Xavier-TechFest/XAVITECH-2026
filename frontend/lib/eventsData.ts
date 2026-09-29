export interface EventItem {
  id: string;
  name: string; // Crisp 1-2 word display title (e.g. "HACKATHON", "WEB DEVELOPMENT")
  fullTitle: string; // Complete descriptive name (e.g. "Crucible — Flagship 12-Hour Hackathon")
  badge: string;
  badgeLevel: "Crucible" | "Advanced" | "Intermediate" | "Beginner";
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
  accentColor: string; // e.g. '#35e0c9'
  glowColor: string;   // rgba
  borderColor: string; // CSS border color
  image: string;
  highlights: string[];
  rules: string[];
  isFlagship?: boolean;
}

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

export const TRACKS: TrackItem[] = [
  {
    id: "all",
    num: "00",
    letter: "ALL",
    name: "ALL ARENAS",
    subtitle: "Complete Directory",
    description: "Browse the complete directory of 15 high-voltage arenas.",
    accentColor: "#35e0c9",
    badgeClass: "border-circuit/60 text-circuit bg-circuit/10",
  },
  {
    id: "technical",
    num: "01",
    letter: "A",
    name: "TECHNICAL & CODING",
    subtitle: "Software & Engineering",
    description: "Hackathons, speed coding, systems debugging, data modeling & full-stack web builds.",
    accentColor: "#35e0c9",
    badgeClass: "border-[#35e0c9]/60 text-[#35e0c9] bg-[#35e0c9]/10",
  },
  {
    id: "ideation",
    num: "02",
    letter: "B",
    name: "KNOWLEDGE & IDEATION",
    subtitle: "AI & Cognitive Intelligence",
    description: "AI agent duels, tech history trivia, and academic research paper defense.",
    accentColor: "#c084fc",
    badgeClass: "border-purple-400/60 text-purple-300 bg-purple-500/10",
  },
  {
    id: "learning",
    num: "03",
    letter: "C",
    name: "HANDS-ON LEARNING",
    subtitle: "Masterclasses & Workshops",
    description: "Masterclasses on low-latency systems, kernel hacking, and AI architectures.",
    accentColor: "#f472b6",
    badgeClass: "border-pink-400/60 text-pink-300 bg-pink-500/10",
  },
  {
    id: "adventure",
    num: "04",
    letter: "D",
    name: "FUN & ADVENTURE",
    subtitle: "Robotics & Ciphers",
    description: "Cryptographic cipher scavenger hunts and high-octane robotic obstacle races.",
    accentColor: "#fbbf24",
    badgeClass: "border-amber-400/60 text-amber-300 bg-amber-500/10",
  },
  {
    id: "gaming",
    num: "05",
    letter: "E",
    name: "GAMING ARENA",
    subtitle: "Esports Tournaments",
    description: "High-stakes tactical BGMI esports tournaments across Erangel & Miramar.",
    accentColor: "#60a5fa",
    badgeClass: "border-blue-400/60 text-blue-300 bg-blue-500/10",
  },
  {
    id: "mun",
    num: "06",
    letter: "F",
    name: "GLOBAL AFFAIRS MUN",
    subtitle: "Diplomacy & AI Policy",
    description: "Simulated Model UN committee on autonomous weapons, AI sovereignty & cyberwarfare.",
    accentColor: "#34d399",
    badgeClass: "border-emerald-400/60 text-emerald-300 bg-emerald-500/10",
  },
  {
    id: "suggested",
    num: "07",
    letter: "G",
    name: "SUGGESTED ARENAS",
    subtitle: "Experimental & Retro",
    description: "Experimental challenges including screenless blind coding and pure logic synthesis.",
    accentColor: "#f87171",
    badgeClass: "border-rose-400/60 text-rose-300 bg-rose-500/10",
  },
];

export const EVENTS: EventItem[] = [
  // --- TECHNICAL & CODING ---
  {
    id: "crucible",
    name: "HACKATHON",
    fullTitle: "Crucible — Flagship 12-Hour Hackathon",
    badge: "Crucible",
    badgeLevel: "Crucible",
    trackId: "technical",
    trackName: "TECHNICAL & CODING",
    shortDesc: "12 hours of uninterrupted architectural engineering and product synthesis.",
    fullDesc: "Crucible is Xavier University's flagship hackathon where top product teams, system engineers, and developers gather for 12 intense hours. Tackle real-world civic, industrial, and AI domain problems, receive mentor reviews from industry architects, and demo working prototypes to a panel of expert judges.",
    time: "09:30 AM – 09:30 PM",
    date: "24 Oct 2026",
    prize: "₹50,000",
    price: "₹1,499",
    team: "2 to 4 Members",
    venue: "Aryabhata Computing Center",
    accentColor: "#35e0c9",
    glowColor: "rgba(53,224,201,0.25)",
    borderColor: "rgba(53,224,201,0.5)",
    image: "/events/crucible.jpg",
    highlights: [
      "12-Hour Continuous Product Build Sprint",
      "Direct Mentorship by Senior System Architects",
      "Live 3-minute Pitch & Prototype Demo Session",
      "Cloud Credits & API Access Bundles Provided"
    ],
    rules: [
      "All code must be authored during the 12-hour window.",
      "Open-source libraries and APIs are permitted.",
      "Teams must consist of 2 to 4 members.",
      "Final submission requires a working demo and Git repo link."
    ]
  },
  {
    id: "code-sprint",
    name: "CODE SPRINT",
    fullTitle: "Code Sprint — Competitive Algorithmic Arena",
    badge: "Advanced",
    badgeLevel: "Advanced",
    trackId: "technical",
    trackName: "TECHNICAL & CODING",
    shortDesc: "High-velocity algorithmic problem solving under rigorous time constraints.",
    fullDesc: "Test your raw algorithmic speed, spatial reasoning, and data structure proficiency. Code Sprint presents competitive programmers with multi-level algorithmic problems evaluated instantly by an automated judge system with strict time and memory limits.",
    time: "11:00 AM – 01:30 PM",
    date: "24 Oct 2026",
    prize: "₹15,000",
    price: "₹899",
    team: "Individual",
    venue: "Turing Computer Labs",
    accentColor: "#35e0c9",
    glowColor: "rgba(53,224,201,0.25)",
    borderColor: "rgba(53,224,201,0.4)",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    highlights: [
      "Automated IO Judge Platform (Codeforces style)",
      "Speed-based Penalty Matrix",
      "Language support: C++, Python, Java, Rust, Go"
    ],
    rules: [
      "Individual participation only.",
      "No external AI assistants or search engines allowed.",
      "Plagiarism detection will run automatically on all submissions."
    ]
  },
  {
    id: "debugging-crucible",
    name: "DEBUGGING",
    fullTitle: "Debugging Crucible — Concurrency & Memory Leaks",
    badge: "Advanced",
    badgeLevel: "Advanced",
    trackId: "technical",
    trackName: "TECHNICAL & CODING",
    shortDesc: "Deconstruct obscure race conditions, memory leaks, and deadlocks.",
    fullDesc: "Dive into deliberately broken codebases filled with memory leaks, race conditions, dangling pointers, and infinite loops. Participants must diagnose, fix, and optimize multi-threaded code under time constraints.",
    time: "02:00 PM – 04:00 PM",
    date: "24 Oct 2026",
    prize: "₹10,000",
    price: "₹699",
    team: "Individual or Pairs (1–2)",
    venue: "Systems Lab",
    accentColor: "#35e0c9",
    glowColor: "rgba(53,224,201,0.25)",
    borderColor: "rgba(53,224,201,0.4)",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    highlights: [
      "Real-world bug repro scenarios",
      "GDB, Valgrind, & Profiler tools allowed",
      "Bonus points for performance speedups"
    ],
    rules: [
      "Fix bugs without breaking existing test suites.",
      "Time spent and test coverage determine score."
    ]
  },
  {
    id: "data-analytics",
    name: "DATA ANALYTICS",
    fullTitle: "Data Analytics & Modeling Sprint",
    badge: "Intermediate",
    badgeLevel: "Intermediate",
    trackId: "technical",
    trackName: "TECHNICAL & CODING",
    shortDesc: "Extracting empirical signal from uncurated multi-gigabyte datasets.",
    fullDesc: "Uncover hidden business patterns and predictive insights from raw, messy datasets. Participants will perform data cleaning, exploratory data analysis, interactive dashboard creation, and present data stories to data scientists.",
    time: "01:30 PM – 04:30 PM",
    date: "24 Oct 2026",
    prize: "₹12,000",
    price: "₹999",
    team: "1 to 2 Members",
    venue: "Analytics Studio",
    accentColor: "#35e0c9",
    glowColor: "rgba(53,224,201,0.25)",
    borderColor: "rgba(53,224,201,0.4)",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    highlights: [
      "Uncurated Multi-Gigabyte Real-World Dataset",
      "Power BI, Tableau, Excel & Python Data Stack",
      "Executive Dashboard Pitch Round"
    ],
    rules: [
      "Tooling choice is open (Excel, Power BI, Python/Pandas).",
      "Final deliverable must include an executive dashboard + summary."
    ]
  },
  {
    id: "ui-ux-designathon",
    name: "UI/UX DESIGN",
    fullTitle: "UI/UX Designathon — Systems & Workflows",
    badge: "Intermediate",
    badgeLevel: "Intermediate",
    trackId: "technical",
    trackName: "TECHNICAL & CODING",
    shortDesc: "High-fidelity design systems for complex scientific and civic workflows.",
    fullDesc: "Conceptualize and prototype sleek, modern user experiences for complex systems. Design teams are given a target user persona and problem space, then tasked with delivering micro-interactions, responsive screens, and design tokens.",
    time: "10:30 AM – 02:00 PM",
    date: "24 Oct 2026",
    prize: "₹12,000",
    price: "₹899",
    team: "1 to 2 Members",
    venue: "Design Innovation Lab",
    accentColor: "#c084fc",
    glowColor: "rgba(192,132,252,0.25)",
    borderColor: "rgba(192,132,252,0.4)",
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80",
    highlights: [
      "Figma / Framer Interactive Prototyping",
      "Design System & Accessibility Evaluation",
      "Live Design Critique by Senior Product Designers"
    ],
    rules: [
      "Designs must be original work created during the event.",
      "Must include responsive desktop and mobile viewports."
    ]
  },
  {
    id: "web-craft",
    name: "WEB DEVELOPMENT",
    fullTitle: "Web Craft 3.0 — Interactive Web Apps",
    badge: "Intermediate",
    badgeLevel: "Intermediate",
    trackId: "technical",
    trackName: "TECHNICAL & CODING",
    shortDesc: "High-performance interactive web apps built with modern full-stack frameworks.",
    fullDesc: "Build cutting-edge full-stack web applications featuring interactive 3D graphics, fluid animations, and robust API integrations. Showcase your mastery over Next.js, Three.js, React, and Tailwind CSS.",
    time: "01:00 PM – 05:00 PM",
    date: "24 Oct 2026",
    prize: "₹12,000",
    price: "₹999",
    team: "1 to 2 Members",
    venue: "Computing Lab 5",
    accentColor: "#35e0c9",
    glowColor: "rgba(53,224,201,0.25)",
    borderColor: "rgba(53,224,201,0.4)",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    highlights: [
      "Modern Web Stack: Next.js, Three.js, Framer Motion",
      "Lighthouse Performance & Aesthetics Scoring",
      "Real-time Deployment Verification"
    ],
    rules: [
      "App must be deployed live on Vercel / Netlify / Render by submission deadline.",
      "Teams of 1 to 2 members."
    ]
  },

  // --- KNOWLEDGE & IDEATION ---
  {
    id: "ai-prompt-duel",
    name: "AI PROMPT BATTLE",
    fullTitle: "AI Prompt & Agent Duel",
    badge: "Intermediate",
    badgeLevel: "Intermediate",
    trackId: "ideation",
    trackName: "KNOWLEDGE & IDEATION",
    shortDesc: "Harness LLMs and autonomous agent workflows to solve algorithmic puzzles.",
    fullDesc: "Put your prompt engineering and LLM orchestration skills to the ultimate test. Craft multi-agent chains, system prompts, and context pipelines to solve complex multi-step reasoning puzzles faster and more accurately than rivals.",
    time: "03:00 PM – 05:00 PM",
    date: "24 Oct 2026",
    prize: "₹10,000",
    price: "₹799",
    team: "Individual",
    venue: "Cognitive Computing Theater",
    accentColor: "#c084fc",
    glowColor: "rgba(192,132,252,0.25)",
    borderColor: "rgba(192,132,252,0.4)",
    image: "/events/ai_prompt_duel.jpg",
    highlights: [
      "Prompt Optimization & Agentic Workflows",
      "Benchmark Accuracy & Token Efficiency Scoring",
      "Head-to-head Live Arena Leaderboard"
    ],
    rules: [
      "Individual competition.",
      "Standard LLM API keys provided at start."
    ]
  },
  {
    id: "chronos-tech-quiz",
    name: "TECH QUIZ",
    fullTitle: "The Chronos Tech Quiz & Trivia",
    badge: "Beginner",
    badgeLevel: "Beginner",
    trackId: "ideation",
    trackName: "KNOWLEDGE & IDEATION",
    shortDesc: "High-voltage trivia covering computing antiquity and quantum breakthroughs.",
    fullDesc: "From the Babbage Difference Engine to modern quantum computing and frontier AI models, Chronos Tech Quiz tests your deep knowledge across the history, leaders, leaks, and breakthroughs of technology.",
    time: "11:30 AM – 01:30 PM",
    date: "24 Oct 2026",
    prize: "₹8,000",
    price: "₹499",
    team: "Pairs (2 Members)",
    venue: "Auditorium Minor",
    accentColor: "#c084fc",
    glowColor: "rgba(192,132,252,0.25)",
    borderColor: "rgba(192,132,252,0.4)",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    highlights: [
      "Rapid-Fire Buzzer & Audio-Visual Rounds",
      "Tech History, Silicon, Cryptography & Sci-Fi Lore",
      "Interactive Audience & Finalist Stage Showdown"
    ],
    rules: [
      "Teams of exactly 2 members.",
      "No phones or electronic devices allowed during rounds."
    ]
  },
  {
    id: "research-paper-symposium",
    name: "RESEARCH SYMPOSIUM",
    fullTitle: "Research Paper Symposium & Defense",
    badge: "Advanced",
    badgeLevel: "Advanced",
    trackId: "ideation",
    trackName: "KNOWLEDGE & IDEATION",
    shortDesc: "Defend novel research in distributed systems, cryptography, or robotics.",
    fullDesc: "A high-level academic defense symposium for students and young researchers. Present your original research papers or literature reviews before a distinguished jury of computer scientists and academic faculty.",
    time: "02:00 PM – 05:00 PM",
    date: "24 Oct 2026",
    prize: "₹12,000",
    price: "₹999",
    team: "1 to 3 Authors",
    venue: "Academic Senate Chamber",
    accentColor: "#c084fc",
    glowColor: "rgba(192,132,252,0.25)",
    borderColor: "rgba(192,132,252,0.4)",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    highlights: [
      "Formal Slide Deck Defense & Oral Presentation",
      "Peer-review feedback from Academic Committee",
      "Opportunity for publication in University Proceedings"
    ],
    rules: [
      "10-minute presentation + 5-minute Q&A defense.",
      "1 to 3 authors per paper."
    ]
  },

  // --- HANDS-ON LEARNING ---
  {
    id: "masterclass-applied-systems",
    name: "MASTERCLASS",
    fullTitle: "Masterclass: Applied Systems & AI",
    badge: "Intermediate",
    badgeLevel: "Intermediate",
    trackId: "learning",
    trackName: "HANDS-ON LEARNING",
    shortDesc: "Interactive masterclasses on low-latency systems and kernel hacking.",
    fullDesc: "Join industry architects and researchers in an intensive hands-on masterclass. Gain deep practical insights into writing low-latency systems, profiling Linux kernel performance, and training efficient neural network models.",
    time: "02:30 PM – 05:00 PM",
    date: "24 Oct 2026",
    prize: "Masterclass Badge",
    price: "₹1,299",
    team: "Individual Open Access",
    venue: "Auditorium Major",
    accentColor: "#f472b6",
    glowColor: "rgba(244,114,182,0.25)",
    borderColor: "rgba(244,114,182,0.4)",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    highlights: [
      "Live Live-Coding & Guided Systems Walkthrough",
      "Verifiable Digital Certificate of Mastery",
      "Take-Home Codebase Repos & Architecture Blueprints"
    ],
    rules: [
      "Open to all registered Techfest attendees.",
      "Bring your laptop with Docker or Node/Python environment pre-configured."
    ]
  },

  // --- FUN & ADVENTURE ---
  {
    id: "geodesic-cipher-hunt",
    name: "CIPHER HUNT",
    fullTitle: "The Geodesic Cipher Hunt — Cryptographic Treasure",
    badge: "Intermediate",
    badgeLevel: "Intermediate",
    trackId: "adventure",
    trackName: "FUN & ADVENTURE",
    shortDesc: "Campus-wide cryptographic scavenger hunt decoding steganography.",
    fullDesc: "Embark on an adrenaline-pumping campus-wide treasure hunt! Decode steganographic messages, intercept Bluetooth low-energy hardware beacons, solve cipher riddles, and race to unlock the central master vault.",
    time: "03:30 PM – 06:00 PM",
    date: "24 Oct 2026",
    prize: "₹10,000",
    price: "₹699",
    team: "Teams of 3 to 4",
    venue: "Campus-wide",
    accentColor: "#fbbf24",
    glowColor: "rgba(251,191,36,0.25)",
    borderColor: "rgba(251,191,36,0.4)",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    highlights: [
      "Physical & Digital Hybrid Cipher Locations",
      "RFID, QR Codes & Hardware Beacons",
      "Live Team GPS Tracking & Time Penalty Matrix"
    ],
    rules: [
      "Teams of 3 to 4 members.",
      "All clues must be decoded on campus grounds within the time limit."
    ]
  },
  {
    id: "death-race",
    name: "DEATH RACE",
    fullTitle: "Death Race: Robotic Obstacle Arena",
    badge: "Advanced",
    badgeLevel: "Advanced",
    trackId: "adventure",
    trackName: "FUN & ADVENTURE",
    shortDesc: "Custom wired and wireless robotic rovers navigating obstacle terrain.",
    fullDesc: "The ultimate clash of custom robotic rovers! Custom-built wired or RF-controlled bots battle through mud pits, incline ramps, rotating obstacles, and bridge crossings in a timed double-elimination race.",
    time: "01:00 PM – 04:00 PM",
    date: "24 Oct 2026",
    prize: "₹15,000",
    price: "₹1,199",
    team: "2 to 3 Members",
    venue: "Outdoor Robotics Colosseum",
    accentColor: "#fbbf24",
    glowColor: "rgba(251,191,36,0.25)",
    borderColor: "rgba(251,191,36,0.4)",
    image: "/events/death_race.jpg",
    highlights: [
      "Heavy-Duty Custom Arena Course",
      "Timed Speed Laps + Obstacle Clearance Scoring",
      "Robotic Tech Inspection & Pit Stop Area"
    ],
    rules: [
      "Bot weight must not exceed 5 kg.",
      "Maximum voltage supplied to bot must be ≤ 24V."
    ]
  },

  // --- GAMING ARENA ---
  {
    id: "bgmi-arena",
    name: "BGMI ESPORTS",
    fullTitle: "BGMI: Battlegrounds Arena Tournament",
    badge: "Crucible",
    badgeLevel: "Crucible",
    trackId: "gaming",
    trackName: "GAMING ARENA",
    shortDesc: "High-stakes esports tournament across custom Erangel and Miramar lobbies.",
    fullDesc: "Drop into custom battlegrounds with Patna's top gaming squads. Compete across 4 high-velocity matches on Erangel and Miramar with point multipliers for eliminations and placement.",
    time: "02:00 PM – 06:00 PM",
    date: "24 Oct 2026",
    prize: "₹15,000",
    price: "₹999",
    team: "Squad of 4 (+1 Substitute)",
    venue: "Esports Arena",
    accentColor: "#60a5fa",
    glowColor: "rgba(96,165,250,0.25)",
    borderColor: "rgba(96,165,250,0.4)",
    image: "/events/bgmi_arena.jpg",
    highlights: [
      "Custom Private Lobbies with Live Shoutcasting",
      "4 Match Rotation (Erangel, Miramar, Sanhok)",
      "High-Res Main Stage Broadcast & Leaderboard"
    ],
    rules: [
      "Mobile devices only (Emulators strictly prohibited).",
      "Squads must consist of 4 players."
    ]
  },

  // --- GLOBAL AFFAIRS MUN ---
  {
    id: "tech-mun",
    name: "TECH MUN",
    fullTitle: "Tech MUN: AI Sovereignty & Cyberwarfare",
    badge: "Advanced",
    badgeLevel: "Advanced",
    trackId: "mun",
    trackName: "GLOBAL AFFAIRS MUN",
    shortDesc: "Simulated UN committee on autonomous weapons & frontier AI treaties.",
    fullDesc: "Step into the shoes of global diplomats, cybersecurity directors, and UN delegates. Formulate international policies, negotiate draft resolutions, and resolve international crises surrounding autonomous weapon systems and AI sovereignty.",
    time: "11:00 AM – 04:30 PM",
    date: "24 Oct 2026",
    prize: "₹12,000",
    price: "₹899",
    team: "Individual Delegate",
    venue: "Convention Hall Alpha",
    accentColor: "#34d399",
    glowColor: "rgba(52,211,153,0.25)",
    borderColor: "rgba(52,211,153,0.4)",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    highlights: [
      "UN Disarmament & Security (DISEC) Simulation",
      "Real-time Midnight Emergency Crisis Scenario",
      "Awards for Best Delegate, High Commendation & Special Mention"
    ],
    rules: [
      "Formal business attire required.",
      "Position papers must be submitted prior to committee opening."
    ]
  },

  // --- SUGGESTED ARENAS ---
  {
    id: "blind-coding",
    name: "BLIND CODING",
    fullTitle: "Blind Coding & Screenless Logic",
    badge: "Advanced",
    badgeLevel: "Advanced",
    trackId: "suggested",
    trackName: "SUGGESTED ARENAS",
    shortDesc: "Write complex algorithms with monitors powered completely off.",
    fullDesc: "Strip away visual code feedback and rely purely on mental compilation! Participants are handed problem statements, but their monitors remain switched off while typing. Once submitted, the judge executes their code.",
    time: "04:00 PM – 05:30 PM",
    date: "24 Oct 2026",
    prize: "₹6,000",
    price: "₹499",
    team: "Individual",
    venue: "Retro Computing Corner",
    accentColor: "#f87171",
    glowColor: "rgba(248,113,113,0.25)",
    borderColor: "rgba(248,113,113,0.4)",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    highlights: [
      "Monitors Turned OFF during typing rounds",
      "Pure Mental Execution & Syntax Mastery",
      "Instant Compilation & Test Run Phase at the end"
    ],
    rules: [
      "Monitors will be powered off or covered.",
      "Syntax errors incur severe point deductions."
    ]
  }
];
