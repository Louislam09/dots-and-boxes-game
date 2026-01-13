// services/socket/client.ts - Socket.io client service

import { io, Socket } from 'socket.io-client';
import { CONFIG } from '../../constants/config';
import { gameStorage } from '../../utils/storage';
import { CLIENT_EVENTS, SERVER_EVENTS } from './events';
import type { ServerToClientEvents, ClientToServerEvents } from '../../types/socket';
import type { Player, GameState, Line, Square } from '../../types/game';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export type SocketEventCallback = {
  onPlayerJoined?: (data: { player: Player; players: Player[] }) => void;
  onPlayerLeft?: (data: { playerId: string; players: Player[] }) => void;
  onPlayerDisconnected?: (data: { playerId: string }) => void;
  onPlayerReconnected?: (data: { playerId: string }) => void;
  onGameStarted?: (data: { players: Player[]; firstPlayerId: string }) => void;
  onMoveMade?: (data: {
    playerId: string;
    dot1Id: number;
    dot2Id: number;
    line: Line;
    completedSquares: Square[];
    nextPlayerId: string;
    scores: Record<string, number>;
  }) => void;
  onGameOver?: (data: {
    winner: Player | null;
    isDraw: boolean;
    finalScores: Record<string, number>;
    reason?: 'completed' | 'opponent_abandoned';
  }) => void;
  onPlayAgainRequested?: (data: { playerId: string }) => void;
  onNewGameStarting?: () => void;
  onRejoinSuccess?: (data: { gameState: GameState; players: Player[] }) => void;
  onRejoinFailed?: (data: { reason: string }) => void;
  onGameSync?: (data: { gameState: GameState; players: Player[]; scores: Record<string, number> }) => void;
  onRoomClosed?: (data: { reason: string }) => void;
  onError?: (data: { message: string; code: string }) => void;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
};

class SocketService {
  private socket: TypedSocket | null = null;
  private reconnectAttempts = 0;
  private currentRoomCode: string | null = null;
  private callbacks: SocketEventCallback = {};

  /**
   * Connect to Socket.io server with auth token
   */
  connect(token: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.socket?.connected) {
        resolve(true);
        return;
      }

      this.socket = io(CONFIG.SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: CONFIG.RECONNECTION.MAX_ATTEMPTS,
        reconnectionDelay: CONFIG.RECONNECTION.DELAY,
        reconnectionDelayMax: CONFIG.RECONNECTION.DELAY_MAX,
      }) as TypedSocket;

      this.setupEventListeners();

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.reconnectAttempts = 0;
        this.callbacks.onConnect?.();
        resolve(true);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        resolve(false);
      });
    });
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentRoomCode = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: SocketEventCallback): void {
    this.callbacks = callbacks;
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('disconnect', async (reason) => {
      console.log('Socket disconnected:', reason);
      
      // Save game state for reconnection
      if (this.currentRoomCode) {
        await gameStorage.saveGameState(this.currentRoomCode);
      }
      
      this.callbacks.onDisconnect?.(reason);
    });

    // Player events
    this.socket.on(SERVER_EVENTS.PLAYER_JOINED, (data) => {
      this.callbacks.onPlayerJoined?.(data);
    });

    this.socket.on(SERVER_EVENTS.PLAYER_LEFT, (data) => {
      this.callbacks.onPlayerLeft?.(data);
    });

    this.socket.on(SERVER_EVENTS.PLAYER_DISCONNECTED, (data) => {
      this.callbacks.onPlayerDisconnected?.(data);
    });

    this.socket.on(SERVER_EVENTS.PLAYER_RECONNECTED, (data) => {
      this.callbacks.onPlayerReconnected?.(data);
    });

    // Game events
    this.socket.on(SERVER_EVENTS.GAME_STARTED, (data) => {
      this.callbacks.onGameStarted?.(data);
    });

    this.socket.on(SERVER_EVENTS.MOVE_MADE, (data) => {
      this.callbacks.onMoveMade?.(data);
    });

    this.socket.on(SERVER_EVENTS.GAME_OVER, async (data) => {
      await gameStorage.clearGameState();
      this.callbacks.onGameOver?.(data);
    });

    // Play again events
    this.socket.on(SERVER_EVENTS.PLAY_AGAIN_REQUESTED, (data) => {
      this.callbacks.onPlayAgainRequested?.(data);
    });

    this.socket.on(SERVER_EVENTS.NEW_GAME_STARTING, () => {
      this.callbacks.onNewGameStarting?.();
    });

    // Rejoin events
    this.socket.on(SERVER_EVENTS.REJOIN_SUCCESS, (data) => {
      this.callbacks.onRejoinSuccess?.(data);
    });

    this.socket.on(SERVER_EVENTS.REJOIN_FAILED, async (data) => {
      await gameStorage.clearGameState();
      this.callbacks.onRejoinFailed?.(data);
    });

    // Sync events (for late joiners)
    this.socket.on(SERVER_EVENTS.GAME_SYNC, (data) => {
      this.callbacks.onGameSync?.(data);
    });

    // Room events
    this.socket.on(SERVER_EVENTS.ROOM_CLOSED, async (data) => {
      this.currentRoomCode = null;
      await gameStorage.clearGameState();
      this.callbacks.onRoomClosed?.(data);
    });

    // Error events
    this.socket.on(SERVER_EVENTS.ERROR, (data) => {
      this.callbacks.onError?.(data);
    });
  }

  // ============ ROOM ACTIONS ============

  /**
   * Join a room
   */
  joinRoom(roomCode: string, roomId: string, gameMode?: '1vs1' | '3players', maxPlayers?: number): void {
    if (!this.socket) return;
    this.currentRoomCode = roomCode;
    this.socket.emit(CLIENT_EVENTS.JOIN_ROOM, { 
      roomCode, 
      roomId,
      gameMode: gameMode || '1vs1',
      maxPlayers: maxPlayers || 2,
    });
  }

  /**
   * Leave current room
   */
  leaveRoom(): void {
    if (!this.socket || !this.currentRoomCode) return;
    this.socket.emit(CLIENT_EVENTS.LEAVE_ROOM, { roomCode: this.currentRoomCode });
    this.currentRoomCode = null;
  }

  /**
   * Attempt to rejoin a room after disconnection
   */
  async rejoinRoom(): Promise<void> {
    if (!this.socket) return;

    const savedState = await gameStorage.loadGameState();
    if (savedState?.roomCode) {
      this.currentRoomCode = savedState.roomCode;
      this.socket.emit(CLIENT_EVENTS.REJOIN_ROOM, {
        roomCode: savedState.roomCode,
        lastMoveId: savedState.lastMoveId,
      });
    }
  }

  // ============ GAME ACTIONS ============

  /**
   * Start the game (host only)
   */
  startGame(): void {
    if (!this.socket || !this.currentRoomCode) return;
    this.socket.emit(CLIENT_EVENTS.START_GAME, { roomCode: this.currentRoomCode });
  }

  /**
   * Make a move
   */
  makeMove(dot1Id: number, dot2Id: number): void {
    if (!this.socket || !this.currentRoomCode) return;
    this.socket.emit(CLIENT_EVENTS.MAKE_MOVE, {
      roomCode: this.currentRoomCode,
      dot1Id,
      dot2Id,
    });
  }

  /**
   * Request to play again
   */
  requestPlayAgain(): void {
    if (!this.socket || !this.currentRoomCode) return;
    this.socket.emit(CLIENT_EVENTS.REQUEST_PLAY_AGAIN, { roomCode: this.currentRoomCode });
  }

  /**
   * Accept play again request
   */
  acceptPlayAgain(): void {
    if (!this.socket || !this.currentRoomCode) return;
    this.socket.emit(CLIENT_EVENTS.ACCEPT_PLAY_AGAIN, { roomCode: this.currentRoomCode });
  }

  /**
   * Get current room code
   */
  getCurrentRoomCode(): string | null {
    return this.currentRoomCode;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;

