"use client";

import { firePulse } from "@/lib/pulse";

/** "Return to launch": smooth-scrolls to the top; the long scroll drives the 3D warp. */
export default function LaunchButton() {
  return (
    <button
      type="button"
      onClick={() => {
        firePulse(0);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-circuit/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-circuit transition-all duration-300 hover:border-circuit hover:bg-circuit/10 hover:shadow-[0_0_18px_rgba(53,224,201,0.3)] sm:text-[11px]"
    >
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5">
        ↑
      </span>
      Return to launch
    </button>
  );
}
