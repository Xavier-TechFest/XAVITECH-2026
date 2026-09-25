import * as THREE from "three";
import type { MouseRef } from "@/hooks/useMouse";
import type { ScrollRef } from "@/hooks/useScrollProgress";

/** Every 3D piece reads the same two refs and never causes a React re-render. */
export interface SceneProps {
  mouseRef: MouseRef;
  scrollRef: ScrollRef;
}

/** Same neon palette as tailwind.config.ts, so 3D and CSS read as one system. */
export const PALETTE = {
  circuit: "#35E0C9",
  marigold: "#F2A63C",
  signal: "#E23F7E",
  ink: "#ECE8DE",
  starWhite: "#DCE6FF",
} as const;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Frame-rate independent easing factor (replaces the fixed 0.04 lerps). */
export const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

/** Soft round sprite so points render as glowing dots instead of squares. */
export function makeSpriteTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.75)");
    g.addColorStop(0.6, "rgba(255,255,255,0.18)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const isPhone = () =>
  typeof window !== "undefined" && window.innerWidth < 768;

export { PULSE_EVENT, type PulseDetail } from "@/lib/pulse";
