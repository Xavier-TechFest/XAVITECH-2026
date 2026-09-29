/**
 * Team Request Validators
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates team creation payload
 * Required fields:
 * - event_id / eventId: UUID
 * - team_name / teamName: String (2 - 100 chars)
 */
export const validateTeamCreate = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Request body must be a valid JSON object'],
    };
  }

  const eventId = (data.event_id || data.eventId || '').trim();
  const teamName = (data.team_name || data.teamName || '').trim();

  if (!eventId) {
    errors.push('event_id is required');
  } else if (!UUID_REGEX.test(eventId)) {
    errors.push('event_id must be a valid UUID');
  }

  if (!teamName) {
    errors.push('team_name is required');
  } else if (teamName.length < 2) {
    errors.push('team_name must be at least 2 characters long');
  } else if (teamName.length > 100) {
    errors.push('team_name cannot exceed 100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates team update payload (team renaming)
 * Required fields:
 * - team_name / teamName: String (2 - 100 chars)
 */
export const validateTeamUpdate = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Request body must be a valid JSON object'],
    };
  }

  const teamName = (data.team_name || data.teamName || '').trim();

  if (!teamName) {
    errors.push('team_name is required');
  } else if (teamName.length < 2) {
    errors.push('team_name must be at least 2 characters long');
  } else if (teamName.length > 100) {
    errors.push('team_name cannot exceed 100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates team member add / update payload
 * Required fields:
 * - name: String (2 - 100 chars, non-empty)
 */
export const validateTeamMember = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Request body must be a valid JSON object'],
    };
  }

  const name = (data.name || '').trim();

  if (!name) {
    errors.push('Member name is required');
  } else if (name.length < 2) {
    errors.push('Member name must be at least 2 characters long');
  } else if (name.length > 100) {
    errors.push('Member name cannot exceed 100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateTeamCreate,
  validateTeamUpdate,
  validateTeamMember,
};
