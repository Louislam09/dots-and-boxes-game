// app/profile.tsx - User profile screen (Clean)

import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  useSharedValue,
} from 'react-native-reanimated';
import { useAuth } from '../contexts/AuthContext';
import { useSound } from '../contexts/SoundContext';
import { GlassCard, GlowButton } from '../components/ui';
import { getExperienceToNextLevel } from '../constants/game';
import { COLORS } from '../constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useSound();

  // Animation values
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  if (!user) return null;

  const expProgress = getExperienceToNextLevel(user.experience);
  const winRate = user.totalGamesPlayed > 0
    ? Math.round((user.totalWins / user.totalGamesPlayed) * 1000) / 10
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={contentAnimatedStyle}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Profile Card */}
          <GlassCard variant="elevated" style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(user.displayName || user.username).charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.displayName}>
                {user.displayName || user.username}
              </Text>
              <Text style={styles.username}>@{user.username}</Text>

              {/* Level Progress */}
              <View style={styles.levelSection}>
                <View style={styles.levelHeader}>
                  <Text style={styles.levelLabel}>Level {user.level}</Text>
                  <Text style={styles.levelXP}>
                    {expProgress.current} / {expProgress.required} XP
                  </Text>
                </View>
                <View style={styles.levelBarContainer}>
                  <View
                    style={[styles.levelBarFill, { width: `${expProgress.percentage}%` }]}
                  />
                </View>
              </View>
            </View>
          </GlassCard>

          {/* Stats */}
          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsGrid}>
              <StatItem label="Games" value={user.totalGamesPlayed} />
              <StatItem label="Wins" value={user.totalWins} color={COLORS.status.success} />
              <StatItem label="Losses" value={user.totalLosses} color={COLORS.status.error} />
              <StatItem label="Draws" value={user.totalDraws} />
              <StatItem label="Win Rate" value={`${winRate}%`} />
              <StatItem label="Total Score" value={user.totalScore} color={COLORS.accent.primary} />
              <StatItem label="Streak" value={user.currentStreak} />
              <StatItem label="Best Streak" value={user.bestStreak} />
            </View>
          </GlassCard>

          {/* Settings */}
          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <SettingRow
              icon="🔊"
              label="Sound Effects"
              value={settings.soundEnabled}
              onToggle={(value) => updateSettings({ soundEnabled: value })}
            />
            
            <SettingRow
              icon="🎵"
              label="Background Music"
              value={settings.musicEnabled}
              onToggle={(value) => updateSettings({ musicEnabled: value })}
            />
            
            <SettingRow
              icon="📳"
              label="Vibration"
              value={settings.vibrationEnabled}
              onToggle={(value) => updateSettings({ vibrationEnabled: value })}
              isLast
            />
          </GlassCard>

          {/* Sign Out */}
          <View style={styles.signOutContainer}>
            <GlowButton
              title="Sign Out"
              onPress={() => {
                logout();
                router.replace('/login');
              }}
              variant="danger"
              fullWidth
              size="lg"
            />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

interface StatItemProps {
  label: string;
  value: string | number;
  color?: string;
}

function StatItem({ label, value, color = COLORS.text.primary }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

interface SettingRowProps {
  icon: string;
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  isLast?: boolean;
}

function SettingRow({ icon, label, value, onToggle, isLast }: SettingRowProps) {
  return (
    <View style={[styles.settingRow, isLast && styles.settingRowLast]}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.glass.background, true: COLORS.accent.primary }}
        thumbColor={value ? '#FFFFFF' : COLORS.text.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 44,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.background.primary,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 20,
  },
  levelSection: {
    width: '100%',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  levelXP: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  levelBarContainer: {
    height: 6,
    backgroundColor: COLORS.glass.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  levelBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent.primary,
    borderRadius: 3,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: COLORS.text.primary,
  },
  signOutContainer: {
    marginTop: 8,
  },
});
