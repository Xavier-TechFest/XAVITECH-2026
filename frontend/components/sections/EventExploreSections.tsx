import { EventExploreSection } from "@/lib/eventsData";

export default function EventExploreSections({ sections }: { sections: EventExploreSection[] }) {
  if (!sections.length) return null;

  return (
    <section className="mt-8" aria-label="Detailed event information">
      <h2 className="mb-3 font-space text-xl font-bold text-white">Participant guide</h2>
      <p className="mb-4 text-sm leading-relaxed text-slate-400">Select a section for event details, requirements, and rules.</p>
      <div className="space-y-2">
        {sections.map((section, index) => (
          <details key={section.title} open={index === 0} className="group border border-white/10 bg-white/[.03]">
            <summary className="cursor-pointer list-none px-4 py-3 font-oxanium text-sm font-bold text-cyan-200 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">
              <span className="mr-3 inline-block text-cyan-400 transition-transform group-open:rotate-90">›</span>
              {section.title}
            </summary>
            <ul className="space-y-2 border-t border-white/10 px-4 py-4">
              {section.items.map((item) => (
                <li key={item} className="border-l border-cyan-400/60 pl-3 text-sm leading-relaxed text-slate-300">{item}</li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
