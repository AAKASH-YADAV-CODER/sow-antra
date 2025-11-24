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
  
  const [selectedStopIndex, setSelectedStopIndex] = useState(null);

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
    if (localGradient.colors.length >= 5) {
      alert('Maximum 5 color stops allowed');
      return;
    }
    
    const newColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    const newColors = [...localGradient.colors, newColor];
    
    let newStops = [...localGradient.stops];
    
    // Ensure we have matching colors and stops
    if (newStops.length === 0) {
      newStops = [0, 100];
    } else if (newStops.length === 1) {
      newStops = [0, 100];
    } else if (newStops.length < newColors.length - 1) {
      // Fill missing stops
      while (newStops.length < newColors.length - 1) {
        newStops.push(100);
      }
    }
    
    // Find the largest gap and insert new color stop there
    let maxGap = 0;
    let insertIndex = 0;
    
    for (let i = 0; i < newStops.length - 1; i++) {
      const gap = newStops[i + 1] - newStops[i];
      if (gap > maxGap) {
        maxGap = gap;
        insertIndex = i + 1;
      }
    }
    
    // Calculate new stop position (middle of the largest gap)
    const newStop = Math.round(newStops[insertIndex - 1] + (maxGap / 2));
    newStops.splice(insertIndex, 0, newStop);
    
    // Sort the stops and colors together
    const pairs = newStops.map((stop, i) => ({ stop, color: newColors[i] }))
      .sort((a, b) => a.stop - b.stop);
    
    const sortedStops = pairs.map(p => p.stop);
    const sortedColors = pairs.map(p => p.color);
    
    updateGradient({ colors: sortedColors, stops: sortedStops });
  }, [localGradient, updateGradient]);

  const removeColorStop = useCallback((index) => {
    if (localGradient.colors.length <= 2) {
      alert('Minimum 2 color stops required');
      return;
    }
    
    const newColors = localGradient.colors.filter((_, i) => i !== index);
    const newStops = localGradient.stops.filter((_, i) => i !== index);
    
    // Ensure stops are still valid after removal
    if (newColors.length !== newStops.length) {
      console.error('Color and stop count mismatch after removal');
      return;
    }
    
    updateGradient({ colors: newColors, stops: newStops });
  }, [localGradient, updateGradient]);

  const updateColorStop = useCallback((index, color) => {
    if (index < 0 || index >= localGradient.colors.length) {
      console.error('Invalid color stop index:', index);
      return;
    }
    
    const newColors = [...localGradient.colors];
    newColors[index] = color;
    updateGradient({ colors: newColors });
  }, [localGradient, updateGradient]);

  const updateStopPosition = useCallback((index, position) => {
    if (index < 0 || index >= localGradient.stops.length) {
      console.error('Invalid stop position index:', index);
      return;
    }
    
    const newStops = [...localGradient.stops];
    const parsedPosition = parseInt(position);
    
    if (isNaN(parsedPosition)) {
      console.error('Invalid position value:', position);
      return;
    }
    
    newStops[index] = Math.max(0, Math.min(100, parsedPosition));
    
    // Sort both arrays together to maintain color-stop relationship
    const sortedPairs = newStops.map((stop, i) => ({
      stop,
      color: localGradient.colors[i] || '#000000'
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
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 md:text-base sm:text-xs">
          Gradient Preview
        </label>
        <div className="relative">
          <div 
            className="w-full h-10 rounded-lg border-2 border-gray-300 gradient-fix shadow-inner
                       md:h-12 sm:h-8"
            style={{ background: getGradientString() }}
          />
          {/* Color stop indicators */}
          {localGradient.type === 'linear' && (
            <div className="absolute top-0 w-full h-full pointer-events-none">
              {localGradient.stops.map((stop, index) => (
                <div
                  key={`indicator-${index}`}
                  className="absolute top-0 h-full w-0.5 bg-white shadow-md"
                  style={{ 
                    left: `${stop}%`,
                    opacity: 0.7
                  }}
                >
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 
                                  w-3 h-3 bg-white border-2 border-gray-700 rounded-full
                                  md:w-4 md:h-4 sm:w-2 sm:h-2" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 text-center mt-2 md:text-sm sm:text-xs">
          {localGradient.colors.length} color stops • {localGradient.type === 'linear' ? `${localGradient.angle}°` : 'Radial'}
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
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium md:text-base sm:text-xs">
            Color Stops ({localGradient.colors.length}/5)
          </label>
          <button
            onClick={addColorStop}
            disabled={localGradient.colors.length >= 5}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                       rounded-lg text-xs font-medium shadow-sm
                       hover:from-blue-600 hover:to-blue-700 hover:shadow-md
                       disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed
                       disabled:shadow-none
                       transition-all duration-200 active:scale-95
                       md:px-5 md:py-2.5 md:text-sm sm:px-3 sm:py-1.5 sm:text-xs"
            title={localGradient.colors.length >= 5 ? 'Maximum 5 color stops reached' : 'Add new color stop'}
          >
            + Add Color
          </button>
        </div>
        
        <div className="space-y-2 md:space-y-3 sm:space-y-1.5">
          {localGradient.colors.map((color, index) => (
            <div 
              key={`color-stop-${index}-${color}`} 
              className="flex items-center space-x-2 p-2.5 bg-white rounded-lg border-2 border-gray-200
                         hover:border-blue-300 hover:shadow-sm
                         transition-all duration-150
                         md:space-x-3 md:p-3 sm:space-x-1.5 sm:p-2"
            >
              <div className="relative">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateColorStop(index, e.target.value)}
                  className="w-10 h-10 cursor-pointer rounded-lg border-2 border-gray-300 
                             hover:border-blue-400 transition-colors
                             md:w-12 md:h-12 sm:w-8 sm:h-8"
                  title={`Color ${index + 1}: ${color}`}
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white 
                               text-xs rounded-full flex items-center justify-center
                               md:w-5 md:h-5 sm:w-3 sm:h-3 sm:text-xs"
                     style={{ fontSize: '9px' }}>
                  {index + 1}
                </div>
              </div>
              
              <div className="flex flex-col flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-gray-700 font-medium w-10 
                                   md:text-sm sm:text-xs">
                    {localGradient.stops[index]}%
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={localGradient.stops[index]}
                    onChange={(e) => updateStopPosition(index, e.target.value)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded
                               focus:border-blue-500 focus:outline-none
                               md:text-sm sm:text-xs"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={localGradient.stops[index]}
                  onChange={(e) => updateStopPosition(index, e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${localGradient.stops[index]}%, #e5e7eb ${localGradient.stops[index]}%, #e5e7eb 100%)`
                  }}
                />
              </div>
              
              <button
                onClick={() => removeColorStop(index)}
                disabled={localGradient.colors.length <= 2}
                className="p-2 text-red-500 hover:text-white hover:bg-red-500
                           disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent
                           transition-all duration-150 rounded-lg border border-red-200
                           hover:border-red-500 active:scale-95
                           md:p-2.5 sm:p-1.5"
                title={localGradient.colors.length <= 2 ? 'Minimum 2 colors required' : `Remove color ${index + 1}`}
              >
                <Trash2 size={16} className="md:w-5 md:h-5 sm:w-3 sm:h-3" />
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
                           hover:border-blue-500 hover:scale-105 hover:shadow-lg
                           transition-all duration-200 cursor-pointer relative shadow-sm
                           active:scale-95"
                style={{
                  background: gradientString,
                  pointerEvents: 'auto'
                }}
                title={`${preset.name} (${preset.type === 'radial' ? 'Radial' : 'Linear'})`}
              >
                <div 
                  className="absolute bottom-0 right-0 text-xs bg-black bg-opacity-70 
                             text-white px-1.5 py-0.5 rounded-tl pointer-events-none
                             font-medium
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
