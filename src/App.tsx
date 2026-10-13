import React, { useState, useEffect, useCallback } from 'react';
import { Profile, LinkItem, AppearanceSettings, AdminUser, ToastMessage } from './types/index.ts';
import { PublicProfile } from './pages/PublicProfile.tsx';
import { AdminLogin } from './admin/AdminLogin.tsx';
import { AdminDashboard } from './admin/AdminDashboard.tsx';
import { ToastContainer } from './components/Toast.tsx';
import {
  getLocalProfile,
  saveLocalProfile,
  getLocalLinks,
  saveLocalLinks,
  getLocalSettings,
  saveLocalSettings,
  DEFAULT_PROFILE,
  DEFAULT_LINKS,
  DEFAULT_SETTINGS
} from './lib/storage.ts';

export default function App() {
  // Navigation / Routing
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  // Application Data States - initialized with offline/default data immediately
  const [profile, setProfile] = useState<Profile>(() => getLocalProfile());
  const [links, setLinks] = useState<LinkItem[]>(() => getLocalLinks());
  const [settings, setSettings] = useState<AppearanceSettings>(() => getLocalSettings());

  // UI States
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Admin Auth States
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Sync browser URL
  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Toast dispatch helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch Public Profile and Settings with automatic fallback for Vercel / GitHub
  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [profileRes, linksRes, settingsRes] = await Promise.allSettled([
        fetch('/api/profile'),
        fetch('/api/links' + (currentPath.startsWith('/admin') ? '?all=true' : '')),
        fetch('/api/settings')
      ]);

      // Handle profile response
      if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
        try {
          const profileData = await profileRes.value.json();
          setProfile(profileData);
          saveLocalProfile(profileData);
        } catch {}
      } else {
        // Fallback to local profile
        setProfile(getLocalProfile());
      }

      // Handle links response
      if (linksRes.status === 'fulfilled' && linksRes.value.ok) {
        try {
          const linksData = await linksRes.value.json();
          if (Array.isArray(linksData) && linksData.length > 0) {
            setLinks(linksData);
            saveLocalLinks(linksData);
          }
        } catch {}
      } else {
        // Fallback to local links
        setLinks(getLocalLinks());
      }

      // Handle settings response
      if (settingsRes.status === 'fulfilled' && settingsRes.value.ok) {
        try {
          const settingsData = await settingsRes.value.json();
          setSettings((prev) => {
            const merged = { ...prev, ...settingsData };
            saveLocalSettings(merged);
            return merged;
          });
          if (settingsData.dark_mode === 'true') {
            setDarkMode(true);
          }
        } catch {}
      } else {
        const localSet = getLocalSettings();
        setSettings(localSet);
        if (localSet.dark_mode === 'true') {
          setDarkMode(true);
        }
      }
    } catch {
      // Never block the user - always ensure default/local Azryl Store profile is active
      setProfile(getLocalProfile());
      setLinks(getLocalLinks());
      setSettings(getLocalSettings());
    } finally {
      setLoading(false);
    }
  }, [currentPath]);

  // Check Admin Session on mount
  useEffect(() => {
    const checkAdmin = async () => {
      setCheckingAuth(true);
      const token = localStorage.getItem('azryl_admin_token');
      if (!token) {
        setAdmin(null);
        setCheckingAuth(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAdmin(data.admin);
        } else if (res.status === 404) {
          // If on static Vercel, read user from local storage
          const savedUser = localStorage.getItem('azryl_admin_user');
          if (savedUser) {
            setAdmin(JSON.parse(savedUser));
          } else {
            setAdmin({ id: 'admin-1', username: 'admin' });
          }
        } else {
          localStorage.removeItem('azryl_admin_token');
          setAdmin(null);
        }
      } catch {
        // Fallback for offline / static Vercel
        const savedUser = localStorage.getItem('azryl_admin_user');
        if (savedUser) {
          setAdmin(JSON.parse(savedUser));
        } else {
          setAdmin({ id: 'admin-1', username: 'admin' });
        }
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAdmin();
  }, []);

  // Load initial data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle Dark Mode
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Admin Actions
  const handleLoginSuccess = (user: AdminUser, token: string) => {
    setAdmin(user);
    localStorage.setItem('azryl_admin_token', token);
    localStorage.setItem('azryl_admin_user', JSON.stringify(user));
    showToast(`Selamat datang kembali, ${user.username}!`, 'success');
    navigate('/admin');
    fetchData();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('azryl_admin_token');
    localStorage.removeItem('azryl_admin_user');
    setAdmin(null);
    showToast('Anda telah keluar dari panel admin.', 'info');
    navigate('/');
  };

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    const updatedProfile = { ...profile, ...updates };
    setProfile(updatedProfile);
    saveLocalProfile(updatedProfile);

    try {
      const token = localStorage.getItem('azryl_admin_token');
      await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
    } catch {}
  };

  const handleAddLink = async (newLink: Omit<LinkItem, 'id'>) => {
    const createdLink: LinkItem = {
      ...newLink,
      id: 'link-' + Date.now()
    };
    const updatedLinks = [...links, createdLink];
    setLinks(updatedLinks);
    saveLocalLinks(updatedLinks);

    try {
      const token = localStorage.getItem('azryl_admin_token');
      await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newLink)
      });
    } catch {}
  };

  const handleEditLink = async (id: string, updated: Partial<LinkItem>) => {
    const updatedLinks = links.map((l) => (l.id === id ? { ...l, ...updated } : l));
    setLinks(updatedLinks);
    saveLocalLinks(updatedLinks);

    try {
      const token = localStorage.getItem('azryl_admin_token');
      await fetch(`/api/links/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });
    } catch {}
  };

  const handleDeleteLink = async (id: string) => {
    const updatedLinks = links.filter((l) => l.id !== id);
    setLinks(updatedLinks);
    saveLocalLinks(updatedLinks);

    try {
      const token = localStorage.getItem('azryl_admin_token');
      await fetch(`/api/links/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {}
  };

  const handleToggleLink = async (id: string, enabled: boolean) => {
    const link = links.find((l) => l.id === id);
    if (!link) return;
    await handleEditLink(id, { ...link, enabled });
    showToast(enabled ? 'Link diaktifkan' : 'Link dinonaktifkan', 'info');
  };

  const handleReorderLinks = async (reordered: LinkItem[]) => {
    setLinks(reordered);
    saveLocalLinks(reordered);

    try {
      const token = localStorage.getItem('azryl_admin_token');
      const items = reordered.map((l, idx) => ({ id: l.id, sort_order: idx + 1 }));
      await fetch('/api/links/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items })
      });
    } catch {}
  };

  const handleUpdateSettings = async (updates: Partial<AppearanceSettings>) => {
    const merged: AppearanceSettings = { ...settings };
    (Object.keys(updates) as (keyof AppearanceSettings)[]).forEach((key) => {
      const val = updates[key];
      if (val !== undefined) {
        merged[key] = val;
      }
    });

    setSettings(merged);
    saveLocalSettings(merged);

    if (updates.dark_mode) {
      setDarkMode(updates.dark_mode === 'true');
    }

    try {
      const token = localStorage.getItem('azryl_admin_token');
      await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
    } catch {}
  };

  // Determine which page to render
  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Toast System */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {isAdminRoute ? (
        checkingAuth ? (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : !admin ? (
          <AdminLogin
            onLoginSuccess={handleLoginSuccess}
            onGoBack={() => navigate('/')}
          />
        ) : (
          <AdminDashboard
            admin={admin}
            profile={profile || DEFAULT_PROFILE}
            links={links}
            settings={settings}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
            onAddLink={handleAddLink}
            onEditLink={handleEditLink}
            onDeleteLink={handleDeleteLink}
            onToggleLink={handleToggleLink}
            onReorderLinks={handleReorderLinks}
            onUpdateSettings={handleUpdateSettings}
            onShowToast={showToast}
            onGoToPublic={() => navigate('/')}
          />
        )
      ) : (
        <PublicProfile
          profile={profile}
          links={links.filter((l) => l.enabled)}
          settings={settings}
          loading={loading}
          error={error}
          onRefresh={fetchData}
          onShowToast={showToast}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      )}
    </div>
  );
}
