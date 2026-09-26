import { REGISTRATION_STATUS } from '../utils/constants.util.js';

/**
 * Registration Service Placeholder
 *
 * Implements the lifecycle defined in XAVITECH_REGISTRATION_FLOW.md:
 * DRAFT -> PAYMENT_PENDING -> PAYMENT_SUCCESS -> CONFIRMED (or PAYMENT_FAILED)
 *
 * Supports:
 * - Individual Registration
 * - Team Registration (Leader creates team & adds members without requiring member login)
 */

export const registrationService = {
  createDraftRegistration: async (userId, registrationData) => {
    // Placeholder logic: creates registration record with status: DRAFT
    return {
      registrationId: 'placeholder-reg-id',
      userId,
      status: REGISTRATION_STATUS.DRAFT,
      ...registrationData,
    };
  },

  addTeamMembers: async (registrationId, leaderId, teamData) => {
    // Placeholder logic: creates team and attaches members
    return {
      registrationId,
      teamName: teamData.teamName,
      membersCount: teamData.members?.length || 0,
      status: REGISTRATION_STATUS.DRAFT,
    };
  },

  getRegistrationDetails: async (registrationId) => {
    // Placeholder logic
    return {
      registrationId,
      status: REGISTRATION_STATUS.CONFIRMED,
    };
  },

  updateRegistrationStatus: async (registrationId, newStatus) => {
    // Placeholder logic
    return {
      registrationId,
      status: newStatus,
    };
  },
};

export default registrationService;
