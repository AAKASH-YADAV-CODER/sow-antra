import React, { useState } from 'react';
import {
    X, Trash2,
    Sparkles
} from 'lucide-react';
import { animations, pageAnimations } from '../../../utils/constants';

const AnimationPanel = ({
    isOpen,
    onClose,
    selectedElement,
    selectedElements,
    elements,
    updateElement,
    updateElements,
    mode = 'element' // 'element' | 'page'
}) => {
    const [hoveredAnim, setHoveredAnim] = useState(null);

    if (!isOpen) return null;

    // Group animations for better UI organization (matching Canva-ish categories)
    const elementAnimationCategories = {
        'Basic': ['rise', 'pan', 'fade', 'pop', 'wipe', 'typewriter'],
        'Dynamic': ['bounce', 'tumble', 'zoomIn', 'zoomOut', 'flip'],
        'Attention': ['flash', 'pulse', 'heartbeat', 'shake', 'jiggle', 'neon'],
        'Entrance': ['slideInLeft', 'slideInRight', 'slideInUp', 'slideInDown', 'blurIn']
    };

    const handleApplyAnimation = (animKey) => {
        if (mode === 'page') {
            // Smart Page Animation Logic
            const preset = pageAnimations[animKey];
            if (!preset) return;

            // Sort elements by Y then X for natural flow
            const sortedElements = [...elements].sort((a, b) => {
                const diffY = a.y - b.y;
                if (Math.abs(diffY) > 10) return diffY; // Tolerance for row alignment
                return a.x - b.x;
            });

            const updates = sortedElements.map((el, index) => {
                // Determine animation based on element type
                let recipe = preset.recipes.default;
                if (el.type === 'text') recipe = preset.recipes.text;
                else if (el.type === 'image') recipe = preset.recipes.image;
                else if (['rectangle', 'circle', 'triangle', 'star', 'shape'].includes(el.type)) recipe = preset.recipes.shape;

                return {
                    id: el.id,
                    updates: {
                        animation: {
                            type: recipe.type,
                            duration: recipe.duration,
                            delay: index * preset.stagger, // Staggered delay
                            iteration: 1
                        }
                    }
                };
            });

            if (typeof updateElements === 'function') {
                updateElements(updates);
            } else {
                elements.forEach(el => updateElement(el.id, updates.find(u => u.id === el.id).updates, false));
            }
        } else {
            // Apply to selected element(s)
            const targetIds = selectedElement ? [selectedElement] : Array.from(selectedElements);
            targetIds.forEach(id => {
                updateElement(id, {
                    animation: {
                        type: animKey,
                        duration: 1,
                        delay: 0,
                        iteration: 1
                    }
                });
            });
        }
    };

    const handleRemoveAnimation = () => {
        if (mode === 'page') {
            const updates = elements.map(el => ({
                id: el.id,
                updates: { animation: null }
            }));

            if (typeof updateElements === 'function') {
                updateElements(updates);
            } else {
                elements.forEach(el => updateElement(el.id, { animation: null }, false));
            }
        } else {
            const targetIds = selectedElement ? [selectedElement] : Array.from(selectedElements);
            targetIds.forEach(id => {
                updateElement(id, { animation: null });
            });
        }
    };

    return (
        <div className="absolute left-[72px] top-[64px] bottom-0 w-80 bg-white shadow-xl z-[100] flex flex-col border-r border-gray-200 animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h2 className="font-bold text-gray-800">
                    {mode === 'page' ? 'Page Animations' : 'Animations'}
                </h2>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto light-scrollbar bg-gray-50 p-4">

                {/* Remove Button */}
                <button
                    onClick={handleRemoveAnimation}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors mb-6 shadow-sm"
                >
                    <Trash2 size={16} /> Remove all animations
                </button>

                {mode === 'page' ? (
                    /* Page Animations Grid */
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(pageAnimations).map(([key, preset]) => (
                            <div
                                key={key}
                                onClick={() => handleApplyAnimation(key)}
                                onMouseEnter={() => setHoveredAnim(key)}
                                onMouseLeave={() => setHoveredAnim(null)}
                                className="group cursor-pointer flex flex-col gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center">
                                        <Sparkles size={14} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-800">{preset.name}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 leading-tight">{preset.description}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Element Animations Categories */
                    Object.entries(elementAnimationCategories).map(([category, animKeys]) => (
                        <div key={category} className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 px-1">{category}</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {animKeys.map(key => {
                                    const animDef = animations[key];
                                    if (!animDef) return null;

                                    return (
                                        <div
                                            key={key}
                                            onClick={() => handleApplyAnimation(key)}
                                            onMouseEnter={() => setHoveredAnim(key)}
                                            onMouseLeave={() => setHoveredAnim(null)}
                                            className="group cursor-pointer flex flex-col items-center gap-2"
                                        >
                                            <div className={`
                                        w-full aspect-square bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden transition-all
                                        group-hover:border-purple-500 group-hover:shadow-md
                                        ${hoveredAnim === key ? 'scale-105' : ''}
                                    `}>
                                                {/* Preview Block */}
                                                <div
                                                    className="w-8 h-8 bg-purple-100 rounded text-purple-600 flex items-center justify-center"
                                                    style={{
                                                        animation: hoveredAnim === key ? `${animDef.keyframes} 1s infinite` : 'none'
                                                    }}
                                                >
                                                    <Sparkles size={16} />
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-center text-gray-600 font-medium group-hover:text-purple-600 transition-colors">
                                                {animDef.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}

                {/* Dynamic preview hint */}
                <div className="mt-8 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                    <p className="font-medium mb-1">Previewing Animations</p>
                    Hover over any animation to see a preview. Click to apply it to {mode === 'page' ? 'all elements on this page' : 'the selected element'}.
                </div>

            </div>
        </div>
    );
};

export default AnimationPanel;
