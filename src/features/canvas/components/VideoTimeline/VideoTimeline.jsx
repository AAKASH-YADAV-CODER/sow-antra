import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import TimelineTracks from './TimelineTracks';
import PlaybackControls from './PlaybackControls';
import TimeRuler from './TimeRuler';
import '../../../../styles/VideoTimeline.css'; // We'll need to create this

const VideoTimeline = ({
    pages,
    currentPage,
    setCurrentPage,
    currentDetails, // { elements, duration, etc }
    onUpdateElement,
    onUpdatePageDuration,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    duration, // Total duration of current scene/page
    selectedElement,
    setSelectedElement,
    audioTracks,
    updateAudioTrack
}) => {
    const [zoomLevel, setZoomLevel] = useState(1); // Pixels per second
    const scrollRef = useRef(null);

    // Playback Loop
    useEffect(() => {
        let animationFrame;
        if (isPlaying) {
            const startTime = Date.now() - (currentTime * 1000);

            const loop = () => {
                const now = Date.now();
                const newTime = (now - startTime) / 1000;

                if (newTime >= duration) {
                    setCurrentTime(0); // Loop logic for now
                    // OR: setIsPlaying(false); setCurrentTime(duration);
                } else {
                    setCurrentTime(newTime);
                    animationFrame = requestAnimationFrame(loop);
                }
            };

            animationFrame = requestAnimationFrame(loop);
        }
        return () => cancelAnimationFrame(animationFrame);
    }, [isPlaying, duration, currentTime, setCurrentTime]);

    const handleSeek = (time) => {
        setCurrentTime(Math.max(0, Math.min(time, duration)));
    };

    return (
        <div className="video-timeline-container flex flex-col h-full bg-[#18191b] text-white border-t border-[#2a2b2e]">

            {/* Top Bar: Playback Controls & Tools */}
            <div className="h-10 flex items-center justify-between px-4 border-b border-[#2a2b2e] bg-[#1e1f22]">
                <div className="flex items-center gap-4">
                    <PlaybackControls
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        currentTime={currentTime}
                        duration={duration}
                        onSeek={handleSeek}
                    />

                    <div className="flex items-center gap-2 text-xs text-gray-400 border-l border-gray-700 pl-4">
                        <span>Duration:</span>
                        <input
                            type="number"
                            className="w-12 bg-[#2a2b2e] border border-gray-600 rounded px-1 text-white text-center focus:outline-none focus:border-blue-500"
                            value={duration}
                            onChange={(e) => onUpdatePageDuration(Number(e.target.value))}
                            min={1}
                            max={60}
                        />
                        <span>s</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))} className="p-1 hover:bg-[#2a2b2e] rounded"><ZoomOut size={16} /></button>
                    <span className="text-xs text-gray-400">Zoom</span>
                    <button onClick={() => setZoomLevel(z => Math.min(5, z + 0.1))} className="p-1 hover:bg-[#2a2b2e] rounded"><ZoomIn size={16} /></button>
                </div>
            </div>

            {/* Main Timeline Area */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Track Headers (Left) */}
                <div className="w-48 bg-[#1e1f22] border-r border-[#2a2b2e] flex flex-col z-20">
                    <div className="h-8 border-b border-[#2a2b2e] flex items-center px-4 font-xs text-gray-500 text-xs font-semibold">Timeline</div>
                    <div className="flex-1">
                        {/* Headers will go here */}
                    </div>
                </div>

                {/* Scrollable Tracks Area */}
                <div className="flex-1 overflow-auto relative custom-scrollbar" ref={scrollRef}>
                    <TimeRuler
                        duration={duration}
                        zoomLevel={zoomLevel}
                        currentTime={currentTime}
                        onSeek={handleSeek}
                    />

                    <TimelineTracks
                        elements={currentDetails.elements}
                        duration={duration}
                        zoomLevel={zoomLevel}
                        onUpdateElement={onUpdateElement}
                        selectedElement={selectedElement}
                        setSelectedElement={setSelectedElement}
                    />

                    {/* Playhead Line */}
                    <div
                        className="absolute top-0 bottom-0 w-[1px] bg-blue-500 z-30 pointer-events-none"
                        style={{ left: `${currentTime * 100 * zoomLevel}px` }}
                    >
                        <div className="w-3 h-3 bg-blue-500 rounded-full -ml-[5px] -mt-1.5 shadow-sm"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoTimeline;
