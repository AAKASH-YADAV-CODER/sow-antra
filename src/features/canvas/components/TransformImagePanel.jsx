import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, RotateCcw, ImageIcon, MousePointer2 } from 'lucide-react';

const TransformImagePanel = ({
    isOpen,
    onClose,
    addElement,
    selectedElementData
}) => {
    const [image, setImage] = useState(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [zoom, setZoom] = useState(0.5);
    const [isDragging, setIsDragging] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const fileInputRef = useRef(null);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

    // Initial load from selected element if it's an image
    useEffect(() => {
        if (selectedElementData && selectedElementData.type === 'image' && !image) {
            setImage(selectedElementData.src);
        }
    }, [selectedElementData, image]);

    // Track image dimensions for aspect ratio
    useEffect(() => {
        if (image) {
            const img = new Image();
            img.onload = () => {
                setImageDimensions({ width: img.width, height: img.height });
            };
            img.src = image;
        }
    }, [image]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target.result);
                // Reset transforms when new image is loaded
                setRotateX(0);
                setRotateY(0);
                setZoom(0.5);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMouseDown = (e) => {
        if (!image) return;
        setIsDragging(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !image) return;

        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;

        // Adjust rotation based on drag
        // Horizontal drag rotates around Y axis, Vertical drag rotates around X axis
        setRotateY(prev => prev + deltaX * 0.5);
        setRotateX(prev => prev - deltaY * 0.5);

        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e) => {
        if (!image) return;
        const delta = e.deltaY * -0.001;
        setZoom(prev => Math.min(1, Math.max(0, prev + delta)));
    };

    const handleDoubleClick = () => {
        handleReset();
    };

    const handleReset = () => {
        setRotateX(0);
        setRotateY(0);
        setZoom(0.5);
    };

    const handleAddToDesign = () => {
        if (!image) return;

        const scaleFactor = 0.5 + zoom * 1.5;

        // Use a base width and calculate height to maintain aspect ratio
        const baseWidth = 400;
        const ratio = imageDimensions.height / (imageDimensions.width || 1);
        const finalWidth = baseWidth * scaleFactor;
        const finalHeight = (baseWidth * ratio) * scaleFactor;

        addElement('image', {
            src: image,
            x: 100,
            y: 100,
            width: finalWidth,
            height: finalHeight,
            transform3d: {
                rotateX,
                rotateY,
                perspective: 1000,
                scale: 1 // We already applied scale to width/height
            },
            name: 'Transformed Image'
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
                    <h2 className="text-lg font-bold text-gray-800">Transform Image</h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 light-scrollbar space-y-6">
                {/* Upload Section */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Upload your image</h3>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 font-medium"
                    >
                        <Upload size={20} className="text-blue-500" />
                        <span>Choose file</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <p className="text-[11px] text-gray-400 text-center">You can upload JPG, PNG, and WEBP files.</p>
                </div>

                {/* Preview Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preview</h3>
                        {image && (
                            <button onClick={() => setImage(null)} className="text-[10px] text-gray-400 hover:text-red-500 font-bold uppercase">Clear</button>
                        )}
                    </div>

                    <div
                        className="aspect-square bg-gray-50 rounded-2xl border border-gray-100 shadow-inner relative overflow-hidden flex items-center justify-center cursor-move"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                        onDoubleClick={handleDoubleClick}
                    >
                        {image ? (
                            <div style={{ perspective: '1000px' }}>
                                <img
                                    src={image}
                                    alt="Preview"
                                    className="max-w-[80%] max-h-[80%] shadow-2xl transition-transform duration-75 select-none"
                                    style={{
                                        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${0.5 + zoom * 1.5})`,
                                        userSelect: 'none',
                                        pointerEvents: 'none'
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="text-center space-y-2 opacity-30">
                                <ImageIcon size={48} className="mx-auto" />
                                <p className="text-xs font-medium">No image uploaded</p>
                            </div>
                        )}

                        <div className="absolute bottom-3 left-3 text-[10px] text-gray-400 pointer-events-none">
                            Drag to rotate • Scroll to zoom
                        </div>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="space-y-4 pt-2 border-t border-gray-50">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h4 className="text-[11px] font-bold text-gray-500 uppercase">Zoom</h4>
                            <span className="text-[11px] font-mono text-gray-400">{zoom.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    <button
                        onClick={handleReset}
                        className="w-full py-2.5 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
                    >
                        <RotateCcw size={14} />
                        Reset perspective
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <button
                    onClick={handleAddToDesign}
                    disabled={!image}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <MousePointer2 size={18} />
                    Add to design
                </button>
            </div>
        </div>
    );
};

export default TransformImagePanel;
