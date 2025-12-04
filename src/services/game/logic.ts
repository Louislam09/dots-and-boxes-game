// services/game/logic.ts - Game logic and move processing

import { GAME_CONFIG } from '../../constants/game';
import type { GameState, Line, Square, Player, MoveResult, GameOverResult } from '../../types/game';

/**
 * Process a move and return the result
 */
export function processMove(
  gameState: GameState,
  dot1Id: number,
  dot2Id: number,
  playerId: string,
  playerColor: string
): MoveResult {
  const { dots, squares, players } = gameState;
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

    // Update square lines
    if (isTop) square.lines.top = true;
    if (isRight) square.lines.right = true;
    if (isBottom) square.lines.bottom = true;
    if (isLeft) square.lines.left = true;

    // Check if square is now complete
    if (
      square.lines.top &&
      square.lines.right &&
      square.lines.bottom &&
      square.lines.left
    ) {
      square.isComplete = true;
      square.completedBy = playerId;
      square.color = playerColor;
      completedSquares.push(square);
    }
  }

  // Calculate scores
  const scores: Record<string, number> = {};
  for (const player of players) {
    scores[player.id] = squares.filter(
      (s) => s.isComplete && s.completedBy === player.id
    ).length;
  }

  // Determine next player
  const nextPlayerId = getNextPlayer(players, playerId, completedSquares.length);

  // Check if game is over
  const isGameOver = squares.every((s) => s.isComplete);

  return {
    line,
    completedSquares,
    isGameOver,
    nextPlayerId,
    scores,
  };
}

/**
 * Check if a line matches expected dots
 */
function checkLine(
  d1: number,
  d2: number,
  expected1: number,
  expected2: number
): boolean {
  return (
    (d1 === expected1 && d2 === expected2) ||
    (d1 === expected2 && d2 === expected1)
  );
}

/**
 * Get the next player (or same player if they completed a square)
 */
export function getNextPlayer(
  players: Player[],
  currentPlayerId: string,
  completedSquareCount: number
): string {
  // If player completed a square, they go again
  if (completedSquareCount > 0) {
    return currentPlayerId;
  }

  // Otherwise, next player
  const currentIndex = players.findIndex((p) => p.id === currentPlayerId);
  const nextIndex = (currentIndex + 1) % players.length;
  return players[nextIndex].id;
}

/**
 * Determine the winner of the game
 */
export function determineWinner(players: Player[]): GameOverResult {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  // Check for draw (top players have same score)
  if (sorted.length >= 2 && sorted[0].score === sorted[1].score) {
    return {
      winner: null,
      isDraw: true,
      finalScores: Object.fromEntries(players.map((p) => [p.id, p.score])),
    };
  }

  return {
    winner: sorted[0],
    isDraw: false,
    finalScores: Object.fromEntries(players.map((p) => [p.id, p.score])),
  };
}

/**
 * Calculate experience earned from a game
 */
export function calculateExperience(
  scoreEarned: number,
  won: boolean,
  isDraw: boolean
): number {
  const { EXPERIENCE } = GAME_CONFIG;

  let exp = scoreEarned * EXPERIENCE.PER_SQUARE;

  if (isDraw) {
    exp += EXPERIENCE.DRAW_BONUS;
  } else if (won) {
    exp += EXPERIENCE.WIN_BONUS;
  } else {
    exp += EXPERIENCE.LOSS_BONUS;
  }

  return exp;
}

/**
 * Create initial game state
 */
export function createInitialGameState(
  roomCode: string,
  roomId: string,
  gameMode: '1vs1' | '3players',
  players: Player[],
  dots: import('../../types/game').Dot[],
  squares: Square[]
): GameState {
  return {
    roomCode,
    roomId,
    gameMode,
    status: 'waiting',
    players,
    dots,
    lines: [],
    squares,
    currentTurnPlayerId: null,
    winner: null,
    isDraw: false,
    moveCount: 0,
    startedAt: null,
  };
}

/**
 * Reset game state for a new game (play again)
 */
export function resetGameState(
  gameState: GameState,
  newDots: import('../../types/game').Dot[],
  newSquares: Square[]
): GameState {
  // Reset player scores
  const players = gameState.players.map((p) => ({
    ...p,
    score: 0,
  }));

  return {
    ...gameState,
    status: 'waiting',
    players,
    dots: newDots,
    lines: [],
    squares: newSquares,
    currentTurnPlayerId: null,
    winner: null,
    isDraw: false,
    moveCount: 0,
    startedAt: null,
  };
}

/**
 * Update player scores from squares
 */
export function updateScores(gameState: GameState): Record<string, number> {
  const scores: Record<string, number> = {};

  for (const player of gameState.players) {
    scores[player.id] = gameState.squares.filter(
      (s) => s.isComplete && s.completedBy === player.id
    ).length;
  }

  return scores;
}

/**
 * Get player by ID from game state
 */
export function getPlayerById(
  gameState: GameState,
  playerId: string
): Player | undefined {
  return gameState.players.find((p) => p.id === playerId);
}

/**
 * Check if it's a specific player's turn
 */
export function isPlayerTurn(gameState: GameState, playerId: string): boolean {
  return gameState.currentTurnPlayerId === playerId;
}

