/**
 * Authentication Context
 * Manages user authentication state and provides auth functions
 */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, type User } from '@/lib/api/services';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (code: string, redirectUri: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        await refreshUser();
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login with Google OAuth code
   */
  const login = async (code: string, redirectUri: string) => {
    try {
      setLoading(true);

      // Exchange code for tokens
      const tokens = await authService.googleLogin(code, redirectUri);

      // Save tokens
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);

      // Fetch user data
      await refreshUser();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.clear();
    }
  };

  /**
   * Refresh user data from API
   */
  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Clear invalid tokens
      localStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
