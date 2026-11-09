import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook to safely manage ephemeral toast messages with proper timer lifecycle.
 */
export function useToast(defaultDuration = 3800) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string, duration = defaultDuration) => {
    setToastMsg(msg);
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setToastMsg(null);
      timerRef.current = null;
    }, duration);
  }, [defaultDuration]);

  const clearToast = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToastMsg(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { toastMsg, showToast, clearToast };
}
