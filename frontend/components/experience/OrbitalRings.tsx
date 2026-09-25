"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  PALETTE,
  PULSE_EVENT,
  clamp01,
  makeSpriteTexture,
  smoothstep,
  type PulseDetail,
  type SceneProps,
} from "./shared";

// what the ring gate flashes when a track / event is picked
const PULSE_COLORS = [PALETTE.circuit, PALETTE.marigold, PALETTE.signal, PALETTE.starWhite, PALETTE.circuit];

const DISTANCE = 17; // how far ahead of the camera the gate floats
const RING_POINTS = 90;

/**
 * The first project's GateRing / CosmicRing, re-skinned: three counter-rotating
 * rings around a wireframe core with a ring of orbiting sparks. It assembles
 * as the Tracks section arrives and dims again toward the Schedule / footer.
 * It rides with the camera, so it looks the same on a short or long page.
 */
export default function OrbitalRings({ scrollRef, mouseRef }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const r1 = useRef<THREE.Mesh>(null!);
  const r2 = useRef<THREE.Mesh>(null!);
  const r3 = useRef<THREE.Mesh>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const sparksRef = useRef<THREE.Points>(null!);

  const pulse = useRef(0);
  const pulseColor = useMemo(() => new THREE.Color(PALETTE.circuit), []);
  const baseColor = useMemo(() => new THREE.Color(PALETTE.circuit), []);

  // interactive link: Tracks / Events dispatch this window event when picked
  useEffect(() => {
    const onPulse = (e: Event) => {
      const { index } = (e as CustomEvent<PulseDetail>).detail ?? { index: 0 };
      pulseColor.set(PULSE_COLORS[((index % 5) + 5) % 5]);
      pulse.current = 1;
    };
    window.addEventListener(PULSE_EVENT, onPulse);
    return () => window.removeEventListener(PULSE_EVENT, onPulse);
  }, [pulseColor]);

  const sprite = useMemo(() => makeSpriteTexture(), []);
  const sparks = useMemo(() => {
    const positions = new Float32Array(RING_POINTS * 3);
    const angles = new Float32Array(RING_POINTS);
    const radii = new Float32Array(RING_POINTS);
    for (let i = 0; i < RING_POINTS; i++) {
      angles[i] = (i / RING_POINTS) * Math.PI * 2;
      radii[i] = 3.1 + (i % 3) * 1.05;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geo, positions, angles, radii };
  }, []);

  useEffect(
    () => () => {
      sprite.dispose();
      sparks.geo.dispose();
    },
    [sprite, sparks]
  );

  useFrame(({ clock, camera, size }, delta) => {
    const t = clock.elapsedTime;
    const s = scrollRef.current;
    const m = mouseRef.current;
    const aspect = size.width / size.height;

    const vis =
      smoothstep(0.0, 0.4, s.tracks) *
      (1 - 0.85 * smoothstep(0.25, 0.95, s.schedule));
    const g = groupRef.current;
    g.visible = vis > 0.01;
    if (!g.visible) return;

    pulse.current *= Math.exp(-3.2 * Math.min(delta, 0.05));
    const p = pulse.current;
    const scale =
      THREE.MathUtils.clamp(aspect / 1.2, 0.55, 1) * (0.55 + 0.45 * vis) * (1 + p * 0.14);
    g.position.set(camera.position.x * 0.5, camera.position.y * 0.5, camera.position.z - DISTANCE);
    g.scale.setScalar(scale);
    g.rotation.y += (m.x * 0.35 - g.rotation.y) * 0.05;
    g.rotation.x += (-m.y * 0.22 - g.rotation.x) * 0.05;

    r1.current.rotation.z = t * 0.12 + s.progress * 2.4 + p * 1.2;
    (r1.current.material as THREE.MeshBasicMaterial).color.copy(baseColor).lerp(pulseColor, p);
    (sparksRef.current.material as THREE.PointsMaterial).color.copy(baseColor).lerp(pulseColor, p);
    r2.current.rotation.z = -t * 0.2;
    r2.current.rotation.x = Math.PI / 2.6 + Math.sin(t * 0.35) * 0.3;
    r3.current.rotation.y = t * 0.32;
    r3.current.rotation.x = Math.PI / 2.4;
    coreRef.current.rotation.y = t * 0.6;
    coreRef.current.rotation.z = t * 0.25;
    coreRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.06);

    (r1.current.material as THREE.MeshBasicMaterial).opacity = Math.min(1, (0.7 + p * 0.3) * vis);
    (r2.current.material as THREE.MeshBasicMaterial).opacity = 0.55 * vis;
    (r3.current.material as THREE.MeshBasicMaterial).opacity = 0.6 * vis;
    (coreRef.current.material as THREE.MeshBasicMaterial).opacity = 0.75 * vis;
    (sparksRef.current.material as THREE.PointsMaterial).opacity = 0.85 * clamp01(vis);

    // orbiting sparks
    const { positions, angles, radii, geo } = sparks;
    for (let i = 0; i < RING_POINTS; i++) {
      const a = angles[i] + t * 0.3;
      positions[i * 3] = Math.cos(a) * radii[i];
      positions[i * 3 + 1] = Math.sin(a) * radii[i];
      positions[i * 3 + 2] = Math.sin(a * 2 + i) * 0.25;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh ref={r1}>
        <torusGeometry args={[5.2, 0.032, 10, 128]} />
        <meshBasicMaterial color={PALETTE.circuit} transparent opacity={0} />
      </mesh>
      <mesh ref={r2}>
        <torusGeometry args={[4.15, 0.022, 8, 112]} />
        <meshBasicMaterial color={PALETTE.marigold} transparent opacity={0} />
      </mesh>
      <mesh ref={r3}>
        <torusGeometry args={[3.0, 0.02, 8, 96]} />
        <meshBasicMaterial color={PALETTE.signal} transparent opacity={0} />
      </mesh>
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.7, 0]} />
        <meshBasicMaterial color={PALETTE.marigold} wireframe transparent opacity={0} />
      </mesh>
      <points ref={sparksRef} geometry={sparks.geo} frustumCulled={false}>
        <pointsMaterial
          map={sprite}
          size={0.2}
          sizeAttenuation
          color={PALETTE.circuit}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
