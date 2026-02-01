import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Type, Image as ImageIcon, Square, LayoutTemplate, Palette,
    Trash2, Lock, Unlock, Copy, MoreHorizontal, AlignLeft,
    List, Bold, Italic, Underline, Strikethrough, Move,
    MousePointer2, Minus, Plus, ChevronDown, AlignCenter, AlignRight,
    MonitorPlay,
    Layers,
    Crop,
    FlipHorizontal,
    Eraser,
    Wand2,
    Sparkles,
    ArrowUp, ArrowDown, ChevronsUp, ChevronsDown,
    Grid3X3
} from 'lucide-react';
import PositionPanel from './PositionPanel';
import AnimationPanel from './AnimationPanel'; // Import animation panel

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

const ColorPickerButton = ({ color, onChange, type = 'solid' }) => (
    <div className="relative group flex items-center justify-center">
        <div
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer overflow-hidden shadow-sm"
            style={{ background: color || '#000000', backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : undefined, backgroundSize: '10px 10px' }}
        >
            <input
                type="color"
                value={color && color.startsWith('#') ? color : '#000000'}
                onChange={(e) => onChange(e.target.value)}
                className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
            />
        </div>
    </div>
);

const ContextualToolbar = ({
    selectedElement,
    selectedElementData,
    updateElement,
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
    setSelectedElement,
    alignElements,
    reorderElement
}) => {
    const { t } = useTranslation();
    const [activePopover, setActivePopover] = useState(null); // 'position', 'transparency', 'filters'

    // Get current page elements
    const currentPageElements = pages?.find(p => p.id === currentPage)?.elements || [];

    // Close popover when selection changes
    // useEffect(() => {
    //     setActivePopover(null);
    // }, [selectedElement]); // We might want to keep it open if user selects from layers tab

    const togglePopover = (name) => {
        setActivePopover(prev => prev === name ? null : name);
    };

    // Common Popovers (Position & Transparency)
    const renderPopovers = () => (
        <>
            {/* Position Panel (Replaces old popover) */}
            <PositionPanel
                isOpen={activePopover === 'position'}
                onClose={() => setActivePopover(null)}
                selectedElement={selectedElement}
                selectedElements={new Set([selectedElement])} // TODO: Pass actual set if available
                elements={currentPageElements}
                updateElement={updateElement}
                alignElements={alignElements}
                changeZIndex={changeZIndex}
                setSelectedElement={setSelectedElement}
                toggleElementLock={toggleElementLock}
                lockedElements={lockedElements}
                reorderElement={reorderElement}
            />

            {/* Animation Panel */}
            <AnimationPanel
                isOpen={activePopover === 'animate'}
                onClose={() => setActivePopover(null)}
                selectedElement={selectedElement}
                selectedElements={new Set([selectedElement])}
                elements={currentPageElements}
                updateElement={updateElement}
                updateElements={updateElements}
                mode={selectedElementData ? 'element' : 'page'} // Mode logic: if data exists, it's an element
            />

            {activePopover === 'transparency' && selectedElementData && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setActivePopover(null)} />
                    <div className="absolute top-14 right-10 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Transparency</h3>
                        <div className="flex items-center gap-3">
                            <Layers size={16} className="text-gray-500" />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={typeof selectedElementData.opacity === 'number' ? selectedElementData.opacity * 100 : 100}
                                onChange={(e) => updateElement(selectedElement, { opacity: parseInt(e.target.value) / 100 })}
                                className="flex-1"
                            />
                            <span className="text-xs text-gray-500 w-8">
                                {Math.round((typeof selectedElementData.opacity === 'number' ? selectedElementData.opacity : 1) * 100)}%
                            </span>
                        </div>
                    </div>
                </>
            )}

            {/* Position popover logic removed from here */}

            {activePopover === 'filters' && selectedElementData?.type === 'image' && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setActivePopover(null)} />
                    <div className="absolute top-14 left-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72 animate-in fade-in zoom-in-95 duration-200 max-h-[60vh] overflow-y-auto">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Filters</h3>
                        {Object.entries(selectedElementData.filters || filterOptions || {}).map(([key, filter]) => (
                            <div key={key} className="mb-3">
                                <div className="flex justify-between mb-1">
                                    <label className="text-xs font-medium text-gray-600">{filter.name}</label>
                                    <span className="text-xs text-gray-400">{filter.value}{filter.unit}</span>
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
                        ))}
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
        // Shows when selectedElement is present (Page ID) but no element data found
        return (
            <div className="w-full bg-white border-b border-gray-200 h-14 min-h-[56px] flex items-center px-4 gap-2 overflow-x-auto shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-2 mr-4 border-r border-gray-200 pr-4">
                    <span className="text-xs text-gray-500 font-medium hidden sm:inline">Background</span>
                    {/* Page Background Color Picker */}
                    <div
                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer overflow-hidden shadow-sm relative group"
                        style={{ background: canvasBackgroundColor || '#ffffff' }}
                        title="Background Color"
                    >
                        <input
                            type="color"
                            value={canvasBackgroundColor || '#ffffff'}
                            onChange={(e) => setCanvasBackgroundColor(e.target.value)}
                            className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>

                    <Separator />

                    {/* Page Animation Button */}
                    <ToolbarButton
                        label="Animate"
                        icon={MonitorPlay}
                        active={activePopover === 'animate'}
                        onClick={() => togglePopover('animate')}
                    />

                    <ToolbarButton
                        label="Position"
                        onClick={() => togglePopover('position')}
                        active={activePopover === 'position'}
                    />
                </div>

                {renderPopovers()}
            </div>
        );
    }

    const isLocked = lockedElements.has(selectedElement);



    // Common Right-Side Actions (Position, Transparency, Lock)
    const renderCommonActions = () => (
        <>
            <div className="flex-grow" />
            <ToolbarButton
                icon={MonitorPlay}
                label="Animate"
                active={activePopover === 'animate'}
                onClick={() => togglePopover('animate')}
            />
            <ToolbarButton
                icon={Layers} // Using Layers icon for Position/Arrange
                label="Position"
                active={activePopover === 'position'}
                onClick={() => togglePopover('position')}
            />
            <ToolbarButton
                icon={Grid3X3} // Using Grid icon for Transparency visualization
                label="Transparency"
                active={activePopover === 'transparency'}
                onClick={() => togglePopover('transparency')}
            />
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <ToolbarButton
                icon={isLocked ? Unlock : Lock}
                active={isLocked}
                onClick={() => toggleElementLock(selectedElement)}
                className={isLocked ? "text-red-500 hover:bg-red-50" : ""}
            />
            {renderPopovers()}
        </>
    );

    // ---- Text Toolbar ----
    if (selectedElementData.type === 'text') {
        return (
            <div className="w-full bg-white border-b border-gray-200 h-14 min-h-[56px] flex items-center px-4 gap-2 overflow-x-auto shadow-sm sticky top-0 z-50">
                {/* Font Family */}
                <div className="relative">
                    <select
                        value={selectedElementData.fontFamily}
                        onChange={(e) => updateElement(selectedElement, { fontFamily: e.target.value })}
                        className="appearance-none bg-transparent hover:bg-gray-50 border border-gray-200 rounded px-3 py-1.5 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 w-32 truncate"
                    >
                        {fontFamilies.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1.5 text-gray-500 pointer-events-none" />
                </div>

                {/* Font Size */}
                <div className="flex items-center border border-gray-200 rounded overflow-hidden h-8">
                    <button
                        onClick={() => updateElement(selectedElement, { fontSize: Math.max(1, (selectedElementData.fontSize || 16) - 1) })}
                        className="px-2 h-full hover:bg-gray-100 flex items-center"
                    >
                        <Minus size={14} />
                    </button>
                    <input
                        type="number"
                        value={Math.round(selectedElementData.fontSize || 16)}
                        onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) })}
                        className="w-10 text-center text-sm focus:outline-none h-full appearance-none"
                    />
                    <button
                        onClick={() => updateElement(selectedElement, { fontSize: (selectedElementData.fontSize || 16) + 1 })}
                        className="px-2 h-full hover:bg-gray-100 flex items-center"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                <div className="h-8 w-px bg-gray-200 mx-1" />

                <ColorPickerButton
                    color={selectedElementData.color}
                    onChange={(val) => updateElement(selectedElement, { color: val })}
                />

                <div className="h-8 w-px bg-gray-200 mx-1" />

                <div className="flex items-center gap-1">
                    <ToolbarButton
                        icon={Bold}
                        active={selectedElementData.fontWeight === 'bold'}
                        onClick={() => updateElement(selectedElement, { fontWeight: selectedElementData.fontWeight === 'bold' ? 'normal' : 'bold' })}
                    />
                    <ToolbarButton
                        icon={Italic}
                        active={selectedElementData.fontStyle === 'italic'}
                        onClick={() => updateElement(selectedElement, { fontStyle: selectedElementData.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    />
                    <ToolbarButton
                        icon={Underline}
                        active={selectedElementData.textDecoration === 'underline'}
                        onClick={() => updateElement(selectedElement, { textDecoration: selectedElementData.textDecoration === 'underline' ? 'none' : 'underline' })}
                    />
                    <ToolbarButton
                        icon={Strikethrough}
                        active={selectedElementData.textDecoration === 'line-through'}
                        onClick={() => updateElement(selectedElement, { textDecoration: selectedElementData.textDecoration === 'line-through' ? 'none' : 'line-through' })}
                    />
                    <ToolbarButton
                        label="aA"
                        className="font-bold font-serif px-2"
                        onClick={() => updateElement(selectedElement, { textTransform: selectedElementData.textTransform === 'uppercase' ? 'none' : 'uppercase' })}
                    />
                </div>

                <div className="h-8 w-px bg-gray-200 mx-1" />

                <ToolbarButton
                    icon={AlignLeft}
                    onClick={() => {
                        const nextAlign = selectedElementData.textAlign === 'left' ? 'center' : selectedElementData.textAlign === 'center' ? 'right' : 'left';
                        updateElement(selectedElement, { textAlign: nextAlign });
                    }}
                />

                <div className="h-8 w-px bg-gray-200 mx-1" />

                <ToolbarButton
                    icon={Sparkles}
                    label="Effects"
                    active={showEffectsPanel}
                    onClick={() => setShowEffectsPanel(!showEffectsPanel)}
                />

                {renderCommonActions()}
            </div>
        );
    }

    // ---- Image Toolbar ----
    if (selectedElementData.type === 'image') {
        return (
            <div className="w-full bg-white border-b border-gray-200 h-14 min-h-[56px] flex items-center px-4 gap-2 overflow-x-auto shadow-sm sticky top-0 z-50">
                <ToolbarButton
                    icon={Wand2}
                    label="Edit photo"
                    active={activePopover === 'filters'}
                    onClick={() => togglePopover('filters')}
                />
                <div className="h-8 w-px bg-gray-200 mx-1" />
                <ToolbarButton icon={Crop} label="Crop" />
                <ToolbarButton icon={FlipHorizontal} label="Flip" />

                {renderCommonActions()}
            </div>
        );
    }

    // ---- Shape Toolbar (Canva Style) ----
    return (
        <div className="w-full bg-white border-b border-gray-200 h-14 min-h-[56px] flex items-center px-4 gap-2 overflow-x-auto shadow-sm sticky top-0 z-50">

            {/* Edit Shape Button (First Item) */}
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                <Square size={18} />
                <span className="hidden sm:inline">Edit Shape</span>
            </button>

            <div className="h-6 w-px bg-gray-200 mx-1" />

            {/* Fill Color */}
            <ColorPickerButton
                color={selectedElementData.fill}
                onChange={(val) => updateElement(selectedElement, { fill: val })}
            />

            {/* Stroke/Border */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-md p-0.5 hover:bg-gray-50 transition-colors h-9">
                <div className="relative w-8 h-full flex items-center justify-center border-r border-gray-200 cursor-pointer">
                    <div className="w-5 h-5 rounded-sm border-2 border-gray-400" style={{ borderColor: selectedElementData.stroke || '#000000' }}></div>
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
                    className="w-8 text-center text-sm outline-none bg-transparent"
                    placeholder="0"
                    min="0"
                />
            </div>

            {/* Font Controls (Visual Match for "Canva Sans" etc - Disabled for Shapes currently) */}
            <div className="hidden md:flex items-center gap-2 opacity-50 pointer-events-none grayscale">
                <div className="relative border border-gray-200 rounded-md h-9 flex items-center bg-gray-50">
                    <span className="px-3 text-sm font-medium text-gray-600">Canva Sans</span>
                    <ChevronDown size={14} className="mr-2 text-gray-400" />
                </div>
                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden h-9 bg-gray-50">
                    <button className="px-2 h-full flex items-center justify-center text-gray-500"><Minus size={12} /></button>
                    <span className="w-8 text-center text-sm text-gray-600">19</span>
                    <button className="px-2 h-full flex items-center justify-center text-gray-500"><Plus size={12} /></button>
                </div>
                <div className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center bg-gray-50 text-gray-600">
                    <span className="font-bold text-lg mb-1">A</span>
                    <div className="h-1 w-5 bg-black absolute bottom-1.5" style={{ background: selectedElementData.color || '#000000' }}></div>
                </div>
                <button className="p-1.5"><Bold size={18} /></button>
                <button className="p-1.5"><Italic size={18} /></button>
                <button className="p-1.5"><Underline size={18} /></button>
            </div>


            {/* Animate */}
            <div className="flex-grow" />
            <ToolbarButton
                icon={MonitorPlay}
                label="Animate"
                active={activePopover === 'animate'}
                onClick={() => togglePopover('animate')}
            />


            {/* Position */}
            <button
                onClick={() => togglePopover('position')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activePopover === 'position' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
                <span className="hidden lg:inline">Position</span>
            </button>

            {/* Transparency */}
            <button
                onClick={() => togglePopover('transparency')}
                className={`p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors ${activePopover === 'transparency' ? 'bg-purple-50 text-purple-700' : ''}`}
                title="Transparency"
            >
                <Grid3X3 size={20} />
            </button>

            {renderPopovers()}
        </div>
    );
};

export default ContextualToolbar;
