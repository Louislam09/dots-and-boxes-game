// app/index.tsx - Entry point (splash/redirect)

import { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Redirect based on auth state
      if (isAuthenticated) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <View className="flex-1 bg-indigo-600 items-center justify-center">
      {/* Logo/Branding */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center mb-4 shadow-lg">
          <Text className="text-5xl">🎮</Text>
        </View>
        <Text className="text-3xl font-bold text-white">Dots & Boxes</Text>
        <Text className="text-indigo-200 mt-2">Connect. Complete. Conquer.</Text>
      </View>

      {/* Loading indicator */}
      <LoadingSpinner color="#FFFFFF" />
    </View>
  );
}
