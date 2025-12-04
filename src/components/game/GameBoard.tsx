// components/game/GameBoard.tsx - Main game board component

import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import Svg from 'react-native-svg';
import { Dot } from './Dot';
import { Line, PreviewLine } from './Line';
import { Square } from './Square';
import { GAME_CONFIG } from '../../constants/game';
import { useGame } from '../../contexts/GameContext';
import type { Dot as DotType } from '../../types/game';

interface GameBoardProps {
  size?: number;
}

export function GameBoard({ size: propSize }: GameBoardProps) {
  const { gameState, selectedDot, isMyTurn, selectDot, myPlayer } = useGame();

  // Calculate board size
  const screenWidth = Dimensions.get('window').width;
  const size = propSize || Math.min(screenWidth - 40, 400);

  const { GRID_SIZE, BOARD_PADDING } = GAME_CONFIG;
  const spacing = (size - BOARD_PADDING * 2) / (GRID_SIZE - 1);

  // Get adjacent dots for preview line
  const adjacentDots = useMemo(() => {
    if (!selectedDot || !gameState) return [];

    const adjacent: DotType[] = [];
    const { dots } = gameState;

    // Check all 4 directions
    const directions = [
      { row: -1, col: 0 }, // top
      { row: 1, col: 0 }, // bottom
      { row: 0, col: -1 }, // left
      { row: 0, col: 1 }, // right
    ];

    for (const dir of directions) {
      const newRow = selectedDot.row + dir.row;
      const newCol = selectedDot.col + dir.col;

      if (
        newRow >= 0 &&
        newRow < GRID_SIZE &&
        newCol >= 0 &&
        newCol < GRID_SIZE
      ) {
        const adjacentId = newRow * GRID_SIZE + newCol;
        const adjacentDot = dots[adjacentId];

        // Only include if not already connected
        if (adjacentDot && !selectedDot.connectedTo.includes(adjacentId)) {
          adjacent.push(adjacentDot);
        }
      }
    }

    return adjacent;
  }, [selectedDot, gameState]);

  if (!gameState) {
    return (
      <View
        style={{
          width: size,
          height: size,
          backgroundColor: '#F9FAFB',
          borderRadius: 16,
        }}
      />
    );
  }

  const { dots, lines, squares, status } = gameState;
  const isInteractive = status === 'playing' && isMyTurn;

  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
      }}
    >
      {/* SVG Layer for lines and squares */}
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute' }}
      >
        {/* Completed squares */}
        {squares.map((square) => (
          <Square
            key={`square-${square.id}`}
            square={square}
            dots={dots}
            spacing={spacing}
          />
        ))}

        {/* Preview lines for adjacent dots */}
        {selectedDot &&
          adjacentDots.map((adjDot) => (
            <PreviewLine
              key={`preview-${adjDot.id}`}
              dot1={selectedDot}
              dot2={adjDot}
              color={myPlayer?.color}
            />
          ))}

        {/* Drawn lines */}
        {lines.map((line) => (
          <Line
            key={`line-${line.id}`}
            line={line}
            dots={dots}
          />
        ))}
      </Svg>

      {/* Dots Layer (interactive) */}
      {dots.map((dot) => (
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

export default GameBoard;

