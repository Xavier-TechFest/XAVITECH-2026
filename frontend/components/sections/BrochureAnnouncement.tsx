"use client";

import { ExternalLink } from "lucide-react";

const BROCHURE_URL = "/xavitech-2026-brochure.pdf";

export default function BrochureAnnouncement() {
  return (
    <aside className="relative" aria-label="Brochure announcement">
      <div className="relative flex h-9 items-center overflow-hidden bg-marigold/95 text-slate-950">
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="brochure-marquee-track flex w-max items-center whitespace-nowrap font-oxanium text-[11px] font-medium uppercase tracking-[0.12em] sm:text-xs">
            {Array.from({ length: 8 }, (_, index) => (
              <BrochureTickerMessage key={index} ariaHidden={index > 0} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function BrochureTickerMessage({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <span aria-hidden={ariaHidden || undefined} className="flex shrink-0 items-center gap-2 px-2 sm:gap-3 sm:px-3">
      <span>XAVITECH 2026</span>
      <span aria-hidden="true">•</span>
      <span>31 October 2026</span>
      <span aria-hidden="true">•</span>
      <a
        href={BROCHURE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View the XAVITECH 2026 brochure"
        tabIndex={ariaHidden ? -1 : undefined}
        className="inline-flex items-center gap-1.5 underline decoration-slate-950/40 underline-offset-2 transition hover:decoration-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900"
      >
        <span>Click here to view brochure</span>
        <ExternalLink size={13} aria-hidden="true" />
      </a>
      <span aria-hidden="true">|</span>
    </span>
  );
}
