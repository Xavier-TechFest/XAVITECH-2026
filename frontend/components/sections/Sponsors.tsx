import Eyebrow from "@/components/ui/Eyebrow";
import { sponsorTiers, type Sponsor, type SponsorTier } from "@/components/sections/sponsors-data";

const GRID: Record<SponsorTier["size"], string> = {
  lg: "grid-cols-1 max-w-md",
  md: "grid-cols-1 sm:grid-cols-3 max-w-4xl",
  sm: "grid-cols-2 md:grid-cols-4 max-w-5xl",
};
const HEIGHT: Record<SponsorTier["size"], string> = {
  lg: "h-40 sm:h-52",
  md: "h-32 sm:h-36",
  sm: "h-24 sm:h-28",
};

/* HUD-style corner brackets */
function Corners({ className = "" }: { className?: string }) {
  const c = `pointer-events-none absolute h-3 w-3 border-marigold transition-all duration-300 motion-reduce:transition-none ${className}`;
  return (
    <>
      <span className={`${c} left-1.5 top-1.5 border-l-2 border-t-2 group-hover:left-1 group-hover:top-1`} />
      <span className={`${c} right-1.5 top-1.5 border-r-2 border-t-2 group-hover:right-1 group-hover:top-1`} />
      <span className={`${c} bottom-1.5 left-1.5 border-b-2 border-l-2 group-hover:bottom-1 group-hover:left-1`} />
      <span className={`${c} bottom-1.5 right-1.5 border-b-2 border-r-2 group-hover:bottom-1 group-hover:right-1`} />
    </>
  );
}

function Card({ sponsor, size, index }: { sponsor: Sponsor; size: SponsorTier["size"]; index: number }) {
  const base = `${HEIGHT[size]} relative flex items-center justify-center rounded-xl`;
  const slot = String(index + 1).padStart(2, "0");

  /* Open slot */
  if (!sponsor.logo) {
    return (
      <div
        className={`${base} group border border-dashed border-circuit/30 bg-circuit/[0.03] px-4 text-center transition-colors duration-300 hover:border-marigold/70 hover:bg-marigold/[0.05]`}
      >
        <Corners className="opacity-40 group-hover:opacity-100" />
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.3em] text-circuit/70">SLOT_{slot}</span>
          <span className="font-display text-sm font-bold uppercase tracking-[0.12em] text-ink/80 sm:text-base">
            {sponsor.name}
          </span>
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-marigold">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-marigold" />
            Your brand here
          </span>
        </div>
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
      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none"
    />
  );

  const isTop = size === "lg";

  return (
    /* gradient-border wrapper */
    <div
      className={`group relative rounded-xl p-px transition-all duration-300 motion-reduce:transition-none ${
        isTop
          ? "bg-gradient-to-br from-marigold via-circuit to-marigold shadow-[0_0_40px_-8px_rgba(255,170,0,0.45)]"
          : "bg-line/70 hover:-translate-y-1 hover:bg-gradient-to-br hover:from-marigold hover:to-circuit hover:shadow-[0_8px_30px_-10px_rgba(0,229,255,0.45)]"
      }`}
    >
      <div className={`${base} h-full w-full overflow-hidden bg-white p-5`}>
        {/* scan line on hover */}
        <span className="pointer-events-none absolute inset-x-0 -top-1/2 h-1/2 bg-gradient-to-b from-transparent via-circuit/25 to-transparent opacity-0 transition-all duration-700 group-hover:top-full group-hover:opacity-100 motion-reduce:hidden" />
        <Corners />
        <span className="absolute bottom-2 left-3 font-mono text-[9px] tracking-[0.25em] text-black/30">
          {slot}
        </span>
        {sponsor.url ? (
          <a
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={sponsor.name}
            className="relative flex h-full w-full items-center justify-center"
          >
            {img}
          </a>
        ) : (
          img
        )}
      </div>
    </div>
  );
}

export default function Sponsors() {
  return (
    <section
      id="sponsors"
      className="relative overflow-hidden border-t border-line/50 bg-[#05070a]/80 py-20 sm:py-32"
    >
      {/* circuit grid background, faded at the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.07) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      {/* ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-circuit/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-marigold/10 blur-3xl" />

      {/* ghost outline word */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-6 hidden -translate-x-1/2 select-none whitespace-nowrap font-display text-[9rem] font-black uppercase leading-none tracking-tighter md:block lg:text-[12rem]"
        style={{ WebkitTextStroke: "1px rgba(255,255,255,0.06)", color: "transparent" }}
      >
        Sponsors
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <Eyebrow n="05" className="mb-4 sm:mb-5">
          Sponsors
        </Eyebrow>
        <h2 className="max-w-3xl font-display text-3xl font-black uppercase leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl lg:text-6xl">
          Backed by the people
          <br />
          <span className="bg-gradient-to-r from-marigold via-[#ffd36b] to-circuit bg-clip-text text-transparent">
            who make it possible.
          </span>
        </h2>
        <p className="mt-5 max-w-xl font-mono text-xs uppercase leading-relaxed tracking-[0.18em] text-muted sm:text-[13px]">
          // Powering 13 events · 5 tracks · 1 day of innovation
        </p>

        <div className="mt-14 space-y-14 sm:mt-20 sm:space-y-20">
          {sponsorTiers.map((tier, ti) => (
            <div key={tier.label}>
              {/* tier header: rule — label — rule */}
              <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-5">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-marigold/60" />
                <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-marigold sm:text-xs">
                  <span className="rounded border border-marigold/50 px-1.5 py-0.5 text-[9px] text-marigold/80">
                    T{ti + 1}
                  </span>
                  {tier.label}
                </p>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-marigold/60" />
              </div>

              <div className={`mx-auto grid gap-4 sm:gap-5 ${GRID[tier.size]}`}>
                {tier.sponsors.map((s, i) => (
                  <Card key={s.name} sponsor={s} size={tier.size} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA panel */}
        <div className="relative mx-auto mt-20 max-w-3xl overflow-hidden rounded-2xl border border-circuit/30 bg-gradient-to-br from-circuit/[0.07] via-transparent to-marigold/[0.07] px-6 py-10 text-center sm:mt-28 sm:py-12">
          <span className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-marigold" />
          <span className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-circuit" />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-circuit sm:text-[11px]">
            &gt; open_for_partnerships
          </p>
          <h3 className="mt-3 font-display text-xl font-bold uppercase leading-tight tracking-[-0.01em] text-ink sm:text-3xl">
            Put your brand in front of the next generation of builders.
          </h3>
          <a
            href="mailto:xavitech@xup.ac.in?subject=Sponsoring%20XAVITECH%202026"
            className="group mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-marigold px-8 text-sm font-bold uppercase tracking-[0.12em] text-[#05070a] transition-all duration-300 hover:gap-4 hover:shadow-[0_0_30px_-4px_rgba(255,170,0,0.7)] motion-reduce:transition-none"
          >
            Become a sponsor
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}