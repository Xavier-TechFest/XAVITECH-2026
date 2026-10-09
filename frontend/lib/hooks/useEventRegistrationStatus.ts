"use client";

import { useEffect, useState } from "react";
import {
  EventRegistrationStatus,
  PublicEventItem,
  getPublicEvents,
} from "@/lib/api";

// Module-level cached promise for deduplicating requests across all cards/views
let cachedEvents: PublicEventItem[] | null = null;
let cachedPromise: Promise<PublicEventItem[]> | null = null;

export async function getPublicEventsCached(): Promise<PublicEventItem[]> {
  if (cachedEvents) return cachedEvents;
  if (!cachedPromise) {
    cachedPromise = getPublicEvents()
      .then((data) => {
        cachedEvents = data;
        return data;
      })
      .catch((err) => {
        console.error("Failed to load cached public events:", err);
        return [];
      });
  }
  return cachedPromise;
}

export function clearPublicEventsCache(): void {
  cachedEvents = null;
  cachedPromise = null;
}

export function useEventRegistrationStatus(slugOrId: string) {
  const [status, setStatus] = useState<EventRegistrationStatus | null>(null);
  const [eventData, setEventData] = useState<PublicEventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const target = (slugOrId || "").trim().toLowerCase();

    getPublicEventsCached()
      .then((events) => {
        if (!isMounted) return;
        const match = events.find(
          (e) => e.slug.toLowerCase() === target || e.id.toLowerCase() === target
        );
        if (match) {
          setStatus(match.registrationStatus);
          setEventData(match);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slugOrId]);

  return { status, eventData, isLoading };
}
