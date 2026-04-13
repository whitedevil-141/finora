import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authLogin, authSignup, authGetMe, setToken, clearToken, getToken } from '../api/client';

const AUTH_STORAGE_KEY = 'finora_auth_user';
const JUST_LOGGED_IN_KEY = 'finora_just_logged_in';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  provider: 'email' | 'google';
  theme_preference: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function toAuthUser(u: any): AuthUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar_url: u.avatar_url,
    provider: (u.provider as 'email' | 'google') || 'email',
    theme_preference: u.theme_preference || 'dark',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<{
    user: AuthUser | null;
    isInitializing: boolean;
  }>({ user: null, isInitializing: true });
  const user = authState.user;
  const isInitializing = authState.isInitializing;
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const cachedUserJson = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        const token = await getToken();
        const justLoggedInFlag = (await AsyncStorage.getItem(JUST_LOGGED_IN_KEY)) === 'true';

        // Set the flag in state for this session
        if (justLoggedInFlag) {
          setJustLoggedIn(true);
          // Clear it from storage after 10 seconds
          setTimeout(() => {
            AsyncStorage.removeItem(JUST_LOGGED_IN_KEY);
            setJustLoggedIn(false);
          }, 10000);
        }

        if (cachedUserJson && token) {
          try {
            const cachedUser = JSON.parse(cachedUserJson);

            // Restore from cache immediately (trust cached data)
            setAuthState({ user: cachedUser, isInitializing: false });
            setAuthError(null);

            // Skip backend validation if we just logged in (let token settle)
            if (justLoggedInFlag) {
              return;
            }

            // Then validate with backend in background
            try {
              const backendUser = await authGetMe();
              if (backendUser) {
                // Update if backend data is fresher
                const authUser = toAuthUser(backendUser);
                setAuthState((prev) => ({ ...prev, user: authUser }));
                await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
              }
            } catch (error) {
              // Only logout on explicit 401 (unauthorized)
              const is401 = (error as any)?.status === 401 || error?.message?.includes('Unauthorized');
              if (is401) {
                await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
                clearToken();
                setAuthState({ user: null, isInitializing: false });
                setAuthError('Session expired. Please log in again.');
              }
              // Otherwise silently ignore backend errors and keep cached user
            }
          } catch {
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            clearToken();
            setAuthState({ user: null, isInitializing: false });
          }
        } else if (token) {
          // Have token but no cached user - validate with backend
          try {
            const backendUser = await authGetMe();
            if (backendUser) {
              const authUser = toAuthUser(backendUser);
              await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
              setAuthState({ user: authUser, isInitializing: false });
            } else {
              await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
              clearToken();
              setAuthState({ user: null, isInitializing: false });
            }
          } catch (error) {
            // Only logout on 401
            const is401 = (error as any)?.status === 401 || error?.message?.includes('Unauthorized');
            if (is401) {
              await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
              clearToken();
              setAuthState({ user: null, isInitializing: false });
            } else {
              // Network/other errors - try to use cached user
              try {
                const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
                if (stored) {
                  const cachedUser = JSON.parse(stored);
                  setAuthState({ user: cachedUser, isInitializing: false });
                } else {
                  setAuthState({ user: null, isInitializing: false });
                }
              } catch {
                setAuthState({ user: null, isInitializing: false });
              }
            }
          }
        } else {
          // No token and no cached user - user is not logged in
          setAuthState({ user: null, isInitializing: false });
        }
      } catch {
        setAuthState({ user: null, isInitializing: false });
      }
    };
    restoreSession();
  }, []);

  // Persist user to AsyncStorage
  useEffect(() => {
    if (user) {
      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else if (!isInitializing) {
      AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user, isInitializing]);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authLogin(email, password);
      await setToken(result.access_token);
      const authUser = toAuthUser(result.user);
      setAuthError(null);
      setAuthState((prev) => ({ ...prev, user: authUser }));
      await AsyncStorage.setItem(JUST_LOGGED_IN_KEY, 'true');
      setJustLoggedIn(true);
      setTimeout(() => {
        AsyncStorage.removeItem(JUST_LOGGED_IN_KEY);
        setJustLoggedIn(false);
      }, 10000);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Signup
  const signup = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authSignup(name, email, password);
      await setToken(result.access_token);
      const authUser = toAuthUser(result.user);
      setAuthError(null);
      setAuthState((prev) => ({ ...prev, user: authUser }));
      await AsyncStorage.setItem(JUST_LOGGED_IN_KEY, 'true');
      setJustLoggedIn(true);
      setTimeout(() => {
        AsyncStorage.removeItem(JUST_LOGGED_IN_KEY);
        setJustLoggedIn(false);
      }, 10000);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setAuthState({ user: null, isInitializing: false });
    clearToken();
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    await AsyncStorage.removeItem(JUST_LOGGED_IN_KEY);
    setAuthError(null);
  }, []);

  // Refresh user
  const refreshUser = useCallback(async () => {
    try {
      const backendUser = await authGetMe();
      if (backendUser) {
        const authUser = toAuthUser(backendUser);
        setAuthState((prev) => ({ ...prev, user: authUser }));
      }
    } catch {
      // silently fail
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isInitializing,
        isLoading,
        authError,
        login,
        signup,
        logout,
        refreshUser,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
