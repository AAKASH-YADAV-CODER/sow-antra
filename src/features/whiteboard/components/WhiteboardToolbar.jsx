import React, { useState } from 'react';
import { MousePointer2, Hand, Pen, Square, Circle, Triangle, Diamond, Type, StickyNote, Undo, Redo, Trash2, Pencil, Paintbrush, Highlighter, Palette, Cloud, Droplet, Sparkles, Flame, Zap, Eraser, Grid, Wind, Layers, Stars, StretchHorizontal, Copy, Filter } from 'lucide-react';

const WhiteboardToolbar = ({ 
  tool, 
  setTool, 
  brushType,
  setBrushType,
  drawingProps, 
  setDrawingProps,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  selectedElementId,
  onDelete,
  smartShapesEnabled,
  setSmartShapesEnabled
}) => {
  const [showBrushMenu, setShowBrushMenu] = useState(false);

  const tools = [
    { id: 'select', icon: <MousePointer2 size={20} />, label: 'Select' },
    { id: 'pan', icon: <Hand size={20} />, label: 'Pan Canvas' },
    { id: 'pen', icon: <Pen size={20} />, label: 'Draw' },
    { id: 'eraser', icon: <Eraser size={20} />, label: 'Eraser' },
    { id: 'rect', icon: <Square size={20} />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle size={20} />, label: 'Circle' },
    { id: 'triangle', icon: <Triangle size={20} />, label: 'Triangle' },
    { id: 'diamond', icon: <Diamond size={20} />, label: 'Diamond' },
    { id: 'sticky', icon: <StickyNote size={20} />, label: 'Sticky Note' },
    { id: 'text', icon: <Type size={20} />, label: 'Text' },
  ];



  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex flex-col gap-2 z-40">
      {/* Undo / Redo */}
      <div className="flex flex-col gap-1 pb-2 border-b border-gray-100">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="w-12 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-30"
          title="Undo"
        >
          <Undo size={20} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="w-12 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-30"
          title="Redo"
        >
          <Redo size={20} />
        </button>
        <button
          onClick={() => setSmartShapesEnabled(!smartShapesEnabled)}
          className={`w-12 h-10 flex items-center justify-center rounded-xl transition-all ${
            smartShapesEnabled 
              ? 'bg-amber-100 text-amber-600 shadow-inner' 
              : 'text-gray-300 hover:bg-gray-50'
          }`}
          title={smartShapesEnabled ? "Disable Smart Shapes" : "Enable Smart Shapes"}
        >
          <Sparkles size={20} className={smartShapesEnabled ? 'animate-pulse' : ''} />
        </button>
      </div>

      {/* Main Tools */}
      <div className="flex flex-col gap-1 py-1">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTool(t.id);
              if (t.id === 'pen') setShowBrushMenu(!showBrushMenu);
              else setShowBrushMenu(false);
            }}
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all relative ${
              tool === t.id 
                ? 'bg-purple-100 text-[#8b3dff]' 
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
            title={t.label}
          >
            {t.icon}
            {t.id === 'pen' && (
              <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: drawingProps.stroke }} />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Brushes Sub-Menu (Pop-out) */}
      {showBrushMenu && (
        <div className="absolute left-16 top-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 p-4 flex flex-col gap-4 min-w-[280px] max-h-[80vh] overflow-hidden animate-in slide-in-from-left-2 duration-300 z-50">
           <div className="flex items-center justify-between px-1">
             <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Brush Library</h3>
             <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(139,61,255,0.6)]" />
           </div>

           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              {[
                {
                  name: 'Essentials',
                  brushes: [
                    { id: 'pen', icon: <Pen size={18} />, title: 'Pen' },
                    { id: 'pencil', icon: <Pencil size={18} />, title: 'Pencil' },
                    { id: 'marker', icon: <Paintbrush size={18} />, title: 'Marker' },
                    { id: 'highlighter', icon: <Highlighter size={18} />, title: 'Highlighter' },
                    { id: 'calligraphy', icon: <Type size={18} />, title: 'Chisel' },
                    { id: 'eraser', icon: <Eraser size={18} />, title: 'Eraser' },
                  ]
                },
                {
                  name: 'Artistic',
                  brushes: [
                    { id: 'brush', icon: <Paintbrush size={18} />, title: 'Oil Paint' },
                    { id: 'palette', icon: <Droplet size={18} />, title: 'Palette Knife' },
                    { id: 'watercolor', icon: <Droplet size={18} />, title: 'Watercolor' },
                    { id: 'charcoal', icon: <Flame size={18} />, title: 'Charcoal' },
                    { id: 'foliage', icon: <Layers size={18} />, title: 'Foliage' },
                    { id: 'cloud', icon: <Cloud size={18} />, title: 'Cloud' },
                    { id: 'ink', icon: <Pen size={18} />, title: 'Ink' },
                    { id: 'crayon', icon: <Palette size={18} />, title: 'Crayon' },
                  ]
                },
                {
                  name: 'Special FX',
                  brushes: [
                    { id: 'neon', icon: <Zap size={18} />, title: 'Neon' },
                    { id: 'spray', icon: <Zap size={18} />, title: 'Spray' },
                    { id: 'splatter', icon: <Sparkles size={18} />, title: 'Splatter' },
                    { id: 'airbrush', icon: <Cloud size={18} />, title: 'Airbrush' },
                    { id: 'pixel', icon: <Grid size={18} />, title: 'Pixel' },
                    { id: 'texture', icon: <Layers size={18} />, title: 'Texture' },
                  ]
                },
                {
                  name: 'Advanced',
                  brushes: [
                    { id: 'particle', icon: <Stars size={18} />, title: 'Particle' },
                    { id: 'smudge', icon: <Wind size={18} />, title: 'Smudge' },
                    { id: 'hair', icon: <StretchHorizontal size={18} />, title: 'Hair' },
                    { id: 'clone', icon: <Copy size={18} />, title: 'Clone' },
                    { id: 'filter', icon: <Filter size={18} />, title: 'Filter' },
                    { id: 'fill', icon: <Palette size={18} />, title: 'Fill' },
                  ]
                }
              ].map(category => (
                <div key={category.name} className="space-y-2">
                  <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter px-1 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gray-200" />
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {category.brushes.map(b => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setBrushType(b.id);
                          setShowBrushMenu(false);
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 group ${
                          brushType === b.id 
                            ? 'bg-purple-50 border-purple-200 text-purple-600 shadow-sm scale-95' 
                            : 'border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600 hover:border-gray-100'
                        }`}
                        title={b.title}
                      >
                        <div className={`transition-transform duration-300 ${brushType === b.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                          {b.icon}
                        </div>
                        <span className="text-[9px] mt-1 font-medium truncate w-full text-center">{b.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Global Actions targeting selection */}
      {selectedElementId && (
        <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
          <button
            onClick={() => onDelete(selectedElementId)}
            className="w-12 h-12 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
            title="Delete Selected"
          >
            <Trash2 size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default WhiteboardToolbar;
