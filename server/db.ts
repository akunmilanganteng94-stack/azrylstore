import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';
import type { Database as SqlDatabase } from 'sql.js';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'azryl_store.sqlite');

export interface AdminRecord {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileRecord {
  id: number;
  name: string;
  username: string;
  description: string;
  secondary_description: string;
  profile_image: string;
  verified: number; // 1 or 0
  created_at: string;
  updated_at: string;
}

export interface LinkRecord {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  enabled: number; // 1 or 0
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SettingRecord {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

let dbInstance: SqlDatabase | null = null;

function saveDbToFile() {
  if (!dbInstance) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const data = dbInstance.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err);
  }
}

export async function getDb(): Promise<SqlDatabase> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn('Failed to load existing database file, creating new one.', e);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Create tables if not exists
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL,
      description TEXT NOT NULL,
      secondary_description TEXT NOT NULL,
      profile_image TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Seed default admin if none exists
  const adminCheck = dbInstance.exec("SELECT COUNT(*) as count FROM admins");
  const adminCount = (adminCheck[0]?.values[0]?.[0] as number) || 0;
  if (adminCount === 0) {
    const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'AzrylStore2026!';
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);
    const now = new Date().toISOString();
    
    dbInstance.run(
      "INSERT INTO admins (id, username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      ['admin-1', defaultUsername, passwordHash, now, now]
    );
  }

  // Seed default profile if none exists
  const profileCheck = dbInstance.exec("SELECT COUNT(*) as count FROM profiles");
  const profileCount = (profileCheck[0]?.values[0]?.[0] as number) || 0;
  if (profileCount === 0) {
    const now = new Date().toISOString();
    dbInstance.run(
      `INSERT INTO profiles (id, name, username, description, secondary_description, profile_image, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1,
        'Azryl Store',
        'azrylstore',
        'Welcome to Azryl Store',
        'Tempat informasi, stok & testimoni Azryl Store',
        '/images/profile-azryl.jpg',
        1,
        now,
        now
      ]
    );
  }

  // Seed default links if none exist
  const linkCheck = dbInstance.exec("SELECT COUNT(*) as count FROM links");
  const linkCount = (linkCheck[0]?.values[0]?.[0] as number) || 0;
  if (linkCount === 0) {
    const now = new Date().toISOString();
    const initialLinks = [
      {
        id: 'link-1',
        title: 'WhatsApp Azryl',
        description: 'Hubungi Azryl',
        url: 'https://wa.me/6282298510642',
        icon: 'whatsapp',
        enabled: 1,
        sort_order: 1
      },
      {
        id: 'link-2',
        title: 'WhatsApp Azryl 2',
        description: 'Hubungi Azryl',
        url: 'https://wa.me/6285119960357',
        icon: 'whatsapp',
        enabled: 1,
        sort_order: 2
      },
      {
        id: 'link-3',
        title: 'Saluran Testi / Stok Azryl',
        description: 'Testimoni dan informasi stok terbaru',
        url: 'https://whatsapp.com/channel/0029Vb6f6rd7IUYaIsu96h2E',
        icon: 'whatsapp',
        enabled: 1,
        sort_order: 3
      },
      {
        id: 'link-4',
        title: 'Grup JB Azryl Store',
        description: 'Join grup jual beli Azryl Store',
        url: 'https://chat.whatsapp.com/CoWwYhB9Bc5IFYNSRkmiUm?s=cl&p=a&mlu=4&ilr=4',
        icon: 'whatsapp',
        enabled: 1,
        sort_order: 4
      }
    ];

    for (const link of initialLinks) {
      dbInstance.run(
        `INSERT INTO links (id, title, description, url, icon, enabled, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [link.id, link.title, link.description, link.url, link.icon, link.enabled, link.sort_order, now, now]
      );
    }
  } else {
    // Ensure Saluran Testi and Grup JB icons are updated to whatsapp for existing databases
    try {
      dbInstance.run("UPDATE links SET icon = 'whatsapp' WHERE id IN ('link-3', 'link-4') OR url LIKE '%whatsapp%' OR url LIKE '%wa.me%'");
    } catch {}
  }

  // Seed default settings if none exist
  const settingsCheck = dbInstance.exec("SELECT COUNT(*) as count FROM settings");
  const settingsCount = (settingsCheck[0]?.values[0]?.[0] as number) || 0;
  if (settingsCount === 0) {
    const now = new Date().toISOString();
    const initialSettings = [
      { key: 'accent_color', value: '#2563EB' },
      { key: 'background_color', value: '#F8FAFC' },
      { key: 'button_style', value: 'glass' },
      { key: 'border_radius', value: 'rounded-2xl' },
      { key: 'shadow', value: 'soft' },
      { key: 'glass_effect', value: 'true' },
      { key: 'dark_mode', value: 'false' }
    ];

    for (const s of initialSettings) {
      dbInstance.run(
        `INSERT INTO settings (id, key, value, updated_at) VALUES (?, ?, ?, ?)`,
        [`setting-${s.key}`, s.key, s.value, now]
      );
    }
  }

  saveDbToFile();
  return dbInstance;
}

export function persistDb() {
  saveDbToFile();
}
