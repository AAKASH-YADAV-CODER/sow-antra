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
import VideoTimeline from '../features/canvas/components/VideoTimeline/VideoTimeline'; // Import VideoTimeline
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
// UI Helper Components
import CollaborationPresence from '../features/collaboration/components/CollaborationPresence';

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

  // Persistent Timer States
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedMusicId, setSelectedMusicId] = useState(null);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const audioRef = useRef(null);

  const [isProcessingBG, setIsProcessingBG] = useState(false);
  const [bgProcessingStatus, setBgProcessingStatus] = useState('');

  // Video Editor State
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(5); // Default 5s page duration
  // Global audio tracks state could be here or in pages

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

  // Video Playback Loop
  useEffect(() => {
    let animationFrame;
    if (isVideoMode && isPlaying) {
      const startTime = Date.now() - (currentTime * 1000);

      const loop = () => {
        const now = Date.now();
        const newTime = (now - startTime) / 1000;

        if (newTime >= videoDuration) {
          // Loop
          setCurrentTime(0);
          // setStartTime to now? No, effect re-runs on currentTime change?
          // Actually, if we set currentTime(0), the effect dependency `currentTime` changes, 
          // triggering re-run with new start time.
        } else {
          setCurrentTime(newTime);
          animationFrame = requestAnimationFrame(loop);
        }
      };

      animationFrame = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isVideoMode, isPlaying, videoDuration, currentTime]); // minimal deps

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  // floatingToolbarRef removed as unused
  const canvasContainerRef = useRef(null);
  const loadProjectInputRef = useRef(null);
  const zoomIndicatorTimeoutRef = useRef(null);
  const templateAppliedRef = useRef(false);
  const lastResizeTriggerRef = useRef(0);


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
    // Clamp to a reasonable range to avoid extreme "jumps" on initial load
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

  // Comment click handler
  const handleCommentClick = useCallback((el) => {
    setSelectedElement(el.id);
    setSelectedElements(new Set([el.id]));
    setShowCommentPopup(true);
  }, []);

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
          // Always auto-fit on load instead of restoring saved zoom
          // if (projectData.zoomLevel) setZoomLevel(projectData.zoomLevel);
          if (projectData.canvasOffset) setCanvasOffset(projectData.canvasOffset);
          if (projectData.showGrid !== undefined) setShowGrid(projectData.showGrid);
          if (projectData.snapToGrid !== undefined) setSnapToGrid(projectData.snapToGrid);
          if (projectData.currentLanguage) setCurrentLanguage(projectData.currentLanguage);
          if (projectData.textDirection) setTextDirection(projectData.textDirection);

          // Force fit to screen
          setTimeout(() => {
            centerCanvas();
          }, 200);
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
  }, [currentProjectId, currentUser, centerCanvas]);

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



  const setCurrentPageElements = useCallback((newElementsOrFn) => {
    setPages(prevPages => prevPages.map(page =>
      page.id === currentPage ? {
        ...page,
        elements: typeof newElementsOrFn === 'function'
          ? newElementsOrFn(page.elements)
          : newElementsOrFn
      } : page
    ));
  }, [currentPage]);

  // Need a way to inject time-based filtering into rendering without modifying useElements core logic too much.
  // Actually, CanvasWorkspace uses `getCurrentPageElements` via prop, or `useElements` hook?
  // `CanvasWorkspace` receives `pages` and `currentDetails`.
  // `getCurrentPageElements` is passed to it.
  // Let's modify what is passed to `CanvasWorkspace`.

  // Wrap the getter to filter if playing/video mode


  // Custom Hooks - History Management
  const {
    history,
    historyIndex,
    saveToHistory,
    undo,
    redo
  } = useHistory(setCurrentPageElements, setCanvasSize, setZoomLevel);

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
    alignElements,
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
    centerCanvas // Pass auto-fit function to hook
  });

  // Wrap the getter to filter if playing/video mode
  const getVisibleElements = useCallback(() => {
    const elements = getCurrentPageElements();
    if (!isVideoMode) return elements;
    return elements.filter(el => {
      const start = el.startTime || 0;
      const dur = el.duration || videoDuration; // default to page duration
      return currentTime >= start && currentTime <= (start + dur);
    });
  }, [getCurrentPageElements, isVideoMode, currentTime, videoDuration]);

  // Custom Hooks - Canvas Interaction
  const {
    drawingPath,
    showAlignmentLines,
    alignmentLines,
    measurements, // Get measurements
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
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
    currentPage, // Add this
    canvasSize,
    frameEditing,
    setFrameEditing
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

  // Custom Hooks - Export Management
  const canvasBackgroundColor = pages.find(p => p.id === currentPage)?.backgroundColor || '#ffffff';
  const {
    exportAsImage,
    exportAsPDF,
    exportAsVideo
  } = useExport({
    getCurrentPageElements,
    canvasSize,
    imageEffects,
    backgroundColor: pages.find(p => p.id === currentPage)?.backgroundGradient || canvasBackgroundColor
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
    setCurrentPage // Pass setCurrentPage to hook
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
      
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
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

      if (editableTemplate) {
        setCanvasSize({ width: editableTemplate.width, height: editableTemplate.height });
        // The centerCanvas will be triggered by canvasSize change via useEffect
        setTimeout(() => {
          applyEditableTemplate(templateKey);
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
  }, [searchParams, applyEditableTemplate]);

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


        {/* Main Content Area */}
        <div className="main-content">
          {/* Left Tools Panel - Hidden on mobile */}
          <ToolsSidebar
            t={t}
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
            addElement={(type, props) => {
              if (type === 'template') {
                applyEditableTemplate(props.templateId);
              } else {
                addElement(type, props);
              }
            }}
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
            setUploads={setUploads}
            canvasSize={canvasSize}
            setCanvasSize={setCanvasSize}
            activeSidePanel={activeSidePanel}
            setActiveSidePanel={(panel) => {
              setActiveSidePanel(panel);
              if (panel === 'Video') {
                setIsVideoMode(true);
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
              getCurrentPageElements={getVisibleElements} // Video Mode Time Filtering
              renderElement={renderElement}
              renderDrawingPath={renderDrawingPath}
              drawingPath={drawingPath}
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
              musicTracks={musicTracks}
              isMusicMuted={isMusicMuted}
              setIsMusicMuted={setIsMusicMuted}
              measurements={measurements} // Pass measurements
            />
          </div>

          {/* Video Timeline (Bottom) */}
          {isVideoMode && (
            <div className="absolute left-0 right-0 bottom-0 h-64 z-[1002] animate-in slide-in-from-bottom duration-300">
              <VideoTimeline
                pages={pages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                currentDetails={pages.find(p => p.id === currentPage) || {}}
                onUpdateElement={updateElement}
                onUpdatePageDuration={(newDuration) => {
                  setVideoDuration(newDuration); // Update local state
                  // Also update page data if we persist page duration
                  setPages(prev => prev.map(p => p.id === currentPage ? { ...p, duration: newDuration } : p));
                }}
                currentTime={currentTime}
                setCurrentTime={setCurrentTime}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                duration={videoDuration}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
              // audioTracks={audioTracks}
              />
            </div>
          )}

          {/* Right Properties Panel - Hidden on mobile */}

        </div>


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
            onShowLayers={() => {
              setPositionPanelDefaultTab('layers');
              setActiveSidePanel('position');
            }}
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
