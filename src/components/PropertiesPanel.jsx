import React from 'react';
import { Sparkles, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';
import GradientPicker from './GradientPicker';
import { animations } from '../types/types.js';

const PropertiesPanel = ({
  t,
  selectedElementData,
  selectedElement,
  updateElement,
  showEffectsPanel,
  setShowEffectsPanel,
  filterOptions,
  updateFilter,
  fontFamilies,
  gradientPickerKey,
  TransliterationToggle
}) => {
  return (
    <div className="properties-panel">
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-4">{t('properties.title')}</h2>
        
        {selectedElementData ? (
          <div>
            {/* Animation Selection */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">{t('properties.animation')}</label>
              <select
                value={selectedElementData.animation || ''}
                onChange={(e) => updateElement(selectedElement, { animation: e.target.value || null })}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">{t('effects.none')}</option>
                {Object.entries(animations).map(([key, anim]) => (
                  <option key={key} value={key}>
                    {anim.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Effects Quick Access */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">{t('properties.quickEffects')}</label>
              <button
                onClick={() => setShowEffectsPanel(!showEffectsPanel)}
                className="w-full p-2 bg-purple-100 text-purple-600 rounded text-sm hover:bg-purple-200 flex items-center justify-center"
              >
                <Sparkles size={14} className="mr-1" />
                {t('properties.openEffectsPanel')}
              </button>
            </div>

            {/* Position and Size */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">{t('properties.x')}</label>
                <input
                  type="number"
                  value={selectedElementData.x}
                  onChange={(e) => updateElement(selectedElement, { x: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('properties.y')}</label>
                <input
                  type="number"
                  value={selectedElementData.y}
                  onChange={(e) => updateElement(selectedElement, { y: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">{t('properties.width')}</label>
                <input
                  type="number"
                  value={selectedElementData.width}
                  onChange={(e) => updateElement(selectedElement, { width: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded text-sm"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('properties.height')}</label>
                <input
                  type="number"
                  value={selectedElementData.height}
                  onChange={(e) => updateElement(selectedElement, { height: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded text-sm"
                  min="1"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">{t('properties.rotation')}</label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedElementData.rotation || 0}
                onChange={(e) => updateElement(selectedElement, { rotation: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-xs text-center">{selectedElementData.rotation || 0}°</div>
            </div>

            {/* Filters */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Filters</label>
              {Object.entries(selectedElementData.filters || filterOptions).map(([key, filter]) => (
                <div key={key} className="filter-slider">
                  <label>{filter.name}</label>
                  <input
                    type="range"
                    min="0"
                    max={filter.max}
                    value={filter.value}
                    onChange={(e) => updateFilter(selectedElement, key, parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="filter-value">{filter.value}{filter.unit}</div>
                </div>
              ))}
            </div>

            {/* Fill Type Selection */}
            {['rectangle', 'circle', 'triangle', 'star', 'hexagon', 'sticker'].includes(selectedElementData.type) && (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Fill Type</label>
                  <div className="flex space-x-2 mb-3">
                    <button
                      onClick={() => updateElement(selectedElement, { fillType: 'solid' })}
                      className={`p-2 rounded text-xs flex-1 ${
                        selectedElementData.fillType === 'solid' ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'bg-gray-100 border border-gray-300'
                      }`}
                    >
                      Solid Color
                    </button>
                    <button
                      onClick={() => updateElement(selectedElement, { fillType: 'gradient' })}
                      className={`p-2 rounded text-xs flex-1 ${
                        selectedElementData.fillType === 'gradient' ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'bg-gray-100 border border-gray-300'
                      }`}
                    >
                      Gradient
                    </button>
                  </div>
                </div>

                {selectedElementData.fillType === 'solid' && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Fill Color</label>
                    <input
                      type="color"
                      value={selectedElementData.fill}
                      onChange={(e) => updateElement(selectedElement, { fill: e.target.value })}
                      className="w-full p-2 border rounded text-sm h-10 cursor-pointer"
                    />
                  </div>
                )}

                {selectedElementData.fillType === 'gradient' && (
                  <GradientPicker
                    key={gradientPickerKey}
                    gradient={selectedElementData.gradient}
                    onGradientChange={(gradient) => updateElement(selectedElement, { gradient })}
                  />
                )}
              </>
            )}

            {/* Text Properties */}
            {selectedElementData.type === 'text' && (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">{t('text.fontSize')}</label>
                  <input
                    type="number"
                    value={selectedElementData.fontSize}
                    onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded text-sm"
                    min="8"
                    max="72"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">{t('text.fontFamily')}</label>
                  <select
                    value={selectedElementData.fontFamily}
                    onChange={(e) => updateElement(selectedElement, { fontFamily: e.target.value })}
                    className="w-full p-2 border rounded text-sm"
                  >
                    {fontFamilies.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">{t('text.color')}</label>
                  <input
                    type="color"
                    value={selectedElementData.color}
                    onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                    className="w-full p-2 border rounded text-sm h-10"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">{t('text.textAlign')}</label>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => updateElement(selectedElement, { textAlign: 'left' })}
                      className={`p-2 rounded ${selectedElementData.textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                      title={t('text.left')}
                    >
                      <AlignLeft size={16} />
                    </button>
                    <button
                      onClick={() => updateElement(selectedElement, { textAlign: 'center' })}
                      className={`p-2 rounded ${selectedElementData.textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                      title={t('text.center')}
                    >
                      <AlignCenter size={16} />
                    </button>
                    <button
                      onClick={() => updateElement(selectedElement, { textAlign: 'right' })}
                      className={`p-2 rounded ${selectedElementData.textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                      title={t('text.right')}
                    >
                      <AlignRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">{t('text.textStyle')}</label>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => updateElement(selectedElement, { 
                        fontWeight: selectedElementData.fontWeight === 'bold' ? 'normal' : 'bold' 
                      })}
                      className={`p-2 rounded ${selectedElementData.fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                      title={t('text.bold')}
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      onClick={() => updateElement(selectedElement, { 
                        fontStyle: selectedElementData.fontStyle === 'italic' ? 'normal' : 'italic' 
                      })}
                      className={`p-2 rounded ${selectedElementData.fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                      title={t('text.italic')}
                    >
                      <Italic size={16} />
                    </button>
                    <button
                      onClick={() => updateElement(selectedElement, { 
                        textDecoration: selectedElementData.textDecoration === 'underline' ? 'none' : 'underline' 
                      })}
                      className={`p-2 rounded ${selectedElementData.textDecoration === 'underline' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                      title={t('text.underline')}
                    >
                      <Underline size={16} />
                    </button>
                  </div>
                </div>
                <TransliterationToggle />
              </>
            )}

            {/* Shape Properties */}
            {['rectangle', 'circle', 'triangle', 'star', 'hexagon'].includes(selectedElementData.type) && (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Stroke Color</label>
                  <input
                    type="color"
                    value={selectedElementData.stroke}
                    onChange={(e) => updateElement(selectedElement, { stroke: e.target.value })}
                    className="w-full p-2 border rounded text-sm h-10 cursor-pointer"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Stroke Width</label>
                  <input
                    type="number"
                    value={selectedElementData.strokeWidth}
                    onChange={(e) => updateElement(selectedElement, { strokeWidth: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded text-sm"
                    min="0"
                  />
                </div>
                {selectedElementData.type === 'rectangle' && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Border Radius</label>
                    <input
                      type="number"
                      value={selectedElementData.borderRadius}
                      onChange={(e) => updateElement(selectedElement, { borderRadius: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded text-sm"
                      min="0"
                    />
                  </div>
                )}
                {selectedElementData.type === 'star' && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Points</label>
                    <input
                      type="number"
                      value={selectedElementData.points || 5}
                      onChange={(e) => updateElement(selectedElement, { points: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded text-sm"
                      min="3"
                      max="20"
                    />
                  </div>
                )}
              </>
            )}

            {/* Image Properties */}
            {selectedElementData.type === 'image' && (
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Border Radius</label>
                <input
                  type="number"
                  value={selectedElementData.borderRadius}
                  onChange={(e) => updateElement(selectedElement, { borderRadius: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded text-sm"
                  min="0"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500 text-sm text-center">
            {t('properties.noSelection')}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;