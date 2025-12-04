// services/pocketbase/games.ts - Game history service

import { pb } from './client';
import type { Player, GameMode } from '../../types/game';

export interface GameRecord {
  id: string;
  room: string;
  players: Array<{ id: string; name: string; color: string; score: number }>;
  playerIds: string[];
  winner: string | null;
  isDraw: boolean;
  finalScores: Record<string, number>;
  gameMode: GameMode;
  totalMoves: number;
  duration: number;
  moveHistory: Array<{
    playerId: string;
    dot1Id: number;
    dot2Id: number;
    timestamp: string;
  }>;
  finalBoardState: unknown;
  startedAt: string;
  finishedAt: string;
}

export interface GameResult {
  success: boolean;
  game?: GameRecord;
  error?: string;
}

export const gameService = {
  /**
   * Save game result
   */
  async saveGame(data: {
    roomId: string;
    players: Player[];
    winner: Player | null;
    isDraw: boolean;
    finalScores: Record<string, number>;
    gameMode: GameMode;
    totalMoves: number;
    duration: number;
    moveHistory?: Array<{
      playerId: string;
      dot1Id: number;
      dot2Id: number;
      timestamp: string;
    }>;
    finalBoardState?: unknown;
    startedAt: string;
  }): Promise<GameResult> {
    try {
      const game = await pb.collection('games').create({
        room: data.roomId,
        players: data.players.map((p) => ({
          id: p.id,
          name: p.name,
          color: p.color,
          score: p.score,
        })),
        playerIds: data.players.map((p) => p.id),
        winner: data.winner?.id || null,
        isDraw: data.isDraw,
        finalScores: data.finalScores,
        gameMode: data.gameMode,
        totalMoves: data.totalMoves,
        duration: data.duration,
        moveHistory: data.moveHistory || [],
        finalBoardState: data.finalBoardState || null,
        startedAt: data.startedAt,
        finishedAt: new Date().toISOString(),
      });

      return {
        success: true,
        game: game as unknown as GameRecord,
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Save game error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to save game',
      };
    }
  },

  /**
   * Get game by ID
   */
  async getGameById(gameId: string): Promise<GameResult> {
    try {
      const game = await pb.collection('games').getOne(gameId, {
        expand: 'winner,room',
      });
      return {
        success: true,
        game: game as unknown as GameRecord,
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Get game error:', error);
      return {
        success: false,
        error: pbError.message || 'Game not found',
      };
    }
  },

  /**
   * Get user's game history
   */
  async getUserGames(
    userId: string,
    page = 1,
    perPage = 20
  ): Promise<{
    success: boolean;
    games?: GameRecord[];
    totalItems?: number;
    totalPages?: number;
    error?: string;
  }> {
    try {
      const result = await pb.collection('games').getList(page, perPage, {
        filter: `playerIds~"${userId}"`,
        sort: '-finishedAt',
        expand: 'winner,room',
      });

      return {
        success: true,
        games: result.items as unknown as GameRecord[],
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Get user games error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to get games',
      };
    }
  },

  /**
   * Get games between two users
   */
  async getHeadToHead(
    userId1: string,
    userId2: string,
    page = 1,
    perPage = 10
  ): Promise<{
    success: boolean;
    games?: GameRecord[];
    stats?: {
      user1Wins: number;
      user2Wins: number;
      draws: number;
      totalGames: number;
    };
    error?: string;
  }> {
    try {
      const result = await pb.collection('games').getList(page, perPage, {
        filter: `playerIds~"${userId1}" && playerIds~"${userId2}"`,
        sort: '-finishedAt',
      });

      // Calculate head-to-head stats
      let user1Wins = 0;
      let user2Wins = 0;
      let draws = 0;

      for (const game of result.items as unknown as GameRecord[]) {
        if (game.isDraw) {
          draws++;
        } else if (game.winner === userId1) {
          user1Wins++;
        } else if (game.winner === userId2) {
          user2Wins++;
        }
      }

      return {
        success: true,
        games: result.items as unknown as GameRecord[],
        stats: {
          user1Wins,
          user2Wins,
          draws,
          totalGames: result.totalItems,
        },
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Get head-to-head error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to get games',
      };
    }
  },

  /**
   * Get recent games (for activity feed)
   */
  async getRecentGames(limit = 10): Promise<{
    success: boolean;
    games?: GameRecord[];
    error?: string;
  }> {
    try {
      const result = await pb.collection('games').getList(1, limit, {
        sort: '-finishedAt',
        expand: 'winner',
      });

      return {
        success: true,
        games: result.items as unknown as GameRecord[],
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Get recent games error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to get games',
      };
    }
  },
};

