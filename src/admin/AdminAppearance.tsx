import React, { useState } from 'react';
import { Palette, Sparkles, Check, Save, Loader2, Sun, Moon } from 'lucide-react';
import { AppearanceSettings } from '../types/index.ts';

interface AppearanceProps {
  settings: AppearanceSettings;
  onSave: (updates: Partial<AppearanceSettings>) => Promise<void>;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ACCENT_PRESETS = [
  { name: 'Royal Blue', color: '#2563EB' },
  { name: 'Sky Blue', color: '#0284C7' },
  { name: 'Indigo', color: '#4F46E5' },
  { name: 'Cyan', color: '#0891B2' },
  { name: 'Emerald', color: '#059669' },
  { name: 'Slate', color: '#334155' }
];

const RADIUS_OPTIONS = [
  { id: 'rounded-xl', label: 'Medium (12px)' },
  { id: 'rounded-2xl', label: 'Large (16px) - Default' },
  { id: 'rounded-3xl', label: 'Extra Large (24px)' }
];

export const AdminAppearance: React.FC<AppearanceProps> = ({
  settings,
  onSave,
  onShowToast
}) => {
  const [accentColor, setAccentColor] = useState(settings.accent_color || '#2563EB');
  const [backgroundColor, setBackgroundColor] = useState(settings.background_color || '#F8FAFC');
  const [borderRadius, setBorderRadius] = useState(settings.border_radius || 'rounded-2xl');
  const [glassEffect, setGlassEffect] = useState(settings.glass_effect !== 'false');
  const [darkMode, setDarkMode] = useState(settings.dark_mode === 'true');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        accent_color: accentColor,
        background_color: backgroundColor,
        border_radius: borderRadius,
        glass_effect: glassEffect ? 'true' : 'false',
        dark_mode: darkMode ? 'true' : 'false'
      });
      onShowToast('Tampilan berhasil diperbarui.', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menyimpan tampilan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
          Pengaturan Tampilan
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Sesuaikan tema warna, gaya card, glassmorphism, dan mode gelap
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Accent Color */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Warna Aksen Utama (Accent Color)
          </label>
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.color}
                type="button"
                onClick={() => setAccentColor(preset.color)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                  accentColor.toLowerCase() === preset.color.toLowerCase()
                    ? 'border-blue-500 ring-2 ring-blue-500/20 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: preset.color }}
                />
                <span className="text-slate-700 dark:text-slate-300">{preset.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 p-0.5 bg-transparent"
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              placeholder="#2563EB"
              className="w-32 px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Card Style & Radius */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Sudut Lengkung Card (Border Radius)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBorderRadius(opt.id)}
                  className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                    borderRadius === opt.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Glassmorphism Toggle */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Efek Glassmorphism (Blur Translucent)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Latar belakang card semi-transparan dengan efek blur modern
              </span>
            </div>
            <button
              type="button"
              onClick={() => setGlassEffect(!glassEffect)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                glassEffect ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  glassEffect ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Dark Mode Default */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Default Dark Mode
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Gunakan tema gelap sebagai tema bawaan awal
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                darkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Live Mini Preview Box */}
        <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">
            Preview Gaya Card
          </span>
          <div
            className={`p-4 flex items-center justify-between transition-all ${borderRadius} ${
              glassEffect
                ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/60 dark:border-slate-800 shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: accentColor }}
              >
                ✓
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  WhatsApp Azryl
                </p>
                <p className="text-xs text-slate-400">Hubungi Azryl</p>
              </div>
            </div>
            <span style={{ color: accentColor }} className="text-sm font-bold">
              →
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
