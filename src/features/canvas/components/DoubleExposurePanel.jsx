import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Layers, Plus, Image as ImageIcon, RefreshCw, Check, ArrowLeftRight, UploadCloud } from 'lucide-react';

const DoubleExposurePanel = ({ isOpen, onClose, selectedElement, selectedElementData, addElement, uploads = [] }) => {
  const [baseImage, setBaseImage] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [blendMode, setBlendMode] = useState('screen');
  const [opacity, setOpacity] = useState(0.7);
  const [contrast, setContrast] = useState(1.2);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectingTarget, setSelectingTarget] = useState(null); // 'base' or 'overlay'
  const canvasRef = useRef(null);



  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  };

  const generateDoubleExposure = useCallback(async () => {
    if (!baseImage || !overlayImage) return;
    setIsProcessing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    try {
      const [img1, img2] = await Promise.all([
        loadImage(baseImage),
        loadImage(overlayImage)
      ]);

      canvas.width = img1.width;
      canvas.height = img1.height;

      // Base layer
      ctx.filter = `contrast(${contrast})`;
      ctx.drawImage(img1, 0, 0);

      // Overlay layer
      ctx.globalCompositeOperation = blendMode;
      ctx.globalAlpha = opacity;
      
      const scale = Math.max(canvas.width / img2.width, canvas.height / img2.height);
      const nw = img2.width * scale;
      const nh = img2.height * scale;
      const nx = (canvas.width - nw) / 2;
      const ny = (canvas.height - nh) / 2;
      
      ctx.drawImage(img2, nx, ny, nw, nh);
      setPreviewUrl(canvas.toDataURL('image/png'));
    } catch (err) {
      console.error("Double exposure failed", err);
    } finally {
      setIsProcessing(false);
    }
  }, [baseImage, overlayImage, blendMode, opacity, contrast]);

  useEffect(() => {
    if (selectedElementData?.src && !baseImage) {
      setBaseImage(selectedElementData.src);
    }
  }, [selectedElementData, baseImage]);

  useEffect(() => {
    if (baseImage && overlayImage) {
      generateDoubleExposure();
    }
  }, [baseImage, overlayImage, generateDoubleExposure]);

  const handleSwap = () => {
    const temp = baseImage;
    setBaseImage(overlayImage);
    setOverlayImage(temp);
  };

  const handleImagePick = (url) => {
    if (selectingTarget === 'base') setBaseImage(url);
    if (selectingTarget === 'overlay') setOverlayImage(url);
    setSelectingTarget(null);
  };

  const handleAddToDesign = () => {
    if (!previewUrl) return;
    addElement('image', {
      src: previewUrl,
      width: selectedElementData?.width || 500,
      height: selectedElementData?.height || 500,
      name: 'Double Exposure'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-white select-none">
      {/* Header */}
      <div className="shrink-0 px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
              <Layers size={18} color="#fff" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">Double Exposure</h3>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Master Blender ✨</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white text-gray-400 hover:text-gray-700 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto light-scrollbar p-5 space-y-6">
        {/* Preview Area */}
        <div className="aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 relative group flex items-center justify-center">
          {previewUrl ? (
            <img src={previewUrl} className="w-full h-full object-contain" alt="Double Exposure Preview" />
          ) : (
            <div className="text-center p-6">
              <ImageIcon size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select images to blend</p>
            </div>
          )}
          {isProcessing && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <RefreshCw size={24} className="animate-spin text-indigo-600" />
            </div>
          )}
        </div>

        {/* Dual Selection Grid */}
        <div className="relative flex items-center gap-3">
          {/* Base Image Slot */}
          <div 
            onClick={() => setSelectingTarget('base')}
            className={`flex-1 group cursor-pointer transition-all ${selectingTarget === 'base' ? 'ring-2 ring-indigo-500 scale-[1.02]' : ''}`}
          >
            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 text-center">Subject</p>
            <div className="aspect-video bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-100 relative shadow-sm group-hover:border-indigo-200">
              {baseImage ? (
                <>
                  <img src={baseImage} className="w-full h-full object-cover" alt="Base" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[10px] font-black text-white uppercase">Change</span>
                  </div>
                </>
              ) : (
                <Plus size={20} className="absolute inset-0 m-auto text-gray-400" />
              )}
            </div>
          </div>

          {/* Swap Button */}
          <button 
            onClick={handleSwap}
            className="w-10 h-10 mt-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all active:scale-90 z-10 shadow-sm"
            title="Swap Images"
          >
            <ArrowLeftRight size={18} />
          </button>

          {/* Overlay Image Slot */}
          <div 
            onClick={() => setSelectingTarget('overlay')}
            className={`flex-1 group cursor-pointer transition-all ${selectingTarget === 'overlay' ? 'ring-2 ring-indigo-500 scale-[1.02]' : ''}`}
          >
            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 text-center">Texture</p>
            <div className="aspect-video bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-100 relative shadow-sm group-hover:border-indigo-200">
              {overlayImage ? (
                <>
                  <img src={overlayImage} className="w-full h-full object-cover" alt="Overlay" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[10px] font-black text-white uppercase">Change</span>
                  </div>
                </>
              ) : (
                <Plus size={20} className="absolute inset-0 m-auto text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Gallery / Selection View */}
        {selectingTarget && (
          <div className="bg-gray-50 rounded-2xl p-4 border border-indigo-100 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black text-indigo-600 uppercase">Select {selectingTarget === 'base' ? 'Subject' : 'Texture'}</span>
              <button onClick={() => setSelectingTarget(null)} className="p-1 hover:bg-white rounded-full text-gray-400"><X size={14} /></button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto light-scrollbar pr-1">
              {/* User Uploads */}
              {uploads.length > 0 ? (
                uploads.map((file, i) => (
                  <div key={`upload-${i}`} onClick={() => handleImagePick(file.url)} className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity">
                    <img src={file.url} className="w-full h-full object-cover" alt="Upload" />
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-4 text-center">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">No uploads found</p>
                </div>
              )}
              {/* Upload New Button */}
              <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-white hover:border-indigo-400 transition-colors">
                <UploadCloud size={16} className="text-gray-400" />
                <span className="text-[9px] font-bold text-gray-400 uppercase">Upload</span>
              </div>
            </div>
          </div>
        )}

        {/* Adjustments (Visible only when both images selected) */}
        {!selectingTarget && baseImage && overlayImage && (
          <div className="space-y-5 animate-in fade-in duration-500">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adjustments</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-700 uppercase">Blend Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {['screen', 'multiply', 'overlay', 'lighten', 'color-dodge'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setBlendMode(mode)}
                    className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${blendMode === mode ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {mode.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[11px] font-black text-gray-700 uppercase">Texture Intensity</label>
                  <span className="text-[10px] font-bold text-indigo-600">{Math.round(opacity * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01" value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[11px] font-black text-gray-700 uppercase">Subject Contrast</label>
                  <span className="text-[10px] font-bold text-indigo-600">{contrast}x</span>
                </div>
                <input 
                  type="range" min="0.5" max="3" step="0.1" value={contrast}
                  onChange={(e) => setContrast(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 p-5 border-t border-gray-100 bg-white">
        <button
          onClick={handleAddToDesign}
          disabled={!previewUrl || isProcessing}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Check size={18} />
          <span>ADD TO DESIGN</span>
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default DoubleExposurePanel;
