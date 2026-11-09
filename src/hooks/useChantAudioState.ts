import { useState, useEffect, useCallback } from 'react';
import { isChantMuted, toggleMuteChant, subscribeChantState } from '../utils/chantAudio';

/**
 * Custom hook to subscribe and toggle chant audio mute state reactively.
 */
export function useChantAudioState() {
  const [isMuted, setIsMuted] = useState<boolean>(() => isChantMuted());

  useEffect(() => {
    const unsubscribe = subscribeChantState(() => {
      setIsMuted(isChantMuted());
    });
    return () => unsubscribe();
  }, []);

  const toggle = useCallback(() => {
    const next = toggleMuteChant();
    setIsMuted(next);
    return next;
  }, []);

  return { isMuted, toggle };
}
