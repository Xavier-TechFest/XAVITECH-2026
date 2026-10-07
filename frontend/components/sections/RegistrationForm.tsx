"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { EventItem, ParticipantFieldSpec } from "@/lib/eventsData";

type ReviewEntry = { label: string; value: string };
type RegistrationReview = { team: ReviewEntry[]; participants: ReviewEntry[][]; confirmations: string[] };

export default function RegistrationForm({ event }: { event: EventItem }) {
  const config = event.registrationConfig;
  const [teamSize, setTeamSize] = useState(config?.minTeamSize ?? 1);
  const [participantPool, setParticipantPool] = useState("School");
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [step, setStep] = useState<"form" | "review" | "payment">("form");
  const [review, setReview] = useState<RegistrationReview | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorSummary, setErrorSummary] = useState<string[]>([]);
  const registrationClosed = isPastDeadline(config?.deadlineDate);
  if (!config) return <main className="mx-auto min-h-[75vh] max-w-4xl px-5 pb-24 pt-28 sm:px-8">
    <Link href={`/events/${event.id}`} className="inline-flex items-center gap-2 text-sm text-cyan-300"><ArrowLeft size={16}/>Back to event</Link>
    <div className="mt-8 rounded border border-white/10 bg-[#050b12]/90 p-6 sm:p-10"><p className="font-oxanium text-xs uppercase tracking-[.2em] text-cyan-300">{event.trackName}</p><h1 className="mt-3 font-space text-3xl font-black uppercase text-white sm:text-5xl">{event.name}</h1><p className="mt-5 text-slate-300">Registration details will be announced soon.</p><p className="mt-6 rounded border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">Participation: TBA <span className="px-2 text-amber-100/40">·</span> Fee: TBA <span className="px-2 text-amber-100/40">·</span> Deadline: TBA</p></div>
  </main>;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPastDeadline(config.deadlineDate)) {
      setMessageIsError(true);
      setMessage(`Registration is closed. Deadline: ${config.deadline}.`);
      return;
    }
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const errors: Record<string, string> = {};
    const summary: string[] = [];
    const validateField = (field: ParticipantFieldSpec, name: string, label = field.label) => {
      const error = validateRegistrationField(field, formData.get(name), label);
      if (error) {
        errors[name] = error;
        summary.push(`${label}: ${error}`);
      }
    };
    (config.teamFields ?? []).filter((field) => !["runtime-rush", "hack-the-skill", "battle-of-bots"].includes(event.id) || teamSize > 1).forEach((field) => validateField(field, `0-${field.id}`));
    const participantCount = event.id === "thoughtlab" ? Math.min(teamSize, 2) : event.id === "cipher-chase" ? Math.min(teamSize, 4) : teamSize;
    for (let index = 0; index < participantCount; index += 1) {
      config.participantFields.filter((field) => !(event.id === "innocraft" && (field.id === "year" || (participantPool === "School" && field.id === "course"))) && !(event.id === "cipher-chase" && index > 0 && field.id === "profilePhoto") && !(event.id === "hack-the-skill" && index > 0 && field.id === "year")).forEach((field) => {
        const validationField = event.id === "loot-goblins" && index === 4 ? { ...field, required: false } : event.id === "runtime-rush" && index === 1 && (field.id === "mobile" || field.id === "email") ? { ...field, required: false } : event.id === "cipher-chase" && index > 0 && (field.id === "mobile" || field.id === "email") ? { ...field, required: false } : field;
        validateField(validationField, `${index}-${field.id}`, event.id === "innocraft" && field.id === "college" ? participantPool === "School" ? "School name" : "Institution name" : field.label);
      });
      if (event.id === "innocraft") validateField(participantPool === "School" ? { id: "standard", label: "Standard / Class", type: "select", required: true, options: ["Class 9", "Class 10", "Class 11", "Class 12"] } : { id: "year", label: "Year / Semester", type: "text", required: true }, `${index}-${participantPool === "School" ? "standard" : "year"}`);
    }
    formElement.querySelectorAll<HTMLInputElement>('input[type="checkbox"][required]').forEach((checkbox) => {
      if (!checkbox.checked) summary.push(`Confirm this statement: ${checkbox.closest("label")?.innerText.trim() ?? "Required confirmation"}`);
    });
    if (errors["0-college"] === undefined && event.id === "innocraft" && participantPool === "School") {
      const schools = Array.from({ length: 4 }, (_, index) => String(formData.get(`${index}-college`) ?? "").trim().toLocaleLowerCase());
      if (schools.some((school) => !school || school !== schools[0])) {
        errors["0-college"] = "All four participants must enter the same school name.";
        summary.push("School name: All four participants must enter the same school name.");
      }
    }
    setFieldErrors(errors);
    setErrorSummary(summary);
    if (summary.length > 0) {
      setMessageIsError(true);
      setMessage("");
      const firstKey = Object.keys(errors)[0];
      if (firstKey) {
        const [index, ...fieldParts] = firstKey.split("-");
        const fieldId = fieldParts.join("-");
        requestAnimationFrame(() => document.getElementById(`${fieldId}-${index}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
      }
      return;
    }
    setErrorSummary([]);
    setFieldErrors({});
    if (event.id === "vlookup") {
      const today = new Date();
      const underAgeIndexes = Array.from({ length: config.maxTeamSize ?? 1 }, (_, index) => {
        const raw = String(formData.get(`${index}-birthDate`) ?? "");
        if (!raw) return -1;
        const [year, month, day] = raw.split("-").map(Number);
        const birthday = new Date(year, month - 1, day);
        let age = today.getFullYear() - birthday.getFullYear();
        if (today.getMonth() < birthday.getMonth() || (today.getMonth() === birthday.getMonth() && today.getDate() < birthday.getDate())) age -= 1;
        return age <= 16 ? index : -1;
      }).filter((index) => index >= 0);
      if (underAgeIndexes.length > 0) {
        const ageErrors = Object.fromEntries(underAgeIndexes.map((index) => [`${index}-birthDate`, "Participant must be over 16 years old."]));
        setFieldErrors(ageErrors);
        setErrorSummary(underAgeIndexes.map((index) => `Date of birth, participant ${index + 1}: Participant must be over 16 years old.`));
        setMessageIsError(true);
        setMessage("");
        requestAnimationFrame(() => document.getElementById(`birthDate-${underAgeIndexes[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
        return;
      }
    }
    const team = (config.teamFields ?? []).filter((field) => !["runtime-rush", "hack-the-skill", "battle-of-bots"].includes(event.id) || teamSize > 1).map((field) => ({ label: field.label, value: getReviewValue(formData.get(`0-${field.id}`)) })).filter((entry) => entry.value);
    const participants = Array.from({ length: participantCount }, (_, index) => config.participantFields.filter((field) => !(event.id === "innocraft" && (field.id === "year" || (participantPool === "School" && field.id === "course"))) && !(event.id === "cipher-chase" && index > 0 && field.id === "profilePhoto") && !(event.id === "hack-the-skill" && index > 0 && field.id === "year")).map((field) => ({ label: field.label, value: getReviewValue(formData.get(`${index}-${field.id}`)) })).filter((entry) => entry.value));
    const confirmations = [...(config.declarations ?? []), ...(config.customDeclaration && (event.id !== "hack-the-skill" && event.id !== "battle-of-bots" || teamSize > 1) ? [config.customDeclaration] : [])];
    setReview({ team, participants, confirmations });
    setMessageIsError(false);
    setMessage("");
    setStep("review");
  };

  const feeTotal = getRegistrationTotal(event, config, participantPool, teamSize);
  const registeredPeople = event.id === "thoughtlab" ? Math.min(teamSize, 2) : event.id === "cipher-chase" ? Math.min(teamSize, 4) : teamSize;

  return <main className="mx-auto min-h-screen max-w-4xl px-5 pb-28 pt-28 sm:px-8">
    <Link href={`/events/${event.id}`} className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-white"><ArrowLeft size={16}/>Back to event</Link>
    <div className="mt-7 overflow-hidden rounded border border-white/10 bg-[#050b12]/90">
      <div className="relative border-b border-white/10 px-6 py-7 sm:px-9"><img src={event.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20"/><div className="absolute inset-0 bg-gradient-to-r from-[#050b12] via-[#050b12]/90 to-[#050b12]/65"/><div className="relative"><p className="font-oxanium text-xs uppercase tracking-[.2em] text-cyan-300">XAVITECH 2026 · {event.trackName} · Registration</p><h1 className="mt-3 font-space text-3xl font-black uppercase text-white sm:text-5xl">{event.name}</h1><p className="mt-3 text-sm text-slate-300">{event.id === "runtime-rush" ? "Individual or team registration · 1–2 participants" : event.id === "hack-the-skill" ? "Individual or team registration · Teams of 2–4" : event.id === "battle-of-bots" ? "Individual or team registration · Teams of up to 3" : config.eventFormat === "team" ? `Team registration · ${config.minTeamSize}${config.maxTeamSize !== config.minTeamSize ? `–${config.maxTeamSize}` : ""} participants` : "Individual registration"}</p></div></div>
      <form noValidate onSubmit={handleSubmit} onChange={(event) => { const key = (event.target as HTMLInputElement).name; const oldError = fieldErrors[key]; if (key && oldError) { setFieldErrors((current) => { const next = { ...current }; delete next[key]; return next; }); setErrorSummary((current) => current.filter((item) => !item.endsWith(`: ${oldError}`))); } }} className={`${step === "form" ? "space-y-8 p-6 sm:p-9" : "hidden"}`}>
        {errorSummary.length > 0 && <div role="alert" aria-live="assertive" className="rounded border border-rose-400/40 bg-rose-400/10 p-4 text-sm text-rose-100"><p className="font-semibold">Please fix these items:</p><ul className="mt-2 list-disc space-y-1 pl-5">{errorSummary.map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}</ul></div>}
        {event.eligibility?.length ? <section className="rounded border border-cyan-300/20 bg-cyan-300/[.04] p-5"><Heading title="Eligibility" note="Please check that you meet these requirements before registering."/><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">{event.eligibility.map((item, index) => <li key={index}>{item}</li>)}</ul></section> : null}
        {registrationClosed && <div role="status" className="rounded border border-amber-300/30 bg-amber-300/5 p-4 text-sm text-amber-100">Registration closed. Deadline: {config.deadline}.</div>}
        {event.registrationInfo?.length ? <section className="rounded border border-white/10 p-5"><Heading title="Registration information" note="How registration works for this event."/><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">{event.registrationInfo.map((item, index) => <li key={index}>{item}</li>)}</ul></section> : null}
        {event.rules?.length ? <section className="rounded border border-amber-300/20 bg-amber-300/[.03] p-5"><Heading title="Event rules" note="Review these before continuing."/><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">{event.rules.map((item, index) => <li key={index}>{item}</li>)}</ul></section> : null}
        <div className="grid gap-3 sm:grid-cols-3"><Summary label="Registration Fee" value={event.id === "innocraft" ? participantPool === "School" ? "₹800 per school team" : "₹1,000 per college team" : event.id === "loot-goblins" ? `₹${(config.feeAmount ?? 0) * teamSize} (${teamSize} players × ₹${config.feeAmount ?? 0})` : config.feeDisplay}/><Summary label="Registration Deadline" value={config.deadline}/><Summary label="Event Date" value={event.date}/></div>
        {config.details?.committee && <div className="rounded border border-white/10 p-4"><p className="font-oxanium text-xs uppercase tracking-widest text-cyan-300">Committee</p><p className="mt-2 text-sm text-white">{config.details.committee}</p></div>}
        {config.details?.agenda && <div className="rounded border border-white/10 p-4"><p className="font-oxanium text-xs uppercase tracking-widest text-cyan-300">Agenda</p><p className="mt-2 text-sm leading-relaxed text-white">{config.details.agenda}</p></div>}
        {(config.details?.duration || config.details?.format) && <div className="rounded border border-white/10 p-4"><p className="font-oxanium text-xs uppercase tracking-widest text-cyan-300">Event format</p>{config.details.duration && <p className="mt-2 text-sm text-white">{config.details.duration}</p>}{config.details.format && <p className="mt-1 text-sm leading-relaxed text-slate-300">{config.details.format}</p>}</div>}
        {config.details?.note && <div className="rounded border border-white/10 p-4"><p className="font-oxanium text-xs uppercase tracking-widest text-cyan-300">Important information</p><p className="mt-2 text-sm leading-relaxed text-white">{config.details.note}</p></div>}
        {config.eventFormat === "team" && <section className="space-y-5"><Heading title={event.id === "circuit-of-minds" ? "Registration details" : event.id === "runtime-rush" || event.id === "hack-the-skill" || event.id === "battle-of-bots" ? "Participation details" : "Team details"} note={event.id === "circuit-of-minds" ? "One participant submits the registration and enters both participants." : event.id === "runtime-rush" ? "Choose individual participation or register with one teammate. Either participant may submit." : event.id === "hack-the-skill" ? "Choose individual registration or a team of 2–4. The team leader submits team registrations." : event.id === "battle-of-bots" ? "Choose individual registration or a team of up to three. The team leader enters every member." : "The team leader completes this registration."}/>
          <div className="max-w-sm">{config.minTeamSize === config.maxTeamSize ? <><p className="mb-2 text-sm font-medium text-slate-200">Number of participants</p><p id="team-size" className={`${inputClass} border-white/10 text-slate-300`}>{config.minTeamSize} participants</p></> : <><label htmlFor="team-size" className="mb-2 block text-sm font-medium text-slate-200">{event.id === "runtime-rush" || event.id === "hack-the-skill" || event.id === "battle-of-bots" ? "Participation type" : "Number of participants"} <span className="text-rose-300">*</span></label><select id="team-size" value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))} className={inputClass} aria-label="Number of participants">{Array.from({ length: (config.maxTeamSize ?? config.minTeamSize ?? 1) - (config.minTeamSize ?? 1) + 1 }, (_, i) => (config.minTeamSize ?? 1) + i).map((n) => <option key={n} value={n}>{event.id === "runtime-rush" ? n === 1 ? "Individual" : "With one teammate (2 participants)" : event.id === "hack-the-skill" ? n === 1 ? "Individual" : `Team of ${n}` : event.id === "battle-of-bots" ? n === 1 ? "Individual" : `Team of ${n}` : `${n}${config.maxTeamSize === 5 && n === 5 ? " (includes substitute)" : " participants"}`}</option>)}</select></>}{event.id === "thoughtlab" && <p className="mt-2 text-xs text-slate-400">Additional members join using an invite/link after the team is created.</p>}{event.id === "hack-the-skill" && <p className="mt-2 text-xs text-slate-400">Add team members here during registration. Invite/link joining is also available.</p>}{event.id === "cipher-chase" && <p className="mt-2 text-xs text-slate-400">Enter the team leader and up to three members here. Remaining members join by invite/link or are added by a coordinator.</p>}</div>
          {config.teamFields?.filter((field) => !["runtime-rush", "hack-the-skill", "battle-of-bots"].includes(event.id) || teamSize > 1).map((field) => <Field key={field.id} field={field} error={fieldErrors[`0-${field.id}`]} value={field.id === "pool" ? participantPool : undefined} onValueChange={field.id === "pool" ? setParticipantPool : undefined}/>)}
        </section>}
        {Array.from({ length: event.id === "thoughtlab" ? Math.min(teamSize, 2) : event.id === "cipher-chase" ? Math.min(teamSize, 4) : teamSize }, (_, index) => <section key={index} className="space-y-5 border-t border-white/10 pt-7"><Heading title={config.eventFormat === "team" ? event.id === "circuit-of-minds" ? (index === 0 ? "Registering participant" : `Participant ${index + 1}`) : event.id === "runtime-rush" ? `Participant ${index + 1}` : event.id === "hack-the-skill" ? teamSize === 1 ? "Your details" : index === 0 ? "Team leader" : `Team member ${index + 1}` : event.id === "battle-of-bots" ? teamSize === 1 ? "Your details" : index === 0 ? "Team leader" : `Team member ${index + 1}` : event.id === "cipher-chase" ? index === 0 ? "Team leader" : `Team member ${index + 1}` : (index === 0 ? "Team leader" : index === 4 ? "Optional substitute (P5)" : `Participant ${index + 1}`) : "Your details"} note={config.eventFormat === "team" ? event.id === "loot-goblins" && index === 4 ? "Optional substitute. Leave these fields blank if your squad has no P5." : event.id === "runtime-rush" && index === 1 ? "Second participant. Mobile number and email are optional." : event.id === "cipher-chase" ? "Enter this team member’s details." : "Enter this participant’s details." : "Fields marked * are required."}/><div className="grid gap-5 sm:grid-cols-2">{config.participantFields.filter((field) => !(event.id === "innocraft" && (field.id === "year" || (participantPool === "School" && field.id === "course"))) && !(event.id === "cipher-chase" && index > 0 && field.id === "profilePhoto") && !(event.id === "hack-the-skill" && index > 0 && field.id === "year")).map((field) => { const participantField = event.id === "innocraft" && field.id === "college" ? { ...field, label: participantPool === "School" ? "School name" : "Institution name" } : event.id === "loot-goblins" && index === 4 ? { ...field, required: false } : event.id === "runtime-rush" && index === 1 && (field.id === "mobile" || field.id === "email") ? { ...field, required: false } : event.id === "cipher-chase" && index > 0 && (field.id === "mobile" || field.id === "email") ? { ...field, required: false, label: field.id === "mobile" ? "Mobile number (optional)" : "Email address (optional)" } : event.id === "cipher-chase" && index === 0 && (field.id === "mobile" || field.id === "email") ? { ...field, label: field.id === "mobile" ? "Team leader mobile number" : "Team leader email address" } : field; return <Field key={`${index}-${field.id}`} field={participantField} index={index} error={fieldErrors[`${index}-${field.id}`]}/>; })}{event.id === "innocraft" && <Field index={index} error={fieldErrors[`${index}-${participantPool === "School" ? "standard" : "year"}`]} field={participantPool === "School" ? { id: "standard", label: "Standard / Class", type: "select", required: true, options: ["Class 9", "Class 10", "Class 11", "Class 12"] } : { id: "year", label: "Year / Semester", type: "text", required: true, placeholder: "Enter your current year / semester" }}/>}</div></section>)}
        {config.declarations && <section className="space-y-4 border-t border-white/10 pt-7"><Heading title="Confirmations and consent" note="Please confirm each statement to continue."/>{config.declarations.map((declaration, index) => <label key={index} className="flex items-start gap-3 text-sm leading-relaxed text-slate-300"><input required type="checkbox" className="mt-1 accent-cyan-300"/><span>{declaration}</span></label>)}{config.customDeclaration && (event.id !== "hack-the-skill" && event.id !== "battle-of-bots" || teamSize > 1) && <label className="mt-5 flex items-start gap-3 rounded border border-cyan-300/20 bg-cyan-300/5 p-4 text-sm leading-relaxed text-slate-200"><input required type="checkbox" className="mt-1 accent-cyan-300"/><span>{config.customDeclaration}</span></label>}</section>}
        {message && <div role={messageIsError ? "alert" : "status"} className={`flex items-start gap-3 rounded border p-4 text-sm leading-relaxed ${messageIsError ? "border-rose-300/30 bg-rose-300/5 text-rose-100" : "border-emerald-300/30 bg-emerald-300/5 text-emerald-100"}`}>{messageIsError ? <AlertCircle className="mt-0.5 shrink-0" size={18}/> : <Check className="mt-0.5 shrink-0" size={18}/>}{message}</div>}
        <div className="border-t border-white/10 pt-6"><button type="submit" disabled={registrationClosed} className="flex w-full items-center justify-center gap-2 bg-cyan-300 px-6 py-4 font-oxanium text-sm font-bold uppercase tracking-widest text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">{registrationClosed ? "Registration closed" : "Review your details"} {!registrationClosed && <ArrowRight size={16}/>}</button><p className="mt-3 max-w-2xl text-xs leading-relaxed text-slate-500">You can review and edit your details before continuing.</p></div>
      </form>
      {step === "review" && review && <section className="space-y-8 p-6 sm:p-9" aria-labelledby="review-title">
        <StepIndicator step="review"/>
        <div><h2 id="review-title" className="font-space text-2xl font-bold text-white">Review your details</h2><p className="mt-2 text-sm text-slate-400">Check the information below. Select Edit details to make changes.</p></div>
        {review.team.length > 0 && <ReviewSection title="Team details" entries={review.team}/>}
        {review.participants.map((entries, index) => <ReviewSection key={index} title={config.eventFormat === "team" && teamSize > 1 ? index === 0 ? "Team leader" : `Team member ${index + 1}` : "Your details"} entries={entries}/>)}
        <ReviewSection title="Confirmations" entries={review.confirmations.map((value) => ({ label: "Confirmed", value }))}/>
        <BillSummary event={event} total={feeTotal} people={registeredPeople} feeLabel={event.id === "innocraft" ? participantPool === "School" ? "₹800 per school team" : "₹1,000 per college team" : config.feeDisplay}/>
        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row"><button type="button" onClick={() => setStep("form")} className="flex items-center justify-center gap-2 rounded border border-white/15 px-6 py-4 font-oxanium text-sm font-bold uppercase tracking-widest text-white hover:border-cyan-300 hover:text-cyan-200"><ArrowLeft size={16}/>Edit details</button><button type="button" onClick={() => setStep("payment")} className="flex items-center justify-center gap-2 bg-cyan-300 px-6 py-4 font-oxanium text-sm font-bold uppercase tracking-widest text-slate-950 hover:bg-cyan-200">Proceed to payment<ArrowRight size={16}/></button></div>
      </section>}
      {step === "payment" && <section className="space-y-8 p-6 sm:p-9" aria-labelledby="payment-title">
        <StepIndicator step="payment"/>
        <div><h2 id="payment-title" className="font-space text-2xl font-bold text-white">Payment</h2><p className="mt-2 text-sm text-slate-400">Review the amount before continuing to secure payment.</p></div>
        <BillSummary event={event} total={feeTotal} people={registeredPeople} feeLabel={event.id === "innocraft" ? participantPool === "School" ? "₹800 per school team" : "₹1,000 per college team" : config.feeDisplay}/>
        {message && <div role="status" className="rounded border border-amber-300/30 bg-amber-300/5 p-4 text-sm leading-relaxed text-amber-100">{message}</div>}
        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row"><button type="button" onClick={() => { setMessage(""); setStep("review"); }} className="flex items-center justify-center gap-2 rounded border border-white/15 px-6 py-4 font-oxanium text-sm font-bold uppercase tracking-widest text-white hover:border-cyan-300 hover:text-cyan-200"><ArrowLeft size={16}/>Back to review</button><button type="button" onClick={() => setMessage(feeTotal === null ? "The registration fee basis is not configured, so the payable total cannot be calculated yet." : "Secure payment is not connected yet. Your details have not been submitted or charged.")} className="flex items-center justify-center gap-2 bg-cyan-300 px-6 py-4 font-oxanium text-sm font-bold uppercase tracking-widest text-slate-950 hover:bg-cyan-200">Continue to secure payment<ArrowRight size={16}/></button></div>
      </section>}
    </div>
  </main>;
}

const inputClass = "w-full rounded-sm border border-white/15 bg-[#03080e] px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-300";
function FileInputField({ id, name, required, accept, helpText, error }: { id: string; name: string; required: boolean; accept?: string; helpText?: string; error?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="space-y-3">
      <input
        id={id}
        name={name}
        type="file"
        required={required && !file}
        accept={accept}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={handleFileChange}
        className="block w-full cursor-pointer rounded-sm border border-white/15 bg-[#03080e] p-2 text-sm text-slate-300 file:mr-3 file:border-0 file:bg-cyan-300 file:px-3 file:py-2 file:font-medium file:text-slate-950"
      />
      {previewUrl && (
        <div className="relative inline-flex flex-col gap-2 rounded border border-cyan-400/40 bg-cyan-950/20 p-3">
          <p className="font-oxanium text-[10px] uppercase tracking-widest text-cyan-300">Image Preview</p>
          <div className="relative h-32 w-32 overflow-hidden rounded border border-white/10 bg-black">
            <img src={previewUrl} alt="Upload preview" className="h-full w-full object-cover" />
          </div>
          <div className="flex items-center justify-between gap-3 text-xs text-slate-300">
            <span className="truncate max-w-[140px] font-mono">{file?.name}</span>
            <button type="button" onClick={clearFile} className="text-rose-400 hover:text-rose-300 font-bold text-[11px] uppercase tracking-wider">Remove</button>
          </div>
        </div>
      )}
      {!previewUrl && file && (
        <div className="flex items-center justify-between rounded border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
          <span className="font-mono truncate">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
          <button type="button" onClick={clearFile} className="text-rose-400 hover:text-rose-300 font-bold text-[11px] uppercase tracking-wider">Remove</button>
        </div>
      )}
      {helpText && <p className="mt-2 text-xs text-slate-500">{helpText}</p>}
      {!helpText && <p className="mt-2 text-xs text-slate-500">Choose a file to upload.</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-rose-300">{error}</p>}
    </div>
  );
}

function Field({ field, index = 0, value, onValueChange, error }: { field: ParticipantFieldSpec; index?: number; value?: string; onValueChange?: (value: string) => void; error?: string }) {
  const id = `${field.id}-${index}`;
  const placeholder = field.placeholder ?? defaultFieldPlaceholder(field);
  return (
    <div className={field.type === "textarea" ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-200">
        {field.label}{field.required && <span className="ml-1 text-rose-300">*</span>}
      </label>
      {field.type === "select" ? (
        <select id={id} name={`${index}-${field.id}`} value={value} required={field.required} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onChange={onValueChange ? (e) => onValueChange(e.target.value) : undefined} className={`${inputClass} ${error ? "border-rose-400" : ""}`}>
          <option value="">{placeholder}</option>
          {field.options?.map((option) => <option key={option}>{option}</option>)}
        </select>
      ) : field.type === "textarea" ? (
        <textarea id={id} name={`${index}-${field.id}`} required={field.required} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={`${inputClass} min-h-24 ${error ? "border-rose-400" : ""}`} />
      ) : field.type === "file" ? (
        <FileInputField id={id} name={`${index}-${field.id}`} required={field.required} accept={field.accept} helpText={field.helpText} error={error} />
      ) : (
        <>
          <input id={id} name={`${index}-${field.id}`} type={field.type} required={field.required} placeholder={field.type === "date" ? undefined : placeholder} accept={field.accept} pattern={field.pattern} inputMode={field.type === "tel" ? "numeric" : undefined} maxLength={field.type === "tel" ? 10 : undefined} onChange={field.type === "tel" ? (e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 10); } : undefined} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : field.helpText ? `${id}-help` : undefined} max={field.id === "birthDate" ? latestEligibleBirthDate() : undefined} className={`${inputClass} ${field.type === "date" ? "[color-scheme:dark]" : ""} ${error ? "border-rose-400" : ""}`} />
          {field.helpText && <p id={`${id}-help`} className="mt-2 text-xs text-slate-500">{field.helpText}</p>}
          {field.type === "date" && !field.helpText && <p id={`${id}-help`} className="mt-2 text-xs text-slate-500">Select a date from the calendar.</p>}
        </>
      )}
      {error && field.type !== "file" && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-rose-300">{error}</p>}
    </div>
  );
}
function defaultFieldPlaceholder(field: ParticipantFieldSpec) {
  if (field.type === "email") return "name@example.com";
  if (field.type === "tel") return "10-digit mobile number";
  if (field.type === "date") return "Select your date of birth";
  if (field.type === "select") return `Select ${field.label.toLowerCase()}`;
  if (field.type === "file") return "Choose a file to upload";
  if (field.type === "textarea") return `Enter ${field.label.toLowerCase()}`;
  return `Enter ${field.label.toLowerCase()}`;
}
function validateRegistrationField(field: ParticipantFieldSpec, rawValue: FormDataEntryValue | null, label = field.label) {
  if (field.type === "file") {
    const file = rawValue instanceof File && rawValue.size > 0 ? rawValue : null;
    return field.required && !file ? `Upload ${label.toLowerCase()}.` : "";
  }
  const value = String(rawValue ?? "").trim();
  if (!value) return field.required ? `${label} is required.` : "";
  if (field.type === "email") {
    if (!value.includes("@")) return "Add @ to the email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return "Use an email format like name@example.com.";
  }
  if (field.type === "tel") {
    const digits = value.replace(/\D/g, "");
    if (digits.length > 10) return "Enter no more than 10 digits.";
    if (digits.length < 10) return "Enter all 10 digits of the mobile number.";
    if (field.pattern ? !new RegExp(`^(?:${field.pattern})$`).test(digits) : !/^[6-9][0-9]{9}$/.test(digits)) return "Enter a valid 10-digit mobile number.";
  }
  if (field.type === "date" && Number.isNaN(Date.parse(value))) return `Enter a valid ${label.toLowerCase()}.`;
  return "";
}
function Heading({ title, note }: { title: string; note: string }) { return <div><h2 className="font-space text-xl font-bold text-white">{title}</h2><p className="mt-1 text-sm text-slate-400">{note}</p></div>; }
function Summary({ label, value }: { label: string; value: string }) { return <div className="rounded border border-white/10 bg-white/[.03] p-3"><p className="font-oxanium text-[10px] uppercase tracking-widest text-slate-500">{label}</p><p className="mt-2 text-sm text-white">{value}</p></div>; }
function StepIndicator({ step }: { step: "review" | "payment" }) { return <div className="flex items-center gap-3 text-xs font-oxanium uppercase tracking-widest"><span className="flex items-center gap-2 text-cyan-200"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-300 text-slate-950"><Check size={14}/></span>Review</span><span className="h-px w-8 bg-white/20"/><span className={`flex items-center gap-2 ${step === "payment" ? "text-cyan-200" : "text-slate-500"}`}><span className={`flex h-7 w-7 items-center justify-center rounded-full border ${step === "payment" ? "border-cyan-300 text-cyan-200" : "border-white/20 text-slate-500"}`}>2</span>Payment</span></div>; }
function ReviewSection({ title, entries }: { title: string; entries: ReviewEntry[] }) { return <section className="overflow-hidden rounded border border-white/10"><h3 className="border-b border-white/10 bg-white/[.03] px-4 py-3 font-space font-semibold text-white">{title}</h3><dl className="divide-y divide-white/5">{entries.map((entry, index) => <div key={`${entry.label}-${index}`} className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(10rem,.7fr)_1.3fr] sm:gap-4"><dt className="text-sm text-slate-400">{entry.label}</dt><dd className="break-words text-sm text-slate-100">{entry.value}</dd></div>)}</dl></section>; }
function BillSummary({ event, total, people, feeLabel }: { event: EventItem; total: number | null; people: number; feeLabel: string }) { return <section className="rounded border border-cyan-300/25 bg-cyan-300/[.04] p-5"><h3 className="font-space text-lg font-bold text-white">Bill summary</h3><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4 text-slate-300"><span>{event.name} registration{total !== null && !event.registrationConfig?.feeBasis && !/per\s+(team|player|participant)/i.test(feeLabel) ? ` · ${people} participant${people === 1 ? "" : "s"}` : ""}</span><span className="text-right">{feeLabel}</span></div><div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3 font-semibold"><span className="text-white">Total payable</span><span className="font-space text-xl text-cyan-200">{total === null ? "To be confirmed" : `₹${total.toLocaleString("en-IN")}`}</span></div>{total === null && <p className="text-xs leading-relaxed text-amber-100/80">The event fee is listed, but its per participant or per team basis has not been specified.</p>}</div></section>; }
function getReviewValue(value: FormDataEntryValue | null) { if (value instanceof File) return value.size > 0 ? value.name : ""; return String(value ?? "").trim(); }
function getRegistrationTotal(event: EventItem, config: NonNullable<EventItem["registrationConfig"]>, participantPool: string, teamSize: number) {
  if (event.id === "innocraft") return participantPool === "School" ? 800 : 1000;
  if (config.feeAmount === undefined) return null;
  if (config.feeBasis === "per_team") return config.feeAmount;
  if (config.feeBasis === "per_player" || config.feeBasis === "per_participant") return config.feeAmount * teamSize;
  const basis = config.feeDisplay.match(/per\s+(team|player|participant)/i)?.[1]?.toLowerCase();
  if (basis === "team") return config.feeAmount;
  if (basis === "player" || basis === "participant") return config.feeAmount * teamSize;
  return null;
}
function latestEligibleBirthDate() { const date = new Date(); date.setFullYear(date.getFullYear() - 17); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function isPastDeadline(deadlineDate?: string) { return deadlineDate ? Date.now() >= new Date(`${deadlineDate}T23:59:59.999+05:30`).getTime() : false; }
