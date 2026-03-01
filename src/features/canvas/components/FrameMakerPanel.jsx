import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { Shapes } from 'lucide-react';
import { fontFamilies } from '../../../utils/constants';

const PolygonPreview = memo(({ points, draggingPoint, gridColumns }) => {
    const pointsStr = useMemo(() => points.map(p => `${p.x},${p.y}`).join(' '), [points]);

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1 1" preserveAspectRatio="none">
            <defs>
                <linearGradient id="landscape-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#87CEEB" />
                    <stop offset="100%" stopColor="#E0F6FF" />
                </linearGradient>
                <clipPath id="preview-clip" clipPathUnits="objectBoundingBox">
                    <polygon points={pointsStr} />
                </clipPath>
            </defs>
            <rect width="1" height="1" fill="url(#landscape-grad)" clipPath="url(#preview-clip)" />
            <g clipPath="url(#preview-clip)">
                <ellipse cx="0.25" cy="0.3" rx="0.1" ry="0.05" fill="white" opacity="0.6" />
                <ellipse cx="0.75" cy="0.2" rx="0.12" ry="0.06" fill="white" opacity="0.4" />
                <path d="M 0,0.7 Q 0.3,0.5 0.5,0.7 T 1.0,0.6 L 1.0,1.0 L 0,1.0 Z" fill="#8cb11c" />
                <path d="M 0,0.85 Q 0.4,0.75 0.7,0.85 T 1.0,0.8 L 1.0,1.0 L 0,1.0 Z" fill="#a0c820" />
                <g transform="translate(0.14, 0.24) scale(0.003)">
                    <rect x="0" y="0" width="12" height="8" rx="4" fill="white" />
                    <circle cx="12" cy="3" r="3" fill="white" />
                    <line x1="3" y1="8" x2="3" y2="10" stroke="#555" strokeWidth="1" />
                    <line x1="9" y1="8" x2="9" y2="10" stroke="#555" strokeWidth="1" />
                </g>
            </g>
            <polygon
                points={pointsStr}
                fill="none"
                stroke="rgba(59, 130, 246, 0.6)"
                strokeWidth="0.005"
            />
        </svg>
    );
});

const TextPreview = memo(({ word, font, letterSpacing }) => {
    const fontSize = useMemo(() => {
        const len = (word || 'TEXT').length;
        // Match CanvasElement multipliers (0.4, 0.6, 0.8) for 0-1 preview scale
        return len > 5 ? '0.4px' : len > 1 ? '0.6px' : '0.8px';
    }, [word]);

    const letterSpacingPx = useMemo(() => (letterSpacing || 0) * 0.001 + 'px', [letterSpacing]);

    // [FIX] Aspect ratio compensation for preview container (approx 3.33:1 ratio)
    const previewRatio = 3.33;
    const transform = `scale(${1 / previewRatio}, 1) translate(${(previewRatio - 1) * 0.5}, 0)`;

    const textContent = word || 'TEXT';

    return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1 1" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="text-landscape-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#87CEEB" />
                    <stop offset="100%" stopColor="#E0F6FF" />
                </linearGradient>
                <clipPath id="text-preview-clip" clipPathUnits="objectBoundingBox">
                    <text
                        x="0.5" y="0.53"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={transform}
                        style={{
                            fontFamily: font,
                            fontWeight: 'bold',
                            fontSize,
                            letterSpacing: letterSpacingPx
                        }}
                    >
                        {textContent}
                    </text>
                </clipPath>
            </defs>
            <rect width="1" height="1" fill="url(#text-landscape-grad)" clipPath="url(#text-preview-clip)" />
            <g clipPath="url(#text-preview-clip)">
                <ellipse cx="0.25" cy="0.3" rx="0.1" ry="0.05" fill="white" opacity="0.6" />
                <ellipse cx="0.75" cy="0.2" rx="0.12" ry="0.06" fill="white" opacity="0.4" />
                <path d="M 0,0.7 Q 0.3,0.5 0.5,0.7 T 1.0,0.6 L 1.0,1.0 L 0,1.0 Z" fill="#8cb11c" />
                <path d="M 0,0.85 Q 0.4,0.75 0.7,0.85 T 1.0,0.8 L 1.0,1.0 L 0,1.0 Z" fill="#a0c820" />
            </g>
            <text
                x="0.5" y="0.53"
                textAnchor="middle"
                dominantBaseline="central"
                fill="none"
                stroke="rgba(139, 61, 255, 0.4)"
                strokeWidth="0.005"
                transform={transform}
                style={{
                    fontFamily: font,
                    fontWeight: 'bold',
                    fontSize,
                    letterSpacing: letterSpacingPx
                }}
            >
                {textContent}
            </text>
        </svg>
    );
});

const DotGrid = memo(({ gridColumns, draggingPoint, points }) => {
    let highlightX = null;
    let highlightY = null;

    if (draggingPoint !== null) {
        const p = points[draggingPoint];
        highlightX = Math.round(p.x * gridColumns) / gridColumns;
        highlightY = Math.round(p.y * gridColumns) / gridColumns;
    }

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
                <pattern id="dotPattern" x="0" y="0" width={100 / gridColumns + "%"} height={100 / gridColumns + "%"} patternUnits="userSpaceOnUse">
                    <circle cx="50%" cy="50%" r="1" fill="#e5e7eb" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotPattern)" />

            {highlightX !== null && (
                <>
                    {/* Vertical Highlight Column */}
                    <rect
                        x={(highlightX * 100) - (50 / gridColumns) + "%"}
                        y="0"
                        width={100 / gridColumns + "%"}
                        height="100%"
                        fill="rgba(139, 61, 255, 0.05)"
                    />
                    {/* Horizontal Highlight Row */}
                    <rect
                        x="0"
                        y={(highlightY * 100) - (50 / gridColumns) + "%"}
                        width="100%"
                        height={100 / gridColumns + "%"}
                        fill="rgba(139, 61, 255, 0.05)"
                    />
                </>
            )}
        </svg>
    );
});

const FontSelector = memo(({ value, onChange, options }) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-[#8b3dff] text-sm appearance-none light-scrollbar"
    >
        {options}
    </select>
));

const FrameMakerPanel = memo(({
    isOpen,
    onClose,
    addElement,
    canvasSize
}) => {
    const [activeTab, setActiveTab] = useState('create'); // 'create', 'text', 'shapes'

    // Optimized Font Options
    const memoizedFontOptions = useMemo(() => fontFamilies.map(f => (
        <option key={f} value={f}>{f}</option>
    )), []);
    const [points, setPoints] = useState([
        { x: 0.2, y: 0.8 },
        { x: 0.5, y: 0.2 },
        { x: 0.8, y: 0.8 }
    ]);
    const [draggingPoint, setDraggingPoint] = useState(null);
    const [gridSnapping, setGridSnapping] = useState(true);
    const [gridColumns, setGridColumns] = useState(14);

    // Text State
    const [word, setWord] = useState('Hello');
    const [font, setFont] = useState('Gasoek One');
    const [splitIntoLetters, setSplitIntoLetters] = useState(false);
    const [letterSpacing, setLetterSpacing] = useState(0);

    const containerRef = useRef(null);


    const handleDoubleClick = (e) => {
        if (activeTab !== 'create') return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / rect.width;
        const mouseY = (e.clientY - rect.top) / rect.height;

        let bestIndex = points.length;
        let minDistance = Infinity;

        // Smart Insertion: Find the edge closest to the click
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];

            // Distance from point (mouseX, mouseY) to segment (p1, p2)
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;

            // If segment is zero length
            if (dx === 0 && dy === 0) continue;

            const t = Math.max(0, Math.min(1, ((mouseX - p1.x) * dx + (mouseY - p1.y) * dy) / (dx * dx + dy * dy)));
            const projX = p1.x + t * dx;
            const projY = p1.y + t * dy;
            const dist = Math.sqrt((mouseX - projX) ** 2 + (mouseY - projY) ** 2);

            if (dist < minDistance) {
                minDistance = dist;
                bestIndex = i + 1;
            }
        }

        const newPoint = { x: Math.max(0, Math.min(1, mouseX)), y: Math.max(0, Math.min(1, mouseY)) };
        const newPoints = [...points];
        newPoints.splice(bestIndex, 0, newPoint);
        setPoints(newPoints);
    };

    const handlePointMouseDown = (index, e) => {
        e.stopPropagation();
        setDraggingPoint(index);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (draggingPoint === null || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            let x = (e.clientX - rect.left) / rect.width;
            let y = (e.clientY - rect.top) / rect.height;

            x = Math.max(0, Math.min(1, x));
            y = Math.max(0, Math.min(1, y));

            if (gridSnapping) {
                const step = 1 / gridColumns;
                x = Math.round(x / step) * step;
                y = Math.round(y / step) * step;
            }

            const newPoints = [...points];
            newPoints[draggingPoint] = { x, y };
            setPoints(newPoints);
        };

        const handleMouseUp = () => {
            setDraggingPoint(null);
        };

        if (draggingPoint !== null) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingPoint, points, gridSnapping, gridColumns]);

    const removePoint = (index) => {
        if (points.length <= 3) return; // Minimum 3 points for a polygon
        setPoints(points.filter((_, i) => i !== index));
    };

    const addFrameToDesign = () => {
        if (activeTab === 'create') {
            const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');
            addElement('frame', {
                maskType: 'polygon',
                points: pointsStr,
                width: 300,
                height: 300
            });
        } else if (activeTab === 'text') {
            if (splitIntoLetters) {
                const letters = word.split('');
                const letterWidth = 100;
                const totalWidth = letters.length * (letterWidth + letterSpacing);
                const startX = (canvasSize.width / 2) - (totalWidth / 2);

                letters.forEach((char, i) => {
                    if (char.trim()) {
                        addElement('frame', {
                            maskType: 'text',
                            text: char,
                            fontFamily: font,
                            letterSpacing: letterSpacing,
                            width: 100, // Compact square for single letters
                            height: 100,
                            x: startX + i * (100 + letterSpacing),
                            y: (canvasSize.height / 2) - 50
                        });
                    }
                });
            } else {
                const calculatedWidth = Math.max(150, (word || 'TEXT').length * 60);
                addElement('frame', {
                    maskType: 'text',
                    text: word,
                    fontFamily: font,
                    letterSpacing: letterSpacing,
                    width: calculatedWidth,
                    height: 100
                });
            }
        }
    };

    const presetShapes = [
        { id: 'hilly', label: 'Hilly', points: '0,1 0,0.6 0.2,0.5 0.4,0.7 0.6,0.5 0.8,0.6 1,0.5 1,1' },
        { id: 'tri', label: 'Triangle', points: '0.5,0.1 0.9,0.9 0.1,0.9' },
        { id: 'rect', label: 'Rectangle', points: '0.1,0.1 0.9,0.1 0.9,0.9 0.1,0.9' },
    ];

    if (!isOpen) return null;

    return (
        <div className="w-full bg-white h-full flex flex-col z-40">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
                {['create', 'text', 'convert'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-sm font-bold capitalize transition-all relative ${activeTab === tab ? 'text-[#8b3dff]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab}
                        {tab === 'text' && <span className="ml-1 text-[8px] bg-purple-100 text-[#8b3dff] px-1 rounded">New</span>}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8b3dff]" />}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 light-scrollbar">
                {activeTab === 'create' && (
                    <div className="space-y-6">
                        {/* Preview Canvas */}
                        <div
                            ref={containerRef}
                            className="aspect-square bg-white border border-gray-200 rounded-xl relative overflow-hidden cursor-crosshair shadow-inner"
                            onDoubleClick={handleDoubleClick}
                            style={{
                                backgroundColor: '#fff'
                            }}
                        >
                            {/* High Performance SVG Grid */}
                            <DotGrid gridColumns={gridColumns} draggingPoint={draggingPoint} points={points} />

                            <PolygonPreview
                                points={points}
                                draggingPoint={draggingPoint}
                                gridColumns={gridColumns}
                            />

                            {draggingPoint !== null && (
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute bg-purple-500/40" style={{ left: `${points[draggingPoint].x * 100}%`, top: 0, width: '1px', height: '100%' }} />
                                    <div className="absolute bg-purple-500/40" style={{ top: `${points[draggingPoint].y * 100}%`, left: 0, width: '100%', height: '1px' }} />
                                </div>
                            )}

                            {points.map((p, i) => (
                                <div
                                    key={i}
                                    onMouseDown={(e) => handlePointMouseDown(i, e)}
                                    className={`absolute w-3.5 h-3.5 rounded-full -ml-[7px] -mt-[7px] cursor-grab active:cursor-grabbing hover:scale-125 transition-transform z-20 flex items-center justify-center ${draggingPoint === i ? 'bg-purple-600 border-2 border-white shadow-lg' : 'bg-gray-800 border-1.5 border-white shadow-md'}`}
                                    style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                                >
                                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-900 bg-white/80 px-1 rounded shadow-sm opacity-0 hover:opacity-100 transition-opacity" style={{ pointerEvents: 'none' }}>
                                        {i + 1}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <p className="text-[11px] text-gray-500 text-center">
                            Double click anywhere on the preview to create a new point.
                        </p>

                        <button
                            onClick={() => removePoint(points.length - 1)}
                            className="w-full py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            Remove a point
                        </button>

                        <div className="space-y-4 pt-4 border-t border-gray-50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Grid snapping</span>
                                <button
                                    onClick={() => setGridSnapping(!gridSnapping)}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${gridSnapping ? 'bg-[#8b3dff]' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${gridSnapping ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                                    <span>Grid columns</span>
                                    <span>{gridColumns}</span>
                                </div>
                                <input
                                    type="range"
                                    min="4" max="30"
                                    value={gridColumns}
                                    onChange={(e) => setGridColumns(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8b3dff]"
                                />
                            </div>
                        </div>

                        {/* Shapes Presets */}
                        <div className="pt-6 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-gray-800">Shapes</h3>
                                <button className="text-[10px] font-bold text-gray-400 hover:text-blue-600 uppercase">See all</button>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {presetShapes.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setPoints(s.points.split(' ').map(pair => ({ x: parseFloat(pair.split(',')[0]), y: parseFloat(pair.split(',')[1]) })))}
                                        className="aspect-square bg-gray-50 rounded-lg border border-transparent hover:border-blue-300 transition-all flex items-center justify-center p-1 overflow-hidden"
                                    >
                                        <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="w-full h-full">
                                            <polygon points={s.points} fill="#8cb11c" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'text' && (
                    <div className="space-y-6">
                        <div className="h-24 bg-[#E0F6FF] border border-gray-100 rounded-xl relative flex items-center justify-center overflow-hidden">
                            <TextPreview word={word} font={font} letterSpacing={letterSpacing} />
                        </div>


                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Split into letters</span>
                                <button
                                    onClick={() => setSplitIntoLetters(!splitIntoLetters)}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${splitIntoLetters ? 'bg-[#8b3dff]' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${splitIntoLetters ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Word</label>
                                <input
                                    type="text"
                                    value={word}
                                    onChange={(e) => setWord(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-[#8b3dff] text-sm"
                                    placeholder="Type a word..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Font</label>
                                <FontSelector
                                    value={font}
                                    onChange={setFont}
                                    options={memoizedFontOptions}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                                    <span>Letter spacing</span>
                                    <span>{letterSpacing}</span>
                                </div>
                                <input
                                    type="range"
                                    min="-10" max="50"
                                    value={letterSpacing}
                                    onChange={(e) => setLetterSpacing(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8b3dff]"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'convert' && (
                    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                            <Shapes size={32} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Coming Soon</h3>
                        <p className="text-xs text-gray-500">Convert existing shapes on your canvas into frames instantly.</p>
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={addFrameToDesign}
                    className="w-full py-4 bg-[#8b3dff] hover:bg-[#7a2fd6] text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-100"
                >
                    Add to design
                </button>
            </div>
        </div>
    );
});

export default FrameMakerPanel;
