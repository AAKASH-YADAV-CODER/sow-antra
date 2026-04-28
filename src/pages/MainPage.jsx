import React, { useState, useRef, useCallback, useEffect } from 'react'; // HMR trigger update v3
import { textEffects, imageEffects, fontFamilies, supportedLanguages, stickerOptions, filterOptions, animations, shapeEffects, socialMediaTemplates } from '../utils/constants';
import { editableTemplates } from '../config/editableTemplates';
import "../styles/MainPageStyles.css";

import FloatingToolbar from '../components/FloatingToolbar';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectAPI } from '../services/api';

// Component imports
import RecordingStatus from '../features/canvas/components/RecordingStatus';
import ModalsContainer from '../features/canvas/components/ModalsContainer';
import EffectsPanel from '../features/canvas/components/EffectsPanel';
import AdvancedSettingsPanel from '../features/canvas/components/AdvancedSettingsPanel';

import { MobilePropertiesDrawer } from '../features/canvas/components/MobileDrawers';
import MobileToolsBar from '../features/canvas/components/MobileToolsBar';
import MobileFABButtons from '../features/canvas/components/MobileFABButtons';
import TopHeader from '../features/canvas/components/TopHeader';
import ToolsSidebar from '../features/canvas/components/ToolsSidebar';
import CommentPopup from '../features/canvas/components/CommentPopup';
import CanvasWorkspace from '../features/canvas/components/CanvasWorkspace';
import ContextualToolbar from '../features/canvas/components/ContextualToolbar';
import PositionPanel from '../features/canvas/components/PositionPanel';

import AnimationPanel from '../features/canvas/components/AnimationPanel';
import VideoTimeline from '../features/canvas/components/VideoTimeline/VideoTimeline';
import GlobalAudioPlayer from '../features/canvas/components/GlobalAudioPlayer';
// Style imports
import '../styles/MainPageAnimations.css';
// Utility imports
import {
  getFilterCSS,
  getBackgroundStyle,
  parseCSS
} from '../utils/helpers';
// Custom hooks
import useElements from '../features/canvas/hooks/useElements';
import useHistory from '../features/canvas/hooks/useHistory';
import useCanvasInteraction from '../features/canvas/hooks/useCanvasInteraction';
import { useRecording } from '../features/canvas/hooks/useRecording';
import { useCanvasUtils } from '../features/canvas/hooks/useCanvasUtils';
import useExport from '../features/canvas/hooks/useExport';
import useProjectManager from '../features/canvas/hooks/useProjectManager';
import useClipboard from '../features/canvas/hooks/useClipboard';
import useTemplates from '../features/canvas/hooks/useTemplates';
import useKeyboardShortcuts from '../features/canvas/hooks/useKeyboardShortcuts';
import useHelpers from '../features/canvas/hooks/useHelpers';
import useCollaboration from '../features/canvas/hooks/useCollaboration';
import useOnlineStatus from '../hooks/useOnlineStatus';
// UI Helper Components
import CollaborationPresence from '../features/collaboration/components/CollaborationPresence';
import ContentPlannerModal from '../features/canvas/components/modals/ContentPlannerModal';

const musicTracks = [
  { id: 'lofi', name: 'Lofi Study', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'nature', name: 'Nature Sounds', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'focus', name: 'Deep Focus', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 'calm', name: 'Calm Piano', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 'energy', name: 'Creative Energy', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: 'ambient', name: 'Ambient Space', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' }
];

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
  const [showRulers, setShowRulers] = useState(false);
  const [guides, setGuides] = useState([]); // Array of { id, axis: 'x'|'y', position }
  const [showMargins, setShowMargins] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  // recording, mediaRecorder, recordingStartTime, recordingTimeElapsed now managed by useRecording hook
  // drawingPath, isDrawing now managed by useCanvasInteraction hook
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [projectName, setProjectName] = useState('Untitled project');
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
  const [activeSidePanel, setActiveSidePanel] = useState('none'); // 'none', 'effects', 'advanced', 'position', 'animation', 'color'
  const [positionPanelDefaultTab, setPositionPanelDefaultTab] = useState('arrange'); // 'arrange' | 'layers'
  const [frameEditing, setFrameEditing] = useState(null); // ID of frame currently being edited (Canva style)


  const [lastColorChange, setLastColorChange] = useState(null); // { oldColor, newColor, property }
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
  // showMobileTools removed as unused
  const [showMobileProperties, setShowMobileProperties] = useState(false);

  // Mobile touch gesture states
  const [touchStartDistance, setTouchStartDistance] = useState(0);
  const [initialZoomLevel, setInitialZoomLevel] = useState(1);
  const [lastTouchEnd, setLastTouchEnd] = useState(0);
  const [, setShowZoomIndicator] = useState(false);

  // Footer Panel States
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showGridView, setShowGridView] = useState(false);
  const [showPagesStrip, setShowPagesStrip] = useState(false);
  const [showContentPlannerModal, setShowContentPlannerModal] = useState(false);

  // Persistent Timer States
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedMusicId, setSelectedMusicId] = useState(null);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const audioRef = useRef(null);

  const [isProcessingBG, setIsProcessingBG] = useState(false);
  const [bgProcessingStatus, setBgProcessingStatus] = useState('');
  const isOnline = useOnlineStatus();

  // Video Editor State
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(5); // Default 5s page duration
  const isTimelineImport = useRef(false);
  // Global audio tracks state could be here or in pages

  // --- Refs (declared early so they can be used by hooks below) ---
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const loadProjectInputRef = useRef(null);
  const zoomIndicatorTimeoutRef = useRef(null);
  const templateAppliedRef = useRef(false);
  const lastResizeTriggerRef = useRef(0);

  // --- Hook Synchronization ---
  // Center canvas function - maximizes canvas size while maintaining aspect ratio
  const centerCanvas = useCallback((customSize) => {
    const canvasContainer = canvasContainerRef.current;
    if (!canvasContainer || canvasContainer.clientWidth === 0 || canvasContainer.clientHeight === 0) return;

    const containerWidth = canvasContainer.clientWidth;
    const containerHeight = canvasContainer.clientHeight;

    // Use custom size if provided (for immediate updates before state propagation), otherwise use state
    const targetWidth = customSize?.width || canvasSize.width || 100;
    const targetHeight = customSize?.height || canvasSize.height || 100;

    // Calculate available space with comfortable padding (80px on each side)
    const availableWidth = Math.max(100, containerWidth - 160);
    const availableHeight = Math.max(100, containerHeight - 160);

    // Calculate zoom ratios to fill available space
    const widthRatio = availableWidth / targetWidth;
    const heightRatio = availableHeight / targetHeight;

    // Use the smaller ratio to ensure entire canvas fits while maximizing size
    const optimalZoom = Math.min(widthRatio, heightRatio);

    // Set the zoom level with generous bounds for user control
    const targetZoom = Math.max(0.1, Math.min(2, optimalZoom));
    setZoomLevel(prev => {
      // Avoid looping if change is microscopic
      if (Math.abs(prev - targetZoom) < 0.005) return prev;
      return targetZoom;
    });

    // Reset canvas offset to center
    setCanvasOffset(prev => {
      if (prev.x === 0 && prev.y === 0) return prev;
      return { x: 0, y: 0 };
    });
  }, [canvasSize]);

  // useHistory needs setCurrentPageElements, but useElements (which returns it) needs saveToHistory (from useHistory).
  const setCurrentPageElementsRef = useRef(null);
  const setCurrentPageElements = useCallback((...args) => {
    if (setCurrentPageElementsRef.current) {
      return setCurrentPageElementsRef.current(...args);
    }
    // Fallback if useElements hasn't initialized yet
    setPages(prevPages => prevPages.map(page =>
      page.id === currentPage ? {
        ...page,
        elements: typeof args[0] === 'function' ? args[0](page.elements) : args[0]
      } : page
    ));
  }, [currentPage, setPages]);

  // Custom Hooks - History Management
  const {
    saveToHistory,
    undo,
    redo,
    historyIndex,
    history
  } = useHistory(setCurrentPageElements, setCanvasSize, setZoomLevel);

  // Custom Hooks - Element Management
  const {
    getCurrentPageElements,
    setCurrentPageElements: realSetCurrentPageElements,
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
    alignElements,
    splitElement,
    applyEditableTemplate
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
    canvasSize,
    setCanvasSize,
    setZoomLevel,
    centerCanvas
  });

  // Sync the ref so useHistory uses the actual setter from useElements
  useEffect(() => {
    setCurrentPageElementsRef.current = realSetCurrentPageElements;
  }, [realSetCurrentPageElements]);

  // Custom Hooks - Export Management
  const canvasBackgroundColor = pages.find(p => p.id === currentPage)?.backgroundColor || '#ffffff';
  const {
    exportAsImage,
    exportAsPDF,
    exportAsVideo,
    getCanvasDataURL
  } = useExport({
    getCurrentPageElements,
    canvasSize,
    imageEffects,
    backgroundColor: pages.find(p => p.id === currentPage)?.backgroundGradient || canvasBackgroundColor,
    projectName
  });

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
    centerCanvas,
    projectId: currentProjectId // Pass currentProjectId to hook
  });

  // handleSilentSave removed to disable auto-sync

  // Comment click handler (declared before useHelpers which references it)
  const handleCommentClick = useCallback((el) => {
    setSelectedElement(el.id);
    setSelectedElements(new Set([el.id]));
    setShowCommentPopup(true);
  }, []);

  // Custom Hooks - Canvas Interaction (must come BEFORE useHelpers)
  const {
    showAlignmentLines,
    alignmentLines,
    measurements,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp: handlePointerUp,
    handleCanvasMouseDown,
    handleSelectElement,
    handleTextEdit,
    handleWheel,
    renderSelectionHandles,
    penCursorPos
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
    currentPage,
    canvasSize,
    frameEditing,
    setFrameEditing
  });

  // Custom Hooks - Helper Functions
  const {
    handleImageUpload,
    handleAudioUpload,
    handleLogout,
    handleCanvasMouseEnter,
    handleCanvasMouseLeave,
    renderElement
  } = useHelpers({
    textEffects,
    imageEffects,
    shapeEffects,
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
    onCommentClick: handleCommentClick,
    frameEditing,
    setFrameEditing,
    penCursorPos,
    setCurrentPage,
    isTimelineImport,
    pages,
    setPages,
    canvasSize,
    currentPage
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

  // Wrap the getter to filter if playing/video mode
  // TRULY GLOBAL MASTER RENDERING: Aggregate elements from all pages if in Video Mode
  const getVisibleElements = useCallback(() => {
    if (!isVideoMode) return getCurrentPageElements();
    
    let allVisible = [];
    let currentStart = 0;
    
    pages.forEach(page => {
      const pageStart = currentStart;
      const pageElements = page.elements || [];
      
      pageElements.forEach(el => {
        const globalStart = (el.startTime || 0) + pageStart;
        const dur = el.duration || 5.0;
        
        // Element is visible if it overlaps with global currentTime
        if (currentTime >= globalStart && currentTime < (globalStart + dur)) {
          // Adjust position/offset logic if necessary, 
          allVisible.push(el);
        }
      });
      
      currentStart += (page.duration || 5);
    });
    
    return allVisible;
  }, [pages, isVideoMode, currentTime, getCurrentPageElements]);

  // Load persistent uploads on mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const { storage } = await import('../utils/storage');
        const assets = await storage.getAssets();
        // Filter out assets that belong to folders initially? 
        // For now, let's load EVERYTHING into the main list, and let ToolsSidebar handle filtering/display.
        // Actually, the requirement is "uploads la image, videos, folder nu irukanum".
        // So we need to fetch folders too.
        // But `uploads` state in MainPage seems to just be the list of assets passed to Sidebar.
        // We should probably pass the storage instance or handle fetching IN Sidebar, 
        // BUT `uploads` is currently a prop. Let's populate it here.
        setUploads(assets);
      } catch (error) {
        console.error("Failed to load assets:", error);
      }
    };
    loadAssets();
  }, []);


  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    if (isTimerRunning && selectedMusicId && !isMusicMuted) {
      const track = musicTracks.find(t => t.id === selectedMusicId);
      if (track) {
        if (!audioRef.current) {
          audioRef.current = new Audio(track.url);
          audioRef.current.loop = true;
          // Set volume to 0.5 to not be too loud
          audioRef.current.volume = 0.5;
        } else if (audioRef.current.getAttribute('data-track-id') !== track.id) {
          audioRef.current.pause();
          audioRef.current = new Audio(track.url);
          audioRef.current.loop = true;
          audioRef.current.volume = 0.5;
          audioRef.current.setAttribute('data-track-id', track.id);
        }

        // Use a promise to handle play result and avoid console noise
        audioRef.current.play().catch(e => {
          console.log("Audio play blocked - needs user interaction first", e);
        });
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isTimerRunning, selectedMusicId, isMusicMuted]);

  // Video playback and duration logic
  // Master Video Duration Calculation (Sum of all pages)
  useEffect(() => {
    if (!isVideoMode) return;
    
    // Total duration is the sum of all page durations
    const totalDuration = pages.reduce((sum, p) => sum + (p.duration || 5), 0);
    
    if (totalDuration !== videoDuration) {
      setVideoDuration(totalDuration);
    }
  }, [pages, isVideoMode, videoDuration]);

  // Auto-Page Switching based on Global currentTime
  useEffect(() => {
    if (!isVideoMode) return;

    let currentStart = 0;
    const targetPage = pages.find(page => {
      const pageDuration = page.duration || 5;
      const isWithinPage = currentTime >= currentStart && currentTime < (currentStart + pageDuration);
      currentStart += pageDuration;
      return isWithinPage;
    });

    if (targetPage && targetPage.id !== currentPage) {
      setCurrentPage(targetPage.id);
    }
    // Handle the very end of the video case
    if (currentTime >= videoDuration && pages.length > 0) {
      const lastPage = pages[pages.length - 1];
      if (lastPage.id !== currentPage) setCurrentPage(lastPage.id);
    }
  }, [currentTime, pages, isVideoMode, videoDuration, currentPage]);

  // Video Playback Loop
  useEffect(() => {
    let animationFrame;
    if (isVideoMode && isPlaying) {
      let lastTimestamp = Date.now();

      const loop = () => {
        const now = Date.now();
        const deltaTime = (now - lastTimestamp) / 1000;
        lastTimestamp = now;

        setCurrentTime(prevTime => {
          const newTime = prevTime + deltaTime;
          if (newTime >= videoDuration) {
            setIsPlaying(false); // Stop playback at the end
            return videoDuration; // Stay at the final point
          }
          return newTime;
        });

        animationFrame = requestAnimationFrame(loop);
      };

      animationFrame = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isVideoMode, isPlaying, videoDuration]); // Removed currentTime from dependencies

  // (Refs moved above centerCanvas to fix TDZ errors)


  // Audio is now handled by <GlobalAudioPlayer> component (see JSX return section)




  // getCurrentPageElements will be provided by useElements hook below

  // All constants (supportedLanguages, textEffects, imageEffects, shapeEffects, etc.) imported from constants.js


  // Center canvas function - maximizes canvas size while maintaining aspect ratio
  const updatePageBackground = useCallback((color, gradient) => {
    setPages(prevPages => prevPages.map(page =>
      page.id === currentPage ? { ...page, backgroundColor: color, backgroundGradient: gradient } : page
    ));
    // Note: History saving for page background requires updating history hook to track page props,
    // which is out of scope for this immediate task but should be added later.
  }, [currentPage]);


  // Auto-fit whenever canvas size meaningful changes (e.g. template application)
  useEffect(() => {
    // Small delay to ensure DOM layout is ready (especially sidebar transitions)
    const timer = setTimeout(() => {
      // Ensure container exists before trying to center
      if (canvasContainerRef.current) {
        centerCanvas();
      }
    }, 150); // Increased slightly from 100ms to be safer
    return () => clearTimeout(timer);
  }, [canvasSize, centerCanvas, activeSidePanel]); // Add activeSidePanel dependency so it refits when sidebar opens/closes


  // Sync i18n with currentLanguage on mount
  useEffect(() => {
    i18n.changeLanguage(currentLanguage);
  }, [currentLanguage, i18n]);

  // (handleCommentClick moved above useHelpers — see below)

  // Auto-fit canvas to screen on mount and resize
  useEffect(() => {
    const handleResize = () => {
      const now = Date.now();
      if (now - lastResizeTriggerRef.current < 150) return; // Debounce
      lastResizeTriggerRef.current = now;

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
      if (!currentProjectId) {
        return; 
      }

      // Load directly from the cloud
      if (isOnline && currentUser) {
        try {
          const { auth } = await import('../config/firebase');
          if (!auth.currentUser) return;

          const response = await projectAPI.loadProject(currentProjectId);
          
          // Robust data extraction from various possible response structures
          const fetchedData = response.data?.projectData || 
                            response.data?.project || 
                            response.data?.data || 
                            response.data;

          if (fetchedData) {
            // CRITICAL: Only update pages if we actually received non-empty pages
            // This prevents the "0/0 pages" issue if the API returns a partial or empty object
            if (fetchedData.pages && Array.isArray(fetchedData.pages) && fetchedData.pages.length > 0) {
              console.log('Syncing cloud pages to state');
              setPages(fetchedData.pages);
            }
            
            if (fetchedData.currentPage) setCurrentPage(fetchedData.currentPage);
            if (fetchedData.canvasSize) setCanvasSize(fetchedData.canvasSize);
            
            const fetchedTitle = fetchedData.title || fetchedData.projectName || fetchedData.name;
            if (fetchedTitle) setProjectName(fetchedTitle);
            
            setTimeout(() => centerCanvas(), 200);
          }
        } catch (error) {
          console.error('Error loading project from cloud:', error);
        }
      }
    };

    loadProject();
  }, [currentProjectId, currentUser, isOnline, centerCanvas]);

  // Auto-sync removed as per user request

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




  // Need a way to inject time-based filtering into rendering without modifying useElements core logic too much.
  // Actually, CanvasWorkspace uses `getCurrentPageElements` via prop, or `useElements` hook?
  // `CanvasWorkspace` receives `pages` and `currentDetails`.
  // `getCurrentPageElements` is passed to it.
  // Let's modify what is passed to `CanvasWorkspace`.

  // Wrap the getter to filter if playing/video mode




  // (useCanvasInteraction moved above useHelpers to fix TDZ — see above)

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
    imageEffects,
    canvasBackgroundColor: pages.find(p => p.id === currentPage)?.backgroundColor || '#ffffff'
  });

  // Custom Hooks - Canvas Utils
  const {
    addNewPage,
    deleteCurrentPage,
    renameCurrentPage,
    duplicatePage,
    movePage,
    playAnimations,
    resetAnimations,
    splitPage,
    updatePageDuration,
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
    setCurrentTime,
    isVideoMode,
    setShowZoomIndicator,
    zoomIndicatorTimeoutRef
  });

  // Calculate selectedElementData (now that getCurrentPageElements is available)
  const selectedElementData = getCurrentPageElements().find(el => el.id === selectedElement);

  const handleRemoveBackground = useCallback(async () => {
    if (isProcessingBG || !selectedElement || !selectedElementData || selectedElementData.type !== 'image') return;

    try {
      setIsProcessingBG(true);
      setBgProcessingStatus('Initializing AI...');
      console.log("Starting pro-level background removal...");

      const { removeBackground } = await import('@imgly/background-removal');

      // 1. Pre-process Image to Ensure High-Resolution (1500px min width)
      // This forces the AI to see fine details like trees and water ripples.
      const highResSrc = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = selectedElementData.src;
        img.onload = () => {
          // If image is small, upscale it. If huge, downscale to ~2000px to avoid crash.
          // Ideally we want ~1500px-2000px width for best detail/speed balance.
          let width = img.width;
          let height = img.height;
          const targetMinStart = 1500;

          if (width < targetMinStart) {
            const scale = targetMinStart / width;
            width = targetMinStart;
            height = height * scale;
          } else if (width > 2500) {
            const scale = 2500 / width;
            width = 2500;
            height = height * scale;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/png', 1.0));
        };
        img.onerror = () => resolve(selectedElementData.src); // Fallback
      });

      let blob;
      try {
        setBgProcessingStatus('Analyzing fine details...');
        blob = await removeBackground(highResSrc, {
          model: 'isnet_fp16', // High-precision native model
          output: { quality: 1.0, format: 'image/png' },
          device: 'gpu',
          progress: (key, current, total) => {
            const percent = Math.round((current / total) * 100);
            setBgProcessingStatus(`Scanning ${key}: ${percent}%`);
          }
        });
      } catch (largeError) {
        console.warn("Pro model failed, trying standard fallback:", largeError);
        setBgProcessingStatus('Switching to standard AI...');
        blob = await removeBackground(highResSrc, {
          model: 'isnet',
          progress: (key, current, total) => {
            const percent = Math.round((current / total) * 100);
            setBgProcessingStatus(`Standard mode: ${percent}%`);
          }
        });
      }

      setBgProcessingStatus('Protecting nature details...');

      // Post-processing: Hybrid Masking (AI + Nature Color Protection)
      const refinedBlob = await new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        img.onload = () => {
          // Load original image to compare colors
          const originalImg = new Image();
          originalImg.crossOrigin = "Anonymous";
          originalImg.src = highResSrc;

          originalImg.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw AI result first
            ctx.drawImage(img, 0, 0);
            const aiData = ctx.getImageData(0, 0, canvas.width, canvas.height); // AI Result (Transparent)

            // Draw Original to get colors
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
            const originalData = tempCtx.getImageData(0, 0, canvas.width, canvas.height).data;

            const data = aiData.data;

            // --- V6.2 Universal Spatial Coherence (Hysteresis) ---
            // REFINED: Lower thresholds to better keep object parts (like lamp bases) that AI might be unsure about.

            const width = canvas.width;
            const height = canvas.height;

            // 1. Identification Pass
            // Thresholds lowered: Strong > 30 (was 80), Weak > 5 (was 20)
            // This is more permissive, trusting the AI's faint detection if it's connected.
            const strongPixels = new Uint8Array(width * height);

            for (let i = 0; i < data.length; i += 4) {
              const alpha = data[i + 3];

              // If AI is even moderately confident, mark as strong seed
              if (alpha > 30) {
                strongPixels[i / 4] = 1;
              }
            }

            // 2. Connectivity Pass (Iterative Expansion)
            // Expand "Strong" status into neighboring "Weak" pixels
            let changes = true;
            let passes = 0;
            while (changes && passes < 20) { // Increased passes for better coverage
              changes = false;
              passes++;

              for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                  const idx = (y * width + x);

                  if (strongPixels[idx] === 1) continue;

                  const alpha = data[idx * 4 + 3];
                  // If it's a "Candidate" (Very weak signal, > 5)
                  if (alpha > 5) {
                    // Check neighbors
                    let hasStrongNeighbor = false;
                    // Check 8-connectivity for better flow
                    const neighbors = [
                      -1, 1, -width, width, // 4-connected
                      -width - 1, -width + 1, width - 1, width + 1 // diagonals
                    ];

                    for (let offset of neighbors) {
                      const nIdx = idx + offset;
                      if (nIdx >= 0 && nIdx < width * height && strongPixels[nIdx] === 1) {
                        hasStrongNeighbor = true;
                        break;
                      }
                    }

                    if (hasStrongNeighbor) {
                      strongPixels[idx] = 1;
                      changes = true;
                    }
                  }
                }
              }
            }

            // 3. Final Apply Pass
            for (let i = 0; i < data.length; i += 4) {
              const idx = i / 4;

              if (strongPixels[idx] === 1) {
                // RESTORE FULL OPACITY AND COLOR
                data[i] = originalData[i];
                data[i + 1] = originalData[i + 1];
                data[i + 2] = originalData[i + 2];
                // Boost alpha: if it was weak, make it solid.
                // Keep some transparency if it was VERY transparent (glass), but mostly solid.
                // Logic: Max(OriginalAI, 255). 
                // Actually, for "Restore", we usually want the object to be solid 
                // unless the user specifically wants partial transparency. 
                // Given the issue is "missing parts", solid (255) is safer.
                data[i + 3] = 255;
              } else {
                // Kill unconnected noise
                data[i + 3] = 0;
              }
            }

            ctx.putImageData(aiData, 0, 0);

            canvas.toBlob((resultBlob) => {
              URL.revokeObjectURL(img.src);
              resolve(resultBlob || blob);
            }, 'image/png');
          };
          originalImg.onerror = () => {
            // If original fails to load for color check, just return AI result
            resolve(blob);
          };
        };
        img.onerror = () => resolve(blob);
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        updateElement(selectedElement, {
          src: base64data,
          originalSrc: selectedElementData.src
        });
        setIsProcessingBG(false);
        setBgProcessingStatus('');
      };
      reader.readAsDataURL(refinedBlob);

    } catch (error) {
      console.error("Background removal failed completely:", error);
      setIsProcessingBG(false);
      setBgProcessingStatus('');
      const errorMsg = error?.message || "Unknown error";
      alert(`Background removal failed: ${errorMsg}\n\nTip: Refresh the page and ensure a stable connection.`);
    }
  }, [isProcessingBG, selectedElement, selectedElementData, updateElement]);

  const handleRevertBackground = useCallback(() => {
    if (!selectedElement || !selectedElementData || !selectedElementData.originalSrc) return;

    updateElement(selectedElement, {
      src: selectedElementData.originalSrc,
      originalSrc: null // Clear backup after restoration
    });
  }, [selectedElement, selectedElementData, updateElement]);

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
    saveToHistory,
    canvasSize
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
    activeSidePanel,
    setActiveSidePanel,
    copyElements,
    pasteElements,
    splitElement,
    splitPage,
    onDeletePage: (id) => {
      // Direct call to setPages to delete the page by ID
      setPages(prev => prev.filter(p => p.id !== id));
      // Reset selection
      setSelectedElement(null);
      setSelectedElements(new Set());
    },
    pages,
    currentPage,
    currentTime,
    showRulers,
    setShowRulers
  });

  // NOTE: Keyboard shortcuts handler now provided by useKeyboardShortcuts hook
  // This replaces the large useEffect with handleKeyDown function


  // Add event listeners (using Pointer Events for precision drawing)
  useEffect(() => {
    document.addEventListener('pointermove', handleMouseMove);
    document.addEventListener('pointerup', handlePointerUp);
    
    return () => {
      document.removeEventListener('pointermove', handleMouseMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handleMouseMove, handlePointerUp]);

  // Auto-apply template or custom size from URL if present
  useEffect(() => {
    if (templateAppliedRef.current) return;

    const templateKey = searchParams.get('template');
    const customWidth = searchParams.get('width');
    const customHeight = searchParams.get('height');

    if (templateKey) {
      templateAppliedRef.current = true;
      const staticTemplate = socialMediaTemplates[templateKey];
      const editableTemplate = editableTemplates[templateKey];

      // Check community templates in localStorage
      const communityTemplates = JSON.parse(localStorage.getItem('community_templates') || '[]');
      const communityTemplate = communityTemplates.find(t => t.id === templateKey);

      if (communityTemplate) {
        const size = communityTemplate.canvasSize || { width: 800, height: 600 };
        setCanvasSize(size);
        setPages(communityTemplate.pages || [{ id: 'page-1', elements: [] }]);
        // Force immediate auto-fit using the explicit size to avoid stale state issues
        setTimeout(() => centerCanvas(size), 400);
      } else if (editableTemplate) {
        setCanvasSize({ width: editableTemplate.width, height: editableTemplate.height });
        setTimeout(() => {
          applyEditableTemplate(templateKey);
          // Re-center after applying elements
          setTimeout(() => centerCanvas(), 200);
        }, 300);
      } else if (staticTemplate) {
        setCanvasSize({ width: staticTemplate.width, height: staticTemplate.height });
      }
    } else if (customWidth && customHeight) {
      const w = parseInt(customWidth);
      const h = parseInt(customHeight);
      if (!isNaN(w) && !isNaN(h)) {
        setCanvasSize({ width: w, height: h });
      }
    }
  }, [searchParams, applyEditableTemplate, centerCanvas]);

  // Handle clicking outside the canvas paper (the gray area)
  const handleContainerMouseDown = useCallback((e) => {
    // We rely on stopPropagation in children (Canvas Paper, Elements) to prevent this from triggering wrongly
    setSelectedElement(null);
    setSelectedElements(new Set());
  }, [setSelectedElement, setSelectedElements]);

  const handleSplit = useCallback(() => {
    if (selectedElement && splitElement) {
      splitElement(selectedElement, currentTime);
    } else if (splitPage) {
      splitPage(currentTime);
    }
  }, [selectedElement, splitElement, splitPage, currentTime]);

  const handleSelectElementFromTimeline = useCallback((id) => {
    if (!id) {
      setSelectedElement(null);
      setSelectedElements(new Set());
      return;
    }
    setSelectedElement(id);
    setSelectedElements(new Set([id]));
    
    // Auto-scroll/jump to page if it's not the current one
    const p = pages.find(p => p.elements?.some(el => el.id === id));
    if (p && p.id !== currentPage) {
      setCurrentPage(p.id);
    }
  }, [pages, currentPage, setSelectedElement, setSelectedElements, setCurrentPage]);

  return (
    <>
      {/* Global Audio Player - handles all audio element playback synced to timeline */}
      <GlobalAudioPlayer
        pages={pages}
        currentTime={currentTime}
        isPlaying={isPlaying}
        isMusicMuted={isMusicMuted}
      />
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
          showRulers={showRulers}
          setShowRulers={setShowRulers}
          setGuides={setGuides}
          showMargins={showMargins}
          setShowMargins={setShowMargins}
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
          onSilentSave={() => {}}
          loadProject={loadProject}
          projectName={projectName}
          setProjectName={setProjectName}
          pages={pages}
          canvasSize={canvasSize}
          isCreatorMode={searchParams.get('isCreatorMode') === 'true'}
          saveStatus={'idle'}
          getCanvasDataURL={getCanvasDataURL}
          isOnline={isOnline}
          isSyncing={false}
        />


        {/* Main Content Area */}
        <div className="main-content">
          {/* Left Tools Panel - Hidden on mobile */}
          <ToolsSidebar
            t={t}
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
            addElement={addElement}
            applyEditableTemplate={applyEditableTemplate}
            fileInputRef={fileInputRef}
            audioInputRef={audioInputRef}
            handleImageUpload={handleImageUpload}
            handleAudioUpload={handleAudioUpload}
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
            setUploads={setUploads}
            canvasSize={canvasSize}
            setCanvasSize={setCanvasSize}
            setShowContentPlannerModal={setShowContentPlannerModal}
            activeSidePanel={activeSidePanel}
            setActiveSidePanel={(panel) => {
              setActiveSidePanel(panel);
              // Keep video mode active for any media/editing tab once in video context
              const videoTabs = ['Video', 'video', 'audio', 'images', 'uploads', 'elements', 'text', 'design'];
              if (videoTabs.includes(panel)) {
                // Only force true if we are already in video mode or selecting video/audio specifically
                if (panel === 'video' || panel === 'audio' || isVideoMode) {
                  setIsVideoMode(true);
                }
              } else {
                setIsVideoMode(false);
              }
            }}
            pages={pages}
            currentPage={currentPage}
            updateElement={updateElement}
            updateElements={updateElements}
            selectedElement={selectedElement}
            selectedElementData={selectedElementData}
            lastColorChange={lastColorChange}
            setLastColorChange={setLastColorChange}
            setPages={setPages}
            updatePageBackground={updatePageBackground}
            handleRemoveBackground={handleRemoveBackground}
            isProcessingBG={isProcessingBG}
            handleRevertBackground={handleRevertBackground}
            bgProcessingStatus={bgProcessingStatus}
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
              handleRemoveBackground={handleRemoveBackground}
              isProcessingBG={isProcessingBG}
              onShowLayers={() => {
                setPositionPanelDefaultTab('layers');
                setActiveSidePanel('position');
              }}
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
              activeSidePanel={activeSidePanel}
              setActiveSidePanel={setActiveSidePanel}
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
              copyStyle={copyStyle}
              pasteStyle={pasteStyle}
              hasStyleClipboard={hasStyleClipboard}
              handleRemoveBackground={handleRemoveBackground}
              isProcessingBG={isProcessingBG}
              handleRevertBackground={handleRevertBackground}
              bgProcessingStatus={bgProcessingStatus}
            />
            <CanvasWorkspace
              canvasContainerRef={canvasContainerRef}
              canvasRef={canvasRef}
              canvasSize={canvasSize}
              zoomLevel={zoomLevel}
              canvasOffset={canvasOffset}
              handleCanvasMouseDown={handleCanvasMouseDown}
              handlePointerUp={handlePointerUp}
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
              setShowGrid={setShowGrid}
              showRulers={showRulers}
              guides={guides}
              setGuides={setGuides}
              showMargins={showMargins}
              getCurrentPageElements={getVisibleElements} // Video Mode Time Filtering
              renderElement={renderElement}
              showAlignmentLines={showAlignmentLines}
              alignmentLines={alignmentLines}
              onMouseMove={handleCanvasMouseMoveForCollaboration}
              canvasHighlighted={canvasHighlighted}
              handleWheel={handleWheel}
              canvasBackgroundColor={(pages.find(p => p.id === currentPage) || {}).backgroundColor}
              handleContainerMouseDown={handleContainerMouseDown}
              pages={pages}
              setPages={setPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              addNewPage={addNewPage}
              duplicatePage={duplicatePage}
              movePage={movePage}
              deletePage={deleteCurrentPage}
              renamePage={renameCurrentPage}
              showNotesPanel={showNotesPanel}
              setShowNotesPanel={setShowNotesPanel}
              showTimerModal={showTimerModal}
              setShowTimerModal={setShowTimerModal}
              showGridView={showGridView}
              setShowGridView={setShowGridView}
              showPagesStrip={showPagesStrip && !isVideoMode}
              setShowPagesStrip={setShowPagesStrip}
              timerSeconds={timerSeconds}
              setTimerSeconds={setTimerSeconds}
              isTimerRunning={isTimerRunning}
              setIsTimerRunning={setIsTimerRunning}
              selectedMusicId={selectedMusicId}
              setSelectedMusicId={setSelectedMusicId}
              isVideoMode={isVideoMode}
              musicTracks={musicTracks}
              isMusicMuted={isMusicMuted}
              setIsMusicMuted={setIsMusicMuted}
              measurements={measurements} // Pass measurements
              currentTime={currentTime}
              isPlaying={isPlaying}
            />

            {/* Video Timeline (Bottom) — inside flex-col so canvas shrinks instead of overlapping */}
            {isVideoMode && (
              <div className="flex-shrink-0 animate-in slide-in-from-bottom duration-300">
              <VideoTimeline
                pages={pages}
                currentPage={currentPage}
                setCurrentPage={(id) => {
                  // Navigation Sync: Clicking a scene jumps the playhead to its start
                  let startOffset = 0;
                  for (let p of pages) {
                    if (p.id === id) break;
                    startOffset += (p.duration || 5);
                  }
                  setCurrentTime(startOffset);
                  setCurrentPage(id);
                }}
                currentDetails={pages.find(p => p.id === currentPage) || {}}
                onUpdateElement={updateElement}
                onUpdatePageDuration={updatePageDuration}
                currentTime={currentTime}
                setCurrentTime={setCurrentTime}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                duration={videoDuration}
                selectedElement={selectedElement}
                setSelectedElement={handleSelectElementFromTimeline}
                onAddClip={(id, type, action) => {
                  if (type === 'audio') {
                    setActiveSidePanel('audio');
                    // Small delay to ensure panel is active if needed, but ref click is synchronous
                    audioInputRef.current?.click();
                    return;
                  }

                  if (action === 'import') {
                    isTimelineImport.current = true;
                    fileInputRef.current?.click();
                  } else if (action === 'blank') {
                    addElement('rectangle', { 
                      fill: '#ffffff', 
                      fitToCanvas: true,
                      label: 'Blank'
                    });
                  } else {
                    // Default behavior
                    if (type === 'video' || type === 'image') fileInputRef.current?.click();
                    else if (type === 'text') addElement('text');
                    else if (type === 'audio') {
                      setActiveSidePanel('audio');
                      audioInputRef.current?.click();
                    }
                  }
                }}
                onAddPage={(action) => {
                  const newPageId = `page-${Date.now()}`;
                  const newPage = { id: newPageId, name: `Page ${pages.length + 1}`, elements: [], duration: 5.0, backgroundColor: '#ffffff' };
                  
                  setPages(prev => [...prev, newPage]);
                  setCurrentPage(newPageId);
                  setSelectedElement(null);
                  setSelectedElements(new Set());

                  if (action === 'import') {
                    // Slight delay to ensure page context is set before triggering upload
                    setTimeout(() => {
                      isTimelineImport.current = true;
                      fileInputRef.current?.click();
                    }, 50);
                  }
                }}
                onDeletePage={(id) => {
                  if (pages.length <= 1) return;
                  const newPages = pages.filter(p => p.id !== id);
                  setPages(newPages);
                  if (currentPage === id) {
                    setCurrentPage(newPages[0].id);
                  }
                }}
                onDuplicatePage={(id) => {
                  const pageToDup = pages.find(p => p.id === id);
                  if (pageToDup) {
                    const newPageId = `page-${Date.now()}`;
                    const newPage = { 
                      ...pageToDup, 
                      id: newPageId, 
                      name: `${pageToDup.name} (Copy)`,
                      // Ensure all elements get new IDs 
                      elements: pageToDup.elements.map(el => ({ ...el, id: `el-${Math.random().toString(36).substr(2, 9)}` }))
                    };
                    setPages(prev => [...prev, newPage]);
                    setCurrentPage(newPageId);
                  }
                }}
                onDeleteClip={deleteElement}
                onSplit={handleSplit}
                onClipDoubleClick={(clipId, clipType) => {
                  // Select the element on canvas
                  setSelectedElement(clipId);
                  // Open the relevant editing panel (Canva-like "mixed" panel switch)
                  if (clipType === 'text') {
                    setActiveSidePanel('text');
                  } else if (clipType === 'element') {
                    setActiveSidePanel('elements');
                  }
                }}
              />
            </div>
            )}
          </div>

        </div> {/* end main-content */}


        {/* Side Panels Container (Left side) */}
        <EffectsPanel
          show={activeSidePanel === 'effects'}
          selectedElement={selectedElement}
          selectedElementData={selectedElementData}
          onUpdateElement={updateElement}
          onClose={() => setActiveSidePanel('none')}
        />

        <AdvancedSettingsPanel
          show={activeSidePanel === 'advanced'}
          onClose={() => setActiveSidePanel('none')}
          selectedElement={selectedElement}
          selectedElementData={selectedElementData}
          updateElement={updateElement}
          filterOptions={filterOptions}
          updateFilter={updateFilter}
        />

        <PositionPanel
          isOpen={activeSidePanel === 'position'}
          onClose={() => setActiveSidePanel('none')}
          selectedElement={selectedElement}
          selectedElements={selectedElements}
          elements={getCurrentPageElements()}
          updateElement={updateElement}
          alignElements={alignElements}
          changeZIndex={changeZIndex}
          setSelectedElement={setSelectedElement}
          setSelectedElements={setSelectedElements}
          toggleElementLock={toggleElementLock}
          lockedElements={lockedElements}
          reorderElement={reorderElement}
          isSidePanel={true}
          defaultTab={positionPanelDefaultTab}
        />

        <AnimationPanel
          isOpen={activeSidePanel === 'animation'}
          onClose={() => setActiveSidePanel('none')}
          selectedElement={selectedElement}
          selectedElements={new Set([selectedElement])}
          elements={getCurrentPageElements()}
          updateElement={updateElement}
          updateElements={updateElements}
          mode={selectedElementData ? 'element' : 'page'}
          isSidePanel={true}
        />



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
          audioInputRef={audioInputRef}
          handleImageUpload={handleImageUpload}
          handleAudioUpload={handleAudioUpload}
          undo={undo}
          redo={redo}
          historyIndex={historyIndex}
          history={history}
          handleSaveClick={handleSaveClick}
          recording={recording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          setShowTemplates={setShowTemplates}
          setActiveSidePanel={setActiveSidePanel}
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

        <ContentPlannerModal 
          isOpen={showContentPlannerModal} 
          onClose={() => setShowContentPlannerModal(false)} 
          getPreviewImage={getCanvasDataURL}
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
