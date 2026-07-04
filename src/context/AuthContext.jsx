import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('fde_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const u = await authAPI.me();
      setUser(u);
    } catch {
      localStorage.removeItem('fde_token');
      localStorage.removeItem('fde_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (username, password) => {
    const data = await authAPI.login({ username, password });
    localStorage.setItem('fde_token', data.token);
    localStorage.setItem('fde_user', JSON.stringify(data.user));
    // Immediately refresh to get full profile (name, avatar_url) from /me
    await checkAuth();
    return data;
  };

  const register = async (username, password, email) => {
    const data = await authAPI.register({ username, password, email });
    localStorage.setItem('fde_token', data.token);
    localStorage.setItem('fde_user', JSON.stringify(data.user));
    // Immediately refresh to get full profile (name, avatar_url) from /me
    await checkAuth();
    return data;
  };

  const logout = () => {
    localStorage.removeItem('fde_token');
    localStorage.removeItem('fde_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
