import React, { useState, useEffect, useRef } from 'react';
import { Bridge } from '../bridge';
import type { UserSession } from '../types';
import {
  ZODIAC_SYSTEMS,
  GATE_SYSTEM_NODES,
  getLocalizedZodiacSystem,
  getLocalizedZodiacItem,
  type ZodiacSystem,
  type ZodiacItem,
} from '../data/zodiacSystems';
import {
  playChant,
  stopChant,
} from '../utils/chantAudio';
import { safeStorage } from '../utils/storage';
import { useLanguage } from '../context/LanguageContext';
interface GateProps {
  bridge: Bridge;
  onSessionStart: (session: UserSession) => void;
}

// Spatial coordinates for the 10 astrology systems distributed in a celestial ring around the canvas
const SYSTEM_LOCATIONS: Record<
  string,
  { x: number; y: number; halo: string }
> = {
  western: { x: 22, y: 20, halo: '#7986cb' },
  native_american: { x: 50, y: 12, halo: '#ff7043' },
  vedic: { x: 78, y: 20, halo: '#ff9900' },
  islamic: { x: 86, y: 40, halo: '#00e676' },
  burmese: { x: 85, y: 64, halo: '#ba68c8' },
  aztec_mayan: { x: 75, y: 86, halo: '#26c6da' },
  vietnamese: { x: 50, y: 88, halo: '#ffca28' },
  egyptian: { x: 25, y: 86, halo: '#ffd700' },
  thai: { x: 15, y: 64, halo: '#f5c542' },
  chinese: { x: 14, y: 40, halo: '#ff3b30' },
};

export const Gate: React.FC<GateProps> = ({ bridge, onSessionStart }) => {
  const { lang, t } = useLanguage();
  // Hierarchical Level: null initially, showing all 10 distributed systems
  // When user taps/hovers a system, it expands into a circular radial menu
  const [expandedSystemId, setExpandedSystemId] = useState<string | null>(null);
  const [hoveredSystemId, setHoveredSystemId] = useState<string | null>(null);

  // Currently focused symbol index in the circular menu
  const [activeSymbolIndex, setActiveSymbolIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

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

  // Stop chant playback on unmount
  useEffect(() => {
    return () => {
      stopChant();
    };
  }, []);

  const activeSystem: ZodiacSystem | null = expandedSystemId
    ? ZODIAC_SYSTEMS.find((s) => s.id === expandedSystemId) || null
    : null;

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
    const currentBeYear = new Date().getFullYear() + 543;
    const wasmZodiacId = chosenItem.id % 12;

    const z = bridge.initSession(chosenItem.name, currentBeYear, wasmZodiacId);
    if (z < 0) {
      setError(t.commonErrorRetry);
      return;
    }

    stopChant();
    const info = bridge.zodiacInfo(z);
    const sysLoc = getLocalizedZodiacSystem(system, lang);
    const itemLoc = getLocalizedZodiacItem(chosenItem, system.id, lang);
    const session: UserSession = {
      systemId: system.id,
      systemName: sysLoc.name,
      symbolName: itemLoc.name,
      symbolIcon: chosenItem.symbol,
      element: itemLoc.element,
      aura: chosenItem.aura,
      attribute: chosenItem.attribute,
      year: currentBeYear,
      zodiac: z,
      info,
    };

    safeStorage.set('session', 'shrine.session', session);

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
    } else if (dist <= 10 && !(e.target as HTMLElement).closest('.radial-menu-center-card, .radial-symbol-satellite, .btn-back-to-all-systems')) {
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

  const activeSymbol: ZodiacItem | null = activeSystem
    ? activeSystem.items[activeSymbolIndex] || activeSystem.items[0]
    : null;

  return (
    <section id="gate" className="panel gate cosmic-celestial-gate" aria-label={t.gateChooseSystem}>
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

            {/* Cosmic Celestial Bodies (Earth, Mars, Saturn, Galaxy & Famous Stars) */}
            <div className="c-galaxy-dust" />

            <div className="celestial-body c-body-earth" title={t.gateBodyEarth}>
              <div className="planet-atmosphere" />
              <span className="planet-icon">🌍</span>
              <span className="body-label">{t.gateBodyEarth}</span>
            </div>

            <div className="celestial-body c-body-mars" title={t.gateBodyMars}>
              <div className="planet-glow" />
              <span className="planet-icon">🔴</span>
              <span className="body-label">{t.gateBodyMars}</span>
            </div>

            <div className="celestial-body c-body-saturn" title={t.gateBodySaturn}>
              <div className="saturn-ring" />
              <span className="planet-icon">🪐</span>
              <span className="body-label">{t.gateBodySaturn}</span>
            </div>

            <div className="celestial-star c-star-polaris" title={t.gateStarPolaris}>
              <span className="star-spike" />
              <span className="star-sparkle">✦</span>
              <span className="body-label">{t.gateStarPolaris}</span>
            </div>

            <div className="celestial-star c-star-sirius" title={t.gateStarSirius}>
              <span className="star-spike" />
              <span className="star-sparkle">✨</span>
              <span className="body-label">{t.gateStarSirius}</span>
            </div>

            <div className="celestial-star c-star-betelgeuse" title={t.gateStarBetelgeuse}>
              <span className="star-glow" />
              <span className="star-sparkle">⭐</span>
              <span className="body-label">{t.gateStarBetelgeuse}</span>
            </div>

            <div className="celestial-cluster c-cluster-pleiades" title={t.gateClusterPleiades}>
              <span className="cluster-stars">✧✦✧</span>
              <span className="body-label">{t.gateClusterPleiades}</span>
            </div>
          </div>

          {/* 10 Astrology System Nodes Distributed on Canvas */}
          {ZODIAC_SYSTEMS.map((sys) => {
            const coords = SYSTEM_LOCATIONS[sys.id] || { x: 50, y: 50, halo: '#e8b94a' };
            const sysLoc = getLocalizedZodiacSystem(sys, lang);
            const nodeText = GATE_SYSTEM_NODES[sys.id];
            const nodeLabel = nodeText ? nodeText.label[lang] : sysLoc.name;
            const nodeSub = nodeText ? nodeText.sub[lang] : sysLoc.region;
            const isExpanded = expandedSystemId === sys.id;
            const isHovered = hoveredSystemId === sys.id;

            return (
              <div
                key={sys.id}
                data-sys-id={sys.id}
                className={`system-node ${isExpanded ? 'is-expanded' : ''} ${isHovered ? 'is-hovered' : ''}`}
                style={
                  {
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    '--node-halo': coords.halo,
                  } as React.CSSProperties
                }
                onClick={() => handleOpenSystem(sys.id)}
                onMouseEnter={() => setHoveredSystemId(sys.id)}
                onMouseLeave={() => setHoveredSystemId(null)}
                role="button"
                tabIndex={0}
                aria-label={`${t.topicCivilization} ${sysLoc.name}`}
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
                  <span className="tag-name">{nodeLabel}</span>
                  <span className="tag-sub">{nodeSub}</span>
                </div>
              </div>
            );
          })}

          {/* UNSELECTED INVITATION CORE (when no system is expanded yet) */}
          {!expandedSystemId && (
            <div className="celestial-unselected-core animate-pulse-glow" title={t.gateChooseSystemSub}>
              <div className="core-portal-orb">
                <span className="core-portal-icon">🌌</span>
                <div className="core-portal-ring" />
              </div>
              <h3 className="core-portal-title">{t.topicCivilization}</h3>
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
              onClick={(e) => {
                if (!(e.target as HTMLElement).closest('.radial-menu-center-card, .radial-symbol-satellite, .btn-back-to-all-systems')) {
                  handleCloseRadialMenu();
                }
              }}
              style={{
                touchAction: 'none',
              }}
            >

              {/* Dynamic Drag Container responding to touch/mouse gestures */}
              <div
                className="radial-drag-wrapper"
                style={{
                  transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${Math.max(0.68, 1 - dragProgress * 0.28)})`,
                  opacity: Math.max(0.4, 1 - dragProgress * 0.5),
                  transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease',
                }}
              >
                {/* Celestial Center Core Sigil & Selected Symbol Altar */}
                <div
                  className="radial-menu-center-card celestial-center-sigil active-altar-card"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Top Bar with System Name & Close Button */}
                  <div className="radial-center-header">
                    <span className="center-sys-badge">
                      <span className="center-icon">{activeSystem.icon}</span>
                      <span className="center-sys-name">
                        {getLocalizedZodiacSystem(activeSystem, lang).name}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="center-close-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseRadialMenu();
                      }}
                      title={t.gateChooseSystem}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Focused Zodiac Symbol: Name in Civilization Language */}
                  {activeSymbol && (() => {
                    const activeItemLoc = getLocalizedZodiacItem(activeSymbol, activeSystem.id, lang);
                    return (
                      <button
                        type="button"
                        className="center-symbol-focus animate-rise"
                        title={t.gateSelectSymbol}
                        onClick={() => completeSession(activeSymbol, activeSystem)}
                      >
                        <div className="center-symbol-orb">
                          <span className="center-symbol-icon">{activeSymbol.symbol}</span>
                          <div className="center-symbol-glow" />
                        </div>

                        <h3 className="center-symbol-title">
                          {activeItemLoc.primaryLabel}
                          {activeItemLoc.secondaryLabel && (
                            <span className="center-symbol-sub"> ({activeItemLoc.secondaryLabel})</span>
                          )}
                        </h3>
                      </button>
                    );
                  })()}

                  {/* Action Button: Short & Powerful */}
                  {activeSymbol && (
                    <div className="center-action-row">
                      <button
                        type="button"
                        className="btn primary center-confirm-btn"
                        onClick={() => completeSession(activeSymbol, activeSystem)}
                      >
                        <span>{t.gateEnterShrine}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* The Circular Radial Wheel of Symbols */}
                <div
                  className="radial-symbols-wheel"
                  aria-label={t.gateSelectSymbol}
                  onClick={(e) => e.stopPropagation()}
                >
                  {activeSystem.items.map((item, idx) => {
                    const total = activeSystem.items.length;
                    // Calculate angle around 360 degrees, starting from top (-90 deg)
                    const angleDeg = (360 / total) * idx - 90;
                    const angleRad = (angleDeg * Math.PI) / 180;
                    // Vertical ellipse arrangement (วงรีแนวตั้ง):
                    // Narrower horizontal radius (radiusX) prevents overflowing off mobile screen
                    // Taller vertical radius (radiusY) forms an elegant vertical oval
                    const radiusX = isMobile ? 106 : 160;
                    const radiusY = isMobile ? 162 : 230;
                    const posX = Math.round(Math.cos(angleRad) * radiusX);
                    const posY = Math.round(Math.sin(angleRad) * radiusY);
                    const isSelected = activeSymbolIndex === idx;
                    const itemLoc = getLocalizedZodiacItem(item, activeSystem.id, lang);

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
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isSelected) {
                              completeSession(item, activeSystem);
                            } else {
                              setActiveSymbolIndex(idx);
                            }
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`${itemLoc.name}${item.origName ? ` (${item.origName})` : ''}`}
                      >
                        <div className="satellite-token">
                          <div className="token-aura" />
                          <span className="token-icon">{item.symbol}</span>
                          {isSelected && <span className="satellite-star-badge">✦</span>}
                        </div>
                        <div className="satellite-tag">
                          <span className="sat-name">{itemLoc.primaryLabel}</span>
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

      {error && (
        <p id="gate-error" className="error text-center" role="alert">
          {error}
        </p>
      )}
    </section>
  );
};
