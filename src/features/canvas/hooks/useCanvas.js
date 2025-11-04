import { useState, useCallback, useEffect } from 'react';
import { getResponsiveCanvasSize } from '../utils/helpers';

/**
 * Custom hook for managing canvas state (size, zoom, pan, background)
 * @param {object} initialSize - Initial canvas size {width, height}
 * @returns {object} - Canvas state and management functions
 */
const useCanvas = (initialSize = { width: 1920, height: 1080 }) => {
  const [canvasSize, setCanvasSize] = useState(initialSize);
  const [zoom, setZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [canvasBackground, setCanvasBackground] = useState({
    type: 'color',
    value: '#ffffff',
  });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Update canvas size
  const updateCanvasSize = useCallback((newSize) => {
    setCanvasSize(newSize);
  }, []);

  // Apply template size
  const applyTemplate = useCallback((template) => {
    setCanvasSize({
      width: template.width,
      height: template.height,
    });
  }, []);

  // Zoom in
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 5));
  }, []);

  // Zoom out
  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 0.1));
  }, []);

  // Set specific zoom level
  const setZoomLevel = useCallback((level) => {
    setZoom(Math.max(0.1, Math.min(level, 5)));
  }, []);

  // Reset zoom to 100%
  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  // Fit canvas to container
  const fitToScreen = useCallback((containerWidth, containerHeight) => {
    const scaleX = containerWidth / canvasSize.width;
    const scaleY = containerHeight / canvasSize.height;
    const newZoom = Math.min(scaleX, scaleY) * 0.9; // 90% to add some padding
    setZoom(Math.max(0.1, Math.min(newZoom, 5)));
    
    // Center canvas
    const scaledWidth = canvasSize.width * newZoom;
    const scaledHeight = canvasSize.height * newZoom;
    setCanvasOffset({
      x: (containerWidth - scaledWidth) / 2,
      y: (containerHeight - scaledHeight) / 2,
    });
  }, [canvasSize]);

  // Start panning
  const startPan = useCallback((clientX, clientY) => {
    setIsPanning(true);
    setPanStart({ 
      x: clientX - canvasOffset.x, 
      y: clientY - canvasOffset.y 
    });
  }, [canvasOffset]);

  // Update pan position
  const updatePan = useCallback((clientX, clientY) => {
    if (!isPanning) return;
    setCanvasOffset({
      x: clientX - panStart.x,
      y: clientY - panStart.y,
    });
  }, [isPanning, panStart]);

  // End panning
  const endPan = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Reset pan to center
  const resetPan = useCallback(() => {
    setCanvasOffset({ x: 0, y: 0 });
  }, []);

  // Update background
  const updateBackground = useCallback((background) => {
    setCanvasBackground(background);
  }, []);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX, screenY) => {
    return {
      x: (screenX - canvasOffset.x) / zoom,
      y: (screenY - canvasOffset.y) / zoom,
    };
  }, [zoom, canvasOffset]);

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = useCallback((canvasX, canvasY) => {
    return {
      x: canvasX * zoom + canvasOffset.x,
      y: canvasY * zoom + canvasOffset.y,
    };
  }, [zoom, canvasOffset]);

  // Get responsive canvas size for current viewport
  const getResponsiveSize = useCallback(() => {
    return getResponsiveCanvasSize(canvasSize.width, canvasSize.height);
  }, [canvasSize]);

  // Handle window resize - auto-fit canvas
  useEffect(() => {
    const handleResize = () => {
      // Auto-fit logic can be added here if needed
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    // Canvas properties
    canvasSize,
    zoom,
    canvasOffset,
    canvasBackground,
    isPanning,

    // Size management
    updateCanvasSize,
    applyTemplate,
    getResponsiveSize,

    // Zoom management
    zoomIn,
    zoomOut,
    setZoomLevel,
    resetZoom,
    fitToScreen,

    // Pan management
    startPan,
    updatePan,
    endPan,
    resetPan,

    // Background management
    updateBackground,

    // Coordinate conversion
    screenToCanvas,
    canvasToScreen,
  };
};

export default useCanvas;
