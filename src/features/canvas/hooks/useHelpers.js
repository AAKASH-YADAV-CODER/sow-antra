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
  setCurrentPage,
  isTimelineImport,
  pages,
  setPages,
  canvasSize,
  currentPage
}) => {

  // Wrapper for getEffectCSS with all effect types
  const getEffectCSSWrapper = useCallback((element) => {
    return getEffectCSS(element, textEffects, imageEffects, shapeEffects);
  }, [textEffects, imageEffects, shapeEffects]);

  // Wrapper for getCanvasEffects
  const getCanvasEffectsWrapper = useCallback((element) => {
    return getCanvasEffects(element, imageEffects);
  }, [imageEffects]);

  // Private helper to avoid duplication in handleImageUpload
  const processUploadedAsset = useCallback(async (file, src, assetId, width, height, type) => {
    // 1. Determine if we should use the current page or create a new one
    const currentPageData = pages.find(p => p.id === currentPage);
    const isPageEmpty = !currentPageData || currentPageData.elements.length === 0;

    if (isPageEmpty && currentPageData) {
      // Fill current empty page
      const newElement = {
        id: `el-${Math.random().toString(36).substr(2, 9)}`,
        type,
        src,
        x: 0,
        y: 0,
        width: canvasSize.width,
        height: canvasSize.height,
        fitToCanvas: true,
        label: 'Background',
        startTime: 0,
        duration: currentPageData.duration || 5.0
      };

      setPages(prev => prev.map(p => 
        p.id === currentPage ? { ...p, elements: [newElement] } : p
      ));
    } else {
      // Create a new page after the current one
      const newPageId = `page-${Date.now()}`;
      const newElement = {
        id: `el-${Math.random().toString(36).substr(2, 9)}`,
        type,
        src,
        x: 0,
        y: 0,
        width: canvasSize.width,
        height: canvasSize.height,
        fitToCanvas: true,
        label: 'Background',
        startTime: 0,
        duration: 5.0
      };

      const newPage = {
        id: newPageId,
        name: `Scene ${pages.length + 1}`,
        elements: [newElement],
        duration: 5.0,
        backgroundColor: '#ffffff'
      };

      // Insert after current page
      const currentIndex = pages.findIndex(p => p.id === currentPage);
      const newPages = [...pages];
      newPages.splice(currentIndex + 1, 0, newPage);
      
      setPages(newPages);
      setCurrentPage(newPageId);
    }

    // 2. Save asset to IndexedDB
    try {
      const { storage } = await import('../../../utils/storage');
      const newAsset = {
        id: assetId,
        src,
        name: file.name,
        type,
        width,
        height,
        createdAt: Date.now(),
        folderId: null
      };
      await storage.addAsset(newAsset);
      if (setUploads) setUploads(prev => [newAsset, ...prev]);
    } catch (error) {
      console.error("Failed to save upload:", error);
    }
  }, [pages, setPages, currentPage, setCurrentPage, canvasSize, setUploads]);

  // Handle image/video upload from file input
  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (file) {
      const assetId = `asset-${Date.now()}`;
      const reader = new FileReader();

      reader.onload = async (e) => {
        const src = e.target.result;
        
        // Handle Video separately as it doesn't need an Image object to get dimensions
        if (file.type.startsWith('video/')) {
          const video = document.createElement('video');
          video.src = src;
          video.onloadedmetadata = async () => {
            const naturalWidth = video.videoWidth;
            const naturalHeight = video.videoHeight;
            await processUploadedAsset(file, src, assetId, naturalWidth, naturalHeight, 'video');
          };
        } else {
          // Handle Image
          const img = new Image();
          img.onload = async () => {
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;
            await processUploadedAsset(file, src, assetId, naturalWidth, naturalHeight, 'image');
          };
          img.src = src;
        }
      };
      reader.readAsDataURL(file);
    }
  }, [processUploadedAsset]);

  // NEW: Handle Audio upload from file input
    const handleAudioUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (file) {
      const assetId = `asset-${Date.now()}`;
      const src = URL.createObjectURL(file);
      
      // Add as an audio element to the current page (global audio handling will pick it up)
      const audioName = file.name || 'Uploaded Audio';
      addElement('audio', { name: audioName, src });

      // Save to IndexedDB (Uploads panel) - we'll store the object URL for this session
      // For persistent storage, the app usually handles it via an API, but here we keep the URL.
      try {
        const { storage } = await import('../../../utils/storage');
        const newAsset = {
          id: assetId,
          src,
          name: audioName,
          type: 'audio',
          createdAt: Date.now(),
          folderId: null
        };
        await storage.addAsset(newAsset);
        if (setUploads) setUploads(prev => [newAsset, ...prev]);
      } catch (error) {
        console.error("Failed to save audio upload:", error);
      }
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
  const renderElement = useCallback((element, pageId, syncData = {}) => {
    const { currentTime = 0, isPlaying = false, pages = [] } = syncData;

    // Calculate the start time of this page relative to the whole video
    let pageStartTime = 0;
    if (pages.length > 0 && pageId) {
      for (const p of pages) {
        if (p.id === pageId) break;
        pageStartTime += (p.duration || 5.0);
      }
    }

    // Intercept handlers to update active page
    const wrappedHandleMouseDown = (e, id, action, direction) => {
      if (setCurrentPage && pageId) setCurrentPage(pageId);
      handleMouseDown(e, id, action, direction);
    };

    const wrappedHandleSelectElement = (e, id) => {
      if (setCurrentPage && pageId) setCurrentPage(pageId);
      handleSelectElement(e, id);
    };

    if (element.type === 'audio') return null;

    return (
      <CanvasElement
        key={element.id}
        element={element}
        currentTime={currentTime}
        isPlaying={isPlaying}
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
        pageStartTime={pageStartTime}
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


  return {
    getEffectCSSWrapper,
    getCanvasEffectsWrapper,
    handleImageUpload,
    handleAudioUpload,
    handleLogout,
    handleCanvasMouseEnter,
    handleCanvasMouseLeave,
    renderElement
  };
};

export default useHelpers;
