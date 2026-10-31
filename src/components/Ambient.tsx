import React, { useMemo } from 'react';

interface AmbientProps {
  themeKey: string;
}

interface AmbientConfig {
  g: string[];
  fall: boolean;
}

const AMBIENT_CONFIG: Record<string, AmbientConfig> = {
  shrine: { g: ["🏮", "🏮", "✨"], fall: false },
  songkran: { g: ["💧", "💧", "🌼"], fall: true },
  halloween: { g: ["🦇", "🦇", "🎃", "👻"], fall: false },
  loy: { g: ["🪷", "🏮", "✨"], fall: false },
  cny: { g: ["🧧", "🏮", "🧨"], fall: true },
  newyear: { g: ["✨", "🎆", "⭐"], fall: true },
};

export const Ambient: React.FC<AmbientProps> = ({ themeKey }) => {
  const conf = AMBIENT_CONFIG[themeKey] || AMBIENT_CONFIG.shrine;

  const floaters = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = 16 + Math.random() * 16;
      return {
        id: i,
        char: conf.g[i % conf.g.length],
        x: Math.random() * 96 + "%",
        s: 16 + Math.random() * 22 + "px",
        d: d + "s",
        delay: -Math.random() * d + "s",
        sway: Math.round(Math.random() * 80 - 40) + "px",
      };
    });
  }, [conf]);

  return (
    <div id="ambient" aria-hidden="true">
      {floaters.map((f) => (
        <span
          key={f.id}
          className={`floater ${conf.fall ? "fall" : ""}`}
          style={
            {
              "--x": f.x,
              "--s": f.s,
              "--d": f.d,
              "--delay": f.delay,
              "--sway": f.sway,
            } as React.CSSProperties
          }
        >
          {f.char}
        </span>
      ))}
    </div>
  );
};
