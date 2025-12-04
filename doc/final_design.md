# 🎮 Dots & Boxes - Final Design Document
## React Native + Expo | PocketBase + Socket.io

---

## 📋 Executive Summary

A real-time multiplayer **Dots and Boxes** game built with React Native (Expo) featuring:
- **PocketBase** for authentication, user profiles, game history, and persistence
- **Socket.io** for real-time gameplay, room management, and live synchronization
- Support for **2-player** and **3-player** game modes
- Comprehensive **statistics**, **achievements**, and **leaderboards**

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REACT NATIVE APP (Expo)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                           SCREENS                                    │   │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │   │
│   │  │  Auth   │ │  Home   │ │  Game   │ │ Profile │ │ Leaderboard │   │   │
│   │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────────┘   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                        │
│   ┌─────────────────────────────────┴────────────────────────────────────┐  │
│   │                          CONTEXTS                                     │  │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │  │
│   │  │AuthContext │  │GameContext │  │SocketContext│  │  SoundContext │  │  │
│   │  │(PocketBase)│  │(Game State)│  │ (Real-time) │  │    (Audio)    │  │  │
│   │  └────────────┘  └────────────┘  └────────────┘  └────────────────┘  │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                     │                                        │
│   ┌─────────────────────────────────┴────────────────────────────────────┐  │
│   │                          SERVICES                                     │  │
│   │  ┌─────────────────────────┐    ┌─────────────────────────────────┐  │  │
│   │  │   PocketBase Service    │    │      Socket.io Service          │  │  │
│   │  │   ─────────────────     │    │      ─────────────────          │  │  │
│   │  │   • Authentication      │    │      • Real-time moves          │  │  │
│   │  │   • User profiles       │    │      • Room management          │  │  │
│   │  │   • Room persistence    │    │      • Turn synchronization     │  │  │
│   │  │   • Game history        │    │      • Player presence          │  │  │
│   │  │   • Leaderboards        │    │      • Live score updates       │  │  │
│   │  │   • Achievements        │    │      • Game events              │  │  │
│   │  └─────────────────────────┘    └─────────────────────────────────┘  │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────┬───────────────────┬───────────────────────┘
                                   │                   │
                                   ▼                   ▼
                       ┌───────────────────┐ ┌───────────────────┐
                       │    PocketBase     │ │    Socket.io      │
                       │    Server         │ │    Server         │
                       │   (Port 8090)     │ │   (Port 3000)     │
                       │                   │ │                   │
                       │  ┌─────────────┐  │ │  ┌─────────────┐  │
                       │  │  SQLite DB  │  │ │  │  In-Memory  │  │
                       │  │  ─────────  │  │ │  │  ─────────  │  │
                       │  │  • users    │  │ │  │  • rooms    │  │
                       │  │  • rooms    │  │ │  │  • players  │  │
                       │  │  • games    │  │ │  │  • game     │  │
                       │  │  • stats    │  │ │  │    state    │  │
                       │  │  • achieve  │  │ │  │  • turns    │  │
                       │  └─────────────┘  │ │  └─────────────┘  │
                       └─────────┬─────────┘ └─────────┬─────────┘
                                 │                     │
                                 └──────────┬──────────┘
                                            │
                                    Token Verification
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React Native + Expo | Cross-platform mobile app |
| **Navigation** | Expo Router | File-based routing |
| **State** | React Context | Global state management |
| **Real-time** | Socket.io Client | Live game synchronization |
| **Backend (Persistence)** | PocketBase | Auth, DB, file storage |
| **Backend (Real-time)** | Socket.io Server | Game rooms, moves, turns |
| **Graphics** | react-native-svg | Lines and game board |
| **Audio** | expo-av | Sound effects & music |
| **Haptics** | expo-haptics | Device vibration |

---

## 📊 Responsibility Matrix

| Feature | PocketBase | Socket.io |
|---------|:----------:|:---------:|
| User Registration/Login | ✅ | |
| User Profiles & Avatars | ✅ | |
| User Settings (sound, theme) | ✅ | |
| Create Room (persist) | ✅ | |
| Store Room Code | ✅ | |
| List Active Rooms | ✅ | |
| Join Room (real-time) | | ✅ |
| Game Moves | | ✅ |
| Turn Synchronization | | ✅ |
| Player Presence | | ✅ |
| Score Updates (live) | | ✅ |
| Save Game Result | ✅ | triggers→ |
| Update Player Stats | ✅ | triggers→ |
| Leaderboards | ✅ | |
| Game History | ✅ | |
| Achievements | ✅ | |
| Friend System | ✅ | |
| Game Invites | ✅ | ✅ |

---

## 🗄️ PocketBase Collections Schema

### 1. `users` (extends auth)

```javascript
{
  // Built-in auth fields
  id: string,
  email: string,
  username: string,
  verified: boolean,
  
  // Custom fields
  displayName: string,
  avatar: file,
  
  // Statistics
  totalGamesPlayed: number,    // Default: 0
  totalWins: number,           // Default: 0
  totalLosses: number,         // Default: 0
  totalDraws: number,          // Default: 0
  totalScore: number,          // Default: 0
  currentStreak: number,       // Default: 0
  bestStreak: number,          // Default: 0
  
  // Leveling
  level: number,               // Default: 1
  experience: number,          // Default: 0
  
  // Settings
  soundEnabled: boolean,       // Default: true
  musicEnabled: boolean,       // Default: true
  vibrationEnabled: boolean,   // Default: true
  theme: select,               // 'dark' | 'light'
  
  created: datetime,
  updated: datetime,
}
```

### 2. `rooms`

```javascript
{
  id: string,
  code: string,                // Unique 6-char code (e.g., "ABC123")
  name: string,                // Optional room name
  owner: relation → users,
  
  gameMode: select,            // '1vs1' | '3players'
  maxPlayers: number,          // 2 or 3
  status: select,              // 'waiting' | 'playing' | 'finished' | 'cancelled'
  
  players: relation[] → users, // Multi-relation
  
  createdAt: datetime,
  expiresAt: datetime,         // Auto-cleanup after 24h
}
```

### 3. `games`

```javascript
{
  id: string,
  room: relation → rooms,
  
  // Players snapshot
  players: json,               // [{id, name, color, score}]
  playerIds: relation[] → users,
  
  // Results
  winner: relation → users,    // null if draw
  isDraw: boolean,
  finalScores: json,           // {oduserId: score}
  
  // Metadata
  gameMode: select,            // '1vs1' | '3players'
  totalMoves: number,
  duration: number,            // seconds
  
  // Replay data (optional)
  moveHistory: json,           // Array of moves
  finalBoardState: json,
  
  startedAt: datetime,
  finishedAt: datetime,
}
```

### 4. `achievements`

```javascript
{
  id: string,
  key: string,                 // Unique identifier (e.g., 'first_win')
  name: string,
  description: string,
  icon: file,
  
  category: select,            // 'games' | 'wins' | 'score' | 'special'
  requirement: number,         // Target value to unlock
  experienceReward: number,    // XP given when unlocked
}
```

### 5. `user_achievements`

```javascript
{
  id: string,
  user: relation → users,
  achievement: relation → achievements,
  
  progress: number,            // Current progress
  unlockedAt: datetime,        // null if not unlocked
}
```

### 6. `friends`

```javascript
{
  id: string,
  user: relation → users,      // Requester
  friend: relation → users,    // Recipient
  
  status: select,              // 'pending' | 'accepted' | 'blocked'
  
  createdAt: datetime,
  acceptedAt: datetime,
}
```

### 7. `game_invites`

```javascript
{
  id: string,
  from: relation → users,
  to: relation → users,
  
  roomCode: string,
  gameMode: select,
  
  status: select,              // 'pending' | 'accepted' | 'declined' | 'expired'
  expiresAt: datetime,         // 10 min expiry
  
  createdAt: datetime,
}
```

---

## 🔌 Socket.io Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{ roomCode, roomId }` | Join a game room |
| `leave-room` | `{ roomCode }` | Leave current room |
| `start-game` | `{ roomCode }` | Host starts the game |
| `make-move` | `{ roomCode, dot1Id, dot2Id }` | Player makes a move |
| `request-play-again` | `{ roomCode }` | Request rematch |
| `accept-play-again` | `{ roomCode }` | Accept rematch |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `player-joined` | `{ player, players }` | New player joined room |
| `player-left` | `{ playerId, players }` | Player left room |
| `game-started` | `{ players, firstPlayerId }` | Game has started |
| `move-made` | `{ playerId, dot1Id, dot2Id, line, completedSquares, nextPlayerId, scores }` | Move was made |
| `game-over` | `{ winner, isDraw, finalScores }` | Game ended |
| `play-again-requested` | `{ playerId }` | Player wants rematch |
| `new-game-starting` | `{}` | All players accepted, new game starting |
| `room-closed` | `{ reason }` | Room was closed |
| `error` | `{ message, code }` | Error occurred |

---

## 📁 Project Structure

```
dots-and-boxes-game/
│
├── app/                                # Expo Router (screens)
│   ├── _layout.tsx                     # Root layout with providers
│   ├── index.tsx                       # Splash/redirect
│   │
│   ├── (auth)/                         # Unauthenticated routes
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   │
│   ├── (main)/                         # Authenticated routes
│   │   ├── _layout.tsx                 # Tab navigator
│   │   │
│   │   ├── (tabs)/
│   │   │   ├── index.tsx               # Home/Play
│   │   │   ├── leaderboard.tsx
│   │   │   ├── friends.tsx
│   │   │   └── profile.tsx
│   │   │
│   │   ├── rooms/
│   │   │   ├── index.tsx               # Browse rooms
│   │   │   ├── create.tsx              # Create room
│   │   │   └── join.tsx                # Join by code
│   │   │
│   │   ├── game/
│   │   │   ├── lobby/[code].tsx        # Waiting room
│   │   │   └── play/[code].tsx         # Active game
│   │   │
│   │   ├── history/
│   │   │   ├── index.tsx               # Game history list
│   │   │   └── [gameId].tsx            # Game details/replay
│   │   │
│   │   └── settings.tsx
│   │
│   └── +not-found.tsx
│
├── components/
│   ├── game/
│   │   ├── GameBoard.tsx               # Main game board
│   │   ├── Dot.tsx                     # Interactive dot
│   │   ├── Line.tsx                    # Connection line
│   │   ├── Square.tsx                  # Completed square
│   │   ├── ScoreBoard.tsx              # Player scores
│   │   ├── TurnIndicator.tsx           # Whose turn
│   │   ├── GameOverModal.tsx           # End game modal
│   │   └── WaitingRoom.tsx             # Lobby UI
│   │
│   ├── room/
│   │   ├── RoomCard.tsx
│   │   ├── RoomList.tsx
│   │   ├── CreateRoomForm.tsx
│   │   └── JoinRoomForm.tsx
│   │
│   ├── profile/
│   │   ├── ProfileHeader.tsx
│   │   ├── StatsGrid.tsx
│   │   ├── AchievementBadge.tsx
│   │   ├── LevelProgress.tsx
│   │   └── AvatarPicker.tsx
│   │
│   ├── social/
│   │   ├── FriendCard.tsx
│   │   ├── FriendRequest.tsx
│   │   ├── GameInvite.tsx
│   │   └── OnlineIndicator.tsx
│   │
│   ├── leaderboard/
│   │   ├── LeaderboardList.tsx
│   │   ├── PlayerRankCard.tsx
│   │   └── FilterTabs.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       ├── Avatar.tsx
│       ├── LoadingSpinner.tsx
│       └── Card.tsx
│
├── contexts/
│   ├── AuthContext.tsx                 # PocketBase auth
│   ├── SocketContext.tsx               # Socket.io connection
│   ├── GameContext.tsx                 # Active game state
│   └── SoundContext.tsx                # Audio management
│
├── services/
│   ├── pocketbase/
│   │   ├── client.ts                   # PB instance
│   │   ├── auth.ts                     # Auth methods
│   │   ├── rooms.ts                    # Room CRUD
│   │   ├── games.ts                    # Game history
│   │   ├── users.ts                    # User profile
│   │   ├── achievements.ts             # Achievements
│   │   ├── friends.ts                  # Friend system
│   │   └── leaderboard.ts              # Rankings
│   │
│   ├── socket/
│   │   ├── client.ts                   # Socket.io instance
│   │   ├── events.ts                   # Event constants
│   │   └── handlers.ts                 # Event handlers
│   │
│   └── game/
│       ├── logic.ts                    # Game calculations
│       ├── board.ts                    # Board initialization
│       └── validation.ts               # Move validation
│
├── hooks/
│   ├── useAuth.ts
│   ├── useSocket.ts
│   ├── useGame.ts
│   ├── useRoom.ts
│   ├── useSound.ts
│   ├── useVibration.ts
│   ├── useLeaderboard.ts
│   ├── useAchievements.ts
│   ├── useFriends.ts
│   └── useGameHistory.ts
│
├── types/
│   ├── index.ts                        # Re-exports
│   ├── auth.ts
│   ├── game.ts
│   ├── room.ts
│   ├── socket.ts
│   ├── user.ts
│   └── achievement.ts
│
├── constants/
│   ├── config.ts                       # App config
│   ├── colors.ts                       # Theme colors
│   ├── game.ts                         # Game constants
│   └── achievements.ts                 # Achievement definitions
│
├── utils/
│   ├── helpers.ts
│   ├── validators.ts
│   └── storage.ts
│
├── assets/
│   ├── sounds/
│   │   ├── join.mp3
│   │   ├── move.mp3
│   │   ├── complete-square.mp3
│   │   ├── error.mp3
│   │   ├── winner.mp3
│   │   └── background.mp3
│   │
│   ├── images/
│   │   ├── logo.png
│   │   ├── shapes/
│   │   └── achievements/
│   │
│   └── fonts/
│       └── LowerEastSide.ttf
│
└── server/                             # Backend (separate deployment)
    ├── socket-server/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── src/
    │   │   ├── index.ts                # Entry point
    │   │   ├── socket.ts               # Socket.io setup
    │   │   ├── middleware/
    │   │   │   └── auth.ts             # Token verification
    │   │   ├── handlers/
    │   │   │   ├── room.ts
    │   │   │   ├── game.ts
    │   │   │   └── connection.ts
    │   │   ├── game/
    │   │   │   ├── state.ts
    │   │   │   ├── logic.ts
    │   │   │   └── validation.ts
    │   │   └── types/
    │   │       └── index.ts
    │   └── Dockerfile
    │
    └── pocketbase/
        ├── pb_data/
        ├── pb_migrations/
        ├── pb_hooks/                   # Optional JS hooks
        └── Dockerfile
```

---

## 🎮 Core TypeScript Types

```typescript
// types/game.ts

export interface Dot {
  id: number;
  row: number;
  col: number;
  x: number;
  y: number;
  connectedTo: number[];
}

export interface Line {
  id: string;
  dot1Id: number;
  dot2Id: number;
  playerId: string;
  color: string;
}

export interface Square {
  id: number;
  topLeftDotId: number;
  isComplete: boolean;
  completedBy: string | null;
  color: string | null;
  lines: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
}

export interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
  isOwner: boolean;
  isConnected: boolean;
}

export interface GameState {
  roomCode: string;
  roomId: string;
  gameMode: '1vs1' | '3players';
  status: 'waiting' | 'playing' | 'finished';
  players: Player[];
  dots: Dot[];
  lines: Line[];
  squares: Square[];
  currentTurnPlayerId: string | null;
  winner: Player | null;
  isDraw: boolean;
}

// types/room.ts

export interface Room {
  id: string;
  code: string;
  name: string;
  owner: string;
  gameMode: '1vs1' | '3players';
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished' | 'cancelled';
  players: string[];
  createdAt: string;
  expiresAt: string;
}

export interface CreateRoomData {
  name?: string;
  gameMode: '1vs1' | '3players';
}

// types/user.ts

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalScore: number;
  currentStreak: number;
  bestStreak: number;
  level: number;
  experience: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'dark' | 'light';
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// types/socket.ts

export interface ServerToClientEvents {
  'player-joined': (data: { player: Player; players: Player[] }) => void;
  'player-left': (data: { playerId: string; players: Player[] }) => void;
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
  'game-over': (data: {
    winner: Player | null;
    isDraw: boolean;
    finalScores: Record<string, number>;
  }) => void;
  'play-again-requested': (data: { playerId: string }) => void;
  'new-game-starting': () => void;
  'room-closed': (data: { reason: string }) => void;
  'error': (data: { message: string; code: string }) => void;
}

export interface ClientToServerEvents {
  'join-room': (data: { roomCode: string; roomId: string }) => void;
  'leave-room': (data: { roomCode: string }) => void;
  'start-game': (data: { roomCode: string }) => void;
  'make-move': (data: { roomCode: string; dot1Id: number; dot2Id: number }) => void;
  'request-play-again': (data: { roomCode: string }) => void;
  'accept-play-again': (data: { roomCode: string }) => void;
}
```

---

## 🎨 Screen Wireframes

### Home Screen
```
┌────────────────────────────────────┐
│  ☰                    🔔  👤       │
├────────────────────────────────────┤
│                                    │
│         DOTS & BOXES               │
│         ────────────               │
│                                    │
│    Level 5 ████████░░ 2450 XP     │
│                                    │
│  ┌──────────────────────────────┐  │
│  │                              │  │
│  │      [  PLAY NOW  ]          │  │
│  │                              │  │
│  │  ┌────────────┐ ┌──────────┐ │  │
│  │  │ Create     │ │ Join     │ │  │
│  │  │ Room       │ │ Room     │ │  │
│  │  └────────────┘ └──────────┘ │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  📊 Your Stats               │  │
│  │  ────────────                │  │
│  │  Games: 47   Wins: 28        │  │
│  │  Win Rate: 59.6%             │  │
│  │  Current Streak: 🔥 5        │  │
│  └──────────────────────────────┘  │
│                                    │
├────────────────────────────────────┤
│  🏠    🏆    👥    👤             │
│  Home  Board  Friends  Profile    │
└────────────────────────────────────┘
```

### Game Screen
```
┌────────────────────────────────────┐
│  ←  Room: ABC123          🔊  🎵  │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐  │
│  │  You: 12        Alex: 8      │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │                              │  │
│  │   ●───●───●───●───●───●───●  │  │
│  │   │ Y │   │   │   │   │   │  │  │
│  │   ●───●───●───●───●───●───●  │  │
│  │   │   │ A │ A │   │   │   │  │  │
│  │   ●───●───●───●───●───●───●  │  │
│  │   │   │   │   │   │   │   │  │  │
│  │   ●───●───●───●───●───●───●  │  │
│  │   │   │   │   │   │   │   │  │  │
│  │   ●───●───●───●───●───●───●  │  │
│  │   │   │   │   │   │   │   │  │  │
│  │   ●───●───●───●───●───●───●  │  │
│  │   │   │   │   │   │   │   │  │  │
│  │   ●───●───●───●───●───●───●  │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  ✓ You(John)    │ YOUR TURN  │  │
│  │  ✓ Alex         │ waiting... │  │
│  └──────────────────────────────┘  │
│                                    │
└────────────────────────────────────┘
```

### Profile Screen
```
┌────────────────────────────────────┐
│  ←  Profile                  ⚙️   │
├────────────────────────────────────┤
│                                    │
│           ┌─────────┐              │
│           │  AVATAR │              │
│           │   📷    │              │
│           └─────────┘              │
│         @johndoe                   │
│         John Doe                   │
│                                    │
│    Level 12 ████████░░ 8450 XP    │
│                                    │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │  47    │ │  28    │ │ 59.6%  │  │
│  │ Games  │ │  Wins  │ │Win Rate│  │
│  └────────┘ └────────┘ └────────┘  │
│                                    │
│  Achievements (12/25)              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │ 🏆 │ │ ⭐ │ │ 🎯 │ │ 🔥 │ ... │
│  └────┘ └────┘ └────┘ └────┘      │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  🔊 Sound Effects       [ON] │  │
│  │  🎵 Background Music    [ON] │  │
│  │  📳 Vibration          [ON] │  │
│  │  🌙 Dark Theme         [ON] │  │
│  └──────────────────────────────┘  │
│                                    │
│        [ Sign Out ]                │
│                                    │
└────────────────────────────────────┘
```

---

## ⚙️ Game Logic

### Board Configuration

```typescript
// constants/game.ts
export const GAME_CONFIG = {
  GRID_SIZE: 9,              // 9x9 dots = 8x8 squares
  TOTAL_SQUARES: 64,         // 8 * 8
  DOT_SIZE: 20,
  LINE_WIDTH: 4,
  BOARD_PADDING: 20,
  
  PLAYER_COLORS: ['#E63946', '#2A9D8F', '#E9C46A'],
  
  TOAST_DURATION: {
    default: 2000,
    winner: 4000,
    error: 3000,
  },
  
  EXPERIENCE: {
    PER_SQUARE: 10,
    WIN_BONUS: 100,
    DRAW_BONUS: 25,
  },
  
  LEVELS: [
    { level: 1, expRequired: 0 },
    { level: 2, expRequired: 500 },
    { level: 3, expRequired: 1200 },
    { level: 4, expRequired: 2100 },
    { level: 5, expRequired: 3200 },
    // ... continues
  ],
};
```

### Board Initialization

```typescript
// services/game/board.ts
import { GAME_CONFIG } from '../../constants/game';
import type { Dot, Square } from '../../types/game';

export function initializeBoard(boardSize: number): { dots: Dot[]; squares: Square[] } {
  const { GRID_SIZE, BOARD_PADDING } = GAME_CONFIG;
  const spacing = (boardSize - BOARD_PADDING * 2) / (GRID_SIZE - 1);
  
  const dots: Dot[] = [];
  const squares: Square[] = [];
  
  // Create dots
  let dotId = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      dots.push({
        id: dotId++,
        row,
        col,
        x: BOARD_PADDING + col * spacing,
        y: BOARD_PADDING + row * spacing,
        connectedTo: [],
      });
    }
  }
  
  // Create squares (one fewer than dots in each dimension)
  let squareId = 0;
  for (let row = 0; row < GRID_SIZE - 1; row++) {
    for (let col = 0; col < GRID_SIZE - 1; col++) {
      const topLeftDotId = row * GRID_SIZE + col;
      squares.push({
        id: squareId++,
        topLeftDotId,
        isComplete: false,
        completedBy: null,
        color: null,
        lines: { top: false, right: false, bottom: false, left: false },
      });
    }
  }
  
  return { dots, squares };
}
```

### Move Validation

```typescript
// services/game/validation.ts
import type { Dot, GameState } from '../../types/game';

export function validateMove(
  gameState: GameState,
  dot1Id: number,
  dot2Id: number,
  playerId: string
): { valid: boolean; error?: string } {
  const { dots, currentTurnPlayerId } = gameState;
  
  // Check turn
  if (currentTurnPlayerId !== playerId) {
    return { valid: false, error: 'Not your turn' };
  }
  
  const dot1 = dots[dot1Id];
  const dot2 = dots[dot2Id];
  
  if (!dot1 || !dot2) {
    return { valid: false, error: 'Invalid dots' };
  }
  
  // Check if already connected
  if (dot1.connectedTo.includes(dot2Id)) {
    return { valid: false, error: 'Already connected' };
  }
  
  // Check adjacency (must be horizontal or vertical neighbors)
  const isHorizontal = dot1.row === dot2.row && Math.abs(dot1.col - dot2.col) === 1;
  const isVertical = dot1.col === dot2.col && Math.abs(dot1.row - dot2.row) === 1;
  
  if (!isHorizontal && !isVertical) {
    return { valid: false, error: 'Dots must be adjacent' };
  }
  
  return { valid: true };
}
```

### Process Move

```typescript
// services/game/logic.ts
import { GAME_CONFIG } from '../../constants/game';
import type { GameState, Line, Square } from '../../types/game';

export function processMove(
  gameState: GameState,
  dot1Id: number,
  dot2Id: number,
  playerId: string,
  playerColor: string
): {
  line: Line;
  completedSquares: Square[];
  isGameOver: boolean;
} {
  const { dots, squares } = gameState;
  const { GRID_SIZE } = GAME_CONFIG;
  
  // Create line
  const line: Line = {
    id: `${Math.min(dot1Id, dot2Id)}-${Math.max(dot1Id, dot2Id)}`,
    dot1Id,
    dot2Id,
    playerId,
    color: playerColor,
  };
  
  // Update dot connections
  dots[dot1Id].connectedTo.push(dot2Id);
  dots[dot2Id].connectedTo.push(dot1Id);
  
  // Check for completed squares
  const completedSquares: Square[] = [];
  
  for (const square of squares) {
    if (square.isComplete) continue;
    
    const topLeft = square.topLeftDotId;
    const topRight = topLeft + 1;
    const bottomLeft = topLeft + GRID_SIZE;
    const bottomRight = bottomLeft + 1;
    
    // Determine which line of the square this move affects
    const isTop = checkLine(dot1Id, dot2Id, topLeft, topRight);
    const isRight = checkLine(dot1Id, dot2Id, topRight, bottomRight);
    const isBottom = checkLine(dot1Id, dot2Id, bottomLeft, bottomRight);
    const isLeft = checkLine(dot1Id, dot2Id, topLeft, bottomLeft);
    
    if (isTop) square.lines.top = true;
    if (isRight) square.lines.right = true;
    if (isBottom) square.lines.bottom = true;
    if (isLeft) square.lines.left = true;
    
    // Check if square is now complete
    if (square.lines.top && square.lines.right && square.lines.bottom && square.lines.left) {
      square.isComplete = true;
      square.completedBy = playerId;
      square.color = playerColor;
      completedSquares.push(square);
    }
  }
  
  const isGameOver = squares.every(s => s.isComplete);
  
  return { line, completedSquares, isGameOver };
}

function checkLine(d1: number, d2: number, expected1: number, expected2: number): boolean {
  return (d1 === expected1 && d2 === expected2) || (d1 === expected2 && d2 === expected1);
}

export function getNextPlayer(
  players: { id: string }[],
  currentPlayerId: string,
  completedSquareCount: number
): string {
  // If player completed a square, they go again
  if (completedSquareCount > 0) {
    return currentPlayerId;
  }
  
  // Otherwise, next player
  const currentIndex = players.findIndex(p => p.id === currentPlayerId);
  const nextIndex = (currentIndex + 1) % players.length;
  return players[nextIndex].id;
}

export function determineWinner(
  players: { id: string; score: number }[]
): { winner: { id: string; score: number } | null; isDraw: boolean } {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  
  if (sorted[0].score === sorted[1].score) {
    return { winner: null, isDraw: true };
  }
  
  return { winner: sorted[0], isDraw: false };
}
```

---

## 🔐 Authentication Flow

```
┌──────────┐         ┌──────────────┐         ┌──────────────┐
│   App    │         │  PocketBase  │         │  Socket.io   │
└────┬─────┘         └──────┬───────┘         └──────┬───────┘
     │                      │                        │
     │  1. Login/Register   │                        │
     │─────────────────────►│                        │
     │                      │                        │
     │  2. JWT Token + User │                        │
     │◄─────────────────────│                        │
     │                      │                        │
     │  3. Save to Storage  │                        │
     │  (AsyncStorage)      │                        │
     │                      │                        │
     │  4. Connect Socket   │                        │
     │      with Token      │                        │
     │──────────────────────────────────────────────►│
     │                      │                        │
     │                      │  5. Verify Token       │
     │                      │◄───────────────────────│
     │                      │                        │
     │                      │  6. User Valid         │
     │                      │───────────────────────►│
     │                      │                        │
     │  7. Socket Connected │                        │
     │◄──────────────────────────────────────────────│
     │                      │                        │
```

---

## 🎮 Complete Game Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            COMPLETE GAME FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

PHASE 1: ROOM CREATION
══════════════════════════════════════════════════════════════════════════════

 Player 1 (Host)              PocketBase              Socket.io
      │                            │                       │
      │  1. Create Room Request    │                       │
      │───────────────────────────►│                       │
      │                            │                       │
      │  2. Room Created (code)    │                       │
      │◄───────────────────────────│                       │
      │                            │                       │
      │  3. Join Socket Room       │                       │
      │────────────────────────────────────────────────────►
      │                            │                       │
      │  4. Waiting for players    │                       │
      │◄────────────────────────────────────────────────────


PHASE 2: PLAYER JOINS
══════════════════════════════════════════════════════════════════════════════

 Player 2                     PocketBase              Socket.io
      │                            │                       │
      │  1. Enter Room Code        │                       │
      │───────────────────────────►│                       │
      │                            │                       │
      │  2. Room Found + Join      │                       │
      │◄───────────────────────────│                       │
      │                            │                       │
      │  3. Join Socket Room       │                       │
      │────────────────────────────────────────────────────►
      │                            │                       │
      │                            │  4. Broadcast         │
      │                            │     'player-joined'   │
      │                            │◄──────────────────────│
      │                            │                       │
 Player 1 & 2 receive player list │                       │


PHASE 3: GAME START
══════════════════════════════════════════════════════════════════════════════

 Player 1 (Host)              PocketBase              Socket.io
      │                            │                       │
      │  1. Start Game             │                       │
      │────────────────────────────────────────────────────►
      │                            │                       │
      │                            │  2. Update Status     │
      │                            │◄──────────────────────│
      │                            │                       │
      │                            │  3. Broadcast         │
      │                            │     'game-started'    │
 All players receive game state   │◄──────────────────────│


PHASE 4: GAMEPLAY LOOP
══════════════════════════════════════════════════════════════════════════════

 Current Player               PocketBase              Socket.io          Others
      │                            │                       │                │
      │  1. Make Move (tap 2 dots) │                       │                │
      │────────────────────────────────────────────────────►                │
      │                            │                       │                │
      │                            │  2. Validate Move     │                │
      │                            │     Process Logic     │                │
      │                            │     Check Squares     │                │
      │                            │                       │                │
      │                            │  3. Broadcast         │                │
      │                            │     'move-made'       │                │
      │◄───────────────────────────────────────────────────────────────────►│
      │                            │                       │                │
      │  All players update UI     │                       │                │
      │  (line drawn, scores, turn)│                       │                │
      │                            │                       │                │
      │  [If completed square:     │                       │                │
      │   Same player goes again]  │                       │                │
      │                            │                       │                │
      │  [Loop until all squares   │                       │                │
      │   are complete]            │                       │                │


PHASE 5: GAME END
══════════════════════════════════════════════════════════════════════════════

 Socket.io                    PocketBase
      │                            │
      │  1. Detect Game Over       │
      │  (all squares complete)    │
      │                            │
      │  2. Save Game Record       │
      │───────────────────────────►│
      │                            │
      │  3. Update Player Stats    │
      │───────────────────────────►│
      │                            │
      │  4. Check Achievements     │
      │───────────────────────────►│
      │                            │
      │  5. Update Room Status     │
      │───────────────────────────►│
      │                            │
      │  6. Broadcast 'game-over'  │
      │  to all players            │
      │                            │


PHASE 6: PLAY AGAIN
══════════════════════════════════════════════════════════════════════════════

 Player 1                     Socket.io               Player 2
      │                            │                       │
      │  1. Request Play Again     │                       │
      │───────────────────────────►│                       │
      │                            │                       │
      │                            │  2. 'play-again-      │
      │                            │      requested'       │
      │                            │──────────────────────►│
      │                            │                       │
      │                            │  3. Accept            │
      │                            │◄──────────────────────│
      │                            │                       │
      │  4. 'new-game-starting'    │                       │
      │◄───────────────────────────────────────────────────►
      │                            │                       │
      │  Both reset to new game    │                       │
```

---

## 📦 Dependencies

```json
{
  "name": "dots-and-boxes-game",
  "version": "1.0.0",
  "dependencies": {
    "expo": "~52.0.0",
    "expo-av": "~14.0.0",
    "expo-haptics": "~13.0.0",
    "expo-router": "~4.0.0",
    "expo-status-bar": "~2.0.0",
    "expo-secure-store": "~13.0.0",
    "expo-image-picker": "~15.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    "react-native-svg": "15.8.0",
    "react-native-reanimated": "~3.16.0",
    "socket.io-client": "^4.7.0",
    "pocketbase": "^0.21.0",
    "@react-native-async-storage/async-storage": "1.23.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@types/react": "~18.3.0",
    "typescript": "^5.3.0"
  }
}
```

### Server Dependencies

```json
{
  "name": "dots-and-boxes-server",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.7.0",
    "pocketbase": "^0.21.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "tsx": "^4.0.0"
  }
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Initialize Expo project with TypeScript
- [ ] Set up Expo Router navigation structure
- [ ] Create basic UI components (Button, Input, Card)
- [ ] Set up PocketBase client
- [ ] Implement authentication (login, register, logout)
- [ ] Create AuthContext

### Phase 2: Room Management (Week 2)
- [ ] Create PocketBase room collection
- [ ] Implement room creation (PocketBase)
- [ ] Implement room joining (PocketBase)
- [ ] Set up Socket.io client
- [ ] Implement Socket.io room joining
- [ ] Create SocketContext
- [ ] Build room lobby UI

### Phase 3: Core Gameplay (Week 3)
- [ ] Create GameBoard component
- [ ] Implement Dot component with touch handling
- [ ] Implement Line rendering (SVG)
- [ ] Create game logic (board init, validation, move processing)
- [ ] Implement turn management
- [ ] Add square completion detection
- [ ] Create GameContext
- [ ] Build score display

### Phase 4: Real-time Sync (Week 4)
- [ ] Set up Socket.io server
- [ ] Implement server-side game logic
- [ ] Add PocketBase token verification middleware
- [ ] Sync moves between players
- [ ] Handle player disconnections
- [ ] Implement game over detection
- [ ] Save game results to PocketBase

### Phase 5: Polish & Features (Week 5)
- [ ] Add sound effects
- [ ] Add haptic feedback
- [ ] Implement background music
- [ ] Add toast notifications
- [ ] Create game over modal
- [ ] Implement play again flow
- [ ] Add animations (dot press, line draw)

### Phase 6: Social Features (Week 6)
- [ ] User profile screen
- [ ] Statistics tracking
- [ ] Achievements system
- [ ] Leaderboards
- [ ] Friend system
- [ ] Game invites
- [ ] Game history

### Phase 7: Testing & Launch (Week 7)
- [ ] Unit tests for game logic
- [ ] Integration tests
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] App store assets
- [ ] Deploy servers
- [ ] Submit to app stores

---

## 🌐 Deployment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION DEPLOYMENT                                │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   CloudFlare    │
                              │   (CDN/DNS)     │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
          ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
          │  Mobile Apps    │ │  PocketBase     │ │  Socket.io      │
          │                 │ │  Server         │ │  Server         │
          │  • iOS          │ │                 │ │                 │
          │  • Android      │ │  Railway /      │ │  Railway /      │
          │                 │ │  Fly.io /       │ │  Fly.io /       │
          │  App Stores     │ │  DigitalOcean   │ │  DigitalOcean   │
          │                 │ │                 │ │                 │
          │                 │ │  pb.domain.com  │ │  ws.domain.com  │
          └─────────────────┘ └────────┬────────┘ └────────┬────────┘
                                       │                   │
                                       └─────────┬─────────┘
                                                 │
                                       ┌─────────▼─────────┐
                                       │  Persistent       │
                                       │  Volume           │
                                       │  (pb_data)        │
                                       └───────────────────┘

Environment Variables:
─────────────────────
EXPO_PUBLIC_POCKETBASE_URL=https://pb.yourdomain.com
EXPO_PUBLIC_SOCKET_URL=https://ws.yourdomain.com
POCKETBASE_URL=https://pb.yourdomain.com (for socket server)
```

---

## 📝 Quick Reference

### PocketBase Admin
- URL: `http://localhost:8090/_/`
- Create collections as defined in schema
- Enable API rules for each collection

### Socket.io Server
- Port: 3000 (default)
- Auth: PocketBase JWT token verification
- CORS: Configure for production domains

### Environment Variables (.env)

```bash
# React Native App
EXPO_PUBLIC_POCKETBASE_URL=http://localhost:8090
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000

# Socket.io Server
PORT=3000
POCKETBASE_URL=http://localhost:8090
NODE_ENV=development
```

---

## ✅ Checklist

Before launching:

- [ ] All PocketBase collections created with proper rules
- [ ] Socket.io server deployed and accessible
- [ ] CORS configured for production
- [ ] SSL certificates installed
- [ ] Environment variables set
- [ ] App icons and splash screen ready
- [ ] Privacy policy and terms of service
- [ ] App store listings prepared
- [ ] Analytics integration (optional)
- [ ] Error tracking (Sentry) (optional)

---

## 🛡️ Security & Robustness (CRITICAL)

### 1. Rate Limiting (Server)

```typescript
// server/src/middleware/rateLimiter.ts
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests = 10, windowMs = 5000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(userId: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(userId);

    if (!entry || now > entry.resetTime) {
      this.limits.set(userId, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false; // Rate limited
    }

    entry.count++;
    return true;
  }

  // Cleanup old entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [userId, entry] of this.limits) {
      if (now > entry.resetTime) {
        this.limits.delete(userId);
      }
    }
  }
}

export const rateLimiter = new RateLimiter(10, 5000); // 10 moves per 5 seconds

// Apply to socket middleware
io.use((socket, next) => {
  const userId = socket.data.user?.id;
  if (!userId) return next(new Error('Not authenticated'));
  
  if (!rateLimiter.check(userId)) {
    return next(new Error('Too many requests. Please slow down.'));
  }
  next();
});
```

### 2. Server-Side Move Validation (CRITICAL - Never Trust Client)

```typescript
// server/src/handlers/game.ts
socket.on('make-move', async ({ roomCode, dot1Id, dot2Id }) => {
  const room = rooms.get(roomCode);
  if (!room || !room.gameState) {
    socket.emit('error', { message: 'Room not found', code: 'ROOM_NOT_FOUND' });
    return;
  }

  const userId = socket.data.user.id;
  const gameState = room.gameState;

  // CRITICAL: All validation happens on server
  
  // 1. Check if game is active
  if (gameState.status !== 'playing') {
    socket.emit('error', { message: 'Game not active', code: 'GAME_NOT_ACTIVE' });
    return;
  }

  // 2. Check if it's this player's turn
  if (gameState.currentTurnPlayerId !== userId) {
    socket.emit('error', { message: 'Not your turn', code: 'NOT_YOUR_TURN' });
    return;
  }

  // 3. Validate dot IDs are in range
  if (dot1Id < 0 || dot1Id >= gameState.dots.length ||
      dot2Id < 0 || dot2Id >= gameState.dots.length) {
    socket.emit('error', { message: 'Invalid dots', code: 'INVALID_DOTS' });
    return;
  }

  // 4. Check dots are adjacent (no diagonal)
  const dot1 = gameState.dots[dot1Id];
  const dot2 = gameState.dots[dot2Id];
  const isHorizontal = dot1.row === dot2.row && Math.abs(dot1.col - dot2.col) === 1;
  const isVertical = dot1.col === dot2.col && Math.abs(dot1.row - dot2.row) === 1;

  if (!isHorizontal && !isVertical) {
    socket.emit('error', { message: 'Dots must be adjacent', code: 'NOT_ADJACENT' });
    return;
  }

  // 5. Check dots aren't already connected
  if (dot1.connectedTo.includes(dot2Id)) {
    socket.emit('error', { message: 'Already connected', code: 'ALREADY_CONNECTED' });
    return;
  }

  // All validations passed - process the move
  const player = room.players.get(userId)!;
  const moveResult = processMove(gameState, dot1Id, dot2Id, userId, player.color);
  
  // ... rest of move processing
});
```

### 3. Race Condition Prevention (Move Locking)

```typescript
// server/src/handlers/game.ts
const pendingMoves = new Map<string, boolean>();

socket.on('make-move', async ({ roomCode, dot1Id, dot2Id }) => {
  const lockKey = `${roomCode}:move`;

  // Prevent simultaneous moves
  if (pendingMoves.get(lockKey)) {
    socket.emit('error', { message: 'Move in progress', code: 'MOVE_IN_PROGRESS' });
    return;
  }

  pendingMoves.set(lockKey, true);

  try {
    // ... validation and move processing
  } finally {
    pendingMoves.delete(lockKey);
  }
});
```

### 4. Memory Leak Prevention (Room Cleanup)

```typescript
// server/src/index.ts
const rooms = new Map<string, RoomState>();

// Cleanup empty rooms
function cleanupRoom(roomCode: string): void {
  const room = rooms.get(roomCode);
  if (!room) return;

  if (room.players.size === 0) {
    rooms.delete(roomCode);
    console.log(`Room ${roomCode} deleted (empty)`);
  }
}

// Periodic cleanup of stale rooms
setInterval(() => {
  const now = Date.now();
  const staleThreshold = 2 * 60 * 60 * 1000; // 2 hours

  for (const [code, room] of rooms) {
    const lastActivity = room.lastActivityAt || 0;
    if (now - lastActivity > staleThreshold) {
      io.to(code).emit('room-closed', { reason: 'Room expired due to inactivity' });
      io.in(code).socketsLeave(code);
      rooms.delete(code);
      console.log(`Room ${code} deleted (stale)`);
    }
  }
}, 30 * 60 * 1000); // Run every 30 minutes

// Room expiration cleanup (PocketBase sync)
setInterval(async () => {
  try {
    const expiredRooms = await pb.collection('rooms').getFullList({
      filter: `expiresAt < "${new Date().toISOString()}" && status != "finished" && status != "cancelled"`
    });

    for (const room of expiredRooms) {
      await pb.collection('rooms').update(room.id, { status: 'cancelled' });
      
      // Disconnect socket connections if any
      const socketRoom = rooms.get(room.code);
      if (socketRoom) {
        io.to(room.code).emit('room-closed', { reason: 'Room expired' });
        io.in(room.code).socketsLeave(room.code);
        rooms.delete(room.code);
      }
    }
  } catch (error) {
    console.error('Room cleanup failed:', error);
  }
}, 60 * 60 * 1000); // Run every hour
```

### 5. Client Reconnection Logic

```typescript
// services/socket/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private savedGameState: { roomCode: string; lastMoveId?: string } | null = null;

  async saveGameState(roomCode: string, lastMoveId?: string): Promise<void> {
    this.savedGameState = { roomCode, lastMoveId };
    await AsyncStorage.setItem('game_state', JSON.stringify(this.savedGameState));
  }

  async loadGameState(): Promise<{ roomCode: string; lastMoveId?: string } | null> {
    try {
      const saved = await AsyncStorage.getItem('game_state');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  async clearGameState(): Promise<void> {
    this.savedGameState = null;
    await AsyncStorage.removeItem('game_state');
  }

  private setupReconnection(): void {
    if (!this.socket) return;

    this.socket.on('disconnect', async (reason) => {
      console.log('Disconnected:', reason);
      
      // Save current game state for potential reconnection
      if (this.savedGameState) {
        await AsyncStorage.setItem('game_state', JSON.stringify(this.savedGameState));
      }
    });

    this.socket.on('connect', async () => {
      console.log('Connected:', this.socket?.id);
      this.reconnectAttempts = 0;

      // Attempt to rejoin room after reconnection
      const savedState = await this.loadGameState();
      if (savedState?.roomCode) {
        this.socket?.emit('rejoin-room', {
          roomCode: savedState.roomCode,
          lastMoveId: savedState.lastMoveId,
        });
      }
    });

    this.socket.on('rejoin-success', async (data) => {
      console.log('Rejoined room successfully');
      // Sync game state from server
    });

    this.socket.on('rejoin-failed', async (data) => {
      console.log('Failed to rejoin:', data.reason);
      await this.clearGameState();
      // Navigate to home screen
    });
  }
}
```

### 6. Game Abandonment Handling

```typescript
// server/src/handlers/connection.ts
const ABANDON_TIMEOUT = 60 * 1000; // 1 minute
const disconnectTimers = new Map<string, NodeJS.Timeout>();

socket.on('disconnect', () => {
  const userId = socket.data.user?.id;
  const roomCode = socket.data.currentRoom;

  if (!roomCode || !userId) return;

  const room = rooms.get(roomCode);
  if (!room) return;

  // Mark player as disconnected (not removed yet)
  const player = room.players.get(userId);
  if (player) {
    player.isConnected = false;
  }

  // Notify others
  io.to(roomCode).emit('player-disconnected', { playerId: userId });

  // Set abandonment timer
  const timer = setTimeout(async () => {
    const currentRoom = rooms.get(roomCode);
    if (!currentRoom) return;

    const disconnectedPlayer = currentRoom.players.get(userId);
    if (disconnectedPlayer && !disconnectedPlayer.isConnected) {
      // Player didn't reconnect - handle abandonment
      
      if (currentRoom.gameState?.status === 'playing') {
        // Award win to remaining players or end game
        const remainingPlayers = Array.from(currentRoom.players.values())
          .filter(p => p.oduserId !== oduserId && p.isConnected);

        if (remainingPlayers.length === 1) {
          // Only one player left - they win
          const winner = remainingPlayers[0];
          
          io.to(roomCode).emit('game-over', {
            winner: {
              id: winner.oduserId,
              name: winner.odusername,
              color: winner.color,
              score: winner.score,
              isOwner: winner.oduserId === currentRoom.hostId,
              isConnected: true,
            },
            isDraw: false,
            finalScores: {},
            reason: 'opponent_abandoned',
          });

          // Save result
          await saveGameResult(currentRoom, winner, {}, 'abandoned');
        }
      }

      // Remove player from room
      currentRoom.players.delete(userId);
      cleanupRoom(roomCode);
    }
  }, ABANDON_TIMEOUT);

  disconnectTimers.set(`${roomCode}:${userId}`, timer);
});

// Handle rejoin
socket.on('rejoin-room', async ({ roomCode, lastMoveId }) => {
  const userId = socket.data.user?.id;

  // Clear abandonment timer
  const timerKey = `${roomCode}:${userId}`;
  const timer = disconnectTimers.get(timerKey);
  if (timer) {
    clearTimeout(timer);
    disconnectTimers.delete(timerKey);
  }

  const room = rooms.get(roomCode);
  if (!room) {
    socket.emit('rejoin-failed', { reason: 'Room no longer exists' });
    return;
  }

  const player = room.players.get(userId);
  if (!player) {
    socket.emit('rejoin-failed', { reason: 'You are not in this room' });
    return;
  }

  // Mark as connected
  player.isConnected = true;
  player.socketId = socket.id;
  socket.join(roomCode);
  socket.data.currentRoom = roomCode;

  // Send current game state
  socket.emit('rejoin-success', {
    gameState: room.gameState,
    players: Array.from(room.players.values()),
  });

  // Notify others
  socket.to(roomCode).emit('player-reconnected', { playerId: userId });
});
```

### 7. Input Validation Helpers

```typescript
// utils/validators.ts
export const validators = {
  roomCode: (code: string): boolean => {
    // 6 characters, uppercase alphanumeric (excluding confusing chars)
    return /^[A-HJ-NP-Z2-9]{6}$/.test(code.toUpperCase());
  },

  username: (username: string): { valid: boolean; error?: string } => {
    if (username.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters' };
    }
    if (username.length > 20) {
      return { valid: false, error: 'Username must be at most 20 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }
    return { valid: true };
  },

  displayName: (name: string): { valid: boolean; error?: string } => {
    if (name.length < 2) {
      return { valid: false, error: 'Display name must be at least 2 characters' };
    }
    if (name.length > 30) {
      return { valid: false, error: 'Display name must be at most 30 characters' };
    }
    return { valid: true };
  },

  email: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  password: (password: string): { valid: boolean; error?: string } => {
    if (password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one number' };
    }
    return { valid: true };
  },

  avatar: (file: { size: number; type: string }): { valid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
    }
    return { valid: true };
  },
};
```

---

## 📋 Future Enhancements (TODO List)

### 🎯 Priority 1: Nice to Have (Post-MVP)

- [ ] **Optimistic Updates** - Update UI immediately, rollback on server rejection
  ```typescript
  // Instant feedback, revert if server rejects
  const makeMove = async (dot1Id, dot2Id) => {
    const rollbackState = saveCurrentState();
    updateLocalBoard(dot1Id, dot2Id); // Instant
    try {
      await socketService.makeMove(dot1Id, dot2Id);
    } catch (error) {
      restoreState(rollbackState); // Rollback
    }
  };
  ```

- [ ] **Enhanced Achievement Progress Tracking**
  ```typescript
  // Track incremental progress
  {
    progress: number,           // Current: 7
    progressTarget: number,     // Target: 10
    progressPercentage: number, // Calculated: 70%
    notificationShown: boolean, // Did user see unlock?
  }
  ```

- [ ] **Elo Rating System** - For skill-based matchmaking
  ```typescript
  // Competitive ranking
  const K = 32;
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const newElo = playerElo + K * (actualScore - expectedScore);
  ```

- [ ] **Analytics Events** - Track user behavior
  ```typescript
  analytics.track('game_started', { gameMode, playerCount });
  analytics.track('game_completed', { duration, totalMoves, winner });
  analytics.track('achievement_unlocked', { achievementKey });
  ```

### 🎯 Priority 2: Feature Expansion

- [ ] **Push Notifications** - Game invites when app is closed
  - Use Expo Notifications
  - Notify when friend invites to game
  - Notify when it's your turn (if app backgrounded)

- [ ] **Deep Linking** - Share room codes via links
  ```
  dotsandboxes://join/ABC123
  https://dotsandboxes.app/join/ABC123
  ```

- [ ] **Replay System** - Watch past games
  - Already storing `moveHistory` in games collection
  - Build replay player component
  - Step through moves with play/pause controls

- [ ] **Tutorial/Onboarding** - First-time player guide
  - Interactive tutorial on first launch
  - Explain game rules with animations
  - Practice mode against simple AI

### 🎯 Priority 3: Social & Engagement

- [ ] **Spectator Mode** - Watch friends play
  - Join room as observer (no moves)
  - See live game updates
  - Chat with spectators

- [ ] **In-Game Chat** - Simple emoji reactions
  ```typescript
  // Quick reactions during game
  const reactions = ['👍', '😮', '😂', '🔥', '😢', '👏'];
  socket.emit('reaction', { roomCode, emoji: '🔥' });
  ```

- [ ] **Daily Challenges** - Special game modes
  - "Win 3 games today"
  - "Complete 10 squares in one game"
  - Bonus XP rewards

- [ ] **Tournaments** - Competitive brackets
  - Create tournament rooms
  - Bracket advancement
  - Prizes/badges for winners

### 🎯 Priority 4: Technical Improvements

- [ ] **Offline Mode** - Play against AI when no connection
  - Simple AI opponent
  - Sync stats when back online

- [ ] **Background Game State** - Continue game after app restart
  - Full state persistence in AsyncStorage
  - Resume exactly where left off

- [ ] **Performance Optimization**
  - Memoize heavy components
  - Virtualize leaderboard lists
  - Lazy load screens

- [ ] **Accessibility**
  - Screen reader support
  - High contrast mode
  - Adjustable text size

### 🎯 Priority 5: Monetization (If Applicable)

- [ ] **Premium Themes** - Custom board/dot styles
- [ ] **Remove Ads** - One-time purchase
- [ ] **Avatar Packs** - Special profile pictures
- [ ] **Season Pass** - Exclusive achievements/rewards

---

## 🔧 Quick Implementation Notes

### Adding a New Socket Event

1. Define types in `types/socket.ts`
2. Add handler in `server/src/handlers/`
3. Emit from client via `socketService`
4. Handle in `GameContext` or component

### Adding a New PocketBase Collection

1. Create collection in PB Admin
2. Set API rules
3. Add types in `types/`
4. Create service methods in `services/pocketbase/`
5. Create hook in `hooks/`

### Adding a New Screen

1. Create file in `app/(main)/`
2. Use Expo Router conventions
3. Connect to relevant contexts
4. Style with constants/colors

---

*Document Version: 1.1 (Final + Security)*  
*Created: December 2024*  
*Updated: December 2024*  
*Based on: Original Connect Four web app*

