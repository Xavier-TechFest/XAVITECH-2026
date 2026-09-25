"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { animate, motion, useMotionValue } from "framer-motion";

export type DogMode = "idle" | "hover" | "selected";

export interface CursorPoint {
  /** px from the left edge of the dog stage */
  x: number;
  /** px from the bottom edge of the dog stage (negative = above it) */
  y: number;
  /** performance.now() of the last pointer move */
  t: number;
}

interface CyberDogProps {
  stageWidth: number;
  /** horizontal CENTRE (px) of the card the dog should go to */
  targetX: number | null;
  mode: DogMode;
  /** live cursor position, written by the parent (a ref, so no re-renders) */
  cursorRef?: MutableRefObject<CursorPoint | null>;
}

export const DOG_WIDTH = 96;
const DOG_HEIGHT = 59;
const HALF = DOG_WIDTH / 2;
const EDGE = 8; // keep the dog this far from the stage edges

// behaviour
const FOLLOW_GAP = 64; // how close the dog stops beside the cursor
const CURSOR_IDLE_MS = 6000; // cursor still for this long -> dog goes back to wandering
const WANDER_MIN = 2200;
const WANDER_MAX = 4200;

// body / gait geometry (SVG units)
const HIP_Y = 58;
const GROUND = 99.5;
const THIGH = 25;
const SHIN = 30;
const STRIDE = 12; // half stride length
const LIFT = 8; // foot lift during swing
const DUTY = 0.56; // fraction of the cycle a foot is on the ground
const CYCLE_PX = (2 * STRIDE) / DUTY; // px travelled per gait cycle (no foot slip)
const PIVOT_X = 105; // visual centre of the dog in viewBox space

const LEGS = [
  // far side first (drawn behind the body)
  { id: "ff", hipX: 104, phase: 0.5, neutral: 2, far: true },
  { id: "fr", hipX: 64, phase: 0.0, neutral: -2, far: true },
  // near side (drawn in front)
  { id: "nr", hipX: 58, phase: 0.5, neutral: -2, far: false },
  { id: "nf", hipX: 112, phase: 0.0, neutral: 2, far: false },
] as const;

type Leg = (typeof LEGS)[number];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const easeInOut = (u: number) => u * u * (3 - 2 * u);

/** Foot position along a trot cycle. p in [0,1): stance first, then swing. */
function footPos(p: number, nx: number) {
  const q = p - Math.floor(p);
  if (q < DUTY) {
    const u = q / DUTY;
    return { x: nx + STRIDE * (1 - 2 * u), y: GROUND };
  }
  const u = (q - DUTY) / (1 - DUTY);
  return {
    x: nx + STRIDE * (-1 + 2 * easeInOut(u)),
    y: GROUND - LIFT * Math.sin(Math.PI * u),
  };
}

/** Two-bone IK. Knee bends backwards (like the real robot). */
function solveKnee(hx: number, hy: number, fx: number, fy: number) {
  const dx = fx - hx;
  const dy = fy - hy;
  const d = clamp(Math.hypot(dx, dy), Math.abs(THIGH - SHIN) + 0.5, THIGH + SHIN - 0.5);
  const base = Math.atan2(dy, dx);
  const A = Math.acos((THIGH * THIGH + d * d - SHIN * SHIN) / (2 * THIGH * d));
  const a = base + A;
  return { kx: hx + THIGH * Math.cos(a), ky: hy + THIGH * Math.sin(a) };
}

export default function CyberDog({ stageWidth, targetX, mode, cursorRef }: CyberDogProps) {
  const x = useMotionValue(EDGE);
  const y = useMotionValue(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const parts = useRef<Record<string, SVGElement | null>>({});
  const reg = (key: string) => (el: SVGElement | null) => {
    parts.current[key] = el;
  };

  // latest props, read by the animation loop without re-subscribing
  const live = useRef({ stageWidth, targetX, mode, cursorRef });
  live.current = { stageWidth, targetX, mode, cursorRef };

  const perched = mode === "selected";

  // hop up onto a selected card / drop back down
  useEffect(() => {
    if (perched) {
      animate(y, [0, -112, -82], {
        duration: 0.62,
        times: [0, 0.55, 1],
        ease: ["easeOut", "easeIn"],
      });
    } else {
      animate(y, 0, { type: "spring", stiffness: 170, damping: 14 });
    }
  }, [perched, y]);

  // main loop: movement, gait, head tracking, LEDs
  useEffect(() => {
    const p = parts.current;
    const set = (key: string, attrs: Record<string, string | number>) => {
      const el = p[key];
      if (!el) return;
      for (const name in attrs) el.setAttribute(name, String(attrs[name]));
    };

    const s = {
      pos: 60, // centre x of the dog
      vel: 0,
      face: 1,
      flip: 1,
      phase: 0,
      head: 0,
      crouch: 0,
      time: 0,
      last: performance.now(),
      wanderX: 60,
      nextWander: performance.now() + 700,
    };

    let raf = 0;

    const tick = (now: number) => {
      const dt = clamp((now - s.last) / 1000, 0.001, 0.05);
      s.last = now;
      s.time += dt;

      const { stageWidth: sw, targetX: tx, mode: m, cursorRef: cRef } = live.current;
      const isPerched = m === "selected";
      const alert = m !== "idle";

      const minC = HALF + EDGE;
      const maxC = Math.max(minC, sw - HALF - EDGE);
      const clampC = (v: number) => clamp(v, minC, maxC);

      const cur = cRef?.current ?? null;
      const look = cur && now - cur.t < CURSOR_IDLE_MS ? cur : null;

      // ---- decide where to go -------------------------------------------
      let desired = s.pos;
      let maxSpeed = 240;

      if (m === "idle") {
        if (look) {
          const dxc = look.x - s.pos;
          if (Math.abs(dxc) > FOLLOW_GAP) {
            desired = clampC(look.x - Math.sign(dxc) * FOLLOW_GAP);
          }
          maxSpeed = 320;
        } else {
          if (now >= s.nextWander) {
            s.wanderX = minC + Math.random() * (maxC - minC);
            s.nextWander = now + WANDER_MIN + Math.random() * (WANDER_MAX - WANDER_MIN);
          }
          desired = clampC(s.wanderX);
          maxSpeed = 95;
        }
      } else if (tx !== null) {
        desired = clampC(tx);
        maxSpeed = 380;
      }

      // ---- move ----------------------------------------------------------
      const dist = desired - s.pos;
      const tv =
        Math.abs(dist) < 3 ? 0 : Math.sign(dist) * clamp(Math.abs(dist) * 3.2, 30, maxSpeed);
      s.vel += (tv - s.vel) * Math.min(1, dt * 7);
      s.pos += s.vel * dt;
      if (sw > 0) s.pos = clampC(s.pos);
      const speed = Math.abs(s.vel);

      // ---- facing --------------------------------------------------------
      if (speed > 14) s.face = s.vel > 0 ? 1 : -1;
      else if (look && Math.abs(look.x - s.pos) > 10) s.face = look.x > s.pos ? 1 : -1;
      s.flip += (s.face - s.flip) * Math.min(1, dt * 16);
      const flipScale = Math.abs(s.flip) < 0.03 ? 0.03 * (s.face || 1) : s.flip;

      // ---- gait ----------------------------------------------------------
      const blend = Math.min(1, speed / 28) * (isPerched ? 0.25 : 1);
      s.phase += (dt * speed) / CYCLE_PX;
      s.crouch += ((isPerched ? 5 : 0) - s.crouch) * Math.min(1, dt * 10);

      const bounce = Math.sin(s.phase * Math.PI * 4) * 1.3 * blend;
      const breath = Math.sin(s.time * 2.2) * 0.5 * (1 - blend);
      const bodyDy = bounce + breath + s.crouch;
      const lean = 1.6 * Math.min(1, speed / 200);

      for (const leg of LEGS as readonly Leg[]) {
        const hx = leg.hipX;
        const hy = HIP_Y + bodyDy;
        const nx = hx + leg.neutral;
        const fp = footPos(s.phase + leg.phase, nx);
        const fx = nx + (fp.x - nx) * blend;
        let fy = GROUND - (GROUND - fp.y) * blend;
        if (isPerched) fy -= 3;
        const { kx, ky } = solveKnee(hx, hy, fx, fy);

        set(`${leg.id}-thigh`, { x1: hx, y1: hy, x2: kx, y2: ky });
        set(`${leg.id}-shin`, { x1: kx, y1: ky, x2: fx, y2: fy - 1 });
        set(`${leg.id}-knee`, { cx: kx, cy: ky });
        set(`${leg.id}-foot`, { cx: fx, cy: fy - 1.5 });
        if (!leg.far) {
          set(`${leg.id}-hip`, { cx: hx, cy: hy });
          set(`${leg.id}-hipled`, { cx: hx, cy: hy });
          set(`${leg.id}-kneeled`, { cx: kx, cy: ky });
        }
      }

      set("body", {
        transform: `translate(0 ${bodyDy.toFixed(2)}) rotate(${lean.toFixed(2)} ${PIVOT_X} 48)`,
      });
      set("flip", {
        transform: `translate(${PIVOT_X} 0) scale(${flipScale.toFixed(3)} 1) translate(${-PIVOT_X} 0)`,
      });
      set("shadow", { opacity: isPerched ? 0 : 0.22 });

      // ---- head tracks the cursor ---------------------------------------
      let headTarget = Math.sin(s.time * 1.1) * 2;
      if (look) {
        const headX = s.pos + 40 * s.face;
        const ahead = (look.x - headX) * s.face;
        const dy = look.y + 42 - y.get(); // cursor relative to the dog's head
        const ang = Math.atan2(dy, Math.max(70, Math.abs(ahead)));
        headTarget = clamp((ang * 180) / Math.PI, -30, 20);
      }
      headTarget += Math.sin(s.phase * Math.PI * 4) * 1.6 * blend;
      s.head += (headTarget - s.head) * Math.min(1, dt * 9);
      set("head", { transform: `rotate(${s.head.toFixed(2)} 127 44)` });

      // ---- lights --------------------------------------------------------
      const ledFill = alert ? "#E23F7E" : "#35E0C9";
      const wave = alert ? 9 : 4;
      for (let i = 0; i < 4; i++) {
        set(`led-${i}`, {
          fill: ledFill,
          opacity: (0.3 + 0.7 * Math.max(0, Math.sin(s.time * wave - i * 0.8))).toFixed(2),
        });
      }
      const blink = s.time % 4.7 < 0.14 ? 0.15 : 1;
      set("eye", {
        opacity: (0.78 + 0.22 * Math.sin(s.time * (alert ? 10 : 3))).toFixed(2),
        transform: `translate(153 40) scale(1 ${blink}) translate(-153 -40)`,
      });
      set("antenna", { opacity: (0.55 + 0.45 * Math.sin(s.time * 4)).toFixed(2) });
      set("strip", { opacity: (0.6 + 0.3 * Math.sin(s.time * 2.5)).toFixed(2) });

      x.set(s.pos - HALF);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf) return;
      s.last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // Only simulate while the stage is on screen: no point burning battery on
    // a phone while the dog is scrolled out of view.
    const stage = wrapRef.current?.parentElement;
    let observer: IntersectionObserver | undefined;
    if (stage && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? start() : stop()),
        { rootMargin: "120px" }
      );
      observer.observe(stage);
    } else {
      start();
    }

    return () => {
      observer?.disconnect();
      stop();
    };
  }, [x, y]);

  return (
    <motion.div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-0"
      style={{ x, y, willChange: "transform" }}
    >
      <svg
        width={DOG_WIDTH}
        height={DOG_HEIGHT}
        viewBox="20 0 170 105"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="cdBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F4F6F8" />
            <stop offset="55%" stopColor="#CDD3D9" />
            <stop offset="100%" stopColor="#9AA2AB" />
          </linearGradient>
          <filter id="cdGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g ref={reg("flip")}>
          <ellipse ref={reg("shadow")} cx="105" cy="101" rx="42" ry="3" fill="#000" opacity="0.22" />

          {/* far legs (dimmer, suggest depth) */}
          {LEGS.filter((l) => l.far).map((leg) => (
            <g key={leg.id} opacity="0.55">
              <line ref={reg(`${leg.id}-thigh`)} stroke="#4A525B" strokeWidth="5" strokeLinecap="round" />
              <line ref={reg(`${leg.id}-shin`)} stroke="#3A4148" strokeWidth="3.6" strokeLinecap="round" />
              <circle ref={reg(`${leg.id}-knee`)} r="3" fill="#8B929A" stroke="#5B636C" strokeWidth="1" />
              <circle ref={reg(`${leg.id}-foot`)} r="2.6" fill="#12151A" />
            </g>
          ))}

          {/* body + head (bobs and leans as one unit) */}
          <g ref={reg("body")}>
            {/* rear light */}
            <rect x="44.5" y="40" width="3.5" height="10" rx="1.7" fill="#E23F7E" opacity="0.85" />

            {/* torso shell */}
            <path
              d="M46 42 C46 35 51 32 58 32 L114 32 C123 32 128 36 128 43 L128 55 C128 61 124 64 117 64 L56 64 C49 64 46 60 46 54 Z"
              fill="url(#cdBody)"
              stroke="#7A828B"
              strokeWidth="1.2"
            />
            {/* dark chassis underside */}
            <rect x="50" y="58" width="74" height="7" rx="3.5" fill="#2A2F36" />
            {/* spine rail with status LEDs */}
            <rect x="56" y="29.5" width="58" height="4.4" rx="2.2" fill="#2A2F36" />
            {[0, 1, 2, 3].map((i) => (
              <circle
                key={i}
                ref={reg(`led-${i}`)}
                cx={64 + i * 14}
                cy={31.7}
                r="1.5"
                fill="#35E0C9"
              />
            ))}
            {/* panel seams + vents */}
            <line x1="63" y1="34" x2="63" y2="57" stroke="#8B929A" strokeWidth="1" opacity="0.6" />
            <line x1="112" y1="34" x2="112" y2="57" stroke="#8B929A" strokeWidth="1" opacity="0.6" />
            <g stroke="#8B929A" strokeWidth="1.4" strokeLinecap="round" opacity="0.7">
              <line x1="76" y1="40" x2="98" y2="40" />
              <line x1="76" y1="44" x2="98" y2="44" />
              <line x1="76" y1="48" x2="98" y2="48" />
            </g>
            {/* side light strip */}
            <rect
              ref={reg("strip")}
              x="74"
              y="53"
              width="28"
              height="2"
              rx="1"
              fill="#35E0C9"
              filter="url(#cdGlow)"
            />

            {/* neck */}
            <path d="M120 38 L133 34 L135 51 L122 57 Z" fill="#2A2F36" />

            {/* head module (tilts toward the cursor) */}
            <g ref={reg("head")}>
              {/* top sensor dome */}
              <path d="M134 29 Q139 21 145 29 Z" fill="#2A2F36" stroke="#5B636C" strokeWidth="0.8" />
              {/* head shell */}
              <path
                d="M128 34 Q128 28 135 28 L153 28 Q160 28 162 34 L164 44 Q164 52 156 52 L135 52 Q128 52 128 46 Z"
                fill="url(#cdBody)"
                stroke="#7A828B"
                strokeWidth="1.2"
              />
              {/* visor */}
              <path
                d="M143 32 H156 Q161 32 161 37 V45 Q161 49 156 49 H143 Z"
                fill="#12151A"
              />
              {/* camera / eye */}
              <circle cx="153" cy="40" r="4.6" fill="#0B0E12" stroke="#2A2F36" strokeWidth="0.8" />
              <g ref={reg("eye")}>
                <circle cx="153" cy="40" r="2.5" fill="#35E0C9" filter="url(#cdGlow)" />
                <circle cx="152.2" cy="39.2" r="0.7" fill="#FFFFFF" opacity="0.9" />
              </g>
              <circle cx="147.5" cy="43.5" r="1.2" fill="#35E0C9" opacity="0.6" />
              <rect x="147" y="46" width="11" height="1.3" rx="0.65" fill="#35E0C9" opacity="0.7" />
              {/* antenna */}
              <line x1="151" y1="28" x2="153" y2="19" stroke="#8B929A" strokeWidth="1.8" strokeLinecap="round" />
              <circle
                ref={reg("antenna")}
                cx="153"
                cy="18.5"
                r="2.5"
                fill="#E23F7E"
                filter="url(#cdGlow)"
              />
            </g>
          </g>

          {/* near legs */}
          {LEGS.filter((l) => !l.far).map((leg) => (
            <g key={leg.id}>
              <line ref={reg(`${leg.id}-thigh`)} stroke="#2E343C" strokeWidth="7" strokeLinecap="round" />
              <line ref={reg(`${leg.id}-shin`)} stroke="#1B1F25" strokeWidth="4.6" strokeLinecap="round" />
              <circle ref={reg(`${leg.id}-knee`)} r="4.2" fill="#C7CDD4" stroke="#5B636C" strokeWidth="1" />
              <circle ref={reg(`${leg.id}-kneeled`)} r="1.5" fill="#35E0C9" filter="url(#cdGlow)" />
              <circle ref={reg(`${leg.id}-foot`)} r="3.4" fill="#12151A" />
              {/* hip motor */}
              <circle ref={reg(`${leg.id}-hip`)} r="6.2" fill="#D6DBE0" stroke="#5B636C" strokeWidth="1.1" />
              <circle ref={reg(`${leg.id}-hipled`)} r="1.9" fill="#35E0C9" filter="url(#cdGlow)" />
            </g>
          ))}
        </g>
      </svg>
    </motion.div>
  );
}