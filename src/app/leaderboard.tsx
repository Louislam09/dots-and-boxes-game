// app/leaderboard.tsx - Leaderboard screen

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { leaderboardService, LeaderboardType, LeaderboardEntry } from '../services/pocketbase/leaderboard';
import { Avatar, Card, LoadingSpinner } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

const TABS: { key: LeaderboardType; label: string; icon: string }[] = [
  { key: 'wins', label: 'Wins', icon: '🏆' },
  { key: 'winRate', label: 'Win Rate', icon: '📈' },
  { key: 'score', label: 'Score', icon: '⭐' },
  { key: 'streak', label: 'Streak', icon: '🔥' },
  { key: 'level', label: 'Level', icon: '📊' },
];

export default function LeaderboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<LeaderboardType>('wins');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    const result = await leaderboardService.getLeaderboard(activeTab, 50);
    if (result.success && result.entries) {
      setEntries(result.entries);
    }
    setIsLoading(false);
  };

  const formatValue = (value: number, type: LeaderboardType) => {
    if (type === 'winRate') return `${value}%`;
    return value.toString();
  };

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
        <Text className="text-2xl font-bold text-gray-900">🏆 Leaderboard</Text>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 mb-4"
        contentContainerStyle={{ gap: 8 }}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`
              px-4 py-2 rounded-full flex-row items-center
              ${activeTab === tab.key ? 'bg-indigo-600' : 'bg-white'}
            `}
          >
            <Text className="mr-1">{tab.icon}</Text>
            <Text
              className={`font-medium ${
                activeTab === tab.key ? 'text-white' : 'text-gray-700'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Leaderboard */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4">
          {entries.map((entry) => (
            <Card
              key={entry.user.id}
              className={`mb-2 ${entry.user.id === user?.id ? 'border-2 border-indigo-500' : ''}`}
            >
              <View className="flex-row items-center">
                <View className="w-10 items-center">
                  {entry.rank <= 3 ? (
                    <Text className="text-2xl">
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                    </Text>
                  ) : (
                    <Text className="text-lg font-bold text-gray-400">
                      {entry.rank}
                    </Text>
                  )}
                </View>
                <Avatar
                  name={entry.user.displayName || entry.user.username}
                  size="md"
                  className="mx-3"
                />
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">
                    {entry.user.displayName || entry.user.username}
                    {entry.user.id === user?.id && ' (You)'}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Level {entry.user.level}
                  </Text>
                </View>
                <Text className="text-xl font-bold text-indigo-600">
                  {formatValue(entry.value, activeTab)}
                </Text>
              </View>
            </Card>
          ))}

          {entries.length === 0 && (
            <View className="items-center py-10">
              <Text className="text-gray-500">No entries yet</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

