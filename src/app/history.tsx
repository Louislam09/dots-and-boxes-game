// app/history.tsx - Game history screen (Clean)

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
import { gameService, GameRecord } from '../services/pocketbase/games';
import { Avatar, GlassCard, LoadingSpinner } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { formatRelativeTime, formatDuration } from '../utils/helpers';
import { COLORS, getPlayerColor } from '../constants/colors';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [games, setGames] = useState<GameRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Animation values
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    loadGames();
  }, []);

  const loadGames = async (pageNum = 1) => {
    if (!user) return;

    setIsLoading(pageNum === 1);
    const result = await gameService.getUserGames(user.id, pageNum, 20);
    
    if (result.success && result.games) {
      if (pageNum === 1) {
        setGames(result.games);
      } else {
        setGames((prev) => [...prev, ...result.games!]);
      }
      setHasMore((result.totalPages || 1) > pageNum);
    }
    setIsLoading(false);
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadGames(nextPage);
    }
  };

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const getResult = (game: GameRecord) => {
    if (game.isDraw) return { text: 'Draw', color: COLORS.status.warning };
    if (game.winner === user?.id) return { text: 'Won', color: COLORS.status.success };
    return { text: 'Lost', color: COLORS.status.error };
  };

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
        <Text style={styles.headerTitle}>Game History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        {isLoading && games.length === 0 ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
                loadMore();
              }
            }}
            scrollEventThrottle={400}
          >
            {games.map((game) => {
              const result = getResult(game);
              const myPlayer = game.players.find((p) => p.id === user?.id);
              const opponent = game.players.find((p) => p.id !== user?.id);
              const myPlayerIndex = game.players.findIndex((p) => p.id === user?.id);
              const opponentIndex = game.players.findIndex((p) => p.id !== user?.id);

              return (
                <GlassCard key={game.id} style={styles.gameCard}>
                  {/* Header */}
                  <View style={styles.gameHeader}>
                    <Text style={[styles.resultText, { color: result.color }]}>
                      {result.text}
                    </Text>
                    <Text style={styles.gameTime}>
                      {formatRelativeTime(game.finishedAt)}
                    </Text>
                  </View>

                  {/* Scores */}
                  <View style={styles.scoresContainer}>
                    <View style={styles.playerSection}>
                      <Avatar name={myPlayer?.name || 'You'} size="md" />
                      <Text style={styles.playerLabel}>You</Text>
                      <Text
                        style={[styles.playerScore, { color: getPlayerColor(myPlayerIndex) }]}
                      >
                        {myPlayer?.score || 0}
                      </Text>
                    </View>

                    <Text style={styles.vsText}>vs</Text>

                    <View style={styles.playerSection}>
                      <Avatar name={opponent?.name || 'Opponent'} size="md" />
                      <Text style={styles.playerLabel} numberOfLines={1}>
                        {opponent?.name || 'Opponent'}
                      </Text>
                      <Text
                        style={[styles.playerScore, { color: getPlayerColor(opponentIndex) }]}
                      >
                        {opponent?.score || 0}
                      </Text>
                    </View>
                  </View>

                  {/* Footer */}
                  <View style={styles.gameFooter}>
                    <Text style={styles.gameMode}>
                      {game.gameMode === '1vs1' ? '1v1' : '3 Players'}
                    </Text>
                    <Text style={styles.gameMeta}>
                      {game.totalMoves} moves • {formatDuration(game.duration)}
                    </Text>
                  </View>
                </GlassCard>
              );
            })}

            {games.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🎮</Text>
                <Text style={styles.emptyTitle}>No Games Yet</Text>
                <Text style={styles.emptyText}>
                  Play some games to see your history!
                </Text>
              </View>
            )}

            {isLoading && games.length > 0 && (
              <View style={styles.loadMoreContainer}>
                <LoadingSpinner size="small" />
              </View>
            )}
          </ScrollView>
        )}
      </Animated.View>
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
    paddingBottom: 16,
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameCard: {
    marginBottom: 12,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '700',
  },
  gameTime: {
    fontSize: 12,
    color: COLORS.text.muted,
  },
  scoresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  playerSection: {
    flex: 1,
    alignItems: 'center',
  },
  playerLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 6,
    maxWidth: 80,
    textAlign: 'center',
  },
  playerScore: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.muted,
    paddingHorizontal: 12,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.glass.border,
  },
  gameMode: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  gameMeta: {
    fontSize: 12,
    color: COLORS.text.muted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
