'use client';
// context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authApi,
  setTokens,
  clearTokens,
  getAccessToken,
  getFamilyId
} from '@/services/api';

import { LoginRequest,RegisterRequest, AuthResponse  } from '@/services/types';

interface AuthUser {
  familyId: string;
  familyName: string;
  accessToken: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token = getAccessToken();
    const familyId = getFamilyId();
    const familyName = localStorage.getItem('familyName');
    if (token && familyId && familyName) {
      setUser({ familyId, familyName, accessToken: token });
    }
    setLoading(false);
  }, []);

  const handleAuthResponse = useCallback((data: AuthResponse) => {
    // Only persist tokens when present and valid
    if (data.accessToken && data.refreshToken) {
      setTokens(data.accessToken, data.refreshToken);
    }
    localStorage.setItem('familyId', String(data.familyId));
    localStorage.setItem('familyName', data.familyName);
    setUser({
      familyId: String(data.familyId),
      familyName: data.familyName,
      accessToken: data.accessToken || '',
    });
  }, []);

  const login = useCallback(async (body: LoginRequest) => {
    const data = await authApi.login(body);
    console.log('Login response:', data);
    handleAuthResponse(data);
  }, [handleAuthResponse]);

  const register = useCallback(async (body: RegisterRequest) => {
    const data = await authApi.register(body);
    handleAuthResponse(data);
  }, [handleAuthResponse]);

  const logout = useCallback(() => {
    clearTokens();
    localStorage.removeItem('familyName');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
