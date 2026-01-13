// server/socket-server/src/socket.ts - Socket.io handlers

import type { Server, Socket } from 'socket.io';
import PocketBase from 'pocketbase';
import { rateLimiter } from './middleware/auth.js';
import {
  initializeBoard,
  validateMove,
  processMove,
  determineWinner,
  getPlayerColor,
} from './game/logic.js';
import type { RoomState, Player, GameState } from './types/index.js';

// Use your ngrok URL for PocketBase
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'https://tick-dynamic-trout.ngrok-free.app';
const pb = new PocketBase(POCKETBASE_URL);

// Authenticate server with PocketBase (optional - needed if API rules require auth)
async function initPocketBase() {
  try {
    // Use admin credentials or create a service account
    const adminEmail = process.env.PB_ADMIN_EMAIL;
    const adminPassword = process.env.PB_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);
      console.log('✅ PocketBase authenticated');
    }
  } catch (error) {
    console.warn('⚠️ PocketBase auth failed - using unauthenticated access');
  }
}

initPocketBase();

// In-memory room storage
const rooms = new Map<string, RoomState>();

// Pending move locks
const pendingMoves = new Map<string, boolean>();

// Disconnect timers
const disconnectTimers = new Map<string, NodeJS.Timeout>();

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    console.log(`User connected: ${user.displayName} (${socket.id})`);

    // ============ ROOM HANDLERS ============

    socket.on('join-room', async ({ roomCode, roomId, gameMode: clientGameMode, maxPlayers: clientMaxPlayers }) => {
      try {
        let room = rooms.get(roomCode);

        if (!room) {
          // Fetch room from PocketBase
          console.log(`Fetching room ${roomId} from PocketBase...`);
          try {
            const pbRoom = await pb.collection('rooms').getOne(roomId);
            console.log(`Room fetched successfully:`, pbRoom);

            room = {
              code: roomCode,
              roomId,
              hostId: pbRoom.owner,
              gameMode: pbRoom.gameMode as '1vs1' | '3players',
              maxPlayers: pbRoom.maxPlayers,
              players: new Map(),
              gameState: null,
              playAgainRequests: new Set(),
              lastActivityAt: Date.now(),
            };
            rooms.set(roomCode, room);
          } catch (pbError: any) {
            console.error('PocketBase fetch error:', pbError?.message || pbError);
            // If PocketBase fails, create room from client data
            // This allows the game to work even if PocketBase has strict API rules
            console.log('Creating room from client data as fallback...');
            const gm = clientGameMode || '1vs1';
            const mp = clientMaxPlayers || (gm === '3players' ? 3 : 2);
            room = {
              code: roomCode,
              roomId,
              hostId: user.id, // First joiner is host
              gameMode: gm,
              maxPlayers: mp,
              players: new Map(),
              gameState: null,
              playAgainRequests: new Set(),
              lastActivityAt: Date.now(),
            };
            rooms.set(roomCode, room);
          }
        }

        // Check if room is full
        if (room.players.size >= room.maxPlayers && !room.players.has(user.id)) {
          socket.emit('error', { message: 'Room is full', code: 'ROOM_FULL' });
          return;
        }

        // Clear any disconnect timer
        const timerKey = `${roomCode}:${user.id}`;
        const timer = disconnectTimers.get(timerKey);
        if (timer) {
          clearTimeout(timer);
          disconnectTimers.delete(timerKey);
        }

        // Add player to room
        const playerIndex = room.players.size;
        const player: Player = {
          id: user.id,
          socketId: socket.id,
          name: user.displayName,
          color: getPlayerColor(playerIndex),
          score: 0,
          isOwner: user.id === room.hostId || room.players.size === 0,
          isConnected: true,
        };

        // If this is the first player, they become the host
        if (room.players.size === 0) {
          room.hostId = user.id;
        }

        room.players.set(user.id, player);
        room.lastActivityAt = Date.now();

        socket.join(roomCode);
        socket.data.currentRoom = roomCode;

        // Notify all players
        const players = Array.from(room.players.values());
        io.to(roomCode).emit('player-joined', { player, players });

        console.log(`${user.displayName} joined room ${roomCode} (${room.players.size}/${room.maxPlayers} players)`);
      } catch (error: any) {
        console.error('Join room error:', error?.message || error);
        socket.emit('error', { message: 'Failed to join room', code: 'JOIN_FAILED' });
      }
    });

    socket.on('leave-room', async ({ roomCode }) => {
      await handleLeaveRoom(socket, roomCode);
    });

    // ============ GAME HANDLERS ============

    socket.on('start-game', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) {
        socket.emit('error', { message: 'Room not found', code: 'ROOM_NOT_FOUND' });
        return;
      }

      if (user.id !== room.hostId) {
        socket.emit('error', { message: 'Only host can start', code: 'NOT_ROOM_OWNER' });
        return;
      }

      if (room.players.size < 2) {
        socket.emit('error', { message: 'Need at least 2 players', code: 'NOT_ENOUGH_PLAYERS' });
        return;
      }

      // Initialize game
      const { dots, squares } = initializeBoard();
      const players = Array.from(room.players.values());
      const firstPlayerId = players[Math.floor(Math.random() * players.length)].id;

      room.gameState = {
        status: 'playing',
        dots,
        squares,
        lines: [],
        currentTurnPlayerId: firstPlayerId,
        moveCount: 0,
        startedAt: new Date().toISOString(),
      };

      room.lastActivityAt = Date.now();

      io.to(roomCode).emit('game-started', { players, firstPlayerId });
      console.log(`Game started in room ${roomCode}`);
    });

    socket.on('make-move', async ({ roomCode, dot1Id, dot2Id }) => {
      // Rate limiting
      if (!rateLimiter.check(user.id)) {
        socket.emit('error', { message: 'Too many requests', code: 'TOO_MANY_REQUESTS' });
        return;
      }

      const room = rooms.get(roomCode);
      if (!room || !room.gameState) {
        socket.emit('error', { message: 'Room not found', code: 'ROOM_NOT_FOUND' });
        return;
      }

      // Move locking
      const lockKey = `${roomCode}:move`;
      if (pendingMoves.get(lockKey)) {
        socket.emit('error', { message: 'Move in progress', code: 'MOVE_IN_PROGRESS' });
        return;
      }

      pendingMoves.set(lockKey, true);

      try {
        const gameState = room.gameState;

        // Validate move
        const validation = validateMove(gameState, dot1Id, dot2Id, user.id);
        if (!validation.valid) {
          socket.emit('error', { message: validation.error!, code: 'INVALID_MOVE' });
          return;
        }

        const player = room.players.get(user.id)!;
        const result = processMove(gameState, dot1Id, dot2Id, user.id, player.color);

        // Update player scores
        for (const [playerId, score] of Object.entries(result.scores)) {
          const p = room.players.get(playerId);
          if (p) p.score = score;
        }

        // Determine next player
        let nextPlayerId = result.nextPlayerId;
        if (!nextPlayerId || result.completedSquares.length === 0) {
          const players = Array.from(room.players.values());
          const currentIndex = players.findIndex(p => p.id === user.id);
          const nextIndex = (currentIndex + 1) % players.length;
          nextPlayerId = players[nextIndex].id;
        } else {
          nextPlayerId = user.id;
        }

        gameState.currentTurnPlayerId = nextPlayerId;
        gameState.moveCount++;
        gameState.lines.push(result.line);
        room.lastActivityAt = Date.now();

        // Broadcast move
        io.to(roomCode).emit('move-made', {
          playerId: user.id,
          dot1Id,
          dot2Id,
          line: result.line,
          completedSquares: result.completedSquares,
          nextPlayerId,
          scores: result.scores,
        });

        // Check game over
        if (result.isGameOver) {
          gameState.status = 'finished';
          const players = Array.from(room.players.values());
          const winResult = determineWinner(players);

          io.to(roomCode).emit('game-over', {
            winner: winResult.winner,
            isDraw: winResult.isDraw,
            finalScores: winResult.finalScores,
          });

          // Save game to PocketBase
          await saveGame(room, winResult);

          console.log(`Game over in room ${roomCode}`);
        }
      } finally {
        pendingMoves.delete(lockKey);
      }
    });

    // ============ PLAY AGAIN HANDLERS ============

    socket.on('request-play-again', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      room.playAgainRequests.add(user.id);
      socket.to(roomCode).emit('play-again-requested', { playerId: user.id });

      // Check if all players want to play again
      if (room.playAgainRequests.size >= room.players.size) {
        room.playAgainRequests.clear();

        // Reset game
        const { dots, squares } = initializeBoard();
        const players = Array.from(room.players.values());
        const firstPlayerId = players[Math.floor(Math.random() * players.length)].id;

        // Reset player scores
        for (const player of room.players.values()) {
          player.score = 0;
        }

        room.gameState = {
          status: 'playing',
          dots,
          squares,
          lines: [],
          currentTurnPlayerId: firstPlayerId,
          moveCount: 0,
          startedAt: new Date().toISOString(),
        };

        io.to(roomCode).emit('new-game-starting');
        io.to(roomCode).emit('game-started', { players, firstPlayerId });
      }
    });

    socket.on('accept-play-again', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      room.playAgainRequests.add(user.id);

      if (room.playAgainRequests.size >= room.players.size) {
        room.playAgainRequests.clear();

        const { dots, squares } = initializeBoard();
        const players = Array.from(room.players.values());
        const firstPlayerId = players[Math.floor(Math.random() * players.length)].id;

        for (const player of room.players.values()) {
          player.score = 0;
        }

        room.gameState = {
          status: 'playing',
          dots,
          squares,
          lines: [],
          currentTurnPlayerId: firstPlayerId,
          moveCount: 0,
          startedAt: new Date().toISOString(),
        };

        io.to(roomCode).emit('new-game-starting');
        io.to(roomCode).emit('game-started', { players, firstPlayerId });
      }
    });

    // ============ DISCONNECT HANDLER ============

    socket.on('disconnect', async () => {
      const roomCode = socket.data.currentRoom;
      console.log(`User disconnected: ${user.displayName} (${socket.id})`);

      if (roomCode) {
        const room = rooms.get(roomCode);
        if (room) {
          const player = room.players.get(user.id);
          if (player) {
            player.isConnected = false;
            io.to(roomCode).emit('player-disconnected', { playerId: user.id });

            // Set abandonment timer (1 minute)
            const timerKey = `${roomCode}:${user.id}`;
            const timer = setTimeout(async () => {
              await handleAbandon(io, roomCode, user.id);
            }, 60000);

            disconnectTimers.set(timerKey, timer);
          }
        }
      }
    });

    // ============ REJOIN HANDLER ============

    socket.on('rejoin-room', async ({ roomCode, lastMoveId }) => {
      const room = rooms.get(roomCode);

      if (!room) {
        socket.emit('rejoin-failed', { reason: 'Room no longer exists' });
        return;
      }

      const player = room.players.get(user.id);
      if (!player) {
        socket.emit('rejoin-failed', { reason: 'You are not in this room' });
        return;
      }

      // Clear abandon timer
      const timerKey = `${roomCode}:${user.id}`;
      const timer = disconnectTimers.get(timerKey);
      if (timer) {
        clearTimeout(timer);
        disconnectTimers.delete(timerKey);
      }

      // Update player
      player.isConnected = true;
      player.socketId = socket.id;
      socket.join(roomCode);
      socket.data.currentRoom = roomCode;

      socket.emit('rejoin-success', {
        gameState: room.gameState,
        players: Array.from(room.players.values()),
      });

      socket.to(roomCode).emit('player-reconnected', { playerId: user.id });

      console.log(`${user.displayName} rejoined room ${roomCode}`);
    });
  });

  // Periodic cleanup
  setInterval(() => {
    cleanupStaleRooms(io);
  }, 30 * 60 * 1000); // Every 30 minutes
}

async function handleLeaveRoom(socket: Socket, roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const user = socket.data.user;
  room.players.delete(user.id);
  socket.leave(roomCode);
  socket.data.currentRoom = undefined;

  if (room.players.size === 0) {
    rooms.delete(roomCode);
    console.log(`Room ${roomCode} deleted (empty)`);
  } else {
    // Notify remaining players
    const players = Array.from(room.players.values());
    socket.to(roomCode).emit('player-left', { playerId: user.id, players });

    // Transfer ownership if needed
    if (user.id === room.hostId && players.length > 0) {
      room.hostId = players[0].id;
      players[0].isOwner = true;
    }
  }

  console.log(`${user.displayName} left room ${roomCode}`);
}

async function handleAbandon(io: Server, roomCode: string, userId: string) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const player = room.players.get(userId);
  if (!player || player.isConnected) return;

  // Player didn't reconnect
  if (room.gameState?.status === 'playing') {
    const remainingPlayers = Array.from(room.players.values())
      .filter(p => p.id !== userId && p.isConnected);

    if (remainingPlayers.length === 1) {
      // Award win to remaining player
      const winner = remainingPlayers[0];
      const finalScores: Record<string, number> = {};
      for (const p of room.players.values()) {
        finalScores[p.id] = p.score;
      }

      io.to(roomCode).emit('game-over', {
        winner,
        isDraw: false,
        finalScores,
        reason: 'opponent_abandoned',
      });

      room.gameState.status = 'finished';
    }
  }

  // Remove player
  room.players.delete(userId);

  if (room.players.size === 0) {
    rooms.delete(roomCode);
  }
}

async function saveGame(room: RoomState, result: { winner: Player | null; isDraw: boolean; finalScores: Record<string, number> }) {
  try {
    const players = Array.from(room.players.values());

    await pb.collection('games').create({
      room: room.roomId,
      players: players.map(p => ({
        id: p.id,
        name: p.name,
        color: p.color,
        score: p.score,
      })),
      playerIds: players.map(p => p.id),
      winner: result.winner?.id || null,
      isDraw: result.isDraw,
      finalScores: result.finalScores,
      gameMode: room.gameMode,
      totalMoves: room.gameState?.moveCount || 0,
      duration: room.gameState?.startedAt
        ? Math.floor((Date.now() - new Date(room.gameState.startedAt).getTime()) / 1000)
        : 0,
      moveHistory: room.gameState?.lines || [],
      startedAt: room.gameState?.startedAt,
      finishedAt: new Date().toISOString(),
    });

    // Update player stats
    for (const player of players) {
      const isWinner = result.winner?.id === player.id;
      const userData = await pb.collection('users').getOne(player.id);

      await pb.collection('users').update(player.id, {
        totalGamesPlayed: userData.totalGamesPlayed + 1,
        totalWins: userData.totalWins + (isWinner ? 1 : 0),
        totalLosses: userData.totalLosses + (!result.isDraw && !isWinner ? 1 : 0),
        totalDraws: userData.totalDraws + (result.isDraw ? 1 : 0),
        totalScore: userData.totalScore + player.score,
        currentStreak: isWinner ? userData.currentStreak + 1 : 0,
        bestStreak: isWinner
          ? Math.max(userData.bestStreak, userData.currentStreak + 1)
          : userData.bestStreak,
      });
    }
  } catch (error) {
    console.error('Error saving game:', error);
  }
}

function cleanupStaleRooms(io: Server) {
  const now = Date.now();
  const staleThreshold = 2 * 60 * 60 * 1000; // 2 hours

  for (const [code, room] of rooms) {
    if (now - room.lastActivityAt > staleThreshold) {
      io.to(code).emit('room-closed', { reason: 'Room expired due to inactivity' });
      io.in(code).socketsLeave(code);
      rooms.delete(code);
      console.log(`Room ${code} deleted (stale)`);
    }
  }
}

