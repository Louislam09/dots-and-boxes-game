// app/(tabs)/index.tsx - Home tab screen

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { getExperienceToNextLevel } from '../../constants/game';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import { useSocket } from '../../contexts/SocketContext';
import { ActiveRoomData, gameStorage } from '../../utils/storage';

const { width } = Dimensions.get('window');

export default function HomeTab() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { joinRoom, isConnected } = useSocket();
  const { initGame } = useGame();
  const insets = useSafeAreaInsets();

  const [activeRoom, setActiveRoom] = useState<ActiveRoomData | null>(null);

  // Simple fade in animation
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));

    // Check for active room on mount
    checkActiveRoom();
  }, []);

  const checkActiveRoom = async () => {
    const room = await gameStorage.getActiveRoom();
    setActiveRoom(room);
  };

  const handleReconnect = async () => {
    if (!activeRoom || !isConnected) return;

    const maxPlayers = activeRoom.gameMode === '3players' ? 3 : activeRoom.gameMode === '4players' ? 4 : 2;
    initGame(activeRoom.roomCode, activeRoom.roomId, activeRoom.gameMode);
    joinRoom({
      roomCode: activeRoom.roomCode,
      roomId: activeRoom.roomId,
      gameMode: activeRoom.gameMode,
      maxPlayers,
    });

    // Navigate based on status
    if (activeRoom.status === 'playing') {
      router.push(`/game/${activeRoom.roomCode}`);
    } else {
      router.push(`/lobby/${activeRoom.roomCode}`);
    }
  };

  const handleDismissReconnect = async () => {
    await gameStorage.clearActiveRoom();
    setActiveRoom(null);
  };

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.replace('/login');
    return null;
  }

  const expProgress = getExperienceToNextLevel(user.experience);
  const winRate = user.totalGamesPlayed > 0
    ? Math.round((user.totalWins / user.totalGamesPlayed) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 20,
            paddingBottom: 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={contentAnimatedStyle}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(user.displayName || user.username).charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.greeting}>Hello,</Text>
                <Text style={styles.userName}>
                  {user.displayName || user.username}
                </Text>
              </View>
            </View>

            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv. {user.level}</Text>
            </View>
          </View>

          {/* Reconnect Banner */}
          {activeRoom && (
            <View style={styles.reconnectBanner}>
              <View style={styles.reconnectContent}>
                <Text style={styles.reconnectIcon}>🎮</Text>
                <View style={styles.reconnectTextContainer}>
                  <Text style={styles.reconnectTitle}>
                    {activeRoom.status === 'playing' ? 'Game in Progress' : 'Room Active'}
                  </Text>
                  <Text style={styles.reconnectSubtext}>
                    Room: {activeRoom.roomCode}
                  </Text>
                </View>
              </View>
              <View style={styles.reconnectActions}>
                <TouchableOpacity
                  onPress={handleDismissReconnect}
                  style={styles.reconnectDismissButton}
                >
                  <Text style={styles.reconnectDismissText}>✕</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleReconnect}
                  style={styles.reconnectButton}
                  disabled={!isConnected}
                >
                  <Text style={styles.reconnectButtonText}>Rejoin</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Main Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/create-room')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Create Room</Text>
              <Text style={styles.primaryButtonSubtext}>Start a new game</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/join-room')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Join Room</Text>
              <Text style={styles.secondaryButtonSubtext}>Enter room code</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionLabel}>Your Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.totalGamesPlayed}</Text>
                <Text style={styles.statLabel}>Played</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, styles.statValueWins]}>{user.totalWins}</Text>
                <Text style={styles.statLabel}>Wins</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{winRate}%</Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, styles.statValueStreak]}>
                  {user.currentStreak}
                </Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
            </View>
          </View>

          {/* XP Progress */}
          <View style={styles.xpSection}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpLabel}>Level {user.level}</Text>
              <Text style={styles.xpValue}>
                {expProgress.current} / {expProgress.required} XP
              </Text>
            </View>
            <View style={styles.xpBar}>
              <View style={[styles.xpBarFill, { width: `${expProgress.percentage}%` }]} />
            </View>
          </View>

          {/* Game History Link */}
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => router.push('/history')}
          >
            <Text style={styles.historyIcon}>📜</Text>
            <Text style={styles.historyText}>Game History</Text>
            <Text style={styles.historyArrow}>→</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.text.muted,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.background.primary,
  },
  userInfo: {
    marginLeft: 14,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.text.muted,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 2,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  actionsSection: {
    marginBottom: 32,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.accent.primary,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.background.primary,
  },
  primaryButtonSubtext: {
    fontSize: 13,
    color: 'rgba(10, 14, 39, 0.6)',
    marginTop: 4,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.glass.borderLight,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  secondaryButtonSubtext: {
    fontSize: 13,
    color: COLORS.text.muted,
    marginTop: 4,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.glass.background,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.glass.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statValueWins: {
    color: COLORS.status.success,
  },
  statValueStreak: {
    color: COLORS.status.warning,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.text.muted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  xpSection: {
    marginBottom: 24,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  xpLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  xpValue: {
    fontSize: 12,
    color: COLORS.text.muted,
  },
  xpBar: {
    height: 6,
    backgroundColor: COLORS.glass.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent.primary,
    borderRadius: 3,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.glass.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  historyIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  historyText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
  },
  historyArrow: {
    fontSize: 16,
    color: COLORS.text.muted,
  },
  reconnectBanner: {
    backgroundColor: COLORS.status.warning + '20',
    borderWidth: 1,
    borderColor: COLORS.status.warning,
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reconnectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reconnectIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  reconnectTextContainer: {
    flex: 1,
  },
  reconnectTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.status.warning,
    marginBottom: 2,
  },
  reconnectSubtext: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  reconnectActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reconnectDismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.glass.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reconnectDismissText: {
    fontSize: 14,
    color: COLORS.text.muted,
  },
  reconnectButton: {
    backgroundColor: COLORS.status.warning,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  reconnectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.background.primary,
  },
});

