import React from 'react';

const CanvasGrid = ({ showGrid, showAlignmentLines, alignmentLines }) => {
  return (
    <>
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
    </>
  );
};

export default CanvasGrid;