import React from 'react';

interface HeaderProps {
  theme: string;
  onThemeChange: (newTheme: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onThemeChange }) => {
  return (
    <header className="top">
      <div className="brand">
        <span className="brand-lantern" aria-hidden="true" />
        <div>
          <h1>ศาลเจ้าแห่งโชคลาภ</h1>
          <p className="sub">เซียมซี · ไพ่ยิปซี · สะเดาะเคราะห์ออนไลน์</p>
        </div>
      </div>
      <label className="theme-pick">
        <span>ธีม</span>
        <select
          id="theme"
          value={theme}
          onChange={(e) => onThemeChange(e.target.value)}
          aria-label="เลือกธีมเทศกาล"
        >
          <option value="auto">ตามเทศกาล (อัตโนมัติ)</option>
          <option value="shrine">ศาลเจ้า (ปกติ)</option>
          <option value="songkran">สงกรานต์</option>
          <option value="halloween">ฮาโลวีน</option>
          <option value="loy">ลอยกระทง</option>
          <option value="cny">ตรุษจีน</option>
          <option value="newyear">ปีใหม่</option>
        </select>
      </label>
    </header>
  );
};
