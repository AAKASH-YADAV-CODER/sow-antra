import React, { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';

const GradientPicker = ({ gradient, onGradientChange, gradientPickerKey }) => {
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

  const updateGradient = useCallback((updates) => {
    const newGradient = { ...localGradient, ...updates };
    setLocalGradient(newGradient);
    onGradientChange(newGradient);
  }, [localGradient, onGradientChange]);

  const addColorStop = useCallback(() => {
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
  }, [localGradient, updateGradient]);

  const removeColorStop = useCallback((index) => {
    if (localGradient.colors.length <= 2) return;
    const newColors = localGradient.colors.filter((_, i) => i !== index);
    const newStops = localGradient.stops.filter((_, i) => i !== index);
    updateGradient({ colors: newColors, stops: newStops });
  }, [localGradient, updateGradient]);

  const updateColorStop = useCallback((index, color) => {
    const newColors = [...localGradient.colors];
    newColors[index] = color;
    updateGradient({ colors: newColors });
  }, [localGradient, updateGradient]);

  const updateStopPosition = useCallback((index, position) => {
    const newStops = [...localGradient.stops];
    newStops[index] = Math.max(0, Math.min(100, parseInt(position) || 0));
    
    const sortedPairs = newStops.map((stop, i) => ({
      stop,
      color: localGradient.colors[i]
    })).sort((a, b) => a.stop - b.stop);
    
    const sortedStops = sortedPairs.map(pair => pair.stop);
    const sortedColors = sortedPairs.map(pair => pair.color);
    
    updateGradient({ stops: sortedStops, colors: sortedColors });
  }, [localGradient, updateGradient]);

  const getGradientString = useCallback(() => {
    if (!localGradient.colors || localGradient.colors.length === 0) {
      return 'linear-gradient(90deg, #3b82f6 0%, #ef4444 100%)';
    }
    
    const colorStops = localGradient.colors.map((color, i) => 
      `${color} ${localGradient.stops[i]}%`
    ).join(', ');
    
    if (localGradient.type === 'linear') {
      return `linear-gradient(${localGradient.angle || 0}deg, ${colorStops})`;
    } else {
      return `radial-gradient(circle at ${localGradient.position?.x || 50}% ${localGradient.position?.y || 50}%, ${colorStops})`;
    }
  }, [localGradient]);

  const gradientPresets = [
    { colors: ['#ff6b6b', '#ff8e8e', '#4ecdc4'], stops: [0, 50, 100], angle: 90, type: 'linear', name: 'Coral Sunset' },
    { colors: ['#667eea', '#764ba2', '#f093fb'], stops: [0, 60, 100], angle: 135, type: 'linear', name: 'Purple Dream' },
    { colors: ['#f093fb', '#f5576c', '#ff9a9e'], stops: [0, 40, 100], angle: 45, type: 'linear', name: 'Pink Blush' },
    { colors: ['#4facfe', '#00f2fe', '#43e97b'], stops: [0, 70, 100], angle: 180, type: 'linear', name: 'Ocean Breeze' },
    { colors: ['#43e97b', '#38f9d7', '#a8edea'], stops: [0, 50, 100], angle: 270, type: 'linear', name: 'Mint Fresh' },
    { colors: ['#fa709a', '#fee140', '#ff9a9e'], stops: [0, 30, 100], angle: 0, type: 'linear', name: 'Sunset Glow' },
    { colors: ['#30cfd0', '#330867', '#667eea'], stops: [0, 80, 100], angle: 225, type: 'linear', name: 'Deep Ocean' },
    { colors: ['#a8edea', '#fed6e3', '#f093fb'], stops: [0, 60, 100], angle: 315, type: 'linear', name: 'Soft Pastel' },
    { colors: ['#ff6b6b', '#ff8e8e', '#4ecdc4', '#a8edea'], stops: [0, 30, 70, 100], angle: 0, type: 'radial', position: { x: 50, y: 50 }, name: 'Radial Coral' },
    { colors: ['#667eea', '#764ba2', '#f093fb', '#ff9a9e'], stops: [0, 25, 60, 100], angle: 0, type: 'radial', position: { x: 30, y: 30 }, name: 'Radial Purple' },
    { colors: ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7'], stops: [0, 40, 80, 100], angle: 0, type: 'radial', position: { x: 70, y: 70 }, name: 'Radial Ocean' }
  ];

  const applyPreset = useCallback((preset) => {
    const newGradient = {
      type: preset.type,
      colors: preset.colors.slice(),
      stops: preset.stops.slice(),
      angle: preset.angle !== undefined ? preset.angle : 90,
      position: preset.position ? { ...preset.position } : { x: 50, y: 50 }
    };
    
    setLocalGradient(newGradient);
    if (onGradientChange) {
      onGradientChange(newGradient);
    }
  }, [onGradientChange]);

  return (
    <div 
      key={gradientPickerKey} 
      className="gradient-picker mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 
                 md:p-4 sm:p-2" 
      style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto' }}
    >
      <div className="mb-3">
        <div 
          className="w-full h-8 rounded-lg border-2 border-gray-300 mb-2 gradient-fix shadow-inner
                     md:h-10 sm:h-6"
          style={{ background: getGradientString() }}
        />
        <div className="text-xs text-gray-500 text-center md:text-sm sm:text-xs">
          {localGradient.colors.length} color stops
        </div>
      </div>

      {/* Gradient Type Selector */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-2 md:text-base sm:text-xs">Gradient Type</label>
        <div className="flex gap-2">
          <button
            onClick={() => updateGradient({ type: 'linear' })}
            className={`flex-1 p-2 rounded-lg border-2 transition-all
                       md:p-3 sm:p-1.5 sm:text-xs
                       ${localGradient.type === 'linear' 
                         ? 'bg-blue-500 text-white border-blue-500' 
                         : 'bg-white border-gray-300 hover:border-blue-300'}`}
          >
            Linear
          </button>
          <button
            onClick={() => updateGradient({ type: 'radial' })}
            className={`flex-1 p-2 rounded-lg border-2 transition-all
                       md:p-3 sm:p-1.5 sm:text-xs
                       ${localGradient.type === 'radial' 
                         ? 'bg-blue-500 text-white border-blue-500' 
                         : 'bg-white border-gray-300 hover:border-blue-300'}`}
          >
            Radial
          </button>
        </div>
      </div>

      {localGradient.type === 'linear' && (
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 md:text-base sm:text-xs">
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
          <div className="flex justify-between text-xs text-gray-500 mt-1 md:text-sm sm:text-xs">
            <span>0°</span>
            <span>90°</span>
            <span>180°</span>
            <span>270°</span>
            <span>360°</span>
          </div>
        </div>
      )}

      {localGradient.type === 'radial' && (
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 md:text-base sm:text-xs">Radial Center Position</label>
          <div className="grid grid-cols-2 gap-3 md:gap-4 sm:gap-2">
            <div>
              <label className="text-xs block mb-1 text-gray-600 md:text-sm sm:text-xs">X: {localGradient.position?.x || 50}%</label>
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
              />
            </div>
            <div>
              <label className="text-xs block mb-1 text-gray-600 md:text-sm sm:text-xs">Y: {localGradient.position?.y || 50}%</label>
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
              />
            </div>
          </div>
        </div>
      )}

      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 md:text-sm sm:text-xs">
            {localGradient.colors.length}/5 color stops
          </span>
          <button
            onClick={addColorStop}
            disabled={localGradient.colors.length >= 5}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs
                       hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed
                       transition-colors
                       md:px-4 md:py-1.5 md:text-sm sm:px-2 sm:py-1 sm:text-xs"
          >
            Add Color
          </button>
        </div>
        
        <div className="space-y-2 md:space-y-3 sm:space-y-1.5">
          {localGradient.colors.map((color, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200
                                        md:space-x-3 md:p-3 sm:space-x-1.5 sm:p-1.5">
              <input
                type="color"
                value={color}
                onChange={(e) => updateColorStop(index, e.target.value)}
                className="w-10 h-10 cursor-pointer rounded-lg border-2 border-gray-300 
                           md:w-12 md:h-12 sm:w-8 sm:h-8"
              />
              <span className="text-xs w-12 font-mono text-gray-600 md:text-sm sm:text-xs">
                {localGradient.stops[index]}%
              </span>
              
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={localGradient.stops[index]}
                  onChange={(e) => updateStopPosition(index, e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <button
                onClick={() => removeColorStop(index)}
                disabled={localGradient.colors.length <= 2}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 
                           disabled:opacity-30 disabled:cursor-not-allowed
                           transition-colors rounded-lg
                           md:p-2 sm:p-1"
                title="Remove color stop"
              >
                <Trash2 size={window.innerWidth < 640 ? 12 : 14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-2 md:text-base sm:text-xs">Quick Presets</label>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 sm:gap-1.5">
          {gradientPresets.map((preset, index) => {
            const colorStops = preset.colors.map((color, i) => 
              `${color} ${preset.stops[i]}%`
            ).join(', ');
            
            const gradientString = preset.type === 'linear'
              ? `linear-gradient(${preset.angle}deg, ${colorStops})`
              : `radial-gradient(circle at ${preset.position?.x || 50}% ${preset.position?.y || 50}%, ${colorStops})`;

            return (
              <div
                key={`preset-${index}`}
                onClick={() => applyPreset(preset)}
                className="h-12 md:h-14 sm:h-10 rounded-lg border-2 border-gray-300 
                           hover:border-blue-500 hover:scale-105 
                           transition-all duration-200 cursor-pointer relative shadow-sm
                           active:scale-95"
                style={{
                  background: gradientString,
                  pointerEvents: 'auto'
                }}
                title={`${preset.name} (${preset.type === 'radial' ? 'Radial' : 'Linear'})`}
              >
                <div 
                  className="absolute bottom-0 right-0 text-xs bg-black bg-opacity-60 
                             text-white px-1 rounded-tl pointer-events-none
                             md:text-sm sm:text-xs"
                >
                  {preset.type === 'radial' ? 'R' : 'L'}
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center md:text-sm sm:text-xs">
          Click any preset to apply • L = Linear, R = Radial
        </div>
      </div>
    </div>
  );
};

export default GradientPicker;
