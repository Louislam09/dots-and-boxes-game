// types/achievement.ts - Achievement types

export type AchievementCategory = 'games' | 'wins' | 'score' | 'special';

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: number;
  experienceReward: number;
}

export interface UserAchievement {
  id: string;
  oduserId: string;
  achievementId: string;
  achievement?: Achievement;
  progress: number;
  unlockedAt: string | null;
}

export interface AchievementProgress {
  achievement: Achievement;
  current: number;
  target: number;
  percentage: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

