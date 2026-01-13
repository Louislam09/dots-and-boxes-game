// components/game/TurnIndicator.tsx - Turn indicator/banner (Clean)

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useGame } from '../../contexts/GameContext';
import { COLORS, getPlayerColor } from '../../constants/colors';

export function TurnBanner() {
  const { gameState, isMyTurn } = useGame();

  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    if (isMyTurn) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0.6, { duration: 600 })
        ),
        -1,
        true
      );
    } else {
      pulseOpacity.value = withTiming(0.6, { duration: 200 });
    }
  }, [isMyTurn]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  if (!gameState) return null;

  const { players, currentTurnPlayerId, status } = gameState;
  
  if (status !== 'playing') {
    return (
      <View style={styles.container}>
        <View style={styles.waitingBanner}>
          <Text style={styles.waitingText}>Waiting for game to start...</Text>
        </View>
      </View>
    );
  }

  const currentPlayer = players.find((p) => p.id === currentTurnPlayerId);
  const currentPlayerIndex = players.findIndex((p) => p.id === currentTurnPlayerId);
  const playerColor = currentPlayer ? getPlayerColor(currentPlayerIndex) : COLORS.accent.primary;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.banner,
          { borderColor: playerColor },
          isMyTurn && styles.bannerMyTurn,
        ]}
      >
        <View style={[styles.colorIndicator, { backgroundColor: playerColor }]} />

        <Animated.View style={pulseStyle}>
          <View style={[styles.dot, { backgroundColor: playerColor }]} />
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={[styles.turnLabel, { color: isMyTurn ? playerColor : COLORS.text.primary }]}>
            {isMyTurn ? 'Your Turn' : `${currentPlayer?.name || 'Opponent'}'s Turn`}
          </Text>
          <Text style={styles.turnHint}>
            {isMyTurn ? 'Connect two dots' : 'Waiting...'}
          </Text>
        </View>
      </View>
    </View>
  );
}

export const TurnIndicator = TurnBanner;

const styles = StyleSheet.create({
  container: {},
  banner: {
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerMyTurn: {
    backgroundColor: COLORS.glass.backgroundLight,
  },
  colorIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
    marginLeft: 8,
  },
  textContainer: {
    flex: 1,
  },
  turnLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  turnHint: {
    fontSize: 12,
    color: COLORS.text.muted,
    marginTop: 2,
  },
  waitingBanner: {
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
});

export default TurnBanner;
