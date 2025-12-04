// utils/storage.ts - Async storage utilities

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';

/**
 * Storage utility for persisting data
 */
export const storage = {
  /**
   * Get a value from storage
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Storage.get error for key "${key}":`, error);
      return null;
    }
  },

  /**
   * Set a value in storage
   */
  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Storage.set error for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Remove a value from storage
   */
  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Storage.remove error for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage.clear error:', error);
      return false;
    }
  },

  /**
   * Get all keys
   */
  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Storage.getAllKeys error:', error);
      return [];
    }
  },

  /**
   * Get multiple values
   */
  async multiGet<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, T | null> = {};
      for (const [key, value] of pairs) {
        result[key] = value ? (JSON.parse(value) as T) : null;
      }
      return result;
    } catch (error) {
      console.error('Storage.multiGet error:', error);
      return {};
    }
  },

  /**
   * Set multiple values
   */
  async multiSet(keyValues: Array<[string, unknown]>): Promise<boolean> {
    try {
      const pairs: Array<[string, string]> = keyValues.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('Storage.multiSet error:', error);
      return false;
    }
  },
};

// Game state storage helpers
export const gameStorage = {
  /**
   * Save current game state for reconnection
   */
  async saveGameState(roomCode: string, lastMoveId?: string): Promise<void> {
    await storage.set(CONFIG.STORAGE_KEYS.GAME_STATE, {
      roomCode,
      lastMoveId,
      savedAt: new Date().toISOString(),
    });
  },

  /**
   * Load saved game state
   */
  async loadGameState(): Promise<{
    roomCode: string;
    lastMoveId?: string;
    savedAt: string;
  } | null> {
    return storage.get(CONFIG.STORAGE_KEYS.GAME_STATE);
  },

  /**
   * Clear saved game state
   */
  async clearGameState(): Promise<void> {
    await storage.remove(CONFIG.STORAGE_KEYS.GAME_STATE);
  },
};

// User settings storage helpers
export interface UserSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'dark' | 'light';
}

export const settingsStorage = {
  /**
   * Get user settings with defaults
   */
  async getSettings(): Promise<UserSettings> {
    const settings = await storage.get<UserSettings>(CONFIG.STORAGE_KEYS.SETTINGS);
    return {
      soundEnabled: true,
      musicEnabled: true,
      vibrationEnabled: true,
      theme: 'dark',
      ...settings,
    };
  },

  /**
   * Update user settings
   */
  async updateSettings(updates: Partial<UserSettings>): Promise<void> {
    const current = await settingsStorage.getSettings();
    await storage.set(CONFIG.STORAGE_KEYS.SETTINGS, { ...current, ...updates });
  },
};

