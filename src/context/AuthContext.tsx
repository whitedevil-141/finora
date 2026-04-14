// @ts-nocheck
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authSignup,
  authLogin,
  authGoogle,
  authGetMe,
  setToken,
  clearToken,
  getToken,
  type AuthResult,
} from '../api';

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
  loginWithGoogle: () => Promise<void>;
  loginWithGoogleToken: (idToken: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = 'finora_auth_user';
const JUST_LOGGED_IN_KEY = 'finora_just_logged_in';

/** Convert backend user object to AuthUser */
function toAuthUser(u: AuthResult['user']): AuthUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar_url: u.avatar_url,
    provider: (u.provider as 'email' | 'google') || 'email',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Combined state prevents intermediate renders where isInitializing=false but user=null,
  // which caused the LoginPage to flash briefly before the Dashboard appeared.
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

  // ── Restore session on mount ──────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // --- Handle Google OAuth Full Redirect ---
        const hash = window.location.hash;
        if (hash && hash.includes('id_token=')) {
          const params = new URLSearchParams(hash.substring(1));
          const idToken = params.get('id_token');
          if (idToken) {
            // Clean up the URL hash
            window.history.replaceState({}, document.title, '/home');

            try {
              const result = await authGoogle(idToken);
              setToken(result.access_token);
              const authUser = toAuthUser(result.user);
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
              localStorage.setItem(JUST_LOGGED_IN_KEY, 'true');
              setAuthError(null);
              setAuthState({ user: authUser, isInitializing: false });
              setJustLoggedIn(true);
              // Clear flag after 10 seconds
              setTimeout(() => {
                localStorage.removeItem(JUST_LOGGED_IN_KEY);
                setJustLoggedIn(false);
              }, 10000);
              return;
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Google login failed';
              setAuthError(message);
              localStorage.removeItem(AUTH_STORAGE_KEY);
              clearToken();
              setAuthState({ user: null, isInitializing: false });
              return;
            }
          }
        }

        // Check if we have a cached user and valid token
        const cachedUserJson = localStorage.getItem(AUTH_STORAGE_KEY);
        const token = getToken();
        const justLoggedInFlag = localStorage.getItem(JUST_LOGGED_IN_KEY) === 'true';
        
        // Set the flag in state for this session
        if (justLoggedInFlag) {
          setJustLoggedIn(true);
          // Clear it from localStorage after 10 seconds
          setTimeout(() => {
            localStorage.removeItem(JUST_LOGGED_IN_KEY);
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
                setAuthState(prev => ({ ...prev, user: authUser }));
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
              }
            } catch (error) {
              // Only logout on explicit 401 (unauthorized)
              const is401 = (error as any)?.status === 401 || error?.message?.includes('Unauthorized');
              if (is401) {
                localStorage.removeItem(AUTH_STORAGE_KEY);
                clearToken();
                setAuthState({ user: null, isInitializing: false });
                setAuthError('Session expired. Please log in again.');
              }
              // Otherwise silently ignore backend errors and keep cached user
            }
          } catch {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            clearToken();
            setAuthState({ user: null, isInitializing: false });
          }
        } else if (token) {
          // Have token but no cached user - validate with backend
          try {
            const backendUser = await authGetMe();
            if (backendUser) {
              const authUser = toAuthUser(backendUser);
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
              setAuthState({ user: authUser, isInitializing: false });
            } else {
              localStorage.removeItem(AUTH_STORAGE_KEY);
              clearToken();
              setAuthState({ user: null, isInitializing: false });
            }
          } catch (error) {
            // Only logout on 401
            const is401 = (error as any)?.status === 401 || error?.message?.includes('Unauthorized');
            if (is401) {
              localStorage.removeItem(AUTH_STORAGE_KEY);
              clearToken();
              setAuthState({ user: null, isInitializing: false });
            } else {
              // Network/other errors - try to use cached user
              try {
                const stored = localStorage.getItem(AUTH_STORAGE_KEY);
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

  // Persist user to localStorage — only remove after init completes
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else if (!isInitializing) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user, isInitializing]);

  // ── Login with email + password ───────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authLogin(email, password);
      setToken(result.access_token);
      const authUser = toAuthUser(result.user);
      setAuthError(null);
      setAuthState(prev => ({ ...prev, user: authUser }));
      localStorage.setItem(JUST_LOGGED_IN_KEY, 'true');
      setJustLoggedIn(true);
      setTimeout(() => {
        localStorage.removeItem(JUST_LOGGED_IN_KEY);
        setJustLoggedIn(false);
      }, 10000);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Google OAuth login ────────────────────────────────────────
  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const clientId = '502378101113-5jgniiln3mcbf1r0ajd7t9s7fkbcb76j.apps.googleusercontent.com';
      if (!clientId) {
        throw new Error('Google OAuth is not configured. Missing VITE_GOOGLE_CLIENT_ID.');
      }

      // Use popup with callback route
      const redirectUri = encodeURIComponent(window.location.origin + '/finora/oauth-callback');
      const nonce = Math.random().toString(36).substring(2);
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=id_token&scope=email%20profile&nonce=${nonce}&prompt=select_account`;
      
      // Open popup window for Google OAuth
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        authUrl,
        'Google Login',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      if (!popup) {
        setIsLoading(false);
        throw new Error('Failed to open login popup. Please allow popups for this site.');
      }

      // Listen for message from popup window
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          popup?.close();
          
          try {
            const idToken = event.data.idToken;
            const result = await authGoogle(idToken);
            setToken(result.access_token);
            const authUser = toAuthUser(result.user);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
            localStorage.setItem(JUST_LOGGED_IN_KEY, 'true');
            setAuthError(null);
            setAuthState({ user: authUser, isInitializing: false });
            setJustLoggedIn(true);
            setTimeout(() => {
              localStorage.removeItem(JUST_LOGGED_IN_KEY);
              setJustLoggedIn(false);
            }, 10000);
            setIsLoading(false);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Google login failed';
            setAuthError(message);
            localStorage.removeItem(AUTH_STORAGE_KEY);
            clearToken();
            setAuthState({ user: null, isInitializing: false });
            setIsLoading(false);
          }
        } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
          window.removeEventListener('message', handleMessage);
          popup?.close();
          setIsLoading(false);
          setAuthError(event.data.error || 'Google login failed');
          setAuthState({ user: null, isInitializing: false });
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Fallback timeout to close popup and stop loading
      const timeout = setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        if (popup && !popup.closed) {
          popup.close();
        }
        setIsLoading(false);
      }, 300000); // 5 minutes timeout

      // Clean up timeout when popup closes
      const checkPopupClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopupClosed);
          clearTimeout(timeout);
          window.removeEventListener('message', handleMessage);
          setIsLoading(false);
        }
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  // ── Handle OAuth token from callback (main window path) ────────
  const loginWithGoogleToken = useCallback(async (idToken: string) => {
    setIsLoading(true);
    try {
      const result = await authGoogle(idToken);
      setToken(result.access_token);
      const authUser = toAuthUser(result.user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      localStorage.setItem(JUST_LOGGED_IN_KEY, 'true');
      setAuthError(null);
      setAuthState({ user: authUser, isInitializing: false });
      setJustLoggedIn(true);
      setTimeout(() => {
        localStorage.removeItem(JUST_LOGGED_IN_KEY);
        setJustLoggedIn(false);
      }, 10000);
      setIsLoading(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google login failed';
      setAuthError(message);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      clearToken();
      setAuthState({ user: null, isInitializing: false });
      setIsLoading(false);
      throw error;
    }
  }, []);

  // ── Signup ────────────────────────────────────────────────────
  const signup = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authSignup(name, email, password);
      setToken(result.access_token);
      const authUser = toAuthUser(result.user);
      setAuthError(null);
      setAuthState(prev => ({ ...prev, user: authUser }));
      localStorage.setItem(JUST_LOGGED_IN_KEY, 'true');
      setJustLoggedIn(true);
      setTimeout(() => {
        localStorage.removeItem(JUST_LOGGED_IN_KEY);
        setJustLoggedIn(false);
      }, 10000);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setAuthState({ user: null, isInitializing: false });
    clearToken();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(JUST_LOGGED_IN_KEY);
    setAuthError(null);
  }, []);

  // ── Refresh user data from backend ────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const backendUser = await authGetMe();
      if (backendUser) {
        const authUser = toAuthUser(backendUser);
        setAuthState(prev => ({ ...prev, user: authUser }));
      }
    } catch {
      // silently fail
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isInitializing,
      isLoading,
      authError,
      login,
      loginWithGoogle,
      loginWithGoogleToken,
      signup,
      logout,
      refreshUser,
      clearAuthError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
