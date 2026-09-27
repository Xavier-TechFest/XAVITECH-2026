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

  // Validate eventId presence and UUID format
  if (!eventId || typeof eventId !== 'string' || !eventId.trim()) {
    errors.push('event_id is required');
  } else if (!UUID_REGEX.test(eventId.trim())) {
    errors.push('event_id must be a valid UUID');
  }

  // Validate registrationType if provided
  if (registrationType !== undefined && registrationType !== null) {
    if (typeof registrationType !== 'string' || !['INDIVIDUAL', 'TEAM'].includes(registrationType.toUpperCase())) {
      errors.push("registration_type must be either 'INDIVIDUAL' or 'TEAM'");
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
