"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PREF_KEY = "xavitech-sound-on";
const POS_KEY = "xavitech-sound-pos";
const SRC = "/audio/ambient.mp3";
const VOLUME = 0.4;

type AudioWindow = Window & { __xavitechAudio?: HTMLAudioElement };

/**
 * One <audio> element for the whole visit, kept on `window` so it survives
 * remounts / hot reloads. Pages are switched with client-side navigation (next/link),
 * so this component — mounted once in the root layout — never restarts the track.
 * As a safety net for hard reloads, the playback position is saved and resumed.
 */
function getAudio(): HTMLAudioElement {
  const w = window as AudioWindow;
  if (w.__xavitechAudio) return w.__xavitechAudio;
  const el = new Audio();
  el.src = SRC;
  el.loop = true;
  el.volume = VOLUME;
  el.preload = "auto";
  try {
    const saved = Number(sessionStorage.getItem(POS_KEY));
    if (saved > 0) el.addEventListener("loadedmetadata", () => { try { el.currentTime = saved % (el.duration || saved + 1); } catch {} }, { once: true });
  } catch {}
  w.__xavitechAudio = el;
  return el;
}

/**
 * 🔊 / 🔇 ambient audio (public/audio/ambient.mp3).
 *
 * - Starts the moment the site loads (the splash), with sound if the browser allows.
 * - Browsers block *audible* autoplay before a tap. In that case the track still starts
 *   immediately, muted, and is un-muted on the first tap / key press — so it never
 *   restarts from the beginning, it simply becomes audible.
 * - Keeps playing across page changes; only an explicit mute turns it off (remembered).
 */
export default function SoundToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audible, setAudible] = useState(false);
  const [waiting, setWaiting] = useState(false); // playing silently, waiting for a tap
  const [failed, setFailed] = useState(false);

  const sync = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    const on = !el.paused && !el.muted;
    setAudible(on);
    setWaiting(!el.paused && el.muted);
  }, []);

  useEffect(() => {
    const el = getAudio();
    audioRef.current = el;
    const onError = () => {
      console.error("[XAVITECH] Could not load", SRC, "- check public/audio/ambient.mp3");
      setFailed(true);
    };
    const savePos = () => {
      try { sessionStorage.setItem(POS_KEY, String(el.currentTime)); } catch {}
    };
    el.addEventListener("playing", sync);
    el.addEventListener("pause", sync);
    el.addEventListener("volumechange", sync);
    el.addEventListener("error", onError);
    window.addEventListener("pagehide", savePos);
    sync();

    let muted = false;
    try { muted = sessionStorage.getItem(PREF_KEY) === "0"; } catch {}
    let cancelled = false;
    const events = ["pointerdown", "mousedown", "click", "keydown", "touchend"] as const;
    const off = () => events.forEach((e) => window.removeEventListener(e, onGesture, { capture: true }));
    const onGesture = (e: Event) => {
      // a tap on the speaker button is handled by the button itself
      if ((e.target as Element | null)?.closest?.("[data-sound-toggle]")) return;
      off();
      if (cancelled) return;
      el.muted = false;
      el.play().then(() => { try { sessionStorage.setItem(PREF_KEY, "1"); } catch {} }).catch(() => {}).finally(sync);
    };

    if (!muted) {
      if (el.paused) {
        el.muted = false;
        el.play().then(sync).catch(() => {
          // audible autoplay blocked -> start silently right now, unmute on first gesture
          el.muted = true;
          el.play().then(sync).catch(() => {});
          events.forEach((e) => window.addEventListener(e, onGesture, { capture: true, passive: true }));
        });
      } else if (el.muted) {
        events.forEach((e) => window.addEventListener(e, onGesture, { capture: true, passive: true }));
      }
    }

    return () => {
      cancelled = true;
      off();
      el.removeEventListener("playing", sync);
      el.removeEventListener("pause", sync);
      el.removeEventListener("volumechange", sync);
      el.removeEventListener("error", onError);
      window.removeEventListener("pagehide", savePos);
    };
  }, [sync]);

  const toggle = () => {
    const el = audioRef.current ?? getAudio();
    if (audible) {
      el.pause();
      try { sessionStorage.setItem(PREF_KEY, "0"); } catch {}
    } else {
      el.muted = false;
      el.play().then(() => { setFailed(false); try { sessionStorage.setItem(PREF_KEY, "1"); } catch {} }).catch(() => setFailed(true)).finally(sync);
    }
  };

  return (
    <>
      {waiting && (
        <span
          aria-hidden="true"
          className="pointer-events-none fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[max(4.4rem,calc(env(safe-area-inset-right)+3.3rem))] z-[70] rounded-full border border-circuit/50 bg-bg/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-circuit"
        >
          Tap anywhere for sound
        </span>
      )}
      <button
        type="button"
        data-sound-toggle
        onClick={toggle}
        aria-label={audible ? "Mute ambient sound" : "Play ambient sound"}
        aria-pressed={audible}
        title={failed ? "Audio could not be loaded — check public/audio/ambient.mp3" : audible ? "Mute" : "Play music"}
        className={`pointer-events-auto fixed bottom-[max(1.1rem,env(safe-area-inset-bottom))] right-[max(1.1rem,env(safe-area-inset-right))] z-[70] flex h-11 w-11 items-center justify-center rounded-full border bg-bg/90 text-base transition-colors ${
          failed
            ? "border-red-500/70 text-red-400"
            : audible
              ? "border-circuit text-circuit shadow-[0_0_14px_rgba(53,224,201,0.45)]"
              : waiting
                ? "animate-pulse border-circuit/70 text-circuit"
                : "border-line text-muted hover:border-circuit/60 hover:text-circuit"
        }`}
      >
        <span aria-hidden="true">{failed ? "⚠" : audible ? "🔊" : "🔇"}</span>
      </button>
    </>
  );
}
