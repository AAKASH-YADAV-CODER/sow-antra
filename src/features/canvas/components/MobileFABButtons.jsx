import React from 'react';
import { ZoomIn, ZoomOut, Maximize, Settings } from 'lucide-react';

/**
 * Mobile Floating Action Buttons Component
 * Shows zoom controls, tools, and properties buttons on mobile
 */
const MobileFABButtons = ({
  zoom,
  centerCanvas,
  setShowMobileProperties,
  selectedElement
}) => {
  return (
    <div className="md:hidden fixed bottom-20 right-4 flex flex-col gap-3 z-40">
      {/* Zoom In Button */}
      <button
        onClick={() => zoom('in')}
        className="w-12 h-12 bg-gray-700 hover:bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center touch-manipulation"
        title="Zoom In"
      >
        <ZoomIn size={20} />
      </button>
      
      {/* Zoom Out Button */}
      <button
        onClick={() => zoom('out')}
        className="w-12 h-12 bg-gray-700 hover:bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center touch-manipulation"
        title="Zoom Out"
      >
        <ZoomOut size={20} />
      </button>
      
      {/* Fit to Screen Button */}
      <button
        onClick={centerCanvas}
        className="w-12 h-12 bg-gray-700 hover:bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center touch-manipulation"
        title="Fit to Screen"
      >
        <Maximize size={20} />
      </button>
      
      {selectedElement && (
        <button
          onClick={() => setShowMobileProperties(true)}
          className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center touch-manipulation"
          title="Properties"
        >
          <Settings size={24} />
        </button>
      )}
    </div>
  );
};

export default MobileFABButtons;
