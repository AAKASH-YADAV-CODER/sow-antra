import React from 'react';
import { X } from 'lucide-react';

const CustomTemplateModal = ({ 
  show, 
  templateSize, 
  onSizeChange, 
  onCreate, 
  onCancel 
}) => {
  if (!show) return null;

  const handleWidthChange = (value) => {
    // Always update with the raw value (including empty string)
    onSizeChange({
      ...templateSize,
      width: value
    });
  };

  const handleHeightChange = (value) => {
    // Always update with the raw value (including empty string)
    onSizeChange({
      ...templateSize,
      height: value
    });
  };

  const handleUnitChange = (value) => {
    onSizeChange({
      ...templateSize,
      unit: value
    });
  };

  const getPixelEquivalent = () => {
    const { width, height, unit } = templateSize;
    
    // Handle empty or invalid values
    const w = parseInt(width) || 0;
    const h = parseInt(height) || 0;
    
    if (unit === 'px') return { width: w, height: h };
    
    const multiplier = unit === 'in' ? 96 : unit === 'mm' ? 3.78 : 37.8;
    return {
      width: Math.round(w * multiplier),
      height: Math.round(h * multiplier)
    };
  };

  const pixels = getPixelEquivalent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-2xl 
                      md:p-6 sm:p-4 
                      max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold md:text-2xl sm:text-lg">
            Custom Template Size
          </h2>
          <button 
            onClick={onCancel}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 md:gap-4 sm:gap-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Width
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={templateSize.width}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty or numeric values only
                  if (value === '' || /^\d+$/.test(value)) {
                    handleWidthChange(value);
                  }
                }}
                className="w-full p-2 border-2 border-gray-300 rounded-lg 
                           focus:border-blue-500 focus:outline-none
                           md:p-2 sm:p-1.5 sm:text-sm"
                placeholder="Enter width"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Unit
              </label>
              <select
                value={templateSize.unit}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="w-full p-2 border-2 border-gray-300 rounded-lg 
                           focus:border-blue-500 focus:outline-none
                           md:p-2 sm:p-1.5 sm:text-sm"
              >
                <option value="px">px</option>
                <option value="in">in</option>
                <option value="mm">mm</option>
                <option value="cm">cm</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Height
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={templateSize.height}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty or numeric values only
                if (value === '' || /^\d+$/.test(value)) {
                  handleHeightChange(value);
                }
              }}
              className="w-full p-2 border-2 border-gray-300 rounded-lg 
                         focus:border-blue-500 focus:outline-none
                         md:p-2 sm:p-1.5 sm:text-sm"
              placeholder="Enter height"
              autoComplete="off"
            />
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 md:p-4 sm:p-2">
            <p className="text-sm text-gray-700 font-medium mb-1">
              Preview:
            </p>
            <p className="text-base font-semibold text-blue-700 md:text-lg sm:text-sm">
              {templateSize.width} × {templateSize.height} {templateSize.unit}
            </p>
            {templateSize.unit !== 'px' && (
              <p className="text-xs text-gray-600 mt-1 sm:text-xs">
                ≈ {pixels.width} × {pixels.height} pixels
              </p>
            )}
          </div>
          
          <div className="flex space-x-2 md:space-x-3 sm:space-x-2 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 p-3 bg-gray-200 rounded-lg hover:bg-gray-300 
                         font-medium transition-colors
                         md:p-3 sm:p-2 sm:text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              className="flex-1 p-3 bg-blue-500 text-white rounded-lg 
                         hover:bg-blue-600 font-medium transition-colors
                         md:p-3 sm:p-2 sm:text-sm"
            >
              Create Design
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomTemplateModal;
