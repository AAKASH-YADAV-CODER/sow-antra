import React from 'react';
import { Trash2, Copy, RotateCw } from 'lucide-react';

const SelectionHandles = ({
  selectedElement,
  selectedElementData,
  zoom,
  canvasOffset,
  onResizeStart,
  onRotateStart,
  onDeleteElement,
  onDuplicateElement,
}) => {
  if (!selectedElement || !selectedElementData) return null;

  const { x, y, width, height, rotation = 0 } = selectedElementData;
  
  // Apply zoom and offset transformations
  const scaledX = x * zoom + canvasOffset.x;
  const scaledY = y * zoom + canvasOffset.y;
  const scaledWidth = width * zoom;
  const scaledHeight = height * zoom;

  // Calculate handle positions
  const centerX = scaledX + scaledWidth / 2;
  const centerY = scaledY + scaledHeight / 2;

  // Handle size responsive to zoom but minimum size for touch
  const handleSize = Math.max(12, 8 / zoom);
  const cornerHandleSize = Math.max(14, 10 / zoom);
  const buttonSize = Math.max(32, 24 / zoom);

  // Convert rotation to radians
  const rotRad = (rotation * Math.PI) / 180;

  // Helper function to rotate a point around center
  const rotatePoint = (px, py) => {
    const cos = Math.cos(rotRad);
    const sin = Math.sin(rotRad);
    const dx = px - centerX;
    const dy = py - centerY;
    return {
      x: centerX + dx * cos - dy * sin,
      y: centerY + dx * sin + dy * cos,
    };
  };

  // Calculate corner positions before rotation
  const corners = {
    tl: { x: scaledX, y: scaledY },
    tr: { x: scaledX + scaledWidth, y: scaledY },
    bl: { x: scaledX, y: scaledY + scaledHeight },
    br: { x: scaledX + scaledWidth, y: scaledY + scaledHeight },
  };

  // Calculate edge midpoints before rotation
  const edges = {
    t: { x: centerX, y: scaledY },
    r: { x: scaledX + scaledWidth, y: centerY },
    b: { x: centerX, y: scaledY + scaledHeight },
    l: { x: scaledX, y: centerY },
  };

  // Apply rotation to all points
  const rotatedCorners = {
    tl: rotatePoint(corners.tl.x, corners.tl.y),
    tr: rotatePoint(corners.tr.x, corners.tr.y),
    bl: rotatePoint(corners.bl.x, corners.bl.y),
    br: rotatePoint(corners.br.x, corners.br.y),
  };

  const rotatedEdges = {
    t: rotatePoint(edges.t.x, edges.t.y),
    r: rotatePoint(edges.r.x, edges.r.y),
    b: rotatePoint(edges.b.x, edges.b.y),
    l: rotatePoint(edges.l.x, edges.l.y),
  };

  // Rotation handle position (above top edge)
  const rotationHandleDistance = 30;
  const rotationHandle = rotatePoint(centerX, scaledY - rotationHandleDistance);

  // Action buttons position (above element)
  const actionButtonsY = Math.min(scaledY, rotatedCorners.tl.y, rotatedCorners.tr.y) - buttonSize - 8;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Selection Box */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: 'visible' }}
      >
        {/* Bounding box */}
        <polygon
          points={`${rotatedCorners.tl.x},${rotatedCorners.tl.y} ${rotatedCorners.tr.x},${rotatedCorners.tr.y} ${rotatedCorners.br.x},${rotatedCorners.br.y} ${rotatedCorners.bl.x},${rotatedCorners.bl.y}`}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2 / zoom}
          strokeDasharray={`${4 / zoom},${4 / zoom}`}
        />

        {/* Corner resize handles */}
        {['tl', 'tr', 'bl', 'br'].map((corner) => (
          <circle
            key={corner}
            cx={rotatedCorners[corner].x}
            cy={rotatedCorners[corner].y}
            r={cornerHandleSize / 2}
            fill="white"
            stroke="#3b82f6"
            strokeWidth={2 / zoom}
            className="pointer-events-auto cursor-nwse-resize"
            style={{ 
              cursor: corner === 'tl' || corner === 'br' ? 'nwse-resize' : 'nesw-resize',
            }}
            onMouseDown={(e) => onResizeStart(e, corner)}
            onTouchStart={(e) => onResizeStart(e, corner)}
          />
        ))}

        {/* Edge resize handles */}
        {['t', 'r', 'b', 'l'].map((edge) => (
          <circle
            key={edge}
            cx={rotatedEdges[edge].x}
            cy={rotatedEdges[edge].y}
            r={handleSize / 2}
            fill="white"
            stroke="#3b82f6"
            strokeWidth={2 / zoom}
            className="pointer-events-auto"
            style={{ 
              cursor: edge === 't' || edge === 'b' ? 'ns-resize' : 'ew-resize',
            }}
            onMouseDown={(e) => onResizeStart(e, edge)}
            onTouchStart={(e) => onResizeStart(e, edge)}
          />
        ))}

        {/* Rotation handle */}
        <g
          className="pointer-events-auto cursor-grab active:cursor-grabbing"
          onMouseDown={onRotateStart}
          onTouchStart={onRotateStart}
        >
          <line
            x1={centerX}
            y1={Math.min(scaledY, rotatedCorners.tl.y, rotatedCorners.tr.y)}
            x2={rotationHandle.x}
            y2={rotationHandle.y}
            stroke="#3b82f6"
            strokeWidth={1.5 / zoom}
            strokeDasharray={`${3 / zoom},${3 / zoom}`}
          />
          <circle
            cx={rotationHandle.x}
            cy={rotationHandle.y}
            r={cornerHandleSize / 2}
            fill="white"
            stroke="#3b82f6"
            strokeWidth={2 / zoom}
          />
          <circle
            cx={rotationHandle.x}
            cy={rotationHandle.y}
            r={cornerHandleSize / 4}
            fill="#3b82f6"
          />
        </g>
      </svg>

      {/* Action buttons */}
      <div
        className="absolute flex gap-2 pointer-events-auto
                   md:gap-2 sm:gap-1"
        style={{
          left: centerX - buttonSize * 1.5 - 4,
          top: actionButtonsY,
          transform: 'translateY(-100%)',
        }}
      >
        {/* Duplicate */}
        <button
          onClick={onDuplicateElement}
          className="bg-white hover:bg-blue-50 border-2 border-blue-500 rounded-lg 
                     flex items-center justify-center transition-colors shadow-lg
                     md:w-8 md:h-8 sm:w-7 sm:h-7"
          style={{ width: buttonSize, height: buttonSize }}
          aria-label="Duplicate"
          title="Duplicate"
        >
          <Copy className="text-blue-500 md:w-4 md:h-4 sm:w-3.5 sm:h-3.5" size={16} />
        </button>

        {/* Rotate 90° */}
        <button
          onClick={() => {
            const newRotation = ((selectedElementData.rotation || 0) + 90) % 360;
            onResizeStart({ preventDefault: () => {} }, 'rotate90', newRotation);
          }}
          className="bg-white hover:bg-green-50 border-2 border-green-500 rounded-lg 
                     flex items-center justify-center transition-colors shadow-lg
                     md:w-8 md:h-8 sm:w-7 sm:h-7"
          style={{ width: buttonSize, height: buttonSize }}
          aria-label="Rotate 90°"
          title="Rotate 90°"
        >
          <RotateCw className="text-green-500 md:w-4 md:h-4 sm:w-3.5 sm:h-3.5" size={16} />
        </button>

        {/* Delete */}
        <button
          onClick={onDeleteElement}
          className="bg-white hover:bg-red-50 border-2 border-red-500 rounded-lg 
                     flex items-center justify-center transition-colors shadow-lg
                     md:w-8 md:h-8 sm:w-7 sm:h-7"
          style={{ width: buttonSize, height: buttonSize }}
          aria-label="Delete"
          title="Delete"
        >
          <Trash2 className="text-red-500 md:w-4 md:h-4 sm:w-3.5 sm:h-3.5" size={16} />
        </button>
      </div>

      {/* Size display */}
      <div
        className="absolute bg-blue-500 text-white text-xs px-2 py-1 rounded pointer-events-none
                   md:text-sm md:px-2 md:py-1 sm:text-xs sm:px-1.5 sm:py-0.5"
        style={{
          left: centerX,
          top: Math.max(scaledY, rotatedCorners.bl.y, rotatedCorners.br.y) + 8,
          transform: 'translateX(-50%)',
        }}
      >
        {Math.round(width)} × {Math.round(height)}
        {rotation !== 0 && ` · ${Math.round(rotation)}°`}
      </div>
    </div>
  );
};

export default SelectionHandles;
