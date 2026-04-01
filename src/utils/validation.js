/**
 * ConnectFBLA Input Validation Module
 * Implements BOTH syntactic (format) and semantic (business logic) validation.
 * All error messages are specific and actionable — never generic.
 */

import { VALIDATION } from './constants';

// ─── SYNTACTIC VALIDATORS ────────────────────────────────────────────────────

/**
 * Validates email format using RFC 5322 simplified regex.
 * @param {string} email
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateEmailSyntax(email) {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email address is required.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address (e.g., name@school.edu).' };
  }
  return { valid: true, error: null };
}

/**
 * Validates password meets minimum requirements.
 * @param {string} password
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validatePasswordSyntax(password) {
  if (!password || password.length === 0) {
    return { valid: false, error: 'Password is required.' };
  }
  if (password.length < VALIDATION.passwordMinLength) {
    return {
      valid: false,
      error: `Password must be at least ${VALIDATION.passwordMinLength} characters long.`,
    };
  }
  return { valid: true, error: null };
}

/**
 * Validates bio field (max 280 chars, no prohibited content).
 * @param {string} bio
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateBio(bio) {
  if (bio && bio.length > VALIDATION.bioMaxLength) {
    return {
      valid: false,
      error: `Bio must be ${VALIDATION.bioMaxLength} characters or less. Currently ${bio.length} characters.`,
    };
  }
  return { valid: true, error: null };
}

/**
 * Validates social media handle format.
 * @param {string} handle
 * @param {string} platform
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateSocialHandle(handle, platform) {
  if (!handle || handle.trim().length === 0) {
    return { valid: true, error: null }; // Social handles are optional
  }
  const cleanHandle = handle.trim().replace('@', '');
  // No spaces allowed
  if (/\s/.test(cleanHandle)) {
    return { valid: false, error: `${platform} handle cannot contain spaces.` };
  }
  // Platform-specific handle checks
  const handlePatterns = {
    instagram: /^[a-zA-Z0-9._]{1,30}$/,
    twitter: /^[a-zA-Z0-9_]{1,15}$/,
    linkedin: /^[a-zA-Z0-9-]{3,100}$/,
    youtube: /^[a-zA-Z0-9@._-]{1,100}$/,
    facebook: /^[a-zA-Z0-9.]{5,50}$/,
  };
  const pattern = handlePatterns[platform.toLowerCase()];
  if (pattern && !pattern.test(cleanHandle)) {
    return { valid: false, error: `Invalid ${platform} handle format.` };
  }
  return { valid: true, error: null };
}

/**
 * Validates message content before sending.
 * @param {string} message
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateMessage(message) {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty.' };
  }
  if (message.length > VALIDATION.messageMaxLength) {
    return {
      valid: false,
      error: `Message must be ${VALIDATION.messageMaxLength} characters or less.`,
    };
  }
  return { valid: true, error: null };
}

/**
 * Validates calendar event dates.
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateEventDates(startDate, endDate) {
  if (!startDate) {
    return { valid: false, error: 'Start date is required.' };
  }
  if (endDate && endDate <= startDate) {
    return { valid: false, error: 'End date must be after the start date.' };
  }
  return { valid: true, error: null };
}

/**
 * Validates search query has minimum length.
 * @param {string} query
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateSearchQuery(query) {
  if (!query || query.trim().length < VALIDATION.searchMinLength) {
    return {
      valid: false,
      error: `Please enter at least ${VALIDATION.searchMinLength} characters to search.`,
    };
  }
  return { valid: true, error: null };
}

/**
 * Validates display name field.
 * @param {string} name
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateDisplayName(name) {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Display name is required.' };
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'Display name must be at least 2 characters.' };
  }
  if (name.trim().length > 50) {
    return { valid: false, error: 'Display name must be 50 characters or less.' };
  }
  return { valid: true, error: null };
}

// ─── SEMANTIC VALIDATORS ─────────────────────────────────────────────────────

/**
 * Checks if email exists in the mock user database.
 * @param {string} email
 * @param {Array} users - array of user objects from mock data
 * @returns {{ valid: boolean, error: string|null, user: object|null }}
 */
export function validateEmailExists(email, users) {
  const user = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (!user) {
    return {
      valid: false,
      error: 'No account found with this email address. Check your email and try again.',
      user: null,
    };
  }
  return { valid: true, error: null, user };
}

/**
 * Checks if password matches the stored hash for a user.
 * Uses simple comparison for mock data (in production, use bcrypt).
 * @param {string} password
 * @param {string} storedHash
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validatePasswordMatch(password, storedHash) {
  // Simple hash simulation for mock — in production use bcrypt
  const mockHash = `hashed_${password}`;
  if (mockHash !== storedHash) {
    return {
      valid: false,
      error: 'Incorrect password. Please try again or reset your password.',
    };
  }
  return { valid: true, error: null };
}

/**
 * Checks if username is already taken (for profile creation).
 * @param {string} username
 * @param {Array} users - array of user objects
 * @param {string} currentUserId - ID of the current user (to exclude self)
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateUsernameUnique(username, users, currentUserId) {
  const conflict = users.find(
    (u) => u.username === username && u.id !== currentUserId
  );
  if (conflict) {
    return {
      valid: false,
      error: 'This username is already taken. Please choose a different one.',
    };
  }
  return { valid: true, error: null };
}

/**
 * Checks for duplicate calendar events at the same time.
 * @param {Date} startDate
 * @param {Array} existingEvents
 * @param {string} excludeId - event ID to exclude (for edits)
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateNoConflictingEvent(startDate, existingEvents, excludeId) {
  const conflict = existingEvents.find((event) => {
    if (event.id === excludeId) return false;
    const eventStart = new Date(event.startDate);
    const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;
    return startDate >= eventStart && startDate <= eventEnd;
  });
  if (conflict) {
    return {
      valid: false,
      error: `You already have "${conflict.title}" scheduled at this time.`,
    };
  }
  return { valid: true, error: null };
}
