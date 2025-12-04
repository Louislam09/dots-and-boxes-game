# Connect Four (Dots & Boxes) - Hybrid Architecture Design
## Socket.IO + PocketBase

## 📋 Executive Summary

This document outlines the enhanced architecture combining **Socket.IO for real-time gameplay** and **PocketBase for persistence, authentication, and analytics**. This hybrid approach provides instant gameplay responsiveness while maintaining comprehensive game history and user profiles.

---

## 🏗️ Enhanced Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        REACT NATIVE APP                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │   Screens   │  │ Components  │  │   Hooks     │  │   Context   ││
│  │  ─────────  │  │  ─────────  │  │  ─────────  │  │  ─────────  ││
│  │ HomeScreen  │  │ GameBoard   │  │ useSocket   │  │ GameContext ││
│  │ LobbyScreen │  │ Dot         │  │ useGame     │  │ AuthContext ││
│  │ GameScreen  │  │ Line        │  │ useSound    │  │ PBContext   ││
│  │ ProfileScr. │  │ Square      │  │ usePB       │  │ SoundContext││
│  │ StatsScreen │  │ ScoreBoard  │  │ useStats    │  │             ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│                    ┌──────────────┬──────────────┐                  │
│                    │  Socket.IO   │  PocketBase  │                  │
│                    │   Client     │   Client     │                  │
│                    └──────┬───────┴──────┬───────┘                  │
└───────────────────────────┼──────────────┼──────────────────────────┘
                            │              │
                    ┌───────▼──────┐ ┌─────▼────────┐
                    │  Socket.IO   │ │  PocketBase  │
                    │    Server    │ │    Server    │
                    │              │ │              │
                    │ • Real-time  │ │ • Auth       │
                    │   gameplay   │ │ • Database   │
                    │ • Room mgmt  │ │ • File store │
                    │ • Live sync  │ │ • Realtime   │
                    └──────────────┘ └──────────────┘
```

---

## 🎯 Responsibility Separation

### Socket.IO Handles (Real-Time Gameplay)
- ✅ Active game sessions
- ✅ Player moves (connecting dots)
- ✅ Turn synchronization
- ✅ Live player presence
- ✅ Room creation/joining
- ✅ In-game events (square completion, winner detection)
- ✅ Temporary game state

### PocketBase Handles (Persistence & Features)
- ✅ User authentication (email/password, OAuth)
- ✅ User profiles (avatar, display name, preferences)
- ✅ Game history (completed games)
- ✅ Statistics (wins, losses, total score)
- ✅ Achievements/badges
- ✅ Friend system
- ✅ Replay data
- ✅ User preferences (sound, vibration, theme)
- ✅ Leaderboards

---

## 📊 PocketBase Schema Design

### Collections Structure

```typescript
// collections/users.ts
{
  id: string;              // Auto-generated
  username: string;        // Unique
  email: string;           // Unique
  emailVisibility: bool;
  verified: bool;
  
  // Custom fields
  displayName: string;
  avatar: string;          // File field
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalScore: number;
  level: number;           // Based on experience
  experience: number;
  createdAt: datetime;
  updatedAt: datetime;
  
  // Settings
  soundEnabled: bool;
  musicEnabled: bool;
  vibrationEnabled: bool;
  theme: string;           // 'dark' | 'light'
}

// collections/games.ts
{
  id: string;
  roomCode: string;        // Socket.IO room code
  gameMode: string;        // '1vs1' | 'game'
  status: string;          // 'completed' | 'abandoned'
  
  // Players (relation to users)
  players: relation[];     // users collection
  playerNames: json;       // {userId: displayName}
  playerColors: json;      // {userId: color}
  
  // Results
  winner: relation;        // users collection (nullable)
  isDraw: bool;
  scores: json;            // {userId: score}
  totalMoves: number;
  duration: number;        // seconds
  
  // Replay data
  moveHistory: json;       // Array of moves for replay
  finalBoardState: json;   // Final state snapshot
  
  createdAt: datetime;
  completedAt: datetime;
}

// collections/achievements.ts
{
  id: string;
  key: string;             // Unique identifier
  name: string;
  description: string;
  icon: string;            // File field
  category: string;        // 'games' | 'wins' | 'score' | 'special'
  requirement: number;     // e.g., 10 wins
  points: number;          // Achievement points
}

// collections/userAchievements.ts
{
  id: string;
  user: relation;          // users collection
  achievement: relation;   // achievements collection
  unlockedAt: datetime;
  progress: number;        // Current progress towards goal
}

// collections/friends.ts
{
  id: string;
  user: relation;          // users collection
  friend: relation;        // users collection
  status: string;          // 'pending' | 'accepted' | 'blocked'
  createdAt: datetime;
  acceptedAt: datetime;
}

// collections/gameInvites.ts
{
  id: string;
  from: relation;          // users collection
  to: relation;            // users collection
  roomCode: string;
  gameMode: string;
  status: string;          // 'pending' | 'accepted' | 'declined' | 'expired'
  expiresAt: datetime;
  createdAt: datetime;
}

// collections/userStats.ts (aggregated statistics)
{
  id: string;
  user: relation;          // users collection
  date: date;              // For daily/weekly stats
  
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  totalScore: number;
  averageScore: number;
  longestWinStreak: number;
  currentWinStreak: number;
  
  // Time-based
  totalPlayTime: number;   // seconds
  averageGameDuration: number;
}
```

---

## 🔐 Authentication Flow

```typescript
// contexts/AuthContext.tsx
import PocketBase from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const pb = new PocketBase('https://your-pocketbase-url.com');

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-authenticate on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Load saved auth token
        pb.authStore.loadFromAsyncStorage(AsyncStorage);
        
        if (pb.authStore.isValid) {
          // Refresh the auth token
          await pb.collection('users').authRefresh();
          setUser(pb.authStore.model);
        }
      } catch (error) {
        console.error('Auth init failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const record = await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      username,
      displayName: username,
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
      totalScore: 0,
      level: 1,
      experience: 0,
      soundEnabled: true,
      musicEnabled: true,
      vibrationEnabled: true,
      theme: 'dark',
    });

    // Send verification email
    await pb.collection('users').requestVerification(email);
    
    // Auto sign in
    await signIn(email, password);
  };

  const signIn = async (email: string, password: string) => {
    const authData = await pb.collection('users').authWithPassword(email, password);
    
    // Save to AsyncStorage
    await pb.authStore.saveToAsyncStorage(AsyncStorage);
    
    setUser(authData.record);
  };

  const signOut = async () => {
    pb.authStore.clear();
    await AsyncStorage.removeItem('pocketbase_auth');
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    const updated = await pb.collection('users').update(user.id, data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signUp,
      signIn,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 🎮 Game Lifecycle with Hybrid Approach

```typescript
// services/gameService.ts
import { socketService } from './socketService';
import { pocketbaseService } from './pocketbaseService';

class GameService {
  private currentGameData: {
    roomCode: string;
    moveHistory: Move[];
    startTime: number;
  } | null = null;

  // 1. Start game (Socket.IO for real-time)
  async startGame(roomCode: string, gameMode: string, userId: string) {
    this.currentGameData = {
      roomCode,
      moveHistory: [],
      startTime: Date.now(),
    };

    // Join Socket.IO room for real-time gameplay
    socketService.joinRoom(userId, roomCode, true);
  }

  // 2. Record move (both systems)
  async recordMove(move: Move) {
    // Immediate: Send to Socket.IO for real-time sync
    socketService.makeMove(move);

    // Background: Add to local history for later persistence
    this.currentGameData?.moveHistory.push(move);
  }

  // 3. End game (persist to PocketBase)
  async endGame(gameResult: GameResult) {
    if (!this.currentGameData) return;

    const duration = Math.floor((Date.now() - this.currentGameData.startTime) / 1000);

    try {
      // Save game to PocketBase
      const game = await pocketbaseService.createGame({
        roomCode: this.currentGameData.roomCode,
        gameMode: gameResult.gameMode,
        status: 'completed',
        players: gameResult.playerIds,
        playerNames: gameResult.playerNames,
        playerColors: gameResult.playerColors,
        winner: gameResult.winnerId,
        isDraw: gameResult.isDraw,
        scores: gameResult.scores,
        totalMoves: this.currentGameData.moveHistory.length,
        duration,
        moveHistory: this.currentGameData.moveHistory,
        finalBoardState: gameResult.finalBoardState,
      });

      // Update player statistics
      await this.updatePlayerStats(gameResult);

      // Check for achievements
      await this.checkAchievements(gameResult);

      // Leave Socket.IO room
      socketService.leaveRoom(this.currentGameData.roomCode);

      this.currentGameData = null;

      return game;
    } catch (error) {
      console.error('Failed to save game:', error);
      throw error;
    }
  }

  private async updatePlayerStats(gameResult: GameResult) {
    for (const playerId of gameResult.playerIds) {
      const isWinner = playerId === gameResult.winnerId;
      const isDraw = gameResult.isDraw;
      const score = gameResult.scores[playerId];

      await pocketbaseService.updateUserStats(playerId, {
        totalGames: '+1',
        totalWins: isWinner && !isDraw ? '+1' : '+0',
        totalLosses: !isWinner && !isDraw ? '+1' : '+0',
        totalDraws: isDraw ? '+1' : '+0',
        totalScore: `+${score}`,
        experience: `+${this.calculateExperience(score, isWinner)}`,
      });
    }
  }

  private calculateExperience(score: number, isWinner: boolean): number {
    let exp = score * 10; // 10 exp per point
    if (isWinner) exp += 100; // Bonus for winning
    return exp;
  }

  private async checkAchievements(gameResult: GameResult) {
    // Check achievements for each player
    for (const playerId of gameResult.playerIds) {
      const user = await pocketbaseService.getUser(playerId);
      
      // Example: First Win achievement
      if (user.totalWins === 1) {
        await pocketbaseService.unlockAchievement(playerId, 'first_win');
      }

      // Example: 10 Games achievement
      if (user.totalGames === 10) {
        await pocketbaseService.unlockAchievement(playerId, '10_games');
      }

      // Example: Perfect Game (won with 0 opponent points)
      const opponentScore = Object.values(gameResult.scores)
        .filter((_, idx) => gameResult.playerIds[idx] !== playerId)
        .reduce((sum, s) => sum + s, 0);
      
      if (gameResult.winnerId === playerId && opponentScore === 0) {
        await pocketbaseService.unlockAchievement(playerId, 'perfect_game');
      }
    }
  }
}

export const gameService = new GameService();
```

---

## 📱 Enhanced Project Structure

```
connect-four-mobile/
├── app/
│   ├── (auth)/                    # Auth group
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   │
│   ├── (tabs)/                    # Main app tabs
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home/Play
│   │   ├── profile.tsx            # User profile
│   │   ├── stats.tsx              # Statistics
│   │   ├── leaderboard.tsx        # Global leaderboard
│   │   └── friends.tsx            # Friends list
│   │
│   ├── game/
│   │   ├── [roomCode].tsx         # Active game
│   │   └── lobby.tsx              # Waiting room
│   │
│   ├── history/
│   │   ├── index.tsx              # Game history list
│   │   └── [gameId].tsx           # Game replay
│   │
│   └── _layout.tsx
│
├── components/
│   ├── game/                      # Game components (unchanged)
│   │   ├── GameBoard.tsx
│   │   ├── Dot.tsx
│   │   ├── Line.tsx
│   │   └── Square.tsx
│   │
│   ├── profile/
│   │   ├── AvatarUpload.tsx
│   │   ├── StatsCard.tsx
│   │   ├── AchievementBadge.tsx
│   │   └── LevelProgress.tsx
│   │
│   ├── social/
│   │   ├── FriendsList.tsx
│   │   ├── FriendRequest.tsx
│   │   ├── GameInvite.tsx
│   │   └── OnlineStatus.tsx
│   │
│   ├── leaderboard/
│   │   ├── LeaderboardList.tsx
│   │   ├── PlayerRank.tsx
│   │   └── FilterTabs.tsx
│   │
│   └── history/
│       ├── GameHistoryCard.tsx
│       ├── ReplayPlayer.tsx
│       └── MoveTimeline.tsx
│
├── contexts/
│   ├── AuthContext.tsx            # PocketBase auth
│   ├── GameContext.tsx            # Game state (Socket.IO)
│   ├── PocketBaseContext.tsx      # PB client wrapper
│   ├── SocketContext.tsx          # Socket.IO client
│   └── SoundContext.tsx           # Audio management
│
├── hooks/
│   ├── useSocket.ts               # Socket.IO logic
│   ├── useGame.ts                 # Game logic
│   ├── usePocketBase.ts           # PB operations
│   ├── useAuth.ts                 # Auth operations
│   ├── useStats.ts                # Statistics
│   ├── useAchievements.ts         # Achievements
│   ├── useFriends.ts              # Friend management
│   ├── useLeaderboard.ts          # Leaderboard data
│   └── useGameHistory.ts          # Game history
│
├── services/
│   ├── socketService.ts           # Socket.IO (unchanged)
│   ├── pocketbaseService.ts       # PocketBase API wrapper
│   ├── gameService.ts             # Hybrid game logic
│   ├── statsService.ts            # Statistics calculations
│   └── achievementService.ts      # Achievement logic
│
└── types/
    ├── game.ts                    # Game types (unchanged)
    ├── user.ts                    # User/auth types
    ├── stats.ts                   # Statistics types
    └── achievement.ts             # Achievement types
```

---

## 🔧 PocketBase Service Implementation

```typescript
// services/pocketbaseService.ts
import PocketBase from 'pocketbase';

class PocketBaseService {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase('https://your-pocketbase-url.com');
  }

  // ============ USERS ============
  async getUser(userId: string) {
    return await this.pb.collection('users').getOne(userId);
  }

  async updateUserStats(userId: string, updates: Record<string, string>) {
    return await this.pb.collection('users').update(userId, updates);
  }

  async uploadAvatar(userId: string, file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return await this.pb.collection('users').update(userId, formData);
  }

  // ============ GAMES ============
  async createGame(gameData: any) {
    return await this.pb.collection('games').create(gameData);
  }

  async getGameHistory(userId: string, limit = 20, page = 1) {
    return await this.pb.collection('games').getList(page, limit, {
      filter: `players ~ "${userId}"`,
      sort: '-completedAt',
      expand: 'players,winner',
    });
  }

  async getGame(gameId: string) {
    return await this.pb.collection('games').getOne(gameId, {
      expand: 'players,winner',
    });
  }

  // ============ ACHIEVEMENTS ============
  async getAllAchievements() {
    return await this.pb.collection('achievements').getFullList({
      sort: 'category,requirement',
    });
  }

  async getUserAchievements(userId: string) {
    return await this.pb.collection('userAchievements').getFullList({
      filter: `user="${userId}"`,
      expand: 'achievement',
    });
  }

  async unlockAchievement(userId: string, achievementKey: string) {
    // Find achievement
    const achievements = await this.pb.collection('achievements').getFullList({
      filter: `key="${achievementKey}"`,
    });

    if (achievements.length === 0) return null;

    const achievement = achievements[0];

    // Check if already unlocked
    const existing = await this.pb.collection('userAchievements').getFullList({
      filter: `user="${userId}" && achievement="${achievement.id}"`,
    });

    if (existing.length > 0) return existing[0];

    // Unlock it
    return await this.pb.collection('userAchievements').create({
      user: userId,
      achievement: achievement.id,
      unlockedAt: new Date().toISOString(),
      progress: achievement.requirement,
    });
  }

  // ============ LEADERBOARD ============
  async getLeaderboard(type: 'wins' | 'score' | 'level', limit = 50) {
    const sortField = type === 'wins' ? '-totalWins' : 
                      type === 'score' ? '-totalScore' : '-level';

    return await this.pb.collection('users').getList(1, limit, {
      sort: sortField,
      fields: 'id,username,displayName,avatar,totalWins,totalScore,level',
    });
  }

  async getUserRank(userId: string, type: 'wins' | 'score' | 'level') {
    const user = await this.getUser(userId);
    const field = type === 'wins' ? 'totalWins' : 
                  type === 'score' ? 'totalScore' : 'level';
    
    const value = user[field];

    // Count users with higher value
    const result = await this.pb.collection('users').getList(1, 1, {
      filter: `${field} > ${value}`,
    });

    return result.totalItems + 1; // Rank is count + 1
  }

  // ============ FRIENDS ============
  async sendFriendRequest(fromUserId: string, toUsername: string) {
    // Find user by username
    const users = await this.pb.collection('users').getFullList({
      filter: `username="${toUsername}"`,
    });

    if (users.length === 0) throw new Error('User not found');

    const toUser = users[0];

    // Check if already friends or pending
    const existing = await this.pb.collection('friends').getFullList({
      filter: `(user="${fromUserId}" && friend="${toUser.id}") || (user="${toUser.id}" && friend="${fromUserId}")`,
    });

    if (existing.length > 0) throw new Error('Friend request already exists');

    return await this.pb.collection('friends').create({
      user: fromUserId,
      friend: toUser.id,
      status: 'pending',
    });
  }

  async acceptFriendRequest(requestId: string) {
    return await this.pb.collection('friends').update(requestId, {
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
    });
  }

  async getFriends(userId: string) {
    return await this.pb.collection('friends').getFullList({
      filter: `(user="${userId}" || friend="${userId}") && status="accepted"`,
      expand: 'user,friend',
    });
  }

  async getPendingRequests(userId: string) {
    return await this.pb.collection('friends').getFullList({
      filter: `friend="${userId}" && status="pending"`,
      expand: 'user',
    });
  }

  // ============ GAME INVITES ============
  async sendGameInvite(fromUserId: string, toUserId: string, roomCode: string, gameMode: string) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 min expiry

    return await this.pb.collection('gameInvites').create({
      from: fromUserId,
      to: toUserId,
      roomCode,
      gameMode,
      status: 'pending',
      expiresAt: expiresAt.toISOString(),
    });
  }

  async getActiveInvites(userId: string) {
    return await this.pb.collection('gameInvites').getFullList({
      filter: `to="${userId}" && status="pending" && expiresAt > "${new Date().toISOString()}"`,
      expand: 'from',
    });
  }

  async acceptInvite(inviteId: string) {
    return await this.pb.collection('gameInvites').update(inviteId, {
      status: 'accepted',
    });
  }

  // ============ REALTIME SUBSCRIPTIONS ============
  subscribeToInvites(userId: string, callback: (data: any) => void) {
    return this.pb.collection('gameInvites').subscribe('*', (e) => {
      if (e.record.to === userId && e.record.status === 'pending') {
        callback(e.record);
      }
    });
  }

  subscribeToFriendRequests(userId: string, callback: (data: any) => void) {
    return this.pb.collection('friends').subscribe('*', (e) => {
      if (e.record.friend === userId && e.record.status === 'pending') {
        callback(e.record);
      }
    });
  }
}

export const pocketbaseService = new PocketBaseService();
```

---

## 🎨 New Screens

### Profile Screen

```typescript
// app/(tabs)/profile.tsx
import { useAuth } from '../../hooks/useAuth';
import { useStats } from '../../hooks/useStats';
import { useAchievements } from '../../hooks/useAchievements';

export default function ProfileScreen() {
  const { user, signOut, updateProfile } = useAuth();
  const { stats } = useStats(user?.id);
  const { achievements, unlockedCount, totalCount } = useAchievements(user?.id);

  const winRate = stats ? (stats.totalWins / stats.totalGames * 100).toFixed(1) : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AvatarUpload
          uri={user?.avatar}
          onUpload={(file) => updateProfile({ avatar: file })}
        />
        <Text style={styles.displayName}>{user?.displayName}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
        
        <LevelProgress 
          level={user?.level} 
          experience={user?.experience}
        />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatsCard title="Games" value={stats?.totalGames || 0} />
        <StatsCard title="Wins" value={stats?.totalWins || 0} />
        <StatsCard title="Win Rate" value={`${winRate}%`} />
        <StatsCard title="Total Score" value={stats?.totalScore || 0} />
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Achievements ({unlockedCount}/{totalCount})
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {achievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              unlocked={achievement.unlocked}
            />
          ))}
        </ScrollView>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <SettingToggle
          label="Sound Effects"
          value={user?.soundEnabled}
          onChange={(v) => updateProfile({ soundEnabled: v })}
        />
        <SettingToggle
          label="Background Music"
          value={user?.musicEnabled}
          onChange={(v) => updateProfile({ musicEnabled: v })}
        />
        <SettingToggle
          label="Vibration"
          value={user?.vibrationEnabled}
          onChange={(v) => updateProfile({ vibrationEnabled: v })}
        />
      </View>

      <Button title="Sign Out" onPress={signOut} />
    </ScrollView>
  );
}
```

### Leaderboard Screen

```typescript
// app/(tabs)/leaderboard.tsx
import { useLeaderboard } from '../../hooks/useLeaderboard';

export default function LeaderboardScreen() {
  const [filter, setFilter] = useState<'wins' | 'score' | 'level'>('wins');
  const { leaders, myRank, isLoading } = useLeaderboard(filter);

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <FilterTabs
        options={['Wins', 'Score', 'Level']}
        selected={filter}
        onChange={setFilter}
      />

      {/* My Rank */}
      <View style={styles.myRank}>
        <Text>Your Rank: #{myRank}</Text>
      </View>

      {/* Leaderboard List */}
      <FlatList
        data={leaders}
        renderItem={({ item, index }) => (
          <PlayerRank
            rank={index + 1}
            player={item}
            highlightMe={item.id === user?.id}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
```

### Game History Screen

```typescript
// app/history/index.tsx
import { useGameHistory } from '../../hooks/useGameHistory';

export default function GameHistoryScreen() {
  const { games, isLoading, loadMore } = useGameHistory();

  return (
    <FlatList
      data={games}
      renderItem={({ item }) => (
        <GameHistoryCard
          game={item}
          onPress={() => router.push(`/history/${item.id}`)}
        />
      )}
      keyExtractor={(item) => item.id}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
    />
  );
}
```

### Game Replay Screen

```typescript
// app/history/[gameId].tsx
import { useLocalSearchParams } from 'expo-router';
import { useGameReplay