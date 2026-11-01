import React, { useState, useEffect } from 'react';
import { toggleMuteChant, isChantMuted, subscribeChantState } from '../utils/chantAudio';

interface HeaderProps {
  onGoHome?: () => void;
  hasActiveSession?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onGoHome, hasActiveSession }) => {
  const [muted, setMuted] = useState<boolean>(isChantMuted());

  useEffect(() => {
    const unsub = subscribeChantState(() => {
      setMuted(isChantMuted());
    });
    return () => unsub();
  }, []);

  const handleToggle = () => {
    const next = toggleMuteChant();
    setMuted(next);
  };

  return (
    <header className={`top mystical-header ${hasActiveSession ? 'header-session-compact' : ''}`}>
      <div
        className="brand"
        onClick={onGoHome}
        style={{ cursor: onGoHome ? 'pointer' : 'default' }}
        title={onGoHome ? 'คลิกเพื่อกลับหน้าหลัก / เลือกอารยธรรม' : undefined}
        role={onGoHome ? 'button' : undefined}
        tabIndex={onGoHome ? 0 : undefined}
        onKeyDown={(e) => {
          if (onGoHome && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onGoHome();
          }
        }}
      >
        <span className="brand-lantern" aria-hidden="true" />
        <div>
          <h1>ศาลเจ้าแห่งโชคลาภ</h1>
          <p className="sub">
            เซียมซี · ไพ่ยิปซี · สะเดาะเคราะห์และโหราศาสตร์สากล
          </p>
        </div>
      </div>

      <div className="header-actions-right">
        {hasActiveSession && onGoHome && (
          <button
            type="button"
            className="btn-header-home-action"
            onClick={onGoHome}
            title="กลับสู่หน้าหลัก"
          >
            <span>🏠 กลับหน้าหลัก</span>
          </button>
        )}

        {/* Upper-right Audio Speaker Toggle */}
        <div className="header-audio-control">
          <button
            type="button"
            className={`btn-speaker-icon-only ${muted ? 'is-muted' : 'is-active'}`}
            onClick={handleToggle}
            title={muted ? 'เปิดเสียงดนตรี' : 'ปิดเสียงดนตรี'}
            aria-label={muted ? 'เปิดเสียงดนตรี' : 'ปิดเสียงดนตรี'}
          >
            <span className="speaker-icon">{muted ? '🔇' : '🔊'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
