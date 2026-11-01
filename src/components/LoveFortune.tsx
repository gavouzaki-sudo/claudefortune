import React, { useState } from 'react';
import type { UserSession } from '../types';

interface LoveFortuneProps {
  session: UserSession;
  onToast: (msg: string) => void;
}

interface LoveReading {
  status: string;
  verdict: string;
  score: number; // 1-100
  prediction: string;
  soulmateElement: string;
  soulmateTrait: string;
  mantra: string;
}

const LOVE_PREDICTIONS: Record<string, LoveReading[]> = {
  single: [
    {
      status: 'คนโสด',
      verdict: 'วาสนารักแท้กำลังผลิบานดั่งบัวรับอรุณ',
      score: 88,
      prediction: 'มีเกณฑ์พบเจอผู้มีวาสนาผูกพันจากสายงานหรือการเดินทางไกล เขาผู้นี้จะนำพาความอบอุ่นและปัญญามาสู่หัวใจคุณ',
      soulmateElement: 'ธาตุน้ำ / ธาตุลม',
      soulmateTrait: 'สุภาพ อ่อนโยน มีรอยยิ้มอบอุ่น และรับฟังคุณอย่างเข้าใจ',
      mantra: 'โอม นะโม พุทธายะ เมตตาจิตตัง ปิยัง มะมะ',
    },
    {
      status: 'คนโสด',
      verdict: 'แสงจันทร์นำทาง คนที่แอบรอคอยกำลังปรากฏตัว',
      score: 93,
      prediction: 'ความสัมพันธ์ที่เริ่มต้นจากความเป็นมิตรภาพจะค่อยๆ พัฒนาสู่ความรักอันลึกซึ้ง เปิดใจรับสิ่งใหม่แล้วคุณจะพบคำตอบ',
      soulmateElement: 'ธาตุทอง / ธาตุไฟ',
      soulmateTrait: 'กระตือรือร้น จริงใจ เป็นผู้นำ และเคียงข้างคุณในทุกอุปสรรค',
      mantra: 'นะเมตตา โมกรุณา พุทปราณี ธายินดี ยะเอ็นดู',
    },
    {
      status: 'คนโสด',
      verdict: 'เสน่ห์เรืองรอง ดั่งจันทร์เพ็ญกระจ่างฟ้า',
      score: 85,
      prediction: 'ช่วงนี้ออร่าความรักของคุณเปล่งประกาย มีคนแอบชื่นชมคุณอยู่ไม่ไกล อย่าปิดกั้นความรู้สึก จงกล้าที่จะยิ้มทักทาย',
      soulmateElement: 'ธาตุดิน / ธาตุไม้',
      soulmateTrait: 'มั่นคง สม่ำเสมอ ไม่หวือหวาแต่รักจริงใจและพึ่งพาได้เสมอ',
      mantra: 'จันทรา เมตตา ปิยัง ปิยะมะมะ สุโข โหตุ',
    },
  ],
  crush: [
    {
      status: 'คนแอบชอบ',
      verdict: 'ใจตรงกันดั่งคลื่นกระทบผิวน้ำ',
      score: 91,
      prediction: 'คนที่คุณเฝ้ามองก็กำลังแอบสังเกตความน่ารักของคุณอยู่เช่นกัน สัญญาณตอบรับจะชัดเจนขึ้นในไม่ช้า ลองชวนคุยเรื่องที่เขาสนใจ',
      soulmateElement: 'ธาตุน้ำ / ธาตุทอง',
      soulmateTrait: 'ตาเป็นประกายเวลาพูดถึงสิ่งที่รัก และมีความเข้าอกเข้าใจผู้อื่นสูง',
      mantra: 'อิติปิโส ภะคะวา เมตตัญจะ สัพพะโลกัสมิง',
    },
    {
      status: 'คนแอบชอบ',
      verdict: 'ความผูกพันดุจดั่งชะตาต้องมนตร์',
      score: 82,
      prediction: 'การรอคอยและการให้เกียรติซึ่งกันและกันจะเปลี่ยนความหวั่นไหวเป็นความผูกพันที่มั่นคง จงแสดงความจริงใจเป็นตัวของตัวเอง',
      soulmateElement: 'ธาตุลม / ธาตุไฟ',
      soulmateTrait: 'มีเสน่ห์ทางคำพูด มีอารมณ์ขัน และทำให้คุณสบายใจเสมอเมื่ออยู่ใกล้',
      mantra: 'ปิโย เทวะมะนุสสานัง ปิโย พรหมานะมุตตะโม',
    },
  ],
  couple: [
    {
      status: 'คนมีคู่',
      verdict: 'สายใยรักผูกพันมั่นคงดั่งศิลาศักดิ์สิทธิ์',
      score: 96,
      prediction: 'ความเข้าใจและความซื่อสัตย์จะนำพาชีวิตคู่ก้าวสู่ความสำเร็จ มีเกณฑ์วางแผนอนาคตสำคัญร่วมกัน หรือได้ท่องเที่ยวพักผ่อนฟื้นฟูหัวใจ',
      soulmateElement: 'ธาตุหนุนนำซึ่งกันและกัน',
      soulmateTrait: 'คู่บุญบารมี เกื้อหนุนทั้งการงานและการสร้างรากฐานครอบครัว',
      mantra: 'สัพเพชะนา พะหูชะนา สุขาชีวี มหาปิยัง',
    },
    {
      status: 'คนมีคู่',
      verdict: 'ประนีประนอมแล้วความอบอุ่นจะหวนคืน',
      score: 87,
      prediction: 'หากมีเรื่องขุ่นข้องหมองใจ การให้อภัยและการพูดจาด้วยความอ่อนโยนจะช่วยขจัดความตึงเครียด ความหวานชื่นจะกลับมาทวีคูณ',
      soulmateElement: 'ธาตุน้ำหล่อเลี้ยงธาตุไฟ',
      soulmateTrait: 'แม้มีความต่าง แต่สามารถเติมเต็มสิ่งที่อีกฝ่ายขาดหายได้อย่างลงตัว',
      mantra: 'สิเนหัง มหาลาภัง ชะโย นิจจัง ปิยะกะโร',
    },
  ],
};

export const LoveFortune: React.FC<LoveFortuneProps> = ({ session, onToast }) => {
  const [selectedStatus, setSelectedStatus] = useState<'single' | 'crush' | 'couple'>('single');
  const [reading, setReading] = useState<LoveReading | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [lotusPetals, setLotusPetals] = useState<number>(0);

  const handleDivinate = () => {
    setIsReading(true);
    setReading(null);

    // Dynamic lotus blossom vibration
    setLotusPetals((prev) => prev + 1);

    setTimeout(() => {
      const pool = LOVE_PREDICTIONS[selectedStatus] || LOVE_PREDICTIONS.single;
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      setReading(chosen);
      setIsReading(false);
      onToast(`✨ ดวงความรักคลี่คลาย: คะแนนรัก ${chosen.score}%`);
    }, 850);
  };

  return (
    <section id="love-fortune" className="panel love-fortune-panel">
      <h2 className="title">💖 มณฑลดวงความรัก & คู่แท้แห่งโชคชะตา</h2>
      <p className="lead">
        สดับรับฟังเสียงคลื่นหัวใจใต้เงาจันทร์เพ็ญสีชมพู พร้อมพลังอารยธรรม <b>{session.systemName}</b> ({session.symbolName})
      </p>

      {/* Relationship Status Selector */}
      <div className="status-selector-row">
        <label className="status-choice-label">สถานะหัวใจของคุณ:</label>
        <div className="status-button-group">
          <button
            type="button"
            className={`btn-status ${selectedStatus === 'single' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('single')}
          >
            🌸 คนโสด (ตามหารักแท้)
          </button>
          <button
            type="button"
            className={`btn-status ${selectedStatus === 'crush' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('crush')}
          >
            💌 คนแอบชอบ (วัดใจ)
          </button>
          <button
            type="button"
            className={`btn-status ${selectedStatus === 'couple' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('couple')}
          >
            💍 คนมีคู่ (เสริมสายใย)
          </button>
        </div>
      </div>

      {/* Lotus Pond Action Button */}
      <div className="love-action-center">
        <button
          type="button"
          className="btn primary btn-love-divine"
          onClick={handleDivinate}
          disabled={isReading}
        >
          {isReading ? (
            <span>กำลังส่องจิตผ่านเงาจันทร์... 🌙</span>
          ) : (
            <span>🪷 เสี่ยงทายดวงความรัก ➔</span>
          )}
        </button>
      </div>

      {/* Reading Result Card */}
      {reading && (
        <div className="result love-result-card animate-rise">
          <div className="love-card-header">
            <span className="love-badge">{reading.status}</span>
            <span className="love-score-badge">ความสมพงษ์ {reading.score}%</span>
          </div>

          <h3 className="love-verdict-title">{reading.verdict}</h3>
          <p className="love-prediction-text">{reading.prediction}</p>

          <div className="love-traits-grid">
            <div className="trait-box">
              <span className="trait-title">ธาตุคู่แท้ที่สมพงษ์</span>
              <span className="trait-value">{reading.soulmateElement}</span>
            </div>
            <div className="trait-box">
              <span className="trait-title">ลักษณะเด่นของคู่ชะตา</span>
              <span className="trait-value">{reading.soulmateTrait}</span>
            </div>
          </div>

          <div className="love-mantra-box">
            <span className="mantra-label">บทสวดมนต์เสริมเมตตามหาเสน่ห์ประจำดวงชะตา:</span>
            <p className="mantra-text">"{reading.mantra}"</p>
          </div>
        </div>
      )}
    </section>
  );
};
