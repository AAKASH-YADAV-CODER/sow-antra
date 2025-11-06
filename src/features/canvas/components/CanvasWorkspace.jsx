import React from 'react';

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
  handleCanvasMouseEnter,
  handleCanvasMouseLeave,
  
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
  renderDrawingPath,
  drawingPath,
  
  // Alignment lines
  showAlignmentLines,
  alignmentLines
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div 
        className="canvas-container"
        ref={canvasContainerRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          overflow: 'hidden',
          backgroundColor: '#f0f0f0',
          padding: '5px',
          width: '100%',
          height: '100%'
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%'
          }}
        >
          <div
            className="bg-white shadow-lg"
            style={{
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`,
              transform: `scale(${zoomLevel}) translate(${canvasOffset.x / zoomLevel}px, ${canvasOffset.y / zoomLevel}px)`,
              transformOrigin: 'center center',
              position: 'relative',
              backgroundColor: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s ease-out',
              touchAction: 'none'
            }}
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseEnter={handleCanvasMouseEnter}
            onMouseLeave={handleCanvasMouseLeave}
            onTouchStart={(e) => {
              if (e.touches.length === 2) {
                // Two-finger pinch to zoom
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const distance = Math.hypot(
                  touch2.clientX - touch1.clientX,
                  touch2.clientY - touch1.clientY
                );
                setTouchStartDistance(distance);
                setInitialZoomLevel(zoomLevel);
              } else if (e.touches.length === 1) {
                // Single touch - convert to mouse event for element interaction
                const touch = e.touches[0];
                const now = Date.now();
                
                // Detect double-tap to zoom
                if (now - lastTouchEnd < 300) {
                  e.preventDefault();
                  // Double tap detected - zoom in/out
                  if (zoomLevel > 1) {
                    zoom(1); // Reset zoom
                  } else {
                    zoom(1.5); // Zoom in
                  }
                  setLastTouchEnd(0);
                  return;
                }
                setLastTouchEnd(now);
                
                const mouseEvent = new MouseEvent('mousedown', {
                  clientX: touch.clientX,
                  clientY: touch.clientY,
                  bubbles: true
                });
                e.target.dispatchEvent(mouseEvent);
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 2) {
                // Pinch zoom
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const distance = Math.hypot(
                  touch2.clientX - touch1.clientX,
                  touch2.clientY - touch1.clientY
                );
                
                if (touchStartDistance > 0) {
                  const scale = distance / touchStartDistance;
                  const newZoom = Math.max(0.1, Math.min(5, initialZoomLevel * scale));
                  setZoomLevel(newZoom);
                }
              } else if (e.touches.length === 1) {
                // Single finger - pan or drag element
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousemove', {
                  clientX: touch.clientX,
                  clientY: touch.clientY,
                  bubbles: true
                });
                document.dispatchEvent(mouseEvent);
              }
            }}
            onTouchEnd={(e) => {
              if (e.touches.length === 0) {
                // All touches ended
                setTouchStartDistance(0);
                setInitialZoomLevel(zoomLevel);
                
                // Dispatch mouseup event
                const mouseEvent = new MouseEvent('mouseup', {
                  bubbles: true
                });
                document.dispatchEvent(mouseEvent);
              } else if (e.touches.length === 1) {
                // One finger still touching - reset pinch state
                setTouchStartDistance(0);
              }
            }}
          >
            {/* Grid */}
            {showGrid && (
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
            
            {/* Render Elements */}
            {getCurrentPageElements().map(renderElement)}
            
            {/* Render Drawing Path */}
            {renderDrawingPath(drawingPath)}
            
            {/* Alignment Lines */}
            {showAlignmentLines && (
              <>
                {alignmentLines.vertical.map((x, i) => (
                  <div
                    key={`v-${i}`}
                    style={{
                      position: 'absolute',
                      left: x,
                      top: 0,
                      width: 1,
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
                      height: 1,
                      backgroundColor: '#cb0ee4ff',
                      pointerEvents: 'none',
                      zIndex: 10000
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasWorkspace;
