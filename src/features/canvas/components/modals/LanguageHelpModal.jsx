import React from 'react';
import { X } from 'lucide-react';
import { supportedLanguages } from '../../../../utils/constants';

const LanguageHelpModal = ({ show, currentLanguage, onClose }) => {
  if (!show) return null;
  
  const getLanguageInstructions = () => {
    switch(currentLanguage) {
      case 'ta':
        return (
          <div>
            <h3 className="font-bold mb-2 text-lg md:text-xl sm:text-base">Typing in Tamil</h3>
            <p className="text-sm mb-2 md:text-base sm:text-xs">You can type Tamil using either:</p>
            <ul className="list-disc list-inside text-sm space-y-1 md:text-base sm:text-xs">
              <li><strong>Virtual Keyboard:</strong> Click on the Tamil characters shown on the screen keyboard</li>
              <li><strong>Transliteration:</strong> Enable transliteration and type English letters that sound like Tamil words</li>
              <li><strong>System Keyboard:</strong> Set up Tamil input on your operating system</li>
            </ul>
            <div className="mt-4 p-3 bg-gray-100 rounded-lg md:p-4 sm:p-2">
              <p className="text-sm font-semibold mb-1 md:text-base sm:text-xs">Common transliterations:</p>
              <p className="text-sm md:text-base sm:text-xs">nandri = நன்றி (Thank you)</p>
              <p className="text-sm md:text-base sm:text-xs">vanakkam = வணக்கம் (Hello)</p>
              <p className="text-sm md:text-base sm:text-xs">tamil = தமிழ் (Tamil)</p>
            </div>
          </div>
        );
      case 'hi':
        return (
          <div>
            <h3 className="font-bold mb-2 text-lg md:text-xl sm:text-base">Typing in Hindi</h3>
            <p className="text-sm mb-2 md:text-base sm:text-xs">You can type Hindi using either:</p>
            <ul className="list-disc list-inside text-sm space-y-1 md:text-base sm:text-xs">
              <li><strong>Virtual Keyboard:</strong> Click on the Devanagari characters shown on the screen keyboard</li>
              <li><strong>Transliteration:</strong> Enable transliteration and type English letters that sound like Hindi words</li>
              <li><strong>System Keyboard:</strong> Set up Hindi input on your operating system</li>
            </ul>
            <div className="mt-4 p-3 bg-gray-100 rounded-lg md:p-4 sm:p-2">
              <p className="text-sm font-semibold mb-1 md:text-base sm:text-xs">Common transliterations:</p>
              <p className="text-sm md:text-base sm:text-xs">dhanyavaad = धन्यवाद (Thank you)</p>
              <p className="text-sm md:text-base sm:text-xs">namaste = नमस्ते (Hello)</p>
              <p className="text-sm md:text-base sm:text-xs">bhaarat = भारत (India)</p>
            </div>
          </div>
        );
      default:
        return (
          <p className="text-sm md:text-base sm:text-xs">
            Select an Indian language to see typing instructions.
          </p>
        );
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-2xl 
                      md:p-6 sm:p-4 
                      max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold md:text-2xl sm:text-base">
            Typing Help - {supportedLanguages[currentLanguage]?.name || 'Language'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          {getLanguageInstructions()}
        </div>
        
        <button 
          onClick={onClose}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 
                     font-medium transition-colors
                     md:py-3 sm:py-2 sm:text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LanguageHelpModal;
