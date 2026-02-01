import React, { useState } from 'react';
import {
    X, Layers, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown,
    AlignStartVertical, AlignCenterVertical, AlignEndVertical,
    AlignLeft, AlignCenter, AlignRight,
    Type, Image as ImageIcon, Square, Circle, Triangle, Star, Hexagon,
    MoreHorizontal, Lock, GripVertical
} from 'lucide-react';

const PositionPanel = ({
    isOpen,
    onClose,
    selectedElement,
    selectedElements,
    elements, // All elements on current page
    updateElement,
    alignElements,
    changeZIndex,
    setSelectedElement,
    toggleElementLock,
    lockedElements,
    reorderElement
}) => {
    const [activeTab, setActiveTab] = useState('arrange'); // 'arrange' | 'layers'
    const [layerFilter, setLayerFilter] = useState('all'); // 'all' | 'overlapping'
    const [draggedItemId, setDraggedItemId] = useState(null);

    if (!isOpen) return null;

    // Find selected element data if single selection
    const selectedElementData = elements.find(el => el.id === selectedElement);

    // Helper to get element icon
    const getElementIcon = (type) => {
        switch (type) {
            case 'text': return <Type size={14} />;
            case 'image': return <ImageIcon size={14} />;
            case 'circle': return <Circle size={14} />;
            case 'triangle': return <Triangle size={14} />;
            case 'star': return <Star size={14} />;
            case 'hexagon': return <Hexagon size={14} />;
            default: return <Square size={14} />;
        }
    };

    // Check overlap
    const checkOverlap = (el1, el2) => {
        return !(
            el1.x + el1.width < el2.x ||
            el1.x > el2.x + el2.width ||
            el1.y + el1.height < el2.y ||
            el1.y > el2.y + el2.height
        );
    };

    // Get displayed elements based on filter
    let displayedElements = [...elements].reverse(); // Top first by default

    if (activeTab === 'layers' && layerFilter === 'overlapping' && selectedElementData) {
        displayedElements = displayedElements.filter(el =>
            el.id === selectedElementData.id || checkOverlap(selectedElementData, el)
        );
    }

    // --- Drag and Drop Handlers ---
    const handleDragStart = (e, id) => {
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
        // Create a ghost image if needed, or browser default
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        const sourceId = e.dataTransfer.getData('text/plain');

        if (sourceId === targetId) return;

        // Find indices in the ORIGINAL elements array (not displayedElements)
        // We want to move source to be just before/after target.
        // Since displayedElements is reversed (visual order), dropping "above" visually means "later" in the array (higher Z).

        // However, simplest UX is: drop on target -> place source at target's index.
        const sourceIndex = elements.findIndex(el => el.id === sourceId);
        const targetIndex = elements.findIndex(el => el.id === targetId);

        if (sourceIndex !== -1 && targetIndex !== -1) {
            reorderElement && reorderElement(sourceId, targetIndex);
        }
        setDraggedItemId(null);
    };


    return (
        <div className="fixed left-0 top-[56px] bottom-0 w-80 bg-white shadow-xl z-40 flex flex-col border-r border-gray-200 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h2 className="font-bold text-gray-800">Position</h2>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex px-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('arrange')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'arrange'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Arrange
                </button>
                <button
                    onClick={() => setActiveTab('layers')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'layers'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Layers
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50">

                {/* ARRANGE TAB */}
                {activeTab === 'arrange' && (
                    <div className="p-4 space-y-6">

                        {/* Layering */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Layering</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => selectedElement && changeZIndex(selectedElement, 'forward')}
                                    disabled={!selectedElement}
                                    className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors disabled:opacity-50 bg-white"
                                >
                                    <ChevronUp size={16} /> Forward
                                </button>
                                <button
                                    onClick={() => selectedElement && changeZIndex(selectedElement, 'backward')}
                                    disabled={!selectedElement}
                                    className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors disabled:opacity-50 bg-white"
                                >
                                    <ChevronDown size={16} /> Backward
                                </button>
                                <button
                                    onClick={() => selectedElement && changeZIndex(selectedElement, 'front')}
                                    disabled={!selectedElement}
                                    className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors disabled:opacity-50 bg-white"
                                >
                                    <ChevronsUp size={16} /> To front
                                </button>
                                <button
                                    onClick={() => selectedElement && changeZIndex(selectedElement, 'back')}
                                    disabled={!selectedElement}
                                    className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors disabled:opacity-50 bg-white"
                                >
                                    <ChevronsDown size={16} /> To back
                                </button>
                            </div>
                        </div>

                        {/* Align Elements */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Align elements</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {/* Top */}
                                <button
                                    onClick={() => selectedElement && alignElements([selectedElement], 'top')}
                                    disabled={!selectedElement}
                                    className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors disabled:opacity-50 bg-white"
                                >
                                    <AlignStartVertical size={16} className="rotate-180" /> Top
                                </button>
                                {/* Left */}
                                <button
                                    onClick={() => selectedElement && alignElements([selectedElement], 'left')}
                                    disabled={!selectedElement}
                                    className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors disabled:opacity-50 bg-white"
                                >
                                    <AlignLeft size={16} /> Left
                                </button>
                                {/* Middle */}
                                <button
                                    onClick={() => selectedElement && alignElements([selectedElement], 'middle')}
                                    disabled={!selectedElement}
                                    className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors disabled:opacity-50 bg-white"
                                >
                                    <AlignCenterVertical size={16} /> Middle
                                </button>
                                {/* Center */}
                                <button
                                    onClick={() => selectedElement && alignElements([selectedElement], 'center')}
                                    disabled={!selectedElement}
                                    className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors disabled:opacity-50 bg-white"
                                >
                                    <AlignCenter size={16} /> Centre
                                </button>
                                {/* Bottom */}
                                <button
                                    onClick={() => selectedElement && alignElements([selectedElement], 'bottom')}
                                    disabled={!selectedElement}
                                    className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors disabled:opacity-50 bg-white"
                                >
                                    <AlignEndVertical size={16} /> Bottom
                                </button>
                                {/* Right */}
                                <button
                                    onClick={() => selectedElement && alignElements([selectedElement], 'right')}
                                    disabled={!selectedElement}
                                    className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors disabled:opacity-50 bg-white"
                                >
                                    <AlignRight size={16} /> Right
                                </button>
                            </div>
                        </div>

                        {/* Advanced */}
                        {selectedElementData && (
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Advanced</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                    {/* Width */}
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Width</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={Math.round(selectedElementData.width)}
                                                onChange={(e) => updateElement(selectedElement, { width: parseInt(e.target.value) })}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            />
                                            <span className="absolute right-3 top-2 text-xs text-gray-400">px</span>
                                        </div>
                                    </div>
                                    {/* Height */}
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Height</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={Math.round(selectedElementData.height)}
                                                onChange={(e) => updateElement(selectedElement, { height: parseInt(e.target.value) })}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            />
                                            <span className="absolute right-3 top-2 text-xs text-gray-400">px</span>
                                        </div>
                                    </div>
                                    {/* X */}
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">X</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={Math.round(selectedElementData.x)}
                                                onChange={(e) => updateElement(selectedElement, { x: parseInt(e.target.value) })}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            />
                                            <span className="absolute right-3 top-2 text-xs text-gray-400">px</span>
                                        </div>
                                    </div>
                                    {/* Y */}
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Y</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={Math.round(selectedElementData.y)}
                                                onChange={(e) => updateElement(selectedElement, { y: parseInt(e.target.value) })}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            />
                                            <span className="absolute right-3 top-2 text-xs text-gray-400">px</span>
                                        </div>
                                    </div>
                                    {/* Rotate */}
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Rotate</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={Math.round(selectedElementData.rotation || 0)}
                                                onChange={(e) => updateElement(selectedElement, { rotation: parseInt(e.target.value) })}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            />
                                            <span className="absolute right-3 top-2 text-xs text-gray-400">°</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* LAYERS TAB */}
                {activeTab === 'layers' && (
                    <div className="flex flex-col h-full">
                        {/* Sub-tabs for Overlapping/All */}
                        <div className="px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setLayerFilter('all')}
                                    className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${layerFilter === 'all' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    All ({elements.length})
                                </button>
                                <button
                                    onClick={() => setLayerFilter('overlapping')}
                                    disabled={!selectedElement}
                                    className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${layerFilter === 'overlapping' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
                                        } ${!selectedElement ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Overlapping
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {displayedElements.map((el, index) => {
                                const isSelected = selectedElement === el.id || selectedElements.has(el.id);
                                const isGroup = el.type === 'group';

                                return (
                                    <div
                                        key={el.id}
                                        onClick={() => setSelectedElement(el.id)}
                                        draggable={true}
                                        onDragStart={(e) => handleDragStart(e, el.id)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, el.id)}
                                        className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer group hover:shadow-sm transition-all relative ${isSelected
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-transparent hover:border-gray-200 bg-white hover:bg-gray-50'
                                            } ${draggedItemId === el.id ? 'opacity-50' : ''}`}
                                    >
                                        {/* Drag Handle */}
                                        <div className="cursor-grab text-gray-300 hover:text-gray-500 p-1">
                                            <GripVertical size={14} />
                                        </div>

                                        {/* Thumbnail / Icon */}
                                        <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-gray-500 ${isSelected ? 'bg-white' : 'bg-gray-100'}`}>
                                            {getElementIcon(el.type)}
                                        </div>

                                        {/* Element Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-gray-700 truncate capitalize">
                                                {el.type}
                                                {el.type === 'text' && ` - "${(el.content || '').substring(0, 10)}..."`}
                                            </div>
                                            {isGroup && <div className="text-[10px] text-gray-400">{el.elements?.length || 0} items</div>}
                                        </div>

                                        {/* Actions */}
                                        <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-opacity">
                                            <MoreHorizontal size={14} className="text-gray-500" />
                                        </button>

                                        {lockedElements.has(el.id) && <Lock size={12} className="text-gray-400" />}

                                    </div>
                                );
                            })}

                            {displayedElements.length === 0 && (
                                <div className="text-center py-10 text-gray-500 text-sm">
                                    {layerFilter === 'overlapping'
                                        ? 'No overlapping elements found.'
                                        : 'No elements on this page.'}
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PositionPanel;
