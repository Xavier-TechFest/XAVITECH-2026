"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { AdminTeamDetail } from "@/lib/api";

function TeamDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const teamId = searchParams.get("teamId");
  const { getTeamDetails } = useAdmin();

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
        const teamData = await getTeamDetails(teamId);
        if (isMounted) {
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
  }, [teamId, getTeamDetails, router]);

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center text-sm text-neutral-400 font-mono">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-[#35e0c9]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading team details...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !team) {
    return (
      <div className="py-20 max-w-xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold font-mono text-white">Team Not Found</h1>
        <p className="text-sm text-neutral-400 mt-2 max-w-md">
          {errorMsg || `The team with identifier "${teamId}" does not exist in the database.`}
        </p>
        <Link
          href="/xavitech-superadmin/teams"
          className="mt-6 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-mono"
        >
          ← Return to Teams List
        </Link>
      </div>
    );
  }

  // Resolve leader participant and member participant snapshots if linked
  const participants = team.participants || [];
  const leaderParticipant = participants.find(
    (p) => p.participantRole === "LEADER" || p.participantOrder === 1
  );
  const memberParticipants = participants.filter(
    (p) => p.participantRole === "MEMBER" && p.participantOrder > 1
  );

  // Leader fields resolution
  const leaderName = team.leader?.name || leaderParticipant?.fullName || "—";
  const leaderEmail = team.leader?.email || leaderParticipant?.email || "—";
  const leaderPhone = team.leader?.phone || leaderParticipant?.mobileNumber || "—";
  const leaderInstitution = team.leader?.institution || leaderParticipant?.institutionName || "—";
  const leaderClass = leaderParticipant?.standardClass || "—";

  // Build resolved roster list
  type RosterRow = {
    key: string;
    role: "LEADER" | "MEMBER";
    orderLabel: string;
    name: string;
    email: string;
    phone: string;
    institution: string;
    classLevel: string;
  };

  const rosterRows: RosterRow[] = [];

  // 1. Leader row
  rosterRows.push({
    key: "leader",
    role: "LEADER",
    orderLabel: "Team Leader",
    name: leaderName,
    email: leaderEmail,
    phone: leaderPhone,
    institution: leaderInstitution,
    classLevel: leaderClass,
  });

  // 2. Member rows
  if (team.members && team.members.length > 0) {
    team.members.forEach((m, idx) => {
      // Find matching participant details if available
      const matchedPart =
        memberParticipants.find(
          (p) => p.fullName?.toLowerCase().trim() === m.name?.toLowerCase().trim()
        ) ||
        memberParticipants.find(
          (p) => p.participantOrder === (m.memberOrder ? m.memberOrder + 1 : idx + 2)
        ) ||
        memberParticipants[idx];

      rosterRows.push({
        key: `member-${m.id || idx}`,
        role: "MEMBER",
        orderLabel: `Member #${m.memberOrder || idx + 1}`,
        name: m.name,
        email: matchedPart?.email || "—",
        phone: matchedPart?.mobileNumber || "—",
        institution: matchedPart?.institutionName || "—",
        classLevel: matchedPart?.standardClass || "—",
      });
    });
  } else if (memberParticipants.length > 0) {
    // If team_members had 0 rows but registration_participants has member records
    memberParticipants.forEach((p, idx) => {
      rosterRows.push({
        key: `participant-${p.id || idx}`,
        role: "MEMBER",
        orderLabel: `Member #${idx + 1}`,
        name: p.fullName,
        email: p.email || "—",
        phone: p.mobileNumber || "—",
        institution: p.institutionName || "—",
        classLevel: p.standardClass || "—",
      });
    });
  }

  const squadCount = rosterRows.length;

  return (
    <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
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
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
          Team Squad Profile
        </span>
        <h1 className="text-3xl font-extrabold font-mono text-white tracking-tight">
          {team.teamName}
        </h1>
        <p className="text-xs text-neutral-400 mt-1 font-mono">
          Team UUID: {team.id} • Created on{" "}
          {team.createdAt ? new Date(team.createdAt).toLocaleString() : "—"}
          {team.updatedAt && team.updatedAt !== team.createdAt ? (
            <> • Updated on {new Date(team.updatedAt).toLocaleString()}</>
          ) : null}
        </p>
      </div>

      {/* Information Cards: Event, Leader, Registration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Event Specification Card */}
        <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#35e0c9]" />
            Event Specification
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Event</span>
              <p className="text-sm font-bold text-white mt-0.5">{team.event?.name || "—"}</p>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Track</span>
              <p className="text-neutral-300 font-mono mt-0.5">
                {team.event?.track?.name || team.event?.category || "—"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800/60">
              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Bounds</span>
                <p className="font-mono text-white mt-0.5">
                  {team.event?.minTeamSize ?? 1} – {team.event?.maxTeamSize ?? 1} members
                </p>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Fee</span>
                <p className="font-mono text-emerald-400 mt-0.5 font-bold">
                  ₹{team.event?.fee ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Leader Card */}
        <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Team Leader
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Name</span>
              <p className="text-sm font-bold text-white mt-0.5">{leaderName}</p>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Email</span>
              <p className="text-[#35e0c9] font-mono mt-0.5 break-all">{leaderEmail}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800/60">
              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Phone</span>
                <p className="font-mono text-neutral-300 mt-0.5">{leaderPhone}</p>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Class / Year</span>
                <p className="font-mono text-neutral-300 mt-0.5">{leaderClass}</p>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Institution</span>
              <p className="text-neutral-300 font-mono mt-0.5 text-[11px]">{leaderInstitution}</p>
            </div>
          </div>
        </div>

        {/* Registration Association Card */}
        <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Registration Association
          </h2>

          {team.registration?.registrationId ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Registration Code</span>
                <Link
                  href={`/xavitech-superadmin/registrations/view?registrationId=${team.registration.registrationId}`}
                  className="text-sm font-mono font-bold text-[#35e0c9] hover:underline block mt-0.5"
                >
                  {team.registration.registrationId} →
                </Link>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Registration Status</span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border mt-1 ${
                    team.registration.status === "CONFIRMED" || team.registration.status === "PAYMENT_SUCCESS"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : team.registration.status === "CANCELLED" || team.registration.status === "PAYMENT_FAILED"
                      ? "bg-red-500/10 text-red-400 border-red-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {team.registration.status}
                </span>
              </div>

              {team.registration.paymentStatus && (
                <div>
                  <span className="text-[11px] font-mono uppercase text-neutral-500 block">Payment Status</span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border mt-1 ${
                      team.registration.paymentStatus === "SUCCESS"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : team.registration.paymentStatus === "FAILED"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {team.registration.paymentStatus}
                  </span>
                </div>
              )}

              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Registered At</span>
                <p className="text-neutral-400 font-mono mt-0.5 text-[11px]">
                  {team.registration.createdAt ? new Date(team.registration.createdAt).toLocaleString() : "—"}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-neutral-500 font-mono text-xs">
              <p>No registration linked to this team.</p>
              <p className="text-[10px] text-neutral-600 mt-1">This squad exists as a draft team without a linked registration.</p>
            </div>
          )}
        </div>
      </div>

      {/* Team Roster / Members Table */}
      <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-neutral-800 gap-2">
          <div>
            <h2 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Team Roster ({squadCount} Participant{squadCount === 1 ? "" : "s"})
            </h2>
            <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
              1 Team Leader + {squadCount - 1} Team Member{squadCount - 1 === 1 ? "" : "s"}
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
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4">Class / Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {rosterRows.map((row) => (
                <tr
                  key={row.key}
                  className={`hover:bg-[#131929]/40 ${
                    row.role === "LEADER" ? "bg-[#131929]/30 font-medium" : ""
                  }`}
                >
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {row.role === "LEADER" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        TEAM LEADER
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        {row.orderLabel}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                    {row.name}
                  </td>
                  <td className="py-3.5 px-4 text-[#35e0c9] whitespace-nowrap">
                    {row.email}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-300 whitespace-nowrap">
                    {row.phone}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-300">
                    {row.institution}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400 whitespace-nowrap">
                    {row.classLevel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminTeamDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex items-center justify-center text-sm text-neutral-400 font-mono">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-[#35e0c9]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading team...</span>
          </div>
        </div>
      }
    >
      <TeamDetailContent />
    </Suspense>
  );
}
