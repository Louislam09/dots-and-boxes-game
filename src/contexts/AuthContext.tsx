// contexts/AuthContext.tsx - Authentication context with local-first approach

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { authService } from '../services/pocketbase';
import { pb } from '../services/pocketbase/client';
import {
  initLocalStore,
  saveSession,
  getSession,
  isSessionValid,
  clearSession,
  saveUser,
  getUser,
  updateUser,
  clearUser,
  clearAllData,
} from '../services/localStore';
import type { User, RegisterData, LoginData } from '../types/user';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOffline: boolean;
  login: (data: LoginData) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Initialize auth on mount - LOCAL FIRST
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Initialize local store first
        await initLocalStore();

        // 2. Try to load user from local store (instant)
        const localUser = getUser();
        const session = getSession();

        if (localUser && session && isSessionValid()) {
          // Set user immediately from local store
          setUser(localUser);

          // 3. Try to sync with server in background (non-blocking)
          syncWithServerInBackground(session.token);
        } else {
          // No valid local session, try server auth
          await tryServerAuth();
        }
      } catch (error) {
        console.error('Auth init error:', error);
        // Fallback: try to load from local even if something fails
        try {
          const localUser = getUser();
          if (localUser) {
            setUser(localUser);
            setIsOffline(true);
          }
        } catch {
          // Ignore fallback errors
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Try to authenticate with server
  const tryServerAuth = async () => {
    try {
      if (pb.authStore.isValid) {
        await pb.collection('users').authRefresh();
        const serverUser = pb.authStore.record as unknown as User;

        // Save to local store
        saveUser(serverUser);
        saveSession(pb.authStore.token, serverUser.id);

        setUser(serverUser);
        setIsOffline(false);
      }
    } catch (error) {
      console.error('Server auth failed:', error);
      // Clear invalid server auth
      pb.authStore.clear();
    }
  };

  // Sync with server in background (non-blocking)
  const syncWithServerInBackground = async (token: string) => {
    try {
      // Restore token to PocketBase
      if (token && !pb.authStore.isValid) {
        // Try to refresh with the stored token
        pb.authStore.save(token, null);
      }

      if (pb.authStore.isValid) {
        await pb.collection('users').authRefresh();
        const serverUser = pb.authStore.record as unknown as User;

        // Update local store with fresh server data
        saveUser(serverUser);
        saveSession(pb.authStore.token, serverUser.id);

        // Update state with server data
        setUser(serverUser);
        setIsOffline(false);
      }
    } catch (error) {
      console.warn('Background sync failed, using local data:', error);
      setIsOffline(true);
    }
  };

  // Login
  const login = useCallback(async (data: LoginData) => {
    try {
      const result = await authService.login(data);

      if (result.success && result.user) {
        // Save to local store
        saveUser(result.user);
        saveSession(pb.authStore.token, result.user.id);

        setUser(result.user);
        setIsOffline(false);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please check your connection.' };
    }
  }, []);

  // Register
  const register = useCallback(async (data: RegisterData) => {
    try {
      const result = await authService.register(data);

      if (result.success && result.user) {
        // Save to local store
        saveUser(result.user);
        saveSession(pb.authStore.token, result.user.id);

        setUser(result.user);
        setIsOffline(false);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Registration failed. Please check your connection.' };
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    // Clear server auth
    authService.logout();

    // Clear local store
    clearAllData();

    setUser(null);
    setIsOffline(false);
  }, []);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    try {
      const isValid = await authService.refreshAuth();

      if (isValid) {
        const serverUser = authService.getCurrentUser();
        if (serverUser) {
          // Update local store
          saveUser(serverUser);
          setUser(serverUser);
          setIsOffline(false);
        }
      } else {
        // Server auth invalid, check if we have local data
        const localUser = getUser();
        if (localUser && isSessionValid()) {
          setUser(localUser);
          setIsOffline(true);
        } else {
          // No valid auth anywhere
          clearAllData();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // Fallback to local data
      const localUser = getUser();
      if (localUser) {
        setUser(localUser);
        setIsOffline(true);
      }
    }
  }, []);

  // Manual sync with server
  const syncWithServer = useCallback(async () => {
    const session = getSession();
    if (session && isSessionValid()) {
      await syncWithServerInBackground(session.token);
    }
  }, []);

  // Get auth token
  const getToken = useCallback(() => {
    // Try server token first
    const serverToken = authService.getToken();
    if (serverToken) return serverToken;

    // Fallback to local session token
    const session = getSession();
    return session?.token || null;
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isOffline,
    login,
    register,
    logout,
    refreshUser,
    syncWithServer,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
