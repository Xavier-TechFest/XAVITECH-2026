/**
 * A calm, static version of the homepage's cosmos: same star tile and nebula
 * glow, no WebGL. The committee page is long and text-dense — 39 people —
 * so it keeps the sci-fi setting without the moving 3D scene competing with
 * reading. Zero extra JS: the stars are one repeating inline SVG.
 */
function buildStarTile(size = 520, count = 46) {
  // tiny seeded PRNG: identical on server and client, so no hydration diff
  let seed = 11;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const colors = ["#DCE6FF", "#DCE6FF", "#DCE6FF", "#35E0C9", "#F2A63C", "#E23F7E"];
  let dots = "";
  for (let i = 0; i < count; i++) {
    const x = (rnd() * size).toFixed(1);
    const y = (rnd() * size).toFixed(1);
    const r = (0.5 + rnd() * 0.9).toFixed(2);
    const o = (0.35 + rnd() * 0.6).toFixed(2);
    const c = colors[Math.floor(rnd() * colors.length)];
    dots += `<circle cx='${x}' cy='${y}' r='${r}' fill='${c}' fill-opacity='${o}'/>`;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>${dots}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const STAR_TILE = buildStarTile();

export default function StaticSky() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-bg">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 85% 0%, rgba(53,224,201,0.09), transparent 70%), radial-gradient(ellipse 50% 40% at 5% 60%, rgba(242,166,60,0.07), transparent 70%), radial-gradient(ellipse 60% 35% at 50% 100%, rgba(226,63,126,0.05), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: STAR_TILE, backgroundSize: "520px 520px", opacity: 0.55 }}
      />
    </div>
  );
}
