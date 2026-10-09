import { getSupabaseClient } from '../config/database.js';
import logger from '../utils/logger.util.js';
import { calculatePayableAmount } from './payment.service.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Sanitize search inputs for PostgREST query filter safety.
 */
const sanitizeSearchTerm = (term) => {
  if (!term || typeof term !== 'string') return '';
  return term.trim().replace(/[,()"'%]/g, '');
};

export const adminRegistrationService = {
  /**
   * Calculate live overview metrics from the PostgreSQL database.
   * Can be globally scoped for Admin or track-scoped for Track Leader.
   * Strictly uses real database records (no mock numbers).
   *
   * @param {string|null} trackIdConstraint - Optional Track UUID or slug to scope metrics
   */
  getDashboardStats: async (trackIdConstraint = null) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    let resolvedTrackId = null;
    let trackInfo = null;

    if (trackIdConstraint) {
      const cleanTrackId = String(trackIdConstraint).trim();
      if (UUID_REGEX.test(cleanTrackId)) {
        resolvedTrackId = cleanTrackId;
        const { data: tRow } = await client
          .from('tracks')
          .select('id, name, slug, description, is_active')
          .eq('id', resolvedTrackId)
          .maybeSingle();
        trackInfo = tRow || null;
      } else {
        const { data: tRow } = await client
          .from('tracks')
          .select('id, name, slug, description, is_active')
          .eq('slug', cleanTrackId.toLowerCase())
          .maybeSingle();
        if (tRow) {
          resolvedTrackId = tRow.id;
          trackInfo = tRow;
        }
      }
    }

    // 1. Fetch tracks for track-level breakdown
    const { data: allTracks } = await client
      .from('tracks')
      .select('id, name, slug, is_active')
      .order('name');

    // 2. Fetch events (filtered by track if constraint provided)
    let eventsQuery = client
      .from('events')
      .select('id, name, slug, category, registration_type, fee, is_active, track_id');

    if (resolvedTrackId) {
      eventsQuery = eventsQuery.eq('track_id', resolvedTrackId);
    }

    const { data: events, error: evError } = await eventsQuery;
    if (evError) {
      logger.error('Error fetching events for dashboard stats:', evError);
      throw evError;
    }

    const activeEventsCount = (events || []).filter((e) => e.is_active).length;
    const eventIds = (events || []).map((e) => e.id);

    if (resolvedTrackId && eventIds.length === 0) {
      return {
        totalRegistrations: 0,
        confirmedRegistrations: 0,
        pendingRegistrations: 0,
        paymentPendingRegistrations: 0,
        failedOrCancelledRegistrations: 0,
        totalParticipants: 0,
        totalTeams: 0,
        activeEvents: 0,
        registrationStatusCounts: {
          DRAFT: 0,
          PAYMENT_PENDING: 0,
          PAYMENT_SUCCESS: 0,
          CONFIRMED: 0,
          PAYMENT_FAILED: 0,
          CANCELLED: 0,
        },
        paymentStatusCounts: {
          SUCCESS: 0,
          PENDING: 0,
          INITIATED: 0,
          FAILED: 0,
          CANCELLED: 0,
        },
        eventCounts: [],
        trackCounts: [],
        assignedTrack: trackInfo,
      };
    }

    // 3. Fetch registrations (scoped if eventIds filtered)
    let regQuery = client
      .from('registrations')
      .select('id, registration_id, event_id, registration_type, status, team_id');

    if (resolvedTrackId && eventIds.length > 0) {
      regQuery = regQuery.in('event_id', eventIds);
    }

    const { data: registrations, error: regError } = await regQuery;
    if (regError) {
      logger.error('Error fetching registrations for dashboard stats:', regError);
      throw regError;
    }

    const allRegs = registrations || [];
    const regIds = allRegs.map((r) => r.id);

    // 4. Calculate registration status counts
    const registrationStatusCounts = {
      DRAFT: 0,
      PAYMENT_PENDING: 0,
      PAYMENT_SUCCESS: 0,
      CONFIRMED: 0,
      PAYMENT_FAILED: 0,
      CANCELLED: 0,
    };

    let confirmedCount = 0;
    let pendingCount = 0;
    let paymentPendingCount = 0;
    let failedOrCancelledCount = 0;

    for (const r of allRegs) {
      const st = r.status || 'DRAFT';
      registrationStatusCounts[st] = (registrationStatusCounts[st] || 0) + 1;
      if (st === 'CONFIRMED' || st === 'PAYMENT_SUCCESS') {
        confirmedCount++;
      } else if (st === 'DRAFT') {
        pendingCount++;
      } else if (st === 'PAYMENT_PENDING') {
        paymentPendingCount++;
      } else if (st === 'CANCELLED' || st === 'PAYMENT_FAILED') {
        failedOrCancelledCount++;
      }
    }

    // 5. Calculate total registered teams
    // Scoped automatically (allRegs is already scoped to track events if resolvedTrackId is set):
    // Count unique registered teams: registrations where registration_type is TEAM.
    // For team registrations with a linked team_id, count unique team_ids.
    // For team registrations without a team_id, count each registration as an independent team squad.
    const teamRegs = allRegs.filter((r) => r.registration_type === 'TEAM');
    const linkedTeamIds = new Set(teamRegs.filter((r) => r.team_id).map((r) => r.team_id));
    const unlinkedTeamRegs = teamRegs.filter((r) => !r.team_id);
    const totalTeams = linkedTeamIds.size + unlinkedTeamRegs.length;

    // 6. Fetch registration_participants for accurate participant counts
    let totalParticipants = 0;
    if (regIds.length > 0) {
      const chunkSize = 200;
      let participantCountsByReg = {};

      for (let i = 0; i < regIds.length; i += chunkSize) {
        const chunk = regIds.slice(i, i + chunkSize);
        const { data: pRows } = await client
          .from('registration_participants')
          .select('id, registration_id')
          .in('registration_id', chunk);

        if (Array.isArray(pRows)) {
          for (const p of pRows) {
            participantCountsByReg[p.registration_id] =
              (participantCountsByReg[p.registration_id] || 0) + 1;
          }
        }
      }

      // Check for legacy registrations without registration_participants
      const legacyRegs = allRegs.filter((r) => !participantCountsByReg[r.id]);
      let memberCountByTeam = {};
      if (legacyRegs.some((r) => r.registration_type === 'TEAM' && r.team_id)) {
        const legacyTeamIds = legacyRegs.filter((r) => r.team_id).map((r) => r.team_id);
        const { data: tmRows } = await client
          .from('team_members')
          .select('id, team_id')
          .in('team_id', legacyTeamIds);

        if (Array.isArray(tmRows)) {
          for (const tm of tmRows) {
            memberCountByTeam[tm.team_id] = (memberCountByTeam[tm.team_id] || 0) + 1;
          }
        }
      }

      for (const r of allRegs) {
        if (participantCountsByReg[r.id]) {
          totalParticipants += participantCountsByReg[r.id];
        } else if (r.registration_type === 'INDIVIDUAL') {
          totalParticipants += 1;
        } else if (r.registration_type === 'TEAM') {
          const extra = r.team_id && memberCountByTeam[r.team_id] ? memberCountByTeam[r.team_id] : 0;
          totalParticipants += 1 + extra;
        }
      }
    }

    // 7. Payment status counts
    const paymentStatusCounts = {
      SUCCESS: 0,
      PENDING: 0,
      INITIATED: 0,
      FAILED: 0,
      CANCELLED: 0,
    };

    if (regIds.length > 0) {
      const chunkSize = 200;
      for (let i = 0; i < regIds.length; i += chunkSize) {
        const chunk = regIds.slice(i, i + chunkSize);
        const { data: txRows } = await client
          .from('payment_transactions')
          .select('id, status, registration_id')
          .in('registration_id', chunk);

        if (Array.isArray(txRows)) {
          for (const tx of txRows) {
            const txSt = (tx.status || 'INITIATED').toUpperCase();
            paymentStatusCounts[txSt] = (paymentStatusCounts[txSt] || 0) + 1;
          }
        }
      }
    }

    // 8. Event-wise breakdown
    const eventCountsMap = {};
    for (const r of allRegs) {
      if (r.event_id) {
        eventCountsMap[r.event_id] = (eventCountsMap[r.event_id] || 0) + 1;
      }
    }

    const eventCounts = (events || []).map((ev) => ({
      eventId: ev.id,
      name: ev.name,
      slug: ev.slug,
      trackId: ev.track_id,
      count: eventCountsMap[ev.id] || 0,
    }));

    // 9. Track-wise breakdown (for Admin or overall)
    const trackCountsMap = {};
    const eventsById = {};
    for (const ev of events || []) {
      eventsById[ev.id] = ev;
    }

    for (const r of allRegs) {
      const ev = eventsById[r.event_id];
      if (ev && ev.track_id) {
        trackCountsMap[ev.track_id] = (trackCountsMap[ev.track_id] || 0) + 1;
      }
    }

    const trackCounts = (allTracks || []).map((tr) => ({
      trackId: tr.id,
      name: tr.name,
      slug: tr.slug,
      count: trackCountsMap[tr.id] || 0,
    }));

    return {
      totalRegistrations: allRegs.length,
      confirmedRegistrations: confirmedCount,
      pendingRegistrations: pendingCount,
      paymentPendingRegistrations: paymentPendingCount,
      failedOrCancelledRegistrations: failedOrCancelledCount,
      totalParticipants,
      totalTeams,
      activeEvents: activeEventsCount,
      registrationStatusCounts,
      paymentStatusCounts,
      eventCounts,
      trackCounts,
      assignedTrack: trackInfo,
    };
  },

  /**
   * Paginated, searchable, and filterable list of registrations.
   * Scoped to track if trackId is provided.
   */
  listRegistrations: async ({
    page = 1,
    limit = 20,
    search = '',
    trackId = '',
    eventId = '',
    registrationType = '',
    status = '',
    paymentStatus = '',
  }) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const cleanSearch = sanitizeSearchTerm(search);

    let matchingUserIds = [];
    let matchingTeamIds = [];
    let matchingParticipantRegIds = [];

    if (cleanSearch) {
      const [usersRes, teamsRes, participantsRes] = await Promise.all([
        client
          .from('users')
          .select('id')
          .or(`email.ilike.%${cleanSearch}%,name.ilike.%${cleanSearch}%`)
          .limit(100),
        client
          .from('teams')
          .select('id')
          .ilike('team_name', `%${cleanSearch}%`)
          .limit(100),
        client
          .from('registration_participants')
          .select('registration_id')
          .or(`full_name.ilike.%${cleanSearch}%,email.ilike.%${cleanSearch}%`)
          .limit(200),
      ]);

      if (usersRes.data) {
        matchingUserIds = usersRes.data.map((u) => u.id);
      }
      if (teamsRes.data) {
        matchingTeamIds = teamsRes.data.map((t) => t.id);
      }
      if (participantsRes.data) {
        matchingParticipantRegIds = participantsRes.data.map((p) => p.registration_id);
      }
    }

    let query = client
      .from('registrations')
      .select(
        `
        id,
        registration_id,
        user_id,
        event_id,
        team_id,
        registration_type,
        status,
        created_at,
        updated_at,
        event:events(id, name, slug, category, registration_type, fee, track_id, track:tracks(id, name, slug)),
        user:users(id, name, email, phone, college_name),
        team:teams(id, team_name, status, members:team_members(id, name, member_order)),
        participants:registration_participants(id, full_name, email, mobile_number, institution_name, standard_class, participant_role, participant_order, custom_fields, id_card_url, profile_photo_url),
        payment_transactions(id, transaction_id, amount, currency, status, gateway, failure_reason, created_at)
      `,
        { count: 'exact' }
      );

    // Apply search condition
    if (cleanSearch) {
      const orClauses = [`registration_id.ilike.%${cleanSearch}%`];
      if (matchingUserIds.length > 0) {
        orClauses.push(`user_id.in.(${matchingUserIds.join(',')})`);
      }
      if (matchingTeamIds.length > 0) {
        orClauses.push(`team_id.in.(${matchingTeamIds.join(',')})`);
      }
      if (matchingParticipantRegIds.length > 0) {
        orClauses.push(`id.in.(${matchingParticipantRegIds.join(',')})`);
      }
      query = query.or(orClauses.join(','));
    }

    // Apply event filter or track filter
    if (eventId && UUID_REGEX.test(eventId)) {
      query = query.eq('event_id', eventId);
    } else if (trackId && typeof trackId === 'string' && trackId.trim()) {
      const cleanTrackId = trackId.trim();
      let targetTrackId = cleanTrackId;
      if (!UUID_REGEX.test(cleanTrackId)) {
        const { data: trackRow } = await client
          .from('tracks')
          .select('id')
          .eq('slug', cleanTrackId.toLowerCase())
          .maybeSingle();
        if (trackRow) {
          targetTrackId = trackRow.id;
        }
      }

      if (UUID_REGEX.test(targetTrackId)) {
        const { data: trackEvents } = await client
          .from('events')
          .select('id')
          .eq('track_id', targetTrackId);

        const trackEventIds = (trackEvents || []).map((e) => e.id);
        if (trackEventIds.length === 0) {
          return {
            registrations: [],
            pagination: {
              page: pageNum,
              limit: limitNum,
              totalRecords: 0,
              totalPages: 1,
            },
          };
        }
        query = query.in('event_id', trackEventIds);
      }
    }

    // Apply registration type filter
    if (registrationType && ['INDIVIDUAL', 'TEAM'].includes(registrationType.toUpperCase())) {
      query = query.eq('registration_type', registrationType.toUpperCase());
    }

    // Apply registration status filter
    if (status && status.toUpperCase() !== 'ALL') {
      query = query.eq('status', status.toUpperCase());
    }

    // Apply paymentStatus filter if provided
    if (paymentStatus && typeof paymentStatus === 'string' && paymentStatus.trim()) {
      const cleanPaymentStatus = paymentStatus.trim().toUpperCase();
      const { data: txRows } = await client
        .from('payment_transactions')
        .select('registration_id')
        .eq('status', cleanPaymentStatus)
        .limit(500);

      const txRegIds = (txRows || []).map((t) => t.registration_id);
      if (cleanPaymentStatus === 'SUCCESS') {
        const { data: confirmedRegs } = await client
          .from('registrations')
          .select('id')
          .in('status', ['CONFIRMED', 'PAYMENT_SUCCESS'])
          .limit(500);
        const confirmedIds = (confirmedRegs || []).map((r) => r.id);
        const combinedIds = Array.from(new Set([...txRegIds, ...confirmedIds]));
        if (combinedIds.length === 0) {
          return {
            registrations: [],
            pagination: {
              page: pageNum,
              limit: limitNum,
              totalRecords: 0,
              totalPages: 1,
            },
          };
        }
        query = query.in('id', combinedIds);
      } else {
        if (txRegIds.length === 0) {
          return {
            registrations: [],
            pagination: {
              page: pageNum,
              limit: limitNum,
              totalRecords: 0,
              totalPages: 1,
            },
          };
        }
        query = query.in('id', txRegIds);
      }
    }

    // Apply ordering & pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data: rows, count: totalRecords, error } = await query;

    if (error) {
      logger.error('Error querying registrations list:', error);
      throw error;
    }

    // Batch resolve fallback teams for unlinked team registrations
    const unlinkedRows = (rows || []).filter(
      (r) => r.registration_type === 'TEAM' && !r.team && (r.user_id || r.user?.id) && (r.event_id || r.event?.id)
    );
    const fallbackTeamsMap = {};
    if (unlinkedRows.length > 0) {
      const userIds = Array.from(new Set(unlinkedRows.map((r) => r.user_id || r.user?.id).filter(Boolean)));
      const evIds = Array.from(new Set(unlinkedRows.map((r) => r.event_id || r.event?.id).filter(Boolean)));
      if (userIds.length > 0 && evIds.length > 0) {
        const { data: fbTeams } = await client
          .from('teams')
          .select(`
            id,
            team_name,
            status,
            event_id,
            leader_user_id,
            members:team_members(id, name, member_order)
          `)
          .in('leader_user_id', userIds)
          .in('event_id', evIds);

        if (Array.isArray(fbTeams)) {
          for (const t of fbTeams) {
            const key = `${t.leader_user_id}_${t.event_id}`;
            if (!fallbackTeamsMap[key]) {
              fallbackTeamsMap[key] = t;
            }
          }
        }
      }
    }

    // Transform registrations with safe presentation attributes
    const formattedRegistrations = (rows || []).map((reg) => {
      let teamObj = reg.team || null;
      if (!teamObj && reg.registration_type === 'TEAM') {
        const uId = reg.user_id || reg.user?.id;
        const eId = reg.event_id || reg.event?.id;
        if (uId && eId && fallbackTeamsMap[`${uId}_${eId}`]) {
          teamObj = fallbackTeamsMap[`${uId}_${eId}`];
        }
      }

      const participantsList = Array.isArray(reg.participants) ? [...reg.participants] : [];
      participantsList.sort((a, b) => (a.participant_order || 0) - (b.participant_order || 0));

      const leaderPart =
        participantsList.find((p) => p.participant_role === 'LEADER' || p.participant_order === 1) ||
        participantsList[0] ||
        null;
      const memberParts = participantsList.filter(
        (p) => p.id !== leaderPart?.id && (p.participant_role === 'MEMBER' || p.participant_order > 1)
      );

      const teamMembers = Array.isArray(teamObj?.members) ? teamObj.members : [];

      // Deduplicate unique additional members count
      const seenMemberKeys = new Set();
      for (const p of memberParts) {
        const k = (p.email ? p.email.toLowerCase().trim() : '') || (p.full_name ? p.full_name.toLowerCase().trim() : '') || p.id;
        seenMemberKeys.add(k);
      }
      for (const tm of teamMembers) {
        const tmName = (tm.name || '').toLowerCase().trim();
        const isLeader =
          (reg.user?.name && tmName === reg.user.name.toLowerCase().trim()) ||
          (leaderPart?.full_name && tmName === leaderPart.full_name.toLowerCase().trim());
        if (!isLeader) {
          seenMemberKeys.add(tmName || tm.id);
        }
      }

      const uniqueMemberCount = seenMemberKeys.size;
      const totalTeamSize = reg.registration_type === 'TEAM' ? 1 + uniqueMemberCount : 1;
      const participantCount = totalTeamSize;

      // Extract latest payment transaction
      const txs = Array.isArray(reg.payment_transactions) ? [...reg.payment_transactions] : [];
      txs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const latestTx = txs[0] || null;

      const isPaid = reg.status === 'CONFIRMED' || reg.status === 'PAYMENT_SUCCESS';
      const resolvedPaymentStatus = latestTx
        ? latestTx.status
        : isPaid
        ? 'SUCCESS'
        : reg.status === 'PAYMENT_PENDING'
        ? 'PENDING'
        : 'INITIATED';

      const payableAmount = latestTx
        ? Number(latestTx.amount)
        : calculatePayableAmount(reg.event, reg, participantsList);

      return {
        id: reg.id,
        registrationId: reg.registration_id,
        registrationType: reg.registration_type,
        status: reg.status,
        paymentStatus: resolvedPaymentStatus,
        payableAmount,
        createdAt: reg.created_at,
        updatedAt: reg.updated_at,
        participantCount,
        event: reg.event
          ? {
              id: reg.event.id,
              name: reg.event.name,
              slug: reg.event.slug,
              category: reg.event.category,
              fee: Number(reg.event.fee || 0),
              trackId: reg.event.track_id,
              track: reg.event.track
                ? {
                    id: reg.event.track.id,
                    name: reg.event.track.name,
                    slug: reg.event.track.slug,
                  }
                : null,
            }
          : null,
        user: reg.user
          ? {
              id: reg.user.id,
              name: leaderPart?.full_name || reg.user.name || '—',
              email: leaderPart?.email || reg.user.email || '—',
              phone: leaderPart?.mobile_number || reg.user.phone || '—',
              institution: leaderPart?.institution_name || reg.user.college_name || '—',
            }
          : null,
        team: teamObj
          ? {
              id: teamObj.id,
              teamName: teamObj.team_name || '—',
              status: teamObj.status,
              memberCount: uniqueMemberCount,
              totalTeamSize,
            }
          : reg.registration_type === 'TEAM'
          ? {
              id: null,
              teamName: '—',
              status: 'PENDING',
              memberCount: uniqueMemberCount,
              totalTeamSize,
            }
          : null,
        participants: participantsList.map((p) => ({
          id: p.id,
          fullName: p.full_name || '—',
          email: p.email || '—',
          mobileNumber: p.mobile_number || '—',
          institutionName: p.institution_name || '—',
          institution: p.institution_name || '—',
          standardClass: p.standard_class || '—',
          participantRole: p.participant_role,
          isLeader: p.participant_role === 'LEADER' || p.participant_order === 1,
          participantOrder: p.participant_order,
          customFields: p.custom_fields || {},
          idCardUrl: p.id_card_url || null,
          profilePhotoUrl: p.profile_photo_url || null,
        })),
        payment: latestTx
          ? {
              transactionId: latestTx.transaction_id,
              status: latestTx.status,
              amount: Number(latestTx.amount),
              currency: latestTx.currency || 'INR',
              gateway: latestTx.gateway,
              failureReason: latestTx.failure_reason,
              createdAt: latestTx.created_at,
            }
          : {
              transactionId: null,
              status: resolvedPaymentStatus,
              amount: payableAmount,
              currency: 'INR',
              gateway: null,
              failureReason: null,
              createdAt: null,
            },
      };
    });

    const total = totalRecords || 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      registrations: formattedRegistrations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords: total,
        totalPages,
      },
    };
  },

  /**
   * Backward compatibility alias for listRegistrations.
   */
  listAllRegistrations: async (params) => {
    return adminRegistrationService.listRegistrations(params);
  },

  /**
   * Fetch complete registration details by UUID or human-readable registration_id.
   * Includes full related events, tracks, leader, team, normalized participants, and payment transactions.
   */
  getRegistrationDetails: async (registrationIdentifier) => {
    if (!registrationIdentifier || typeof registrationIdentifier !== 'string') {
      return null;
    }

    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const cleanIdentifier = registrationIdentifier.trim();
    const isUUID = UUID_REGEX.test(cleanIdentifier);

    let query = client
      .from('registrations')
      .select(
        `
        id,
        registration_id,
        user_id,
        event_id,
        team_id,
        registration_type,
        status,
        created_at,
        updated_at,
        event:events(
          *,
          track:tracks(id, name, slug, description, is_active)
        ),
        user:users(id, name, email, phone, college_name, profile_image, role, is_active, created_at),
        team:teams(
          id,
          team_name,
          status,
          created_at,
          updated_at,
          leader:users(id, name, email, phone, college_name),
          members:team_members(id, name, member_order, created_at)
        ),
        participants:registration_participants(*),
        payment_transactions(
          id,
          transaction_id,
          gateway,
          amount,
          currency,
          status,
          gateway_reference,
          gateway_payment_mode,
          failure_reason,
          created_at,
          updated_at
        )
      `
      );

    if (isUUID) {
      query = query.eq('id', cleanIdentifier);
    } else {
      query = query.eq('registration_id', cleanIdentifier);
    }

    const { data: reg, error } = await query.maybeSingle();

    if (error) {
      logger.error('Error fetching registration details:', error);
      throw error;
    }

    if (!reg) {
      return null;
    }

    // Deterministic fallback lookup for unlinked team registrations
    let resolvedTeam = reg.team || null;
    if (!resolvedTeam && reg.registration_type === 'TEAM') {
      const leaderId = reg.user_id || reg.user?.id;
      const targetEventId = reg.event_id || reg.event?.id;
      if (leaderId && targetEventId) {
        const { data: fallbackTeam } = await client
          .from('teams')
          .select(
            `
            id,
            team_name,
            status,
            created_at,
            updated_at,
            leader:users(id, name, email, phone, college_name),
            members:team_members(id, name, member_order, created_at)
          `
          )
          .eq('leader_user_id', leaderId)
          .eq('event_id', targetEventId)
          .maybeSingle();

        if (fallbackTeam) {
          resolvedTeam = fallbackTeam;
        }
      }
    }

    // Sort raw participants by participant_order
    const rawParticipants = Array.isArray(reg.participants) ? [...reg.participants] : [];
    rawParticipants.sort((a, b) => (a.participant_order || 0) - (b.participant_order || 0));

    // Identify leader participant (role LEADER or order 1)
    const leaderParticipant =
      rawParticipants.find((p) => p.participant_role === 'LEADER' || p.participant_order === 1) ||
      rawParticipants[0] ||
      null;

    // Identify raw member participants (excluding the leader)
    const memberParticipants = rawParticipants.filter(
      (p) => p.id !== leaderParticipant?.id && (p.participant_role === 'MEMBER' || p.participant_order > 1)
    );

    // Raw team members from team_members table
    const rawTeamMembers = Array.isArray(resolvedTeam?.members) ? [...resolvedTeam.members] : [];
    rawTeamMembers.sort((a, b) => (a.member_order || 0) - (b.member_order || 0));

    // Canonical Deduplicated Additional Members List
    const additionalMembers = [];
    const seenMemberKeys = new Set();

    // 1. First add members from registration_participants (authoritative detailed snapshot)
    for (const p of memberParticipants) {
      // Guard against leader duplication
      const isLeaderDuplicate =
        leaderParticipant &&
        p.full_name &&
        leaderParticipant.full_name &&
        p.full_name.toLowerCase().trim() === leaderParticipant.full_name.toLowerCase().trim() &&
        (!p.email || !leaderParticipant.email || p.email.toLowerCase().trim() === leaderParticipant.email.toLowerCase().trim());

      if (isLeaderDuplicate) continue;

      additionalMembers.push({
        id: p.id,
        teamMemberId: p.team_member_id || null,
        name: p.full_name || '—',
        fullName: p.full_name || '—',
        email: p.email || '—',
        phone: p.mobile_number || '—',
        mobileNumber: p.mobile_number || '—',
        institution: p.institution_name || '—',
        institutionName: p.institution_name || '—',
        standardClass: p.standard_class || '—',
        city: p.city || '—',
        studentId: p.student_id || '—',
        customFields: p.custom_fields || {},
        documents: {
          idCard: p.id_card_url
            ? {
                url: p.id_card_url,
                publicId: p.id_card_public_id,
                mimeType: p.id_card_mime_type,
                resourceType: p.id_card_resource_type,
              }
            : null,
          profilePhoto: p.profile_photo_url
            ? {
                url: p.profile_photo_url,
                publicId: p.profile_photo_public_id,
                mimeType: p.profile_photo_mime_type,
                resourceType: p.profile_photo_resource_type,
              }
            : null,
        },
        idCardUrl: p.id_card_url || null,
        profilePhotoUrl: p.profile_photo_url || null,
        memberOrder: p.participant_order ? Math.max(1, p.participant_order - 1) : additionalMembers.length + 1,
        createdAt: p.created_at || resolvedTeam?.created_at || reg.created_at,
        updatedAt: p.updated_at || reg.updated_at,
        source: 'participant',
      });
    }

    // 2. Add any team_members from team_members table not already accounted for
    for (const tm of rawTeamMembers) {
      const tmName = (tm.name || '').toLowerCase().trim();
      const isLeaderName =
        (reg.user?.name && tmName === reg.user.name.toLowerCase().trim()) ||
        (leaderParticipant?.full_name && tmName === leaderParticipant.full_name.toLowerCase().trim());

      const alreadyCovered =
        additionalMembers.some(
          (m) =>
            (m.teamMemberId && m.teamMemberId === tm.id) ||
            (m.id && m.id === tm.id) ||
            (tmName && m.name && m.name.toLowerCase().trim() === tmName)
        );

      if (!alreadyCovered && (!isLeaderName || rawParticipants.length === 0)) {
        additionalMembers.push({
          id: tm.id,
          teamMemberId: tm.id,
          name: tm.name || '—',
          fullName: tm.name || '—',
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
          createdAt: tm.created_at || resolvedTeam?.created_at || reg.created_at,
          updatedAt: tm.created_at || reg.updated_at,
          source: 'team_member',
        });
      }
    }

    // Calculate canonical squad sizes
    const memberCount = additionalMembers.length;
    const totalTeamSize = reg.registration_type === 'TEAM' ? 1 + memberCount : 1;
    const totalParticipants = totalTeamSize;

    // Process payment transactions
    const transactions = Array.isArray(reg.payment_transactions)
      ? [...reg.payment_transactions].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      : [];

    const latestTx = transactions[0] || null;
    const isPaid = reg.status === 'CONFIRMED' || reg.status === 'PAYMENT_SUCCESS';
    const paymentStatus = latestTx
      ? latestTx.status
      : isPaid
      ? 'SUCCESS'
      : reg.status === 'PAYMENT_PENDING'
      ? 'PENDING'
      : 'INITIATED';

    const payableAmount = latestTx
      ? Number(latestTx.amount)
      : calculatePayableAmount(reg.event, reg, rawParticipants);

    // Build unified, ordered participants roster (Leader first, members in order)
    const unifiedParticipants = [];
    if (leaderParticipant) {
      unifiedParticipants.push({
        id: leaderParticipant.id,
        participantOrder: 1,
        participantRole: 'LEADER',
        isLeader: true,
        fullName: leaderParticipant.full_name || reg.user?.name || '—',
        email: leaderParticipant.email || reg.user?.email || '—',
        mobileNumber: leaderParticipant.mobile_number || reg.user?.phone || '—',
        institutionName: leaderParticipant.institution_name || reg.user?.college_name || '—',
        institution: leaderParticipant.institution_name || reg.user?.college_name || '—',
        city: leaderParticipant.city || '—',
        studentId: leaderParticipant.student_id || '—',
        standardClass: leaderParticipant.standard_class || '—',
        customFields: leaderParticipant.custom_fields || {},
        documents: {
          idCard: leaderParticipant.id_card_url
            ? {
                url: leaderParticipant.id_card_url,
                publicId: leaderParticipant.id_card_public_id,
                mimeType: leaderParticipant.id_card_mime_type,
                resourceType: leaderParticipant.id_card_resource_type,
              }
            : null,
          profilePhoto: leaderParticipant.profile_photo_url
            ? {
                url: leaderParticipant.profile_photo_url,
                publicId: leaderParticipant.profile_photo_public_id,
                mimeType: leaderParticipant.profile_photo_mime_type,
                resourceType: leaderParticipant.profile_photo_resource_type,
              }
            : null,
        },
        idCardUrl: leaderParticipant.id_card_url || null,
        profilePhotoUrl: leaderParticipant.profile_photo_url || null,
        createdAt: leaderParticipant.created_at || reg.created_at,
        updatedAt: leaderParticipant.updated_at || reg.updated_at,
      });
    } else if (reg.user) {
      unifiedParticipants.push({
        id: reg.user.id,
        participantOrder: 1,
        participantRole: reg.registration_type === 'TEAM' ? 'LEADER' : 'INDIVIDUAL',
        isLeader: true,
        fullName: reg.user.name || '—',
        email: reg.user.email || '—',
        mobileNumber: reg.user.phone || '—',
        institutionName: reg.user.college_name || '—',
        institution: reg.user.college_name || '—',
        city: '—',
        studentId: '—',
        standardClass: '—',
        customFields: {},
        documents: { idCard: null, profilePhoto: null },
        idCardUrl: null,
        profilePhotoUrl: reg.user.profile_image || null,
        createdAt: reg.user.created_at || reg.created_at,
        updatedAt: reg.user.created_at || reg.updated_at,
      });
    }

    // Append additional members to unified participants roster
    additionalMembers.forEach((m, idx) => {
      unifiedParticipants.push({
        id: m.id,
        participantOrder: idx + 2,
        participantRole: 'MEMBER',
        isLeader: false,
        fullName: m.fullName || m.name,
        email: m.email,
        mobileNumber: m.mobileNumber,
        institutionName: m.institutionName,
        institution: m.institution,
        city: m.city,
        studentId: m.studentId,
        standardClass: m.standardClass,
        customFields: m.customFields || {},
        documents: m.documents || { idCard: null, profilePhoto: null },
        idCardUrl: m.idCardUrl,
        profilePhotoUrl: m.profilePhotoUrl,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      });
    });

    const leaderObj = reg.user
      ? {
          id: reg.user.id,
          name: leaderParticipant?.full_name || reg.user.name || '—',
          email: leaderParticipant?.email || reg.user.email || '—',
          phone: leaderParticipant?.mobile_number || reg.user.phone || '—',
          institution: leaderParticipant?.institution_name || reg.user.college_name || '—',
          profileImage: reg.user.profile_image,
          role: reg.user.role,
          isActive: reg.user.is_active,
          createdAt: reg.user.created_at,
        }
      : null;

    let teamResponse = null;
    if (resolvedTeam) {
      teamResponse = {
        id: resolvedTeam.id,
        teamName: resolvedTeam.team_name || '—',
        status: resolvedTeam.status,
        createdAt: resolvedTeam.created_at,
        updatedAt: resolvedTeam.updated_at,
        leader: resolvedTeam.leader
          ? {
              id: resolvedTeam.leader.id,
              name: leaderParticipant?.full_name || resolvedTeam.leader.name || '—',
              email: leaderParticipant?.email || resolvedTeam.leader.email || '—',
              phone: leaderParticipant?.mobile_number || resolvedTeam.leader.phone || '—',
              institution: leaderParticipant?.institution_name || resolvedTeam.leader.college_name || '—',
            }
          : leaderObj,
        members: additionalMembers.map((m, idx) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          phone: m.phone,
          mobileNumber: m.mobileNumber,
          institution: m.institution,
          institutionName: m.institutionName,
          standardClass: m.standardClass,
          memberOrder: idx + 1,
          createdAt: m.createdAt,
        })),
        memberCount,
        totalTeamSize,
      };
    } else if (reg.registration_type === 'TEAM') {
      teamResponse = {
        id: null,
        teamName: '—',
        status: 'PENDING',
        createdAt: reg.created_at,
        updatedAt: reg.updated_at,
        leader: leaderObj,
        members: additionalMembers.map((m, idx) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          phone: m.phone,
          mobileNumber: m.mobileNumber,
          institution: m.institution,
          institutionName: m.institutionName,
          standardClass: m.standardClass,
          memberOrder: idx + 1,
          createdAt: m.createdAt,
        })),
        memberCount,
        totalTeamSize,
      };
    }

    return {
      id: reg.id,
      registrationId: reg.registration_id,
      eventId: reg.event_id || reg.event?.id,
      registrationType: reg.registration_type,
      status: reg.status,
      paymentStatus,
      payableAmount,
      createdAt: reg.created_at,
      updatedAt: reg.updated_at,
      totalParticipants,
      event: reg.event
        ? {
            id: reg.event.id,
            name: reg.event.name,
            slug: reg.event.slug,
            description: reg.event.description,
            category: reg.event.category,
            trackId: reg.event.track_id,
            track_id: reg.event.track_id,
            track: reg.event.track
              ? {
                  id: reg.event.track.id,
                  name: reg.event.track.name,
                  slug: reg.event.track.slug,
                  description: reg.event.track.description,
                  isActive: reg.event.track.is_active,
                }
              : null,
            registrationType: reg.event.registration_type,
            minTeamSize: reg.event.min_team_size,
            maxTeamSize: reg.event.max_team_size,
            fee: Number(reg.event.fee || 0),
            isActive: reg.event.is_active,
            registrationOpen: reg.event.registration_open,
          }
        : null,
      leader: leaderObj,
      team: teamResponse,
      participants: unifiedParticipants,
      payment: latestTx
        ? {
            status: latestTx.status,
            transactionId: latestTx.transaction_id,
            amount: Number(latestTx.amount),
            currency: latestTx.currency || 'INR',
            gateway: latestTx.gateway,
            gatewayReference: latestTx.gateway_reference,
            paymentMode: latestTx.gateway_payment_mode,
            failureReason: latestTx.failure_reason,
            createdAt: latestTx.created_at,
            updatedAt: latestTx.updated_at,
            transactions: transactions.map((tx) => ({
              id: tx.id,
              transactionId: tx.transaction_id,
              status: tx.status,
              amount: Number(tx.amount),
              currency: tx.currency,
              gateway: tx.gateway,
              gatewayReference: tx.gateway_reference,
              paymentMode: tx.gateway_payment_mode,
              failureReason: tx.failure_reason,
              createdAt: tx.created_at,
            })),
          }
        : {
            status: paymentStatus,
            transactionId: null,
            amount: payableAmount,
            currency: 'INR',
            gateway: null,
            gatewayReference: null,
            paymentMode: null,
            failureReason: null,
            createdAt: null,
            updatedAt: null,
            transactions: [],
          },
    };
  },

  /**
   * Paginated, searchable, and filterable list of teams.
   */
  listTeams: async ({
    page = 1,
    limit = 20,
    search = '',
    eventId = '',
    status = '',
    teamStatus = '',
    registrationStatus = '',
  }) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const cleanSearch = sanitizeSearchTerm(search);

    let matchingLeaderIds = [];
    if (cleanSearch) {
      const { data: matchedUsers } = await client
        .from('users')
        .select('id')
        .or(`email.ilike.%${cleanSearch}%,name.ilike.%${cleanSearch}%`)
        .limit(100);

      if (matchedUsers) {
        matchingLeaderIds = matchedUsers.map((u) => u.id);
      }
    }

    let query = client
      .from('teams')
      .select(
        `
        id,
        team_name,
        status,
        created_at,
        updated_at,
        event:events(id, name, slug, fee, min_team_size, max_team_size, track_id, track:tracks(id, name, slug)),
        leader:users(id, name, email, phone, college_name),
        members:team_members(id, name, member_order),
        registration:registrations(
          id,
          registration_id,
          status,
          created_at,
          payment_transactions(id, status, amount, created_at)
        )
      `,
        { count: 'exact' }
      );

    if (cleanSearch) {
      const orClauses = [`team_name.ilike.%${cleanSearch}%`];
      if (matchingLeaderIds.length > 0) {
        orClauses.push(`leader_user_id.in.(${matchingLeaderIds.join(',')})`);
      }
      query = query.or(orClauses.join(','));
    }

    if (eventId && UUID_REGEX.test(eventId)) {
      query = query.eq('event_id', eventId);
    }

    // Filter by team status ('DRAFT', 'SUBMITTED', 'CANCELLED')
    const effectiveTeamStatus = (
      teamStatus ||
      (status && ['DRAFT', 'SUBMITTED', 'CANCELLED'].includes(status.toUpperCase()) ? status : '')
    ).toUpperCase();

    if (effectiveTeamStatus) {
      query = query.eq('status', effectiveTeamStatus);
    }

    // Filter by registration status ('PAYMENT_PENDING', 'CONFIRMED', 'PAYMENT_SUCCESS', 'CANCELLED', etc.)
    const effectiveRegStatus = (
      registrationStatus ||
      (status && !['DRAFT', 'SUBMITTED', 'CANCELLED'].includes(status.toUpperCase()) ? status : '')
    ).toUpperCase();

    if (effectiveRegStatus) {
      const { data: matchedRegs } = await client
        .from('registrations')
        .select('team_id')
        .eq('status', effectiveRegStatus)
        .not('team_id', 'is', null);

      const matchingTeamIds = Array.from(new Set((matchedRegs || []).map((r) => r.team_id).filter(Boolean)));
      if (matchingTeamIds.length === 0) {
        return {
          teams: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalRecords: 0,
            totalPages: 1,
          },
        };
      }
      query = query.in('id', matchingTeamIds);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data: rows, count: totalRecords, error } = await query;

    if (error) {
      logger.error('Error querying teams list:', error);
      throw error;
    }

    // For teams with no registration linked via foreign key, check for fallback registration matching event and leader
    const unlinkedTeams = (rows || []).filter((t) => !t.registration || t.registration.length === 0);
    const fallbackRegsMap = {};
    if (unlinkedTeams.length > 0) {
      const leaderIds = Array.from(new Set(unlinkedTeams.map((t) => t.leader?.id).filter(Boolean)));
      const evIds = Array.from(new Set(unlinkedTeams.map((t) => t.event?.id).filter(Boolean)));
      if (leaderIds.length > 0 && evIds.length > 0) {
        const { data: fbRegs } = await client
          .from('registrations')
          .select(`
            id,
            registration_id,
            user_id,
            event_id,
            status,
            created_at,
            payment_transactions(id, status, amount, created_at),
            participants:registration_participants(id, participant_order, participant_role)
          `)
          .in('user_id', leaderIds)
          .in('event_id', evIds)
          .order('created_at', { ascending: false });

        if (Array.isArray(fbRegs)) {
          for (const reg of fbRegs) {
            const key = `${reg.user_id}_${reg.event_id}`;
            if (!fallbackRegsMap[key]) {
              fallbackRegsMap[key] = reg;
            }
          }
        }
      }
    }

    const formattedTeams = (rows || []).map((t) => {
      const members = t.members || [];
      const regList = Array.isArray(t.registration) ? [...t.registration] : [];
      regList.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      let activeReg = regList.find((r) => r.status !== 'CANCELLED') || regList[0] || null;

      if (!activeReg && t.leader?.id && t.event?.id) {
        const key = `${t.leader.id}_${t.event.id}`;
        if (fallbackRegsMap[key]) {
          activeReg = fallbackRegsMap[key];
        }
      }

      let resolvedPaymentStatus = null;
      if (activeReg) {
        const txs = Array.isArray(activeReg.payment_transactions) ? [...activeReg.payment_transactions] : [];
        txs.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        const latestTx = txs[0] || null;
        const isPaid = activeReg.status === 'CONFIRMED' || activeReg.status === 'PAYMENT_SUCCESS';
        resolvedPaymentStatus = latestTx
          ? latestTx.status
          : isPaid
          ? 'SUCCESS'
          : activeReg.status === 'PAYMENT_PENDING'
          ? 'PENDING'
          : 'INITIATED';
      }

      const participantsList = activeReg?.participants || [];
      const memberParticipants = participantsList.filter(
        (p) => p.participant_order > 1 || p.participant_role === 'MEMBER'
      );
      const effectiveMemberCount = members.length > 0 ? members.length : memberParticipants.length;
      const totalTeamSize = Math.max(1 + effectiveMemberCount, participantsList.length > 0 ? participantsList.length : 1);

      return {
        id: t.id,
        teamName: t.team_name,
        status: t.status,
        teamStatus: t.status,
        registrationStatus: activeReg ? activeReg.status : null,
        paymentStatus: resolvedPaymentStatus,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        event: t.event
          ? {
              id: t.event.id,
              name: t.event.name,
              slug: t.event.slug,
              fee: Number(t.event.fee || 0),
              minTeamSize: t.event.min_team_size,
              maxTeamSize: t.event.max_team_size,
              trackId: t.event.track_id,
              track: t.event.track
                ? {
                    id: t.event.track.id,
                    name: t.event.track.name,
                    slug: t.event.track.slug,
                  }
                : null,
            }
          : null,
        leader: t.leader
          ? {
              id: t.leader.id,
              name: t.leader.name,
              email: t.leader.email,
              phone: t.leader.phone,
              institution: t.leader.college_name,
            }
          : null,
        memberCount: effectiveMemberCount,
        totalTeamSize,
        registration: activeReg
          ? {
              id: activeReg.id,
              registrationId: activeReg.registration_id,
              status: activeReg.status,
              paymentStatus: resolvedPaymentStatus,
              createdAt: activeReg.created_at,
            }
          : null,
      };
    });

    const total = totalRecords || 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      teams: formattedTeams,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords: total,
        totalPages,
      },
    };
  },

  /**
   * Fetch complete team details by UUID.
   */
  getTeamDetails: async (teamId) => {
    if (!teamId || !UUID_REGEX.test(teamId)) {
      return null;
    }

    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data: team, error } = await client
      .from('teams')
      .select(
        `
        id,
        team_name,
        status,
        created_at,
        updated_at,
        event:events(*, track:tracks(id, name, slug, description, is_active)),
        leader:users(id, name, email, phone, college_name, profile_image, role, is_active, created_at),
        members:team_members(id, name, member_order, created_at),
        registration:registrations(
          id,
          registration_id,
          status,
          registration_type,
          created_at,
          payment_transactions(id, status, amount, created_at),
          participants:registration_participants(*)
        )
      `
      )
      .eq('id', teamId)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching team details:', error);
      throw error;
    }

    if (!team) {
      return null;
    }

    let members = [];
    if (Array.isArray(team.members)) {
      members = [...team.members].sort(
        (a, b) => (a.member_order || 0) - (b.member_order || 0)
      );
    }

    const regList = Array.isArray(team.registration) ? [...team.registration] : [];
    regList.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    let reg = regList.find((r) => r.status !== 'CANCELLED') || regList[0] || null;

    if (!reg && team.leader?.id) {
      const targetEventId = team.event?.id || team.event_id;
      if (targetEventId) {
        const { data: fallbackReg } = await client
          .from('registrations')
          .select(`
            id,
            registration_id,
            status,
            registration_type,
            created_at,
            payment_transactions(id, status, amount, created_at),
            participants:registration_participants(*)
          `)
          .eq('user_id', team.leader.id)
          .eq('event_id', targetEventId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fallbackReg) {
          reg = fallbackReg;
        }
      }
    }

    let resolvedPaymentStatus = null;
    if (reg) {
      const txs = Array.isArray(reg.payment_transactions) ? [...reg.payment_transactions] : [];
      txs.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      const latestTx = txs[0] || null;
      const isPaid = reg.status === 'CONFIRMED' || reg.status === 'PAYMENT_SUCCESS';
      resolvedPaymentStatus = latestTx
        ? latestTx.status
        : isPaid
        ? 'SUCCESS'
        : reg.status === 'PAYMENT_PENDING'
        ? 'PENDING'
        : 'INITIATED';
    }

    let participants = [];
    if (reg && Array.isArray(reg.participants)) {
      participants = [...reg.participants].sort(
        (a, b) => (a.participant_order || 0) - (b.participant_order || 0)
      );
    }

    const leaderPart = participants.find((p) => p.participant_role === 'LEADER' || p.participant_order === 1) || null;
    const memberParts = participants.filter((p) => p.id !== leaderPart?.id && (p.participant_role === 'MEMBER' || p.participant_order > 1));

    // Resolve members roster with deduplication and rich attributes
    const additionalMembers = [];
    const seenMemberKeys = new Set();

    for (const p of memberParts) {
      const isLeaderDupe =
        leaderPart &&
        ((p.email && leaderPart.email && p.email.toLowerCase().trim() === leaderPart.email.toLowerCase().trim()) ||
          (p.full_name &&
            leaderPart.full_name &&
            p.full_name.toLowerCase().trim() === leaderPart.full_name.toLowerCase().trim()));
      if (isLeaderDupe) continue;

      const dedupeKey =
        (p.email ? p.email.toLowerCase().trim() : '') ||
        (p.full_name ? p.full_name.toLowerCase().trim() : '') ||
        p.id;
      if (!seenMemberKeys.has(dedupeKey)) {
        seenMemberKeys.add(dedupeKey);
        additionalMembers.push({
          id: p.id,
          name: p.full_name || '—',
          fullName: p.full_name || '—',
          email: p.email || '—',
          phone: p.mobile_number || '—',
          mobileNumber: p.mobile_number || '—',
          institution: p.institution_name || '—',
          institutionName: p.institution_name || '—',
          standardClass: p.standard_class || '—',
          memberOrder: p.participant_order ? Math.max(1, p.participant_order - 1) : additionalMembers.length + 1,
          createdAt: p.created_at || team.created_at,
        });
      }
    }

    for (const tm of members) {
      const tmName = (tm.name || '').toLowerCase().trim();
      const isLeaderName =
        (team.leader?.name && tmName === team.leader.name.toLowerCase().trim()) ||
        (leaderPart?.full_name && tmName === leaderPart.full_name.toLowerCase().trim());

      const alreadyCovered =
        seenMemberKeys.has(tmName) ||
        seenMemberKeys.has(tm.id) ||
        additionalMembers.some((m) => m.name.toLowerCase().trim() === tmName);

      if (!alreadyCovered && (!isLeaderName || participants.length === 0)) {
        seenMemberKeys.add(tmName || tm.id);
        additionalMembers.push({
          id: tm.id,
          name: tm.name || '—',
          fullName: tm.name || '—',
          email: '—',
          phone: '—',
          mobileNumber: '—',
          institution: '—',
          institutionName: '—',
          standardClass: '—',
          memberOrder: tm.member_order || additionalMembers.length + 1,
          createdAt: tm.created_at || team.created_at,
        });
      }
    }

    const effectiveMemberCount = additionalMembers.length;
    const totalTeamSize = 1 + effectiveMemberCount;

    return {
      id: team.id,
      teamName: team.team_name,
      status: team.status,
      teamStatus: team.status,
      registrationStatus: reg ? reg.status : null,
      paymentStatus: resolvedPaymentStatus,
      createdAt: team.created_at,
      updatedAt: team.updated_at,
      totalTeamSize,
      event: team.event
        ? {
            id: team.event.id,
            name: team.event.name,
            slug: team.event.slug,
            description: team.event.description,
            category: team.event.category,
            registrationType: team.event.registration_type,
            minTeamSize: team.event.min_team_size,
            maxTeamSize: team.event.max_team_size,
            fee: Number(team.event.fee || 0),
            isActive: team.event.is_active,
            registrationOpen: team.event.registration_open,
            trackId: team.event.track_id,
            track: team.event.track
              ? {
                  id: team.event.track.id,
                  name: team.event.track.name,
                  slug: team.event.track.slug,
                }
              : null,
          }
        : null,
      leader: team.leader
        ? {
            id: team.leader.id,
            name: team.leader.name,
            email: team.leader.email,
            phone: team.leader.phone,
            institution: team.leader.college_name,
            profileImage: team.leader.profile_image,
            role: team.leader.role,
            isActive: team.leader.is_active,
            createdAt: team.leader.created_at,
          }
        : null,
      members: additionalMembers,
      memberCount: effectiveMemberCount,
      registration: reg
        ? {
            id: reg.id,
            registrationId: reg.registration_id,
            status: reg.status,
            registrationType: reg.registration_type,
            paymentStatus: resolvedPaymentStatus,
            createdAt: reg.created_at,
          }
        : null,
      participants: participants.map((p) => ({
        id: p.id,
        participantOrder: p.participant_order,
        participantRole: p.participant_role,
        fullName: p.full_name,
        email: p.email,
        mobileNumber: p.mobile_number,
        institutionName: p.institution_name,
        city: p.city,
        studentId: p.student_id,
        standardClass: p.standard_class,
        customFields: p.custom_fields || {},
        documents: {
          idCard: p.id_card_url
            ? {
                url: p.id_card_url,
                publicId: p.id_card_public_id,
                mimeType: p.id_card_mime_type,
                resourceType: p.id_card_resource_type,
              }
            : null,
          profilePhoto: p.profile_photo_url
            ? {
                url: p.profile_photo_url,
                publicId: p.profile_photo_public_id,
                mimeType: p.profile_photo_mime_type,
                resourceType: p.profile_photo_resource_type,
              }
            : null,
        },
        idCardUrl: p.id_card_url || null,
        profilePhotoUrl: p.profile_photo_url || null,
      })),
    };
  },
};

export default adminRegistrationService;
