// server/socket-server/src/game/logic.ts - Game logic with dynamic grid size

import type { Dot, Square, Line, GameState, Player } from '../types/index.js';

// Default grid size (for backwards compatibility)
const DEFAULT_GRID_SIZE = 9;
const PLAYER_COLORS = ['#E63946', '#2A9D8F', '#E9C46A', '#A855F7'];

/**
 * Initialize board with dots and squares
 * Now supports dynamic grid sizes!
 */
export function initializeBoard(
  gridRows: number = DEFAULT_GRID_SIZE,
  gridCols: number = DEFAULT_GRID_SIZE
): { dots: Dot[]; squares: Square[] } {
  const dots: Dot[] = [];
  const squares: Square[] = [];

  // Create dots (gridRows x gridCols)
  let dotId = 0;
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      dots.push({
        id: dotId++,
        row,
        col,
        connectedTo: [],
      });
    }
  }

  // Create squares ((gridRows-1) x (gridCols-1))
  let squareId = 0;
  for (let row = 0; row < gridRows - 1; row++) {
    for (let col = 0; col < gridCols - 1; col++) {
      const topLeftDotId = row * gridCols + col;
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

/**
 * Validate a move with dynamic grid size
 */
export function validateMove(
  gameState: GameState,
  dot1Id: number,
  dot2Id: number,
  playerId: string
): { valid: boolean; error?: string } {
  const { dots, currentTurnPlayerId, status, gridRows, gridCols } = gameState;

  if (status !== 'playing') {
    return { valid: false, error: 'Game is not active' };
  }

  if (currentTurnPlayerId !== playerId) {
    return { valid: false, error: 'Not your turn' };
  }

  if (dot1Id < 0 || dot1Id >= dots.length || dot2Id < 0 || dot2Id >= dots.length) {
    return { valid: false, error: 'Invalid dots' };
  }

  if (dot1Id === dot2Id) {
    return { valid: false, error: 'Cannot connect dot to itself' };
  }

  const dot1 = dots[dot1Id];
  const dot2 = dots[dot2Id];

  if (dot1.connectedTo.includes(dot2Id)) {
    return { valid: false, error: 'Dots already connected' };
  }

  // Use the actual dot row/col for adjacency check
  const isHorizontal = dot1.row === dot2.row && Math.abs(dot1.col - dot2.col) === 1;
  const isVertical = dot1.col === dot2.col && Math.abs(dot1.row - dot2.row) === 1;

  if (!isHorizontal && !isVertical) {
    return { valid: false, error: 'Dots must be adjacent' };
  }

  return { valid: true };
}

/**
 * Process a move with dynamic grid size
 */
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
  nextPlayerId: string;
  scores: Record<string, number>;
} {
  const { dots, squares, gridCols } = gameState;

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

  // Check for completed squares using dynamic gridCols
  const completedSquares: Square[] = [];

  for (const square of squares) {
    if (square.isComplete) continue;

    const topLeft = square.topLeftDotId;
    const topRight = topLeft + 1;
    const bottomLeft = topLeft + gridCols;
    const bottomRight = bottomLeft + 1;

    const checkLine = (d1: number, d2: number, e1: number, e2: number) =>
      (d1 === e1 && d2 === e2) || (d1 === e2 && d2 === e1);

    if (checkLine(dot1Id, dot2Id, topLeft, topRight)) square.lines.top = true;
    if (checkLine(dot1Id, dot2Id, topRight, bottomRight)) square.lines.right = true;
    if (checkLine(dot1Id, dot2Id, bottomLeft, bottomRight)) square.lines.bottom = true;
    if (checkLine(dot1Id, dot2Id, topLeft, bottomLeft)) square.lines.left = true;

    if (square.lines.top && square.lines.right && square.lines.bottom && square.lines.left) {
      square.isComplete = true;
      square.completedBy = playerId;
      square.color = playerColor;
      completedSquares.push(square);
    }
  }

  // Calculate scores
  const scores: Record<string, number> = {};
  const playerIds = new Set(squares.filter(s => s.completedBy).map(s => s.completedBy!));
  for (const pid of playerIds) {
    scores[pid] = squares.filter(s => s.completedBy === pid).length;
  }

  // Check game over
  const isGameOver = squares.every(s => s.isComplete);

  // Determine next player (same player if completed a square)
  let nextPlayerId = playerId;
  if (completedSquares.length === 0) {
    // Need to get players from room state - this will be handled in socket.ts
    nextPlayerId = ''; // Placeholder - will be set in handler
  }

  return { line, completedSquares, isGameOver, nextPlayerId, scores };
}

/**
 * Determine winner
 */
export function determineWinner(
  players: Player[]
): { winner: Player | null; isDraw: boolean; finalScores: Record<string, number> } {
  const finalScores: Record<string, number> = {};
  for (const player of players) {
    finalScores[player.id] = player.score;
  }

  const sorted = [...players].sort((a, b) => b.score - a.score);

  if (sorted.length >= 2 && sorted[0].score === sorted[1].score) {
    return { winner: null, isDraw: true, finalScores };
  }

  return { winner: sorted[0], isDraw: false, finalScores };
}

/**
 * Get player color by index
 */
export function getPlayerColor(index: number): string {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}
