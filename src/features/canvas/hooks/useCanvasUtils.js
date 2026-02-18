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
    setPages([...pages, { id: newPageId, name: `Page ${pages.length + 1}`, elements: [], notes: '' }]);
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
  const renameCurrentPage = useCallback((pageId, newName) => {
    if (newName) {
      setPages(pages.map(page =>
        page.id === pageId ? { ...page, name: newName } : page
      ));
    }
  }, [pages, setPages]);

  // Duplicate page
  const duplicatePage = useCallback((pageId) => {
    const pageToDuplicate = pages.find(p => p.id === pageId);
    if (!pageToDuplicate) return;

    const newPageId = `page-${Date.now()}`;
    const newPage = {
      ...pageToDuplicate,
      id: newPageId,
      name: `${pageToDuplicate.name} (Copy)`,
      notes: pageToDuplicate.notes || '',
      // Deep copy elements with new IDs to avoid reference issues
      elements: (pageToDuplicate.elements || []).map(el => ({
        ...el,
        id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
    };

    const pageIndex = pages.findIndex(p => p.id === pageId);
    const newPages = [...pages];
    newPages.splice(pageIndex + 1, 0, newPage);

    setPages(newPages);
    setCurrentPage(newPageId);
  }, [pages, setPages, setCurrentPage]);

  // Move page
  const movePage = useCallback((pageId, direction) => {
    const index = pages.findIndex(p => p.id === pageId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pages.length - 1) return;

    const newPages = [...pages];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const [movedPage] = newPages.splice(index, 1);
    newPages.splice(newIndex, 0, movedPage);

    setPages(newPages);
  }, [pages, setPages]);

  // Reorder page to specific index
  const reorderPage = useCallback((pageId, targetIndex) => {
    const currentIndex = pages.findIndex(p => p.id === pageId);
    if (currentIndex === -1) return;

    const newPages = [...pages];
    const [movedPage] = newPages.splice(currentIndex, 1);
    newPages.splice(targetIndex, 0, movedPage);

    setPages(newPages);
  }, [pages, setPages]);

  // Split page at current time
  const splitPage = useCallback((globalTime) => {
    let accumulatedTime = 0;
    let targetPageIndex = -1;

    for (let i = 0; i < pages.length; i++) {
      const pageDur = pages[i].duration || 5;
      if (globalTime >= accumulatedTime && globalTime < accumulatedTime + pageDur) {
        targetPageIndex = i;
        break;
      }
      accumulatedTime += pageDur;
    }

    if (targetPageIndex === -1) return;

    const pageToSplit = pages[targetPageIndex];
    const localSplitTime = globalTime - accumulatedTime;

    // Don't split if too close to edges (e.g. 0.1s buffer)
    if (localSplitTime < 0.1 || localSplitTime > (pageToSplit.duration || 5) - 0.1) return;

    const originalDuration = pageToSplit.duration || 5;

    // Create two new sets of elements
    const elementsA = [];
    const elementsB = [];

    (pageToSplit.elements || []).forEach(el => {
      const elStart = el.startTime || 0;
      const elDur = el.duration || 5;

      if (elStart + elDur <= localSplitTime) {
        // Completely in first half
        elementsA.push(el);
      } else if (elStart >= localSplitTime) {
        // Completely in second half
        elementsB.push({
          ...el,
          startTime: elStart - localSplitTime
        });
      } else {
        // Spans the split - Duplicate and trim
        // Part A
        elementsA.push({
          ...el,
          duration: localSplitTime - elStart
        });
        // Part B
        elementsB.push({
          ...el,
          id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          startTime: 0,
          duration: elDur - (localSplitTime - elStart),
          audioOffset: (el.audioOffset || 0) + (localSplitTime - elStart)
        });
      }
    });

    const newPageA = {
      ...pageToSplit,
      duration: localSplitTime,
      elements: elementsA
    };

    const newPageB = {
      ...pageToSplit,
      id: `page-${Date.now()}`,
      name: `${pageToSplit.name} (Part 2)`,
      duration: originalDuration - localSplitTime,
      elements: elementsB
    };

    const newPages = [...pages];
    newPages.splice(targetPageIndex, 1, newPageA, newPageB);

    setPages(newPages);
    setCurrentPage(newPageB.id);
  }, [pages, setPages, setCurrentPage]);

  // Set page transition
  const setPageTransition = useCallback((pageId, transition) => {
    setPages(pages.map(page =>
      page.id === pageId ? { ...page, transition } : page
    ));
  }, [pages, setPages]);

  // Play animations
  const playAnimations = useCallback(() => {
    setIsPlaying(true);
    const currentElements = getCurrentPageElements();

    // Reset animations first
    currentElements.forEach(element => {
      const elementDOM = document.getElementById(`element-${element.id}`);
      if (elementDOM) {
        elementDOM.style.animation = 'none';
        void elementDOM.offsetWidth; // Force reflow
      }
    });

    // Apply animations
    currentElements.forEach((element, index) => {
      if (element.animation) {
        const elementDOM = document.getElementById(`element-${element.id}`);
        if (elementDOM) {
          const anim = typeof element.animation === 'object' ? element.animation : { type: element.animation, duration: 1, delay: 0 };
          let animName = anim.type;

          // Safety mapping to match CanvasElement logic
          // Safety mapping to match CanvasElement logic (Use wipe for everything to avoid reflows)
          if (animName === 'typewriter') {
            animName = 'wipe';
          }

          const duration = anim.duration || 1;
          const delay = (anim.delay || 0); // Use explicit delay set by AnimationPane

          setTimeout(() => {
            elementDOM.style.animation = `${animName} ${duration}s ease-out forwards`;
          }, delay * 1000);
        }
      }
    });

    // Auto stop after max duration (approx)
    setTimeout(() => setIsPlaying(false), 5000);
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
    duplicatePage,
    movePage,
    reorderPage,
    splitPage,
    setPageTransition,

    // Animation control
    playAnimations,
    resetAnimations,

    // Zoom control
    zoom
  };
};
