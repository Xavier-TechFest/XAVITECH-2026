"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { EVENTS, TRACKS, EventItem } from "@/lib/eventsData";
import { api, ParticipantRegistration, UUID_TO_EVENT_SLUG } from "@/lib/api";

function validatePhoneNumber(value: string): { isValid: boolean; error: string | null } {
  const trimmed = value.trim();
  if (!trimmed) return { isValid: true, error: null };
  if (!/^\d{10}$/.test(trimmed)) {
    return { isValid: false, error: "Enter a valid 10-digit mobile number." };
  }
  return { isValid: true, error: null };
}

function normalizeErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === "string" && err.trim()) return err.trim();
  if (err instanceof Error && typeof err.message === "string" && err.message.trim()) {
    return err.message.trim();
  }
  if (typeof err === "object" && err !== null) {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === "string" && obj.message.trim()) return obj.message.trim();
    if (typeof obj.error === "string" && obj.error.trim()) return obj.error.trim();
  }
  return fallback;
}

function extractTrackName(trackRaw: unknown): string {
  if (!trackRaw) return "";
  if (typeof trackRaw === "string") return trackRaw.trim();
  if (typeof trackRaw === "object" && trackRaw !== null) {
    const obj = trackRaw as { name?: unknown; title?: unknown; slug?: unknown };
    if (typeof obj.name === "string" && obj.name.trim()) return obj.name.trim();
    if (typeof obj.title === "string" && obj.title.trim()) return obj.title.trim();
    if (typeof obj.slug === "string" && obj.slug.trim()) {
      return obj.slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
  }
  return "";
}

function resolveEventFromRegistration(reg: ParticipantRegistration): EventItem | null {
  const slugCandidate = (
    (typeof reg.event?.slug === "string" && reg.event.slug) ||
    (typeof reg.eventSlug === "string" && reg.eventSlug) ||
    (typeof reg.event_slug === "string" && reg.event_slug) ||
    ""
  ).toLowerCase().trim();

  const nameCandidate = (
    (typeof reg.event?.name === "string" && reg.event.name) ||
    (typeof reg.event?.title === "string" && reg.event.title) ||
    ""
  ).toLowerCase().trim();

  const eventIdCandidate = (
    (typeof reg.event?.id === "string" && reg.event.id) ||
    (typeof reg.eventId === "string" && reg.eventId) ||
    (typeof reg.event_id === "string" && reg.event_id) ||
    ""
  ).trim();

  // 1. Direct slug match on EVENTS.id (e.g. "innocraft", "battle-of-bots")
  if (slugCandidate) {
    const match = EVENTS.find((e) => e.id.toLowerCase() === slugCandidate);
    if (match) return match;
  }

  // 2. Database UUID lookup
  if (eventIdCandidate && UUID_TO_EVENT_SLUG[eventIdCandidate]) {
    const mappedSlug = UUID_TO_EVENT_SLUG[eventIdCandidate];
    const match = EVENTS.find((e) => e.id.toLowerCase() === mappedSlug);
    if (match) return match;
  }

  // 3. Normalized name match (handles casing and unicode differences)
  if (nameCandidate) {
    const cleanName = nameCandidate.replace(/[^a-z0-9]/g, "");
    const match = EVENTS.find((e) => {
      const eName = (e.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const eTitle = (e.fullTitle || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const eId = (e.id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      return eName === cleanName || eTitle === cleanName || eId === cleanName;
    });
    if (match) return match;
  }

  return null;
}

/**
 * Resolves the appropriate continuation route for an existing registration based on its status.
 * Never routes an enrolled user to the public event catalog page.
 */
function buildRegistrationContinuationUrl(
  eventSlug: string,
  registrationId: string | null,
  rawStatus: string
): string {
  if (!eventSlug) return "/events";

  const cleanStatus = (rawStatus || "").toUpperCase().trim();
  const cleanId = registrationId ? encodeURIComponent(registrationId.trim()) : "";

  if (cleanId) {
    switch (cleanStatus) {
      case "CONFIRMED":
      case "PAYMENT_SUCCESS":
        return `/events/${eventSlug}/register?registrationId=${cleanId}&step=confirmed&paymentStatus=success`;
      case "PAYMENT_FAILED":
        return `/events/${eventSlug}/register?registrationId=${cleanId}&step=payment&paymentStatus=failed`;
      case "CANCELLED":
        return `/events/${eventSlug}/register?registrationId=${cleanId}&step=payment&paymentStatus=cancelled`;
      case "DRAFT":
      case "PAYMENT_PENDING":
      default:
        return `/events/${eventSlug}/register?registrationId=${cleanId}&step=payment`;
    }
  }

  // Fallback if registrationId is missing: Never route to public catalog; route to register
  return `/events/${eventSlug}/register`;
}

interface ParticipantEventViewModel {
  id: string;
  registrationId: string | null;
  name: string;
  track: string;
  date: string;
  venue: string;
  statusBadge: string;
  stageDescription: string;
  badgeStyle: {
    color: string;
    borderColor: string;
    backgroundColor: string;
  };
  accent: string;
  href: string;
  isTeam: boolean;
  teamName: string | null;
  teamSize: number | null;
  userRole: string | null;
  payableAmount: number | null;
}

export default function ProfilePage() {
  const { user, loading, isAuthenticated, updateProfile, logout, getIdToken, refreshRegistrations } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<ParticipantRegistration[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [registrationsError, setRegistrationsError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setPhone(user.phone || "");
    setCollegeName(user.collegeName || "");
    setPhoneError(null);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setRegistrationsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const loadRegistrations = async () => {
      setRegistrationsLoading(true);
      setRegistrationsError(null);
      try {
        const token = await getIdToken();
        if (!token) throw new Error("Please sign in again to view your events.");
        const rows = await api.fetchMyRegistrations(token);
        if (!cancelled) {
          const safeRows = Array.isArray(rows) ? rows : [];
          setRegistrations(safeRows);
          refreshRegistrations().catch(() => {});
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setRegistrations([]);
          setRegistrationsError(
            normalizeErrorMessage(error, "Could not load your registered events at this time.")
          );
        }
      } finally {
        if (!cancelled) setRegistrationsLoading(false);
      }
    };

    loadRegistrations();
    return () => {
      cancelled = true;
    };
  }, [user?.firebaseUid, getIdToken]);

  const participantEvents: ParticipantEventViewModel[] = useMemo(() => {
    if (!Array.isArray(registrations)) return [];

    const list: ParticipantEventViewModel[] = [];

    for (const registration of registrations) {
      if (!registration || typeof registration !== "object") continue;

      try {
        const staticEvent = resolveEventFromRegistration(registration);

        // Explicit primitive name
        let eventName = "Event Registration";
        if (staticEvent?.name) {
          eventName = staticEvent.name;
        } else if (typeof registration.event?.name === "string" && registration.event.name.trim()) {
          eventName = registration.event.name.trim();
        } else if (typeof registration.event?.title === "string" && registration.event.title.trim()) {
          eventName = registration.event.title.trim();
        }

        // Explicit primitive track
        let trackName = "XaviTech 2026";
        if (staticEvent) {
          const matchedTrack = TRACKS.find((t) => t.id === staticEvent.trackId);
          trackName = matchedTrack?.name || staticEvent.trackName || "XaviTech 2026";
        } else {
          const fromEvent =
            extractTrackName(registration.event?.track) ||
            (typeof registration.event?.trackName === "string" ? registration.event.trackName : "") ||
            (typeof registration.event?.category === "string" ? registration.event.category : "");
          if (fromEvent) trackName = fromEvent;
        }

        // Explicit primitive date & venue
        const date = staticEvent?.date || registration.event?.date || "March 2026";
        const venue = staticEvent?.venue || registration.event?.venue || "Campus Venue";
        const accent = staticEvent?.accentColor || "#35e0c9";

        // Participation type
        const isIndividual =
          registration.registrationType === "INDIVIDUAL" ||
          registration.registration_type === "INDIVIDUAL";
        const isTeam =
          !isIndividual &&
          (registration.registrationType === "TEAM" ||
            registration.registration_type === "TEAM" ||
            Boolean(registration.team) ||
            staticEvent?.registrationConfig?.eventFormat === "team");

        // Team information
        let teamName: string | null = null;
        if (typeof registration.team?.teamName === "string" && registration.team.teamName.trim()) {
          teamName = registration.team.teamName.trim();
        } else if (typeof registration.team?.team_name === "string" && registration.team.team_name.trim()) {
          teamName = registration.team.team_name.trim();
        }

        let teamSize: number | null = null;
        if (typeof registration.team?.teamSize === "number") {
          teamSize = registration.team.teamSize;
        } else if (Array.isArray(registration.team?.members)) {
          teamSize = 1 + registration.team.members.length;
        } else if (Array.isArray(registration.participants) && registration.participants.length > 0) {
          teamSize = registration.participants.length;
        }

        let userRole: string | null = null;
        if (isTeam) {
          const userEmail = (user?.email || "").toLowerCase().trim();
          const userName = (user?.name || "").toLowerCase().trim();

          const matchedParticipant = Array.isArray(registration.participants)
            ? registration.participants.find((p) => {
                const pEmail = (p.email || "").toLowerCase().trim();
                const pName = (p.fullName || "").toLowerCase().trim();
                return (userEmail && pEmail === userEmail) || (userName && pName === userName);
              })
            : null;

          if (matchedParticipant) {
            if (matchedParticipant.participantRole === "LEADER" || matchedParticipant.participantOrder === 1) {
              userRole = "Team Leader";
            } else {
              userRole = "Team Member";
            }
          } else {
            userRole = "Team Leader";
          }
        }

        // Registration ID (human-readable code e.g. XVT-2026-82CAAK or UUID fallback)
        const registrationId =
          (typeof registration.registrationId === "string" && registration.registrationId.trim()) ||
          (typeof registration.registration_id === "string" && registration.registration_id.trim()) ||
          (typeof registration.id === "string" && registration.id.trim()) ||
          null;

        // Payable Amount / Fee
        let payableAmount: number | null = null;
        if (typeof registration.payableAmount === "number") {
          payableAmount = registration.payableAmount;
        } else if (typeof registration.event?.fee === "number") {
          payableAmount = registration.event.fee;
        }

        // Stage & Status resolution
        const rawStatus = (registration.status || registration.event?.status || "").toUpperCase().trim();
        let statusBadge = "REGISTERED";
        let stageDescription = "Registration active";
        let badgeStyle = {
          color: accent,
          borderColor: `${accent}55`,
          backgroundColor: `${accent}0d`,
        };

        switch (rawStatus) {
          case "CONFIRMED":
            statusBadge = "CONFIRMED";
            stageDescription = "Registration confirmed & verified";
            badgeStyle = {
              color: "#34d399",
              borderColor: "rgba(52, 211, 153, 0.4)",
              backgroundColor: "rgba(52, 211, 153, 0.1)",
            };
            break;
          case "PAYMENT_SUCCESS":
            statusBadge = "PAYMENT SUCCESS";
            stageDescription = "Payment successful · processing confirmation";
            badgeStyle = {
              color: "#34d399",
              borderColor: "rgba(52, 211, 153, 0.4)",
              backgroundColor: "rgba(52, 211, 153, 0.1)",
            };
            break;
          case "PAYMENT_PENDING":
            statusBadge = "PAYMENT PENDING";
            stageDescription = "Registration submitted · fee payment pending";
            badgeStyle = {
              color: "#fbbf24",
              borderColor: "rgba(251, 191, 36, 0.4)",
              backgroundColor: "rgba(251, 191, 36, 0.1)",
            };
            break;
          case "DRAFT":
            statusBadge = "DRAFT INITIATED";
            stageDescription = isTeam ? "Draft initiated · team / details in progress" : "Draft initiated · details in progress";
            badgeStyle = {
              color: "#60a5fa",
              borderColor: "rgba(96, 165, 250, 0.4)",
              backgroundColor: "rgba(96, 165, 250, 0.1)",
            };
            break;
          case "PAYMENT_FAILED":
            statusBadge = "PAYMENT FAILED";
            stageDescription = "Payment failed · retry required";
            badgeStyle = {
              color: "#f87171",
              borderColor: "rgba(248, 113, 113, 0.4)",
              backgroundColor: "rgba(248, 113, 113, 0.1)",
            };
            break;
          case "CANCELLED":
            statusBadge = "CANCELLED";
            stageDescription = "Registration cancelled";
            badgeStyle = {
              color: "#9ca3af",
              borderColor: "rgba(156, 163, 175, 0.4)",
              backgroundColor: "rgba(156, 163, 175, 0.1)",
            };
            break;
          default:
            if (rawStatus) {
              statusBadge = rawStatus.replaceAll("_", " ");
              stageDescription = `Registration stage: ${statusBadge.toLowerCase()}`;
            }
            break;
        }

        // Resolves official event slug for continuation routing across all 13 festival events
        const eventSlug =
          (staticEvent && staticEvent.id) ||
          (typeof registration.event?.slug === "string" && registration.event.slug.trim().toLowerCase()) ||
          (typeof registration.eventSlug === "string" && registration.eventSlug.trim().toLowerCase()) ||
          (typeof registration.event_slug === "string" && registration.event_slug.trim().toLowerCase()) ||
          (registration.eventId && UUID_TO_EVENT_SLUG[registration.eventId]) ||
          (registration.event_id && UUID_TO_EVENT_SLUG[registration.event_id]) ||
          (typeof registration.event?.id === "string" && UUID_TO_EVENT_SLUG[registration.event.id]) ||
          "";

        // Continuation route based on existing registration state (never public catalog)
        const href = buildRegistrationContinuationUrl(eventSlug, registrationId, rawStatus);

        const stableKey =
          registration.id ||
          `${registrationId || (staticEvent ? staticEvent.id : "event")}-${registration.createdAt || registration.created_at || list.length}`;

        list.push({
          id: stableKey,
          registrationId,
          name: eventName,
          track: trackName,
          date,
          venue,
          statusBadge,
          stageDescription,
          badgeStyle,
          accent,
          href,
          isTeam,
          teamName,
          teamSize,
          userRole,
          payableAmount,
        });
      } catch (err) {
        console.error("Failed to map registration for profile:", err, registration);
      }
    }

    return list;
  }, [registrations, user]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw && (!/^\d*$/.test(raw) || raw.length > 10)) {
      setPhone(raw);
      setPhoneError("Enter a valid 10-digit mobile number.");
      return;
    }
    setPhone(raw);
    if (!raw.trim()) setPhoneError(null);
    else if (raw.length === 10) setPhoneError(null);
    else if (phoneTouched) setPhoneError("Enter a valid 10-digit mobile number.");
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      setPhoneError("Enter a valid 10-digit mobile number.");
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneTouched(true);
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error);
      return;
    }
    setPhoneError(null);
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const trimmedPhone = phone.trim();
      const updated = await updateProfile({
        name: name.trim() || user?.name || "",
        phone: trimmedPhone,
        college_name: collegeName.trim(),
      });
      setPhone(updated.phone || trimmedPhone);
      setSuccessMessage("Your profile has been updated successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error: unknown) {
      setErrorMessage(
        normalizeErrorMessage(error, "Failed to update profile. Please try again.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } catch {
      setIsLoggingOut(false);
    }
  };

  if (loading || (!user && isAuthenticated)) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-[#05090b] p-4 pt-24">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-circuit/30 border-t-circuit" />
            Loading your profile...
          </div>
        </main>
      </>
    );
  }
  if (!user) return null;

  const inputClass = "h-12 w-full min-w-0 border border-white/10 bg-[#080e11]/90 px-3.5 font-space text-sm text-[#ece8de] placeholder:text-slate-600 outline-none transition-colors focus:border-circuit/70 focus:bg-[#0a1517] sm:px-4";
  const labelClass = "mb-2 block font-oxanium text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400";

  return (
    <>
      <Navbar />
      <main className="relative isolate min-h-screen overflow-hidden bg-[#05090b] px-4 pb-20 pt-24 text-[#ece8de] sm:px-6 lg:px-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-28 top-12 h-80 w-80 rounded-full bg-emerald-500/[0.07] blur-3xl" />
          <div className="absolute -left-32 top-[44rem] h-96 w-96 rounded-full bg-cyan-500/[0.045] blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(53,224,201,.55) 1px, transparent 1px), linear-gradient(to right, rgba(53,224,201,.55) 1px, transparent 1px)", backgroundSize: "36px 36px", maskImage: "linear-gradient(to bottom, black, transparent 78%)" }} />
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(#dce6ff 0.7px, transparent 0.7px)", backgroundSize: "73px 73px" }} />
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="mb-7 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <Link href="/" className="group inline-flex min-h-10 items-center gap-2 font-space text-sm text-slate-300 transition-colors hover:text-circuit">
              <span aria-hidden="true" className="text-circuit transition-transform group-hover:-translate-x-1">←</span>
              Back to Festival
            </Link>
            <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="min-h-10 border border-white/10 px-3 font-space text-xs text-slate-400 transition-colors hover:border-rose-300/40 hover:text-rose-200 disabled:opacity-50 sm:px-4">
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>

          <header className="relative mb-11 border-y border-white/10 py-6 sm:mb-14 sm:py-8">
            <span className="absolute left-0 top-0 h-3 w-3 -translate-x-px -translate-y-px border-l border-t border-circuit/80" aria-hidden="true" />
            <span className="absolute bottom-0 right-0 h-3 w-3 translate-x-px translate-y-px border-b border-r border-marigold/70" aria-hidden="true" />
            <div className="flex min-w-0 items-center gap-4 sm:gap-6">
              <div className="relative h-16 w-16 shrink-0 border border-circuit/50 bg-[#081114] p-1 sm:h-20 sm:w-20">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-sora text-2xl font-semibold text-circuit sm:text-3xl">{(user.name?.trim() || "P").charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h1 className="max-w-full break-words font-sora text-xl font-semibold tracking-tight text-white sm:text-3xl">{user.name || "Participant"}</h1>
                  <span className="inline-flex items-center gap-1.5 font-space text-[11px] text-cyan-200">
                    <span className="flex h-4 w-4 items-center justify-center border border-cyan-300/50 text-[9px]">✓</span> Google verified
                  </span>
                </div>
                <p className="break-all font-space text-sm text-slate-400">{user.email}</p>
                <span className="mt-3 inline-flex border border-marigold/30 bg-marigold/[0.06] px-2.5 py-1 font-oxanium text-[9px] font-bold uppercase tracking-[0.18em] text-marigold">Participant</span>
              </div>
            </div>
          </header>

          {(successMessage || errorMessage) && (
            <div role="status" className={`mb-8 border px-4 py-3 font-space text-sm ${errorMessage ? "border-rose-400/30 bg-rose-400/[0.05] text-rose-200" : "border-circuit/30 bg-circuit/[0.05] text-cyan-100"}`}>
              {errorMessage || successMessage}
            </div>
          )}

          <section aria-labelledby="personal-heading" className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
            <div>
              <p className="mb-2 font-oxanium text-[10px] font-bold uppercase tracking-[0.2em] text-marigold">01 / YOUR DETAILS</p>
              <h2 id="personal-heading" className="font-sora text-xl font-semibold text-white sm:text-2xl">Personal Information</h2>
              <p className="mt-2 max-w-xs font-space text-sm leading-6 text-slate-400">Keep your contact details current so event coordinators can reach you.</p>
            </div>

            <form onSubmit={handleProfileSave} className="relative border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <span className="absolute left-0 top-0 hidden h-3 w-3 border-l border-t border-circuit/60 lg:block" aria-hidden="true" />
              <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                <div className="min-w-0">
                  <label htmlFor="name" className={labelClass}>Full name</label>
                  <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className={inputClass} />
                </div>
                <div className="min-w-0">
                  <label htmlFor="email" className={labelClass}>Email address <span className="ml-1 normal-case tracking-normal text-cyan-300/80">Verified</span></label>
                  <input id="email" type="email" value={user.email} disabled className={`${inputClass} cursor-not-allowed border-white/[0.06] bg-white/[0.025] text-slate-400`} />
                </div>
                <div className="min-w-0">
                  <label htmlFor="phone" className={labelClass}>Contact number <span className="ml-1 normal-case tracking-normal text-slate-600">Optional · 10 digits</span></label>
                  <input id="phone" type="tel" inputMode="numeric" value={phone} onChange={handlePhoneChange} onKeyDown={handlePhoneKeyDown} onBlur={() => { setPhoneTouched(true); setPhoneError(validatePhoneNumber(phone).error); }} maxLength={10} placeholder="9876543210" aria-invalid={Boolean(phoneError)} aria-describedby={phoneError ? "phone-error" : undefined} className={`${inputClass} ${phoneError ? "border-rose-400/70 focus:border-rose-300" : ""}`} />
                  {phoneError && <p id="phone-error" className="mt-1.5 font-space text-xs text-rose-300">{phoneError}</p>}
                </div>
                <div className="min-w-0">
                  <label htmlFor="college" className={labelClass}>Institution <span className="ml-1 normal-case tracking-normal text-slate-600">Optional</span></label>
                  <input id="college" type="text" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} placeholder="School, college or university" className={inputClass} />
                </div>
              </div>
              <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center">
                <span className="font-space text-xs text-slate-500">Changes update your participant profile.</span>
                <button type="submit" disabled={isSaving} className="min-h-11 border border-circuit/60 bg-circuit px-5 font-space text-sm font-semibold text-[#04100f] transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60">
                  {isSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </section>

          <section aria-labelledby="events-heading" className="mt-16 sm:mt-20">
            <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 font-oxanium text-[10px] font-bold uppercase tracking-[0.2em] text-circuit">02 / YOUR FESTIVAL</p>
                <h2 id="events-heading" className="font-sora text-xl font-semibold text-white sm:text-2xl">My Events</h2>
              </div>
              {!registrationsLoading && participantEvents.length > 0 && (
                <p className="font-space text-xs text-slate-500">
                  {participantEvents.length} {participantEvents.length === 1 ? "event" : "events"} registered
                </p>
              )}
            </div>

            {registrationsLoading ? (
              <div className="border-y border-white/10 py-8 font-space text-sm text-slate-400">Loading your events…</div>
            ) : registrationsError ? (
              <div role="alert" className="border-y border-rose-300/20 py-6 font-space text-sm text-rose-200">
                {registrationsError}
              </div>
            ) : participantEvents.length === 0 ? (
              <div className="relative border-y border-white/10 py-8 pl-5 sm:py-10 sm:pl-7">
                <span className="absolute left-0 top-0 h-4 w-4 border-l border-t border-marigold/70" aria-hidden="true" />
                <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-circuit/70" aria-hidden="true" />
                <p className="font-sora text-lg font-medium text-white">No events registered yet</p>
                <p className="mt-2 max-w-lg font-space text-sm leading-6 text-slate-400">
                  Explore the festival events and find the ones you want to take part in.
                </p>
                <Link
                  href="/events"
                  className="mt-5 inline-flex min-h-10 items-center border border-marigold/50 px-4 font-oxanium text-[10px] font-bold uppercase tracking-[0.14em] text-marigold transition-colors hover:bg-marigold hover:text-[#11100b]"
                >
                  Explore Events <span className="ml-2" aria-hidden="true">→</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/10 border-y border-white/10">
                {participantEvents.map((registration) => (
                  <article key={registration.id} className="group relative py-5 transition-colors hover:bg-white/[0.02] sm:py-6">
                    <span
                      className="absolute bottom-5 left-0 top-5 w-[2px] opacity-80 sm:bottom-6 sm:top-6"
                      style={{ backgroundColor: registration.accent }}
                      aria-hidden="true"
                    />
                    <div className="flex min-w-0 flex-col gap-4 pl-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:pl-5">
                      <div className="min-w-0 flex-1">
                        {/* Title and Badges row */}
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 className="break-words font-sora text-base font-semibold text-white sm:text-lg">
                            {registration.name}
                          </h3>
                          <span
                            className="border px-2 py-0.5 font-oxanium text-[9px] font-bold uppercase tracking-wider"
                            style={registration.badgeStyle}
                          >
                            {registration.statusBadge}
                          </span>
                          {registration.registrationId && (
                            <span className="border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] text-slate-400">
                              {registration.registrationId}
                            </span>
                          )}
                          <span
                            className={`border px-2 py-0.5 font-oxanium text-[9px] font-bold uppercase tracking-wider ${
                              registration.isTeam
                                ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                                : "border-blue-500/30 bg-blue-500/10 text-blue-300"
                            }`}
                          >
                            {registration.isTeam ? "Team" : "Individual"}
                          </span>
                          {registration.userRole && (
                            <span className="border border-circuit/30 bg-circuit/10 px-2 py-0.5 font-oxanium text-[9px] font-bold uppercase tracking-wider text-circuit">
                              {registration.userRole}
                            </span>
                          )}
                        </div>

                        {/* Track and stage explanation */}
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <p className="font-space text-xs text-slate-400">{registration.track}</p>
                          <span className="hidden text-slate-600 sm:inline">·</span>
                          <p className="font-space text-xs text-slate-500">{registration.stageDescription}</p>
                        </div>

                        {/* Event Details Grid */}
                        <div className="mt-3 grid gap-x-6 gap-y-1 font-space text-xs text-slate-400 sm:grid-cols-2">
                          <p>
                            <span className="text-slate-600">Date </span>
                            {registration.date}
                          </p>
                          <p className="min-w-0 break-words">
                            <span className="text-slate-600">Venue </span>
                            {registration.venue}
                          </p>
                          {registration.isTeam && registration.teamName && (
                            <p className="min-w-0 break-words">
                              <span className="text-slate-600">Team Name </span>
                              <span className="text-slate-200">{registration.teamName}</span>
                              {registration.teamSize ? ` (${registration.teamSize} members)` : ""}
                            </p>
                          )}
                          {typeof registration.payableAmount === "number" && (
                            <p>
                              <span className="text-slate-600">Fee </span>
                              <span className="text-slate-200">
                                {registration.payableAmount > 0 ? `₹${registration.payableAmount}` : "Free"}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Button: View Event */}
                      <Link
                        href={registration.href}
                        className="inline-flex min-h-10 shrink-0 items-center justify-center self-start border border-white/15 px-4 font-oxanium text-[10px] font-bold uppercase tracking-[0.12em] text-slate-200 transition-colors hover:border-circuit/60 hover:text-circuit sm:self-center"
                      >
                        View Event <span className="ml-2" aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <footer className="mt-14 border-t border-white/[0.07] pt-4 font-oxanium text-[9px] uppercase tracking-[0.18em] text-slate-600">
            XaviTech 2026 <span className="mx-2 text-marigold/70">/</span> Participant Profile
          </footer>
        </div>
      </main>
    </>
  );
}
