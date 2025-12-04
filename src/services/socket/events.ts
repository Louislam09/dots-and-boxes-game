// services/socket/events.ts - Socket event constants

// Client to Server events
export const CLIENT_EVENTS = {
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  REJOIN_ROOM: 'rejoin-room',
  START_GAME: 'start-game',
  MAKE_MOVE: 'make-move',
  REQUEST_PLAY_AGAIN: 'request-play-again',
  ACCEPT_PLAY_AGAIN: 'accept-play-again',
} as const;

// Server to Client events
export const SERVER_EVENTS = {
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  PLAYER_DISCONNECTED: 'player-disconnected',
  PLAYER_RECONNECTED: 'player-reconnected',
  GAME_STARTED: 'game-started',
  MOVE_MADE: 'move-made',
  GAME_OVER: 'game-over',
  PLAY_AGAIN_REQUESTED: 'play-again-requested',
  NEW_GAME_STARTING: 'new-game-starting',
  REJOIN_SUCCESS: 'rejoin-success',
  REJOIN_FAILED: 'rejoin-failed',
  ROOM_CLOSED: 'room-closed',
  ERROR: 'error',
} as const;

// Error codes
export const ERROR_CODES = {
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  ROOM_FULL: 'ROOM_FULL',
  GAME_NOT_ACTIVE: 'GAME_NOT_ACTIVE',
  NOT_YOUR_TURN: 'NOT_YOUR_TURN',
  INVALID_DOTS: 'INVALID_DOTS',
  NOT_ADJACENT: 'NOT_ADJACENT',
  ALREADY_CONNECTED: 'ALREADY_CONNECTED',
  MOVE_IN_PROGRESS: 'MOVE_IN_PROGRESS',
  NOT_ROOM_OWNER: 'NOT_ROOM_OWNER',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
} as const;

