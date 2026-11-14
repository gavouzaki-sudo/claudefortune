/**
 * Shared Web Audio API Context Singleton
 * Prevents hitting browser AudioContext limits (typically 6 concurrent contexts)
 * by reusing a single lazy-initialized AudioContext across all sound engines and components.
 */

let sharedAudioCtx: AudioContext | null = null;

function getAudioContextConstructor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ||
    null
  );
}

/**
 * Synchronously retrieves (or lazily creates) the shared AudioContext.
 * Triggers a non-blocking resume() if currently suspended.
 */
export function getSharedAudioContextSync(): AudioContext | null {
  const AudioCtx = getAudioContextConstructor();
  if (!AudioCtx) return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtx();
  }

  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }

  return sharedAudioCtx;
}

/**
 * Asynchronously retrieves the shared AudioContext and awaits resume() if needed.
 */
export async function getSharedAudioContext(): Promise<AudioContext | null> {
  const ctx = getSharedAudioContextSync();
  if (!ctx) return null;

  if (ctx.state !== 'running') {
    try {
      await ctx.resume();
    } catch {
      // Ignore autoplay policy errors before user gesture
    }
  }

  return ctx;
}
