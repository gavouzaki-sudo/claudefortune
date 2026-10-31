import React from 'react';
import { MYSTICAL_THEMES } from '../data/themes';

interface HeaderProps {
  theme: string;
  onThemeChange: (newTheme: string) => void;
  onRandomTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeChange,
  onRandomTheme,
}) => {
  const festivals = MYSTICAL_THEMES.filter((t) => t.category === 'festival');
  const regions = MYSTICAL_THEMES.filter((t) => t.category === 'region');

  return (
    <header className="top mystical-header">
      <div className="brand">
        <span className="brand-lantern" aria-hidden="true" />
        <div>
          <h1>ศาลเจ้าแห่งโชคลาภ</h1>
          <p className="sub">
            เซียมซี · ไพ่ยิปซี · สะเดาะเคราะห์และโหราศาสตร์สากล
          </p>
        </div>
      </div>

      <div className="header-controls">
        <button
          type="button"
          className="btn-random-theme"
          onClick={onRandomTheme}
          title="สุ่มธีมเหนือธรรมชาติ"
          aria-label="สุ่มธีมเหนือธรรมชาติ"
        >
          <span className="dice-icon">🎲</span>
          <span className="btn-text">สุ่มธีมมิติลี้ลับ</span>
        </button>

        <label className="theme-pick">
          <span>ธีม</span>
          <select
            id="theme"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
            aria-label="เลือกธีมเทศกาลและภูมิภาค"
          >
            <option value="auto">ตามเทศกาล (อัตโนมัติ)</option>
            <optgroup label="เทศกาลมงคล">
              {festivals.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.icon} {t.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="ภูมิภาคและอารยธรรมเหนือธรรมชาติ">
              {regions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.icon} {t.name}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
      </div>
    </header>
  );
};
