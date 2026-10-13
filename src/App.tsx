import React, { useState, useEffect, useCallback } from 'react';
import { Profile, LinkItem, AppearanceSettings, AdminUser, ToastMessage } from './types/index.ts';
import { PublicProfile } from './pages/PublicProfile.tsx';
import { AdminLogin } from './admin/AdminLogin.tsx';
import { AdminDashboard } from './admin/AdminDashboard.tsx';
import { ToastContainer } from './components/Toast.tsx';

export default function App() {
  // Navigation / Routing
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  // Application Data States
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [settings, setSettings] = useState<AppearanceSettings>({
    accent_color: '#2563EB',
    background_color: '#F8FAFC',
    button_style: 'glass',
    border_radius: 'rounded-2xl',
    shadow: 'soft',
    glass_effect: 'true',
    dark_mode: 'false'
  });

  // UI States
  const [loading, setLoading] = useState<boolean>(true);
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

  // Fetch Public Profile and Settings
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, linksRes, settingsRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/links' + (currentPath.startsWith('/admin') ? '?all=true' : '')),
        fetch('/api/settings')
      ]);

      if (!profileRes.ok) throw new Error('Gagal memuat profil');
      const profileData = await profileRes.json();
      setProfile(profileData);

      if (linksRes.ok) {
        const linksData = await linksRes.json();
        setLinks(linksData);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings((prev) => ({ ...prev, ...settingsData }));
        if (settingsData.dark_mode === 'true') {
          setDarkMode(true);
        }
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Gagal memuat data dari server');
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
        } else {
          localStorage.removeItem('azryl_admin_token');
          setAdmin(null);
        }
      } catch {
        setAdmin(null);
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
    showToast(`Selamat datang kembali, ${user.username}!`, 'success');
    navigate('/admin');
    fetchData();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('azryl_admin_token');
    setAdmin(null);
    showToast('Anda telah keluar dari panel admin.', 'info');
    navigate('/');
  };

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    const token = localStorage.getItem('azryl_admin_token');
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memperbarui profil');
    setProfile(data.profile);
  };

  const handleAddLink = async (newLink: Omit<LinkItem, 'id'>) => {
    const token = localStorage.getItem('azryl_admin_token');
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newLink)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menambahkan link');
    setLinks((prev) => [...prev, data.link]);
  };

  const handleEditLink = async (id: string, updated: Partial<LinkItem>) => {
    const token = localStorage.getItem('azryl_admin_token');
    const res = await fetch(`/api/links/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updated)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memperbarui link');
    setLinks((prev) => prev.map((l) => (l.id === id ? data.link : l)));
  };

  const handleDeleteLink = async (id: string) => {
    const token = localStorage.getItem('azryl_admin_token');
    const res = await fetch(`/api/links/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menghapus link');
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleToggleLink = async (id: string, enabled: boolean) => {
    const link = links.find((l) => l.id === id);
    if (!link) return;
    await handleEditLink(id, { ...link, enabled });
    showToast(enabled ? 'Link diaktifkan' : 'Link dinonaktifkan', 'info');
  };

  const handleReorderLinks = async (reordered: LinkItem[]) => {
    setLinks(reordered);
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
  };

  const handleUpdateSettings = async (updates: Partial<AppearanceSettings>) => {
    const token = localStorage.getItem('azryl_admin_token');
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memperbarui pengaturan');
    setSettings((prev) => {
      const merged: AppearanceSettings = { ...prev };
      (Object.keys(updates) as (keyof AppearanceSettings)[]).forEach((key) => {
        const val = updates[key];
        if (val !== undefined) {
          merged[key] = val;
        }
      });
      return merged;
    });
    if (updates.dark_mode) {
      setDarkMode(updates.dark_mode === 'true');
    }
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
            profile={profile || {
              id: 1,
              name: 'Azryl Store',
              username: 'azrylstore',
              description: 'Welcome to Azryl Store',
              secondary_description: 'Tempat informasi, stok & testimoni Azryl Store',
              profile_image: '/images/profile-azryl.jpg',
              verified: true
            }}
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
