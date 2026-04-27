import React, { useRef, useEffect, useState } from 'react';

const RULER_SIZE = 20;

export const CanvasRulers = ({ zoomLevel, canvasOffset, canvasSize, scrollerRef, showRulers, onAddGuide }) => {
  const topRulerRef = useRef(null);
  const leftRulerRef = useRef(null);
  
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const scroller = scrollerRef?.current;
    if (!scroller) return;

    const handleScroll = () => {
      setScrollPos({ x: scroller.scrollLeft, y: scroller.scrollTop });
    };

    scroller.addEventListener('scroll', handleScroll);
    return () => scroller.removeEventListener('scroll', handleScroll);
  }, [scrollerRef]);

  // Draw rulers
  useEffect(() => {
    if (!showRulers) return;

    const drawRuler = (canvas, isVertical) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      
      const width = canvas.parentElement.clientWidth;
      const height = canvas.parentElement.clientHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      ctx.scale(dpr, dpr);
      
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = '#8e9095';
      ctx.strokeStyle = '#8e9095';
      ctx.font = '9px Arial';
      ctx.lineWidth = 1;
      
      const pxPerStep = 100 * zoomLevel;
      const steps = isVertical ? (height / pxPerStep) * 2 : (width / pxPerStep) * 2;
      
      // Calculate offset based on scroll, pan, and centering math
      // offsetX handles horizontal centering and panning
      const offsetX = isVertical ? 0 : (width / 2) - ((canvasSize.width * zoomLevel) / 2) + (canvasOffset.x * zoomLevel) - scrollPos.x;
      // offsetY accounts for scroller pt-24 (96px), ruler top[20px], and scaled canvas padding (20)
      const offsetY = isVertical ? 76 + ((20 + canvasOffset.y) * zoomLevel) - scrollPos.y : 0; 

      ctx.beginPath();
      
      const startX = isVertical ? 0 : -Math.floor(offsetX / pxPerStep) - 5;
      const endX = startX + steps + 10;

      for (let i = startX; i <= endX; i++) {
        const val = i * 100;
        const pos = isVertical 
          ? offsetY + (i * pxPerStep)
          : offsetX + (i * pxPerStep);
          
        if (pos < 0 || (isVertical && pos > height) || (!isVertical && pos > width)) continue;

        if (isVertical) {
          ctx.moveTo(RULER_SIZE - 6, pos);
          ctx.lineTo(RULER_SIZE, pos);
          
          // Subticks
          ctx.moveTo(RULER_SIZE - 3, pos + (pxPerStep / 2));
          ctx.lineTo(RULER_SIZE, pos + (pxPerStep / 2));

          ctx.save();
          ctx.translate(RULER_SIZE - 10, pos);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(val.toString(), -10, 0);
          ctx.restore();
        } else {
          ctx.moveTo(pos, RULER_SIZE - 6);
          ctx.lineTo(pos, RULER_SIZE);
          
          // Subticks
          ctx.moveTo(pos + (pxPerStep / 2), RULER_SIZE - 3);
          ctx.lineTo(pos + (pxPerStep / 2), RULER_SIZE);

          ctx.fillText(val.toString(), pos + 2, 8);
        }
      }
      ctx.stroke();
    };

    drawRuler(topRulerRef.current, false);
    drawRuler(leftRulerRef.current, true);
  }, [zoomLevel, canvasOffset, canvasSize, scrollPos, showRulers]);

  if (!showRulers) return null;

  return (
    <>
      {/* Corner block */}
      <div 
        className="absolute top-0 left-0 bg-[#f8f9fa] border-r border-b border-gray-200 z-[100]"
        style={{ width: RULER_SIZE, height: RULER_SIZE }}
      />
      
      {/* Top Ruler */}
      <div 
        className="absolute top-0 left-[20px] right-0 bg-[#f8f9fa] border-b border-gray-200 z-[99] overflow-hidden cursor-s-resize"
        style={{ height: RULER_SIZE }}
        onMouseDown={(e) => {
          // Dragging from top ruler creates a horizontal guide (y-axis)
          onAddGuide({ axis: 'y', position: -20 / zoomLevel });
        }}
      >
        <canvas ref={topRulerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Left Ruler */}
      <div 
        className="absolute top-[20px] left-0 bottom-0 bg-[#f8f9fa] border-r border-gray-200 z-[99] overflow-hidden cursor-e-resize"
        style={{ width: RULER_SIZE }}
        onMouseDown={(e) => {
          // Dragging from left ruler creates a vertical guide (x-axis)
          onAddGuide({ axis: 'x', position: -20 / zoomLevel });
        }}
      >
        <canvas ref={leftRulerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </>
  );
};

export default CanvasRulers;
