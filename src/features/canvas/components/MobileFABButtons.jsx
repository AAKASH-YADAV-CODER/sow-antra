import React from 'react';
import { Settings } from 'lucide-react';

/**
 * Mobile Floating Action Buttons Component
 * Shows properties button on mobile when element is selected
 */
const MobileFABButtons = ({
  setShowMobileProperties,
  selectedElement
}) => {
  return (
    <div className="md:hidden fixed bottom-20 right-4 flex flex-col gap-3 z-40">
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
