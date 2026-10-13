import React, { useState } from 'react';
import { Share2, Moon, Sun, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Profile, LinkItem, AppearanceSettings } from '../types/index.ts';
import { VerifiedBadge } from '../components/VerifiedBadge.tsx';
import { LinkCard } from '../components/LinkCard.tsx';

interface PublicProfileProps {
  profile: Profile | null;
  links: LinkItem[];
  settings: AppearanceSettings;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({
  profile,
  links,
  settings,
  loading,
  error,
  onRefresh,
  onShowToast,
  darkMode,
  onToggleDarkMode
}) => {
  const [imageError, setImageError] = useState(false);

  const handleShare = async () => {
    const currentUrl = window.location.origin;
    const shareData = {
      title: profile?.name || 'Azryl Store',
      text: profile?.description || 'Welcome to Azryl Store',
      url: currentUrl
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
      }
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = currentUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      onShowToast('Link profil berhasil disalin!', 'success');
    } catch {
      onShowToast('Gagal menyalin link.', 'error');
    }
  };

  const glassEffect = settings.glass_effect !== 'false';
  const borderRadius = settings.border_radius || 'rounded-2xl';

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Decorative ambient background mesh */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-blue-200/40 via-blue-100/20 to-transparent dark:from-blue-900/20 dark:via-blue-950/10 dark:to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-[350px] h-[350px] bg-blue-100/30 dark:bg-blue-950/20 rounded-full blur-3xl" />
        <div className="absolute top-2/3 -right-32 w-[350px] h-[350px] bg-sky-100/30 dark:bg-indigo-950/20 rounded-full blur-3xl" />
      </div>

      {/* Top Floating Controls */}
      <header className="w-full max-w-md mx-auto px-5 pt-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Official Profile</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-full bg-white/70 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs transition-all active:scale-95"
            title={darkMode ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Share Profile Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Bagikan Profil"
            aria-label="Bagikan Profil"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Bagikan</span>
          </button>
        </div>
      </header>

      {/* Main Container - Mobile Centered Viewport */}
      <main className="w-full max-w-md mx-auto px-5 py-6 flex-1 flex flex-col items-center">
        {loading ? (
          /* SKELETON LOADING STATE */
          <div className="w-full flex flex-col items-center animate-pulse">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-200 dark:bg-slate-800 mb-4 ring-4 ring-slate-100 dark:ring-slate-800" />
            <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-md mb-2" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-md mb-2" />
            <div className="h-3 w-64 bg-slate-200 dark:bg-slate-800 rounded-md mb-8" />
            <div className="w-full space-y-3.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full h-18 rounded-2xl bg-slate-200 dark:bg-slate-800/80" />
              ))}
            </div>
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div className="w-full text-center py-12 px-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-rose-200/60 dark:border-rose-900/40 shadow-sm">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-1">
              Gagal Memuat Profil
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto">
              {error}
            </p>
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Coba Lagi</span>
            </button>
          </div>
        ) : (
          /* PROFILE CONTENT */
          <div className="w-full flex flex-col items-center">
            {/* Profile Avatar Header */}
            <div className="relative mb-4 group">
              <div className="w-[100px] h-[100px] sm:w-[108px] sm:h-[108px] rounded-full p-1 bg-gradient-to-tr from-blue-500 via-sky-400 to-blue-600 shadow-[0_10px_25px_-5px_rgba(37,99,235,0.35)] transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-800 ring-2 ring-white dark:ring-slate-900">
                  <img
                    src={imageError ? '/images/profile-azryl.jpg' : (profile?.profile_image || '/images/profile-azryl.jpg')}
                    alt={profile?.name || 'Azryl Store'}
                    onError={() => {
                      if (!imageError) {
                        setImageError(true);
                      }
                    }}
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                </div>
              </div>
            </div>

            {/* Profile Title with Verified Badge */}
            <div className="flex items-center justify-center gap-2 mb-1.5 text-center">
              <h1 className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-slate-950 dark:text-slate-900 font-heading">
                {profile?.name || 'Azryl Store'}
              </h1>
              {profile?.verified && <VerifiedBadge size={23} />}
            </div>

            {/* Welcome Tagline */}
            <p className="text-sm sm:text-[15px] font-bold text-slate-800 text-center mb-1">
              {profile?.description || 'Welcome to Azryl Store'}
            </p>

            {/* Secondary Description */}
            {profile?.secondary_description && (
              <p className="text-xs sm:text-[13px] text-slate-600 text-center max-w-xs mx-auto mb-6 leading-relaxed font-medium">
                "{profile.secondary_description}"
              </p>
            )}

            {/* Links List */}
            <div className="w-full space-y-3.5 mb-6">
              {links.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Belum ada link yang aktif.
                  </p>
                </div>
              ) : (
                links.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    accentColor={settings.accent_color}
                    borderRadius={borderRadius}
                    glassEffect={glassEffect}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto px-5 py-6 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/40 dark:border-slate-800/40">
        <p className="font-medium text-slate-500 dark:text-slate-400 mb-0.5">
          &copy; 2026 Azryl Store
        </p>
        <p className="text-[11px]">All rights reserved.</p>
      </footer>
    </div>
  );
};
