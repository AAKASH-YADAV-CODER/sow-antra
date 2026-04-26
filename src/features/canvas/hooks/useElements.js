import { useCallback, useRef, useEffect } from 'react';
import { textEffects, textShapes } from '../../../utils/constants';
import { editableTemplates } from '../../../config/editableTemplates';

/**
 * useElements Hook
 * Manages all element CRUD operations for the canvas
 * 
 * @param {Object} params - Hook parameters
 * @param {Array} params.pages - All pages with their elements
 * @param {string} params.currentPage - Current page ID
 * @param {Function} params.setPages - Function to update pages
 * @param {Function} params.saveToHistory - Function to save state to history
 * @param {Set} params.lockedElements - Set of locked element IDs
 * @param {Function} params.setLockedElements - Function to update locked elements
 * @param {string|null} params.selectedElement - Currently selected element ID
 * @param {Function} params.setSelectedElement - Function to update selected element
 * @param {Set} params.selectedElements - Set of selected element IDs
 * @param {Function} params.setSelectedElements - Function to update selected elements
 * @param {Function} params.setCurrentTool - Function to set the current tool
 * @param {string} params.currentLanguage - Current language for text elements
 * @param {string} params.textDirection - Text direction (ltr/rtl)
 * @param {Function} params.t - Translation function
 * @param {Object} params.filterOptions - Default filter options
 * @param {Object} params.supportedLanguages - Language configurations
 */
const useElements = ({
  pages,
  currentPage,
  setPages,
  saveToHistory,
  lockedElements,
  setLockedElements,
  selectedElement,
  setSelectedElement,
  selectedElements,
  setSelectedElements,
  setCurrentTool,
  currentLanguage,
  textDirection,
  t,
  supportedLanguages,
  canvasSize,
  setCanvasSize,
  zoomLevel,
  setZoomLevel,
  filterOptions,
  centerCanvas // Auto-fit function passed from MainPage
}) => {
  // Synchronous mirror of elements for rapid-fire interactions (like Pen tool)
  // We store pageId to ensure we don't use stale data after switching pages
  const elementsRef = useRef({ pageId: null, elements: [] });
  const currentPageRef = useRef(currentPage);
  const pagesRef = useRef(pages);

  // Keep refs in sync with props
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  // Keep the ref in sync with pages prop
  useEffect(() => {
    const page = pages.find(p => p.id === currentPage);
    elementsRef.current = {
      pageId: currentPage,
      elements: page ? (page.elements || []) : []
    };
  }, [pages, currentPage]);

  // Generate unique ID
  const generateId = useCallback(() => Math.random().toString(36).substr(2, 9), []);

  // Get current page elements
  const getCurrentPageElements = useCallback(() => {
    const activePageId = currentPageRef.current;
    // Priority: use the synchronous ref for interactions if it belongs to the current page
    if (elementsRef.current && elementsRef.current.pageId === activePageId) {
      return elementsRef.current.elements || [];
    }
    const page = pagesRef.current.find(p => p.id === activePageId);
    return page ? (page.elements || []) : [];
  }, []);

  // Set current page elements — supports both direct arrays AND functional updaters (prevEl => newEl)
  const setCurrentPageElements = useCallback((newElementsOrUpdater) => {
    const activePageId = currentPageRef.current;
    // Resolve functional updater BEFORE storing in the ref.
    const currentSnapshot = (elementsRef.current?.pageId === activePageId)
      ? (elementsRef.current.elements || [])
      : (pagesRef.current.find(p => p.id === activePageId)?.elements || []);

    const newElements = typeof newElementsOrUpdater === 'function'
      ? newElementsOrUpdater(currentSnapshot)
      : newElementsOrUpdater;

    elementsRef.current = { pageId: activePageId, elements: newElements }; // Always an array
    setPages(prevPages => prevPages.map(page =>
      page.id === activePageId ? { ...page, elements: newElements } : page
    ));
  }, [setPages]);

  const currentPageDuration = pages.find(p => p.id === currentPage)?.duration || 5.0;

  // Add element to canvas
  const addElement = useCallback((type, properties = {}) => {
    const currentElements = getCurrentPageElements();

    // Normalized Scale Factor (Base: 1000px)
    const baseDimension = 1000;
    const scaleFactor = Math.max(canvasSize.width, canvasSize.height) / baseDimension;

    // Handle Collage Grids (grid_group)
    if (type === 'grid_group' && properties.items) {
      const groupWidth = (properties.width || 600) * scaleFactor;
      const groupHeight = (properties.height || 600) * scaleFactor;
      const startX = (canvasSize.width - groupWidth) / 2;
      const startY = (canvasSize.height - groupHeight) / 2;

      const newElements = properties.items.map((item, index) => {
        const elWidth = item.w * groupWidth;
        const elHeight = item.h * groupHeight;
        const elX = startX + item.x * groupWidth;
        const elY = startY + item.y * groupHeight;

        return {
          id: generateId(),
          type: 'frame',
          x: elX,
          y: elY,
          width: elWidth,
          height: elHeight,
          rotation: 0,
          zIndex: currentElements.length + index,
          locked: false,
          filters: JSON.parse(JSON.stringify(filterOptions)),
          fill: '#f1f5f9', // Light gray placeholder
          stroke: 'transparent',
          strokeWidth: 0,
          fillType: 'solid',
          props: { maskType: 'rect' }, // Standard rect frames
          // Add extra frame props
          maskType: 'rect'
        };
      });

      const updatedElements = [...currentElements, ...newElements];
      setCurrentPageElements(updatedElements);
      // Select all new elements? Or the first?
      // Let's select the first one.
      if (newElements.length > 0) {
        setSelectedElement(newElements[0].id);
        setSelectedElements(new Set(newElements.map(e => e.id)));
      }
      saveToHistory(updatedElements, canvasSize);
      return;
    }

    // Get current page duration using refs to avoid stale closure
    const activePageId = currentPageRef.current;
    const activePage = pagesRef.current.find(p => p.id === activePageId);
    const activePageDuration = activePage?.duration || 5.0;

    // Proportional sizing
    // Helper to create a single element
    const createElement = (elType, elProps, indexOffset = 0) => {
      // Proportional sizing
      const standardSize = Math.round(200 * scaleFactor);
      let width = elProps.width ? (elType === 'vector_path' ? elProps.width : elProps.width * scaleFactor) : standardSize;
      let height = elProps.height ? (elType === 'vector_path' ? elProps.height : elProps.height * scaleFactor) : standardSize;

      if (elType === 'text' && !elProps.width) {
        width = Math.round(100 * scaleFactor);
        height = Math.round(canvasSize.height * 0.08);
      } else if (elType === 'line' && !elProps.width) {
        width = Math.round(canvasSize.width * 0.2);
        height = 2 * scaleFactor;
      }

      const newElement = {
        id: generateId(),
        type: elType,
        x: elProps.fitToCanvas ? 0 : (elProps.x !== undefined ? elProps.x : Math.round((canvasSize.width - width) / 2)),
        y: elProps.fitToCanvas ? 0 : (elProps.y !== undefined ? elProps.y : Math.round((canvasSize.height - height) / 2)),
        rotation: 0,
        animation: null,
        zIndex: currentElements.length + indexOffset,
        locked: false,
        name: elProps.name || (elType.charAt(0).toUpperCase() + elType.slice(1)),
        filters: JSON.parse(JSON.stringify(filterOptions)),
        startTime: elProps.startTime !== undefined ? elProps.startTime : 0,
        duration: elProps.duration !== undefined ? elProps.duration : activePageDuration,
        fill: elProps.fill || (elType === 'rectangle' ? '#3b82f6' :
          elType === 'circle' ? '#ef4444' :
            elType === 'triangle' ? '#10b981' :
              elType === 'star' ? '#f59e0b' :
                elType === 'hexagon' ? '#8b5cf6' : '#3b82f6'),
        stroke: elProps.stroke || (elType === 'image' ? 'transparent' : '#000000'),
        fillType: elProps.fillType || 'solid',
        gradient: elProps.gradient || {
          type: 'linear',
          colors: ['#3b82f6', '#ef4444'],
          stops: [0, 100],
          angle: 90,
          position: { x: 50, y: 50 }
        },
        textEffect: 'none',
        textEffectSettings: { ...textEffects.none.defaults },
        textShape: 'none',
        textShapeSettings: { ...textShapes.none.defaults },
        imageEffect: 'none',
        shapeEffect: 'none',
        specialEffect: 'none',
        effectSettings: {},
        shadow: elProps.shadow || null,
        ...elProps,
        width,
        height,
        strokeWidth: (elProps.strokeWidth !== undefined ? elProps.strokeWidth : (elType === 'image' ? 0 : 2)) * scaleFactor,
        borderRadius: (elProps.borderRadius || 0) * scaleFactor
      };

      if (elType === 'text') {
        newElement.content = elProps.content || t('text.doubleClickToEdit');
        newElement.fontSize = (elProps.fontSize || 40) * scaleFactor;
        newElement.fontFamily = elProps.fontFamily || (supportedLanguages[currentLanguage]?.font || 'Arial');
        newElement.fontWeight = elProps.fontWeight || 'normal';
        newElement.fontStyle = elProps.fontStyle || 'normal';
        newElement.textDecoration = elProps.textDecoration || 'none';
        newElement.color = elProps.color || '#000000';
        newElement.isAutoWidth = elProps.isAutoWidth !== undefined ? elProps.isAutoWidth : true;
        newElement.textAlign = elProps.textAlign || (textDirection === 'rtl' ? 'right' : 'left');
      } else if (elType === 'type_extrude') {
        newElement.content = elProps.content || 'EXTRUDE';
        newElement.fontSize = elProps.fontSize !== undefined ? elProps.fontSize : (64 * scaleFactor);
        newElement.length = elProps.length !== undefined ? elProps.length : (25 * scaleFactor);
        newElement.borderWidth = elProps.borderWidth !== undefined ? elProps.borderWidth : 0;
        newElement.fontFamily = elProps.fontFamily || (supportedLanguages[currentLanguage]?.font || 'Gasoek One');
        newElement.fontWeight = elProps.fontWeight || '900';
        newElement.color = elProps.color || '#FFFFFF';
        newElement.extrudeColor = elProps.extrudeColor || '#000000';
        newElement.angle = elProps.angle ?? 45;
        newElement.textAlign = elProps.textAlign || 'center';
      } else if (elType === 'text_studio') {
        newElement.content = elProps.content || 'YES!';
        newElement.fontFamily = elProps.fontFamily || (supportedLanguages[currentLanguage]?.font || 'Gasoek One');
        newElement.fontSize = (elProps.fontSize !== undefined ? elProps.fontSize : 64) * scaleFactor;
        newElement.color = elProps.color || '#FFFFFF';
        newElement.extrudeColor = elProps.extrudeColor || '#FFAC00';
        newElement.extrudeDepth = (elProps.extrudeDepth !== undefined ? elProps.extrudeDepth : 15) * scaleFactor;
        newElement.shadowEnabled = elProps.shadowEnabled !== undefined ? elProps.shadowEnabled : true;
        newElement.shadowOffset = (elProps.shadowOffset !== undefined ? elProps.shadowOffset : 10) * scaleFactor;
        newElement.shadowBlur = (elProps.shadowBlur !== undefined ? elProps.shadowBlur : 15) * scaleFactor;
        newElement.shadowOpacity = elProps.shadowOpacity !== undefined ? elProps.shadowOpacity : 0.3;
        newElement.shadowColor = elProps.shadowColor || '#000000';
        newElement.letterSpacing = elProps.letterSpacing || 0;
        newElement.lineHeight = elProps.lineHeight || 1.2;
        newElement.textAlign = elProps.textAlign || 'center';
        newElement.fontWeight = elProps.fontWeight || '900';
      } else if (elType === 'image') {
        newElement.src = elProps.src || '';
        newElement.crop = elProps.crop || { t: 0, b: 0, l: 0, r: 0 };
        // If no explicit dimensions are provided, mark as needing aspect ratio adjustment
        if (!elProps.width && !elProps.height) {
          newElement.pendingAspectRatio = true;
        }
      } else if (elType === 'video') {
        newElement.src = elProps.src || '';
        newElement.crop = elProps.crop || { t: 0, b: 0, l: 0, r: 0 };
        // Mark as needing aspect ratio adjustment when metadata loads
        if (!elProps.width && !elProps.height) {
          newElement.pendingAspectRatio = true;
        }
      } else if (elType === 'audio') {
        newElement.src = elProps.src || '';
        newElement.startTime = elProps.startTime || 0;
        newElement.duration = elProps.duration || activePageDuration; // Use page duration
        newElement.height = 0;
      }
      
      if (elProps.fitToCanvas) {
        newElement.x = 0;
        newElement.y = 0;
        newElement.width = canvasSize.width;
        newElement.height = canvasSize.height;
      } else {
        Object.assign(newElement, elProps);
        newElement.width = width;
        newElement.height = height;
      }
      return newElement;
    };

    let newElementsToAdd = [];
    if (type === 'multiple' && Array.isArray(properties)) {
      newElementsToAdd = properties.map((item, idx) => createElement(item.type, item, idx));
    } else {
      newElementsToAdd = [createElement(type, properties)];
    }

    const updatedElements = [...currentElements, ...newElementsToAdd];
    setCurrentPageElements(updatedElements);

    // Select the newly added element(s)
    if (newElementsToAdd.length > 0) {
      const lastEl = newElementsToAdd[newElementsToAdd.length - 1];
      setSelectedElement(lastEl.id);
      setSelectedElements(new Set(newElementsToAdd.map(e => e.id)));
    }

    // Only switch to select tool if NOT drawing a path or vector
    if (type !== 'vector_path' && type !== 'drawing') {
      setCurrentTool('select');
    }

    saveToHistory(updatedElements, canvasSize, zoomLevel);
    return newElementsToAdd.length > 0 ? newElementsToAdd[newElementsToAdd.length - 1].id : null;
  }, [
    canvasSize,
    getCurrentPageElements,
    setCurrentPageElements,
    saveToHistory,
    currentLanguage,
    textDirection,
    t,
    filterOptions,
    supportedLanguages,
    setSelectedElement,
    setSelectedElements,
    zoomLevel,
    generateId,
    pages, // Still needed for length calculation or other logic if any, but currentPage removed
    setCurrentTool
  ]);

  // Apply a full template to the current page
  const applyEditableTemplate = useCallback((templateId) => {
    const template = editableTemplates[templateId];
    if (!template) return;

    // Clear existing elements for a fresh start with the template
    // const currentElements = []; // Removed unused variable
    const baseDimension = 1000;

    // Scale factor should based on the template's own target width
    const targetWidth = template.width || 1080;
    const targetHeight = template.height || 1080;
    const scaleFactor = targetWidth / baseDimension;

    // Auto-fit canvas to template dimensions FIRST or use target dims for scaling
    if (setCanvasSize) {
      setCanvasSize({ width: targetWidth, height: targetHeight });
      // Trigger auto-fit if available
      if (centerCanvas) {
        // centerCanvas will be called by MainPage useEffect when canvasSize changes, 
        // but if size doesn't change, we force it here after a small delay to ensure state updates
        setTimeout(() => {
          centerCanvas({ width: targetWidth, height: targetHeight });
        }, 50);
      }
    }

    // Identify theme color from background rectangle if it exists
    const bgRect = template.elements.find(el => el.type === 'rectangle' && el.x === 0 && el.y === 0);
    if (bgRect && bgRect.fill) {
      setPages(prevPages => prevPages.map(page =>
        page.id === currentPage ? { ...page, backgroundColor: bgRect.fill } : page
      ));
    }

    const templateElements = template.elements.map((el, index) => {
      const id = generateId();

      // Scale dimensions and positions
      const width = (el.width || 200) * scaleFactor;
      const height = (el.height || 200) * scaleFactor;
      // If x/y is undefined, center it based on baseDimension (1000)
      const x = (el.x !== undefined ? el.x : (baseDimension - (el.width || 200)) / 2) * scaleFactor;
      const y = (el.y !== undefined ? el.y : (baseDimension - (el.height || 200)) / 2) * scaleFactor;

      const newEl = {
        id,
        type: el.type,
        rotation: el.rotation || 0,
        zIndex: index,
        locked: false,
        filters: JSON.parse(JSON.stringify(filterOptions)),
        ...el,
        x, y, width, height,
        strokeWidth: (el.strokeWidth || 0) * scaleFactor,
        borderRadius: (el.borderRadius || 0) * scaleFactor
      };

      if (el.type === 'text') {
        newEl.fontSize = (el.fontSize || 40) * scaleFactor;
        newEl.fontFamily = el.fontFamily || (supportedLanguages[currentLanguage]?.font || 'Arial');
        newEl.fontWeight = el.fontWeight || 'normal';
        newEl.color = el.color || '#000000';
      }

      return newEl;
    });

    setCurrentPageElements(templateElements);
    saveToHistory(templateElements, { width: targetWidth, height: targetHeight });

    if (templateElements.length > 0) {
      setSelectedElement(templateElements[templateElements.length - 1].id);
      setSelectedElements(new Set([templateElements[templateElements.length - 1].id]));
    }
  }, [
    setCurrentPageElements,
    saveToHistory,
    currentLanguage,
    filterOptions,
    supportedLanguages,
    setSelectedElement,
    setSelectedElements,
    setCanvasSize,
    setPages,
    currentPage,
    generateId,
    centerCanvas
  ]);

  // Update element properties
  const updateElement = useCallback((id, updates, shouldSaveHistory = true) => {
    setPages(prevPages => {
      let elementToMove = null;

      // 1. Find the element across all pages
      const updatedPages = prevPages.map((page, idx) => {
        const elIndex = (page.elements || []).findIndex(el => el.id === id);
        if (elIndex !== -1) {
          elementToMove = { ...page.elements[elIndex], ...updates };

          // If NOT a time-based move, just update in place
          if (!('startTime' in updates)) {
            const newElements = [...page.elements];
            newElements[elIndex] = elementToMove;
            return { ...page, elements: newElements };
          }

          // If it IS a time-based move, remove from old page to re-insert later
          return { ...page, elements: page.elements.filter(el => el.id !== id) };
        }
        return page;
      });

      if (!elementToMove) return prevPages;

      // 2. Handle Global Timeline Logic (Mapping back to Local Page Time)
      if ('startTime' in updates) {
        const globalStart = updates.startTime;
        let cumulative = 0;
        let targetPageIndex = -1;

        // Find which page this global timestamp belongs to
        for (let i = 0; i < updatedPages.length; i++) {
          const start = cumulative;
          const end = cumulative + (updatedPages[i].duration || 5);
          if (globalStart >= start && globalStart < end) {
            targetPageIndex = i;
            elementToMove.startTime = Math.max(0, globalStart - start);
            break;
          }
          cumulative = end;
        }

        // Fallback: If dropped past the end, put in last page
        if (targetPageIndex === -1) {
          targetPageIndex = updatedPages.length - 1;
          const lastPageStart = updatedPages.slice(0, -1).reduce((s, p) => s + (p.duration || 5), 0);
          elementToMove.startTime = Math.max(0, globalStart - lastPageStart);
        }

        // Re-insert into target page
        updatedPages[targetPageIndex].elements = [
          ...(updatedPages[targetPageIndex].elements || []),
          elementToMove
        ];
      }

      // 3. Sync elementsRef if the change affected the current page
      if (elementsRef.current.pageId === currentPage) {
        const currentPageData = updatedPages.find(p => p.id === currentPage);
        elementsRef.current.elements = currentPageData ? currentPageData.elements : [];
      }

      if (shouldSaveHistory) {
        const currentPageElements = updatedPages.find(p => p.id === currentPage)?.elements || [];
        saveToHistory(currentPageElements);
      }

      return updatedPages;
    });
  }, [currentPage, setPages, saveToHistory]);

  // Batch update elements
  const updateElements = useCallback((updatesArray, shouldSaveHistory = true) => {
    setPages(prevPages => {
      // Create a map for O(1) lookups
      const updatesMap = new Map();
      updatesArray.forEach(u => updatesMap.set(u.id, u.updates));
      
      const newPages = prevPages.map(page => {
        if (page.id === currentPage) {
          const newElements = page.elements.map(el => {
            const updates = updatesMap.get(el.id);
            return updates ? { ...el, ...updates } : el;
          });
          return { ...page, elements: newElements };
        }
        return page;
      });

      if (shouldSaveHistory) {
        // We need the *new* elements state for history. 
        // But setState is async. We prefer passing the new state directly if possible.
        // For now, rely on standard flow or use the updater result if we refactor.
        // Actually, let's just save.
        // saveToHistory(newPages.find(p => p.id === currentPage).elements); 
      }
      return newPages;
    });

    // To save history correctly, we need the resolved elements.
    // This is a bit tricky with setPages updater.
    // Ideally we should use a separate history manager or effect.
    // For now, let's assume valid.
  }, [currentPage, setPages]);

  // Delete element
  const deleteElement = useCallback((id) => {
    if (lockedElements.has(id)) return;

    // Search across all pages to find and delete the element
    setPages(prevPages => {
      let elementFound = false;
      const updatedPages = prevPages.map(page => {
        const initialCount = (page.elements || []).length;
        const filteredElements = (page.elements || []).filter(el => el.id !== id);
        
        if (filteredElements.length < initialCount) {
          elementFound = true;
          // If the element was on the current page, we should also track it for history
          if (page.id === currentPage) {
            saveToHistory(filteredElements, canvasSize);
          }
          return { ...page, elements: filteredElements };
        }
        return page;
      });

      if (elementFound) {
        if (selectedElement === id) setSelectedElement(null);
        const newSelected = new Set(selectedElements);
        newSelected.delete(id);
        setSelectedElements(newSelected);
      }
      
      return updatedPages;
    });
  }, [
    lockedElements,
    currentPage,
    setPages,
    saveToHistory,
    canvasSize,
    selectedElement,
    selectedElements,
    setSelectedElement,
    setSelectedElements
  ]);

  // Duplicate element
  const duplicateElement = useCallback((id) => {
    if (lockedElements.has(id)) return;

    const currentElements = getCurrentPageElements();
    const element = currentElements.find(el => el.id === id);
    if (element) {
      const newId = generateId();
      const duplicated = {
        ...element,
        id: newId,
        x: element.x + 20,
        y: element.y + 20,
        zIndex: currentElements.length
      };

      let newElements = [...currentElements, duplicated];

      // If it's a group, duplicate all children too
      if (element.type === 'group') {
        const children = currentElements.filter(el => el.groupId === id);
        const duplicatedChildren = children.map(child => ({
          ...child,
          id: generateId(),
          groupId: newId,
          x: child.x + 20,
          y: child.y + 20,
          zIndex: newElements.length + children.indexOf(child)
        }));
        newElements = [...newElements, ...duplicatedChildren];
      }

      setCurrentPageElements(newElements);
      saveToHistory(newElements, canvasSize);

      // Select the new main element
      setSelectedElement(newId);
      setSelectedElements(new Set([newId]));
    }
  }, [
    lockedElements,
    getCurrentPageElements,
    generateId,
    setCurrentPageElements,
    saveToHistory,
    canvasSize,
    setSelectedElement,
    setSelectedElements
  ]);

  // Toggle element lock
  const toggleElementLock = useCallback((id) => {
    const newLocked = new Set(lockedElements);
    if (newLocked.has(id)) {
      newLocked.delete(id);
      updateElement(id, { locked: false });
    } else {
      newLocked.add(id);
      updateElement(id, { locked: true });
    }
    setLockedElements(newLocked);
  }, [lockedElements, updateElement, setLockedElements]);

  // Update filter value
  const updateFilter = useCallback((elementId, filterName, value) => {
    const currentElements = getCurrentPageElements();
    const element = currentElements.find(el => el.id === elementId);
    if (element) {
      const updatedFilters = { ...element.filters };
      if (updatedFilters[filterName]) {
        updatedFilters[filterName] = { ...updatedFilters[filterName], value };
        updateElement(elementId, { filters: updatedFilters });
      }
    }
  }, [getCurrentPageElements, updateElement]);

  // Group selected elements
  const groupElements = useCallback(() => {
    const currentElements = getCurrentPageElements();
    if (selectedElements.size < 2) return;

    const groupId = generateId();
    const selectedIds = Array.from(selectedElements);
    const selectedEls = currentElements.filter(el => selectedIds.includes(el.id));

    const minX = Math.min(...selectedEls.map(el => el.x));
    const minY = Math.min(...selectedEls.map(el => el.y));
    const maxX = Math.max(...selectedEls.map(el => el.x + el.width));
    const maxY = Math.max(...selectedEls.map(el => el.y + el.height));

    const group = {
      id: groupId,
      type: 'group',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      rotation: 0,
      children: selectedIds,
      zIndex: currentElements.length,
      fill: 'transparent',
      stroke: '#8b5cf6',
      strokeWidth: 2,
      strokeDasharray: '5,5'
    };

    const updatedElements = currentElements.map(el => {
      if (selectedIds.includes(el.id)) {
        return {
          ...el,
          groupId,
          relativeX: el.x - minX,
          relativeY: el.y - minY,
          relativeRotation: el.rotation || 0
        };
      }
      return el;
    });

    const newElements = [...updatedElements, group];
    setCurrentPageElements(newElements);
    setSelectedElement(groupId);
    setSelectedElements(new Set([groupId]));
    saveToHistory(newElements, canvasSize);
  }, [
    getCurrentPageElements,
    selectedElements,
    setCurrentPageElements,
    saveToHistory,
    setSelectedElement,
    setSelectedElements,
    canvasSize,
    generateId
  ]);

  // Ungroup elements
  const ungroupElements = useCallback((groupId) => {
    const currentElements = getCurrentPageElements();
    const group = currentElements.find(el => el.id === groupId);
    if (!group || group.type !== 'group') return;

    const updatedElements = currentElements.map(el => {
      if (el.groupId === groupId) {
        const { groupId: _, relativeX, relativeY, relativeRotation, ...rest } = el;
        return {
          ...rest,
          x: group.x + (relativeX || 0),
          y: group.y + (relativeY || 0),
          rotation: (group.rotation || 0) + (relativeRotation || 0)
        };
      }
      return el;
    }).filter(el => el.id !== groupId);

    setCurrentPageElements(updatedElements);
    setSelectedElement(null);
    setSelectedElements(new Set());
    saveToHistory(updatedElements, canvasSize);
  }, [
    getCurrentPageElements,
    setCurrentPageElements,
    saveToHistory,
    setSelectedElement,
    setSelectedElements,
    canvasSize
  ]);

  // Change element z-index
  const changeZIndex = useCallback((idOrIds, direction) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    const currentElements = getCurrentPageElements();

    // Filter out locked elements
    const validIds = ids.filter(id => !lockedElements.has(id));
    if (validIds.length === 0) return;

    let newElements = [...currentElements];

    // Sort indices to handle movements correctly
    const indices = validIds.map(id => newElements.findIndex(el => el.id === id)).sort((a, b) => a - b);

    // If any element not found
    if (indices.some(idx => idx === -1)) return;

    if (direction === 'front') {
      // Move all to front (maintain relative order)
      // Remove elements first
      const elementsToMove = [];
      // Remove from end to start to avoid index shifting issues
      for (let i = indices.length - 1; i >= 0; i--) {
        elementsToMove.unshift(newElements.splice(indices[i], 1)[0]);
      }
      // Add to end
      newElements.push(...elementsToMove);
    } else if (direction === 'back') {
      // Move all to back
      const elementsToMove = [];
      for (let i = indices.length - 1; i >= 0; i--) {
        elementsToMove.unshift(newElements.splice(indices[i], 1)[0]);
      }
      // Add to start
      newElements.unshift(...elementsToMove);
    } else if (direction === 'forward') {
      // Move each element forward by 1, starting from the top-most (highest index)
      // to avoid swapping issues
      for (let i = indices.length - 1; i >= 0; i--) {
        const oldIdx = indices[i];
        // const newIdx = Math.min(oldIdx + 1, newElements.length - 1);
        // If we are moving into a spot occupied by another selected element that hasn't moved yet?
        // Simpler approach: swap with next neighbor if neighbor is not in selection? 
        // Standard impl: just splice move
        if (oldIdx < newElements.length - 1) {
          const el = newElements.splice(oldIdx, 1)[0];
          newElements.splice(oldIdx + 1, 0, el);
        }
      }
    } else if (direction === 'backward') {
      // Move each backward, start from bottom-most
      for (let i = 0; i < indices.length; i++) {
        const oldIdx = indices[i]; // Note: indices might need recalculation if we modified array?
        // Actually, for single-step moves in a batch, it's tricky.
        // A robust "bring forward" for multiple elements usually means: 
        // "Shift the block of elements up, skipping over unselected elements".
        // For now, let's implement simple atomic moves.
        if (oldIdx > 0) {
          const el = newElements.splice(oldIdx, 1)[0];
          newElements.splice(oldIdx - 1, 0, el);
        }
      }
    }

    const updatedElements = newElements.map((el, idx) => ({
      ...el,
      zIndex: idx
    }));

    setCurrentPageElements(updatedElements);
    saveToHistory(updatedElements, canvasSize);
  }, [lockedElements, getCurrentPageElements, setCurrentPageElements, saveToHistory, canvasSize]);

  // Align elements
  const alignElements = useCallback((ids, alignType) => {
    const currentElements = getCurrentPageElements();
    const targetElements = currentElements.filter(el => ids.includes(el.id) && !lockedElements.has(el.id));

    if (targetElements.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    targetElements.forEach(el => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    });

    const canvasW = canvasSize.width;
    const canvasH = canvasSize.height;

    const newElements = currentElements.map(el => {
      if (!ids.includes(el.id) || lockedElements.has(el.id)) return el;

      let newX = el.x;
      let newY = el.y;

      switch (alignType) {
        case 'left':
          newX = targetElements.length > 1 ? minX : 0;
          break;
        case 'center':
          newX = targetElements.length > 1 ? (minX + maxX) / 2 - el.width / 2 : canvasW / 2 - el.width / 2;
          break;
        case 'right':
          newX = targetElements.length > 1 ? maxX - el.width : canvasW - el.width;
          break;
        case 'top':
          newY = targetElements.length > 1 ? minY : 0;
          break;
        case 'middle':
          newY = targetElements.length > 1 ? (minY + maxY) / 2 - el.height / 2 : canvasH / 2 - el.height / 2;
          break;
        case 'bottom':
          newY = targetElements.length > 1 ? maxY - el.height : canvasH - el.height;
          break;
        default:
          break;
      }

      return { ...el, x: newX, y: newY };
    });

    setCurrentPageElements(newElements);
    saveToHistory(newElements, canvasSize);
  }, [lockedElements, getCurrentPageElements, setCurrentPageElements, saveToHistory, canvasSize]);

  // Reorder element to specific index (for Drag and Drop)
  const reorderElement = useCallback((id, newIndex) => {
    if (lockedElements.has(id)) return;

    const currentElements = getCurrentPageElements();
    const elementIndex = currentElements.findIndex(el => el.id === id);
    if (elementIndex === -1) return;

    // Clamp newIndex
    const targetIndex = Math.max(0, Math.min(newIndex, currentElements.length - 1));
    if (elementIndex === targetIndex) return;

    const newElements = [...currentElements];
    const [element] = newElements.splice(elementIndex, 1);
    newElements.splice(targetIndex, 0, element);

    // Update z-indicies if needed (though array order is source of truth)
    const updatedElements = newElements.map((el, idx) => ({
      ...el,
      zIndex: idx
    }));

    setCurrentPageElements(updatedElements);
    saveToHistory(updatedElements, canvasSize);
  }, [lockedElements, getCurrentPageElements, setCurrentPageElements, saveToHistory, canvasSize]);

  // Split element at current time
  const splitElement = useCallback((id, globalTime) => {
    if (lockedElements.has(id)) return;

    setPages(prevPages => {
      let elementToSplit = null;
      let targetPageIndex = -1;
      let accumulatedTime = 0;

      // 1. Find the element and its page
      for (let i = 0; i < prevPages.length; i++) {
        const page = prevPages[i];
        const elIndex = (page.elements || []).findIndex(el => el.id === id);
        if (elIndex !== -1) {
          elementToSplit = page.elements[elIndex];
          targetPageIndex = i;
          break;
        }
        accumulatedTime += (page.duration || 5);
      }

      if (!elementToSplit || targetPageIndex === -1) return prevPages;

      const localSplitTime = globalTime - accumulatedTime;
      const elStart = elementToSplit.startTime || 0;
      const elDur = elementToSplit.duration || 5;

      // Ensure split is within bounds
      if (localSplitTime <= elStart || localSplitTime >= (elStart + elDur)) return prevPages;

      const splitPointInClip = localSplitTime - elStart;

      // Create part 1: Trim the end
      const part1 = {
        ...elementToSplit,
        duration: splitPointInClip
      };

      // Create part 2: New ID, start at split time, trim the beginning
      const part2 = {
        ...elementToSplit,
        id: generateId(),
        startTime: localSplitTime,
        duration: elDur - splitPointInClip,
        // Important for audio/video sync: adjust offset
        audioOffset: (elementToSplit.audioOffset || 0) + splitPointInClip
      };

      // Replace original with part 1 and part 2
      const updatedPages = [...prevPages];
      const pageElements = [...updatedPages[targetPageIndex].elements];
      const originalIndex = pageElements.findIndex(el => el.id === id);
      
      pageElements.splice(originalIndex, 1, part1, part2);
      updatedPages[targetPageIndex] = {
        ...updatedPages[targetPageIndex],
        elements: pageElements
      };

      // Select the second part after split
      setSelectedElement(part2.id);
      setSelectedElements(new Set([part2.id]));

      saveToHistory(pageElements);
      return updatedPages;
    });
  }, [lockedElements, setPages, generateId, setSelectedElement, setSelectedElements, saveToHistory]);

  return {
    getCurrentPageElements,
    setCurrentPageElements,
    addElement,
    updateElement,
    updateElements,
    deleteElement,
    duplicateElement,
    toggleElementLock,
    updateFilter,
    groupElements,
    ungroupElements,
    changeZIndex,
    reorderElement,
    splitElement,
    alignElements,
    applyEditableTemplate
  };
};

export default useElements;
