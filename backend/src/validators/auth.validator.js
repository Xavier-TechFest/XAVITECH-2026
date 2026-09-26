/**
 * Authentication and Profile Request Validators
 */

export const validateLogin = (data) => {
  const errors = [];
  if (!data?.idToken) {
    errors.push('Firebase idToken is required');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateProfileUpdate = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Request body must be a valid JSON object'],
    };
  }

  // Validate Name
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name must be a non-empty string');
    } else if (data.name.trim().length > 100) {
      errors.push('Name must not exceed 100 characters');
    }
  }

  // Validate Phone (optional; if provided, must be exactly 10 digits)
  if (data.phone !== undefined && data.phone !== null && data.phone !== '') {
    if (typeof data.phone !== 'string' || !/^[0-9]{10}$/.test(data.phone.trim())) {
      errors.push('Enter a valid 10-digit mobile number.');
    }
  }

  // Validate Institution / College Name (optional; if provided, standard string up to 150 chars)
  const collegeName = data.college_name !== undefined ? data.college_name : data.collegeName;
  if (collegeName !== undefined && collegeName !== null && collegeName !== '') {
    if (typeof collegeName !== 'string' || collegeName.trim().length === 0) {
      errors.push('Institution name must be a valid string');
    } else if (collegeName.trim().length > 150) {
      errors.push('Institution name must not exceed 150 characters');
    }
  }

  // Validate Profile Image URL
  const profileImage = data.profile_image !== undefined ? data.profile_image : data.profileImage;
  if (profileImage !== undefined && profileImage !== null && profileImage !== '') {
    if (typeof profileImage !== 'string' || (!profileImage.startsWith('http://') && !profileImage.startsWith('https://') && !profileImage.startsWith('data:image/'))) {
      errors.push('Profile image must be a valid HTTP/HTTPS URL or data URI');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateLogin,
  validateProfileUpdate,
};
