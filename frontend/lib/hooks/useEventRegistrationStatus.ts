"use client";

import { useEffect, useState } from "react";
import {
  EventRegistrationStatus,
  PublicEventItem,
  getPublicEvents,
} from "@/lib/api";
import { getEventByIdOrSlug } from "@/lib/eventsData";

// Module-level cached promise for deduplicating requests across all cards/views
let cachedEvents: PublicEventItem[] | null = null;
let cachedPromise: Promise<PublicEventItem[]> | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 15000; // 15 seconds cache to balance performance with fast admin updates

export async function getPublicEventsCached(forceRefresh = false): Promise<PublicEventItem[]> {
  const now = Date.now();
  if (!forceRefresh && cachedEvents && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedEvents;
  }
  if (!cachedPromise || forceRefresh) {
    cachedPromise = getPublicEvents()
      .then((data) => {
        cachedEvents = data;
        lastCacheTime = Date.now();
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
  lastCacheTime = 0;
}

export function useEventRegistrationStatus(slugOrId: string) {
  const [status, setStatus] = useState<EventRegistrationStatus | null>(null);
  const [eventData, setEventData] = useState<PublicEventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const target = (slugOrId || "").trim().toLowerCase();
    const localEvent = getEventByIdOrSlug(target);
    const canonicalId = localEvent?.id.toLowerCase();
    const aliases = (localEvent?.aliases || []).map((a) => a.toLowerCase());

    getPublicEventsCached()
      .then((events) => {
        if (!isMounted) return;
        const match = events.find((e) => {
          const eSlug = e.slug.toLowerCase();
          const eId = e.id.toLowerCase();
          return (
            eSlug === target ||
            eId === target ||
            (canonicalId && (eSlug === canonicalId || eId === canonicalId)) ||
            aliases.includes(eSlug)
          );
        });
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
