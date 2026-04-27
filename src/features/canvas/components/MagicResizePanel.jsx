import React, { useState } from 'react';
import { X, Maximize2, Check, Copy, Layout, Smartphone, Tv, Instagram, Youtube, Facebook, Chrome } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   RESIZE PRESETS
   ══════════════════════════════════════════════════════════════ */

const RESIZE_PRESETS = [
  { id: 'insta_post',   label: 'Instagram Post',   w: 1080, h: 1080, icon: Instagram,  cat: 'Social' },
  { id: 'insta_story',  label: 'Instagram Story',  w: 1080, h: 1920, icon: Smartphone, cat: 'Social' },
  { id: 'fb_post',      label: 'Facebook Post',    w: 1200, h: 630,  icon: Facebook,   cat: 'Social' },
  { id: 'yt_thumb',     label: 'YouTube Thumb',    w: 1280, h: 720,  icon: Youtube,    cat: 'Social' },
  { id: 'yt_banner',    label: 'YouTube Banner',   w: 2560, h: 1440, icon: Tv,         cat: 'Social' },
  { id: 'a4_print',     label: 'A4 Document',      w: 2480, h: 3508, icon: Layout,     cat: 'Print' },
  { id: 'logo',         label: 'Logo',             w: 500,  h: 500,  icon: Chrome,     cat: 'Business' },
  { id: 'presentation', label: 'Presentation',     w: 1920, h: 1080, icon: Tv,         cat: 'Business' },
];

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */

const MagicResizePanel = ({ isOpen, onClose, canvasSize, setCanvasSize, pages, setPages, currentPage, updateElements }) => {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customSize, setCustomSize] = useState({ width: canvasSize.width, height: canvasSize.height });
  const [isCopying, setIsCopying] = useState(false);

  const handleResize = () => {
    const newW = selectedPreset ? selectedPreset.w : customSize.width;
    const newH = selectedPreset ? selectedPreset.h : customSize.height;

    const oldW = canvasSize.width;
    const oldH = canvasSize.height;

    // Calculate scale factors
    const scaleX = newW / oldW;
    const scaleY = newH / oldH;
    // Use uniform scaling (smaller of two) to keep things looking decent
    const scale = Math.min(scaleX, scaleY);

    const resizePageElements = (elements) => {
      return elements.map(el => ({
        ...el,
        x: el.x * scaleX,
        y: el.y * scaleY,
        width: el.width * scale,
        height: el.height * scale,
        // Scale font size for text
        ...(el.type === 'text' && { fontSize: (el.fontSize || 40) * scale }),
        // Scale stroke/border
        ...(el.strokeWidth && { strokeWidth: el.strokeWidth * scale }),
        ...(el.borderRadius && { borderRadius: el.borderRadius * scale })
      }));
    };

    if (isCopying) {
      // Create a copy of current page with new size and scaled elements
      const activePage = pages.find(p => p.id === currentPage);
      const newPageId = `page-${Date.now()}`;
      const newPage = {
        ...activePage,
        id: newPageId,
        name: `${activePage.name} (Resized)`,
        elements: resizePageElements(activePage.elements)
      };
      
      setPages([...pages, newPage]);
      // Note: canvasSize is global, so it affects all pages. 
      // If the app is designed for per-page sizing, this would be different.
      // In this codebase, canvasSize seems global.
      setCanvasSize({ width: newW, height: newH });
    } else {
      // Update current page elements
      const activePage = pages.find(p => p.id === currentPage);
      const updatedElements = resizePageElements(activePage.elements);
      
      setPages(prev => prev.map(p => 
        p.id === currentPage ? { ...p, elements: updatedElements } : p
      ));
      setCanvasSize({ width: newW, height: newH });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-white select-none">
      {/* Header */}
      <div className="shrink-0 px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
              <Maximize2 size={18} color="#fff" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 tracking-tight">MAGIC RESIZE</h3>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Pro Feature ✨</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white text-gray-400 hover:text-gray-700 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto light-scrollbar p-5 space-y-6">
        {/* Custom Input */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Custom Dimensions</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 ml-1">Width</label>
              <input 
                type="number" 
                value={customSize.width}
                onChange={(e) => { setSelectedPreset(null); setCustomSize({...customSize, width: parseInt(e.target.value) || 0}); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 ml-1">Height</label>
              <input 
                type="number" 
                value={customSize.height}
                onChange={(e) => { setSelectedPreset(null); setCustomSize({...customSize, height: parseInt(e.target.value) || 0}); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Copy Toggle */}
        <div 
          onClick={() => setIsCopying(!isCopying)}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${isCopying ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100 bg-gray-50'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCopying ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              <Copy size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900">Copy & Resize</p>
              <p className="text-[10px] text-gray-500">Create a new page with the new size</p>
            </div>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isCopying ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
            {isCopying && <Check size={12} color="#fff" strokeWidth={4} />}
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suggested Presets</p>
          <div className="grid grid-cols-1 gap-2">
            {RESIZE_PRESETS.map(preset => {
              const Icon = preset.icon;
              const isSelected = selectedPreset?.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(preset);
                    setCustomSize({ width: preset.w, height: preset.h });
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-gray-100 hover:border-indigo-200 bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-black text-gray-900">{preset.label}</p>
                      <p className="text-[10px] text-gray-400">{preset.w} × {preset.h} px</p>
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="text-indigo-600" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 p-5 border-t border-gray-100 bg-white">
        <button
          onClick={handleResize}
          disabled={!customSize.width || !customSize.height}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCopying ? 'Copy & Resize ✨' : 'Resize Design ✨'}
        </button>
      </div>
    </div>
  );
};

export default MagicResizePanel;
