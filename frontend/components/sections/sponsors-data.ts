/**
 * Sponsors shown above the footer. Edit only this file.
 *
 * To add a real sponsor: put the logo in /public/sponsors/ (WebP/PNG/SVG, ideally
 * under 30 KB, roughly landscape) and set `logo: "/sponsors/name.webp"`.
 * `url` is optional (makes the logo clickable). Entries without a `logo` render as
 * an "Your brand here" placeholder card. Add/remove entries or whole tiers freely.
 */
export interface Sponsor {
  name: string;
  logo?: string;
  url?: string;
}

export interface SponsorTier {
  label: string;
  /** card size: lg = one big card, md = 3 across, sm = 4 across */
  size: "lg" | "md" | "sm";
  sponsors: Sponsor[];
}

export const sponsorTiers: SponsorTier[] = [
  { label: "Title Sponsor", size: "lg", sponsors: [{ name: "Title Sponsor" }] },
  {
    label: "Associate Sponsors",
    size: "md",
    sponsors: [{ name: "Associate Sponsor 1" }, { name: "Associate Sponsor 2" }, { name: "Associate Sponsor 3" }],
  },
  {
    label: "Partners",
    size: "sm",
    sponsors: [{ name: "Partner 1" }, { name: "Partner 2" }, { name: "Partner 3" }, { name: "Partner 4" }],
  },
];
