import React, { useState, useMemo, memo, useEffect, useRef } from 'react';
import {
    ChevronRight,
    ArrowLeft,
    Activity,
    Maximize2,
    Type,
    CircleDashed,
    Flag,
    Wind,
    ArrowUpCircle
} from 'lucide-react';
import { fontFamilies } from '../../../utils/constants';
import useFontLoader from '../hooks/useFontLoader';

const FontSelector = memo(({ value, onChange, options }) => (
    <div className="relative group">
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#8b3dff] focus:bg-white text-sm appearance-none transition-all cursor-pointer"
        >
            {options}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
            <ChevronRight size={16} className="rotate-90" />
        </div>
    </div>
));

const WARP_STYLES = [
    { id: 'none', label: 'None', icon: <Type size={18} /> },
    { id: 'arch', label: 'Arch', icon: <CircleDashed size={18} /> },
    { id: 'arc', label: 'Arc', icon: <Wind size={18} /> },
    { id: 'wave', label: 'Wave', icon: <Activity size={18} /> },
    { id: 'rise', label: 'Rise', icon: <Maximize2 size={18} /> },
    { id: 'fish', label: 'Fish Eye', icon: <CircleDashed size={18} className="scale-125" /> },
    { id: 'flag', label: 'Flag', icon: <Flag size={18} /> },
    { id: 'squeeze', label: 'Squeeze', icon: <Maximize2 size={18} className="scale-x-75" /> },
    { id: 'twist', label: 'Twist', icon: <Wind size={18} className="rotate-45" /> },
    { id: 'peak', label: 'Peak', icon: <ArrowUpCircle size={18} /> },
];

export const TypeWarpPanel = memo(({ isOpen, onClose, addElement, updateElement, selectedElement, selectedElementData, canvasSize }) => {
    const { loadFont } = useFontLoader([]);
    const isEditing = !!(selectedElement && (selectedElementData?.type === 'type_warp' || selectedElementData?.warpData));
    const previewCanvasRef = useRef(null);

    const [text, setText] = useState('WARP IT');
    const [font, setFont] = useState('Gasoek One');
    const [color, setColor] = useState('#8b3dff');
    const [warpStyle, setWarpStyle] = useState('wave');
    const [intensity, setIntensity] = useState(30);

    // Sync state when selection changes
    useEffect(() => {
        if (isEditing && selectedElementData) {
            const data = selectedElementData.warpData || selectedElementData;
            setText(data.text || data.content || 'WARP IT');
            setFont(data.fontFamily || data.font || 'Gasoek One');
            setColor(data.color || '#8b3dff');
            setWarpStyle(data.warpStyle || 'wave');
            setIntensity(data.intensity ?? 30);
        }
    }, [selectedElement, selectedElementData, isEditing]);
    
    // Load font when changed
    useEffect(() => {
        if (font) loadFont(font);
    }, [font, loadFont]);

    const memoizedFontOptions = useMemo(() => fontFamilies.map(f => (
        <option key={f} value={f}>{f}</option>
    )), []);

    // The Warping Engine
    const generateWarpedImage = React.useCallback(async (targetSize = 1000) => {
        const sourceCanvas = document.createElement('canvas');
        const sCtx = sourceCanvas.getContext('2d');
        
        // Setup source styling
        const baseFontSize = 200;
        const fontWeight = 900;
        
        // Ensure font is loaded before measuring and drawing
        try {
            await document.fonts.load(`${fontWeight} ${baseFontSize}px "${font}"`);
        } catch (e) {
            console.warn('Font loading failed for TypeWarp:', e);
        }
        await document.fonts.ready;

        sCtx.font = `${fontWeight} ${baseFontSize}px "${font}"`;
        
        const metrics = sCtx.measureText(text);
        const textWidth = Math.max(10, metrics.width);
        const textHeight = baseFontSize * 1.5;
        
        sourceCanvas.width = textWidth + 100;
        sourceCanvas.height = textHeight * 1.5;
        
        // Draw original text centered
        sCtx.font = `${fontWeight} ${baseFontSize}px "${font}"`;
        sCtx.fillStyle = color;
        sCtx.textAlign = 'center';
        sCtx.textBaseline = 'middle';
        sCtx.fillText(text, sourceCanvas.width / 2, sourceCanvas.height / 2);
        
        // Target Canvas
        const targetCanvas = document.createElement('canvas');
        const tCtx = targetCanvas.getContext('2d');
        
        // Add vertical padding for warping
        const vertPadding = Math.max(100, Math.abs(intensity) * 2);
        targetCanvas.width = sourceCanvas.width;
        targetCanvas.height = sourceCanvas.height + vertPadding;
        
        const slices = 120; // Resolution of warp
        const sliceWidth = sourceCanvas.width / slices;
        
        for (let i = 0; i < slices; i++) {
            const sx = i * sliceWidth;
            const sy = 0;
            const sw = sliceWidth;
            const sh = sourceCanvas.height;
            
            // normalized x position [0 to 1]
            const nx = i / slices;
            const nx_centered = (i - slices / 2) / (slices / 2); // [-1 to 1]
            
            let dx = sx;
            let dy = vertPadding / 2;
            let dh = sh;
            
            // Warp Math
            const factor = intensity / 100;
            
            switch (warpStyle) {
                case 'arch':
                    dy += (1 - Math.pow(nx_centered, 2)) * -intensity * 2;
                    break;
                case 'arc':
                    dy += (1 - Math.cos(nx_centered * Math.PI / 2)) * intensity * 3;
                    break;
                case 'wave':
                    dy += Math.sin(nx * Math.PI * 2) * intensity;
                    break;
                case 'flag':
                    dy += Math.sin(nx * Math.PI * 1.5) * intensity * nx;
                    break;
                case 'rise':
                    const scaleEffect = 1 + (nx_centered * factor);
                    dh *= scaleEffect;
                    dy -= (dh - sh) / 2;
                    break;
                case 'fish':
                    const bulge = Math.cos(nx_centered * Math.PI / 2);
                    dh *= (1 + bulge * factor);
                    dy -= (dh - sh) / 2;
                    break;
                case 'squeeze':
                    const pinch = Math.sin(Math.abs(nx_centered) * Math.PI / 2);
                    dh *= (1 - pinch * factor);
                    dy -= (dh - sh) / 2;
                    break;
                case 'inflate':
                    const infl = Math.sqrt(1 - Math.pow(nx_centered, 2));
                    dh *= (1 + infl * factor);
                    dy -= (dh - sh) / 2;
                    break;
                case 'twist':
                    dy += nx_centered * intensity;
                    dh *= (1 - Math.abs(nx_centered) * factor * 0.5);
                    break;
                case 'peak':
                    const p = 1 - Math.abs(nx_centered);
                    dh *= (1 + p * factor * 2);
                    dy -= (dh - sh) / 2;
                    break;
                default:
                    break;
            }
            
            tCtx.drawImage(sourceCanvas, sx, sy, sw, sh, dx, dy, sw, dh);
        }
        
        return {
            dataUrl: targetCanvas.toDataURL('image/png', 1.0),
            aspectRatio: targetCanvas.width / targetCanvas.height
        };
    }, [text, font, color, intensity, warpStyle]);

    // Update Live Preview
    useEffect(() => {
        const updatePreview = async () => {
            const { dataUrl } = await generateWarpedImage();
            if (previewCanvasRef.current) {
                const img = new Image();
                img.onload = () => {
                    const ctx = previewCanvasRef.current.getContext('2d');
                    const canvas = previewCanvasRef.current;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                    const x = (canvas.width - img.width * scale) / 2;
                    const y = (canvas.height - img.height * scale) / 2;
                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                };
                img.src = dataUrl;
            }
        };
        updatePreview();
    }, [generateWarpedImage, previewCanvasRef, text, font, color, warpStyle, intensity]);

    const handleAction = async () => {
        const { dataUrl, aspectRatio } = await generateWarpedImage();
        
        const logicalWidth = Math.max(200, Math.min(600, text.length * 60));
        const logicalHeight = logicalWidth / aspectRatio;

        const elProps = {
            type: 'image',
            src: dataUrl,
            width: logicalWidth,
            height: logicalHeight,
            warpData: { text, font, color, warpStyle, intensity }
        };

        if (isEditing) {
            updateElement(selectedElement, elProps, true);
        } else {
            const canvasCX = canvasSize ? canvasSize.width / 2 : 500;
            const canvasCY = canvasSize ? canvasSize.height / 2 : 500;
            addElement('image', {
                ...elProps,
                x: canvasCX - (logicalWidth / 2),
                y: canvasCY - (logicalHeight / 2)
            });
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="font-bold text-gray-800 text-sm">TypeWarp</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 light-scrollbar">
                {/* Preview Area */}
                <div className="h-44 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 relative group">
                    <canvas ref={previewCanvasRef} width={400} height={200} className="max-w-full max-h-full" />
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Text</label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b3dff] text-sm shadow-sm"
                            placeholder="Type something..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Font</label>
                        <FontSelector value={font} onChange={setFont} options={memoizedFontOptions} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Style</label>
                        <div className="grid grid-cols-5 gap-2">
                            {WARP_STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setWarpStyle(style.id)}
                                    title={style.label}
                                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${warpStyle === style.id ? 'bg-[#8b3dff] border-[#8b3dff] text-white shadow-lg shadow-purple-200' : 'bg-white border-gray-200 text-gray-500 hover:border-[#8b3dff] hover:text-[#8b3dff]'}`}
                                >
                                    {style.icon}
                                    <span className="text-[8px] font-bold truncate w-full text-center px-0.5">{style.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                            <span>Intensity / Bend</span>
                            <span className="text-[#8b3dff] font-black">{intensity}</span>
                        </div>
                        <input
                            type="range" min="-100" max="100" step="1"
                            value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#8b3dff]"
                        />
                    </div>

                    <div className="space-y-2 border border-gray-100 rounded-xl p-3">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Color</label>
                        <div className="flex gap-2">
                            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} 
                                className="w-full h-10 rounded cursor-pointer border-0 p-0" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleAction}
                    className="w-full py-4 bg-[#8b3dff] hover:bg-[#7a2fd6] text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-2"
                >
                    <Maximize2 size={18} />
                    {isEditing ? 'Update Element' : 'Add to design'}
                </button>
            </div>
        </div>
    );
});
