import RegistrationModel from '../models/registration.model.js';
import RegistrationParticipantModel from '../models/registrationParticipant.model.js';
import UserModel from '../models/user.model.js';
import TeamModel from '../models/team.model.js';
import EventModel from '../models/event.model.js';
import { getSupabaseClient } from '../config/database.js';
import eventService from './event.service.js';
import teamService from './team.service.js';
import userService from './user.service.js';
import { calculatePayableAmount } from './payment.service.js';
import { generateRegistrationId } from '../utils/registrationId.js';
import logger from '../utils/logger.util.js';

/**
 * Format registration database record into standardized API response object
 */
export const formatRegistrationResponse = (reg) => {
  if (!reg) return null;

  let payableAmount = null;
  if (reg.event) {
    try {
      payableAmount = calculatePayableAmount(reg.event, reg, reg.participants || []);
    } catch {
      payableAmount = null;
    }
  }

  return {
    id: reg.id,
    registrationId: reg.registration_id,
    userId: reg.user_id,
    eventId: reg.event_id,
    teamId: reg.team_id || null,
    registrationType: reg.registration_type,
    status: reg.status,
    payableAmount,
    createdAt: reg.created_at,
    updatedAt: reg.updated_at,
    event: reg.event
      ? {
          id: reg.event.id,
          name: reg.event.name,
          slug: reg.event.slug,
          category: reg.event.category || null,
          track: reg.event.track || reg.event.category || null,
          eventType: reg.event.event_type || null,
          registrationType: reg.event.registration_type,
          fee: Number(reg.event.fee || 0),
          currency: reg.event.currency || 'INR',
        }
      : undefined,
    team: reg.team
      ? {
          id: reg.team.id,
          teamName: reg.team.team_name,
          status: reg.team.status,
          members: (reg.team.members || []).map((m) => ({
            id: m.id,
            name: m.name,
            memberOrder: m.member_order,
          })),
          teamSize: 1 + (reg.team.members?.length || 0),
        }
      : undefined,
    user: reg.user
      ? {
          id: reg.user.id,
          name: reg.user.name || null,
          email: reg.user.email,
          phone: reg.user.phone || null,
          collegeName: reg.user.college_name || null,
        }
      : undefined,
    participants: (reg.participants || []).map((p) => ({
      id: p.id,
      teamMemberId: p.team_member_id || null,
      participantOrder: p.participant_order,
      participantRole: p.participant_role,
      fullName: p.full_name,
      institutionName: p.institution_name,
      mobileNumber: p.mobile_number,
      email: p.email,
      city: p.city || null,
      studentId: p.student_id || null,
      standardClass: p.standard_class || null,
      idCardUrl: p.id_card_url || null,
      profilePhotoUrl: p.profile_photo_url || null,
      customFields: p.custom_fields || {},
    })),
  };
};

/**
 * Format lightweight registration index record for global frontend cache.
 * Excludes heavy documents, participants snapshots, and payment transaction details.
 */
export const formatRegistrationIndexItem = (reg) => {
  if (!reg) return null;
  return {
    id: reg.id,
    registrationId: reg.registration_id,
    userId: reg.user_id,
    eventId: reg.event_id,
    eventSlug: reg.event?.slug || null,
    eventName: reg.event?.name || null,
    teamId: reg.team_id || null,
    teamName: reg.team?.team_name || null,
    registrationType: reg.registration_type,
    status: reg.status,
    createdAt: reg.created_at,
    updatedAt: reg.updated_at,
  };
};

/**
 * Helper to resolve the authenticated PostgreSQL user from Firebase auth context.
 * Never trusts any client-provided user_id or email.
 */
export const resolvePostgresUser = async (firebaseUser) => {
  if (!firebaseUser?.uid) {
    const error = new Error('Authentication required. Missing verified Firebase user.');
    error.statusCode = 401;
    throw error;
  }

  // 1. Look up existing PostgreSQL user by Firebase UID
  let dbUser = await UserModel.findByFirebaseUid(firebaseUser.uid);

  // 2. If not yet synchronized, create user record in PostgreSQL
  if (!dbUser) {
    await userService.getOrCreateUserFromFirebase(firebaseUser);
    dbUser = await UserModel.findByFirebaseUid(firebaseUser.uid);
  }

  if (!dbUser) {
    const error = new Error('Unable to resolve user profile in database.');
    error.statusCode = 500;
    throw error;
  }

  return dbUser;
};

/**
 * Registration Service
 * Business logic layer for event registrations, availability checks, duplicate protection, and ownership rules.
 */
export const registrationService = {
  /**
   * Create a new event registration for the authenticated user.
   *
   * @param {Object} firebaseUser - Verified user attached by auth middleware
   * @param {Object} payload - { event_id, registration_type }
   * @returns {Promise<Object>} Created registration details
   */
  createRegistration: async (firebaseUser, payload) => {
    // 1. Resolve PostgreSQL user identity securely
    const user = await resolvePostgresUser(firebaseUser);

    const rawEventId = (payload.event_id || payload.eventId || '').trim();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawEventId);
    let event = null;
    if (isUUID) {
      event = await EventModel.getEventById(rawEventId);
    } else {
      event = await EventModel.getEventBySlug(rawEventId.toLowerCase());
    }

    if (!event) {
      const error = new Error('Event not found with the provided identifier');
      error.statusCode = 404;
      throw error;
    }

    const eventId = event.id;
    const registrationType = (payload.registration_type || payload.registrationType || 'INDIVIDUAL').toUpperCase();

    // 2. Validate event availability and configuration
    const validation = await eventService.validateEventForRegistration(eventId, registrationType);
    if (!validation.isValid) {
      const error = new Error(validation.message);
      error.statusCode = validation.statusCode || 400;
      error.code = validation.code;
      throw error;
    }

    // 3. Server-side duplicate registration protection
    // Check if the user already has an active registration for this event
    const activeStatuses = ['DRAFT', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'CONFIRMED'];
    const existingRegistration = await RegistrationModel.checkExistingRegistration(
      user.id,
      eventId,
      activeStatuses
    );

    if (existingRegistration) {
      const error = new Error(
        `You already have an active registration for this event (Registration ID: ${existingRegistration.registration_id}, Status: ${existingRegistration.status})`
      );
      error.statusCode = 409;
      error.data = {
        existingRegistrationId: existingRegistration.registration_id,
        status: existingRegistration.status,
      };
      throw error;
    }

    // 4. Team Association & Validation for TEAM registrations
    let teamIdToAssociate = null;
    let newlyCreatedTeamId = null;
    const requestedTeamId = (payload.team_id || payload.teamId || '').trim();
    const rawParticipants = payload.participants || payload.participantDetails;
    const rawParticipantsCount = Array.isArray(rawParticipants) ? rawParticipants.length : 0;

    if (registrationType === 'TEAM') {
      let teamValidation = null;
      if (requestedTeamId) {
        teamValidation = await teamService.validateTeamForRegistration(
          requestedTeamId,
          eventId,
          user.id,
          rawParticipantsCount,
          ['DRAFT', 'SUBMITTED']
        );
      } else {
        // Find existing active team created by this leader for this event
        const activeTeam = await TeamModel.findActiveTeamByLeaderAndEvent(user.id, eventId);
        if (activeTeam) {
          teamValidation = await teamService.validateTeamForRegistration(
            activeTeam.id,
            eventId,
            user.id,
            rawParticipantsCount,
            ['DRAFT', 'SUBMITTED']
          );
        }
      }

      if (teamValidation) {
        if (!teamValidation.isValid) {
          const error = new Error(teamValidation.message);
          error.statusCode = teamValidation.statusCode || 400;
          throw error;
        }
        teamIdToAssociate = teamValidation.team.id;
      } else {
        // Automatically create team record so team registrations are never orphaned without a team
        const requestedTeamName = (
          payload.team_name ||
          payload.teamName ||
          `${user.name || 'Participant'}'s Team`
        ).trim();

        const createdTeam = await TeamModel.createTeam({
          event_id: eventId,
          leader_user_id: user.id,
          team_name: requestedTeamName,
          status: 'DRAFT',
        });
        teamIdToAssociate = createdTeam.id;
        newlyCreatedTeamId = createdTeam.id;
      }
    }

    // 5. Generate unique, non-sequential registration ID
    let registrationId = generateRegistrationId();
    let collisionCheck = await RegistrationModel.getRegistrationByRegistrationId(registrationId);
    let attempts = 0;

    while (collisionCheck && attempts < 5) {
      registrationId = generateRegistrationId();
      collisionCheck = await RegistrationModel.getRegistrationByRegistrationId(registrationId);
      attempts++;
    }

    // 6. Create registration record in PostgreSQL (DRAFT by default, or requested valid status)
    const requestedStatus = (payload.status || 'DRAFT').toUpperCase();
    const initialStatus = ['DRAFT', 'PAYMENT_PENDING'].includes(requestedStatus)
      ? requestedStatus
      : 'DRAFT';

    const registrationRecord = await RegistrationModel.createRegistration({
      registration_id: registrationId,
      user_id: user.id,
      event_id: eventId,
      team_id: teamIdToAssociate,
      registration_type: registrationType,
      status: initialStatus,
    });

    // 7. Store participant snapshot records and persist team members
    const createdTeamMemberIds = [];
    try {
      let participantsToInsert = [];

      if (Array.isArray(rawParticipants) && rawParticipants.length > 0) {
        // If team is associated, fetch existing team members
        let existingMembers = [];
        if (teamIdToAssociate) {
          existingMembers = await TeamModel.getTeamMembers(teamIdToAssociate);
        }

        for (let index = 0; index < rawParticipants.length; index++) {
          const p = rawParticipants[index];
          const fullName = (p.full_name || p.fullName || p.name || (index === 0 ? user.name : '') || `Participant ${index + 1}`).trim();
          const institutionName = (p.institution_name || p.institution || p.college || user.college_name || '').trim();
          const mobileNumber = (p.mobile_number || p.mobile || p.phone || (index === 0 ? user.phone : '') || '').trim();
          const email = (p.email || (index === 0 ? user.email : '') || '').trim();
          const city = (p.city || '').trim();
          const studentId = (p.student_id || p.studentId || '').trim();
          const standardClass = (p.standard_class || p.standard || p.year || p.course || '').trim();
          const idCardUrl = p.id_card_url || p.idCardUrl || null;
          const profilePhotoUrl = p.profile_photo_url || p.profilePhotoUrl || null;

          const {
            full_name, fullName: _fn, name: _n,
            institution_name: _in, institution: _i, college: _c,
            mobile_number: _mn, mobile: _m, phone: _p,
            email: _e, city: _ct, student_id: _si, studentId: _sid,
            id_card_url: _icu, idCardUrl: _icurl,
            profile_photo_url: _ppu, profilePhotoUrl: _ppurl,
            ...customFields
          } = p;

          let teamMemberId = null;
          // For TEAM registrations, persist additional members (index >= 1) in team_members
          // Never duplicate the team leader as an additional member (leader is teams.leader_user_id)
          if (teamIdToAssociate && index > 0) {
            const memberName = fullName || `Member ${index + 1}`;
            const matchedMember = existingMembers.find(
              (m) => m.member_order === index || m.name.toLowerCase().trim() === memberName.toLowerCase()
            );

            if (matchedMember) {
              teamMemberId = matchedMember.id;
            } else {
              const newMember = await TeamModel.addTeamMember({
                team_id: teamIdToAssociate,
                name: memberName,
                member_order: index,
              });
              teamMemberId = newMember.id;
              createdTeamMemberIds.push(newMember.id);
              existingMembers.push(newMember);
            }
          }

          participantsToInsert.push({
            registration_id: registrationRecord.id,
            team_member_id: teamMemberId,
            participant_order: index + 1,
            participant_role: index === 0 ? 'LEADER' : 'MEMBER',
            full_name: fullName,
            institution_name: institutionName,
            mobile_number: mobileNumber,
            email: email,
            city: city,
            student_id: studentId,
            standard_class: standardClass,
            id_card_url: idCardUrl,
            profile_photo_url: profilePhotoUrl,
            custom_fields: customFields || {},
          });
        }
      } else if (teamIdToAssociate) {
        // If rawParticipants was not provided but a team is linked, build roster from leader and team_members
        const existingMembers = await TeamModel.getTeamMembers(teamIdToAssociate);

        // Leader
        participantsToInsert.push({
          registration_id: registrationRecord.id,
          team_member_id: null,
          participant_order: 1,
          participant_role: 'LEADER',
          full_name: (user.name || 'Team Leader').trim(),
          institution_name: (user.college_name || '').trim(),
          mobile_number: (user.phone || '').trim(),
          email: (user.email || '').trim(),
          city: '',
          student_id: '',
          standard_class: '',
          id_card_url: null,
          profile_photo_url: null,
          custom_fields: {},
        });

        // Members
        existingMembers.forEach((m, idx) => {
          participantsToInsert.push({
            registration_id: registrationRecord.id,
            team_member_id: m.id,
            participant_order: idx + 2,
            participant_role: 'MEMBER',
            full_name: m.name,
            institution_name: (user.college_name || '').trim(),
            mobile_number: '',
            email: '',
            city: '',
            student_id: '',
            standard_class: '',
            id_card_url: null,
            profile_photo_url: null,
            custom_fields: {},
          });
        });
      }

      if (participantsToInsert.length > 0) {
        await RegistrationParticipantModel.createParticipants(participantsToInsert);
      }
    } catch (partErr) {
      logger.error(`Error saving participants or members for registration ${registrationId}:`, partErr);
      // Atomic rollback on failure
      for (const mId of createdTeamMemberIds) {
        try {
          await TeamModel.removeTeamMember(mId);
        } catch (e) {
          logger.warn(`Rollback cleanup: unable to remove team member ${mId}:`, e);
        }
      }
      if (newlyCreatedTeamId) {
        try {
          await TeamModel.deleteTeam(newlyCreatedTeamId);
        } catch (e) {
          logger.warn(`Rollback cleanup: unable to delete team ${newlyCreatedTeamId}:`, e);
        }
      }
      try {
        await RegistrationModel.deleteRegistration(registrationRecord.id);
      } catch (e) {
        logger.warn(`Rollback cleanup: unable to delete registration ${registrationRecord.id}:`, e);
      }
      throw partErr;
    }

    logger.info(
      `Registration created: ${registrationId} for user ${user.id} (${user.email}) on event ${eventId} [${registrationType}]${teamIdToAssociate ? ' (Team: ' + teamIdToAssociate + ')' : ''}`
    );

    const freshRecord = await RegistrationModel.getRegistrationById(registrationRecord.id);
    return formatRegistrationResponse(freshRecord || registrationRecord);
  },

  /**
   * Fetch all registrations created by the authenticated user.
   * Supports optional filtering by eventSlug or eventId.
   *
   * @param {Object} firebaseUser - Verified user attached by auth middleware
   * @param {Object} [options] - Optional query filters (eventSlug, eventId, event)
   * @returns {Promise<Array>} List of user's registrations
   */
  getUserRegistrations: async (firebaseUser, options = {}) => {
    if (options?.format === 'index' || options?.mode === 'index') {
      return registrationService.getUserRegistrationIndex(firebaseUser, options);
    }

    const user = await resolvePostgresUser(firebaseUser);
    const registrations = await RegistrationModel.getUserRegistrations(user.id);
    let formatted = registrations.map(formatRegistrationResponse);

    const eventFilter = (options?.eventSlug || options?.eventId || options?.event || '').trim().toLowerCase();
    if (eventFilter) {
      formatted = formatted.filter((r) => {
        const matchesId = r.eventId && String(r.eventId).toLowerCase() === eventFilter;
        const matchesSlug = r.event?.slug && String(r.event.slug).toLowerCase() === eventFilter;
        return matchesId || matchesSlug;
      });
    }

    return formatted;
  },

  /**
   * Fetch lightweight registration index for the authenticated user.
   * Returns only essential identification and status fields without heavy participant snapshots or documents.
   *
   * @param {Object} firebaseUser - Verified user attached by auth middleware
   * @param {Object} [options] - Optional query filters (eventSlug, eventId, event)
   * @returns {Promise<Array>} Lightweight list of registration index items
   */
  getUserRegistrationIndex: async (firebaseUser, options = {}) => {
    const user = await resolvePostgresUser(firebaseUser);
    const registrations = await RegistrationModel.getUserRegistrationIndex(user.id);
    let formatted = registrations.map(formatRegistrationIndexItem);

    const eventFilter = (options?.eventSlug || options?.eventId || options?.event || '').trim().toLowerCase();
    if (eventFilter) {
      formatted = formatted.filter((r) => {
        const matchesId = r.eventId && String(r.eventId).toLowerCase() === eventFilter;
        const matchesSlug = r.eventSlug && String(r.eventSlug).toLowerCase() === eventFilter;
        return matchesId || matchesSlug;
      });
    }

    return formatted;
  },

  /**
   * Fetch details of a specific registration with strict ownership validation.
   * Users can only access their own registrations unless they possess ADMIN role.
   *
   * @param {Object} firebaseUser - Verified user attached by auth middleware
   * @param {string} identifier - registration_id (e.g. XVT-2026-ABC123) or UUID
   * @returns {Promise<Object>} Registration details
   */
  getRegistrationDetails: async (firebaseUser, identifier) => {
    const user = await resolvePostgresUser(firebaseUser);

    if (!identifier || typeof identifier !== 'string') {
      const error = new Error('Registration ID is required');
      error.statusCode = 400;
      throw error;
    }

    const cleanIdentifier = identifier.trim();

    // 1. Look up by human-readable registration_id first, then fallback to database UUID
    let registration = await RegistrationModel.getRegistrationByRegistrationId(cleanIdentifier);
    if (!registration) {
      registration = await RegistrationModel.getRegistrationById(cleanIdentifier);
    }

    // 2. Return 404 if not found
    if (!registration) {
      const error = new Error('Registration not found with the provided identifier');
      error.statusCode = 404;
      throw error;
    }

    // 3. Strict ownership check
    if (registration.user_id !== user.id && user.role !== 'ADMIN') {
      logger.warn(
        `Unauthorized access attempt: User ${user.id} (${user.email}) attempted to access registration ${cleanIdentifier} owned by ${registration.user_id}`
      );
      const error = new Error('Access denied. You do not have permission to view this registration.');
      error.statusCode = 403;
      throw error;
    }

    return formatRegistrationResponse(registration);
  },

  /**
   * Finalize and submit a registration to transition its status to PAYMENT_PENDING.
   * Performs end-to-end backend verification:
   * - Verified Firebase & PostgreSQL identity
   * - Strict registration ownership enforcement
   * - Current status validation (DRAFT -> PAYMENT_PENDING, or idempotent PAYMENT_PENDING)
   * - Event active & registration open checks
   * - Team size & member validations (if TEAM)
   * - Participant data integrity (name, phone, email)
   *
   * @param {Object} firebaseUser - Verified user attached by auth middleware
   * @param {string} identifier - registration_id (e.g. XVT-2026-ABC123) or UUID
   * @returns {Promise<Object>} Updated registration details in PAYMENT_PENDING status
   */
  submitRegistration: async (firebaseUser, identifier) => {
    const user = await resolvePostgresUser(firebaseUser);

    if (!identifier || typeof identifier !== 'string') {
      const error = new Error('Registration ID is required');
      error.statusCode = 400;
      throw error;
    }

    const cleanIdentifier = identifier.trim();

    // 1. Look up registration
    let registration = await RegistrationModel.getRegistrationByRegistrationId(cleanIdentifier);
    if (!registration) {
      registration = await RegistrationModel.getRegistrationById(cleanIdentifier);
    }

    if (!registration) {
      const error = new Error('Registration not found with the provided identifier');
      error.statusCode = 404;
      throw error;
    }

    // 2. Strict ownership check
    if (registration.user_id !== user.id && user.role !== 'ADMIN') {
      logger.warn(
        `Unauthorized submit attempt: User ${user.id} (${user.email}) attempted to submit registration ${cleanIdentifier} owned by ${registration.user_id}`
      );
      const error = new Error('Access denied. You do not have permission to submit this registration.');
      error.statusCode = 403;
      throw error;
    }

    // 3. Status checks
    if (registration.status === 'PAYMENT_PENDING') {
      // Idempotent: already submitted and waiting for payment
      return formatRegistrationResponse(registration);
    }

    if (registration.status === 'CONFIRMED' || registration.status === 'PAYMENT_SUCCESS') {
      const error = new Error('Registration is already confirmed and cannot be resubmitted.');
      error.statusCode = 400;
      throw error;
    }

    if (registration.status === 'CANCELLED') {
      const error = new Error('Cancelled registrations cannot be submitted.');
      error.statusCode = 400;
      throw error;
    }

    if (registration.status !== 'DRAFT') {
      const error = new Error(`Cannot submit registration with status: ${registration.status}`);
      error.statusCode = 400;
      throw error;
    }

    // 4. Validate event status & configuration
    const eventValidation = await eventService.validateEventForRegistration(
      registration.event_id,
      registration.registration_type,
      { excludeRegistrationId: registration.id }
    );
    if (!eventValidation.isValid) {
      const error = new Error(eventValidation.message);
      error.statusCode = eventValidation.statusCode || 400;
      error.code = eventValidation.code;
      throw error;
    }
    const event = eventValidation.event;

    // 5. Validate participant records
    let participants = registration.participants || [];
    if (participants.length === 0) {
      participants = await RegistrationParticipantModel.getParticipantsByRegistrationId(registration.id);
    }

    if (registration.registration_type === 'TEAM') {
      const minSize = event.min_team_size || 2;
      const maxSize = event.max_team_size || 4;

      if (registration.team_id) {
        const teamValidation = await teamService.validateTeamForRegistration(
          registration.team_id,
          registration.event_id,
          user.id,
          participants.length,
          ['DRAFT', 'SUBMITTED']
        );
        if (!teamValidation.isValid) {
          const error = new Error(teamValidation.message);
          error.statusCode = teamValidation.statusCode || 400;
          throw error;
        }
      } else {
        // Resolve or create team if missing
        let activeTeam = await TeamModel.findActiveTeamByLeaderAndEvent(user.id, registration.event_id);
        if (!activeTeam) {
          activeTeam = await TeamModel.createTeam({
            event_id: registration.event_id,
            leader_user_id: user.id,
            team_name: `${user.name || 'Participant'}'s Team`,
            status: 'SUBMITTED',
          });
        }
        const client = getSupabaseClient();
        if (client) {
          await client.from('registrations').update({ team_id: activeTeam.id }).eq('id', registration.id);
        }
        registration.team_id = activeTeam.id;
      }

      if (participants.length > 0 && participants.length < minSize) {
        const error = new Error(
          `Team registration requires at least ${minSize} participant(s) (found ${participants.length})`
        );
        error.statusCode = 400;
        throw error;
      }

      if (participants.length > maxSize) {
        const error = new Error(
          `Team registration cannot exceed ${maxSize} participant(s) (found ${participants.length})`
        );
        error.statusCode = 400;
        throw error;
      }
    } else {
      // Individual registration
      if (participants.length > 1) {
        const error = new Error('Individual registration cannot have more than 1 participant');
        error.statusCode = 400;
        throw error;
      }
    }

    // Primary participant (leader) validations
    const leader = participants.find((p) => p.participant_order === 1) || participants[0];
    if (leader) {
      if (!leader.full_name || leader.full_name.trim().length < 2) {
        const error = new Error('Primary participant must provide a valid full name (at least 2 characters)');
        error.statusCode = 400;
        throw error;
      }
      if (leader.mobile_number) {
        const cleanMobile = String(leader.mobile_number).replace(/\D/g, '');
        if (cleanMobile.length !== 10) {
          const error = new Error('Primary participant mobile number must be exactly 10 digits');
          error.statusCode = 400;
          throw error;
        }
      }
    }

    // 6. Transition status to PAYMENT_PENDING
    const updated = await RegistrationModel.updateRegistrationStatus(registration.id, 'PAYMENT_PENDING');

    // 7. Ensure linked team status transitions to SUBMITTED
    if (registration.team_id) {
      try {
        await TeamModel.updateTeam(registration.team_id, { status: 'SUBMITTED' });
      } catch (tErr) {
        logger.warn(`Notice: could not update team status for team ${registration.team_id}:`, tErr);
      }
    }

    logger.info(
      `Registration ${registration.registration_id} transitioned to PAYMENT_PENDING for user ${user.id} (${user.email})`
    );

    return formatRegistrationResponse(updated);
  },
};

export default registrationService;
