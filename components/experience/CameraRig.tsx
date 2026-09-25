"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { damp, smoothstep, type SceneProps } from "./shared";

const BASE_FOV = 55;
const START_Z = 8;
export const STAGE_DEPTH = 6.2; // world units flown per section

/**
 * One camera "shot" per section. The rig blends between them as you scroll,
 * so every section change feels like a different camera move:
 * hero: push in · about: truck left + bank · tracks: settle · events: truck
 * right + bank · schedule: crane up · footer: pull down.
 */
const SHOTS = [
  { x: 0, y: 0, roll: 0, yaw: 0, fov: 0 }, // hero
  { x: -1.6, y: 0.7, roll: 0.06, yaw: -0.05, fov: 3 }, // about
  { x: 0, y: 0.1, roll: 0, yaw: 0, fov: -2 }, // tracks
  { x: 1.7, y: -0.6, roll: -0.07, yaw: 0.06, fov: 5 }, // events
  { x: 0, y: 1.1, roll: 0.03, yaw: 0, fov: 0 }, // schedule
  { x: 0, y: -0.5, roll: 0, yaw: 0, fov: -3 }, // footer
] as const;

function shotAt(stage: number) {
  const i = Math.min(SHOTS.length - 2, Math.max(0, Math.floor(stage)));
  const t = smoothstep(0, 1, stage - i);
  const a = SHOTS[i];
  const b = SHOTS[i + 1];
  const l = (k: keyof typeof a) => a[k] + (b[k] - a[k]) * t;
  return { x: l("x"), y: l("y"), roll: l("roll"), yaw: l("yaw"), fov: l("fov") };
}

/**
 * Scroll-driven camera (grown from the first project's CameraRig): scrolling
 * dollies through the star field, each section has its own shot, crossing into
 * a new section fires a short "kick" (surge + FOV punch), fast scrolling
 * widens the FOV, and the pointer adds parallax.
 */
export default function CameraRig({ mouseRef, scrollRef }: SceneProps) {
  const look = useMemo(() => new THREE.Vector3(), []);
  const lastY = useRef(0);
  const lastSection = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const camera = state.camera as THREE.PerspectiveCamera;
    const s = scrollRef.current;
    const m = mouseRef.current;
    const t = state.clock.elapsedTime;

    s.progress += (s.targetProgress - s.progress) * damp(4, dt);
    s.stageSmooth += (s.stage - s.stageSmooth) * damp(3.2, dt);
    m.x += (m.targetX - m.x) * damp(3.5, dt);
    m.y += (m.targetY - m.y) * damp(3.5, dt);

    const pxPerSec = Math.abs(s.y - lastY.current) / Math.max(dt, 0.001);
    lastY.current = s.y;
    s.velocity += (Math.min(pxPerSec / 5500, 1) - s.velocity) * damp(6, dt);

    // crossing into a new section -> impulse
    const section = s.section;
    if (section !== lastSection.current) {
      lastSection.current = section;
      s.kick = 1;
    }
    s.kick *= Math.exp(-2.6 * dt);

    const shot = shotAt(s.stageSmooth);
    const z = START_Z - s.stageSmooth * STAGE_DEPTH - s.kick * 1.6;

    camera.position.set(
      shot.x + m.x * 0.7 + Math.sin(t * 0.25) * 0.12,
      shot.y + m.y * 0.4 - s.progress * 1.4 + Math.cos(t * 0.2) * 0.08,
      z
    );

    look.set(m.x * 2.2 + shot.yaw * 60, m.y * 1.1 - s.progress * 0.8, z - 30);
    camera.lookAt(look);
    camera.rotateZ(shot.roll + Math.sin(s.progress * Math.PI * 2) * 0.03);

    const fov = BASE_FOV + shot.fov + s.velocity * 16 + s.kick * 9;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
