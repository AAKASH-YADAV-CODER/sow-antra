import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Plus, RefreshCw } from 'lucide-react';

const RGBGlitchPanel = ({ isOpen, onClose, selectedElement, selectedElementData, updateElement, addElement }) => {
  const [shift, setShift] = useState(15);
  const [angle, setAngle] = useState(0);
  const [noise, setNoise] = useState(0.1);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  const applyGlitchEffect = React.useCallback(async () => {
    if (!selectedElementData?.src) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedElementData.src;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const outData = new Uint8ClampedArray(data);

      const rad = (angle * Math.PI) / 180;
      const offsetX = Math.cos(rad) * shift;
      const offsetY = Math.sin(rad) * shift;

      // RGB Shift Logic
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;

          // Target coordinates for Red shift
          const rx = Math.floor(x - offsetX);
          const ry = Math.floor(y - offsetY);

          // Target coordinates for Blue shift
          const bx = Math.floor(x + offsetX);
          const by = Math.floor(y + offsetY);

          if (rx >= 0 && rx < canvas.width && ry >= 0 && ry < canvas.height) {
            const rIdx = (ry * canvas.width + rx) * 4;
            outData[idx] = data[rIdx]; // Shift Red channel
          }

          if (bx >= 0 && bx < canvas.width && by >= 0 && by < canvas.height) {
            const bIdx = (by * canvas.width + bx) * 4;
            outData[idx + 2] = data[bIdx]; // Shift Blue channel
          }

          // Add Noise
          if (noise > 0) {
            const noiseVal = (Math.random() - 0.5) * noise * 255;
            outData[idx] = Math.min(255, Math.max(0, outData[idx] + noiseVal));
            outData[idx+1] = Math.min(255, Math.max(0, outData[idx+1] + noiseVal));
            outData[idx+2] = Math.min(255, Math.max(0, outData[idx+2] + noiseVal));
          }
        }
      }

      ctx.putImageData(new ImageData(outData, canvas.width, canvas.height), 0, 0);
      setPreviewUrl(canvas.toDataURL('image/png'));
      setIsProcessing(false);
    };
  }, [selectedElementData?.src, shift, angle, noise]);

  useEffect(() => {
    if (selectedElementData?.src) {
      applyGlitchEffect();
    }
  }, [selectedElementData?.src, applyGlitchEffect]);

  const handleAddToDesign = () => {
    if (!previewUrl) return;
    addElement('image', {
      src: previewUrl,
      width: selectedElementData.width,
      height: selectedElementData.height,
      name: 'RGB Glitch Image'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-white select-none">
      {/* Header */}
      <div className="shrink-0 px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 via-white to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-lg shadow-gray-200">
              <Zap size={18} color="#00f2ff" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 tracking-tight">MAGIC GLITCH</h3>
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Anaglyph Studio 🎬</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto light-scrollbar p-5 space-y-6">
        {/* Preview Area */}
        <div className="aspect-square w-full bg-gray-900 rounded-2xl overflow-hidden shadow-inner relative group border-4 border-black">
          {previewUrl ? (
            <img src={previewUrl} className="w-full h-full object-contain" alt="Glitch Preview" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
              <RefreshCw size={24} className="animate-spin text-gray-700" />
              <p className="text-[11px] font-bold uppercase tracking-wider">Analyzing Pixels...</p>
            </div>
          )}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Warp Settings</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* Shift Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-black text-gray-700 uppercase tracking-tight">Shift Offset</label>
              <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">{shift}px</span>
            </div>
            <input 
              type="range" min="0" max="100" value={shift}
              onChange={(e) => setShift(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Angle */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-black text-gray-700 uppercase tracking-tight">Rotation Angle</label>
              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">{angle}°</span>
            </div>
            <input 
              type="range" min="0" max="360" value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          {/* Noise */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-black text-gray-700 uppercase tracking-tight">Digital Noise</label>
              <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-md">{Math.round(noise * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01" value={noise}
              onChange={(e) => setNoise(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => { setShift(20); setAngle(0); setNoise(0.05); }}
            className="p-2.5 rounded-xl border border-gray-100 text-[10px] font-black uppercase hover:bg-red-50 hover:border-red-200 transition-all text-gray-600 hover:text-red-600"
          >
            Classic 3D
          </button>
          <button 
            onClick={() => { setShift(45); setAngle(45); setNoise(0.2); }}
            className="p-2.5 rounded-xl border border-gray-100 text-[10px] font-black uppercase hover:bg-blue-50 hover:border-blue-200 transition-all text-gray-600 hover:text-blue-600"
          >
            Cyber Glitch
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 p-5 border-t border-gray-100 bg-white">
        <button
          onClick={handleAddToDesign}
          disabled={!previewUrl || isProcessing}
          className="w-full py-4 rounded-2xl bg-black text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 hover:bg-gray-900 transition-all active:scale-[0.98] disabled:opacity-50 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus size={18} className="text-cyan-400" />
          <span>ADD TO DESIGN</span>
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default RGBGlitchPanel;
