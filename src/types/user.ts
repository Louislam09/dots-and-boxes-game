// types/user.ts - User types

export type Theme = 'dark' | 'light';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;

  // Statistics
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalScore: number;
  currentStreak: number;
  bestStreak: number;

  // Leveling
  level: number;
  experience: number;

  // Settings
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  theme: Theme;

  created: string;
  updated: string;
}

export interface RegisterData {
  email: string;
  password: string;
  passwordConfirm: string;
  username: string;
  displayName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  displayName?: string;
  avatar?: File | Blob;
  soundEnabled?: boolean;
  musicEnabled?: boolean;
  vibrationEnabled?: boolean;
  theme?: Theme;
}

export interface UserStats {
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalScore: number;
  currentStreak: number;
  bestStreak: number;
  winRate: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
}

