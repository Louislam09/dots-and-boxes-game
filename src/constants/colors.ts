// constants/colors.ts - Dark Gaming Theme Design System

export const COLORS = {
  // Background gradient colors
  background: {
    primary: '#0A0E27',
    secondary: '#1A1F3C',
    tertiary: '#0F1629',
  },

  // Glassmorphism
  glass: {
    background: 'rgba(255, 255, 255, 0.05)',
    backgroundLight: 'rgba(255, 255, 255, 0.08)',
    backgroundHover: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.15)',
  },

  // Accent colors
  accent: {
    primary: '#00D9FF', // Electric cyan
    primaryLight: '#33E4FF',
    primaryDark: '#00B8D9',
    secondary: '#A855F7', // Neon purple
    secondaryLight: '#C084FC',
    secondaryDark: '#9333EA',
    tertiary: '#F472B6', // Pink
  },

  // Player colors
  players: {
    player1: '#E63946', // Coral Red
    player2: '#2A9D8F', // Teal
    player3: '#E9C46A', // Gold
    player4: '#A855F7', // Purple
  },

  // Status colors
  status: {
    success: '#10B981',
    successLight: '#34D399',
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    error: '#F43F5E',
    errorLight: '#FB7185',
    info: '#3B82F6',
    infoLight: '#60A5FA',
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#94A3B8',
    muted: '#64748B',
    disabled: '#475569',
    accent: '#00D9FF',
    gradient: 'linear-gradient(90deg, #00D9FF, #A855F7)',
  },

  // Game elements
  game: {
    dot: '#E5E7EB',
    dotActive: '#00D9FF',
    dotHover: '#00D9FF',
    line: '#94A3B8',
    lineActive: '#00D9FF',
    gridLine: '#CBD5E1', // Shadow/guide lines showing possible connections
    board: 'rgba(255, 255, 255, 0.03)',
    boardBorder: 'rgba(255, 255, 255, 0.1)',
    square: {
      player1: 'rgba(230, 57, 70, 0.4)',
      player2: 'rgba(42, 157, 143, 0.4)',
      player3: 'rgba(233, 196, 106, 0.4)',
      player4: 'rgba(168, 85, 247, 0.4)',
    },
  },

  // UI specifics
  ui: {
    cardBackground: 'rgba(255, 255, 255, 0.05)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    inputBackground: 'rgba(255, 255, 255, 0.05)',
    inputBorder: 'rgba(255, 255, 255, 0.15)',
    inputFocusBorder: '#00D9FF',
    buttonPrimary: '#00D9FF',
    buttonSecondary: '#A855F7',
    divider: 'rgba(255, 255, 255, 0.1)',
  },

  // Glow effects (for shadow/glow styling)
  glow: {
    primary: '#00D9FF',
    secondary: '#A855F7',
    success: '#10B981',
    error: '#F43F5E',
    player1: '#E63946',
    player2: '#2A9D8F',
    player3: '#E9C46A',
    player4: '#A855F7',
  },
} as const;

// Helper to get player color by index
export function getPlayerColor(index: number): string {
  const colors = [
    COLORS.players.player1, 
    COLORS.players.player2, 
    COLORS.players.player3,
    COLORS.players.player4,
  ];
  return colors[index % colors.length];
}

// Helper to get square fill color by player index
export function getSquareFillColor(index: number): string {
  const fills = [
    COLORS.game.square.player1,
    COLORS.game.square.player2,
    COLORS.game.square.player3,
    COLORS.game.square.player4,
  ];
  return fills[index % fills.length];
}

// Helper to get glow color by player index
export function getPlayerGlowColor(index: number): string {
  const glows = [
    COLORS.glow.player1, 
    COLORS.glow.player2, 
    COLORS.glow.player3,
    COLORS.glow.player4,
  ];
  return glows[index % glows.length];
}
