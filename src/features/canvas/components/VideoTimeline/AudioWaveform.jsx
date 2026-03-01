import React, { useMemo } from 'react';

/**
 * AudioWaveform Component
 * Generates a deterministic "waveform" visualization for audio clips.
 */
export default function AudioWaveform({ seed = 'default', color = 'currentColor', opacity = 0.4 }) {
    const bars = useMemo(() => {
        const count = 60;
        const result = [];
        let hValue = 0;

        // Simple hash from string seed
        for (let i = 0; i < seed.length; i++) {
            hValue = seed.charCodeAt(i) + ((hValue << 5) - hValue);
        }

        for (let i = 0; i < count; i++) {
            // Deterministic pseudo-random heights
            const ripple = Math.sin(i * 0.5) * 20;
            const noise = Math.abs((hValue >> (i % 20)) % 40);
            const height = Math.min(90, Math.max(15, 30 + ripple + noise));
            result.push(height);
        }
        return result;
    }, [seed]);

    return (
        <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none opacity-40">
            {bars.map((h, i) => (
                <div
                    key={i}
                    style={{
                        width: '1px',
                        height: `${h}%`,
                        backgroundColor: color,
                        borderRadius: '1px',
                        marginRight: '1px'
                    }}
                />
            ))}
        </div>
    );
}
