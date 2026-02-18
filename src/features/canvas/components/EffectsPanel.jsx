import React from 'react';
import { X } from 'lucide-react';
import { textEffects, imageEffects, textShapes, imageShadows } from '../../../utils/constants';
import { getEffectCSS, parseCSS } from '../../../utils/helpers';

const EffectThumbnail = ({ name, effectKey, isActive, isShape = false, selectedElementData, handleEffectChange, handleShapeChange }) => {
  // Determine style for preview
  let previewStyle = {};
  if (!isShape) {
    const effect = textEffects[effectKey];
    const effectCSS = getEffectCSS({
      type: 'text',
      color: selectedElementData?.color || '#000000',
      textEffect: effectKey,
      textEffectSettings: effect?.defaults || {}
    }, textEffects);
    previewStyle = parseCSS(effectCSS);
  } else if (effectKey === 'curve') {
    previewStyle = { transform: 'rotate(-10deg)', textDecoration: 'underline wavy' }; // Simple preview hack
  }

  return (
    <button
      onClick={() => isShape ? handleShapeChange(effectKey) : handleEffectChange(effectKey)}
      className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all group
                 ${isActive
          ? 'border-purple-600 bg-purple-50 shadow-sm'
          : 'border-gray-100 hover:border-gray-300 bg-white hover:bg-gray-50'
        } sm:p-1.5`}
    >
      <div
        className="w-14 h-14 flex items-center justify-center text-xl font-bold mb-1 transition-transform group-hover:scale-110 sm:w-12 sm:h-12 sm:text-lg"
        style={previewStyle}
      >
        Ag
      </div>
      <span className={`text-[10px] font-semibold transition-colors sm:text-[9px] ${isActive ? 'text-purple-700' : 'text-gray-500'}`}>
        {name}
      </span>
    </button>
  );
};

const EffectsPanel = ({
  show,
  selectedElement,
  selectedElementData,
  onUpdateElement,
  onClose
}) => {
  if (!show || !selectedElementData) return null;

  const currentEffect = selectedElementData.textEffect || 'none';
  const currentShape = selectedElementData.textShape || 'none';
  const settings = selectedElementData.textEffectSettings || {};
  const shapeSettings = selectedElementData.textShapeSettings || {};

  const handleEffectChange = (key) => {
    const effect = textEffects[key];
    if (!effect) return;
    onUpdateElement(selectedElement, {
      textEffect: key,
      textEffectSettings: { ...effect.defaults }
    });
  };

  const handleShapeChange = (key) => {
    const shape = textShapes[key];
    if (!shape) return;
    onUpdateElement(selectedElement, {
      textShape: key,
      textShapeSettings: { ...shape.defaults }
    });
  };

  const handleSettingChange = (control, value) => {
    onUpdateElement(selectedElement, {
      textEffectSettings: { ...settings, [control]: value }
    });
  };

  const handleShapeSettingChange = (control, value) => {
    onUpdateElement(selectedElement, {
      textShapeSettings: { ...shapeSettings, [control]: value }
    });
  };

  const renderSliders = (config, currentSettings, onChange) => {
    if (!config || !config.controls) return null;
    return (
      <div className="space-y-4 mt-6 p-4 bg-gray-50 rounded-lg sm:p-3 sm:mt-4">
        {config.controls.map(control => {
          const isColor = control === 'color';
          const value = currentSettings[control] ?? config.defaults[control];

          return (
            <div key={control} className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest sm:text-[9px]">
                <label>{control}</label>
                {!isColor && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => onChange(control, parseInt(e.target.value) || 0)}
                      className="w-10 text-right border-none bg-transparent font-bold text-gray-700 outline-none"
                    />
                  </div>
                )}
              </div>

              {isColor ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(control, e.target.value)}
                    className="w-8 h-8 cursor-pointer rounded-full border-2 border-white shadow-sm overflow-hidden p-0"
                  />
                  <span className="text-xs font-mono text-gray-500 uppercase">{value}</span>
                </div>
              ) : (
                <input
                  type="range"
                  min={(control === 'direction' || control === 'angle') ? 0 : 0}
                  max={(control === 'direction' || control === 'angle') ? 360 : 100}
                  value={value}
                  onChange={(e) => onChange(control, parseInt(e.target.value) || 0)}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>

      <div
        className="absolute left-[72px] top-[64px] bottom-0 bg-white shadow-2xl w-80 flex flex-col
                   animate-in slide-in-from-left duration-300
                   sm:w-full sm:max-w-xs"
        style={{ zIndex: 100 }}
        onClick={(e) => e.stopPropagation()} // Prevent deselecting element when clicking panel
      >
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-lg text-gray-800 tracking-tight">Effects</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 light-scrollbar">
          {/* Text Effects Style Section */}
          {selectedElementData.type === 'text' && (
            <div className="space-y-8">
              {/* Style Section */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Text Style</h4>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 sm:gap-2">
                  {Object.entries(textEffects).map(([key, effect]) => (
                    <EffectThumbnail
                      key={key}
                      name={effect.name}
                      effectKey={key}
                      isActive={currentEffect === key}
                      selectedElementData={selectedElementData}
                      handleEffectChange={handleEffectChange}
                      handleShapeChange={handleShapeChange}
                    />
                  ))}
                </div>
              </div>

              {/* Sliders Area */}
              {currentEffect !== 'none' && (
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{currentEffect} Settings</h4>
                  </div>
                  {renderSliders(textEffects[currentEffect], settings, handleSettingChange)}
                </div>
              )}

              {/* Shape Section */}
              <div className="pt-8 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Shape</h4>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 sm:gap-2">
                  {Object.entries(textShapes).map(([key, shape]) => (
                    <EffectThumbnail
                      key={key}
                      name={shape.name}
                      effectKey={key}
                      isActive={currentShape === key}
                      isShape={true}
                      selectedElementData={selectedElementData}
                      handleEffectChange={handleEffectChange}
                      handleShapeChange={handleShapeChange}
                    />
                  ))}
                </div>

                {/* Shape Sliders */}
                {currentShape !== 'none' && (
                  <div className="mt-6">
                    {renderSliders(textShapes[currentShape], shapeSettings, handleShapeSettingChange)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image Effects */}
          {selectedElementData.type === 'image' && (
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-4">Image Filters</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(imageEffects).map(([key, effect]) => (
                  <button
                    key={key}
                    onClick={() => onUpdateElement(selectedElement, { imageEffect: key })}
                    className={`p-3 rounded-xl text-xs font-bold transition-all border-2
                             ${selectedElementData.imageEffect === key
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                        : 'bg-white border-gray-100 hover:border-gray-300 text-gray-600'
                      }`}
                  >
                    {effect.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shape/Image Shadows */}
          {(['rectangle', 'circle', 'triangle', 'star', 'hexagon', 'image', 'sticker', 'regularPolygon', 'trapezoid', 'parallelogram', 'triangle_right', 'cross', 'speech_bubble', 'speech_bubble_round', 'thought_bubble', 'callout', 'location', 'shield', 'banner', 'ribbon', 'search', 'diamond', 'frame'].includes(selectedElementData.type)) && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shadows</h4>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {Object.entries(imageShadows).map(([type, config]) => {
                  const isActive = (selectedElementData.shadowType || 'none') === type;
                  return (
                    <button
                      key={type}
                      onClick={() => onUpdateElement(selectedElement, {
                        shadowType: type,
                        shadowSettings: type === 'none' ? {} : { ...config.defaults }
                      })}
                      className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${isActive
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                    >
                      <div className={`w-8 h-8 mb-2 rounded border border-gray-100 flex items-center justify-center bg-gray-50 ${type === 'none' ? '' : 'shadow-sm'}`} style={{ overflow: 'hidden' }}>
                        {type === 'none' && <X size={14} className="text-gray-400" />}
                        {type === 'glow' && <div className="w-3 h-3 rounded-full bg-gray-400 shadow-[0_0_6px_rgba(0,0,0,0.5)]"></div>}
                        {type === 'drop' && <div className="w-3 h-3 rounded-full bg-gray-400 shadow-[2px_2px_3px_rgba(0,0,0,0.5)]"></div>}
                        {type === 'outline' && <div className="w-3 h-3 rounded-full border-2 border-gray-400"></div>}
                        {type === 'curved' && <div className="w-3 h-2 bg-gray-400 rounded-[1px] shadow-[0_3px_2px_rgba(0,0,0,0.3)]"></div>}
                        {type === 'page_lift' && <div className="w-3 h-3 bg-gray-400 shadow-[2px_2px_4px_rgba(0,0,0,0.4)] rotate-3"></div>}
                        {type === 'angled' && <div className="w-3 h-3 bg-gray-400 skew-x-12 shadow-[2px_2px_0_rgba(0,0,0,0.2)]"></div>}
                        {type === 'backdrop' && <div className="w-3 h-3 bg-gray-600 shadow-[3px_3px_0_#9ca3af]"></div>}
                      </div>
                      <span className={`text-[9px] font-medium ${isActive ? 'text-purple-700' : 'text-gray-600'}`}>
                        {config.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Shadow Settings Sliders */}
              {selectedElementData.shadowType && selectedElementData.shadowType !== 'none' && imageShadows[selectedElementData.shadowType] && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 mb-3">{imageShadows[selectedElementData.shadowType].name} Settings</h4>
                  {renderSliders(
                    imageShadows[selectedElementData.shadowType],
                    selectedElementData.shadowSettings || {},
                    (key, val) => {
                      const currentSettings = selectedElementData.shadowSettings || {};
                      onUpdateElement(selectedElement, {
                        shadowSettings: { ...currentSettings, [key]: val }
                      });
                    }
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EffectsPanel;
