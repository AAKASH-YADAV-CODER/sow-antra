import React, { useState, useRef, useCallback, useEffect } from 'react';
import { textEffects,imageEffects,fontFamilies,supportedLanguages,specialEffects,stickerOptions,filterOptions,animations,gradientPresets, shapeEffects,socialMediaTemplates } from '../types/types.js';
import "../styles/MainPageStyles.css";

import {  Square,  
  Copy, Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Download, Save, FolderOpen, 
 MinusCircle, PlusCircle, 
 Lock, Unlock,
  Film,
 Sparkles, 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ShareButton from '../components/common/ShareButton';
import jsPDF from 'jspdf';
import { projectAPI } from '../services/api';

// Component imports
import RecordingStatus from '../features/canvas/components/RecordingStatus';
import ModalsContainer from '../features/canvas/components/ModalsContainer';
import EffectsPanel from '../features/canvas/components/EffectsPanel';
import GradientPicker from '../features/canvas/components/GradientPicker';
import PropertiesPanel from '../features/canvas/components/PropertiesPanel';
import { MobileToolsDrawer, MobilePropertiesDrawer } from '../features/canvas/components/MobileDrawers';
import MobileFABButtons from '../features/canvas/components/MobileFABButtons';
import CanvasElement from '../features/canvas/components/CanvasElement';
import TopHeader from '../features/canvas/components/TopHeader';
import ToolsSidebar from '../features/canvas/components/ToolsSidebar';
import PagesNavigator from '../features/canvas/components/PagesNavigator';
import CanvasWorkspace from '../features/canvas/components/CanvasWorkspace';
// Style imports
import styles from '../styles/MainPage.module.css';
import '../styles/MainPageAnimations.css';
import * as styleHelpers from '../utils/styleHelpers';
// Utility imports
import { 
  getFilterCSS, 
  getBackgroundStyle, 
  getCanvasGradient, 
  getCanvasEffects, 
  getEffectCSS,
  parseCSS 
} from '../utils/helpers';
import { 
  drawElementToCanvas as drawElementToCanvasUtil,
  exportAsImage as exportAsImageUtil,
  exportAsPDF as exportAsPDFUtil,
  exportAsSVG as exportAsSVGUtil,
  getSortedElementsForExport
} from '../utils/canvasExport';
// Custom hooks
import useElements from '../features/canvas/hooks/useElements';
import useHistory from '../features/canvas/hooks/useHistory';
import { useCanvasInteraction } from '../features/canvas/hooks/useCanvasInteraction';
import { useRecording } from '../features/canvas/hooks/useRecording';
import { useCanvasUtils } from '../features/canvas/hooks/useCanvasUtils';
import { useExport } from '../features/canvas/hooks/useExport';
import { useProjectManager } from '../features/canvas/hooks/useProjectManager';
import { useTemplates } from '../features/canvas/hooks/useTemplates';
import { useKeyboardShortcuts } from '../features/canvas/hooks/useKeyboardShortcuts';
import { useHelpers } from '../features/canvas/hooks/useHelpers';
// UI Helper Components
import TransliterationToggle from '../features/canvas/components/TransliterationToggle';
import VideoSettings from '../features/canvas/components/VideoSettings';
// Constants imports
import { 
  fontFamilies,
  supportedLanguages,
  textEffects,
  imageEffects,
  shapeEffects,
  specialEffects,
  socialMediaTemplates,
  stickerOptions,
  animations,
  filterOptions
} from '../utils/constants';


const Sowntra = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout, currentUser } = useAuth();
  const currentProjectId = searchParams.get('project');
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedElements, setSelectedElements] = useState(new Set());
  // isDragging, isResizing, isRotating, isPanning, dragStart, showAlignmentLines, alignmentLines now managed by useCanvasInteraction hook
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isPlaying, setIsPlaying] = useState(false);
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
  const [transliterationEnabled, setTransliterationEnabled] = useState(false);
  // const [transliterationMap, setTransliterationMap] = useState({});
  const [showLanguageHelp, setShowLanguageHelp] = useState(false);
  const [videoFormat, setVideoFormat] = useState('webm');
  const [videoQuality, setVideoQuality] = useState('high');
  const [recordingDuration, setRecordingDuration] = useState(10);
  const [gradientPickerKey, setGradientPickerKey] = useState(0);
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  // const [resizeDirection, setResizeDirection] = useState('');
  // const [canvasHighlighted, setCanvasHighlighted] = useState(false);
  
  // New state for custom template
  const [showCustomTemplateModal, setShowCustomTemplateModal] = useState(false);
  const [customTemplateSize, setCustomTemplateSize] = useState({
    width: 800,
    height: 600,
    unit: 'px'
  });
  
  // Mobile panel states
  const [showMobileTools, setShowMobileTools] = useState(false);
  const [showMobileProperties, setShowMobileProperties] = useState(false);

  // Mobile touch gesture states
  const [touchStartDistance, setTouchStartDistance] = useState(0);
  const [initialZoomLevel, setInitialZoomLevel] = useState(1);
  const [lastTouchEnd, setLastTouchEnd] = useState(0);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const floatingToolbarRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const loadProjectInputRef = useRef(null);
  const zoomIndicatorTimeoutRef = useRef(null);


  // getCurrentPageElements will be provided by useElements hook below
  
  // All constants (supportedLanguages, textEffects, imageEffects, shapeEffects, specialEffects, etc.) imported from constants.js


  // Center canvas function - maximizes canvas size while maintaining aspect ratio
  const centerCanvas = useCallback(() => {
    const canvasContainer = canvasContainerRef.current;
    if (!canvasContainer) return;

    const containerWidth = canvasContainer.clientWidth;
    const containerHeight = canvasContainer.clientHeight;
    
    // Calculate available space with minimal padding (just 10px on each side)
    const availableWidth = containerWidth - 20; // Minimal padding
    const availableHeight = containerHeight - 20;
    
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
  }, []);

  // Update text direction when language changes
  useEffect(() => {
    setTextDirection(supportedLanguages[currentLanguage]?.direction || 'ltr');
    
    // Update text elements with new language font
    const currentElements = getCurrentPageElements();
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
    setCurrentPageElements(updatedElements);
    
    // Force gradient picker to re-render
    setGradientPickerKey(prev => prev + 1);
  }, [currentLanguage]);

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
    return () => window.removeEventListener('resize', handleResize);
  }, [centerCanvas]);

  // Load project if projectId is provided
  useEffect(() => {
    const loadProject = async () => {
      if (currentProjectId) {
        try {
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
        }
      }
    };

    loadProject();
  }, [currentProjectId]);

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
    return () => {
      if (zoomIndicatorTimeoutRef.current) {
        clearTimeout(zoomIndicatorTimeoutRef.current);
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
    redo,
    canUndo,
    canRedo
  } = useHistory(setCurrentPageElements);

  // Custom Hooks - Element Management
  const {
    getCurrentPageElements,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    toggleElementLock,
    updateFilter,
    groupElements,
    ungroupElements,
    changeZIndex
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
    supportedLanguages
  });

  // Custom Hooks - Canvas Interaction
  const {
    isDragging,
    isResizing,
    isRotating,
    isPanning,
    isDrawing,
    drawingPath,
    showAlignmentLines,
    alignmentLines,
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
    setIsDrawing,
    setDrawingPath
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
    setTextEditing
  });

  // Custom Hooks - Recording
  const {
    recording,
    mediaRecorder,
    recordingStartTime,
    recordingTimeElapsed,
    startRecording,
    stopRecording,
    preloadImages,
    checkRecordingCompatibility,
    drawElementToCanvas
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
    exportAsSVG,
    exportAsImage,
    exportAsPDF,
    getExportReadyElements: getExportReadyElementsFromHook
  } = useExport({
    getCurrentPageElements,
    canvasSize,
    imageEffects
  });

  // Custom Hooks - Helper Functions
  const {
    getEffectCSSWrapper,
    getCanvasEffectsWrapper,
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
    navigate
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
    saveProject,
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
    loadProjectInputRef
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
    setShowEffectsPanel
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
          />

          {/* Canvas Area - FILLS SCREEN */}
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
          />

          {/* Right Properties Panel - Hidden on mobile */}
          <PropertiesPanel
            selectedElement={selectedElement}
            selectedElementData={selectedElementData}
            animations={animations}
            filterOptions={filterOptions}
            fontFamilies={fontFamilies}
            stickerOptions={stickerOptions}
            showEffectsPanel={showEffectsPanel}
            setShowEffectsPanel={setShowEffectsPanel}
            gradientPickerKey={gradientPickerKey}
            lockedElements={lockedElements}
            updateElement={updateElement}
            updateFilter={updateFilter}
            duplicateElement={duplicateElement}
            deleteElement={deleteElement}
            toggleElementLock={toggleElementLock}
            changeZIndex={changeZIndex}
            exportAsImage={exportAsImage}
            exportAsPDF={exportAsPDF}
            handleSaveClick={handleSaveClick}
            loadProject={loadProject}
            TransliterationToggle={TransliterationToggle}
            recording={recording}
            startRecording={startRecording}
            stopRecording={stopRecording}
            recordingTimeElapsed={recordingTimeElapsed}
            videoFormat={videoFormat}
            setVideoFormat={setVideoFormat}
            videoQuality={videoQuality}
            setVideoQuality={setVideoQuality}
            recordingDuration={recordingDuration}
            setRecordingDuration={setRecordingDuration}
          />
        </div>


        {/* Effects Panel */}
        <EffectsPanel 
          show={showEffectsPanel}
          selectedElement={selectedElement}
          selectedElementData={selectedElementData}
          onUpdateElement={updateElement}
          onClose={() => setShowEffectsPanel(false)}
        />

        {/* Floating Toolbar for Selected Elements */}
        {selectedElements.size > 0 && (
          <div
            ref={floatingToolbarRef}
            className={`${styles.toolbar || ''} fixed left-1/2 transform -translate-x-1/2 floating-toolbar transition-all duration-300`}
            style={{ 
              zIndex: 1000,
              bottom: (showMobileTools || showMobileProperties) ? '-100px' : '1rem' // Hide below when drawers open
            }}
          >
            <button
              onClick={() => {
                if (selectedElements.size > 1) {
                  groupElements();
                }
              }}
              className="toolbar-button"
              title="Group"
              disabled={selectedElements.size < 2}
            >
              <Group size={18} />
            </button>
            <button
              onClick={() => {
                if (selectedElementData?.type === 'group') {
                  ungroupElements(selectedElement);
                }
              }}
              className="toolbar-button"
              title="Ungroup"
              disabled={selectedElementData?.type !== 'group'}
            >
              <Ungroup size={18} />
            </button>
            <button
              onClick={() => {
                Array.from(selectedElements).forEach(id => {
                  if (!lockedElements.has(id)) {
                    changeZIndex(id, 'forward');
                  }
                });
              }}
              className="toolbar-button"
              title="Bring Forward"
            >
              <PlusCircle size={18} />
            </button>
            <button
              onClick={() => {
                Array.from(selectedElements).forEach(id => {
                  if (!lockedElements.has(id)) {
                    changeZIndex(id, 'backward');
                  }
                });
              }}
              className="toolbar-button"
              title="Send Backward"
            >
              <MinusCircle size={18} />
            </button>
            <button
              onClick={() => {
                Array.from(selectedElements).forEach(id => {
                  if (!lockedElements.has(id)) {
                    toggleElementLock(id);
                  }
                });
              }}
              className="toolbar-button"
              title="Toggle Lock"
            >
              <Lock size={18} />
            </button>
            <button
              onClick={() => {
                Array.from(selectedElements).forEach(id => {
                  if (!lockedElements.has(id)) {
                    duplicateElement(id);
                  }
                });
              }}
              className="toolbar-button"
              title="Duplicate"
            >
              <Copy size={18} />
            </button>
            <button
              onClick={() => {
                Array.from(selectedElements).forEach(id => {
                  if (!lockedElements.has(id)) {
                    deleteElement(id);
                  }
                });
              }}
              className="toolbar-button text-red-500"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>

        )}

        {/* Language Help Modal */}
        {/* Recording Status */}
        <RecordingStatus 
          recording={recording}
          recordingTimeElapsed={recordingTimeElapsed}
        />

        {/* Mobile Zoom Indicator - Auto-hides after 10 seconds */}
        {showZoomIndicator && (
          <div 
            className={`${styles.zoomIndicator || ''} md:hidden`}
            style={styleHelpers.getZoomIndicatorStyle(showZoomIndicator)}
          >
            <div className="flex items-center gap-2">
              <ZoomIn size={16} />
              <span className="font-medium">{Math.round(zoomLevel * 100)}%</span>
            </div>
          </div>
        )}

        {/* Mobile Floating Action Buttons */}
        <MobileFABButtons
          zoom={zoom}
          centerCanvas={centerCanvas}
          setShowMobileTools={setShowMobileTools}
          setShowMobileProperties={setShowMobileProperties}
          selectedElement={selectedElement}
        />

        {/* Mobile Tools Drawer */}
        <MobileToolsDrawer
          showMobileTools={showMobileTools}
          setShowMobileTools={setShowMobileTools}
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
          addElement={addElement}
          fileInputRef={fileInputRef}
          setShowTemplates={setShowTemplates}
          showTemplates={showTemplates}
          zoom={zoom}
          undo={undo}
          redo={redo}
          historyIndex={historyIndex}
          history={history}
          handleSaveClick={handleSaveClick}
          recording={recording}
          recordingTimeElapsed={recordingTimeElapsed}
          startRecording={startRecording}
          stopRecording={stopRecording}
          playAnimations={playAnimations}
          resetAnimations={resetAnimations}
          isPlaying={isPlaying}
          setShowEffectsPanel={setShowEffectsPanel}
          showEffectsPanel={showEffectsPanel}
        />

        {/* Mobile Properties Drawer */}
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
      </div>
    </>
  );
};

export default Sowntra;
