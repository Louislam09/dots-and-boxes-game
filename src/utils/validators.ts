// utils/validators.ts - Input validation helpers

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validators = {
  /**
   * Validate room code format
   * 6 characters, uppercase alphanumeric (excluding confusing chars)
   */
  roomCode: (code: string): boolean => {
    return /^[A-HJ-NP-Z2-9]{6}$/.test(code.toUpperCase());
  },

  /**
   * Validate username
   * 3-20 characters, alphanumeric and underscores only
   */
  username: (username: string): ValidationResult => {
    if (!username || username.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters' };
    }
    if (username.length > 20) {
      return { valid: false, error: 'Username must be at most 20 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return {
        valid: false,
        error: 'Username can only contain letters, numbers, and underscores',
      };
    }
    return { valid: true };
  },

  /**
   * Validate display name
   * 2-30 characters
   */
  displayName: (name: string): ValidationResult => {
    if (!name || name.length < 2) {
      return { valid: false, error: 'Display name must be at least 2 characters' };
    }
    if (name.length > 30) {
      return { valid: false, error: 'Display name must be at most 30 characters' };
    }
    return { valid: true };
  },

  /**
   * Validate email format
   */
  email: (email: string): ValidationResult => {
    if (!email) {
      return { valid: false, error: 'Email is required' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { valid: false, error: 'Please enter a valid email address' };
    }
    return { valid: true };
  },

  /**
   * Validate password strength
   * At least 8 characters, one uppercase, one lowercase, one number
   */
  password: (password: string): ValidationResult => {
    if (!password || password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one number' };
    }
    return { valid: true };
  },

  /**
   * Validate password confirmation
   */
  passwordConfirm: (password: string, passwordConfirm: string): ValidationResult => {
    if (password !== passwordConfirm) {
      return { valid: false, error: 'Passwords do not match' };
    }
    return { valid: true };
  },

  /**
   * Validate avatar file
   * Max 5MB, JPEG/PNG/WebP only
   */
  avatar: (file: { size: number; type: string }): ValidationResult => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
    }
    return { valid: true };
  },

  /**
   * Validate room name
   * Optional, max 50 characters
   */
  roomName: (name: string): ValidationResult => {
    if (name && name.length > 50) {
      return { valid: false, error: 'Room name must be at most 50 characters' };
    }
    return { valid: true };
  },
};

/**
 * Sanitize string input (trim and remove excess whitespace)
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitize room code (uppercase and remove non-alphanumeric)
 */
export function sanitizeRoomCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

