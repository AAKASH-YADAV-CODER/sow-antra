import React, { useState, useMemo, memo, useEffect, useRef } from 'react';
import {
    ChevronRight,
    ArrowLeft,
    Upload,
    Plus,
    RotateCcw
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

const TypeFillPreview = memo(({ text, font, imageUrl, tileScale, tileSpacing, tileRotation }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        const draw = async () => {
             // Set canvas size for preview
            canvas.width = 400;
            canvas.height = 300;
            
            // Ensure font is loaded
            const fontWeight = 900;
            const fontSize = 100;
            try {
                await document.fonts.load(`${fontWeight} ${fontSize}px "${font}"`);
            } catch (e) {
                console.warn('Font loading failed for TypeFill preview:', e);
            }
            await document.fonts.ready;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (!text) return;

            // Draw Background
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Create pattern from image
            if (imageUrl) {
                const patternCanvas = document.createElement('canvas');
                const pCtx = patternCanvas.getContext('2d');
                
                const size = 50 * tileScale;
                patternCanvas.width = size + tileSpacing;
                patternCanvas.height = size + tileSpacing;
                
                pCtx.translate(patternCanvas.width / 2, patternCanvas.height / 2);
                pCtx.rotate((tileRotation * Math.PI) / 180);
                pCtx.drawImage(img, -size/2, -size/2, size, size);

                const pattern = ctx.createPattern(patternCanvas, 'repeat');
                ctx.fillStyle = pattern;
            } else {
                ctx.fillStyle = '#8b3dff';
            }

            // Draw Text
            ctx.font = `${fontWeight} ${fontSize}px "${font}"`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Measure text to potentially scale down if too long
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;
            if (textWidth > canvas.width * 0.9) {
                const newSize = fontSize * (canvas.width * 0.9 / textWidth);
                ctx.font = `${fontWeight} ${newSize}px "${font}"`;
            }

            ctx.fillText(text, canvas.width/2, canvas.height/2);
        };

        if (imageUrl) {
            img.onload = draw;
            img.src = imageUrl;
        } else {
            draw();
        }
    }, [text, font, imageUrl, tileScale, tileSpacing, tileRotation]);

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
            <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
        </div>
    );
});

const TypeFillPanel = ({ isOpen, onClose, addElement, canvasSize }) => {
    const { loadFont } = useFontLoader([]);
    const [text, setText] = useState('TYPE');
    const [font, setFont] = useState('Gasoek One');
    const [imageUrl, setImageUrl] = useState('');
    const [tileScale, setTileScale] = useState(0.4);
    const [tileSpacing, setTileSpacing] = useState(5);
    const [tileRotation, setTileRotation] = useState(0);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (font) loadFont(font);
    }, [font, loadFont]);

    const memoizedFontOptions = useMemo(() => fontFamilies.map(f => (
        <option key={f} value={f}>{f}</option>
    )), []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setImageUrl(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    const generateTypeFillImage = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const baseFontSize = 300;
        const fontWeight = 900;
        
        // Ensure font is loaded
        try {
            await document.fonts.load(`${fontWeight} ${baseFontSize}px "${font}"`);
        } catch (e) {
            console.warn('Font loading failed for TypeFill generation:', e);
        }
        await document.fonts.ready;

        ctx.font = `${fontWeight} ${baseFontSize}px "${font}"`;
        const metrics = ctx.measureText(text);
        
        // Calculate dimensions
        const textWidth = Math.max(100, metrics.width);
        const textHeight = baseFontSize * 1.2;
        
        canvas.width = textWidth + 100;
        canvas.height = textHeight + 100;
        
        // Prepare Pattern
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        return new Promise((resolve) => {
            const drawFinal = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                if (imageUrl) {
                    const patternCanvas = document.createElement('canvas');
                    const pCtx = patternCanvas.getContext('2d');
                    const size = 80 * tileScale; 
                    patternCanvas.width = size + tileSpacing;
                    patternCanvas.height = size + tileSpacing;
                    
                    pCtx.translate(patternCanvas.width / 2, patternCanvas.height / 2);
                    pCtx.rotate((tileRotation * Math.PI) / 180);
                    pCtx.drawImage(img, -size/2, -size/2, size, size);

                    const pattern = ctx.createPattern(patternCanvas, 'repeat');
                    ctx.fillStyle = pattern;
                } else {
                    ctx.fillStyle = '#8b3dff';
                }

                ctx.font = `${fontWeight} ${baseFontSize}px "${font}"`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, canvas.width/2, canvas.height/2);
                
                resolve({
                    dataUrl: canvas.toDataURL('image/png'),
                    width: canvas.width,
                    height: canvas.height
                });
            };

            if (imageUrl) {
                img.onload = drawFinal;
                img.src = imageUrl;
            } else {
                drawFinal();
            }
        });
    };

    const handleAdd = async () => {
        const { dataUrl, width, height } = await generateTypeFillImage();
        
        const aspectRatio = width / height;
        const logicalWidth = Math.min(600, canvasSize?.width * 0.8 || 500);
        const logicalHeight = logicalWidth / aspectRatio;

        addElement('image', {
            src: dataUrl,
            width: logicalWidth,
            height: logicalHeight,
            x: (canvasSize?.width / 2 || 500) - (logicalWidth / 2),
            y: (canvasSize?.height / 2 || 500) - (logicalHeight / 2),
        });
        onClose();
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="font-bold text-gray-800 text-sm">TypeFill Pattern</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <div className="h-48 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                    <TypeFillPreview 
                        text={text} 
                        font={font} 
                        imageUrl={imageUrl} 
                        tileScale={tileScale} 
                        tileSpacing={tileSpacing}
                        tileRotation={tileRotation}
                    />
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Text Content</label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value.toUpperCase())}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#8b3dff] text-sm font-bold"
                            placeholder="YOUR TEXT"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Font Family</label>
                        <FontSelector value={font} onChange={setFont} options={memoizedFontOptions} />
                    </div>

                    <div className="space-y-2">
                         <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pattern Image</label>
                         <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#8b3dff] hover:bg-purple-50 transition-all group"
                         >
                            {imageUrl ? (
                                <img src={imageUrl} alt="tile" className="w-12 h-12 rounded-lg object-cover shadow-sm group-hover:scale-110 transition-transform" />
                            ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#8b3dff] group-hover:bg-white transition-all">
                                    <Upload size={24} />
                                </div>
                            )}
                            <span className="text-xs font-bold text-gray-500 group-hover:text-[#8b3dff]">{imageUrl ? 'Change Image' : 'Upload Pattern Tile'}</span>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                         </div>
                    </div>

                    <div className="space-y-5 pt-2">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tile Scale</label>
                                <span className="text-[10px] bg-purple-100 text-[#8b3dff] px-2 py-0.5 rounded-full font-bold">{Math.round(tileScale * 100)}%</span>
                            </div>
                            <input 
                                type="range" min="0.1" max="1.5" step="0.05"
                                value={tileScale} onChange={(e) => setTileScale(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#8b3dff]"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tile Spacing</label>
                                <span className="text-[10px] bg-purple-100 text-[#8b3dff] px-2 py-0.5 rounded-full font-bold">{tileSpacing}px</span>
                            </div>
                            <input 
                                type="range" min="0" max="50" step="1"
                                value={tileSpacing} onChange={(e) => setTileSpacing(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#8b3dff]"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pattern Rotation</label>
                                <button onClick={() => setTileRotation(0)} className="text-[#8b3dff] hover:bg-purple-100 p-1 rounded-full transition-colors">
                                    <RotateCcw size={14} />
                                </button>
                            </div>
                            <input 
                                type="range" min="0" max="360" step="1"
                                value={tileRotation} onChange={(e) => setTileRotation(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#8b3dff]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleAdd}
                    disabled={!text || !imageUrl}
                    className={`w-full py-4 flex items-center justify-center gap-2 font-bold rounded-2xl transition-all shadow-lg
                        ${(!text || !imageUrl) ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-[#8b3dff] hover:bg-[#7a2fd6] text-white shadow-purple-100'}
                    `}
                >
                    <Plus size={20} />
                    Add to design
                </button>
            </div>
        </div>
    );
};

export default memo(TypeFillPanel);
