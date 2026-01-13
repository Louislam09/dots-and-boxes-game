// components/game/GameOverModal.tsx - Game over modal (Dark Gaming Theme)

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { Modal } from '../ui/Modal';
import { GlowButton } from '../ui/GlowButton';
import { Avatar } from '../ui/Avatar';
import { GlassCard } from '../ui/GlassCard';
import { COLORS, getPlayerColor } from '../../constants/colors';

const { width } = Dimensions.get('window');

interface GameOverModalProps {
  visible: boolean;
  onClose: () => void;
  onLeaveRoom: () => void;
}

export function GameOverModal({ visible, onClose, onLeaveRoom }: GameOverModalProps) {
  const { gameState } = useGame();
  const { user } = useAuth();
  const { requestPlayAgain } = useSocket();

  // Animation values
  const trophyScale = useSharedValue(0);
  const trophyRotate = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);
  const resultsOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      trophyScale.value = withDelay(200, withSpring(1, { damping: 8, stiffness: 150 }));
      trophyRotate.value = withDelay(200, withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 200 }),
        withTiming(0, { duration: 100 })
      ));
      confettiOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
      resultsOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    } else {
      trophyScale.value = 0;
      confettiOpacity.value = 0;
      resultsOpacity.value = 0;
    }
  }, [visible]);

  const trophyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: trophyScale.value },
      { rotate: `${trophyRotate.value}deg` },
    ],
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  const resultsStyle = useAnimatedStyle(() => ({
    opacity: resultsOpacity.value,
  }));

  if (!gameState) return null;

  const { winner, isDraw, players } = gameState;
  const isWinner = winner?.id === user?.id;
  const winnerIndex = players.findIndex((p) => p.id === winner?.id);
  const winnerColor = winner ? getPlayerColor(winnerIndex) : COLORS.accent.primary;

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      closeOnBackdrop={false}
      size="md"
    >
      <View style={styles.container}>
        {/* Confetti/celebration background */}
        <Animated.View style={[styles.confetti, confettiStyle]}>
          {['🎉', '✨', '🎊', '⭐'].map((emoji, i) => (
            <ConfettiPiece key={i} emoji={emoji} delay={i * 200} />
          ))}
        </Animated.View>

        {/* Trophy/Result Icon */}
        <Animated.View style={[styles.trophyContainer, trophyAnimatedStyle]}>
          <View style={[styles.trophyBg, { backgroundColor: isDraw ? COLORS.status.warning : winnerColor }]}>
            <Text style={styles.trophyEmoji}>
              {isDraw ? '🤝' : isWinner ? '🏆' : '😢'}
            </Text>
          </View>
        </Animated.View>

        {/* Result Title */}
        <Text style={styles.resultTitle}>
          {isDraw ? 'It\'s a Draw!' : isWinner ? 'You Won!' : 'You Lost'}
        </Text>
        <Text style={styles.resultSubtitle}>
          {isDraw
            ? 'Great match! You both played well.'
            : isWinner
            ? 'Congratulations! Amazing gameplay!'
            : `${winner?.name || 'Opponent'} wins this round.`}
        </Text>

        {/* Results Card */}
        <Animated.View style={[styles.resultsContainer, resultsStyle]}>
          <GlassCard style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Final Scores</Text>
            {sortedPlayers.map((player, index) => {
              const playerIndex = players.findIndex((p) => p.id === player.id);
              const playerColor = getPlayerColor(playerIndex);
              const isMe = player.id === user?.id;
              const isFirst = index === 0 && !isDraw;

              return (
                <View
                  key={player.id}
                  style={[
                    styles.playerRow,
                    isFirst && styles.playerRowWinner,
                    isFirst && { borderColor: playerColor },
                  ]}
                >
                  <View style={styles.playerRank}>
                    <Text style={styles.rankText}>
                      {isFirst ? '👑' : index + 1}
                    </Text>
                  </View>
                  <Avatar name={player.name} size="sm" glowColor={isFirst ? playerColor : undefined} />
                  <Text style={styles.playerName}>
                    {player.name}
                    {isMe && <Text style={styles.youText}> (You)</Text>}
                  </Text>
                  <Text style={[styles.playerScore, { color: playerColor }]}>
                    {player.score}
                  </Text>
                </View>
              );
            })}
          </GlassCard>
        </Animated.View>

        {/* Actions */}
        <View style={styles.actions}>
          <GlowButton
            title="🔄  Play Again"
            onPress={() => {
              requestPlayAgain();
              onClose();
            }}
            fullWidth
            size="lg"
            glow
          />
          <GlowButton
            title="Leave Room"
            onPress={onLeaveRoom}
            variant="ghost"
            fullWidth
            size="md"
          />
        </View>
      </View>
    </Modal>
  );
}

interface ConfettiPieceProps {
  emoji: string;
  delay: number;
}

function ConfettiPiece({ emoji, delay }: ConfettiPieceProps) {
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(10, { duration: 2000 }),
        withTiming(-50, { duration: 0 })
      ),
      -1,
      false
    ));
    opacity.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      false
    ));
    rotate.value = withDelay(delay, withRepeat(
      withTiming(360, { duration: 2000 }),
      -1,
      false
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.confettiPiece, style]}>
      {emoji}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 20,
  },
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  confettiPiece: {
    fontSize: 24,
  },
  trophyContainer: {
    marginBottom: 20,
  },
  trophyBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  trophyEmoji: {
    fontSize: 48,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  resultsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  resultsCard: {
    padding: 12,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: COLORS.glass.background,
  },
  playerRowWinner: {
    borderWidth: 2,
    backgroundColor: COLORS.glass.backgroundLight,
  },
  playerRank: {
    width: 28,
    alignItems: 'center',
    marginRight: 8,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.secondary,
  },
  playerName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: 10,
  },
  youText: {
    color: COLORS.text.muted,
    fontWeight: '400',
  },
  playerScore: {
    fontSize: 20,
    fontWeight: '800',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
});

export default GameOverModal;
