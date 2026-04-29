"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Matches UserResponse.java
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  token: string;
  familyId?: string;
  familyName?: string;
  reputationScore?: number;
}
// Matches SignupRequest.java
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  familyName: string;
  address: string;
  familySize: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8443/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error accessing localStorage", error);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error('Invalid credentials');
    const data = await response.json();
    setToken(data.token);
    setUser(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
  };

  const register = async (data: RegisterData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Registration failed');
    const dataResponse = await response.json();
    setToken(dataResponse.token);
    setUser(dataResponse);
    localStorage.setItem('token', dataResponse.token);
    localStorage.setItem('user', JSON.stringify(dataResponse));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}