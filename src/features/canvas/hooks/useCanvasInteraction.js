import { useState, useCallback } from 'react';
import styles from '../../../styles/MainPage.module.css';

/**
 * Custom hook for handling canvas mouse/touch interactions
 * Manages drag, resize, rotate, pan, and selection operations
 * 
 * @param {Object} params - Hook parameters
 * @param {Function} params.getCurrentPageElements - Get current page elements
 * @param {Function} params.setCurrentPageElements - Update current page elements
 * @param {Function} params.updateElement - Update single element
 * @param {Function} params.saveToHistory - Save state to history
 * @param {Function} params.addElement - Add new element
 * @param {Set} params.lockedElements - Set of locked element IDs
 * @param {Set} params.selectedElements - Set of selected element IDs
 * @param {Function} params.setSelectedElements - Update selected elements
 * @param {string} params.selectedElement - Currently selected element ID
 * @param {Function} params.setSelectedElement - Update selected element
 * @param {string} params.currentTool - Current tool (pen, etc.)
 * @param {number} params.zoomLevel - Canvas zoom level
 * @param {Object} params.canvasOffset - Canvas offset {x, y}
 * @param {Function} params.setCanvasOffset - Update canvas offset
 * @param {boolean} params.snapToGrid - Snap to grid enabled
 * @param {Object} params.canvasRef - Canvas container ref
 * @param {Function} params.setTextEditing - Set text editing element ID
 * @returns {Object} Interaction handlers and state
 */
export const useCanvasInteraction = ({
  getCurrentPageElements,
  setCurrentPageElements,
  updateElement,
  saveToHistory,
  addElement,
  lockedElements,
  selectedElements,
  setSelectedElements,
  selectedElement,
  setSelectedElement,
  currentTool,
  zoomLevel,
  canvasOffset,
  setCanvasOffset,
  snapToGrid,
  canvasRef,
  setTextEditing
}) => {
  // Interaction states
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState([]);
  const [dragStart, setDragStart] = useState({ 
    x: 0, 
    y: 0, 
    elementX: 0, 
    elementY: 0,
    elementWidth: 0,
    elementHeight: 0,
    elementRotation: 0,
    resizeDirection: ''
  });
  const [showAlignmentLines, setShowAlignmentLines] = useState(false);
  const [alignmentLines, setAlignmentLines] = useState({ vertical: [], horizontal: [] });

  // Calculate alignment lines
  const calculateAlignmentLines = useCallback((movingElement) => {
    const currentElements = getCurrentPageElements();
    const lines = { vertical: [], horizontal: [] };
    const threshold = 5;

    currentElements.forEach(el => {
      if (el.id === movingElement.id || selectedElements.has(el.id) || lockedElements.has(el.id)) return;

      if (Math.abs(el.x - movingElement.x) < threshold) {
        lines.vertical.push(el.x);
      }
      if (Math.abs(el.x + el.width - movingElement.x) < threshold) {
        lines.vertical.push(el.x + el.width);
      }
      if (Math.abs(el.x - (movingElement.x + movingElement.width)) < threshold) {
        lines.vertical.push(el.x);
      }

      if (Math.abs(el.y - movingElement.y) < threshold) {
        lines.horizontal.push(el.y);
      }
      if (Math.abs(el.y + el.height - movingElement.y) < threshold) {
        lines.horizontal.push(el.y + el.height);
      }
      if (Math.abs(el.y - (movingElement.y + movingElement.height)) < threshold) {
        lines.horizontal.push(el.y);
      }
    });

    setAlignmentLines(lines);
  }, [selectedElements, getCurrentPageElements, lockedElements]);

  // Handle selection
  const handleSelectElement = useCallback((e, elementId) => {
    e.stopPropagation();
    
    const currentElements = getCurrentPageElements();
    const element = currentElements.find(el => el.id === elementId);
    
    if (!element) return;
    
    // If element is in a group, select the group instead
    if (element.groupId && !selectedElements.has(element.groupId)) {
      const groupElement = currentElements.find(el => el.id === element.groupId);
      if (groupElement && !lockedElements.has(groupElement.id)) {
        // Select the group instead of the individual element
        if (e.ctrlKey || e.metaKey) {
          const newSelected = new Set(selectedElements);
          if (newSelected.has(groupElement.id)) {
            newSelected.delete(groupElement.id);
          } else {
            newSelected.add(groupElement.id);
          }
          setSelectedElement(groupElement.id);
          setSelectedElements(newSelected);
        } else {
          setSelectedElement(groupElement.id);
          setSelectedElements(new Set([groupElement.id]));
        }
        return;
      }
    }
    
    if (lockedElements.has(elementId)) {
      setSelectedElement(elementId);
      setSelectedElements(new Set([elementId]));
      return;
    }
    
    if (e.ctrlKey || e.metaKey) {
      const newSelected = new Set(selectedElements);
      if (newSelected.has(elementId)) {
        newSelected.delete(elementId);
        if (newSelected.size === 0) {
          setSelectedElement(null);
        } else if (selectedElement === elementId) {
          setSelectedElement(Array.from(newSelected)[0]);
        }
      } else {
        newSelected.add(elementId);
        setSelectedElement(elementId);
      }
      setSelectedElements(newSelected);
    } else {
      setSelectedElement(elementId);
      setSelectedElements(new Set([elementId]));
    }
  }, [selectedElements, selectedElement, lockedElements, getCurrentPageElements, setSelectedElement, setSelectedElements]);

  // Handle drawing with pen tool
  const handleDrawing = useCallback((e) => {
    if (currentTool !== 'pen' || !isDrawing || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvasOffset.x) / zoomLevel;
    const y = (e.clientY - rect.top - canvasOffset.y) / zoomLevel;
    
    setDrawingPath(prev => [...prev, { x, y }]);
  }, [currentTool, isDrawing, zoomLevel, canvasOffset, canvasRef]);

  // Finish drawing and create a path element
  const finishDrawing = useCallback(() => {
    if (currentTool !== 'pen' || drawingPath.length === 0) return;
    
    addElement('drawing', { path: [...drawingPath] });
    setDrawingPath([]);
    setIsDrawing(false);
  }, [currentTool, drawingPath, addElement]);

  // Enhanced mouse down handler with resize direction
  const handleMouseDown = useCallback((e, elementId, action = 'drag', direction = '') => {
    e.stopPropagation();
    e.preventDefault();
    
    const currentElements = getCurrentPageElements();
    const element = currentElements.find(el => el.id === elementId);
    if (!element) return;

    // If element is in a group, use the group for operations
    const targetElement = element.groupId 
      ? currentElements.find(el => el.id === element.groupId) 
      : element;
    
    if (!targetElement || (lockedElements.has(targetElement.id) && action !== 'select')) return;

    handleSelectElement(e, targetElement.id);
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    if (action === 'drag' && !lockedElements.has(targetElement.id)) {
      setIsDragging(true);
      setShowAlignmentLines(true);
    } else if (action === 'resize' && !lockedElements.has(targetElement.id)) {
      setIsResizing(true);
    } else if (action === 'rotate' && !lockedElements.has(targetElement.id)) {
      setIsRotating(true);
    }

    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      elementX: targetElement.x,
      elementY: targetElement.y,
      elementWidth: targetElement.width,
      elementHeight: targetElement.height,
      elementRotation: targetElement.rotation,
      resizeDirection: direction
    });
  }, [getCurrentPageElements, lockedElements, handleSelectElement, canvasRef]);

  // Enhanced mouse move handler with directional resizing
  const handleMouseMove = useCallback((e) => {
    if (!canvasRef.current) return;

    if (currentTool === 'pen' && isDrawing) {
      handleDrawing(e);
      return;
    }

    if (!selectedElement || (!isDragging && !isResizing && !isRotating && !isPanning)) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - canvasOffset.x) / zoomLevel;
    const mouseY = (e.clientY - rect.top - canvasOffset.y) / zoomLevel;
    
    if (isPanning) {
      setCanvasOffset({
        x: canvasOffset.x + e.movementX,
        y: canvasOffset.y + e.movementY
      });
      return;
    }
    
    const currentElements = getCurrentPageElements();
    const element = currentElements.find(el => el.id === selectedElement);
    if (!element) return;
    
    // Handle group movement
    if (element.type === 'group' && isDragging) {
      const deltaX = mouseX - dragStart.x;
      const deltaY = mouseY - dragStart.y;
      
      let newX = dragStart.elementX + deltaX;
      let newY = dragStart.elementY + deltaY;
      
      if (snapToGrid) {
        newX = Math.round(newX / 10) * 10;
        newY = Math.round(newY / 10) * 10;
      }
      
      // Move all children of the group
      const newElements = currentElements.map(el => {
        if (el.groupId === selectedElement) {
          return {
            ...el,
            x: newX + (el.relativeX || 0),
            y: newY + (el.relativeY || 0)
          };
        } else if (el.id === selectedElement) {
          return {
            ...el,
            x: newX,
            y: newY
          };
        }
        return el;
      });
      
      setCurrentPageElements(newElements);
      saveToHistory(newElements);
      calculateAlignmentLines({ ...element, x: newX, y: newY });
    } else if (isDragging) {
      const deltaX = mouseX - dragStart.x;
      const deltaY = mouseY - dragStart.y;
      
      let newX = dragStart.elementX + deltaX;
      let newY = dragStart.elementY + deltaY;
      
      if (snapToGrid) {
        newX = Math.round(newX / 10) * 10;
        newY = Math.round(newY / 10) * 10;
      }
      
      if (selectedElements.size === 1) {
        updateElement(selectedElement, { x: newX, y: newY });
        calculateAlignmentLines({ ...element, x: newX, y: newY });
      } else {
        const deltaMoveX = newX - element.x;
        const deltaMoveY = newY - element.y;
        
        const newElements = currentElements.map(el => {
          if (selectedElements.has(el.id) && !lockedElements.has(el.id)) {
            return {
              ...el,
              x: el.x + deltaMoveX,
              y: el.y + deltaMoveY
            };
          }
          return el;
        });
        
        setCurrentPageElements(newElements);
        saveToHistory(newElements);
      }
    } else if (isResizing) {
      const deltaX = mouseX - dragStart.x;
      const deltaY = mouseY - dragStart.y;
      
      let newX = dragStart.elementX;
      let newY = dragStart.elementY;
      let newWidth = dragStart.elementWidth;
      let newHeight = dragStart.elementHeight;

      switch (dragStart.resizeDirection) {
        case 'nw':
          newX = dragStart.elementX + deltaX;
          newY = dragStart.elementY + deltaY;
          newWidth = Math.max(20, dragStart.elementWidth - deltaX);
          newHeight = Math.max(20, dragStart.elementHeight - deltaY);
          break;
        case 'ne':
          newY = dragStart.elementY + deltaY;
          newWidth = Math.max(20, dragStart.elementWidth + deltaX);
          newHeight = Math.max(20, dragStart.elementHeight - deltaY);
          break;
        case 'sw':
          newX = dragStart.elementX + deltaX;
          newWidth = Math.max(20, dragStart.elementWidth - deltaX);
          newHeight = Math.max(20, dragStart.elementHeight + deltaY);
          break;
        case 'se':
          newWidth = Math.max(20, dragStart.elementWidth + deltaX);
          newHeight = Math.max(20, dragStart.elementHeight + deltaY);
          break;
        case 'n':
          newY = dragStart.elementY + deltaY;
          newHeight = Math.max(20, dragStart.elementHeight - deltaY);
          break;
        case 's':
          newHeight = Math.max(20, dragStart.elementHeight + deltaY);
          break;
        case 'w':
          newX = dragStart.elementX + deltaX;
          newWidth = Math.max(20, dragStart.elementWidth - deltaX);
          break;
        case 'e':
          newWidth = Math.max(20, dragStart.elementWidth + deltaX);
          break;
        default:
          // No resize direction specified
          break;
      }

      updateElement(selectedElement, { 
        x: newX, 
        y: newY, 
        width: newWidth, 
        height: newHeight 
      });
    } else if (isRotating) {
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;
      updateElement(selectedElement, { rotation: angle });
    }
  }, [selectedElement, isDragging, isResizing, isRotating, isPanning, dragStart, getCurrentPageElements, calculateAlignmentLines, zoomLevel, canvasOffset, selectedElements, snapToGrid, updateElement, saveToHistory, currentTool, isDrawing, handleDrawing, lockedElements, setCurrentPageElements, setCanvasOffset, canvasRef]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (currentTool === 'pen' && isDrawing) {
      finishDrawing();
    }
    
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setIsPanning(false);
    setShowAlignmentLines(false);
    setAlignmentLines({ vertical: [], horizontal: [] });
  }, [currentTool, isDrawing, finishDrawing]);

  // Canvas panning
  const handleCanvasMouseDown = useCallback((e) => {
    if (currentTool === 'pen') {
      setIsDrawing(true);
      setDrawingPath([]);
      return;
    }
    
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      return;
    }
    
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
      setSelectedElements(new Set());
      setTextEditing(null);
    }
  }, [currentTool, canvasRef, setSelectedElement, setSelectedElements, setTextEditing]);

  // Handle text editing
  const handleTextEdit = useCallback((e, elementId) => {
    if (lockedElements.has(elementId)) return;
    
    e.stopPropagation();
    setTextEditing(elementId);
    setSelectedElement(elementId);
    setSelectedElements(new Set([elementId]));
    
    setTimeout(() => {
      const element = document.getElementById(`element-${elementId}`);
      if (element) {
        element.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        
        if (element.childNodes.length > 0) {
          range.setStart(element, element.childNodes.length);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }, 0);
  }, [lockedElements, setTextEditing, setSelectedElement, setSelectedElements]);

  // Enhanced selection handles with corner pointers and center slots
  const renderSelectionHandles = useCallback((element) => {
    if (!element || lockedElements.has(element.id)) return null;

    const handleSize = 12;
    const handleBorder = 2;
    const slotSize = 8;
    const connectionLineColor = '#8b5cf6';
    const handleColor = '#ffffff';
    const handleBorderColor = '#8b5cf6';

    const handles = [
      // Corner handles (white circles with purple border)
      { x: -handleSize/2, y: -handleSize/2, cursor: 'nw-resize', type: 'nw' },
      { x: element.width - handleSize/2, y: -handleSize/2, cursor: 'ne-resize', type: 'ne' },
      { x: -handleSize/2, y: element.height - handleSize/2, cursor: 'sw-resize', type: 'sw' },
      { x: element.width - handleSize/2, y: element.height - handleSize/2, cursor: 'se-resize', type: 'se' },
      
      // Center slot handles (purple slots)
      { x: element.width/2 - slotSize/2, y: -slotSize/2, cursor: 'n-resize', type: 'n', isSlot: true },
      { x: element.width/2 - slotSize/2, y: element.height - slotSize/2, cursor: 's-resize', type: 's', isSlot: true },
      { x: -slotSize/2, y: element.height/2 - slotSize/2, cursor: 'w-resize', type: 'w', isSlot: true },
      { x: element.width - slotSize/2, y: element.height/2 - slotSize/2, cursor: 'e-resize', type: 'e', isSlot: true }
    ];

    const handleMouseDownLocal = (e, action, direction = '') => {
      e.stopPropagation();
      e.preventDefault();
      
      if (action === 'resize') {
        setIsResizing(true);
        
        const rect = canvasRef.current.getBoundingClientRect();
        setDragStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          elementX: element.x,
          elementY: element.y,
          elementWidth: element.width,
          elementHeight: element.height,
          elementRotation: element.rotation,
          resizeDirection: direction
        });
      } else if (action === 'rotate') {
        setIsRotating(true);
        
        const rect = canvasRef.current.getBoundingClientRect();
        setDragStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          elementX: element.x,
          elementY: element.y,
          elementWidth: element.width,
          elementHeight: element.height,
          elementRotation: element.rotation
        });
      }
    };

    // Selection box must rotate around the element's center point
    // Element center relative to selection box's top-left:
    // X: element.width/2 + 10 (half width + 10px padding)
    // Y: element.height/2 + 10 (half height + 10px padding)
    const selectionBoxStyle = {
      position: 'absolute',
      left: element.x - 10,
      top: element.y - 10,
      width: element.width + 20,
      height: element.height + 20,
      pointerEvents: 'none',
      transform: `rotate(${element.rotation || 0}deg)`,
      transformOrigin: `${element.width / 2 + 10}px ${element.height / 2 + 10}px`,
      zIndex: element.zIndex + 1000
    };

    const selectionBorderStyle = {
      position: 'absolute',
      left: 10,
      top: 10,
      width: element.width,
      height: element.height,
      border: `2px dashed ${connectionLineColor}`,
      borderRadius: '2px',
      pointerEvents: 'none'
    };

    return (
      <div
        key={`selection-${element.id}`}
        className={styles.selectionBox || ''}
        style={selectionBoxStyle}
      >
        {/* Selection border */}
        <div style={selectionBorderStyle} />

        {/* Handles */}
        {handles.map((handle, index) => {
          const handleStyle = {
            position: 'absolute',
            left: handle.x + 10,
            top: handle.y + 10,
            width: handle.isSlot ? slotSize : handleSize,
            height: handle.isSlot ? slotSize : handleSize,
            backgroundColor: handle.isSlot ? connectionLineColor : handleColor,
            border: handle.isSlot ? 'none' : `${handleBorder}px solid ${handleBorderColor}`,
            borderRadius: handle.isSlot ? '1px' : '50%',
            cursor: handle.cursor,
            pointerEvents: 'auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          };
          
          return (
            <div
              key={index}
              className={styles.resizeHandle || ''}
              style={handleStyle}
              onMouseDown={(e) => handleMouseDownLocal(e, 'resize', handle.type)}
            />
          );
        })}

        {/* Rotate handle */}
        <div
          className={styles.rotateHandle || ''}
          style={{
            position: 'absolute',
            top: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            width: handleSize,
            height: handleSize,
            backgroundColor: '#ef4444',
            border: `2px solid #ffffff`,
            borderRadius: '50%',
            cursor: 'grab',
            pointerEvents: 'auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
          onMouseDown={(e) => handleMouseDownLocal(e, 'rotate')}
        />

        {/* Connection line to rotate handle */}
        <svg
          style={{
            position: 'absolute',
            top: -25,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 2,
            height: 15,
            pointerEvents: 'none'
          }}
        >
          <line x1="1" y1="0" x2="1" y2="15" stroke="#ef4444" strokeWidth="2" />
        </svg>
      </div>
    );
  }, [lockedElements, canvasRef, setIsResizing, setIsRotating, setDragStart, styles]);

  return {
    // State
    isDragging,
    isResizing,
    isRotating,
    isPanning,
    isDrawing,
    drawingPath,
    showAlignmentLines,
    alignmentLines,
    
    // Handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasMouseDown,
    handleSelectElement,
    handleTextEdit,
    handleDrawing,
    finishDrawing,
    calculateAlignmentLines,
    renderSelectionHandles,
    
    // State setters (for external control if needed)
    setIsDrawing,
    setDrawingPath
  };
};
