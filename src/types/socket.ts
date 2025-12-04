// types/socket.ts - Socket.io event types

import type { Player, Line, Square, GameState } from './game';

// Server to Client Events
export interface ServerToClientEvents {
  // Room events
  'player-joined': (data: { player: Player; players: Player[] }) => void;
  'player-left': (data: { playerId: string; players: Player[] }) => void;
  'player-disconnected': (data: { playerId: string }) => void;
  'player-reconnected': (data: { playerId: string }) => void;

  // Game events
  'game-started': (data: { players: Player[]; firstPlayerId: string }) => void;
  'move-made': (data: {
    playerId: string;
    dot1Id: number;
    dot2Id: number;
    line: Line;
    completedSquares: Square[];
    nextPlayerId: string;
    scores: Record<string, number>;
  }) => void;
  'game-over': (data: {
    winner: Player | null;
    isDraw: boolean;
    finalScores: Record<string, number>;
    reason?: 'completed' | 'opponent_abandoned';
  }) => void;

  // Play again events
  'play-again-requested': (data: { playerId: string }) => void;
  'new-game-starting': () => void;

  // Rejoin events
  'rejoin-success': (data: { gameState: GameState; players: Player[] }) => void;
  'rejoin-failed': (data: { reason: string }) => void;

  // Error/Status events
  'room-closed': (data: { reason: string }) => void;
  'error': (data: { message: string; code: string }) => void;
}

// Client to Server Events
export interface ClientToServerEvents {
  // Room events
  'join-room': (data: { roomCode: string; roomId: string }) => void;
  'leave-room': (data: { roomCode: string }) => void;
  'rejoin-room': (data: { roomCode: string; lastMoveId?: string }) => void;

  // Game events
  'start-game': (data: { roomCode: string }) => void;
  'make-move': (data: { roomCode: string; dot1Id: number; dot2Id: number }) => void;

  // Play again events
  'request-play-again': (data: { roomCode: string }) => void;
  'accept-play-again': (data: { roomCode: string }) => void;
}

// Socket error codes
export type SocketErrorCode =
  | 'NOT_AUTHENTICATED'
  | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL'
  | 'GAME_NOT_ACTIVE'
  | 'NOT_YOUR_TURN'
  | 'INVALID_DOTS'
  | 'NOT_ADJACENT'
  | 'ALREADY_CONNECTED'
  | 'MOVE_IN_PROGRESS'
  | 'NOT_ROOM_OWNER'
  | 'TOO_MANY_REQUESTS';

