import React, { useState, useEffect } from 'react';
import {
  getJournalEntries,
  deleteJournalEntry,
  toggleJournalBookmark,
  updateJournalNote,
  clearJournal,
  subscribeJournal,
  type FortuneJournalEntry,
  type FortuneType,
} from '../utils/fortuneJournal';
import { useLanguage } from '../context/LanguageContext';
import type { CardData } from '../utils/luckyCardCanvas';

interface FortuneJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCard: (card: CardData) => void;
  onToast: (msg: string) => void;
}

export const FortuneJournalModal: React.FC<FortuneJournalModalProps> = ({
  isOpen,
  onClose,
  onOpenCard,
  onToast,
}) => {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<FortuneJournalEntry[]>([]);
  const [filter, setFilter] = useState<FortuneType | 'all' | 'bookmarked'>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setShowClearConfirm(false);
      return;
    }
    setEntries(getJournalEntries());
    const unsub = subscribeJournal(() => {
      setEntries(getJournalEntries());
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredEntries = entries.filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'bookmarked') return !!e.bookmarked;
    return e.type === filter;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteJournalEntry(id);
    setEntries((prev) => prev.filter((item) => item.id !== id));
    onToast('ลบรายการออกจากสมุดแล้ว');
  };

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isNow = toggleJournalBookmark(id);
    setEntries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, bookmarked: isNow } : item))
    );
    onToast(isNow ? 'บันทึกในรายการโปรด ⭐' : 'ยกเลิกรายการโปรด');
  };

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const handleExecuteClearAll = () => {
    clearJournal();
    setEntries([]);
    setShowClearConfirm(false);
    onToast('ล้างประวัติดวงชะตาทั้งหมดแล้ว');
  };

  const handleCancelClearAll = () => {
    setShowClearConfirm(false);
  };

  const handleSaveNote = (id: string) => {
    updateJournalNote(id, noteText);
    setEntries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes: noteText } : item))
    );
    setEditingNoteId(null);
    setNoteText('');
    onToast('บันทึกคำอธิษฐานแล้ว ✨');
  };

  const convertToCardData = (entry: FortuneJournalEntry): CardData => {
    return {
      type: entry.type,
      title: entry.title,
      dateStr: entry.dateFormatted,
      systemName: entry.zodiacSystem,
      symbolName: entry.zodiacSymbol,
      details: (entry.details as CardData['details']) || {},
    };
  };

  const getTypeIcon = (type: FortuneType) => {
    switch (type) {
      case 'stick':
        return '🏮';
      case 'tarot':
        return '🔮';
      case 'number':
        return '🪦';
      case 'remedy':
        return '🪷';
      case 'scan':
        return '🖐';
      case 'auspicious':
        return '🗓️';
      default:
        return '✨';
    }
  };

  return (
    <div
      className="journal-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.journalTitle}
    >
      <div className="journal-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="journal-header">
          <div className="journal-header-left">
            <span className="journal-header-emblem">📖</span>
            <div>
              <h3>{t.journalTitle}</h3>
              <p className="journal-count-badge">
                {entries.length} บันทึกชะตา
              </p>
            </div>
          </div>
          <div className="journal-header-actions">
            {entries.length > 0 && (
              <button
                type="button"
                className="btn-journal-clear"
                onClick={handleClearAll}
                title={t.journalClearAll}
              >
                {t.journalClearAll}
              </button>
            )}
            <button
              type="button"
              className="journal-close-btn"
              onClick={onClose}
              aria-label="ปิด"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Clear All Confirmation Banner (Replaces blocked window.confirm) */}
        {showClearConfirm && (
          <div className="journal-clear-confirm-banner" role="alert">
            <div className="journal-clear-confirm-text">
              <span className="warn-icon">⚠️</span>
              <span>{t.journalClearConfirmPrompt}</span>
            </div>
            <div className="journal-clear-confirm-actions">
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleExecuteClearAll}
              >
                {t.journalConfirmClearBtn}
              </button>
              <button
                type="button"
                className="btn-cancel-confirm"
                onClick={handleCancelClearAll}
              >
                {t.journalCancel}
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="journal-filter-tabs">
          <button
            type="button"
            className={`journal-tab-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t.journalAll} ({entries.length})
          </button>
          <button
            type="button"
            className={`journal-tab-pill ${filter === 'stick' ? 'active' : ''}`}
            onClick={() => setFilter('stick')}
          >
            🏮 {t.journalSticks}
          </button>
          <button
            type="button"
            className={`journal-tab-pill ${filter === 'tarot' ? 'active' : ''}`}
            onClick={() => setFilter('tarot')}
          >
            🔮 {t.journalTarot}
          </button>
          <button
            type="button"
            className={`journal-tab-pill ${filter === 'number' ? 'active' : ''}`}
            onClick={() => setFilter('number')}
          >
            🪦 {t.journalNumbers}
          </button>
          <button
            type="button"
            className={`journal-tab-pill ${filter === 'auspicious' ? 'active' : ''}`}
            onClick={() => setFilter('auspicious')}
          >
            🗓️ ฤกษ์มงคล
          </button>
          <button
            type="button"
            className={`journal-tab-pill ${filter === 'bookmarked' ? 'active' : ''}`}
            onClick={() => setFilter('bookmarked')}
          >
            ⭐ {t.journalSaved}
          </button>
        </div>

        {/* Content list */}
        <div className="journal-body">
          {filteredEntries.length === 0 ? (
            <div className="journal-empty-box">
              <span className="journal-empty-icon">📜</span>
              <h4>{t.journalEmpty}</h4>
              <p>{t.journalEmptyDesc}</p>
            </div>
          ) : (
            <div className="journal-entry-list">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="journal-entry-card">
                  <div className="journal-entry-card-top">
                    <div className="journal-entry-meta">
                      <span className="journal-entry-type-icon">
                        {getTypeIcon(entry.type)}
                      </span>
                      <div>
                        <h4 className="journal-entry-title">{entry.title}</h4>
                        <span className="journal-entry-date">
                          {entry.dateFormatted}
                          {entry.zodiacSymbol ? ` · ${entry.zodiacSymbol}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="journal-entry-top-actions">
                      <button
                        type="button"
                        className={`btn-entry-bookmark ${entry.bookmarked ? 'bookmarked' : ''}`}
                        onClick={(e) => handleToggleBookmark(entry.id, e)}
                        title="บุ๊กมาร์ก"
                        aria-label="บันทึกเป็นรายการโปรด"
                      >
                        {entry.bookmarked ? '★' : '☆'}
                      </button>
                      <button
                        type="button"
                        className="btn-entry-delete"
                        onClick={(e) => handleDelete(entry.id, e)}
                        title={t.journalDelete}
                        aria-label={t.journalDelete}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <p className="journal-entry-summary">{entry.summary}</p>

                  {/* Personal Note */}
                  {entry.notes && (
                    <div className="journal-entry-saved-note">
                      <span className="note-label">📝 คำขอพร/บันทึก:</span>
                      <p className="note-text">{entry.notes}</p>
                    </div>
                  )}

                  {/* Note Editing Form */}
                  {editingNoteId === entry.id ? (
                    <div className="journal-note-editor">
                      <input
                        type="text"
                        className="journal-note-input"
                        placeholder={t.journalAddNotes}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        maxLength={200}
                        autoFocus
                      />
                      <div className="journal-note-actions">
                        <button
                          type="button"
                          className="btn gold btn-sm"
                          onClick={() => handleSaveNote(entry.id)}
                        >
                          บันทึก
                        </button>
                        <button
                          type="button"
                          className="btn ghost btn-sm"
                          onClick={() => setEditingNoteId(null)}
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Bottom Action Bar */}
                  <div className="journal-entry-bottom-bar">
                    <button
                      type="button"
                      className="btn gold btn-sm btn-journal-view-card"
                      onClick={() => onOpenCard(convertToCardData(entry))}
                    >
                      <span>🎴 {t.journalViewCard}</span>
                    </button>

                    {editingNoteId !== entry.id && (
                      <button
                        type="button"
                        className="btn ghost btn-sm btn-journal-note-toggle"
                        onClick={() => {
                          setEditingNoteId(entry.id);
                          setNoteText(entry.notes || '');
                        }}
                      >
                        <span>✏️ {entry.notes ? 'แก้ไขบันทึก' : 'เพิ่มคำขอพร'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
