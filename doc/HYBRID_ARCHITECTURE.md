# Dots & Boxes - Hybrid Architecture Design
## PocketBase + Socket.io Integration

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REACT NATIVE APP                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │                         APP LAYER                                   │    │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │    │
│   │  │  Auth    │  │  Rooms   │  │  Game    │  │  User Profile    │   │    │
│   │  │  Screen  │  │  Screen  │  │  Screen  │  │  Screen          │   │    │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│   ┌────────────────────────────────┴───────────────────────────────────┐    │
│   │                       CONTEXT LAYER                                 │    │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │    │
│   │  │ AuthContext  │  │ GameContext  │  │ SocketContext            │  │    │
│   │  │ (PocketBase) │  │ (Game State) │  │ (Real-time)              │  │    │
│   │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│   ┌────────────────────────────────┴───────────────────────────────────┐    │
│   │                       SERVICE LAYER                                 │    │
│   │  ┌──────────────────────────┐  ┌──────────────────────────────┐   │    │
│   │  │     PocketBase Service   │  │     Socket.io Service        │   │    │
│   │  │                          │  │                              │   │    │
│   │  │  • Authentication        │  │  • Real-time game events     │   │    │
│   │  │  • User profiles         │  │  • Move synchronization      │   │    │
│   │  │  • Room persistence      │  │  • Turn management           │   │    │
│   │  │  • Game history          │  │  • Player presence           │   │    │
│   │  │  • Leaderboards          │  │  • Room joining              │   │    │
│   │  └──────────────────────────┘  └──────────────────────────────┘   │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                              │
                    ▼                              ▼
        ┌───────────────────┐          ┌───────────────────┐
        │    PocketBase     │◄────────►│   Socket.io       │
        │    Server         │  verify  │   Server          │
        │    (Port 8090)    │  token   │   (Port 3000)     │
        │                   │          │                   │
        │  ┌─────────────┐  │          │  ┌─────────────┐  │
        │  │  SQLite DB  │  │          │  │  In-Memory  │  │
        │  │             │  │          │  │  Game State │  │
        │  │  • users    │  │          │  │             │  │
        │  │  • rooms    │  │          │  │  • rooms    │  │
        │  │  • games    │  │          │  │  • players  │  │
        │  │  • stats    │  │          │  │  • turns    │  │
        │  └─────────────┘  │          │  └─────────────┘  │
        └───────────────────┘          └───────────────────┘
```

---

## 📊 Responsibility Matrix

| Feature | PocketBase | Socket.io |
|---------|------------|-----------|
| User Registration | ✅ | |
| User Login/Logout | ✅ | |
| User Profile (avatar, stats) | ✅ | |
| Create Room (persist) | ✅ | |
| Store Room Code | ✅ | |
| List Active Rooms | ✅ | |
| Join Room (real-time) | | ✅ |
| Game Moves | | ✅ |
| Turn Synchronization | | ✅ |
| Player Presence | | ✅ |
| Score Updates (real-time) | | ✅ |
| Save Game Result | ✅ | |
| Leaderboard | ✅ | |
| Game History | ✅ | |

---

## 🗄️ PocketBase Collections Schema

### Collection: `users` (extends auth)

```javascript
// Automatically created by PocketBase auth
{
  id: "string",           // Auto-generated
  email: "string",
  username: "string",
  password: "string",     // Hashed
  verified: "bool",
  created: "datetime",
  updated: "datetime",
  
  // Extended fields (custom)
  avatar: "file",
  displayName: "string",
  totalGamesPlayed: "number",
  totalWins: "number",
  totalLosses: "number",
  totalDraws: "number",
  currentStreak: "number",
  bestStreak: "number",
}
```

### Collection: `rooms`

```javascript
{
  id: "string",
  code: "string",           // 6-character unique code (e.g., "ABC123")
  name: "string",           // Room name (optional)
  owner: "relation:users",  // Room creator
  gameMode: "select",       // "1vs1" | "3players"
  maxPlayers: "number",     // 2 or 3
  status: "select",         // "waiting" | "playing" | "finished" | "cancelled"
  players: "relation:users",// Multi-relation to users
  createdAt: "datetime",
  expiresAt: "datetime",    // Auto-delete after expiry
}
```

### Collection: `games`

```javascript
{
  id: "string",
  room: "relation:rooms",
  players: "json",          // Array of player info with scores
  winner: "relation:users", // null if draw
  isDraw: "bool",
  finalScores: "json",      // { oduserId: score }
  totalMoves: "number",
  duration: "number",       // Game duration in seconds
  startedAt: "datetime",
  finishedAt: "datetime",
}
```

### Collection: `game_moves` (optional - for replay feature)

```javascript
{
  id: "string",
  game: "relation:games",
  player: "relation:users",
  moveNumber: "number",
  dot1Id: "number",
  dot2Id: "number",
  completedSquares: "json", // Array of completed square IDs
  timestamp: "datetime",
}
```

---

## 📁 Updated Project Structure

```
dots-and-boxes-game/
├── app/                              # Expo Router screens
│   ├── _layout.tsx                   # Root layout with all providers
│   ├── index.tsx                     # Splash/Loading screen
│   ├── (auth)/                       # Auth group (unauthenticated)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (main)/                       # Main app group (authenticated)
│   │   ├── _layout.tsx
│   │   ├── home.tsx                  # Dashboard/Home
│   │   ├── rooms/
│   │   │   ├── index.tsx             # Room list
│   │   │   ├── create.tsx            # Create room
│   │   │   └── [code].tsx            # Join room by code
│   │   ├── game/
│   │   │   └── [roomId].tsx          # Game screen
│   │   ├── profile/
│   │   │   ├── index.tsx             # User profile
│   │   │   └── edit.tsx              # Edit profile
│   │   ├── leaderboard.tsx
│   │   └── history.tsx               # Game history
│   └── +not-found.tsx
│
├── components/
│   ├── game/
│   │   ├── GameBoard.tsx
│   │   ├── Dot.tsx
│   │   ├── Line.tsx
│   │   ├── Square.tsx
│   │   ├── ScoreBoard.tsx
│   │   ├── PlayerInfo.tsx
│   │   ├── TurnIndicator.tsx
│   │   ├── GameOverModal.tsx
│   │   └── WaitingRoom.tsx
│   │
│   ├── room/
│   │   ├── RoomCard.tsx
│   │   ├── RoomList.tsx
│   │   ├── CreateRoomForm.tsx
│   │   └── JoinRoomForm.tsx
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── SocialLoginButtons.tsx
│   │
│   ├── profile/
│   │   ├── ProfileHeader.tsx
│   │   ├── StatsCard.tsx
│   │   └── AvatarPicker.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Toast.tsx
│       ├── Modal.tsx
│       ├── LoadingSpinner.tsx
│       └── Avatar.tsx
│
├── contexts/
│   ├── AuthContext.tsx               # PocketBase auth state
│   ├── SocketContext.tsx             # Socket.io connection
│   ├── GameContext.tsx               # Active game state
│   └── SoundContext.tsx              # Audio management
│
├── services/
│   ├── pocketbase/
│   │   ├── client.ts                 # PocketBase client instance
│   │   ├── auth.ts                   # Auth methods
│   │   ├── rooms.ts                  # Room CRUD
│   │   ├── games.ts                  # Game history
│   │   └── users.ts                  # User profile
│   │
│   ├── socket/
│   │   ├── client.ts                 # Socket.io client
│   │   ├── events.ts                 # Event constants
│   │   └── handlers.ts               # Event handlers
│   │
│   └── gameLogic.ts                  # Core game calculations
│
├── hooks/
│   ├── useAuth.ts                    # Auth operations
│   ├── useSocket.ts                  # Socket connection
│   ├── useGame.ts                    # Game state
│   ├── useRoom.ts                    # Room operations
│   ├── useSound.ts                   # Sound effects
│   └── useVibration.ts               # Haptic feedback
│
├── types/
│   ├── index.ts                      # All types
│   ├── auth.ts                       # Auth types
│   ├── game.ts                       # Game types
│   ├── room.ts                       # Room types
│   └── socket.ts                     # Socket event types
│
├── constants/
│   ├── config.ts                     # App configuration
│   ├── colors.ts                     # Color palette
│   ├── api.ts                        # API endpoints
│   └── socket-events.ts              # Socket event names
│
├── utils/
│   ├── helpers.ts
│   ├── validators.ts
│   └── storage.ts                    # AsyncStorage helpers
│
├── assets/
│   ├── sounds/
│   ├── images/
│   └── fonts/
│
└── server/                           # Backend (can be separate repo)
    ├── socket-server/
    │   ├── index.ts
    │   ├── handlers/
    │   │   ├── room.ts
    │   │   ├── game.ts
    │   │   └── connection.ts
    │   └── middleware/
    │       └── auth.ts               # Verify PocketBase token
    │
    └── pocketbase/
        ├── pb_data/
        ├── pb_migrations/
        └── pb_hooks/                 # Custom hooks (optional)
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐         ┌──────────────┐         ┌──────────────┐
│  User    │         │  PocketBase  │         │  Socket.io   │
└────┬─────┘         └──────┬───────┘         └──────┬───────┘
     │                      │                        │
     │  1. Register/Login   │                        │
     │─────────────────────►│                        │
     │                      │                        │
     │  2. JWT Token        │                        │
     │◄─────────────────────│                        │
     │                      │                        │
     │  3. Connect with Token                        │
     │──────────────────────────────────────────────►│
     │                      │                        │
     │                      │  4. Verify Token       │
     │                      │◄───────────────────────│
     │                      │                        │
     │                      │  5. Token Valid        │
     │                      │───────────────────────►│
     │                      │                        │
     │  6. Connection Established                    │
     │◄──────────────────────────────────────────────│
     │                      │                        │
```

---

## 🎮 Game Flow with Both Services

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMPLETE GAME FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

PHASE 1: ROOM CREATION
═══════════════════════════════════════════════════════════════════════════════

Player 1 (Host)                PocketBase              Socket.io
     │                              │                      │
     │  1. Create Room              │                      │
     │─────────────────────────────►│                      │
     │                              │                      │
     │  2. Room Created (code)      │                      │
     │◄─────────────────────────────│                      │
     │                              │                      │
     │  3. Join Socket Room         │                      │
     │─────────────────────────────────────────────────────►
     │                              │                      │
     │  4. Emit: host-waiting       │                      │
     │◄─────────────────────────────────────────────────────
     │                              │                      │


PHASE 2: PLAYER JOINS
═══════════════════════════════════════════════════════════════════════════════

Player 2                       PocketBase              Socket.io
     │                              │                      │
     │  1. Lookup Room by Code      │                      │
     │─────────────────────────────►│                      │
     │                              │                      │
     │  2. Room Found               │                      │
     │◄─────────────────────────────│                      │
     │                              │                      │
     │  3. Update Room (add player) │                      │
     │─────────────────────────────►│                      │
     │                              │                      │
     │  4. Join Socket Room         │                      │
     │─────────────────────────────────────────────────────►
     │                              │                      │
     │                              │  5. Broadcast:       │
     │                              │     player-joined    │
     │                              │◄─────────────────────│
     │                              │                      │
Player 1 receives: player-joined   │                      │
     │                              │                      │


PHASE 3: GAMEPLAY
═══════════════════════════════════════════════════════════════════════════════

Player 1                       PocketBase              Socket.io           Player 2
     │                              │                      │                   │
     │  1. Make Move                │                      │                   │
     │─────────────────────────────────────────────────────►                   │
     │                              │                      │                   │
     │                              │  2. Broadcast Move   │                   │
     │                              │──────────────────────────────────────────►
     │                              │                      │                   │
     │                              │  3. Update Turn      │                   │
     │◄──────────────────────────────────────────────────────────────────────────
     │                              │                      │                   │
     │                              │                      │  4. Player 2 Move │
     │                              │◄─────────────────────────────────────────│
     │                              │                      │                   │
     │  5. Receive Move             │                      │                   │
     │◄─────────────────────────────────────────────────────                   │
     │                              │                      │                   │


PHASE 4: GAME END
═══════════════════════════════════════════════════════════════════════════════

Socket.io                      PocketBase
     │                              │
     │  1. Game Over Event          │
     │  (detected by server)        │
     │                              │
     │  2. Save Game Result         │
     │─────────────────────────────►│
     │                              │
     │  3. Update Player Stats      │
     │─────────────────────────────►│
     │                              │
     │  4. Update Room Status       │
     │─────────────────────────────►│
     │                              │
     │  5. Broadcast: game-over     │
     │  to all players              │
     │                              │
```

---

## 💻 Implementation Code

### PocketBase Client Setup

```typescript
// services/pocketbase/client.ts
import PocketBase from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PB_URL = process.env.EXPO_PUBLIC_POCKETBASE_URL || 'http://localhost:8090';

// Create PocketBase instance
export const pb = new PocketBase(PB_URL);

// Custom auth store for React Native
pb.authStore.onChange(async (token, model) => {
  if (token && model) {
    await AsyncStorage.setItem('pb_auth', JSON.stringify({ token, model }));
  } else {
    await AsyncStorage.removeItem('pb_auth');
  }
});

// Load saved auth on app start
export async function loadSavedAuth(): Promise<boolean> {
  try {
    const saved = await AsyncStorage.getItem('pb_auth');
    if (saved) {
      const { token, model } = JSON.parse(saved);
      pb.authStore.save(token, model);
      
      // Verify token is still valid
      if (pb.authStore.isValid) {
        await pb.collection('users').authRefresh();
        return true;
      }
    }
  } catch (error) {
    console.error('Failed to load auth:', error);
  }
  return false;
}

export default pb;
```

### Auth Service

```typescript
// services/pocketbase/auth.ts
import pb from './client';
import type { User, RegisterData, LoginData } from '../../types/auth';

export const authService = {
  async register(data: RegisterData): Promise<User> {
    const user = await pb.collection('users').create({
      email: data.email,
      password: data.password,
      passwordConfirm: data.password,
      username: data.username,
      displayName: data.displayName || data.username,
      totalGamesPlayed: 0,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
      currentStreak: 0,
      bestStreak: 0,
    });

    // Auto-login after register
    await pb.collection('users').authWithPassword(data.email, data.password);
    
    return user as User;
  },

  async login(data: LoginData): Promise<User> {
    const authData = await pb.collection('users').authWithPassword(
      data.email,
      data.password
    );
    return authData.record as User;
  },

  async logout(): Promise<void> {
    pb.authStore.clear();
  },

  async loginWithGoogle(): Promise<User> {
    const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
    return authData.record as User;
  },

  getCurrentUser(): User | null {
    return pb.authStore.model as User | null;
  },

  getToken(): string | null {
    return pb.authStore.token;
  },

  isAuthenticated(): boolean {
    return pb.authStore.isValid;
  },
};
```

### Room Service

```typescript
// services/pocketbase/rooms.ts
import pb from './client';
import type { Room, CreateRoomData } from '../../types/room';

// Generate unique 6-character room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const roomService = {
  async createRoom(data: CreateRoomData): Promise<Room> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('Not authenticated');

    // Generate unique code
    let code = generateRoomCode();
    let attempts = 0;
    
    while (attempts < 10) {
      try {
        const room = await pb.collection('rooms').create({
          code,
          name: data.name || `${pb.authStore.model?.username}'s Room`,
          owner: userId,
          gameMode: data.gameMode,
          maxPlayers: data.gameMode === '1vs1' ? 2 : 3,
          status: 'waiting',
          players: [userId],
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h expiry
        });
        return room as Room;
      } catch (error: any) {
        if (error.data?.code === 'code') {
          // Code collision, generate new one
          code = generateRoomCode();
          attempts++;
        } else {
          throw error;
        }
      }
    }
    throw new Error('Failed to generate unique room code');
  },

  async getRoomByCode(code: string): Promise<Room | null> {
    try {
      const rooms = await pb.collection('rooms').getList(1, 1, {
        filter: `code = "${code.toUpperCase()}" && status != "cancelled"`,
        expand: 'owner,players',
      });
      return rooms.items[0] as Room || null;
    } catch {
      return null;
    }
  },

  async joinRoom(roomId: string): Promise<Room> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('Not authenticated');

    const room = await pb.collection('rooms').getOne(roomId);
    
    if (room.status !== 'waiting') {
      throw new Error('Room is not accepting players');
    }
    
    if (room.players.length >= room.maxPlayers) {
      throw new Error('Room is full');
    }

    if (room.players.includes(userId)) {
      return room as Room; // Already in room
    }

    const updatedRoom = await pb.collection('rooms').update(roomId, {
      players: [...room.players, userId],
    });

    return updatedRoom as Room;
  },

  async leaveRoom(roomId: string): Promise<void> {
    const userId = pb.authStore.model?.id;
    if (!userId) return;

    const room = await pb.collection('rooms').getOne(roomId);
    
    if (room.owner === userId) {
      // Owner leaving cancels the room
      await pb.collection('rooms').update(roomId, { status: 'cancelled' });
    } else {
      // Remove player from room
      await pb.collection('rooms').update(roomId, {
        players: room.players.filter((p: string) => p !== userId),
      });
    }
  },

  async updateRoomStatus(roomId: string, status: Room['status']): Promise<void> {
    await pb.collection('rooms').update(roomId, { status });
  },

  async getActiveRooms(): Promise<Room[]> {
    const rooms = await pb.collection('rooms').getList(1, 50, {
      filter: 'status = "waiting"',
      sort: '-created',
      expand: 'owner',
    });
    return rooms.items as Room[];
  },

  async getMyRooms(): Promise<Room[]> {
    const userId = pb.authStore.model?.id;
    if (!userId) return [];

    const rooms = await pb.collection('rooms').getList(1, 20, {
      filter: `players ~ "${userId}" && status != "cancelled"`,
      sort: '-created',
      expand: 'owner',
    });
    return rooms.items as Room[];
  },
};
```

### Socket.io Client with Auth

```typescript
// services/socket/client.ts
import { io, Socket } from 'socket.io-client';
import { authService } from '../pocketbase/auth';
import type { ServerToClientEvents, ClientToServerEvents } from '../../types/socket';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketService {
  private socket: TypedSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): TypedSocket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = authService.getToken();
    const user = authService.getCurrentUser();

    if (!token || !user) {
      throw new Error('Must be authenticated to connect');
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: {
        token,
        userId: user.id,
        username: user.username,
      },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    }) as TypedSocket;

    this.setupEventHandlers();

    return this.socket;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.reconnectAttempts++;
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): TypedSocket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Room methods
  joinRoom(roomCode: string, roomId: string): void {
    this.socket?.emit('join-room', { roomCode, roomId });
  }

  leaveRoom(roomCode: string): void {
    this.socket?.emit('leave-room', { roomCode });
  }

  // Game methods
  makeMove(data: {
    roomCode: string;
    dot1Id: number;
    dot2Id: number;
  }): void {
    this.socket?.emit('make-move', data);
  }

  requestPlayAgain(roomCode: string): void {
    this.socket?.emit('request-play-again', { roomCode });
  }

  acceptPlayAgain(roomCode: string): void {
    this.socket?.emit('accept-play-again', { roomCode });
  }

  startGame(roomCode: string): void {
    this.socket?.emit('start-game', { roomCode });
  }
}

export const socketService = new SocketService();
export default socketService;
```

### Socket Event Types

```typescript
// types/socket.ts
import type { Player, Line, Square } from './game';

export interface ServerToClientEvents {
  // Room events
  'player-joined': (data: { player: Player; players: Player[] }) => void;
  'player-left': (data: { playerId: string; players: Player[] }) => void;
  'room-closed': (data: { reason: string }) => void;
  
  // Game events
  'game-started': (data: { players: Player[]; firstPlayerId: string }) => void;
  'move-made': (data: {
    playerId: string;
    dot1Id: number;
    dot2Id: number;
    line: Line;
    completedSquares: Square[];
    nextPlayerId: string;
    scores: Record<string, number>;
  }) => void;
  'turn-changed': (data: { currentPlayerId: string }) => void;
  'game-over': (data: {
    winner: Player | null;
    isDraw: boolean;
    finalScores: Record<string, number>;
  }) => void;
  
  // Play again
  'play-again-requested': (data: { playerId: string }) => void;
  'play-again-accepted': (data: { playerId: string }) => void;
  'new-game-starting': () => void;
  
  // Errors
  'error': (data: { message: string; code: string }) => void;
}

export interface ClientToServerEvents {
  // Room events
  'join-room': (data: { roomCode: string; roomId: string }) => void;
  'leave-room': (data: { roomCode: string }) => void;
  
  // Game events
  'start-game': (data: { roomCode: string }) => void;
  'make-move': (data: {
    roomCode: string;
    dot1Id: number;
    dot2Id: number;
  }) => void;
  
  // Play again
  'request-play-again': (data: { roomCode: string }) => void;
  'accept-play-again': (data: { roomCode: string }) => void;
}
```

### Auth Context

```typescript
// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/pocketbase/auth';
import { loadSavedAuth } from '../services/pocketbase/client';
import type { User, LoginData, RegisterData } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved auth on mount
    loadSavedAuth().then((authenticated) => {
      if (authenticated) {
        setUser(authService.getCurrentUser());
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (data: LoginData) => {
    const user = await authService.login(data);
    setUser(user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const user = await authService.register(data);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const user = await authService.loginWithGoogle();
    setUser(user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Socket Context with Auth Integration

```typescript
// contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socket/client';
import { useAuth } from './AuthContext';
import type { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '../types/socket';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextType {
  socket: TypedSocket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (!isAuthenticated) return;
    
    try {
      const sock = socketService.connect();
      setSocket(sock);
      
      sock.on('connect', () => setIsConnected(true));
      sock.on('disconnect', () => setIsConnected(false));
    } catch (error) {
      console.error('Failed to connect socket:', error);
    }
  }, [isAuthenticated]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setSocket(null);
    setIsConnected(false);
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && !socket) {
      connect();
    }
    
    if (!isAuthenticated && socket) {
      disconnect();
    }
  }, [isAuthenticated, socket, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}
```

---

## 🖥️ Socket.io Server with PocketBase Auth

```typescript
// server/socket-server/index.ts
import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import PocketBase from 'pocketbase';

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // Configure for production
    methods: ['GET', 'POST'],
  },
});

// PocketBase client for token verification
const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://localhost:8090');

// Room state (in-memory)
interface RoomState {
  code: string;
  roomId: string;
  players: Map<string, PlayerState>;
  gameState: GameState | null;
  hostId: string;
}

interface PlayerState {
  oduserId: string;
  odusername: string;
  socketId: string;
  color: string;
  score: number;
  isReady: boolean;
  playAgainRequested: boolean;
}

interface GameState {
  dots: any[];
  lines: any[];
  squares: any[];
  currentTurnPlayerId: string;
  status: 'waiting' | 'playing' | 'finished';
}

const rooms = new Map<string, RoomState>();
const playerColors = ['#E63946', '#2A9D8F', '#E9C46A'];

// Verify PocketBase token
async function verifyToken(token: string): Promise<any> {
  try {
    // Verify token with PocketBase
    pb.authStore.save(token, null);
    const authData = await pb.collection('users').authRefresh();
    return authData.record;
  } catch (error) {
    return null;
  }
}

// Auth middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const userId = socket.handshake.auth.userId;
  
  if (!token || !userId) {
    return next(new Error('Authentication required'));
  }

  const user = await verifyToken(token);
  
  if (!user || user.id !== userId) {
    return next(new Error('Invalid token'));
  }

  // Attach user to socket
  socket.data.user = user;
  next();
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.data.user.username} (${socket.id})`);

  // Join room
  socket.on('join-room', async ({ roomCode, roomId }) => {
    const user = socket.data.user;
    
    // Get or create room state
    let room = rooms.get(roomCode);
    
    if (!room) {
      // First player creates room state
      room = {
        code: roomCode,
        roomId,
        players: new Map(),
        gameState: null,
        hostId: user.id,
      };
      rooms.set(roomCode, room);
    }

    // Check if room is full
    if (room.players.size >= 3 && !room.players.has(user.id)) {
      socket.emit('error', { message: 'Room is full', code: 'ROOM_FULL' });
      return;
    }

    // Add/update player
    const playerIndex = room.players.size;
    room.players.set(user.id, {
      oduserId: user.id,
      odusername: user.username,
      socketId: socket.id,
      color: playerColors[playerIndex % playerColors.length],
      score: 0,
      isReady: false,
      playAgainRequested: false,
    });

    // Join socket room
    socket.join(roomCode);
    socket.data.currentRoom = roomCode;

    // Get players array
    const players = Array.from(room.players.values()).map(p => ({
      id: p.oduserId,
      name: p.odusername,
      color: p.color,
      score: p.score,
      isOwner: p.oduserId === room!.hostId,
      isConnected: true,
    }));

    // Notify all players
    io.to(roomCode).emit('player-joined', {
      player: players[players.length - 1],
      players,
    });

    console.log(`${user.username} joined room ${roomCode}`);
  });

  // Leave room
  socket.on('leave-room', ({ roomCode }) => {
    handlePlayerLeave(socket, roomCode);
  });

  // Start game
  socket.on('start-game', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const user = socket.data.user;
    
    // Only host can start
    if (room.hostId !== user.id) {
      socket.emit('error', { message: 'Only host can start', code: 'NOT_HOST' });
      return;
    }

    // Need at least 2 players
    if (room.players.size < 2) {
      socket.emit('error', { message: 'Need at least 2 players', code: 'NOT_ENOUGH_PLAYERS' });
      return;
    }

    // Initialize game state
    room.gameState = initializeGameState();
    
    const players = Array.from(room.players.values());
    const firstPlayer = players[0];
    room.gameState.currentTurnPlayerId = firstPlayer.oduserId;
    room.gameState.status = 'playing';

    // Update room status in PocketBase
    updateRoomStatus(room.roomId, 'playing');

    io.to(roomCode).emit('game-started', {
      players: players.map(p => ({
        id: p.oduserId,
        name: p.odusername,
        color: p.color,
        score: 0,
        isOwner: p.oduserId === room.hostId,
        isConnected: true,
      })),
      firstPlayerId: firstPlayer.oduserId,
    });
  });

  // Make move
  socket.on('make-move', ({ roomCode, dot1Id, dot2Id }) => {
    const room = rooms.get(roomCode);
    if (!room || !room.gameState) return;

    const user = socket.data.user;
    const gameState = room.gameState;

    // Verify it's player's turn
    if (gameState.currentTurnPlayerId !== user.id) {
      socket.emit('error', { message: 'Not your turn', code: 'NOT_YOUR_TURN' });
      return;
    }

    // Validate and process move
    const player = room.players.get(user.id)!;
    const moveResult = processMove(gameState, dot1Id, dot2Id, user.id, player.color);

    if (!moveResult.valid) {
      socket.emit('error', { message: moveResult.error!, code: 'INVALID_MOVE' });
      return;
    }

    // Update player score
    player.score += moveResult.completedSquares.length;

    // Determine next player
    const players = Array.from(room.players.values());
    let nextPlayerId: string;
    
    if (moveResult.completedSquares.length > 0) {
      // Player gets another turn
      nextPlayerId = user.id;
    } else {
      // Next player's turn
      const currentIndex = players.findIndex(p => p.oduserId === user.id);
      const nextIndex = (currentIndex + 1) % players.length;
      nextPlayerId = players[nextIndex].oduserId;
    }

    gameState.currentTurnPlayerId = nextPlayerId;

    // Build scores object
    const scores: Record<string, number> = {};
    room.players.forEach(p => {
      scores[p.oduserId] = p.score;
    });

    // Broadcast move to all players
    io.to(roomCode).emit('move-made', {
      playerId: user.id,
      dot1Id,
      dot2Id,
      line: moveResult.line!,
      completedSquares: moveResult.completedSquares,
      nextPlayerId,
      scores,
    });

    // Check for game over
    if (isGameOver(gameState)) {
      const winner = determineWinner(room.players);
      const finalScores: Record<string, number> = {};
      room.players.forEach(p => {
        finalScores[p.oduserId] = p.score;
      });

      gameState.status = 'finished';

      // Save game result to PocketBase
      saveGameResult(room, winner, finalScores);

      io.to(roomCode).emit('game-over', {
        winner: winner ? {
          id: winner.oduserId,
          name: winner.odusername,
          color: winner.color,
          score: winner.score,
          isOwner: winner.oduserId === room.hostId,
          isConnected: true,
        } : null,
        isDraw: !winner,
        finalScores,
      });
    }
  });

  // Play again request
  socket.on('request-play-again', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const user = socket.data.user;
    const player = room.players.get(user.id);
    if (!player) return;

    player.playAgainRequested = true;

    io.to(roomCode).emit('play-again-requested', { playerId: user.id });

    // Check if all players requested
    const allRequested = Array.from(room.players.values()).every(p => p.playAgainRequested);
    
    if (allRequested) {
      // Reset game
      resetGame(room);
      io.to(roomCode).emit('new-game-starting');
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    const roomCode = socket.data.currentRoom;
    if (roomCode) {
      handlePlayerLeave(socket, roomCode);
    }
    console.log(`User disconnected: ${socket.data.user.username}`);
  });
});

// Helper functions
function handlePlayerLeave(socket: Socket, roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const user = socket.data.user;
  room.players.delete(user.id);
  socket.leave(roomCode);

  if (room.players.size === 0) {
    // Delete empty room
    rooms.delete(roomCode);
    updateRoomStatus(room.roomId, 'cancelled');
  } else {
    // Notify remaining players
    const players = Array.from(room.players.values()).map(p => ({
      id: p.oduserId,
      name: p.odusername,
      color: p.color,
      score: p.score,
      isOwner: p.oduserId === room.hostId,
      isConnected: true,
    }));

    io.to(roomCode).emit('player-left', {
      playerId: user.id,
      players,
    });

    // If host left, assign new host
    if (room.hostId === user.id && room.players.size > 0) {
      room.hostId = Array.from(room.players.keys())[0];
    }
  }
}

function initializeGameState(): GameState {
  const GRID_SIZE = 9;
  const dots: any[] = [];
  const squares: any[] = [];

  // Create dots
  let dotId = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      dots.push({
        id: dotId++,
        row,
        col,
        connectedTo: [],
      });
    }
  }

  // Create squares
  let squareId = 0;
  for (let row = 0; row < GRID_SIZE - 1; row++) {
    for (let col = 0; col < GRID_SIZE - 1; col++) {
      squares.push({
        id: squareId++,
        topLeftDotId: row * GRID_SIZE + col,
        isComplete: false,
        completedBy: null,
        color: null,
        lines: { top: false, right: false, bottom: false, left: false },
      });
    }
  }

  return {
    dots,
    lines: [],
    squares,
    currentTurnPlayerId: '',
    status: 'waiting',
  };
}

function processMove(
  gameState: GameState,
  dot1Id: number,
  dot2Id: number,
  playerId: string,
  playerColor: string
): {
  valid: boolean;
  error?: string;
  line?: any;
  completedSquares: any[];
} {
  const dot1 = gameState.dots[dot1Id];
  const dot2 = gameState.dots[dot2Id];

  // Validate adjacency
  const isHorizontal = dot1.row === dot2.row && Math.abs(dot1.col - dot2.col) === 1;
  const isVertical = dot1.col === dot2.col && Math.abs(dot1.row - dot2.row) === 1;

  if (!isHorizontal && !isVertical) {
    return { valid: false, error: 'Dots must be adjacent', completedSquares: [] };
  }

  // Check if already connected
  if (dot1.connectedTo.includes(dot2Id)) {
    return { valid: false, error: 'Already connected', completedSquares: [] };
  }

  // Create line
  const line = {
    id: `${dot1Id}-${dot2Id}`,
    dot1Id,
    dot2Id,
    playerId,
    color: playerColor,
  };

  gameState.lines.push(line);
  dot1.connectedTo.push(dot2Id);
  dot2.connectedTo.push(dot1Id);

  // Check for completed squares
  const completedSquares: any[] = [];
  const GRID_SIZE = 9;

  for (const square of gameState.squares) {
    if (square.isComplete) continue;

    const topLeft = square.topLeftDotId;
    const topRight = topLeft + 1;
    const bottomLeft = topLeft + GRID_SIZE;
    const bottomRight = bottomLeft + 1;

    // Check which line was added
    const isTopLine = (dot1Id === topLeft && dot2Id === topRight) || (dot1Id === topRight && dot2Id === topLeft);
    const isRightLine = (dot1Id === topRight && dot2Id === bottomRight) || (dot1Id === bottomRight && dot2Id === topRight);
    const isBottomLine = (dot1Id === bottomLeft && dot2Id === bottomRight) || (dot1Id === bottomRight && dot2Id === bottomLeft);
    const isLeftLine = (dot1Id === topLeft && dot2Id === bottomLeft) || (dot1Id === bottomLeft && dot2Id === topLeft);

    if (isTopLine) square.lines.top = true;
    if (isRightLine) square.lines.right = true;
    if (isBottomLine) square.lines.bottom = true;
    if (isLeftLine) square.lines.left = true;

    // Check if square is complete
    if (square.lines.top && square.lines.right && square.lines.bottom && square.lines.left) {
      square.isComplete = true;
      square.completedBy = playerId;
      square.color = playerColor;
      completedSquares.push(square);
    }
  }

  return { valid: true, line, completedSquares };
}

function isGameOver(gameState: GameState): boolean {
  return gameState.squares.every(s => s.isComplete);
}

function determineWinner(players: Map<string, PlayerState>): PlayerState | null {
  const sorted = Array.from(players.values()).sort((a, b) => b.score - a.score);
  
  if (sorted[0].score === sorted[1].score) {
    return null; // Draw
  }
  
  return sorted[0];
}

async function updateRoomStatus(roomId: string, status: string): Promise<void> {
  try {
    await pb.collection('rooms').update(roomId, { status });
  } catch (error) {
    console.error('Failed to update room status:', error);
  }
}

async function saveGameResult(room: RoomState, winner: PlayerState | null, finalScores: Record<string, number>): Promise<void> {
  try {
    const players = Array.from(room.players.values()).map(p => ({
      id: p.oduserId,
      name: p.odusername,
      score: p.score,
    }));

    await pb.collection('games').create({
      room: room.roomId,
      players: JSON.stringify(players),
      winner: winner?.oduserId || null,
      isDraw: !winner,
      finalScores: JSON.stringify(finalScores),
      totalMoves: room.gameState?.lines.length || 0,
      finishedAt: new Date().toISOString(),
    });

    // Update player stats
    for (const player of room.players.values()) {
      const isWinner = winner?.oduserId === player.oduserId;
      const isDraw = !winner;

      await pb.collection('users').update(player.oduserId, {
        'totalGamesPlayed+': 1,
        'totalWins+': isWinner ? 1 : 0,
        'totalLosses+': !isWinner && !isDraw ? 1 : 0,
        'totalDraws+': isDraw ? 1 : 0,
      });
    }

    // Update room status
    await updateRoomStatus(room.roomId, 'finished');
  } catch (error) {
    console.error('Failed to save game result:', error);
  }
}

function resetGame(room: RoomState): void {
  room.gameState = initializeGameState();
  
  const players = Array.from(room.players.values());
  room.gameState.currentTurnPlayerId = players[0].oduserId;
  room.gameState.status = 'playing';

  // Reset player states
  room.players.forEach(p => {
    p.score = 0;
    p.playAgainRequested = false;
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
```

---

## 📦 Updated Dependencies

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-av": "~14.0.0",
    "expo-haptics": "~13.0.0",
    "expo-router": "~4.0.0",
    "expo-status-bar": "~2.0.0",
    "expo-secure-store": "~13.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    "react-native-svg": "15.8.0",
    "socket.io-client": "^4.7.0",
    "pocketbase": "^0.21.0",
    "@react-native-async-storage/async-storage": "1.23.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.3.0",
    "typescript": "^5.3.0"
  }
}
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION DEPLOYMENT                                │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   CDN/Cache     │
                              │  (CloudFlare)   │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
          ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
          │  React Native   │ │  PocketBase     │ │  Socket.io      │
          │  App (Expo)     │ │  Server         │ │  Server         │
          │                 │ │                 │ │                 │
          │  iOS App Store  │ │  Railway/       │ │  Railway/       │
          │  Google Play    │ │  Fly.io         │ │  Fly.io         │
          │                 │ │  (Port 8090)    │ │  (Port 3000)    │
          └─────────────────┘ └────────┬────────┘ └────────┬────────┘
                                       │                   │
                                       └─────────┬─────────┘
                                                 │
                                       ┌─────────▼─────────┐
                                       │  Persistent       │
                                       │  Volume           │
                                       │  (pb_data)        │
                                       └───────────────────┘
```

---

## 📱 Screen Flow Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER JOURNEY                                       │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │ Splash   │────►│ Login/   │────►│ Home     │────►│ Create   │
  │ Screen   │     │ Register │     │ Screen   │     │ Room     │
  └──────────┘     └──────────┘     └──────────┘     └────┬─────┘
                                          │               │
                                          │          ┌────▼─────┐
                                          │          │ Waiting  │
                                          │          │ Room     │
                                          │          └────┬─────┘
                                          │               │
                                     ┌────▼─────┐    ┌────▼─────┐
                                     │ Join     │    │ Game     │
                                     │ Room     │───►│ Screen   │
                                     └──────────┘    └────┬─────┘
                                                          │
                                                     ┌────▼─────┐
                                                     │ Game     │
                                                     │ Over     │
                                                     └────┬─────┘
                                                          │
                                          ┌───────────────┼───────────────┐
                                          │               │               │
                                     ┌────▼─────┐    ┌────▼─────┐    ┌────▼─────┐
                                     │ Play     │    │ Home     │    │ Leader   │
                                     │ Again    │    │ Screen   │    │ board    │
                                     └──────────┘    └──────────┘    └──────────┘
```

---

*Document Version: 2.0 - Hybrid Architecture*
*Last Updated: December 2024*

