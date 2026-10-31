import React, { useState } from 'react';
import { Bridge } from '../bridge';
import type { UserSession } from '../types';

interface GateProps {
  bridge: Bridge;
  onSessionStart: (session: UserSession) => void;
}

export const ZODIAC_OPTIONS = [
  { value: -1, label: "คำนวณจากปีเกิด" },
  { value: 0, label: "ชวด (หนู)" },
  { value: 1, label: "ฉลู (วัว)" },
  { value: 2, label: "ขาล (เสือ)" },
  { value: 3, label: "เถาะ (กระต่าย)" },
  { value: 4, label: "มะโรง (งูใหญ่)" },
  { value: 5, label: "มะเส็ง (งูเล็ก)" },
  { value: 6, label: "มะเมีย (ม้า)" },
  { value: 7, label: "มะแม (แพะ)" },
  { value: 8, label: "วอก (ลิง)" },
  { value: 9, label: "ระกา (ไก่)" },
  { value: 10, label: "จอ (สุนัข)" },
  { value: 11, label: "กุน (หมู)" },
];

export const Gate: React.FC<GateProps> = ({ bridge, onSessionStart }) => {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [zodiac, setZodiac] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsedYear = parseInt(year, 10);
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('กรุณาระบุชื่อหรือชื่อเล่น');
      return;
    }
    if (isNaN(parsedYear)) {
      setError('กรุณาระบุปีเกิดเป็นตัวเลข');
      return;
    }

    const z = bridge.initSession(trimmedName, parsedYear, zodiac);
    if (z < 0) {
      setError(
        z === -2
          ? 'ปีเกิดไม่ถูกต้อง (ใส่ระหว่าง พ.ศ. 2443–2700 หรือ ค.ศ. 1900–2157)'
          : 'ข้อมูลไม่ถูกต้อง ลองตรวจสอบอีกครั้ง'
      );
      return;
    }

    const info = bridge.zodiacInfo(z);
    const session: UserSession = {
      name: trimmedName,
      year: parsedYear,
      zodiac: z,
      info,
    };

    try {
      sessionStorage.setItem('shrine.session', JSON.stringify({ name: trimmedName, year: parsedYear, zodiac }));
    } catch {
      // Ignore private mode storage failure
    }

    bridge.seed();
    onSessionStart(session);
  };

  return (
    <section id="gate" className="panel gate">
      <h2 className="title">เริ่มพิธี</h2>
      <p className="lead">
        บอกชื่อและปีเกิดเพื่อให้คำทำนายเป็นของคุณโดยเฉพาะ — ข้อมูลทั้งหมดประมวลผลในเครื่องของคุณ ไม่ถูกส่งไปไหน
      </p>
      <form id="gate-form" autoComplete="off" onSubmit={handleSubmit}>
        <label>
          ชื่อ หรือ ชื่อเล่น
          <input
            id="in-name"
            type="text"
            maxLength={60}
            placeholder="เช่น สมชาย"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          ปีเกิด (พ.ศ. หรือ ค.ศ.)
          <input
            id="in-year"
            type="number"
            inputMode="numeric"
            min="1900"
            max="2700"
            placeholder="เช่น 2540"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
        </label>
        <label>
          นักษัตร
          <select
            id="in-zodiac"
            value={zodiac}
            onChange={(e) => setZodiac(parseInt(e.target.value, 10))}
          >
            {ZODIAC_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <button className="btn primary" type="submit">
          เข้าสู่ศาลเจ้า
        </button>
      </form>
      {error && (
        <p id="gate-error" className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
};
