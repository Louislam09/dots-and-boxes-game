// components/game/ScoreBoard.tsx - Score display component (Clean)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../ui/GlassCard';
import { Avatar } from '../ui/Avatar';
import { COLORS, getPlayerColor } from '../../constants/colors';

export function ScoreBoard() {
  const { gameState, isMyTurn } = useGame();
  const { user } = useAuth();

  if (!gameState) return null;

  const { players, currentTurnPlayerId } = gameState;

  return (
    <GlassCard variant="elevated" style={styles.container}>
      <View style={styles.playersRow}>
        {players.map((player, index) => {
          const isCurrentTurn = player.id === currentTurnPlayerId;
          const isMe = player.id === user?.id;
          const playerColor = getPlayerColor(index);

          return (
            <PlayerScore
              key={player.id}
              name={isMe ? 'You' : player.name}
              score={player.score}
              color={playerColor}
              isCurrentTurn={isCurrentTurn}
            />
          );
        })}
      </View>
    </GlassCard>
  );
}

interface PlayerScoreProps {
  name: string;
  score: number;
  color: string;
  isCurrentTurn: boolean;
}

function PlayerScore({ name, score, color, isCurrentTurn }: PlayerScoreProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isCurrentTurn) {
      scale.value = withSpring(1.03, { damping: 15, stiffness: 200 });
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  }, [isCurrentTurn]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.playerCard,
        isCurrentTurn && styles.playerCardActive,
        isCurrentTurn && { borderColor: color },
        animatedStyle,
      ]}
    >
      {isCurrentTurn && (
        <View style={[styles.turnIndicator, { backgroundColor: color }]} />
      )}

      <Avatar name={name} size="sm" />

      <View style={styles.playerInfo}>
        <Text style={styles.playerName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.playerScore, { color }]}>{score}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  playersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  playerCard: {
    flex: 1,
    backgroundColor: COLORS.glass.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerCardActive: {
    backgroundColor: COLORS.glass.backgroundLight,
  },
  turnIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  playerInfo: {
    marginLeft: 10,
    flex: 1,
  },
  playerName: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  playerScore: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 2,
  },
});

export default ScoreBoard;
