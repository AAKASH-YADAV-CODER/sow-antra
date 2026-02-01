import React from 'react';
import CanvasGrid from './CanvasGrid';

const Canvas = ({
  canvasContainerRef,
  canvasRef,
  canvasSize,
  zoomLevel,
  canvasOffset,
  handleCanvasMouseDown,
  handleCanvasMouseEnter,
  handleCanvasMouseLeave,
  showGrid,
  getCurrentPageElements,
  renderElement,
  renderDrawingPath,
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
              transition: 'transform 0.2s ease-out'
            }}
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseEnter={handleCanvasMouseEnter}
            onMouseLeave={handleCanvasMouseLeave}
          >
            <CanvasGrid 
              showGrid={showGrid}
              showAlignmentLines={showAlignmentLines}
              alignmentLines={alignmentLines}
            />
            
            {getCurrentPageElements().map(renderElement)}
            {renderDrawingPath()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Canvas;