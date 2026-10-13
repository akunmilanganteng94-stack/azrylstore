import React, { useState } from 'react';
import {
  LayoutDashboard,
  User,
  Link2,
  Palette,
  Settings as SettingsIcon,
  Eye,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Sun,
  Moon,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AdminUser, Profile, LinkItem, AppearanceSettings } from '../types/index.ts';
import { AdminProfileEditor } from './AdminProfileEditor.tsx';
import { AdminLinkManager } from './AdminLinkManager.tsx';
import { AdminAppearance } from './AdminAppearance.tsx';
import { AdminSettings } from './AdminSettings.tsx';
import { AdminPreview } from './AdminPreview.tsx';

interface AdminDashboardProps {
  admin: AdminUser;
  profile: Profile;
  links: LinkItem[];
  settings: AppearanceSettings;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  onUpdateProfile: (updates: Partial<Profile>) => Promise<void>;
  onAddLink: (link: Omit<LinkItem, 'id'>) => Promise<void>;
  onEditLink: (id: string, updated: Partial<LinkItem>) => Promise<void>;
  onDeleteLink: (id: string) => Promise<void>;
  onToggleLink: (id: string, enabled: boolean) => Promise<void>;
  onReorderLinks: (reordered: LinkItem[]) => Promise<void>;
  onUpdateSettings: (updates: Partial<AppearanceSettings>) => Promise<void>;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onGoToPublic: () => void;
}

type TabType = 'dashboard' | 'profile' | 'links' | 'appearance' | 'settings' | 'preview';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  admin,
  profile,
  links,
  settings,
  darkMode,
  onToggleDarkMode,
  onLogout,
  onUpdateProfile,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onToggleLink,
  onReorderLinks,
  onUpdateSettings,
  onShowToast,
  onGoToPublic
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalLinks = links.length;
  const activeLinks = links.filter((l) => l.enabled).length;
  const inactiveLinks = links.filter((l) => !l.enabled).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'links', label: 'Links', icon: Link2, badge: totalLinks },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'preview', label: 'Preview', icon: Eye }
  ];

  const handleNavClick = (tabId: TabType) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row">
      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden p-0.5 bg-blue-600">
            <img
              src="/images/profile-azryl.jpg"
              alt="Azryl Store"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white font-heading">
            Azryl Store Admin
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex flex-col pt-16 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-b-3xl shadow-2xl flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as TabType)}
                className={`flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <button
                onClick={onGoToPublic}
                className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ExternalLink className="w-4 h-4 text-blue-500" />
                <span>Lihat Website</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-5 shrink-0 min-h-screen">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-blue-600 to-sky-400 shadow-md">
            <img
              src="/images/profile-azryl.jpg"
              alt="Azryl Store"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900 dark:text-white font-heading">
              Azryl Store
            </h1>
            <p className="text-[11px] text-slate-400">Admin Control Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    activeTab === item.id
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer actions in sidebar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <button
            onClick={onGoToPublic}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-blue-500" />
            <span>Lihat Website</span>
          </button>

          <button
            onClick={onToggleDarkMode}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
            <span>{darkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout ({admin.username})</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-5 sm:p-8 max-w-6xl overflow-y-auto">
        {/* DASHBOARD OVERVIEW TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                  Dashboard Ringkasan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Selamat datang di panel admin resmi Azryl Store
                </p>
              </div>

              <button
                onClick={onGoToPublic}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Website</span>
              </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Total Links
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                    <Link2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
                  {totalLinks}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Semua link terdaftar di database
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Active
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-heading">
                  {activeLinks}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ditampilkan di profil publik
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Inactive
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-600 dark:text-slate-400 font-heading">
                  {inactiveLinks}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Disembunyikan dari pengunjung
                </p>
              </div>
            </div>

            {/* Quick Actions & Profile Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  Status Profil Saat Ini
                </h3>
                <div className="flex items-center gap-3.5 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <img
                    src={profile.profile_image || '/images/profile-azryl.jpg'}
                    alt={profile.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {profile.name}
                      {profile.verified && <span className="text-blue-500 text-xs">✓</span>}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {profile.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="w-full py-2.5 rounded-xl border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
                >
                  Edit Profil Lengkap
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  Aksi Cepat
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('links')}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500 transition-colors cursor-pointer"
                  >
                    <span>+ Kelola & Tambah Link Baru</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('appearance')}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500 transition-colors cursor-pointer"
                  >
                    <span>Ubah Warna & Gaya Tampilan</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500 transition-colors cursor-pointer"
                  >
                    <span>Buka Simulator HP (Live Preview)</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <AdminProfileEditor
            profile={profile}
            onSave={onUpdateProfile}
            onShowToast={onShowToast}
          />
        )}

        {/* LINKS TAB */}
        {activeTab === 'links' && (
          <AdminLinkManager
            links={links}
            onAddLink={onAddLink}
            onEditLink={onEditLink}
            onDeleteLink={onDeleteLink}
            onToggleLink={onToggleLink}
            onReorderLinks={onReorderLinks}
            onShowToast={onShowToast}
          />
        )}

        {/* APPEARANCE TAB */}
        {activeTab === 'appearance' && (
          <AdminAppearance
            settings={settings}
            onSave={onUpdateSettings}
            onShowToast={onShowToast}
          />
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <AdminSettings
            admin={admin}
            onShowToast={onShowToast}
          />
        )}

        {/* PREVIEW TAB */}
        {activeTab === 'preview' && (
          <AdminPreview
            profile={profile}
            links={links}
            settings={settings}
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
            onShowToast={onShowToast}
            onOpenLive={onGoToPublic}
          />
        )}
      </main>
    </div>
  );
};
