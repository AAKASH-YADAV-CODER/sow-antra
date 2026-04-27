import React, { useState, useRef, useEffect } from 'react';
import { Ruler } from './Ruler';
import { Track } from './Track';
import { Playhead } from './Playhead';
import { PIXELS_PER_SECOND } from '../../../../utils/constants';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ZoomIn,
  ZoomOut,
  Maximize,
  Layers,
  Scissors
} from 'lucide-react';

export const Timeline = ({ 
  tracks, 
  onReorderTracks,
  duration, 
  currentTime, 
  onTimeChange,
  isPlaying,
  onTogglePlay,
  height,
  onResizeStart,
  selectedClipId,
  onClipSelect,
  onClipDoubleClick,
  onTrimChange,
  onClipMove,
  onAddClip,
  pages = [],
  totalDuration,
  currentPage,
  setCurrentPage,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onUpdatePageDuration,
  onDeleteClip,
  onSplit
}) => {
  const [zoom, setZoom] = useState(1);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const pixelsPerSecond = PIXELS_PER_SECOND * zoom;
  const timelineRef = useRef(null);

  useEffect(() => {
    if (timelineRef.current) {
      setContainerWidth(timelineRef.current.clientWidth);
      
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });
      observer.observe(timelineRef.current);
      return () => observer.disconnect();
    }
  }, []);

  const handleScroll = (e) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  return (
    <div 
      className="bg-white border-t border-gray-200 flex flex-col select-none relative"
      style={{ height }}
    >
      {/* Resize Handle */}
      <div 
        className="absolute top-0 left-0 w-full h-1 cursor-ns-resize z-[100] hover:bg-[#8b3dff] transition-colors"
        onMouseDown={onResizeStart}
      />


      {/* Timeline Controls */}
      <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 text-gray-500">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:text-black transition-colors">
            <Layers size={18} />
          </button>
          <div className="h-4 w-[1px] bg-gray-200" />
          <button 
            onClick={onSplit}
            className="flex items-center gap-1.5 px-3 py-1 hover:bg-gray-100 rounded text-sm font-medium transition-colors text-[#8b3dff] mr-2"
            title="Split (S)"
          >
            <Scissors size={16} />
            <span>Split</span>
          </button>
          <div className="flex items-center gap-2 text-sm font-medium text-black">
            <span>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-400">{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:text-black transition-colors">
            <SkipBack size={20} />
          </button>
          <button 
            onClick={onTogglePlay}
            className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button className="p-2 hover:text-black transition-colors">
            <SkipForward size={20} />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <ZoomOut size={16} />
            <input 
              type="range" 
              min="0.5" 
              max="5" 
              step="0.1" 
              value={zoom} 
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-32 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8b3dff]"
            />
            <ZoomIn size={16} />
          </div>
          <div className="h-4 w-[1px] bg-gray-200" />
          <button className="p-2 hover:text-black transition-colors">
            <Maximize size={18} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-gray-100 relative">
        <div 
          className="absolute h-full bg-[#8b3dff] transition-all duration-100"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
      </div>

      {/* Timeline Content Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tracks Area (Sidebar removed as requested) */}

        {/* Tracks Area */}
        <div 
          ref={timelineRef}
          className="flex-1 overflow-x-auto overflow-y-auto scrollbar-hide relative"
          onScroll={handleScroll}
        >
          <div 
            className="relative min-h-full min-w-full" 
            style={{ width: Math.max((totalDuration || duration) * pixelsPerSecond + 100, containerWidth) }}
          >
            <Ruler 
              duration={totalDuration || duration} 
              pixelsPerSecond={pixelsPerSecond} 
              scrollLeft={scrollLeft}
              containerWidth={containerWidth}
              onTimeChange={onTimeChange}
            />
            
            <div className="relative mt-4">
              <div>
                {tracks.map((track) => (
                  <TrackRow 
                    key={track.id}
                    track={track}
                    tracks={tracks}
                    currentTime={currentTime}
                    pixelsPerSecond={pixelsPerSecond}
                    selectedClipId={selectedClipId}
                    onClipSelect={onClipSelect}
                    onClipDoubleClick={onClipDoubleClick}
                    onTrimChange={onTrimChange}
                    onClipMove={onClipMove}
                    onAddClip={(trackId, type, action) => onAddClip?.(trackId, type, action)}
                    pages={pages}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    onAddPage={onAddPage}
                    onDeletePage={onDeletePage}
                    onDuplicatePage={onDuplicatePage}
                    onUpdatePageDuration={onUpdatePageDuration}
                    onDeleteClip={onDeleteClip}
                    scrollLeft={scrollLeft}
                    containerWidth={containerWidth}
                  />
                ))}
              </div>
              
              {/* Playhead Overlay - ensuring high z-index and top level relative to tracks */}
              <div 
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ zIndex: 1000 }}
              >
                <Playhead 
                  currentTime={currentTime} 
                  tracks={tracks}
                  pixelsPerSecond={pixelsPerSecond} 
                  onDrag={onTimeChange}
                  height={tracks.reduce((sum, t) => sum + (t.id === 'media-track' ? 112 : 56), 0) + 60}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

// Internal component per track row (no drag/reorder)
const TrackRow = ({ 
  track, 
  tracks, 
  currentTime, 
  pixelsPerSecond, 
  selectedClipId, 
  onClipSelect, 
  onClipDoubleClick,
  onTrimChange, 
  onClipMove, 
  onAddClip, 
  pages,
  currentPage,
  setCurrentPage,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onUpdatePageDuration,
  onDeleteClip,
  scrollLeft, 
  containerWidth 
}) => {
  return (
    <div className="relative">
      <Track 
        track={track} 
        allTracks={tracks}
        currentTime={currentTime}
        pixelsPerSecond={pixelsPerSecond} 
        selectedClipId={selectedClipId}
        onClipSelect={onClipSelect}
        onClipDoubleClick={onClipDoubleClick}
        onTrimChange={onTrimChange}
        onClipMove={onClipMove}
        onAddClip={(trackId, type, action) => onAddClip?.(trackId, type, action)}
        pages={pages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onAddPage={onAddPage}
        onDeletePage={onDeletePage}
        onDuplicatePage={onDuplicatePage}
        onUpdatePageDuration={onUpdatePageDuration}
        onDeleteClip={onDeleteClip}
        scrollLeft={scrollLeft}
        containerWidth={containerWidth}
      />
    </div>
  );
};

export default Timeline;
