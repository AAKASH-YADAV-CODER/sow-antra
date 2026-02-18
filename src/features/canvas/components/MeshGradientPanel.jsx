
import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw } from 'lucide-react';

const MeshGradientPanel = ({
    isOpen,
    onClose,
    addElement,
    canvasSize = { width: 800, height: 600 }
}) => {
    const [mode, setMode] = useState('circular'); // 'circular' or 'curved'
    const [colors, setColors] = useState(['#007bff', '#ff0000']); // Default to deep blue/red
    const [backgroundColor, setBackgroundColor] = useState('#000000');
    const [seed, setSeed] = useState(Date.now());
    const canvasRef = useRef(null);

    // Initial setup based on mode
    useEffect(() => {
        if (mode === 'circular') {
            setColors(['#007bff', '#ff0000']);
            setBackgroundColor('#000000');
        } else {
            setColors(['#007bff', '#ff0000', '#ffffff', '#000000']);
        }
        setSeed(Date.now());
    }, [mode]);

    const generateDeepColor = () => {
        // High saturation, diverse hues, avoiding pastels
        const h = Math.floor(Math.random() * 360);
        const s = 80 + Math.random() * 20; // 80-100% saturation
        const l = 40 + Math.random() * 20; // 40-60% lightness for depth
        return `hsl(${h}, ${s}%, ${l}%)`;
    };

    const randomizeColors = () => {
        const newColors = colors.map(() => generateDeepColor());
        setColors(newColors);
        if (mode === 'circular') {
            setBackgroundColor(generateDeepColor());
        }
        setSeed(Date.now());
    };

    const randomizePosition = () => {
        setSeed(Date.now());
    };

    // Draw Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        // Pseudo-random number generator based on seed
        let currentSeed = seed;
        const random = () => {
            const x = Math.sin(currentSeed++) * 10000;
            return x - Math.floor(x);
        };

        if (mode === 'circular') {
            ctx.filter = 'none';
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';

            // Fill Background
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, w, h);

            // Circular Mode: Deep glowy spots
            ctx.filter = 'blur(100px)';

            colors.forEach((color, i) => {
                let x, y;
                if (i === 0) {
                    x = w * 0.3 + (random() - 0.5) * w * 0.2;
                    y = h * 0.5 + (random() - 0.5) * h * 0.2;
                } else {
                    x = w * 0.7 + (random() - 0.5) * w * 0.2;
                    y = h * 0.5 + (random() - 0.5) * h * 0.2;
                }

                const r = w * 0.6;
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
                gradient.addColorStop(0, color);
                gradient.addColorStop(0.8, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.filter = 'none';
        } else {
            // Curved Mode: Ultimate Fluid Mesh
            ctx.filter = 'none';
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';

            // 1. Solid Base
            ctx.fillStyle = colors[3] || '#000000';
            ctx.fillRect(0, 0, w, h);

            // 2. Large Soft Layer
            ctx.filter = 'blur(140px)';
            const positions = [
                { x: 0, y: 0 },
                { x: w, y: 0 },
                { x: w, y: h },
                { x: 0, y: h }
            ];

            colors.forEach((color, i) => {
                const pos = positions[i];
                const ox = pos.x + (random() - 0.5) * w;
                const oy = pos.y + (random() - 0.5) * h;
                const r = w * 1.2;

                const gradient = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(ox, oy, r, 0, Math.PI * 2);
                ctx.fill();
            });

            // 3. Fluid "Ribbon" Layer (Strong Curves)
            ctx.filter = 'blur(80px)';
            ctx.globalAlpha = 0.7;
            for (let j = 0; j < 4; j++) {
                const color = colors[j % colors.length];
                ctx.strokeStyle = color;
                ctx.lineWidth = w * 0.4;
                ctx.lineCap = 'round';

                ctx.beginPath();
                ctx.moveTo(random() * w, random() * h);
                ctx.bezierCurveTo(
                    random() * w, random() * h,
                    random() * w, random() * h,
                    random() * w, random() * h
                );
                ctx.stroke();
            }

            // 4. Highlight Layer (Vibrancy)
            ctx.globalCompositeOperation = 'overlay';
            ctx.filter = 'blur(100px)';
            ctx.globalAlpha = 0.4;
            for (let k = 0; k < 2; k++) {
                const x = random() * w;
                const y = random() * h;
                const r = w * 0.5;
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1.0;
            ctx.filter = 'none';
        }
    }, [mode, colors, backgroundColor, seed]);


    const handleAddToDesign = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png', 1.0);

        addElement('image', {
            src: dataUrl,
            x: 0,
            y: 0,
            width: canvasSize.width,
            height: canvasSize.height,
            name: 'Mesh Gradient',
            isBackground: false
        });

        onClose();
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
                    <h2 className="text-lg font-bold text-gray-800">Mesh Gradient</h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 light-scrollbar space-y-6">

                {/* Preview */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-700">Preview</h3>
                    <div className="aspect-[4/3] w-full bg-gray-50 rounded-2xl overflow-hidden shadow-inner border border-gray-100 relative group">
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={600}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">

                    {/* Gradient Style */}
                    <div>
                        <label className="text-xs font-bold text-gray-700 mb-2 block">Gradient style</label>
                        <div className="bg-gray-100 p-1 rounded-xl flex border border-gray-200">
                            <button
                                onClick={() => setMode('circular')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'circular' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Circular
                            </button>
                            <button
                                onClick={() => setMode('curved')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'curved' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Curves
                            </button>
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-700">Colors</h3>
                        <div className="flex flex-wrap gap-3">
                            {colors.map((color, idx) => (
                                <div key={idx} className="relative">
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => {
                                            const newColors = [...colors];
                                            newColors[idx] = e.target.value;
                                            setColors(newColors);
                                        }}
                                        className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-none p-0 opacity-0 absolute inset-0 z-10"
                                    />
                                    <div
                                        className="w-10 h-10 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110"
                                        style={{ backgroundColor: color }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Background Color - Only in Circular Mode */}
                    {mode === 'circular' && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-gray-700">Background color</h3>
                            <div className="relative inline-block">
                                <input
                                    type="color"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-none p-0 opacity-0 absolute inset-0 z-10"
                                />
                                <div
                                    className="w-10 h-10 rounded-full border border-gray-200 shadow-sm"
                                    style={{ backgroundColor: backgroundColor }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Randomize Button */}
                    <button
                        onClick={mode === 'circular' ? randomizeColors : randomizePosition}
                        className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors mb-2 shadow-sm"
                    >
                        <RefreshCw size={14} />
                        {mode === 'circular' ? 'Randomize colors' : 'Randomize position'}
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <button
                    onClick={handleAddToDesign}
                    className="w-full py-3.5 bg-[#8b3dff] hover:bg-[#7a32e6] text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-[0.98]"
                >
                    Add to design
                </button>
            </div>
        </div>
    );
};

export default MeshGradientPanel;
