/**
 * Registration Request Validator Placeholders
 */

export const validateRegistrationCreate = (data) => {
  const errors = [];
  if (!data?.eventId) {
    errors.push('Event ID is required');
  }
  if (!data?.registrationType || !['INDIVIDUAL', 'TEAM'].includes(data.registrationType)) {
    errors.push('Registration type must be either INDIVIDUAL or TEAM');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateTeamMembers = (data) => {
  const errors = [];
  if (!data?.teamName || typeof data.teamName !== 'string' || !data.teamName.trim()) {
    errors.push('Team name is required');
  }
  if (!Array.isArray(data?.members) || data.members.length === 0) {
    errors.push('Team members list must not be empty');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateRegistrationCreate,
  validateTeamMembers,
};
