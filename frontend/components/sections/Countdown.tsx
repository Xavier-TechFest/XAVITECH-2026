"use client";

import { useEffect, useState } from "react";

export const EVENT_DATE = new Date("2026-10-30T09:00:00");

function getRemaining() {
  const diff = Math.max(0, EVENT_DATE.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown() {
  const [time, setTime] = useState<ReturnType<typeof getRemaining> | null>(
    null,
  );

  useEffect(() => {
    setTime(getRemaining());
    const id = setInterval(() => setTime(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  const units: [string, number][] = [
    ["days", time.days],
    ["hrs", time.hours],
    ["min", time.minutes],
    ["sec", time.seconds],
  ];

  return (
    <div className="flex gap-5 sm:gap-6" role="timer" aria-live="off">
      {units.map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <span className="font-display text-xl font-semibold tabular-nums text-ink min-[380px]:text-2xl sm:text-3xl">
            {String(value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-xs text-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}
