// services/pocketbase/index.ts - Re-export all PocketBase services

export { pb, initAuth } from './client';
export { authService } from './auth';
export { roomService } from './rooms';
export { userService } from './users';
export { gameService } from './games';
export { leaderboardService } from './leaderboard';

