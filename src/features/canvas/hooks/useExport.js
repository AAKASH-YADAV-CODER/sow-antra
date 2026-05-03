import { useCallback } from 'react';
import {
  exportAsImage as exportAsImageUtil,
  exportAsPDF as exportAsPDFUtil,
  exportAsSVG as exportAsSVGUtil,
  getCanvasDataURL as getCanvasDataURLUtil
} from '../../../utils/canvasExport';

/**
 * Custom hook for handling canvas export functionality
 * Provides methods to export canvas as SVG, Image (PNG/JPG), PDF, and Video
 *
 * @param {Function} getCurrentPageElements - Function to get current page elements
 * @param {Object} canvasSize - Canvas dimensions {width, height}
 * @param {Object} imageEffects - Image effects configuration
 * @param {string} backgroundColor - Canvas background color
 * @param {string} projectName - Project name used for file naming
 * @param {Array} pages - All pages array for multi-page video export
 * @returns {Object} Export functions
 */
const useExport = ({ getCurrentPageElements, canvasSize, imageEffects, backgroundColor, projectName, pages }) => {

  // Sanitize project name for filename
  const getSanitizedFilename = useCallback(() => {
    return (projectName || 'sowntra-design').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }, [projectName]);

  // Export as SVG
  const exportAsSVG = useCallback(() => {
    const currentElements = getCurrentPageElements();
    return exportAsSVGUtil(currentElements, canvasSize, getSanitizedFilename());
  }, [getCurrentPageElements, canvasSize, getSanitizedFilename]);

  // Export as Image (PNG/JPG/SVG)
  const exportAsImage = useCallback((format) => {
    if (format === 'svg') {
      exportAsSVG();
      return;
    }
    const currentElements = getCurrentPageElements();
    return exportAsImageUtil(currentElements, canvasSize, format, imageEffects, backgroundColor, getSanitizedFilename());
  }, [getCurrentPageElements, canvasSize, imageEffects, exportAsSVG, backgroundColor, getSanitizedFilename]);

  // Export as PDF
  const exportAsPDF = useCallback(() => {
    const currentElements = getCurrentPageElements();
    return exportAsPDFUtil(currentElements, canvasSize, imageEffects, backgroundColor, getSanitizedFilename());
  }, [getCurrentPageElements, canvasSize, imageEffects, backgroundColor, getSanitizedFilename]);

  // Get export-ready elements with proper filtering
  const getExportReadyElements = useCallback(() => {
    const currentElements = getCurrentPageElements();
    return [...currentElements]
      .sort((a, b) => {
        if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
        return currentElements.indexOf(a) - currentElements.indexOf(b);
      })
      .filter(element => !element.isTemporary);
  }, [getCurrentPageElements]);

  // Export as Video — passes ALL pages so multi-page timelines render correctly
  const exportAsVideo = useCallback((duration, onProgress, format = 'video/webm', videoQuality = 'medium') => {
    const filename = getSanitizedFilename();

    // Build a flat list of elements tagged with their page's time offset.
    // This allows the renderer to know WHEN each element should appear.
    let allElements = [];
    if (pages && pages.length > 0) {
      let pageStartTime = 0;
      pages.forEach(page => {
        const pageDuration = page.duration || 5;
        const pageElements = (page.elements || []).filter(el => !el.isTemporary);
        pageElements.forEach(el => {
          allElements.push({
            ...el,
            // Absolute start/end times in the full video timeline
            _pageStartTime: pageStartTime,
            _pageEndTime: pageStartTime + pageDuration,
            _pageDuration: pageDuration,
            _pageBg: page.backgroundGradient || page.backgroundColor || '#ffffff'
          });
        });
        pageStartTime += pageDuration;
      });
    } else {
      // Fallback: single page
      allElements = getCurrentPageElements().filter(el => !el.isTemporary);
    }

    // Collect audio elements across ALL pages
    const audioElements = [];
    if (pages && pages.length > 0) {
      let pageStartTime = 0;
      pages.forEach(page => {
        const pageDuration = page.duration || 5;
        (page.elements || []).forEach(el => {
          if (el.type === 'audio' && el.src) {
            audioElements.push({ ...el, startTime: (el.startTime || 0) + pageStartTime });
          }
        });
        pageStartTime += pageDuration;
      });
    }

    return import('../../../utils/canvasExport').then(module => {
      return module.exportAsVideo(
        allElements,
        canvasSize,
        imageEffects,
        duration,
        onProgress,
        format,
        backgroundColor,
        videoQuality,
        filename,
        pages || [],        // pass pages for per-page background colors
        audioElements       // explicit global audio list
      );
    });
  }, [pages, getCurrentPageElements, canvasSize, imageEffects, backgroundColor, getSanitizedFilename]);

  return {
    exportAsSVG,
    exportAsImage,
    exportAsPDF,
    exportAsVideo,
    getExportReadyElements,
    getCanvasDataURL: useCallback(async (format = 'png', maxWidth = 480) => {
      const currentElements = getCurrentPageElements();
      return getCanvasDataURLUtil(currentElements, canvasSize, format, imageEffects, backgroundColor, maxWidth);
    }, [getCurrentPageElements, canvasSize, imageEffects, backgroundColor])
  };
};

export default useExport;
