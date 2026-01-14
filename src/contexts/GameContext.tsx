// contexts/GameContext.tsx - Game state context (Edge-based, Optimistic UI)

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { initializeBoard } from '../services/game/board';
import { gameStorage } from '../utils/storage';
import { GAME_CONFIG, dotsToEdge, createEdgeId } from '../constants/game';
import type {
  GameState,
  Player,
  Dot,
  Line,
  Square,
  Edge,
  GameMode,
  BoardTheme,
} from '../types/game';

interface GameSettings {
  gridRows: number;
  gridCols: number;
  theme?: BoardTheme;
}

interface GameContextValue {
  gameState: GameState | null;
  isMyTurn: boolean;
  myPlayer: Player | null;
  selectedDot: Dot | null;
  isLoading: boolean;
  error: string | null;
  edges: Edge[]; // Edge-based state for fast rendering

  // Actions
  initGame: (roomCode: string, roomId: string, gameMode: GameMode, settings?: GameSettings) => void;
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

  // Edge-based state for fast rendering
  const [edges, setEdges] = useState<Edge[]>([]);

  // Track optimistic moves for potential rollback
  const optimisticEdgesRef = useRef<Set<string>>(new Set());

  // Calculate derived values
  const myPlayer = gameState?.players.find((p) => p.id === user?.id) ?? null;
  const isMyTurn = gameState?.currentTurnPlayerId === user?.id;

  // Initialize a new game with optional settings
  const initGame = useCallback(
    (roomCode: string, roomId: string, gameMode: GameMode, settings?: GameSettings) => {
      // Use settings or defaults
      const gridRows = settings?.gridRows || GAME_CONFIG.GRID_SIZE;
      const gridCols = settings?.gridCols || GAME_CONFIG.GRID_SIZE;
      const theme = settings?.theme;

      const { dots, squares } = initializeBoard({
        boardSize,
        gridRows,
        gridCols,
      });

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
        gridRows,
        gridCols,
        theme,
      };

      setGameState(initialState);
      setSelectedDot(null);
      setEdges([]); // Reset edges
      optimisticEdgesRef.current.clear();
      setError(null);
    },
    [boardSize]
  );

  // Handle dot selection - OPTIMISTIC UI for instant response
  const selectDot = useCallback(
    (dot: Dot) => {
      if (!gameState || gameState.status !== 'playing' || !isMyTurn || !myPlayer) {
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
          // === OPTIMISTIC UI: Draw line IMMEDIATELY ===
          const edgeInfo = dotsToEdge(selectedDot.id, dot.id, myPlayer.id, myPlayer.color, gameState.gridCols);
          const optimisticEdge: Edge = {
            id: edgeInfo.id,
            row: edgeInfo.row,
            col: edgeInfo.col,
            dir: edgeInfo.dir,
            playerId: myPlayer.id,
            color: myPlayer.color,
            isOptimistic: true, // Mark as not confirmed
          };

          // Add edge immediately for instant visual feedback
          setEdges(prev => [...prev, optimisticEdge]);
          optimisticEdgesRef.current.add(edgeInfo.id);

          // Update local dot connections for preview updates
          setGameState(prev => {
            if (!prev) return prev;
            const newDots = [...prev.dots];
            newDots[selectedDot.id] = {
              ...newDots[selectedDot.id],
              connectedTo: [...newDots[selectedDot.id].connectedTo, dot.id],
            };
            newDots[dot.id] = {
              ...newDots[dot.id],
              connectedTo: [...newDots[dot.id].connectedTo, selectedDot.id],
            };
            return { ...prev, dots: newDots };
          });

          // Send to server (server will broadcast confirmed move)
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
    [gameState, isMyTurn, selectedDot, makeMove, myPlayer]
  );

  // Clear dot selection
  const clearSelection = useCallback(() => {
    setSelectedDot(null);
  }, []);

  // Reset game state
  const resetGame = useCallback(() => {
    setGameState(null);
    setSelectedDot(null);
    setEdges([]);
    optimisticEdgesRef.current.clear();
    setError(null);
    setIsLoading(false);
  }, []);

  // Helper to get grid cols from state or default
  const getGridCols = useCallback(() => {
    return gameState?.gridCols || GAME_CONFIG.GRID_SIZE;
  }, [gameState?.gridCols]);

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
        // Get gridCols from current state
        const gridCols = getGridCols();

        // Convert to edge format
        const edgeInfo = dotsToEdge(dot1Id, dot2Id, playerId, line.color, gridCols);
        const confirmedEdge: Edge = {
          id: edgeInfo.id,
          row: edgeInfo.row,
          col: edgeInfo.col,
          dir: edgeInfo.dir,
          playerId,
          color: line.color,
          isOptimistic: false,
        };

        // Update edges - confirm optimistic or add new
        setEdges(prev => {
          const existingIndex = prev.findIndex(e => e.id === edgeInfo.id);
          if (existingIndex >= 0) {
            // Confirm optimistic edge
            const updated = [...prev];
            updated[existingIndex] = confirmedEdge;
            return updated;
          }
          // Add new edge (from opponent)
          return [...prev, confirmedEdge];
        });

        // Remove from optimistic tracking
        optimisticEdgesRef.current.delete(edgeInfo.id);

        setGameState((prev) => {
          if (!prev) return prev;

          // Update dots connections (skip if already updated optimistically)
          const newDots = [...prev.dots];
          if (!newDots[dot1Id].connectedTo.includes(dot2Id)) {
            newDots[dot1Id] = {
              ...newDots[dot1Id],
              connectedTo: [...newDots[dot1Id].connectedTo, dot2Id],
            };
          }
          if (!newDots[dot2Id].connectedTo.includes(dot1Id)) {
            newDots[dot2Id] = {
              ...newDots[dot2Id],
              connectedTo: [...newDots[dot2Id].connectedTo, dot1Id],
            };
          }

          // Update squares
          const newSquares = prev.squares.map((square) => {
            const completed = completedSquares.find((cs) => cs.id === square.id);
            if (completed) {
              return completed;
            }
            // Check if this line affects this square and update lines
            return updateSquareLines(square, dot1Id, dot2Id, prev.gridCols);
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
        // Reset for new game - preserve grid settings
        setGameState((prev) => {
          if (!prev) return prev;

          const { dots, squares } = initializeBoard({
            boardSize,
            gridRows: prev.gridRows,
            gridCols: prev.gridCols,
          });

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
        setEdges([]); // Reset edges for new game
        optimisticEdgesRef.current.clear();
      },

      onRejoinSuccess: ({ gameState: serverState, players }) => {
        // Get gridCols from server state or default
        const gridCols = serverState.gridCols || GAME_CONFIG.GRID_SIZE;

        // Sync edges from server lines on rejoin
        if (serverState.lines && serverState.lines.length > 0) {
          const syncedEdges: Edge[] = serverState.lines.map((line) => {
            const edgeInfo = dotsToEdge(line.dot1Id, line.dot2Id, line.playerId, line.color, gridCols);
            return {
              id: edgeInfo.id,
              row: edgeInfo.row,
              col: edgeInfo.col,
              dir: edgeInfo.dir,
              playerId: line.playerId,
              color: line.color,
              isOptimistic: false,
            };
          });
          setEdges(syncedEdges);
          optimisticEdgesRef.current.clear();
        }

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

        // Get gridCols from server state or default
        const gridCols = serverState.gridCols || GAME_CONFIG.GRID_SIZE;

        // Sync edges from server lines
        if (serverState.lines && serverState.lines.length > 0) {
          const syncedEdges: Edge[] = serverState.lines.map((line) => {
            const edgeInfo = dotsToEdge(line.dot1Id, line.dot2Id, line.playerId, line.color, gridCols);
            return {
              id: edgeInfo.id,
              row: edgeInfo.row,
              col: edgeInfo.col,
              dir: edgeInfo.dir,
              playerId: line.playerId,
              color: line.color,
              isOptimistic: false,
            };
          });
          setEdges(syncedEdges);
        }

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
            gridRows: serverState.gridRows || prev.gridRows,
            gridCols: serverState.gridCols || prev.gridCols,
            theme: serverState.theme || prev.theme,
          };
        });
      },

      onRoomClosed: ({ reason }) => {
        setError(`Room closed: ${reason}`);
        resetGame();
      },

      onError: ({ message, code }) => {
        // Rollback optimistic moves on error
        if (code === 'INVALID_MOVE' || code === 'NOT_YOUR_TURN') {
          setEdges(prev => prev.filter(e => !e.isOptimistic));
          optimisticEdgesRef.current.clear();
        }
        setError(message);
        console.error('Socket error:', code, message);
      },
    });
  }, [setEventCallbacks, boardSize, resetGame, getGridCols]);

  const value: GameContextValue = {
    gameState,
    isMyTurn,
    myPlayer,
    selectedDot,
    isLoading,
    error,
    edges, // Edge-based state for fast rendering
    initGame,
    selectDot,
    clearSelection,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Helper function to update square lines with dynamic grid size
function updateSquareLines(square: Square, dot1Id: number, dot2Id: number, gridCols: number): Square {
  const topLeft = square.topLeftDotId;
  const topRight = topLeft + 1;
  const bottomLeft = topLeft + gridCols;
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
