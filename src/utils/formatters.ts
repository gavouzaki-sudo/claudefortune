/**
 * Common formatting and math helper functions.
 * Reduces duplication of padding, bounds clamping, and date formatting.
 */

/** Pad number to 2 digits with leading zeroes */
export const pad2 = (n: number): string => String(Math.floor(n)).padStart(2, '0');

/** Pad number to 3 digits with leading zeroes */
export const pad3 = (n: number): string => String(Math.floor(n)).padStart(3, '0');

/** Clamp number between min and max */
export const clamp = (val: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, val));

/** Generate random integer between min and max inclusive */
export const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** Select random item from array safely */
export const getRandomArrayItem = <T>(arr: T[], fallback: T): T => {
  if (!arr || arr.length === 0) return fallback;
  return arr[Math.floor(Math.random() * arr.length)];
};

/** Format Date object into Thai localized date and time string */
export const formatThaiDateTime = (date: Date = new Date()): string => {
  try {
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date.toISOString();
  }
};
