// app/home.tsx - Home screen (Minimalist)

import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  useSharedValue,
} from 'react-native-reanimated';
import { useAuth } from '../contexts/AuthContext';
import { getExperienceToNextLevel } from '../constants/game';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  // Simple fade in animation
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  if (!user) return null;

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
            paddingBottom: insets.bottom + 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={contentAnimatedStyle}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              style={styles.profileButton}
            >
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
            </TouchableOpacity>

            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv. {user.level}</Text>
            </View>
          </View>

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

          {/* Quick Links */}
          <View style={styles.linksSection}>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/leaderboard')}
            >
              <Text style={styles.linkIcon}>🏆</Text>
              <Text style={styles.linkText}>Leaderboard</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/history')}
            >
              <Text style={styles.linkIcon}>📜</Text>
              <Text style={styles.linkText}>Game History</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/achievements')}
            >
              <Text style={styles.linkIcon}>🏅</Text>
              <Text style={styles.linkText}>Achievements</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            onPress={() => {
              logout();
              router.replace('/login');
            }}
            style={styles.signOutButton}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 40,
  },
  profileButton: {
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
    marginBottom: 40,
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
    marginBottom: 32,
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
  linksSection: {
    marginBottom: 32,
    gap: 2,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  linkIcon: {
    fontSize: 18,
    marginRight: 14,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
  },
  linkArrow: {
    fontSize: 16,
    color: COLORS.text.muted,
  },
  signOutButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  signOutText: {
    fontSize: 14,
    color: COLORS.text.muted,
  },
});
