import { EventExploreSection } from "@/lib/eventsData";

export default function EventExploreSections({ sections }: { sections: EventExploreSection[] }) {
  if (!sections.length) return null;

  return (
    <section className="mt-8" aria-label="Detailed event information">
      <h2 className="mb-3 font-space text-xl font-bold text-white">Participant guide</h2>
      <p className="mb-4 text-sm leading-relaxed text-slate-400">Select a section for event details, requirements, and rules.</p>
      <div className="space-y-2">
        {sections.map((section, index) => (
          <details key={section.title} open={index === 0 || section.layout === "rounds"} className="group border border-white/10 bg-white/[.03]">
            <summary className="cursor-pointer list-none px-4 py-3 font-oxanium text-sm font-bold text-cyan-200 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">
              <span className="mr-3 inline-block text-cyan-400 transition-transform group-open:rotate-90">›</span>
              {section.title}
            </summary>
            {section.layout === "rounds" ? (
              <ol className="space-y-0 border-t border-white/10 px-4 py-3 sm:py-4">
                {section.items.map((item, roundIndex) => (
                  <li
                    key={item}
                    className="grid grid-cols-[5rem_1rem_minmax(0,1fr)] items-center gap-3 py-3 sm:grid-cols-[5.5rem_1rem_minmax(0,1fr)] sm:gap-4 sm:py-3.5"
                  >
                    <span
                      className={`text-right font-mono text-[10px] font-semibold uppercase tracking-wider sm:text-xs ${
                        roundIndex === section.items.length - 1
                          ? "text-amber-300"
                          : "text-slate-400"
                      }`}
                    >
                      {roundIndex === section.items.length - 1 ? "Final" : `Round ${String(roundIndex + 1).padStart(2, "0")}`}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`mx-auto h-2.5 w-2.5 rounded-full bg-amber-400 ${roundIndex === section.items.length - 1 ? "shadow-[0_0_12px_rgba(251,191,36,0.65)]" : ""}`}
                    />
                    <span className={`min-w-0 text-sm leading-relaxed sm:text-base ${roundIndex === section.items.length - 1 ? "text-amber-300" : "text-slate-200"}`}>
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <ul className="space-y-2 border-t border-white/10 px-4 py-4">
                {section.items.map((item) => (
                  <li key={item} className="border-l border-cyan-400/60 pl-3 text-sm leading-relaxed text-slate-300">{item}</li>
                ))}
              </ul>
            )}
          </details>
        ))}
      </div>
    </section>
  );
}
