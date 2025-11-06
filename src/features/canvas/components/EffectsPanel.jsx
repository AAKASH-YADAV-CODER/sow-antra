import React from 'react';
import { X } from 'lucide-react';
import { textEffects, imageEffects, shapeEffects, specialEffects } from '../../../utils/constants';

const EffectsPanel = ({ 
  show, 
  selectedElement, 
  selectedElementData, 
  onUpdateElement, 
  onClose 
}) => {
  if (!show || !selectedElementData) return null;
  
  return (
    <div className="fixed right-4 top-20 bg-white shadow-2xl rounded-lg w-80 z-40 
                    max-h-[80vh] overflow-y-auto
                    md:right-80 md:w-80
                    sm:right-2 sm:left-2 sm:w-auto sm:top-16">
      <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center
                      md:p-4 sm:p-3">
        <h3 className="font-bold text-lg md:text-xl sm:text-base">Effects</h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4 md:p-4 sm:p-3 space-y-4">
        {/* Text Effects */}
        {selectedElementData.type === 'text' && (
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 md:text-base sm:text-xs">
              Text Effects
            </label>
            <div className="grid grid-cols-2 gap-2 md:gap-3 sm:gap-1.5">
              {Object.entries(textEffects).map(([key, effect]) => (
                <button
                  key={key}
                  onClick={() => onUpdateElement(selectedElement, { textEffect: key })}
                  className={`p-2 rounded-lg text-xs font-medium transition-all
                             md:p-3 md:text-sm sm:p-1.5 sm:text-xs
                             ${selectedElementData.textEffect === key 
                               ? 'bg-blue-500 text-white shadow-md scale-105' 
                               : 'bg-gray-100 border border-gray-300 hover:bg-gray-200 hover:border-blue-300'
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
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 md:text-base sm:text-xs">
              Image Effects
            </label>
            <div className="grid grid-cols-2 gap-2 md:gap-3 sm:gap-1.5">
              {Object.entries(imageEffects).map(([key, effect]) => (
                <button
                  key={key}
                  onClick={() => onUpdateElement(selectedElement, { imageEffect: key })}
                  className={`p-2 rounded-lg text-xs font-medium transition-all
                             md:p-3 md:text-sm sm:p-1.5 sm:text-xs
                             ${selectedElementData.imageEffect === key 
                               ? 'bg-blue-500 text-white shadow-md scale-105' 
                               : 'bg-gray-100 border border-gray-300 hover:bg-gray-200 hover:border-blue-300'
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
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 md:text-base sm:text-xs">
              Shape Effects
            </label>
            <div className="grid grid-cols-2 gap-2 md:gap-3 sm:gap-1.5">
              {Object.entries(shapeEffects).map(([key, effect]) => (
                <button
                  key={key}
                  onClick={() => onUpdateElement(selectedElement, { shapeEffect: key })}
                  className={`p-2 rounded-lg text-xs font-medium transition-all
                             md:p-3 md:text-sm sm:p-1.5 sm:text-xs
                             ${selectedElementData.shapeEffect === key 
                               ? 'bg-blue-500 text-white shadow-md scale-105' 
                               : 'bg-gray-100 border border-gray-300 hover:bg-gray-200 hover:border-blue-300'
                             }`}
                >
                  {effect.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Special Effects for All Elements */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 md:text-base sm:text-xs">
            Special Effects (Animations)
          </label>
          <div className="grid grid-cols-2 gap-2 md:gap-3 sm:gap-1.5">
            {Object.entries(specialEffects).map(([key, effect]) => (
              <button
                key={key}
                onClick={() => onUpdateElement(selectedElement, { specialEffect: key })}
                className={`p-2 rounded-lg text-xs font-medium transition-all
                           md:p-3 md:text-sm sm:p-1.5 sm:text-xs
                           ${selectedElementData.specialEffect === key 
                             ? 'bg-blue-500 text-white shadow-md scale-105' 
                             : 'bg-gray-100 border border-gray-300 hover:bg-gray-200 hover:border-blue-300'
                           }`}
              >
                {effect.name}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500 text-center md:text-sm sm:text-xs">
            Select an effect to apply it to the element
          </p>
        </div>
      </div>
    </div>
  );
};

export default EffectsPanel;
