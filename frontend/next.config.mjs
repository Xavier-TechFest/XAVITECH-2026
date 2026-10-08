/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // Keep the dev cache separate from production build output.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // three.js ships modern ESM; let Next compile it for older browsers
  transpilePackages: ["three"],
};

export default nextConfig;
