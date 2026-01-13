// app/lobby/[code].tsx - Game lobby screen (Clean)

import { useEffect, useState } from 'react';
import { View, Text, BackHandler, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../../contexts/GameContext';
import { useSocket } from '../../contexts/SocketContext';
import { roomService } from '../../services/pocketbase';
import { WaitingRoom } from '../../components/game/WaitingRoom';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Toast, useToast } from '../../components/ui/Toast';
import { COLORS } from '../../constants/colors';

export default function LobbyScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const insets = useSafeAreaInsets();
  const { gameState } = useGame();
  const { leaveRoom } = useSocket();
  const { toast, showError, hideToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (gameState?.status === 'playing') {
      router.replace(`/game/${code}`);
    }
  }, [gameState?.status, code, router]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleLeave();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleLeave = async () => {
    leaveRoom();
    
    if (gameState?.roomId) {
      await roomService.leaveRoom(gameState.roomId);
    }
    
    router.replace('/home');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner message="Loading lobby..." />
      </View>
    );
  }

  if (!gameState) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorIcon}>🚫</Text>
          <Text style={styles.errorTitle}>Room Not Found</Text>
          <Text style={styles.errorMessage}>
            The room may have been closed or expired.
          </Text>
          <Text
            style={styles.errorLink}
            onPress={() => router.replace('/home')}
          >
            Go Home
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <WaitingRoom onLeave={handleLeave} />
      <Toast {...toast} onHide={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorContent: {
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 56,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorLink: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent.primary,
  },
});
