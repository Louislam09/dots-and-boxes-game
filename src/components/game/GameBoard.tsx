// components/game/GameBoard.tsx - Main game board component (Edge-based, Optimized)

import React, { useMemo, memo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg from 'react-native-svg';
import { Dot } from './Dot';
import { EdgeLine, EdgePreviewLine } from './Line';
import { Square } from './Square';
import { GAME_CONFIG, getResponsiveSizes } from '../../constants/game';
import { COLORS } from '../../constants/colors';
import { useGame } from '../../contexts/GameContext';

interface GameBoardProps {
  size?: number;
}

export const GameBoard = memo(function GameBoard({ size: propSize }: GameBoardProps) {
  const { gameState, selectedDot, isMyTurn, selectDot, myPlayer, edges } = useGame();
  const { width: screenWidth } = useWindowDimensions();

  // Calculate board size - use full width if no prop provided
  const size = propSize || screenWidth - 32;

  // Get responsive sizes based on screen width
  const { dotSize, hitArea, lineWidth } = useMemo(
    () => getResponsiveSizes(screenWidth),
    [screenWidth]
  );

  const { GRID_SIZE, BOARD_PADDING } = GAME_CONFIG;
  const spacing = (size - BOARD_PADDING * 2) / (GRID_SIZE - 1);

  // Recalculate dot positions based on actual render size
  const scaledDots = useMemo(() => {
    if (!gameState?.dots) return [];
    return gameState.dots.map((dot) => ({
      ...dot,
      x: BOARD_PADDING + dot.col * spacing,
      y: BOARD_PADDING + dot.row * spacing,
    }));
  }, [gameState?.dots, spacing]);

  // Get the scaled version of selected dot
  const scaledSelectedDot = useMemo(() => {
    if (!selectedDot) return null;
    return scaledDots.find(d => d.id === selectedDot.id) || null;
  }, [selectedDot, scaledDots]);

  // O(1) lookup Set for existing edges - prevents ghost previews in multiplayer
  const edgeSet = useMemo(() => {
    return new Set(edges.map(e => e.id));
  }, [edges]);

  // Get preview edges for adjacent unconnected dots - edge-based, O(1) per direction
  const previewEdges = useMemo(() => {
    if (!scaledSelectedDot) return [];

    const { row, col, connectedTo } = scaledSelectedDot;
    const previews: { row: number; col: number; dir: 'H' | 'V' }[] = [];

    // Check all 4 directions directly
    const checks = [
      { r: row - 1, c: col, dir: 'V' as const, edgeRow: row - 1, edgeCol: col },     // top
      { r: row + 1, c: col, dir: 'V' as const, edgeRow: row, edgeCol: col },         // bottom
      { r: row, c: col - 1, dir: 'H' as const, edgeRow: row, edgeCol: col - 1 },     // left
      { r: row, c: col + 1, dir: 'H' as const, edgeRow: row, edgeCol: col },         // right
    ];

    for (const { r, c, dir, edgeRow, edgeCol } of checks) {
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        const id = r * GRID_SIZE + c;
        // Check both connectedTo AND edgeSet to handle race conditions
        const edgeKey = `${dir}-${edgeRow}-${edgeCol}`;
        if (!connectedTo.includes(id) && !edgeSet.has(edgeKey)) {
          previews.push({ row: edgeRow, col: edgeCol, dir });
        }
      }
    }

    return previews;
  }, [scaledSelectedDot, GRID_SIZE, edgeSet]);

  if (!gameState) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
          },
        ]}
      />
    );
  }

  const { squares, status } = gameState;
  const isInteractive = status === 'playing' && isMyTurn;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
      ]}
    >
      {/* Grid pattern background */}
      <View style={styles.gridPattern} />

      {/* SVG Layer for lines and squares */}
      <Svg
        width={size}
        height={size}
        style={StyleSheet.absoluteFill}
      >
        {/* Completed squares */}
        {squares.map((square) => (
          <Square
            key={`square-${square.id}`}
            square={square}
            dots={scaledDots}
            spacing={spacing}
          />
        ))}

        {/* Preview lines for adjacent dots - edge-based */}
        {previewEdges.map((preview) => (
          <EdgePreviewLine
            key={`preview-${preview.dir}-${preview.row}-${preview.col}`}
            row={preview.row}
            col={preview.col}
            dir={preview.dir}
            spacing={spacing}
            padding={BOARD_PADDING}
            lineWidth={lineWidth}
            color={myPlayer?.color}
          />
        ))}

        {/* Drawn lines - edge-based rendering */}
        {edges.map((edge) => (
          <EdgeLine
            key={edge.id}
            edge={edge}
            spacing={spacing}
            padding={BOARD_PADDING}
            lineWidth={lineWidth}
          />
        ))}
      </Svg>

      {/* Dots Layer (interactive) */}
      {scaledDots.map((dot) => (
        <Dot
          key={`dot-${dot.id}`}
          dot={dot}
          isSelected={selectedDot?.id === dot.id}
          isInteractive={isInteractive}
          onPress={selectDot}
          dotSize={dotSize}
          hitArea={hitArea}
        />
      ))}
    </View>
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
  gridPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
});

export default GameBoard;
