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
      {/* Burn Progress Indicator Header (Compact) */}
      <div className="burn-status-bar">
        <div className="burn-status-text">
          <span className="burn-status-left">
            <span className="burn-fire-icon">🔥</span>
            <span>
              เพลิงเผายันต์: <b className="burn-highlight">{burnLevel} / 3 ตา</b>
            </span>
          </span>
          <span className="burn-status-hint">
            {burnLevel === 0 && 'ชนะมินิเกมเพื่อเริ่มจุดไฟ'}
            {burnLevel === 1 && 'ชนะตาที่ 1: เพลิงเริ่มติดขอบ'}
            {burnLevel === 2 && 'ชนะตาที่ 2: เพลิงลามใจกลาง'}
            {burnLevel === 3 && 'ชนะตาที่ 3: เผาไหม้สมบูรณ์!'}
          </span>
        </div>
        <div className="burn-meter-track" aria-hidden="true">
          <div
            className={`burn-meter-fill burn-lv-${burnLevel}`}
            style={{ width: `${burnPercent}%` }}
          />
        </div>
      </div>

      {/* Parchment Box (Compact, Smaller Frame) */}
      <div className={`talisman-frame ${burnLevel === 3 ? 'fully-consumed' : ''}`}>
        {/* Layer 1: Revealed Sacred Numbers underneath */}
        <div
          className="talisman-revealed-layer"
          aria-label={`เลขมงคล: ${burnLevel === 3 ? luckyNumber : 'ยังไม่เปิดเผย'}`}
        >
          <div className="revealed-glow-ring" />
          <div className="revealed-badge-tag">
            {category === 0 ? 'เลขท้าย 2 ตัวมงคล' : 'เลขท้าย 3 ตัวมงคล'}
          </div>

          <div className="revealed-digits-row">
            {Array.from(luckyNumber).map((digit, idx) => {
              // Rule: "ตัวเลขไม่ควรแสดง ให้เห็นชัด ชนะครั้ง 1 , 2 ให้ชัดดูออกตอน ครั้งที่ 3"
              const isRound3 = burnLevel === 3;
              const isRound2 = burnLevel === 2;
              const isRound1 = burnLevel === 1;

              let displayChar = '?';
              let charClass = 'digit-unburned-hidden';

              if (isRound3) {
                // Round 3: Completely revealed, sharp, illuminated, 100% clear
                displayChar = digit;
                charClass = 'fully-illuminated';
              } else if (isRound2) {
                // Round 2: Obscured in heat haze / smoke, heavy blur, CANNOT decipher what number it is
                displayChar = digit;
                charClass = 'digit-smoky-obscured';
              } else if (isRound1) {
                // Round 1: Still masked as '?' hidden behind charred embers
                displayChar = '?';
                charClass = 'digit-charred-hidden';
              } else {
                displayChar = '?';
                charClass = 'digit-unburned-hidden';
              }

              return (
                <span
                  key={idx}
                  className={`revealed-digit digit-${idx} ${charClass}`}
                >
                  {displayChar}
                </span>
              );
            })}
          </div>

          {/* At Round 2: Mysterious smoke overlay that prevents reading the digits */}
          {burnLevel === 2 && (
            <div className="smoke-obscurity-veil" aria-hidden="true">
              <span className="smoke-text">🔥 ควันเพลิงบดบัง... ชนะตาที่ 3 จะเห็นเลขชัด!</span>
            </div>
          )}

          {burnLevel === 3 && (
            <div className="revealed-blessing-seal">
              <span>✦ มงคลฤกษ์โชคลาภพูนทวี ✦</span>
            </div>
          )}
        </div>

        {/* Layer 2: The Burning Paper Talisman Overlap with Chars & Embers */}
        {burnLevel < 3 && (
          <div
            className={`talisman-paper-overlay burn-state-${burnLevel}`}
            aria-hidden="true"
          >
            {/* Ancient Talisman Inscriptions (Compact) */}
            <div className="talisman-script-header">
              <span className="talisman-dragon-seal">敕令</span>
              <span className="talisman-sub-seal">ยันต์ไฟเบิกโชค</span>
            </div>

            <div className="talisman-diagram">
              <svg viewBox="0 0 100 80" className="talisman-yantra-svg">
                <circle cx="50" cy="40" r="32" fill="none" stroke="#8b1e16" strokeWidth="1.5" />
                <circle cx="50" cy="40" r="26" fill="none" stroke="#8b1e16" strokeWidth="1" strokeDasharray="3 2" />
                <polygon points="50,14 62,32 78,40 62,48 50,66 38,48 22,40 38,32" fill="none" stroke="#8b1e16" strokeWidth="1.2" />
                <text x="50" y="44" fill="#69120c" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                  招財
                </text>
              </svg>
            </div>

            {/* Glowing Embers and Burn Edge */}
            <div className="talisman-burn-edges">
              <span className="ember-spark s1" />
              <span className="ember-spark s2" />
              <span className="ember-spark s3" />
              <span className="ember-spark s4" />
            </div>

            {/* Charred border message */}
            <div className="talisman-char-hint">
              {burnLevel === 0
                ? 'ชนะมินิเกมเพื่อเริ่มจุดไฟ'
                : burnLevel === 1
                ? 'ชนะอีก 2 ตาเพลิงจะลาม'
                : 'ชนะอีกเพียง 1 ตาเพื่อเปิดเลข!'}
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
