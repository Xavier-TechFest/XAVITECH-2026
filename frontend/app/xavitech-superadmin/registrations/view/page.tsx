"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { AdminRegistrationDetail } from "@/lib/api";

function RegistrationDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const registrationId = searchParams.get("registrationId");
  const { getRegistrationDetails } = useAdmin();

  const [registration, setRegistration] = useState<AdminRegistrationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!registrationId) {
        setIsLoading(false);
        setErrorMsg("No registration identifier specified in the request URL.");
        return;
      }

      try {
        const regData = await getRegistrationDetails(registrationId);
        if (isMounted) {
          setRegistration(regData);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (err.status === 401) {
          router.replace("/xavitech-superadmin");
        } else {
          setErrorMsg(err.message || "Registration not found");
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [registrationId, getRegistrationDetails, router]);

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center text-sm text-neutral-400 font-mono">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-[#35e0c9]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading registration details...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !registration) {
    return (
      <div className="py-20 max-w-xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold font-mono text-white">Registration Not Found</h1>
        <p className="text-sm text-neutral-400 mt-2 max-w-md">
          {errorMsg || `The registration with identifier "${registrationId}" does not exist in the database.`}
        </p>
        <Link
          href="/xavitech-superadmin/registrations"
          className="mt-6 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-mono"
        >
          ← Return to Registrations List
        </Link>
      </div>
    );
  }

  const isConfirmed = registration.status === "CONFIRMED" || registration.status === "PAYMENT_SUCCESS";
  const isCancelled = registration.status === "CANCELLED" || registration.status === "PAYMENT_FAILED";
  const paymentStatus = registration.payment?.status || registration.paymentStatus || (isConfirmed ? "SUCCESS" : "PENDING");
  const payableAmount = registration.payment?.amount ?? registration.payableAmount ?? registration.event?.fee ?? 0;

  return (
    <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/xavitech-superadmin/registrations"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-[#35e0c9] transition"
        >
          <span>←</span>
          <span>Back to Registrations</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Registration Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isConfirmed
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : isCancelled
                ? "bg-red-500/10 text-red-400 border-red-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
          >
            REG: {registration.status}
          </span>

          {/* Payment Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              paymentStatus === "SUCCESS"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : paymentStatus === "FAILED" || paymentStatus === "CANCELLED"
                ? "bg-red-500/10 text-red-400 border-red-500/30"
                : "bg-blue-500/10 text-blue-400 border-blue-500/30"
            }`}
          >
            PAY: {paymentStatus}
          </span>
        </div>
      </div>

      {/* Title Bar */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
              Registration Record
            </span>
            <h1 className="text-3xl font-extrabold font-mono text-[#35e0c9] tracking-tight">
              {registration.registrationId}
            </h1>
          </div>
          <div className="text-xs text-neutral-400 font-mono sm:text-right">
            Fee: <span className="text-white font-bold text-sm">₹{payableAmount}</span> • Database ID: {registration.id}
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-1 font-mono">
          Created: {registration.createdAt ? new Date(registration.createdAt).toLocaleString() : "—"}
        </p>
      </div>

      {/* Main Content Grid: Event + Leader + Payment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Event Details Card */}
        <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#35e0c9]" />
            Event & Track
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Event Name</span>
              <p className="text-base font-bold text-white mt-0.5">{registration.event?.name || "—"}</p>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Assigned Track</span>
              <p className="text-[#35e0c9] font-mono font-semibold mt-0.5">
                {registration.event?.track?.name || registration.event?.category || "—"}
              </p>
              {registration.event?.track?.slug && (
                <span className="text-[10px] text-neutral-500 font-mono">
                  slug: {registration.event.track.slug}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Format</span>
                <p className="font-semibold text-white mt-0.5">{registration.registrationType}</p>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Standard Fee</span>
                <p className="font-mono text-emerald-400 mt-0.5 font-bold">
                  ₹{registration.event?.fee ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Participant / Leader Details Card */}
        <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            {registration.registrationType === "TEAM" ? "Team Leader" : "Participant Details"}
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Full Name</span>
              <p className="text-base font-bold text-white mt-0.5">{registration.leader?.name || "—"}</p>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Email Address</span>
              <p className="font-mono text-[#35e0c9] mt-0.5 break-all">{registration.leader?.email || "—"}</p>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Phone Number</span>
              <p className="font-mono text-neutral-300 mt-0.5">
                {registration.leader?.phone && registration.leader.phone !== "—"
                  ? registration.leader.phone
                  : registration.phone && registration.phone !== "—"
                  ? registration.phone
                  : "Not provided"}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Institution</span>
              <p className="text-neutral-300 mt-0.5">
                {registration.leader?.institution && registration.leader.institution !== "—"
                  ? registration.leader.institution
                  : registration.institution && registration.institution !== "—"
                  ? registration.institution
                  : "Not specified"}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Transaction Summary Card */}
        <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Payment Status & Telemetry
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Payment State</span>
              <p className="text-base font-bold text-white mt-0.5 font-mono">{paymentStatus}</p>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Payable Amount</span>
              <p className="font-mono text-emerald-400 text-lg font-bold mt-0.5">₹{payableAmount}</p>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Transaction Reference</span>
              <p className="font-mono text-neutral-300 mt-0.5 break-all text-[11px]">
                {registration.payment?.transactionId || "No transaction initiated"}
              </p>
            </div>

            {registration.payment?.gateway && (
              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Gateway & Mode</span>
                <p className="font-mono text-neutral-400 mt-0.5 text-[11px]">
                  {registration.payment.gateway} {registration.payment.paymentMode ? `(${registration.payment.paymentMode})` : ""}
                </p>
              </div>
            )}

            {registration.payment?.failureReason && (
              <div>
                <span className="text-[11px] font-mono uppercase text-red-400 block">Failure Reason</span>
                <p className="text-red-400 font-mono text-[11px] mt-0.5">
                  {registration.payment.failureReason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Authoritative Participants Roster Table */}
      <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-neutral-800 gap-2">
          <div>
            <h2 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#35e0c9]" />
              Authoritative Participants Roster ({registration.participants?.length || registration.totalParticipants} Records)
            </h2>
            <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
              Verified snapshot data from PostgreSQL registration_participants table
            </p>
          </div>
        </div>

        {registration.participants && registration.participants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[11px] font-mono uppercase text-neutral-400 border-b border-neutral-800">
                  <th className="py-2.5 px-3">Order / Role</th>
                  <th className="py-2.5 px-3">Participant Name</th>
                  <th className="py-2.5 px-3">Contact Details</th>
                  <th className="py-2.5 px-3">Institution / Class</th>
                  <th className="py-2.5 px-3">Custom Fields</th>
                  <th className="py-2.5 px-3">Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {registration.participants.map((p) => {
                  const hasIdCard = p.documents?.idCard?.url || p.idCardUrl;
                  const hasPhoto = p.documents?.profilePhoto?.url || p.profilePhotoUrl;
                  const customKeys = p.customFields ? Object.keys(p.customFields) : [];

                  return (
                    <tr key={p.id} className="hover:bg-[#131929]/30">
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            p.participantRole === "LEADER"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          #{p.participantOrder} {p.participantRole}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-semibold text-white">
                        {p.fullName}
                      </td>

                      <td className="py-3 px-3 text-neutral-300 text-[11px]">
                        <div>{p.email || "—"}</div>
                        <div className="text-neutral-500 text-[10px]">{p.mobileNumber || "—"}</div>
                      </td>

                      <td className="py-3 px-3 text-neutral-300 text-[11px]">
                        <div>{p.institutionName || "—"}</div>
                        {(p.standardClass || p.studentId) && (
                          <div className="text-neutral-500 text-[10px]">
                            {p.standardClass ? `Class/Dept: ${p.standardClass}` : ""}
                            {p.studentId ? ` • ID: ${p.studentId}` : ""}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-[11px]">
                        {customKeys.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {customKeys.map((key) => (
                              <span
                                key={key}
                                className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300"
                              >
                                <span className="text-neutral-500">{key}:</span> {String(p.customFields![key])}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-[10px]">None</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-[11px]">
                        <div className="flex items-center gap-2">
                          {hasIdCard ? (
                            <a
                              href={hasIdCard}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 rounded bg-[#35e0c9]/10 text-[#35e0c9] border border-[#35e0c9]/30 text-[10px] hover:underline"
                            >
                              ID Card ↗
                            </a>
                          ) : (
                            <span className="text-neutral-600 text-[10px]">No ID</span>
                          )}

                          {hasPhoto ? (
                            <a
                              href={hasPhoto}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] hover:underline"
                            >
                              Photo ↗
                            </a>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs font-mono text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
            No normalized participant snapshot records found for this registration.
          </div>
        )}
      </div>

      {/* Team Roster Section (If Team Registration) */}
      {registration.registrationType === "TEAM" && registration.team && (
        <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-neutral-800 gap-2">
            <div>
              <h2 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Team Roster: {registration.team.teamName}
              </h2>
              <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                Total Squad Size: {registration.team.totalTeamSize} participants (1 Leader + {registration.team.memberCount} Members)
              </p>
            </div>

            {registration.team.id && (
              <Link
                href={`/xavitech-superadmin/teams/view?teamId=${registration.team.id}`}
                className="text-xs font-mono text-[#35e0c9] hover:underline"
              >
                Inspect Team Profile →
              </Link>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[11px] font-mono uppercase text-neutral-400 border-b border-neutral-800">
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Member Name</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Institution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                <tr className="bg-[#131929]/40">
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      TEAM LEADER
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {registration.team.leader?.name || registration.leader?.name || "Leader"}
                  </td>
                  <td className="py-3 px-3 text-neutral-400">
                    {registration.team.leader?.email || registration.leader?.email || "—"}
                  </td>
                  <td className="py-3 px-3 text-neutral-400">
                    {registration.team.leader?.institution || registration.leader?.institution || "—"}
                  </td>
                </tr>

                {registration.team.members.map((member, idx) => (
                  <tr key={member.id || idx} className="hover:bg-[#131929]/20">
                    <td className="py-3 px-3 text-neutral-500 text-[11px]">
                      Member #{member.memberOrder || idx + 1}
                    </td>
                    <td className="py-3 px-3 text-white font-medium">{member.name || "—"}</td>
                    <td className="py-3 px-3 text-neutral-400 text-[11px]">
                      {member.email && member.email !== "—"
                        ? member.email
                        : registration.participants?.find((p) => p.fullName === member.name || p.participantOrder === (member.memberOrder || idx + 1) + 1)?.email || "—"}
                    </td>
                    <td className="py-3 px-3 text-neutral-400 text-[11px]">
                      {member.institutionName && member.institutionName !== "—"
                        ? member.institutionName
                        : member.institution && member.institution !== "—"
                        ? member.institution
                        : registration.participants?.find((p) => p.fullName === member.name || p.participantOrder === (member.memberOrder || idx + 1) + 1)?.institutionName || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminRegistrationDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex items-center justify-center text-sm text-neutral-400 font-mono">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-[#35e0c9]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading registration...</span>
          </div>
        </div>
      }
    >
      <RegistrationDetailContent />
    </Suspense>
  );
}
