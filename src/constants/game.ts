// constants/game.ts - Game configuration

export const GAME_CONFIG = {
  // Grid settings
  GRID_SIZE: 9, // 9x9 dots = 8x8 squares
  TOTAL_SQUARES: 64, // 8 * 8
  TOTAL_DOTS: 81, // 9 * 9

  // Board dimensions
  DOT_SIZE: 16,
  DOT_HIT_AREA: 32, // Touch area for dots
  LINE_WIDTH: 4,
  BOARD_PADDING: 20,

  // Player configuration
  MAX_PLAYERS: {
    '1vs1': 2,
    '3players': 3,
  },

  // Player colors (matching COLORS.players)
  PLAYER_COLORS: ['#E63946', '#2A9D8F', '#E9C46A'],

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

