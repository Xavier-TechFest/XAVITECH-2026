"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE, smoothstep, type SceneProps } from "./shared";

const R = 6.5;

/**
 * A ringed gas giant the camera sweeps past between the hero and the Tracks
 * section: gives the About section its own "location" in space.
 */
export default function Planet({ scrollRef, mouseRef }: SceneProps) {
  const rootRef = useRef<THREE.Group>(null!);
  const spinRef = useRef<THREE.Group>(null!);
  const hullRef = useRef<THREE.Mesh>(null!);
  const rimRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const bandsRef = useRef<THREE.Group>(null!);

  useFrame(({ camera, size }, delta) => {
    const s = scrollRef.current;
    const m = mouseRef.current;
    const aspect = size.width / size.height;

    const vis = smoothstep(0.2, 0.9, s.stageSmooth) * (1 - smoothstep(1.7, 2.4, s.stageSmooth));
    const root = rootRef.current;
    root.visible = vis > 0.01;
    if (!root.visible) return;

    const scale = THREE.MathUtils.clamp(aspect / 1.3, 0.5, 1);
    const side = aspect < 1 ? 0.55 : 1;
    root.position.set(-15 * side + m.x * 0.8, 3.5 + m.y * 0.5, -17);
    root.scale.setScalar(scale);
    spinRef.current.rotation.y += delta * 0.03;

    (hullRef.current.material as THREE.MeshStandardMaterial).opacity = vis;
    (rimRef.current.material as THREE.MeshBasicMaterial).opacity = 0.16 * vis;
    (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.2 * vis;
    bandsRef.current.children.forEach((c) => {
      ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.22 * vis;
    });
    void camera;
  });

  return (
    <group ref={rootRef} visible={false}>
      <mesh ref={rimRef}>
        <sphereGeometry args={[R * 1.12, 48, 48]} />
        <meshBasicMaterial
          color={PALETTE.circuit}
          transparent
          opacity={0}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <group ref={spinRef} rotation={[0.25, 0, -0.35]}>
        <mesh ref={hullRef}>
          <sphereGeometry args={[R, 64, 64]} />
          <meshStandardMaterial color="#0C1220" roughness={0.9} metalness={0.2} transparent />
        </mesh>
        <group ref={bandsRef}>
          {[-0.55, -0.25, 0.05, 0.4].map((lat) => (
            <mesh key={lat} rotation={[Math.PI / 2, 0, 0]} position={[0, lat * R, 0]}>
              <torusGeometry args={[Math.sqrt(1 - lat * lat) * R * 1.003, 0.02, 6, 128]} />
              <meshBasicMaterial color={PALETTE.circuit} transparent opacity={0} />
            </mesh>
          ))}
        </group>
      </group>
      <mesh ref={ringRef} rotation={[Math.PI / 2 - 0.35, 0, -0.35]}>
        <ringGeometry args={[R * 1.35, R * 2.05, 96]} />
        <meshBasicMaterial
          color={PALETTE.marigold}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
