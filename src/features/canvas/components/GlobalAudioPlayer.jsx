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

    // 2. Sync playback via refs
    useEffect(() => {
        allAudioElements.forEach(el => {
            const audio = audioRefs.current[el.id];
            if (!audio) return;

            // Global Volume / Mute
            const baseVolume = el.volume !== undefined ? el.volume / 100 : 1.0;
            audio.volume = isMusicMuted ? 0 : baseVolume;

            const offset = el.audioOffset || 0;
            const localTime = currentTime - el.globalStartTime;
            const targetAudioTime = Math.max(0, localTime + offset);

            if (isPlaying && currentTime >= el.globalStartTime && currentTime < el.globalEndTime) {
                // High-fidelity sync: adjust time if drift is > 150ms
                if (Math.abs(audio.currentTime - targetAudioTime) > 0.15) {
                    audio.currentTime = targetAudioTime;
                }

                if (audio.paused) {
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(err => {
                            if (err.name !== 'AbortError') {
                                console.warn("Audio playback issue (User interaction may be needed):", err);
                            }
                        });
                    }
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
                if (audioRefs.current[id]) {
                    audioRefs.current[id].pause();
                    delete audioRefs.current[id];
                }
            }
        });
    }, [allAudioElements, currentTime, isPlaying, isMusicMuted]);

    return (
        <div style={{ display: 'none' }} id="global-audio-player">
            {allAudioElements.map(el => (
                <audio
                    key={el.id}
                    ref={ref => { if (ref) audioRefs.current[el.id] = ref; }}
                    src={el.src}
                    preload="auto"
                />
            ))}
        </div>
    );
};

export default GlobalAudioPlayer;
