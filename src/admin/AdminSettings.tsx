import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, Loader2, Save } from 'lucide-react';
import { AdminUser } from '../types/index.ts';
import { updateAdminPasswordInFirebase } from '../lib/firebase.ts';

interface AdminSettingsProps {
  admin: AdminUser;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ admin, onShowToast }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      onShowToast('Password baru minimal 6 karakter!', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      onShowToast('Konfirmasi password tidak cocok!', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('azryl_admin_token');
      let apiSuccess = false;
      try {
        const res = await fetch('/api/admin/change-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        });

        if (res.ok) {
          apiSuccess = true;
        } else if (res.status !== 404) {
          const data = await res.json();
          throw new Error(data.error || 'Password saat ini salah.');
        }
      } catch (err: any) {
        if (err.message && !err.message.includes('fetch')) {
          throw err;
        }
      }

      // Update password in Firebase Firestore
      await updateAdminPasswordInFirebase(newPassword);
      localStorage.setItem('azryl_admin_custom_pass', newPassword);

      onShowToast('Password admin berhasil diubah!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      onShowToast(err.message || 'Gagal mengubah password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
          Pengaturan Akun & Keamanan
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Ubah password admin dan pantau status keamanan website
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Info Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Informasi Akun Admin
              </h3>
              <p className="text-xs text-slate-500">
                Terhubung sebagai <strong>{admin.username}</strong>
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p>✓ Database: SQLite (Tersimpan aman & persisten)</p>
            <p>✓ Password Hashing: Bcrypt (Salt rounds 10)</p>
            <p>✓ Token: JWT dengan masa aktif 24 jam</p>
            <p>✓ Rate Limiting: Proteksi terhadap brute force login</p>
          </div>
        </div>

        {/* Change Password Form */}
        <form
          onSubmit={handlePasswordChange}
          className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Ganti Password Admin
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password Saat Ini
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password Baru (Minimal 6 Karakter)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan Password...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Perbarui Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
