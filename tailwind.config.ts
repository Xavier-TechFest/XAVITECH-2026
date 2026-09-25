import type { Config } from "tailwindcss";

const config: Config = {
  // Only apply hover: styles on devices that can actually hover, so taps on
  // phones/tablets don't leave cards and links stuck in their hover state.
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#07080B",
        surface: "#12141B",
        "surface-raised": "#181B24",
        ink: "#ECE8DE",
        muted: "#868C99",
        marigold: "#F2A63C",
        circuit: "#35E0C9",
        signal: "#E23F7E",
        line: "#22252F",
      },
      fontFamily: {
        display: ["var(--font-unbounded)", "sans-serif"],
        body: ["var(--font-manrope)", "sans-serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};

export default config;
