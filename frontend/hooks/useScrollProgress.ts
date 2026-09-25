import { useEffect, type MutableRefObject } from "react";

/**
 * Shared scroll state for the 3D backdrop and the HUD.
 *
 * One module-level object, one set of listeners (reference counted), so the
 * scene, the HUD rail and anything else read exactly the same numbers. It is
 * a plain mutable object on purpose: the WebGL loop reads it every frame and
 * writing to it never triggers a React re-render.
 *
 * `stage` is a continuous section index: 0 = hero, 1 = about, 2 = tracks,
 * 3 = events, 4 = schedule, 5 = footer. 2.5 means "halfway through tracks".
 */
export const STAGE_IDS = ["top", "about", "tracks", "events", "schedule", "contact"] as const;
export const STAGE_LABELS = ["HOME", "ABOUT", "TRACKS", "EVENTS", "SCHEDULE", "CONTACT"] as const;

export interface ScrollState {
  /** window.scrollY in px */
  y: number;
  /** whole-page progress 0..1, raw */
  targetProgress: number;
  /** whole-page progress 0..1, eased (written by the scene loop) */
  progress: number;
  /** scroll speed 0..1, eased (written by the scene loop) */
  velocity: number;
  /** continuous section index, raw (see above) */
  stage: number;
  /** discrete active section (mid-screen rule) */
  section: number;
  /** eased stage (written by the scene loop) */
  stageSmooth: number;
  /** impulse 1 -> 0 that fires whenever you cross into another section */
  kick: number;
  /** 0 = hero fully on screen, 1 = hero scrolled away */
  hero: number;
  about: number;
  tracks: number;
  events: number;
  schedule: number;
}

export type ScrollRef = MutableRefObject<ScrollState>;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const state: ScrollState = {
  y: 0,
  targetProgress: 0,
  progress: 0,
  velocity: 0,
  stage: 0,
  section: 0,
  stageSmooth: 0,
  kick: 0,
  hero: 0,
  about: 0,
  tracks: 0,
  events: 0,
  schedule: 0,
};
// a stable ref-shaped handle onto the singleton
const handle: ScrollRef = { current: state };

function traverse(id: string, vh: number) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  return clamp01((vh - r.top) / (vh + r.height));
}

function measure() {
  const vh = window.innerHeight;
  const y = window.scrollY;
  const doc = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  const heroEl = document.getElementById("top");
  const heroH = Math.max(1, heroEl ? heroEl.offsetHeight : vh);

  state.y = y;
  state.targetProgress = clamp01(y / Math.max(1, doc - vh));
  state.hero = clamp01(y / heroH);
  state.about = traverse("about", vh);
  state.tracks = traverse("tracks", vh);
  state.events = traverse("events", vh);
  state.schedule = traverse("schedule", vh);

  // Section anchors in document coordinates, clamped so the last one is
  // reachable even though the footer is shorter than the viewport.
  const maxScroll = Math.max(0, doc - vh);
  const tops: number[] = [];
  const anchors: number[] = [];
  for (const id of STAGE_IDS) {
    const el = document.getElementById(id);
    const top = el ? el.getBoundingClientRect().top + y : Infinity;
    tops.push(top);
    anchors.push(Math.min(maxScroll, top));
  }

  // continuous stage (camera): 0 at the top, i when section i's top reaches the
  // top of the viewport, blended linearly in between
  let stage = STAGE_IDS.length - 1;
  for (let i = 0; i < anchors.length - 1; i++) {
    if (y < anchors[i + 1] || i === anchors.length - 2) {
      const span = Math.max(1, anchors[i + 1] - anchors[i]);
      stage = i + clamp01((y - anchors[i]) / span);
      break;
    }
  }
  state.stage = stage;

  // discrete section (HUD label, kick): the last one whose top passed mid-screen
  let section = 0;
  for (let i = 0; i < tops.length; i++) {
    if (tops[i] <= y + vh * 0.5) section = i;
  }
  if (maxScroll > 0 && y >= maxScroll - 2) section = STAGE_IDS.length - 1;
  state.section = section;
}

let users = 0;
let raf = 0;
let teardown: (() => void) | null = null;

function attach() {
  const schedule = () => {
    if (!raf) {
      raf = requestAnimationFrame(() => {
        raf = 0;
        measure();
      });
    }
  };
  measure();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("load", schedule);
  const settle = window.setTimeout(schedule, 700);
  teardown = () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("load", schedule);
    window.clearTimeout(settle);
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };
}

export function useScrollProgress(): ScrollRef {
  useEffect(() => {
    if (users++ === 0) attach();
    return () => {
      if (--users === 0) {
        teardown?.();
        teardown = null;
      }
    };
  }, []);
  return handle;
}
