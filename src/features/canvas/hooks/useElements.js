import { useCallback } from 'react';
import { generateId } from '../utils/constants';

/**
 * Custom hook for managing canvas elements
 * @param {array} elements - Current elements array
 * @param {function} setElements - Function to update elements (from useHistory)
 * @returns {object} - Element management functions
 */
const useElements = (elements, setElements) => {
  // Add a new element
  const addElement = useCallback((elementData) => {
    const newElement = {
      id: generateId(),
      ...elementData,
      timestamp: Date.now(),
    };
    setElements([...elements, newElement]);
    return newElement.id;
  }, [elements, setElements]);

  // Update an existing element
  const updateElement = useCallback((id, updates) => {
    setElements(
      elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      )
    );
  }, [elements, setElements]);

  // Delete an element
  const deleteElement = useCallback((id) => {
    setElements(elements.filter((el) => el.id !== id));
  }, [elements, setElements]);

  // Duplicate an element
  const duplicateElement = useCallback((id) => {
    const element = elements.find((el) => el.id === id);
    if (!element) return null;

    const newElement = {
      ...element,
      id: generateId(),
      x: element.x + 20,
      y: element.y + 20,
      timestamp: Date.now(),
    };
    setElements([...elements, newElement]);
    return newElement.id;
  }, [elements, setElements]);

  // Bring element to front (move to end of array)
  const bringToFront = useCallback((id) => {
    const index = elements.findIndex((el) => el.id === id);
    if (index === -1 || index === elements.length - 1) return;

    const element = elements[index];
    const newElements = elements.filter((el) => el.id !== id);
    setElements([...newElements, element]);
  }, [elements, setElements]);

  // Send element to back (move to start of array)
  const sendToBack = useCallback((id) => {
    const index = elements.findIndex((el) => el.id === id);
    if (index === -1 || index === 0) return;

    const element = elements[index];
    const newElements = elements.filter((el) => el.id !== id);
    setElements([element, ...newElements]);
  }, [elements, setElements]);

  // Move element forward (increase z-index by 1)
  const moveForward = useCallback((id) => {
    const index = elements.findIndex((el) => el.id === id);
    if (index === -1 || index === elements.length - 1) return;

    const newElements = [...elements];
    [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
    setElements(newElements);
  }, [elements, setElements]);

  // Move element backward (decrease z-index by 1)
  const moveBackward = useCallback((id) => {
    const index = elements.findIndex((el) => el.id === id);
    if (index === -1 || index === 0) return;

    const newElements = [...elements];
    [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
    setElements(newElements);
  }, [elements, setElements]);

  // Get element by id
  const getElement = useCallback((id) => {
    return elements.find((el) => el.id === id);
  }, [elements]);

  // Get elements by type
  const getElementsByType = useCallback((type) => {
    return elements.filter((el) => el.type === type);
  }, [elements]);

  // Clear all elements
  const clearElements = useCallback(() => {
    setElements([]);
  }, [setElements]);

  // Replace all elements
  const replaceElements = useCallback((newElements) => {
    setElements(newElements);
  }, [setElements]);

  // Group multiple elements
  const groupElements = useCallback((ids) => {
    const elementsToGroup = elements.filter((el) => ids.includes(el.id));
    if (elementsToGroup.length < 2) return null;

    // Calculate bounding box
    const minX = Math.min(...elementsToGroup.map((el) => el.x));
    const minY = Math.min(...elementsToGroup.map((el) => el.y));
    const maxX = Math.max(...elementsToGroup.map((el) => el.x + el.width));
    const maxY = Math.max(...elementsToGroup.map((el) => el.y + el.height));

    const groupElement = {
      id: generateId(),
      type: 'group',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      children: elementsToGroup.map((el) => ({
        ...el,
        // Store relative positions
        x: el.x - minX,
        y: el.y - minY,
      })),
      timestamp: Date.now(),
    };

    // Remove grouped elements and add group
    const remainingElements = elements.filter((el) => !ids.includes(el.id));
    setElements([...remainingElements, groupElement]);
    return groupElement.id;
  }, [elements, setElements]);

  // Ungroup a group element
  const ungroupElements = useCallback((groupId) => {
    const group = elements.find((el) => el.id === groupId);
    if (!group || group.type !== 'group') return;

    // Convert relative positions back to absolute
    const ungroupedElements = group.children.map((child) => ({
      ...child,
      id: generateId(),
      x: child.x + group.x,
      y: child.y + group.y,
      timestamp: Date.now(),
    }));

    // Remove group and add children
    const remainingElements = elements.filter((el) => el.id !== groupId);
    setElements([...remainingElements, ...ungroupedElements]);
  }, [elements, setElements]);

  // Select elements within a rectangle
  const selectInRect = useCallback((rect) => {
    return elements.filter((el) => {
      const elRight = el.x + el.width;
      const elBottom = el.y + el.height;
      const rectRight = rect.x + rect.width;
      const rectBottom = rect.y + rect.height;

      return (
        el.x < rectRight &&
        elRight > rect.x &&
        el.y < rectBottom &&
        elBottom > rect.y
      );
    }).map((el) => el.id);
  }, [elements]);

  return {
    // CRUD operations
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    
    // Z-index management
    bringToFront,
    sendToBack,
    moveForward,
    moveBackward,
    
    // Query operations
    getElement,
    getElementsByType,
    
    // Bulk operations
    clearElements,
    replaceElements,
    
    // Grouping
    groupElements,
    ungroupElements,
    
    // Selection
    selectInRect,
  };
};

export default useElements;
