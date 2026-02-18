import React, { useState } from 'react';
import { X, Sliders, Sparkles, Layers, Wand2, Loader2 } from 'lucide-react';
import { imageEffects, imageFilterCategories, imageShadows } from '../../../utils/constants';

const AdjustmentSlider = ({ label, value, min, max, onChange, unit = '' }) => (
    <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-gray-600">{label}</label>
            <span className="text-xs font-bold text-gray-500">{Math.round(value)}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
    </div>
);

const EditImagePanel = ({
    isOpen,
    onClose,
    selectedElement,
    selectedElementData,
    updateElement,
    handleRemoveBackground,
    isProcessingBG,
    handleRevertBackground,
    bgProcessingStatus
}) => {
    const [activeTab, setActiveTab] = useState('effects'); // 'effects'(Shadows) | 'filters' | 'adjust'

    if (!isOpen || !selectedElementData || selectedElementData.type !== 'image') return null;

    const adjustments = selectedElementData.adjustments || {};
    const shadowSettings = selectedElementData.shadowSettings || {};
    const currentShadowType = selectedElementData.shadowType || 'none';

    const handleAdjustmentChange = (key, value) => {
        updateElement(selectedElement, {
            adjustments: {
                ...adjustments,
                [key]: value
            }
        });
    };

    const handleEffectChange = (effectKey) => {
        updateElement(selectedElement, {
            imageEffect: effectKey
        });
    };

    const handleShadowTypeChange = (type) => {
        const shadowConfig = imageShadows[type];
        updateElement(selectedElement, {
            shadowType: type,
            shadowSettings: type === 'none' ? {} : { ...shadowConfig.defaults }
        });
    };

    const handleShadowSettingChange = (key, value) => {
        updateElement(selectedElement, {
            shadowSettings: {
                ...shadowSettings,
                [key]: value
            }
        });
    };

    return (
        <div className="absolute left-[72px] top-[64px] bottom-0 w-80 bg-white shadow-xl z-[100] flex flex-col border-r border-gray-200 animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h2 className="font-bold text-gray-800">Edit Image</h2>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('effects')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'effects'
                        ? 'text-purple-600 border-purple-600'
                        : 'text-gray-600 border-transparent hover:text-gray-800'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Layers size={16} /> Effects
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('filters')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'filters'
                        ? 'text-purple-600 border-purple-600'
                        : 'text-gray-600 border-transparent hover:text-gray-800'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Sparkles size={16} /> Filters
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('adjust')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'adjust'
                        ? 'text-purple-600 border-purple-600'
                        : 'text-gray-600 border-transparent hover:text-gray-800'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Sliders size={16} /> Adjust
                    </div>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto light-scrollbar bg-gray-50 p-4">

                {/* EFFECTS TAB (Shadows & Magic) */}
                {activeTab === 'effects' && (
                    <div className="space-y-6">
                        {/* Magic Section */}
                        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm overflow-hidden relative group">
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-purple-50 rounded-full blur-2xl group-hover:bg-purple-100 transition-colors" />

                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2 relative">
                                <Sparkles size={14} className="text-purple-500" />
                                Magic Tools
                            </h3>

                            <button
                                onClick={handleRemoveBackground}
                                disabled={isProcessingBG}
                                className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all relative overflow-hidden ${isProcessingBG
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-200 active:scale-[0.98]'
                                    }`}
                            >
                                {isProcessingBG ? (
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2">
                                            <Loader2 size={16} className="animate-spin text-purple-600" />
                                            <span className="text-gray-600 font-bold">Pro BG Removal</span>
                                        </div>
                                        <span className="text-[10px] text-purple-500 font-medium animate-pulse mt-1">
                                            {bgProcessingStatus || 'Refining edges...'}
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <Wand2 size={18} />
                                        <span>Magic BG Remover</span>
                                    </>
                                )}
                            </button>

                            {selectedElementData.originalSrc && !isProcessingBG && (
                                <button
                                    onClick={handleRevertBackground}
                                    className="w-full mt-2 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-all border border-dashed border-gray-200 hover:border-purple-200"
                                >
                                    <X size={14} />
                                    Revert to Original
                                </button>
                            )}

                            <p className="text-[10px] text-gray-400 mt-2 text-center font-medium">
                                High-precision AI model
                            </p>
                        </div>

                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shadows</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(imageShadows).map(([type, config]) => (
                                <button
                                    key={type}
                                    onClick={() => handleShadowTypeChange(type)}
                                    className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${currentShadowType === type
                                        ? 'border-purple-600 bg-purple-50'
                                        : 'border-gray-200 bg-white hover:border-purple-300'
                                        }`}
                                >
                                    <div className={`w-10 h-10 mb-2 rounded-full border border-gray-200 flex items-center justify-center bg-gray-100 ${type === 'none' ? '' : 'shadow-sm'}`}>
                                        {/* Simple visual representation */}
                                        {type === 'none' && <X size={16} className="text-gray-400" />}
                                        {type === 'glow' && <div className="w-4 h-4 rounded-full bg-gray-400 shadow-[0_0_8px_rgba(0,0,0,0.5)]"></div>}
                                        {type === 'drop' && <div className="w-4 h-4 rounded-full bg-gray-400 shadow-[2px_2px_4px_rgba(0,0,0,0.5)]"></div>}
                                        {type === 'outline' && <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>}
                                        {type === 'curved' && (
                                            <div className="relative w-4 h-4 bg-gray-400 rounded-sm">
                                                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-black/30 rounded-[50%]" />
                                            </div>
                                        )}
                                        {type === 'page_lift' && (
                                            <div className="relative w-4 h-4 bg-gray-400 rounded-sm shadow-[0_4px_6px_-2px_rgba(0,0,0,0.5)]"></div>
                                        )}
                                        {type === 'angled' && (
                                            <div className="relative w-4 h-4 bg-gray-400 rounded-sm">
                                                <div className="absolute top-1 -right-1 w-full h-full bg-black/20 -z-10 skew-x-12" />
                                            </div>
                                        )}
                                        {type === 'backdrop' && (
                                            <div className="relative w-4 h-4 bg-gray-400 rounded-sm">
                                                <div className="absolute top-1 left-1 w-full h-full bg-black/40 -z-10" />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-medium ${currentShadowType === type ? 'text-purple-700' : 'text-gray-600'}`}>
                                        {config.name}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Shadow Controls */}
                        {currentShadowType !== 'none' && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                <h4 className="text-xs font-bold text-gray-800 mb-4">{imageShadows[currentShadowType].name} Settings</h4>
                                {imageShadows[currentShadowType].controls.map(control => {
                                    if (control === 'color') {
                                        return (
                                            <div key={control} className="mb-4">
                                                <label className="text-xs font-medium text-gray-600 block mb-2">Color</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={shadowSettings.color || '#000000'}
                                                        onChange={(e) => handleShadowSettingChange('color', e.target.value)}
                                                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                                    />
                                                    <span className="text-xs text-gray-500 uppercase">{shadowSettings.color || '#000000'}</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <AdjustmentSlider
                                            key={control}
                                            label={control.charAt(0).toUpperCase() + control.slice(1)}
                                            value={shadowSettings[control] ?? imageShadows[currentShadowType].defaults[control]}
                                            min={control === 'angle' ? 0 : 0}
                                            max={control === 'angle' ? 360 : 100}
                                            unit={control === 'angle' ? '°' : (control === 'blur' || control === 'size' || control === 'distance' ? 'px' : '')}
                                            onChange={(val) => handleShadowSettingChange(control, val)}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}


                {/* FILTERS TAB */}
                {activeTab === 'filters' && (
                    <div className="space-y-6">
                        {/* Selected Filter Intensity Slider */}
                        {selectedElementData.imageEffect && selectedElementData.imageEffect !== 'none' && (
                            <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4 sticky top-0 z-10 shadow-sm">
                                <AdjustmentSlider
                                    label="Intensity"
                                    value={selectedElementData.filterIntensity !== undefined ? selectedElementData.filterIntensity : 100}
                                    min={0}
                                    max={100}
                                    unit="%"
                                    onChange={(val) => updateElement(selectedElement, { filterIntensity: val })}
                                />
                            </div>
                        )}

                        {/* Recent / None Option (Manual addition for quick access) */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">None</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => handleEffectChange('none')}
                                    className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${!selectedElementData.imageEffect || selectedElementData.imageEffect === 'none'
                                        ? 'border-purple-600 bg-purple-50'
                                        : 'border-gray-200 bg-white hover:border-purple-300'
                                        }`}
                                >
                                    <div
                                        className="w-full aspect-square mb-2 rounded bg-gray-100 bg-cover bg-center"
                                        style={{
                                            backgroundImage: `url(${selectedElementData.src})`
                                        }}
                                    />
                                    <span className="text-[10px] font-medium text-gray-600">None</span>
                                </button>
                            </div>
                        </div>

                        {/* Categorized Filters */}
                        {imageFilterCategories.map((category) => (
                            <div key={category.id}>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{category.name}</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {category.filters.map((filterKey) => {
                                        const effect = imageEffects[filterKey];
                                        if (!effect) return null;

                                        return (
                                            <button
                                                key={filterKey}
                                                onClick={() => handleEffectChange(filterKey)}
                                                className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${selectedElementData.imageEffect === filterKey
                                                    ? 'border-purple-600 bg-purple-50'
                                                    : 'border-gray-200 bg-white hover:border-purple-300'
                                                    }`}
                                            >
                                                <div
                                                    className="w-full aspect-square mb-2 rounded bg-gray-100 bg-cover bg-center"
                                                    style={{
                                                        backgroundImage: `url(${selectedElementData.src})`,
                                                        filter: effect.filter
                                                    }}
                                                />
                                                <span className={`text-[10px] font-medium ${selectedElementData.imageEffect === filterKey ? 'text-purple-700' : 'text-gray-600'
                                                    }`}>
                                                    {effect.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'adjust' && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <AdjustmentSlider
                            label="Brightness"
                            value={adjustments.brightness || 0}
                            min={-100}
                            max={100}
                            onChange={(val) => handleAdjustmentChange('brightness', val)}
                        />
                        <AdjustmentSlider
                            label="Contrast"
                            value={adjustments.contrast || 0}
                            min={-100}
                            max={100}
                            onChange={(val) => handleAdjustmentChange('contrast', val)}
                        />
                        <AdjustmentSlider
                            label="Saturation"
                            value={adjustments.saturation || 0}
                            min={-100}
                            max={100}
                            onChange={(val) => handleAdjustmentChange('saturation', val)}
                        />
                        <AdjustmentSlider
                            label="Tint"
                            value={adjustments.tint || 0}
                            min={-100}
                            max={100}
                            onChange={(val) => handleAdjustmentChange('tint', val)}
                        />
                        <AdjustmentSlider
                            label="Blur"
                            value={adjustments.blur || 0}
                            min={0}
                            max={50}
                            unit="px"
                            onChange={(val) => handleAdjustmentChange('blur', val)}
                        />
                        <AdjustmentSlider
                            label="Sepia"
                            value={adjustments.sepia || 0}
                            min={0}
                            max={100}
                            onChange={(val) => handleAdjustmentChange('sepia', val)}
                        />

                        <button
                            onClick={() => updateElement(selectedElement, { adjustments: {} })}
                            className="w-full mt-4 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                        >
                            Reset Adjustments
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditImagePanel;
