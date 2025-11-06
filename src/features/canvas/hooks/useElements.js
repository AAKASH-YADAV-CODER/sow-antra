import { useCallback } from 'react';

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
  filterOptions,
  supportedLanguages
}) => {
  
  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Get current page elements
  const getCurrentPageElements = useCallback(() => {
    const page = pages.find(p => p.id === currentPage);
    return page ? page.elements : [];
  }, [pages, currentPage]);

  // Set current page elements
  const setCurrentPageElements = useCallback((newElements) => {
    setPages(pages.map(page => 
      page.id === currentPage ? { ...page, elements: newElements } : page
    ));
  }, [pages, currentPage, setPages]);

  // Add element to canvas
  const addElement = useCallback((type, properties = {}) => {
    const currentElements = getCurrentPageElements();
    const newElement = {
      id: generateId(),
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 300 : type === 'line' ? 150 : 100,
      height: type === 'text' ? 100 : type === 'line' ? 2 : 100,
      rotation: 0,
      animation: null,
      zIndex: currentElements.length,
      locked: false,
      filters: JSON.parse(JSON.stringify(filterOptions)),
      fill: properties.fill || (type === 'rectangle' ? '#3b82f6' : 
                              type === 'circle' ? '#ef4444' : 
                              type === 'triangle' ? '#10b981' : 
                              type === 'star' ? '#f59e0b' : 
                              type === 'hexagon' ? '#8b5cf6' : '#3b82f6'),
      stroke: properties.stroke || (type === 'image' ? 'transparent' : '#000000'),
      strokeWidth: properties.strokeWidth || (type === 'image' ? 0 : 2),
      fillType: properties.fillType || 'solid',
      gradient: properties.gradient || {
        type: 'linear',
        colors: ['#3b82f6', '#ef4444'],
        stops: [0, 100],
        angle: 90,
        position: { x: 50, y: 50 }
      },
      textEffect: 'none',
      imageEffect: 'none',
      shapeEffect: 'none',
      specialEffect: 'none',
      effectSettings: {},
      borderRadius: properties.borderRadius || 0,
      shadow: properties.shadow || null,
      ...properties
    };

    if (type === 'text') {
      newElement.content = t('text.doubleClickToEdit');
      newElement.fontSize = 24;
      newElement.fontFamily = supportedLanguages[currentLanguage]?.font || 'Arial';
      newElement.fontWeight = 'normal';
      newElement.fontStyle = 'normal';
      newElement.textDecoration = 'none';
      newElement.color = '#000000';
      newElement.textAlign = textDirection === 'rtl' ? 'right' : 'left';
    } else if (type === 'rectangle') {
      newElement.borderRadius = properties.borderRadius || 0;
    } else if (type === 'image') {
      newElement.src = properties.src || '';
      newElement.borderRadius = properties.borderRadius || 0;
      newElement.stroke = properties.stroke || 'transparent';
      newElement.strokeWidth = properties.strokeWidth || 0;
    } else if (type === 'arrow') {
      newElement.fill = '#000000';
    } else if (type === 'star') {
      newElement.points = 5;
    } else if (type === 'drawing') {
      newElement.stroke = '#000000';
      newElement.strokeWidth = 3;
      newElement.path = properties.path || [];
    } else if (type === 'sticker') {
      newElement.sticker = properties.sticker || 'smile';
      newElement.fill = properties.fill || '#f59e0b';
      newElement.width = 80;
      newElement.height = 80;
    }

    const newElements = [...currentElements, newElement];
    setCurrentPageElements(newElements);
    setSelectedElement(newElement.id);
    setSelectedElements(new Set([newElement.id]));
    setCurrentTool('select');
    saveToHistory(newElements);
  }, [
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
    setCurrentTool
  ]);

  // Update element properties
  const updateElement = useCallback((id, updates) => {
    const currentElements = getCurrentPageElements();
    const newElements = currentElements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setCurrentPageElements(newElements);
    saveToHistory(newElements);
  }, [getCurrentPageElements, setCurrentPageElements, saveToHistory]);

  // Delete element
  const deleteElement = useCallback((id) => {
    if (lockedElements.has(id)) return;
    
    const currentElements = getCurrentPageElements();
    const newElements = currentElements.filter(el => el.id !== id);
    setCurrentPageElements(newElements);
    if (selectedElement === id) setSelectedElement(null);
    const newSelected = new Set(selectedElements);
    newSelected.delete(id);
    setSelectedElements(newSelected);
    saveToHistory(newElements);
  }, [
    lockedElements, 
    getCurrentPageElements, 
    setCurrentPageElements, 
    selectedElement, 
    selectedElements, 
    saveToHistory,
    setSelectedElement,
    setSelectedElements
  ]);

  // Duplicate element
  const duplicateElement = useCallback((id) => {
    if (lockedElements.has(id)) return;
    
    const currentElements = getCurrentPageElements();
    const element = currentElements.find(el => el.id === id);
    if (element) {
      const duplicated = {
        ...element,
        id: generateId(),
        x: element.x + 20,
        y: element.y + 20,
        zIndex: currentElements.length
      };
      const newElements = [...currentElements, duplicated];
      setCurrentPageElements(newElements);
      setSelectedElement(duplicated.id);
      setSelectedElements(new Set([duplicated.id]));
      saveToHistory(newElements);
    }
  }, [
    lockedElements, 
    getCurrentPageElements, 
    setCurrentPageElements, 
    saveToHistory,
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
    saveToHistory(newElements);
  }, [
    getCurrentPageElements, 
    selectedElements, 
    setCurrentPageElements, 
    saveToHistory,
    setSelectedElement,
    setSelectedElements
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
    saveToHistory(updatedElements);
  }, [
    getCurrentPageElements, 
    setCurrentPageElements, 
    saveToHistory,
    setSelectedElement,
    setSelectedElements
  ]);

  // Change element z-index
  const changeZIndex = useCallback((id, direction) => {
    if (lockedElements.has(id)) return;
    
    const currentElements = getCurrentPageElements();
    const elementIndex = currentElements.findIndex(el => el.id === id);
    if (elementIndex === -1) return;
    
    let newIndex;
    if (direction === 'front') {
      newIndex = currentElements.length - 1;
    } else if (direction === 'forward') {
      newIndex = Math.min(elementIndex + 1, currentElements.length - 1);
    } else if (direction === 'backward') {
      newIndex = Math.max(elementIndex - 1, 0);
    } else if (direction === 'back') {
      newIndex = 0;
    } else {
      return;
    }
    
    const newElements = [...currentElements];
    const [element] = newElements.splice(elementIndex, 1);
    newElements.splice(newIndex, 0, element);
    
    const updatedElements = newElements.map((el, idx) => ({
      ...el,
      zIndex: idx
    }));
    
    setCurrentPageElements(updatedElements);
    saveToHistory(updatedElements);
  }, [lockedElements, getCurrentPageElements, setCurrentPageElements, saveToHistory]);

  return {
    getCurrentPageElements,
    setCurrentPageElements,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    toggleElementLock,
    updateFilter,
    groupElements,
    ungroupElements,
    changeZIndex
  };
};

export default useElements;
