// constants/config.ts - App configuration
// 
// Set these environment variables in your .env.local file:
//   EXPO_PUBLIC_POCKETBASE_URL=https://your-pocketbase-url.com
//   EXPO_PUBLIC_SOCKET_URL=https://your-socket-url.com

export const CONFIG = {
  // API URLs - Set via environment variables
  POCKETBASE_URL: process.env.EXPO_PUBLIC_POCKETBASE_URL || 'https://tick-dynamic-trout.ngrok-free.app',
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001',

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

