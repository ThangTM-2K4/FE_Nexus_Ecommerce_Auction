import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import { clearAuctionIntroSession } from '../utils/auctionIntroSession';

const AuthContext = createContext(null);

const restoreSessionUser = () => {
  if (authService.hadStoredSession() && !authService.isSessionValid()) {
    authService.clearSession();
    return null;
  }

  return authService.getCurrentUser();
};

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => restoreSessionUser());
  const [loading, setLoading] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const sessionExpired = authService.hadStoredSession() && !authService.isSessionValid();

    if (sessionExpired) {
      authService.clearSession();
      setUser(null);

      if (!window.location.pathname.includes('/login')) {
        navigate('/login', { replace: true });
      }
      setAuthInitialized(true);
      return;
    }

    setUser(authService.getCurrentUser());
    setAuthInitialized(true);
  }, [navigate]);

  const login = useCallback(async (loginValue, password) => {
    setLoading(true);
    try {
      const sessionUser = await authService.login(loginValue, password);
      flushSync(() => setUser(sessionUser));
      return sessionUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser?.id) {
        clearAuctionIntroSession(currentUser.id);
      }
      flushSync(() => setUser(null));
      await authService.logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(() => {
    const current = restoreSessionUser();
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

  const isAuthenticated = Boolean(user?.id);
  const isApprovedSeller = user?.sellerStatus === 'APPROVED';
  const currentMode = user?.currentMode || 'BUYER';
  const isBuyerMode = currentMode === 'BUYER';
  const isSellerMode = currentMode === 'SELLER';

  const value = useMemo(
    () => ({
      user,
      loading,
      authInitialized,
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
      authInitialized,
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
