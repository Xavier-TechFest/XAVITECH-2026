import Eyebrow from "@/components/ui/Eyebrow";
import { sponsorTiers, type Sponsor, type SponsorTier } from "@/components/sections/sponsors-data";

const GRID: Record<SponsorTier["size"], string> = {
  lg: "grid-cols-1 max-w-md",
  md: "grid-cols-1 sm:grid-cols-3 max-w-4xl",
  sm: "grid-cols-2 md:grid-cols-4 max-w-5xl",
};
const HEIGHT: Record<SponsorTier["size"], string> = {
  lg: "h-36 sm:h-44",
  md: "h-28 sm:h-32",
  sm: "h-24",
};

function Card({ sponsor, size }: { sponsor: Sponsor; size: SponsorTier["size"] }) {
  const base = `flex ${HEIGHT[size]} items-center justify-center rounded-xl`;

  if (!sponsor.logo) {
    return (
      <div className={`${base} border border-dashed border-line px-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted`}>
        {sponsor.name}
        <br />
        Your brand here
      </div>
    );
  }

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sponsor.logo}
      alt={sponsor.name}
      loading="lazy"
      decoding="async"
      className="max-h-full max-w-full object-contain"
    />
  );

  return (
    <div className={`${base} bg-white/95 p-5`}>
      {sponsor.url ? (
        <a href={sponsor.url} target="_blank" rel="noopener noreferrer" className="flex h-full w-full items-center justify-center">
          {img}
        </a>
      ) : (
        img
      )}
    </div>
  );
}

export default function Sponsors() {
  return (
    <section
      id="sponsors"
      className="relative overflow-hidden border-t border-line/50 bg-[#05070a]/70 py-16 sm:py-24"
    >
      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <Eyebrow n="05" className="mb-4 sm:mb-5">
          Sponsors
        </Eyebrow>
        <h2 className="max-w-2xl font-display text-2xl font-bold uppercase leading-tight tracking-[-0.02em] text-ink sm:text-4xl">
          Backed by the people who make it possible.
        </h2>

        <div className="mt-10 space-y-10 sm:mt-14 sm:space-y-12">
          {sponsorTiers.map((tier) => (
            <div key={tier.label}>
              <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-[0.24em] text-marigold">
                {tier.label}
              </p>
              <div className={`mx-auto grid gap-4 ${GRID[tier.size]}`}>
                {tier.sponsors.map((s) => (
                  <Card key={s.name} sponsor={s} size={tier.size} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center sm:mt-14">
          <a
            href="mailto:xavitech@xup.ac.in?subject=Sponsoring%20XAVITECH%202026"
            className="inline-flex min-h-11 items-center rounded-full border border-circuit/50 px-6 text-sm font-semibold text-circuit transition-colors hover:bg-circuit/10"
          >
            Become a sponsor →
          </a>
        </div>
      </div>
    </section>
  );
}
