"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE, isPhone, smoothstep, type SceneProps } from "./shared";

/**
 * A drifting wreckage field the camera dollies straight through while the
 * Events section is on screen (the "tech war aftermath"). Dark hulls with
 * teal edge lines, all in two instanced draw calls.
 */
export default function Debris({ scrollRef }: SceneProps) {
  const hullRef = useRef<THREE.InstancedMesh>(null!);
  const wireRef = useRef<THREE.InstancedMesh>(null!);
  const phone = useMemo(() => isPhone(), []);
  const count = phone ? 34 : 72;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const side = Math.random() < 0.5 ? -1 : 1;
        return {
          x: side * (4 + Math.random() * 20),
          y: (Math.random() - 0.5) * 20,
          z: -34 + Math.random() * 26,
          s: 0.35 + Math.random() * 1.3,
          rx: (Math.random() - 0.5) * 0.6,
          ry: (Math.random() - 0.5) * 0.6,
          ph: Math.random() * 6.28,
        };
      }),
    [count]
  );

  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const hullMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0B111D",
        roughness: 0.9,
        metalness: 0.3,
        transparent: true,
        opacity: 0,
        flatShading: true,
      }),
    []
  );
  const wireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: PALETTE.circuit,
        wireframe: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    []
  );

  useEffect(
    () => () => {
      geo.dispose();
      hullMat.dispose();
      wireMat.dispose();
    },
    [geo, hullMat, wireMat]
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const st = scrollRef.current.stageSmooth;
    const vis = smoothstep(2.3, 3.0, st) * (1 - smoothstep(3.7, 4.4, st));
    const hull = hullRef.current;
    const wire = wireRef.current;
    hull.visible = wire.visible = vis > 0.01;
    if (!hull.visible) return;

    hullMat.opacity = vis;
    wireMat.opacity = 0.4 * vis;

    for (let i = 0; i < count; i++) {
      const d = seeds[i];
      dummy.position.set(d.x, d.y + Math.sin(t * 0.3 + d.ph) * 0.4, d.z);
      dummy.rotation.set(t * d.rx + d.ph, t * d.ry, 0);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      hull.setMatrixAt(i, dummy.matrix);
      wire.setMatrixAt(i, dummy.matrix);
    }
    hull.instanceMatrix.needsUpdate = true;
    wire.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={hullRef} args={[geo, hullMat, count]} frustumCulled={false} />
      <instancedMesh ref={wireRef} args={[geo, wireMat, count]} frustumCulled={false} scale={1.02} />
    </group>
  );
}
