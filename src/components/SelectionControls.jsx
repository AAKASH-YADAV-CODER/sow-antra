import React from 'react';

const SelectionControls = ({ 
  element, 
  handleMouseDown, 
  handles,
  connectionLineColor = '#ef4444', 
  handleColor = '#ffffff', 
  handleSize = 10,
  slotSize = 4,
  handleBorder = 2,
  handleBorderColor = '#ef4444'
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: -10,
        top: -10,
        width: element.width + 20,
        height: element.height + 20,
        pointerEvents: 'none',
        transform: `rotate(${element.rotation || 0}deg)`,
        zIndex: element.zIndex + 1000
      }}
    >
      {/* Selection border */}
      <div
        style={{
          position: 'absolute',
          left: 10,
          top: 10,
          width: element.width,
          height: element.height,
          border: `2px dashed ${connectionLineColor}`,
          borderRadius: '2px'
        }}
      />

      {/* Handles */}
      {handles.map((handle, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: handle.x + 10,
            top: handle.y + 10,
            width: handle.isSlot ? slotSize : handleSize,
            height: handle.isSlot ? slotSize : handleSize,
            backgroundColor: handle.isSlot ? connectionLineColor : handleColor,
            border: handle.isSlot ? 'none' : `${handleBorder}px solid ${handleBorderColor}`,
            borderRadius: handle.isSlot ? '1px' : '50%',
            cursor: handle.cursor,
            pointerEvents: 'auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
          onMouseDown={(e) => handleMouseDown(e, 'resize', handle.type)}
        />
      ))}

      {/* Rotate handle */}
      <div
        style={{
          position: 'absolute',
          top: -30,
          left: '50%',
          transform: 'translateX(-50%)',
          width: handleSize,
          height: handleSize,
          backgroundColor: '#ef4444',
          border: '2px solid #ffffff',
          borderRadius: '50%',
          cursor: 'grab',
          pointerEvents: 'auto',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'rotate')}
      />

      {/* Connection line to rotate handle */}
      <svg
        style={{
          position: 'absolute',
          top: -25,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 2,
          height: 15,
          pointerEvents: 'none'
        }}
      >
        <line x1="1" y1="0" x2="1" y2="15" stroke="#ef4444" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default SelectionControls;