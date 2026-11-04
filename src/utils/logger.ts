/**
 * Application Logger & Error Handling Utility
 * Provides structured logging, environment-safe execution, and fallback strategies.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class AppLogger {
  private isDev = Boolean(import.meta.env?.DEV);

  private log(level: LogLevel, message: string, ...args: unknown[]) {
    const timestamp = new Date().toISOString();
    const prefix = `[Shrine ${level.toUpperCase()}] [${timestamp}]:`;

    switch (level) {
      case 'debug':
        if (this.isDev) console.debug(prefix, message, ...args);
        break;
      case 'info':
        console.info(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
    }
  }

  debug(message: string, ...args: unknown[]) {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: unknown[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: unknown[]) {
    this.log('error', message, ...args);
  }

  /**
   * Safe execution wrapper for synchronous functions.
   * Catches errors, logs them, and returns fallback value if provided.
   */
  safeExecute<T>(fn: () => T, fallback: T, contextName = 'Operation'): T {
    try {
      return fn();
    } catch (err) {
      this.error(`Error in ${contextName}:`, err);
      return fallback;
    }
  }

  /**
   * Safe execution wrapper for asynchronous functions.
   */
  async safeAsync<T>(fn: () => Promise<T>, fallback: T, contextName = 'Async Operation'): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      this.error(`Error in ${contextName}:`, err);
      return fallback;
    }
  }

  /**
   * Safely parses JSON string with fallback value.
   */
  tryParseJSON<T>(raw: string | null, fallback: T, contextName = 'JSON Parse'): T {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      this.warn(`Failed to parse ${contextName}:`, err);
      return fallback;
    }
  }
}

export const logger = new AppLogger();
