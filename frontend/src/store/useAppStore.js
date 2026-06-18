import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// We'll use localStorage directly since we don't have zustand yet
// Simple state via React context + localStorage

const STORAGE_KEY = 'vaikhanasa-nidhi';

function loadStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveStorage(data) {
  try {
    const existing = loadStorage();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...data }));
  } catch {}
}

// Bookmarks
export function getBookmarks() {
  return loadStorage().bookmarks || [];
}

export function addBookmark(scripture) {
  const bookmarks = getBookmarks();
  if (!bookmarks.find(b => b.scripture_id === scripture.id)) {
    const updated = [...bookmarks, {
      scripture_id: scripture.id,
      title_telugu: scripture.title_telugu,
      category: scripture.category,
      deity: scripture.deity,
    }];
    saveStorage({ bookmarks: updated });
    return true;
  }
  return false;
}

export function removeBookmark(scripture_id) {
  const bookmarks = getBookmarks().filter(b => b.scripture_id !== scripture_id);
  saveStorage({ bookmarks });
}

export function isBookmarked(scripture_id) {
  return getBookmarks().some(b => b.scripture_id === scripture_id);
}

// Reading progress
export function getReadingProgress() {
  return loadStorage().readingProgress || [];
}

export function saveReadingProgress(scripture, progress, last_verse) {
  const all = getReadingProgress();
  const idx = all.findIndex(r => r.scripture_id === scripture.id);
  const entry = {
    scripture_id: scripture.id,
    title_telugu: scripture.title_telugu,
    category: scripture.category,
    progress,
    last_verse,
    updated_at: Date.now(),
  };
  if (idx >= 0) all[idx] = entry;
  else all.unshift(entry);
  saveStorage({ readingProgress: all.slice(0, 20) });
}

export function getProgress(scripture_id) {
  const all = getReadingProgress();
  return all.find(r => r.scripture_id === scripture_id);
}

// Settings
export function getSettings() {
  return {
    themeMode: 'dark',
    fontSize: 'large',
    textColor: 'bright',
    notifyDailySloka: true,
    notifyPanchangam: false,
    ...loadStorage().settings,
  };
}

export function saveSettings(settings) {
  saveStorage({ settings });
}

// Onboarding
export function hasSeenOnboarding() {
  return loadStorage().onboardingDone === true;
}

export function markOnboardingDone() {
  saveStorage({ onboardingDone: true });
}
