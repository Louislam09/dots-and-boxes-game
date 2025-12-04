// services/game/board.ts - Board initialization

import { GAME_CONFIG } from '../../constants/game';
import type { Dot, Square } from '../../types/game';

export interface BoardData {
  dots: Dot[];
  squares: Square[];
}

/**
 * Initialize the game board with dots and squares
 */
export function initializeBoard(boardSize: number): BoardData {
  const { GRID_SIZE, BOARD_PADDING } = GAME_CONFIG;
  const spacing = (boardSize - BOARD_PADDING * 2) / (GRID_SIZE - 1);

  const dots: Dot[] = [];
  const squares: Square[] = [];

  // Create dots (9x9 grid = 81 dots)
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

  // Create squares (8x8 grid = 64 squares)
  // Each square is defined by its top-left dot
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
        lines: {
          top: false,
          right: false,
          bottom: false,
          left: false,
        },
      });
    }
  }

  return { dots, squares };
}

/**
 * Get dot by row and column
 */
export function getDotByPosition(
  dots: Dot[],
  row: number,
  col: number
): Dot | undefined {
  const { GRID_SIZE } = GAME_CONFIG;
  const id = row * GRID_SIZE + col;
  return dots[id];
}

/**
 * Get dot by ID
 */
export function getDotById(dots: Dot[], id: number): Dot | undefined {
  return dots[id];
}

/**
 * Get adjacent dots for a given dot
 */
export function getAdjacentDots(dots: Dot[], dot: Dot): Dot[] {
  const { GRID_SIZE } = GAME_CONFIG;
  const adjacent: Dot[] = [];

  // Top
  if (dot.row > 0) {
    const topDot = getDotByPosition(dots, dot.row - 1, dot.col);
    if (topDot) adjacent.push(topDot);
  }

  // Bottom
  if (dot.row < GRID_SIZE - 1) {
    const bottomDot = getDotByPosition(dots, dot.row + 1, dot.col);
    if (bottomDot) adjacent.push(bottomDot);
  }

  // Left
  if (dot.col > 0) {
    const leftDot = getDotByPosition(dots, dot.row, dot.col - 1);
    if (leftDot) adjacent.push(leftDot);
  }

  // Right
  if (dot.col < GRID_SIZE - 1) {
    const rightDot = getDotByPosition(dots, dot.row, dot.col + 1);
    if (rightDot) adjacent.push(rightDot);
  }

  return adjacent;
}

/**
 * Get squares that could be affected by a line between two dots
 */
export function getAffectedSquares(
  squares: Square[],
  dot1Id: number,
  dot2Id: number
): Square[] {
  const { GRID_SIZE } = GAME_CONFIG;
  const affected: Square[] = [];

  for (const square of squares) {
    const topLeft = square.topLeftDotId;
    const topRight = topLeft + 1;
    const bottomLeft = topLeft + GRID_SIZE;
    const bottomRight = bottomLeft + 1;

    // Check if the line is part of this square
    const lineIds = [
      [topLeft, topRight], // top
      [topRight, bottomRight], // right
      [bottomLeft, bottomRight], // bottom
      [topLeft, bottomLeft], // left
    ];

    for (const [a, b] of lineIds) {
      if (
        (dot1Id === a && dot2Id === b) ||
        (dot1Id === b && dot2Id === a)
      ) {
        affected.push(square);
        break;
      }
    }
  }

  return affected;
}

/**
 * Calculate board size based on screen dimensions
 */
export function calculateBoardSize(
  screenWidth: number,
  screenHeight: number,
  maxSize = 400
): number {
  const padding = 40; // Account for screen padding
  const availableWidth = screenWidth - padding * 2;
  const availableHeight = screenHeight - 200; // Account for UI elements

  return Math.min(availableWidth, availableHeight, maxSize);
}

