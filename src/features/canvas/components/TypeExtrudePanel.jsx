import React, { useState, useMemo, memo, useCallback } from 'react';
import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    ChevronRight,
    Maximize2
} from 'lucide-react';
import { fontFamilies } from '../../../utils/constants';

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

const TypeExtrudePreview = memo(({ text, font, angle, length, color, extrudeColor, darkMode, lineHeightValue, borderWidth, fontSize, scaleFactor }) => {
    // 1. Calculate Logical Dimensions (as they would appear on a 1000px wide canvas base)
    const logicalFontSize = fontSize / scaleFactor;
    const logicalLength = length / scaleFactor;
    const logicalBorderWidth = borderWidth / scaleFactor;

    // 2. Estimate Bounds to figure out how much to scale down the preview
    // These estimates don't need to be perfect, just enough to prevent clipping.
    const charCount = text.length || 1;
    const baseW = charCount * (logicalFontSize * 0.7);
    const baseH = logicalFontSize * 1.5;

    const rad = (angle * Math.PI) / 180;
    const offsetX = Math.cos(rad) * logicalLength;
    const offsetY = Math.sin(rad) * logicalLength;

    const totalW = baseW + 2.5 * Math.abs(offsetX);
    const totalH = baseH + 2.5 * Math.abs(offsetY);

    // 3. Calculate Scale to fit in h-44 (176px) and sidebar width (roughly 240px usable)
    // We target slightly smaller dims (240x140) to incorporate the p-8 padding visual.
    const previewScale = Math.min(240 / totalW, 140 / totalH, 1.0);

    const numLayers = Math.min(150, Math.max(1, Math.floor(logicalLength / 2)));
    const step = numLayers > 1 ? (logicalLength / numLayers) : logicalLength;
    const radians = (angle * Math.PI) / 180;
    const mappedLineHeight = 1.4 + (lineHeightValue / 10);

    const textStyle = {
        fontFamily: `'${font}'`,
        fontSize: `${logicalFontSize}px`,
        fontWeight: '900',
        lineHeight: mappedLineHeight,
        textAlign: 'center',
        WebkitTextStroke: logicalBorderWidth > 0 ? `${logicalBorderWidth}px ${color}` : 'none',
    };

    return (
        <div className={`w-full h-full p-4 flex items-center justify-center transition-colors duration-500 rounded-xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-[#F4F1FF]'}`}>
            <div
                className="relative"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: `scale(${previewScale})`,
                    transition: 'transform 0.2s ease-out'
                }}
            >
                {Array.from({ length: numLayers }).map((_, i) => {
                    const offset = (i + 1) * step; // Step size in logical pixels
                    const x = Math.cos(radians) * offset;
                    const y = Math.sin(radians) * offset;
                    return (
                        <div
                            key={i}
                            className="absolute inset-0 whitespace-pre text-center select-none pointer-events-none"
                            style={{
                                ...textStyle,
                                WebkitTextStroke: 'none',
                                color: extrudeColor,
                                transform: `translate(${x}px, ${y}px) translateZ(-${i + 1}px)`,
                                zIndex: i + 1
                            }}
                        >
                            {text}
                        </div>
                    );
                })}
                <div
                    className="relative whitespace-pre text-center select-none"
                    style={{
                        ...textStyle,
                        color: color,
                        transform: 'translateZ(1px)',
                        zIndex: 1000
                    }}
                >
                    {text}
                </div>
            </div>
        </div>
    );
});

export const TypeExtrudePanel = memo(({ isOpen, onClose, addElement, updateElement, selectedElement, selectedElementData, canvasSize }) => {
    const isEditing = !!(selectedElement && selectedElementData?.type === 'type_extrude');

    // Normalized Scale Factor (Base: 1000px) - Match useElements.js
    const scaleFactor = useMemo(() => {
        if (!canvasSize) return 1;
        return Math.max(canvasSize.width, canvasSize.height) / 1000;
    }, [canvasSize]);

    // Responsive Defaults - LOGICAL values (unscaled)
    const defaultFontSize = 64;
    const defaultLength = 25;

    const [text, setText] = useState('EXTRUDE');
    const [font, setFont] = useState('Gasoek One');
    const [fontSize, setFontSize] = useState(defaultFontSize);
    const [angle, setAngle] = useState(45);
    const [length, setLength] = useState(defaultLength);
    const [lineHeightValue, setLineHeightValue] = useState(0);
    const [borderWidth, setBorderWidth] = useState(0);
    const [color, setColor] = useState('#FFFFFF');
    const [extrudeColor, setExtrudeColor] = useState('#000000');
    const [darkMode, setDarkMode] = useState(false);
    const [alignment, setAlignment] = useState('center');

    // Sync state when selection changes
    React.useEffect(() => {
        if (isEditing && selectedElementData) {
            setText(selectedElementData.content || '');
            setFont(selectedElementData.fontFamily || 'Gasoek One');
            // Convert scaled canvas values back to logical panel values
            setFontSize(Math.round((selectedElementData.fontSize || 64 * scaleFactor) / scaleFactor));
            setAngle(selectedElementData.angle ?? 45);
            setLength(Math.round((selectedElementData.length ?? 25 * scaleFactor) / scaleFactor));
            setLineHeightValue(selectedElementData.lineHeightValue ?? 0);
            setBorderWidth(Math.round((selectedElementData.borderWidth ?? 0) / scaleFactor));
            setColor(selectedElementData.color || '#FFFFFF');
            setExtrudeColor(selectedElementData.extrudeColor || '#000000');
            setAlignment(selectedElementData.textAlign || 'center');
        } else if (!selectedElement) {
            // Reset to defaults when nothing selected
            setFontSize(defaultFontSize);
            setLength(defaultLength);
            setBorderWidth(0);
        }
    }, [selectedElement, selectedElementData, isEditing, scaleFactor]);

    const memoizedFontOptions = useMemo(() => fontFamilies.map(f => (
        <option key={f} value={f}>{f}</option>
    )), []);

    const calculateBounds = useCallback((baseW, baseH, currentAngle, currentLength) => {
        const rad = (currentAngle * Math.PI) / 180;
        const offsetX = Math.cos(rad) * currentLength;
        const offsetY = Math.sin(rad) * currentLength;
        
        // Use 2.0x projection for a stable, tight bounding box
        return {
            width: baseW + 2.0 * Math.abs(offsetX),
            height: baseH + 2.0 * Math.abs(offsetY)
        };
    }, []);

    const prepareElementProps = useCallback(() => {
        // State is now logical (unscaled)
        const logicalFontSize = fontSize;
        const logicalLength = length;
        const logicalBorderWidth = borderWidth;

        const charCount = text.length || 1;
        const baseW = charCount * (logicalFontSize * 0.85);
        const baseH = logicalFontSize * 1.5;

        const { width: newWidth, height: newHeight } = calculateBounds(baseW, baseH, angle, logicalLength);

        return {
            props: {
                content: text,
                fontFamily: font,
                fontSize: logicalFontSize * scaleFactor,
                length: logicalLength * scaleFactor,
                borderWidth: logicalBorderWidth * scaleFactor,
                fontWeight: '900',
                color: color,
                extrudeColor,
                angle,
                lineHeightValue,
                width: newWidth * scaleFactor,
                height: newHeight * scaleFactor,
                textAlign: alignment,
                type: 'type_extrude'
            },
            width: newWidth * scaleFactor,
            height: newHeight * scaleFactor
        };
    }, [fontSize, scaleFactor, length, borderWidth, text, angle, calculateBounds, font, color, extrudeColor, lineHeightValue, alignment]);

    // Live Updates
    // Track previous logical dimensions to shift X, Y when they change
    const [prevDims, setPrevDims] = useState({ w: 0, h: 0 });

    React.useEffect(() => {
        if (!selectedElement || !isEditing || !selectedElementData) return;

        const logicalFontSize = fontSize;
        const logicalLength = length;
        const charCount = text.length || 1;
        const baseW = charCount * (logicalFontSize * 0.85);
        const baseH = logicalFontSize * 1.5;

        // 1. Calculate new logical size
        const { width: newW, height: newH } = calculateBounds(baseW, baseH, angle, logicalLength);

        // 2. Only shift if the logical dimensions actually changed
        // Use a small epsilon to avoid unnecessary updates due to floating point inaccuracies
        if (Math.abs(newW - prevDims.w) > 0.1 || Math.abs(newH - prevDims.h) > 0.1) {
            const dx = (newW - prevDims.w) / 2;
            const dy = (newH - prevDims.h) / 2;

            updateElement(selectedElement, {
                ...prepareElementProps().props,
                x: (selectedElementData.x || 0) - (dx * scaleFactor),
                y: (selectedElementData.y || 0) - (dy * scaleFactor),
            }, false); // Pass false for shouldSaveHistory to avoid flooding history
            setPrevDims({ w: newW, h: newH });
        } else {
            // No shift, just normal update (e.g., color change, font change without size change)
            updateElement(selectedElement, prepareElementProps().props, false);
        }
    }, [fontSize, length, angle, text, font, color, extrudeColor, lineHeightValue, alignment, selectedElement, isEditing, selectedElementData, calculateBounds, prepareElementProps, updateElement, scaleFactor, prevDims]);

    const handleAction = () => {
        const { props, width: newWidth, height: newHeight } = prepareElementProps();

        if (isEditing) {
            // Final update with history save
            updateElement(selectedElement, props, true);
        } else {
            addElement('type_extrude', {
                ...props,
                x: (canvasSize.width / 2) - (newWidth / 2),
                y: (canvasSize.height / 2) - (newHeight / 2)
            });
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-5 space-y-8 light-scrollbar">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Live Preview</label>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}
                        >
                            {darkMode ? 'DARK' : 'LIGHT'}
                        </button>
                    </div>
                    <div className="h-44 rounded-2xl shadow-inner border border-gray-50 overflow-hidden group relative">
                        <TypeExtrudePreview
                            text={text}
                            font={font}
                            angle={angle}
                            length={length}
                            color={color}
                            extrudeColor={extrudeColor}
                            darkMode={darkMode}
                            lineHeightValue={lineHeightValue}
                            borderWidth={borderWidth}
                            fontSize={fontSize}
                            scaleFactor={scaleFactor}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Main text</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value.toUpperCase())}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#8b3dff] focus:bg-white text-base font-bold transition-all resize-none"
                            placeholder="YOUR TEXT..."
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Font</label>
                        <FontSelector value={font} onChange={setFont} options={memoizedFontOptions} />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                                <span>Line height</span>
                                <span className="text-[#8b3dff]">{lineHeightValue}</span>
                            </div>
                            <input
                                type="range"
                                min="-10" max="10" step="0.1"
                                value={lineHeightValue}
                                onChange={(e) => setLineHeightValue(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#8b3dff]"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                                <span>Font size</span>
                                <span className="text-[#8b3dff]">{Math.round(fontSize)}</span>
                            </div>
                            <input
                                type="range"
                                min="10" max="500" step="1"
                                value={fontSize}
                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#8b3dff]"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                                <span>Border width</span>
                                <span className="text-[#8b3dff]">{Math.round(borderWidth)}</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="50" step="1"
                                value={borderWidth}
                                onChange={(e) => setBorderWidth(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#8b3dff]"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                                <span>Angle</span>
                                <span className="text-[#8b3dff]">{Math.round(angle)}°</span>
                            </div>
                            <input
                                type="range"
                                min="-180" max="180" step="1"
                                value={angle}
                                onChange={(e) => setAngle(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#8b3dff]"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                                <span>Length</span>
                                <span className="text-[#8b3dff]">{Math.round(length)}</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="900" step="1"
                                value={length}
                                onChange={(e) => setLength(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#8b3dff]"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Colors</label>
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-1.5">
                                <div className="text-[9px] font-bold text-gray-400 uppercase text-center">Surface</div>
                                <div className="relative group flex items-center justify-center h-12 rounded-xl border border-gray-100 bg-gray-50 hover:border-purple-300 transition-all cursor-pointer">
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    <div className="w-6 h-6 rounded-full shadow-sm ring-2 ring-white" style={{ backgroundColor: color }} />
                                </div>
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <div className="text-[9px] font-bold text-gray-400 uppercase text-center">Extrusion</div>
                                <div className="relative group flex items-center justify-center h-12 rounded-xl border border-gray-100 bg-gray-50 hover:border-purple-300 transition-all cursor-pointer">
                                    <input
                                        type="color"
                                        value={extrudeColor}
                                        onChange={(e) => setExtrudeColor(e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    <div className="w-6 h-6 rounded-full shadow-sm ring-2 ring-white" style={{ backgroundColor: extrudeColor }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Alignment</label>
                        <div className="flex p-1 bg-gray-100 rounded-xl">
                            <button
                                onClick={() => setAlignment('left')}
                                className={`flex-1 py-2 flex items-center justify-center rounded-lg transition-all ${alignment === 'left' ? 'bg-white text-[#8b3dff] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <AlignLeft size={18} />
                            </button>
                            <button
                                onClick={() => setAlignment('center')}
                                className={`flex-1 py-2 flex items-center justify-center rounded-lg transition-all ${alignment === 'center' ? 'bg-white text-[#8b3dff] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <AlignCenter size={18} />
                            </button>
                            <button
                                onClick={() => setAlignment('right')}
                                className={`flex-1 py-2 flex items-center justify-center rounded-lg transition-all ${alignment === 'right' ? 'bg-white text-[#8b3dff] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <AlignRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleAction}
                    className="w-full py-4 bg-[#8b3dff] hover:bg-[#7a2fd6] text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-3"
                >
                    <Maximize2 size={18} />
                    {isEditing ? 'Update Element' : 'Add to design'}
                </button>
            </div>
        </div>
    );
});
