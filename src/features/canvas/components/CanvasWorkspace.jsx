import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Copy, Trash2, Plus, Eye, Clock, LayoutGrid, FileText, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { getBackgroundStyle } from '../../../utils/helpers';
import NotesPanel from './NotesPanel';
import TimerModal from './modals/TimerModal';
import GridView from './GridView';
import PagesStrip from './PagesStrip';
import { CanvasRulers } from './CanvasRulers';

import useFontLoader from '../hooks/useFontLoader';

/**
 * CanvasWorkspace Component
 * Main canvas rendering area with:
 * - Zoom and pan support
 * - Touch gestures (pinch zoom, double-tap)
 * - Grid overlay
 * - Element rendering
 * - Alignment lines
 * - Drawing path visualization
 */
const CanvasWorkspace = ({
  canvasContainerRef,
  canvasRef,
  canvasSize,
  zoomLevel,
  canvasOffset,
  handleCanvasMouseDown,
  handlePointerUp,
  handleCanvasMouseEnter,
  handleCanvasMouseLeave,
  canvasHighlighted,

  // Touch handlers
  touchStartDistance,
  setTouchStartDistance,
  initialZoomLevel,
  setInitialZoomLevel,
  lastTouchEnd,
  setLastTouchEnd,
  zoom,
  setZoomLevel,

  // Grid and elements
  showGrid,
  getCurrentPageElements,
  renderElement,

  // Alignment lines
  showAlignmentLines,
  alignmentLines,

  // Collaboration
  onMouseMove,
  canvasBackgroundColor,
  handleContainerMouseDown,
  // Page Props
  pages = [],
  currentPage,
  setCurrentPage,
  addNewPage,
  duplicatePage,
  movePage,
  deletePage,
  renamePage,
  setShowGrid,
  handleWheel,
  setPages,
  showNotesPanel,
  setShowNotesPanel,
  showTimerModal,
  setShowTimerModal,
  showGridView,
  setShowGridView,
  showPagesStrip,
  setShowPagesStrip,
  // Timer Props
  timerSeconds,
  setTimerSeconds,
  isTimerRunning,
  setIsTimerRunning,
  selectedMusicId,
  setSelectedMusicId,
  musicTracks,
  isMusicMuted,
  setIsMusicMuted,
  measurements = [],
  currentTime = 0,
  isPlaying = false,
  isVideoMode = false,
  showRulers = false,
  guides = [],
  setGuides,
  showMargins = false
}) => {
  // Use font loader hook to dynamic load fonts
  useFontLoader(pages);

  const [editingPageId, setEditingPageId] = useState(null);
  const [pageTitleValue, setPageTitleValue] = useState('');

  const handlePageTitleClick = (page) => {
    setEditingPageId(page.id);
    setPageTitleValue(page.name || `Page ${pages.indexOf(page) + 1}`);
  };

  const handlePageTitleBlur = (pageId) => {
    if (renamePage) {
      renamePage(pageId, pageTitleValue);
    }
    setEditingPageId(null);
  };

  const handlePageTitleKeyDown = (e, pageId) => {
    if (e.key === 'Enter') {
      handlePageTitleBlur(pageId);
    } else if (e.key === 'Escape') {
      setEditingPageId(null);
    }
  };
  const handleMouseMoveCallback = (e) => {
    if (onMouseMove) {
      // Pass the event directly, let the handler calculate coordinates
      onMouseMove(e);
    }
  };

  const handleUpdateNotes = (newNotes) => {
    setPages(prevPages => prevPages.map(page =>
      page.id === currentPage ? { ...page, notes: newNotes } : page
    ));
  };

  const [draggingGuide, setDraggingGuide] = useState(null);

  const handleGuideMouseDown = React.useCallback((e, guide) => {
    e.stopPropagation();
    // Use pointer capture to ensure we follow the guide even if stylus moves fast
    if (e.target && 'setPointerCapture' in e.target) {
      e.target.setPointerCapture(e.pointerId);
    }
    setDraggingGuide(guide.id);
  }, []);

  const handleGuideMouseMove = React.useCallback((e) => {
    if (!draggingGuide) return;
    
    // Convert screen coordinates to canvas space
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const guide = guides.find(g => g.id === draggingGuide);
    if (!guide) return;

    let newPosition;
    if (guide.axis === 'y') {
      // Horizontal guide, driven by Y movement
      const y = e.clientY - canvasRect.top;
      newPosition = y / zoomLevel;
    } else {
      // Vertical guide, driven by X movement
      const x = e.clientX - canvasRect.left;
      newPosition = x / zoomLevel;
    }

    setGuides(prev => prev.map(g => g.id === draggingGuide ? { ...g, position: newPosition } : g));
  }, [draggingGuide, guides, zoomLevel, canvasRef, setGuides]);

  const handleGuideMouseUp = React.useCallback(() => {
    if (draggingGuide) {
      setDraggingGuide(null);
    }
  }, [draggingGuide]);

  // Add global pointer up listener for guide dragging (using PointerEvents for consistency)
  React.useEffect(() => {
    if (draggingGuide) {
      window.addEventListener('pointermove', handleGuideMouseMove);
      window.addEventListener('pointerup', handleGuideMouseUp);
      return () => {
        window.removeEventListener('pointermove', handleGuideMouseMove);
        window.removeEventListener('pointerup', handleGuideMouseUp);
      };
    }
  }, [draggingGuide, handleGuideMouseMove, handleGuideMouseUp]);


  const currentPageData = pages.find(p => p.id === currentPage);
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#ebedef] relative">
      <CanvasRulers 
        zoomLevel={zoomLevel} 
        canvasOffset={canvasOffset}
        canvasSize={canvasSize}
        scrollerRef={canvasContainerRef}
        showRulers={showRulers}
        onAddGuide={(guideParams) => {
          const newId = `guide-${Date.now()}`;
          setGuides(prev => [...prev, { id: newId, ...guideParams }]);
          setDraggingGuide(newId);
        }}
      />
      <div
        className={`canvas-workspace-scroller flex-1 overflow-y-auto overflow-x-hidden px-4 pt-24 ${showPagesStrip ? 'pb-40' : 'pb-10'}`}
        ref={canvasContainerRef}
        onPointerDown={handleContainerMouseDown}
      >
        {/* Wrapper to enforce correct scroll height based on zoom */}
        <div
          style={{
            height: (showPagesStrip || isVideoMode)
              ? `${(canvasSize.height + 40) * zoomLevel}px`
              : `${((pages.length * canvasSize.height + Math.max(0, pages.length - 1) * 16 + 40) * zoomLevel)}px`,
            width: '100%',
            position: 'relative',
            minHeight: '100%'
          }}
        >
          <div
            className="flex flex-col items-center gap-4 w-full absolute top-0 left-0"
            style={{
              transform: `scale(${zoomLevel}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
              transformOrigin: 'top center',
              paddingTop: '20px',
              paddingBottom: '20px',
              gap: (showPagesStrip || isVideoMode) ? '0' : `${60 / zoomLevel}px` // Dynamic gap to prevent header overlap when zoomed out
            }}
          >
            {(isVideoMode 
              ? pages.filter(p => p.id === currentPage) 
              : (showPagesStrip ? pages.filter(p => p.id === currentPage) : pages)
            ).map((page) => {
              const index = pages.findIndex(p => p.id === page.id);
              const isCurrentPage = page.id === currentPage;

              return (
                <div
                  key={isVideoMode ? 'video-viewport' : page.id}
                  className="relative flex flex-col items-center page-container"
                  style={{
                    width: '100%',
                    perspective: '1000px'
                  }}
                >
                  {/* Page Number Indicator (Canva style) — HIDDEN in Video Mode */}
                  {!isVideoMode && (
                  <div
                    className="flex items-center justify-between group/header"
                    style={{
                      // Apply inverse scaling to keep controls readable
                      transform: `scale(${1 / zoomLevel})`,
                      // Scale from center so it stays centered relative to the page
                      transformOrigin: 'center center',
                      width: 'fit-content',
                      // Ensure it's at least as wide as the visual canvas, so text/buttons align with canvas edges
                      minWidth: `${canvasSize.width * zoomLevel}px`,
                      marginBottom: `${16 / zoomLevel}px`,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-800">
                        {index + 1}
                      </span>
                      {editingPageId === page.id ? (
                        <input
                          autoFocus
                          type="text"
                          className="bg-white border-b-2 border-purple-500 outline-none text-sm font-medium py-0.5 px-1 min-w-[150px]"
                          value={pageTitleValue}
                          onChange={(e) => setPageTitleValue(e.target.value)}
                          onBlur={() => handlePageTitleBlur(page.id)}
                          onKeyDown={(e) => handlePageTitleKeyDown(e, page.id)}
                        />
                      ) : (
                        <span
                          className="text-sm font-medium text-gray-500 hover:text-gray-800 cursor-text transition-colors"
                          onClick={() => handlePageTitleClick(page)}
                        >
                          {page.name || `Add page title`}
                        </span>
                      )}
                    </div>

                    <div className={`flex items-center gap-1 transition-opacity ${isCurrentPage ? 'opacity-100' : 'opacity-0 group-hover/header:opacity-100'}`}>
                      <button
                        onClick={() => movePage && movePage(page.id, 'up')}
                        disabled={index === 0}
                        className="p-1 px-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-600"
                        title="Move up"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button
                        onClick={() => movePage && movePage(page.id, 'down')}
                        disabled={index === pages.length - 1}
                        className="p-1 px-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-600"
                        title="Move down"
                      >
                        <ChevronDown size={18} />
                      </button>
                      <div className="w-px h-4 bg-gray-300 mx-1" />
                      <button
                        className="p-1 px-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"
                        title="Hide page (Preview only)"
                      >
                        <Eye size={16} className="opacity-60" />
                      </button>
                      <button
                        onClick={() => duplicatePage && duplicatePage(page.id)}
                        className="p-1 px-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"
                        title="Duplicate page"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => deletePage && deletePage(page.id)}
                        disabled={pages.length <= 1}
                        className="p-1 px-1.5 rounded hover:bg-red-50 hover:text-red-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-600"
                        title="Delete page"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={addNewPage}
                        className="p-1 px-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"
                        title="Add page"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                  )}

                  <div style={{ position: 'relative', width: canvasSize.width, height: canvasSize.height, flexShrink: 0 }}>
                    <div
                      className={`page-paper bg-white shadow-xl transition-all duration-200 ${isCurrentPage ? 'ring-[3px] ring-purple-500 ring-offset-4' : 'hover:ring-2 hover:ring-purple-200'}`}
                      data-page-id={page.id}
                      style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        background: page.backgroundGradient
                          ? getBackgroundStyle({ fillType: 'gradient', gradient: page.backgroundGradient })
                          : (page.backgroundColor || 'white'),
                        boxShadow: isCurrentPage ? '0 25px 60px rgba(0, 0, 0, 0.2)' : '0 10px 40px rgba(0, 0, 0, 0.1)',
                        touchAction: 'none',
                        overflow: 'hidden',
                        outline: (isCurrentPage && canvasHighlighted) ? `3px solid #8b3dffaa` : 'none',
                        outlineOffset: `-3px`,
                        cursor: 'default'
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                      if (setCurrentPage && currentPage !== page.id) setCurrentPage(page.id);
                      if (handleCanvasMouseDown) handleCanvasMouseDown(e, page.id);
                    }}
                    onPointerMove={handleMouseMoveCallback}
                    onPointerUp={handlePointerUp}
                    onMouseEnter={handleCanvasMouseEnter}
                    onMouseLeave={handleCanvasMouseLeave}
                    onWheel={handleWheel}
                    // Attach ref only to current page to keep coordinate math consistent for now
                    // This is a trade-off: coordinate math in MainPage/Interaction hook might need to be page-aware
                    ref={isCurrentPage ? canvasRef : null}
                  >
                    {/* Grid (only on current page or all?) */}
                    {showGrid && isCurrentPage && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundSize: '20px 20px',
                          backgroundImage: 'linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)',
                          pointerEvents: 'none'
                        }}
                      />
                    )}

                    {/* Margins */}
                    {showMargins && isCurrentPage && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '48px',
                          left: '48px',
                          right: '48px',
                          bottom: '48px',
                          border: '1px dashed #718096',
                          pointerEvents: 'none',
                          zIndex: 9999
                        }}
                      />
                    )}


                    {/* Render Elements for this page */}
                    {(isCurrentPage ? getCurrentPageElements() : (page.elements || []))
                      .filter(el => !el.groupId && el.type !== 'audio')
                      .map(el => renderElement(el, page.id, { currentTime, isPlaying, pages }))}

                    {/* Render Drawing Path (only on active page) */}

                    {/* Alignment Lines (only on active page) */}
                    {isCurrentPage && showAlignmentLines && (
                      <>
                        {alignmentLines.vertical.map((x, i) => (
                          <div
                            key={`v-${i}`}
                            style={{
                              position: 'absolute',
                              left: x,
                              top: 0,
                              width: Math.max(1, 1 / zoomLevel),
                              height: '100%',
                              backgroundColor: '#cb0ee4ff',
                              pointerEvents: 'none',
                              zIndex: 10000
                            }}
                          />
                        ))}
                        {alignmentLines.horizontal.map((y, i) => (
                          <div
                            key={`h-${i}`}
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: y,
                              width: '100%',
                              height: Math.max(1, 1 / zoomLevel),
                              backgroundColor: '#cb0ee4ff',
                              pointerEvents: 'none',
                              zIndex: 10000
                            }}
                          />
                        ))}
                      </>
                    )}

                    {/* Measurement Guides (NEW) */}
                    {isCurrentPage && measurements && measurements.map((m, i) => (
                      <React.Fragment key={`measure-${i}`}>
                        {/* Line */}
                        <div
                          style={{
                            position: 'absolute',
                            left: m.orientation === 'horizontal' ? m.x : m.x,
                            top: m.orientation === 'vertical' ? m.y : m.y,
                            width: m.orientation === 'horizontal' ? m.length : Math.max(1, 1 / zoomLevel),
                            height: m.orientation === 'vertical' ? m.length : Math.max(1, 1 / zoomLevel),
                            backgroundColor: '#ff0055', // Red/Pink like Canva
                            pointerEvents: 'none',
                            zIndex: 10001
                          }}
                        />
                        {/* Start T-Bar */}
                        <div
                          style={{
                            position: 'absolute',
                            left: m.orientation === 'horizontal' ? m.x : m.x - 4,
                            top: m.orientation === 'vertical' ? m.y : m.y - 4,
                            width: m.orientation === 'horizontal' ? Math.max(1, 1 / zoomLevel) : 8,
                            height: m.orientation === 'vertical' ? Math.max(1, 1 / zoomLevel) : 8,
                            backgroundColor: '#ff0055',
                            zIndex: 10001
                          }}
                        />
                        {/* End T-Bar */}
                        <div
                          style={{
                            position: 'absolute',
                            left: m.orientation === 'horizontal' ? m.x + m.length : m.x - 4,
                            top: m.orientation === 'vertical' ? m.y + m.length : m.y - 4,
                            width: m.orientation === 'horizontal' ? Math.max(1, 1 / zoomLevel) : 8,
                            height: m.orientation === 'vertical' ? Math.max(1, 1 / zoomLevel) : 8,
                            backgroundColor: '#ff0055',
                            zIndex: 10001
                          }}
                        />

                        {/* Label */}
                        <div
                          style={{
                            position: 'absolute',
                            left: m.orientation === 'horizontal' ? m.x + m.length / 2 : m.x,
                            top: m.orientation === 'vertical' ? m.y + m.length / 2 : m.y,
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: '#ff0055',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            zIndex: 10002,
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {m.value}
                        </div>
                      </React.Fragment>
                    ))}


                    </div>
                    {/* End of page-paper */}

                    {/* Infinitely spanning Guides Overlay */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10000, overflow: 'visible' }}>
                      {guides.map((guide) => (
                        <div
                          key={guide.id}
                          onPointerDown={(e) => handleGuideMouseDown(e, guide)}
                          className="group"
                          style={{
                            position: 'absolute',
                            left: guide.axis === 'x' ? guide.position - 5 : 0,
                            top: guide.axis === 'y' ? guide.position - 5 : 0,
                            width: guide.axis === 'y' ? '100%' : 10,
                            height: guide.axis === 'x' ? '100%' : 10,
                            cursor: guide.axis === 'y' ? 'ns-resize' : 'ew-resize',
                            pointerEvents: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {/* Actual visible line */}
                          <div style={{
                            width: guide.axis === 'y' ? '100%' : `${Math.max(1, 1 / zoomLevel)}px`,
                            height: guide.axis === 'x' ? '100%' : `${Math.max(1, 1 / zoomLevel)}px`,
                            backgroundColor: '#ff00ff',
                            boxShadow: guide.axis === 'y' ? '10000px 0 0 0 #ff00ff, -10000px 0 0 0 #ff00ff' : '0 10000px 0 0 #ff00ff, 0 -10000px 0 0 #ff00ff'
                          }} />
                          
                          <div 
                            className={`absolute bg-[#ff00ff] text-white text-[10px] px-1.5 py-0.5 rounded font-bold transition-opacity shadow-sm ${draggingGuide === guide.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} 
                            style={{
                              left: guide.axis === 'x' ? '10px' : '50%',
                              top: guide.axis === 'y' ? '10px' : '50%',
                              pointerEvents: 'none',
                              transform: `scale(${1 / zoomLevel}) translate(-50%, -50%)`,
                              transformOrigin: 'top left'
                            }}
                          >
                            {Math.round(guide.position)}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              );
            })}

            {/* Add Page Button Placeholder — HIDDEN in Video Mode */}
            {(!showPagesStrip && !isVideoMode) && (
              <div
                className="flex flex-col items-center mt-8"
                style={{
                  transform: `scale(${1 / zoomLevel})`,
                  transformOrigin: 'top center',
                  marginBottom: `${40 / zoomLevel}px` // Add some bottom margin that scales inversely to keep spacing consistent
                }}
              >
                <button
                  onClick={addNewPage}
                  className="group flex items-center justify-center gap-2 bg-[#f8f9fa] border border-[#dadce0] rounded-lg py-2 px-8 hover:bg-white hover:border-purple-300 transition-all font-semibold text-[#3c4043] hover:text-purple-600 shadow-sm hover:shadow"
                  style={{
                    width: '200px', // Fixed width, no longer dependent on canvas width
                    height: '44px'
                  }}
                >
                  <Plus size={18} />
                  <span>Add page</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar (Canva style) — HIDDEN IN VIDEO MODE */}
      {!isVideoMode && (
      <div className="h-10 border-t border-gray-200 bg-white flex items-center justify-between px-4 z-[1001]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNotesPanel(!showNotesPanel)}
            className={`flex items-center gap-1.5 p-1 px-2 rounded transition-colors text-xs font-medium ${showNotesPanel ? 'bg-purple-50 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <FileText size={14} />
            <span>Notes</span>
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className={`flex items-center gap-1 rounded border transition-all ${isTimerRunning ? 'bg-purple-50 border-purple-200 shadow-sm' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}>
            <button
              onClick={() => setShowTimerModal(true)}
              className={`flex items-center gap-1.5 p-1 px-2  text-xs font-medium ${isTimerRunning ? 'text-purple-600' : ''}`}
            >
              <Clock size={14} />
              <span>{timerSeconds > 0 ? `${Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:${(timerSeconds % 60).toString().padStart(2, '0')}` : 'Timer'}</span>
            </button>

            {isTimerRunning && (
              <div className="flex items-center gap-0.5 pr-1 animate-in fade-in slide-in-from-right-1 duration-300">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsTimerRunning(false); }}
                  className="p-1 hover:bg-purple-100 rounded text-purple-600"
                  title="Pause"
                >
                  <Pause size={12} fill="currentColor" />
                </button>
                {selectedMusicId && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsMusicMuted(!isMusicMuted); }}
                    className={`p-1 hover:bg-purple-100 rounded ${isMusicMuted ? 'text-red-500' : 'text-purple-600'}`}
                    title={isMusicMuted ? "Unmute" : "Mute"}
                  >
                    {isMusicMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  </button>
                )}
              </div>
            )}

            {!isTimerRunning && timerSeconds > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsTimerRunning(true); }}
                className="p-1 pr-2 hover:bg-gray-200 rounded text-gray-400"
                title="Resume"
              >
                <Play size={12} fill="currentColor" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.01"
              value={zoomLevel}
              onChange={(e) => setZoomLevel && setZoomLevel(parseFloat(e.target.value))}
              className="w-32 accent-purple-600 h-1"
            />
            <span className="text-xs font-medium text-gray-600 min-w-[35px]">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          <div className="w-px h-4 bg-gray-200" />

          {/* View Modes and Page Indicator */}
          <div className="flex items-center gap-2 text-gray-500">
            <button
              onClick={() => setShowPagesStrip(!showPagesStrip)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors hover:bg-gray-100 ${showPagesStrip ? 'bg-purple-50 text-purple-600' : 'text-gray-600'}`}
              title="Pages"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              <span className="text-[11px] font-bold">Pages</span>
            </button>

            <div className="text-[11px] font-bold text-gray-500 px-1">
              <span>{pages.findIndex(p => p.id === currentPage) + 1} / {pages.length}</span>
            </div>

            <button
              onClick={() => setShowGridView(true)}
              className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${showGridView ? 'text-purple-600' : 'text-gray-600'}`}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>

            <button className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600" title="Full screen">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            </button>

            <div className="w-px h-4 bg-gray-200 mx-1" />

            <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400" title="Help">
              <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center text-[9px] font-bold">?</div>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Overlays and Panels */}
      <NotesPanel
        isOpen={showNotesPanel}
        onClose={() => setShowNotesPanel(false)}
        page={currentPageData}
        onUpdateNotes={handleUpdateNotes}
      />

      <TimerModal
        isOpen={showTimerModal}
        onClose={() => setShowTimerModal(false)}
        time={timerSeconds}
        setTime={setTimerSeconds}
        isRunning={isTimerRunning}
        setIsRunning={setIsTimerRunning}
        selectedMusicId={selectedMusicId}
        onSelectMusic={setSelectedMusicId}
        musicTracks={musicTracks}
        isMusicMuted={isMusicMuted}
        setIsMusicMuted={setIsMusicMuted}
      />

      <GridView
        isOpen={showGridView}
        onClose={() => setShowGridView(false)}
        pages={pages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        addNewPage={addNewPage}
        renderElement={renderElement}
        canvasSize={canvasSize}
      />

      {showPagesStrip && (
        <PagesStrip
          pages={pages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          addNewPage={addNewPage}
          renderElement={renderElement}
          onClose={() => setShowPagesStrip(false)}
          canvasSize={canvasSize}
        />
      )}
    </div>
  );
};

export default CanvasWorkspace;
