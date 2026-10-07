import RegistrationModel from '../models/registration.model.js';
import RegistrationParticipantModel from '../models/registrationParticipant.model.js';
import UserModel from '../models/user.model.js';
import TeamModel from '../models/team.model.js';
import EventModel from '../models/event.model.js';
import eventService from './event.service.js';
import teamService from './team.service.js';
import userService from './user.service.js';
import { generateRegistrationId } from '../utils/registrationId.js';
import logger from '../utils/logger.util.js';

/**
 * Format registration database record into standardized API response object
 */
export const formatRegistrationResponse = (reg) => {
  if (!reg) return null;

  return {
    id: reg.id,
    registrationId: reg.registration_id,
    userId: reg.user_id,
    eventId: reg.event_id,
    teamId: reg.team_id || null,
    registrationType: reg.registration_type,
    status: reg.status,
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
 * Helper to resolve the authenticated PostgreSQL user from Firebase auth context.
 * Never trusts any client-provided user_id or email.
 */
const resolvePostgresUser = async (firebaseUser) => {
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
    const requestedTeamId = (payload.team_id || payload.teamId || '').trim();

    if (registrationType === 'TEAM') {
      let teamValidation = null;
      if (requestedTeamId) {
        teamValidation = await teamService.validateTeamForRegistration(requestedTeamId, eventId, user.id);
      } else {
        // Find existing active team created by this leader for this event
        const activeTeam = await TeamModel.findActiveTeamByLeaderAndEvent(user.id, eventId);
        if (activeTeam) {
          teamValidation = await teamService.validateTeamForRegistration(activeTeam.id, eventId, user.id);
        }
      }

      if (teamValidation) {
        if (!teamValidation.isValid) {
          const error = new Error(teamValidation.message);
          error.statusCode = teamValidation.statusCode || 400;
          throw error;
        }
        teamIdToAssociate = teamValidation.team.id;
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

    // 6. Create draft registration record in PostgreSQL
    const registrationRecord = await RegistrationModel.createRegistration({
      registration_id: registrationId,
      user_id: user.id,
      event_id: eventId,
      team_id: teamIdToAssociate,
      registration_type: registrationType,
      status: 'DRAFT',
    });

    // 7. Store participant snapshot records in registration_participants table if provided
    const rawParticipants = payload.participants || payload.participantDetails;
    if (Array.isArray(rawParticipants) && rawParticipants.length > 0) {
      const participantsToInsert = rawParticipants.map((p, index) => {
        const fullName = (p.full_name || p.fullName || p.name || (index === 0 ? user.name : '') || `Participant ${index + 1}`).trim();
        const institutionName = (p.institution_name || p.institution || p.college || user.college_name || '').trim();
        const mobileNumber = (p.mobile_number || p.mobile || p.phone || (index === 0 ? user.phone : '') || '').trim();
        const email = (p.email || (index === 0 ? user.email : '') || '').trim();
        const city = (p.city || '').trim();
        const studentId = (p.student_id || p.studentId || '').trim();
        const standardClass = (p.standard_class || p.standard || p.year || p.course || '').trim();
        const idCardUrl = p.id_card_url || p.idCardUrl || null;

        // Collect extra event-specific fields into custom_fields
        const {
          full_name, fullName: _fn, name: _n,
          institution_name: _in, institution: _i, college: _c,
          mobile_number: _mn, mobile: _m, phone: _p,
          email: _e, city: _ct, student_id: _si, studentId: _sid,
          id_card_url: _icu, idCardUrl: _icurl,
          ...customFields
        } = p;

        return {
          registration_id: registrationRecord.id,
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
          custom_fields: customFields || {},
        };
      });

      try {
        await RegistrationParticipantModel.createParticipants(participantsToInsert);
      } catch (partErr) {
        logger.error(`Error saving participants for registration ${registrationId}:`, partErr);
      }
    }

    logger.info(
      `Registration created: ${registrationId} for user ${user.id} (${user.email}) on event ${eventId} [${registrationType}]${teamIdToAssociate ? ' (Team: ' + teamIdToAssociate + ')' : ''}`
    );

    const freshRecord = await RegistrationModel.getRegistrationById(registrationRecord.id);
    return formatRegistrationResponse(freshRecord || registrationRecord);
  },

  /**
   * Fetch all registrations created by the authenticated user.
   *
   * @param {Object} firebaseUser - Verified user attached by auth middleware
   * @returns {Promise<Array>} List of user's registrations
   */
  getUserRegistrations: async (firebaseUser) => {
    const user = await resolvePostgresUser(firebaseUser);
    const registrations = await RegistrationModel.getUserRegistrations(user.id);
    return registrations.map(formatRegistrationResponse);
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
};

export default registrationService;
