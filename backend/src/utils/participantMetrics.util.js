/**
 * Authoritative participant and team roster metric resolver for XAVITECH 2026.
 *
 * Provides a single source of truth for participant counts, member counts,
 * and squad rosters across Super Admin, Track Leader, Exports, and Public APIs.
 */

/**
 * Deduplicate raw participants array by unique id.
 * Preserves the original record order while eliminating duplicates caused by SQL joins.
 *
 * @param {Array<Object>} rawParticipants - Raw participant records
 * @returns {Array<Object>} Deduplicated, sorted participants
 */
export const deduplicateParticipants = (rawParticipants) => {
  if (!Array.isArray(rawParticipants) || rawParticipants.length === 0) {
    return [];
  }

  const seenIds = new Set();
  const unique = [];

  for (const p of rawParticipants) {
    if (!p) continue;
    if (p.id) {
      if (seenIds.has(p.id)) continue;
      seenIds.add(p.id);
    }
    unique.push(p);
  }

  unique.sort((a, b) => {
    const orderA = a.participant_order ?? a.participantOrder ?? 0;
    const orderB = b.participant_order ?? b.participantOrder ?? 0;
    return orderA - orderB;
  });

  return unique;
};

/**
 * Deduplicate legacy team_members rows when registration_participants snapshot is absent.
 * Filters out entries that duplicate the leader and deduplicates identical member names.
 *
 * @param {Array<Object>} members - Raw team_members records
 * @param {string} [leaderName] - Normalized leader name
 * @param {string} [leaderEmail] - Normalized leader email
 * @returns {Array<Object>} Deduplicated legacy team members
 */
export const deduplicateLegacyMembers = (members, leaderName = '', leaderEmail = '') => {
  if (!Array.isArray(members) || members.length === 0) {
    return [];
  }

  const normalizedLeaderName = (leaderName || '').toLowerCase().trim();
  const normalizedLeaderEmail = (leaderEmail || '').toLowerCase().trim();

  const seenKeys = new Set();
  const deduplicated = [];

  for (const tm of members) {
    if (!tm) continue;
    const tmName = (tm.name || '').trim();
    const tmLower = tmName.toLowerCase();
    const tmEmail = (tm.email || '').toLowerCase().trim();

    // Check if member matches the team leader
    const isLeader =
      (normalizedLeaderName && tmLower === normalizedLeaderName) ||
      (normalizedLeaderEmail && tmEmail && tmEmail === normalizedLeaderEmail);

    if (isLeader) continue;

    // Deduplicate by name if present, otherwise by id
    const dedupeKey = tmLower || tm.id;
    if (dedupeKey) {
      if (seenKeys.has(dedupeKey)) continue;
      seenKeys.add(dedupeKey);
    }

    deduplicated.push(tm);
  }

  deduplicated.sort((a, b) => (a.member_order || 0) - (b.member_order || 0));
  return deduplicated;
};

/**
 * Authoritative resolver for registration participant metrics and squad roster.
 *
 * Single Canonical Rule:
 * 1. When `registration_participants` exists (length > 0):
 *    - `registration_participants` is the single source of truth snapshot.
 *    - Participant count = distinct participants in snapshot.
 *    - Leader = participant with role LEADER or order 1 (or 1st participant).
 *    - Members = remaining distinct participants.
 *    - Team members from `team_members` are NOT merged or added again.
 *
 * 2. When `registration_participants` is empty (legacy or pre-checkout drafts):
 *    - If registration_type === 'TEAM':
 *      - Leader = 1 (team leader / user).
 *      - Members = deduplicated `team_members` (excluding leader).
 *      - Team size = 1 + memberCount.
 *    - If registration_type === 'INDIVIDUAL':
 *      - Team size = 1, memberCount = 0.
 *
 * Compatible with both database snake_case and transformed camelCase schemas.
 *
 * @param {Object} reg - Registration database row or object
 * @param {Object} [teamObj] - Team database object (optional, defaults to reg.team)
 * @returns {Object} Canonical metrics and formatted rosters
 */
export const resolveRegistrationMetrics = (reg = {}, teamObj = null) => {
  const resolvedTeam = teamObj || reg.team || null;
  const regType = (reg.registration_type || reg.registrationType || '').toUpperCase();
  const isTeam = regType === 'TEAM' || (!regType && !!resolvedTeam);

  // 1. Authoritative participants snapshot deduplication
  const rawParticipants = Array.isArray(reg.participants) ? reg.participants : [];
  const uniqueParticipants = deduplicateParticipants(rawParticipants);

  // 2. Resolve Leader from snapshot or fallback user / team leader
  const leaderParticipant =
    uniqueParticipants.find((p) => {
      const role = p.participant_role || p.participantRole;
      const order = p.participant_order ?? p.participantOrder;
      return role === 'LEADER' || order === 1;
    }) ||
    uniqueParticipants[0] ||
    null;

  const rawLeaderName =
    (leaderParticipant?.full_name && leaderParticipant.full_name.trim()) ||
    (leaderParticipant?.fullName && leaderParticipant.fullName.trim()) ||
    (reg.user?.name && reg.user.name.trim()) ||
    (resolvedTeam?.leader?.name && resolvedTeam.leader.name.trim()) ||
    '—';

  const rawLeaderEmail =
    (leaderParticipant?.email && leaderParticipant.email.trim()) ||
    (reg.user?.email && reg.user.email.trim()) ||
    (resolvedTeam?.leader?.email && resolvedTeam.leader.email.trim()) ||
    '—';

  const rawLeaderPhone =
    (leaderParticipant?.mobile_number && leaderParticipant.mobile_number.trim()) ||
    (leaderParticipant?.mobileNumber && leaderParticipant.mobileNumber.trim()) ||
    (leaderParticipant?.custom_fields?.mobileNumber && leaderParticipant.custom_fields.mobileNumber.trim()) ||
    (leaderParticipant?.customFields?.mobileNumber && leaderParticipant.customFields.mobileNumber.trim()) ||
    (reg.user?.phone && reg.user.phone.trim()) ||
    (resolvedTeam?.leader?.phone && resolvedTeam.leader.phone.trim()) ||
    '—';

  const rawLeaderInstitution =
    (leaderParticipant?.institution_name && leaderParticipant.institution_name.trim()) ||
    (leaderParticipant?.institutionName && leaderParticipant.institutionName.trim()) ||
    (leaderParticipant?.custom_fields?.institutionName && leaderParticipant.custom_fields.institutionName.trim()) ||
    (leaderParticipant?.customFields?.institutionName && leaderParticipant.customFields.institutionName.trim()) ||
    (reg.institution && reg.institution.trim()) ||
    (reg.user?.institution && reg.user.institution.trim()) ||
    (resolvedTeam?.leader?.institution && resolvedTeam.leader.institution.trim()) ||
    '—';

  const leaderInfo = {
    id: leaderParticipant?.id || reg.user?.id || resolvedTeam?.leader?.id || null,
    name: rawLeaderName,
    fullName: rawLeaderName,
    email: rawLeaderEmail,
    phone: rawLeaderPhone,
    mobileNumber: rawLeaderPhone,
    institution: rawLeaderInstitution,
    institutionName: rawLeaderInstitution,
    standardClass: leaderParticipant?.standard_class || leaderParticipant?.standardClass || '—',
    city: leaderParticipant?.city || '—',
    studentId: leaderParticipant?.student_id || leaderParticipant?.studentId || '—',
    customFields: leaderParticipant?.custom_fields || leaderParticipant?.customFields || {},
    documents: {
      idCard: leaderParticipant?.id_card_url
        ? {
            url: leaderParticipant.id_card_url,
            publicId: leaderParticipant.id_card_public_id,
            mimeType: leaderParticipant.id_card_mime_type,
            resourceType: leaderParticipant.id_card_resource_type,
            viewUrl: leaderParticipant.id_card_url.toLowerCase().endsWith('.pdf')
              ? leaderParticipant.id_card_url.replace(/\.pdf$/i, '.jpg')
              : leaderParticipant.id_card_url,
          }
        : null,
      profilePhoto: leaderParticipant?.profile_photo_url
        ? {
            url: leaderParticipant.profile_photo_url,
            publicId: leaderParticipant.profile_photo_public_id,
            mimeType: leaderParticipant.profile_photo_mime_type,
            resourceType: leaderParticipant.profile_photo_resource_type,
            viewUrl: leaderParticipant.profile_photo_url,
          }
        : null,
    },
    idCardUrl: leaderParticipant?.id_card_url || null,
    profilePhotoUrl: leaderParticipant?.profile_photo_url || null,
    participantRole: 'LEADER',
    participantOrder: leaderParticipant?.participant_order ?? leaderParticipant?.participantOrder ?? 1,
    createdAt: leaderParticipant?.created_at || leaderParticipant?.createdAt || reg.created_at || null,
    updatedAt: leaderParticipant?.updated_at || leaderParticipant?.updatedAt || reg.updated_at || null,
  };

  // 3. Resolve Additional Members
  const additionalMembers = [];
  const memberParticipants = [];

  if (uniqueParticipants.length > 0) {
    // Authoritative snapshot branch: use registration_participants exclusively
    const rawMemberParts = uniqueParticipants.filter((p) => {
      const pRole = p.participant_role || p.participantRole;
      const pOrder = p.participant_order ?? p.participantOrder;
      return p.id !== leaderParticipant?.id && (pRole === 'MEMBER' || pOrder > 1);
    });

    const normLeaderName = rawLeaderName.toLowerCase().trim();
    const normLeaderEmail = rawLeaderEmail.toLowerCase().trim();

    for (const p of rawMemberParts) {
      const pFullName = (p.full_name || p.fullName || '').trim();
      const pNameLower = pFullName.toLowerCase();
      const pEmail = (p.email || '').toLowerCase().trim();

      // Guard against duplicate leader entry in participant rows
      const isLeaderDupe =
        normLeaderName &&
        pNameLower === normLeaderName &&
        (!pEmail || !normLeaderEmail || pEmail === normLeaderEmail);

      if (isLeaderDupe) continue;

      memberParticipants.push(p);

      const pPhone =
        (p.mobile_number && p.mobile_number.trim()) ||
        (p.mobileNumber && p.mobileNumber.trim()) ||
        (p.custom_fields?.mobileNumber && p.custom_fields.mobileNumber.trim()) ||
        (p.customFields?.mobileNumber && p.customFields.mobileNumber.trim()) ||
        '—';

      const pInstitution =
        (p.institution_name && p.institution_name.trim()) ||
        (p.institutionName && p.institutionName.trim()) ||
        (p.custom_fields?.institutionName && p.custom_fields.institutionName.trim()) ||
        (p.customFields?.institutionName && p.customFields.institutionName.trim()) ||
        '—';

      const pOrder = p.participant_order ?? p.participantOrder;

      additionalMembers.push({
        id: p.id,
        teamMemberId: p.team_member_id || p.teamMemberId || null,
        name: pFullName || '—',
        fullName: pFullName || '—',
        email: p.email || '—',
        phone: pPhone,
        mobileNumber: pPhone,
        institution: pInstitution,
        institutionName: pInstitution,
        standardClass: p.standard_class || p.standardClass || '—',
        city: p.city || '—',
        studentId: p.student_id || p.studentId || '—',
        customFields: p.custom_fields || p.customFields || {},
        documents: {
          idCard: p.id_card_url
            ? {
                url: p.id_card_url,
                publicId: p.id_card_public_id,
                mimeType: p.id_card_mime_type,
                resourceType: p.id_card_resource_type,
                viewUrl: p.id_card_url.toLowerCase().endsWith('.pdf')
                  ? p.id_card_url.replace(/\.pdf$/i, '.jpg')
                  : p.id_card_url,
              }
            : null,
          profilePhoto: p.profile_photo_url
            ? {
                url: p.profile_photo_url,
                publicId: p.profile_photo_public_id,
                mimeType: p.profile_photo_mime_type,
                resourceType: p.profile_photo_resource_type,
                viewUrl: p.profile_photo_url,
              }
            : null,
        },
        idCardUrl: p.id_card_url || null,
        profilePhotoUrl: p.profile_photo_url || null,
        memberOrder: pOrder ? Math.max(1, pOrder - 1) : additionalMembers.length + 1,
        createdAt: p.created_at || p.createdAt || resolvedTeam?.created_at || reg.created_at || null,
        updatedAt: p.updated_at || p.updatedAt || reg.updated_at || null,
        source: 'participant',
      });
    }
  } else if (isTeam) {
    // Legacy fallback branch: registration_participants is empty, fallback to team_members
    const rawTeamMembers = Array.isArray(resolvedTeam?.members) ? [...resolvedTeam.members] : [];
    const dedupedTeamMembers = deduplicateLegacyMembers(rawTeamMembers, rawLeaderName, rawLeaderEmail);

    for (const tm of dedupedTeamMembers) {
      const tmName = (tm.name && tm.name.trim()) || '—';
      additionalMembers.push({
        id: tm.id,
        teamMemberId: tm.id,
        name: tmName,
        fullName: tmName,
        email: '—',
        phone: '—',
        mobileNumber: '—',
        institution: '—',
        institutionName: '—',
        standardClass: '—',
        city: '—',
        studentId: '—',
        customFields: {},
        documents: { idCard: null, profilePhoto: null },
        idCardUrl: null,
        profilePhotoUrl: null,
        memberOrder: tm.member_order || additionalMembers.length + 1,
        createdAt: tm.created_at || resolvedTeam?.created_at || reg.created_at || null,
        updatedAt: tm.created_at || reg.updated_at || null,
        source: 'team_member',
      });
    }
  }

  // 4. Canonical squad size and participant count calculation
  let memberCount = 0;
  let totalTeamSize = 1;
  let participantCount = 1;

  if (isTeam) {
    memberCount = additionalMembers.length;
    totalTeamSize = 1 + memberCount;
    participantCount = totalTeamSize;
  } else {
    memberCount = 0;
    totalTeamSize = 1;
    participantCount = uniqueParticipants.length > 0 ? uniqueParticipants.length : 1;
  }

  return {
    isTeam,
    memberCount,
    totalTeamSize,
    participantCount,
    leaderParticipant,
    leaderInfo,
    memberParticipants,
    additionalMembers,
    uniqueParticipants,
  };
};

export default {
  deduplicateParticipants,
  deduplicateLegacyMembers,
  resolveRegistrationMetrics,
};
