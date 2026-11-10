/**
 * Storage Manager Utility
 * Safely handles LocalStorage and SessionStorage operations.
 * Provides fallback in-memory store if web storage is disabled or quota is exceeded.
 */

import { logger } from './logger';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

const fallbackStorage = new MemoryStorage();

function getStorage(type: 'local' | 'session'): Storage {
  if (typeof window === 'undefined') return fallbackStorage;
  try {
    const s = type === 'local' ? window.localStorage : window.sessionStorage;
    const testKey = `__shrine_test_${type}__`;
    s.setItem(testKey, '1');
    s.removeItem(testKey);
    return s;
  } catch (err) {
    logger.warn(`Web Storage (${type}) is not available or blocked. Falling back to memory storage.`, err);
    return fallbackStorage;
  }
}

export const safeStorage = {
  get<T>(type: 'local' | 'session', key: string, fallback: T): T {
    try {
      const storage = getStorage(type);
      const raw = storage.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      try {
        return JSON.parse(raw) as T;
      } catch {
        // If raw value is a legacy plain string (e.g. unquoted "th" or "auto")
        if (typeof fallback === 'string') {
          // Self-heal storage with proper JSON-encoded value
          try {
            storage.setItem(key, JSON.stringify(raw));
          } catch {
            // Ignore write errors during recovery
          }
          return raw as unknown as T;
        }
        return fallback;
      }
    } catch {
      return fallback;
    }
  },

  set<T>(type: 'local' | 'session', key: string, value: T): boolean {
    try {
      const storage = getStorage(type);
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      logger.error(`Failed to write key "${key}" to ${type} storage`, err);
      return false;
    }
  },

  remove(type: 'local' | 'session', key: string): void {
    try {
      const storage = getStorage(type);
      storage.removeItem(key);
    } catch (err) {
      logger.error(`Failed to remove key "${key}" from ${type} storage`, err);
    }
  },
};
