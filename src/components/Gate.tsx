import React, { useState, useEffect, useRef } from 'react';
import { Bridge } from '../bridge';
import type { UserSession } from '../types';
import { ZODIAC_SYSTEMS, type ZodiacSystem, type ZodiacItem } from '../data/zodiacSystems';
import {
  playChant,
  stopChant,
  toggleMuteChant,
  isChantMuted,
  subscribeChantState,
  CHANT_INFO,
} from '../utils/chantAudio';

interface GateProps {
  bridge: Bridge;
  onSessionStart: (session: UserSession) => void;
}

// Spatial coordinates for the 10 astrology systems distributed across the celestial canvas
const SYSTEM_LOCATIONS: Record<
  string,
  { x: number; y: number; halo: string; label: string; sub: string }
> = {
  western: { x: 20, y: 22, halo: '#7986cb', label: 'ยุโรป / สากล', sub: '12 จักรราศี' },
  native_american: { x: 50, y: 15, halo: '#ff7043', label: 'อินเดียแดง', sub: 'โทเท็มสัตว์วิญญาณ' },
  vedic: { x: 80, y: 22, halo: '#ff9900', label: 'อินเดีย', sub: 'โหราศาสตร์พระเวท' },
  thai: { x: 16, y: 56, halo: '#f5c542', label: 'ไทย', sub: '12 นักษัตรสยาม' },
  chinese: { x: 50, y: 48, halo: '#ff3b30', label: 'จีน', sub: '12 นักษัตรมังกรฟ้า' },
  islamic: { x: 84, y: 56, halo: '#00e676', label: 'อิสลาม / อาหรับ', sub: '12 บุรุจดวงดาว' },
  vietnamese: { x: 34, y: 70, halo: '#ffca28', label: 'เวียดนาม', sub: '12 สัตว์ศักดิ์สิทธิ์' },
  burmese: { x: 66, y: 70, halo: '#ba68c8', label: 'พม่า', sub: 'มหาภูติ 8 สัตว์' },
  egyptian: { x: 22, y: 88, halo: '#ffd700', label: 'อียิปต์โบราณ', sub: 'ทวยเทพแห่งไนล์' },
  aztec_mayan: { x: 78, y: 88, halo: '#26c6da', label: 'แอซเท็ก / มายา', sub: 'ปฏิทินสุริยะ' },
};

// Current Buddhist Era year for backend calculation
const CURRENT_BE_YEAR = new Date().getFullYear() + 543;

export const Gate: React.FC<GateProps> = ({ bridge, onSessionStart }) => {
  // Hierarchical Level: null initially, showing all 10 distributed systems
  // When user taps/hovers a system, it expands into a circular radial menu
  const [expandedSystemId, setExpandedSystemId] = useState<string | null>(null);
  const [hoveredSystemId, setHoveredSystemId] = useState<string | null>(null);

  // Currently focused symbol index in the circular menu
  const [activeSymbolIndex, setActiveSymbolIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Audio / Chant state
  const [playingChantId, setPlayingChantId] = useState<string | null>(null);
  const [muted, setMuted] = useState<boolean>(isChantMuted());

  // Drag-to-dismiss gesture state
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragProgress, setDragProgress] = useState<number>(0); // 0 to 1
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Window width check for responsive circular wheel radius
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen to audio chant playback state
  useEffect(() => {
    const unsub = subscribeChantState((id) => {
      setPlayingChantId(id);
    });
    return () => {
      unsub();
      stopChant();
    };
  }, []);

  const activeSystem: ZodiacSystem | null = expandedSystemId
    ? ZODIAC_SYSTEMS.find((s) => s.id === expandedSystemId) || null
    : null;

  const currentChant = activeSystem ? CHANT_INFO[activeSystem.id] : null;

  // Reset active symbol index when expanding a new system and play chant SFX
  const handleOpenSystem = (sysId: string) => {
    setExpandedSystemId(sysId);
    setActiveSymbolIndex(0);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setDragProgress(0);

    // Play Civilization Chant SFX
    playChant(sysId);
  };

  const handleCloseRadialMenu = () => {
    setExpandedSystemId(null);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setDragProgress(0);
    stopChant();
  };

  // Complete session initialization with a chosen symbol
  const completeSession = (chosenItem: ZodiacItem, system: ZodiacSystem) => {
    setError(null);
    const wasmZodiacId = chosenItem.id % 12;

    const z = bridge.initSession(chosenItem.name, CURRENT_BE_YEAR, wasmZodiacId);
    if (z < 0) {
      setError(
        z === -2
          ? 'ปีเกิดไม่ถูกต้อง (ใส่ระหว่าง พ.ศ. 2443–2700 หรือ ค.ศ. 1900–2157)'
          : 'ข้อมูลไม่ถูกต้อง ลองตรวจสอบอีกครั้ง'
      );
      return;
    }

    stopChant();
    const info = bridge.zodiacInfo(z);
    const session: UserSession = {
      systemId: system.id,
      systemName: system.name,
      symbolName: chosenItem.name,
      symbolIcon: chosenItem.symbol,
      element: chosenItem.element,
      aura: chosenItem.aura,
      attribute: chosenItem.attribute,
      year: CURRENT_BE_YEAR,
      zodiac: z,
      info,
    };

    try {
      sessionStorage.setItem('shrine.session', JSON.stringify(session));
    } catch {
      // Ignore private mode storage failure
    }

    bridge.seed();
    window.scrollTo({ top: 0, behavior: 'instant' });
    onSessionStart(session);
  };

  // Drag-to-dismiss gesture event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only capture primary pointer on non-interactive backdrop/center areas
    if ((e.target as HTMLElement).closest('.radial-symbol-satellite') ||
        (e.target as HTMLElement).closest('button')) {
      return;
    }
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore unsupported pointer capture
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 6) {
      setIsDragging(true);
      // Dampen movement slightly for celestial float feel
      setDragOffset({ x: dx * 0.75, y: dy * 0.75 });
      // Progress towards dismiss threshold (50px)
      const progress = Math.min(1, dist / 50);
      setDragProgress(progress);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const dist = Math.hypot(dx, dy);
    const elapsed = Date.now() - dragStartRef.current.time;
    const velocity = dist / Math.max(1, elapsed);

    // Inward swipe detection: check if moving inward toward center
    let isInwardSwipe = false;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      const centerX = canvasRect.left + canvasRect.width / 2;
      const centerY = canvasRect.top + canvasRect.height / 2;
      const startDist = Math.hypot(dragStartRef.current.x - centerX, dragStartRef.current.y - centerY);
      const endDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      if (startDist - endDist > 25) {
        isInwardSwipe = true;
      }
    }

    // If dragged beyond threshold, swiped inward, or quick flick, dismiss back to star map
    if (dist > 30 || velocity > 0.28 || isInwardSwipe) {
      handleCloseRadialMenu();
    } else if (dist <= 6 && (e.target as HTMLElement).classList.contains('radial-circular-overlay')) {
      // Tap on empty space outside center card
      handleCloseRadialMenu();
    } else {
      // Snap back smoothly
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
      setDragProgress(0);
    }

    dragStartRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    dragStartRef.current = null;
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setDragProgress(0);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = toggleMuteChant();
    setMuted(nextMuted);
    if (!nextMuted && activeSystem) {
      playChant(activeSystem.id);
    }
  };

  const replayChant = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeSystem) {
      playChant(activeSystem.id);
    }
  };

  const activeSymbol: ZodiacItem | null = activeSystem
    ? activeSystem.items[activeSymbolIndex] || activeSystem.items[0]
    : null;

  // Parent node location for subtle trajectory connection
  const parentLoc = activeSystem ? SYSTEM_LOCATIONS[activeSystem.id] : null;

  return (
    <section id="gate" className="panel gate cosmic-celestial-gate">
      {/* Top Title Banner */}
      <div className="celestial-gate-header text-center">
        <div className="celestial-pill-badge">
          <span>✦ มณฑลโหราศาสตร์สากลและวงล้อดวงดาว ✦</span>
        </div>
        <h2 className="title celestial-main-title">เลือกอารยธรรมและสัญลักษณ์แห่งโชคชะตา</h2>
        <p className="lead celestial-lead">
          แตะดวงดาวอารยธรรมเพื่อคลี่ขยาย <strong>วงล้อดวงดาวทรงกลม (Circular Zodiac Menu)</strong> พร้อมสดับรับฟัง <strong>เสียงสวดมนตราศักดิ์สิทธิ์ประจำอารยธรรม (Chant SFX)</strong> แล้วเลือกสัญลักษณ์เพื่อเริ่มพิธี
        </p>

        {/* Global Sound & Gesture Hint Controls */}
        <div className="gate-audio-toolbar">
          <button
            type="button"
            className={`audio-toggle-btn ${muted ? 'is-muted' : 'is-playing'}`}
            onClick={toggleMute}
            title={muted ? 'เปิดเสียงบทสวด' : 'ปิดเสียงบทสวด'}
            aria-label={muted ? 'เปิดเสียงบทสวด' : 'ปิดเสียงบทสวด'}
          >
            <span className="audio-icon">{muted ? '🔇' : '🔊'}</span>
            <span className="audio-text">
              {muted ? 'เสียงบทสวด: ปิดอยู่' : 'เสียงบทสวด: เปิดอยู่'}
            </span>
          </button>
          {playingChantId && currentChant && (
            <div className="now-chanting-pill animate-pulse-glow">
              <span className="wave-bars">
                <span className="wb wb-1" />
                <span className="wb wb-2" />
                <span className="wb wb-3" />
              </span>
              <span className="now-title">{currentChant.chantTitle}</span>
              <button
                type="button"
                className="btn-replay-chant"
                onClick={replayChant}
                title="ฟังบทสวดซ้ำ"
              >
                🔄 ฟังซ้ำ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Celestial Orrery Stage */}
      <div className="celestial-stage-wrapper">
        <div
          ref={canvasRef}
          className={`celestial-stage-canvas ${expandedSystemId ? 'has-expanded-system' : ''}`}
        >
          {/* Sacred Celestial Background Orbits */}
          <div className="celestial-orbits" aria-hidden="true">
            <div className="c-orbit c-orbit-outer" />
            <div className="c-orbit c-orbit-mid" />
            <div className="c-orbit c-orbit-inner" />
            <div className="c-axis c-axis-h" />
            <div className="c-axis c-axis-v" />
            <div className="c-core-radiance" />
          </div>

          {/* 10 Astrology System Nodes Distributed on Canvas */}
          {ZODIAC_SYSTEMS.map((sys) => {
            const loc = SYSTEM_LOCATIONS[sys.id] || { x: 50, y: 50, halo: '#e8b94a', label: sys.name, sub: sys.region };
            const isExpanded = expandedSystemId === sys.id;
            const isHovered = hoveredSystemId === sys.id;

            return (
              <div
                key={sys.id}
                data-sys-id={sys.id}
                className={`system-node ${isExpanded ? 'is-expanded' : ''} ${isHovered ? 'is-hovered' : ''}`}
                style={
                  {
                    left: `${loc.x}%`,
                    top: `${loc.y}%`,
                    '--node-halo': loc.halo,
                  } as React.CSSProperties
                }
                onClick={() => handleOpenSystem(sys.id)}
                onMouseEnter={() => setHoveredSystemId(sys.id)}
                onMouseLeave={() => setHoveredSystemId(null)}
                role="button"
                tabIndex={0}
                aria-label={`อารยธรรม ${sys.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenSystem(sys.id);
                  }
                }}
              >
                {/* Node Sphere */}
                <div className="system-orb">
                  <div className="orb-halo-pulse" />
                  <span className="orb-icon">{sys.icon}</span>
                  {isExpanded && <span className="orb-active-marker">✦</span>}
                </div>

                {/* Node Tag */}
                <div className="system-tag">
                  <span className="tag-name">{loc.label}</span>
                  <span className="tag-sub">{loc.sub}</span>
                </div>
              </div>
            );
          })}

          {/* UNSELECTED INVITATION CORE (when no system is expanded yet) */}
          {!expandedSystemId && (
            <div className="celestial-unselected-core animate-pulse-glow">
              <div className="core-portal-orb">
                <span className="core-portal-icon">🌌</span>
                <div className="core-portal-ring" />
              </div>
              <h3 className="core-portal-title">เลือกอารยธรรมบนผืนฟ้า</h3>
              <p className="core-portal-hint">
                แตะที่อารยธรรมใดก็ได้ (ไทย, จีน, อินเดีย, ยุโรป ฯลฯ) เพื่อคลี่ขยาย <strong>วงล้อดวงดาว 12 สัญลักษณ์</strong> พร้อมฟังบทสวด
              </p>
            </div>
          )}

          {/* EXPANDED IN-CANVAS CIRCULAR RADIAL MENU WITH DRAG-TO-DISMISS GESTURE */}
          {activeSystem && (
            <div
              className={`radial-circular-overlay ${isDragging ? 'is-dragging' : ''}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              style={{
                touchAction: 'none',
              }}
            >
              {/* Ghost connection line pointing back to parent category node */}
              {parentLoc && (
                <svg
                  className="drag-guide-svg"
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 25,
                  }}
                >
                  <line
                    x1="50%"
                    y1="50%"
                    x2={`${parentLoc.x}%`}
                    y2={`${parentLoc.y}%`}
                    stroke="rgba(245, 197, 66, 0.35)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                </svg>
              )}

              {/* Dynamic Drag Container responding to touch/mouse gestures */}
              <div
                className="radial-drag-wrapper"
                style={{
                  transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${Math.max(0.68, 1 - dragProgress * 0.28)})`,
                  opacity: Math.max(0.4, 1 - dragProgress * 0.5),
                  transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease',
                }}
              >
                {/* Drag to Dismiss Gesture Hint Pill */}
                <div className="drag-dismiss-hint-pill">
                  <span className="drag-arrow">⬇</span>
                  <span>ปัดเข้าด้านในหรือลากเพื่อย่นเก็บ (Swipe / Drag to dismiss)</span>
                  <button
                    type="button"
                    className="drag-dismiss-close-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseRadialMenu();
                    }}
                    title="ปิดวงล้อ"
                  >
                    ✕
                  </button>
                </div>

                {/* Celestial Center Core Sigil (Not a boxy popup modal) */}
                <div
                  className="radial-menu-center-card celestial-center-sigil"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="radial-center-badge">
                    <span className="center-icon">{activeSystem.icon}</span>
                    <h3 className="center-name">{activeSystem.name}</h3>
                  </div>

                  <p className="center-mythos">{activeSystem.mythos}</p>

                  {/* Sacred Chant & Audio Info */}
                  {currentChant && (
                    <div className="center-chant-box">
                      <div className="chant-name-row">
                        <span className="chant-sacred-icon">🪔</span>
                        <span className="chant-name-text">{currentChant.chantTitle}</span>
                      </div>
                      <p className="chant-mantra-text">"{currentChant.mantraPreview}"</p>
                      <button
                        type="button"
                        className="btn-chant-play-mini"
                        onClick={replayChant}
                        title="ฟังเสียงบทสวดนี้"
                      >
                        🎵 เล่นเสียงบทสวด
                      </button>
                    </div>
                  )}

                  {/* Drag Gesture Affordance Indicator */}
                  <div className="sigil-drag-handle" title="ลากหรือปัดเพื่อปิด">
                    <span className="handle-bar" />
                  </div>
                </div>

                {/* The Circular Radial Wheel of Symbols */}
                <div
                  className="radial-symbols-wheel"
                  onClick={(e) => e.stopPropagation()}
                >
                  {activeSystem.items.map((item, idx) => {
                    const total = activeSystem.items.length;
                    // Calculate angle around 360 degrees, starting from top (-90 deg)
                    const angleDeg = (360 / total) * idx - 90;
                    const angleRad = (angleDeg * Math.PI) / 180;
                    // Responsive radius: 142px for mobile, 185px for desktop
                    const radius = isMobile ? 142 : 185;
                    const posX = Math.round(Math.cos(angleRad) * radius);
                    const posY = Math.round(Math.sin(angleRad) * radius);
                    const isSelected = activeSymbolIndex === idx;

                    return (
                      <div
                        key={idx}
                        className={`radial-symbol-satellite ${isSelected ? 'satellite-selected' : ''}`}
                        style={
                          {
                            transform: `translate(${posX}px, ${posY}px)`,
                            '--sat-angle': `${angleDeg}deg`,
                          } as React.CSSProperties
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSymbolIndex(idx);
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          completeSession(item, activeSystem);
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`${item.name} (${item.origName || ''})`}
                      >
                        <div className="satellite-token">
                          <div className="token-aura" />
                          <span className="token-icon">{item.symbol}</span>
                          {isSelected && <span className="satellite-star-badge">✦</span>}
                        </div>
                        <div className="satellite-tag">
                          <span className="sat-name">{item.name}</span>
                          {item.origName && <span className="sat-orig">{item.origName}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Symbol Detail Altar & Quick Confirm */}
      {activeSystem && activeSymbol && (
        <div className="altar-preview-strip animate-rise">
          <div className="altar-strip-main">
            <div className="altar-strip-icon-box">
              <span className="big-symbol">{activeSymbol.symbol}</span>
              <div className="symbol-pulse-ring" />
            </div>

            <div className="altar-strip-info">
              <div className="strip-title-row">
                <h3 className="strip-title">{activeSymbol.name}</h3>
                {activeSymbol.origName && (
                  <span className="strip-orig">{activeSymbol.origName}</span>
                )}
                <span className="strip-system-tag">
                  ({activeSystem.name})
                </span>
              </div>

              <div className="strip-pills">
                <span className="pill-badge elem-badge">⚡ {activeSymbol.element}</span>
                <span className="pill-badge aura-badge">✨ ออร่า: {activeSymbol.aura}</span>
                {currentChant && (
                  <span className="pill-badge chant-badge">
                    🪔 {currentChant.civilization}
                  </span>
                )}
              </div>

              <p className="strip-attribute">
                <strong>พลังและพรศักดิ์สิทธิ์:</strong> {activeSymbol.attribute}
              </p>
            </div>
          </div>

          <div className="altar-strip-action">
            <button
              type="button"
              className="btn primary strip-confirm-btn"
              onClick={() => completeSession(activeSymbol, activeSystem)}
            >
              <span>อัญเชิญพลังเข้าสู่พิธี</span>
              <span className="arrow-icon">➔</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <p id="gate-error" className="error text-center" role="alert">
          {error}
        </p>
      )}
    </section>
  );
};
