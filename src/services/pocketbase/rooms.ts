// services/pocketbase/rooms.ts - Room service

import { pb } from './client';
import { generateRoomCode } from '../../constants/game';
import type { Room, CreateRoomData } from '../../types/room';
import type { GameMode } from '../../types/game';

export interface RoomResult {
  success: boolean;
  room?: Room;
  error?: string;
}

export const roomService = {
  /**
   * Create a new room
   */
  async createRoom(data: CreateRoomData): Promise<RoomResult> {
    try {
      const user = pb.authStore.record;
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Generate unique room code
      let code = generateRoomCode();
      let attempts = 0;
      const maxAttempts = 10;

      // Ensure code is unique
      while (attempts < maxAttempts) {
        try {
          await pb.collection('rooms').getFirstListItem(`code="${code}"`);
          // Code exists, generate new one
          code = generateRoomCode();
          attempts++;
        } catch {
          // Code doesn't exist, we can use it
          break;
        }
      }

      if (attempts >= maxAttempts) {
        return { success: false, error: 'Failed to generate room code' };
      }

      const maxPlayers = data.gameMode === '1vs1' ? 2 : 3;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const room = await pb.collection('rooms').create({
        code,
        name: data.name || `${user.displayName || user.username}'s Room`,
        owner: user.id,
        gameMode: data.gameMode,
        maxPlayers,
        status: 'waiting',
        players: [user.id],
        expiresAt: expiresAt.toISOString(),
      });

      return {
        success: true,
        room: room as unknown as Room,
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Create room error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to create room',
      };
    }
  },

  /**
   * Get room by code
   */
  async getRoomByCode(code: string): Promise<RoomResult> {
    try {
      const room = await pb.collection('rooms').getFirstListItem(`code="${code.toUpperCase()}"`);
      return {
        success: true,
        room: room as unknown as Room,
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Get room error:', error);
      return {
        success: false,
        error: pbError.message || 'Room not found',
      };
    }
  },

  /**
   * Get room by ID
   */
  async getRoomById(id: string): Promise<RoomResult> {
    try {
      const room = await pb.collection('rooms').getOne(id);
      return {
        success: true,
        room: room as unknown as Room,
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Get room error:', error);
      return {
        success: false,
        error: pbError.message || 'Room not found',
      };
    }
  },

  /**
   * Join a room
   */
  async joinRoom(code: string): Promise<RoomResult> {
    try {
      const user = pb.authStore.record;
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Get room
      const { success, room, error } = await roomService.getRoomByCode(code);
      if (!success || !room) {
        return { success: false, error: error || 'Room not found' };
      }

      // Check room status
      if (room.status !== 'waiting') {
        return { success: false, error: 'Room is no longer available' };
      }

      // Check if already in room
      if (room.players.includes(user.id)) {
        return { success: true, room };
      }

      // Check if room is full
      if (room.players.length >= room.maxPlayers) {
        return { success: false, error: 'Room is full' };
      }

      // Add player to room
      const updatedRoom = await pb.collection('rooms').update(room.id, {
        players: [...room.players, user.id],
      });

      return {
        success: true,
        room: updatedRoom as unknown as Room,
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Join room error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to join room',
      };
    }
  },

  /**
   * Leave a room
   */
  async leaveRoom(roomId: string): Promise<RoomResult> {
    try {
      const user = pb.authStore.record;
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const room = await pb.collection('rooms').getOne(roomId) as unknown as Room;

      // Remove player from room
      const updatedPlayers = room.players.filter((id) => id !== user.id);

      if (updatedPlayers.length === 0) {
        // Last player left, cancel room
        await pb.collection('rooms').update(roomId, {
          status: 'cancelled',
          players: [],
        });
      } else {
        // Update room
        const updates: Record<string, unknown> = { players: updatedPlayers };

        // If owner left, transfer ownership
        if (room.owner === user.id) {
          updates.owner = updatedPlayers[0];
        }

        await pb.collection('rooms').update(roomId, updates);
      }

      return { success: true };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Leave room error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to leave room',
      };
    }
  },

  /**
   * Update room status
   */
  async updateRoomStatus(
    roomId: string,
    status: Room['status']
  ): Promise<RoomResult> {
    try {
      const room = await pb.collection('rooms').update(roomId, { status });
      return {
        success: true,
        room: room as unknown as Room,
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('Update room status error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to update room',
      };
    }
  },

  /**
   * List active rooms (for browse feature)
   */
  async listActiveRooms(gameMode?: GameMode): Promise<{
    success: boolean;
    rooms?: Room[];
    error?: string;
  }> {
    try {
      let filter = 'status="waiting"';
      if (gameMode) {
        filter += ` && gameMode="${gameMode}"`;
      }

      const result = await pb.collection('rooms').getList(1, 20, {
        filter,
        sort: '-created',
        expand: 'owner,players',
      });

      return {
        success: true,
        rooms: result.items as unknown as Room[],
      };
    } catch (error: unknown) {
      const pbError = error as { message?: string };
      console.error('List rooms error:', error);
      return {
        success: false,
        error: pbError.message || 'Failed to list rooms',
      };
    }
  },
};

