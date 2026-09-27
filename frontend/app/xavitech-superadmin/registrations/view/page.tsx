"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  adminGetMe,
  adminGetRegistrationDetails,
  AdminProfile,
  AdminRegistrationDetail,
} from "@/lib/api";
import AdminHeader from "@/components/admin/AdminHeader";

function RegistrationDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const registrationId = searchParams.get("registrationId");

  const [admin, setAdmin] = useState<AdminProfile | null>(null);
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
        const [profile, regData] = await Promise.all([
          adminGetMe(),
          adminGetRegistrationDetails(registrationId),
        ]);

        if (isMounted) {
          setAdmin(profile);
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
  }, [registrationId, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#080b11] text-white">
        <div className="flex items-center gap-3 text-sm text-neutral-400 font-mono">
          <svg className="animate-spin h-5 w-5 text-[#35e0c9]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading registration details...</span>
        </div>
      </main>
    );
  }

  if (errorMsg || !registration) {
    return (
      <div className="min-h-screen bg-[#080b11] text-white flex flex-col">
        <AdminHeader admin={admin} />
        <main className="flex-1 p-8 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold font-mono">Registration Not Found</h1>
          <p className="text-sm text-neutral-400 mt-2 max-w-md">
            {errorMsg || `The registration with identifier "${registrationId}" does not exist in the database.`}
          </p>
          <Link
            href="/xavitech-superadmin/registrations"
            className="mt-6 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-mono"
          >
            ← Return to Registrations List
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b11] text-white flex flex-col">
      <AdminHeader admin={admin} />

      <main className="flex-1 p-4 sm:p-8 max-w-5xl w-full mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/xavitech-superadmin/registrations"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-[#35e0c9] transition"
          >
            <span>←</span>
            <span>Back to Registrations</span>
          </Link>

          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              registration.status === "CONFIRMED" || registration.status === "PAYMENT_SUCCESS"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : registration.status === "CANCELLED" || registration.status === "PAYMENT_FAILED"
                ? "bg-red-500/10 text-red-400 border-red-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
          >
            {registration.status}
          </span>
        </div>

        {/* Title Bar */}
        <div className="mb-8">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
            Registration Record
          </span>
          <h1 className="text-3xl font-extrabold font-mono text-[#35e0c9] tracking-tight">
            {registration.registrationId}
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Database ID: {registration.id} • Registered on{" "}
            {registration.createdAt ? new Date(registration.createdAt).toLocaleString() : "—"}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Event Details Card */}
          <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#35e0c9]" />
              Event Information
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Event Name</span>
                <p className="text-base font-bold text-white mt-0.5">{registration.event?.name || "—"}</p>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Category / Track</span>
                <p className="text-neutral-300 font-mono mt-0.5">{registration.event?.category || "—"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-mono uppercase text-neutral-500 block">Format</span>
                  <p className="font-semibold text-white mt-0.5">{registration.registrationType}</p>
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-neutral-500 block">Registration Fee</span>
                  <p className="font-mono text-emerald-400 mt-0.5 font-bold">
                    ₹{registration.event?.fee ?? 0}
                  </p>
                </div>
              </div>

              {registration.event?.description && (
                <div className="pt-2 border-t border-neutral-800">
                  <span className="text-[11px] font-mono uppercase text-neutral-500 block mb-1">Description</span>
                  <p className="text-neutral-400 leading-relaxed text-[11px]">
                    {registration.event.description}
                  </p>
                </div>
              )}
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
                <p className="font-mono text-[#35e0c9] mt-0.5">{registration.leader?.email || "—"}</p>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Phone Number</span>
                <p className="font-mono text-neutral-300 mt-0.5">{registration.leader?.phone || "Not provided"}</p>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Institution</span>
                <p className="text-neutral-300 mt-0.5">{registration.leader?.institution || "Not specified"}</p>
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Total Participants</span>
                <p className="text-sm font-bold text-white mt-0.5 font-mono">
                  {registration.totalParticipants} participant(s) registered
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section (If Team Registration) */}
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

              <Link
                href={`/xavitech-superadmin/teams/view?teamId=${registration.team.id}`}
                className="text-xs font-mono text-[#35e0c9] hover:underline"
              >
                Inspect Team Profile →
              </Link>
            </div>

            {/* Members Table */}
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
                  {/* Leader Row */}
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

                  {/* Team Members Rows */}
                  {registration.team.members.map((member, idx) => (
                    <tr key={member.id} className="hover:bg-[#131929]/20">
                      <td className="py-3 px-3 text-neutral-500 text-[11px]">
                        Member #{member.memberOrder || idx + 1}
                      </td>
                      <td className="py-3 px-3 text-white font-medium">{member.name}</td>
                      <td className="py-3 px-3 text-neutral-500 italic text-[11px]">Stored on Leader account</td>
                      <td className="py-3 px-3 text-neutral-500 italic text-[11px]">Stored on Leader account</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminRegistrationDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-[#080b11] text-white">
          <div className="flex items-center gap-3 text-sm text-neutral-400 font-mono">
            <svg className="animate-spin h-5 w-5 text-[#35e0c9]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading registration...</span>
          </div>
        </main>
      }
    >
      <RegistrationDetailContent />
    </Suspense>
  );
}
