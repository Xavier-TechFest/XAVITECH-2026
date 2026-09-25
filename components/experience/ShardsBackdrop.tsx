"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function FloatingShard({
  position,
  rotation,
  scale,
  color,
  offset,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
  offset: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime() + offset;
      meshRef.current.rotation.x += delta * 0.25;
      meshRef.current.rotation.y += delta * 0.35;
      meshRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.4;
      meshRef.current.position.x = position[0] + Math.cos(t * 1.2) * 0.2;
    }
  });

  const geometry = useMemo(() => {
    return new THREE.TetrahedronGeometry(scale, 0);
  }, [scale]);

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} geometry={geometry}>
      <meshPhysicalMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        roughness={0.2}
        metalness={0.8}
        transmission={0.3}
        thickness={0.5}
      />
    </mesh>
  );
}

function ShardField() {
  const shards = useMemo(() => {
    const items = [];
    const colors = ["#2563eb", "#3b82f6", "#1d4ed8", "#35e0c9", "#60a5fa", "#1e40af"];
    for (let i = 0; i < 35; i++) {
      const x = (Math.random() - 0.5) * 32;
      const y = (Math.random() - 0.5) * 22;
      const z = (Math.random() - 0.5) * 16 - 5;
      const rx = Math.random() * Math.PI;
      const ry = Math.random() * Math.PI;
      const scale = 0.4 + Math.random() * 0.9;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const offset = Math.random() * 10;
      items.push({
        id: i,
        position: [x, y, z] as [number, number, number],
        rotation: [rx, ry, 0] as [number, number, number],
        scale,
        color,
        offset,
      });
    }
    return items;
  }, []);

  return (
    <group>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#60a5fa" />
      <pointLight position={[-10, -10, -5]} intensity={1.2} color="#35e0c9" />
      {shards.map((s) => (
        <FloatingShard
          key={s.id}
          position={s.position}
          rotation={s.rotation}
          scale={s.scale}
          color={s.color}
          offset={s.offset}
        />
      ))}
    </group>
  );
}

export default function ShardsBackdrop() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#050914]">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <ShardField />
      </Canvas>
    </div>
  );
}
