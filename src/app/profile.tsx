// app/profile.tsx - User profile screen

import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useSound } from '../contexts/SoundContext';
import { Avatar, Card, Button } from '../components/ui';
import { getExperienceToNextLevel } from '../constants/game';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useSound();

  if (!user) return null;

  const expProgress = getExperienceToNextLevel(user.experience);
  const winRate = user.totalGamesPlayed > 0
    ? Math.round((user.totalWins / user.totalGamesPlayed) * 1000) / 10
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
      <View className="flex-row items-center px-4 mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3"
        >
          <Text className="text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Profile</Text>
      </View>

      {/* Profile Card */}
      <View className="px-4 mb-6">
        <Card variant="elevated">
          <View className="items-center py-4">
            <Avatar
              name={user.displayName || user.username}
              size="xl"
            />
            <Text className="mt-4 text-xl font-bold text-gray-900">
              {user.displayName || user.username}
            </Text>
            <Text className="text-gray-500">@{user.username}</Text>

            {/* Level Progress */}
            <View className="w-full mt-4">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600 font-medium">Level {user.level}</Text>
                <Text className="text-gray-500 text-sm">
                  {expProgress.current} / {expProgress.required} XP
                </Text>
              </View>
              <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${expProgress.percentage}%` }}
                />
              </View>
            </View>
          </View>
        </Card>
      </View>

      {/* Stats */}
      <View className="px-4 mb-6">
        <Card>
          <Text className="text-lg font-bold text-gray-900 mb-4">📊 Statistics</Text>
          <View className="flex-row flex-wrap">
            <StatItem label="Total Games" value={user.totalGamesPlayed} />
            <StatItem label="Wins" value={user.totalWins} color="text-emerald-600" />
            <StatItem label="Losses" value={user.totalLosses} color="text-red-500" />
            <StatItem label="Draws" value={user.totalDraws} />
            <StatItem label="Win Rate" value={`${winRate}%`} />
            <StatItem label="Total Score" value={user.totalScore} color="text-indigo-600" />
            <StatItem label="Current Streak" value={user.currentStreak} icon="🔥" />
            <StatItem label="Best Streak" value={user.bestStreak} icon="⚡" />
          </View>
        </Card>
      </View>

      {/* Settings */}
      <View className="px-4 mb-6">
        <Card>
          <Text className="text-lg font-bold text-gray-900 mb-4">⚙️ Settings</Text>
          
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
          />
        </Card>
      </View>

      {/* Sign Out */}
      <View className="px-4">
        <Button
          title="Sign Out"
          onPress={() => {
            logout();
            router.replace('/login');
          }}
          variant="danger"
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
    <View className="w-1/2 items-center py-3">
      <Text className={`text-xl font-bold ${color}`}>
        {icon && <Text>{icon} </Text>}
        {value}
      </Text>
      <Text className="text-gray-500 text-sm">{label}</Text>
    </View>
  );
}

interface SettingRowProps {
  icon: string;
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

function SettingRow({ icon, label, value, onToggle }: SettingRowProps) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <View className="flex-row items-center">
        <Text className="text-xl mr-3">{icon}</Text>
        <Text className="text-gray-700 font-medium">{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
        thumbColor={value ? '#6366F1' : '#9CA3AF'}
      />
    </View>
  );
}

