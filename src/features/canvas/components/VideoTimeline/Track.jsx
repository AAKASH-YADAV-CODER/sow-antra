import React, { useState, useMemo, memo } from 'react';
import { Plus, Shapes, Image as ImageIcon, Type, Square } from 'lucide-react';
import { getBackgroundStyle } from '../../../../utils/helpers';

export const Track = memo(({ 
  track, 
  allTracks,
  currentTime,
  pixelsPerSecond,
  selectedClipId,
  onClipSelect,
  onClipDoubleClick,
  onTrimChange,
  onClipMove,
  onAddClip, 
  pages = [],
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
  const [draggingClipId, setDraggingClipId] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  // Local state for ultra-smooth dragging/trimming without jumping or lag
  const [localInteraction, setLocalInteraction] = useState(null); // { id: string, startTime?: number, duration?: number, isScene?: boolean }

  const isMediaTrack = track.id === 'media-track';

  // ─── Canva-like Clip Interaction ──────────────────────────────────────────
  const handleClipMouseDown = (e, clip) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    const DRAG_THRESHOLD = 5; 
    const startX = e.clientX;
    const startY = e.clientY;
    const initialStartTime = clip.startTime;
    const initialTrackId = track.id;
    let isDragging = false;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      if (!isDragging) {
        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
          isDragging = true;
          setDraggingClipId(clip.id);
          document.body.style.cursor = 'grabbing';
          document.body.style.userSelect = 'none';
        } else return;
      }
      
      const newStartTime = Math.max(0, initialStartTime + dx / pixelsPerSecond);
      
      // Update local state for immediate visual feedback
      setLocalInteraction({ id: clip.id, startTime: newStartTime });
    };

    const handleMouseUp = (upEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      if (isDragging) {
        const dx = upEvent.clientX - startX;
        const finalStartTime = Math.max(0, initialStartTime + dx / pixelsPerSecond);
        
        // Final sync with global state
        const elements = document.elementsFromPoint(upEvent.clientX, upEvent.clientY);
        const trackEl = elements.find(el => el.hasAttribute('data-track-id'));
        const targetTrackId = trackEl?.getAttribute('data-track-id') || initialTrackId;
        onClipMove?.(clip.id, targetTrackId, finalStartTime);
      } else {
        onClipSelect?.(clip.id);
      }
      
      setDraggingClipId(null);
      setLocalInteraction(null);
      isDragging = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // ─── Trim Handle Logic ────────────────────────────────────────────────────
  const handleTrimStart = (e, clip, side) => {
    e.stopPropagation();
    const startX = e.clientX;
    const initialStart = clip.startTime;
    const initialDuration = clip.duration;

    const handleMouseMove = (moveEvent) => {
      const deltaTime = (moveEvent.clientX - startX) / pixelsPerSecond;
      if (side === 'left') {
        let newStart = Math.max(0, initialStart + deltaTime);
        let newDur = Math.max(0.1, initialDuration - (newStart - initialStart));
        setLocalInteraction({ id: clip.id, startTime: newStart, duration: newDur });
      } else {
        let newEnd = initialStart + initialDuration + deltaTime;
        let newDur = Math.max(0.1, newEnd - initialStart);
        setLocalInteraction({ id: clip.id, duration: newDur });
      }
    };

    const handleMouseUp = (upEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      
      const deltaTime = (upEvent.clientX - startX) / pixelsPerSecond;
      if (side === 'left') {
        let finalStart = Math.max(0, initialStart + deltaTime);
        let finalDur = Math.max(0.1, initialDuration - (finalStart - initialStart));
        onTrimChange?.(clip.id, finalStart, finalDur);
      } else {
        let finalEnd = initialStart + initialDuration + deltaTime;
        let finalDur = Math.max(0.1, finalEnd - initialStart);
        onTrimChange?.(clip.id, initialStart, finalDur);
      }
      setLocalInteraction(null);
    };
    document.body.style.cursor = 'ew-resize';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  
  // ─── Scene Trim Handle Logic ──────────────────────────────────────────────
  const handleSceneTrimStart = (e, page, side) => {
    e.stopPropagation();
    const startX = e.clientX;
    const initialDuration = page.duration || 5;

    const handleMouseMove = (moveEvent) => {
      const deltaTime = (moveEvent.clientX - startX) / pixelsPerSecond;
      let newDuration = Math.max(0.1, initialDuration + deltaTime);
      
      if (side === 'right') {
        setLocalInteraction({ id: page.id, duration: newDuration, isScene: true });
      }
    };

    const handleMouseUp = (upEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      
      if (side === 'right') {
        const deltaTime = (upEvent.clientX - startX) / pixelsPerSecond;
        let finalDuration = Math.max(0.1, initialDuration + deltaTime);
        onUpdatePageDuration?.(page.id, finalDuration);
      }
      setLocalInteraction(null);
    };

    document.body.style.cursor = 'ew-resize';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // ─── Virtualization ───────────────────────────────────────────────────────
  const buffer = 200;
  const visibleClips = useMemo(() => {
    return track.clips.filter(clip => {
      const clipStart = clip.startTime * pixelsPerSecond;
      const clipEnd   = (clip.startTime + clip.duration) * pixelsPerSecond;
      return clipEnd >= scrollLeft - buffer && clipStart <= scrollLeft + containerWidth + buffer;
    });
  }, [track.clips, pixelsPerSecond, scrollLeft, containerWidth]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className={`relative my-1 mx-2 rounded-xl flex items-center group/track transition-all shadow-sm w-full min-w-max ${isMediaTrack ? 'h-24 bg-white border border-gray-100' : 'h-10 bg-[#f1f3f4]'}`}
      data-track-id={track.id}
    >
      <div className="flex-1 h-full relative">

        {/* ─── Standard Clips (Layers) ─── */}
        {!isMediaTrack && visibleClips.map((clip) => {
          const isSelected  = selectedClipId === clip.id;
          const isDragging  = draggingClipId === clip.id;

          return (
            <div
              key={clip.id}
              onMouseDown={(e) => handleClipMouseDown(e, clip)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onClipDoubleClick?.(clip.id, clip.type);
              }}
              className={[
                'absolute h-8 rounded-md flex items-center border shadow-sm select-none',
                isDragging ? 'opacity-60 scale-[1.02] transition-none z-20 border-white/60' : 'transition-shadow',
                isSelected ? 'ring-2 ring-[#8b3dff] ring-offset-2 ring-offset-white z-10 border-transparent' : 'border-white/20 hover:ring-2 hover:ring-black/20',
                clip.color || 'bg-gray-600',
                isDragging ? 'cursor-grabbing' : 'cursor-grab',
              ].join(' ')}
              style={{
                left:  (localInteraction?.id === clip.id ? (localInteraction.startTime ?? clip.startTime) : clip.startTime) * pixelsPerSecond,
                width: (localInteraction?.id === clip.id ? (localInteraction.duration ?? clip.duration) : clip.duration) * pixelsPerSecond,
                willChange: localInteraction?.id === clip.id ? 'left, width' : 'auto'
              }}
            >
              <div className="absolute left-0 top-0 w-2 h-full cursor-ew-resize z-20 flex items-center justify-center group/handle" onMouseDown={(e) => handleTrimStart(e, clip, 'left')}>
                <div className="w-1 h-4 bg-white/30 rounded-full group-hover/handle:bg-white/80 transition-colors" />
              </div>
              <div className="flex-1 h-full overflow-hidden relative pointer-events-none">
                {(clip.type === 'video' || clip.type === 'image') && clip.thumbnail && (
                  <img src={clip.thumbnail} alt={clip.label} className="h-full w-full object-cover opacity-80" referrerPolicy="no-referrer" />
                )}
                {clip.type === 'audio' && (
                  <div className="w-full h-full flex flex-col justify-center px-2">
                    <div className="flex items-end gap-[1px] h-6 opacity-60">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div key={i} className="w-[2px] bg-white rounded-full" style={{ height: `${Math.random() * 100}%` }} />
                      ))}
                    </div>
                  </div>
                )}
                {clip.type === 'element' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white shadow-sm"><Shapes size={20} /></div>
                  </div>
                )}
                {clip.label && (
                   <div className="absolute top-1 left-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded text-[10px] text-white font-medium truncate max-w-[90%]">{clip.label}</div>
                )}
              </div>
              <div className="absolute right-0 top-0 w-2 h-full cursor-ew-resize z-20 flex items-center justify-center group/handle" onMouseDown={(e) => handleTrimStart(e, clip, 'right')}>
                <div className="w-1 h-4 bg-white/30 rounded-full group-hover/handle:bg-white/80 transition-colors" />
              </div>
            </div>
          );
        })}

        {/* ─── Scene Strip (Media Track) ─── */}
        {isMediaTrack && pages.map((page, index) => {
            const isActive = page.id === currentPage;
            return (
                <div 
                    key={page.id}
                    className={`absolute h-20 top-2 rounded-lg border-2 transition-all overflow-hidden cursor-pointer group ${
                        isActive ? 'border-[#8b3dff] shadow-lg z-10 scale-[1.02]' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                        left: page.startTime * pixelsPerSecond,
                        width: (localInteraction?.id === page.id && localInteraction.isScene ? localInteraction.duration : (page.duration || 5)) * pixelsPerSecond - 4,
                        willChange: (localInteraction?.id === page.id && localInteraction.isScene) ? 'width' : 'auto'
                    }}
                    onClick={() => setCurrentPage?.(page.id)}
                >
                    <div 
                        className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400"
                        style={{ background: getBackgroundStyle({ fill: page.backgroundColor, gradient: page.backgroundGradient, fillType: page.backgroundGradient ? 'gradient' : 'solid' }) }}
                    >
                        {(() => {
                            const visualElements = (page.elements || []).filter(el => el.type !== 'audio');
                            const mainMedia = visualElements.find(el => el.type === 'image' || el.type === 'video');
                            const firstElement = visualElements[0];

                            if (mainMedia?.thumbnail || mainMedia?.src) {
                                return (
                                    <img 
                                        src={mainMedia.thumbnail || mainMedia.src} 
                                        className="w-full h-full object-cover opacity-90"
                                        alt=""
                                    />
                                );
                            } else if (firstElement) {
                                // Show a small representation of the first element
                                return (
                                    <div className="flex flex-col items-center gap-1 bg-black/5 p-2 rounded backdrop-blur-sm">
                                        {firstElement.type === 'text' ? <Type size={16} className="text-gray-600" /> : 
                                         firstElement.type === 'image' ? <ImageIcon size={16} className="text-gray-600" /> :
                                         <Square size={16} className="text-gray-600" />}
                                        <span className="text-[8px] uppercase">{firstElement.type}</span>
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="flex flex-col items-center gap-1 opacity-20">
                                        <Shapes size={16} />
                                        <span>Empty Scene</span>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                    <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black ${
                        isActive ? 'bg-[#8b3dff] text-white' : 'bg-black/20 text-white shadow-sm'
                    }`}>{index + 1}</div>
                    
                    {/* Scene Trim Handle (Right Edge) - Improved Hitbox & Visibility */}
                    <div 
                        className="absolute right-0 top-0 w-4 h-full cursor-ew-resize z-20 flex items-center justify-end pr-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => handleSceneTrimStart(e, page, 'right')}
                    >
                        <div className="w-1.5 h-10 bg-[#8b3dff]/60 rounded-full hover:bg-[#8b3dff] transition-all shadow-sm border border-white/40" />
                    </div>
                </div>
            );
        })}

        {/* ── Add Scene/Clip Button ── */}
        {(track.type === 'media' || track.type === 'audio') && (
          <div
            className={`absolute rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#8b3dff] hover:bg-[#f8f6ff] transition-all group ${isMediaTrack ? 'h-20 w-16 top-2' : 'h-8 w-8'}`}
            style={{
              left: (isMediaTrack 
                ? pages.reduce((sum, p) => sum + (p.duration || 5), 0)
                : (track.clips.length > 0 ? Math.max(...track.clips.map(c => c.startTime + c.duration)) : 0)
              ) * pixelsPerSecond + 16,
            }}
            onClick={() => {
              if (track.type === 'audio') {
                onAddClip?.(track.id, 'audio', 'add');
              } else {
                setShowAddMenu(!showAddMenu);
              }
            }}
          >
            <Plus size={20} className="text-gray-400 group-hover:text-[#8b3dff]" />
            {showAddMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowAddMenu(false); }} />
                <div className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200" onClick={(e) => e.stopPropagation()}>
                  <button className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      if (isMediaTrack) onAddPage?.('import');
                      else onAddClip?.(track.id, track.type === 'audio' ? 'audio' : 'video', 'import');
                      setShowAddMenu(false);
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Import
                  </button>
                  <button className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      if (isMediaTrack) onAddPage?.('blank');
                      else onAddClip?.(track.id, track.type === 'audio' ? 'audio' : 'video', 'blank');
                      setShowAddMenu(false);
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    Blank
                  </button>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
});

export default Track;
