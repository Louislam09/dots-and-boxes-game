// services/game/board.ts - Board initialization with dynamic grid size

import { GAME_CONFIG } from '../../constants/game';
import type { Dot, Square } from '../../types/game';

export interface BoardData {
  dots: Dot[];
  squares: Square[];
  gridRows: number;
  gridCols: number;
}

export interface BoardConfig {
  boardSize: number;    // Pixel size for rendering
  gridRows?: number;    // Number of dot rows (default: GAME_CONFIG.GRID_SIZE)
  gridCols?: number;    // Number of dot columns (default: GAME_CONFIG.GRID_SIZE)
}

/**
 * Initialize the game board with dots and squares
 * Now supports dynamic grid sizes!
 */
export function initializeBoard(config: BoardConfig | number): BoardData {
  // Support legacy call with just boardSize number
  const boardConfig: BoardConfig = typeof config === 'number'
    ? { boardSize: config }
    : config;

  const { boardSize } = boardConfig;
  const gridRows = boardConfig.gridRows || GAME_CONFIG.GRID_SIZE;
  const gridCols = boardConfig.gridCols || GAME_CONFIG.GRID_SIZE;

  const { BOARD_PADDING } = GAME_CONFIG;

  // Calculate spacing based on the larger dimension to fit the board
  const maxDimension = Math.max(gridRows, gridCols);
  const spacing = (boardSize - BOARD_PADDING * 2) / (maxDimension - 1);

  const dots: Dot[] = [];
  const squares: Square[] = [];

  // Create dots (gridRows x gridCols grid)
  let dotId = 0;
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
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

  // Create squares ((gridRows-1) x (gridCols-1) grid)
  // Each square is defined by its top-left dot
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
        lines: {
          top: false,
          right: false,
          bottom: false,
          left: false,
        },
      });
    }
  }

  return { dots, squares, gridRows, gridCols };
}

/**
 * Get dot by row and column
 */
export function getDotByPosition(
  dots: Dot[],
  row: number,
  col: number,
  gridCols: number
): Dot | undefined {
  const id = row * gridCols + col;
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
export function getAdjacentDots(
  dots: Dot[],
  dot: Dot,
  gridRows: number,
  gridCols: number
): Dot[] {
  const adjacent: Dot[] = [];

  // Top
  if (dot.row > 0) {
    const topDot = getDotByPosition(dots, dot.row - 1, dot.col, gridCols);
    if (topDot) adjacent.push(topDot);
  }

  // Bottom
  if (dot.row < gridRows - 1) {
    const bottomDot = getDotByPosition(dots, dot.row + 1, dot.col, gridCols);
    if (bottomDot) adjacent.push(bottomDot);
  }

  // Left
  if (dot.col > 0) {
    const leftDot = getDotByPosition(dots, dot.row, dot.col - 1, gridCols);
    if (leftDot) adjacent.push(leftDot);
  }

  // Right
  if (dot.col < gridCols - 1) {
    const rightDot = getDotByPosition(dots, dot.row, dot.col + 1, gridCols);
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
  dot2Id: number,
  gridCols: number
): Square[] {
  const affected: Square[] = [];

  for (const square of squares) {
    const topLeft = square.topLeftDotId;
    const topRight = topLeft + 1;
    const bottomLeft = topLeft + gridCols;
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
