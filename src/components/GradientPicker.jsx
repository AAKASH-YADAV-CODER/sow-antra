import React, { useState, useEffect, useCallback } from 'react';
import { gradientPresets } from '../types/types.js';
import { Trash2 } from 'lucide-react';

const GradientPicker = ({ gradient, onGradientChange }) => {
  const [localGradient, setLocalGradient] = useState(() => {
    const defaultGradient = {
      type: 'linear',
      colors: ['#3b82f6', '#ef4444'],
      stops: [0, 100],
      angle: 90,
      position: { x: 50, y: 50 }
    };
    return gradient ? { ...defaultGradient, ...gradient } : defaultGradient;
  });

  useEffect(() => {
    if (gradient) {
      const validatedGradient = {
        type: gradient.type || 'linear',
        colors: (gradient.colors && Array.isArray(gradient.colors) && gradient.colors.length > 0)
          ? gradient.colors.filter(color => color && typeof color === 'string')
          : ['#3b82f6', '#ef4444'],
        stops: (gradient.stops && Array.isArray(gradient.stops))
          ? gradient.stops.map(stop => Math.max(0, Math.min(100, stop || 0)))
          : [0, 100],
        angle: gradient.angle || 90,
        position: gradient.position || { x: 50, y: 50 }
      };
      setLocalGradient(validatedGradient);
    }
  }, [gradient]);

  const updateGradient = (updates) => {
    const newGradient = { ...localGradient, ...updates };
    setLocalGradient(newGradient);
    if (onGradientChange) onGradientChange(newGradient);
  };

  const addColorStop = () => {
    if (localGradient.colors.length >= 5) return;
    const newColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    const newColors = [...localGradient.colors, newColor];
    const newStops = [...localGradient.stops];
    if (newStops.length === 0) {
      newStops.push(0, 100);
    } else if (newStops.length === 1) {
      newStops.push(50, 100);
    } else {
      let maxGap = 0;
      let insertIndex = 0;
      for (let i = 0; i < newStops.length - 1; i++) {
        const gap = newStops[i + 1] - newStops[i];
        if (gap > maxGap) {
          maxGap = gap;
          insertIndex = i + 1;
        }
      }
      const newStop = newStops[insertIndex - 1] + Math.floor(maxGap / 2);
      newStops.splice(insertIndex, 0, newStop);
    }
    updateGradient({ colors: newColors, stops: newStops });
  };

  const removeColorStop = (index) => {
    if (localGradient.colors.length <= 2) return;
    const newColors = localGradient.colors.filter((_, i) => i !== index);
    const newStops = localGradient.stops.filter((_, i) => i !== index);
    updateGradient({ colors: newColors, stops: newStops });
  };

  const updateColorStop = (index, color) => {
    const newColors = [...localGradient.colors];
    newColors[index] = color;
    updateGradient({ colors: newColors });
  };

  const updateStopPosition = (index, position) => {
    const newStops = [...localGradient.stops];
    newStops[index] = Math.max(0, Math.min(100, parseInt(position) || 0));
    const sortedPairs = newStops.map((stop, i) => ({ stop, color: localGradient.colors[i] })).sort((a, b) => a.stop - b.stop);
    const sortedStops = sortedPairs.map(pair => pair.stop);
    const sortedColors = sortedPairs.map(pair => pair.color);
    updateGradient({ stops: sortedStops, colors: sortedColors });
  };

  const getGradientString = () => {
    if (!localGradient.colors || localGradient.colors.length === 0) {
      return 'linear-gradient(90deg, #3b82f6 0%, #ef4444 100%)';
    }
    const colorStops = localGradient.colors.map((color, i) => `${color} ${localGradient.stops[i]}%`).join(', ');
    if (localGradient.type === 'linear') {
      return `linear-gradient(${localGradient.angle || 0}deg, ${colorStops})`;
    } else {
      return `radial-gradient(circle at ${localGradient.position?.x || 50}% ${localGradient.position?.y || 50}%, ${colorStops})`;
    }
  };

  const applyPreset = useCallback((preset) => {
    const newGradient = {
      type: preset.type,
      colors: preset.colors.slice(),
      stops: preset.stops.slice(),
      angle: preset.angle !== undefined ? preset.angle : 90,
      position: preset.position ? { ...preset.position } : { x: 50, y: 50 }
    };
    setLocalGradient(newGradient);
    if (onGradientChange) onGradientChange(newGradient);
  }, [onGradientChange]);

  return (
    <div className="gradient-picker mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200 max-w-full overflow-hidden
                    md:p-3 lg:p-4 sm:p-2" 
         style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto' }}>
      
      {/* Gradient Type Selector */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-2 md:text-base sm:text-xs">Gradient Type</label>
        <div className="flex gap-2">
          <button
            onClick={() => updateGradient({ type: 'linear' })}
            className={`flex-1 p-2 rounded-lg border-2 transition-all text-sm font-medium
                       md:p-2.5 lg:p-3 sm:p-1.5 sm:text-xs
                       ${localGradient.type === 'linear' 
                         ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                         : 'bg-white border-gray-300 hover:border-blue-300 hover:shadow-sm'}`}
          >
            Linear
          </button>
          <button
            onClick={() => updateGradient({ type: 'radial' })}
            className={`flex-1 p-2 rounded-lg border-2 transition-all text-sm font-medium
                       md:p-2.5 lg:p-3 sm:p-1.5 sm:text-xs
                       ${localGradient.type === 'radial' 
                         ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                         : 'bg-white border-gray-300 hover:border-blue-300 hover:shadow-sm'}`}
          >
            Radial
          </button>
        </div>
      </div>

      {/* Gradient Preview */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 md:text-base sm:text-xs">
          Gradient Preview
        </label>
        <div 
          className="w-full h-12 rounded-lg border-2 border-gray-300 shadow-inner
                     cursor-pointer hover:border-blue-400 hover:shadow-md transition-all
                     md:h-14 sm:h-10"
          style={{ background: getGradientString() }}
          onClick={(e) => {
            if (localGradient.colors.length >= 5) {
              alert('Maximum 5 color stops reached');
              return;
            }
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = Math.round((clickX / rect.width) * 100);
            
            const newColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
            const newColors = [...localGradient.colors, newColor];
            const newStops = [...localGradient.stops, percentage];
            
            const pairs = newStops.map((stop, i) => ({ stop, color: newColors[i] }))
              .sort((a, b) => a.stop - b.stop);
            
            updateGradient({ 
              colors: pairs.map(p => p.color), 
              stops: pairs.map(p => p.stop) 
            });
          }}
          title="Click on gradient bar to add a color at that position"
        />
        
        {/* Interactive Color Stops Bar */}
        <div className="relative w-full h-8 mt-2 bg-gray-100 rounded-lg border border-gray-300
                        md:h-10 sm:h-7">
          {localGradient.colors.map((color, index) => (
            <div
              key={`bar-stop-${index}`}
              className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
                         group"
              style={{ left: `${localGradient.stops[index]}%` }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="relative">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateColorStop(index, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-6 h-6 cursor-pointer rounded-full border-2 border-white shadow-lg
                             hover:scale-125 transition-transform
                             md:w-7 md:h-7 sm:w-5 sm:h-5"
                  title={`Edit color ${index + 1}: ${color}`}
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 text-white 
                               text-xs rounded-full flex items-center justify-center font-bold
                               pointer-events-none shadow
                               md:w-3.5 md:h-3.5 sm:w-2.5 sm:h-2.5"
                     style={{ fontSize: '7px' }}>
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {localGradient.type === 'linear' && (
        <div className="mb-3">
          <label className="block text-sm font-medium mb-2 md:text-base sm:text-xs">
            Angle: {localGradient.angle || 0}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={localGradient.angle || 0}
            onChange={(e) => updateGradient({ angle: parseInt(e.target.value) || 0 })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(localGradient.angle || 0) / 360 * 100}%, #e5e7eb ${(localGradient.angle || 0) / 360 * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
      )}

      {localGradient.type === 'radial' && (
        <div className="mb-3">
          <label className="block text-sm font-medium mb-2 md:text-base sm:text-xs">
            Radial Center Position
          </label>
          <div className="grid grid-cols-2 gap-3 md:gap-4 sm:gap-2">
            <div>
              <label className="text-xs block mb-1.5 text-gray-600 font-medium md:text-sm sm:text-xs">
                X: {localGradient.position?.x || 50}%
              </label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="1" 
                value={localGradient.position?.x || 50} 
                onChange={(e) => updateGradient({ 
                  position: { 
                    ...localGradient.position, 
                    x: parseInt(e.target.value) || 50 
                  }
                })} 
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${localGradient.position?.x || 50}%, #e5e7eb ${localGradient.position?.x || 50}%, #e5e7eb 100%)`
                }}
              />
            </div>
            <div>
              <label className="text-xs block mb-1.5 text-gray-600 font-medium md:text-sm sm:text-xs">
                Y: {localGradient.position?.y || 50}%
              </label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="1" 
                value={localGradient.position?.y || 50} 
                onChange={(e) => updateGradient({ 
                  position: { 
                    ...localGradient.position, 
                    y: parseInt(e.target.value) || 50 
                  }
                })} 
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${localGradient.position?.y || 50}%, #e5e7eb ${localGradient.position?.y || 50}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mb-3">
        <div className="flex justify-between items-center mb-3 gap-2">
          <label className="block text-sm font-medium md:text-base sm:text-xs">
            Color Stops ({localGradient.colors.length}/5)
          </label>
          <button 
            onClick={addColorStop}
            disabled={localGradient.colors.length >= 5}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                       rounded-lg text-xs font-medium shadow-sm
                       hover:from-blue-600 hover:to-blue-700 hover:shadow-md
                       disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed
                       transition-all active:scale-95
                       md:px-4 md:py-2 md:text-sm sm:px-2 sm:py-1 sm:text-xs"
            title={localGradient.colors.length >= 5 ? 'Maximum 5 colors' : 'Add color in largest gap'}
          >
            + Add
          </button>
        </div>
        <div className="grid gap-1 
                        grid-cols-2 
                        sm:grid-cols-3 sm:gap-1
                        md:grid-cols-4 md:gap-1.5 
                        lg:grid-cols-5 lg:gap-2">
          {localGradient.colors.map((color, index) => (
            <div 
              key={`stop-${index}`} 
              className="flex flex-col items-center gap-0.5 bg-white rounded-lg border-2 border-gray-200 p-1
                         hover:border-blue-300 hover:shadow-md transition-all
                         sm:p-1 sm:gap-0.5
                         md:p-1.5 md:gap-1
                         lg:p-1.5 lg:gap-1"
            >
              {/* Color Picker with Badge */}
              <div 
                className="relative flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <input 
                  type="color" 
                  value={color} 
                  onChange={(e) => {
                    e.stopPropagation();
                    updateColorStop(index, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="cursor-pointer rounded border border-gray-300
                             hover:border-blue-400 hover:scale-105 transition-all
                             w-7 h-7
                             sm:w-7 sm:h-7
                             md:w-8 md:h-8
                             lg:w-9 lg:h-9" 
                  title={`Click to change color ${index + 1}`}
                />
                <div className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white 
                               rounded-full flex items-center justify-center font-bold
                               pointer-events-none shadow-md
                               w-3 h-3
                               sm:w-3 sm:h-3
                               md:w-3.5 md:h-3.5
                               lg:w-4 lg:h-4"
                     style={{ fontSize: '7px' }}>
                  {index + 1}
                </div>
              </div>

              {/* Position Display */}
              <div className="text-center w-full">
                <div className="font-mono text-gray-700 font-bold text-xs">
                  {localGradient.stops[index]}%
                </div>
              </div>

              {/* Position Slider */}
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="1" 
                value={localGradient.stops[index]} 
                onChange={(e) => updateStopPosition(index, e.target.value)} 
                className="w-full bg-gray-200 rounded-full appearance-none cursor-pointer
                           h-1.5
                           sm:h-1.5
                           md:h-2
                           lg:h-2"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${localGradient.stops[index]}%, #e5e7eb ${localGradient.stops[index]}%, #e5e7eb 100%)`
                }}
                title={`Adjust position: ${localGradient.stops[index]}%`}
              />

              {/* Delete Button Below - Compact */}
              <button 
                onClick={() => removeColorStop(index)} 
                disabled={localGradient.colors.length <= 2} 
                className="w-full py-0.5 text-red-500 hover:text-white hover:bg-red-500
                           disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent
                           transition-all rounded border border-red-200 hover:border-red-500
                           active:scale-95 flex items-center justify-center"
                title={localGradient.colors.length <= 2 ? 'Min 2 colors' : `Remove color ${index + 1}`}
              >
                <Trash2 className="w-2 h-2 flex-shrink-0
                                   sm:w-2 sm:h-2 
                                   md:w-2.5 md:h-2.5 
                                   lg:w-2.5 lg:h-2.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-2">Quick Presets</label>
        <div className="grid grid-cols-4 gap-2">
          {gradientPresets.map((preset, index) => {
            const colorStops = preset.colors.map((color, i) => `${color} ${preset.stops[i]}%`).join(', ');
            const gradientString = preset.type === 'linear' ? `linear-gradient(${preset.angle}deg, ${colorStops})` : `radial-gradient(circle at ${preset.position?.x || 50}% ${preset.position?.y || 50}%, ${colorStops})`;

            return (
              <div key={`preset-${index}`} onMouseUp={(e) => { e.stopPropagation(); applyPreset(preset); }} className="h-10 rounded border-2 border-gray-300 hover:border-blue-500 hover:scale-105 transition-all duration-200 gradient-fix cursor-pointer relative" style={{ background: gradientString }} title={`${preset.name} (${preset.type === 'radial' ? 'Radial' : 'Linear'})`}>
                <div className="absolute bottom-0 right-0 text-xs bg-black bg-opacity-60 text-white px-1 rounded-tl pointer-events-none" style={{ pointerEvents: 'none' }}>{preset.type === 'radial' ? 'R' : 'L'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS to fix color input styling */}
      <style>{`
        .gradient-picker input[type="color"] {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          padding: 0;
        }
        
        .gradient-picker input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
          border-radius: 0.5rem;
        }
        
        .gradient-picker input[type="color"]::-webkit-color-swatch {
          border: none;
          border-radius: 0.5rem;
        }
        
        .gradient-picker input[type="color"]::-moz-color-swatch {
          border: none;
          border-radius: 0.5rem;
        }
        
        .gradient-picker input[type="color"]:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default GradientPicker;
