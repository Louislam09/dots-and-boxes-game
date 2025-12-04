// app/history.tsx - Game history screen

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gameService, GameRecord } from '../services/pocketbase/games';
import { Avatar, Card, LoadingSpinner } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { formatRelativeTime, formatDuration } from '../utils/helpers';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [games, setGames] = useState<GameRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
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

  const getResult = (game: GameRecord) => {
    if (game.isDraw) return { text: 'Draw', color: 'text-amber-600', bg: 'bg-amber-100' };
    if (game.winner === user?.id) return { text: 'Won', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    return { text: 'Lost', color: 'text-red-500', bg: 'bg-red-100' };
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
        <Text className="text-2xl font-bold text-gray-900">📜 Game History</Text>
      </View>

      {/* Games List */}
      {isLoading && games.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
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

            return (
              <Card key={game.id} className="mb-3">
                <View className="flex-row items-center justify-between mb-3">
                  <View className={`px-3 py-1 rounded-full ${result.bg}`}>
                    <Text className={`font-semibold ${result.color}`}>
                      {result.text}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-sm">
                    {formatRelativeTime(game.finishedAt)}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  {/* You */}
                  <View className="items-center flex-1">
                    <Avatar name={myPlayer?.name || 'You'} size="md" />
                    <Text className="font-medium text-gray-900 mt-1">You</Text>
                    <Text
                      className="text-2xl font-bold"
                      style={{ color: myPlayer?.color }}
                    >
                      {myPlayer?.score || 0}
                    </Text>
                  </View>

                  {/* VS */}
                  <View className="px-4">
                    <Text className="text-gray-400 font-bold">VS</Text>
                  </View>

                  {/* Opponent */}
                  <View className="items-center flex-1">
                    <Avatar name={opponent?.name || 'Opponent'} size="md" />
                    <Text className="font-medium text-gray-900 mt-1">
                      {opponent?.name || 'Opponent'}
                    </Text>
                    <Text
                      className="text-2xl font-bold"
                      style={{ color: opponent?.color }}
                    >
                      {opponent?.score || 0}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
                  <Text className="text-gray-500 text-sm">
                    {game.gameMode === '1vs1' ? '1v1' : '3 Players'}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {game.totalMoves} moves • {formatDuration(game.duration)}
                  </Text>
                </View>
              </Card>
            );
          })}

          {games.length === 0 && (
            <View className="items-center py-10">
              <Text className="text-5xl mb-4">🎮</Text>
              <Text className="text-gray-500 text-center">
                No games played yet.{'\n'}Start playing to see your history!
              </Text>
            </View>
          )}

          {isLoading && games.length > 0 && (
            <View className="py-4">
              <LoadingSpinner size="small" />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

