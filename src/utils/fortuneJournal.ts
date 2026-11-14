// Fortune Journal Storage and Management utility

import { safeStorage } from './storage';
import { logger } from './logger';
import { formatThaiDateTime } from './formatters';

export type FortuneType = 'stick' | 'tarot' | 'number' | 'remedy' | 'scan' | 'auspicious';

export interface FortuneJournalEntry {
  id: string;
  type: FortuneType;
  title: string;
  timestamp: number;
  dateFormatted: string;
  zodiacSystem?: string;
  zodiacSymbol?: string;
  summary: string;
  details: Record<string, unknown>;
  notes?: string;
  bookmarked?: boolean;
}

const STORAGE_KEY = 'shrine.fortune_journal';
const JOURNAL_EVENT = 'shrine:journal_updated';

export function getJournalEntries(): FortuneJournalEntry[] {
  return safeStorage.get<FortuneJournalEntry[]>('local', STORAGE_KEY, []);
}

function notifyJournalUpdate(): void {
  if (typeof window === 'undefined') return;
  setTimeout(() => {
    try {
      window.dispatchEvent(new CustomEvent(JOURNAL_EVENT));
    } catch (err) {
      logger.warn('Failed to dispatch journal update event', err);
    }
  }, 0);
}

export function saveJournalEntry(
  entry: Omit<FortuneJournalEntry, 'id' | 'timestamp' | 'dateFormatted'>
): FortuneJournalEntry {
  const now = new Date();
  const dateFormatted = formatThaiDateTime(now);

  const fullEntry: FortuneJournalEntry = {
    ...entry,
    id: `fortune_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    dateFormatted,
    bookmarked: false,
  };

  try {
    const existing = getJournalEntries();
    // Keep max 50 entries to preserve mobile storage
    const updated = [fullEntry, ...existing].slice(0, 50);
    safeStorage.set('local', STORAGE_KEY, updated);
    notifyJournalUpdate();
  } catch (err) {
    logger.error('Failed to save to fortune journal', err);
  }

  return fullEntry;
}

export function deleteJournalEntry(id: string): void {
  try {
    const existing = getJournalEntries();
    const updated = existing.filter((e) => e.id !== id);
    safeStorage.set('local', STORAGE_KEY, updated);
    notifyJournalUpdate();
  } catch (err) {
    logger.error('Failed to delete journal entry', err);
  }
}

export function toggleJournalBookmark(id: string): boolean {
  try {
    const existing = getJournalEntries();
    let isBookmarked = false;
    const updated = existing.map((e) => {
      if (e.id === id) {
        isBookmarked = !e.bookmarked;
        return { ...e, bookmarked: isBookmarked };
      }
      return e;
    });
    safeStorage.set('local', STORAGE_KEY, updated);
    notifyJournalUpdate();
    return isBookmarked;
  } catch (err) {
    logger.error('Failed to toggle bookmark', err);
    return false;
  }
}

export function updateJournalNote(id: string, notes: string): void {
  try {
    const existing = getJournalEntries();
    const updated = existing.map((e) => (e.id === id ? { ...e, notes } : e));
    safeStorage.set('local', STORAGE_KEY, updated);
    notifyJournalUpdate();
  } catch (err) {
    logger.error('Failed to update journal note', err);
  }
}

export function clearJournal(): void {
  try {
    safeStorage.remove('local', STORAGE_KEY);
    notifyJournalUpdate();
  } catch (err) {
    logger.error('Failed to clear journal', err);
  }
}

export function subscribeJournal(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => {
    try {
      callback();
    } catch (err) {
      logger.error('Error in journal subscriber callback', err);
    }
  };
  window.addEventListener(JOURNAL_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(JOURNAL_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
