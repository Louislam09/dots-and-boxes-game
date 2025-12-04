// services/pocketbase/client.ts - PocketBase client instance

import PocketBase from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../constants/config';

// Create PocketBase instance
const pb = new PocketBase(CONFIG.POCKETBASE_URL);

// Configure PocketBase to use AsyncStorage for auth persistence
pb.authStore.onChange(async (token, model) => {
  try {
    if (token && model) {
      await AsyncStorage.setItem(
        CONFIG.STORAGE_KEYS.AUTH_TOKEN,
        JSON.stringify({ token, model })
      );
    } else {
      await AsyncStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }
  } catch (error) {
    console.error('Error persisting auth state:', error);
  }
});

// Load auth from storage on init
export async function initAuth(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (stored) {
      const { token, model } = JSON.parse(stored);
      pb.authStore.save(token, model);

      // Verify token is still valid
      if (pb.authStore.isValid) {
        // Refresh auth
        await pb.collection('users').authRefresh();
        return true;
      }
    }
  } catch (error) {
    console.error('Error loading auth from storage:', error);
    pb.authStore.clear();
  }
  return false;
}

// Export singleton instance
export { pb };
export default pb;

