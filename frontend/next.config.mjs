import { PHASE_PRODUCTION_BUILD } from "next/constants.js";

/** @type {(phase: string) => import('next').NextConfig} */
export default function nextConfig(phase) {
  const isProdBuild = phase === PHASE_PRODUCTION_BUILD;
  return {
    output: "export",
    // three.js ships modern ESM; let Next compile it for older browsers
    transpilePackages: ["three"],
    distDir: process.env.NEXT_DIST_DIR || (isProdBuild ? ".next_prod" : ".next"),
  };
}
