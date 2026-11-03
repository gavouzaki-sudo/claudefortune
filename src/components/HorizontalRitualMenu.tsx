import React, { useRef, useEffect, useCallback } from 'react';
import type { DivinationTopic } from '../types';

export interface RitualMenuItem {
  id: DivinationTopic;
  title: string;
  icon: string;
  badge: string;
  subtitle: string;
}

interface HorizontalRitualMenuProps {
  activeTopic: DivinationTopic;
  onSelectTopic: (topic: DivinationTopic) => void;
  festivalName?: string;
}

export const HorizontalRitualMenu: React.FC<HorizontalRitualMenuProps> = ({
  activeTopic,
  onSelectTopic,
  festivalName,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTopicRef = useRef<DivinationTopic>(activeTopic);
  activeTopicRef.current = activeTopic;

  const loopWidthRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  // Mouse drag-to-scroll state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const baseRituals: RitualMenuItem[] = [
    {
      id: 'stick',
      title: 'เสี่ยงเซียมซี',
      icon: '🏮',
      badge: 'ศักดิ์สิทธิ์โบราณ',
      subtitle: 'เซียมซีมงคล 28 ใบ',
    },
    {
      id: 'tarot',
      title: 'ไพ่ยิปซี',
      icon: '🔮',
      badge: 'สากลตะวันตก',
      subtitle: 'ทาโรต์เปิดลิขิตชะตา',
    },
    {
      id: 'number',
      title: 'เลขมงคล',
      icon: '🪦',
      badge: 'ตัวเลขนำโชค',
      subtitle: 'ศิลาสุสานเที่ยงคืน',
    },
    {
      id: 'ritual',
      title: 'สะเดาะเคราะห์',
      icon: '🪷',
      badge: 'ปัดเป่าเคราะห์',
      subtitle: 'ต่อดวง / ลอยโคม / แก้ปีชง',
    },
    {
      id: 'love',
      title: 'ดวงความรัก',
      icon: '💖',
      badge: 'สระบัวสีชมพู',
      subtitle: 'วาสนาคู่แท้ & ธาตุสมพงษ์',
    },
    {
      id: 'scan',
      title: 'สแกนดวง',
      icon: '🖐',
      badge: 'ไฮเทคสแกน',
      subtitle: 'เขียนลายมือ & สแกนหน้า',
    },
    {
      id: 'meditation',
      title: 'สมาธิ',
      icon: '🧘',
      badge: 'เสียงแวดล้อมมงคล',
      subtitle: 'คลื่นเสียงสมาธิ & กำหนดจิต',
    },
    {
      id: 'festival',
      title: festivalName ? `ลานขอพร (${festivalName})` : 'ไหว้พระขอพร',
      icon: '✨',
      badge: 'ศิริมงคล',
      subtitle: 'ถวายสักการะ & ปล่อยโคม',
    },
  ];

  // Repeat 5 copies (0, 1, 2, 3, 4) for seamless infinite cyclical looping
  // Copy index 2 is the initial center anchor
  const copies = [0, 1, 2, 3, 4];
  const items = copies.flatMap((copyIndex) =>
    baseRituals.map((r) => ({
      ...r,
      copyIndex,
      key: `${r.id}-copy-${copyIndex}`,
    }))
  );

  // Measure single loop width
  const measureLoopWidth = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('.ritual-menu-card');
    if (cards.length >= baseRituals.length * 2) {
      const card0 = cards[0];
      const card7 = cards[baseRituals.length];
      if (card0 && card7) {
        loopWidthRef.current = card7.offsetLeft - card0.offsetLeft;
      }
    }
  }, [baseRituals.length]);

  // Detect which card is closest to the horizontal center and switch active page
  const detectCenterCard = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const trackRect = el.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;

    const cards = el.querySelectorAll<HTMLElement>('.ritual-menu-card');
    let closestTopic: DivinationTopic | null = null;
    let minDiff = Infinity;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const diff = Math.abs(trackCenter - cardCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestTopic = card.dataset.topic as DivinationTopic;
      }
    });

    if (
      closestTopic &&
      closestTopic !== activeTopicRef.current &&
      minDiff < trackRect.width * 0.35
    ) {
      activeTopicRef.current = closestTopic;
      onSelectTopic(closestTopic);
    }
  }, [onSelectTopic]);

  // Center a given topic smoothly
  const scrollToTopic = useCallback((topic: DivinationTopic, smooth: boolean = true) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // Find card with this topic in the middle copy (copy 2)
    const targetCard = el.querySelector<HTMLElement>(
      `[data-topic="${topic}"][data-copy="2"]`
    );
    if (targetCard) {
      const scrollPos = targetCard.offsetLeft - (el.clientWidth - targetCard.clientWidth) / 2;
      el.scrollTo({ left: Math.max(0, scrollPos), behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  // Initialize carousel position to center copy on mount
  useEffect(() => {
    measureLoopWidth();
    const timer = setTimeout(() => {
      measureLoopWidth();
      scrollToTopic(activeTopicRef.current, false);
    }, 40);

    window.addEventListener('resize', measureLoopWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureLoopWidth);
    };
  }, [measureLoopWidth, scrollToTopic]);

  // Scroll handler with infinite boundary wrap and auto-center detection
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Check infinite loop boundaries
    const singleLoopWidth = loopWidthRef.current;
    if (singleLoopWidth > 0) {
      if (el.scrollLeft < singleLoopWidth * 1.1) {
        el.scrollLeft += singleLoopWidth;
      } else if (el.scrollLeft > singleLoopWidth * 3.3) {
        el.scrollLeft -= singleLoopWidth;
      }
    }

    // Auto-detect center card on scroll
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      detectCenterCard();
    });
  };

  // Arrow buttons: scroll by exactly one card width to center the next/prev ritual
  const handleArrowScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('.ritual-menu-card');
    const step = card ? card.offsetWidth + 10 : el.clientWidth * 0.67;
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  // Mouse Drag-to-Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    el.classList.add('is-dragging');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.35;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      const el = scrollContainerRef.current;
      if (el) {
        el.classList.remove('is-dragging');
        detectCenterCard();
      }
    }
  };

  const handleCardClick = (topic: DivinationTopic, e: React.MouseEvent<HTMLButtonElement>) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      return;
    }
    const el = scrollContainerRef.current;
    if (!el) return;
    const card = e.currentTarget;
    const scrollPos = card.offsetLeft - (el.clientWidth - card.clientWidth) / 2;
    el.scrollTo({ left: scrollPos, behavior: 'smooth' });
    activeTopicRef.current = topic;
    onSelectTopic(topic);
  };

  return (
    <nav className="ritual-carousel-nav" aria-label="แถบเลือกพิธีกรรมแนวนอน">
      {/* Scroll Left Button */}
      <button
        type="button"
        className="ritual-nav-arrow arrow-left"
        onClick={() => handleArrowScroll('left')}
        aria-label="เลื่อนพิธีกรรมไปทางซ้าย"
        title="เลื่อนไปทางซ้าย"
      >
        <span aria-hidden="true">◀</span>
      </button>

      {/* 1.5-Card Infinite Cyclical Track with Auto-Center Trigger */}
      <div
        ref={scrollContainerRef}
        className="ritual-carousel-track"
        tabIndex={0}
        role="tablist"
        aria-label="รายชื่อพิธีกรรมหมุนเวียน"
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {items.map((item) => {
          const isActive = item.id === activeTopic;
          return (
            <button
              key={item.key}
              role="tab"
              data-topic={item.id}
              data-copy={item.copyIndex}
              aria-selected={isActive}
              className={`ritual-menu-card ${isActive ? 'active' : ''}`}
              onClick={(e) => handleCardClick(item.id, e)}
            >
              <div className="card-header-badge">
                <span className="card-badge-pill">{item.badge}</span>
                {isActive && <span className="card-active-indicator">กำลังประกอบพิธี</span>}
              </div>

              <div className="card-main-content">
                <span className="card-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <div className="card-titles">
                  <span className="card-title">{item.title}</span>
                  <span className="card-subtitle">{item.subtitle}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        type="button"
        className="ritual-nav-arrow arrow-right"
        onClick={() => handleArrowScroll('right')}
        aria-label="เลื่อนพิธีกรรมไปทางขวา"
        title="เลื่อนไปทางขวา"
      >
        <span aria-hidden="true">▶</span>
      </button>
    </nav>
  );
};
