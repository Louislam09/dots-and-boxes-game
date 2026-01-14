// constants/game.ts - Game configuration

export const GAME_CONFIG = {
  // Grid settings
  GRID_SIZE: 9, // 9x9 dots = 8x8 squares
  TOTAL_SQUARES: 64, // 8 * 8
  TOTAL_DOTS: 81, // 9 * 9

  // Board dimensions - responsive values computed at runtime
  DOT_SIZE: {
    MOBILE: 14,   // Small phones (<375px)
    DEFAULT: 18,  // Standard phones (375-768px)
    TABLET: 24,   // Tablets (>768px)
  },
  DOT_HIT_AREA: {
    MOBILE: 32,   // Larger touch area relative to dot on mobile
    DEFAULT: 38,
    TABLET: 44,
  },
  LINE_WIDTH: {
    MOBILE: 3,
    DEFAULT: 4,
    TABLET: 5,
  },
  BOARD_PADDING: 20,
  
  // Breakpoints for responsive sizing
  BREAKPOINTS: {
    MOBILE: 375,
    TABLET: 768,
  },

  // Player configuration
  MAX_PLAYERS: {
    '1vs1': 2,
    '3players': 3,
    '4players': 4,
  },

  // Player colors (matching COLORS.players)
  PLAYER_COLORS: ['#E63946', '#2A9D8F', '#E9C46A', '#A855F7'],

  // Animation durations (ms)
  ANIMATIONS: {
    DOT_PRESS: 100,
    LINE_DRAW: 200,
    SQUARE_FILL: 300,
    SCORE_UPDATE: 400,
    TURN_CHANGE: 200,
    GAME_OVER: 500,
  },

  // Toast durations (ms)
  TOAST_DURATION: {
    default: 2000,
    winner: 4000,
    error: 3000,
  },

  // Experience system
  EXPERIENCE: {
    PER_SQUARE: 10,
    WIN_BONUS: 100,
    DRAW_BONUS: 25,
    LOSS_BONUS: 10,
  },

  // Level thresholds
  LEVELS: [
    { level: 1, expRequired: 0 },
    { level: 2, expRequired: 500 },
    { level: 3, expRequired: 1200 },
    { level: 4, expRequired: 2100 },
    { level: 5, expRequired: 3200 },
    { level: 6, expRequired: 4500 },
    { level: 7, expRequired: 6000 },
    { level: 8, expRequired: 7700 },
    { level: 9, expRequired: 9600 },
    { level: 10, expRequired: 11700 },
    { level: 11, expRequired: 14000 },
    { level: 12, expRequired: 16500 },
    { level: 13, expRequired: 19200 },
    { level: 14, expRequired: 22100 },
    { level: 15, expRequired: 25200 },
    { level: 16, expRequired: 28500 },
    { level: 17, expRequired: 32000 },
    { level: 18, expRequired: 35700 },
    { level: 19, expRequired: 39600 },
    { level: 20, expRequired: 43700 },
  ],

  // Room code settings
  ROOM_CODE: {
    LENGTH: 6,
    // Exclude confusing characters (0, O, 1, I, L)
    CHARACTERS: 'ABCDEFGHJKMNPQRSTUVWXYZ23456789',
  },
} as const;

// ============ BOARD SIZE OPTIONS ============

import type { BoardSizeOption, BoardTheme } from '../types/game';

export const BOARD_SIZES: BoardSizeOption[] = [
  // Rectangular boards
  { rows: 3, cols: 4, label: '4 × 3', category: 'rectangular' },
  { rows: 5, cols: 4, label: '5 × 4', category: 'rectangular' },
  { rows: 8, cols: 6, label: '8 × 6', category: 'rectangular' },
  { rows: 11, cols: 9, label: '11 × 9', category: 'rectangular' },
  // Square boards
  { rows: 4, cols: 4, label: '4 × 4', category: 'square' },
  { rows: 5, cols: 5, label: '5 × 5', category: 'square' },
  { rows: 9, cols: 9, label: '9 × 9', category: 'square' },
];

export const DEFAULT_BOARD_SIZE = BOARD_SIZES[1]; // 5 × 4

// ============ BOARD THEMES ============

export const BOARD_THEMES: Record<BoardTheme, { 
  name: string;
  primary: string; 
  secondary: string; 
  board: string;
  accent: string;
}> = {
  sunset: { 
    name: 'Sunset',
    primary: '#FF6B6B', 
    secondary: '#FFE66D', 
    board: '#FFF5E6',
    accent: '#FF8E53',
  },
  ocean: { 
    name: 'Ocean',
    primary: '#4ECDC4', 
    secondary: '#45B7D1', 
    board: '#E8F8F5',
    accent: '#2C98C2',
  },
  forest: { 
    name: 'Forest',
    primary: '#52B788', 
    secondary: '#95D5B2', 
    board: '#E9F5EC',
    accent: '#40916C',
  },
  night: { 
    name: 'Night',
    primary: '#6C63FF', 
    secondary: '#A855F7', 
    board: '#1A1F3C',
    accent: '#8B5CF6',
  },
};

export const THEME_LIST: BoardTheme[] = ['sunset', 'ocean', 'forest', 'night'];
export const DEFAULT_THEME: BoardTheme = 'sunset';

// ============ AI DIFFICULTY ============

export const AI_DIFFICULTIES = [
  { key: 'easy' as const, label: 'Easy', description: 'Random moves' },
  { key: 'medium' as const, label: 'Medium', description: 'Basic strategy' },
  { key: 'hard' as const, label: 'Hard', description: 'Advanced tactics' },
];

// Helper to calculate level from experience
export function calculateLevel(experience: number): number {
  const levels = GAME_CONFIG.LEVELS;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (experience >= levels[i].expRequired) {
      return levels[i].level;
    }
  }
  return 1;
}

// Helper to get experience needed for next level
export function getExperienceToNextLevel(experience: number): {
  current: number;
  required: number;
  percentage: number;
} {
  const currentLevel = calculateLevel(experience);
  const levels = GAME_CONFIG.LEVELS;
  const currentLevelData = levels.find((l) => l.level === currentLevel);
  const nextLevelData = levels.find((l) => l.level === currentLevel + 1);

  if (!nextLevelData) {
    // Max level reached
    return { current: 0, required: 0, percentage: 100 };
  }

  const currentLevelExp = currentLevelData?.expRequired || 0;
  const nextLevelExp = nextLevelData.expRequired;
  const expInCurrentLevel = experience - currentLevelExp;
  const expNeededForLevel = nextLevelExp - currentLevelExp;

  return {
    current: expInCurrentLevel,
    required: expNeededForLevel,
    percentage: Math.round((expInCurrentLevel / expNeededForLevel) * 100),
  };
}

// Helper to generate room code
export function generateRoomCode(): string {
  const { LENGTH, CHARACTERS } = GAME_CONFIG.ROOM_CODE;
  let code = '';
  for (let i = 0; i < LENGTH; i++) {
    code += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return code;
}

// Helper to get responsive dot size based on screen width
export function getResponsiveSizes(screenWidth: number): {
  dotSize: number;
  hitArea: number;
  lineWidth: number;
} {
  const { DOT_SIZE, DOT_HIT_AREA, LINE_WIDTH, BREAKPOINTS } = GAME_CONFIG;
  
  if (screenWidth < BREAKPOINTS.MOBILE) {
    return {
      dotSize: DOT_SIZE.MOBILE,
      hitArea: DOT_HIT_AREA.MOBILE,
      lineWidth: LINE_WIDTH.MOBILE,
    };
  }
  
  if (screenWidth >= BREAKPOINTS.TABLET) {
    return {
      dotSize: DOT_SIZE.TABLET,
      hitArea: DOT_HIT_AREA.TABLET,
      lineWidth: LINE_WIDTH.TABLET,
    };
  }
  
  return {
    dotSize: DOT_SIZE.DEFAULT,
    hitArea: DOT_HIT_AREA.DEFAULT,
    lineWidth: LINE_WIDTH.DEFAULT,
  };
}

// ============ EDGE UTILITIES ============

// Convert dot pair to edge (canonical form)
// Now supports dynamic grid size via gridCols parameter
export function dotsToEdge(
  dot1Id: number,
  dot2Id: number,
  playerId: string,
  color: string,
  gridCols: number = GAME_CONFIG.GRID_SIZE // Default for backwards compatibility
): { row: number; col: number; dir: 'H' | 'V'; id: string } {
  const dot1Row = Math.floor(dot1Id / gridCols);
  const dot1Col = dot1Id % gridCols;
  const dot2Row = Math.floor(dot2Id / gridCols);
  const dot2Col = dot2Id % gridCols;
  
  // Determine direction and canonical position (top-left of the line)
  if (dot1Row === dot2Row) {
    // Horizontal line
    const col = Math.min(dot1Col, dot2Col);
    return { row: dot1Row, col, dir: 'H', id: `H-${dot1Row}-${col}` };
  } else {
    // Vertical line
    const row = Math.min(dot1Row, dot2Row);
    return { row, col: dot1Col, dir: 'V', id: `V-${row}-${dot1Col}` };
  }
}

// Convert edge to screen coordinates (pure math, no lookups)
export function edgeToCoords(
  edge: { row: number; col: number; dir: 'H' | 'V' },
  spacing: number,
  padding: number
): { x1: number; y1: number; x2: number; y2: number } {
  const x = padding + edge.col * spacing;
  const y = padding + edge.row * spacing;
  
  if (edge.dir === 'H') {
    return { x1: x, y1: y, x2: x + spacing, y2: y };
  } else {
    return { x1: x, y1: y, x2: x, y2: y + spacing };
  }
}

// Get affected square IDs for an edge (max 2 squares, O(1))
// Now supports dynamic grid size
export function getEdgeAffectedSquareIds(
  edge: { row: number; col: number; dir: 'H' | 'V' },
  gridRows: number = GAME_CONFIG.GRID_SIZE,
  gridCols: number = GAME_CONFIG.GRID_SIZE
): number[] {
  const squaresPerRow = gridCols - 1;
  const totalSquares = (gridRows - 1) * (gridCols - 1);
  const affectedIds: number[] = [];
  
  if (edge.dir === 'H') {
    // Horizontal line can affect square above and below
    // Square above: row-1, col (if row > 0)
    if (edge.row > 0) {
      affectedIds.push((edge.row - 1) * squaresPerRow + edge.col);
    }
    // Square below: row, col (if row < gridRows - 1)
    if (edge.row < gridRows - 1 && edge.col < squaresPerRow) {
      affectedIds.push(edge.row * squaresPerRow + edge.col);
    }
  } else {
    // Vertical line can affect square left and right
    // Square left: row, col-1 (if col > 0)
    if (edge.col > 0) {
      affectedIds.push(edge.row * squaresPerRow + (edge.col - 1));
    }
    // Square right: row, col (if col < gridCols - 1)
    if (edge.col < gridCols - 1 && edge.row < gridRows - 1) {
      affectedIds.push(edge.row * squaresPerRow + edge.col);
    }
  }
  
  return affectedIds.filter(id => id >= 0 && id < totalSquares);
}

// Create edge ID from components
export function createEdgeId(row: number, col: number, dir: 'H' | 'V'): string {
  return `${dir}-${row}-${col}`;
}

