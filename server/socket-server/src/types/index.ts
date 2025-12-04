// server/socket-server/src/types/index.ts - Server types

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
}

export interface Player {
  id: string;
  socketId: string;
  name: string;
  color: string;
  score: number;
  isOwner: boolean;
  isConnected: boolean;
}

export interface Dot {
  id: number;
  row: number;
  col: number;
  connectedTo: number[];
}

export interface Square {
  id: number;
  topLeftDotId: number;
  isComplete: boolean;
  completedBy: string | null;
  color: string | null;
  lines: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
}

export interface Line {
  id: string;
  dot1Id: number;
  dot2Id: number;
  playerId: string;
  color: string;
}

export interface GameState {
  status: 'waiting' | 'playing' | 'finished';
  dots: Dot[];
  squares: Square[];
  lines: Line[];
  currentTurnPlayerId: string | null;
  moveCount: number;
  startedAt: string | null;
}

export interface RoomState {
  code: string;
  roomId: string;
  hostId: string;
  gameMode: '1vs1' | '3players';
  maxPlayers: number;
  players: Map<string, Player>;
  gameState: GameState | null;
  playAgainRequests: Set<string>;
  lastActivityAt: number;
}

export interface MoveData {
  roomCode: string;
  dot1Id: number;
  dot2Id: number;
}

