import React from 'react';
import { ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react';

const EasyReflectionPanel = ({
    isOpen,
    onClose,
    selectedElement,
    selectedElementData,
    updateElement
}) => {

    if (!isOpen) return null;

    // Default reflection settings
    const defaultReflection = {
        enabled: true,
        position: 'below',
        offset: 50,
        opacity: 50
    };

    const handleCreateReflection = () => {
        if (selectedElement) {
            updateElement(selectedElement, { reflection: defaultReflection });
        }
    };

    const handleUpdateReflection = (updates) => {
        if (selectedElement && selectedElementData?.reflection) {
            updateElement(selectedElement, {
                reflection: {
                    ...selectedElementData.reflection,
                    ...updates
                }
            });
        }
    };

    const hasReflection = selectedElementData?.reflection?.enabled;
    const reflection = selectedElementData?.reflection || defaultReflection;

    // Map positions to their display names
    const positions = [
        { id: 'below', label: 'Below' },
        { id: 'above', label: 'Above' },
        { id: 'left', label: 'Left' },
        { id: 'right', label: 'Right' }
    ];

    return (
        <div className="w-80 bg-white h-full flex flex-col animate-slide-in-left overflow-hidden shadow-xl border-r border-gray-100 z-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-800">Easy Reflections</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <ThumbsUp size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <ThumbsDown size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 light-scrollbar space-y-6">

                {/* Main Content Area */}
                {!selectedElement ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">Select an element in your design</p>
                        <button
                            disabled
                            className="w-full py-3 bg-gray-100 text-gray-400 font-bold rounded-lg cursor-not-allowed"
                        >
                            Create reflection
                        </button>
                    </div>
                ) : !hasReflection ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">Select an element in your design</p>
                        <button
                            onClick={handleCreateReflection}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.98]"
                        >
                            Create reflection
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Preview Box - just a visual representation similar to Canva's */}
                        <div className="aspect-[4/3] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center p-4 relative overflow-hidden">
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-50">
                                {/* Simple visual representation */}
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mask-image-linear-gradient" />
                                {reflection.position === 'below' && (
                                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-lg opacity-30 transform scale-y-[-1]" style={{ marginTop: `${reflection.offset / 5}px` }} />
                                )}
                            </div>
                        </div>

                        {/* Position Controls */}
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                            <h3 className="text-xs font-bold text-gray-800">Position</h3>
                            <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
                                {positions.map((pos) => (
                                    <button
                                        key={pos.id}
                                        onClick={() => handleUpdateReflection({ position: pos.id })}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                                            reflection.position === pos.id
                                                ? 'bg-white text-gray-800 shadow-sm border border-gray-200'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {pos.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sliders */}
                        <div className="space-y-5">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-gray-800">Offset</h4>
                                    <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">{reflection.offset}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={reflection.offset}
                                    onChange={(e) => handleUpdateReflection({ offset: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-gray-800">Opacity</h4>
                                    <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">{reflection.opacity}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={reflection.opacity}
                                    onChange={(e) => handleUpdateReflection({ opacity: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-gray-100 bg-white space-y-2 pb-6">
                <button
                    onClick={() => {
                        // In Canva "Add to design" applies it, we already apply in realtime, just close
                        onClose();
                    }}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm transition-all"
                >
                    Add to design
                </button>
                <button
                    onClick={() => {
                        // Remove reflection
                        if (selectedElement) {
                            updateElement(selectedElement, { reflection: null });
                        }
                        onClose();
                    }}
                    className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold rounded-lg transition-all"
                >
                    Go back
                </button>
            </div>
        </div>
    );
};

export default EasyReflectionPanel;
