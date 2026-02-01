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
const useHelpers = ({
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
  navigate,
  setUploads,
  setCanvasHighlighted,
  zoom,
  onCommentClick
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
        const src = e.target.result;
        addElement('image', { src });
        // Add to uploads gallery
        if (setUploads) {
          setUploads(prev => [
            { id: Date.now(), src, name: file.name, type: file.type },
            ...prev
          ]);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [addElement, setUploads]);

  // Logout handler with navigation
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, navigate]);

  // Canvas mouse enter/leave handlers
  const handleCanvasMouseEnter = useCallback(() => {
    if (setCanvasHighlighted) setCanvasHighlighted(true);
  }, [setCanvasHighlighted]);

  const handleCanvasMouseLeave = useCallback(() => {
    if (setCanvasHighlighted) setCanvasHighlighted(false);
  }, [setCanvasHighlighted]);

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
        onCommentClick={onCommentClick}
        zoom={zoom}
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
    handleTextEdit,
    onCommentClick,
    zoom
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
