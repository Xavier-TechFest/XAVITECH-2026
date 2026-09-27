"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  adminGetMe,
  adminGetTeamDetails,
  AdminProfile,
  AdminTeamDetail,
} from "@/lib/api";
import AdminHeader from "@/components/admin/AdminHeader";

function TeamDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const teamId = searchParams.get("teamId");

  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [team, setTeam] = useState<AdminTeamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!teamId) {
        setIsLoading(false);
        setErrorMsg("No team identifier specified in the request URL.");
        return;
      }

      try {
        const [profile, teamData] = await Promise.all([
          adminGetMe(),
          adminGetTeamDetails(teamId),
        ]);

        if (isMounted) {
          setAdmin(profile);
          setTeam(teamData);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (err.status === 401) {
          router.replace("/xavitech-superadmin");
        } else {
          setErrorMsg(err.message || "Team not found");
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [teamId, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#080b11] text-white">
        <div className="flex items-center gap-3 text-sm text-neutral-400 font-mono">
          <svg className="animate-spin h-5 w-5 text-[#35e0c9]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading team details...</span>
        </div>
      </main>
    );
  }

  if (errorMsg || !team) {
    return (
      <div className="min-h-screen bg-[#080b11] text-white flex flex-col">
        <AdminHeader admin={admin} />
        <main className="flex-1 p-8 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold font-mono">Team Not Found</h1>
          <p className="text-sm text-neutral-400 mt-2 max-w-md">
            {errorMsg || `The team with identifier "${teamId}" does not exist in the database.`}
          </p>
          <Link
            href="/xavitech-superadmin/teams"
            className="mt-6 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-mono"
          >
            ← Return to Teams List
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
            href="/xavitech-superadmin/teams"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-[#35e0c9] transition"
          >
            <span>←</span>
            <span>Back to Teams</span>
          </Link>

          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              team.status === "SUBMITTED"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : team.status === "CANCELLED"
                ? "bg-red-500/10 text-red-400 border-red-500/30"
                : "bg-blue-500/10 text-blue-400 border-blue-500/30"
            }`}
          >
            {team.status}
          </span>
        </div>

        {/* Title Bar */}
        <div className="mb-8">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
            Team Squad Profile
          </span>
          <h1 className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {team.teamName}
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Team UUID: {team.id} • Created on{" "}
            {team.createdAt ? new Date(team.createdAt).toLocaleString() : "—"}
          </p>
        </div>

        {/* Event & Associated Registration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Event Card */}
          <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#35e0c9]" />
              Event Specification
            </h2>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Event</span>
                <p className="text-base font-bold text-white mt-0.5">{team.event?.name || "—"}</p>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Category</span>
                <p className="text-neutral-300 font-mono mt-0.5">{team.event?.category || "—"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-mono uppercase text-neutral-500 block">Team Size Bounds</span>
                  <p className="font-mono text-white mt-0.5">
                    {team.event?.minTeamSize} – {team.event?.maxTeamSize} members
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-neutral-500 block">Registration Fee</span>
                  <p className="font-mono text-emerald-400 mt-0.5 font-bold">
                    ₹{team.event?.fee ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Link Card */}
          <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Registration Association
            </h2>

            {team.registration ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[11px] font-mono uppercase text-neutral-500 block">Registration Code</span>
                  <Link
                    href={`/xavitech-superadmin/registrations/view?registrationId=${team.registration.registrationId}`}
                    className="text-base font-mono font-bold text-[#35e0c9] hover:underline block mt-0.5"
                  >
                    {team.registration.registrationId} →
                  </Link>
                </div>

                <div>
                  <span className="text-[11px] font-mono uppercase text-neutral-500 block">Registration Status</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#35e0c9]/10 text-[#35e0c9] border border-[#35e0c9]/30 mt-1">
                    {team.registration.status}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-mono uppercase text-neutral-500 block">Registered At</span>
                  <p className="text-neutral-400 font-mono mt-0.5">
                    {team.registration.createdAt ? new Date(team.registration.createdAt).toLocaleString() : "—"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-neutral-500 font-mono text-xs">
                <p>This team is currently a DRAFT squad without a confirmed registration record.</p>
              </div>
            )}
          </div>
        </div>

        {/* Team Leader & Roster Card */}
        <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-neutral-800 gap-2">
            <div>
              <h2 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Team Roster ({team.totalTeamSize} Participants)
              </h2>
              <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                Calculated strictly as 1 Team Leader + {team.memberCount} Team Members (Leader never double-counted)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[11px] font-mono uppercase text-neutral-400 border-b border-neutral-800 bg-[#131929]/50">
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Participant Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Institution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {/* Team Leader */}
                <tr className="bg-[#131929]/30">
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      TEAM LEADER
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {team.leader?.name || "Leader"}
                  </td>
                  <td className="py-3.5 px-4 text-[#35e0c9]">
                    {team.leader?.email || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-300">
                    {team.leader?.institution || "—"}
                  </td>
                </tr>

                {/* Team Members */}
                {team.members.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-neutral-500 italic">
                      No additional team members added yet.
                    </td>
                  </tr>
                ) : (
                  team.members.map((member, idx) => (
                    <tr key={member.id} className="hover:bg-[#131929]/20">
                      <td className="py-3.5 px-4 text-neutral-500 text-[11px]">
                        Member #{member.memberOrder || idx + 1}
                      </td>
                      <td className="py-3.5 px-4 text-white font-medium">
                        {member.name}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 italic text-[11px]">
                        Stored on Leader account
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 italic text-[11px]">
                        Stored on Leader account
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminTeamDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-[#080b11] text-white">
          <div className="flex items-center gap-3 text-sm text-neutral-400 font-mono">
            <svg className="animate-spin h-5 w-5 text-[#35e0c9]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading team...</span>
          </div>
        </main>
      }
    >
      <TeamDetailContent />
    </Suspense>
  );
}
