# Azryl Store - Website Profil & Link-in-Bio Profesional

Website profil dan Link-in-Bio modern, responsif, dan elegan untuk **Azryl Store**. Dilengkapi dengan backend Node.js / Express, database SQLite persisten, autentikasi admin aman (Bcrypt + JWT), serta Admin Panel lengkap untuk manajemen profil, link, dan tampilan.

---

## Fitur Utama

- **Desain Modern & Premium**: Soft glassmorphism, rounded corners, soft shadow, aksen biru elegan, dan tipografi Inter & Poppins.
- **Identitas Resmi Azryl Store**:
  - Foto profil lingkaran resmi Azryl Store dengan ring biru dan shadow lembut.
  - Badge Centang Biru (Verified).
  - Judul: "Azryl Store ✓"
  - Deskripsi: "Welcome to Azryl Store"
  - Deskripsi Tambahan: "Tempat informasi, stok & testimoni Azryl Store"
  - Tombol Bagikan dengan Web Share API dan fallback salin link otomatis disertai notifikasi toast.
- **Link WhatsApp Lengkap**:
  - WhatsApp Azryl: `https://wa.me/6282298510642`
  - WhatsApp Azryl 2: `https://wa.me/6285119960357`
  - Saluran Testi / Stok Azryl: `https://whatsapp.com/channel/0029Vb6f6rd7IUYaIsu96h2E`
  - Grup JB Azryl Store: `https://chat.whatsapp.com/CoWwYhB9Bc5IFYNSRkmiUm?s=cl&p=a&mlu=4&ilr=4`
- **Panel Admin Terpisah (`/admin`)**:
  - Login aman dengan Bcrypt password hashing, session JWT 24 jam, dan perlindungan rate-limiting dari serangan brute-force.
  - Dashboard statistik (Total Links, Active, Inactive).
  - Editor profil (Nama, Username, Deskripsi, Foto Profil, Toggle Verified).
  - Pengelola Link (Tambah, Edit, Hapus dengan konfirmasi, Toggle On/Off, Drag & Drop / Urutkan naik/turun).
  - Pengaturan Tampilan (Warna aksen, border radius, efek glassmorphism, default dark mode).
  - Pengaturan Keamanan (Ubah password admin dengan konfirmasi password lama).
  - Live Mobile Preview (Simulator smartphone langsung di panel admin).
- **Dark Mode**: Dukungan mode gelap & terang dengan transisi halus.
- **PWA & Offline Ready**: File `manifest.json`, `sw.js` (service worker), icon, dan meta tags responsif mobile.
- **SEO & OpenGraph**: Tag OpenGraph, Twitter cards, meta description, dan favicon siap share ke WhatsApp, Facebook, dan media sosial.

---

## Panduan Instalasi & Penggunaan

### 1. Install Dependency
Jalankan perintah berikut di terminal:
```bash
npm install
```

### 2. Setup Environment Variables (.env)
Salin `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Isi variabel yang diperlukan di dalam file `.env`:
```env
PORT=3000
SESSION_SECRET="kunci-rahasia-acak-anda-untuk-jwt"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="PasswordKuatAdminAnda"
```

### 3. Setup & Struktur Database
Aplikasi menggunakan database SQLite persisten yang disimpan di folder `data/azryl_store.sqlite`.
Database otomatis membuat tabel-tabel berikut saat server pertama kali dijalankan:
- `admins`: Menyimpan akun admin terenkripsi (id, username, password_hash, created_at, updated_at).
- `profiles`: Menyimpan profil publik (name, username, description, secondary_description, profile_image, verified).
- `links`: Menyimpan seluruh link (id, title, description, url, icon, enabled, sort_order).
- `settings`: Menyimpan preferensi tema (accent_color, background_color, border_radius, glass_effect, dark_mode).

### 4. Migration & Seed Data
Saat aplikasi pertama kali dijalankan, sistem otomatis melakukan seeding data awal:
- Akun admin default: `admin` / `AzrylStore2026!`
- Profil resmi Azryl Store dengan foto utama.
- 4 Link utama WhatsApp Azryl, WhatsApp Azryl 2, Saluran Testi/Stok, dan Grup JB.
- Konfigurasi visual standar.

### 5. Membuat / Mengubah Akun Admin Via CLI
Untuk membuat akun baru atau mereset password admin dari command line:
```bash
npm run create-admin
```
Masukkan username dan password baru saat diminta. Password akan otomatis di-hash menggunakan algoritma Bcrypt (salt rounds 10) sebelum disimpan ke database.

### 6. Menjalankan Mode Development
Jalankan server full-stack development (Express + Vite HMR):
```bash
npm run dev
```
Buka browser di:
- Halaman Publik: `http://localhost:3000/`
- Panel Admin: `http://localhost:3000/admin`

### 7. Build untuk Production
Untuk membuat build frontend siap produksi:
```bash
npm run build
```

### 8. Menjalankan di Server Production / Cloud
Jalankan server Node.js:
```bash
npm start
```
Atau deploy ke layanan cloud seperti Google Cloud Run, Railway, VPS, Render, dsb.

### 9. Deploy ke Vercel via GitHub (Solusi Masalah "Gagal Memuat Profil")
Website kini **100% kompatibel dengan Vercel & Jamstack**:
1. **Penyebab masalah sebelumnya**: Vercel secara bawaan menyajikan file statis dari `dist/` tanpa server Node.js yang berjalan permanen, sehingga pemanggilan `/api/profile` menghasilkan 404 jika tidak ada konfigurasi serverless/fallback.
2. **Solusi yang telah diterapkan**:
   - File `vercel.json` telah ditambahkan dengan aturan *rewrites* SPA dan routing API.
   - Entry point serverless Vercel `api/index.ts` telah dibuat.
   - Sistem **Client Storage & Resilient Fallback** di `src/lib/storage.ts`: Jika API backend offline atau mengembalikan 404 di Vercel, website otomatis menampilkan profil dan seluruh link WhatsApp resmi Azryl Store tanpa pernah menampilkan error *"Gagal Memuat Profil"*.
   - Panel admin di `/admin` tetap berfungsi dan menyimpan perubahan ke penyimpanan lokal jika di-deploy sebagai static Vercel.
3. **Cara Deploy ke Vercel**:
   - Push repository Anda ke **GitHub**.
   - Buka [Vercel Dashboard](https://vercel.com) > **Add New Project** > Import repository GitHub Anda.
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Klik **Deploy**. Selesai! Halaman profil dan seluruh link akan langsung tampil sempurna.

---

## Panduan Penggunaan Panel Admin

### Membuka Panel Admin
1. Buka URL: `/admin` (misal: `https://domain-anda.com/admin` atau `http://localhost:3000/admin`).
2. Masukkan username dan password admin.
   - Default awal: `admin` / `AzrylStore2026!`
3. Klik **Masuk ke Panel Admin**.

### Mengganti Foto Profil
1. Masuk ke tab **Profile** di sidebar admin.
2. Klik tombol **Upload Foto Baru** untuk memilih file gambar dari komputer/HP (JPG/PNG/WebP, maksimal 5MB).
3. Anda juga dapat memasukkan link URL gambar langsung ke kolom input.
4. Klik **Simpan Perubahan**.

### Menambah Link Baru
1. Masuk ke tab **Links** di sidebar admin.
2. Klik tombol **+ Tambah Link**.
3. Isi:
   - **Judul Link** (contoh: *Instagram Azryl*)
   - **Deskripsi** (contoh: *Follow update & katalog promo*)
   - **URL Tujuan** (contoh: *https://instagram.com/...*)
   - **Icon** (Pilih WhatsApp, Channel, Group, Instagram, Toko, Telegram, dll.)
   - **Status Aktif** (ON untuk langsung ditampilkan di web)
4. Klik **Tambah Link**.

### Mengatur Urutan Link
- **Drag & Drop**: Tarik ikon titik (Grip) di sebelah kiri link untuk memindahkan posisinya ke atas atau ke bawah.
- **Tombol Panah**: Gunakan tombol panah ↑ atau ↓ di sebelah kanan setiap baris link.
- Urutan link otomatis disimpan ke database dan langsung tampil di halaman depan.

### Mengubah Tampilan & Tema
1. Masuk ke tab **Appearance** di sidebar admin.
2. Pilih warna aksen (Royal Blue, Sky Blue, Indigo, Cyan, Emerald, atau custom HEX).
3. Pilih kelengkungan sudut card (Medium, Large, atau Extra Large).
4. Aktifkan atau nonaktifkan efek **Glassmorphism** dan **Default Dark Mode**.
5. Klik **Simpan Pengaturan**.

---

## Lisensi & Hak Cipta
&copy; 2026 **Azryl Store**. All rights reserved.
