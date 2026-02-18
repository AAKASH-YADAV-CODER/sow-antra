import { useEffect, useRef, useMemo } from 'react';

/**
 * GlobalAudioPlayer Component
 * Manages audio playback for all audio elements in the project.
 * Not visible on canvas, handles sync with global timeline.
 */
const GlobalAudioPlayer = ({ pages, currentTime, isPlaying, isMusicMuted }) => {
    const audioRefs = useRef({});

    // 1. Memoize all audio elements from all pages to prevent unnecessary re-syncs
    const allAudioElements = useMemo(() => {
        return pages.reduce((acc, page, idx) => {
            const pageRelativeStart = pages.slice(0, idx).reduce((sum, p) => sum + (p.duration || 5), 0);
            const pageAudio = (page.elements || [])
                .filter(el => el.type === 'audio')
                .map(el => ({
                    ...el,
                    globalStartTime: (el.startTime || 0) + pageRelativeStart,
                    globalEndTime: (el.startTime || 0) + pageRelativeStart + (el.duration || 5)
                }));
            return [...acc, ...pageAudio];
        }, []);
    }, [pages]);

    // 2. Sync playback
    useEffect(() => {
        allAudioElements.forEach(el => {
            let audio = audioRefs.current[el.id];

            // Create audio element if it doesn't exist
            if (!audio) {
                audio = new Audio(el.src);
                audio.preload = 'auto'; // Force preload for lower latency
                audioRefs.current[el.id] = audio;
            } else if (audio.src !== el.src) {
                audio.src = el.src;
            }

            // Global Volume / Mute
            audio.volume = isMusicMuted ? 0 : (el.volume !== undefined ? el.volume / 100 : 0.5);

            const offset = el.audioOffset || 0;
            const localTime = currentTime - el.globalStartTime;
            const targetAudioTime = Math.max(0, localTime + offset);

            if (isPlaying && currentTime >= el.globalStartTime && currentTime < el.globalEndTime) {
                // High-fidelity sync: adjust time if drift is > 100ms
                if (Math.abs(audio.currentTime - targetAudioTime) > 0.1) {
                    audio.currentTime = targetAudioTime;
                }

                if (audio.paused) {
                    audio.play().catch(err => {
                        console.error("Audio playback failed:", err);
                    });
                }
            } else {
                // Should be paused
                if (!audio.paused) {
                    audio.pause();
                }

                // Scrubbing/Stop sync
                if (Math.abs(audio.currentTime - targetAudioTime) > 0.05) {
                    audio.currentTime = targetAudioTime;
                }
            }
        });

        // Cleanup audio elements that are no longer in the project
        const currentIds = new Set(allAudioElements.map(el => el.id));
        Object.keys(audioRefs.current).forEach(id => {
            if (!currentIds.has(id)) {
                audioRefs.current[id].pause();
                delete audioRefs.current[id];
            }
        });

    }, [allAudioElements, currentTime, isPlaying, isMusicMuted]);

    return null; // Side-effect component
};

export default GlobalAudioPlayer;
