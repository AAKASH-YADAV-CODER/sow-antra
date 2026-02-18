import { useState, useCallback, useRef, useEffect } from 'react';
import { getDistance, getPathBoundingBox } from '../../../utils/bezier';

// Helper to calculate ghost image dimensions (frame content)
const calculateGhostRect = (element) => {
  if (!element || element.type !== 'frame' || !element.content) return null;

  const contentW = element.contentWidth || 1000;
  const contentH = element.contentHeight || 1000;

  const frameW = element.width;
  const frameH = element.height;

  const frameRatio = frameW / frameH;
  const contentRatio = contentW / contentH;

  let baseW, baseH;

  // Cover logic: match CSS object-fit: cover logic manually
  if (contentRatio > frameRatio) {
    // Image is wider relative to frame -> Fit Height
    baseH = frameH;
    baseW = baseH * contentRatio;
  } else {
    // Image is taller relative to frame -> Fit Width
    baseW = frameW;
    baseH = baseW / contentRatio;
  }

  const scale = element.contentScale || 1;
  const finalW = baseW * scale;
  const finalH = baseH * scale;

  // Center + offset
  const centerX = element.x + frameW / 2 + (element.contentX || 0);
  const centerY = element.y + frameH / 2 + (element.contentY || 0);

  // If crop exists, we need to show the FULL image rect as the ghost, 
  // but the crop box as the "visible" part?
  // Actually, for standard image cropping in Canva:
  // - You see the full image ghosted.
  // - You see a crop box (the element bounds).
  // - Handles are on the CROP BOX (the element bounds).
  // - Double clicking enters "Crop Mode" where you see full image and can move/scale the image RELATIVE to the crop box.

  // BUT for Frames:
  // - The "Crop Box" is the Frame itself (FIXED size).
  // - You move/scale the image INSIDE.
  // - So the handles should be on the IMAGE (Ghost).
  // - Corner handles => Scale Image.
  // - Side handles => Scale Image non-uniformly? OR Crop the image?
  // - If I drag side handle of image inside frame, I am changing the image's aspect ratio or clipping it?
  // - User said "edges click pani drag panaka crop aaganum" -> "Click drag edges -> Crop happens".
  // - This implies standard image cropping behavior: The ghost image ITSELF gets cropped?
  // - If so, we need `contentCrop`.

  // Let's return the rect of the *visible* part of the internal image if cropped?
  // NO, ghost handles usually control the *image transform*.
  // If we support `contentCrop`, then the handles should be on the *cropped* image bounds.

  // Adjusted for crop if present
  const crop = element.contentCrop || { t: 0, b: 0, l: 0, r: 0 };
  // The "Full" width/height before crop
  const fullW = finalW;
  const fullH = finalH;

  // The "Visible" width/height after crop (which is what handles surround)
  const visibleW = fullW * (1 - crop.l - crop.r);
  const visibleH = fullH * (1 - crop.t - crop.b);

  // The "Visible" x/y
  // centerX/Y is center of FULL image.
  // TopLeft of FULL image:
  const fullX = centerX - fullW / 2;
  const fullY = centerY - fullH / 2;

  // TopLeft of Visible:
  const visibleX = fullX + (fullW * crop.l);
  const visibleY = fullY + (fullH * crop.t);

  return {
    x: visibleX,
    y: visibleY,
    width: visibleW,
    height: visibleH,
    rotation: element.rotation,
    baseW, // Unscaled, Uncropped base dims
    baseH,
    fullW, // Scaled, Uncropped dims
    fullH,
    fullX,
    fullY,
    crop
  };
};

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
  setTextEditing,
  currentPage,
  canvasSize,
  frameEditing,
  setFrameEditing
}) => {
  // Interaction states
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDraggingNewAnchor, setIsDraggingNewAnchor] = useState(false);
  const [isMovingFrameContent, setIsMovingFrameContent] = useState(false);
  const [drawingPath, setDrawingPath] = useState([]);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    elementX: 0,
    elementY: 0,
    elementWidth: 0,
    elementHeight: 0,
    elementRotation: 0,
    resizeDirection: '',
    initialFontSize: 0,
    initialLineHeight: 0,
    initialLetterSpacing: 0,
    initialPadding: 0,
    initialChildren: [],
    initialContentX: 0,
    initialContentY: 0,
    initialContentScale: 1
  });
  const [showAlignmentLines, setShowAlignmentLines] = useState(false);
  const [alignmentLines, setAlignmentLines] = useState({ vertical: [], horizontal: [] });
  const [penCursorPos, setPenCursorPos] = useState(null);
  const snapTargetsRef = useRef([]); // Cache for snap targets during drag
  const lastVectorAnchorsRef = useRef(null); // Cache latest anchors for normalization
  const activePenElementIdRef = useRef(null); // Track the current path being drawn

  // Clear active pen element when switching tools
  useEffect(() => {
    if (currentTool !== 'pen') {
      activePenElementIdRef.current = null;
    }
  }, [currentTool]);

  // Calculate alignment lines
  const calculateAlignmentLines = useCallback((movingElement) => {
    // Use cached targets if available, otherwise fallback (though we should always have them during drag)
    const targets = snapTargetsRef.current.length > 0 ? snapTargetsRef.current : getCurrentPageElements();
    const lines = { vertical: [], horizontal: [] };
    const threshold = 5;

    targets.forEach(el => {
      if (el.id === movingElement.id || selectedElements.has(el.id) || lockedElements.has(el.id)) return;

      // Vertical lines
      if (Math.abs(el.x - movingElement.x) < threshold) {
        lines.vertical.push(el.x);
      }
      if (Math.abs(el.x + el.width - movingElement.x) < threshold) {
        lines.vertical.push(el.x + el.width);
      }
      if (Math.abs(el.x - (movingElement.x + movingElement.width)) < threshold) {
        lines.vertical.push(el.x);
      }
      // Center
      const elCenterX = el.x + el.width / 2;
      const movingCenterX = movingElement.x + movingElement.width / 2;
      if (Math.abs(elCenterX - movingCenterX) < threshold) {
        lines.vertical.push(elCenterX);
      }

      // Horizontal lines
      if (Math.abs(el.y - movingElement.y) < threshold) {
        lines.horizontal.push(el.y);
      }
      if (Math.abs(el.y + el.height - movingElement.y) < threshold) {
        lines.horizontal.push(el.y + el.height);
      }
      if (Math.abs(el.y - (movingElement.y + movingElement.height)) < threshold) {
        lines.horizontal.push(el.y);
      }
      // Center
      const elCenterY = el.y + el.height / 2;
      const movingCenterY = movingElement.y + movingElement.height / 2;
      if (Math.abs(elCenterY - movingCenterY) < threshold) {
        lines.horizontal.push(elCenterY);
      }
    });

    setAlignmentLines(lines);
  }, [selectedElements, getCurrentPageElements, lockedElements]);

  // Measurement State
  const [measurements, setMeasurements] = useState([]);

  // Clear measurements when selection is lost or dragging stops
  useEffect(() => {
    if (!selectedElement || !isDragging) {
      setMeasurements([]);
    }
  }, [selectedElement, isDragging]);

  // Clear measurements when selection is lost or dragging stops
  useEffect(() => {
    if (!selectedElement || !isDragging) {
      setMeasurements([]);
    }
  }, [selectedElement, isDragging]);

  // Calculate measurement guides (distance to nearest neighbors)
  const calculateMeasurements = useCallback((movingElement) => {
    const currentElements = getCurrentPageElements();
    const otherElements = currentElements.filter(el =>
      el.id !== movingElement.id &&
      !selectedElements.has(el.id) &&
      !lockedElements.has(el.id)
    );

    const guides = [];
    const threshold = 50; // Max distance to show guide

    // Helper to check overlap
    const overlapsY = (a, b) => {
      return a.y < b.y + b.height && a.y + a.height > b.y;
    };
    const overlapsX = (a, b) => {
      return a.x < b.x + b.width && a.x + a.width > b.x;
    };

    // 1. Right Neighbor (moving element is on the left)
    let minDistRight = Infinity;
    let rightNeighbor = null;

    otherElements.forEach(el => {
      if (overlapsY(movingElement, el)) {
        // el is roughly in the same row
        if (el.x >= movingElement.x + movingElement.width) {
          const dist = el.x - (movingElement.x + movingElement.width);
          if (dist < minDistRight) {
            minDistRight = dist;
            rightNeighbor = el;
          }
        }
      }
    });

    if (rightNeighbor && minDistRight < threshold * 3) { // Allow larger gap for measurements
      guides.push({
        type: 'gap',
        orientation: 'horizontal',
        x: movingElement.x + movingElement.width,
        y: movingElement.y + movingElement.height / 2, // Center Y
        length: minDistRight,
        value: Math.round(minDistRight),
        neighborId: rightNeighbor.id
      });
    }

    // 2. Left Neighbor (moving element is on the right)
    let minDistLeft = Infinity;
    let leftNeighbor = null;

    otherElements.forEach(el => {
      if (overlapsY(movingElement, el)) {
        if (movingElement.x >= el.x + el.width) {
          const dist = movingElement.x - (el.x + el.width);
          if (dist < minDistLeft) {
            minDistLeft = dist;
            leftNeighbor = el;
          }
        }
      }
    });

    if (leftNeighbor && minDistLeft < threshold * 3) {
      guides.push({
        type: 'gap',
        orientation: 'horizontal',
        x: leftNeighbor.x + leftNeighbor.width,
        y: movingElement.y + movingElement.height / 2,
        length: minDistLeft,
        value: Math.round(minDistLeft),
        neighborId: leftNeighbor.id
      });
    }

    // 3. Bottom Neighbor (moving element is above)
    let minDistBottom = Infinity;
    let bottomNeighbor = null;

    otherElements.forEach(el => {
      if (overlapsX(movingElement, el)) {
        if (el.y >= movingElement.y + movingElement.height) {
          const dist = el.y - (movingElement.y + movingElement.height);
          if (dist < minDistBottom) {
            minDistBottom = dist;
            bottomNeighbor = el;
          }
        }
      }
    });

    if (bottomNeighbor && minDistBottom < threshold * 3) {
      guides.push({
        type: 'gap',
        orientation: 'vertical',
        x: movingElement.x + movingElement.width / 2, // Center X
        y: movingElement.y + movingElement.height,
        length: minDistBottom,
        value: Math.round(minDistBottom),
        neighborId: bottomNeighbor.id
      });
    }

    // 4. Top Neighbor (moving element is below)
    let minDistTop = Infinity;
    let topNeighbor = null;

    otherElements.forEach(el => {
      if (overlapsX(movingElement, el)) {
        if (movingElement.y >= el.y + el.height) {
          const dist = movingElement.y - (el.y + el.height);
          if (dist < minDistTop) {
            minDistTop = dist;
            topNeighbor = el;
          }
        }
      }
    });

    if (topNeighbor && minDistTop < threshold * 3) {
      guides.push({
        type: 'gap',
        orientation: 'vertical',
        x: movingElement.x + movingElement.width / 2,
        y: topNeighbor.y + topNeighbor.height,
        length: minDistTop,
        value: Math.round(minDistTop),
        neighborId: topNeighbor.id
      });
    }

    setMeasurements(guides);
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
    if (currentTool !== 'pen' || !isDrawing) return;

    const pageElement = e.target.closest('.page-paper');
    if (!pageElement) return;

    const rect = pageElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    setDrawingPath(prev => [...prev, { x, y }]);
  }, [currentTool, isDrawing, zoomLevel]);

  // Finish drawing and create a path element
  const finishDrawing = useCallback(() => {
    activePenElementIdRef.current = null;
    if (currentTool !== 'pen' || drawingPath.length === 0) {
      setIsDrawing(false);
      return;
    }

    // Calculate bounding box
    const minX = Math.min(...drawingPath.map(p => p.x));
    const minY = Math.min(...drawingPath.map(p => p.y));
    const maxX = Math.max(...drawingPath.map(p => p.x));
    const maxY = Math.max(...drawingPath.map(p => p.y));

    const width = Math.max(10, maxX - minX);
    const height = Math.max(10, maxY - minY);

    // Normalize path coordinates to be relative to the bounding box top-left
    const normalizedPath = drawingPath.map(p => ({
      x: p.x - minX,
      y: p.y - minY
    }));

    addElement('drawing', {
      x: minX,
      y: minY,
      width,
      height,
      path: normalizedPath
    });

    setDrawingPath([]);
    setIsDrawing(false);
  }, [currentTool, drawingPath, addElement]);

  // Handle Pen Tool Click (Bezier Path Creation)
  const handlePenInteraction = useCallback((e, x, y) => {
    console.log('handlePenInteraction triggered at:', { x, y }, 'currentTool:', currentTool);
    if (currentTool !== 'pen') return;

    // Find selected vector path
    const currentElements = getCurrentPageElements();
    let targetId = activePenElementIdRef.current || selectedElement;
    console.log('Current targetId for pen:', targetId);
    let targetElement = currentElements.find(el => el.id === targetId && el.type === 'vector_path');

    if (targetElement && targetElement.bezierAnchors && targetElement.bezierAnchors.length > 0) {
      // Check for auto-join (clicking near the first point)
      const firstAnchor = targetElement.bezierAnchors[0];
      if (!firstAnchor || !firstAnchor.point) return;

      const startGlobal = {
        x: firstAnchor.point.x + targetElement.x,
        y: firstAnchor.point.y + targetElement.y
      };

      const dist = getDistance({ x, y }, startGlobal);
      const snapThreshold = 15; // pixels

      if (dist < snapThreshold && targetElement.bezierAnchors.length >= 2) {
        // CLOSE PATH
        updateElement(targetId, { isClosed: true });
        console.log('Path closed via auto-join');
        return;
      }

      // Start drag-to-create-handle state
      setIsDraggingNewAnchor(true);

      // APPEND NEW ANCHOR
      const globalAnchors = (targetElement.bezierAnchors || []).map(a => ({
        point: { x: (a.point?.x || 0) + targetElement.x, y: (a.point?.y || 0) + targetElement.y },
        handleIn: { x: (a.handleIn?.x || a.point?.x || 0) + targetElement.x, y: (a.handleIn?.y || a.point?.y || 0) + targetElement.y },
        handleOut: { x: (a.handleOut?.x || a.point?.x || 0) + targetElement.x, y: (a.handleOut?.y || a.point?.y || 0) + targetElement.y }
      }));

      const nextAnchorGlobal = {
        point: { x, y },
        handleIn: { x: x, y: y }, // Sharp corners by default
        handleOut: { x: x, y: y }
      };

      globalAnchors.push(nextAnchorGlobal);

      // Re-calculate BBox using the new utility
      const { minX, minY, maxX, maxY } = getPathBoundingBox(globalAnchors);

      const newWidth = Math.max(1, maxX - minX);
      const newHeight = Math.max(1, maxY - minY);

      // Re-normalize anchors to new TopLeft
      const newLocalAnchors = globalAnchors.map(a => ({
        point: { x: a.point.x - minX, y: a.point.y - minY },
        handleIn: { x: a.handleIn.x - minX, y: a.handleIn.y - minY },
        handleOut: { x: a.handleOut.x - minX, y: a.handleOut.y - minY }
      }));

      updateElement(targetId, {
        x: minX,
        y: minY,
        width: newWidth,
        height: newHeight,
        bezierAnchors: newLocalAnchors
      });

    } else {
      // Create new Vector Path

      // Better: create exactly at point with NO handles (sharp)
      const initSize = 2; // Tiny initial size for the first point
      const newId = addElement('vector_path', {
        x: x - initSize / 2,
        y: y - initSize / 2,
        width: initSize,
        height: initSize,
        bezierAnchors: [
          {
            point: { x: initSize / 2, y: initSize / 2 },
            handleIn: { x: initSize / 2, y: initSize / 2 }, // Sharp by default
            handleOut: { x: initSize / 2, y: initSize / 2 } // Sharp by default
          }
        ],
        fill: 'none',
        stroke: '#000000',
        strokeWidth: 2,
        isClosed: false
      });
      if (newId) {
        setIsDraggingNewAnchor(true);
        activePenElementIdRef.current = newId;
      }

      // We need to select it immediately to continue drawing
      // addElement usually selects the new element.
    }

  }, [currentTool, selectedElement, getCurrentPageElements, updateElement, addElement, setIsDraggingNewAnchor]);

  // Enhanced mouse down handler with resize direction
  const handleMouseDown = useCallback((e, elementId, action = 'drag', direction = '') => {
    e.stopPropagation();
    e.preventDefault();

    // Common coordinate calculation
    const pageElement = e.target.closest('.page-paper');
    const rect = pageElement ? pageElement.getBoundingClientRect() : (canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 });
    const clientX = (e.clientX - rect.left) / zoomLevel;
    const clientY = (e.clientY - rect.top) / zoomLevel;

    // PEN TOOL INTERACTION
    if (currentTool === 'pen') {
      console.log('Pen Tool Clicked at:', clientX, clientY);
      handlePenInteraction(e, clientX, clientY);
      return;
    }

    // EXIT FRAME EDITING if clicking elsewhere
    if (frameEditing && elementId !== frameEditing) {
      setFrameEditing(null);
    }

    const currentElements = getCurrentPageElements();
    const element = currentElements.find(el => el.id === elementId);
    if (!element) return;

    // If element is in a group, use the group for operations
    const targetElement = element.groupId
      ? currentElements.find(el => el.id === element.groupId)
      : element;

    if (!targetElement || (lockedElements.has(targetElement.id) && action !== 'select')) return;

    handleSelectElement(e, targetElement.id);

    // Coordinate variables already exist from upper scope (x, y)
    // We can reuse them or if we need fresh ones relative to something else (we don't), we should rename.
    // The previous block declared:
    // const x = (e.clientX - rect.left) / zoomLevel;
    // const y = (e.clientY - rect.top) / zoomLevel;

    // We will just use those.

    if (action === 'drag' && !lockedElements.has(targetElement.id)) {
      setIsDragging(true);
      setShowAlignmentLines(true);
      // Cache snap targets at start of drag
      snapTargetsRef.current = currentElements.map(el => ({
        id: el.id,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        type: el.type,
        groupId: el.groupId
      }));
    } else if (action === 'resize' && !lockedElements.has(targetElement.id)) {
      setIsResizing(true);
      // Cache for resizing too
      snapTargetsRef.current = currentElements.map(el => ({
        id: el.id,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height
      }));

      // If editing frame content, use GHOST dimensions for dragStart
      if (frameEditing === targetElement.id) {
        const ghost = calculateGhostRect(targetElement);
        if (ghost) {
          // Override targetElement for dragStart setup
          // We want dragStart to reflect the ghost box so resizing math works naturally
          // logic below uses targetElement.x, .width etc.
          // We can mutate a local copy or just handle it in setDragStart
          // Let's handle it in setDragStart by checking frameEditing
        }
      }

    } else if (action === 'rotate' && !lockedElements.has(targetElement.id)) {
      setIsRotating(true);
    }

    const ghost = frameEditing === targetElement.id ? calculateGhostRect(targetElement) : null;

    setDragStart({
      x: clientX,
      y: clientY,
      elementX: ghost ? ghost.x : targetElement.x,
      elementY: ghost ? ghost.y : targetElement.y,
      elementWidth: ghost ? ghost.width : targetElement.width,
      elementHeight: ghost ? ghost.height : targetElement.height,
      elementRotation: targetElement.rotation,
      resizeDirection: direction,
      initialFontSize: targetElement.fontSize || 64,
      initialLength: targetElement.length || 0,
      initialBorderWidth: targetElement.borderWidth || 0,
      initialLineHeight: targetElement.lineHeight || 1.2,
      initialLetterSpacing: targetElement.letterSpacing || 0,
      initialPadding: targetElement.padding || 4,
      initialChildren: targetElement.type === 'group'
        ? currentElements.filter(el => el.groupId === targetElement.id).map(el => ({ ...el }))
        : [],
      initialContentX: targetElement.contentX || 0,
      initialContentY: targetElement.contentY || 0,
      initialContentScale: targetElement.contentScale || 1,
      initialCrop: targetElement.contentCrop ? { ...targetElement.contentCrop } : { t: 0, b: 0, l: 0, r: 0 },
      initialBezierAnchors: targetElement.type === 'vector_path' ? [...(targetElement.bezierAnchors || [])] : [],
      initialPath: targetElement.type === 'drawing' ? [...(targetElement.path || [])] : []
    });

    if (frameEditing === targetElement.id && action === 'drag') {
      setIsMovingFrameContent(true);
      setIsDragging(false); // Don't move the frame itself
    }
  }, [getCurrentPageElements, lockedElements, handleSelectElement, canvasRef, zoomLevel, currentTool, handlePenInteraction, frameEditing, setFrameEditing]);

  // Enhanced mouse move handler with directional resizing
  const rafRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!canvasRef.current) return;

    // Persist event if needed (React 17+) or just extract values
    // In React 17+ event pooling is gone, but safe to extract values.
    const eventData = {
      clientX: e.clientX,
      clientY: e.clientY,
      movementX: e.movementX,
      movementY: e.movementY,
      target: e.target
    };

    if (currentTool === 'pen') {
      const pageElement = e.target.closest('.page-paper');
      const rect = pageElement ? pageElement.getBoundingClientRect() : (canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 });
      const mouseX = (e.clientX - rect.left) / zoomLevel;
      const mouseY = (e.clientY - rect.top) / zoomLevel;
      setPenCursorPos({ x: mouseX, y: mouseY });

      if (isDrawing) {
        handleDrawing(e);
        return;
      }
    } else if (penCursorPos !== null) {
      setPenCursorPos(null);
    }

    if (!selectedElement || (!isDragging && !isResizing && !isRotating && !isPanning && !isMovingFrameContent)) return;

    // Throttle using requestAnimationFrame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const pageElement = eventData.target.closest('.page-paper');
      const rect = pageElement ? pageElement.getBoundingClientRect() : (canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 });
      const mouseX = (eventData.clientX - rect.left) / zoomLevel;
      const mouseY = (eventData.clientY - rect.top) / zoomLevel;

      // Handle pulling out handles during new anchor creation
      if (isDraggingNewAnchor && selectedElement && currentTool === 'pen') {
        const currentElements = getCurrentPageElements();
        const el = currentElements.find(e => e.id === selectedElement);
        if (el && el.type === 'vector_path' && el.bezierAnchors.length > 0) {
          const anchors = [...el.bezierAnchors];
          const lastIdx = anchors.length - 1;
          const lastAnchor = { ...anchors[lastIdx] };

          // The mouse position in element-local coordinates
          const localX = mouseX - el.x;
          const localY = mouseY - el.y;

          // handleOut moves with mouse
          lastAnchor.handleOut = { x: localX, y: localY };
          // handleIn is mirrored
          const dx = localX - lastAnchor.point.x;
          const dy = localY - lastAnchor.point.y;
          lastAnchor.handleIn = { x: lastAnchor.point.x - dx, y: lastAnchor.point.y - dy };

          anchors[lastIdx] = lastAnchor;
          lastVectorAnchorsRef.current = anchors;
          updateElement(selectedElement, { bezierAnchors: anchors }, false);
          return;
        }
      }

      if (isPanning) {
        setCanvasOffset({
          x: canvasOffset.x + eventData.movementX,
          y: canvasOffset.y + eventData.movementY
        });
        return;
      }

      const currentElements = getCurrentPageElements();
      const element = currentElements.find(el => el.id === selectedElement);
      if (!element) return;

      if (isMovingFrameContent) {
        const deltaX = mouseX - dragStart.x;
        const deltaY = mouseY - dragStart.y;

        updateElement(selectedElement, {
          contentX: dragStart.initialContentX + deltaX,
          contentY: dragStart.initialContentY + deltaY
        }, false);
        return;
      }

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
        // saveToHistory(newElements); // Remove this, save on up
        calculateAlignmentLines({ ...element, x: newX, y: newY });
        calculateMeasurements({ ...element, x: newX, y: newY });
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
          updateElement(selectedElement, { x: newX, y: newY }, false);
          calculateAlignmentLines({ ...element, x: newX, y: newY });
          calculateMeasurements({ ...element, x: newX, y: newY });
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
          // saveToHistory(newElements); // Remove this, save on up
        }
      } else if (isResizing) {
        const deltaX = mouseX - dragStart.x;
        const deltaY = mouseY - dragStart.y;

        let newX = dragStart.elementX;
        let newY = dragStart.elementY;
        let newWidth = dragStart.elementWidth;
        let newHeight = dragStart.elementHeight;

        // --- GHOST IMAGE RESIZING/CROPPING FOR FRAMES ---
        if (frameEditing === selectedElement) {
          const ghost = calculateGhostRect(element);
          if (ghost) {
            const deltaX = mouseX - dragStart.x;
            const deltaY = mouseY - dragStart.y;

            // Initial State from dragStart
            // We need to store initial Full/Visible dims in dragStart to be precise, 
            // but let's approximate or rely on current element state if safe.
            // Actually dragStart.elementWidth is the Visible Width at start.

            // If Corner -> SCALE (Uniform)
            if (['nw', 'ne', 'sw', 'se'].includes(dragStart.resizeDirection)) {
              // ... Existing Scale Logic ...
              // Note: Scaling the visible box scales the WHOLE image if we want to maintain crop %.
              // Or does it change crop? Usually corner = scale everything.

              let nextVisibleW = Math.max(20, dragStart.elementWidth + (dragStart.resizeDirection.includes('w') ? -deltaX : deltaX));
              const scaleRatio = nextVisibleW / dragStart.elementWidth;

              // const newScale = (dragStart.initialContentScale || 1) * scaleRatio;

              // We also need to move contentX/Y because scaling happens around center of Full Image? 
              // Or center of Visible Image?
              // Visual resize happens around the opposite corner of the Visible Box.

              // This is complex math. Detailed approach:
              // 1. Calculate new Visible Rect (x, y, w, h) based on mouse delta.
              // 2. Calculate new Full Rect based on new Visible Rect + existing Crop %.
              // 3. Derive new Scale from new Full Rect vs Base Rect.
              // 4. Derive new X/Y from new Full Rect center vs Frame Center.

              let nextVisibleH = dragStart.elementHeight * scaleRatio;
              let nextVisibleX = dragStart.elementX;
              let nextVisibleY = dragStart.elementY;

              if (dragStart.resizeDirection.includes('w')) {
                nextVisibleX = dragStart.elementX + (dragStart.elementWidth - nextVisibleW);
              }
              if (dragStart.resizeDirection.includes('n')) {
                nextVisibleY = dragStart.elementY + (dragStart.elementHeight - nextVisibleH);
              }

              // Now map back to Full Rect
              // visibleW = fullW * (1 - crop.l - crop.r) => fullW = visibleW / (1 - crop.l - crop.r)
              // (1 - crop.l - crop.r) is constant during uniform scale.
              const cropW_Pct = 1 - (ghost.crop.l + ghost.crop.r);
              const cropH_Pct = 1 - (ghost.crop.t + ghost.crop.b);

              const nextFullW = nextVisibleW / cropW_Pct;
              const nextFullH = nextVisibleH / cropH_Pct;

              // New Scale
              const newScaleVal = nextFullW / ghost.baseW; // ghost.baseW is unscaled base

              // New Full TopLeft
              // visibleX = fullX + (fullW * crop.l) => fullX = visibleX - (fullW * crop.l)
              const nextFullX = nextVisibleX - (nextFullW * ghost.crop.l);
              const nextFullY = nextVisibleY - (nextFullH * ghost.crop.t);

              // New Center
              const nextCenterX = nextFullX + nextFullW / 2;
              const nextCenterY = nextFullY + nextFullH / 2;

              // New ContentXY (Relative to Frame Center)
              const frameCenterX = element.x + element.width / 2;
              const frameCenterY = element.y + element.height / 2;

              updateElement(selectedElement, {
                contentScale: newScaleVal,
                contentX: nextCenterX - frameCenterX,
                contentY: nextCenterY - frameCenterY
              }, false);

            }
            // If Side -> CROP (Change Crop %)
            else if (['n', 's', 'e', 'w'].includes(dragStart.resizeDirection)) {
              // Calculate new Visible Edge
              // e.g. 'e' -> New Width. 
              // fullW stays same (Scale stays same).
              // We just adjust crop.r

              const fullW = ghost.fullW;
              const fullH = ghost.fullH;

              // Fix: Use Initial Crop as base to prevent compounding speed
              let newCrop = { ...dragStart.initialCrop };

              if (dragStart.resizeDirection === 'e') {
                // We need to calculate based on INITIAL state to be precise, 
                // but let's approximate with initialCrop + delta / fullW technique.
                // R = InitialR - (deltaX / fullW)

                let newR = newCrop.r - (deltaX / fullW);
                newR = Math.max(0, Math.min(1 - newCrop.l, newR));
                newCrop.r = newR;
              }
              else if (dragStart.resizeDirection === 'w') {
                // L = InitialL + (deltaX / fullW)
                let newL = newCrop.l + (deltaX / fullW);
                newL = Math.max(0, Math.min(1 - newCrop.r, newL));
                newCrop.l = newL;
              }
              else if (dragStart.resizeDirection === 's') {
                // B = InitialB - (deltaY / fullH)
                let newB = newCrop.b - (deltaY / fullH);
                newB = Math.max(0, Math.min(1 - newCrop.t, newB));
                newCrop.b = newB;
              }
              else if (dragStart.resizeDirection === 'n') {
                // T = InitialT + (deltaY / fullH)
                let newT = newCrop.t + (deltaY / fullH);
                newT = Math.max(0, Math.min(1 - newCrop.b, newT));
                newCrop.t = newT;
              }

              updateElement(selectedElement, {
                contentCrop: newCrop
              }, false);
            }

            return; // STOP
          }
        }

        switch (dragStart.resizeDirection) {
          case 'nw':
          case 'ne':
          case 'sw':
          case 'se':
            newWidth = Math.max(20, dragStart.elementWidth + (dragStart.resizeDirection.includes('w') ? -deltaX : deltaX));
            newHeight = Math.max(20, dragStart.elementHeight + (dragStart.resizeDirection.includes('n') ? -deltaY : deltaY));

            if (element.type === 'text' || element.type === 'type_extrude') {
              const initialRatio = dragStart.elementWidth / dragStart.elementHeight;

              // Determine which dimension changed more or use width as driver
              let nextWidth = Math.max(20, dragStart.elementWidth + (dragStart.resizeDirection.includes('w') ? -deltaX : deltaX));
              let nextHeight = nextWidth / initialRatio;

              const scaleFactor = nextWidth / dragStart.elementWidth;
              const newFontSize = (dragStart.initialFontSize || 64) * scaleFactor;

              const updates = {
                fontSize: newFontSize,
                width: nextWidth,
                height: nextHeight
              };

              // For TypeExtrude, also scale depth (length) and border proportionally
              if (element.type === 'type_extrude') {
                updates.length = (dragStart.initialLength || 25) * scaleFactor;
                updates.borderWidth = (dragStart.initialBorderWidth || 0) * scaleFactor;
              }

              updateElement(selectedElement, updates, false);
              return;
            }

            // Enforce aspect ratio for images on corner drag
            if (element.type === 'image') {
              const ratio = dragStart.elementWidth / dragStart.elementHeight;
              if (newWidth / newHeight > ratio) {
                newWidth = newHeight * ratio;
                if (dragStart.resizeDirection.includes('w')) {
                  newX = dragStart.elementX + (dragStart.elementWidth - newWidth);
                }
              } else {
                newHeight = newWidth / ratio;
                if (dragStart.resizeDirection.includes('n')) {
                  newY = dragStart.elementY + (dragStart.elementHeight - newHeight);
                }
              }
            }
            break;
          case 'n':
          case 's':
            newY = dragStart.resizeDirection === 'n' ? dragStart.elementY + deltaY : dragStart.elementY;
            newHeight = Math.max(20, dragStart.elementHeight + (dragStart.resizeDirection === 'n' ? -deltaY : deltaY));
            break;
          case 'w':
          case 'e':
            newX = dragStart.resizeDirection === 'w' ? dragStart.elementX + deltaX : dragStart.elementX;
            newWidth = Math.max(20, dragStart.elementWidth + (dragStart.resizeDirection === 'w' ? -deltaX : deltaX));

            if (element.type === 'text') {
              updateElement(selectedElement, {
                x: newX,
                width: newWidth,
                isAutoWidth: false // Lock width on manual resize
              }, false);
              return;
            }
            break;
          default:
            break;
        }


        // Special handling for Image Cropping (N, S, E, W) - Percentage Based (Canva Style)
        if (element.type === 'image' && ['n', 's', 'e', 'w'].includes(dragStart.resizeDirection)) {
          const initialCrop = dragStart.initialCrop || { t: 0, b: 0, l: 0, r: 0 };
          const newCrop = { ...initialCrop };
          let finalWidth = newWidth;
          let finalHeight = newHeight;
          let finalX = newX;
          let finalY = newY;

          // Uncropped dimensions (The "Frame" in user's snippet)
          const frameW = dragStart.elementWidth / (1 - (initialCrop.l || 0) - (initialCrop.r || 0));
          const frameH = dragStart.elementHeight / (1 - (initialCrop.t || 0) - (initialCrop.b || 0));

          switch (dragStart.resizeDirection) {
            case 'n':
              newCrop.t = Math.max(0, Math.min(1 - initialCrop.b - 0.02, initialCrop.t + (deltaY / frameH)));
              finalHeight = dragStart.elementHeight - (newCrop.t - initialCrop.t) * frameH;
              finalY = dragStart.elementY + (newCrop.t - initialCrop.t) * frameH;
              break;
            case 's':
              newCrop.b = Math.max(0, Math.min(1 - initialCrop.t - 0.02, initialCrop.b - (deltaY / frameH)));
              finalHeight = dragStart.elementHeight - (newCrop.b - initialCrop.b) * frameH;
              break;
            case 'w':
              newCrop.l = Math.max(0, Math.min(1 - initialCrop.r - 0.02, initialCrop.l + (deltaX / frameW)));
              finalWidth = dragStart.elementWidth - (newCrop.l - initialCrop.l) * frameW;
              finalX = dragStart.elementX + (newCrop.l - initialCrop.l) * frameW;
              break;
            case 'e':
              newCrop.r = Math.max(0, Math.min(1 - initialCrop.l - 0.02, initialCrop.r - (deltaX / frameW)));
              finalWidth = dragStart.elementWidth - (newCrop.r - initialCrop.r) * frameW;
              break;
            default:
              break;
          }

          updateElement(selectedElement, {
            x: finalX,
            y: finalY,
            width: finalWidth,
            height: finalHeight,
            crop: newCrop
          }, false);
          return;
        }

        if (element.type === 'group') {
          const scaleX = newWidth / dragStart.elementWidth;
          const scaleY = newHeight / dragStart.elementHeight;
          const scaleFactor = Math.min(scaleX, scaleY);

          setCurrentPageElements(prevElements => prevElements.map(el => {
            if (el.groupId === selectedElement) {
              const initialChild = dragStart.initialChildren.find(c => c.id === el.id);
              if (!initialChild) return el;

              const relX = initialChild.relativeX !== undefined
                ? initialChild.relativeX
                : (initialChild.x - dragStart.elementX);
              const relY = initialChild.relativeY !== undefined
                ? initialChild.relativeY
                : (initialChild.y - dragStart.elementY);

              const updatedChild = {
                ...el,
                x: newX + relX * scaleX,
                y: newY + relY * scaleY,
                width: initialChild.width * scaleX,
                height: initialChild.height * scaleY
              };

              // Scale common properties
              if (initialChild.strokeWidth !== undefined) {
                updatedChild.strokeWidth = initialChild.strokeWidth * scaleFactor;
              }
              if (initialChild.borderRadius !== undefined) {
                updatedChild.borderRadius = initialChild.borderRadius * scaleFactor;
              }

              // Handle specific element types
              if (el.type === 'text') {
                updatedChild.fontSize = Math.max(8, Math.round((initialChild.fontSize || 16) * scaleFactor));
                updatedChild.letterSpacing = (initialChild.letterSpacing || 0) * scaleFactor;
                updatedChild.padding = (initialChild.padding || 4) * scaleFactor;
              } else if (el.type === 'drawing' && initialChild.path) {
                updatedChild.path = initialChild.path.map(point => ({
                  x: point.x * scaleX,
                  y: point.y * scaleY
                }));
              } else if (el.type === 'vector_path' && initialChild.bezierAnchors) {
                updatedChild.bezierAnchors = initialChild.bezierAnchors.map(a => ({
                  point: { x: (a.point?.x || 0) * scaleX, y: (a.point?.y || 0) * scaleY },
                  handleIn: { x: (a.handleIn?.x || 0) * scaleX, y: (a.handleIn?.y || 0) * scaleY },
                  handleOut: { x: (a.handleOut?.x || 0) * scaleX, y: (a.handleOut?.y || 0) * scaleY }
                }));
              }

              return updatedChild;
            } else if (el.id === selectedElement) {
              return { ...el, x: newX, y: newY, width: newWidth, height: newHeight };
            }
            return el;
          }));
        } else {
          // Single element resize
          if (element.type === 'vector_path' && dragStart.initialBezierAnchors) {
            const scaleX = newWidth / dragStart.elementWidth;
            const scaleY = newHeight / dragStart.elementHeight;

            // Guard against divide by zero or NaN
            const SAFE_SCALE_X = Number.isFinite(scaleX) ? scaleX : 1;
            const SAFE_SCALE_Y = Number.isFinite(scaleY) ? scaleY : 1;

            const scaledAnchors = dragStart.initialBezierAnchors.map(a => ({
              point: { x: (a.point?.x || 0) * SAFE_SCALE_X, y: (a.point?.y || 0) * SAFE_SCALE_Y },
              handleIn: { x: (a.handleIn?.x || 0) * SAFE_SCALE_X, y: (a.handleIn?.y || 0) * SAFE_SCALE_Y },
              handleOut: { x: (a.handleOut?.x || 0) * SAFE_SCALE_X, y: (a.handleOut?.y || 0) * SAFE_SCALE_Y }
            }));

            updateElement(selectedElement, {
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight,
              bezierAnchors: scaledAnchors
            }, false);
          } else if (element.type === 'drawing' && dragStart.initialPath) {
            const scaleX = newWidth / dragStart.elementWidth;
            const scaleY = newHeight / dragStart.elementHeight;

            // Guard against divide by zero or NaN
            const SAFE_SCALE_X = Number.isFinite(scaleX) ? scaleX : 1;
            const SAFE_SCALE_Y = Number.isFinite(scaleY) ? scaleY : 1;

            const scaledPath = dragStart.initialPath.map(point => ({
              x: (point.x || 0) * SAFE_SCALE_X,
              y: (point.y || 0) * SAFE_SCALE_Y
            }));

            updateElement(selectedElement, {
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight,
              path: scaledPath
            }, false);
          } else {
            updateElement(selectedElement, { x: newX, y: newY, width: newWidth, height: newHeight }, false);
          }
        }
      } else if (isRotating) {
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;
        updateElement(selectedElement, { rotation: angle }, false);
      }
    });

  }, [selectedElement, isDragging, isResizing, isRotating, isPanning, dragStart, getCurrentPageElements, calculateAlignmentLines, zoomLevel, canvasOffset, selectedElements, snapToGrid, updateElement, currentTool, isDrawing, handleDrawing, lockedElements, setCurrentPageElements, setCanvasOffset, canvasRef, isDraggingNewAnchor, isMovingFrameContent, frameEditing, penCursorPos]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (currentTool === 'pen' && isDrawing) {
      finishDrawing();
    }

    if (isDraggingNewAnchor) {
      // Re-normalize the vector path bounding box after dragging handles
      if (selectedElement) {
        const currentElements = getCurrentPageElements();
        const el = currentElements.find(e => e.id === selectedElement);
        if (el && el.type === 'vector_path') {
          // Use the latest anchors from the ref to avoid stale state issues
          const anchorsToNormalize = lastVectorAnchorsRef.current || el.bezierAnchors || [];

          // Calculate global coords
          const globalAnchors = anchorsToNormalize.map(a => ({
            point: { x: a.point.x + el.x, y: a.point.y + el.y },
            handleIn: { x: a.handleIn.x + el.x, y: a.handleIn.y + el.y },
            handleOut: { x: a.handleOut.x + el.x, y: a.handleOut.y + el.y }
          }));

          // SAFETY: If there is only 1 point, do NOT re-normalize.
          // Renormalizing a single point often collapses the bounding box to 1x1 or 0x0
          // because minX === maxX and minY === maxY, which makes the element effectively invisible.
          if (globalAnchors.length <= 1) {
            setIsDraggingNewAnchor(false);
            return;
          }

          const { minX, minY, maxX, maxY } = getPathBoundingBox(globalAnchors);

          // Defensive check: ensure box is valid
          if (!isNaN(minX) && !isNaN(minY)) {
            const newWidth = Math.max(1, maxX - minX);
            const newHeight = Math.max(1, maxY - minY);

            const newLocalAnchors = globalAnchors.map(a => ({
              point: { x: (a.point?.x || 0) - minX, y: (a.point?.y || 0) - minY },
              handleIn: { x: (a.handleIn?.x || a.point?.x || 0) - minX, y: (a.handleIn?.y || a.point?.y || 0) - minY },
              handleOut: { x: (a.handleOut?.x || a.point?.x || 0) - minX, y: (a.handleOut?.y || a.point?.y || 0) - minY }
            }));

            updateElement(selectedElement, {
              x: minX,
              y: minY,
              width: newWidth,
              height: newHeight,
              bezierAnchors: newLocalAnchors
            });
          }
        }
      }
      setIsDraggingNewAnchor(false);
      // Final save to history on mouse up
      if (selectedElement) {
        const currentElements = getCurrentPageElements();
        const el = currentElements.find(e => e.id === selectedElement);
        if (el) {
          saveToHistory(currentElements);
        }
      }
    }

    // Auto-masking logic: if an image is dropped over a frame
    // FIXME: This is causing accidental deletion of edited images if they trigger a false positive overlap with a 'frame'
    // Disabling for now as it's the only place that deletes elements on drag release.
    // Auto-masking logic: if an image is dropped over a frame
    if (isDragging && selectedElement && selectedElements.size === 1) {
      const elements = getCurrentPageElements();
      const movingElement = elements.find(el => el.id === selectedElement);

      if (movingElement && (movingElement.type === 'image' || movingElement.type === 'video')) {
        // Calculate center of the moving element
        const centerX = movingElement.x + movingElement.width / 2;
        const centerY = movingElement.y + movingElement.height / 2;

        // Look for a frame underneath (stricter check: center must be inside frame)
        // Also ensure we don't mask into locked frames if that's undesired (though typically masking into locked frames is okay)
        const frame = elements.find(el =>
          el.type === 'frame' &&
          el.id !== movingElement.id &&
          centerX > el.x &&
          centerX < el.x + el.width &&
          centerY > el.y &&
          centerY < el.y + el.height
        );

        if (frame) {
          // Found an overlap! Mask the content into the frame
          const newElements = elements.filter(el => el.id !== movingElement.id).map(el => {
            if (el.id === frame.id) {
              return {
                ...el,
                content: movingElement.type === 'image' ? movingElement.src : movingElement.content,
                contentType: movingElement.type,
                // Preserve image edits
                filters: movingElement.filters,
                adjustments: movingElement.adjustments,
                imageEffect: movingElement.imageEffect
              };
            }
            return el;
          });
          setCurrentPageElements(newElements);
          saveToHistory(newElements, canvasSize);
          setSelectedElement(null);
          setSelectedElements(new Set());
        }
      }
    }

    // Final history save on interaction finish
    if (isDragging || isResizing || isRotating || isMovingFrameContent) {
      if (isMovingFrameContent) setIsMovingFrameContent(false);
      const currentElements = getCurrentPageElements();

      // If we just finished resizing a group, we MUST update the relativeX/relativeY
      // of all children based on their new scaled positions.
      if (isResizing && selectedElement) {
        const actingElement = currentElements.find(el => el.id === selectedElement);
        if (actingElement && actingElement.type === 'group') {
          const updatedElements = currentElements.map(el => {
            if (el.groupId === selectedElement) {
              return {
                ...el,
                relativeX: el.x - actingElement.x,
                relativeY: el.y - actingElement.y
              };
            }
            return el;
          });
          setCurrentPageElements(updatedElements);
          saveToHistory(updatedElements, canvasSize);
        } else {
          saveToHistory(currentElements, canvasSize);
        }
      } else {
        saveToHistory(currentElements, canvasSize);
      }
    }

    lastVectorAnchorsRef.current = null;
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setIsPanning(false);
    setShowAlignmentLines(false);
    setAlignmentLines({ vertical: [], horizontal: [] });
    snapTargetsRef.current = []; // Clear cache
  }, [currentTool, isDrawing, finishDrawing, isDragging, selectedElement, selectedElements, getCurrentPageElements, setCurrentPageElements, saveToHistory, setSelectedElement, setSelectedElements, isResizing, isRotating, canvasSize, isDraggingNewAnchor, isMovingFrameContent, updateElement]);

  // Canvas panning
  const handleCanvasMouseDown = useCallback((e, pageId = null) => {
    e.stopPropagation(); // Stop bubbling to container (which would deselect)

    // Clear frame editing if active
    if (frameEditing) {
      setFrameEditing(null);
    }

    if (currentTool === 'pen') {
      const pageElement = e.target.closest('.page-paper');
      const rect = pageElement ? pageElement.getBoundingClientRect() : (canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 });
      const clientX = (e.clientX - rect.left) / zoomLevel;
      const clientY = (e.clientY - rect.top) / zoomLevel;

      handlePenInteraction(e, clientX, clientY);
      return;
    }

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      return;
    }

    // Use the explicitly passed pageId or fall back to finding it in the DOM
    const actualPageId = pageId || e.target.closest('.page-paper')?.getAttribute('data-page-id');

    if (e.target.classList.contains('page-paper')) {
      setSelectedElement(actualPageId || currentPage); // Select the page instead of null
      setSelectedElements(new Set()); // Clear element selection
      setTextEditing(null);
    }
  }, [currentTool, setSelectedElement, setSelectedElements, setTextEditing, currentPage, handlePenInteraction, zoomLevel, canvasRef, frameEditing, setFrameEditing]);

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

    // Determine the target rect for handles (Frame vs Ghost Content)
    let targetRect = element;
    let isGhost = false;

    if (frameEditing === element.id) {
      const ghost = calculateGhostRect(element);
      if (ghost) {
        targetRect = ghost;
        isGhost = true;
      } else {
        return null;
      }
    }

    // Calculate visual scale factor to keep handles consistent on screen
    const visualScale = 1 / zoomLevel;
    const baseHandleSize = 14;
    const handleSize = baseHandleSize * visualScale;
    const handleBorder = 2 * visualScale;
    const slotWidth = 20 * visualScale;
    const slotHeight = 6 * visualScale;
    const connectionLineColor = '#8b5cf6';
    const handleColor = '#ffffff';
    const handleBorderColor = '#8b5cf6';
    const selectionBorderWidth = 2 * visualScale;
    const padding = 10 * visualScale;

    const handles = [
      // Corner handles (white circles with purple border)
      { x: -handleSize / 2, y: -handleSize / 2, cursor: 'nw-resize', type: 'nw' },
      { x: targetRect.width - handleSize / 2, y: -handleSize / 2, cursor: 'ne-resize', type: 'ne' },
      { x: -handleSize / 2, y: targetRect.height - handleSize / 2, cursor: 'sw-resize', type: 'sw' },
      { x: targetRect.width - handleSize / 2, y: targetRect.height - handleSize / 2, cursor: 'se-resize', type: 'se' },

      // Center slot handles (purple slots)
      { x: targetRect.width / 2 - slotWidth / 2, y: -slotHeight / 2, cursor: 'n-resize', type: 'n', isSlot: true },
      { x: targetRect.width / 2 - slotWidth / 2, y: targetRect.height - slotHeight / 2, cursor: 's-resize', type: 's', isSlot: true },
      { x: -slotHeight / 2, y: targetRect.height / 2 - slotWidth / 2, cursor: 'w-resize', type: 'w', isSlot: true },
      { x: targetRect.width - slotHeight / 2, y: targetRect.height / 2 - slotWidth / 2, cursor: 'e-resize', type: 'e', isSlot: true }
    ];

    const handleMouseDownLocal = (e, action, direction = '') => {
      e.stopPropagation();
      e.preventDefault();

      const pageElement = e.currentTarget.closest('.page-paper');
      const rect = pageElement ? pageElement.getBoundingClientRect() : (canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 });
      const mouseX = (e.clientX - rect.left) / zoomLevel;
      const mouseY = (e.clientY - rect.top) / zoomLevel;

      if (action === 'resize') {
        setIsResizing(true);
        setDragStart({
          x: mouseX,
          y: mouseY,
          elementX: targetRect.x,
          elementY: targetRect.y,
          elementWidth: targetRect.width,
          elementHeight: targetRect.height,
          elementRotation: targetRect.rotation,
          resizeDirection: direction,
          initialFontSize: element.fontSize,
          initialLineHeight: element.lineHeight || 1.2,
          initialLetterSpacing: element.letterSpacing || 0,
          initialPadding: element.padding || 4,
          maintainAspectRatio: direction.length === 2 && (e.shiftKey || element.type === 'image'),
          initialContentScale: element.contentScale,
          initialCrop: isGhost ? (element.contentCrop || { t: 0, b: 0, l: 0, r: 0 }) : (element.type === 'image' ? (element.crop || { t: 0, b: 0, l: 0, r: 0 }) : null),
          initialChildren: element.type === 'group'
            ? getCurrentPageElements().filter(el => el.groupId === element.id).map(el => ({ ...el }))
            : [],
          initialBezierAnchors: element.type === 'vector_path' ? [...(element.bezierAnchors || [])] : [],
          initialPath: element.type === 'drawing' ? [...(element.path || [])] : []
        });
      } else if (action === 'rotate') {
        setIsRotating(true);
        setDragStart({
          x: mouseX,
          y: mouseY,
          elementX: targetRect.x,
          elementY: targetRect.y,
          elementWidth: targetRect.width,
          elementHeight: targetRect.height,
          elementRotation: targetRect.rotation
        });
      }
    };

    // Use targetRect properties instead of element
    const rectX = targetRect.x;
    const rectY = targetRect.y;
    const rectW = targetRect.width;
    const rectH = targetRect.height;
    const rectR = targetRect.rotation;

    // Selection box must rotate around the element's center point
    const selectionBoxStyle = {
      position: 'absolute',
      left: rectX - padding,
      top: rectY - padding,
      width: rectW + padding * 2,
      height: rectH + padding * 2,
      pointerEvents: 'none',
      transform: `rotate(${rectR || 0}deg)`,
      transformOrigin: `${rectW / 2 + padding}px ${rectH / 2 + padding}px`,
      zIndex: element.zIndex + 1000,
      overflow: 'visible' // Ensure 3D extrusions aren't clipped
    };

    const selectionBorderStyle = {
      position: 'absolute',
      left: padding,
      top: padding,
      width: rectW,
      height: rectH,
      border: `${selectionBorderWidth}px solid ${connectionLineColor}`, // Use standard branding color
      borderRadius: '2px',
      pointerEvents: 'none',
      overflow: 'visible' // Ensure 3D extrusions aren't clipped
    };

    return (
      <div
        key={`selection-${element.id}`}
        style={selectionBoxStyle}
      >
        {/* Selection border */}
        <div style={selectionBorderStyle} />

        {/* Handles */}
        {handles.map((handle, index) => {
          const isHorizontalSlot = handle.type === 'n' || handle.type === 's';
          const handleStyle = {
            position: 'absolute',
            left: handle.x + padding,
            top: handle.y + padding,
            width: handle.isSlot ? (isHorizontalSlot ? slotWidth : slotHeight) : handleSize,
            height: handle.isSlot ? (isHorizontalSlot ? slotHeight : slotWidth) : handleSize,
            backgroundColor: handle.isSlot ? connectionLineColor : handleColor,
            border: handle.isSlot ? 'none' : `${handleBorder}px solid ${handleBorderColor}`,
            borderRadius: handle.isSlot ? `${2 * visualScale}px` : '50%',
            cursor: handle.cursor,
            pointerEvents: 'auto',
            boxShadow: `0 ${1 * visualScale}px ${3 * visualScale}px rgba(0,0,0,0.3)`
          };

          return (
            <div
              key={index}
              style={handleStyle}
              onMouseDown={(e) => handleMouseDownLocal(e, 'resize', handle.type)}
            />
          );

        })}

        {/* Rotate handle (Hide for Ghost Image if not supported, let's allow it for now but mapped to element rotation?) 
            Actually, rotating ghost image inside frame might be complex. Standard behavior: rotate whole frame.
            If editing frame content, maybe hide rotation handle? 
        */}
        {!isGhost && (
          <>
            <div
              style={{
                position: 'absolute',
                top: -(25 * visualScale) - (handleSize / 2),
                left: '50%',
                transform: 'translateX(-50%)',
                width: handleSize,
                height: handleSize,
                backgroundColor: '#ffffff',
                border: `${handleBorder}px solid #ef4444`,
                borderRadius: '50%',
                cursor: 'grab',
                pointerEvents: 'auto',
                boxShadow: `0 ${1 * visualScale}px ${3 * visualScale}px rgba(0,0,0,0.3)`
              }}
              onMouseDown={(e) => handleMouseDownLocal(e, 'rotate')}
            />

            {/* Connection line to rotate handle */}
            <svg
              style={{
                position: 'absolute',
                top: -(25 * visualScale),
                left: '50%',
                transform: 'translateX(-50%)',
                width: 2 * visualScale,
                height: 25 * visualScale,
                pointerEvents: 'none'
              }}
            >
              <line x1={visualScale} y1="0" x2={visualScale} y2={25 * visualScale} stroke="#ef4444" strokeWidth={2 * visualScale} />
            </svg>
          </>
        )}
      </div>
    );
  }, [lockedElements, canvasRef, setIsResizing, setIsRotating, setDragStart, zoomLevel, getCurrentPageElements, frameEditing]);

  // Handle mouse wheel for content scaling in frame edit mode
  const handleWheel = useCallback((e) => {
    if (!frameEditing) return;

    // Use Ctrl + Wheel for scaling if we want to distinguish from pan/scroll
    // OR just regular wheel if we are in "Edit Mode"
    e.preventDefault();
    e.stopPropagation();

    const scaleDelta = e.deltaY > 0 ? -0.05 : 0.05;
    const currentElements = getCurrentPageElements();
    const element = currentElements.find(el => el.id === frameEditing);

    if (element) {
      const currentScale = element.contentScale || 1;
      const newScale = Math.max(0.1, Math.min(10, currentScale + scaleDelta));
      updateElement(frameEditing, { contentScale: newScale }, false);
    }
  }, [frameEditing, getCurrentPageElements, updateElement]);

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
    measurements, // Export measurements
    penCursorPos,

    // Handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasMouseDown,
    handleSelectElement,
    handleTextEdit,
    handleWheel,
    handleDrawing,
    finishDrawing,
    calculateAlignmentLines,
    renderSelectionHandles,

    // State setters (for external control if needed)
    setIsDrawing,
    setDrawingPath,
    handlePenInteraction // Export this too just in case
  };
};

export default useCanvasInteraction;
