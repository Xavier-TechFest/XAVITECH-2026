"use client";

import { useEffect, useRef, useState } from "react";

const PREF_KEY = "xavitech-sound-on";

/**
 * A 🔊 / 🔇 control for optional ambient background audio.
 *
 * Autoplay-safe by construction: the <audio> element is only created, and
 * only ever has .play() called on it, from inside this button's own click
 * handler — i.e. always in direct response to a user gesture, so it never
 * fights the browser's autoplay policy and never needs to detect one.
 * Nothing plays on mobile (or anywhere) until the visitor taps this.
 *
 * Needs an actual audio file at /audio/ambient.mp3 — see the comment below.
 * Until one exists, the button renders (and remembers the visitor's
 * preference) but playback silently no-ops.
 */
export default function SoundToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(localStorage.getItem(PREF_KEY) === "1");
  }, []);

  const toggle = () => {
    if (!audioRef.current) {
      // Ambient electronic / suspense-build loop, per the brief. Drop the
      // file in public/audio/ambient.mp3 — nothing else here needs to change.
      const el = new Audio("/audio/ambient.mp3");
      el.loop = true;
      el.volume = 0.35;
      audioRef.current = el;
    }
    const next = !on;
    setOn(next);
    localStorage.setItem(PREF_KEY, next ? "1" : "0");
    if (next) {
      audioRef.current.play().catch(() => {
        // No audio file yet, or the browser still refused it — fail quiet.
      });
    } else {
      audioRef.current.pause();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? "Mute ambient sound" : "Play ambient sound"}
      aria-pressed={on}
      className="pointer-events-auto fixed bottom-[max(1.1rem,env(safe-area-inset-bottom))] right-[max(1.1rem,env(safe-area-inset-right))] z-30 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-bg/80 text-sm text-muted backdrop-blur-sm transition-colors hover:border-circuit/60 hover:text-circuit"
    >
      <span aria-hidden="true">{on ? "🔊" : "🔇"}</span>
    </button>
  );
}
