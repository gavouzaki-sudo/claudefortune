// Fortune Journal Storage and Management utility

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
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FortuneJournalEntry[];
  } catch (err) {
    console.error('Failed to read fortune journal', err);
    return [];
  }
}

function notifyJournalUpdate(): void {
  if (typeof window === 'undefined') return;
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent(JOURNAL_EVENT));
  }, 0);
}

export function saveJournalEntry(
  entry: Omit<FortuneJournalEntry, 'id' | 'timestamp' | 'dateFormatted'>
): FortuneJournalEntry {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyJournalUpdate();
  } catch (err) {
    console.error('Failed to save to fortune journal', err);
  }

  return fullEntry;
}

export function deleteJournalEntry(id: string): void {
  try {
    const existing = getJournalEntries();
    const updated = existing.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyJournalUpdate();
  } catch (err) {
    console.error('Failed to delete journal entry', err);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyJournalUpdate();
    return isBookmarked;
  } catch (err) {
    console.error('Failed to toggle bookmark', err);
    return false;
  }
}

export function updateJournalNote(id: string, notes: string): void {
  try {
    const existing = getJournalEntries();
    const updated = existing.map((e) => (e.id === id ? { ...e, notes } : e));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyJournalUpdate();
  } catch (err) {
    console.error('Failed to update journal note', err);
  }
}

export function clearJournal(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    notifyJournalUpdate();
  } catch (err) {
    console.error('Failed to clear journal', err);
  }
}

export function subscribeJournal(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener(JOURNAL_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(JOURNAL_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
