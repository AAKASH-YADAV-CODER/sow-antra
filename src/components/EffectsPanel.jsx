import React from 'react';
import { textEffects, imageEffects, shapeEffects, specialEffects } from '../types/types.ts';

const EffectsPanel = ({
  showEffectsPanel,
  selectedElementData,
  selectedElement,
  updateElement,
  setShowEffectsPanel,
  t
}) => {
  if (!showEffectsPanel || !selectedElementData) return null;

  return (
    <div className="fixed right-80 top-20 bg-white shadow-lg rounded-lg p-4 w-80 z-40">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">{t ? t('effects.title') : 'Effects'}</h3>
        <button
          onClick={() => setShowEffectsPanel(false)}
          className="p-1 rounded hover:bg-gray-200"
        >
          ×
        </button>
      </div>

      {/* Text Effects */}
      {selectedElementData.type === 'text' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Text Effects</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(textEffects).map(([key, effect]) => (
              <button
                key={key}
                onClick={() => updateElement(selectedElement, { textEffect: key })}
                className={`p-2 rounded text-xs ${
                  selectedElementData.textEffect === key
                    ? 'bg-blue-100 text-blue-600 border border-blue-300'
                    : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {effect.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Effects */}
      {selectedElementData.type === 'image' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Image Effects</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(imageEffects).map(([key, effect]) => (
              <button
                key={key}
                onClick={() => updateElement(selectedElement, { imageEffect: key })}
                className={`p-2 rounded text-xs ${
                  selectedElementData.imageEffect === key
                    ? 'bg-blue-100 text-blue-600 border border-blue-300'
                    : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {effect.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shape Effects */}
      {['rectangle', 'circle', 'triangle', 'star', 'hexagon'].includes(selectedElementData.type) && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Shape Effects</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(shapeEffects).map(([key, effect]) => (
              <button
                key={key}
                onClick={() => updateElement(selectedElement, { shapeEffect: key })}
                className={`p-2 rounded text-xs ${
                  selectedElementData.shapeEffect === key
                    ? 'bg-blue-100 text-blue-600 border border-blue-300'
                    : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {effect.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Special Effects for All Elements */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Special Effects</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(specialEffects).map(([key, effect]) => (
            <button
              key={key}
              onClick={() => updateElement(selectedElement, { specialEffect: key })}
              className={`p-2 rounded text-xs ${
                selectedElementData.specialEffect === key
                  ? 'bg-blue-100 text-blue-600 border border-blue-300'
                  : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              {effect.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EffectsPanel;
