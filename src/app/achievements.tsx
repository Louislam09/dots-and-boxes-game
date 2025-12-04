// app/achievements.tsx - Achievements screen

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui';
import { ACHIEVEMENTS, getAchievementsByCategory } from '../constants/achievements';
import type { AchievementCategory } from '../types/achievement';

const CATEGORIES: { key: AchievementCategory; label: string; icon: string }[] = [
  { key: 'games', label: 'Games Played', icon: '🎮' },
  { key: 'wins', label: 'Victories', icon: '🏆' },
  { key: 'score', label: 'Score', icon: '⭐' },
  { key: 'special', label: 'Special', icon: '💎' },
];

export default function AchievementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Calculate unlocked achievements based on user stats
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
        // Special achievements need individual tracking
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

  return (
    <View
      className="flex-1 bg-gray-50"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3"
        >
          <Text className="text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">🏅 Achievements</Text>
      </View>

      {/* Progress Summary */}
      <View className="px-4 mb-4">
        <Card variant="elevated">
          <View className="items-center">
            <Text className="text-4xl font-bold text-indigo-600">
              {unlockedCount}/{totalAchievements}
            </Text>
            <Text className="text-gray-500 mt-1">Achievements Unlocked</Text>
            <View className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <View
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${(unlockedCount / totalAchievements) * 100}%` }}
              />
            </View>
          </View>
        </Card>
      </View>

      {/* Achievements by Category */}
      <ScrollView className="flex-1 px-4">
        {CATEGORIES.map((category) => {
          const achievements = getAchievementsByCategory(category.key);

          return (
            <View key={category.key} className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                {category.icon} {category.label}
              </Text>

              {achievements.map((achievement) => {
                const unlocked = isUnlocked(achievement.key);
                const progress = getProgress(achievement.key);

                return (
                  <Card
                    key={achievement.key}
                    className={`mb-2 ${unlocked ? '' : 'opacity-60'}`}
                  >
                    <View className="flex-row items-center">
                      <View
                        className={`
                          w-12 h-12 rounded-xl items-center justify-center mr-3
                          ${unlocked ? 'bg-indigo-100' : 'bg-gray-200'}
                        `}
                      >
                        <Text className="text-2xl">
                          {unlocked ? achievement.icon : '🔒'}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900">
                          {achievement.name}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {achievement.description}
                        </Text>
                        {!unlocked && (
                          <View className="mt-2">
                            <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <View
                                className="h-full bg-indigo-400 rounded-full"
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </View>
                            <Text className="text-xs text-gray-400 mt-1">
                              {progress.current} / {progress.target}
                            </Text>
                          </View>
                        )}
                      </View>
                      {unlocked && (
                        <View className="items-end">
                          <Text className="text-emerald-500 font-bold">✓</Text>
                          <Text className="text-xs text-indigo-600">
                            +{achievement.experienceReward} XP
                          </Text>
                        </View>
                      )}
                    </View>
                  </Card>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

