import React from 'react';
import { supportedLanguages } from '../../../utils/constants';

/**
 * TransliterationToggle Component
 * Shows a toggle for enabling/disabling transliteration for Indian languages
 * Only displays for languages that support transliteration
 * 
 * @param {string} currentLanguage - Current selected language code
 * @param {boolean} transliterationEnabled - Whether transliteration is enabled
 * @param {Function} setTransliterationEnabled - Function to toggle transliteration
 */
const TransliterationToggle = ({ 
  currentLanguage, 
  transliterationEnabled, 
  setTransliterationEnabled 
}) => {
  const needsTransliteration = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or'].includes(currentLanguage);
  
  if (!needsTransliteration) return null;
  
  return (
    <div className="mb-3">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={transliterationEnabled}
          onChange={() => setTransliterationEnabled(!transliterationEnabled)}
          className="mr-2"
        />
        <span className="text-sm">Enable Transliteration (Type in English)</span>
      </label>
      <p className="text-xs text-gray-500 mt-1">
        Type English letters to get {supportedLanguages[currentLanguage]?.name} characters
      </p>
    </div>
  );
};

export default TransliterationToggle;
