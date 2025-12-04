// types/game.ts - Core game types

export interface Dot {
  id: number;
  row: number;
  col: number;
  x: number;
  y: number;
  connectedTo: number[];
}

export interface Line {
  id: string;
  dot1Id: number;
  dot2Id: number;
  playerId: string;
  color: string;
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

export interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
  isOwner: boolean;
  isConnected: boolean;
}

export type GameMode = '1vs1' | '3players';
export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface GameState {
  roomCode: string;
  roomId: string;
  gameMode: GameMode;
  status: GameStatus;
  players: Player[];
  dots: Dot[];
  lines: Line[];
  squares: Square[];
  currentTurnPlayerId: string | null;
  winner: Player | null;
  isDraw: boolean;
  moveCount: number;
  startedAt: string | null;
}

export interface MoveResult {
  line: Line;
  completedSquares: Square[];
  isGameOver: boolean;
  nextPlayerId: string;
  scores: Record<string, number>;
}

export interface GameOverResult {
  winner: Player | null;
  isDraw: boolean;
  finalScores: Record<string, number>;
  reason?: 'completed' | 'opponent_abandoned';
}

