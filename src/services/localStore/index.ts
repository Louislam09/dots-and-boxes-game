// services/localStore/index.ts - TinyBase local-first store with Expo SQLite persistence

import { openDatabaseSync } from 'expo-sqlite';
import { createStore, Store } from 'tinybase';
import { createExpoSqlitePersister, ExpoSqlitePersister } from 'tinybase/persisters/persister-expo-sqlite';
import type { User } from '../../types/user';

// Database instance
const db = openDatabaseSync('dots_and_boxes.db');

// TinyBase store
let store: Store | null = null;
let persister: ExpoSqlitePersister | null = null;
let isInitialized = false;

// Table and row IDs
const TABLES = {
    AUTH: 'auth',
    USER: 'user',
    SETTINGS: 'settings',
} as const;

const ROWS = {
    SESSION: 'session',
    CURRENT_USER: 'current',
    APP_SETTINGS: 'app',
} as const;

/**
 * Initialize the local store with SQLite persistence
 */
export async function initLocalStore(): Promise<Store> {
    if (store && isInitialized) {
        return store;
    }

    // Create the TinyBase store
    store = createStore();

    // Create the SQLite persister
    persister = createExpoSqlitePersister(
        store,
        db,
        'tinybase_store', // Table name for JSON storage
        (sql, params) => {
            // Optional: Log SQL commands in development
            if (__DEV__) {
                console.log('[LocalStore SQL]', sql, params);
            }
        },
        (error) => {
            console.error('[LocalStore Error]', error);
        }
    );

    // Load existing data from SQLite
    await persister.load();

    // Start auto-saving changes to SQLite
    await persister.startAutoSave();

    isInitialized = true;
    return store;
}

/**
 * Get the store instance (must call initLocalStore first)
 */
export function getStore(): Store {
    if (!store) {
        throw new Error('LocalStore not initialized. Call initLocalStore() first.');
    }
    return store;
}

// ============================================
// AUTH / SESSION MANAGEMENT
// ============================================

export interface StoredSession {
    token: string;
    userId: string;
    expiresAt: string;
    createdAt: string;
}

/**
 * Save auth session to local store
 */
export function saveSession(token: string, userId: string, expiresAt?: string): void {
    const s = getStore();
    s.setRow(TABLES.AUTH, ROWS.SESSION, {
        token,
        userId,
        expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days default
        createdAt: new Date().toISOString(),
    });
}

/**
 * Get stored session
 */
export function getSession(): StoredSession | null {
    const s = getStore();
    const row = s.getRow(TABLES.AUTH, ROWS.SESSION);

    if (!row || !row.token) {
        return null;
    }

    return {
        token: row.token as string,
        userId: row.userId as string,
        expiresAt: row.expiresAt as string,
        createdAt: row.createdAt as string,
    };
}

/**
 * Check if session is valid (not expired)
 */
export function isSessionValid(): boolean {
    const session = getSession();
    if (!session) return false;

    const expiresAt = new Date(session.expiresAt);
    return expiresAt > new Date();
}

/**
 * Clear auth session
 */
export function clearSession(): void {
    const s = getStore();
    s.delRow(TABLES.AUTH, ROWS.SESSION);
}

// ============================================
// USER DATA MANAGEMENT
// ============================================

/**
 * Save user data to local store
 */
export function saveUser(user: User): void {
    const s = getStore();

    // Store user data as individual cells for easy access
    s.setRow(TABLES.USER, ROWS.CURRENT_USER, {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName || user.username,
        avatar: user.avatar || '',
        verified: user.verified ? 1 : 0,
        // Stats
        totalGamesPlayed: user.totalGamesPlayed,
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        totalDraws: user.totalDraws,
        totalScore: user.totalScore,
        currentStreak: user.currentStreak,
        bestStreak: user.bestStreak,
        level: user.level,
        experience: user.experience,
        // Settings
        soundEnabled: user.soundEnabled ? 1 : 0,
        musicEnabled: user.musicEnabled ? 1 : 0,
        vibrationEnabled: user.vibrationEnabled ? 1 : 0,
        theme: user.theme,
        // Timestamps
        created: user.created,
        updated: user.updated,
        lastSyncedAt: new Date().toISOString(),
    });
}

/**
 * Get user data from local store
 */
export function getUser(): User | null {
    const s = getStore();
    const row = s.getRow(TABLES.USER, ROWS.CURRENT_USER);

    if (!row || !row.id) {
        return null;
    }

    return {
        id: row.id as string,
        email: row.email as string,
        username: row.username as string,
        displayName: (row.displayName as string) || (row.username as string),
        avatar: (row.avatar as string) || '',
        verified: Boolean(row.verified),
        // Stats
        totalGamesPlayed: row.totalGamesPlayed as number,
        totalWins: row.totalWins as number,
        totalLosses: row.totalLosses as number,
        totalDraws: row.totalDraws as number,
        totalScore: row.totalScore as number,
        currentStreak: row.currentStreak as number,
        bestStreak: row.bestStreak as number,
        level: row.level as number,
        experience: row.experience as number,
        // Settings
        soundEnabled: Boolean(row.soundEnabled),
        musicEnabled: Boolean(row.musicEnabled),
        vibrationEnabled: Boolean(row.vibrationEnabled),
        theme: row.theme as 'dark' | 'light',
        // Timestamps
        created: row.created as string,
        updated: row.updated as string,
    };
}

/**
 * Update specific user fields
 */
export function updateUser(updates: Partial<User>): void {
    const s = getStore();
    const currentUser = getUser();

    if (!currentUser) {
        console.warn('Cannot update user: no user stored');
        return;
    }

    // Convert boolean values for storage
    const processedUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
        if (typeof value === 'boolean') {
            processedUpdates[key] = value ? 1 : 0;
        } else {
            processedUpdates[key] = value;
        }
    }

    // Update individual cells
    for (const [key, value] of Object.entries(processedUpdates)) {
        if (value !== undefined) {
            s.setCell(TABLES.USER, ROWS.CURRENT_USER, key, value as string | number | boolean);
        }
    }

    // Update lastSyncedAt
    s.setCell(TABLES.USER, ROWS.CURRENT_USER, 'lastSyncedAt', new Date().toISOString());
}

/**
 * Clear user data
 */
export function clearUser(): void {
    const s = getStore();
    s.delRow(TABLES.USER, ROWS.CURRENT_USER);
}

// ============================================
// APP SETTINGS
// ============================================

export interface AppSettings {
    lastRoomCode?: string;
    preferredBoardSize?: string;
    preferredTheme?: string;
    tutorialCompleted?: boolean;
}

/**
 * Save app settings
 */
export function saveAppSettings(settings: AppSettings): void {
    const s = getStore();
    s.setRow(TABLES.SETTINGS, ROWS.APP_SETTINGS, {
        lastRoomCode: settings.lastRoomCode || '',
        preferredBoardSize: settings.preferredBoardSize || '5x4',
        preferredTheme: settings.preferredTheme || 'sunset',
        tutorialCompleted: settings.tutorialCompleted ? 1 : 0,
    });
}

/**
 * Get app settings
 */
export function getAppSettings(): AppSettings {
    const s = getStore();
    const row = s.getRow(TABLES.SETTINGS, ROWS.APP_SETTINGS);

    return {
        lastRoomCode: row?.lastRoomCode as string | undefined,
        preferredBoardSize: (row?.preferredBoardSize as string) || '5x4',
        preferredTheme: (row?.preferredTheme as string) || 'sunset',
        tutorialCompleted: Boolean(row?.tutorialCompleted),
    };
}

/**
 * Update app settings
 */
export function updateAppSettings(updates: Partial<AppSettings>): void {
    const s = getStore();

    for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
            const storedValue = typeof value === 'boolean' ? (value ? 1 : 0) : value;
            s.setCell(TABLES.SETTINGS, ROWS.APP_SETTINGS, key, storedValue as string | number | boolean);
        }
    }
}

// ============================================
// CLEANUP
// ============================================

/**
 * Clear all local data (for logout)
 */
export function clearAllData(): void {
    const s = getStore();
    s.delTable(TABLES.AUTH);
    s.delTable(TABLES.USER);
    // Keep settings table
}

/**
 * Destroy the store and persister (for app cleanup)
 */
export async function destroyLocalStore(): Promise<void> {
    if (persister) {
        await persister.stopAutoSave();
        await persister.destroy();
        persister = null;
    }
    store = null;
    isInitialized = false;
}

// Export store instance getter
export { store };

