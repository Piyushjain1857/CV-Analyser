import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  // Theme Management (Dark / Light / System)
  const [themePreference, setThemePreference] = useState(() => {
    try {
      const saved = localStorage.getItem('cv_insight_theme_pref');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
      const legacySaved = localStorage.getItem('cv_insight_theme');
      if (legacySaved === 'light' || legacySaved === 'dark') return legacySaved;
    } catch {
      // Ignore
    }
    return 'system';
  });

  const getSystemTheme = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  }, []);

  const [theme, setTheme] = useState(() => {
    try {
      const savedPref = localStorage.getItem('cv_insight_theme_pref');
      if (savedPref === 'light' || savedPref === 'dark') return savedPref;
      const legacySaved = localStorage.getItem('cv_insight_theme');
      if (legacySaved === 'light' || legacySaved === 'dark') return legacySaved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch {
      // Ignore
    }
    return 'dark';
  });

  // Keep theme synced with themePreference & system preference
  useEffect(() => {
    const applyTheme = (computedTheme) => {
      setTheme(computedTheme);
      document.documentElement.setAttribute('data-theme', computedTheme);
      try {
        localStorage.setItem('cv_insight_theme', computedTheme);
        localStorage.setItem('cv_insight_theme_pref', themePreference);
      } catch {
        // Ignore
      }
    };

    if (themePreference === 'system') {
      applyTheme(getSystemTheme());
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const handleChange = (e) => {
        applyTheme(e.matches ? 'light' : 'dark');
      };
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    } else {
      applyTheme(themePreference);
    }
  }, [themePreference, getSystemTheme]);

  const toggleTheme = useCallback(() => {
    setThemePreference((prev) => {
      const next = (prev === 'dark' ? 'light' : 'dark');
      return next;
    });
  }, []);

  // Sidebar Collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('cv_insight_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cv_insight_sidebar_collapsed', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  // Backend health state
  const [health, setHealth] = useState({
    status: 'checking',
    operational: false,
    latencyMs: null,
    dbStatus: 'checking',
    lastChecked: null,
    error: null,
  });

  // Data states
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [stats, setStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toast notification state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, type = 'info', message = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check backend health
  const checkHealth = useCallback(async () => {
    try {
      const start = Date.now();
      const res = await api.getHealth();
      const latency = Date.now() - start;

      setHealth({
        status: res.status || 'operational',
        operational: res.status === 'operational',
        latencyMs: res.metrics?.database?.latencyMs ?? latency,
        dbStatus: res.metrics?.database?.status || 'connected',
        rawMetrics: res.metrics,
        lastChecked: new Date(),
        error: null,
      });
    } catch (err) {
      setHealth({
        status: 'disconnected',
        operational: false,
        latencyMs: null,
        dbStatus: 'disconnected',
        lastChecked: new Date(),
        error: err.message,
      });
    }
  }, []);

  // Fetch tenant-isolated resumes
  const fetchResumes = useCallback(async () => {
    if (!isAuthenticated) {
      setResumes([]);
      return;
    }
    setLoadingResumes(true);
    try {
      const res = await api.getResumes();
      if (res.success && res.data) {
        setResumes(res.data);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoadingResumes(false);
    }
  }, [isAuthenticated]);

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) {
      setStats(null);
      return;
    }
    try {
      const res = await api.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, [isAuthenticated]);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setUserProfile(null);
      return;
    }
    try {
      const res = await api.getProfile();
      if (res.success && res.data) {
        setUserProfile(res.data);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }, [isAuthenticated]);

  const fetchLatestAnalysis = useCallback(async () => {
    if (!isAuthenticated) {
      setActiveAnalysis(null);
      return;
    }
    try {
      const res = await api.getLatestAnalysis();
      if (res.success && res.data) {
        setActiveAnalysis(res.data);
      }
    } catch (err) {
      console.error('Failed to load latest analysis:', err);
    }
  }, [isAuthenticated]);

  // Initial mount health check & polling
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Re-fetch data when user changes or authenticates
  useEffect(() => {
    if (isAuthenticated) {
      fetchResumes();
      fetchStats();
      fetchProfile();
      fetchLatestAnalysis();
    } else {
      setResumes([]);
      setStats(null);
      setUserProfile(null);
      setActiveAnalysis(null);
    }
  }, [isAuthenticated, user, fetchResumes, fetchStats, fetchProfile, fetchLatestAnalysis]);

  const value = {
    theme,
    setTheme,
    themePreference,
    setThemePreference,
    toggleTheme,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebarCollapse,
    health,
    checkHealth,
    resumes,
    loadingResumes,
    fetchResumes,
    activeAnalysis,
    setActiveAnalysis,
    stats,
    fetchStats,
    userProfile: userProfile || user,
    setUserProfile,
    fetchProfile,
    toasts,
    addToast,
    removeToast,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleMobileSidebar: () => setIsMobileSidebarOpen((prev) => !prev),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
