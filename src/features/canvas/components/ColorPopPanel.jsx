import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Loader2, SlidersHorizontal, Wand2, Upload as UploadIcon, Check } from 'lucide-react';

export const ColorPopPanel = ({
    isOpen,
    onClose,
    selectedElement,
    selectedElementData,
    updateElement,
    addElement
}) => {
    const [originalSrc, setOriginalSrc] = useState(null);
    const [foregroundUrl, setForegroundUrl] = useState(null);
    const [previewSrc, setPreviewSrc] = useState(null);
    const [naturalSize, setNaturalSize] = useState({ width: 400, height: 400 }); // original image dims
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressStatus, setProgressStatus] = useState('');
    const [intensity, setIntensity] = useState(100);
    
    const fileInputRef = useRef(null);

    // If an image is selected on canvas, automatically load it
    useEffect(() => {
        if (selectedElementData && selectedElementData.type === 'image' && !originalSrc && !isProcessing) {
            handleImageSetup(selectedElementData.originalSrc || selectedElementData.src);
        }
    }, [selectedElementData]);

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            handleImageSetup(url);
        }
    };

    const handleImageSetup = async (srcUrl) => {
        setOriginalSrc(srcUrl);
        setPreviewSrc(srcUrl); // Initial preview before extraction
        setForegroundUrl(null);
        setIsProcessing(true);
        setProgressStatus('Initializing AI...');

        try {
            const { removeBackground } = await import('@imgly/background-removal');
            
            // Pre-process Image to Ensure Stable Resolution (max ~2000px)
            const img = new Image();
            img.crossOrigin = "Anonymous";
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = srcUrl;
            });

            let processSrc = srcUrl;
            // Always capture the true natural dimensions from the original image
            setNaturalSize({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });

            if (img.width > 2000 || img.height > 2000) {
                const canvas = document.createElement('canvas');
                const scale = Math.min(2000 / img.width, 2000 / img.height);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                processSrc = canvas.toDataURL('image/jpeg', 0.9);
            }

            setProgressStatus('Extracting foreground...');
            
            const blob = await removeBackground(processSrc, {
                model: 'isnet_fp16', 
                output: { format: 'image/png', quality: 1.0 },
                progress: (key, current, total) => {
                    const percent = Math.round((current / total) * 100);
                    setProgressStatus(`Scanning: ${percent}%`);
                }
            }).catch(async (e) => {
                console.warn("Pro model failed, using fallback", e);
                setProgressStatus('Standard AI fallback...');
                return await removeBackground(processSrc, { model: 'isnet' });
            });

            const fgUrl = URL.createObjectURL(blob);
            setForegroundUrl(fgUrl);

        } catch (error) {
            console.error('Color Pop AI Error:', error);
            alert('Failed to analyze image. Please try another one.');
            setOriginalSrc(null);
        } finally {
            setIsProcessing(false);
            setProgressStatus('');
        }
    };

    // Live Composite Effect when Slider changes or AI finishes
    useEffect(() => {
        if (!originalSrc || !foregroundUrl) return;

        const updateComposite = async () => {
            const originalImg = new Image();
            originalImg.crossOrigin = "Anonymous";
            originalImg.src = originalSrc;
            
            const fgImg = new Image();
            fgImg.src = foregroundUrl;

            await Promise.all([
                new Promise(r => originalImg.onload = r),
                new Promise(r => fgImg.onload = r)
            ]);

            // Always composite at the original natural resolution to avoid distortion
            const canvas = document.createElement('canvas');
            canvas.width = naturalSize.width;
            canvas.height = naturalSize.height;
            const ctx = canvas.getContext('2d');

            // Draw Background (Grayscale) — stretched to natural size
            ctx.filter = `grayscale(${intensity}%)`;
            ctx.drawImage(originalImg, 0, 0, naturalSize.width, naturalSize.height);
            
            // Draw Foreground (Original Colors) — stretched to natural size
            ctx.filter = 'none';
            ctx.drawImage(fgImg, 0, 0, naturalSize.width, naturalSize.height);

            setPreviewSrc(canvas.toDataURL('image/png', 1.0));
        };

        updateComposite();
    }, [originalSrc, foregroundUrl, intensity, naturalSize]);

    const handleAction = () => {
        if (!previewSrc) return;

        if (selectedElementData && selectedElementData.type === 'image') {
            // Update the existing selected element — preserve its current size
            updateElement(selectedElement, {
                src: previewSrc,
                originalSrc: originalSrc
            });
        } else {
            // Add as a new element using the image's actual natural dimensions.
            // Scale down proportionally if it's larger than 600px on either side.
            const MAX_SIZE = 600;
            const scale = Math.min(1, MAX_SIZE / naturalSize.width, MAX_SIZE / naturalSize.height);
            const finalWidth = Math.round(naturalSize.width * scale);
            const finalHeight = Math.round(naturalSize.height * scale);

            addElement('image', {
                src: previewSrc,
                width: finalWidth,
                height: finalHeight,
                originalSrc: originalSrc
            });
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="h-full flex flex-col bg-white animate-in fade-in duration-300">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-teal-600">
                        <Camera size={18} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">Color Pop</h2>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-900 shadow-sm">
                    <X size={18} />
                </button>
            </div>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 light-scrollbar space-y-6">
                
                {/* Upload or Preview Area */}
                {!originalSrc ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-teal-50 hover:border-teal-300 transition-colors cursor-pointer flex flex-col items-center justify-center p-6 text-center group"
                    >
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <UploadIcon size={24} className="text-teal-500" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">Upload Image</h3>
                        <p className="text-xs text-gray-500">Tap to upload a photo for AI processing.</p>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="w-full aspect-[4/3] rounded-xl bg-gray-200 overflow-hidden relative mb-3 cursor-pointer" onClick={() => !isProcessing && fileInputRef.current?.click()}>
                            <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
                            
                            {isProcessing && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                                    <Loader2 size={32} className="animate-spin text-teal-600 mb-3" />
                                    <span className="text-xs font-bold text-teal-800 uppercase tracking-widest">{progressStatus}</span>
                                </div>
                            )}

                            {!isProcessing && (
                                <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    <UploadIcon size={12} />
                                    Change Image
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 font-medium leading-relaxed">
                            {isProcessing ? "AI is isolating the subject..." : "Background has been perfectly separated from the main subject."}
                        </p>
                    </div>
                )}

                {/* Intensity Control */}
                <div className={`space-y-3 transition-opacity duration-300 ${(!originalSrc || isProcessing) ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <SlidersHorizontal size={14} className="text-teal-600" />
                            B&W Intensity
                        </label>
                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{intensity}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={intensity}
                        onChange={(e) => setIntensity(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                        <span>Original Colors</span>
                        <span>Full B&W</span>
                    </div>
                </div>

                {/* Action button */}
                <div className="pt-4 border-t border-gray-100">
                    <button
                        onClick={handleAction}
                        disabled={isProcessing || !originalSrc}
                        className={`w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            (isProcessing || !originalSrc)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-200 hover:-translate-y-0.5'
                        }`}
                    >
                        {!originalSrc ? (
                            "Upload an Image"
                        ) : isProcessing ? (
                            <>
                                <Wand2 size={18} className="animate-pulse" />
                                Processing AI...
                            </>
                        ) : (
                            <>
                                <Check size={18} />
                                {selectedElementData && selectedElementData.type === 'image' ? 'Update Image' : 'Add to Design'}
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ColorPopPanel;
