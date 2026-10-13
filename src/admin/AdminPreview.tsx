import React from 'react';
import { ExternalLink, Smartphone, RefreshCw } from 'lucide-react';
import { Profile, LinkItem, AppearanceSettings } from '../types/index.ts';
import { PublicProfile } from '../pages/PublicProfile.tsx';

interface AdminPreviewProps {
  profile: Profile;
  links: LinkItem[];
  settings: AppearanceSettings;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onOpenLive: () => void;
}

export const AdminPreview: React.FC<AdminPreviewProps> = ({
  profile,
  links,
  settings,
  darkMode,
  onToggleDarkMode,
  onShowToast,
  onOpenLive
}) => {
  // Only enabled links in public profile
  const enabledLinks = links.filter((l) => l.enabled);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
            Live Preview
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulasi tampilan website Azryl Store pada layar smartphone
          </p>
        </div>

        <button
          onClick={onOpenLive}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Buka di Tab Baru</span>
        </button>
      </div>

      {/* Device Frame */}
      <div className="relative w-full max-w-[380px] rounded-[40px] p-3 bg-slate-800 dark:bg-slate-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border-4 border-slate-700/60 dark:border-slate-800">
        {/* Speaker / Camera Notch */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-950/80 mr-3" />
          <div className="w-10 h-1 rounded-full bg-slate-800" />
        </div>

        {/* Screen container */}
        <div className="w-full h-[680px] rounded-[32px] overflow-y-auto overflow-x-hidden bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 scrollbar-none pt-6">
          <PublicProfile
            profile={profile}
            links={enabledLinks}
            settings={settings}
            loading={false}
            error={null}
            onRefresh={() => {}}
            onShowToast={onShowToast}
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
          />
        </div>
      </div>
    </div>
  );
};
