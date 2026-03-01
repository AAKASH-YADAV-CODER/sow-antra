import React from 'react';
import { X, Blend, MoveRight, Layers } from 'lucide-react';

export default function TransitionPopover({ currentTransition, onSelect, onClose }) {
    const transitions = [
        { id: 'none', label: 'None', icon: <X size={16} />, description: 'No transition' },
        { id: 'dissolve', label: 'Dissolve', icon: <Blend size={16} />, description: 'Smooth cross-fade' },
        { id: 'slide', label: 'Slide', icon: <MoveRight size={16} />, description: 'One page pushes the other' },
        { id: 'wipe', label: 'Wipe', icon: <Layers size={16} />, description: 'One page reveals the next' },
    ];

    return (
        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 w-64 z-[10000] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-sm font-bold text-gray-800">Transitions</span>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <X size={14} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
                {transitions.map((t) => (
                    <button
                        key={t.id}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${currentTransition?.type === t.id
                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                            : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                            }`}
                        onClick={() => onSelect({ type: t.id, duration: currentTransition?.duration || 0.5 })}
                    >
                        <div className={`p-2 rounded-md ${currentTransition?.type === t.id ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                            {t.icon}
                        </div>
                        <span className="text-[11px] font-bold">{t.label}</span>
                    </button>
                ))}
            </div>

            {currentTransition?.type && currentTransition.type !== 'none' && (
                <div className="border-t pt-3 mt-1">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Duration</span>
                        <span className="text-[11px] font-bold text-purple-600">{currentTransition.duration}s</span>
                    </div>
                    <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={currentTransition.duration}
                        onChange={(e) => onSelect({ ...currentTransition, duration: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1"
                    />
                </div>
            )}

            {/* Arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-200 transform rotate-45"></div>
        </div>
    );
}
