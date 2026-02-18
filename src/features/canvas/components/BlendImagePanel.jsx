import React, { useState } from 'react';
import { X, Upload, Check, ChevronDown, Layers, MousePointer2, Image as ImageIcon } from 'lucide-react';

const blendModes = [
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
    'color-dodge', 'color-burn', 'hard-light', 'soft-light',
    'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity',
    'plus-lighter', 'plus-darker'
];

const placementModes = [
    { id: 'fill', label: 'Fill' },
    { id: 'fit', label: 'Fit' },
    { id: 'stretch', label: 'Stretch' },
    { id: 'original', label: 'Original' }
];

const BlendImagePanel = ({
    isOpen,
    onClose,
    selectedElement,
    selectedElementData,
    addElement,
    uploads = []
}) => {
    const [bottomImage, setBottomImage] = useState(null);
    const [topImage, setTopImage] = useState(null);
    const [blendMode, setBlendMode] = useState('normal');
    const [showBlendDropdown, setShowBlendDropdown] = useState(false);

    // Advanced State
    const [topPlacement, setTopPlacement] = useState('fill');
    const [showPlacementDropdown, setShowPlacementDropdown] = useState(false);
    const [topScale, setTopScale] = useState(1);
    const [topOffsetX, setTopOffsetX] = useState(0);
    const [topOffsetY, setTopOffsetY] = useState(0);
    const [topRotation, setTopRotation] = useState(0);

    const fileInputRef = React.useRef(null);
    const [uploadLayer, setUploadLayer] = useState(null);

    const handleFileClick = (layer) => {
        setUploadLayer(layer);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (uploadLayer === 'bottom') setBottomImage(event.target.result);
                else setTopImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUseSelected = (layer) => {
        if (selectedElementData && selectedElementData.type === 'image') {
            if (layer === 'bottom') setBottomImage(selectedElementData.src);
            else setTopImage(selectedElementData.src);
        }
    };

    const handleApplyBlend = async () => {
        if (!bottomImage || !topImage) return;

        // Create a hidden canvas to bake the blend
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Load images
        const loadImg = (src) => new Promise((res) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => res(img);
            img.src = src;
        });

        try {
            const [imgB, imgT] = await Promise.all([loadImg(bottomImage), loadImg(topImage)]);

            // Canvas size matches bottom image (acting as base)
            canvas.width = imgB.width;
            canvas.height = imgB.height;

            // 1. Draw Bottom
            ctx.drawImage(imgB, 0, 0);

            // 2. Setup Blend Mode
            ctx.globalCompositeOperation = blendMode === 'normal' ? 'source-over' : blendMode;

            // 3. Draw Top with Placement/Adjustments
            ctx.save();

            let drawW, drawH, drawX, drawY;
            const bRatio = imgB.width / imgB.height;
            const tRatio = imgT.width / imgT.height;

            // Calculate base placement
            if (topPlacement === 'fill') {
                if (tRatio > bRatio) {
                    drawH = imgB.height;
                    drawW = imgB.height * tRatio;
                } else {
                    drawW = imgB.width;
                    drawH = imgB.width / tRatio;
                }
            } else if (topPlacement === 'fit') {
                if (tRatio > bRatio) {
                    drawW = imgB.width;
                    drawH = imgB.width / tRatio;
                } else {
                    drawH = imgB.height;
                    drawW = imgB.height * tRatio;
                }
            } else if (topPlacement === 'stretch') {
                drawW = imgB.width;
                drawH = imgB.height;
            } else { // Original
                drawW = imgT.width;
                drawH = imgT.height;
            }

            // Apply Scale adjustment
            drawW *= topScale;
            drawH *= topScale;

            // Center it initially
            drawX = (imgB.width - drawW) / 2;
            drawY = (imgB.height - drawH) / 2;

            // Apply Offsets (offsets are percentages of bottom image size)
            drawX += (topOffsetX / 100) * imgB.width;
            drawY += (topOffsetY / 100) * imgB.height;

            // Apply Rotation & Draw
            ctx.translate(drawX + drawW / 2, drawY + drawH / 2);
            ctx.rotate((topRotation * Math.PI) / 180);
            ctx.drawImage(imgT, -drawW / 2, -drawH / 2, drawW, drawH);

            ctx.restore();

            // Export to Data URL
            const blendedDataUrl = canvas.toDataURL('image/png');

            // Add to Canvas as a SINGLE element
            addElement('image', {
                src: blendedDataUrl,
                x: 100,
                y: 100,
                width: 400,
                height: 400 * (imgB.height / imgB.width),
                name: 'Blended Image'
            });

            onClose();
        } catch (err) {
            console.error('Blending failed:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="w-80 bg-white h-full flex flex-col animate-slide-in-left overflow-hidden shadow-xl border-r border-gray-100 z-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-800">Blend Image</h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 light-scrollbar space-y-6">
                <p className="text-xs text-gray-500 leading-relaxed">
                    Upload or select two images to blend them together using professional blend modes.
                </p>

                {/* Bottom Layer Section */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bottom layer</h3>
                    <div className="aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4 relative group overflow-hidden">
                        {bottomImage ? (
                            <>
                                <img src={bottomImage} alt="Bottom" className="w-full h-full object-cover rounded-lg" />
                                <button
                                    onClick={() => setBottomImage(null)}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </>
                        ) : (
                            <div className="text-center space-y-2">
                                <ImageIcon size={24} className="mx-auto text-gray-300" />
                                <p className="text-[10px] text-gray-400 font-medium">No image selected</p>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => handleFileClick('bottom')}
                            className="flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            <Upload size={14} />
                            Choose file
                        </button>
                        <button
                            onClick={() => handleUseSelected('bottom')}
                            disabled={!selectedElementData || selectedElementData.type !== 'image'}
                            className="flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <MousePointer2 size={14} />
                            Use selected
                        </button>
                    </div>
                </div>

                {/* Top Layer Section */}
                <div className="space-y-3 pt-2 border-t border-gray-50">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Top layer</h3>
                    <div className="aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4 relative group overflow-hidden">
                        {topImage ? (
                            <>
                                <img src={topImage} alt="Top" className="w-full h-full object-cover rounded-lg" />
                                <button
                                    onClick={() => setTopImage(null)}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </>
                        ) : (
                            <div className="text-center space-y-2">
                                <ImageIcon size={24} className="mx-auto text-gray-300" />
                                <p className="text-[10px] text-gray-400 font-medium">No image selected</p>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => handleFileClick('top')}
                            className="flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            <Upload size={14} />
                            Choose file
                        </button>
                        <button
                            onClick={() => handleUseSelected('top')}
                            disabled={!selectedElementData || selectedElementData.type !== 'image'}
                            className="flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <MousePointer2 size={14} />
                            Use selected
                        </button>
                    </div>
                </div>

                {/* Advanced Adjustment Section */}
                <div className="space-y-4 pt-2 border-t border-gray-50">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Adjust top layer</h3>
                        <ChevronDown size={14} className="text-gray-400" />
                    </div>

                    {/* Top Placement Dropdown */}
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Top placement</h4>
                        <div className="relative">
                            <button
                                onClick={() => setShowPlacementDropdown(!showPlacementDropdown)}
                                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-white transition-all"
                            >
                                <span className="capitalize">{placementModes.find(m => m.id === topPlacement)?.label}</span>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform ${showPlacementDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showPlacementDropdown && (
                                <div className="absolute top-full mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                                    {placementModes.map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => {
                                                setTopPlacement(mode.id);
                                                setShowPlacementDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-xs capitalize transition-colors
                        ${topPlacement === mode.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}
                      `}
                                        >
                                            {mode.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sliders */}
                    <div className="space-y-5 py-2">
                        {/* Scale */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Scale</h4>
                                <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{topScale.toFixed(1)}</span>
                            </div>
                            <input
                                type="range" min="0.1" max="2" step="0.1"
                                value={topScale} onChange={(e) => setTopScale(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        {/* Horizontal Offset */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Horizontal offset</h4>
                                <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{topOffsetX}</span>
                            </div>
                            <input
                                type="range" min="-100" max="100" step="1"
                                value={topOffsetX} onChange={(e) => setTopOffsetX(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        {/* Vertical Offset */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Vertical offset</h4>
                                <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{topOffsetY}</span>
                            </div>
                            <input
                                type="range" min="-100" max="100" step="1"
                                value={topOffsetY} onChange={(e) => setTopOffsetY(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        {/* Rotation */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Rotation</h4>
                                <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{topRotation}°</span>
                            </div>
                            <input
                                type="range" min="0" max="360" step="1"
                                value={topRotation} onChange={(e) => setTopRotation(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Blend Mode Section */}
                <div className="space-y-3 pt-2 border-t border-gray-50">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Blend mode</h3>
                    <div className="relative">
                        <button
                            onClick={() => setShowBlendDropdown(!showBlendDropdown)}
                            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-gray-700 shadow-sm hover:shadow-md transition-all"
                        >
                            <span className="capitalize">{blendMode}</span>
                            <ChevronDown size={16} className={`text-purple-500 transition-transform ${showBlendDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showBlendDropdown && (
                            <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 light-scrollbar">
                                {blendModes.map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => {
                                            setBlendMode(mode);
                                            setShowBlendDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-xs capitalize transition-colors flex items-center justify-between
                      ${blendMode === mode ? 'bg-purple-50 text-purple-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}
`}
                                    >
                                        {mode}
                                        {blendMode === mode && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Section */}
                <div className="space-y-3 pt-2 border-t border-gray-50">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preview</h3>
                    <div className="aspect-video bg-gray-100 rounded-2xl relative overflow-hidden shadow-inner border border-gray-200">
                        {bottomImage && (
                            <img src={bottomImage} alt="Bottom Preview" className="absolute inset-0 w-full h-full object-cover" />
                        )}
                        {topImage && (
                            <div className="absolute inset-0 overflow-hidden"
                                style={{
                                    mixBlendMode: blendMode === 'plus-lighter' ? 'lighten' : blendMode === 'plus-darker' ? 'darken' : blendMode
                                }}
                            >
                                <img
                                    src={topImage}
                                    alt="Top Preview"
                                    className="absolute"
                                    style={{
                                        width: topPlacement === 'stretch' ? '100%' : topPlacement === 'fill' || topPlacement === 'fit' ? '100%' : 'auto',
                                        height: topPlacement === 'stretch' ? '100%' : topPlacement === 'fill' || topPlacement === 'fit' ? '100%' : 'auto',
                                        objectFit: topPlacement === 'fill' ? 'cover' : topPlacement === 'fit' ? 'contain' : topPlacement === 'stretch' ? 'fill' : 'none',
                                        left: '50%',
                                        top: '50%',
                                        transformOrigin: 'center center',
                                        transform: `translate(-50%, -50%) translate(${topOffsetX}px, ${topOffsetY}px) scale(${topScale}) rotate(${topRotation}deg)`,
                                    }}
                                />
                            </div>
                        )}
                        {(!bottomImage || !topImage) && (
                            <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                                <p className="text-[10px] text-gray-400 leading-tight">Select both layers to see the blend preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <button
                    onClick={handleApplyBlend}
                    disabled={!bottomImage || !topImage}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Layers size={18} />
                    Add to Design
                </button>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
};

export default BlendImagePanel;
