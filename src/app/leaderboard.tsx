// app/leaderboard.tsx - Leaderboard screen (Clean)

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  useSharedValue,
} from 'react-native-reanimated';
import { leaderboardService, LeaderboardType, LeaderboardEntry } from '../services/pocketbase/leaderboard';
import { Avatar, GlassCard, LoadingSpinner } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';

const TABS: { key: LeaderboardType; label: string }[] = [
  { key: 'wins', label: 'Wins' },
  { key: 'winRate', label: 'Rate' },
  { key: 'score', label: 'Score' },
  { key: 'streak', label: 'Streak' },
  { key: 'level', label: 'Level' },
];

export default function LeaderboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<LeaderboardType>('wins');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
  }, []);

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

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const formatValue = (value: number, type: LeaderboardType) => {
    if (type === 'winRate') return `${value}%`;
    return value.toString();
  };

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          >
            {/* Top 3 Podium */}
            {top3.length >= 3 && (
              <View style={styles.podiumContainer}>
                <PodiumCard
                  entry={top3[1]}
                  rank={2}
                  activeTab={activeTab}
                  isCurrentUser={top3[1].user.id === user?.id}
                />
                <PodiumCard
                  entry={top3[0]}
                  rank={1}
                  activeTab={activeTab}
                  isCurrentUser={top3[0].user.id === user?.id}
                />
                <PodiumCard
                  entry={top3[2]}
                  rank={3}
                  activeTab={activeTab}
                  isCurrentUser={top3[2].user.id === user?.id}
                />
              </View>
            )}

            {/* Rest of the list */}
            <View style={styles.listContainer}>
              {rest.map((entry) => (
                <GlassCard
                  key={entry.user.id}
                  style={[
                    styles.listItem,
                    entry.user.id === user?.id && styles.listItemCurrentUser,
                  ]}
                >
                  <View style={styles.listItemContent}>
                    <View style={styles.rankContainer}>
                      <Text style={styles.rankText}>{entry.rank}</Text>
                    </View>
                    <Avatar
                      name={entry.user.displayName || entry.user.username}
                      size="md"
                    />
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>
                        {entry.user.displayName || entry.user.username}
                        {entry.user.id === user?.id && <Text style={styles.youBadge}> (You)</Text>}
                      </Text>
                      <Text style={styles.userLevel}>Level {entry.user.level}</Text>
                    </View>
                    <Text style={styles.listValue}>
                      {formatValue(entry.value, activeTab)}
                    </Text>
                  </View>
                </GlassCard>
              ))}

              {entries.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>🏆</Text>
                  <Text style={styles.emptyText}>No entries yet</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

interface PodiumCardProps {
  entry: LeaderboardEntry;
  rank: number;
  activeTab: LeaderboardType;
  isCurrentUser: boolean;
}

function PodiumCard({ entry, rank, activeTab, isCurrentUser }: PodiumCardProps) {
  const isFirst = rank === 1;
  const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
  const podiumHeight = isFirst ? 100 : rank === 2 ? 80 : 64;

  const formatValue = (value: number, type: LeaderboardType) => {
    if (type === 'winRate') return `${value}%`;
    return value.toString();
  };

  return (
    <View style={[styles.podiumCard, isFirst && styles.podiumCardFirst]}>
      <Text style={styles.medalEmoji}>{medalEmoji}</Text>
      
      <Avatar
        name={entry.user.displayName || entry.user.username}
        size={isFirst ? 'lg' : 'md'}
      />

      <Text style={styles.podiumName} numberOfLines={1}>
        {entry.user.displayName || entry.user.username}
      </Text>

      <Text style={styles.podiumValue}>
        {formatValue(entry.value, activeTab)}
      </Text>

      <View style={[styles.podiumBase, { height: podiumHeight }]}>
        <Text style={styles.podiumRank}>{rank}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  tabsContainer: {
    flexGrow: 0,
    marginBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  tabActive: {
    backgroundColor: COLORS.accent.primary,
    borderColor: COLORS.accent.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  tabLabelActive: {
    color: COLORS.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  podiumCard: {
    alignItems: 'center',
    flex: 1,
  },
  podiumCardFirst: {
    marginBottom: 16,
  },
  medalEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 80,
  },
  podiumValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accent.primary,
    marginTop: 4,
    marginBottom: 8,
  },
  podiumBase: {
    width: '80%',
    backgroundColor: COLORS.glass.background,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    borderBottomWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumRank: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.muted,
  },
  listContainer: {
    gap: 8,
  },
  listItem: {
    padding: 12,
  },
  listItemCurrentUser: {
    borderWidth: 1.5,
    borderColor: COLORS.accent.primary,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.muted,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  youBadge: {
    color: COLORS.text.muted,
    fontWeight: '400',
  },
  userLevel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  listValue: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.accent.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.text.secondary,
  },
});
