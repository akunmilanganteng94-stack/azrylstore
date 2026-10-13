import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  GripVertical,
  Check,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { LinkItem } from '../types/index.ts';
import { AVAILABLE_ICONS, renderLinkIcon } from '../lib/icons.tsx';

interface LinkManagerProps {
  links: LinkItem[];
  onAddLink: (link: Omit<LinkItem, 'id'>) => Promise<void>;
  onEditLink: (id: string, updated: Partial<LinkItem>) => Promise<void>;
  onDeleteLink: (id: string) => Promise<void>;
  onToggleLink: (id: string, enabled: boolean) => Promise<void>;
  onReorderLinks: (reordered: LinkItem[]) => Promise<void>;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminLinkManager: React.FC<LinkManagerProps> = ({
  links,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onToggleLink,
  onReorderLinks,
  onShowToast
}) => {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('whatsapp');
  const [enabled, setEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<LinkItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Drag and drop states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const openAddModal = () => {
    setEditingLink(null);
    setTitle('');
    setDescription('');
    setUrl('');
    setIcon('whatsapp');
    setEnabled(true);
    setIsModalOpen(true);
  };

  const openEditModal = (link: LinkItem) => {
    setEditingLink(link);
    setTitle(link.title);
    setDescription(link.description || '');
    setUrl(link.url);
    setIcon(link.icon || 'whatsapp');
    setEnabled(link.enabled);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      onShowToast('Judul dan URL wajib diisi!', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingLink) {
        await onEditLink(editingLink.id, {
          title: title.trim(),
          description: description.trim(),
          url: url.trim(),
          icon,
          enabled
        });
        onShowToast('Link berhasil diperbarui.', 'success');
      } else {
        await onAddLink({
          title: title.trim(),
          description: description.trim(),
          url: url.trim(),
          icon,
          enabled,
          sort_order: links.length + 1
        });
        onShowToast('Link berhasil ditambahkan.', 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menyimpan link.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDeleteLink(deleteTarget.id);
      onShowToast('Link berhasil dihapus.', 'success');
      setDeleteTarget(null);
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menghapus link.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Move link up/down
  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newLinks = [...links];
    const [moved] = newLinks.splice(index, 1);
    newLinks.splice(targetIndex, 0, moved);

    // Update sort_order numbers
    const updatedWithOrder = newLinks.map((item, idx) => ({
      ...item,
      sort_order: idx + 1
    }));

    await onReorderLinks(updatedWithOrder);
    onShowToast('Urutan link berhasil diperbarui.', 'success');
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newLinks = [...links];
    const [moved] = newLinks.splice(draggedIndex, 1);
    newLinks.splice(index, 0, moved);

    setDraggedIndex(index);
    const updatedWithOrder = newLinks.map((item, idx) => ({
      ...item,
      sort_order: idx + 1
    }));
    onReorderLinks(updatedWithOrder);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    onShowToast('Urutan link disimpan.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
            Kelola Link
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tambah, edit, urutkan, dan atur visibilitas link yang tampil di profil
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Link</span>
        </button>
      </div>

      {/* Links List */}
      <div className="space-y-3">
        {links.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Belum ada link yang dibuat.
            </p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Klik tombol di bawah untuk menambahkan link pertama Anda.
            </p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer"
            >
              + Tambah Link Sekarang
            </button>
          </div>
        ) : (
          links.map((link, index) => (
            <div
              key={link.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all ${
                draggedIndex === index ? 'opacity-50 ring-2 ring-blue-500' : ''
              } ${!link.enabled ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/50' : ''}`}
            >
              {/* Left: Drag Handle, Icon, and Info */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <div
                  className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  title="Tarik untuk mengubah urutan"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  {renderLinkIcon(link.icon, 'w-5 h-5')}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                      {link.title}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        link.enabled
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {link.enabled ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    {link.description || link.url}
                  </span>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                {/* Move Up/Down */}
                <div className="hidden sm:flex items-center gap-0.5 mr-1 border-r border-slate-200 dark:border-slate-800 pr-2">
                  <button
                    disabled={index === 0}
                    onClick={() => moveItem(index, 'up')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                    title="Pindah ke atas"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={index === links.length - 1}
                    onClick={() => moveItem(index, 'down')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                    title="Pindah ke bawah"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => onToggleLink(link.id, !link.enabled)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    link.enabled
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                  title={link.enabled ? 'Nonaktifkan link' : 'Aktifkan link'}
                >
                  {link.enabled ? 'ON' : 'OFF'}
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => openEditModal(link)}
                  className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                  title="Edit link"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setDeleteTarget(link)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Hapus link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                {editingLink ? 'Edit Link' : 'Tambah Link Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Judul Link
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: WhatsApp Azryl"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Deskripsi (Opsional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Hubungi Azryl"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  URL Tujuan
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://wa.me/628..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Icon
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-40 overflow-y-auto p-1">
                  {AVAILABLE_ICONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIcon(item.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                        icon === item.id
                          ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                      title={item.label}
                    >
                      <item.icon className="w-5 h-5 mb-1" />
                      <span className="text-[10px] truncate max-w-full">
                        {item.id}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Status Aktif
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tampilkan link di halaman profil publik
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    enabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingLink ? 'Simpan Perubahan' : 'Tambah Link'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading mb-1">
              Hapus Link Ini?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Apakah kamu yakin ingin menghapus link "<strong>{deleteTarget.title}</strong>"? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
