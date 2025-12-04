// constants/colors.ts - Theme colors

export const COLORS = {
  // Primary palette
  primary: {
    DEFAULT: '#6366F1', // Indigo
    light: '#818CF8',
    dark: '#4F46E5',
    contrast: '#FFFFFF',
  },

  // Secondary palette
  secondary: {
    DEFAULT: '#10B981', // Emerald
    light: '#34D399',
    dark: '#059669',
    contrast: '#FFFFFF',
  },

  // Accent palette
  accent: {
    DEFAULT: '#F59E0B', // Amber
    light: '#FBBF24',
    dark: '#D97706',
    contrast: '#000000',
  },

  // Player colors
  players: {
    player1: '#E63946', // Red
    player2: '#2A9D8F', // Teal
    player3: '#E9C46A', // Yellow
  },

  // Game elements
  game: {
    dot: '#374151', // Gray-700
    dotActive: '#6366F1', // Primary
    line: '#9CA3AF', // Gray-400
    lineHover: '#6366F1', // Primary
    square: {
      player1: 'rgba(230, 57, 70, 0.3)',
      player2: 'rgba(42, 157, 143, 0.3)',
      player3: 'rgba(233, 196, 106, 0.3)',
    },
    board: '#F9FAFB', // Gray-50
    boardBorder: '#E5E7EB', // Gray-200
  },

  // UI Colors
  ui: {
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceSecondary: '#F3F4F6',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    disabled: '#D1D5DB',
  },

  // Status colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Dark theme overrides
  dark: {
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    border: '#334155',
    borderLight: '#475569',
    text: '#F9FAFB',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    disabled: '#475569',
    game: {
      dot: '#E5E7EB',
      board: '#1E293B',
      boardBorder: '#334155',
    },
  },
} as const;

// Helper to get player color by index
export function getPlayerColor(index: number): string {
  const colors = [COLORS.players.player1, COLORS.players.player2, COLORS.players.player3];
  return colors[index % colors.length];
}

// Helper to get square fill color by player index
export function getSquareFillColor(index: number): string {
  const fills = [
    COLORS.game.square.player1,
    COLORS.game.square.player2,
    COLORS.game.square.player3,
  ];
  return fills[index % fills.length];
}

