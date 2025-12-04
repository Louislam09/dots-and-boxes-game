// app/home.tsx - Home/Dashboard screen

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Avatar } from '../components/ui';
import { getExperienceToNextLevel } from '../constants/game';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  if (!user) return null;

  const expProgress = getExperienceToNextLevel(user.experience);
  const winRate = user.totalGamesPlayed > 0
    ? Math.round((user.totalWins / user.totalGamesPlayed) * 100)
    : 0;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 20,
      }}
    >
      {/* Header */}
      <View className="px-4 flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <Avatar
            name={user.displayName || user.username}
            size="lg"
          />
          <View className="ml-3">
            <Text className="text-xl font-bold text-gray-900">
              {user.displayName || user.username}
            </Text>
            <Text className="text-gray-500">Level {user.level}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/profile')}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
        >
          <Text>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Level Progress */}
      <View className="px-4 mb-6">
        <Card variant="elevated">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-600 font-medium">Level {user.level}</Text>
            <Text className="text-gray-500 text-sm">
              {expProgress.current} / {expProgress.required} XP
            </Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${expProgress.percentage}%` }}
            />
          </View>
        </Card>
      </View>

      {/* Main Title */}
      <View className="items-center mb-6">
        <Text className="text-4xl font-bold text-gray-900">DOTS & BOXES</Text>
        <Text className="text-gray-500 mt-1">Connect. Complete. Conquer.</Text>
      </View>

      {/* Play Buttons */}
      <View className="px-4 gap-3 mb-6">
        <Button
          title="Create Room"
          onPress={() => router.push('/create-room')}
          fullWidth
          size="lg"
          icon={<Text>➕</Text>}
        />
        <Button
          title="Join Room"
          onPress={() => router.push('/join-room')}
          variant="secondary"
          fullWidth
          size="lg"
          icon={<Text>🔗</Text>}
        />
      </View>

      {/* Stats Card */}
      <View className="px-4 mb-6">
        <Card>
          <Text className="text-lg font-bold text-gray-900 mb-4">📊 Your Stats</Text>
          <View className="flex-row flex-wrap">
            <StatItem label="Games" value={user.totalGamesPlayed} />
            <StatItem label="Wins" value={user.totalWins} color="text-emerald-600" />
            <StatItem label="Win Rate" value={`${winRate}%`} />
            <StatItem label="Streak" value={user.currentStreak} icon="🔥" />
            <StatItem label="Best Streak" value={user.bestStreak} />
            <StatItem label="Total Score" value={user.totalScore} color="text-indigo-600" />
          </View>
        </Card>
      </View>

      {/* Quick Actions */}
      <View className="px-4 flex-row gap-3 mb-6">
        <TouchableOpacity
          onPress={() => router.push('/leaderboard')}
          className="flex-1 bg-white p-4 rounded-2xl items-center shadow-sm"
        >
          <Text className="text-2xl mb-1">🏆</Text>
          <Text className="text-gray-700 font-medium">Leaderboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/history')}
          className="flex-1 bg-white p-4 rounded-2xl items-center shadow-sm"
        >
          <Text className="text-2xl mb-1">📜</Text>
          <Text className="text-gray-700 font-medium">History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/achievements')}
          className="flex-1 bg-white p-4 rounded-2xl items-center shadow-sm"
        >
          <Text className="text-2xl mb-1">🏅</Text>
          <Text className="text-gray-700 font-medium">Achievements</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <View className="px-4">
        <Button
          title="Sign Out"
          onPress={() => {
            logout();
            router.replace('/login');
          }}
          variant="ghost"
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

interface StatItemProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: string;
}

function StatItem({ label, value, color = 'text-gray-900', icon }: StatItemProps) {
  return (
    <View className="w-1/3 items-center py-3">
      <Text className={`text-2xl font-bold ${color}`}>
        {icon && <Text>{icon}</Text>}
        {value}
      </Text>
      <Text className="text-gray-500 text-sm">{label}</Text>
    </View>
  );
}

