import React, { useState, useMemo } from 'react';
import { Timeline } from './Timeline';

// ── Helper: natural track ID for an element based on its type ─────────────
const getDefaultTrackId = (el) => {
    if (el.type === 'text') return 'text-track';
    if (el.type === 'image') {
        // If it's a "Main" image (Background/Fit), it belongs to the media/scene track
        if (el.label === 'Background' || el.fitToCanvas) return 'media-track';
        return 'image-track';
    }
    if (el.type === 'video') return 'media-track';
    if (el.type === 'audio') return 'audio-track';
    return 'element-track';
};

// Resolve the track an element is currently assigned to.
// el.trackId (manual override from drag) takes priority over the natural default.
const getAssignedTrackId = (el) => el.trackId || getDefaultTrackId(el);

const VideoTimeline = ({
    pages,
    currentPage,
    setCurrentPage,
    currentDetails,
    onUpdateElement,
    onUpdatePageDuration,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    duration,
    selectedElement,
    setSelectedElement,
    audioTracks = [],
    updateAudioTrack,
    onAddClip,
    onClipDoubleClick,
    onAddPage,
    onDeletePage,
    onDuplicatePage,
    onDeleteClip,
    onSplit
}) => {
    const [trackOrder, setTrackOrder] = useState(['text-track', 'element-track', 'image-track', 'media-track', 'audio-track']);

    // ── Build master track data (aggregating ALL pages) ────────────────────
    const tracks = useMemo(() => {
        let currentPageOffset = 0;
        const allClips = {
            'text-track': [],
            'element-track': [],
            'image-track': [],
            'media-track': [],
            'audio-track': []
        };

        pages.forEach(page => {
            const elements = page.elements || [];
            const pageOffset = currentPageOffset;
            
            elements.forEach(el => {
                const trackId = getAssignedTrackId(el);
                if (!allClips[trackId]) return;

                const isText = el.type === 'text';
                const isVideo = el.type === 'video';
                const isImage = el.type === 'image';
                const isAudio = el.type === 'audio';

                const truncate = (str, n) => {
                    if (!str) return '';
                    return str.length > n ? str.substr(0, n - 1) + "..." : str;
                };

                const clip = {
                    id: el.id,
                    pageId: page.id, // Keep track of parent page
                    type: isText ? 'text' : (isAudio ? 'audio' : (isVideo || isImage ? el.type : 'element')),
                    startTime: (el.startTime || 0) + pageOffset,
                    duration: el.duration || 5.0,
                    label: isText ? truncate(el.content || 'Text', 15) : (el.name || (isAudio ? 'Audio' : 'Element')),
                    content: el.content,
                    src: el.src,
                    thumbnail: el.thumbnail || el.src,
                    color: isText ? 'bg-amber-500'
                         : isVideo ? 'bg-indigo-600'
                         : isImage ? 'bg-blue-500'
                         : isAudio ? 'bg-emerald-500'
                         : 'bg-pink-500'
                };

                allClips[trackId].push(clip);
            });

            currentPageOffset += (page.duration || 5);
        });

        const baseTracks = [
            { id: 'text-track',    type: 'text',    clips: allClips['text-track']    },
            { id: 'element-track', type: 'element',  clips: allClips['element-track'] },
            { id: 'image-track',   type: 'image',    clips: allClips['image-track']   },
            { id: 'media-track',   type: 'media',    clips: allClips['media-track']   },
            { id: 'audio-track',   type: 'audio',    clips: allClips['audio-track']   }
        ];

        return baseTracks.sort((a, b) => trackOrder.indexOf(a.id) - trackOrder.indexOf(b.id));
    }, [pages, trackOrder]);

    const totalDuration = useMemo(() => {
        return pages.reduce((sum, p) => sum + (p.duration || 5), 0);
    }, [pages]);

    const pagesWithCalculatedTimes = useMemo(() => {
        let currentStart = 0;
        return pages.map(page => {
            const start = currentStart;
            currentStart += (page.duration || 5);
            return { ...page, startTime: start };
        });
    }, [pages]);

    // ── Global Trim / Move handlers ───────────────────────────────────────
    const handleTrimChange = (id, globalStartTime, duration) => {
        // We pass the global start time to onUpdateElement, and it will handle local mapping
        onUpdateElement(id, { startTime: globalStartTime, duration });
    };

    const handleClipMove = (id, newTrackId, globalStartTime) => {
        // We pass the global start time and new track to onUpdateElement
        onUpdateElement(id, { startTime: globalStartTime, trackId: newTrackId });
    };

    return (
        <div className="flex flex-col bg-white border-t border-gray-200 shadow-2xl z-50">
            <Timeline
                pages={pagesWithCalculatedTimes}
                totalDuration={totalDuration}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                onAddPage={onAddPage}
                onDeletePage={onDeletePage}
                onDuplicatePage={onDuplicatePage}
                tracks={tracks}
                onReorderTracks={(newTracks) => setTrackOrder(newTracks.map(t => t.id))}
                duration={duration}
                currentTime={currentTime}
                onTimeChange={setCurrentTime}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                height={350} 
                onResizeStart={() => {}}
                selectedClipId={selectedElement}
                onClipSelect={setSelectedElement}
                onClipDoubleClick={onClipDoubleClick}
                onTrimChange={handleTrimChange}
                onClipMove={handleClipMove}
                onAddClip={(trackId, type, action) => onAddClip?.(trackId, type, action)}
                onUpdatePageDuration={onUpdatePageDuration}
                onDeleteClip={onDeleteClip}
                onSplit={onSplit}
            />
        </div>
    );
};

export default VideoTimeline;
