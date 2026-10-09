// export interface Person {
//   name: string;
//   email?: string;
//   linkedin?: string;
//   /**
//    * Optional explicit photo path (e.g. "/committee/utkarsh.png").
//    * If left out, the card looks for /public/committee/<name-as-slug>.(jpg|jpeg|png|webp)
//    * e.g. "Utkarsh Gupta" -> /public/committee/utkarsh-gupta.jpg. No photo found = silhouette.
//    */
//   image?: string;
// }

// // Committee member helper. Add email / linkedin when you have them:
// // m("Utkarsh Gupta", "utkarsh@gmail.com", "https://www.linkedin.com/in/utkarsh")
// const m = (name: string, email?: string, linkedin?: string): Person => ({ name, email, linkedin });

// export const patron: Person = { name: "Fr. Dr. Martin Poras SJ", email: "[patron@xup.ac.in]" };
// export const convenor: Person = { name: "Dr. Piyush Verma", email: "[convenor@xup.ac.in]" };

// export const overallCoordinators: Person[] = [
//   { name: "Vaishnavi Ambastha", email: "rajvaishnavi0415@gmail.com", linkedin:"https://www.linkedin.com/in/vaishnavi-raj15?utm_source=share_via&utm_content=profile&utm_medium=member_android" },
//   { name: "Shlok Dadhich", email: "shlokdadhich7@gmail.com", linkedin:"http://www.linkedin.com/in/shlokdadhich07" },
// ];

// export interface TrackData {
//   name: string;
//   /** Official event name for single-event tracks (no separate event coordinators). */
//   eventName?: string;
//   leads: Person[];
//   events: { name: string; leads: Person[] }[];
// }

// const p = (label: string): Person => ({
//   name: `[${label} Name]`,
//   email: `[${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}@gmail.com]`,
// });

// export const tracks: TrackData[] = [
//   {
//     name: "Hackathon",
//     eventName: "Innocraft",
//     leads: [m("Utkarsh Gupta", "utkarshgupta1821@gmail.com", "https://www.linkedin.com/in/utkarsh-gupta-017a53375?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Rajnish Kumar", "rajnishkumarschool911@gmail.com", "https://www.linkedin.com/in/rajnish-kumar-25ab53346?utm_source=share_via&utm_content=profile&utm_medium=member_android")],
//     events: [],
//   },
//   {
//     name: "Coding & Development",
//     leads: [m("Priyanshu John Thakur", "johnthakur0674@gmail.com", "https://in.linkedin.com/in/priyanshu-john-thakur")],
//     events: [
//       { name: "Debug Derby", leads: [m("Priyanshu Kumar", "Priyanshuk092005@gmail.com", "https://www.linkedin.com/in/priyanshu-kumar-b67085428?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Akshat Raj", "akshatr854@gmail.com", "https://www.linkedin.com/in/akshat-raj-822a0a238?utm_source=share_via&utm_content=profile&utm_medium=member_android")] },
//       { name: "WebWeave", leads: [m("Divyanka Keshri", "divyankakeshri8@gmail.com", "https://www.linkedin.com/in/divyanka-keshri-1aba88275?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Ashu Kumar", "aashurajvermaa@gmail.com", "https://www.linkedin.com/in/aashurajvermaa?utm_source=share_via&utm_content=profile&utm_medium=member_android")] },
//       { name: "VLookUp", leads: [m("Komal Anand", "komalanandd01@gmail.com", "https://www.linkedin.com/in/komal-anand-943a80327?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Aditya Raj", "adityarajatharva246@gmail.com", "https://www.linkedin.com/in/aditya-raj-59512043b?utm_source=share_via&utm_content=profile&utm_medium=member_ios")] },
//       { name: "Battle of Bots", leads: [m("Krishna", "krsna6366@gmail.com", "http://www.linkedin.com/in/krishna-kumar-515395430")] },
//       { name: "Runtime Rush", leads: [m("Aadya Ayushi", "aadyaayushi836@gmail.com", "https://www.linkedin.com/in/aadya-ayushi-461171441?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Kunal", "k8847139@gmail.com", "https://www.linkedin.com/in/kunal-138653387?utm_source=share_via&utm_content=profile&utm_medium=member_android")] },
//     ],
//   },
//   {
//     name: "Gaming & Adventure",
//     leads: [m("Bittu Raj", "bitturaj12a12@gmail.com", "https://www.linkedin.com/in/bittu-raj-8524b142a?utm_source=share_via&utm_content=profile&utm_medium=member_android")],
//     events: [
//       { name: "BattleGround Blitz", leads: [m("Umang Sahni", "sahniumang2008@gmail.com", "https://www.linkedin.com/in/umang-sahni-9b1017441?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Joshua Singh", "joshua0717singh@gmail.com", "https://www.linkedin.com/in/joshua-singh-21011043b?utm_source=share_via&utm_content=profile&utm_medium=member_android")] },
//       { name: "Cipher Chase", leads: [m("Shristi Singh", "Shristisingh9985@gmail.com", "https://www.linkedin.com/in/shristi-singh-2ab518379?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Sunny Kumar", "Sunnykumar221973@gmail.com", "https://www.linkedin.com/in/sunny-kumar-166841414/?lipi=urn%3Ali%3Apage%3Ad_flagship3_feed%3B1amfyvN8SYymw4zka%2FGyDw%3D%3D")] },
//       { name: "VelocityX", leads: [m("Jai Vardhan", "jaivardhan27062007@gmail.com"), m("Suraj Kaushik", "surajkaushik2007@gmail.com", "https://www.linkedin.com/in/suraj-kaushik-74b118324?utm_source=share_via&utm_content=profile&utm_medium=member_android")] },
//     ],
//   },
//   {
//     name: "Stage & Central Events",
//     leads: [m("Shourya Shresth", "shouryashresth007@gmail.com", "https://www.linkedin.com/in/shourya-shresth-327a01328?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Shivanshu Gupta", "shivanshu12gupta@gmail.com", "https://www.linkedin.com/in/shivanshu-gupta-46b66333b?utm_source=share_via&utm_content=profile&utm_medium=member_ios")],
//     events: [
//       { name: "Circuit of Minds", leads: [m("Princy Kumari", "swatibhagat1306@gmail.com", "https://www.linkedin.com/in/princy-kumari-b020893a0?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Aman Raj", "drrajaman31@gmail.com", "https://www.linkedin.com/in/raj-aman-3a032742a?utm_source=share_via&utm_content=profile&utm_medium=member_android")] },
//       { name: "Unscripted Nations", leads: [m("Zoha Ashraf Azad", "zohaashrafazad11@gmail.com ", "https://www.linkedin.com/in/zoha-ashraf-azad-b47971375?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Archie Mrinal", "archie22mrinal@gmail.com", "https://www.linkedin.com/in/archie-mrinal-b90007344?utm_source=share_via&utm_content=profile&utm_medium=member_ios")] },
//       { name: "ThoughtLab", leads: [m("Amanjeet Kumar", "sinhaamanjeet@gmail.com")] },
//     ],
//   },
//   {
//     name: "Workshops & Knowledge",
//     eventName: "Hack the Skill",
//     leads: [m("Unnati Singh", "unnati31march@gmail.com"), m("Shristi Sharma", "srishti0811sharma@gmail.com", "https://www.linkedin.com/in/srishti-sharma-b68ab7341?utm_source=share_via&utm_content=profile&utm_medium=member_android")],
//     events: [],
//   },
// ];

// export const webTeam: Person[] = [
//   m(
//     "Ritesh Raj",
//     "rriteshthakur21feb@gmail.com",
//     "https://www.linkedin.com/in/riteshthakur21022007"
//   ),
//   m(
//     "Utkarsh Gupta",
//     "utkarshgupta1821@gmail.com",
//     "https://www.linkedin.com/in/utkarsh-gupta-017a53375?utm_source=share_via&utm_content=profile&utm_medium=member_android"
//   ),
//   m(
//     "Aadarsh Sinha",
//     "adarshsinha.dev@gmail.com",
//     "www.linkedin.com/in/adarsh-sinha-6b05a3421"
//   ),
// ];


export interface Person {
  name: string;
  email?: string;
  linkedin?: string;
  /** Shown on the card instead of email / LinkedIn (used for the Patron and Convenor). */
  designation?: string;
  /**
   * Optional explicit photo path (e.g. "/committee/utkarsh.png").
   * If left out, the card looks for /public/committee/<name-as-slug>.(jpg|jpeg|png|webp)
   * e.g. "Utkarsh Gupta" -> /public/committee/utkarsh-gupta.jpg. No photo found = silhouette.
   */
  image?: string;
}

// Committee member helper. Add email / linkedin when you have them:
// m("Utkarsh Gupta", "utkarsh@gmail.com", "https://www.linkedin.com/in/utkarsh")
const m = (name: string, email?: string, linkedin?: string): Person => ({ name, email, linkedin });

// Patron & Convenor show their designation on the card (no email / LinkedIn).
// Replace the designation text below with their exact titles.
export const patron: Person = { name: "Fr. Dr. Martin Poras SJ", designation: "Vice-Chancellor" };
export const convenor: Person = { name: "Dr. Piyush Verma", designation: "Assistant Professor, Department of Computer Science" };

export const overallCoordinators: Person[] = [
  { name: "Vaishnavi Ambastha", email: "rajvaishnavi0415@gmail.com", linkedin:"https://www.linkedin.com/in/vaishnavi-raj15?utm_source=share_via&utm_content=profile&utm_medium=member_android" },
  { name: "Shlok Dadhich", email: "shlokdadhich7@gmail.com", linkedin:"http://www.linkedin.com/in/shlokdadhich07" },
];

export interface TrackData {
  name: string;
  /** Official event name for single-event tracks (no separate event coordinators). */
  eventName?: string;
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
    eventName: "Innocraft",
    leads: [m("Utkarsh Gupta", "utkarshgupta1821@gmail.com", "https://www.linkedin.com/in/utkarsh-gupta-017a53375?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Rajnish Kumar", "rajnishkumarschool911@gmail.com", "https://www.linkedin.com/in/rajnish-kumar-25ab53346?utm_source=share_via&utm_content=profile&utm_medium=member_android")],
    events: [],
  },
  {
    name: "Coding & Development",
    leads: [m("Priyanshu John Thakur", "johnthakur0674@gmail.com", "https://in.linkedin.com/in/priyanshu-john-thakur")],
    events: [
      { name: "Debug Derby", leads: [m("Priyanshu Kumar", "Priyanshuk092005@gmail.com", "https://www.linkedin.com/in/priyanshu-kumar-b67085428?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Akshat Raj", "akshatr854@gmail.com", "https://www.linkedin.com/in/akshat-raj-822a0a238?utm_source=share_via&utm_content=profile&utm_medium=member_android")] },
      { name: "WebWeave", leads: [m("Divyanka Keshri", "divyankakeshri8@gmail.com", "https://www.linkedin.com/in/divyanka-keshri-1aba88275?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Ashu Kumar", "aashurajvermaa@gmail.com", "https://www.linkedin.com/in/aashurajvermaa?utm_source=share_via&utm_content=profile&utm_medium=member_android")] },
      { name: "VLookUp", leads: [m("Komal Anand", "komalanandd01@gmail.com", "https://www.linkedin.com/in/komal-anand-943a80327?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Aditya Raj", "adityarajatharva246@gmail.com", "https://www.linkedin.com/in/aditya-raj-59512043b?utm_source=share_via&utm_content=profile&utm_medium=member_ios")] },
      { name: "Battle of Bots", leads: [m("Krishna", "krsna6366@gmail.com", "http://www.linkedin.com/in/krishna-kumar-515395430")] },
      { name: "Runtime Rush", leads: [m("Aadya Ayushi", "aadyaayushi836@gmail.com", "https://www.linkedin.com/in/aadya-ayushi-461171441?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Kunal", "k8847139@gmail.com", "https://www.linkedin.com/in/kunal-138653387?utm_source=share_via&utm_content=profile&utm_medium=member_android")] },
    ],
  },
  {
    name: "Gaming & Adventure",
    leads: [m("Bittu Raj", "bitturaj12a12@gmail.com", "https://www.linkedin.com/in/bittu-raj-8524b142a?utm_source=share_via&utm_content=profile&utm_medium=member_android")],
    events: [
      { name: "BattleGround Blitz", leads: [m("Umang Sahni", "sahniumang2008@gmail.com", "https://www.linkedin.com/in/umang-sahni-9b1017441?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Joshua Singh", "joshua0717singh@gmail.com", "https://www.linkedin.com/in/joshua-singh-21011043b?utm_source=share_via&utm_content=profile&utm_medium=member_android")] },
      { name: "Cipher Chase", leads: [m("Shristi Singh", "Shristisingh9985@gmail.com", "https://www.linkedin.com/in/shristi-singh-2ab518379?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Sunny Kumar", "Sunnykumar221973@gmail.com", "https://www.linkedin.com/in/sunny-kumar-166841414/?lipi=urn%3Ali%3Apage%3Ad_flagship3_feed%3B1amfyvN8SYymw4zka%2FGyDw%3D%3D")] },
      { name: "VelocityX", leads: [m("Jai Vardhan", "jaivardhan27062007@gmail.com"), m("Suraj Kaushik", "surajkaushik2007@gmail.com", "https://www.linkedin.com/in/suraj-kaushik-74b118324?utm_source=share_via&utm_content=profile&utm_medium=member_android")] },
    ],
  },
  {
    name: "Stage & Central Events",
    leads: [m("Shourya Shresth", "shouryashresth007@gmail.com", "https://www.linkedin.com/in/shourya-shresth-327a01328?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Shivanshu Gupta", "shivanshu12gupta@gmail.com", "https://www.linkedin.com/in/shivanshu-gupta-46b66333b?utm_source=share_via&utm_content=profile&utm_medium=member_ios")],
    events: [
      { name: "Circuit of Minds", leads: [m("Princy Kumari", "swatibhagat1306@gmail.com", "https://www.linkedin.com/in/princy-kumari-b020893a0?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Aman Raj", "drrajaman31@gmail.com", "https://www.linkedin.com/in/raj-aman-3a032742a?utm_source=share_via&utm_content=profile&utm_medium=member_android")] },
      { name: "Unscripted Nations", leads: [m("Zoha Ashraf Azad", "zohaashrafazad11@gmail.com ", "https://www.linkedin.com/in/zoha-ashraf-azad-b47971375?utm_source=share_via&utm_content=profile&utm_medium=member_android"), m("Archie Mrinal", "archie22mrinal@gmail.com", "https://www.linkedin.com/in/archie-mrinal-b90007344?utm_source=share_via&utm_content=profile&utm_medium=member_ios")] },
      { name: "ThoughtLab", leads: [m("Amanjeet Kumar", "sinhaamanjeet@gmail.com")] },
    ],
  },
  {
    name: "Workshops & Knowledge",
    eventName: "Hack the Skill",
    leads: [m("Unnati Singh", "unnati31march@gmail.com"), m("Shristi Sharma", "srishti0811sharma@gmail.com", "https://www.linkedin.com/in/srishti-sharma-b68ab7341?utm_source=share_via&utm_content=profile&utm_medium=member_android")],
    events: [],
  },
];

export const webTeam: Person[] = [
  m(
    "Ritesh Raj",
    "rriteshthakur21feb@gmail.com",
    "https://www.linkedin.com/in/riteshthakur21022007"
  ),
  m(
    "Utkarsh Gupta",
    "utkarshgupta1821@gmail.com",
    "https://www.linkedin.com/in/utkarsh-gupta-017a53375?utm_source=share_via&utm_content=profile&utm_medium=member_android"
  ),
  m(
    "Aadarsh Sinha",
    "adarshsinha.dev@gmail.com",
    "www.linkedin.com/in/adarsh-sinha-6b05a3421"
  ),
];
