import React, { useState, useMemo, useCallback } from 'react';

export const Playhead = React.memo(({ currentTime, tracks, pixelsPerSecond, onDrag, height }) => {
  const left = currentTime * pixelsPerSecond;
  const [isDragging, setIsDragging] = useState(false);

  // Collect snap points from clip boundaries
  const snapPoints = useMemo(() => {
    const points = [];
    tracks.forEach(t => {
      t.clips.forEach(c => {
        points.push(c.startTime);
        points.push(c.startTime + c.duration);
      });
    });
    return points;
  }, [tracks]);

  const SNAP_THRESHOLD = 0.1; // seconds

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = (t % 60).toFixed(1);
    return m > 0 ? `${m}:${String(s).padStart(4, '0')}` : `${s}s`;
  };

  // ── Manual drag — delta-based so props always control final position ──────
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const startX      = e.clientX;
    const startTime   = currentTime; // snapshot time at drag start

    setIsDragging(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent) => {
      const deltaX    = moveEvent.clientX - startX;
      let   newTime   = Math.max(0, startTime + deltaX / pixelsPerSecond);

      // Snap to clip edges
      for (const sp of snapPoints) {
        if (Math.abs(newTime - sp) < SNAP_THRESHOLD) {
          newTime = sp;
          break;
        }
      }

      onDrag(newTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [currentTime, pixelsPerSecond, snapPoints, onDrag]);

  return (
    <div
      className="absolute top-0 z-50 flex flex-col items-center pointer-events-auto"
      style={{ left, transform: 'translateX(-50%)' }}
    >
      {/* Time tooltip — shown only while dragging */}
      {isDragging && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none">
          {formatTime(currentTime)}
        </div>
      )}

      {/* Diamond head — drag handle */}
      <div
        className="w-3 h-3 bg-[#8b3dff] border-[1.5px] border-white rounded-[2px] rotate-45 shadow-md cursor-ew-resize flex-shrink-0"
        onMouseDown={handleMouseDown}
        style={{ marginTop: '-6px' }}
      />

      {/* Vertical line — not draggable, just visual */}
      <div
        className="w-[1.5px] bg-[#8b3dff] opacity-80 pointer-events-none"
        style={{ height }}
      />
    </div>
  );
});

export default Playhead;
