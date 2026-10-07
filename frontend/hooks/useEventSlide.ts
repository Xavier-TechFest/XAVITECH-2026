"use client";

import { useEffect, useState } from "react";
import { EVENT_SLIDES, msUntilNextSlot, slideIndexAt, type EventSlide } from "@/lib/eventSlides";

/**
 * Returns the event slide for the current 2-hour clock slot (IST), or null on the
 * server / first render (the time is only known in the browser). Re-checks exactly
 * at the next boundary, and again when the tab becomes visible, so a page left open
 * overnight still flips at 12 AM, 2 AM, ...
 */
export function useEventSlide(): EventSlide | null {
  const [slide, setSlide] = useState<EventSlide | null>(null);

  useEffect(() => {
    let timer = 0;
    const update = () => {
      const now = Date.now();
      setSlide(EVENT_SLIDES[slideIndexAt(now, EVENT_SLIDES.length)]);
      window.clearTimeout(timer);
      timer = window.setTimeout(update, msUntilNextSlot(now) + 250);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") update();
    };
    update();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return slide;
}
