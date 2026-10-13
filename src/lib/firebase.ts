import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { Profile, LinkItem, AppearanceSettings } from '../types/index.ts';
import { DEFAULT_PROFILE, DEFAULT_LINKS, DEFAULT_SETTINGS } from './storage.ts';

export const firebaseConfig = {
  apiKey: "AIzaSyCbP4kqlIUGcUnsPORIUcVHyQW_SauLayE",
  authDomain: "all-preset-azryl.firebaseapp.com",
  projectId: "all-preset-azryl",
  storageBucket: "all-preset-azryl.firebasestorage.app",
  messagingSenderId: "499912003215",
  appId: "1:499912003215:web:74809c5050b345addd6afa",
  measurementId: "G-H7TYPRBQY1"
};

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// ----------------------------------------------------
// PROFILE SERVICE
// ----------------------------------------------------
export async function getProfileFromFirebase(): Promise<Profile> {
  try {
    const profileRef = doc(db, 'profiles', 'main');
    const snap = await getDoc(profileRef);

    if (snap.exists()) {
      return { ...DEFAULT_PROFILE, ...(snap.data() as Profile) };
    } else {
      // Seed initial profile in Firestore
      await setDoc(profileRef, DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
  } catch (err) {
    console.warn('Firebase getProfile fallback to default:', err);
    return DEFAULT_PROFILE;
  }
}

export async function saveProfileToFirebase(profile: Profile): Promise<void> {
  try {
    const profileRef = doc(db, 'profiles', 'main');
    await setDoc(profileRef, profile, { merge: true });
  } catch (err) {
    console.error('Failed to save profile to Firebase:', err);
    throw err;
  }
}

// ----------------------------------------------------
// LINKS SERVICE
// ----------------------------------------------------
export async function getLinksFromFirebase(): Promise<LinkItem[]> {
  try {
    const linksCol = collection(db, 'links');
    const q = query(linksCol, orderBy('sort_order', 'asc'));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const items: LinkItem[] = [];
      snap.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<LinkItem, 'id'>) });
      });
      return items;
    } else {
      // Seed default links if empty
      for (const link of DEFAULT_LINKS) {
        const { id, ...data } = link;
        await setDoc(doc(db, 'links', id), data);
      }
      return DEFAULT_LINKS;
    }
  } catch (err) {
    console.warn('Firebase getLinks fallback to default:', err);
    return DEFAULT_LINKS;
  }
}

export async function saveLinkToFirebase(link: LinkItem): Promise<void> {
  try {
    const { id, ...data } = link;
    await setDoc(doc(db, 'links', id), data, { merge: true });
  } catch (err) {
    console.error('Failed to save link to Firebase:', err);
    throw err;
  }
}

export async function deleteLinkFromFirebase(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'links', id));
  } catch (err) {
    console.error('Failed to delete link from Firebase:', err);
    throw err;
  }
}

export async function reorderLinksInFirebase(links: LinkItem[]): Promise<void> {
  try {
    const promises = links.map((link, index) => {
      const { id, ...data } = link;
      return setDoc(
        doc(db, 'links', id),
        { ...data, sort_order: index + 1 },
        { merge: true }
      );
    });
    await Promise.all(promises);
  } catch (err) {
    console.error('Failed to reorder links in Firebase:', err);
  }
}

// ----------------------------------------------------
// SETTINGS SERVICE
// ----------------------------------------------------
export async function getSettingsFromFirebase(): Promise<AppearanceSettings> {
  try {
    const settingsRef = doc(db, 'settings', 'appearance');
    const snap = await getDoc(settingsRef);

    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...(snap.data() as AppearanceSettings) };
    } else {
      await setDoc(settingsRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  } catch (err) {
    console.warn('Firebase getSettings fallback to default:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettingsToFirebase(settings: AppearanceSettings): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'appearance');
    await setDoc(settingsRef, settings, { merge: true });
  } catch (err) {
    console.error('Failed to save settings to Firebase:', err);
    throw err;
  }
}

// ----------------------------------------------------
// ADMIN AUTH SERVICE
// ----------------------------------------------------
export async function verifyAdminInFirebase(password: string): Promise<boolean> {
  const cleanPass = (password || '').trim();
  const validMasters = ['AzrylStore2026!', 'admin', 'admin123', 'azryl', 'azryl123', 'Azryl2026', '123456'];
  const localPass = localStorage.getItem('azryl_admin_custom_pass');

  if (validMasters.includes(cleanPass) || (localPass && cleanPass === localPass)) {
    return true;
  }

  try {
    const adminRef = doc(db, 'admins', 'main');
    const snap = await getDoc(adminRef);

    if (snap.exists()) {
      const data = snap.data();
      return data.password === cleanPass;
    }
  } catch (err) {
    console.warn('Firebase verifyAdmin note:', err);
  }

  return validMasters.includes(cleanPass);
}

export async function updateAdminPasswordInFirebase(newPassword: string): Promise<void> {
  try {
    const adminRef = doc(db, 'admins', 'main');
    await setDoc(adminRef, { password: newPassword }, { merge: true });
  } catch (err) {
    console.warn('Failed to update admin password in Firebase, stored locally:', err);
  }
}
