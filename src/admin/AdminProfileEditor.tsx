import React, { useState, useRef } from 'react';
import { Upload, Check, RefreshCw, Image as ImageIcon, ShieldCheck, Save, Loader2 } from 'lucide-react';
import { Profile } from '../types/index.ts';

interface ProfileEditorProps {
  profile: Profile;
  onSave: (updated: Partial<Profile>) => Promise<void>;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminProfileEditor: React.FC<ProfileEditorProps> = ({
  profile,
  onSave,
  onShowToast
}) => {
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username || '');
  const [description, setDescription] = useState(profile.description);
  const [secondaryDescription, setSecondaryDescription] = useState(profile.secondary_description || '');
  const [profileImage, setProfileImage] = useState(profile.profile_image);
  const [verified, setVerified] = useState(profile.verified);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Pilih file gambar (JPG/PNG/WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onShowToast('Ukuran gambar maksimal 5MB', 'error');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const token = localStorage.getItem('azryl_admin_token');

        const res = await fetch('/api/profile/image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ imageData: base64 })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Gagal mengunggah foto.');
        }

        setProfileImage(data.profile_image);
        onShowToast('Foto profil berhasil diunggah!', 'success');
      } catch (err: any) {
        onShowToast(err.message || 'Gagal mengunggah foto.', 'error');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefaultImage = () => {
    setProfileImage('/images/profile-azryl.jpg');
    onShowToast('Foto dikembalikan ke foto utama Azryl Store.', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        name,
        username,
        description,
        secondary_description: secondaryDescription,
        profile_image: profileImage,
        verified
      });
      onShowToast('Profil berhasil diperbarui.', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menyimpan perubahan profil.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
          Edit Profil
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Sesuaikan identitas, foto profil, dan deskripsi publik Azryl Store
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Section */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Foto Profil
          </label>
          
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-sky-400 shadow-md">
                <img
                  src={profileImage || '/images/profile-azryl.jpg'}
                  alt="Preview Profil"
                  className="w-full h-full rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/profile-azryl.jpg';
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Upload Foto Baru</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefaultImage}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Foto Asli Azryl</span>
                </button>
              </div>

              <div className="mt-1">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  Atau gunakan URL gambar langsung:
                </label>
                <input
                  type="text"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Text Fields */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Profil
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Azryl Store"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs text-slate-400">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="azrylstore"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Deskripsi Utama
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Welcome to Azryl Store"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Deskripsi Tambahan
            </label>
            <textarea
              rows={2}
              value={secondaryDescription}
              onChange={(e) => setSecondaryDescription(e.target.value)}
              placeholder="Tempat informasi, stok & testimoni Azryl Store"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Verified Toggle */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Badge Verified (Centang Biru)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Tampilkan centang biru resmi di sebelah nama
              </span>
            </div>

            <button
              type="button"
              onClick={() => setVerified(!verified)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                verified ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  verified ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Submit Button */}
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
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
