// contexts/GameContext.tsx - Game state context

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { initializeBoard } from '../services/game/board';
import { gameStorage } from '../utils/storage';
import { GAME_CONFIG } from '../constants/game';
import type {
  GameState,
  Player,
  Dot,
  Line,
  Square,
  GameMode,
} from '../types/game';

interface GameContextValue {
  gameState: GameState | null;
  isMyTurn: boolean;
  myPlayer: Player | null;
  selectedDot: Dot | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initGame: (roomCode: string, roomId: string, gameMode: GameMode) => void;
  selectDot: (dot: Dot) => void;
  clearSelection: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
  boardSize?: number;
}

export function GameProvider({ children, boardSize = 350 }: GameProviderProps) {
  const { user } = useAuth();
  const { setEventCallbacks, makeMove } = useSocket();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedDot, setSelectedDot] = useState<Dot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate derived values
  const myPlayer = gameState?.players.find((p) => p.id === user?.id) ?? null;
  const isMyTurn = gameState?.currentTurnPlayerId === user?.id;

  // Initialize a new game
  const initGame = useCallback(
    (roomCode: string, roomId: string, gameMode: GameMode) => {
      const { dots, squares } = initializeBoard(boardSize);

      const initialState: GameState = {
        roomCode,
        roomId,
        gameMode,
        status: 'waiting',
        players: [],
        dots,
        lines: [],
        squares,
        currentTurnPlayerId: null,
        winner: null,
        isDraw: false,
        moveCount: 0,
        startedAt: null,
      };

      setGameState(initialState);
      setSelectedDot(null);
      setError(null);
    },
    [boardSize]
  );

  // Handle dot selection - optimized for fast response
  const selectDot = useCallback(
    (dot: Dot) => {
      if (!gameState || gameState.status !== 'playing' || !isMyTurn) {
        return;
      }

      if (!selectedDot) {
        // First dot selected
        setSelectedDot(dot);
        return;
      }

      // Same dot clicked - deselect
      if (selectedDot.id === dot.id) {
        setSelectedDot(null);
        return;
      }

      // Check if move is valid (adjacent)
      const isHorizontal =
        selectedDot.row === dot.row &&
        Math.abs(selectedDot.col - dot.col) === 1;
      const isVertical =
        selectedDot.col === dot.col &&
        Math.abs(selectedDot.row - dot.row) === 1;
      const isAdjacent = isHorizontal || isVertical;

      if (isAdjacent) {
        // Adjacent dot - check if not already connected
        if (!selectedDot.connectedTo.includes(dot.id)) {
          // Valid move - make it
          makeMove(selectedDot.id, dot.id);
          setSelectedDot(null);
        } else {
          // Already connected - switch selection to this dot
          setSelectedDot(dot);
        }
      } else {
        // Not adjacent - switch selection to this dot
        setSelectedDot(dot);
      }
    },
    [gameState, isMyTurn, selectedDot, makeMove]
  );

  // Clear dot selection
  const clearSelection = useCallback(() => {
    setSelectedDot(null);
  }, []);

  // Reset game state
  const resetGame = useCallback(() => {
    setGameState(null);
    setSelectedDot(null);
    setError(null);
    setIsLoading(false);
  }, []);

  // Setup socket event listeners
  useEffect(() => {
    setEventCallbacks({
      onPlayerJoined: ({ player, players }) => {
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: players,
          };
        });
      },

      onPlayerLeft: ({ playerId, players }) => {
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: players,
          };
        });
      },

      onPlayerDisconnected: ({ playerId }) => {
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: prev.players.map((p) =>
              p.id === playerId ? { ...p, isConnected: false } : p
            ),
          };
        });
      },

      onPlayerReconnected: ({ playerId }) => {
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: prev.players.map((p) =>
              p.id === playerId ? { ...p, isConnected: true } : p
            ),
          };
        });
      },

      onGameStarted: ({ players, firstPlayerId }) => {
        // Update active room status
        gameStorage.updateActiveRoomStatus('playing');

        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'playing',
            players,
            currentTurnPlayerId: firstPlayerId,
            startedAt: new Date().toISOString(),
          };
        });
      },

      onMoveMade: ({
        playerId,
        dot1Id,
        dot2Id,
        line,
        completedSquares,
        nextPlayerId,
        scores,
      }) => {
        setGameState((prev) => {
          if (!prev) return prev;

          // Update dots connections
          const newDots = [...prev.dots];
          newDots[dot1Id] = {
            ...newDots[dot1Id],
            connectedTo: [...newDots[dot1Id].connectedTo, dot2Id],
          };
          newDots[dot2Id] = {
            ...newDots[dot2Id],
            connectedTo: [...newDots[dot2Id].connectedTo, dot1Id],
          };

          // Update squares
          const newSquares = prev.squares.map((square) => {
            const completed = completedSquares.find((cs) => cs.id === square.id);
            if (completed) {
              return completed;
            }
            // Check if this line affects this square and update lines
            return updateSquareLines(square, dot1Id, dot2Id);
          });

          // Update player scores
          const newPlayers = prev.players.map((p) => ({
            ...p,
            score: scores[p.id] ?? p.score,
          }));

          return {
            ...prev,
            dots: newDots,
            lines: [...prev.lines, line],
            squares: newSquares,
            players: newPlayers,
            currentTurnPlayerId: nextPlayerId,
            moveCount: prev.moveCount + 1,
          };
        });
      },

      onGameOver: ({ winner, isDraw, finalScores }) => {
        // Clear active room when game ends
        gameStorage.clearActiveRoom();

        setGameState((prev) => {
          if (!prev) return prev;

          const newPlayers = prev.players.map((p) => ({
            ...p,
            score: finalScores[p.id] ?? p.score,
          }));

          return {
            ...prev,
            status: 'finished',
            winner: winner,
            isDraw,
            players: newPlayers,
          };
        });
      },

      onNewGameStarting: () => {
        // Reset for new game
        const { dots, squares } = initializeBoard(boardSize);
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'waiting',
            dots,
            lines: [],
            squares,
            players: prev.players.map((p) => ({ ...p, score: 0 })),
            currentTurnPlayerId: null,
            winner: null,
            isDraw: false,
            moveCount: 0,
            startedAt: null,
          };
        });
        setSelectedDot(null);
      },

      onRejoinSuccess: ({ gameState: serverState, players }) => {
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            ...serverState,
            players,
          };
        });
      },

      onGameSync: ({ gameState: serverState, players, scores }) => {
        // Sync game state for late joiners
        console.log('Game sync received:', serverState.status);
        setGameState((prev) => {
          if (!prev) return prev;

          // Update player scores
          const updatedPlayers = players.map((p) => ({
            ...p,
            score: scores[p.id] ?? p.score,
          }));

          return {
            ...prev,
            status: serverState.status,
            lines: serverState.lines || [],
            currentTurnPlayerId: serverState.currentTurnPlayerId,
            moveCount: serverState.moveCount || 0,
            players: updatedPlayers,
            startedAt: serverState.startedAt,
          };
        });
      },

      onRoomClosed: ({ reason }) => {
        setError(`Room closed: ${reason}`);
        resetGame();
      },

      onError: ({ message, code }) => {
        setError(message);
        console.error('Socket error:', code, message);
      },
    });
  }, [setEventCallbacks, boardSize, resetGame]);

  const value: GameContextValue = {
    gameState,
    isMyTurn,
    myPlayer,
    selectedDot,
    isLoading,
    error,
    initGame,
    selectDot,
    clearSelection,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Helper function to update square lines
function updateSquareLines(square: Square, dot1Id: number, dot2Id: number): Square {
  const { GRID_SIZE } = GAME_CONFIG;
  const topLeft = square.topLeftDotId;
  const topRight = topLeft + 1;
  const bottomLeft = topLeft + GRID_SIZE;
  const bottomRight = bottomLeft + 1;

  const checkLine = (d1: number, d2: number, e1: number, e2: number) =>
    (d1 === e1 && d2 === e2) || (d1 === e2 && d2 === e1);

  const newLines = { ...square.lines };

  if (checkLine(dot1Id, dot2Id, topLeft, topRight)) newLines.top = true;
  if (checkLine(dot1Id, dot2Id, topRight, bottomRight)) newLines.right = true;
  if (checkLine(dot1Id, dot2Id, bottomLeft, bottomRight)) newLines.bottom = true;
  if (checkLine(dot1Id, dot2Id, topLeft, bottomLeft)) newLines.left = true;

  if (
    newLines.top !== square.lines.top ||
    newLines.right !== square.lines.right ||
    newLines.bottom !== square.lines.bottom ||
    newLines.left !== square.lines.left
  ) {
    return { ...square, lines: newLines };
  }

  return square;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export default GameContext;

