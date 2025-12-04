// services/pocketbase/leaderboard.ts - Leaderboard service

import { pb } from './client';
import type { User } from '../../types/user';

export type LeaderboardType = 'wins' | 'score' | 'winRate' | 'streak' | 'level';

export interface LeaderboardEntry {
  rank: number;
  user: User;
  value: number;
}

export const leaderboardService = {
  /**
   * Get leaderboard by type
   */
  async getLeaderboard(
    type: LeaderboardType,
    limit = 50
  ): Promise<{
    success: boolean;
    entries?: LeaderboardEntry[];
    error?: string;
  }> {
    try {
      let sortField: string;
      let valueField: string;

      switch (type) {
        case 'wins':
          sortField = '-totalWins';
          valueField = 'totalWins';
          break;
        case 'score':
          sortField = '-totalScore';
          valueField = 'totalScore';
          break;
        case 'winRate':
          // For win rate, we need to filter users with at least 10 games
          sortField = '-totalWins';
          valueField = 'totalWins';
          break;
        case 'streak':
          sortField = '-bestStreak';
          valueField = 'bestStreak';
          break;
        case 'level':
          sortField = '-experience';
          valueField = 'experience';
          break;
        default:
          sortField = '-totalWins';
          valueField = 'totalWins';
      }

      let filter = 'totalGamesPlayed>0';
      if (type === 'winRate') {
        filter = 'totalGamesPlayed>=10';
      }

      const result = await pb.collection('users').getList(1, limit, {
        filter,
        sort: sortField,
      });

      const entries: LeaderboardEntry[] = result.items.map((user, index) => {
        let value: number;
        const u = user as unknown as User;

        if (type === 'winRate') {
          value =
            u.totalGamesPlayed > 0
              ? Math.round((u.totalWins / u.totalGamesPlayed) * 1000) / 10
              : 0;
        } else if (type === 'level') {
          value = u.level;
        } else {
          value = u[valueField as keyof User] as number;
        }

        return {
          rank: index + 1,
          user: u,
          value,
        };
      });

      // Sort by win rate if needed
      if (type === 'winRate') {
        entries.sort((a, b) => b.value - a.value);
        entries.forEach((entry, index) => {
          entry.rank = index + 1;
        });
      }

      return {
        success: true,
        entries,
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Get leaderboard error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to get leaderboard',
      };
    }
  },

  /**
   * Get user's rank in a specific leaderboard
   */
  async getUserRank(
    userId: string,
    type: LeaderboardType
  ): Promise<{
    success: boolean;
    rank?: number;
    value?: number;
    totalUsers?: number;
    error?: string;
  }> {
    try {
      const { success, entries, error } = await leaderboardService.getLeaderboard(type, 1000);

      if (!success || !entries) {
        return { success: false, error };
      }

      const userEntry = entries.find((entry) => entry.user.id === userId);

      if (!userEntry) {
        // User not in leaderboard (probably not enough games)
        return {
          success: true,
          rank: undefined,
          value: undefined,
          totalUsers: entries.length,
        };
      }

      return {
        success: true,
        rank: userEntry.rank,
        value: userEntry.value,
        totalUsers: entries.length,
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Get user rank error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to get rank',
      };
    }
  },

  /**
   * Get top players for home screen display
   */
  async getTopPlayers(limit = 3): Promise<{
    success: boolean;
    players?: Array<{ user: User; wins: number }>;
    error?: string;
  }> {
    try {
      const result = await pb.collection('users').getList(1, limit, {
        filter: 'totalGamesPlayed>0',
        sort: '-totalWins',
      });

      return {
        success: true,
        players: result.items.map((user) => ({
          user: user as unknown as User,
          wins: (user as unknown as User).totalWins,
        })),
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Get top players error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to get top players',
      };
    }
  },
};

