import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const login = useCallback(async (loginValue, password) => {
    setLoading(true);
    try {
      const sessionUser = await authService.login(loginValue, password);
      setUser(sessionUser);
      return sessionUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(() => {
    const current = authService.getCurrentUser();
    setUser(current);
    return current;
  }, []);

  const updateUser = useCallback((updates) => {
    const updated = authService.updateSessionUser(updates);
    setUser(updated);
    return updated;
  }, []);

  const switchAccountMode = useCallback(async (mode) => {
    setLoading(true);
    try {
      const updated = await authService.switchAccountMode(mode);
      flushSync(() => setUser(updated));
      return updated;
    } finally {
      setLoading(false);
    }
  }, []);

  const isAuthenticated = Boolean(user);
  const isApprovedSeller = user?.sellerStatus === 'APPROVED';
  const currentMode = user?.currentMode || 'BUYER';
  const isBuyerMode = currentMode === 'BUYER';
  const isSellerMode = currentMode === 'SELLER';

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      isApprovedSeller,
      currentMode,
      isBuyerMode,
      isSellerMode,
      login,
      logout,
      refreshUser,
      updateUser,
      switchAccountMode,
    }),
    [
      user,
      loading,
      isAuthenticated,
      isApprovedSeller,
      currentMode,
      isBuyerMode,
      isSellerMode,
      login,
      logout,
      refreshUser,
      updateUser,
      switchAccountMode,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
