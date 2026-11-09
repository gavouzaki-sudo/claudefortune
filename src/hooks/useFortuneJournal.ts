import { useState, useEffect, useCallback } from 'react';
import {
  getJournalEntries,
  deleteJournalEntry,
  toggleJournalBookmark,
  updateJournalNote,
  clearJournal,
  subscribeJournal,
  type FortuneJournalEntry,
} from '../utils/fortuneJournal';

/**
 * Custom hook for reactive Fortune Journal state management.
 * Automatically synchronizes entries across tabs and components.
 */
export function useFortuneJournal(autoLoad = true) {
  const [entries, setEntries] = useState<FortuneJournalEntry[]>(() =>
    autoLoad ? getJournalEntries() : []
  );

  const refresh = useCallback(() => {
    setEntries(getJournalEntries());
  }, []);

  useEffect(() => {
    if (!autoLoad) return;
    refresh();
    const unsubscribe = subscribeJournal(() => {
      refresh();
    });
    return () => unsubscribe();
  }, [autoLoad, refresh]);

  const removeEntry = useCallback((id: string) => {
    deleteJournalEntry(id);
    setEntries((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    const isNow = toggleJournalBookmark(id);
    setEntries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, bookmarked: isNow } : item))
    );
    return isNow;
  }, []);

  const saveNote = useCallback((id: string, noteText: string) => {
    updateJournalNote(id, noteText);
    setEntries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes: noteText } : item))
    );
  }, []);

  const clearAllEntries = useCallback(() => {
    clearJournal();
    setEntries([]);
  }, []);

  return {
    entries,
    count: entries.length,
    refresh,
    removeEntry,
    toggleBookmark,
    saveNote,
    clearAllEntries,
  };
}
