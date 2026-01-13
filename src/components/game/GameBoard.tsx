// components/game/GameBoard.tsx - Main game board component (Dark Gaming Theme)

import React, { useMemo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Svg from 'react-native-svg';
import { Dot } from './Dot';
import { Line, PreviewLine } from './Line';
import { Square } from './Square';
import { GAME_CONFIG } from '../../constants/game';
import { COLORS } from '../../constants/colors';
import { useGame } from '../../contexts/GameContext';
import type { Dot as DotType } from '../../types/game';

interface GameBoardProps {
  size?: number;
}

export function GameBoard({ size: propSize }: GameBoardProps) {
  const { gameState, selectedDot, isMyTurn, selectDot, myPlayer } = useGame();

  // Calculate board size - use full width if no prop provided
  const screenWidth = Dimensions.get('window').width;
  const size = propSize || screenWidth - 32;

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

  // Get adjacent dots for preview line (using scaled positions)
  const adjacentDots = useMemo(() => {
    if (!scaledSelectedDot || !gameState) return [];

    const adjacent: DotType[] = [];

    const directions = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
    ];

    for (const dir of directions) {
      const newRow = scaledSelectedDot.row + dir.row;
      const newCol = scaledSelectedDot.col + dir.col;

      if (
        newRow >= 0 &&
        newRow < GRID_SIZE &&
        newCol >= 0 &&
        newCol < GRID_SIZE
      ) {
        const adjacentId = newRow * GRID_SIZE + newCol;
        const adjacentDot = scaledDots[adjacentId];

        if (adjacentDot && !scaledSelectedDot.connectedTo.includes(adjacentId)) {
          adjacent.push(adjacentDot);
        }
      }
    }

    return adjacent;
  }, [scaledSelectedDot, scaledDots, gameState]);

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

  const { lines, squares, status } = gameState;
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

        {/* Preview lines for adjacent dots */}
        {scaledSelectedDot &&
          adjacentDots.map((adjDot) => (
            <PreviewLine
              key={`preview-${adjDot.id}`}
              dot1={scaledSelectedDot}
              dot2={adjDot}
              color={myPlayer?.color}
            />
          ))}

        {/* Drawn lines */}
        {lines.map((line) => (
          <Line
            key={`line-${line.id}`}
            line={line}
            dots={scaledDots}
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
        />
      ))}
    </View>
  );
}

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
