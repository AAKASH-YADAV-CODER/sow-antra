import React, { useState } from 'react';
import { Minus, Plus, Palette } from 'lucide-react';
import ColorWheel from './ColorWheel';

const WhiteboardPropertyPanel = ({ 
  tool, 
  brushType, 
  drawingProps, 
  setDrawingProps 
}) => {
  const [showColorWheel, setShowColorWheel] = useState(false);
  const [showFillColorWheel, setShowFillColorWheel] = useState(false);
  if (tool === 'select' || tool === 'pan') return null;

  const colors = ['#000000', '#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#FFFFFF'];
  const stickyColors = ['#FFF9B1', '#FFB1B1', '#B1FFC8', '#B1E3FF', '#E4B1FF'];

  const showStroke = ['pen', 'rect', 'circle', 'triangle', 'diamond', 'text'].includes(tool);
  const showFill = ['rect', 'circle', 'triangle', 'diamond', 'sticky'].includes(tool);
  const showSize = ['pen', 'eraser', 'rect', 'circle', 'triangle', 'diamond', 'text'].includes(tool);

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-3 flex items-center gap-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      
      {/* Size Control */}
      {showSize && (
        <div className="flex items-center gap-3 border-r border-gray-100 pr-6">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Size</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setDrawingProps(p => ({ ...p, strokeWidth: Math.max(1, p.strokeWidth - 2) }))}
              className="p-1 hover:bg-gray-100 rounded-md text-gray-400"
            >
              <Minus size={14} />
            </button>
            <div className="relative group w-32 h-6 flex items-center">
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={drawingProps.strokeWidth}
                onChange={(e) => setDrawingProps(p => ({ ...p, strokeWidth: parseInt(e.target.value) }))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {drawingProps.strokeWidth}px
              </span>
            </div>
            <button 
              onClick={() => setDrawingProps(p => ({ ...p, strokeWidth: Math.min(100, p.strokeWidth + 2) }))}
              className="p-1 hover:bg-gray-100 rounded-md text-gray-400"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Opacity Control */}
      {showSize && (
        <div className="flex items-center gap-3 border-r border-gray-100 pr-6">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opacity</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setDrawingProps(p => ({ ...p, opacity: Math.max(0.1, (p.opacity || 1) - 0.1) }))}
              className="p-1 hover:bg-gray-100 rounded-md text-gray-400"
            >
              <Minus size={14} />
            </button>
            <div className="relative group w-24 h-6 flex items-center">
              <input 
                type="range" 
                min="0.1" 
                max="1" 
                step="0.05"
                value={drawingProps.opacity || 1}
                onChange={(e) => setDrawingProps(p => ({ ...p, opacity: parseFloat(e.target.value) }))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {Math.round((drawingProps.opacity || 1) * 100)}%
              </span>
            </div>
            <button 
              onClick={() => setDrawingProps(p => ({ ...p, opacity: Math.min(1, (p.opacity || 1) + 0.1) }))}
              className="p-1 hover:bg-gray-100 rounded-md text-gray-400"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Flow Control */}
      {tool === 'pen' && (
        <div className="flex items-center gap-3 border-r border-gray-100 pr-6">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Flow</span>
          <div className="flex items-center gap-2">
            <div className="relative group w-20 h-6 flex items-center">
              <input 
                type="range" 
                min="0.05" 
                max="1" 
                step="0.05"
                value={drawingProps.flow || 0.5}
                onChange={(e) => setDrawingProps(p => ({ ...p, flow: parseFloat(e.target.value) }))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {Math.round((drawingProps.flow || 0.5) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Jitter Control */}
      {tool === 'pen' && (
        <div className="flex items-center gap-3 border-r border-gray-100 pr-6">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Jitter</span>
          <div className="flex items-center gap-2">
            <div className="relative group w-20 h-6 flex items-center">
              <input 
                type="range" 
                min="0" 
                max="50" 
                step="1"
                value={drawingProps.jitter || 0}
                onChange={(e) => setDrawingProps(p => ({ ...p, jitter: parseInt(e.target.value) }))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {drawingProps.jitter || 0}px
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stroke Color */}
      {showStroke && tool !== 'eraser' && (
        <div className="flex items-center gap-3 border-r border-gray-100 pr-6">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stroke</span>
          <div className="flex items-center gap-1.5">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setDrawingProps(p => ({ ...p, stroke: color }))}
                className={`w-5 h-5 rounded-full border border-gray-100 transition-transform hover:scale-110 ${drawingProps.stroke === color ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
            
            {/* Advanced Color Wheel Toggle */}
            <button
              onClick={() => setShowColorWheel(!showColorWheel)}
              className={`relative w-6 h-6 flex items-center justify-center rounded-full cursor-pointer hover:scale-110 transition-all border border-white/20 ml-1 shadow-sm ${showColorWheel ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
              style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}
            >
              <Palette size={12} className="text-white drop-shadow-md" />
            </button>

            {showColorWheel && (
              <ColorWheel 
                color={drawingProps.stroke}
                onChange={(color) => setDrawingProps(p => ({ ...p, stroke: color }))}
                onClose={() => setShowColorWheel(false)}
              />
            )}
          </div>
        </div>
      )}

      {/* Fill Color */}
      {showFill && (
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fill</span>
          <div className="flex items-center gap-1.5">
            {(tool === 'sticky' ? stickyColors : colors).map(color => (
              <button
                key={color}
                onClick={() => setDrawingProps(p => ({ ...p, fill: color }))}
                className={`w-5 h-5 rounded hover:scale-110 transition-all ${drawingProps.fill === color ? 'ring-2 ring-purple-500 ring-offset-2' : 'border border-gray-100'}`}
                style={{ backgroundColor: color }}
              />
            ))}

            {/* Advanced Fill Color Wheel Toggle */}
            <button
              onClick={() => setShowFillColorWheel(!showFillColorWheel)}
              className={`relative w-6 h-6 flex items-center justify-center rounded-lg cursor-pointer hover:scale-110 transition-all border border-white/20 ml-1 shadow-sm ${showFillColorWheel ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
              style={{ background: 'conic-gradient(from 135deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
            >
              <Palette size={12} className="text-white drop-shadow-md" />
            </button>

            {showFillColorWheel && (
              <ColorWheel 
                color={drawingProps.fill || '#ffffff'}
                onChange={(color) => setDrawingProps(p => ({ ...p, fill: color }))}
                onClose={() => setShowFillColorWheel(false)}
              />
            )}
          </div>
        </div>
      )}

      {/* Brush Type Badge (Informational) */}
      {tool === 'pen' && (
        <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100 ml-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-tight">{brushType}</span>
        </div>
      )}
    </div>
  );
};

export default WhiteboardPropertyPanel;
