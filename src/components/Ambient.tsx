import React, { useMemo } from 'react';
import { MYSTICAL_THEMES } from '../data/themes';

interface AmbientProps {
  themeKey: string;
}

export const Ambient: React.FC<AmbientProps> = ({ themeKey }) => {
  const currentTheme =
    MYSTICAL_THEMES.find((t) => t.id === themeKey) || MYSTICAL_THEMES[0];

  const particles = currentTheme.particles;
  const fall = currentTheme.fall;

  const floaters = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => {
      const d = 14 + Math.random() * 16;
      return {
        id: i,
        char: particles[i % particles.length],
        x: Math.random() * 96 + '%',
        s: 16 + Math.random() * 24 + 'px',
        d: d + 's',
        delay: -Math.random() * d + 's',
        sway: Math.round(Math.random() * 80 - 40) + 'px',
      };
    });
  }, [particles]);

  return (
    <div id="ambient" aria-hidden="true">
      {floaters.map((f) => (
        <span
          key={f.id}
          className={`floater ${fall ? 'fall' : ''}`}
          style={
            {
              '--x': f.x,
              '--s': f.s,
              '--d': f.d,
              '--delay': f.delay,
              '--sway': f.sway,
            } as React.CSSProperties
          }
        >
          {f.char}
        </span>
      ))}
    </div>
  );
};
