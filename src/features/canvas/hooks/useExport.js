import { useCallback } from 'react';
import {
  exportAsImage as exportAsImageUtil,
  exportAsPDF as exportAsPDFUtil,
  exportAsSVG as exportAsSVGUtil
} from '../../../utils/canvasExport';

/**
 * Custom hook for handling canvas export functionality
 * Provides methods to export canvas as SVG, Image (PNG/JPG), or PDF
 * 
 * @param {Function} getCurrentPageElements - Function to get current page elements
 * @param {Object} canvasSize - Canvas dimensions {width, height}
 * @param {Object} imageEffects - Image effects configuration
 * @param {string} backgroundColor - Canvas background color
 * @returns {Object} Export functions
 */
const useExport = ({ getCurrentPageElements, canvasSize, imageEffects, backgroundColor }) => {

  // Export as SVG
  const exportAsSVG = useCallback(() => {
    const currentElements = getCurrentPageElements();
    return exportAsSVGUtil(currentElements, canvasSize);
  }, [getCurrentPageElements, canvasSize]);

  // Export as Image (PNG/JPG/SVG)
  const exportAsImage = useCallback((format) => {
    if (format === 'svg') {
      exportAsSVG();
      return;
    }
    const currentElements = getCurrentPageElements();
    return exportAsImageUtil(currentElements, canvasSize, format, imageEffects, backgroundColor);
  }, [getCurrentPageElements, canvasSize, imageEffects, exportAsSVG, backgroundColor]);

  // Export as PDF
  const exportAsPDF = useCallback(() => {
    const currentElements = getCurrentPageElements();
    return exportAsPDFUtil(currentElements, canvasSize, imageEffects, backgroundColor);
  }, [getCurrentPageElements, canvasSize, imageEffects, backgroundColor]);

  // Get export-ready elements with proper filtering
  const getExportReadyElements = useCallback(() => {
    const currentElements = getCurrentPageElements();

    return [...currentElements]
      .sort((a, b) => {
        // First, sort by zIndex
        if (a.zIndex !== b.zIndex) {
          return a.zIndex - b.zIndex;
        }

        // If same zIndex, maintain original order
        return currentElements.indexOf(a) - currentElements.indexOf(b);
      })
      .filter(element => {
        // Include all elements except temporary ones
        return !element.isTemporary;
      });
  }, [getCurrentPageElements]);

  return {
    exportAsSVG,
    exportAsImage,
    exportAsPDF,
    exportAsVideo: useCallback((duration, onProgress, format = 'video/webm', videoQuality = 'medium') => {
      const currentElements = getCurrentPageElements();
      return import('../../../utils/canvasExport').then(module => {
        return module.exportAsVideo(currentElements, canvasSize, imageEffects, duration, onProgress, format, backgroundColor, videoQuality);
      });
    }, [getCurrentPageElements, canvasSize, imageEffects, backgroundColor]),
    getExportReadyElements
  };
};

export default useExport;
