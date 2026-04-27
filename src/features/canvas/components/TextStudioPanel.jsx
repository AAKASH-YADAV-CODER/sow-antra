import React, { useState, useMemo, memo } from 'react';
import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    ChevronRight,
    Settings2,
    ArrowLeft
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

const TextStudioPreview = memo(({ text, font, color, extrudeColor, extrudeDepth, extrudeThickness, shadowEnabled, shadowOffset, shadowBlur, shadowColor, shadowOpacity, letterSpacing, lineHeight, textAlign }) => {
    // Generate the CSS text-shadow string
    const rad = (45 * Math.PI) / 180; // 45 degree angle for extrusion
    let textShadow = '';
    
    // Extrusion shadow (solid layers)
    for (let i = 1; i <= extrudeDepth; i++) {
        const sx = Math.cos(rad) * i;
        const sy = Math.sin(rad) * i;
        textShadow += `${sx}px ${sy}px 0px ${extrudeColor}, `;
    }
    
    // Drop shadow
    if (shadowEnabled) {
        const sx = Math.cos(rad) * (extrudeDepth + shadowOffset);
        const sy = Math.sin(rad) * (extrudeDepth + shadowOffset);
        
        // Convert hex to rgba for shadow
        const r = parseInt(shadowColor.slice(1, 3), 16) || 0;
        const g = parseInt(shadowColor.slice(3, 5), 16) || 0;
        const b = parseInt(shadowColor.slice(5, 7), 16) || 0;
        const rgbaShadow = `rgba(${r}, ${g}, ${b}, ${shadowOpacity})`;
        
        textShadow += `${sx}px ${sy}px ${shadowBlur}px ${rgbaShadow}`;
    } else {
        // Remove trailing comma if no drop shadow
        if (textShadow.length > 0) {
            textShadow = textShadow.slice(0, -2);
        }
    }

    return (
        <div className="w-full h-full p-4 flex items-center justify-center bg-[#0085FF] rounded-xl overflow-hidden transition-colors duration-500">
            <div
                style={{
                    fontFamily: `'${font}'`,
                    fontSize: '64px',
                    fontWeight: '900',
                    color: color,
                    textShadow: textShadow,
                    textAlign: textAlign,
                    letterSpacing: `${letterSpacing}px`,
                    lineHeight: lineHeight,
                    transform: 'scale(0.8)',
                    transition: 'all 0.2s ease-out',
                    WebkitTextStroke: `${Math.min(extrudeThickness, 20)}px ${extrudeColor}`,
                    paintOrder: 'stroke fill',
                }}
            >
                {text || 'YES!'}
            </div>
        </div>
    );
});

export const TextStudioPanel = memo(({ isOpen, onClose, addElement, updateElement, selectedElement, selectedElementData, canvasSize }) => {
    const isEditing = !!(selectedElement && (selectedElementData?.type === 'text_studio' || selectedElementData?.textStudioData));
    const { loadFont } = useFontLoader([]);

    // Default Canva Yellow White 3D settings
    const [text, setText] = useState('YES!');
    const [font, setFont] = useState('Gasoek One');
    const [textAlign, setTextAlign] = useState('center');
    
    // Spacing
    const [letterSpacing, setLetterSpacing] = useState(0);
    const [lineHeight, setLineHeight] = useState(1.2);
    
    // Colors
    const [color, setColor] = useState('#FFFFFF');
    const [extrudeColor, setExtrudeColor] = useState('#FFAC00'); // Canva Yellow/Orange
    
    // Extrusion & Shadow
    const [extrudeDepth, setExtrudeDepth] = useState(15);
    const [extrudeThickness, setExtrudeThickness] = useState(15);
    const [shadowEnabled, setShadowEnabled] = useState(true);
    const [shadowOffset, setShadowOffset] = useState(10);
    const [shadowBlur, setShadowBlur] = useState(15);
    const [shadowOpacity, setShadowOpacity] = useState(0.3);
    const [shadowColor, setShadowColor] = useState('#000000');

    // Sync state when selection changes
    React.useEffect(() => {
        if (isEditing && selectedElementData) {
            const data = selectedElementData.textStudioData || selectedElementData;
            setText(data.text || data.content || 'YES!');
            setFont(data.fontFamily || data.font || 'Gasoek One');
            setTextAlign(data.textAlign || 'center');
            setLetterSpacing(data.letterSpacing || 0);
            setLineHeight(data.lineHeight || 1.2);
            setColor(data.color || '#FFFFFF');
            setExtrudeColor(data.extrudeColor || '#FFAC00');
            setExtrudeDepth(data.extrudeDepth ?? 15);
            setExtrudeThickness(data.extrudeThickness ?? 15);
            setShadowEnabled(data.shadowEnabled ?? true);
            setShadowOffset(data.shadowOffset ?? 10);
            setShadowBlur(data.shadowBlur ?? 15);
            setShadowOpacity(data.shadowOpacity ?? 0.3);
            setShadowColor(data.shadowColor || '#000000');
        } else if (!selectedElement) {
            setText('YES!');
        }
    }, [selectedElement, selectedElementData, isEditing]);

    // Ensure the selected font is loaded via CSS
    React.useEffect(() => {
        if (font) {
            loadFont(font);
        }
    }, [font, loadFont]);

    const memoizedFontOptions = useMemo(() => fontFamilies.map(f => (
        <option key={f} value={f}>{f}</option>
    )), []);

    const generate3DTextDataURL = async () => {
        // Explicitly load the font to ensure it's available before drawing
        const fontWeight = 900;
        try {
            await document.fonts.load(`${fontWeight} 20px "${font}"`);
        } catch (e) {
            console.warn('Font loading failed for TextStudio, falling back to system font', e);
        }
        await document.fonts.ready;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Use a high resolution base for crisp images
        const baseFontSize = 200;
        const scale = baseFontSize / 64; // Relative to the UI sliders which assume ~64px
        
        const lines = text.split('\\n');
        
        // Calculate canvas dimensions
        // Load font to measure
        ctx.font = `900 ${baseFontSize}px "${font}"`;
        if (ctx.letterSpacing !== undefined) {
            ctx.letterSpacing = `${letterSpacing * scale}px`;
        }
        
        let maxLineWidth = 0;
        lines.forEach(line => {
            const m = ctx.measureText(line);
            if(m.width > maxLineWidth) maxLineWidth = m.width;
        });
        
        // Geometry calculations
        const rad = (45 * Math.PI) / 180;
        const depth = Math.max(0, extrudeDepth * scale);
        const sOffset = shadowOffset * scale;
        const sBlur = shadowBlur * scale;
        const eThickness = (extrudeThickness || 15) * scale;
        
        const dropOffX = Math.cos(rad) * (depth + sOffset);
        const dropOffY = Math.sin(rad) * (depth + sOffset);
        
        // Add padding to prevent clipping (taking stroke thickness into account)
        const padding = sBlur * 2 + Math.max(Math.abs(dropOffX), Math.abs(depth)) + eThickness + 50;
        
        canvas.width = Math.max(10, maxLineWidth + padding * 2);
        canvas.height = Math.max(10, (lines.length * baseFontSize * lineHeight) + padding * 2);
        
        // Reset context after resizing
        ctx.font = `900 ${baseFontSize}px "${font}"`;
        if (ctx.letterSpacing !== undefined) {
            ctx.letterSpacing = `${letterSpacing * scale}px`;
        }
        ctx.textBaseline = 'top';
        ctx.textAlign = textAlign;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        
        const startX = textAlign === 'center' ? canvas.width / 2 : (textAlign === 'right' ? canvas.width - padding : padding);
        let startY = padding;
        
        // 1. Draw Drop Shadow
        if (shadowEnabled) {
            ctx.save();
            const r = parseInt(shadowColor.slice(1, 3), 16) || 0;
            const g = parseInt(shadowColor.slice(3, 5), 16) || 0;
            const b = parseInt(shadowColor.slice(5, 7), 16) || 0;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${shadowOpacity})`;
            ctx.shadowBlur = sBlur;
            ctx.shadowOffsetX = dropOffX;
            ctx.shadowOffsetY = dropOffY;
            ctx.fillStyle = extrudeColor;
            ctx.strokeStyle = extrudeColor;
            ctx.lineWidth = eThickness;
            lines.forEach((line, index) => {
                if (eThickness > 0) ctx.strokeText(line, startX, startY + (index * baseFontSize * lineHeight));
                ctx.fillText(line, startX, startY + (index * baseFontSize * lineHeight));
            });
            ctx.restore();
        }
        
        // 2. Draw Extrusion Layers
        ctx.fillStyle = extrudeColor;
        ctx.strokeStyle = extrudeColor;
        ctx.lineWidth = eThickness;
        // Step size 1 for solid extrusion
        for (let i = depth; i >= 1; i -= 1) {
            const sx = Math.cos(rad) * i;
            const sy = Math.sin(rad) * i;
            lines.forEach((line, index) => {
                if (eThickness > 0) ctx.strokeText(line, startX + sx, startY + sy + (index * baseFontSize * lineHeight));
                ctx.fillText(line, startX + sx, startY + sy + (index * baseFontSize * lineHeight));
            });
        }
        
        // 3. Draw Top Text
        ctx.fillStyle = color;
        lines.forEach((line, index) => {
            ctx.fillText(line, startX, startY + (index * baseFontSize * lineHeight));
        });
        
        return {
            dataUrl: canvas.toDataURL('image/png', 1.0),
            aspectRatio: canvas.width / canvas.height
        };
    };

    // Live Updates
    React.useEffect(() => {
        if (!selectedElement || !isEditing || !selectedElementData) return;
        // Not real-time rendering due to performance. Update when button clicked.
    }, [text, font, textAlign, letterSpacing, lineHeight, color, extrudeColor, extrudeDepth, extrudeThickness, shadowEnabled, shadowOffset, shadowBlur, shadowOpacity, shadowColor, selectedElement, isEditing, selectedElementData]);

    const handleAction = async () => {
        const { dataUrl, aspectRatio } = await generate3DTextDataURL();
        
        // Target reasonable logical width on canvas
        const charCount = text.length || 1;
        // Increase base width proportionally to thickness
        let logicalWidth = Math.max(200, Math.min(600, 70 * charCount + (extrudeThickness * 2)));
        if (logicalWidth > (canvasSize?.width * 0.9 || 800)) {
             logicalWidth = (canvasSize?.width * 0.9) || 800; // Cap to 90% canvas
        }
        const logicalHeight = logicalWidth / aspectRatio;

        if (isEditing) {
            // Update existing element
            updateElement(selectedElement, {
                type: 'image',
                src: dataUrl,
                width: logicalWidth,
                height: logicalHeight,
                // store metadata for potential future editing
                textStudioData: { text, font, color, extrudeColor, extrudeDepth, extrudeThickness, shadowEnabled, shadowOffset, shadowBlur, shadowOpacity, letterSpacing, lineHeight, textAlign }
            }, true);
        } else {
            // Add new element at center
            const canvasCX = canvasSize ? canvasSize.width / 2 : 500;
            const canvasCY = canvasSize ? canvasSize.height / 2 : 500;
            addElement('image', {
                src: dataUrl,
                width: logicalWidth,
                height: logicalHeight,
                x: canvasCX - (logicalWidth / 2),
                y: canvasCY - (logicalHeight / 2),
                textStudioData: { text, font, color, extrudeColor, extrudeDepth, extrudeThickness, shadowEnabled, shadowOffset, shadowBlur, shadowOpacity, letterSpacing, lineHeight, textAlign }
            });
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="font-bold text-gray-800 text-sm flex-1">Text Studio</h2>
                <div className="flex gap-2 text-gray-400">
                    <button className="hover:text-gray-600 transition-colors"><Settings2 size={16} /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 light-scrollbar">
                {/* Preview Thumbnail */}
                <div className="h-44 rounded-2xl shadow-inner border border-gray-50 overflow-hidden group relative">
                    <TextStudioPreview 
                        text={text}
                        font={font}
                        color={color}
                        extrudeColor={extrudeColor}
                        extrudeDepth={extrudeDepth}
                        extrudeThickness={extrudeThickness}
                        shadowEnabled={shadowEnabled}
                        shadowOffset={shadowOffset}
                        shadowBlur={shadowBlur}
                        shadowOpacity={shadowOpacity}
                        shadowColor={shadowColor}
                        letterSpacing={letterSpacing}
                        lineHeight={lineHeight}
                        textAlign={textAlign}
                    />
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Text</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b3dff] text-sm transition-all resize-none shadow-sm"
                            placeholder="Your text..."
                            rows={3}
                        />
                        <div className="text-[10px] text-gray-400">Up to 35 characters for best results</div>
                    </div>

                    <div className="flex gap-2 items-center">
                        <div className="flex-1">
                            <FontSelector value={font} onChange={setFont} options={memoizedFontOptions} />
                        </div>
                        <div className="flex p-1 bg-gray-100 rounded-xl h-[46px]">
                            <button
                                onClick={() => setTextAlign('left')}
                                className={`px-2 flex items-center justify-center rounded-lg transition-all ${textAlign === 'left' ? 'bg-white text-[#8b3dff] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <AlignLeft size={16} />
                            </button>
                            <button
                                onClick={() => setTextAlign('center')}
                                className={`px-2 flex items-center justify-center rounded-lg transition-all ${textAlign === 'center' ? 'bg-white text-[#8b3dff] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <AlignCenter size={16} />
                            </button>
                            <button
                                onClick={() => setTextAlign('right')}
                                className={`px-2 flex items-center justify-center rounded-lg transition-all ${textAlign === 'right' ? 'bg-white text-[#8b3dff] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <AlignRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                <span>Letter Spacing</span>
                                <span className="text-[#8b3dff]">{Math.round(letterSpacing)}</span>
                            </div>
                            <input
                                type="range" min="-50" max="200" step="1"
                                value={letterSpacing} onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#8b3dff]"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                <span>Line Height</span>
                                <span className="text-[#8b3dff]">{lineHeight.toFixed(2)}</span>
                            </div>
                            <input
                                type="range" min="0.5" max="2.5" step="0.01"
                                value={lineHeight} onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#8b3dff]"
                            />
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl p-4 space-y-4">
                        <label className="text-[12px] font-bold text-gray-700">Colors</label>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2 flex flex-col">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Text Color</span>
                                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border-0 p-0" />
                            </div>
                            <div className="space-y-2 flex flex-col">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">3D Block Color</span>
                                <input type="color" value={extrudeColor} onChange={(e) => setExtrudeColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border-0 p-0" />
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl p-4 space-y-4">
                        <label className="text-[12px] font-bold text-gray-700">Extrusion</label>
                        <div className="space-y-3 pt-2">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                    <span>Depth</span>
                                    <span className="text-[#8b3dff]">{extrudeDepth}</span>
                                </div>
                                <input type="range" min="0" max="100" step="1" value={extrudeDepth} onChange={(e) => setExtrudeDepth(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none accent-[#8b3dff]" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                    <span>Thickness</span>
                                    <span className="text-[#8b3dff]">{extrudeThickness}</span>
                                </div>
                                <input type="range" min="0" max="60" step="1" value={extrudeThickness} onChange={(e) => setExtrudeThickness(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none accent-[#8b3dff]" />
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-700">Shadow</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={shadowEnabled} onChange={(e) => setShadowEnabled(e.target.checked)} />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8b3dff]"></div>
                            </label>
                        </div>
                        
                        {shadowEnabled && (
                            <div className="space-y-3 pt-2">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                        <span>Offset</span>
                                        <span className="text-[#8b3dff]">{shadowOffset}</span>
                                    </div>
                                    <input type="range" min="0" max="50" step="1" value={shadowOffset} onChange={(e) => setShadowOffset(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none accent-[#8b3dff]" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                        <span>Blur</span>
                                        <span className="text-[#8b3dff]">{shadowBlur}</span>
                                    </div>
                                    <input type="range" min="0" max="50" step="1" value={shadowBlur} onChange={(e) => setShadowBlur(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none accent-[#8b3dff]" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                        <span>Opacity</span>
                                        <span className="text-[#8b3dff]">{Math.round(shadowOpacity * 100)}%</span>
                                    </div>
                                    <input type="range" min="0" max="1" step="0.05" value={shadowOpacity} onChange={(e) => setShadowOpacity(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none accent-[#8b3dff]" />
                                </div>
                                <div className="space-y-2 flex flex-col pt-2">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Shadow Color</span>
                                    <input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} className="w-full h-8 cursor-pointer border-0 p-0 rounded-md" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
                <button
                    onClick={handleAction}
                    className="w-full py-3.5 bg-[#8b3dff] hover:bg-[#7a2fd6] text-white font-bold rounded-xl transition-all shadow-md shadow-purple-100 flex items-center justify-center"
                >
                    {isEditing ? 'Update Element' : 'Add to design'}
                </button>
            </div>
        </div>
    );
});
