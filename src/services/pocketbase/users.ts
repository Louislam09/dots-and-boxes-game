// services/pocketbase/users.ts - User profile service

import { pb } from './client';
import type { User, UpdateProfileData, UserStats } from '../../types/user';
import { calculateLevel, getExperienceToNextLevel } from '../../constants/game';
import { calculateWinRate } from '../../utils/helpers';

export interface UserResult {
  success: boolean;
  user?: User;
  error?: string;
}

export const userService = {
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserResult> {
    try {
      const user = await pb.collection('users').getOne(userId);
      return {
        success: true,
        user: user as unknown as User,
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Get user error:', error);
      return {
        success: false,
        error: pbError.message || 'User not found',
      };
    }
  },

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<UserResult> {
    try {
      const user = await pb
        .collection('users')
        .getFirstListItem(`username="${username}"`);
      return {
        success: true,
        user: user as unknown as User,
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Get user by username error:', error);
      return {
        success: false,
        error: pbError.message || 'User not found',
      };
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<UserResult> {
    try {
      const currentUser = pb.authStore.record;
      if (!currentUser) {
        return { success: false, error: 'Not authenticated' };
      }

      const formData = new FormData();

      if (data.displayName !== undefined) {
        formData.append('displayName', data.displayName);
      }
      if (data.soundEnabled !== undefined) {
        formData.append('soundEnabled', String(data.soundEnabled));
      }
      if (data.musicEnabled !== undefined) {
        formData.append('musicEnabled', String(data.musicEnabled));
      }
      if (data.vibrationEnabled !== undefined) {
        formData.append('vibrationEnabled', String(data.vibrationEnabled));
      }
      if (data.theme !== undefined) {
        formData.append('theme', data.theme);
      }
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      const user = await pb.collection('users').update(currentUser.id, formData);

      return {
        success: true,
        user: user as unknown as User,
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Update profile error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to update profile',
      };
    }
  },

  /**
   * Get user stats with calculated values
   */
  getUserStats(user: User): UserStats {
    const expProgress = getExperienceToNextLevel(user.experience);

    return {
      totalGamesPlayed: user.totalGamesPlayed,
      totalWins: user.totalWins,
      totalLosses: user.totalLosses,
      totalDraws: user.totalDraws,
      totalScore: user.totalScore,
      currentStreak: user.currentStreak,
      bestStreak: user.bestStreak,
      winRate: calculateWinRate(user.totalWins, user.totalGamesPlayed),
      level: user.level,
      experience: user.experience,
      experienceToNextLevel: expProgress.required - expProgress.current,
    };
  },

  /**
   * Update user stats after a game
   */
  async updateStats(
    userId: string,
    result: {
      won: boolean;
      isDraw: boolean;
      scoreEarned: number;
      experienceEarned: number;
    }
  ): Promise<UserResult> {
    try {
      const { success, user, error } = await userService.getUserById(userId);
      if (!success || !user) {
        return { success: false, error: error || 'User not found' };
      }

      const updates: Record<string, number | string> = {
        totalGamesPlayed: user.totalGamesPlayed + 1,
        totalScore: user.totalScore + result.scoreEarned,
        experience: user.experience + result.experienceEarned,
      };

      if (result.isDraw) {
        updates.totalDraws = user.totalDraws + 1;
        updates.currentStreak = 0;
      } else if (result.won) {
        updates.totalWins = user.totalWins + 1;
        updates.currentStreak = user.currentStreak + 1;
        if (updates.currentStreak > user.bestStreak) {
          updates.bestStreak = updates.currentStreak;
        }
      } else {
        updates.totalLosses = user.totalLosses + 1;
        updates.currentStreak = 0;
      }

      // Recalculate level
      const newLevel = calculateLevel(updates.experience as number);
      if (newLevel > user.level) {
        updates.level = newLevel;
      }

      const updatedUser = await pb.collection('users').update(userId, updates);

      return {
        success: true,
        user: updatedUser as unknown as User,
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Update stats error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to update stats',
      };
    }
  },

  /**
   * Get avatar URL
   */
  getAvatarUrl(user: User): string | null {
    if (!user.avatar) return null;
    return pb.files.getURL(user as unknown as { collectionId: string; id: string; [key: string]: unknown }, user.avatar);
  },

  /**
   * Search users by username or display name
   */
  async searchUsers(query: string): Promise<{
    success: boolean;
    users?: User[];
    error?: string;
  }> {
    try {
      const currentUser = pb.authStore.record;
      const filter = `(username~"${query}" || displayName~"${query}")${
        currentUser ? ` && id!="${currentUser.id}"` : ''
      }`;

      const result = await pb.collection('users').getList(1, 20, {
        filter,
        sort: '-created',
      });

      return {
        success: true,
        users: result.items as unknown as User[],
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Search users error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to search users',
      };
    }
  },
};

