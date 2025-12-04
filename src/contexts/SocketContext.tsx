// contexts/SocketContext.tsx - Socket.io context

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { socketService, SocketEventCallback } from '../services/socket/client';
import { useAuth } from './AuthContext';
import type { Player, GameState, Line, Square } from '../types/game';

interface SocketContextValue {
  isConnected: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  joinRoom: (roomCode: string, roomId: string) => void;
  leaveRoom: () => void;
  startGame: () => void;
  makeMove: (dot1Id: number, dot2Id: number) => void;
  requestPlayAgain: () => void;
  acceptPlayAgain: () => void;
  setEventCallbacks: (callbacks: SocketEventCallback) => void;
  currentRoomCode: string | null;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { isAuthenticated, getToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);

  // Connect to socket server
  const connect = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.warn('No auth token available for socket connection');
      return false;
    }

    const connected = await socketService.connect(token);
    setIsConnected(connected);
    return connected;
  }, [getToken]);

  // Disconnect from socket server
  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    setCurrentRoomCode(null);
  }, []);

  // Join a room
  const joinRoom = useCallback((roomCode: string, roomId: string) => {
    socketService.joinRoom(roomCode, roomId);
    setCurrentRoomCode(roomCode);
  }, []);

  // Leave current room
  const leaveRoom = useCallback(() => {
    socketService.leaveRoom();
    setCurrentRoomCode(null);
  }, []);

  // Start game
  const startGame = useCallback(() => {
    socketService.startGame();
  }, []);

  // Make a move
  const makeMove = useCallback((dot1Id: number, dot2Id: number) => {
    socketService.makeMove(dot1Id, dot2Id);
  }, []);

  // Request play again
  const requestPlayAgain = useCallback(() => {
    socketService.requestPlayAgain();
  }, []);

  // Accept play again
  const acceptPlayAgain = useCallback(() => {
    socketService.acceptPlayAgain();
  }, []);

  // Set event callbacks
  const setEventCallbacks = useCallback((callbacks: SocketEventCallback) => {
    socketService.setCallbacks({
      ...callbacks,
      onConnect: () => {
        setIsConnected(true);
        callbacks.onConnect?.();
      },
      onDisconnect: (reason) => {
        setIsConnected(false);
        callbacks.onDisconnect?.(reason);
      },
    });
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      // Cleanup on unmount
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  const value: SocketContextValue = {
    isConnected,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    startGame,
    makeMove,
    requestPlayAgain,
    acceptPlayAgain,
    setEventCallbacks,
    currentRoomCode,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;

