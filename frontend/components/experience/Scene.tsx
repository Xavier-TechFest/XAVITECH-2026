"use client";

import { Canvas } from "@react-three/fiber";
import CameraRig from "./CameraRig";
import Starfield from "./Starfield";
import Station from "./Station";
import LaserBolts from "./LaserBolts";
import OrbitalRings from "./OrbitalRings";
import Planet from "./Planet";
import Debris from "./Debris";
import { PALETTE, getQualityTier, type SceneProps } from "./shared";

/**
 * The whole WebGL scene. Loaded lazily (client only) by CosmosBackdrop, so it
 * never blocks first paint and never runs on the server.
 */
export default function Scene(props: SceneProps) {
  // Scene only mounts at all on medium/high tier (CosmosBackdrop gates
  // "low" out entirely), so the only distinction left to make here is
  // medium vs high.
  const reduced = getQualityTier() !== "high";

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 55, near: 0.1, far: 400 }}
      dpr={[1, reduced ? 1.25 : 1.6]}
      gl={{
        antialias: !reduced,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ pointerEvents: "none" }}
    >
      {/* rim lights for the station hull: marigold "sun" + teal fill */}
      <ambientLight intensity={0.4} color="#1A2033" />
      <directionalLight position={[10, 6, 6]} intensity={2.2} color={PALETTE.marigold} />
      <directionalLight position={[-10, -4, 3]} intensity={1.1} color={PALETTE.circuit} />

      <CameraRig {...props} />
      <Starfield {...props} />
      <Station {...props} />
      <LaserBolts {...props} />
      <Planet {...props} />
      <Debris {...props} />
      <OrbitalRings {...props} />
    </Canvas>
  );
}
