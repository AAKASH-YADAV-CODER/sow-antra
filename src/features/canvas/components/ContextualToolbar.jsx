import React, { useState } from 'react';
import {
    Square, LayoutTemplate, Palette,
    Trash2, Lock, Unlock, AlignLeft,
    List, Bold, Italic, Underline, Strikethrough, Move,
    Minus, Plus, ChevronDown, AlignCenter, AlignRight,
    MonitorPlay,
    Layers,
    Crop,
    FlipHorizontal,
    Wand2,
    Sparkles,
    Loader2,
    RotateCcw,
    ArrowUp,
    Grid3X3, ArrowUpDown, AlignStartVertical, AlignCenterVertical, AlignEndVertical,
    PaintRoller, Clipboard, Scan
} from 'lucide-react';
import useFontLoader from '../hooks/useFontLoader';

const Separator = () => <div className="h-6 w-px bg-gray-300 mx-2" />;

const ToolbarButton = ({ icon: Icon, label, active, onClick, disabled, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
      flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer touch-manipulation
      ${active ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${className}
    `}
        title={label}
    >
        {Icon && <Icon size={18} strokeWidth={2} />}
        {label && <span>{label}</span>}
    </button>
);

const ContextualToolbar = ({
    selectedElement,
    selectedElementData,
    updateElement: originalUpdateElement,
    updateElements,
    toggleElementLock,
    lockedElements,
    fontFamilies,
    animations,
    showEffectsPanel,
    setShowEffectsPanel,
    currentPage,
    pages,
    setPages,
    canvasBackgroundColor,
    setCanvasBackgroundColor,
    changeZIndex,
    filterOptions,
    updateFilter,
    alignElements,
    reorderElement,
    activeSidePanel,
    setActiveSidePanel,
    setSelectedElement,
    copyStyle,
    pasteStyle,
    hasStyleClipboard,
    handleRemoveBackground,
    isProcessingBG,
    handleRevertBackground,
    bgProcessingStatus
}) => {
    const [activePopover, setActivePopover] = useState(null); // 'position', 'transparency', 'filters'
    const { loadFont } = useFontLoader(); // Helper to load on demand

    const updateElement = (id, updates) => {
        console.log("ContextualToolbar: updateElement called", id, updates);
        originalUpdateElement(id, updates);
    };

    const togglePopover = (name) => {
        setActivePopover(prev => prev === name ? null : name);
    };

    // Common Popovers (Transparency)
    const renderPopovers = () => (
        <>
            {activePopover === 'transparency' && selectedElementData && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setActivePopover(null)} />
                    <div className="absolute top-[60px] right-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Transparency</h3>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={Math.round((selectedElementData.opacity ?? 1) * 100)}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) / 100;
                                    updateElement(selectedElement, {
                                        opacity: val,
                                        // Also sync with filters for backward compatibility/rendering consistency
                                        filters: {
                                            ...(selectedElementData.filters || {}),
                                            opacity: {
                                                ...(selectedElementData.filters?.opacity || { name: 'Opacity', unit: '%' }),
                                                value: parseInt(e.target.value)
                                            }
                                        }
                                    });
                                }}
                                className="flex-1 accent-purple-600 h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-200"
                            />
                            <span className="text-xs font-bold text-gray-600 w-10 text-right">
                                {Math.round((selectedElementData.opacity ?? 1) * 100)}%
                            </span>
                        </div>
                    </div>
                </>
            )}

            {activePopover === 'spacing' && (selectedElementData?.type === 'text' || selectedElementData?.type === 'type_extrude') && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setActivePopover(null)} />
                    <div className="absolute top-[60px] left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-5 w-72 animate-in fade-in zoom-in-95 duration-200">
                        <div className="space-y-5">
                            {/* Letter Spacing */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-sm font-medium text-gray-700">Letter spacing</label>
                                    <span className="text-xs font-bold text-gray-600">{selectedElementData.letterSpacing || 0}</span>
                                </div>
                                <input
                                    type="range"
                                    min="-100"
                                    max="800"
                                    value={selectedElementData.letterSpacing || 0}
                                    onChange={(e) => updateElement(selectedElement, { letterSpacing: parseFloat(e.target.value) })}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />
                            </div>

                            {/* Line Spacing */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-sm font-medium text-gray-700">Line spacing</label>
                                    <span className="text-xs font-bold text-gray-600">{selectedElementData.lineHeight || 1.4}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2.5"
                                    step="0.1"
                                    value={selectedElementData.lineHeight || 1.4}
                                    onChange={(e) => updateElement(selectedElement, { lineHeight: parseFloat(e.target.value) })}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />
                            </div>

                            {/* Anchor */}
                            <div className="pt-2 border-t border-gray-100">
                                <label className="text-sm font-medium text-gray-700 block mb-2">Anchor text box</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateElement(selectedElement, { textAnchor: 'top' })}
                                        className={`flex-1 p-2 rounded-md border transition-all flex justify-center ${(selectedElementData.textAnchor || 'top') === 'top'
                                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-500'
                                            }`}
                                    >
                                        <AlignStartVertical size={20} />
                                    </button>
                                    <button
                                        onClick={() => updateElement(selectedElement, { textAnchor: 'middle' })}
                                        className={`flex-1 p-2 rounded-md border transition-all flex justify-center ${selectedElementData.textAnchor === 'middle'
                                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-500'
                                            }`}
                                    >
                                        <AlignCenterVertical size={20} />
                                    </button>
                                    <button
                                        onClick={() => updateElement(selectedElement, { textAnchor: 'bottom' })}
                                        className={`flex-1 p-2 rounded-md border transition-all flex justify-center ${selectedElementData.textAnchor === 'bottom'
                                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-500'
                                            }`}
                                    >
                                        <AlignEndVertical size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* More Settings Link */}
                            <button
                                onClick={() => {
                                    setActiveSidePanel('advanced');
                                    setActivePopover(null);
                                }}
                                className="w-full py-2 mt-2 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
                            >
                                More settings
                            </button>
                        </div>
                    </div>
                </>
            )}

            {activePopover === 'filters' && selectedElementData?.type === 'image' && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setActivePopover(null)} />
                    <div className="absolute top-[60px] left-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-gray-700">Filters</h3>
                            <button
                                onClick={() => {
                                    setActiveSidePanel('editImage');
                                    setActivePopover(null);
                                }}
                                className="text-xs font-bold text-purple-600 hover:underline"
                            >
                                More
                            </button>
                        </div>
                        <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-4">
                            {Object.entries(selectedElementData.filters || filterOptions || {}).map(([key, filter]) => {
                                if (key === 'opacity') return null; // Handled separately
                                return (
                                    <div key={key}>
                                        <div className="flex justify-between mb-1">
                                            <label className="text-xs font-medium text-gray-600">{filter.name}</label>
                                            <span className="text-xs font-bold text-gray-500">{filter.value}{filter.unit}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max={filter.max}
                                            value={filter.value}
                                            onChange={(e) => updateFilter && updateFilter(selectedElement, key, parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {activePopover === 'editShape' && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setActivePopover(null)} />
                    <div className="absolute top-[60px] left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Change Shape</h3>
                        <div className="grid grid-cols-4 gap-2 max-h-[40vh] overflow-y-auto p-1">
                            {[
                                { id: 'rectangle', icon: Square },
                                { id: 'circle', icon: Palette, label: 'Circle' }, // Using Palette as fallback or keep simple
                                { id: 'triangle', icon: ArrowUp },
                                { id: 'star', icon: Sparkles },
                                { id: 'hexagon', icon: Grid3X3 },
                                { id: 'diamond', icon: LayoutTemplate },
                                { id: 'heart', icon: Layers, label: 'Heart' },
                                { id: 'parallelogram', icon: Move },
                                { id: 'trapezoid', icon: MonitorPlay },
                                { id: 'location', icon: Trash2 }, // Just placeholders for grid
                                { id: 'shield', icon: Lock },
                                { id: 'cross', icon: Plus }
                            ].map(shape => (
                                <button
                                    key={shape.id}
                                    onClick={() => {
                                        updateElement(selectedElement, { type: shape.id });
                                        setActivePopover(null);
                                    }}
                                    className={`aspect-square flex flex-col items-center justify-center p-2 rounded-lg border transition-all hover:bg-gray-50 hover:border-purple-300 ${selectedElementData.type === shape.id ? 'border-purple-600 bg-purple-50' : 'border-gray-100'}`}
                                >
                                    <div className="w-8 h-8 flex items-center justify-center text-gray-600">
                                        {/* Simplified icons for now, but usually they'd be shape SVG icons */}
                                        <Square size={20} fill={selectedElementData.type === shape.id ? '#9333ea' : 'transparent'} strokeWidth={1.5} />
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-1 capitalize">{shape.id}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );

    // Hide if nothing is selected (User request: "show aagathu")
    if (!selectedElement) {
        return null;
    }

    if (!selectedElementData) {
        // ---- Page Properties Toolbar ----
        return (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center bg-white/95 backdrop-blur-sm border border-gray-200 h-12 px-3 gap-2 rounded-full shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mr-2 border-r border-gray-100 pr-3">
                    <span className="text-xs text-gray-500 font-medium hidden sm:inline">Background</span>
                    {/* Page Background Color Picker */}
                    <div
                        className={`w-8 h-8 rounded border border-gray-300 cursor-pointer overflow-hidden shadow-sm relative group ${activeSidePanel === 'color' ? 'ring-2 ring-purple-600' : ''}`}
                        style={{ background: canvasBackgroundColor || '#ffffff' }}
                        title="Background Color"
                        onClick={() => setActiveSidePanel(prev => prev === 'color' ? 'none' : 'color')}
                    >
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>

                    <Separator />

                    {/* Page Animation Button */}
                    <ToolbarButton
                        label="Animate"
                        icon={MonitorPlay}
                        active={activeSidePanel === 'animation'}
                        onClick={() => setActiveSidePanel(prev => prev === 'animation' ? 'none' : 'animation')}
                    />

                    <ToolbarButton
                        label="Position"
                        onClick={() => setActiveSidePanel(prev => prev === 'position' ? 'none' : 'position')}
                        active={activeSidePanel === 'position'}
                    />
                </div>

                {renderPopovers()}
            </div>
        );
    }

    const isLocked = lockedElements.has(selectedElement);

    // Style Copy / Paste Logic
    const handleCopyStyle = (e) => {
        e.stopPropagation();
        copyStyle(selectedElementData);
    };

    const handlePasteStyle = (e) => {
        e.stopPropagation();
        pasteStyle(selectedElement);
    };

    // Common Right-Side Actions (Position, Transparency, Lock, Paint Roller)
    // NOTE: renderPopovers() is now called separately, outside the scrollable container
    const renderCommonActions = () => (
        <>
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <ToolbarButton
                icon={MonitorPlay}
                label="Animate"
                active={activeSidePanel === 'animation'}
                onClick={() => setActiveSidePanel(prev => prev === 'animation' ? 'none' : 'animation')}
                className="rounded-full"
            />
            <ToolbarButton
                icon={Layers}
                label="Position"
                active={activeSidePanel === 'position'}
                onClick={() => setActiveSidePanel(prev => prev === 'position' ? 'none' : 'position')}
                className="rounded-full"
            />
            <ToolbarButton
                icon={Grid3X3}
                label="Transparency"
                active={activePopover === 'transparency'}
                onClick={() => togglePopover('transparency')}
                className="rounded-full"
            />
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <ToolbarButton
                icon={PaintRoller}
                label="Copy style"
                active={hasStyleClipboard}
                onClick={handleCopyStyle}
                className="rounded-full"
            />
            {hasStyleClipboard && (
                <ToolbarButton
                    icon={Clipboard}
                    label="Paste style"
                    onClick={handlePasteStyle}
                    className="rounded-full text-purple-600"
                />
            )}
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <ToolbarButton
                icon={isLocked ? Unlock : Lock}
                active={isLocked}
                onClick={() => toggleElementLock(selectedElement)}
                className={`rounded-full ${isLocked ? "text-red-500 hover:bg-red-50" : ""}`}
            />
        </>
    );

    // ---- Text Toolbar ----
    if (selectedElementData.type === 'text' || selectedElementData.type === 'type_extrude') {
        return (
            <>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center bg-white/95 backdrop-blur-sm border border-gray-200 h-12 px-3 gap-1 rounded-full shadow-lg transition-all duration-300 max-w-[95vw] overflow-x-auto no-scrollbar">
                    {/* Font Family */}
                    <div className="relative flex items-center bg-gray-50 hover:bg-gray-100 rounded-full px-3 py-1 border border-gray-200 transition-colors group">
                        <select
                            value={selectedElementData.fontFamily}
                            onChange={(e) => {
                                loadFont(e.target.value);
                                updateElement(selectedElement, { fontFamily: e.target.value });
                            }}
                            className="appearance-none bg-transparent text-xs font-bold focus:outline-none min-w-[80px] pr-4 cursor-pointer"
                        >
                            {fontFamilies.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 text-gray-500 pointer-events-none group-hover:text-gray-700" />
                    </div>

                    {/* Font Size */}
                    <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 px-1 py-0.5 h-8">
                        <button
                            onClick={() => updateElement(selectedElement, { fontSize: Math.max(1, (selectedElementData.fontSize || 16) - 1) })}
                            className="w-6 h-6 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                        >
                            <Minus size={14} strokeWidth={3} />
                        </button>
                        <input
                            type="number"
                            value={Math.round(selectedElementData.fontSize || 16)}
                            onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) })}
                            className="w-8 text-center text-xs font-bold bg-transparent focus:outline-none appearance-none"
                        />
                        <button
                            onClick={() => updateElement(selectedElement, { fontSize: (selectedElementData.fontSize || 16) + 1 })}
                            className="w-6 h-6 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                        >
                            <Plus size={14} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-1" />

                    <div className="flex items-center gap-0.5">
                        <div className="relative group">
                            <ToolbarButton
                                icon={Palette}
                                onClick={() => setActiveSidePanel(prev => prev === 'color' ? 'none' : 'color')}
                                active={activeSidePanel === 'color'}
                                className="rounded-full !p-2"
                            />
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full" style={{ backgroundColor: selectedElementData.color || '#000' }} />
                        </div>

                        <ToolbarButton
                            icon={Bold}
                            active={selectedElementData.fontWeight === 'bold'}
                            onClick={() => updateElement(selectedElement, { fontWeight: selectedElementData.fontWeight === 'bold' ? 'normal' : 'bold' })}
                            className="rounded-full"
                        />
                        <ToolbarButton
                            icon={Italic}
                            active={selectedElementData.fontStyle === 'italic'}
                            onClick={() => updateElement(selectedElement, { fontStyle: selectedElementData.fontStyle === 'italic' ? 'normal' : 'italic' })}
                            className="rounded-full"
                        />
                        <ToolbarButton
                            icon={Underline}
                            active={(selectedElementData.textDecoration || '').includes('underline')}
                            onClick={() => {
                                const current = selectedElementData.textDecoration || 'none';
                                const decorations = current === 'none' ? [] : current.split(' ');
                                const newVal = decorations.includes('underline')
                                    ? decorations.filter(d => d !== 'underline').join(' ') || 'none'
                                    : [...decorations, 'underline'].join(' ');
                                updateElement(selectedElement, { textDecoration: newVal });
                            }}
                            className="rounded-full"
                        />
                        <ToolbarButton
                            icon={Strikethrough}
                            active={(selectedElementData.textDecoration || '').includes('line-through')}
                            onClick={() => {
                                const current = selectedElementData.textDecoration || 'none';
                                const decorations = current === 'none' ? [] : current.split(' ');
                                const newVal = decorations.includes('line-through')
                                    ? decorations.filter(d => d !== 'line-through').join(' ') || 'none'
                                    : [...decorations, 'line-through'].join(' ');
                                updateElement(selectedElement, { textDecoration: newVal });
                            }}
                            className="rounded-full"
                        />
                        <ToolbarButton
                            label="aA"
                            className="font-bold text-xs px-2 hover:bg-gray-100 rounded-full h-8"
                            onClick={() => updateElement(selectedElement, { textTransform: selectedElementData.textTransform === 'uppercase' ? 'none' : 'uppercase' })}
                        />
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-1" />

                    <div className="flex items-center gap-0.5">
                        <ToolbarButton
                            icon={selectedElementData.textAlign === 'center' ? AlignCenter : (selectedElementData.textAlign === 'right' ? AlignRight : AlignLeft)}
                            onClick={() => {
                                const nextAlign = selectedElementData.textAlign === 'left' ? 'center' : selectedElementData.textAlign === 'center' ? 'right' : 'left';
                                updateElement(selectedElement, { textAlign: nextAlign });
                            }}
                            className="rounded-full"
                        />
                        <ToolbarButton
                            icon={List}
                            className="rounded-full"
                        />
                        <ToolbarButton
                            icon={ArrowUpDown}
                            active={activePopover === 'spacing'}
                            onClick={() => togglePopover('spacing')}
                            className="rounded-full"
                        />
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-1" />

                    <ToolbarButton
                        icon={Sparkles}
                        label="Effects"
                        active={activeSidePanel === 'effects'}
                        onClick={() => {
                            setActiveSidePanel(prev => prev === 'effects' ? 'none' : 'effects');
                            setActivePopover(null);
                        }}
                        className="rounded-full px-3 text-xs"
                    />

                    {renderCommonActions()}
                </div>
                {renderPopovers()}
            </>
        );
    }

    // ---- Image Toolbar ----
    if (selectedElementData.type === 'image') {
        return (
            <>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center bg-white/95 backdrop-blur-sm border border-gray-200 h-12 px-3 gap-1 rounded-full shadow-lg transition-all duration-300">
                    <ToolbarButton
                        icon={Wand2}
                        label="Edit image"
                        active={activeSidePanel === 'editImage'}
                        onClick={() => setActiveSidePanel(prev => prev === 'editImage' ? 'none' : 'editImage')}
                        className="rounded-full px-3 text-xs"
                    />
                    <ToolbarButton
                        icon={isProcessingBG ? Loader2 : Sparkles}
                        label={isProcessingBG ? (bgProcessingStatus ? bgProcessingStatus.split(':')[0] : "Refining...") : "BG Remover"}
                        disabled={isProcessingBG}
                        onClick={handleRemoveBackground}
                        className={`rounded-full px-3 text-xs transition-all duration-500 ${isProcessingBG ? 'text-purple-600 bg-purple-50 animate-pulse' : 'text-purple-600 hover:bg-purple-50'}`}
                    />

                    {selectedElementData.originalSrc && !isProcessingBG && (
                        <ToolbarButton
                            icon={RotateCcw}
                            label="Revert"
                            onClick={handleRevertBackground}
                            className="rounded-full px-3 text-xs text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                        />
                    )}
                    <div className="h-6 w-px bg-gray-200 mx-1" />

                    {/* Crop Button */}
                    <ToolbarButton
                        icon={Crop}
                        label="Crop"
                        active={activeSidePanel === 'crop'}
                        onClick={() => {
                            if (activeSidePanel === 'crop') {
                                setActiveSidePanel('none');
                                updateElement(selectedElement, { isCropping: false });
                            } else {
                                setActiveSidePanel('crop');
                                updateElement(selectedElement, { isCropping: true });
                            }
                        }}
                        className="rounded-full"
                    />

                    {/* Flip Popover */}
                    <div className="relative">
                        <ToolbarButton
                            icon={FlipHorizontal}
                            label="Flip"
                            active={activePopover === 'flip'}
                            onClick={() => togglePopover('flip')}
                            className="rounded-full"
                        />
                        {activePopover === 'flip' && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setActivePopover(null)} />
                                <div className="absolute top-[50px] left-0 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-2 w-40 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={() => {
                                            updateElement(selectedElement, { flipX: !selectedElementData.flipX });
                                            setActivePopover(null);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${selectedElementData.flipX ? 'bg-purple-50 text-purple-700' : ''}`}
                                    >
                                        <FlipHorizontal size={16} />
                                        <span>Flip Horizontal</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateElement(selectedElement, { flipY: !selectedElementData.flipY });
                                            setActivePopover(null);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${selectedElementData.flipY ? 'bg-purple-50 text-purple-700' : ''}`}
                                    >
                                        <div className="rotate-90"><FlipHorizontal size={16} /></div>
                                        <span>Flip Vertical</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-1" />

                    {/* Corner Radius */}
                    <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 px-1 py-0.5 h-8" title="Corner Radius">
                        <div className="w-6 h-6 flex items-center justify-center text-gray-500">
                            <Scan size={14} />
                        </div>
                        <input
                            type="number"
                            value={selectedElementData.borderRadius || 0}
                            onChange={(e) => updateElement(selectedElement, { borderRadius: parseInt(e.target.value) })}
                            className="w-8 text-center text-[10px] font-bold outline-none bg-transparent"
                            placeholder="0"
                            min="0"
                        />
                    </div>

                    {renderCommonActions()}
                </div>
                {renderPopovers()}
            </>
        );
    }

    // ---- Shape Toolbar (Canva Style) ----
    return (
        <>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center bg-white/95 backdrop-blur-sm border border-gray-200 h-12 px-3 gap-1 rounded-full shadow-lg transition-all duration-300 max-w-[95vw]">

                {/* Edit Shape Button (First Item) */}
                <button
                    onClick={() => togglePopover('editShape')}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors border ${activePopover === 'editShape' ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                >
                    <Square size={16} />
                    <span className="hidden sm:inline">Edit Shape</span>
                </button>

                <div className="h-6 w-px bg-gray-200 mx-1" />

                {/* Fill Color */}
                <div className="relative group">
                    <ToolbarButton
                        icon={Palette}
                        onClick={() => setActiveSidePanel(prev => prev === 'color' ? 'none' : 'color')}
                        active={activeSidePanel === 'color'}
                        className="rounded-full !p-2"
                    />
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full border border-white/50" style={{ backgroundColor: selectedElementData.fill || '#cbd5e1' }} />
                </div>

                {/* Stroke/Border */}
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full px-1 py-0.5 h-8">
                    <div className="relative w-6 h-6 rounded-full border border-gray-300 overflow-hidden">
                        <div className="absolute inset-0 border-2" style={{ borderColor: selectedElementData.stroke || '#000000' }}></div>
                        <input
                            type="color"
                            value={selectedElementData.stroke || '#000000'}
                            onChange={(e) => updateElement(selectedElement, { stroke: e.target.value })}
                            className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                        />
                    </div>
                    <input
                        type="number"
                        value={selectedElementData.strokeWidth || 0}
                        onChange={(e) => updateElement(selectedElement, { strokeWidth: parseInt(e.target.value) })}
                        className="w-6 text-center text-[10px] font-bold outline-none bg-transparent"
                        placeholder="0"
                        min="0"
                    />
                </div>

                <div className="h-6 w-px bg-gray-200 mx-1" />

                {/* Corner Radius (Only for Rectangles normally, but let's show for all for now or check type) */}
                <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 px-1 py-0.5 h-8" title="Corner Radius">
                    <div className="w-6 h-6 flex items-center justify-center text-gray-500">
                        <Scan size={14} />
                    </div>
                    <input
                        type="number"
                        value={selectedElementData.borderRadius || 0}
                        onChange={(e) => updateElement(selectedElement, { borderRadius: parseInt(e.target.value) })}
                        className="w-8 text-center text-[10px] font-bold outline-none bg-transparent"
                        placeholder="0"
                        min="0"
                    />
                </div>

                {renderCommonActions()}
            </div>
            {renderPopovers()}
        </>
    );
};

const arePropsEqual = (prevProps, nextProps) => {
    // Check key props that trigger re-render
    if (prevProps.selectedElement !== nextProps.selectedElement) return false;
    if (prevProps.activeSidePanel !== nextProps.activeSidePanel) return false;
    if (prevProps.currentPage !== nextProps.currentPage) return false;
    if (prevProps.lockedElements !== nextProps.lockedElements) return false;

    // Check selection data deeply or by ref?
    // If selectedElementData is a new object every time but content is same...
    // But usually it's a ref from the elements array.
    if (prevProps.selectedElementData !== nextProps.selectedElementData) return false;

    // Check generic props
    if (prevProps.canvasBackgroundColor !== nextProps.canvasBackgroundColor) return false;
    if (prevProps.isProcessingBG !== nextProps.isProcessingBG) return false;
    if (prevProps.bgProcessingStatus !== nextProps.bgProcessingStatus) return false;

    return true;
};

export default React.memo(ContextualToolbar, arePropsEqual);
