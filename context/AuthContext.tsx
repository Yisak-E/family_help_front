"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  familyName: string;
  email: string;
  contactPerson: string;
  phone: string;
  address: string;
  reputationScore: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  familyName: string;
  email: string;
  password: string;
  contactPerson: string;
  phone: string;
  address: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Wrap localStorage in a try-catch just in case it's accessed in a weird environment, 
    // though the useEffect ensures it only runs on the client.
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockToken = 'mock_jwt_token_' + Date.now();
    const mockUser: User = {
      id: '1',
      familyName: 'Smith Family',
      email,
      contactPerson: 'John Smith',
      phone: '+971-50-123-4567',
      address: 'Dubai Marina, Dubai',
      reputationScore: 4.5
    };

    setToken(mockToken);
    setUser(mockUser);
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const register = async (data: RegisterData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockToken = 'mock_jwt_token_' + Date.now();
    const mockUser: User = {
      id: Date.now().toString(),
      familyName: data.familyName,
      email: data.email,
      contactPerson: data.contactPerson,
      phone: data.phone,
      address: data.address,
      reputationScore: 0
    };

    setToken(mockToken);
    setUser(mockUser);
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}