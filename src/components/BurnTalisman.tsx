import React from 'react';

interface BurnTalismanProps {
  burnLevel: number; // 0, 1, 2, 3
  luckyNumber: string;
  category: 0 | 1; // 0 = 2 digits, 1 = 3 digits
  isBurning: boolean;
}

export const BurnTalisman: React.FC<BurnTalismanProps> = ({
  burnLevel,
  luckyNumber,
  category,
  isBurning,
}) => {
  // burn percentage: 0 = 0%, 1 = 33%, 2 = 66%, 3 = 100%
  const burnPercent = Math.min(100, Math.round((burnLevel / 3) * 100));

  return (
    <div className={`talisman-burn-stage ${isBurning ? 'is-burning-active' : ''}`}>
      {/* Burn Progress Indicator Header */}
      <div className="burn-status-bar">
        <div className="burn-status-text">
          <span className="burn-fire-icon">🔥</span>
          <span>
            เพลิงเผายันต์ศักดิ์สิทธิ์:{' '}
            <b className="burn-highlight">{burnLevel} / 3 ตา</b>{' '}
            {burnLevel === 0 && '(แผ่นยันต์ยังไม่ถูกเผา)'}
            {burnLevel === 1 && '(ไฟเริ่มลาม ขอบยันต์ไหม้ 33%)'}
            {burnLevel === 2 && '(ไฟลามถึงใจกลาง ไหม้ 66%)'}
            {burnLevel === 3 && '(ยันต์มอดไหม้สมบูรณ์ ปรากฏเลขมงคล 100%)'}
          </span>
        </div>
        <div className="burn-meter-track" aria-hidden="true">
          <div
            className={`burn-meter-fill burn-lv-${burnLevel}`}
            style={{ width: `${burnPercent}%` }}
          />
        </div>
      </div>

      {/* Parchment Box */}
      <div className={`talisman-frame ${burnLevel === 3 ? 'fully-consumed' : ''}`}>
        {/* Layer 1: Revealed Sacred Numbers underneath */}
        <div className="talisman-revealed-layer" aria-label={`เลขมงคลที่ซ่อนอยู่: ${luckyNumber}`}>
          <div className="revealed-glow-ring" />
          <div className="revealed-badge-tag">
            {category === 0 ? 'เลขท้าย 2 ตัวมงคล' : 'เลขท้าย 3 ตัวมงคล'}
          </div>

          <div className="revealed-digits-row">
            {Array.from(luckyNumber).map((digit, idx) => (
              <span
                key={idx}
                className={`revealed-digit digit-${idx} ${burnLevel >= 2 ? 'visible-hot' : ''} ${
                  burnLevel === 3 ? 'fully-illuminated' : ''
                }`}
              >
                {burnLevel === 0 ? '?' : burnLevel === 1 && idx > 0 ? '?' : digit}
              </span>
            ))}
          </div>

          {burnLevel === 3 && (
            <div className="revealed-blessing-seal">
              <span>✦ โชคลาภพูนทวี บารมีหนุนส่ง ✦</span>
            </div>
          )}
        </div>

        {/* Layer 2: The Burning Paper Talisman Overlap with Chars & Embers */}
        {burnLevel < 3 && (
          <div
            className={`talisman-paper-overlay burn-state-${burnLevel}`}
            aria-hidden="true"
          >
            {/* Ancient Talisman Inscriptions */}
            <div className="talisman-script-header">
              <span className="talisman-dragon-seal">敕令</span>
              <span className="talisman-sub-seal">ยันต์ไฟพระอัคนีเบิกโชค</span>
            </div>

            <div className="talisman-diagram">
              <svg viewBox="0 0 100 80" className="talisman-yantra-svg">
                {/* Traditional geometric talisman runes */}
                <circle cx="50" cy="40" r="32" fill="none" stroke="#8b1e16" strokeWidth="1.5" />
                <circle cx="50" cy="40" r="26" fill="none" stroke="#8b1e16" strokeWidth="1" strokeDasharray="3 2" />
                <polygon points="50,14 62,32 78,40 62,48 50,66 38,48 22,40 38,32" fill="none" stroke="#8b1e16" strokeWidth="1.2" />
                <text x="50" y="44" fill="#69120c" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                  招財
                </text>
              </svg>
            </div>

            {/* Glowing Embers and Burn Edge (CSS Mask / Burn Hole) */}
            <div className="talisman-burn-edges">
              <span className="ember-spark s1" />
              <span className="ember-spark s2" />
              <span className="ember-spark s3" />
              <span className="ember-spark s4" />
            </div>

            {/* Charred border message */}
            <div className="talisman-char-hint">
              {burnLevel === 0
                ? 'ชนะมินิเกมเพื่อเริ่มจุดไฟเผายันต์'
                : burnLevel === 1
                ? 'ชนะอีก 2 ตาเพื่อเผาให้เห็นเลขครบ'
                : 'ชนะอีกเพียง 1 ตา ยันต์จะมอดไหม้หมด!'}
            </div>
          </div>
        )}

        {/* Flying Ash Particles (during burning) */}
        {isBurning && (
          <div className="ash-particles-overlay" aria-hidden="true">
            <span className="ash-particle a1" />
            <span className="ash-particle a2" />
            <span className="ash-particle a3" />
            <span className="ash-particle a4" />
            <span className="ash-particle a5" />
          </div>
        )}
      </div>
    </div>
  );
};
