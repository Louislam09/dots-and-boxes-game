// types/game.ts - Core game types

export interface Dot {
  id: number;
  row: number;
  col: number;
  x: number;
  y: number;
  connectedTo: number[];
}

// Edge-based representation for fast multiplayer
// dir: "H" = horizontal line to the right, "V" = vertical line downward
export interface Edge {
  id: string;
  row: number;
  col: number;
  dir: 'H' | 'V';
  playerId: string;
  color: string;
  isOptimistic?: boolean; // True if not yet confirmed by server
}

// Legacy Line type for backward compatibility
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

export type GameMode = '1vs1' | '3players' | '4players';
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
  // Dynamic grid settings
  gridRows: number;
  gridCols: number;
  theme?: BoardTheme;
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

// ============ CREATE ROOM SETTINGS ============

export type PlayMode = 'local' | 'online';
export type PlayerType = 'human' | 'ai';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type BoardTheme = 'sunset' | 'ocean' | 'forest' | 'night';

export interface BoardSizeOption {
  rows: number;
  cols: number;
  label: string;
  category: 'rectangular' | 'square';
}

export interface GameSettings {
  playMode: PlayMode;
  playerCount: number;
  playerTypes: PlayerType[];
  aiDifficulty: AIDifficulty;
  boardSize: BoardSizeOption;
  theme: BoardTheme;
}

