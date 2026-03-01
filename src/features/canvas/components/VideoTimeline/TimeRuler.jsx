import React, { useRef, useEffect } from 'react';

const TimeRuler = ({
    duration,
    zoomLevel,
    currentTime,
    onSeek
}) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    const pixelsPerSec = 100 * zoomLevel;
    const totalWidth = duration * pixelsPerSec;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = totalWidth + 500; // Extra buffer
        const height = 24;

        // Resize canvas for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        // clear
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#2a2b2e';
        ctx.fillRect(0, height - 1, width, 1); // Bottom border

        ctx.fillStyle = '#6b7280'; // Text color
        ctx.strokeStyle = '#374151'; // Tick color
        ctx.font = '10px Inter';
        ctx.textAlign = 'left';

        // Draw ticks
        // Determine step based on zoom
        let step = 1; // 1 second
        if (zoomLevel < 0.2) step = 10;
        else if (zoomLevel < 0.5) step = 5;

        for (let t = 0; t <= duration + 5; t += step) {
            const x = t * pixelsPerSec;

            // Major Tick
            ctx.beginPath();
            ctx.moveTo(x, height);
            ctx.lineTo(x, height - 12);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#6b7280';
            ctx.stroke();

            // Label (mm:ss)
            const mins = Math.floor(t / 60);
            const secs = Math.floor(t % 60);
            const label = `${mins}:${secs.toString().padStart(2, '0')}`;

            ctx.fillStyle = '#9ca3af';
            ctx.fillText(label, x + 4, height - 14);

            // Minor ticks
            if (zoomLevel >= 0.5) {
                const subDivisions = zoomLevel >= 2 ? 10 : 5;
                for (let st = 1; st < subDivisions; st++) {
                    const sx = x + (st * pixelsPerSec / subDivisions);
                    ctx.beginPath();
                    ctx.moveTo(sx, height);
                    ctx.lineTo(sx, height - 6);
                    ctx.strokeStyle = '#374151';
                    ctx.stroke();
                }
            }
        }

    }, [duration, zoomLevel, totalWidth, pixelsPerSec]);

    return (
        <div
            ref={containerRef}
            className="h-8 min-w-full sticky top-0 bg-[#1e1f22] z-30 cursor-pointer border-b border-[#2a2b2e]"
            style={{ width: `${totalWidth + 100}px` }} // Ensure div stretches
            onMouseDown={(e) => {
                const clickX = e.nativeEvent.offsetX;
                const time = clickX / pixelsPerSec;
                onSeek(time);
            }}
        >
            <canvas ref={canvasRef} className="block pointer-events-none" />

            {/* Playhead Handle Triangle */}
            <div
                className="absolute top-0 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-500 transform -translate-x-1/2 pointer-events-none"
                style={{ left: `${currentTime * pixelsPerSec}px` }}
            />
        </div>
    );
};

export default TimeRuler;
