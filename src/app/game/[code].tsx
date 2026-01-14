// app/game/[code].tsx - Active game screen (Clean)

import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, BackHandler, Dimensions, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  useSharedValue,
} from 'react-native-reanimated';
import { useGame } from '../../contexts/GameContext';
import { useSocket } from '../../contexts/SocketContext';
import { useSound } from '../../contexts/SoundContext';
import { useAlert } from '../../contexts/AlertContext';
import { roomService } from '../../services/pocketbase';
import { gameStorage } from '../../utils/storage';
import { GameBoard, ScoreBoard, TurnBanner, GameOverModal } from '../../components/game';
import { Toast, useToast } from '../../components/ui/Toast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { COLORS } from '../../constants/colors';

export default function GameScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const insets = useSafeAreaInsets();
  const { gameState, clearSelection } = useGame();
  const { leaveRoom } = useSocket();
  const { triggerHaptic, playSound } = useSound();
  const { confirm } = useAlert();
  const { toast, showInfo, hideToast } = useToast();

  const [showGameOver, setShowGameOver] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const boardSize = screenWidth - 32; // Full width minus padding

  // Animation values
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Show game over modal when game finishes
  useEffect(() => {
    if (gameState?.status === 'finished') {
      setShowGameOver(true);
      triggerHaptic(gameState.winner ? 'success' : 'warning');
    }
  }, [gameState?.status]);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmLeave();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const confirmLeave = () => {
    // Don't confirm if game is already over
    if (gameState?.status === 'finished') {
      handleLeave();
      return;
    }

    confirm(
      'Leave Game?',
      'Are you sure you want to leave? The game is still in progress and you will forfeit.',
      handleLeave
    );
  };

  const handleLeave = async () => {
    leaveRoom();

    // Clear active room on leave
    await gameStorage.clearActiveRoom();

    if (gameState?.roomId) {
      await roomService.leaveRoom(gameState.roomId);
    }

    router.replace('/');
  };

  if (!gameState) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner message="Loading game..." />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={confirmLeave}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.roomBadge}>
            <Text style={styles.roomLabel}>Room</Text>
            <Text style={styles.roomCode}>{code}</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Turn Banner */}
        <View style={styles.turnSection}>
          <TurnBanner />
        </View>

        {/* Score Board */}
        <View style={styles.scoreSection}>
          <ScoreBoard />
        </View>

        {/* Game Board */}
        <View style={styles.boardSection}>
          <View style={styles.boardWrapper}>
            <GameBoard size={boardSize} />
          </View>
        </View>

        {/* Helper Text */}
        <View style={styles.helperSection}>
          <Text style={styles.helperText}>
            {gameState.status === 'playing'
              ? 'Tap two adjacent dots to draw a line'
              : 'Waiting for game to start...'}
          </Text>
        </View>
      </Animated.View>

      {/* Game Over Modal */}
      <GameOverModal
        visible={showGameOver}
        onClose={() => setShowGameOver(false)}
        onLeaveRoom={handleLeave}
      />

      <Toast {...toast} onHide={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.text.primary,
  },
  roomBadge: {
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomLabel: {
    fontSize: 12,
    color: COLORS.text.muted,
  },
  roomCode: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent.primary,
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 44,
  },
  turnSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scoreSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  boardSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  boardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  helperSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  helperText: {
    textAlign: 'center',
    fontSize: 13,
    color: COLORS.text.muted,
  },
});
