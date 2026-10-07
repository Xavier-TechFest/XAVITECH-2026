"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Lock,
  LogIn,
  Loader2,
  Upload,
  UserCheck,
  Users,
} from "lucide-react";
import {
  EventItem,
  ParticipantFieldSpec,
  DocumentRequirement,
  isTeamNameRequired,
  getFormParticipantCount,
} from "@/lib/eventsData";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, CreatedRegistrationResponse } from "@/lib/api";

type ReviewEntry = { label: string; value: string };
type ParticipantReview = { title: string; entries: ReviewEntry[] };
type RegistrationReview = {
  team: ReviewEntry[];
  participants: ParticipantReview[];
  documents: { label: string; fileName: string }[];
  confirmations: string[];
};

export default function RegistrationForm({ event }: { event: EventItem }) {
  const config = event.registrationConfig;
  const { user, isAuthenticated, loginWithGoogle, getIdToken } = useAuth();

  // Form State
  const [teamSize, setTeamSize] = useState(config?.minTeamSize ?? 1);
  const [participantPool, setParticipantPool] = useState(
    config?.policy?.poolOptions?.[0]?.id ?? "School"
  );
  const [formDataState, setFormDataState] = useState<Record<string, string>>({});
  const [fileDataState, setFileDataState] = useState<Record<string, File>>({});
  
  // Navigation & Submission State
  const [step, setStep] = useState<"form" | "review" | "confirmed">("form");
  const [review, setReview] = useState<RegistrationReview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<CreatedRegistrationResponse | null>(null);

  // Validation State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorSummary, setErrorSummary] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const registrationClosed = isPastDeadline(config?.deadlineDate);

  // Pre-fill leader details (index 0) from authenticated user profile
  useEffect(() => {
    if (user && step === "form") {
      setFormDataState((prev) => {
        const next = { ...prev };
        if (!next["0-fullName"] && user.name) next["0-fullName"] = user.name;
        if (!next["0-email"] && user.email) next["0-email"] = user.email;
        if (!next["0-mobile"] && user.phone) next["0-mobile"] = user.phone;
        if (!next["0-college"] && user.collegeName) next["0-college"] = user.collegeName;
        return next;
      });
    }
  }, [user, step]);

  if (!config) {
    return (
      <main className="mx-auto min-h-[75vh] max-w-4xl px-5 pb-24 pt-28 sm:px-8">
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-white transition"
        >
          <ArrowLeft size={16} /> Back to event
        </Link>
        <div className="mt-8 rounded border border-white/10 bg-[#050b12]/90 p-6 sm:p-10">
          <p className="font-oxanium text-xs uppercase tracking-[.2em] text-cyan-300">
            {event.trackName}
          </p>
          <h1 className="mt-3 font-space text-3xl font-black uppercase text-white sm:text-5xl">
            {event.name}
          </h1>
          <p className="mt-5 text-slate-300">Registration details will be announced soon.</p>
          <p className="mt-6 rounded border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">
            Participation: TBA <span className="px-2 text-amber-100/40">·</span> Fee: TBA{" "}
            <span className="px-2 text-amber-100/40">·</span> Deadline: TBA
          </p>
        </div>
      </main>
    );
  }

  // Handle generic input change
  const handleInputChange = (key: string, value: string) => {
    setFormDataState((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setErrorSummary((prev) => prev.filter((item) => !item.startsWith(`${key}:`)));
    }
  };

  // Handle file input change
  const handleFileChange = (key: string, file: File | null) => {
    setFileDataState((prev) => {
      const next = { ...prev };
      if (file) {
        next[key] = file;
      } else {
        delete next[key];
      }
      return next;
    });
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setErrorSummary((prev) => prev.filter((item) => !item.startsWith(`${key}:`)));
    }
  };

  // Calculate fee and counts
  const feeTotal = getRegistrationTotal(event, config, participantPool, teamSize);
  const participantCount = getFormParticipantCount(event, teamSize);

  // Validate and proceed to Review
  const handleReviewStep = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);

    if (registrationClosed) {
      setApiError(`Registration is closed. Deadline: ${config.deadline}.`);
      return;
    }

    const errors: Record<string, string> = {};
    const summary: string[] = [];

    // 1. Team Fields Validation
    const teamNameRequired = isTeamNameRequired(event, teamSize);
    if (teamNameRequired && (config.eventFormat === "team" || teamSize > 1)) {
      const teamNameVal = (formDataState["teamName"] || "").trim();
      if (!teamNameVal) {
        errors["teamName"] = "Team name is required.";
        summary.push("Team Name: Team name is required.");
      } else if (teamNameVal.length < 2) {
        errors["teamName"] = "Team name must be at least 2 characters.";
        summary.push("Team Name: Team name must be at least 2 characters.");
      } else if (teamNameVal.length > 100) {
        errors["teamName"] = "Team name cannot exceed 100 characters.";
        summary.push("Team Name: Team name cannot exceed 100 characters.");
      }
    }

    // Additional team fields from config (e.g., proposedIdea)
    (config.teamFields ?? [])
      .filter((f) => f.id !== "teamName" && f.id !== "pool")
      .forEach((field) => {
        const val = formDataState[`team-${field.id}`] || "";
        if (field.required && !val.trim()) {
          errors[`team-${field.id}`] = `${field.label} is required.`;
          summary.push(`${field.label}: ${field.label} is required.`);
        }
      });

    // 2. Participant Fields Validation
    for (let index = 0; index < participantCount; index++) {
      const isLeader = index === 0;
      const isOptionalSub = config.maxTeamSize === 5 && index === 4;

      config.participantFields.forEach((field) => {
        const fieldKey = `${index}-${field.id}`;
        const val = (formDataState[fieldKey] || "").trim();
        const fileVal = fileDataState[fieldKey];

        // Custom requirement adjustments:
        // - Optional substitute (index 4) has optional fields unless filled
        // - If pool is School for Innocraft: skip year/course
        const isFieldApplicable =
          !(event.id === "innocraft" && participantPool === "School" && (field.id === "year" || field.id === "course")) &&
          !(event.id === "cipher-chase" && !isLeader && field.id === "profilePhoto") &&
          !(event.id === "hack-the-skill" && !isLeader && field.id === "year");

        if (!isFieldApplicable) return;

        const isRequired = isOptionalSub ? false : field.required;

        if (field.type === "file") {
          if (isRequired && !fileVal) {
            errors[fieldKey] = `Please select ${field.label.toLowerCase()}.`;
            summary.push(`Participant ${index + 1} (${field.label}): File upload is required.`);
          }
        } else {
          if (isRequired && !val) {
            errors[fieldKey] = `${field.label} is required.`;
            summary.push(`Participant ${index + 1} (${field.label}): Field is required.`);
          } else if (val) {
            // Type-specific validation
            if (field.type === "email") {
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
                errors[fieldKey] = "Enter a valid email address.";
                summary.push(`Participant ${index + 1} (Email): Invalid email format.`);
              }
            } else if (field.type === "tel") {
              const digits = val.replace(/\D/g, "");
              if (digits.length !== 10) {
                errors[fieldKey] = "Enter a valid 10-digit mobile number.";
                summary.push(`Participant ${index + 1} (Mobile): Must be exactly 10 digits.`);
              }
            } else if (field.type === "date") {
              if (Number.isNaN(Date.parse(val))) {
                errors[fieldKey] = "Enter a valid date.";
                summary.push(`Participant ${index + 1} (Date): Invalid date format.`);
              } else if (field.id === "birthDate" || config.policy?.minAge) {
                const minAge = config.policy?.minAge ?? 16;
                const bday = new Date(val);
                const today = new Date();
                let age = today.getFullYear() - bday.getFullYear();
                if (
                  today.getMonth() < bday.getMonth() ||
                  (today.getMonth() === bday.getMonth() && today.getDate() < bday.getDate())
                ) {
                  age--;
                }
                if (age <= minAge) {
                  errors[fieldKey] = `Participant must be over ${minAge} years old.`;
                  summary.push(`Participant ${index + 1} (Date of Birth): Must be over ${minAge} years old.`);
                }
              }
            }
          }
        }
      });

      // Special pool field for Innocraft
      if (event.id === "innocraft") {
        const poolFieldKey = `${index}-${participantPool === "School" ? "standard" : "year"}`;
        const poolVal = (formDataState[poolFieldKey] || "").trim();
        if (!poolVal) {
          errors[poolFieldKey] = `${participantPool === "School" ? "Class / Standard" : "Year / Semester"} is required.`;
          summary.push(`Participant ${index + 1}: Class/Year is required.`);
        }
      }
    }

    // 3. Same Institution Policy Check (e.g. Innocraft School Pool)
    if (config.policy?.sameInstitutionRequired && participantPool === "School") {
      const institutions = Array.from({ length: participantCount }, (_, i) =>
        (formDataState[`${i}-college`] || "").trim().toLowerCase()
      );
      if (institutions.some((inst) => !inst || inst !== institutions[0])) {
        errors["0-college"] = "All team participants must belong to the same school.";
        summary.push("Institution: All participants must enter the same school name.");
      }
    }

    // 4. Declarations Check
    const formElement = e.currentTarget;
    const requiredCheckboxes = formElement.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"][required]'
    );
    requiredCheckboxes.forEach((cb) => {
      if (!cb.checked) {
        summary.push("Please check all required confirmation statements.");
      }
    });

    if (summary.length > 0) {
      setFieldErrors(errors);
      setErrorSummary(summary);
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        requestAnimationFrame(() => {
          document.getElementById(firstErrorKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
      return;
    }

    // Clear errors and construct review summary
    setFieldErrors({});
    setErrorSummary([]);

    // Construct Team entries
    const teamEntries: ReviewEntry[] = [];
    if (config.eventFormat === "team" || teamSize > 1) {
      if (formDataState["teamName"]) {
        teamEntries.push({ label: "Team Name", value: formDataState["teamName"] });
      }
      teamEntries.push({ label: "Team Size", value: `${teamSize} participant(s)` });
      if (config.policy?.poolOptions) {
        teamEntries.push({ label: "Participant Category", value: participantPool });
      }
      (config.teamFields ?? [])
        .filter((f) => f.id !== "teamName" && f.id !== "pool")
        .forEach((f) => {
          if (formDataState[`team-${f.id}`]) {
            teamEntries.push({ label: f.label, value: formDataState[`team-${f.id}`] });
          }
        });
    }

    // Construct Participant entries
    const participantReviews: ParticipantReview[] = [];
    for (let index = 0; index < participantCount; index++) {
      const isLeader = index === 0;
      const title =
        config.eventFormat === "team"
          ? isLeader
            ? "Team Leader"
            : config.maxTeamSize === 5 && index === 4
            ? "Optional Substitute (P5)"
            : `Team Member ${index + 1}`
          : "Your Details";

      const entries: ReviewEntry[] = [];
      config.participantFields.forEach((field) => {
        if (field.type !== "file") {
          const val = formDataState[`${index}-${field.id}`];
          if (val) {
            const label =
              field.id === "college"
                ? participantPool === "School"
                  ? "School Name"
                  : "Institution Name"
                : field.label;
            entries.push({ label, value: val });
          }
        }
      });

      if (event.id === "innocraft") {
        const poolVal = formDataState[`${index}-${participantPool === "School" ? "standard" : "year"}`];
        if (poolVal) {
          entries.push({
            label: participantPool === "School" ? "Class / Standard" : "Year / Semester",
            value: poolVal,
          });
        }
      }

      participantReviews.push({ title, entries });
    }

    // Documents summary
    const docEntries: { label: string; fileName: string }[] = [];
    Object.entries(fileDataState).forEach(([key, file]) => {
      const [indexStr, fieldId] = key.split("-");
      const pIdx = Number(indexStr);
      const docLabel =
        config.participantFields.find((f) => f.id === fieldId)?.label ||
        `Participant ${pIdx + 1} Document`;
      docEntries.push({
        label: `Participant ${pIdx + 1} · ${docLabel}`,
        fileName: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      });
    });

    const confirmations = [
      ...(config.declarations ?? []),
      ...(config.customDeclaration && (config.eventFormat === "team" ? teamSize > 1 : true)
        ? [config.customDeclaration]
        : []),
    ];

    setReview({
      team: teamEntries,
      participants: participantReviews,
      documents: docEntries,
      confirmations,
    });

    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Submit to Backend API
  const handleFinalSubmit = async () => {
    setApiError(null);

    if (!isAuthenticated) {
      try {
        await loginWithGoogle();
      } catch (err: any) {
        setApiError("Authentication cancelled or failed. Please sign in to submit your registration.");
        return;
      }
    }

    const token = await getIdToken();
    if (!token) {
      setApiError("Authentication session expired. Please sign in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      let createdTeamId: string | undefined = undefined;

      // 1. If Team Event and Team Name entered, create team record first
      const isTeam = config.eventFormat === "team" || teamSize > 1;
      const teamName = (formDataState["teamName"] || "").trim();

      if (isTeam && teamName) {
        try {
          const teamRes = await api.createTeam(token, {
            eventId: event.id,
            teamName,
          });
          createdTeamId = teamRes.team.id;

          // Add secondary members to team
          for (let i = 1; i < participantCount; i++) {
            const memberName = (formDataState[`${i}-fullName`] || `Member ${i + 1}`).trim();
            if (memberName) {
              await api.addTeamMember(token, createdTeamId, { name: memberName });
            }
          }
        } catch (teamErr: any) {
          // If team already created by leader, retrieve and link existing team
          if (teamErr.status === 409 && teamErr.data?.existingTeamId) {
            createdTeamId = teamErr.data.existingTeamId;
          } else {
            throw teamErr;
          }
        }
      }

      // 2. Prepare normalized participants array
      const participantsPayload = Array.from({ length: participantCount }, (_, index) => {
        const isLeader = index === 0;
        const fullName =
          (formDataState[`${index}-fullName`] || (isLeader ? user?.name : "") || `Participant ${index + 1}`).trim();
        const institutionName =
          (formDataState[`${index}-college`] || (isLeader ? user?.collegeName : "") || "").trim();
        const mobileNumber =
          (formDataState[`${index}-mobile`] || (isLeader ? user?.phone : "") || "").trim();
        const email =
          (formDataState[`${index}-email`] || (isLeader ? user?.email : "") || "").trim();
        const city = (formDataState[`${index}-city`] || "").trim();
        const studentId = (formDataState[`${index}-studentId`] || "").trim();
        const standardClass =
          (formDataState[`${index}-${participantPool === "School" ? "standard" : "year"}`] ||
            formDataState[`${index}-year`] ||
            formDataState[`${index}-course`] ||
            "").trim();

        // Extra custom fields
        const extraFields: Record<string, any> = {};
        config.participantFields.forEach((field) => {
          if (!["fullName", "college", "mobile", "email", "city", "studentId", "year"].includes(field.id)) {
            const val = formDataState[`${index}-${field.id}`];
            if (val) extraFields[field.id] = val;
          }
        });

        if (event.id === "innocraft") {
          extraFields["pool"] = participantPool;
        }

        return {
          fullName,
          institutionName,
          mobileNumber,
          email,
          city,
          studentId,
          standardClass,
          ...extraFields,
        };
      });

      // 3. Create Draft Registration on Backend
      const registrationRes = await api.createRegistration(token, {
        eventId: event.id,
        registrationType: isTeam ? "TEAM" : "INDIVIDUAL",
        teamId: createdTeamId,
        participants: participantsPayload,
      });

      setSubmitResult(registrationRes);
      setStep("confirmed");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Registration submission failed:", err);
      if (err.status === 409) {
        setApiError(
          err.message ||
            "You already have an active registration for this event. View your registrations on your Profile page."
        );
      } else {
        setApiError(
          err.message || "An unexpected error occurred while creating your registration. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 pb-28 pt-28 sm:px-8">
      {/* Top back navigation */}
      <Link
        href={`/events/${event.id}`}
        className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-white transition"
      >
        <ArrowLeft size={16} /> Back to event details
      </Link>

      <div className="mt-7 overflow-hidden rounded border border-white/10 bg-[#050b12]/95 shadow-2xl backdrop-blur-md">
        {/* Event Header Banner */}
        <div className="relative border-b border-white/10 px-6 py-7 sm:px-9">
          <img
            src={event.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050b12] via-[#050b12]/90 to-[#050b12]/70" />
          <div className="relative">
            <p className="font-oxanium text-xs uppercase tracking-[.2em] text-cyan-300">
              XAVITECH 2026 · {event.trackName} · Registration
            </p>
            <h1 className="mt-3 font-space text-3xl font-black uppercase text-white sm:text-5xl">
              {event.name}
            </h1>
            <p className="mt-3 text-sm text-slate-300">
              {config.eventFormat === "team"
                ? `Team registration · ${config.minTeamSize}${
                    config.maxTeamSize !== config.minTeamSize ? `–${config.maxTeamSize}` : ""
                  } participants`
                : "Individual registration"}
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {apiError && (
          <div className="m-6 rounded border border-rose-400/40 bg-rose-400/10 p-4 text-sm text-rose-100 flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-rose-400" size={18} />
            <div className="flex-1">
              <p className="font-semibold">Registration Notice</p>
              <p className="mt-1 text-slate-200">{apiError}</p>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 1: DYNAMIC REGISTRATION FORM                                    */}
        {/* ==================================================================== */}
        {step === "form" && (
          <form noValidate onSubmit={handleReviewStep} className="space-y-8 p-6 sm:p-9">
            {/* Validation Error Summary */}
            {errorSummary.length > 0 && (
              <div
                role="alert"
                aria-live="assertive"
                className="rounded border border-rose-400/40 bg-rose-400/10 p-4 text-sm text-rose-100"
              >
                <p className="font-semibold flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-400" />
                  Please resolve the following items before continuing:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-rose-200">
                  {errorSummary.map((error, idx) => (
                    <li key={`${idx}-${error}`}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Authentication Notice Banner */}
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded border border-cyan-300/30 bg-cyan-950/20 p-4 text-sm">
                <div className="flex items-center gap-3">
                  <Lock className="text-cyan-300 shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-white">Google Sign-In Recommended</p>
                    <p className="text-xs text-slate-400">
                      Sign in now with Google to automatically populate your participant details.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="inline-flex shrink-0 items-center gap-2 rounded bg-cyan-300 px-4 py-2 font-oxanium text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-cyan-200 transition"
                >
                  <LogIn size={14} /> Sign In with Google
                </button>
              </div>
            )}

            {/* Eligibility & Event Rules info */}
            {event.eligibility?.length ? (
              <section className="rounded border border-cyan-300/20 bg-cyan-300/[.03] p-5">
                <Heading
                  title="Eligibility"
                  note="Please confirm that you meet these requirements before registering."
                />
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
                  {event.eligibility.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {registrationClosed && (
              <div
                role="status"
                className="rounded border border-amber-300/30 bg-amber-300/5 p-4 text-sm text-amber-100"
              >
                Registration for this event is closed. Cutoff date: {config.deadline}.
              </div>
            )}

            {/* Fee & Deadline Summaries */}
            <div className="grid gap-3 sm:grid-cols-3">
              <Summary
                label="Registration Fee"
                value={
                  event.id === "innocraft"
                    ? participantPool === "School"
                      ? "₹800 per school team"
                      : "₹1,000 per college team"
                    : event.id === "loot-goblins"
                    ? `₹${(config.feeAmount ?? 200) * teamSize} (${teamSize} players × ₹${
                        config.feeAmount ?? 200
                      })`
                    : config.feeDisplay
                }
              />
              <Summary label="Registration Deadline" value={config.deadline} />
              <Summary label="Event Date" value={event.date} />
            </div>

            {/* Team Configuration Section */}
            {(config.eventFormat === "team" || (config.minTeamSize ?? 1) > 1) && (
              <section className="space-y-5 rounded border border-white/10 bg-white/[.02] p-5">
                <Heading
                  title="Team Details"
                  note={
                    config.policy?.joinByInviteAfterCreation
                      ? "The team leader completes this initial form. Additional members join via team link."
                      : "The team leader registers the team and enters all participant details."
                  }
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Team Size Selector */}
                  <div>
                    <label
                      htmlFor="team-size"
                      className="mb-2 block text-sm font-medium text-slate-200"
                    >
                      Team Size <span className="text-rose-300">*</span>
                    </label>
                    {config.minTeamSize === config.maxTeamSize ? (
                      <p
                        id="team-size"
                        className="w-full rounded-sm border border-white/10 bg-[#03080e] px-3 py-3 text-sm text-slate-300"
                      >
                        {config.minTeamSize} participants (fixed)
                      </p>
                    ) : (
                      <select
                        id="team-size"
                        value={teamSize}
                        onChange={(e) => setTeamSize(Number(e.target.value))}
                        className="w-full rounded-sm border border-white/15 bg-[#03080e] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300 transition"
                      >
                        {Array.from(
                          {
                            length:
                              (config.maxTeamSize ?? config.minTeamSize ?? 1) -
                              (config.minTeamSize ?? 1) +
                              1,
                          },
                          (_, i) => (config.minTeamSize ?? 1) + i
                        ).map((n) => (
                          <option key={n} value={n}>
                            {n === 1
                              ? "Individual (1 participant)"
                              : config.maxTeamSize === 5 && n === 5
                              ? "5 participants (includes substitute)"
                              : `${n} participants`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Pool Selector (School vs College) */}
                  {config.policy?.poolOptions && (
                    <div>
                      <label
                        htmlFor="pool-select"
                        className="mb-2 block text-sm font-medium text-slate-200"
                      >
                        Participant Category <span className="text-rose-300">*</span>
                      </label>
                      <select
                        id="pool-select"
                        value={participantPool}
                        onChange={(e) => setParticipantPool(e.target.value)}
                        className="w-full rounded-sm border border-white/15 bg-[#03080e] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300 transition"
                      >
                        {config.policy.poolOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label} ({opt.feeDisplay})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Team Name */}
                  {isTeamNameRequired(event, teamSize) && (
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="teamName"
                        className="mb-2 block text-sm font-medium text-slate-200"
                      >
                        Team Name <span className="text-rose-300">*</span>
                      </label>
                      <input
                        id="teamName"
                        type="text"
                        required
                        placeholder="Enter your official team name"
                        value={formDataState["teamName"] || ""}
                        onChange={(e) => handleInputChange("teamName", e.target.value)}
                        className={`w-full rounded-sm border bg-[#03080e] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300 transition ${
                          fieldErrors["teamName"] ? "border-rose-400" : "border-white/15"
                        }`}
                      />
                      {fieldErrors["teamName"] && (
                        <p className="mt-1 text-xs text-rose-300">{fieldErrors["teamName"]}</p>
                      )}
                    </div>
                  )}

                  {/* Any custom team fields (e.g. proposedIdea) */}
                  {(config.teamFields ?? [])
                    .filter((f) => f.id !== "teamName" && f.id !== "pool")
                    .map((f) => (
                      <div key={f.id} className="sm:col-span-2">
                        <label
                          htmlFor={`team-${f.id}`}
                          className="mb-2 block text-sm font-medium text-slate-200"
                        >
                          {f.label} {f.required && <span className="text-rose-300">*</span>}
                        </label>
                        {f.type === "textarea" ? (
                          <textarea
                            id={`team-${f.id}`}
                            placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}`}
                            value={formDataState[`team-${f.id}`] || ""}
                            onChange={(e) => handleInputChange(`team-${f.id}`, e.target.value)}
                            className="w-full min-h-24 rounded-sm border border-white/15 bg-[#03080e] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300 transition"
                          />
                        ) : (
                          <input
                            id={`team-${f.id}`}
                            type={f.type || "text"}
                            placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}`}
                            value={formDataState[`team-${f.id}`] || ""}
                            onChange={(e) => handleInputChange(`team-${f.id}`, e.target.value)}
                            className="w-full rounded-sm border border-white/15 bg-[#03080e] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300 transition"
                          />
                        )}
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Dynamic Participant Sections */}
            {Array.from({ length: participantCount }, (_, index) => {
              const isLeader = index === 0;
              const isOptionalSub = config.maxTeamSize === 5 && index === 4;
              const title =
                config.eventFormat === "team" || teamSize > 1
                  ? isLeader
                    ? "Participant 1 — Team Leader"
                    : isOptionalSub
                    ? "Participant 5 — Optional Substitute"
                    : `Participant ${index + 1} — Team Member`
                  : "Your Participant Details";

              const note =
                isLeader && isAuthenticated
                  ? "Pre-filled with your verified Google account profile. You can update any fields."
                  : isOptionalSub
                  ? "Optional 5th player. Leave blank if your team has no substitute."
                  : "Fields marked * are mandatory.";

              return (
                <section
                  key={index}
                  className="space-y-5 rounded border border-white/10 bg-white/[.02] p-5 pt-6"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <Heading title={title} note={note} />
                    {isLeader && (
                      <span className="flex items-center gap-1.5 rounded border border-cyan-400/30 bg-cyan-950/40 px-2.5 py-1 text-[11px] font-oxanium uppercase tracking-wider text-cyan-300">
                        <UserCheck size={12} /> Leader
                      </span>
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {config.participantFields
                      .filter(
                        (f) =>
                          !(
                            event.id === "innocraft" &&
                            participantPool === "School" &&
                            (f.id === "year" || f.id === "course")
                          ) &&
                          !(event.id === "cipher-chase" && !isLeader && f.id === "profilePhoto") &&
                          !(event.id === "hack-the-skill" && !isLeader && f.id === "year")
                      )
                      .map((field) => {
                        const fieldKey = `${index}-${field.id}`;
                        const customLabel =
                          field.id === "college"
                            ? participantPool === "School"
                              ? "School Name"
                              : "Institution Name"
                            : isOptionalSub
                            ? `${field.label} (Optional)`
                            : field.label;

                        return (
                          <DynamicFieldRenderer
                            key={fieldKey}
                            fieldKey={fieldKey}
                            field={field}
                            displayLabel={customLabel}
                            value={formDataState[fieldKey] || ""}
                            fileValue={fileDataState[fieldKey]}
                            error={fieldErrors[fieldKey]}
                            onTextChange={(val) => handleInputChange(fieldKey, val)}
                            onFileChange={(f) => handleFileChange(fieldKey, f)}
                            minAge={config.policy?.minAge}
                          />
                        );
                      })}

                    {/* School / College class selector for Innocraft */}
                    {event.id === "innocraft" && (
                      <div className="sm:col-span-1">
                        <label
                          htmlFor={`${index}-class-select`}
                          className="mb-2 block text-sm font-medium text-slate-200"
                        >
                          {participantPool === "School" ? "Standard / Class" : "Year / Semester"}{" "}
                          <span className="text-rose-300">*</span>
                        </label>
                        {participantPool === "School" ? (
                          <select
                            id={`${index}-class-select`}
                            value={formDataState[`${index}-standard`] || ""}
                            onChange={(e) => handleInputChange(`${index}-standard`, e.target.value)}
                            className="w-full rounded-sm border border-white/15 bg-[#03080e] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300 transition"
                          >
                            <option value="">Select standard / class</option>
                            <option value="Class 9">Class 9</option>
                            <option value="Class 10">Class 10</option>
                            <option value="Class 11">Class 11</option>
                            <option value="Class 12">Class 12</option>
                          </select>
                        ) : (
                          <input
                            id={`${index}-class-select`}
                            type="text"
                            placeholder="e.g. 2nd Year / 4th Semester"
                            value={formDataState[`${index}-year`] || ""}
                            onChange={(e) => handleInputChange(`${index}-year`, e.target.value)}
                            className="w-full rounded-sm border border-white/15 bg-[#03080e] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300 transition"
                          />
                        )}
                        {fieldErrors[`${index}-${participantPool === "School" ? "standard" : "year"}`] && (
                          <p className="mt-1 text-xs text-rose-300">
                            {fieldErrors[`${index}-${participantPool === "School" ? "standard" : "year"}`]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}

            {/* Declarations and Terms */}
            {config.declarations && (
              <section className="space-y-4 rounded border border-white/10 bg-white/[.02] p-5">
                <Heading
                  title="Confirmations & Declarations"
                  note="Review and confirm each statement before proceeding to review."
                />
                {config.declarations.map((dec, idx) => (
                  <label key={idx} className="flex items-start gap-3 text-sm text-slate-300 cursor-pointer">
                    <input
                      required
                      type="checkbox"
                      className="mt-1 accent-cyan-300 h-4 w-4 cursor-pointer"
                    />
                    <span className="leading-relaxed">{dec}</span>
                  </label>
                ))}
                {config.customDeclaration && (
                  <label className="flex items-start gap-3 rounded border border-cyan-300/30 bg-cyan-950/20 p-4 text-sm text-slate-200 cursor-pointer">
                    <input
                      required
                      type="checkbox"
                      className="mt-1 accent-cyan-300 h-4 w-4 cursor-pointer"
                    />
                    <span className="leading-relaxed">{config.customDeclaration}</span>
                  </label>
                )}
              </section>
            )}

            {/* Bottom Form Actions */}
            <div className="border-t border-white/10 pt-6">
              <button
                type="submit"
                disabled={registrationClosed}
                className="flex w-full items-center justify-center gap-2 bg-cyan-300 px-6 py-4 font-oxanium text-sm font-bold uppercase tracking-widest text-slate-950 hover:bg-cyan-200 transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {registrationClosed ? "Registration Closed" : "Review Details & Continue"}
                {!registrationClosed && <ArrowRight size={16} />}
              </button>
              <p className="mt-3 text-xs text-slate-500">
                You will review all details in the next step before creating the registration.
              </p>
            </div>
          </form>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: REVIEW BEFORE SUBMISSION                                     */}
        {/* ==================================================================== */}
        {step === "review" && review && (
          <section className="space-y-8 p-6 sm:p-9" aria-labelledby="review-heading">
            <StepIndicator step="review" />

            <div>
              <h2 id="review-heading" className="font-space text-2xl font-bold text-white">
                Review Your Registration Details
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Please verify all entered information before submitting. Click "Edit Details" if you need to make changes.
              </p>
            </div>

            {/* Team summary card */}
            {review.team.length > 0 && <ReviewBlock title="Team Overview" entries={review.team} />}

            {/* Participant summary cards */}
            {review.participants.map((part, idx) => (
              <ReviewBlock key={idx} title={part.title} entries={part.entries} />
            ))}

            {/* Uploaded Documents summary */}
            {review.documents.length > 0 && (
              <ReviewBlock
                title="Attached Documents"
                entries={review.documents.map((d) => ({
                  label: d.label,
                  value: d.fileName,
                }))}
              />
            )}

            {/* Confirmations */}
            <ReviewBlock
              title="Signed Declarations"
              entries={review.confirmations.map((c) => ({
                label: "Status",
                value: `Confirmed: "${c}"`,
              }))}
            />

            {/* Bill summary */}
            <BillSummary
              event={event}
              total={feeTotal}
              people={participantCount}
              feeLabel={
                event.id === "innocraft"
                  ? participantPool === "School"
                    ? "₹800 per school team"
                    : "₹1,000 per college team"
                  : config.feeDisplay
              }
            />

            {/* Auth CTA if not logged in */}
            {!isAuthenticated && (
              <div className="rounded border border-amber-300/30 bg-amber-950/20 p-5 text-sm">
                <p className="font-semibold text-amber-200">Google Authentication Required</p>
                <p className="mt-1 text-slate-300">
                  Please sign in with your Google account before submitting your registration.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded border border-white/15 px-6 py-4 font-oxanium text-sm font-bold uppercase tracking-widest text-white hover:border-cyan-300 hover:text-cyan-200 transition"
              >
                <ArrowLeft size={16} /> Edit Details
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-cyan-300 px-6 py-4 font-oxanium text-sm font-bold uppercase tracking-widest text-slate-950 hover:bg-cyan-200 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Submitting Registration...
                  </>
                ) : !isAuthenticated ? (
                  <>
                    <LogIn size={16} /> Sign In & Submit Registration
                  </>
                ) : (
                  <>
                    <Check size={16} /> Submit Registration
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* ==================================================================== */}
        {/* STEP 3: REGISTRATION CONFIRMED (DRAFT STATE)                         */}
        {/* ==================================================================== */}
        {step === "confirmed" && submitResult && (
          <section className="space-y-8 p-6 sm:p-10 text-center" aria-labelledby="confirmed-heading">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <p className="font-oxanium text-xs uppercase tracking-[.25em] text-cyan-300">
                Registration Received · {event.trackName}
              </p>
              <h2 id="confirmed-heading" className="mt-2 font-space text-3xl font-black uppercase text-white sm:text-4xl">
                Registration Created
              </h2>
              <p className="mt-3 text-sm text-slate-300 max-w-lg mx-auto">
                Your registration for <span className="font-bold text-white">{event.name}</span> has been
                successfully submitted.
              </p>
            </div>

            {/* Registration Code Badge */}
            <div className="mx-auto max-w-md rounded border border-white/15 bg-white/[.03] p-6 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-oxanium text-xs uppercase tracking-wider text-slate-400">
                  Registration Code
                </span>
                <span className="font-mono text-base font-bold text-cyan-300">
                  {submitResult.registrationId}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-oxanium text-xs uppercase tracking-wider text-slate-400">
                  Registration Status
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 text-xs font-semibold text-amber-200">
                  {submitResult.status || "DRAFT"} · PAYMENT PENDING
                </span>
              </div>

              {submitResult.team?.teamName && (
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-oxanium text-xs uppercase tracking-wider text-slate-400">
                    Team Name
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {submitResult.team.teamName}
                  </span>
                </div>
              )}

              <div className="pt-2 text-xs text-slate-400 leading-relaxed">
                <span className="text-amber-200 font-semibold">Payment Notice:</span> Official payment gateway
                integration will open prior to the event date. Your registration is securely reserved in Draft
                status.
              </div>
            </div>

            {/* Action Links */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/profile"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-cyan-300 px-6 py-3.5 font-oxanium text-xs font-bold uppercase tracking-widest text-slate-950 hover:bg-cyan-200 transition"
              >
                View My Profile & Registrations
              </Link>
              <Link
                href="/events"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded border border-white/20 px-6 py-3.5 font-oxanium text-xs font-bold uppercase tracking-widest text-white hover:border-cyan-300 hover:text-cyan-200 transition"
              >
                Browse Other Events
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

// ==============================================================================
// HELPER COMPONENTS
// ==============================================================================

const inputClass =
  "w-full rounded-sm border border-white/15 bg-[#03080e] px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-300";

function DynamicFieldRenderer({
  fieldKey,
  field,
  displayLabel,
  value,
  fileValue,
  error,
  onTextChange,
  onFileChange,
  minAge,
}: {
  fieldKey: string;
  field: ParticipantFieldSpec;
  displayLabel: string;
  value: string;
  fileValue?: File;
  error?: string;
  onTextChange: (val: string) => void;
  onFileChange: (file: File | null) => void;
  minAge?: number;
}) {
  const placeholder = field.placeholder || defaultPlaceholder(field, displayLabel);

  return (
    <div className={field.type === "textarea" ? "sm:col-span-2" : ""}>
      <label htmlFor={fieldKey} className="mb-2 block text-sm font-medium text-slate-200">
        {displayLabel} {field.required && <span className="text-rose-300">*</span>}
      </label>

      {field.type === "select" ? (
        <select
          id={fieldKey}
          value={value}
          required={field.required}
          onChange={(e) => onTextChange(e.target.value)}
          className={`${inputClass} ${error ? "border-rose-400" : ""}`}
        >
          <option value="">{placeholder}</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          id={fieldKey}
          required={field.required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onTextChange(e.target.value)}
          className={`${inputClass} min-h-24 ${error ? "border-rose-400" : ""}`}
        />
      ) : field.type === "file" ? (
        <FileInputField
          id={fieldKey}
          required={field.required}
          accept={field.accept}
          helpText={field.helpText}
          selectedFile={fileValue}
          onFileSelect={onFileChange}
          error={error}
        />
      ) : (
        <>
          <input
            id={fieldKey}
            type={field.type}
            required={field.required}
            placeholder={field.type === "date" ? undefined : placeholder}
            value={value}
            accept={field.accept}
            pattern={field.pattern}
            inputMode={field.type === "tel" ? "numeric" : undefined}
            maxLength={field.type === "tel" ? 10 : undefined}
            onChange={(e) => {
              if (field.type === "tel") {
                const numericOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                onTextChange(numericOnly);
              } else {
                onTextChange(e.target.value);
              }
            }}
            max={
              field.id === "birthDate" || minAge
                ? getEligibleMaxBirthDate(minAge ?? 16)
                : undefined
            }
            className={`${inputClass} ${field.type === "date" ? "[color-scheme:dark]" : ""} ${
              error ? "border-rose-400" : ""
            }`}
          />
          {field.helpText && <p className="mt-1.5 text-xs text-slate-500">{field.helpText}</p>}
          {field.type === "date" && !field.helpText && (
            <p className="mt-1.5 text-xs text-slate-500">Select date from calendar.</p>
          )}
        </>
      )}

      {error && field.type !== "file" && (
        <p role="alert" className="mt-1.5 text-xs text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

function FileInputField({
  id,
  required,
  accept,
  helpText,
  selectedFile,
  onFileSelect,
  error,
}: {
  id: string;
  required: boolean;
  accept?: string;
  helpText?: string;
  selectedFile?: File;
  onFileSelect: (file: File | null) => void;
  error?: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleClear = () => {
    onFileSelect(null);
  };

  return (
    <div className="space-y-3">
      <input
        id={id}
        type="file"
        required={required && !selectedFile}
        accept={accept}
        onChange={handleChange}
        className="block w-full cursor-pointer rounded-sm border border-white/15 bg-[#03080e] p-2 text-sm text-slate-300 file:mr-3 file:border-0 file:bg-cyan-300 file:px-3 file:py-1.5 file:font-oxanium file:text-xs file:font-bold file:uppercase file:text-slate-950 hover:file:bg-cyan-200 transition"
      />

      {previewUrl && (
        <div className="relative inline-flex flex-col gap-2 rounded border border-cyan-400/40 bg-cyan-950/20 p-3">
          <p className="font-oxanium text-[10px] uppercase tracking-widest text-cyan-300">
            Preview
          </p>
          <div className="relative h-28 w-28 overflow-hidden rounded border border-white/10 bg-black">
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <div className="flex items-center justify-between gap-3 text-xs text-slate-300">
            <span className="truncate max-w-[120px] font-mono text-[11px]">
              {selectedFile?.name}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-rose-400 hover:text-rose-300 font-bold text-[11px] uppercase tracking-wider"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {!previewUrl && selectedFile && (
        <div className="flex items-center justify-between rounded border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
          <span className="font-mono truncate">
            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="text-rose-400 hover:text-rose-300 font-bold text-[11px] uppercase tracking-wider ml-2"
          >
            Remove
          </button>
        </div>
      )}

      {helpText && <p className="mt-1 text-xs text-slate-500">{helpText}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

function Heading({ title, note }: { title: string; note: string }) {
  return (
    <div>
      <h2 className="font-space text-lg font-bold text-white">{title}</h2>
      <p className="mt-1 text-xs text-slate-400">{note}</p>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-white/10 bg-white/[.03] p-3">
      <p className="font-oxanium text-[10px] uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function StepIndicator({ step }: { step: "review" | "confirmed" }) {
  return (
    <div className="flex items-center gap-3 text-xs font-oxanium uppercase tracking-widest">
      <span className="flex items-center gap-2 text-cyan-200">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-300 text-slate-950 font-bold">
          1
        </span>
        Form
      </span>
      <span className="h-px w-8 bg-white/20" />
      <span className={`flex items-center gap-2 ${step === "review" ? "text-cyan-200 font-bold" : "text-slate-400"}`}>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full border ${
            step === "review"
              ? "border-cyan-300 bg-cyan-400/10 text-cyan-200"
              : "border-white/20 text-slate-500"
          }`}
        >
          2
        </span>
        Review
      </span>
      <span className="h-px w-8 bg-white/20" />
      <span className={`flex items-center gap-2 ${step === "confirmed" ? "text-cyan-200 font-bold" : "text-slate-500"}`}>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full border ${
            step === "confirmed"
              ? "border-cyan-300 bg-cyan-400/10 text-cyan-200"
              : "border-white/20 text-slate-500"
          }`}
        >
          3
        </span>
        Confirmed
      </span>
    </div>
  );
}

function ReviewBlock({ title, entries }: { title: string; entries: ReviewEntry[] }) {
  return (
    <section className="overflow-hidden rounded border border-white/10">
      <h3 className="border-b border-white/10 bg-white/[.03] px-4 py-3 font-space text-sm font-semibold text-white">
        {title}
      </h3>
      <dl className="divide-y divide-white/5">
        {entries.map((entry, idx) => (
          <div
            key={`${entry.label}-${idx}`}
            className="grid gap-1 px-4 py-2.5 sm:grid-cols-[minmax(10rem,.7fr)_1.3fr] sm:gap-4"
          >
            <dt className="text-xs text-slate-400">{entry.label}</dt>
            <dd className="break-words text-sm text-slate-100">{entry.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function BillSummary({
  event,
  total,
  people,
  feeLabel,
}: {
  event: EventItem;
  total: number | null;
  people: number;
  feeLabel: string;
}) {
  return (
    <section className="rounded border border-cyan-300/25 bg-cyan-300/[.04] p-5">
      <h3 className="font-space text-base font-bold text-white">Registration Fee Summary</h3>
      <div className="mt-3 space-y-2.5 text-sm">
        <div className="flex justify-between gap-4 text-slate-300 text-xs sm:text-sm">
          <span>
            {event.name} ({people} participant{people === 1 ? "" : "s"})
          </span>
          <span className="text-right text-white font-medium">{feeLabel}</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
          <span className="text-white font-semibold">Total Payable</span>
          <span className="font-space text-xl font-bold text-cyan-300">
            {total === null ? "To Be Announced" : `₹${total.toLocaleString("en-IN")}`}
          </span>
        </div>
        {total === null && (
          <p className="text-xs text-amber-200/80">
            The event fee amount is to be finalized prior to registration closure.
          </p>
        )}
      </div>
    </section>
  );
}

function defaultPlaceholder(field: ParticipantFieldSpec, label: string) {
  if (field.type === "email") return "name@example.com";
  if (field.type === "tel") return "10-digit mobile number";
  if (field.type === "date") return "Select date from calendar";
  if (field.type === "select") return `Select ${label.toLowerCase()}`;
  if (field.type === "file") return "Choose file to upload";
  return `Enter ${label.toLowerCase()}`;
}

function getRegistrationTotal(
  event: EventItem,
  config: NonNullable<EventItem["registrationConfig"]>,
  participantPool: string,
  teamSize: number
): number | null {
  if (event.id === "innocraft") return participantPool === "School" ? 800 : 1000;
  if (config.feeAmount === undefined) return null;
  if (config.feeBasis === "per_team") return config.feeAmount;
  if (config.feeBasis === "per_player" || config.feeBasis === "per_participant") {
    return config.feeAmount * teamSize;
  }
  const basis = config.feeDisplay.match(/per\s+(team|player|participant)/i)?.[1]?.toLowerCase();
  if (basis === "team") return config.feeAmount;
  if (basis === "player" || basis === "participant") return config.feeAmount * teamSize;
  return config.feeAmount;
}

function getEligibleMaxBirthDate(minAge: number) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - minAge);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function isPastDeadline(deadlineDate?: string): boolean {
  if (!deadlineDate) return false;
  return Date.now() >= new Date(`${deadlineDate}T23:59:59.999+05:30`).getTime();
}
