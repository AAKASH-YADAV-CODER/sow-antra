import { useCallback } from 'react';
import { getEffectCSS, getCanvasEffects } from '../../../utils/helpers';
import CanvasElement from '../components/CanvasElement';

/**
 * Custom hook for helper functions used throughout the canvas editor
 * Provides utility functions for effects, rendering, image upload, and user actions
 * 
 * @param {Object} params - Hook parameters
 * @returns {Object} Helper functions
 */
export const useHelpers = ({
  // Constants for effects
  textEffects,
  imageEffects,
  shapeEffects,
  specialEffects,
  fontFamilies,
  supportedLanguages,
  stickerOptions,
  // Element management
  addElement,
  updateElement,
  getCurrentPageElements,
  // UI state
  selectedElements,
  textEditing,
  setTextEditing,
  lockedElements,
  currentTool,
  currentLanguage,
  textDirection,
  // Interaction handlers
  handleMouseDown,
  handleSelectElement,
  renderSelectionHandles,
  handleTextEdit,
  // Utility functions
  getBackgroundStyle,
  getFilterCSS,
  parseCSS,
  // Auth and navigation
  logout,
  navigate
}) => {

  // Wrapper for getEffectCSS with all effect types
  const getEffectCSSWrapper = useCallback((element) => {
    return getEffectCSS(element, textEffects, imageEffects, shapeEffects, specialEffects);
  }, [textEffects, imageEffects, shapeEffects, specialEffects]);
  
  // Wrapper for getCanvasEffects
  const getCanvasEffectsWrapper = useCallback((element) => {
    return getCanvasEffects(element, imageEffects);
  }, [imageEffects]);

  // Handle image upload from file input
  const handleImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        addElement('image', { src: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }, [addElement]);

  // Logout handler with navigation
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, navigate]);

  // Canvas mouse enter/leave handlers (for future highlighting feature)
  const handleCanvasMouseEnter = useCallback(() => {
    // setCanvasHighlighted(true);
  }, []);

  const handleCanvasMouseLeave = useCallback(() => {
    // setCanvasHighlighted(false);
  }, []);

  // Render element using CanvasElement component
  const renderElement = useCallback((element) => {
    return (
      <CanvasElement
        key={element.id}
        element={element}
        selectedElements={selectedElements}
        textEditing={textEditing}
        lockedElements={lockedElements}
        currentTool={currentTool}
        currentLanguage={currentLanguage}
        textDirection={textDirection}
        fontFamilies={fontFamilies}
        supportedLanguages={supportedLanguages}
        stickerOptions={stickerOptions}
        handleMouseDown={handleMouseDown}
        handleSelectElement={handleSelectElement}
        updateElement={updateElement}
        setTextEditing={setTextEditing}
        getCurrentPageElements={getCurrentPageElements}
        getBackgroundStyle={getBackgroundStyle}
        getFilterCSS={getFilterCSS}
        getEffectCSS={getEffectCSSWrapper}
        parseCSS={parseCSS}
        renderSelectionHandles={renderSelectionHandles}
        handleTextEdit={handleTextEdit}
      />
    );
  }, [
    selectedElements,
    textEditing,
    lockedElements,
    currentTool,
    currentLanguage,
    textDirection,
    fontFamilies,
    supportedLanguages,
    stickerOptions,
    handleMouseDown,
    handleSelectElement,
    updateElement,
    setTextEditing,
    getCurrentPageElements,
    getBackgroundStyle,
    getFilterCSS,
    getEffectCSSWrapper,
    parseCSS,
    renderSelectionHandles,
    handleTextEdit
  ]);

  // Render drawing path in progress
  const renderDrawingPath = useCallback((drawingPath) => {
    if (drawingPath.length < 2) return null;
    
    let pathData = 'M ' + drawingPath[0].x + ' ' + drawingPath[0].y;
    for (let i = 1; i < drawingPath.length; i++) {
      pathData += ' L ' + drawingPath[i].x + ' ' + drawingPath[i].y;
    }
    
    return (
      <svg
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9999
        }}
      >
        <path
          d={pathData}
          fill="none"
          stroke="#000"
          strokeWidth="2"
        />
      </svg>
    );
  }, []);

  return {
    getEffectCSSWrapper,
    getCanvasEffectsWrapper,
    handleImageUpload,
    handleLogout,
    handleCanvasMouseEnter,
    handleCanvasMouseLeave,
    renderElement,
    renderDrawingPath
  };
};

export default useHelpers;
