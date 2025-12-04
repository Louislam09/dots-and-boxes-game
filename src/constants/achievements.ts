// constants/achievements.ts - Achievement definitions

import type { Achievement, AchievementCategory } from '../types/achievement';

// Achievement keys for type safety
export const ACHIEVEMENT_KEYS = {
  // Game count achievements
  FIRST_GAME: 'first_game',
  GAMES_10: 'games_10',
  GAMES_50: 'games_50',
  GAMES_100: 'games_100',
  GAMES_500: 'games_500',

  // Win achievements
  FIRST_WIN: 'first_win',
  WINS_10: 'wins_10',
  WINS_50: 'wins_50',
  WINS_100: 'wins_100',

  // Streak achievements
  STREAK_3: 'streak_3',
  STREAK_5: 'streak_5',
  STREAK_10: 'streak_10',

  // Score achievements
  SCORE_100: 'score_100',
  SCORE_500: 'score_500',
  SCORE_1000: 'score_1000',

  // Special achievements
  PERFECT_GAME: 'perfect_game', // Win with max score possible
  COMEBACK_KING: 'comeback_king', // Win after being 10+ points behind
  SPEED_DEMON: 'speed_demon', // Win a game in under 2 minutes
  DOMINATION: 'domination', // Win by 20+ points in 1vs1
} as const;

// Achievement definitions
export const ACHIEVEMENTS: Record<string, Omit<Achievement, 'id'>> = {
  // Game count achievements
  [ACHIEVEMENT_KEYS.FIRST_GAME]: {
    key: ACHIEVEMENT_KEYS.FIRST_GAME,
    name: 'First Steps',
    description: 'Play your first game',
    icon: '🎮',
    category: 'games' as AchievementCategory,
    requirement: 1,
    experienceReward: 50,
  },
  [ACHIEVEMENT_KEYS.GAMES_10]: {
    key: ACHIEVEMENT_KEYS.GAMES_10,
    name: 'Getting Started',
    description: 'Play 10 games',
    icon: '🎯',
    category: 'games' as AchievementCategory,
    requirement: 10,
    experienceReward: 100,
  },
  [ACHIEVEMENT_KEYS.GAMES_50]: {
    key: ACHIEVEMENT_KEYS.GAMES_50,
    name: 'Regular Player',
    description: 'Play 50 games',
    icon: '⭐',
    category: 'games' as AchievementCategory,
    requirement: 50,
    experienceReward: 250,
  },
  [ACHIEVEMENT_KEYS.GAMES_100]: {
    key: ACHIEVEMENT_KEYS.GAMES_100,
    name: 'Dedicated Player',
    description: 'Play 100 games',
    icon: '🌟',
    category: 'games' as AchievementCategory,
    requirement: 100,
    experienceReward: 500,
  },
  [ACHIEVEMENT_KEYS.GAMES_500]: {
    key: ACHIEVEMENT_KEYS.GAMES_500,
    name: 'Veteran',
    description: 'Play 500 games',
    icon: '👑',
    category: 'games' as AchievementCategory,
    requirement: 500,
    experienceReward: 1000,
  },

  // Win achievements
  [ACHIEVEMENT_KEYS.FIRST_WIN]: {
    key: ACHIEVEMENT_KEYS.FIRST_WIN,
    name: 'First Victory',
    description: 'Win your first game',
    icon: '🏆',
    category: 'wins' as AchievementCategory,
    requirement: 1,
    experienceReward: 100,
  },
  [ACHIEVEMENT_KEYS.WINS_10]: {
    key: ACHIEVEMENT_KEYS.WINS_10,
    name: 'Winner',
    description: 'Win 10 games',
    icon: '🥇',
    category: 'wins' as AchievementCategory,
    requirement: 10,
    experienceReward: 200,
  },
  [ACHIEVEMENT_KEYS.WINS_50]: {
    key: ACHIEVEMENT_KEYS.WINS_50,
    name: 'Champion',
    description: 'Win 50 games',
    icon: '🏅',
    category: 'wins' as AchievementCategory,
    requirement: 50,
    experienceReward: 500,
  },
  [ACHIEVEMENT_KEYS.WINS_100]: {
    key: ACHIEVEMENT_KEYS.WINS_100,
    name: 'Legend',
    description: 'Win 100 games',
    icon: '🎖️',
    category: 'wins' as AchievementCategory,
    requirement: 100,
    experienceReward: 1000,
  },

  // Streak achievements
  [ACHIEVEMENT_KEYS.STREAK_3]: {
    key: ACHIEVEMENT_KEYS.STREAK_3,
    name: 'Hat Trick',
    description: 'Win 3 games in a row',
    icon: '🔥',
    category: 'special' as AchievementCategory,
    requirement: 3,
    experienceReward: 150,
  },
  [ACHIEVEMENT_KEYS.STREAK_5]: {
    key: ACHIEVEMENT_KEYS.STREAK_5,
    name: 'Hot Streak',
    description: 'Win 5 games in a row',
    icon: '💫',
    category: 'special' as AchievementCategory,
    requirement: 5,
    experienceReward: 300,
  },
  [ACHIEVEMENT_KEYS.STREAK_10]: {
    key: ACHIEVEMENT_KEYS.STREAK_10,
    name: 'Unstoppable',
    description: 'Win 10 games in a row',
    icon: '⚡',
    category: 'special' as AchievementCategory,
    requirement: 10,
    experienceReward: 750,
  },

  // Score achievements
  [ACHIEVEMENT_KEYS.SCORE_100]: {
    key: ACHIEVEMENT_KEYS.SCORE_100,
    name: 'Century',
    description: 'Accumulate 100 total squares',
    icon: '💯',
    category: 'score' as AchievementCategory,
    requirement: 100,
    experienceReward: 100,
  },
  [ACHIEVEMENT_KEYS.SCORE_500]: {
    key: ACHIEVEMENT_KEYS.SCORE_500,
    name: 'High Scorer',
    description: 'Accumulate 500 total squares',
    icon: '📈',
    category: 'score' as AchievementCategory,
    requirement: 500,
    experienceReward: 300,
  },
  [ACHIEVEMENT_KEYS.SCORE_1000]: {
    key: ACHIEVEMENT_KEYS.SCORE_1000,
    name: 'Score Master',
    description: 'Accumulate 1000 total squares',
    icon: '🎪',
    category: 'score' as AchievementCategory,
    requirement: 1000,
    experienceReward: 750,
  },

  // Special achievements
  [ACHIEVEMENT_KEYS.PERFECT_GAME]: {
    key: ACHIEVEMENT_KEYS.PERFECT_GAME,
    name: 'Perfect Game',
    description: 'Win a 1vs1 game 64-0',
    icon: '💎',
    category: 'special' as AchievementCategory,
    requirement: 1,
    experienceReward: 1000,
  },
  [ACHIEVEMENT_KEYS.COMEBACK_KING]: {
    key: ACHIEVEMENT_KEYS.COMEBACK_KING,
    name: 'Comeback King',
    description: 'Win after being 10+ squares behind',
    icon: '👊',
    category: 'special' as AchievementCategory,
    requirement: 1,
    experienceReward: 500,
  },
  [ACHIEVEMENT_KEYS.SPEED_DEMON]: {
    key: ACHIEVEMENT_KEYS.SPEED_DEMON,
    name: 'Speed Demon',
    description: 'Win a game in under 2 minutes',
    icon: '⏱️',
    category: 'special' as AchievementCategory,
    requirement: 1,
    experienceReward: 300,
  },
  [ACHIEVEMENT_KEYS.DOMINATION]: {
    key: ACHIEVEMENT_KEYS.DOMINATION,
    name: 'Domination',
    description: 'Win a 1vs1 game by 20+ squares',
    icon: '💪',
    category: 'special' as AchievementCategory,
    requirement: 1,
    experienceReward: 400,
  },
};

// Helper to get achievement by key
export function getAchievement(key: string): Omit<Achievement, 'id'> | undefined {
  return ACHIEVEMENTS[key];
}

// Get all achievements for a category
export function getAchievementsByCategory(
  category: AchievementCategory
): Array<Omit<Achievement, 'id'>> {
  return Object.values(ACHIEVEMENTS).filter((a) => a.category === category);
}

