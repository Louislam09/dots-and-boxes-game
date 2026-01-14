// components/game/GameBoard.tsx - Main game board with gesture-based drag (Reanimated)

import React, { useMemo, memo, useCallback, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Line as SvgLine } from 'react-native-svg';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Dot } from './Dot';
import { EdgeLine } from './Line';
import { Square } from './Square';
import { GAME_CONFIG, getResponsiveSizes } from '../../constants/game';
import { COLORS } from '../../constants/colors';
import { useGame } from '../../contexts/GameContext';
import type { Dot as DotType } from '../../types/game';

interface GameBoardProps {
  size?: number;
}

export const GameBoard = memo(function GameBoard({ size: propSize }: GameBoardProps) {
  const { gameState, selectedDot, isMyTurn, selectDot, clearSelection, myPlayer, edges } = useGame();
  const { width: screenWidth } = useWindowDimensions();

  // Shared values for drag (runs on UI thread)
  const dragStartX = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const dragCurrentX = useSharedValue(0);
  const dragCurrentY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const dragStartDotId = useSharedValue<number>(-1);
  const hoveredDotId = useSharedValue<number>(-1);

  // React state for rendering (JS thread)
  const [dragState, setDragState] = React.useState<{
    startDot: DotType | null;
    currentPos: { x: number; y: number } | null;
    hoveredDot: DotType | null;
  }>({ startDot: null, currentPos: null, hoveredDot: null });

  // Get grid dimensions from game state or defaults
  const gridRows = gameState?.gridRows || GAME_CONFIG.GRID_SIZE;
  const gridCols = gameState?.gridCols || GAME_CONFIG.GRID_SIZE;

  // Calculate board size
  const size = propSize || screenWidth - 32;

  // Get responsive sizes
  const { dotSize, hitArea, lineWidth } = useMemo(
    () => getResponsiveSizes(screenWidth),
    [screenWidth]
  );

  const { BOARD_PADDING } = GAME_CONFIG;

  // Calculate spacing
  const maxDimension = Math.max(gridRows, gridCols);
  const spacing = (size - BOARD_PADDING * 2) / (maxDimension - 1);

  // Calculate board dimensions
  const boardWidth = BOARD_PADDING * 2 + (gridCols - 1) * spacing;
  const boardHeight = BOARD_PADDING * 2 + (gridRows - 1) * spacing;

  // Recalculate dot positions
  const scaledDots = useMemo(() => {
    if (!gameState?.dots) return [];
    return gameState.dots.map((dot) => ({
      ...dot,
      x: BOARD_PADDING + dot.col * spacing,
      y: BOARD_PADDING + dot.row * spacing,
    }));
  }, [gameState?.dots, spacing, BOARD_PADDING]);

  // Refs for worklet access
  const scaledDotsRef = useRef(scaledDots);
  scaledDotsRef.current = scaledDots;

  const hitAreaRef = useRef(hitArea);
  hitAreaRef.current = hitArea;

  // Find dot at position (for worklet)
  const findDotAtPosition = useCallback((x: number, y: number): DotType | null => {
    const threshold = hitAreaRef.current / 2;
    for (const dot of scaledDotsRef.current) {
      const dx = Math.abs(dot.x - x);
      const dy = Math.abs(dot.y - y);
      if (dx < threshold && dy < threshold) {
        return dot;
      }
    }
    return null;
  }, []);

  // Check if two dots are adjacent
  const areDotsAdjacent = useCallback((dot1: DotType, dot2: DotType): boolean => {
    const isHorizontal = dot1.row === dot2.row && Math.abs(dot1.col - dot2.col) === 1;
    const isVertical = dot1.col === dot2.col && Math.abs(dot1.row - dot2.row) === 1;
    return isHorizontal || isVertical;
  }, []);

  // Check if dots are connected
  const areDotsConnected = useCallback((dot1: DotType, dot2: DotType): boolean => {
    return dot1.connectedTo.includes(dot2.id);
  }, []);

  // Update drag state (called from worklet via runOnJS)
  const updateDragState = useCallback((
    startDot: DotType | null,
    currentPos: { x: number; y: number } | null,
    hoveredDot: DotType | null
  ) => {
    setDragState({ startDot, currentPos, hoveredDot });
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((x: number, y: number) => {
    if (!isMyTurn || gameState?.status !== 'playing') return;

    const dot = findDotAtPosition(x, y);
    if (dot) {
      selectDot(dot);
      updateDragState(dot, { x, y }, null);
    }
  }, [isMyTurn, gameState?.status, findDotAtPosition, selectDot, updateDragState]);

  // Handle drag move
  const handleDragMove = useCallback((x: number, y: number, startDotId: number) => {
    if (!isMyTurn || startDotId < 0) return;

    const startDot = scaledDotsRef.current.find(d => d.id === startDotId);
    if (!startDot) return;

    const targetDot = findDotAtPosition(x, y);
    let hoveredDot: DotType | null = null;

    if (targetDot &&
      targetDot.id !== startDotId &&
      areDotsAdjacent(startDot, targetDot) &&
      !areDotsConnected(startDot, targetDot)) {
      hoveredDot = targetDot;
    }

    updateDragState(startDot, { x, y }, hoveredDot);
  }, [isMyTurn, findDotAtPosition, areDotsAdjacent, areDotsConnected, updateDragState]);

  // Handle drag end
  const handleDragEnd = useCallback((x: number, y: number, startDotId: number) => {
    if (startDotId < 0) {
      updateDragState(null, null, null);
      return;
    }

    const startDot = scaledDotsRef.current.find(d => d.id === startDotId);
    if (!startDot) {
      updateDragState(null, null, null);
      return;
    }

    const targetDot = findDotAtPosition(x, y);

    if (targetDot &&
      targetDot.id !== startDotId &&
      areDotsAdjacent(startDot, targetDot) &&
      !areDotsConnected(startDot, targetDot)) {
      // Complete the line
      selectDot(targetDot);
    } else if (targetDot?.id === startDotId) {
      // Tapped same dot - keep selected for tap-tap mode
    } else {
      // Released elsewhere
      clearSelection();
    }

    updateDragState(null, null, null);
  }, [findDotAtPosition, areDotsAdjacent, areDotsConnected, selectDot, clearSelection, updateDragState]);

  // Pan gesture using react-native-gesture-handler
  const panGesture = useMemo(() => Gesture.Pan()
    .onStart((event) => {
      'worklet';
      isDragging.value = true;
      dragStartX.value = event.x;
      dragStartY.value = event.y;
      dragCurrentX.value = event.x;
      dragCurrentY.value = event.y;

      runOnJS(handleDragStart)(event.x, event.y);
    })
    .onUpdate((event) => {
      'worklet';
      dragCurrentX.value = event.x;
      dragCurrentY.value = event.y;

      runOnJS(handleDragMove)(event.x, event.y, dragStartDotId.value);
    })
    .onEnd((event) => {
      'worklet';
      isDragging.value = false;

      runOnJS(handleDragEnd)(event.x, event.y, dragStartDotId.value);

      dragStartDotId.value = -1;
      hoveredDotId.value = -1;
    })
    .onFinalize(() => {
      'worklet';
      isDragging.value = false;
      dragStartDotId.value = -1;
      hoveredDotId.value = -1;
    })
    .minDistance(0)
    .hitSlop({ top: 20, bottom: 20, left: 20, right: 20 }),
    [handleDragStart, handleDragMove, handleDragEnd]);

  // Update dragStartDotId when dragState changes
  React.useEffect(() => {
    if (dragState.startDot) {
      dragStartDotId.value = dragState.startDot.id;
    }
  }, [dragState.startDot]);

  // Get selected dot
  const scaledSelectedDot = useMemo(() => {
    if (!selectedDot) return null;
    return scaledDots.find(d => d.id === selectedDot.id) || null;
  }, [selectedDot, scaledDots]);

  // Edge set for lookup
  const edgeSet = useMemo(() => {
    return new Set(edges.map(e => e.id));
  }, [edges]);

  // Preview dot IDs
  const previewDotIds = useMemo(() => {
    const activeDot = dragState.startDot || scaledSelectedDot;
    if (!activeDot) return new Set<number>();

    const { row, col, connectedTo } = activeDot;
    const previewIds = new Set<number>();

    const checks = [
      { r: row - 1, c: col, edgeDir: 'V', edgeRow: row - 1, edgeCol: col },
      { r: row + 1, c: col, edgeDir: 'V', edgeRow: row, edgeCol: col },
      { r: row, c: col - 1, edgeDir: 'H', edgeRow: row, edgeCol: col - 1 },
      { r: row, c: col + 1, edgeDir: 'H', edgeRow: row, edgeCol: col },
    ];

    for (const { r, c, edgeDir, edgeRow, edgeCol } of checks) {
      if (r >= 0 && r < gridRows && c >= 0 && c < gridCols) {
        const id = r * gridCols + c;
        const edgeKey = `${edgeDir}-${edgeRow}-${edgeCol}`;
        if (!connectedTo.includes(id) && !edgeSet.has(edgeKey)) {
          previewIds.add(id);
        }
      }
    }

    return previewIds;
  }, [dragState.startDot, scaledSelectedDot, gridRows, gridCols, edgeSet]);

  // Generate shadow/guide lines for the grid
  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];

    // Horizontal lines
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols - 1; col++) {
        const x1 = BOARD_PADDING + col * spacing;
        const y = BOARD_PADDING + row * spacing;
        const x2 = BOARD_PADDING + (col + 1) * spacing;
        lines.push({ x1, y1: y, x2, y2: y, key: `h-${row}-${col}` });
      }
    }

    // Vertical lines
    for (let row = 0; row < gridRows - 1; row++) {
      for (let col = 0; col < gridCols; col++) {
        const x = BOARD_PADDING + col * spacing;
        const y1 = BOARD_PADDING + row * spacing;
        const y2 = BOARD_PADDING + (row + 1) * spacing;
        lines.push({ x1: x, y1, x2: x, y2, key: `v-${row}-${col}` });
      }
    }

    return lines;
  }, [gridRows, gridCols, spacing, BOARD_PADDING]);

  if (!gameState) {
    return (
      <View style={[styles.container, { width: size, height: size }]} />
    );
  }

  const { squares, status } = gameState;
  const isInteractive = status === 'playing' && isMyTurn;
  const activeDotId = dragState.startDot?.id ?? selectedDot?.id;

  // Get start dot position for preview line
  const startDotForLine = dragState.startDot
    ? scaledDots.find(d => d.id === dragState.startDot!.id)
    : null;

  return (
    <GestureDetector gesture={panGesture}>
      <View
        style={[
          styles.container,
          {
            width: boardWidth,
            height: boardHeight,
            alignSelf: 'center',
          },
        ]}
      >
        {/* SVG Layer */}
        <Svg
          width={boardWidth}
          height={boardHeight}
          style={StyleSheet.absoluteFill}
        >
          {/* Shadow/guide lines showing all possible connections */}
          {gridLines.map((line) => (
            <SvgLine
              key={line.key}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={COLORS.game.gridLine}
              strokeWidth={lineWidth * 2}
              strokeLinecap="round"
              opacity={0.2}
            />
          ))}

          {/* Completed squares */}
          {squares.map((square) => (
            <Square
              key={`square-${square.id}`}
              square={square}
              dots={scaledDots}
              spacing={spacing}
              players={gameState.players}
            />
          ))}

          {/* Drawn lines */}
          {edges.map((edge) => (
            <EdgeLine
              key={edge.id}
              edge={edge}
              spacing={spacing}
              padding={BOARD_PADDING}
              lineWidth={lineWidth}
            />
          ))}

          {/* Drag preview line - thick with shadow like reference */}
          {startDotForLine && dragState.currentPos && (
            <>
              {/* Shadow layer */}
              <SvgLine
                x1={startDotForLine.x}
                y1={startDotForLine.y + 4}
                x2={dragState.hoveredDot
                  ? (scaledDots.find(d => d.id === dragState.hoveredDot!.id)?.x ?? dragState.currentPos.x)
                  : dragState.currentPos.x}
                y2={(dragState.hoveredDot
                  ? (scaledDots.find(d => d.id === dragState.hoveredDot!.id)?.y ?? dragState.currentPos.y)
                  : dragState.currentPos.y) + 4}
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={lineWidth * 2.2}
                strokeLinecap="round"
              />
              {/* Main preview line */}
              <SvgLine
                x1={startDotForLine.x}
                y1={startDotForLine.y}
                x2={dragState.hoveredDot
                  ? (scaledDots.find(d => d.id === dragState.hoveredDot!.id)?.x ?? dragState.currentPos.x)
                  : dragState.currentPos.x}
                y2={dragState.hoveredDot
                  ? (scaledDots.find(d => d.id === dragState.hoveredDot!.id)?.y ?? dragState.currentPos.y)
                  : dragState.currentPos.y}
                stroke={myPlayer?.color || COLORS.accent.primary}
                strokeWidth={lineWidth * 2}
                strokeLinecap="round"
                opacity={dragState.hoveredDot ? 1 : 0.7}
              />
            </>
          )}

          {/* Dots Layer (SVG) */}
          {scaledDots.map((dot) => (
            <Dot
              key={`dot-${dot.id}`}
              dot={dot}
              isSelected={activeDotId === dot.id}
              isPreview={previewDotIds.has(dot.id)}
              isHovered={dragState.hoveredDot?.id === dot.id}
              isInteractive={isInteractive}
              dotSize={dotSize}
              previewColor={myPlayer?.color}
            />
          ))}
        </Svg>
      </View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.game.board,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.game.boardBorder,
    overflow: 'hidden',
    position: 'relative',
  },
});

export default GameBoard;
