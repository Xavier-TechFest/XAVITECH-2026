/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // three.js ships modern ESM; let Next compile it for older browsers
  transpilePackages: ["three"],
};

export default nextConfig;
