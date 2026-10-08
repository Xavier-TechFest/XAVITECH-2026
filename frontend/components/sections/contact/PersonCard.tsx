"use client";

import { useState } from "react";
import type { Person } from "./data";

/**
 * Committee card: a framed portrait (name + role plate on top, photo in the
 * middle) with a separate contact plate underneath.
 *
 * PHOTOS — drop a picture into /public/committee/ named after the person:
 *   "Utkarsh Gupta"  ->  /public/committee/utkarsh-gupta.jpg
 * (.jpg, .jpeg, .png or .webp all work; a transparent PNG cut-out looks best.)
 * Or set `image` on the person in data.ts. No photo = a neutral silhouette.
 */

type Accent = "circuit" | "marigold" | "signal";

const ACCENT: Record<Accent, { bg: string; text: string; stroke: string; glow: string }> = {
  circuit: {
    bg: "bg-circuit",
    text: "text-circuit",
    stroke: "#35E0C9",
    glow: "from-circuit/25",
  },
  marigold: {
    bg: "bg-marigold",
    text: "text-marigold",
    stroke: "#F2A63C",
    glow: "from-marigold/25",
  },
  signal: {
    bg: "bg-signal",
    text: "text-signal",
    stroke: "#E23F7E",
    glow: "from-signal/25",
  },
};

// notched-corner shield, like a collectible card
const FRAME =
  "polygon(0 3%, 9% 3%, 13% 0, 87% 0, 91% 3%, 100% 3%, 100% 96%, 95% 100%, 5% 100%, 0 96%)";
// elongated hexagon for the contact plate
const PLATE = "polygon(6% 0, 94% 0, 100% 50%, 94% 100%, 6% 100%, 0 50%)";

const EXTENSIONS = ["webp", "png", "jpg", "jpeg"]; // webp first: the normalised portraits are .webp

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Silhouette({ stroke }: { stroke: string }) {
  return (
    <svg
      viewBox="0 0 120 150"
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 mx-auto h-[88%] w-auto opacity-40"
    >
      <circle cx="60" cy="48" r="22" fill={stroke} fillOpacity="0.35" />
      <path d="M12 150c0-30 21-50 48-50s48 20 48 50z" fill={stroke} fillOpacity="0.25" />
    </svg>
  );
}

function Pyramid({ stroke }: { stroke: string }) {
  return (
    <svg
      viewBox="0 0 100 50"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-auto w-[46%]"
    >
      <g fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" opacity="0.9">
        <path d="M2 50 50 3l48 47" />
        <path d="M16 50 50 18l34 32" opacity="0.75" />
        <path d="M30 50 50 33l20 17" opacity="0.55" />
      </g>
    </svg>
  );
}

export default function PersonCard({
  person,
  role,
  accent = "circuit",
  compact = false,
  showContact = false,
}: {
  person: Person;
  role?: string;
  accent?: Accent;
  compact?: boolean;
  /** Always show the contact plate, with "coming soon" lines for anything missing. */
  showContact?: boolean;
}) {
  const a = ACCENT[accent];
  const isPlaceholder = person.name.trim().startsWith("[");
  const slug = slugify(person.name);

  // photo source candidates: explicit image first, else /committee/<slug>.<ext>
  const candidates = person.image
    ? [person.image]
    : isPlaceholder
      ? []
      : EXTENSIONS.map((ext) => `/committee/${slug}.${ext}`);
  const [attempt, setAttempt] = useState(0);
  const src = candidates[attempt];

  const email = person.email?.replace(/[[\]]/g, "").trim();
  const hasEmailLive = !!person.email && !person.email.trim().startsWith("[");
  const linkedin = person.linkedin?.trim();
  const showPlate = showContact || !!person.email || !!linkedin;

  return (
    <div className={`person-card reveal-up group mx-auto flex flex-col items-center ${compact ? "w-[calc(50%-0.4rem)] max-w-[16rem] sm:w-56" : "w-full max-w-[17rem]"}`}>
      {/* portrait frame: outer layer is the border colour, inner layer the card */}
      <div
        style={{ clipPath: FRAME }}
        className={`${a.bg} w-full p-[2px] transition-[filter] duration-300 group-hover:brightness-110`}
      >
        <div style={{ clipPath: FRAME }} className="relative flex flex-col bg-[#080b12]">
          {/* name + role plate */}
          <div className="relative px-3 pb-2.5 pt-4 text-center sm:pt-5">
            <p
              className={`font-display font-semibold leading-tight text-ink [overflow-wrap:anywhere] ${
                compact ? "text-[0.95rem] sm:text-base" : "text-lg sm:text-xl"
              }`}
            >
              {person.name}
            </p>
            {role && (
              <p
                className={`mx-auto mt-1.5 w-fit rounded-full border border-current/30 bg-white/[0.03] px-2.5 py-0.5 font-mono text-[9px] uppercase leading-snug tracking-[0.16em] sm:text-[10px] ${a.text}`}
              >
                {role}
              </p>
            )}
            <span aria-hidden="true" className={`mx-auto mt-2 block h-px w-2/3 ${a.bg} opacity-40`} />
          </div>

          {/* photo: accent spotlight + fine grid behind the transparent cut-out */}
          <div
            className="relative aspect-[4/5] w-full overflow-hidden bg-[#0a1424]"
            style={{
              backgroundImage: `radial-gradient(ellipse 70% 55% at 50% 34%, ${a.stroke}55 0%, ${a.stroke}18 45%, transparent 75%), linear-gradient(180deg, #101826 0%, #0a1020 100%)`,
            }}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage: `linear-gradient(${a.stroke}66 1px, transparent 1px), linear-gradient(90deg, ${a.stroke}66 1px, transparent 1px)`,
                backgroundSize: "22px 22px",
                maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, #000 20%, transparent 80%)",
                WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, #000 20%, transparent 80%)",
              }}
            />
            {src ? (
              <img
                key={src}
                src={src}
                alt={person.name}
                width={640}
                height={800}
                loading="lazy"
                decoding="async"
                onError={() => setAttempt((n) => n + 1)}
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            ) : (
              <Silhouette stroke={a.stroke} />
            )}
            <Pyramid stroke={a.stroke} />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#080b12]/80 to-transparent"
            />
          </div>
        </div>
      </div>

      {/* contact plate */}
      {showPlate && (
        <div
          style={{ clipPath: PLATE }}
          className={`${a.bg} -mt-2 w-[92%] p-[1.5px] opacity-95`}
        >
          <div
            style={{ clipPath: PLATE }}
            className="flex flex-col items-center gap-0.5 bg-[#0a1020] px-6 py-2.5 text-center font-mono text-[10px] leading-snug sm:text-[11px]"
          >
            {email ? (
              hasEmailLive ? (
                <a
                  href={`mailto:${email}`}
                  className="max-w-full break-all text-ink transition-colors hover:text-circuit"
                >
                  {email}
                </a>
              ) : (
                <span className="max-w-full break-all text-muted">{email}</span>
              )
            ) : (
              <span className="text-muted/70">Email · coming soon</span>
            )}
            {linkedin ? (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink transition-colors hover:text-circuit"
              >
                LinkedIn ↗
              </a>
            ) : (
              <span className="text-muted/70">LinkedIn · coming soon</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
