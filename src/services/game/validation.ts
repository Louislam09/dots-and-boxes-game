// services/game/validation.ts - Move validation

import { GAME_CONFIG } from '../../constants/game';
import type { Dot, GameState } from '../../types/game';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate if a move is legal
 */
export function validateMove(
  gameState: GameState,
  dot1Id: number,
  dot2Id: number,
  playerId: string
): ValidationResult {
  const { dots, currentTurnPlayerId, status } = gameState;

  // Check if game is active
  if (status !== 'playing') {
    return { valid: false, error: 'Game is not active' };
  }

  // Check turn
  if (currentTurnPlayerId !== playerId) {
    return { valid: false, error: 'Not your turn' };
  }

  // Check dot IDs are valid
  if (dot1Id < 0 || dot1Id >= dots.length) {
    return { valid: false, error: 'Invalid first dot' };
  }

  if (dot2Id < 0 || dot2Id >= dots.length) {
    return { valid: false, error: 'Invalid second dot' };
  }

  // Check dots are different
  if (dot1Id === dot2Id) {
    return { valid: false, error: 'Cannot connect a dot to itself' };
  }

  const dot1 = dots[dot1Id];
  const dot2 = dots[dot2Id];

  if (!dot1 || !dot2) {
    return { valid: false, error: 'Invalid dots' };
  }

  // Check if already connected
  if (dot1.connectedTo.includes(dot2Id)) {
    return { valid: false, error: 'Dots are already connected' };
  }

  // Check adjacency (must be horizontal or vertical neighbors)
  const isHorizontal = dot1.row === dot2.row && Math.abs(dot1.col - dot2.col) === 1;
  const isVertical = dot1.col === dot2.col && Math.abs(dot1.row - dot2.row) === 1;

  if (!isHorizontal && !isVertical) {
    return { valid: false, error: 'Dots must be adjacent (no diagonal)' };
  }

  return { valid: true };
}

/**
 * Check if two dots are adjacent (horizontally or vertically)
 */
export function areDotsAdjacent(dot1: Dot, dot2: Dot): boolean {
  const isHorizontal = dot1.row === dot2.row && Math.abs(dot1.col - dot2.col) === 1;
  const isVertical = dot1.col === dot2.col && Math.abs(dot1.row - dot2.row) === 1;
  return isHorizontal || isVertical;
}

/**
 * Check if a line already exists between two dots
 */
export function lineExists(dots: Dot[], dot1Id: number, dot2Id: number): boolean {
  const dot1 = dots[dot1Id];
  if (!dot1) return false;
  return dot1.connectedTo.includes(dot2Id);
}

/**
 * Get all valid moves for a player (dots that can be connected)
 */
export function getValidMoves(
  dots: Dot[]
): Array<{ dot1Id: number; dot2Id: number }> {
  const { GRID_SIZE } = GAME_CONFIG;
  const validMoves: Array<{ dot1Id: number; dot2Id: number }> = [];

  for (let i = 0; i < dots.length; i++) {
    const dot = dots[i];

    // Check right neighbor
    if (dot.col < GRID_SIZE - 1) {
      const rightId = i + 1;
      if (!dot.connectedTo.includes(rightId)) {
        validMoves.push({ dot1Id: i, dot2Id: rightId });
      }
    }

    // Check bottom neighbor
    if (dot.row < GRID_SIZE - 1) {
      const bottomId = i + GRID_SIZE;
      if (!dot.connectedTo.includes(bottomId)) {
        validMoves.push({ dot1Id: i, dot2Id: bottomId });
      }
    }
  }

  return validMoves;
}

/**
 * Check if the game is over (all squares complete)
 */
export function isGameOver(gameState: GameState): boolean {
  return gameState.squares.every((square) => square.isComplete);
}

/**
 * Get remaining moves count
 */
export function getRemainingMoves(dots: Dot[]): number {
  return getValidMoves(dots).length;
}

