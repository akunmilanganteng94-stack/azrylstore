import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { getDb, persistDb } from './db.ts';
import {
  checkLoginRateLimit,
  recordFailedLogin,
  recordSuccessfulLogin,
  generateToken,
  requireAuth
} from './auth.ts';

export const apiRouter = Router();

// Helper to convert SQL query result to array of objects
function formatRows<T = any>(execResult: any[]): T[] {
  if (!execResult || execResult.length === 0) return [];
  const { columns, values } = execResult[0];
  return values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, idx: number) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

// ----------------------------------------------------
// PUBLIC ROUTES
// ----------------------------------------------------

// GET /api/profile
apiRouter.get('/profile', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT id, name, username, description, secondary_description, profile_image, verified FROM profiles WHERE id = 1');
    const profiles = formatRows(result);
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profil tidak ditemukan' });
    }
    const profile = profiles[0];
    profile.verified = Boolean(profile.verified);
    return res.json(profile);
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal mengambil data profil' });
  }
});

// GET /api/links (Public only gets enabled, unless authenticated admin)
apiRouter.get('/links', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const showAll = req.query.all === 'true';
    let query = 'SELECT id, title, description, url, icon, enabled, sort_order FROM links WHERE enabled = 1 ORDER BY sort_order ASC';
    
    if (showAll) {
      query = 'SELECT id, title, description, url, icon, enabled, sort_order FROM links ORDER BY sort_order ASC';
    }

    const result = db.exec(query);
    const links = formatRows(result).map((l: any) => ({
      ...l,
      enabled: Boolean(l.enabled)
    }));
    return res.json(links);
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal mengambil daftar link' });
  }
});

// GET /api/settings
apiRouter.get('/settings', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT key, value FROM settings');
    const rows = formatRows(result);
    const settingsObj: Record<string, string> = {};
    rows.forEach((r: any) => {
      settingsObj[r.key] = r.value;
    });
    return res.json(settingsObj);
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal mengambil pengaturan' });
  }
});

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

// POST /api/admin/login
apiRouter.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const rateLimit = checkLoginRateLimit(clientIp);

    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: `Terlalu banyak percobaan login gagal. Silakan coba lagi dalam ${rateLimit.waitSeconds} detik.`
      });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }

    const db = await getDb();
    const safeUsername = username.trim().replace(/'/g, "''");
    const result = db.exec(`SELECT id, username, password_hash FROM admins WHERE username = '${safeUsername}'`);
    const admins = formatRows(result);

    if (admins.length === 0) {
      recordFailedLogin(clientIp);
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    const admin = admins[0];
    const passwordMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!passwordMatch) {
      recordFailedLogin(clientIp);
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    recordSuccessfulLogin(clientIp);

    const token = generateToken({ adminId: admin.id, username: admin.username });

    // Set secure cookie
    res.cookie('azryl_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.json({
      message: 'Login berhasil',
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server saat login.' });
  }
});

// POST /api/admin/logout
apiRouter.post('/admin/logout', (_req: Request, res: Response) => {
  res.clearCookie('azryl_admin_token');
  return res.json({ message: 'Logout berhasil' });
});

// GET /api/admin/me
apiRouter.get('/admin/me', requireAuth, (req: Request, res: Response) => {
  return res.json({ admin: (req as any).admin });
});

// GET /api/admin/stats
apiRouter.get('/admin/stats', requireAuth, async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const totalRes = db.exec('SELECT COUNT(*) as count FROM links');
    const activeRes = db.exec('SELECT COUNT(*) as count FROM links WHERE enabled = 1');
    const inactiveRes = db.exec('SELECT COUNT(*) as count FROM links WHERE enabled = 0');

    const total = (totalRes[0]?.values[0]?.[0] as number) || 0;
    const active = (activeRes[0]?.values[0]?.[0] as number) || 0;
    const inactive = (inactiveRes[0]?.values[0]?.[0] as number) || 0;

    return res.json({ total, active, inactive });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal mengambil statistik' });
  }
});

// PUT /api/admin/change-password
apiRouter.put('/admin/change-password', requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Password saat ini dan password baru wajib diisi.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
    }

    const adminId = (req as any).admin.id;
    const db = await getDb();
    const result = db.exec(`SELECT password_hash FROM admins WHERE id = '${adminId.replace(/'/g, "''")}'`);
    const admins = formatRows(result);
    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin tidak ditemukan' });
    }

    const isMatch = bcrypt.compareSync(currentPassword, admins[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Password saat ini tidak cocok.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    const now = new Date().toISOString();
    db.run(
      `UPDATE admins SET password_hash = ?, updated_at = ? WHERE id = ?`,
      [newHash, now, adminId]
    );
    persistDb();

    return res.json({ message: 'Password berhasil diperbarui.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal mengubah password' });
  }
});

// ----------------------------------------------------
// PROTECTED PROFILE MANAGEMENT
// ----------------------------------------------------

// PUT /api/profile
apiRouter.put('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, username, description, secondary_description, profile_image, verified } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nama profil wajib diisi.' });
    }

    const db = await getDb();
    const now = new Date().toISOString();
    const verifiedInt = verified ? 1 : 0;

    db.run(
      `UPDATE profiles
       SET name = ?, username = ?, description = ?, secondary_description = ?, profile_image = ?, verified = ?, updated_at = ?
       WHERE id = 1`,
      [
        name.trim(),
        (username || '').trim(),
        (description || '').trim(),
        (secondary_description || '').trim(),
        (profile_image || '').trim(),
        verifiedInt,
        now
      ]
    );
    persistDb();

    return res.json({
      message: 'Profil berhasil diperbarui.',
      profile: {
        id: 1,
        name: name.trim(),
        username: (username || '').trim(),
        description: (description || '').trim(),
        secondary_description: (secondary_description || '').trim(),
        profile_image: (profile_image || '').trim(),
        verified: Boolean(verifiedInt)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal menyimpan profil.' });
  }
});

// POST /api/profile/image (Base64 upload or image link)
apiRouter.post('/profile/image', requireAuth, async (req: Request, res: Response) => {
  try {
    const { imageData, imageUrl } = req.body;

    if (imageUrl) {
      const db = await getDb();
      const now = new Date().toISOString();
      db.run(`UPDATE profiles SET profile_image = ?, updated_at = ? WHERE id = 1`, [imageUrl, now]);
      persistDb();
      return res.json({ message: 'Foto profil berhasil diperbarui.', profile_image: imageUrl });
    }

    if (!imageData || !imageData.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Data gambar tidak valid.' });
    }

    const matches = imageData.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Format data gambar salah.' });
    }

    const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `avatar_${Date.now()}.${extension}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const savedUrl = `/uploads/${filename}`;

    const db = await getDb();
    const now = new Date().toISOString();
    db.run(`UPDATE profiles SET profile_image = ?, updated_at = ? WHERE id = 1`, [savedUrl, now]);
    persistDb();

    return res.json({
      message: 'Foto profil berhasil diunggah.',
      profile_image: savedUrl
    });
  } catch (err: any) {
    console.error('Image upload error:', err);
    return res.status(500).json({ error: 'Gagal mengunggah foto profil.' });
  }
});

// ----------------------------------------------------
// PROTECTED LINK MANAGEMENT
// ----------------------------------------------------

// POST /api/links (Add Link)
apiRouter.post('/links', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description, url, icon, enabled, sort_order } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Judul link wajib diisi.' });
    }
    if (!url || !url.trim()) {
      return res.status(400).json({ error: 'URL link wajib diisi.' });
    }

    // Basic URL validation
    const trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://') && !trimmedUrl.startsWith('tel:') && !trimmedUrl.startsWith('mailto:')) {
      return res.status(400).json({ error: 'URL harus diawali dengan https://, http://, atau wa.me' });
    }

    const db = await getDb();
    const linkId = 'link-' + Date.now();
    const now = new Date().toISOString();
    
    // Determine sort_order if not provided
    let order = sort_order;
    if (order === undefined || order === null) {
      const maxOrderRes = db.exec('SELECT MAX(sort_order) FROM links');
      const currentMax = (maxOrderRes[0]?.values[0]?.[0] as number) || 0;
      order = currentMax + 1;
    }

    db.run(
      `INSERT INTO links (id, title, description, url, icon, enabled, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        linkId,
        title.trim(),
        (description || '').trim(),
        trimmedUrl,
        icon || 'link',
        enabled === false ? 0 : 1,
        order,
        now,
        now
      ]
    );
    persistDb();

    return res.status(201).json({
      message: 'Link berhasil ditambahkan.',
      link: {
        id: linkId,
        title: title.trim(),
        description: (description || '').trim(),
        url: trimmedUrl,
        icon: icon || 'link',
        enabled: enabled !== false,
        sort_order: order
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal menambahkan link.' });
  }
});

// PUT /api/links/:id (Edit Link)
apiRouter.put('/links/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const linkId = req.params.id;
    const { title, description, url, icon, enabled, sort_order } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Judul link wajib diisi.' });
    }
    if (!url || !url.trim()) {
      return res.status(400).json({ error: 'URL link wajib diisi.' });
    }

    const db = await getDb();
    const safeId = linkId.replace(/'/g, "''");
    const check = db.exec(`SELECT id FROM links WHERE id = '${safeId}'`);
    if (!check || check.length === 0 || check[0].values.length === 0) {
      return res.status(404).json({ error: 'Link tidak ditemukan.' });
    }

    const now = new Date().toISOString();
    const enabledInt = enabled === false || enabled === 0 ? 0 : 1;

    db.run(
      `UPDATE links
       SET title = ?, description = ?, url = ?, icon = ?, enabled = ?, sort_order = ?, updated_at = ?
       WHERE id = ?`,
      [
        title.trim(),
        (description || '').trim(),
        url.trim(),
        icon || 'link',
        enabledInt,
        sort_order !== undefined ? Number(sort_order) : 1,
        now,
        linkId
      ]
    );
    persistDb();

    return res.json({
      message: 'Link berhasil diperbarui.',
      link: {
        id: linkId,
        title: title.trim(),
        description: (description || '').trim(),
        url: url.trim(),
        icon: icon || 'link',
        enabled: Boolean(enabledInt),
        sort_order: Number(sort_order)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal memperbarui link.' });
  }
});

// DELETE /api/links/:id (Delete Link)
apiRouter.delete('/links/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const linkId = req.params.id;
    const db = await getDb();
    const safeId = linkId.replace(/'/g, "''");
    const check = db.exec(`SELECT id FROM links WHERE id = '${safeId}'`);
    if (!check || check.length === 0 || check[0].values.length === 0) {
      return res.status(404).json({ error: 'Link tidak ditemukan.' });
    }

    db.run(`DELETE FROM links WHERE id = ?`, [linkId]);
    persistDb();

    return res.json({ message: 'Link berhasil dihapus.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal menghapus link.' });
  }
});

// PUT /api/links/reorder (Drag & Drop / Reordering)
apiRouter.put('/links/reorder', requireAuth, async (req: Request, res: Response) => {
  try {
    const { items } = req.body; // Array of { id: string, sort_order: number }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Data urutan harus berupa array.' });
    }

    const db = await getDb();
    const now = new Date().toISOString();

    for (const item of items) {
      if (item.id && typeof item.sort_order === 'number') {
        db.run(`UPDATE links SET sort_order = ?, updated_at = ? WHERE id = ?`, [
          item.sort_order,
          now,
          item.id
        ]);
      }
    }
    persistDb();

    return res.json({ message: 'Urutan link berhasil disimpan.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal memperbarui urutan link.' });
  }
});

// ----------------------------------------------------
// SETTINGS / APPEARANCE MANAGEMENT
// ----------------------------------------------------

// PUT /api/settings
apiRouter.put('/settings', requireAuth, async (req: Request, res: Response) => {
  try {
    const updates = req.body; // Key-value object
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Format data pengaturan salah.' });
    }

    const db = await getDb();
    const now = new Date().toISOString();

    for (const [key, value] of Object.entries(updates)) {
      const valStr = String(value);
      // Upsert
      db.run(
        `INSERT INTO settings (id, key, value, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        [`setting-${key}`, key, valStr, now]
      );
    }
    persistDb();

    return res.json({ message: 'Pengaturan tampilan berhasil disimpan.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal memperbarui pengaturan.' });
  }
});
