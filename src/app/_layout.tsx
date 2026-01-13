// app/_layout.tsx - Root layout with providers

import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AppProviders } from '../contexts';
import { COLORS } from '../constants/colors';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after app loads
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplash();
  }, []);

  return (
    <SafeAreaProvider>
      <AppProviders>
        <View style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.background.primary },
              animation: 'slide_from_right',
            }}
          >
            {/* Tabs group */}
            <Stack.Screen 
              name="(tabs)" 
              options={{ 
                headerShown: false,
                animation: 'fade',
              }} 
            />
            
            {/* Auth screens */}
            <Stack.Screen name="index" options={{ animation: 'fade' }} />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="forgot-password" />
            
            {/* Game screens */}
            <Stack.Screen name="create-room" />
            <Stack.Screen name="join-room" />
            <Stack.Screen name="lobby/[code]" />
            <Stack.Screen name="game/[code]" />
            <Stack.Screen name="history" />
          </Stack>
        </View>
      </AppProviders>
    </SafeAreaProvider>
  );
}
