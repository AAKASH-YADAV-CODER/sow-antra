/**
 * MainPage Style Utilities
 * Helper functions for dynamic inline styles used in MainPage component
 */

/**
 * Get common canvas element style
 * @param {Object} element - Element data
 * @param {number} zoomLevel - Current zoom level
 * @returns {Object} Style object
 */
export const getCanvasElementStyle = (element, zoomLevel = 1) => ({
  position: 'absolute',
  left: `${element.x}px`,
  top: `${element.y}px`,
  width: `${element.width}px`,
  height: `${element.height}px`,
  transform: `rotate(${element.rotation || 0}deg)`,
  zIndex: element.zIndex || 1,
  opacity: element.opacity !== undefined ? element.opacity : 1,
});

/**
 * Get text element specific styles
 * @param {Object} element - Text element data
 * @param {string} fontFamily - Font family override
 * @returns {Object} Style object
 */
export const getTextElementStyle = (element, fontFamily) => ({
  ...getCanvasElementStyle(element),
  fontSize: `${element.fontSize}px`,
  fontFamily: fontFamily || element.fontFamily || 'Arial',
  color: element.color || '#000000',
  fontWeight: element.bold ? 'bold' : 'normal',
  fontStyle: element.italic ? 'italic' : 'normal',
  textDecoration: element.underline ? 'underline' : 'none',
  textAlign: element.align || 'left',
  lineHeight: element.lineHeight || 1.2,
  letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
});

/**
 * Get shape element styles
 * @param {Object} element - Shape element data
 * @returns {Object} Style object
 */
export const getShapeElementStyle = (element) => ({
  ...getCanvasElementStyle(element),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

/**
 * Get image element styles
 * @param {Object} element - Image element data
 * @returns {Object} Style object
 */
export const getImageElementStyle = (element) => ({
  ...getCanvasElementStyle(element),
  objectFit: element.objectFit || 'contain',
});

/**
 * Get gradient background string
 * @param {Object} gradient - Gradient configuration
 * @returns {string} CSS gradient string
 */
export const getGradientString = (gradient) => {
  if (!gradient || !gradient.enabled) {
    return 'transparent';
  }

  const { type, angle, colors } = gradient;
  
  if (type === 'linear') {
    const colorStops = colors.map((c, i) => 
      `${c.color} ${(i / (colors.length - 1)) * 100}%`
    ).join(', ');
    return `linear-gradient(${angle || 0}deg, ${colorStops})`;
  }
  
  if (type === 'radial') {
    const colorStops = colors.map((c, i) => 
      `${c.color} ${(i / (colors.length - 1)) * 100}%`
    ).join(', ');
    return `radial-gradient(circle, ${colorStops})`;
  }
  
  return 'transparent';
};

/**
 * Get selection box styles
 * @param {Object} element - Selected element
 * @param {number} zoomLevel - Current zoom level
 * @returns {Object} Style object
 */
export const getSelectionBoxStyle = (element, zoomLevel = 1) => ({
  position: 'absolute',
  left: `${element.x * zoomLevel}px`,
  top: `${element.y * zoomLevel}px`,
  width: `${element.width * zoomLevel}px`,
  height: `${element.height * zoomLevel}px`,
  transform: `rotate(${element.rotation || 0}deg)`,
  pointerEvents: 'none',
  zIndex: 9999,
});

/**
 * Get alignment line styles
 * @param {Object} line - Line configuration {position, type}
 * @returns {Object} Style object
 */
export const getAlignmentLineStyle = (line) => {
  const baseStyle = {
    position: 'absolute',
    background: '#ef4444',
    pointerEvents: 'none',
    zIndex: 1000,
  };

  if (line.type === 'vertical') {
    return {
      ...baseStyle,
      left: `${line.position}px`,
      width: '1px',
      height: '100%',
      top: 0,
    };
  }

  return {
    ...baseStyle,
    top: `${line.position}px`,
    height: '1px',
    width: '100%',
    left: 0,
  };
};

/**
 * Get canvas transform styles
 * @param {number} zoomLevel - Zoom level
 * @param {Object} offset - Pan offset {x, y}
 * @returns {Object} Style object
 */
export const getCanvasTransformStyle = (zoomLevel, offset = { x: 0, y: 0 }) => ({
  transform: `scale(${zoomLevel}) translate(${offset.x}px, ${offset.y}px)`,
  transformOrigin: 'center',
  transition: 'transform 0.2s ease-out',
});

/**
 * Get modal overlay styles
 * @param {boolean} isOpen - Modal open state
 * @returns {Object} Style object
 */
export const getModalOverlayStyle = (isOpen) => ({
  display: isOpen ? 'flex' : 'none',
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
  padding: '1rem',
});

/**
 * Get recording indicator styles
 * @param {boolean} isRecording - Recording state
 * @returns {Object} Style object
 */
export const getRecordingIndicatorStyle = (isRecording) => ({
  display: isRecording ? 'flex' : 'none',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 1rem',
  background: '#ef4444',
  color: 'white',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: 600,
});

/**
 * Get FAB (Floating Action Button) position styles
 * @param {number} index - Button index
 * @param {boolean} isMobile - Mobile viewport flag
 * @returns {Object} Style object
 */
export const getFABStyle = (index, isMobile = false) => ({
  position: 'fixed',
  bottom: isMobile ? `${6 + (index * 4)}rem` : `${1.5 + (index * 4)}rem`,
  right: isMobile ? '1rem' : '1.5rem',
  width: isMobile ? '48px' : '56px',
  height: isMobile ? '48px' : '56px',
  borderRadius: '50%',
  background: '#3b82f6',
  color: 'white',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 40,
  transition: 'all 0.2s',
});

/**
 * Get zoom indicator styles
 * @param {boolean} show - Show state
 * @returns {Object} Style object
 */
export const getZoomIndicatorStyle = (show) => ({
  position: 'fixed',
  top: '5rem',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(0, 0, 0, 0.75)',
  color: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  zIndex: 1000,
  pointerEvents: 'none',
  opacity: show ? 1 : 0,
  transition: 'opacity 0.3s',
});

/**
 * Get grid background styles
 * @param {number} gridSize - Grid cell size in pixels
 * @param {boolean} show - Show grid state
 * @returns {Object} Style object
 */
export const getGridBackgroundStyle = (gridSize = 20, show = false) => ({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  backgroundSize: `${gridSize}px ${gridSize}px`,
  backgroundImage: show 
    ? 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)'
    : 'none',
  opacity: 0.5,
});

/**
 * Get color swatch styles
 * @param {string} color - Color value
 * @param {boolean} isSelected - Selected state
 * @returns {Object} Style object
 */
export const getColorSwatchStyle = (color, isSelected = false) => ({
  background: color,
  aspectRatio: '1',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
  boxShadow: isSelected ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
  transition: 'all 0.2s',
});

/**
 * Get template card styles
 * @param {boolean} isSelected - Selected state
 * @returns {Object} Style object
 */
export const getTemplateCardStyle = (isSelected = false) => ({
  position: 'relative',
  aspectRatio: '1',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  cursor: 'pointer',
  border: isSelected ? '2px solid #3b82f6' : '2px solid #e5e7eb',
  boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.2)' : 'none',
  transition: 'all 0.2s',
});

/**
 * Get sidebar panel styles for mobile
 * @param {boolean} isOpen - Open state
 * @returns {Object} Style object
 */
export const getMobileSidebarStyle = (isOpen = false) => ({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  maxWidth: '320px',
  background: 'white',
  zIndex: 50,
  transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
  transition: 'transform 0.3s ease',
  boxShadow: isOpen ? '-4px 0 12px rgba(0, 0, 0, 0.1)' : 'none',
});

/**
 * Get effect card styles
 * @param {boolean} isActive - Active state
 * @returns {Object} Style object
 */
export const getEffectCardStyle = (isActive = false) => ({
  padding: '1rem',
  border: isActive ? '2px solid #3b82f6' : '2px solid #e5e7eb',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  background: isActive ? '#dbeafe' : 'white',
  transition: 'all 0.2s',
  textAlign: 'center',
});

const styleHelpers = {
  getCanvasElementStyle,
  getTextElementStyle,
  getShapeElementStyle,
  getImageElementStyle,
  getGradientString,
  getSelectionBoxStyle,
  getAlignmentLineStyle,
  getCanvasTransformStyle,
  getModalOverlayStyle,
  getRecordingIndicatorStyle,
  getFABStyle,
  getZoomIndicatorStyle,
  getGridBackgroundStyle,
  getColorSwatchStyle,
  getTemplateCardStyle,
  getMobileSidebarStyle,
  getEffectCardStyle,
};

export default styleHelpers;
