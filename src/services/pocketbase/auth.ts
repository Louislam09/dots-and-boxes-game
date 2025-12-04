// services/pocketbase/auth.ts - Authentication service

import { pb } from './client';
import type { User, RegisterData, LoginData } from '../../types/user';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Create user
      await pb.collection('users').create({
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        username: data.username,
        displayName: data.displayName || data.username,
        // Default stats
        totalGamesPlayed: 0,
        totalWins: 0,
        totalLosses: 0,
        totalDraws: 0,
        totalScore: 0,
        currentStreak: 0,
        bestStreak: 0,
        level: 1,
        experience: 0,
        // Default settings
        soundEnabled: true,
        musicEnabled: true,
        vibrationEnabled: true,
        theme: 'dark',
      });

      // Auto-login after registration
      const authData = await pb
        .collection('users')
        .authWithPassword(data.email, data.password);

      return {
        success: true,
        user: authData.record as unknown as User,
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string; data?: { data?: Record<string, { message: string }> } };
      console.error('Registration error:', error);
      
      // Extract error message
      let errorMessage = 'Registration failed. Please try again.';
      if (pbError.data?.data) {
        const fieldErrors = Object.values(pbError.data.data);
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors[0].message;
        }
      } else if (pbError.message) {
        errorMessage = pbError.message;
      }

      return { success: false, error: errorMessage };
    }
  },

  /**
   * Login with email and password
   */
  async login(data: LoginData): Promise<AuthResult> {
    try {
      const authData = await pb
        .collection('users')
        .authWithPassword(data.email, data.password);

      return {
        success: true,
        user: authData.record as unknown as User,
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Login error:', error);
      return {
        success: false,
        error: pbError.message || 'Invalid email or password',
      };
    }
  },

  /**
   * Logout current user
   */
  logout(): void {
    pb.authStore.clear();
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    if (!pb.authStore.isValid) return null;
    return pb.authStore.record as unknown as User;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return pb.authStore.isValid;
  },

  /**
   * Get auth token for Socket.io
   */
  getToken(): string | null {
    return pb.authStore.token;
  },

  /**
   * Refresh auth token
   */
  async refreshAuth(): Promise<boolean> {
    try {
      if (pb.authStore.isValid) {
        await pb.collection('users').authRefresh();
        return true;
      }
    } catch (error) {
      console.error('Auth refresh error:', error);
      pb.authStore.clear();
    }
    return false;
  },

  /**
   * Request password reset email
   */
  async requestPasswordReset(email: string): Promise<AuthResult> {
    try {
      await pb.collection('users').requestPasswordReset(email);
      return { success: true };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Password reset error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to send reset email',
      };
    }
  },

  /**
   * Change password
   */
  async changePassword(
    oldPassword: string,
    newPassword: string,
    passwordConfirm: string
  ): Promise<AuthResult> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      await pb.collection('users').update(user.id, {
        oldPassword,
        password: newPassword,
        passwordConfirm,
      });

      return { success: true };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Change password error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to change password',
      };
    }
  },
};

