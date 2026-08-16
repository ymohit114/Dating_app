'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser, IProfile } from '@/types';
import { api, ApiError } from '@/lib/api-client';

interface AuthContextType {
  user: IUser | null;
  profile: IProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<IProfile>) => Promise<boolean>;
  setSubscriptionTier: (tier: 'free' | 'gold' | 'platinum') => void;
  subscriptionTier: 'free' | 'gold' | 'platinum';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'gold' | 'platinum'>('free');
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session from /api/auth/me on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await api.get('/api/auth/me');
        if (res && res.user) {
          setUser(res.user);
          setProfile(res.profile || null);
          if (res.accessToken) setToken(res.accessToken);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch {
        // Not logged in or invalid token
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.post('/api/auth/login', { email, password: pass });
      if (res && res.user) {
        setUser(res.user);
        setProfile(res.profile || null);
        if (res.accessToken) {
          setToken(res.accessToken);
          localStorage.setItem('elance_token', res.accessToken);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      const res = await api.post('/api/auth/register', data);
      if (res && res.user) {
        setUser(res.user);
        setProfile(res.profile || null);
        if (res.accessToken) {
          setToken(res.accessToken);
          localStorage.setItem('elance_token', res.accessToken);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Registration error:', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout', {});
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setProfile(null);
      setToken(null);
      localStorage.removeItem('elance_token');
      window.location.href = '/login';
    }
  };

  const updateProfile = async (updates: Partial<IProfile>): Promise<boolean> => {
    try {
      const res = await api.put('/api/profile', updates);
      if (res && res.profile) {
        setProfile(res.profile);
      } else {
        setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      }
      return true;
    } catch (err) {
      console.error('Update profile error:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        subscriptionTier,
        setSubscriptionTier,
      }}
    >
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

export default useAuth;
