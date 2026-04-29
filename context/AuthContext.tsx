"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Matched perfectly to UserResponse.java
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender?: string;
  familyName?: string;
  familyId?: string; // Added since UserResponse returns this
  reputationScore?: number;
  treesPlanted?: number; // Added since UserResponse returns this
}

// 2. Must match the fields in SignupRequest.java exactly!
export interface RegisterData {
  firstName: string;
  lastName: string;
  familyName: string;
  email: string;
  password: string;
  familySize: number; // Changed from 'size' to match backend DTO
  address: string; // Added to match backend DTO
  role: string; // Ensure this matches backend (e.g., "MEMBER")
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

// 3. Updated to the standard Spring Boot port 8080
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    // 4. FIX: Backend returns a flat object, so `data` IS the user + token
    const data = await response.json();
    
    setToken(data.token);
    setUser(data); // Removed data.user
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data)); // Store the whole flat object
  };

  const register = async (data: RegisterData) => {
    // 5. FIX: Match the AuthController endpoint
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    // 6. FIX: Backend returns a flat object for signup as well
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}