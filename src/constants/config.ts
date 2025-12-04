// constants/config.ts - App configuration

export const CONFIG = {
  // API URLs (use environment variables in production)
  POCKETBASE_URL: process.env.EXPO_PUBLIC_POCKETBASE_URL || 'http://localhost:8090',
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000',

  // App settings
  APP_NAME: 'Dots & Boxes',
  APP_VERSION: '1.0.0',
  APP_SCHEME: 'dotsandboxes',

  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    GAME_STATE: 'game_state',
    SETTINGS: 'settings',
  },

  // Timeouts
  TIMEOUTS: {
    SOCKET_RECONNECT: 5000,
    ABANDON_TIMEOUT: 60000, // 1 minute
    ROOM_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
    INVITE_EXPIRY: 10 * 60 * 1000, // 10 minutes
  },

  // Rate limiting
  RATE_LIMIT: {
    MAX_REQUESTS: 10,
    WINDOW_MS: 5000, // 5 seconds
  },

  // Reconnection
  RECONNECTION: {
    MAX_ATTEMPTS: 5,
    DELAY: 1000,
    DELAY_MAX: 10000,
  },
} as const;

