"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  PALETTE,
  clamp01,
  isPhone,
  makeSpriteTexture,
  smoothstep,
  type SceneProps,
} from "./shared";

// The camera flies ~26 units down -z over the page, so the field is deep.
const X = 70;
const Y = 42;
const Z_NEAR = 24;
const Z_FAR = -190;

const TINTS = [
  new THREE.Color(PALETTE.starWhite),
  new THREE.Color(PALETTE.circuit),
  new THREE.Color(PALETTE.marigold),
  new THREE.Color(PALETTE.signal),
];

function pickTint(r: number) {
  if (r < 0.7) return TINTS[0];
  if (r < 0.83) return TINTS[1];
  if (r < 0.94) return TINTS[2];
  return TINTS[3];
}

function buildStars(count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2 * X;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2 * Y;
    positions[i * 3 + 2] = Z_FAR + Math.random() * (Z_NEAR - Z_FAR);
    const c = pickTint(Math.random());
    const b = 0.55 + Math.random() * 0.45;
    colors[i * 3] = c.r * b;
    colors[i * 3 + 1] = c.g * b;
    colors[i * 3 + 2] = c.b * b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

/** Hyperspace streaks: static x/y, z-length is driven by scroll speed. */
function buildStreaks(count: number) {
  const positions = new Float32Array(count * 6);
  const colors = new Float32Array(count * 6);
  const baseZ = new Float32Array(count);
  const lenScale = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    // a hollow tube around the flight path, so the centre stays calm
    const r = 3.5 + Math.random() * 30;
    const a = Math.random() * Math.PI * 2;
    const x = Math.cos(a) * r * 1.5;
    const y = Math.sin(a) * r * 0.9;
    baseZ[i] = Z_FAR + Math.random() * (Z_NEAR - Z_FAR);
    lenScale[i] = 8 + Math.random() * 26;
    positions[i * 6] = x;
    positions[i * 6 + 1] = y;
    positions[i * 6 + 3] = x;
    positions[i * 6 + 4] = y;
    const c = pickTint(Math.random());
    // far end dim, near end bright: additive blending fades the tail out
    colors[i * 6] = c.r * 0.08;
    colors[i * 6 + 1] = c.g * 0.08;
    colors[i * 6 + 2] = c.b * 0.08;
    colors[i * 6 + 3] = c.r;
    colors[i * 6 + 4] = c.g;
    colors[i * 6 + 5] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return { geo, baseZ, lenScale, positions };
}

export default function Starfield({ scrollRef }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const farRef = useRef<THREE.Points>(null!);
  const nearRef = useRef<THREE.Points>(null!);
  const streakRef = useRef<THREE.LineSegments>(null!);

  const phone = useMemo(() => isPhone(), []);
  const sprite = useMemo(() => makeSpriteTexture(), []);
  const farGeo = useMemo(() => buildStars(phone ? 800 : 1700), [phone]);
  const nearGeo = useMemo(() => buildStars(phone ? 90 : 220), [phone]);
  const streaks = useMemo(() => buildStreaks(phone ? 110 : 240), [phone]);

  useEffect(
    () => () => {
      sprite.dispose();
      farGeo.dispose();
      nearGeo.dispose();
      streaks.geo.dispose();
    },
    [sprite, farGeo, nearGeo, streaks]
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const s = scrollRef.current;

    // the whole field slowly rolls, and rolls further as you scroll
    groupRef.current.rotation.z = t * 0.004 + s.progress * 0.35;

    // gentle twinkle: two layers breathing out of phase
    (farRef.current.material as THREE.PointsMaterial).opacity =
      0.72 + 0.28 * Math.sin(t * 1.7);
    (nearRef.current.material as THREE.PointsMaterial).opacity =
      0.75 + 0.25 * Math.sin(t * 2.3 + 1.3);

    // warp streaks only exist while you are actually scrolling
    const warp = smoothstep(0.03, 0.6, s.velocity);
    const lines = streakRef.current;
    lines.visible = warp > 0.01;
    if (lines.visible) {
      const { positions, baseZ, lenScale, geo } = streaks;
      for (let i = 0; i < baseZ.length; i++) {
        const half = warp * lenScale[i] * 0.5;
        positions[i * 6 + 2] = baseZ[i] - half;
        positions[i * 6 + 5] = baseZ[i] + half;
      }
      geo.attributes.position.needsUpdate = true;
      (lines.material as THREE.LineBasicMaterial).opacity = clamp01(warp * 1.3);
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={farRef} geometry={farGeo} frustumCulled={false}>
        <pointsMaterial
          map={sprite}
          size={0.34}
          sizeAttenuation
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points ref={nearRef} geometry={nearGeo} frustumCulled={false}>
        <pointsMaterial
          map={sprite}
          size={0.75}
          sizeAttenuation
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments ref={streakRef} geometry={streaks.geo} frustumCulled={false} visible={false}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
