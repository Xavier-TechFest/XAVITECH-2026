import type { Person } from "./data";

export default function PersonCard({
  person,
  role,
  accent = "circuit",
  compact = false,
}: {
  person: Person;
  role?: string;
  accent?: "circuit" | "marigold" | "signal";
  compact?: boolean;
}) {
  const bar =
    accent === "marigold"
      ? "bg-marigold"
      : accent === "signal"
        ? "bg-signal"
        : "bg-circuit";

  const ring =
    accent === "marigold"
      ? "group-hover:border-marigold/50"
      : accent === "signal"
        ? "group-hover:border-signal/50"
        : "group-hover:border-circuit/50";

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-line/70 bg-surface/60 transition-colors duration-300 ${ring} ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-[2px] ${bar} opacity-70`}
      />

      {person.image ? (
        <div
          className={`mb-4 overflow-hidden rounded-lg border border-line/50 bg-black/20 ${
            compact ? "h-28" : "h-48"
          }`}
        >
          <img
            src={person.image}
            alt={person.name}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        // No photo yet: a small initial badge, not a big empty image box —
        // 39 of those would make this page enormous.
        <span
          aria-hidden="true"
          className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface font-display text-sm font-semibold text-muted"
        >
          {person.name.replace(/[[\]]/g, "").trim().charAt(0) || "?"}
        </span>
      )}

      {role && (
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {role}
        </p>
      )}

      <p
        className={`font-display font-semibold text-ink ${
          compact ? "text-sm" : "text-base sm:text-lg"
        }`}
      >
        {person.name}
      </p>

      {(person.email || person.linkedin) && (
        <div className="mt-2.5 space-y-1 font-mono text-[11px] text-muted sm:text-xs">
          {person.email && (
            <a
              href={`mailto:${person.email.replace(/[\[\]]/g, "")}`}
              className="block break-all transition-colors hover:text-circuit"
            >
              {person.email}
            </a>
          )}
          {person.linkedin && (
            <a
              href={person.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-colors hover:text-circuit"
            >
              LinkedIn ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}