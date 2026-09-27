/**
 * Event Request Validators
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isValidUUID = (val) => {
  return typeof val === 'string' && UUID_REGEX.test(val.trim());
};

export const validateEventCreate = (data) => {
  const errors = [];

  if (!data?.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Event name is required');
  }

  if (!data?.slug || typeof data.slug !== 'string' || !data.slug.trim()) {
    errors.push('Event slug is required');
  }

  if (data?.registration_type && !['INDIVIDUAL', 'TEAM'].includes(data.registration_type)) {
    errors.push('Registration type must be either INDIVIDUAL or TEAM');
  }

  if (data?.fee !== undefined && (isNaN(Number(data.fee)) || Number(data.fee) < 0)) {
    errors.push('Fee must be a valid non-negative number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  isValidUUID,
  validateEventCreate,
};
