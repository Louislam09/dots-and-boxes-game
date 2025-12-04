// types/room.ts - Room types

import type { GameMode } from './game';

export type RoomStatus = 'waiting' | 'playing' | 'finished' | 'cancelled';

export interface Room {
  id: string;
  code: string;
  name: string;
  owner: string;
  gameMode: GameMode;
  maxPlayers: number;
  status: RoomStatus;
  players: string[];
  createdAt: string;
  expiresAt: string;
}

export interface CreateRoomData {
  name?: string;
  gameMode: GameMode;
}

export interface JoinRoomData {
  code: string;
}

export interface RoomPlayer {
  id: string;
  name: string;
  avatar?: string;
  isOwner: boolean;
  isReady: boolean;
  color: string;
}

