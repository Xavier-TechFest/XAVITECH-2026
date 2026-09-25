"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE, smoothstep, type SceneProps } from "./shared";

const POOL = 6;
const SPEED = 62; // world units / second
const LIFE = 1.05; // seconds

interface Bolt {
  active: boolean;
  age: number;
  start: THREE.Vector3;
  dir: THREE.Vector3;
}

/**
 * Distant tracer fire: a small pool of glowing bolts that cross the sky in
 * the hero (the "tech war" backdrop). Spawning stops once the hero has been
 * scrolled away, and bolts already in flight simply finish.
 */
export default function LaserBolts({ scrollRef }: SceneProps) {
  const meshRefs = useRef<(THREE.Group | null)[]>([]);
  const nextSpawn = useRef(1.2);

  const bolts = useMemo<Bolt[]>(
    () =>
      Array.from({ length: POOL }, () => ({
        active: false,
        age: 0,
        start: new THREE.Vector3(),
        dir: new THREE.Vector3(),
      })),
    []
  );

  const core = useMemo(() => new THREE.BoxGeometry(0.07, 0.07, 3.4), []);
  const glow = useMemo(() => new THREE.BoxGeometry(0.28, 0.28, 3.8), []);
  const materials = useMemo(() => {
    const make = (color: string, opacity: number) =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    return Array.from({ length: POOL }, (_, i) => {
      const color = i % 2 === 0 ? PALETTE.signal : PALETTE.circuit;
      return { core: make("#FFFFFF", 1), glow: make(color, 0.4) };
    });
  }, []);

  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock, camera }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    const s = scrollRef.current;

    // spawn
    if (t >= nextSpawn.current && s.hero < 0.8) {
      const free = bolts.find((b) => !b.active);
      if (free) {
        const side = Math.random() < 0.5 ? -1 : 1;
        const zFar = camera.position.z - (28 + Math.random() * 30);
        free.start.set(side * (18 + Math.random() * 16), -4 + Math.random() * 20, zFar);
        // aim across the sky toward the opposite side
        tmp.set(-side * (6 + Math.random() * 14), 2 + Math.random() * 10, zFar - 8 - Math.random() * 12);
        free.dir.copy(tmp).sub(free.start).normalize();
        free.active = true;
        free.age = 0;
      }
      nextSpawn.current = t + 0.7 + Math.random() * 1.6;
    }

    // move + fade
    bolts.forEach((b, i) => {
      const g = meshRefs.current[i];
      if (!g) return;
      if (!b.active) {
        g.visible = false;
        return;
      }
      b.age += dt;
      const u = b.age / LIFE;
      if (u >= 1) {
        b.active = false;
        g.visible = false;
        return;
      }
      g.visible = true;
      g.position.copy(b.start).addScaledVector(b.dir, b.age * SPEED);
      g.lookAt(tmp.copy(g.position).add(b.dir));
      const a = Math.sin(Math.PI * u) * (1 - smoothstep(0.6, 1, s.hero));
      materials[i].core.opacity = a;
      materials[i].glow.opacity = 0.4 * a;
    });
  });

  return (
    <group>
      {materials.map((mat, i) => (
        <group
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          visible={false}
        >
          <mesh geometry={core} material={mat.core} />
          <mesh geometry={glow} material={mat.glow} />
        </group>
      ))}
    </group>
  );
}
