// app/(tabs)/achievements.tsx - Achievements tab screen

import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  useSharedValue,
} from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components/ui';
import { ACHIEVEMENTS, getAchievementsByCategory } from '../../constants/achievements';
import { COLORS } from '../../constants/colors';
import type { AchievementCategory } from '../../types/achievement';

const CATEGORIES: { key: AchievementCategory; label: string }[] = [
  { key: 'games', label: 'Games Played' },
  { key: 'wins', label: 'Victories' },
  { key: 'score', label: 'Score' },
  { key: 'special', label: 'Special' },
];

export default function AchievementsTab() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Animation values
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const isUnlocked = (key: string): boolean => {
    if (!user) return false;
    
    const achievement = ACHIEVEMENTS[key];
    if (!achievement) return false;

    switch (achievement.category) {
      case 'games':
        return user.totalGamesPlayed >= achievement.requirement;
      case 'wins':
        return user.totalWins >= achievement.requirement;
      case 'score':
        return user.totalScore >= achievement.requirement;
      case 'special':
        if (key === 'streak_3') return user.bestStreak >= 3;
        if (key === 'streak_5') return user.bestStreak >= 5;
        if (key === 'streak_10') return user.bestStreak >= 10;
        return false;
      default:
        return false;
    }
  };

  const getProgress = (key: string): { current: number; target: number; percentage: number } => {
    if (!user) return { current: 0, target: 1, percentage: 0 };
    
    const achievement = ACHIEVEMENTS[key];
    if (!achievement) return { current: 0, target: 1, percentage: 0 };

    let current = 0;
    const target = achievement.requirement;

    switch (achievement.category) {
      case 'games':
        current = user.totalGamesPlayed;
        break;
      case 'wins':
        current = user.totalWins;
        break;
      case 'score':
        current = user.totalScore;
        break;
      case 'special':
        if (key.startsWith('streak')) {
          current = user.bestStreak;
        }
        break;
    }

    return {
      current: Math.min(current, target),
      target,
      percentage: Math.min((current / target) * 100, 100),
    };
  };

  const totalAchievements = Object.keys(ACHIEVEMENTS).length;
  const unlockedCount = Object.keys(ACHIEVEMENTS).filter(isUnlocked).length;
  const progressPercentage = (unlockedCount / totalAchievements) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>🏅 Achievements</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
      >
        <Animated.View style={contentAnimatedStyle}>
          {/* Progress Summary */}
          <GlassCard variant="elevated" style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <Text style={styles.summaryCount}>{unlockedCount}</Text>
              <Text style={styles.summaryTotal}>/ {totalAchievements}</Text>
            </View>
            <Text style={styles.summaryLabel}>Achievements Unlocked</Text>
            <View style={styles.summaryBar}>
              <View style={[styles.summaryBarFill, { width: `${progressPercentage}%` }]} />
            </View>
          </GlassCard>

          {/* Achievements by Category */}
          {CATEGORIES.map((category) => {
            const achievements = getAchievementsByCategory(category.key);

            return (
              <View key={category.key} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{category.label}</Text>

                {achievements.map((achievement) => {
                  const unlocked = isUnlocked(achievement.key);
                  const progress = getProgress(achievement.key);

                  return (
                    <GlassCard
                      key={achievement.key}
                      style={[
                        styles.achievementCard,
                        unlocked && styles.achievementCardUnlocked,
                      ]}
                    >
                      <View style={styles.achievementContent}>
                        <View style={[styles.achievementIcon, unlocked && styles.achievementIconUnlocked]}>
                          <Text style={styles.achievementEmoji}>
                            {unlocked ? achievement.icon : '🔒'}
                          </Text>
                        </View>

                        <View style={styles.achievementInfo}>
                          <Text style={[styles.achievementName, !unlocked && styles.achievementNameLocked]}>
                            {achievement.name}
                          </Text>
                          <Text style={styles.achievementDescription}>
                            {achievement.description}
                          </Text>

                          {!unlocked && (
                            <View style={styles.progressContainer}>
                              <View style={styles.progressBar}>
                                <View
                                  style={[styles.progressFill, { width: `${progress.percentage}%` }]}
                                />
                              </View>
                              <Text style={styles.progressText}>
                                {progress.current}/{progress.target}
                              </Text>
                            </View>
                          )}
                        </View>

                        {unlocked && (
                          <View style={styles.unlockedBadge}>
                            <Text style={styles.unlockedCheck}>✓</Text>
                          </View>
                        )}
                      </View>
                    </GlassCard>
                  );
                })}
              </View>
            );
          })}
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
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  summaryCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 24,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.accent.primary,
  },
  summaryTotal: {
    fontSize: 18,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  summaryBar: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.glass.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  summaryBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent.primary,
    borderRadius: 3,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  achievementCard: {
    marginBottom: 8,
    padding: 12,
  },
  achievementCardUnlocked: {
    borderColor: COLORS.accent.primary,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.glass.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementIconUnlocked: {
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
  },
  achievementEmoji: {
    fontSize: 20,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  achievementNameLocked: {
    color: COLORS.text.secondary,
  },
  achievementDescription: {
    fontSize: 12,
    color: COLORS.text.muted,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.glass.background,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.text.muted,
  },
  unlockedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedCheck: {
    fontSize: 14,
    color: COLORS.status.success,
    fontWeight: '700',
  },
});

