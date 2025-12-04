# Connect Four (Dots & Boxes) - React Native Expo Design Document

## 📋 Executive Summary

This document outlines the architecture and implementation plan for rebuilding the Connect Four (Dots & Boxes) multiplayer game in React Native using Expo. The MVP focuses on core gameplay without voice call functionality.

---

## 🎮 Game Overview

### What is this game?
This is a **Dots and Boxes** game where:
- Players take turns connecting adjacent dots on a grid
- When a player completes all 4 sides of a square, they score a point and get another turn
- The game ends when all squares are filled
- The player with the most completed squares wins

### Current Features (Web Version)
| Feature | MVP Status |
|---------|------------|
| Room Creation/Joining | ✅ Include |
| 2-Player Mode (1vs1) | ✅ Include |
| 3-Player Mode | ✅ Include |
| Real-time Multiplayer | ✅ Include |
| Turn-based Gameplay | ✅ Include |
| Score Tracking | ✅ Include |
| Winner Detection | ✅ Include |
| Play Again | ✅ Include |
| Sound Effects | ✅ Include |
| Background Music | ✅ Include |
| Device Vibration | ✅ Include |
| Voice Chat | ❌ Exclude (MVP) |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        REACT NATIVE APP                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Screens   │  │ Components  │  │   Hooks     │  │   Context   │ │
│  │  ─────────  │  │  ─────────  │  │  ─────────  │  │  ─────────  │ │
│  │ HomeScreen  │  │ GameBoard   │  │ useSocket   │  │ GameContext │ │
│  │ LobbyScreen │  │ Dot         │  │ useGame     │  │ SoundContext│ │
│  │ GameScreen  │  │ Line        │  │ useSound    │  │             │ │
│  │             │  │ Square      │  │ useVibration│  │             │ │
│  │             │  │ ScoreBoard  │  │             │  │             │ │
│  │             │  │ PlayerInfo  │  │             │  │             │ │
│  │             │  │ Toast       │  │             │  │             │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                         SOCKET.IO CLIENT                            │
├─────────────────────────────────────────────────────────────────────┤
│                         EXPRESS + SOCKET.IO SERVER                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
connect-four-mobile/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout with providers
│   ├── index.tsx                 # Home screen
│   ├── lobby.tsx                 # Lobby/waiting room
│   └── game.tsx                  # Main game screen
│
├── components/
│   ├── game/
│   │   ├── GameBoard.tsx         # Main game board container
│   │   ├── Dot.tsx               # Individual dot component
│   │   ├── Line.tsx              # Line between dots
│   │   ├── Square.tsx            # Completed square overlay
│   │   └── GameCanvas.tsx        # SVG canvas for lines
│   │
│   ├── ui/
│   │   ├── Button.tsx            # Reusable button
│   │   ├── Input.tsx             # Reusable input
│   │   ├── Toast.tsx             # Notification toast
│   │   ├── Modal.tsx             # Modal component
│   │   └── LoadingSpinner.tsx    # Loading indicator
│   │
│   ├── ScoreBoard.tsx            # Player scores display
│   ├── PlayerInfo.tsx            # Turn indicator & player status
│   ├── RoomConfig.tsx            # Room configuration modal
│   └── GameControls.tsx          # Sound/music toggle buttons
│
├── contexts/
│   ├── GameContext.tsx           # Game state management
│   ├── SocketContext.tsx         # Socket.io connection
│   └── SoundContext.tsx          # Audio management
│
├── hooks/
│   ├── useSocket.ts              # Socket.io logic
│   ├── useGame.ts                # Game logic
│   ├── useSound.ts               # Sound effects
│   └── useVibration.ts           # Device vibration
│
├── services/
│   ├── socketService.ts          # Socket.io service layer
│   └── gameLogic.ts              # Core game calculations
│
├── types/
│   └── index.ts                  # TypeScript types
│
├── constants/
│   ├── colors.ts                 # Color palette
│   ├── sounds.ts                 # Sound file paths
│   └── config.ts                 # Game configuration
│
├── assets/
│   ├── sounds/
│   │   ├── join.mp3
│   │   ├── error.mp3
│   │   ├── complete-square.mp3
│   │   ├── winner.mp3
│   │   └── background.mp3
│   │
│   ├── images/
│   │   └── shapes/               # Dot shape images
│   │
│   └── fonts/
│       └── LowerEastSide.ttf
│
├── utils/
│   ├── helpers.ts                # Utility functions
│   └── validators.ts             # Input validation
│
├── app.json                      # Expo configuration
├── package.json
└── tsconfig.json
```

---

## 📊 Data Models & Types

### TypeScript Types

```typescript
// types/index.ts

// ============ PLAYER ============
export interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
  isOwner: boolean;
  isConnected: boolean;
}

// ============ DOT ============
export interface Dot {
  id: number;
  x: number;
  y: number;
  row: number;
  col: number;
  connectedTo: number[]; // IDs of dots this is connected to
}

// ============ LINE ============
export interface Line {
  id: string;
  dot1Id: number;
  dot2Id: number;
  playerId: string;
  color: string;
}

// ============ SQUARE ============
export interface Square {
  id: number;
  topLeftDotId: number;
  isComplete: boolean;
  completedBy: string | null; // Player ID
  color: string | null;
  lines: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
}

// ============ GAME STATE ============
export interface GameState {
  roomCode: string;
  gameMode: '1vs1' | 'game'; // 2 players or 3 players
  players: Player[];
  dots: Dot[];
  lines: Line[];
  squares: Square[];
  currentTurnPlayerId: string | null;
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: Player | null;
  isDraw: boolean;
}

// ============ ROOM CONFIG ============
export interface RoomConfig {
  playerName: string;
  gameMode: '1vs1' | 'game';
}

// ============ SOCKET EVENTS ============
export type SocketEvents = {
  // Client -> Server
  'get-code': void;
  'user-name': {
    name: string;
    room: string;
    creator: boolean;
  };
  'circles-to-join': {
    circles: { id: number; x: number; y: number }[];
    name: string;
    room: string;
    color: string;
  };
  'players-info': {
    room: string;
    data: { userName: string; num: number }[];
  };
  'play-again-confirmation': {
    confirmation: boolean;
    name: string;
  };
  'reset-game': void;
  
  // Server -> Client
  'code': { code: string };
  'new-player': {
    name: string;
    room: string;
    creator: boolean;
  };
  'receive-players-info': { userName: string; num: number }[];
  'circles-to-join': {
    circles: { id: number; x: number; y: number }[];
    name: string;
    color: string;
  };
  'oponent-disconnected': string;
  'acept-match': string;
  'play-again': boolean;
  'new-game': void;
  'room-full': void;
};

// ============ TOAST TYPES ============
export type ToastType = 
  | 'connect'
  | 'disconnect'
  | 'not-turn'
  | 'choose-another'
  | 'invalid-move'
  | 'already-join'
  | 'winner'
  | 'draw'
  | 'wait-host'
  | 'room-full'
  | 'play-again-request';
```

---

## 🎨 Screen Designs

### Screen 1: Home Screen

```
┌────────────────────────────────────┐
│                                    │
│         Connect Four               │
│         ───────────               │
│                                    │
│  ┌──────────────────────────────┐  │
│  │      CREATE A ROOM           │  │
│  │  ┌────────────────────────┐  │  │
│  │  │ Generated Code Here    │  │  │
│  │  └────────────────────────┘  │  │
│  │  [ Generate Code ]           │  │
│  │  [ Join Your Room ]          │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │      JOIN A ROOM             │  │
│  │  ┌────────────────────────┐  │  │
│  │  │ Enter Your Name        │  │  │
│  │  └────────────────────────┘  │  │
│  │  ┌────────────────────────┐  │  │
│  │  │ Enter Room Code        │  │  │
│  │  └────────────────────────┘  │  │
│  │  [ Join Room ]               │  │
│  └──────────────────────────────┘  │
│                                    │
│  [ How To Play ]                   │
│                                    │
└────────────────────────────────────┘
```

### Screen 2: Room Configuration Modal

```
┌────────────────────────────────────┐
│                                    │
│      ROOM CONFIGURATION            │
│      ──────────────────           │
│                                    │
│  Name:                             │
│  ┌────────────────────────────┐   │
│  │ Enter Your Name            │   │
│  └────────────────────────────┘   │
│                                    │
│  Number of Players:                │
│  ┌─────────┐   ┌─────────┐        │
│  │ ○ 2     │   │ ○ 3     │        │
│  └─────────┘   └─────────┘        │
│                                    │
│         [ Create Room ]            │
│                                    │
└────────────────────────────────────┘
```

### Screen 3: Game Screen

```
┌────────────────────────────────────┐
│ 🔊  🎵                             │
│                                    │
│  ┌────────────────────────────┐   │
│  │ Player1: 5  Player2: 3     │   │
│  └────────────────────────────┘   │
│                                    │
│  ┌────────────────────────────┐   │
│  │  ●──●──●──●──●──●──●──●──● │   │
│  │  │  │  │  │  │  │  │  │  │ │   │
│  │  ●──●──●──●──●──●──●──●──● │   │
│  │  │  │  │  │  │  │  │  │  │ │   │
│  │  ●──●──●──●──●──●──●──●──● │   │
│  │  │  │  │  │  │  │  │  │  │ │   │
│  │  ●──●──●──●──●──●──●──●──● │   │
│  │  │  │  │  │  │  │  │  │  │ │   │
│  │  ●──●──●──●──●──●──●──●──● │   │
│  │  │  │  │  │  │  │  │  │  │ │   │
│  │  ●──●──●──●──●──●──●──●──● │   │
│  │  │  │  │  │  │  │  │  │  │ │   │
│  │  ●──●──●──●──●──●──●──●──● │   │
│  │  │  │  │  │  │  │  │  │  │ │   │
│  │  ●──●──●──●──●──●──●──●──● │   │
│  └────────────────────────────┘   │
│                                    │
│  ┌────────────────────────────┐   │
│  │ Me(John) ✓    | Your Turn  │   │
│  │ Player2  ✓    | Waiting... │   │
│  └────────────────────────────┘   │
│                                    │
└────────────────────────────────────┘
```

---

## ⚙️ Core Game Logic

### Game Board Initialization

```typescript
// services/gameLogic.ts

const GRID_SIZE = 9; // 9x9 grid of dots
const DOT_SPACING = 40; // pixels between dots

export function initializeBoard(): { dots: Dot[]; squares: Square[] } {
  const dots: Dot[] = [];
  const squares: Square[] = [];
  
  // Create dots
  let dotId = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      dots.push({
        id: dotId,
        x: col * DOT_SPACING + 10,
        y: row * DOT_SPACING + 10,
        row,
        col,
        connectedTo: [],
      });
      dotId++;
    }
  }
  
  // Create squares (8x8 grid of squares for 9x9 dots)
  let squareId = 0;
  for (let row = 0; row < GRID_SIZE - 1; row++) {
    for (let col = 0; col < GRID_SIZE - 1; col++) {
      const topLeftDotId = row * GRID_SIZE + col;
      squares.push({
        id: squareId,
        topLeftDotId,
        isComplete: false,
        completedBy: null,
        color: null,
        lines: {
          top: false,
          right: false,
          bottom: false,
          left: false,
        },
      });
      squareId++;
    }
  }
  
  return { dots, squares };
}
```

### Line Connection Validation

```typescript
export function canConnectDots(dot1: Dot, dot2: Dot, lines: Line[]): boolean {
  // Check if already connected
  if (dot1.connectedTo.includes(dot2.id)) {
    return false;
  }
  
  // Must be adjacent (horizontally or vertically, not diagonal)
  const isHorizontalAdjacent = 
    dot1.row === dot2.row && Math.abs(dot1.col - dot2.col) === 1;
  const isVerticalAdjacent = 
    dot1.col === dot2.col && Math.abs(dot1.row - dot2.row) === 1;
  
  return isHorizontalAdjacent || isVerticalAdjacent;
}
```

### Square Completion Check

```typescript
export function checkSquareCompletion(
  squares: Square[],
  dot1Id: number,
  dot2Id: number,
  playerId: string,
  playerColor: string,
  gridSize: number
): { updatedSquares: Square[]; completedCount: number } {
  const updatedSquares = [...squares];
  let completedCount = 0;
  
  // Find which squares this line belongs to
  const affectedSquareIds = getAffectedSquares(dot1Id, dot2Id, gridSize);
  
  for (const squareId of affectedSquareIds) {
    const square = updatedSquares[squareId];
    if (!square || square.isComplete) continue;
    
    // Update the appropriate line in the square
    updateSquareLine(square, dot1Id, dot2Id, gridSize);
    
    // Check if all 4 sides are complete
    const { top, right, bottom, left } = square.lines;
    if (top && right && bottom && left) {
      square.isComplete = true;
      square.completedBy = playerId;
      square.color = playerColor;
      completedCount++;
    }
  }
  
  return { updatedSquares, completedCount };
}
```

### Turn Management

```typescript
export function getNextPlayer(
  players: Player[],
  currentPlayerId: string,
  completedSquare: boolean
): string {
  // If player completed a square, they go again
  if (completedSquare) {
    return currentPlayerId;
  }
  
  // Otherwise, move to next player
  const currentIndex = players.findIndex(p => p.id === currentPlayerId);
  const nextIndex = (currentIndex + 1) % players.length;
  return players[nextIndex].id;
}
```

### Winner Detection

```typescript
export function checkWinner(
  players: Player[],
  squares: Square[]
): { winner: Player | null; isDraw: boolean } {
  // Check if all squares are complete
  const allComplete = squares.every(s => s.isComplete);
  
  if (!allComplete) {
    return { winner: null, isDraw: false };
  }
  
  // Count scores
  const scores = players.map(p => ({
    player: p,
    score: squares.filter(s => s.completedBy === p.id).length,
  }));
  
  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  
  // Check for draw
  if (scores[0].score === scores[1].score) {
    return { winner: null, isDraw: true };
  }
  
  return { winner: scores[0].player, isDraw: false };
}
```

---

## 🔌 Socket.io Integration

### Socket Service

```typescript
// services/socketService.ts
import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://your-server-url:3000';

class SocketService {
  private socket: Socket | null = null;
  
  connect(): Socket {
    if (!this.socket) {
      this.socket = io(SERVER_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });
    }
    return this.socket;
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  getSocket(): Socket | null {
    return this.socket;
  }
  
  // Room management
  requestRoomCode(): void {
    this.socket?.emit('get-code', true);
  }
  
  joinRoom(name: string, room: string, isCreator: boolean): void {
    this.socket?.emit('user-name', { name, room, creator: isCreator });
  }
  
  // Game actions
  makeMove(
    circles: { id: number; x: number; y: number }[],
    name: string,
    room: string,
    color: string
  ): void {
    this.socket?.emit('circles-to-join', { circles, name, room, color });
  }
  
  requestPlayAgain(name: string): void {
    this.socket?.emit('play-again-confirmation', { confirmation: true, name });
  }
  
  resetGame(): void {
    this.socket?.emit('reset-game', true);
  }
}

export const socketService = new SocketService();
```

### Socket Context

```typescript
// contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '../services/socketService';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  roomCode: string | null;
  requestRoomCode: () => void;
  joinRoom: (name: string, room: string, isCreator: boolean) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  useEffect(() => {
    const sock = socketService.connect();
    setSocket(sock);

    sock.on('connect', () => setIsConnected(true));
    sock.on('disconnect', () => setIsConnected(false));
    sock.on('code', ({ code }) => {
      // Extract room code (remove UUID suffix)
      const cleanCode = code.split('-')[0].slice(0, -2);
      setRoomCode(cleanCode);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const requestRoomCode = () => socketService.requestRoomCode();
  const joinRoom = (name: string, room: string, isCreator: boolean) => 
    socketService.joinRoom(name, room, isCreator);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      roomCode,
      requestRoomCode,
      joinRoom,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
```

---

## 🎵 Sound & Haptic Feedback

### Sound Hook

```typescript
// hooks/useSound.ts
import { Audio } from 'expo-av';
import { useCallback, useRef } from 'react';

const SOUNDS = {
  join: require('../assets/sounds/join.mp3'),
  error: require('../assets/sounds/error.mp3'),
  completeSquare: require('../assets/sounds/complete-square.mp3'),
  winner: require('../assets/sounds/winner.mp3'),
  background: require('../assets/sounds/background.mp3'),
};

export function useSound() {
  const backgroundMusicRef = useRef<Audio.Sound | null>(null);
  const soundEnabled = useRef(true);
  const musicEnabled = useRef(true);

  const playSound = useCallback(async (soundName: keyof typeof SOUNDS) => {
    if (!soundEnabled.current) return;
    
    try {
      const { sound } = await Audio.Sound.createAsync(SOUNDS[soundName]);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, []);

  const playBackgroundMusic = useCallback(async () => {
    if (!musicEnabled.current) return;
    
    try {
      const { sound } = await Audio.Sound.createAsync(SOUNDS.background, {
        isLooping: true,
        volume: 0.6,
      });
      backgroundMusicRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  }, []);

  const stopBackgroundMusic = useCallback(async () => {
    if (backgroundMusicRef.current) {
      await backgroundMusicRef.current.stopAsync();
      await backgroundMusicRef.current.unloadAsync();
      backgroundMusicRef.current = null;
    }
  }, []);

  const toggleSound = useCallback(() => {
    soundEnabled.current = !soundEnabled.current;
    return soundEnabled.current;
  }, []);

  const toggleMusic = useCallback(async () => {
    musicEnabled.current = !musicEnabled.current;
    if (musicEnabled.current) {
      await playBackgroundMusic();
    } else {
      await stopBackgroundMusic();
    }
    return musicEnabled.current;
  }, [playBackgroundMusic, stopBackgroundMusic]);

  return {
    playSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    toggleSound,
    toggleMusic,
  };
}
```

### Vibration Hook

```typescript
// hooks/useVibration.ts
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

export function useVibration() {
  const vibrate = useCallback((type: 'light' | 'medium' | 'heavy' | 'error' = 'medium') => {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  }, []);

  return { vibrate };
}
```

---

## 🧩 Key Components

### GameBoard Component

```typescript
// components/game/GameBoard.tsx
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line as SvgLine } from 'react-native-svg';
import { Dot } from './Dot';
import { Square } from './Square';
import { useGame } from '../../hooks/useGame';
import { useSound } from '../../hooks/useSound';
import { useVibration } from '../../hooks/useVibration';

const GRID_SIZE = 9;
const SCREEN_WIDTH = Dimensions.get('window').width;
const BOARD_SIZE = SCREEN_WIDTH - 40;
const DOT_SPACING = BOARD_SIZE / (GRID_SIZE - 1);

export function GameBoard() {
  const { 
    dots, 
    lines, 
    squares, 
    isMyTurn, 
    selectDot,
    selectedDot,
  } = useGame();
  const { playSound } = useSound();
  const { vibrate } = useVibration();

  const handleDotPress = (dotId: number) => {
    if (!isMyTurn) {
      playSound('error');
      vibrate('error');
      return;
    }
    selectDot(dotId);
  };

  return (
    <View style={styles.container}>
      {/* Render completed squares */}
      {squares.filter(s => s.isComplete).map(square => (
        <Square key={square.id} square={square} dotSpacing={DOT_SPACING} />
      ))}
      
      {/* Render lines using SVG */}
      <Svg style={StyleSheet.absoluteFill}>
        {lines.map(line => {
          const dot1 = dots.find(d => d.id === line.dot1Id)!;
          const dot2 = dots.find(d => d.id === line.dot2Id)!;
          return (
            <SvgLine
              key={line.id}
              x1={dot1.x}
              y1={dot1.y}
              x2={dot2.x}
              y2={dot2.y}
              stroke={line.color}
              strokeWidth={5}
            />
          );
        })}
      </Svg>
      
      {/* Render dots */}
      {dots.map(dot => (
        <Dot
          key={dot.id}
          dot={dot}
          isSelected={selectedDot?.id === dot.id}
          onPress={() => handleDotPress(dot.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    position: 'relative',
  },
});
```

### Dot Component

```typescript
// components/game/Dot.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Dot as DotType } from '../../types';

interface DotProps {
  dot: DotType;
  isSelected: boolean;
  onPress: () => void;
}

export function Dot({ dot, isSelected, onPress }: DotProps) {
  const animatedScale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(animatedScale, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(animatedScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSelected]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.dot,
        {
          left: dot.x - 10,
          top: dot.y - 10,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.dotInner,
          isSelected && styles.dotSelected,
          { transform: [{ scale: animatedScale }] },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#333',
  },
  dotSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
});
```

---

## 📱 Navigation Flow

```
┌─────────────────┐
│   HomeScreen    │
│                 │
│ • Create Room   │──────┐
│ • Join Room     │──────┤
└─────────────────┘      │
                         ▼
              ┌─────────────────────┐
              │ Room Config Modal   │
              │                     │
              │ • Enter Name        │
              │ • Select Players    │
              │ • Create/Join       │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │    GameScreen       │
              │                     │
              │ • Waiting for       │
              │   players           │
              │ • Playing           │
              │ • Game Over         │
              └──────────┬──────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
    ┌─────────────────┐   ┌─────────────────┐
    │   Play Again    │   │   Go Home       │
    │   (same room)   │   │                 │
    └─────────────────┘   └─────────────────┘
```

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-av": "~13.10.0",
    "expo-haptics": "~12.8.0",
    "expo-router": "~3.4.0",
    "expo-status-bar": "~1.11.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "react-native-svg": "14.1.0",
    "socket.io-client": "^4.7.0",
    "@react-native-async-storage/async-storage": "1.21.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "typescript": "^5.1.3"
  }
}
```

---

## 🎨 Styling Constants

```typescript
// constants/colors.ts
export const COLORS = {
  // Primary palette
  primary: '#302b63',
  primaryLight: '#24243e',
  primaryDark: '#0f0c29',
  
  // Background
  background: '#001029',
  backgroundPattern: '#001029',
  
  // Player colors
  player1: '#BF214B',
  player2: '#0E6973',
  player3: '#D96704',
  
  // UI colors
  white: '#FFFFFF',
  black: '#000000',
  gold: '#FFD700',
  gray: '#808080',
  
  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
};

// constants/config.ts
export const GAME_CONFIG = {
  GRID_SIZE: 9,
  DOT_SPACING: 40,
  MAX_NAME_LENGTH: 8,
  TOAST_DURATION: {
    default: 1000,
    winner: 3000,
    waitHost: 5000,
    roomFull: 15000,
  },
};
```

---

## 🔄 State Management Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          GameContext                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  State:                                                              │
│  ├── gameState: GameState                                           │
│  ├── selectedDot: Dot | null                                        │
│  ├── isMyTurn: boolean                                              │
│  └── myPlayer: Player                                               │
│                                                                      │
│  Actions:                                                            │
│  ├── initGame(roomCode, gameMode)                                   │
│  ├── selectDot(dotId)                                               │
│  ├── connectDots(dot1Id, dot2Id)                                    │
│  ├── handleOpponentMove(moveData)                                   │
│  ├── updatePlayers(playersData)                                     │
│  ├── resetGame()                                                    │
│  └── requestPlayAgain()                                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ dispatches
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Socket Events                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Outgoing:                       │  Incoming:                        │
│  ├── circles-to-join            │  ├── new-player                   │
│  ├── players-info               │  ├── receive-players-info         │
│  ├── play-again-confirmation    │  ├── circles-to-join              │
│  └── reset-game                 │  ├── oponent-disconnected         │
│                                  │  ├── new-game                     │
│                                  │  └── play-again                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Strategy

### Unit Tests
- Game logic functions (initializeBoard, canConnectDots, checkSquareCompletion)
- Utility functions (validators, helpers)
- State management reducers

### Integration Tests
- Socket.io event handlers
- Navigation flows
- Context providers

### E2E Tests (Detox)
- Complete game flow: create room → join → play → win → play again
- Error scenarios: invalid moves, disconnections
- Multi-player synchronization

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Project setup with Expo Router
- [ ] TypeScript types definition
- [ ] Basic navigation structure
- [ ] Home screen UI
- [ ] Socket.io connection setup

### Phase 2: Game Core (Week 2)
- [ ] GameBoard component with dots
- [ ] Touch handling for dot selection
- [ ] Line rendering with SVG
- [ ] Square completion detection
- [ ] Turn management

### Phase 3: Multiplayer (Week 3)
- [ ] Room creation and joining
- [ ] Real-time move synchronization
- [ ] Player connection/disconnection handling
- [ ] Score synchronization

### Phase 4: Polish (Week 4)
- [ ] Sound effects integration
- [ ] Haptic feedback
- [ ] Toast notifications
- [ ] Winner/draw screens
- [ ] Play again functionality
- [ ] UI animations

### Phase 5: Testing & Launch (Week 5)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] App store preparation

---

## 📝 Notes

### Server Requirements
The existing Node.js/Express server with Socket.io can be reused with minimal modifications. Ensure CORS is configured for mobile clients.

### Responsive Design
The game board should scale based on device screen size while maintaining a square aspect ratio.

### Offline Handling
Show appropriate error states when network connectivity is lost.

### Localization
UI text is currently in Spanish. Consider implementing i18n for future language support.

---

*Document Version: 1.0*
*Last Updated: December 2024*

