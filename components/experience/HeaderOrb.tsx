"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function OrbMesh() {
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.4;
      coreRef.current.rotation.x = t * 0.2;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.6;
      ring1Ref.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.5) * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 0.5;
      ring2Ref.current.rotation.z = Math.PI / 4;
    }
  });

  return (
    <group scale={1.8}>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#35e0c9" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#3b82f6" />
      
      {/* Core Icosahedron Wireframe */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshBasicMaterial color="#35e0c9" wireframe transparent opacity={0.6} />
      </mesh>

      {/* Inner glowing sphere */}
      <mesh>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.35} />
      </mesh>

      {/* Outer Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.2, 0.02, 16, 100]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.8} />
      </mesh>

      {/* Outer Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.7, 0.015, 16, 100]} />
        <meshBasicMaterial color="#35e0c9" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

export default function HeaderOrb() {
  return (
    <div className="relative h-44 w-44 sm:h-56 sm:w-56 md:h-64 md:w-64">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ alpha: true, antialias: true }}>
        <OrbMesh />
      </Canvas>
    </div>
  );
}
