import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, ChevronDown } from 'lucide-react';

/**
 * BottomZoomControl Component
 * Canva-style zoom control with slider bar, increase/decrease buttons and zoom percentage selector
 * Positioned at the bottom center of the canvas
 */
const BottomZoomControl = ({ zoomLevel, setZoomLevel, centerCanvas }) => {
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const menuRef = useRef(null);
  const sliderRef = useRef(null);

  // Predefined zoom levels (similar to Canva)
  const zoomLevels = [25, 50, 75, 100, 125, 150, 200, 300, 400];

  // Min and max zoom levels
  const MIN_ZOOM = 0.1; // 10%
  const MAX_ZOOM = 5;   // 500%

  // Handle zoom in
  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 0.1, MAX_ZOOM);
    setZoomLevel(newZoom);
  };

  // Handle zoom out
  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.1, MIN_ZOOM);
    setZoomLevel(newZoom);
  };

  // Handle slider change
  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    setZoomLevel(value);
  };

  // Handle zoom to specific level
  const handleZoomToLevel = (level) => {
    setZoomLevel(level / 100);
    setShowZoomMenu(false);
  };

  // Handle auto-adjust (fit to screen)
  const handleAutoAdjust = () => {
    centerCanvas();
    setShowZoomMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowZoomMenu(false);
      }
    };

    if (showZoomMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showZoomMenu]);

  const currentZoomPercent = Math.round(zoomLevel * 100);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
        {/* Zoom Out Button */}
        <button
          onClick={handleZoomOut}
          disabled={zoomLevel <= MIN_ZOOM}
          className="px-2 md:px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-r border-gray-200 touch-manipulation flex-shrink-0"
          title="Zoom Out"
        >
          <ZoomOut size={18} className="text-gray-700" />
        </button>

        {/* Zoom Slider */}
        <div className="px-3 py-2 flex items-center gap-2 border-r border-gray-200">
          <input
            ref={sliderRef}
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoomLevel}
            onChange={handleSliderChange}
            className="w-24 md:w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((zoomLevel - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%, #e5e7eb ${((zoomLevel - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%, #e5e7eb 100%)`
            }}
            title="Zoom Slider"
          />
        </div>

        {/* Zoom Percentage Selector */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setShowZoomMenu(!showZoomMenu)}
            className="px-2 md:px-3 py-2 hover:bg-gray-100 transition-colors flex items-center gap-1 justify-center border-r border-gray-200 min-w-[70px] md:min-w-[80px] touch-manipulation"
            title="Select Zoom Level"
          >
            <span className="text-sm font-medium text-gray-700">
              {currentZoomPercent}%
            </span>
            <ChevronDown size={14} className="text-gray-500" />
          </button>

          {/* Zoom Menu Dropdown */}
          {showZoomMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 max-h-64 overflow-y-auto">
              {/* Auto-adjust option */}
              <button
                onClick={handleAutoAdjust}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-100 flex items-center gap-2 border-b border-gray-100 touch-manipulation"
              >
                <Maximize2 size={14} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Fit to Screen</span>
              </button>

              {/* Predefined zoom levels */}
              {zoomLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => handleZoomToLevel(level)}
                  className={`w-full px-4 py-2.5 text-left hover:bg-gray-100 transition-colors touch-manipulation ${
                    currentZoomPercent === level ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <span className="text-sm">{level}%</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom In Button */}
        <button
          onClick={handleZoomIn}
          disabled={zoomLevel >= MAX_ZOOM}
          className="px-2 md:px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation flex-shrink-0"
          title="Zoom In"
        >
          <ZoomIn size={18} className="text-gray-700" />
        </button>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          transition: transform 0.15s ease;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        
        .slider-thumb::-webkit-slider-thumb:active {
          transform: scale(1.25);
        }
        
        .slider-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          transition: transform 0.15s ease;
        }
        
        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.15);
        }
        
        .slider-thumb::-moz-range-thumb:active {
          transform: scale(1.25);
        }
        
        .slider-thumb:focus {
          outline: none;
        }
        
        .slider-thumb:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        
        .slider-thumb:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  );
};

export default BottomZoomControl;
