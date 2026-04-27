import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Loader2, Check, Palette, RotateCcw, Sliders, Image as ImageIcon, Zap, Droplets, Contrast as ContrastIcon, Sun } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   PREMIUM PRESETS
   ══════════════════════════════════════════════════════════════ */

const PREMIUM_PRESETS = [
  { id: 'cyberpunk', label: 'Cyber',   shadow: '#2e1065', highlight: '#22d3ee', contrast: 1.2, brightness: 1.0 },
  { id: 'lava',      label: 'Lava',    shadow: '#450a0a', highlight: '#facc15', contrast: 1.3, brightness: 0.9 },
  { id: 'deepsea',   label: 'Ocean',   shadow: '#0c4a6e', highlight: '#67e8f9', contrast: 1.1, brightness: 1.1 },
  { id: 'forest',    label: 'Leaf',    shadow: '#064e3b', highlight: '#86efac', contrast: 1.2, brightness: 1.0 },
  { id: 'sunset',    label: 'Sunset',  shadow: '#7c2d12', highlight: '#fdba74', contrast: 1.2, brightness: 1.0 },
  { id: 'nord',      label: 'Ice',     shadow: '#2e3440', highlight: '#88c0d0', contrast: 1.0, brightness: 1.1 },
  { id: 'vampire',   label: 'Blood',   shadow: '#111827', highlight: '#ef4444', contrast: 1.4, brightness: 0.8 },
  { id: 'mono',      label: 'Slate',   shadow: '#18181b', highlight: '#e4e4e7', contrast: 1.2, brightness: 1.0 },
];

/* ══════════════════════════════════════════════════════════════
   REFINED ALGORITHM
   ══════════════════════════════════════════════════════════════ */

function applyRefinedDuotone(data, shadows, highlights, intensity, contrast, brightness) {
  const i = intensity / 100;
  
  for (let idx = 0; idx < data.length; idx += 4) {
    const rOrig = data[idx], gOrig = data[idx + 1], bOrig = data[idx + 2];
    
    // 1. Grayscale + Brightness/Contrast
    let gray = (0.299 * rOrig + 0.587 * gOrig + 0.114 * bOrig);
    
    // Contrast adjustment: (gray - 128) * contrast + 128
    gray = ((gray - 128) * contrast + 128) * brightness;
    gray = Math.max(0, Math.min(255, gray));
    
    const ratio = gray / 255;

    // 2. Map to Duotone Colors
    const rNew = shadows[0] + (highlights[0] - shadows[0]) * ratio;
    const gNew = shadows[1] + (highlights[1] - shadows[1]) * ratio;
    const bNew = shadows[2] + (highlights[2] - shadows[2]) * ratio;

    // 3. Blend with original based on intensity
    data[idx]     = rOrig * (1 - i) + rNew * i;
    data[idx + 1] = gOrig * (1 - i) + gNew * i;
    data[idx + 2] = bOrig * (1 - i) + bNew * i;
  }
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */

const DuotonePanel = ({ isOpen, onClose, selectedElementData, addElement }) => {
  const [shadowColor, setShadowColor] = useState('#0f172a');
  const [highlightColor, setHighlightColor] = useState('#38bdf8');
  const [intensity, setIntensity] = useState(100);
  const [contrast, setContrast] = useState(1.2);
  const [brightness, setBrightness] = useState(1.0);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);

  // Load selection
  useEffect(() => {
    if (isOpen && selectedElementData?.type === 'image' && selectedElementData?.src) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setOriginalImage(img);
        setPreviewUrl(null);
      };
      img.src = selectedElementData.src;
    } else {
      setOriginalImage(null);
      setPreviewUrl(null);
    }
  }, [isOpen, selectedElementData]);

  // Real-time processing
  useEffect(() => {
    if (!originalImage) return;

    const process = () => {
      setIsProcessing(true);
      const canvas = document.createElement('canvas');
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(originalImage, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      applyRefinedDuotone(
        imageData.data, 
        hexToRgb(shadowColor), 
        hexToRgb(highlightColor), 
        intensity, 
        contrast, 
        brightness
      );
      ctx.putImageData(imageData, 0, 0);

      setPreviewUrl(canvas.toDataURL('image/png'));
      setIsProcessing(false);
    };

    const timer = setTimeout(process, 150);
    return () => clearTimeout(timer);
  }, [originalImage, shadowColor, highlightColor, intensity, contrast, brightness]);

  const handleApplyPreset = (p) => {
    setShadowColor(p.shadow);
    setHighlightColor(p.highlight);
    setContrast(p.contrast);
    setBrightness(p.brightness);
    setIntensity(100);
  };

  const handleAddToDesign = () => {
    if (!previewUrl) return;
    addElement('image', {
      src: previewUrl,
      width: selectedElementData.width,
      height: selectedElementData.height,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-white select-none overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="shrink-0 px-5 py-4 flex items-center justify-between bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100">
            <Palette size={20} color="#fff" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 tracking-tight">DUOTONE PRO</h3>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Premium Filters</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto light-scrollbar">
        {!originalImage ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-4">
            <div className="w-20 h-20 rounded-[2.5rem] bg-gray-50 flex items-center justify-center text-gray-200 border-2 border-dashed border-gray-100">
              <ImageIcon size={32} />
            </div>
            <div>
              <p className="text-sm font-black text-gray-800">Select an image</p>
              <p className="text-xs text-gray-400 mt-1 px-4">Click any image on the canvas to start applying duotone magic.</p>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-8">
            {/* Live Preview */}
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-50 shadow-2xl shadow-gray-100 border border-gray-100 group">
              {isProcessing && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm transition-all">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={24} className="text-emerald-600 animate-spin" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Rendering</span>
                  </div>
                </div>
              )}
              <img 
                src={previewUrl || selectedElementData.src} 
                alt="Preview" 
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full">
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Preview</span>
              </div>
            </div>

            {/* Colors Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-px flex-1 bg-gray-100" />
                <div className="flex items-center gap-2 px-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Color Map</span>
                  <button 
                    onClick={() => {
                      const temp = shadowColor;
                      setShadowColor(highlightColor);
                      setHighlightColor(temp);
                    }}
                    className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600 transition-all active:rotate-180 duration-500"
                    title="Swap Colors"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>
                <div className="h-px flex-1 bg-gray-100" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 space-y-3 hover:border-emerald-200 transition-colors">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Shadows</p>
                  <div className="relative flex justify-center">
                    <input 
                      type="color" 
                      value={shadowColor} 
                      onChange={(e) => setShadowColor(e.target.value)}
                      className="w-12 h-12 rounded-2xl cursor-pointer border-4 border-white shadow-lg bg-transparent"
                    />
                  </div>
                  <p className="text-[10px] font-mono font-black text-gray-500 text-center uppercase">{shadowColor}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 space-y-3 hover:border-emerald-200 transition-colors">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Highlights</p>
                  <div className="relative flex justify-center">
                    <input 
                      type="color" 
                      value={highlightColor} 
                      onChange={(e) => setHighlightColor(e.target.value)}
                      className="w-12 h-12 rounded-2xl cursor-pointer border-4 border-white shadow-lg bg-transparent"
                    />
                  </div>
                  <p className="text-[10px] font-mono font-black text-gray-500 text-center uppercase">{highlightColor}</p>
                </div>
              </div>
            </div>

            {/* Adjustment Sliders */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adjustments</span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              {/* Intensity */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Droplets size={14} className="text-emerald-500" />
                    <span className="text-xs font-black uppercase tracking-wide">Intensity</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{intensity}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={intensity} 
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-800">
                    <ContrastIcon size={14} className="text-teal-500" />
                    <span className="text-xs font-black uppercase tracking-wide">Contrast</span>
                  </div>
                  <span className="text-xs font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-lg">{contrast.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.5" max="2.0" step="0.1" value={contrast} 
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-teal-500 h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Brightness */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Sun size={14} className="text-amber-500" />
                    <span className="text-xs font-black uppercase tracking-wide">Brightness</span>
                  </div>
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">{brightness.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.5" max="1.5" step="0.1" value={brightness} 
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-4 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Premium Looks</span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {PREMIUM_PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleApplyPreset(p)}
                    className="flex flex-col items-center gap-2 group outline-none"
                  >
                    <div 
                      className="w-full aspect-square rounded-2xl border-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl shadow-lg relative overflow-hidden"
                      style={{ 
                        background: `linear-gradient(135deg, ${p.shadow} 0%, ${p.highlight} 100%)`,
                        borderColor: (shadowColor === p.shadow && highlightColor === p.highlight) ? '#10b981' : 'white'
                      }}
                    >
                      {(shadowColor === p.shadow && highlightColor === p.highlight) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 backdrop-blur-[1px]">
                          <Check size={16} color="#fff" strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter group-hover:text-gray-900 transition-colors">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {originalImage && (
        <div className="shrink-0 p-5 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <button
            onClick={handleAddToDesign}
            className="w-full py-4 rounded-[1.25rem] bg-emerald-600 text-white font-black text-sm shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-700 hover:shadow-emerald-200 transition-all active:scale-[0.97] group"
          >
            <Zap size={18} className="fill-white group-hover:animate-bounce" />
            APPLY TO CANVAS
          </button>
          <button 
            onClick={() => { setShadowColor('#0f172a'); setHighlightColor('#38bdf8'); setIntensity(100); setContrast(1.2); setBrightness(1.0); }}
            className="w-full mt-3 py-2 text-[10px] font-black text-gray-400 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 tracking-widest"
          >
            <RotateCcw size={12} /> RESET ALL
          </button>
        </div>
      )}
    </div>
  );
};

export default DuotonePanel;
