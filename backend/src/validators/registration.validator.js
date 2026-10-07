/**
 * Registration Request Validators
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates registration creation payload
 *
 * Accepts either snake_case or camelCase keys:
 * - event_id / eventId (required, UUID)
 * - registration_type / registrationType ('INDIVIDUAL' | 'TEAM', default: 'INDIVIDUAL')
 */
export const validateRegistrationCreate = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Request body must be a valid JSON object'],
    };
  }

  const eventId = data.event_id || data.eventId;
  const registrationType = data.registration_type || data.registrationType;

  // Validate eventId presence and format (UUID or slug)
  if (!eventId || typeof eventId !== 'string' || !eventId.trim()) {
    errors.push('event_id is required');
  } else if (!UUID_REGEX.test(eventId.trim())) {
    const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!SLUG_REGEX.test(eventId.trim().toLowerCase())) {
      errors.push('event_id must be a valid UUID or event slug');
    }
  }

  // Validate registrationType if provided
  if (registrationType !== undefined && registrationType !== null) {
    if (typeof registrationType !== 'string' || !['INDIVIDUAL', 'TEAM'].includes(registrationType.toUpperCase())) {
      errors.push("registration_type must be either 'INDIVIDUAL' or 'TEAM'");
    }
  }

  // Validate teamId if provided
  const teamId = data.team_id || data.teamId;
  if (teamId !== undefined && teamId !== null) {
    if (typeof teamId !== 'string' || !UUID_REGEX.test(teamId.trim())) {
      errors.push('team_id must be a valid UUID');
    }
  }

  // Validate participants array if provided
  const participants = data.participants || data.participantDetails;
  if (participants !== undefined && participants !== null) {
    if (!Array.isArray(participants)) {
      errors.push('participants must be an array');
    } else {
      participants.forEach((p, index) => {
        if (!p || typeof p !== 'object') {
          errors.push(`Participant at index ${index} must be an object`);
          return;
        }
        const name = p.full_name || p.fullName || p.name;
        if (name && (typeof name !== 'string' || name.trim().length < 2)) {
          errors.push(`Participant at index ${index} must have a valid name (at least 2 characters)`);
        }
        const mobile = p.mobile_number || p.mobile || p.phone;
        if (mobile) {
          const digits = String(mobile).replace(/\D/g, '');
          if (digits.length !== 10) {
            errors.push(`Participant at index ${index} mobile number must be exactly 10 digits`);
          }
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateRegistrationCreate,
};
