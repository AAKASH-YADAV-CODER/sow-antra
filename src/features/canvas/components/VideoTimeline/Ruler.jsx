import React, { useState, useCallback, useRef, useMemo } from 'react';

export const Ruler = React.memo(({ duration, pixelsPerSecond, scrollLeft, containerWidth, onTimeChange }) => {
  const width = Math.max(duration * pixelsPerSecond, containerWidth + scrollLeft) + 400; // Extend beyond content
  const [hoverX, setHoverX] = useState(null);
  const isDraggingRef = useRef(false);
  const rulerRef = useRef(null);

  // ── Marker generation (virtualized) ──────────────────────────────────────
  const buffer = 100;
  const startSecond = Math.floor(Math.max(0, scrollLeft - buffer) / pixelsPerSecond);
  const endSecond   = Math.ceil((scrollLeft + containerWidth + buffer) / pixelsPerSecond);

  const markers = useMemo(() => {
    const items = [];
    for (let i = startSecond; i <= endSecond; i++) {
      const isPastDuration = i > duration;
      const isMajor = i % 5 === 0;
      items.push(
        <div
          key={i}
          className="absolute flex flex-col items-center pointer-events-none"
          style={{ left: i * pixelsPerSecond }}
        >
          <div className={`w-[1px] ${isMajor ? 'h-2.5' : 'h-1.5'} ${isPastDuration ? 'bg-gray-200' : (isMajor ? 'bg-gray-400' : 'bg-gray-300')}`} />
          {isMajor && (
            <span className={`text-[9px] font-medium absolute top-3 -translate-x-1/2 ${isPastDuration ? 'text-gray-300' : 'text-gray-400'}`}>
              {i}s
            </span>
          )}
        </div>
      );
      if (i < 500) { // Keep tick generation reasonable
        for (let j = 1; j < 5; j++) {
          const tickPos = i + j * 0.2;
          const isTickPast = tickPos > duration;
          items.push(
            <div
              key={`${i}-${j}`}
              className={`absolute w-[1px] h-1 pointer-events-none ${isTickPast ? 'bg-gray-100' : 'bg-gray-200'}`}
              style={{ left: tickPos * pixelsPerSecond }}
            />
          );
        }
      }
    }
    return items;
  }, [startSecond, endSecond, pixelsPerSecond, duration]);

  // ── Seek helper ──────────────────────────────────────────────────────────
  const seekFromClientX = useCallback((clientX) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const time = Math.max(0, Math.min(duration, x / pixelsPerSecond));
    onTimeChange?.(time);
  }, [duration, pixelsPerSecond, onTimeChange]);

  // ── Mouse events for click + drag scrub ──────────────────────────────────
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    isDraggingRef.current = true;
    seekFromClientX(e.clientX);

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      seekFromClientX(moveEvent.clientX);
      // Update hover position during drag
      if (rulerRef.current) {
        const rect = rulerRef.current.getBoundingClientRect();
        setHoverX(moveEvent.clientX - rect.left);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [seekFromClientX]);

  const handleMouseMove = useCallback((e) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    setHoverX(e.clientX - rect.left);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!isDraggingRef.current) setHoverX(null);
  }, []);

  // ── Hover time tooltip ────────────────────────────────────────────────────
  const hoverTime = hoverX != null ? Math.max(0, Math.min(duration, hoverX / pixelsPerSecond)) : null;

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = (t % 60).toFixed(1);
    return m > 0 ? `${m}:${String(s).padStart(4, '0')}` : `${s}s`;
  };

  return (
    <div
      ref={rulerRef}
      className="relative h-10 border-b border-gray-200 overflow-hidden cursor-col-resize select-none bg-gray-50/50"
      style={{ width }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tick marks */}
      {markers}

      {/* Hover / drag preview line */}
      {hoverX != null && (
        <>
          <div
            className="absolute top-0 bottom-0 w-[1px] bg-[#8b3dff]/50 pointer-events-none"
            style={{ left: hoverX }}
          />
          <div
            className="absolute top-1 pointer-events-none z-10"
            style={{ left: hoverX, transform: 'translateX(-50%)' }}
          >
            <div className="bg-gray-900 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap">
              {formatTime(hoverTime)}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default Ruler;
