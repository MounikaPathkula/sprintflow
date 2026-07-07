import React, { createContext, useContext, useState } from 'react';
import { authApi } from '../api/client.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'sprintflow_token';
const USER_KEY = 'sprintflow_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  function persist(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  }

  async function login(email, password) {
    const data = await authApi.login({ email, password });
    persist(data.token, data.user);
  }

  async function register(name, email, password) {
    const data = await authApi.register({ name, email, password });
    persist(data.token, data.user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
