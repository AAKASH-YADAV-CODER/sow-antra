import React, { useState, useRef, useCallback, useEffect } from 'react';
import { textEffects, imageEffects, fontFamilies, supportedLanguages, specialEffects, stickerOptions, filterOptions, animations, shapeEffects } from '../types/types.js';
import "../styles/MainPageStyles.css";

import {
  Copy, Trash2,
  Lock,
  Group, Ungroup, ZoomIn
} from 'lucide-react';
import FloatingToolbar from '../components/FloatingToolbar';

import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectAPI } from '../services/api';

// Component imports
import RecordingStatus from '../features/canvas/components/RecordingStatus';
import ModalsContainer from '../features/canvas/components/ModalsContainer';
import EffectsPanel from '../features/canvas/components/EffectsPanel';


import { MobilePropertiesDrawer } from '../features/canvas/components/MobileDrawers';
import MobileToolsBar from '../features/canvas/components/MobileToolsBar';
import MobileFABButtons from '../features/canvas/components/MobileFABButtons';
import TopHeader from '../features/canvas/components/TopHeader';
import ToolsSidebar from '../features/canvas/components/ToolsSidebar';
import CommentPopup from '../features/canvas/components/CommentPopup';
import PagesNavigator from '../features/canvas/components/PagesNavigator';
import CanvasWorkspace from '../features/canvas/components/CanvasWorkspace';
import ContextualToolbar from '../features/canvas/components/ContextualToolbar';
// Style imports
import styles from '../styles/MainPage.module.css';
import '../styles/MainPageAnimations.css';
import * as styleHelpers from '../utils/styleHelpers';
// Utility imports
import {
  getFilterCSS,
  getBackgroundStyle,
  parseCSS

} from '../utils/helpers';
// Custom hooks
import useElements from '../features/canvas/hooks/useElements';
import useHistory from '../features/canvas/hooks/useHistory';
import { useCanvasInteraction } from '../features/canvas/hooks/useCanvasInteraction';
import { useRecording } from '../features/canvas/hooks/useRecording';
import { useCanvasUtils } from '../features/canvas/hooks/useCanvasUtils';
import useExport from '../features/canvas/hooks/useExport';
import useProjectManager from '../features/canvas/hooks/useProjectManager';
import useClipboard from '../features/canvas/hooks/useClipboard';
import useTemplates from '../features/canvas/hooks/useTemplates';
import useKeyboardShortcuts from '../features/canvas/hooks/useKeyboardShortcuts';
import useHelpers from '../features/canvas/hooks/useHelpers';

import useCollaboration from '../features/canvas/hooks/useCollaboration';
// UI Helper Components
import TransliterationToggle from '../features/canvas/components/TransliterationToggle';
import CollaborationPresence from '../features/collaboration/components/CollaborationPresence';


const Sowntra = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout, currentUser } = useAuth();
  const currentProjectId = searchParams.get('project');
  // Check if we're in collaborative mode (boardId from URL or projectId)
  const isCollaborative = !!currentProjectId;
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedElements, setSelectedElements] = useState(new Set());
  // isDragging, isResizing, isRotating, isPanning, dragStart, showAlignmentLines, alignmentLines now managed by useCanvasInteraction hook
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);

  const [currentTool, setCurrentTool] = useState('select');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  // history and historyIndex now managed by useHistory hook
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  // recording, mediaRecorder, recordingStartTime, recordingTimeElapsed now managed by useRecording hook
  // drawingPath, isDrawing now managed by useCanvasInteraction hook
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [textEditing, setTextEditing] = useState(null);
  const [pages, setPages] = useState([{ id: 'page-1', name: 'Page 1', elements: [] }]);
  const [currentPage, setCurrentPage] = useState('page-1');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [lockedElements, setLockedElements] = useState(new Set());
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [textDirection, setTextDirection] = useState('ltr');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  // const [transliterationEnabled, setTransliterationEnabled] = useState(false);
  // const [transliterationMap, setTransliterationMap] = useState({});
  const [showLanguageHelp, setShowLanguageHelp] = useState(false);
  const [videoFormat, setVideoFormat] = useState('webm');
  const [videoQuality, setVideoQuality] = useState('high');
  const [recordingDuration, setRecordingDuration] = useState(10);
  const [gradientPickerKey, setGradientPickerKey] = useState(0);
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  // const [resizeDirection, setResizeDirection] = useState('');
  // const [canvasHighlighted, setCanvasHighlighted] = useState(false);
  const [canvasHighlighted, setCanvasHighlighted] = useState(false);
  const [uploads, setUploads] = useState([]);


  // New state for custom template
  const [showCustomTemplateModal, setShowCustomTemplateModal] = useState(false);
  const [customTemplateSize, setCustomTemplateSize] = useState({
    width: 800,
    height: 600,
    unit: 'px'
  });


  // Mobile panel states
  const [showMobileTools] = useState(false);
  const [showMobileProperties, setShowMobileProperties] = useState(false);

  // Mobile touch gesture states
  const [touchStartDistance, setTouchStartDistance] = useState(0);
  const [initialZoomLevel, setInitialZoomLevel] = useState(1);
  const [lastTouchEnd, setLastTouchEnd] = useState(0);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);


  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const floatingToolbarRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const loadProjectInputRef = useRef(null);
  const zoomIndicatorTimeoutRef = useRef(null);


  // getCurrentPageElements will be provided by useElements hook below


  // All constants (supportedLanguages, textEffects, imageEffects, shapeEffects, specialEffects, etc.) imported from constants.js


  // Center canvas function - maximizes canvas size while maintaining aspect ratio
  const updatePageBackground = useCallback((color) => {
    setPages(prevPages => prevPages.map(page =>
      page.id === currentPage ? { ...page, backgroundColor: color } : page
    ));
    // Note: History saving for page background requires updating history hook to track page props,
    // which is out of scope for this immediate task but should be added later.
  }, [currentPage]);


  const centerCanvas = useCallback(() => {
    const canvasContainer = canvasContainerRef.current;
    if (!canvasContainer) return;

    const containerWidth = canvasContainer.clientWidth;
    const containerHeight = canvasContainer.clientHeight;

    // Calculate available space with comfortable padding (40px on each side)
    const availableWidth = containerWidth - 80;
    const availableHeight = containerHeight - 80;

    // Calculate zoom ratios to fill available space
    const widthRatio = availableWidth / canvasSize.width;
    const heightRatio = availableHeight / canvasSize.height;

    // Use the smaller ratio to ensure entire canvas fits while maximizing size
    const optimalZoom = Math.min(widthRatio, heightRatio);

    // Set the zoom level with generous bounds for user control
    setZoomLevel(Math.max(0.1, Math.min(5, optimalZoom)));


    // Reset canvas offset to center
    setCanvasOffset({ x: 0, y: 0 });
  }, [canvasSize]);

  // Sync i18n with currentLanguage on mount
  useEffect(() => {
    i18n.changeLanguage(currentLanguage);
  }, [currentLanguage, i18n]);

  // Comment click handler
  const handleCommentClick = useCallback((el) => {
    setSelectedElement(el.id);
    setSelectedElements(new Set([el.id]));
    setShowCommentPopup(true);
  }, []);


  // Auto-fit canvas to screen on mount and resize
  useEffect(() => {
    const handleResize = () => {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        centerCanvas();
      }, 100);
    };

    // Fit canvas on initial mount
    handleResize();

    window.addEventListener('resize', handleResize);

    // Observe container resizing (crucial for auto-zoom when sidebar opens)
    let resizeObserver;
    if (canvasContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(canvasContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };

  }, [centerCanvas]);

  // Load project if projectId is provided
  useEffect(() => {
    const loadProject = async () => {
      if (!currentProjectId || !currentUser) {
        return; // Wait for user to be authenticated
      }

      try {
        // Ensure auth is ready before making the request
        const { auth } = await import('../config/firebase');
        if (!auth.currentUser) {
          console.warn('User not authenticated, skipping project load');
          return;
        }

        const response = await projectAPI.loadProject(currentProjectId);
        const { projectData } = response.data;


        if (projectData) {
          if (projectData.pages) setPages(projectData.pages);
          if (projectData.currentPage) setCurrentPage(projectData.currentPage);
          if (projectData.canvasSize) setCanvasSize(projectData.canvasSize);
          if (projectData.zoomLevel) setZoomLevel(projectData.zoomLevel);
          if (projectData.canvasOffset) setCanvasOffset(projectData.canvasOffset);
          if (projectData.showGrid !== undefined) setShowGrid(projectData.showGrid);
          if (projectData.snapToGrid !== undefined) setSnapToGrid(projectData.snapToGrid);
          if (projectData.currentLanguage) setCurrentLanguage(projectData.currentLanguage);
          if (projectData.textDirection) setTextDirection(projectData.textDirection);
        }
      } catch (error) {
        console.error('Error loading project:', error);
        // Log more details for debugging
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      }
    };

    loadProject();
  }, [currentProjectId, currentUser]);

  // Load transliteration data
  useEffect(() => {
    const loadTransliterationData = async () => {
      try {
        // Tamil transliteration map (English to Tamil)
        // const tamilMap = {
        //   'a': 'அ', 'aa': 'ஆ', 'i': 'இ', 'ii': 'ஈ', 'u': 'உ', 'uu': 'ஊ', 'e': 'எ', 'ee': 'ஏ',
        //   'ai': 'ஐ', 'o': 'ஒ', 'oo': 'ஓ', 'au': 'ஔ', 'k': 'க', 'ng': 'ங', 'ch': 'ச', 'j': 'ஜ',
        //   'ny': 'ஞ', 't': 'ட', 'th': 'த்', 'd': 'ட', 'dh': 'த', 'n': 'ன', 'p': 'ப', 'm': 'ம',
        //   'y': 'ய', 'r': 'ர', 'l': 'ல', 'v': 'வ', 'zh': 'ழ', 'L': 'ள', 'R': 'ற', 'n^': 'ண',
        //   's': 'ச', 'sh': 'ஷ', 'S': 'ஸ', 'h': 'ஹ', 'q': 'க்', 'w': 'ங்', 'E': 'ச்', 'r^': 'ன்',
        //   't^': 'ண்', 'y^': 'ம்', 'u^': 'ப்', 'i^': 'வ்'
        // };


        // Hindi transliteration map (English to Devanagari)
        // const hindiMap = {
        //   'a': 'अ', 'aa': 'आ', 'i': 'इ', 'ee': 'ई', 'u': 'उ', 'oo': 'ऊ', 'e': 'ए', 'ai': 'ऐ',
        //   'o': 'ओ', 'au': 'औ', 'k': 'क', 'kh': 'ख', 'g': 'ग', 'gh': 'घ', 'ng': 'ङ', 'ch': 'च',
        //   'chh': 'छ', 'j': 'ज', 'jh': 'झ', 'ny': 'ञ', 't': 'ट', 'th': 'ठ', 'd': 'ड', 'dh': 'ढ',
        //   'n': 'ण', 't^': 'त', 'th^': 'थ', 'd^': 'द', 'dh^': 'ध', 'n^': 'न', 'p': 'प', 'ph': 'फ',
        //   'b': 'ब', 'bh': 'भ', 'm': 'म', 'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'sh': 'श',
        //   'shh': 'ष', 's': 'س', 'h': 'ह'
        // };


        // Set the appropriate map based on current language
        // if (currentLanguage === 'ta') {
        //   setTransliterationMap(tamilMap);
        // } else if (currentLanguage === 'hi') {
        //   setTransliterationMap(hindiMap);
        // } else {
        //   setTransliterationMap({});
        // }
      } catch (error) {
        console.error('Error loading transliteration data:', error);
      }
    };


    loadTransliterationData();
  }, [currentLanguage]);


  // Cleanup zoom indicator timeout on unmount
  useEffect(() => {
    const timeoutRef = zoomIndicatorTimeoutRef.current;
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, []);

  // socialMediaTemplates, stickerOptions, animations, filterOptions imported from constants.js



  // Helper function for setCurrentPageElements (needed before hooks)
  const setCurrentPageElements = useCallback((newElements) => {
    setPages(pages.map(page =>

      page.id === currentPage ? { ...page, elements: newElements } : page
    ));
  }, [pages, currentPage]);

  // Custom Hooks - History Management
  const {
    history,
    historyIndex,
    saveToHistory,
    undo,
    redo
  } = useHistory(setCurrentPageElements);

  // Custom Hooks - Element Management
  const {
    getCurrentPageElements,
    addElement,
    updateElement,
    updateElements,

    deleteElement,
    duplicateElement,
    toggleElementLock,
    updateFilter,
    groupElements,
    ungroupElements,
    changeZIndex,
    reorderElement,
    alignElements

  } = useElements({
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
    supportedLanguages,
    canvasSize

  });

  // Custom Hooks - Canvas Interaction
  const {
    drawingPath,
    showAlignmentLines,
    alignmentLines,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasMouseDown,
    handleSelectElement,
    handleTextEdit,
    renderSelectionHandles
  } = useCanvasInteraction({
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
    currentPage // Add this

  });

  // Custom Hooks - Recording
  const {
    recording,
    recordingTimeElapsed,
    startRecording,
    stopRecording
  } = useRecording({
    getCurrentPageElements,
    canvasSize,
    recordingDuration,
    videoQuality,
    videoFormat,
    imageEffects
  });

  // Custom Hooks - Canvas Utils
  const {
    addNewPage,
    deleteCurrentPage,
    renameCurrentPage,
    playAnimations,
    resetAnimations,
    zoom
  } = useCanvasUtils({
    getCurrentPageElements,
    pages,
    setPages,
    currentPage,
    setCurrentPage,
    setSelectedElement,
    setSelectedElements,
    zoomLevel,
    setZoomLevel,
    isPlaying,
    setIsPlaying,
    setShowZoomIndicator,
    zoomIndicatorTimeoutRef

  });

  // Calculate selectedElementData (now that getCurrentPageElements is available)
  const selectedElementData = getCurrentPageElements().find(el => el.id === selectedElement);

  // Collaboration Hook
  const {
    activeUsers,
    cursors,
    handleCursorMove
  } = useCollaboration({
    boardId: currentProjectId,
    currentUser,
    pages,
    setPages,
    currentPage,
    getCurrentPageElements,
    setCurrentPageElements,
    addElement,
    updateElement,
    deleteElement,
    isCollaborative,
    textEditing
  });

  // Enhanced cursor tracking for canvas
  const handleCanvasMouseMoveForCollaboration = useCallback((e) => {
    if (isCollaborative && handleCursorMove && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      // Convert screen coordinates to canvas-space coordinates
      // Account for zoom level and canvas offset (pan)
      const x = (e.clientX - rect.left - canvasOffset.x) / zoomLevel;
      const y = (e.clientY - rect.top - canvasOffset.y) / zoomLevel;
      handleCursorMove(x, y);
    }
  }, [isCollaborative, handleCursorMove, zoomLevel, canvasOffset]);

  const handleSendComment = (elementId, comment) => {
    const el = getCurrentPageElements().find(e => e.id === elementId);
    if (el) {
      const existingComments = el.comments || [];
      updateElement(elementId, {
        comments: [...existingComments, comment]
      });
    }
  };
  useEffect(() => {
    setTextDirection(supportedLanguages[currentLanguage]?.direction || 'ltr');


    // Update text elements with new language font
    // Use pages state directly to avoid infinite loop
    const currentPageData = pages.find(p => p.id === currentPage);
    if (currentPageData) {
      const currentElements = currentPageData.elements || [];
      const hasTextElements = currentElements.some(el => el.type === 'text');


      // Only update if there are text elements to update
      if (hasTextElements) {
        const updatedElements = currentElements.map(el => {
          if (el.type === 'text') {
            return {
              ...el,
              fontFamily: supportedLanguages[currentLanguage]?.font || 'Arial',
              textAlign: supportedLanguages[currentLanguage]?.direction === 'rtl' ? 'right' : el.textAlign
            };
          }
          return el;
        });

        // Use functional update to avoid dependency on pages
        setPages(prevPages =>
          prevPages.map(page =>
            page.id === currentPage
              ? { ...page, elements: updatedElements }

              : page
          )
        );
      }
    }


    // Force gradient picker to re-render
    setGradientPickerKey(prev => prev + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage, currentPage]);

  // NOTE: The following functions are now provided by useCanvasInteraction hook:
  // - calculateAlignmentLines
  // - handleSelectElement
  // - handleDrawing
  // - finishDrawing
  // - renderSelectionHandles
  // - handleMouseDown
  // - handleMouseMove
  // - handleMouseUp
  // - handleCanvasMouseDown
  // - handleTextEdit

  // Handle text change with transliteration support
  // const handleTextChange = useCallback((e, elementId) => {
  //   let newContent = e.target.textContent;
  //   
  //   if (transliterationEnabled && Object.keys(transliterationMap).length > 0) {
  //     let transliteratedContent = newContent;
  //     
  //     Object.entries(transliterationMap).forEach(([english, native]) => {
  //       const regex = new RegExp(english, 'gi');
  //       transliteratedContent = transliteratedContent.replace(regex, native);
  //     });
  //     
  //     newContent = transliteratedContent;
  //     
  //     if (e.target.textContent !== newContent) {
  //       e.target.textContent = newContent;
  //       const selection = window.getSelection();
  //       const range = document.createRange();
  //       range.selectNodeContents(e.target);
  //       range.collapse(false);
  //       selection.removeAllRanges();
  //       selection.addRange(range);
  //     }
  //   }
  //   
  //   updateElement(elementId, { content: newContent });
  // }, [transliterationEnabled, transliterationMap, updateElement]);

  // NOTE: The following functions are now provided by useCanvasUtils hook:
  // - addNewPage, deleteCurrentPage, renameCurrentPage
  // - playAnimations, resetAnimations
  // - zoom

  // NOTE: The following functions are now provided by useRecording hook:
  // - preloadImages, drawElementToCanvas
  // - checkRecordingCompatibility
  // - startRecording, stopRecording

  // Custom Hooks - Export Management
  const {
    exportAsImage,
    exportAsPDF,
    exportAsVideo

  } = useExport({
    getCurrentPageElements,
    canvasSize,
    imageEffects
  });

  // Custom Hooks - Helper Functions
  const {
    handleImageUpload,
    handleLogout,
    handleCanvasMouseEnter,
    handleCanvasMouseLeave,
    renderElement,
    renderDrawingPath
  } = useHelpers({
    textEffects,
    imageEffects,
    shapeEffects,
    specialEffects,
    fontFamilies,
    supportedLanguages,
    stickerOptions,
    addElement,
    updateElement,
    getCurrentPageElements,
    selectedElements,
    textEditing,
    setTextEditing,
    lockedElements,
    currentTool,
    currentLanguage,
    textDirection,
    handleMouseDown,
    handleSelectElement,
    renderSelectionHandles,
    handleTextEdit,
    getBackgroundStyle,
    getFilterCSS,
    parseCSS,
    logout,
    navigate,
    setUploads,
    setCanvasHighlighted,
    zoom: zoomLevel,
    onCommentClick: handleCommentClick

  });

  // Custom Hooks - Template Management
  const {
    applyTemplate,
    createCustomTemplate
  } = useTemplates({
    setCanvasSize,
    centerCanvas,
    setShowTemplates,
    setShowCustomTemplateModal,
    customTemplateSize
  });

  // NOTE: Helper functions now provided by useHelpers hook:
  // - handleImageUpload, handleLogout, handleCanvasMouseEnter, handleCanvasMouseLeave
  // - renderElement, renderDrawingPath, getEffectCSSWrapper, getCanvasEffectsWrapper

  // Custom Hooks - Project Management (Save/Load)
  const {
    handleSaveClick,
    confirmSave,
    loadProject,
    handleProjectFileLoad
  } = useProjectManager({
    pages,
    currentPage,
    canvasSize,
    zoomLevel,
    canvasOffset,
    showGrid,
    snapToGrid,
    currentLanguage,
    textDirection,
    projectName,
    setProjectName,
    setShowSaveDialog,
    setPages,
    setCurrentPage,
    setCanvasSize,
    setZoomLevel,
    setCanvasOffset,
    setShowGrid,
    setSnapToGrid,
    setCurrentLanguage,
    setTextDirection,
    setSelectedElement,
    setSelectedElements,
    loadProjectInputRef,
    centerCanvas

  });

  // NOTE: The following functions are now provided by useProjectManager hook:
  // - handleSaveClick, saveProject, confirmSave, loadProject, handleProjectFileLoad

  // RecordingStatus, TransliterationToggle, VideoSettings are now imported as components

  // Language Help Modal
  // LanguageHelpModal is now imported from components

  // EffectsPanel is now imported from components

  // Custom Template Modal Component
  // CustomTemplateModal is now imported from components

  // NOTE: renderElement and renderDrawingPath functions now provided by useHelpers hook

  // Custom Hooks - Clipboard
  const {
    copyElements,
    copyStyle,
    pasteElements,
    pasteStyle,
    hasClipboard,
    hasStyleClipboard
  } = useClipboard({
    selectedElements,
    getCurrentPageElements,
    setCurrentPageElements,
    setSelectedElement,
    setSelectedElements,
    updateElement,
    saveToHistory
  });


  // Custom Hooks - Keyboard Shortcuts
  useKeyboardShortcuts({
    textEditing,
    selectedElements,
    selectedElement,
    getCurrentPageElements,
    lockedElements,
    setCurrentPageElements,
    setSelectedElement,
    setSelectedElements,
    saveToHistory,
    undo,
    redo,
    groupElements,
    ungroupElements,
    toggleElementLock,
    setTextEditing,
    showEffectsPanel,
    setShowEffectsPanel,
    copyElements,
    pasteElements

  });

  // NOTE: Keyboard shortcuts handler now provided by useKeyboardShortcuts hook
  // This replaces the large useEffect with handleKeyDown function

  // Keyboard shortcuts - OLD (now in hook)
  /*
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (textEditing) return;
      
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElements.size > 0) {
          const currentElements = getCurrentPageElements();
          const newElements = currentElements.filter(el => !selectedElements.has(el.id) || lockedElements.has(el.id));
          setCurrentPageElements(newElements);
          setSelectedElement(null);
          setSelectedElements(new Set());
          saveToHistory(newElements);
        }
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
      }
      
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedElements.size > 0) {
          e.preventDefault();
          const delta = e.shiftKey ? 10 : 1;
          const moveX = e.key === 'ArrowLeft' ? -delta : e.key === 'ArrowRight' ? delta : 0;
          const moveY = e.key === 'ArrowUp' ? -delta : e.key === 'ArrowDown' ? delta : 0;
          
          const currentElements = getCurrentPageElements();
          const newElements = currentElements.map(el => {
            if (selectedElements.has(el.id) && !lockedElements.has(el.id)) {
              return {
                ...el,
                x: el.x + moveX,
                y: el.y + moveY
              };
            }
            return el;
          });
          
          setCurrentPageElements(newElements);
          saveToHistory(newElements);
        }
      }

  
      if (e.key === 'Escape') {
        setSelectedElement(null);
        setSelectedElements(new Set());
        setTextEditing(null);
        setShowEffectsPanel(false);
      }
  
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        if (selectedElements.size > 1) {
          groupElements();
        } else if (selectedElement) {
          const currentElements = getCurrentPageElements();
          const element = currentElements.find(el => el.id === selectedElement);
          if (element?.type === 'group') {
            ungroupElements(selectedElement);
          }
        }
      }
  
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        if (selectedElement) {
          toggleElementLock(selectedElement);
        }
      }


      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (selectedElement) {
          setShowEffectsPanel(!showEffectsPanel);
        }
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElements, getCurrentPageElements, selectedElement, undo, redo, saveToHistory, groupElements, textEditing, lockedElements, setCurrentPageElements, ungroupElements, toggleElementLock, showEffectsPanel]);
  */

  // Add event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Handle clicking outside the canvas paper (the gray area)
  const handleContainerMouseDown = useCallback((e) => {
    // We rely on stopPropagation in children (Canvas Paper, Elements) to prevent this from triggering wrongly
    setSelectedElement(null);
    setSelectedElements(new Set());
  }, [setSelectedElement, setSelectedElements]);


  return (
    <>
      <div className={`h-screen flex flex-col ${textDirection === 'rtl' ? 'rtl-layout' : ''}`}>
        {/* Header - Responsive */}
        <TopHeader
          t={t}
          navigate={navigate}
          zoom={zoom}
          zoomLevel={zoomLevel}
          centerCanvas={centerCanvas}

          showTemplates={showTemplates}
          setShowTemplates={setShowTemplates}
          showEffectsPanel={showEffectsPanel}
          setShowEffectsPanel={setShowEffectsPanel}
          playAnimations={playAnimations}
          resetAnimations={resetAnimations}
          isPlaying={isPlaying}
          recording={recording}
          recordingTimeElapsed={recordingTimeElapsed}
          startRecording={startRecording}
          stopRecording={stopRecording}
          supportedLanguages={supportedLanguages}
          currentLanguage={currentLanguage}
          setCurrentLanguage={setCurrentLanguage}
          i18n={i18n}
          showLanguageMenu={showLanguageMenu}
          setShowLanguageMenu={setShowLanguageMenu}
          setShowLanguageHelp={setShowLanguageHelp}
          setGradientPickerKey={setGradientPickerKey}
          currentUser={currentUser}
          showAccountMenu={showAccountMenu}
          setShowAccountMenu={setShowAccountMenu}
          handleLogout={handleLogout}
          // Export Props
          exportAsImage={exportAsImage}
          exportAsPDF={exportAsPDF}
          exportAsVideo={exportAsVideo}
          videoFormat={videoFormat}
          setVideoFormat={setVideoFormat}
          videoQuality={videoQuality}
          setVideoQuality={setVideoQuality}
          recordingDuration={recordingDuration}
          setRecordingDuration={setRecordingDuration}
          onSaveProject={handleSaveClick}
          loadProject={loadProject}

        />

        {/* Pages Navigation - Responsive */}
        <PagesNavigator
          t={t}
          pages={pages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          addNewPage={addNewPage}
          deleteCurrentPage={deleteCurrentPage}
          renameCurrentPage={renameCurrentPage}
        />

        {/* Main Content Area */}
        <div className="main-content">
          {/* Left Tools Panel - Hidden on mobile */}
          <ToolsSidebar
            t={t}
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
            addElement={addElement}
            fileInputRef={fileInputRef}
            handleImageUpload={handleImageUpload}
            loadProjectInputRef={loadProjectInputRef}
            handleProjectFileLoad={handleProjectFileLoad}
            undo={undo}
            redo={redo}
            historyIndex={historyIndex}
            history={history}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            snapToGrid={snapToGrid}
            setSnapToGrid={setSnapToGrid}
            uploads={uploads}
          />

          {/* FloatingToolbar for Selected Elements - Hidden when commenting */}
          {!showCommentPopup && (
            <FloatingToolbar
              selectedElements={selectedElements}
              pages={pages}
              currentPage={currentPage}
              groupElements={groupElements}
              ungroupElements={ungroupElements}
              duplicateElement={duplicateElement}
              toggleElementLock={toggleElementLock}
              deleteElement={deleteElement}
              lockedElements={lockedElements}
              zoomLevel={zoomLevel}
              canvasOffset={canvasOffset}
              canvasRef={canvasRef}
              canvasSize={canvasSize}
              onCommentClick={() => setShowCommentPopup(true)}
              alignElements={alignElements}
              changeZIndex={changeZIndex}
              copyElements={copyElements}
              copyStyle={copyStyle}
              pasteElements={pasteElements}
              pasteStyle={pasteStyle}
              hasClipboard={hasClipboard}
              hasStyleClipboard={hasStyleClipboard}
            />
          )}

          {/* Canvas Area - FILLS SCREEN */}
          <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden relative bg-gray-100">
            <ContextualToolbar
              selectedElement={selectedElement}
              selectedElementData={selectedElementData}
              updateElement={updateElement}
              updateElements={updateElements}
              toggleElementLock={toggleElementLock}
              lockedElements={lockedElements}
              fontFamilies={fontFamilies}
              animations={animations}
              showEffectsPanel={showEffectsPanel}
              setShowEffectsPanel={setShowEffectsPanel}
              currentPage={currentPage}
              pages={pages}
              setPages={setPages}
              canvasBackgroundColor={(pages.find(p => p.id === currentPage) || {}).backgroundColor}
              setCanvasBackgroundColor={updatePageBackground}
              changeZIndex={changeZIndex}
              // Filter Props
              filterOptions={filterOptions}
              updateFilter={updateFilter}
              alignElements={alignElements}
              setSelectedElement={setSelectedElement}
              reorderElement={reorderElement}
            />
            <CanvasWorkspace
              canvasContainerRef={canvasContainerRef}
              canvasRef={canvasRef}
              canvasSize={canvasSize}
              zoomLevel={zoomLevel}
              canvasOffset={canvasOffset}
              handleCanvasMouseDown={handleCanvasMouseDown}
              handleCanvasMouseEnter={handleCanvasMouseEnter}
              handleCanvasMouseLeave={handleCanvasMouseLeave}
              touchStartDistance={touchStartDistance}
              setTouchStartDistance={setTouchStartDistance}
              initialZoomLevel={initialZoomLevel}
              setInitialZoomLevel={setInitialZoomLevel}
              lastTouchEnd={lastTouchEnd}
              setLastTouchEnd={setLastTouchEnd}
              zoom={zoom}
              setZoomLevel={setZoomLevel}
              showGrid={showGrid}
              getCurrentPageElements={getCurrentPageElements}
              renderElement={renderElement}
              renderDrawingPath={renderDrawingPath}
              drawingPath={drawingPath}
              showAlignmentLines={showAlignmentLines}
              alignmentLines={alignmentLines}
              onMouseMove={handleCanvasMouseMoveForCollaboration}
              canvasHighlighted={canvasHighlighted}
              canvasBackgroundColor={(pages.find(p => p.id === currentPage) || {}).backgroundColor}
              handleContainerMouseDown={handleContainerMouseDown}
            />
          </div>

          {/* Right Properties Panel - Hidden on mobile */}


        </div>


        {/* Effects Panel */}
        <EffectsPanel

          show={showEffectsPanel}
          selectedElement={selectedElement}
          selectedElementData={selectedElementData}
          onUpdateElement={updateElement}
          onClose={() => setShowEffectsPanel(false)}
        />

        {/* Floating Toolbar for Selected Elements - Hidden when commenting */}
        {!showCommentPopup && (
          <FloatingToolbar
            selectedElements={selectedElements}
            pages={pages}
            currentPage={currentPage}
            groupElements={groupElements}
            ungroupElements={ungroupElements}
            duplicateElement={duplicateElement}
            toggleElementLock={toggleElementLock}
            deleteElement={deleteElement}
            lockedElements={lockedElements}
            zoomLevel={zoomLevel}
            canvasOffset={canvasOffset}
            canvasRef={canvasRef}
            canvasSize={canvasSize}
            onCommentClick={() => setShowCommentPopup(true)}
            alignElements={alignElements}
            changeZIndex={changeZIndex}
            copyElements={copyElements}
            copyStyle={copyStyle}
            pasteElements={pasteElements}
            pasteStyle={pasteStyle}
            hasClipboard={hasClipboard}
            hasStyleClipboard={hasStyleClipboard}
          />
        )}

        {showCommentPopup && selectedElementData && (
          <CommentPopup
            element={selectedElementData}
            currentUser={currentUser}
            onClose={() => setShowCommentPopup(false)}
            onSendComment={handleSendComment}
            position={{
              left: (canvasRef.current?.getBoundingClientRect().left || 0) + ((selectedElementData.x + selectedElementData.width / 2) * (canvasRef.current?.getBoundingClientRect().width / canvasSize.width || 1)),
              top: (canvasRef.current?.getBoundingClientRect().top || 0) + (selectedElementData.y * (canvasRef.current?.getBoundingClientRect().height / canvasSize.height || 1))
            }}
          />
        )}

        {/* Language Help Modal */}
        {/* Recording Status */}
        <RecordingStatus

          recording={recording}
          recordingTimeElapsed={recordingTimeElapsed}
        />



        {/* Mobile Floating Action Buttons */}
        <MobileFABButtons
          zoom={zoom}
          centerCanvas={centerCanvas}

          setShowMobileProperties={setShowMobileProperties}
          selectedElement={selectedElement}
        />

        {/* Mobile Tools Bar */}
        <MobileToolsBar
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
          addElement={addElement}
          fileInputRef={fileInputRef}
          undo={undo}
          redo={redo}
          historyIndex={historyIndex}
          history={history}
          handleSaveClick={handleSaveClick}
          recording={recording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          setShowTemplates={setShowTemplates}
          setShowEffectsPanel={setShowEffectsPanel}
        />

        {/* Mobile Properties Drawer */}
        {/* Mobile Properties Drawer - Kept for mobile users if needed, or remove if fully migrating */}

        <MobilePropertiesDrawer
          showMobileProperties={showMobileProperties}
          setShowMobileProperties={setShowMobileProperties}
          selectedElementData={selectedElementData}
          selectedElement={selectedElement}
          updateElement={updateElement}
          duplicateElement={duplicateElement}
          deleteElement={deleteElement}
          animations={animations}
          gradientPickerKey={gradientPickerKey}
        />

        {/* Save Project Dialog */}
        {/* All Modals */}
        <ModalsContainer
          showTemplates={showTemplates}
          setShowTemplates={setShowTemplates}
          applyTemplate={applyTemplate}
          showCustomTemplateModal={showCustomTemplateModal}
          setShowCustomTemplateModal={setShowCustomTemplateModal}
          customTemplateSize={customTemplateSize}
          setCustomTemplateSize={setCustomTemplateSize}
          createCustomTemplate={createCustomTemplate}
          showLanguageHelp={showLanguageHelp}
          setShowLanguageHelp={setShowLanguageHelp}
          currentLanguage={currentLanguage}
          showSaveDialog={showSaveDialog}
          setShowSaveDialog={setShowSaveDialog}
          projectName={projectName}
          setProjectName={setProjectName}
          confirmSave={confirmSave}
        />

        {/* Collaboration Presence - Show active users and cursors */}
        {isCollaborative && (
          <CollaborationPresence
            activeUsers={activeUsers}
            cursors={cursors}
            currentUser={currentUser}
            zoomLevel={zoomLevel}
            canvasOffset={canvasOffset}
            canvasRef={canvasRef}
          />
        )}
      </div>
    </>
  );
};

export default Sowntra;
