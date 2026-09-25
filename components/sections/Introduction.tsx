"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion } from "framer-motion";
import DataStreams from "@/components/effects/DataStreams";
import Eyebrow from "@/components/ui/Eyebrow";

const DOMAINS = ["AI // ML // ROBOTICS", "WEB // CLOUD // SECURITY", "DATA // IOT // EMBEDDED"];

export default function Introduction() {
  const [glitch, setGlitch] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  // Interactive scanner on the image frame: a reticle follows the pointer with a
  // live coordinate readout; clicking / tapping pings it and cycles the domain.
  const frameRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const lineHRef = useRef<HTMLDivElement>(null);
  const lineVRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const [domain, setDomain] = useState(0);
  const [pings, setPings] = useState<{ id: number; x: number; y: number }[]>([]);
  const pingId = useRef(0);

  const scan = (e: ReactPointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (!frame) return;
    const r = frame.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (reticleRef.current) {
      reticleRef.current.style.opacity = "1";
      reticleRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
    if (lineHRef.current) {
      lineHRef.current.style.opacity = "1";
      lineHRef.current.style.transform = `translateY(${y}px)`;
    }
    if (lineVRef.current) {
      lineVRef.current.style.opacity = "1";
      lineVRef.current.style.transform = `translateX(${x}px)`;
    }
    if (readoutRef.current) {
      readoutRef.current.textContent = `X ${(x / r.width).toFixed(2)} · Y ${(y / r.height).toFixed(2)} · LOCK`;
    }
  };
  const scanEnd = () => {
    for (const ref of [reticleRef, lineHRef, lineVRef]) {
      if (ref.current) ref.current.style.opacity = "0";
    }
    if (readoutRef.current) readoutRef.current.textContent = "STANDBY";
  };
  const ping = (e: ReactPointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (!frame) return;
    const r = frame.getBoundingClientRect();
    const id = ++pingId.current;
    setPings((p) => [...p.slice(-3), { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setDomain((d) => (d + 1) % DOMAINS.length);
    window.setTimeout(() => setPings((p) => p.filter((q) => q.id !== id)), 800);
  };

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // touch screens scroll constantly; blinking the copy on every swipe is
    // annoying, so the scroll-triggered glitch is mouse/trackpad only
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    if (reduced) {
      setTextVisible(true);
      return;
    }

    let lastScrollY = window.scrollY;
    let timeout: ReturnType<typeof setTimeout>;
    let lastTrigger = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const difference = Math.abs(currentScrollY - lastScrollY);

      if (difference < 8) return;

      const now = Date.now();

      if (now - lastTrigger > 900) {
        lastTrigger = now;

        setGlitch(true);
        setTextVisible(false);

        clearTimeout(timeout);

        timeout = setTimeout(() => {
          setGlitch(false);
          setTextVisible(true);
        }, 180);
      }

      lastScrollY = currentScrollY;
    };

    if (!coarse) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    const initialTimer = setTimeout(() => {
      setGlitch(true);

      setTimeout(() => {
        setGlitch(false);
        setTextVisible(true);
      }, 180);
    }, 300);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
      clearTimeout(initialTimer);
    };
  }, []);

  return (
    <section
      id="about"
      className="relative overflow-hidden border-y border-line/50 bg-[#05070a]/70 py-16 sm:py-24 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(53,224,201,0.28) 1px, transparent 1px),
              linear-gradient(90deg, rgba(53,224,201,0.28) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        <div className="absolute -left-32 top-1/4 h-[300px] w-[300px] rounded-full bg-cyan-400/10 blur-[80px] sm:-left-40 sm:h-[500px] sm:w-[500px] sm:blur-[130px]" />

        <div className="absolute -right-32 top-0 h-[320px] w-[320px] rounded-full bg-marigold/10 blur-[80px] sm:-right-40 sm:h-[550px] sm:w-[550px] sm:blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.5) 4px)",
          }}
        />

        <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

        <DataStreams variant="section" count={12} />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div
              ref={frameRef}
              onPointerMove={scan}
              onPointerLeave={scanEnd}
              onPointerDown={ping}
              className="relative aspect-[4/3] cursor-crosshair select-none overflow-hidden rounded-2xl border border-cyan-400/25 bg-black/60 shadow-[0_0_60px_rgba(53,224,201,0.08)]"
              style={{ touchAction: "pan-y" }}
            >
              <img
                src="/tech-image.jpg"
                alt="Technology and innovation"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover opacity-70 grayscale-[15%]"
              />

              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-marigold/20" />

              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(53,224,201,0.3) 5px)",
                }}
              />

              <motion.div
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "linear",
                }}
                className="absolute left-0 top-[35%] h-px w-full bg-cyan-300/60"
              />

              <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-cyan-400" />
              <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-cyan-400" />
              <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-marigold" />
              <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-marigold" />

              {/* interactive scanner */}
              <div
                ref={lineHRef}
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 h-px w-full bg-cyan-300/40 opacity-0 transition-opacity duration-200"
              />
              <div
                ref={lineVRef}
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 h-full w-px bg-cyan-300/40 opacity-0 transition-opacity duration-200"
              />
              <div
                ref={reticleRef}
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 opacity-0 transition-opacity duration-200"
              >
                <div className="-ml-6 -mt-6 h-12 w-12 rounded-full border border-cyan-300/80 shadow-[0_0_16px_rgba(53,224,201,0.5)]">
                  <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200" />
                </div>
              </div>
              {pings.map((p) => (
                <span
                  key={p.id}
                  aria-hidden="true"
                  className="pointer-events-none absolute h-12 w-12 animate-ping rounded-full border border-cyan-300"
                  style={{ left: p.x - 24, top: p.y - 24 }}
                />
              ))}

              <div className="absolute bottom-5 left-5 font-mono text-[10px] tracking-[0.25em] text-cyan-300">
                {DOMAINS[domain]}
              </div>
              <div className="absolute bottom-5 right-5 hidden font-mono text-[9px] tracking-[0.2em] text-cyan-300/60 sm:block">
                <span ref={readoutRef}>STANDBY</span>
              </div>

              <div className="absolute right-5 top-5 font-mono text-[10px] tracking-[0.2em] text-cyan-300">
                01 // TECH
              </div>
            </div>

            <div className="absolute -right-3 top-10 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(53,224,201,0.9)]" />

            <div className="absolute -bottom-3 left-16 h-2 w-2 rounded-full bg-marigold shadow-[0_0_14px_rgba(242,166,60,0.9)]" />

            <div className="absolute -left-2 top-1/2 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(53,224,201,0.9)]" />
          </motion.div>

          <div className="max-w-prose">
            <Eyebrow n="01" className="mb-4 sm:mb-5">
              About · XAVITECH 2026
            </Eyebrow>

            <div className={glitch ? "cyber-glitch relative" : "relative"}>
              {glitch && (
                <>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 translate-x-[3px] font-display text-[1.35rem] font-medium leading-snug sm:text-3xl lg:text-4xl text-cyan-300/70"
                  >
                    Five tracks, dozens of events, one campus, one day.
                  </span>

                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -translate-x-[3px] font-display text-[1.35rem] font-medium leading-snug sm:text-3xl lg:text-4xl text-marigold/60"
                  >
                    Five tracks, dozens of events, one campus, one day.
                  </span>
                </>
              )}

              <motion.p
                initial={false}
                animate={{
                  opacity: textVisible ? 1 : 0,
                  x: textVisible ? 0 : 5,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="font-display text-[1.35rem] font-medium leading-snug sm:text-3xl lg:text-4xl text-ink"
              >
                Five tracks, dozens of events, one campus, one day. Teams
                build through the morning, judging runs through the afternoon,
                and results go up before the evening is out.
              </motion.p>
            </div>

            <motion.p
              initial={false}
              animate={{
                opacity: textVisible ? 1 : 0,
                y: textVisible ? 0 : 8,
              }}
              transition={{
                duration: 0.35,
                delay: 0.08,
              }}
              className="mt-5 text-base leading-relaxed text-muted sm:mt-6"
            >
              Register ahead of time to lock in your events.
            </motion.p>

            <motion.div
              initial={false}
              animate={{
                opacity: textVisible ? 1 : 0,
              }}
              transition={{
                duration: 0.4,
                delay: 0.15,
              }}
              className="mt-7 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted sm:mt-8 sm:tracking-[0.2em]"
            >
              <span className="h-px w-10 shrink-0 bg-cyan-400/60 sm:w-12" />
              <span>Technology · Creativity · Competition</span>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cyber-glitch {
          animation: glitch-shake 0.18s steps(2, end);
        }

        @keyframes glitch-shake {
          0% {
            transform: translate(0);
            clip-path: inset(0 0 0 0);
          }

          20% {
            transform: translate(-3px, 1px);
            clip-path: inset(10% 0 65% 0);
          }

          40% {
            transform: translate(3px, -1px);
            clip-path: inset(55% 0 20% 0);
          }

          60% {
            transform: translate(-2px, 0);
            clip-path: inset(30% 0 45% 0);
          }

          80% {
            transform: translate(2px, 1px);
            clip-path: inset(70% 0 5% 0);
          }

          100% {
            transform: translate(0);
            clip-path: inset(0 0 0 0);
          }
        }
      `}</style>
    </section>
  );
}