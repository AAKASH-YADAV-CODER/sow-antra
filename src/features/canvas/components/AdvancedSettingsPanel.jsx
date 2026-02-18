import React from 'react';
import { X, AlignStartVertical, AlignCenterVertical, AlignEndVertical, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdvancedSettingsPanel = ({
    show,
    onClose,
    selectedElement,
    selectedElementData,
    updateElement,
    filterOptions,
    updateFilter
}) => {
    useTranslation();

    if (!show || !selectedElementData) return null;

    const handleUpdate = (updates) => {
        updateElement(selectedElement, updates);
    };

    return (
        <div className="absolute left-[72px] top-[64px] bottom-0 w-80 bg-white border-r border-gray-200 z-[100] flex flex-col shadow-xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">Advanced settings</h2>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Text section */}
                {selectedElementData.type === 'text' && (
                    <>
                        <section>
                            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Spacing</h3>
                            <div className="space-y-4">
                                {/* Letter Spacing */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-sm font-medium text-gray-600">Letter spacing</label>
                                        <input
                                            type="number"
                                            value={selectedElementData.letterSpacing || 0}
                                            onChange={(e) => handleUpdate({ letterSpacing: parseFloat(e.target.value) || 0 })}
                                            className="w-12 text-right text-xs bg-gray-50 border border-gray-200 rounded p-1"
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min="-100"
                                        max="800"
                                        value={selectedElementData.letterSpacing || 0}
                                        onChange={(e) => handleUpdate({ letterSpacing: parseFloat(e.target.value) })}
                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                </div>

                                {/* Line Spacing */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-sm font-medium text-gray-600">Line spacing</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={selectedElementData.lineHeight || 1.4}
                                            onChange={(e) => handleUpdate({ lineHeight: parseFloat(e.target.value) || 1.2 })}
                                            className="w-12 text-right text-xs bg-gray-50 border border-gray-200 rounded p-1"
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2.5"
                                        step="0.1"
                                        value={selectedElementData.lineHeight || 1.4}
                                        onChange={(e) => handleUpdate({ lineHeight: parseFloat(e.target.value) })}
                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Anchor text box</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleUpdate({ textAnchor: 'top' })}
                                    className={`flex-1 p-3 rounded-md border transition-all flex justify-center ${(selectedElementData.textAnchor || 'top') === 'top'
                                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <AlignStartVertical size={20} />
                                </button>
                                <button
                                    onClick={() => handleUpdate({ textAnchor: 'middle' })}
                                    className={`flex-1 p-3 rounded-md border transition-all flex justify-center ${selectedElementData.textAnchor === 'middle'
                                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <AlignCenterVertical size={20} />
                                </button>
                                <button
                                    onClick={() => handleUpdate({ textAnchor: 'bottom' })}
                                    className={`flex-1 p-3 rounded-md border transition-all flex justify-center ${selectedElementData.textAnchor === 'bottom'
                                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <AlignEndVertical size={20} />
                                </button>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Formatting</h3>
                            <div className="space-y-4">
                                <label className="text-sm font-medium text-gray-600 block">Text position</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdate({ textPosition: 'normal' })}
                                        className={`flex-1 p-2 rounded-md border transition-all text-sm font-bold ${(selectedElementData.textPosition || 'normal') === 'normal'
                                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        A2
                                    </button>
                                    <button
                                        onClick={() => handleUpdate({ textPosition: 'superscript' })}
                                        className={`flex-1 p-2 rounded-md border transition-all flex justify-center items-center ${(selectedElementData.textPosition === 'superscript')
                                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                        title="Superscript"
                                    >
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-sm font-bold">A</span>
                                            <span className="text-[10px] font-bold -translate-y-1">2</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleUpdate({ textPosition: 'subscript' })}
                                        className={`flex-1 p-2 rounded-md border transition-all flex justify-center items-center ${(selectedElementData.textPosition === 'subscript')
                                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                        title="Subscript"
                                    >
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-sm font-bold">A</span>
                                            <span className="text-[10px] font-bold translate-y-0.5">2</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Typography</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 block mb-2">Kerning</label>
                                    <div className="text-[10px] text-gray-500 mb-3 leading-tight">Refine letter spacing for visual balance</div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdate({ fontKerning: 'auto' })}
                                            className={`flex-1 p-2 rounded-md border transition-all flex justify-center items-center ${(selectedElementData.fontKerning || 'auto') === 'auto'
                                                ? 'border-purple-600 bg-purple-50 text-purple-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-500'
                                                }`}
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleUpdate({ fontKerning: 'normal' })}
                                            className={`flex-1 p-2 rounded-md border transition-all text-xs font-bold ${selectedElementData.fontKerning === 'normal'
                                                ? 'border-purple-600 bg-purple-50 text-purple-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-500'
                                                }`}
                                        >
                                            VA
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600 block mb-2">Ligatures</label>
                                    <div className="text-[10px] text-gray-500 mb-3 leading-tight">Combine specific characters elegantly</div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdate({ fontVariantLigatures: 'none' })}
                                            className={`flex-1 p-2 rounded-md border transition-all text-sm italic ${(selectedElementData.fontVariantLigatures || 'none') === 'none'
                                                ? 'border-purple-600 bg-purple-50 text-purple-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-500'
                                                }`}
                                        >
                                            fi
                                        </button>
                                        <button
                                            onClick={() => handleUpdate({ fontVariantLigatures: 'common-ligatures' })}
                                            className={`flex-1 p-2 rounded-md border transition-all text-sm italic ${selectedElementData.fontVariantLigatures === 'common-ligatures'
                                                ? 'border-purple-600 bg-purple-50 text-purple-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-500'
                                                }`}
                                            style={{ fontVariantLigatures: 'common-ligatures' }}
                                        >
                                            fi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {/* Image section */}
                {selectedElementData.type === 'image' && (
                    <section>
                        <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Filters</h3>
                        <div className="space-y-4">
                            {Object.entries(selectedElementData.filters || filterOptions || {}).map(([key, filter]) => (
                                <div key={key}>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-sm font-medium text-gray-600">{filter.name}</label>
                                        <span className="text-xs font-bold text-gray-500">{filter.value}{filter.unit}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={filter.max}
                                        value={filter.value}
                                        onChange={(e) => updateFilter(selectedElement, key, parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
};

export default AdvancedSettingsPanel;
