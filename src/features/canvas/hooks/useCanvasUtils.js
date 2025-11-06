import { useCallback } from 'react';

/**
 * Custom hook for canvas utility functions
 * Manages zoom, page navigation, and animations
 * 
 * @param {Object} params - Hook parameters
 * @param {Function} params.getCurrentPageElements - Get current page elements
 * @param {Array} params.pages - Array of pages
 * @param {Function} params.setPages - Update pages
 * @param {string} params.currentPage - Current page ID
 * @param {Function} params.setCurrentPage - Update current page
 * @param {Function} params.setSelectedElement - Set selected element
 * @param {Function} params.setSelectedElements - Set selected elements
 * @param {number} params.zoomLevel - Current zoom level
 * @param {Function} params.setZoomLevel - Update zoom level
 * @param {boolean} params.isPlaying - Animation playing state
 * @param {Function} params.setIsPlaying - Set animation playing state
 * @param {Function} params.setShowZoomIndicator - Show zoom indicator
 * @param {Object} params.zoomIndicatorTimeoutRef - Zoom indicator timeout ref
 * @returns {Object} Canvas utility handlers
 */
export const useCanvasUtils = ({
  getCurrentPageElements,
  pages,
  setPages,
  currentPage,
  setCurrentPage,
  setSelectedElement,
  setSelectedElements,
  zoomLevel,
  setZoomLevel,
  isPlaying,
  setIsPlaying,
  setShowZoomIndicator,
  zoomIndicatorTimeoutRef
}) => {
  // Add new page
  const addNewPage = useCallback(() => {
    const newPageId = `page-${pages.length + 1}`;
    setPages([...pages, { id: newPageId, name: `Page ${pages.length + 1}`, elements: [] }]);
    setCurrentPage(newPageId);
    setSelectedElement(null);
    setSelectedElements(new Set());
  }, [pages, setPages, setCurrentPage, setSelectedElement, setSelectedElements]);

  // Delete current page
  const deleteCurrentPage = useCallback(() => {
    if (pages.length <= 1) return;
    const newPages = pages.filter(page => page.id !== currentPage);
    setPages(newPages);
    setCurrentPage(newPages[0].id);
    setSelectedElement(null);
    setSelectedElements(new Set());
  }, [pages, currentPage, setPages, setCurrentPage, setSelectedElement, setSelectedElements]);

  // Rename current page
  const renameCurrentPage = useCallback(() => {
    const newName = prompt('Enter new page name:', pages.find(p => p.id === currentPage)?.name || 'Page');
    if (newName) {
      setPages(pages.map(page => 
        page.id === currentPage ? { ...page, name: newName } : page
      ));
    }
  }, [pages, currentPage, setPages]);

  // Play animations
  const playAnimations = useCallback(() => {
    setIsPlaying(true);
    const currentElements = getCurrentPageElements();
    currentElements.forEach((element, index) => {
      if (element.animation) {
        const elementDOM = document.getElementById(`element-${element.id}`);
        if (elementDOM) {
          elementDOM.style.animation = 'none';
          setTimeout(() => {
            elementDOM.style.animation = `${element.animation} 1s ease-out forwards`;
          }, index * 200);
        }
      }
    });
    
    setTimeout(() => setIsPlaying(false), currentElements.length * 200 + 1000);
  }, [getCurrentPageElements, setIsPlaying]);

  // Reset animations
  const resetAnimations = useCallback(() => {
    const currentElements = getCurrentPageElements();
    currentElements.forEach(element => {
      const elementDOM = document.getElementById(`element-${element.id}`);
      if (elementDOM) {
        elementDOM.style.animation = 'none';
      }
    });
    setIsPlaying(false);
  }, [getCurrentPageElements, setIsPlaying]);

  // Zoom in/out
  const zoom = useCallback((direction) => {
    let newZoom;
    
    if (typeof direction === 'number') {
      // Direct zoom level passed
      newZoom = Math.max(0.1, Math.min(5, direction));
    } else if (direction === 'in') {
      newZoom = Math.min(zoomLevel + 0.2, 3);
    } else if (direction === 'out') {
      newZoom = Math.max(zoomLevel - 0.2, 0.5);
    } else {
      newZoom = zoomLevel;
    }
    
    setZoomLevel(newZoom);
    
    // Show zoom indicator on mobile
    setShowZoomIndicator(true);
    
    // Clear existing timeout
    if (zoomIndicatorTimeoutRef.current) {
      clearTimeout(zoomIndicatorTimeoutRef.current);
    }
    
    // Hide after 10 seconds
    zoomIndicatorTimeoutRef.current = setTimeout(() => {
      setShowZoomIndicator(false);
    }, 10000);
  }, [zoomLevel, setZoomLevel, setShowZoomIndicator, zoomIndicatorTimeoutRef]);

  return {
    // Page management
    addNewPage,
    deleteCurrentPage,
    renameCurrentPage,
    
    // Animation control
    playAnimations,
    resetAnimations,
    
    // Zoom control
    zoom
  };
};
