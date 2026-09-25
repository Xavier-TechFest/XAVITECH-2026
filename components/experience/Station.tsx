"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  PALETTE,
  clamp01,
  makeSpriteTexture,
  smoothstep,
  type SceneProps,
} from "./shared";

const R = 7; // station radius (world units)
const START_Z = -42;

/** Evenly spread "city light" points over a sphere (Fibonacci lattice). */
function buildLights(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const teal = new THREE.Color(PALETTE.circuit);
  const gold = new THREE.Color(PALETTE.marigold);
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = golden * i;
    positions[i * 3] = Math.cos(a) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(a) * r * radius;
    const c = Math.random() < 0.7 ? teal : gold;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

/**
 * A distant orbital fortress in the hero sky: dark hull, wireframe panels,
 * a glowing equatorial trench and a scatter of surface lights. It drifts
 * toward the camera and fades out as the hero scrolls away.
 */
export default function Station({ scrollRef, mouseRef }: SceneProps) {
  const rootRef = useRef<THREE.Group>(null!);
  const spinRef = useRef<THREE.Group>(null!);
  const wireRef = useRef<THREE.Mesh>(null!);
  const trenchRef = useRef<THREE.Mesh>(null!);
  const trench2Ref = useRef<THREE.Mesh>(null!);
  const lightsRef = useRef<THREE.Points>(null!);
  const haloRef = useRef<THREE.Mesh>(null!);
  const hullRef = useRef<THREE.Mesh>(null!);

  const sprite = useMemo(() => makeSpriteTexture(), []);
  const lightsGeo = useMemo(() => buildLights(520, R * 1.004), []);

  useEffect(
    () => () => {
      sprite.dispose();
      lightsGeo.dispose();
    },
    [sprite, lightsGeo]
  );

  useFrame(({ clock, camera, size }, delta) => {
    const t = clock.elapsedTime;
    const s = scrollRef.current;
    const m = mouseRef.current;
    const aspect = size.width / size.height;

    const fade = 1 - smoothstep(0.15, 0.85, s.hero);
    const root = rootRef.current;
    root.visible = fade > 0.01;
    if (!root.visible) return;

    // keep the composition sane on tall (phone) screens
    const scale = THREE.MathUtils.clamp(aspect / 1.3, 0.34, 1);
    const dist = camera.position.z - START_Z; // ~50
    const halfW = Math.tan(THREE.MathUtils.degToRad(27.5)) * dist * aspect;
    const x = halfW * 0.5 * (1 + s.hero * 0.9) + m.x * -1.2;
    // tall screens push it up into the empty sky above the copy
    const y = 11 + (1 - scale) * 11 + s.hero * 5 + m.y * -0.8;

    root.position.set(x, y, START_Z + s.hero * 26);
    root.scale.setScalar(scale);

    spinRef.current.rotation.y += delta * 0.045;

    const wireMat = wireRef.current.material as THREE.MeshBasicMaterial;
    const trenchMat = trenchRef.current.material as THREE.MeshBasicMaterial;
    const trench2Mat = trench2Ref.current.material as THREE.MeshBasicMaterial;
    const lightsMat = lightsRef.current.material as THREE.PointsMaterial;
    const haloMat = haloRef.current.material as THREE.MeshBasicMaterial;
    const hullMat = hullRef.current.material as THREE.MeshStandardMaterial;

    hullMat.opacity = fade;
    wireMat.opacity = 0.34 * fade;
    trenchMat.opacity = (0.85 + 0.15 * Math.sin(t * 2)) * fade;
    trench2Mat.opacity = 0.55 * fade;
    lightsMat.opacity = (0.7 + 0.3 * Math.sin(t * 3.1)) * fade;
    haloMat.opacity = 0.09 * clamp01(fade);
  });

  return (
    <group ref={rootRef} position={[0, 0, START_Z]}>
      {/* atmosphere / glow */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[R * 1.16, 40, 40]} />
        <meshBasicMaterial
          color={PALETTE.circuit}
          transparent
          opacity={0.09}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <group ref={spinRef} rotation={[0.42, 0, -0.32]}>
        {/* dark hull (lit by the scene's marigold / teal rim lights) */}
        <mesh ref={hullRef}>
          <sphereGeometry args={[R, 64, 64]} />
          <meshStandardMaterial
            color="#0A0E18"
            roughness={0.85}
            metalness={0.35}
            transparent
          />
        </mesh>

        {/* panel lines */}
        <mesh ref={wireRef}>
          <icosahedronGeometry args={[R * 1.003, 2]} />
          <meshBasicMaterial
            color={PALETTE.circuit}
            wireframe
            transparent
            opacity={0.34}
            depthWrite={false}
          />
        </mesh>

        {/* equatorial trench */}
        <mesh ref={trenchRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[R * 1.006, R * 0.014, 8, 160]} />
          <meshBasicMaterial color={PALETTE.marigold} transparent opacity={0.9} />
        </mesh>
        <mesh ref={trench2Ref} rotation={[Math.PI / 2, 0, 0]} position={[0, R * 0.09, 0]}>
          <torusGeometry args={[R * 0.996, R * 0.006, 8, 160]} />
          <meshBasicMaterial color={PALETTE.circuit} transparent opacity={0.55} />
        </mesh>

        {/* surface lights */}
        <points ref={lightsRef} geometry={lightsGeo} frustumCulled={false}>
          <pointsMaterial
            map={sprite}
            size={0.26}
            sizeAttenuation
            vertexColors
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </group>
  );
}
