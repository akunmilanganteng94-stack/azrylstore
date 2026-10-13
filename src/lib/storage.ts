import { Profile, LinkItem, AppearanceSettings } from '../types/index.ts';

export const DEFAULT_PROFILE: Profile = {
  id: 1,
  name: 'Azryl Store',
  username: 'azrylstore',
  description: 'Welcome to Azryl Store',
  secondary_description: 'Tempat informasi, stok & testimoni Azryl Store',
  profile_image: '/images/profile-azryl.jpg',
  verified: true
};

export const DEFAULT_LINKS: LinkItem[] = [
  {
    id: 'link-1',
    title: 'WhatsApp Azryl',
    description: 'Hubungi Azryl',
    url: 'https://wa.me/6282298510642',
    icon: 'whatsapp',
    enabled: true,
    sort_order: 1
  },
  {
    id: 'link-2',
    title: 'WhatsApp Azryl 2',
    description: 'Hubungi Azryl',
    url: 'https://wa.me/6285119960357',
    icon: 'whatsapp',
    enabled: true,
    sort_order: 2
  },
  {
    id: 'link-3',
    title: 'Saluran Testi / Stok Azryl',
    description: 'Testimoni dan informasi stok terbaru',
    url: 'https://whatsapp.com/channel/0029Vb6f6rd7IUYaIsu96h2E',
    icon: 'whatsapp',
    enabled: true,
    sort_order: 3
  },
  {
    id: 'link-4',
    title: 'Grup JB Azryl Store',
    description: 'Join grup jual beli Azryl Store',
    url: 'https://chat.whatsapp.com/CoWwYhB9Bc5IFYNSRkmiUm?s=cl&p=a&mlu=4&ilr=4',
    icon: 'whatsapp',
    enabled: true,
    sort_order: 4
  }
];

export const DEFAULT_SETTINGS: AppearanceSettings = {
  accent_color: '#2563EB',
  background_color: '#F8FAFC',
  button_style: 'glass',
  border_radius: 'rounded-2xl',
  shadow: 'soft',
  glass_effect: 'true',
  dark_mode: 'false'
};

const STORAGE_KEYS = {
  PROFILE: 'azryl_store_profile',
  LINKS: 'azryl_store_links',
  SETTINGS: 'azryl_store_settings',
  ADMIN: 'azryl_store_admin'
};

export function getLocalProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_PROFILE;
}

export function saveLocalProfile(profile: Profile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch {}
}

export function getLocalLinks(): LinkItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LINKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_LINKS;
}

export function saveLocalLinks(links: LinkItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
  } catch {}
}

export function getLocalSettings(): AppearanceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveLocalSettings(settings: AppearanceSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}
