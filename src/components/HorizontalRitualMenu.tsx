import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import type { DivinationTopic } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface RitualMenuItem {
  id: DivinationTopic;
  title: string;
}

interface HorizontalRitualMenuProps {
  activeTopic: DivinationTopic;
  onSelectTopic: (topic: DivinationTopic) => void;
  festivalName?: string;
}

/**
 * Calculates the exact scrollLeft required to center a card horizontally
 * within the carousel track, immune to offsetParent hierarchy or subpixel differences.
 */
const getCardCenterPos = (track: HTMLElement, card: HTMLElement): number => {
  const trackRect = track.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const cardLeftRelativeToTrack = cardRect.left - trackRect.left + track.scrollLeft;
  const targetScrollLeft = cardLeftRelativeToTrack - (track.clientWidth - card.clientWidth) / 2;
  return Math.max(0, targetScrollLeft);
};

export const HorizontalRitualMenu: React.FC<HorizontalRitualMenuProps> = ({
  activeTopic,
  onSelectTopic,
  festivalName,
}) => {
  const { lang, t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeTopicRef = useRef<DivinationTopic>(activeTopic);
  const activeTopicIndexRef = useRef<number>(0);
  const activeCopyRef = useRef<number>(2);

  const isNavigatingRef = useRef(false);
  const navigateTimeoutRef = useRef<number | null>(null);
  const scrollDebounceTimerRef = useRef<number | null>(null);

  // Mouse drag-to-scroll state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const baseRituals: RitualMenuItem[] = useMemo(
    () => [
      {
        id: 'stick',
        title: t.topicStick,
      },
      {
        id: 'tarot',
        title: t.topicTarot,
      },
      {
        id: 'number',
        title: t.topicNumber,
      },
      {
        id: 'ritual',
        title: t.topicRitual,
      },
      {
        id: 'love',
        title: t.topicLove,
      },
      {
        id: 'scan',
        title: t.topicScan,
      },
      {
        id: 'meditation',
        title: t.topicMeditation,
      },
      {
        id: 'auspicious',
        title: t.topicAuspicious,
      },
      {
        id: 'festival',
        title:
          lang === 'th'
            ? festivalName
              ? festivalName.includes('ลอยกระทง')
                ? 'ลอยกระทง'
                : `${t.topicFestival} (${festivalName})`
              : 'ลอยกระทง'
            : t.topicFestival,
      },
    ],
    [lang, t, festivalName]
  );

  // Repeat 5 copies (0, 1, 2, 3, 4) for seamless infinite cyclical looping
  // Copy index 2 is the canonical middle anchor
  const copies = [0, 1, 2, 3, 4];
  const items = useMemo(
    () =>
      copies.flatMap((copyIndex) =>
        baseRituals.map((r) => ({
          ...r,
          copyIndex,
          key: `${r.id}-copy-${copyIndex}`,
        }))
      ),
    [baseRituals]
  );

  // Detect which card is closest to horizontal center AFTER touch/mouse scroll has settled
  const detectCenterCard = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || isNavigatingRef.current || isDraggingRef.current) return;

    const trackRect = el.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;

    const cards = el.querySelectorAll<HTMLElement>('.ritual-menu-card');
    let closestCard: HTMLElement | null = null;
    let minDiff = Infinity;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const diff = Math.abs(trackCenter - cardCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestCard = card;
      }
    });

    if (closestCard) {
      const closestTopic = (closestCard as HTMLElement).dataset.topic as DivinationTopic;
      const closestCopy = parseInt((closestCard as HTMLElement).dataset.copy || '2', 10);
      const idx = baseRituals.findIndex((r) => r.id === closestTopic);

      if (closestTopic && closestTopic !== activeTopicRef.current) {
        activeTopicRef.current = closestTopic;
        activeTopicIndexRef.current = idx !== -1 ? idx : 0;
        activeCopyRef.current = closestCopy;
        onSelectTopic(closestTopic);
      }

      // Seamlessly normalize to copy 2 if stopped outside the center copy
      if (closestCopy !== 2) {
        const copy2Card = el.querySelector<HTMLElement>(
          `[data-topic="${closestTopic}"][data-copy="2"]`
        );
        if (copy2Card) {
          const normalPos = getCardCenterPos(el, copy2Card);
          el.scrollTo({ left: normalPos, behavior: 'auto' });
          activeCopyRef.current = 2;
        }
      }
    }
  }, [baseRituals, onSelectTopic]);

  // Initialize carousel position to center copy on mount
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const initTopic = activeTopicRef.current;
    const idx = baseRituals.findIndex((r) => r.id === initTopic);
    if (idx !== -1) {
      activeTopicIndexRef.current = idx;
    }
    activeCopyRef.current = 2;

    const centerInit = () => {
      const target = el.querySelector<HTMLElement>(
        `[data-topic="${initTopic}"][data-copy="2"]`
      );
      if (target) {
        const targetPos = getCardCenterPos(el, target);
        el.scrollTo({ left: targetPos, behavior: 'auto' });
      }
    };

    centerInit();
    const timer = setTimeout(centerInit, 60);
    return () => clearTimeout(timer);
  }, [baseRituals]);

  // Keep centered on window/orientation resize
  useEffect(() => {
    const handleResize = () => {
      const el = scrollContainerRef.current;
      if (!el || isNavigatingRef.current) return;
      const curTopic = activeTopicRef.current;
      const target = el.querySelector<HTMLElement>(
        `[data-topic="${curTopic}"][data-copy="2"]`
      );
      if (target) {
        const targetPos = getCardCenterPos(el, target);
        el.scrollTo({ left: targetPos, behavior: 'auto' });
        activeCopyRef.current = 2;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update position if activeTopic changes externally (e.g. Back to Gate or direct navigation)
  useEffect(() => {
    if (activeTopic === activeTopicRef.current) return;
    activeTopicRef.current = activeTopic;
    const idx = baseRituals.findIndex((r) => r.id === activeTopic);
    if (idx !== -1) {
      activeTopicIndexRef.current = idx;
    }
    if (!isNavigatingRef.current) {
      const el = scrollContainerRef.current;
      if (el) {
        const target = el.querySelector<HTMLElement>(
          `[data-topic="${activeTopic}"][data-copy="2"]`
        );
        if (target) {
          const targetPos = getCardCenterPos(el, target);
          el.scrollTo({ left: targetPos, behavior: 'smooth' });
          activeCopyRef.current = 2;
        }
      }
    }
  }, [activeTopic, baseRituals]);

  // Scroll handler with settled debounced detection (manual swipe on mobile)
  const handleScroll = () => {
    if (isNavigatingRef.current) return;

    if (scrollDebounceTimerRef.current) {
      clearTimeout(scrollDebounceTimerRef.current);
    }
    scrollDebounceTimerRef.current = window.setTimeout(() => {
      if (!isNavigatingRef.current && !isDraggingRef.current) {
        detectCenterCard();
      }
    }, 150);
  };

  // Arrow buttons: Deterministic infinite navigation with zero-drift copy normalization
  const handleArrowScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el || baseRituals.length === 0) return;

    if (navigateTimeoutRef.current) {
      clearTimeout(navigateTimeoutRef.current);
    }

    isNavigatingRef.current = true;
    el.classList.add('is-navigating');

    const total = baseRituals.length;
    let nextIndex = activeTopicIndexRef.current;
    let nextCopy = activeCopyRef.current;

    if (direction === 'right') {
      nextIndex += 1;
      if (nextIndex >= total) {
        nextIndex = 0;
        nextCopy += 1;
      }
      // Safety bounds check: if reached copy 4, reset seamlessly to copy 2 anchor
      if (nextCopy > 3) {
        const curTopic = baseRituals[activeTopicIndexRef.current].id;
        const anchorCard = el.querySelector<HTMLElement>(
          `[data-topic="${curTopic}"][data-copy="2"]`
        );
        if (anchorCard) {
          el.scrollTo({ left: getCardCenterPos(el, anchorCard), behavior: 'auto' });
        }
        nextCopy = nextIndex === 0 ? 3 : 2;
      }
    } else {
      nextIndex -= 1;
      if (nextIndex < 0) {
        nextIndex = total - 1;
        nextCopy -= 1;
      }
      // Safety bounds check: if reached copy 0, reset seamlessly to copy 2 anchor
      if (nextCopy < 1) {
        const curTopic = baseRituals[activeTopicIndexRef.current].id;
        const anchorCard = el.querySelector<HTMLElement>(
          `[data-topic="${curTopic}"][data-copy="2"]`
        );
        if (anchorCard) {
          el.scrollTo({ left: getCardCenterPos(el, anchorCard), behavior: 'auto' });
        }
        nextCopy = nextIndex === total - 1 ? 1 : 2;
      }
    }

    const targetTopic = baseRituals[nextIndex].id;
    activeTopicIndexRef.current = nextIndex;
    activeCopyRef.current = nextCopy;
    activeTopicRef.current = targetTopic;
    onSelectTopic(targetTopic);

    // Disabling scroll snap via is-navigating must take effect before scrollTo is called
    void el.offsetWidth;

    const targetCard = el.querySelector<HTMLElement>(
      `[data-topic="${targetTopic}"][data-copy="${nextCopy}"]`
    );

    const finishNav = () => {
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current);
        navigateTimeoutRef.current = null;
      }
      el.removeEventListener('scrollend', finishNav);
      el.classList.remove('is-navigating');
      isNavigatingRef.current = false;

      if (activeCopyRef.current !== 2) {
        const copy2Card = el.querySelector<HTMLElement>(
          `[data-topic="${targetTopic}"][data-copy="2"]`
        );
        if (copy2Card) {
          const normalPos = getCardCenterPos(el, copy2Card);
          el.scrollTo({ left: normalPos, behavior: 'auto' });
          activeCopyRef.current = 2;
        }
      }
    };

    requestAnimationFrame(() => {
      if (targetCard) {
        const targetPos = getCardCenterPos(el, targetCard);
        el.scrollTo({ left: targetPos, behavior: 'smooth' });
      }
      el.addEventListener('scrollend', finishNav, { once: true });
      navigateTimeoutRef.current = window.setTimeout(finishNav, 550);
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
        setTimeout(() => {
          detectCenterCard();
        }, 80);
      }
    }
  };

  // Direct Card Click: center cleanly and normalize
  const handleCardClick = (topic: DivinationTopic, e: React.MouseEvent<HTMLButtonElement>) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      return;
    }
    const el = scrollContainerRef.current;
    if (!el) return;

    if (navigateTimeoutRef.current) {
      clearTimeout(navigateTimeoutRef.current);
    }

    isNavigatingRef.current = true;
    el.classList.add('is-navigating');

    const card = e.currentTarget;
    const copy = parseInt(card.dataset.copy || '2', 10);
    const idx = baseRituals.findIndex((r) => r.id === topic);

    activeTopicIndexRef.current = idx !== -1 ? idx : 0;
    activeCopyRef.current = copy;
    activeTopicRef.current = topic;
    onSelectTopic(topic);

    void el.offsetWidth;

    const finishNav = () => {
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current);
        navigateTimeoutRef.current = null;
      }
      el.removeEventListener('scrollend', finishNav);
      el.classList.remove('is-navigating');
      isNavigatingRef.current = false;

      if (activeCopyRef.current !== 2) {
        const copy2Card = el.querySelector<HTMLElement>(
          `[data-topic="${topic}"][data-copy="2"]`
        );
        if (copy2Card) {
          const normalPos = getCardCenterPos(el, copy2Card);
          el.scrollTo({ left: normalPos, behavior: 'auto' });
          activeCopyRef.current = 2;
        }
      }
    };

    requestAnimationFrame(() => {
      const targetPos = getCardCenterPos(el, card);
      el.scrollTo({ left: targetPos, behavior: 'smooth' });
      el.addEventListener('scrollend', finishNav, { once: true });
      navigateTimeoutRef.current = window.setTimeout(finishNav, 550);
    });
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
      if (scrollDebounceTimerRef.current) clearTimeout(scrollDebounceTimerRef.current);
    };
  }, []);

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
              <span className="card-title">{item.title}</span>
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
