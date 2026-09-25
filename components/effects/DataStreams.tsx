"use client";

import { useEffect, useMemo, useRef } from "react";

interface DataStreamsProps {
  /**
   * "edge"    – fixed to the viewport, hugging the left / right margins (hero)
   * "section" – absolute inside a section, spread across its width
   */
  variant: "edge" | "section";
  /** number of lanes (desktop); phones show a third of them */
  count?: number;
}

/**
 * The binary rain, reworked so it reads as telemetry rather than wallpaper:
 * a few sparse, slow streams instead of a wall of digits. Each stream is a
 * short column that fades in toward a bright leading digit, like a packet
 * travelling down a cable. The animation is one CSS transform per stream
 * (see globals.css); the only JS is one passive scroll listener for the
 * fixed variant, which fades the layer out as the hero leaves.
 */
export default function DataStreams({ variant, count = 10 }: DataStreamsProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const lanes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        let left: number;
        if (variant === "edge") {
          // alternate left / right margin, stepping inward
          const side = i % 2;
          const slot = Math.floor(i / 2);
          const inset = 1.5 + slot * 2.7 + ((i * 7) % 5) * 0.25;
          left = side === 0 ? inset : 100 - inset;
        } else {
          left = ((i + 0.5) / count) * 100;
        }
        const length = 11 + ((i * 5) % 6); // 11..16 digits
        return {
          left,
          duration: 20 + ((i * 7) % 11) * 1.6, // 20..36 s: slow
          delay: -((i * 6.3) % 30),
          size: 11 + (i % 3),
          digits: Array.from({ length }, (_, n) =>
            (i * 7 + n * 13 + i * n) % 3 === 0 ? "1" : "0"
          ),
        };
      }),
    [variant, count]
  );

  useEffect(() => {
    if (variant !== "edge") return;
    const root = rootRef.current;
    if (!root) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const hero = document.getElementById("top");
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const visible = Math.min(1, Math.max(0, rect.bottom / window.innerHeight));
      root.style.setProperty("--stream-fade", String(visible));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [variant]);

  return (
    <div
      ref={rootRef}
      className={variant === "edge" ? "data-streams data-streams-edge" : "data-streams data-streams-section"}
      aria-hidden="true"
    >
      {lanes.map((lane, i) => (
        <div
          key={i}
          className="data-stream"
          style={{
            left: `${lane.left}%`,
            fontSize: lane.size,
            animationDuration: `${lane.duration}s`,
            animationDelay: `${lane.delay}s`,
          }}
        >
          {lane.digits.map((d, n) => {
            const head = n === lane.digits.length - 1;
            const t = n / lane.digits.length;
            return (
              <span
                key={n}
                className={head ? "data-stream-head" : undefined}
                style={head ? undefined : { opacity: 0.05 + t * t * 0.55 }}
              >
                {d}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
