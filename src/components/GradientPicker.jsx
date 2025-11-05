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
    <div className="gradient-picker mt-3 p-3 bg-gray-50 rounded border" style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto' }}>
      <div className="mb-3">
        <div className="w-full h-8 rounded border border-gray-300 mb-2 gradient-fix" style={{ background: getGradientString() }} />
        <div className="text-xs text-gray-500 text-center">{localGradient.colors.length} color stops</div>
      </div>

      {localGradient.type === 'linear' && (
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Angle: {localGradient.angle || 0}°</label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={localGradient.angle || 0}
              onChange={(e) => updateGradient({ angle: parseInt(e.target.value) || 0 })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0°</span>
              <span>90°</span>
              <span>180°</span>
              <span>270°</span>
              <span>360°</span>
            </div>
          </div>
        </div>
      )}

      {localGradient.type === 'radial' && (
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Radial Center Position</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs block mb-1 text-gray-600">X: {localGradient.position?.x || 50}%</label>
              <input type="range" min="0" max="100" step="1" value={localGradient.position?.x || 50} onChange={(e) => updateGradient({ position: { ...localGradient.position, x: parseInt(e.target.value) || 50 } })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0%</span><span>50%</span><span>100%</span></div>
            </div>
            <div>
              <label className="text-xs block mb-1 text-gray-600">Y: {localGradient.position?.y || 50}%</label>
              <input type="range" min="0" max="100" step="1" value={localGradient.position?.y || 50} onChange={(e) => updateGradient({ position: { ...localGradient.position, y: parseInt(e.target.value) || 50 } })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0%</span><span>50%</span><span>100%</span></div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Colors</label>
          <button onClick={addColorStop} className="text-sm text-blue-600">Add</button>
        </div>
        <div className="space-y-2">
          {localGradient.colors.map((color, index) => (
            <div key={`stop-${index}`} className="flex items-center space-x-2">
              <input type="color" value={color} onChange={(e) => updateColorStop(index, e.target.value)} className="w-8 h-8 cursor-pointer rounded border-2 border-gray-300" />
              <span className="text-xs w-12 font-mono text-gray-600">{localGradient.stops[index]}%</span>
              <div className="flex-1">
                <input type="range" min="0" max="100" step="1" value={localGradient.stops[index]} onChange={(e) => updateStopPosition(index, e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              </div>
              <button onClick={() => removeColorStop(index)} disabled={localGradient.colors.length <= 2} className="p-1 text-red-500 hover:text-red-700 disabled:opacity-30 rounded" title="Remove color stop"><Trash2 size={14} /></button>
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
        <div className="text-xs text-gray-500 mt-1 text-center">Click any preset to apply • L = Linear, R = Radial</div>
      </div>
    </div>
  );
};

export default GradientPicker;
