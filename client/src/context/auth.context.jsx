import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as authService from '../services/auth.service';
import { dashboardPath } from '../routing.paths';

export const AuthContext = createContext(null);
const AUTH_TOKEN_KEY = 'final-third-auth-token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = useCallback(async () => {
    try {
      const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setUser(null);
        return null;
      }

      const response = await authService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        return response.data;
      }
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
      return null;
    } catch {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        await refreshUser();
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    bootstrap();
  }, [refreshUser]);

  const loginMemberAction = useCallback(
    async (credentials) => {
      try {
        const response = await authService.loginMember(credentials);
        if (!response.success) {
          toast.error(response.message || 'Unable to log in');
          return;
        }

        const token = response.token || response.data?.token;
        if (!token) {
          toast.error('Unable to start session');
          return;
        }

        setUser(response.data);
        sessionStorage.setItem(AUTH_TOKEN_KEY, token);
        navigate(dashboardPath(response.data.role), { replace: true });
        toast.success('Welcome back!');
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          'Unable to log in';
        toast.error(message);
      }
    },
    [navigate],
  );

  const loginAdminAction = useCallback(
    async (credentials) => {
      try {
        const response = await authService.loginAdmin(credentials);
        if (!response.success) {
          toast.error(response.message || 'Unable to log in');
          return;
        }

        const token = response.token || response.data?.token;
        if (!token) {
          toast.error('Unable to start admin session');
          return;
        }

        setUser(response.data);
        sessionStorage.setItem(AUTH_TOKEN_KEY, token);
        navigate('/admin/dashboard', { replace: true });
        toast.success('Welcome back, Admin');
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          'Unable to log in';
        toast.error(message);
      }
    },
    [navigate],
  );

  const logoutAction = useCallback(async () => {
    try {
      if (user?.role === 'admin') {
        await authService.logoutAdmin();
      } else {
        await authService.logout();
      }
    } finally {
      setUser(null);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      navigate(user?.role === 'admin' ? '/admin/login' : '/login', { replace: true });
      toast.success('Logged out successfully');
    }
  }, [navigate, user?.role]);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      refreshUser,
      loginMemberAction,
      loginAdminAction,
      logoutAction,
    }),
    [
      loginAdminAction,
      loginMemberAction,
      logoutAction,
      loading,
      refreshUser,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
