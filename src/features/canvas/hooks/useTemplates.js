import { useCallback } from 'react';
import { socialMediaTemplates } from '../../../utils/constants';

/**
 * Custom hook for managing canvas templates
 * Handles applying predefined social media templates and creating custom templates
 * 
 * @param {Object} params - Hook parameters
 * @returns {Object} Template management functions
 */
const useTemplates = ({
  setCanvasSize,
  centerCanvas,
  setShowTemplates,
  setShowCustomTemplateModal,
  customTemplateSize
}) => {

  // Apply a predefined template or show custom template modal
  const applyTemplate = useCallback((platform) => {
    if (platform === 'custom') {
      setShowCustomTemplateModal(true);
      return;
    }

    const template = socialMediaTemplates[platform];
    if (template) {
      // Set the new canvas size
      setCanvasSize({ width: template.width, height: template.height });

      // Force center and fit with the new size immediately to bypass state update delays
      setTimeout(() => centerCanvas({ width: template.width, height: template.height }), 50);
      setShowTemplates(false);
    }
  }, [setCanvasSize, centerCanvas, setShowTemplates, setShowCustomTemplateModal]);

  // Create a custom template with user-defined dimensions
  const createCustomTemplate = useCallback(() => {
    if (customTemplateSize.width > 0 && customTemplateSize.height > 0) {
      const newSize = {
        width: customTemplateSize.width,
        height: customTemplateSize.height
      };
      setCanvasSize(newSize);

      setTimeout(() => centerCanvas(newSize), 50);

      setShowCustomTemplateModal(false);
      setShowTemplates(false);
    }
  }, [customTemplateSize, setCanvasSize, centerCanvas, setShowCustomTemplateModal, setShowTemplates]);

  return {
    applyTemplate,
    createCustomTemplate
  };
};

export default useTemplates;
