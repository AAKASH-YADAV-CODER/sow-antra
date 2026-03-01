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
  onCommentClick,
  frameEditing,
  setFrameEditing,
  penCursorPos,
  setCurrentPage
}) => {

  // Wrapper for getEffectCSS with all effect types
  const getEffectCSSWrapper = useCallback((element) => {
    return getEffectCSS(element, textEffects, imageEffects, shapeEffects);
  }, [textEffects, imageEffects, shapeEffects]);

  // Wrapper for getCanvasEffects
  const getCanvasEffectsWrapper = useCallback((element) => {
    return getCanvasEffects(element, imageEffects);
  }, [imageEffects]);

  // Handle image upload from file input
  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create a unique ID for the asset
      const assetId = `asset-${Date.now()}`;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const src = e.target.result; // Base64 string for immediate display

        // Detect natural dimensions
        const img = new Image();
        img.onload = async () => {
          const naturalWidth = img.naturalWidth;
          const naturalHeight = img.naturalHeight;
          const aspectRatio = naturalWidth / naturalHeight;

          // Default size logic
          let width = 200;
          let height = 200;

          if (aspectRatio > 1) {
            width = 400;
            height = 400 / aspectRatio;
          } else {
            height = 400;
            width = 400 * aspectRatio;
          }

          // 1. Add to Canvas
          addElement('image', {
            src,
            width,
            height,
            crop: { t: 0, b: 0, l: 0, r: 0 }
          });

          // 2. Save to IndexedDB (Persistent Storage)
          try {
            const { storage } = await import('../../../utils/storage');
            const newAsset = {
              id: assetId,
              src, // Storing base64 for now. For huge files, we should store Blob, but let's stick to base64 for ease of use with <img> tags.
              name: file.name,
              type: file.type.startsWith('video/') ? 'video' : 'image',
              width: naturalWidth,
              height: naturalHeight,
              createdAt: Date.now(),
              folderId: null // Root by default
            };

            await storage.addAsset(newAsset);

            // 3. Update UI State if provided
            if (setUploads) {
              setUploads(prev => [newAsset, ...prev]);
            }
          } catch (error) {
            console.error("Failed to save upload:", error);
          }
        };
        img.src = src;
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
  const renderElement = useCallback((element, pageId) => {
    // Intercept handlers to update active page
    const wrappedHandleMouseDown = (e, id, action, direction) => {
      if (setCurrentPage && pageId) setCurrentPage(pageId);
      handleMouseDown(e, id, action, direction);
    };

    const wrappedHandleSelectElement = (e, id) => {
      if (setCurrentPage && pageId) setCurrentPage(pageId);
      handleSelectElement(e, id);
    };

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
        handleMouseDown={wrappedHandleMouseDown}
        handleSelectElement={wrappedHandleSelectElement}
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
        frameEditing={frameEditing}
        setFrameEditing={setFrameEditing}
        penCursorPos={penCursorPos}
      />
    );
  }, [
    setCurrentPage,
    handleMouseDown,
    handleSelectElement,
    selectedElements, // Added missing dependency
    textEditing,
    lockedElements,
    currentTool,
    currentLanguage,
    textDirection,
    fontFamilies,
    supportedLanguages,
    stickerOptions,
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
    zoom,
    frameEditing,
    setFrameEditing,
    penCursorPos
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
