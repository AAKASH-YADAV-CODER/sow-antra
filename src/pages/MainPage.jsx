import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Plus, Square, Circle, Triangle, Type, Image, Play, Pause, 
  Copy, Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Download, Save, FolderOpen, Undo, Redo, Group, Ungroup, Move, Minus, 
  Maximize, MinusCircle, PlusCircle, Layers, Grid, MousePointer, ZoomIn,
  ZoomOut, Lock, Unlock, Users, MessageCircle, Star,
  Hexagon,  ArrowRight, ArrowLeft,
  Music,
  Film, FileText, BookOpen, Printer, Heart,
  Zap, 
  CreditCard, 
  Tv, Smartphone, Monitor,
  Megaphone, 
  User, LogOut, Settings,
  Languages, Sparkles, HelpCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ShareButton from '../components/common/ShareButton';
import jsPDF from 'jspdf';
import { projectAPI } from '../services/api';
// Component imports
import SaveDialog from '../features/canvas/components/modals/SaveDialog';
import TemplatesModal from '../features/canvas/components/modals/TemplatesModal';
import CustomTemplateModal from '../features/canvas/components/modals/CustomTemplateModal';
import LanguageHelpModal from '../features/canvas/components/modals/LanguageHelpModal';
import RecordingStatus from '../features/canvas/components/RecordingStatus';
import EffectsPanel from '../features/canvas/components/EffectsPanel';
import GradientPicker from '../features/canvas/components/GradientPicker';
import SelectionHandles from '../features/canvas/components/SelectionHandles';
import { MobileToolsDrawer, MobilePropertiesDrawer } from '../features/canvas/components/MobileDrawers';
// Style imports
import styles from '../styles/MainPage.module.css';
import * as styleHelpers from '../utils/styleHelpers';

const Sowntra = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout, currentUser } = useAuth();
  const currentProjectId = searchParams.get('project');
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedElements, setSelectedElements] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAlignmentLines, setShowAlignmentLines] = useState(false);
  const [alignmentLines, setAlignmentLines] = useState({ vertical: [], horizontal: [] });
  const [currentTool, setCurrentTool] = useState('select');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  // const [recordedChunks, setRecordedChunks] = useState([]);
  const [drawingPath, setDrawingPath] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
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
  const [recordingTimeElapsed, setRecordingTimeElapsed] = useState(0);
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

  // Get current page elements
  const getCurrentPageElements = useCallback(() => {
    const page = pages.find(p => p.id === currentPage);
    return page ? page.elements : [];
  }, [pages, currentPage]);

  // Enhanced z-index sorting for exports
  const getSortedElementsForExport = useCallback(() => {
    const currentElements = getCurrentPageElements();
    
    // Create a copy and sort by zIndex to ensure proper layering
    const sortedElements = [...currentElements].sort((a, b) => {
      // Handle groups and their children properly
      if (a.type === 'group' && b.groupId === a.id) return -1;
      if (b.type === 'group' && a.groupId === b.id) return 1;
      
      // Regular zIndex comparison
      return a.zIndex - b.zIndex;
    });
    
    return sortedElements;
  }, [getCurrentPageElements]);

  // Export-ready elements with proper filtering
  // eslint-disable-next-line no-unused-vars
  const getExportReadyElements = useCallback(() => {
    const currentElements = getCurrentPageElements();
    
    return [...currentElements]
      .sort((a, b) => {
        // First, sort by zIndex
        if (a.zIndex !== b.zIndex) {
          return a.zIndex - b.zIndex;
        }
        
        // If same zIndex, maintain original order
        return currentElements.indexOf(a) - currentElements.indexOf(b);
      })
      .filter(element => {
        // Include all elements except temporary ones
        return !element.isTemporary;
      });
  }, [getCurrentPageElements]);

  // Calculate selectedElementData here at the top level
  const selectedElementData = getCurrentPageElements().find(el => el.id === selectedElement);

  // Font families with Indian language support
  const fontFamilies = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
    'Courier New', 'Impact', 'Comic Sans MS', 'Tahoma', 'Trebuchet MS',
    'Palatino', 'Garamond', 'Bookman', 'Avant Garde', 'Arial Black',
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Oswald',
    'Source Sans Pro', 'Raleway', 'Merriweather', 'Playfair Display',
    'Ubuntu', 'Nunito', 'Inter', 'Fira Sans', 'Noto Sans',
    // Indian language fonts
    'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Telugu', 
    'Noto Sans Bengali', 'Noto Sans Gurmukhi', 'Noto Sans Gujarati',
    'Noto Sans Kannada', 'Noto Sans Malayalam', 'Noto Sans Oriya',
    'Mangal', 'Lohit Devanagari', 'FreeSans', 'Kalimati', 'Lohit Tamil',
    'Lohit Telugu', 'Lohit Bengali', 'Lohit Gujarati', 'Lohit Kannada',
    'Lohit Malayalam', 'Lohit Oriya', 'Lohit Gurmukhi'
  ];

  // Supported languages with their scripts
  const supportedLanguages = {
    en: { name: 'English', nativeName: 'English', direction: 'ltr', font: 'Arial' },
    hi: { name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', font: 'Noto Sans Devanagari' },
    ta: { name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', font: 'Noto Sans Tamil' },
    te: { name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr', font: 'Noto Sans Telugu' },
    bn: { name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', font: 'Noto Sans Bengali' },
    mr: { name: 'Marathi', nativeName: 'मराठी', direction: 'ltr', font: 'Noto Sans Devanagari' },
    gu: { name: 'Gujarati', nativeName: 'ગુજરાતી', direction: 'ltr', font: 'Noto Sans Gujarati' },
    kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ', direction: 'ltr', font: 'Noto Sans Kannada' },
    ml: { name: 'Malayalam', nativeName: 'മലയാളം', direction: 'ltr', font: 'Noto Sans Malayalam' },
    pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', direction: 'ltr', font: 'Noto Sans Gurmukhi' },
    or: { name: 'Odia', nativeName: 'ଓଡ଼ିଆ', direction: 'ltr', font: 'Noto Sans Oriya' },
  };

  // Enhanced Text Effects
  const textEffects = {
    none: { name: 'None', css: '' },
    shadow: { 
      name: 'Shadow', 
      css: 'text-shadow: 2px 2px 4px rgba(0,0,0,0.5);' 
    },
    lift: { 
      name: 'Lift', 
      css: 'text-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 6px 20px rgba(0,0,0,0.15);' 
    },
    hollow: { 
      name: 'Hollow', 
      css: 'color: transparent; -webkit-text-stroke: 2px #000;' 
    },
    splice: { 
      name: 'Splice', 
      css: 'background: linear-gradient(45deg, #ff6b6b, #4ecdc4); -webkit-background-clip: text; -webkit-text-fill-color: transparent;' 
    },
    neon: { 
      name: 'Neon', 
      css: 'color: #fff; text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ff00de, 0 0 20px #ff00de;' 
    },
    glitch: { 
      name: 'Glitch', 
      css: 'text-shadow: 2px 2px 0 #ff00de, -2px -2px 0 #00fff7; animation: glitch-text 0.3s infinite;' 
    },
    background: { 
      name: 'Background', 
      css: 'background: rgba(0,0,0,0.8); color: white; padding: 4px 8px; border-radius: 4px;' 
    },
    retro: { 
      name: 'Retro', 
      css: 'color: #ff6b6b; text-shadow: 3px 3px 0 #4ecdc4, 6px 6px 0 #45b7aa;' 
    },
    gradient: { 
      name: 'Gradient', 
      css: 'background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;' 
    },
    metallic: { 
      name: 'Metallic', 
      css: 'background: linear-gradient(45deg, #bdc3c7, #2c3e50); -webkit-background-clip: text; -webkit-text-fill-color: transparent;' 
    }
  };

  // Enhanced Image Effects
  const imageEffects = {
    none: { name: 'None', filter: '' },
    vintage: { name: 'Vintage', filter: 'sepia(0.5) contrast(1.2) brightness(1.1)' },
    grayscale: { name: 'Grayscale', filter: 'grayscale(100%)' },
    invert: { name: 'Invert', filter: 'invert(100%)' },
    blur: { name: 'Blur', filter: 'blur(3px)' },
    sharpen: { name: 'Sharpen', filter: 'contrast(1.5) saturate(1.5)' },
    warm: { name: 'Warm', filter: 'sepia(0.3) saturate(1.5) hue-rotate(-10deg)' },
    cool: { name: 'Cool', filter: 'sepia(0.1) saturate(1.2) hue-rotate(180deg) brightness(1.1)' },
    dramatic: { name: 'Dramatic', filter: 'contrast(2) brightness(0.8) saturate(1.5)' },
    pastel: { name: 'Pastel', filter: 'saturate(0.7) brightness(1.2) contrast(0.9)' },
    noir: { name: 'Noir', filter: 'grayscale(100%) contrast(1.5) brightness(0.8)' }
  };

  // Shape Effects
  const shapeEffects = {
    none: { name: 'None', css: '' },
    shadow: { name: 'Shadow', css: 'filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.3));' },
    glow: { name: 'Glow', css: 'filter: drop-shadow(0 0 10px rgba(255,255,255,0.8));' },
    emboss: { name: 'Emboss', css: 'filter: contrast(1.5) brightness(1.2);' },
    outline: { name: 'Outline', css: 'outline: 3px solid #000; outline-offset: 2px;' },
    gradientBorder: { name: 'Gradient Border', css: 'border: 4px solid; border-image: linear-gradient(45deg, #667eea, #764ba2) 1;' },
    metallic: { name: 'Metallic', css: 'background: linear-gradient(145deg, #bdc3c7, #2c3e50);' }
  };

  // Special Effects for All Elements
  const specialEffects = {
    none: { name: 'None', css: '' },
    hover: { name: 'Hover Effect', css: 'transition: all 0.3s ease;' },
    pulse: { name: 'Pulse', css: 'animation: pulse 2s infinite;' },
    bounce: { name: 'Bounce', css: 'animation: bounce 2s infinite;' },
    shake: { name: 'Shake', css: 'animation: shake 0.5s infinite;' },
    float: { name: 'Float', css: 'animation: float 3s ease-in-out infinite;' },
    spin: { name: 'Spin', css: 'animation: spin 2s linear infinite;' },
    fadeIn: { name: 'Fade In', css: 'animation: fadeIn 1s ease-in;' },
    slideIn: { name: 'Slide In', css: 'animation: slideIn 1s ease-out;' },
    zoom: { name: 'Zoom', css: 'animation: zoom 1s ease-in-out;' }
  };

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

  // Social media templates with correct dimensions and aspect ratios
  const socialMediaTemplates = {
    instagramPost: { 
      width: 1080, 
      height: 1080, 
      name: 'Instagram Post', 
      icon: <Square size={16} />,
      aspectRatio: 1 
    },
    instagramStory: { 
      width: 1080, 
      height: 1920, 
      name: 'Instagram Story', 
      icon: <Smartphone size={16} />,
      aspectRatio: 9/16 
    },
    facebookPost: { 
      width: 940, 
      height: 788, 
      name: 'Facebook Post', 
      icon: <MessageCircle size={16} />,
      aspectRatio: 940/788 
    },
    facebookCover: { 
      width: 820, 
      height: 312, 
      name: 'Facebook Cover', 
      icon: <Image size={16} />,
      aspectRatio: 820/312 
    },
    twitterPost: { 
      width: 1024, 
      height: 512, 
      name: 'Twitter Post', 
      icon: <Type size={16} />,
      aspectRatio: 2 
    },
    twitterHeader: { 
      width: 1500, 
      height: 500, 
      name: 'Twitter Header', 
      icon: <Maximize size={16} />,
      aspectRatio: 3 
    },
    linkedinPost: { 
      width: 1200, 
      height: 1200, 
      name: 'LinkedIn Post', 
      icon: <Users size={16} />,
      aspectRatio: 1 
    },
    linkedinBanner: { 
      width: 1584, 
      height: 396, 
      name: 'LinkedIn Banner', 
      icon: <Monitor size={16} />,
      aspectRatio: 4 
    },
    youtubeThumbnail: { 
      width: 1280, 
      height: 720, 
      name: 'YouTube Thumbnail', 
      icon: <Film size={16} />,
      aspectRatio: 16/9 
    },
    youtubeChannelArt: { 
      width: 2560, 
      height: 1440, 
      name: 'YouTube Channel Art', 
      icon: <Tv size={16} />,
      aspectRatio: 16/9 
    },
    tiktok: { 
      width: 1080, 
      height: 1920, 
      name: 'TikTok Video', 
      icon: <Music size={16} />,
      aspectRatio: 9/16 
    },
    snapchat: { 
      width: 1080, 
      height: 1920, 
      name: 'Snapchat', 
      icon: <Zap size={16} />,
      aspectRatio: 9/16 
    },
    a4Poster: { 
      width: 2480, 
      height: 3508, 
      name: 'A4 Poster', 
      icon: <FileText size={16} />,
      aspectRatio: 2480/3508 
    },
    a3Poster: { 
      width: 3508, 
      height: 4961, 
      name: 'A3 Poster', 
      icon: <Printer size={16} />,
      aspectRatio: 3508/4961 
    },
    a5Flyer: { 
      width: 1748, 
      height: 2480, 
      name: 'A5 Flyer', 
      icon: <Megaphone size={16} />,
      aspectRatio: 1748/2480 
    },
    businessCard: { 
      width: 1050, 
      height: 600, 
      name: 'Business Card', 
      icon: <CreditCard size={16} />,
      aspectRatio: 7/4 
    },
    invitationCard: { 
      width: 1200, 
      height: 1800, 
      name: 'Invitation Card', 
      icon: <Heart size={16} />,
      aspectRatio: 2/3 
    },
    brochure: { 
      width: 2480, 
      height: 3508, 
      name: 'Brochure', 
      icon: <BookOpen size={16} />,
      aspectRatio: 2480/3508 
    }
  };

  // Sticker options
  const stickerOptions = [
    { name: 'smile', icon: '😊' },
    { name: 'heart', icon: '❤️' },
    { name: 'star', icon: '⭐' },
    { name: 'flower', icon: '🌸' },
    { name: 'sun', icon: '☀️' },
    { name: 'moon', icon: '🌙' },
    { name: 'cloud', icon: '☁️' },
    { name: 'coffee', icon: '☕' },
    { name: 'music', icon: '🎵' },
    { name: 'camera', icon: '📷' },
    { name: 'rocket', icon: '🚀' },
    { name: 'car', icon: '🚗' }
  ];

  // Animation options
  const animations = {
    rise: { name: 'Rise', keyframes: 'rise' },
    pan: { name: 'Pan', keyframes: 'pan' },
    fade: { name: 'Fade', keyframes: 'fade' },
    bounce: { name: 'Bounce', keyframes: 'bounce' },
    typewriter: { name: 'Typewriter', keyframes: 'typewriter' },
    tumble: { name: 'Tumble', keyframes: 'tumble' },
    wipe: { name: 'Wipe', keyframes: 'wipe' },
    pop: { name: 'Pop', keyframes: 'pop' },
    zoomIn: { name: 'Zoom In', keyframes: 'zoomIn' },
    zoomOut: { name: 'Zoom Out', keyframes: 'zoomOut' },
    flip: { name: 'Flip', keyframes: 'flip' },
    flash: { name: 'Flash', keyframes: 'flash' },
    glitch: { name: 'Glitch', keyframes: 'glitch' },
    heartbeat: { name: 'Heartbeat', keyframes: 'heartbeat' },
    wiggle: { name: 'Wiggle', keyframes: 'wiggle' },
    jiggle: { name: 'Jiggle', keyframes: 'jiggle' },
    shake: { name: 'Shake', keyframes: 'shake' },
    colorShift: { name: 'Color Shift', keyframes: 'colorShift' },
    fadeOut: { name: 'Fade Out', keyframes: 'fadeOut' },
    slideInLeft: { name: 'Slide In Left', keyframes: 'slideInLeft' },
    slideInRight: { name: 'Slide In Right', keyframes: 'slideInRight' },
    slideInUp: { name: 'Slide In Up', keyframes: 'slideInUp' },
    slideInDown: { name: 'Slide In Down', keyframes: 'slideInDown' },
    slideOutLeft: { name: 'Slide Out Left', keyframes: 'slideOutLeft' },
    slideOutRight: { name: 'Slide Out Right', keyframes: 'slideOutRight' },
    spin: { name: 'Spin', keyframes: 'spin' },
    blurIn: { name: 'Blur In', keyframes: 'blurIn' },
    flicker: { name: 'Flicker', keyframes: 'flicker' },
    pulse: { name: 'Pulse', keyframes: 'pulse' },
    rotate: { name: 'Rotate', keyframes: 'rotate' }
  };

  // Filter options
  const filterOptions = {
    grayscale: { name: 'Grayscale', value: 0, max: 100, unit: '%' },
    blur: { name: 'Blur', value: 0, max: 10, unit: 'px' },
    brightness: { name: 'Brightness', value: 100, max: 200, unit: '%' },
    contrast: { name: 'Contrast', value: 100, max: 200, unit: '%' },
    saturate: { name: 'Saturate', value: 100, max: 200, unit: '%' },
    hueRotate: { name: 'Hue Rotate', value: 0, max: 360, unit: 'deg' },
    invert: { name: 'Invert', value: 0, max: 100, unit: '%' },
    sepia: { name: 'Sepia', value: 0, max: 100, unit: '%' },
    opacity: { name: 'Opacity', value: 100, max: 100, unit: '%' }
  };

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Set current page elements
  const setCurrentPageElements = useCallback((newElements) => {
    setPages(pages.map(page => 
      page.id === currentPage ? { ...page, elements: newElements } : page
    ));
  }, [pages, currentPage]);

  // Save to history
  const saveToHistory = useCallback((newElements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(newElements));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevElements = JSON.parse(history[historyIndex - 1]);
      setCurrentPageElements(prevElements);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setCurrentPageElements]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextElements = JSON.parse(history[historyIndex + 1]);
      setCurrentPageElements(nextElements);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setCurrentPageElements]);

  // Add element to canvas
  const addElement = useCallback((type, properties = {}) => {
    const currentElements = getCurrentPageElements();
    const newElement = {
      id: generateId(),
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 300 : type === 'line' ? 150 : 100, // Wider default for text
      height: type === 'text' ? 100 : type === 'line' ? 2 : 100, // Taller default for text
      rotation: 0,
      animation: null,
      zIndex: currentElements.length,
      locked: false,
      filters: JSON.parse(JSON.stringify(filterOptions)),
      fill: properties.fill || (type === 'rectangle' ? '#3b82f6' : 
                              type === 'circle' ? '#ef4444' : 
                              type === 'triangle' ? '#10b981' : 
                              type === 'star' ? '#f59e0b' : 
                              type === 'hexagon' ? '#8b5cf6' : '#3b82f6'),
      stroke: properties.stroke || (type === 'image' ? 'transparent' : '#000000'),
      strokeWidth: properties.strokeWidth || (type === 'image' ? 0 : 2),
      fillType: properties.fillType || 'solid',
      gradient: properties.gradient || {
        type: 'linear',
        colors: ['#3b82f6', '#ef4444'],
        stops: [0, 100],
        angle: 90,
        position: { x: 50, y: 50 }
      },
      textEffect: 'none',
      imageEffect: 'none',
      shapeEffect: 'none',
      specialEffect: 'none',
      effectSettings: {},
      borderRadius: properties.borderRadius || 0, // Ensure borderRadius is included
      shadow: properties.shadow || null, // Ensure shadow is included
      ...properties
    };

    if (type === 'text') {
      newElement.content = t('text.doubleClickToEdit');
      newElement.fontSize = 24;
      newElement.fontFamily = supportedLanguages[currentLanguage]?.font || 'Arial';
      newElement.fontWeight = 'normal';
      newElement.fontStyle = 'normal';
      newElement.textDecoration = 'none';
      newElement.color = '#000000';
      newElement.textAlign = textDirection === 'rtl' ? 'right' : 'left';
    } else if (type === 'rectangle') {
      newElement.borderRadius = properties.borderRadius || 0;
    } else if (type === 'image') {
      newElement.src = properties.src || '';
      newElement.borderRadius = properties.borderRadius || 0;
      // Ensure no stroke by default for images
      newElement.stroke = properties.stroke || 'transparent';
      newElement.strokeWidth = properties.strokeWidth || 0;
    } else if (type === 'line') {
      // Line specific properties
    } else if (type === 'arrow') {
      newElement.fill = '#000000';
    } else if (type === 'star') {
      newElement.points = 5;
    } else if (type === 'drawing') {
      newElement.stroke = '#000000';
      newElement.strokeWidth = 3;
      newElement.path = properties.path || [];
    } else if (type === 'sticker') {
      newElement.sticker = properties.sticker || 'smile';
      newElement.fill = properties.fill || '#f59e0b';
      newElement.width = 80;
      newElement.height = 80;
    }

    const newElements = [...currentElements, newElement];
    setCurrentPageElements(newElements);
    setSelectedElement(newElement.id);
    setSelectedElements(new Set([newElement.id]));
    setCurrentTool('select');
    saveToHistory(newElements);
  }, [getCurrentPageElements, setCurrentPageElements, saveToHistory, currentLanguage, textDirection, t]);

  // Apply template function with proper centering and auto-zoom
  const applyTemplate = useCallback((platform) => {
    if (platform === 'custom') {
      setShowCustomTemplateModal(true);
      return;
    }
    
    const template = socialMediaTemplates[platform];
    if (template) {
      // Set the new canvas size
      setCanvasSize({ width: template.width, height: template.height });
      
      // Center and zoom to fit after a short delay for DOM update
      setTimeout(() => {
        centerCanvas();
      }, 100);
      
      setShowTemplates(false);
    }
  }, [centerCanvas]);

  // Create custom template function with proper centering
  const createCustomTemplate = useCallback(() => {
    let width = customTemplateSize.width;
    let height = customTemplateSize.height;
    
    // Convert units to pixels if needed
    if (customTemplateSize.unit === 'in') {
      width = Math.round(width * 96); // 96 DPI
      height = Math.round(height * 96);
    } else if (customTemplateSize.unit === 'mm') {
      width = Math.round(width * 3.779527559); // 1mm = 3.78px
      height = Math.round(height * 3.779527559);
    } else if (customTemplateSize.unit === 'cm') {
      width = Math.round(width * 37.79527559); // 1cm = 37.8px
      height = Math.round(height * 37.79527559);
    }
    
    // Set minimum and maximum limits
    width = Math.max(100, Math.min(10000, width));
    height = Math.max(100, Math.min(10000, height));
    
    // Set the new canvas size
    setCanvasSize({ width, height });
    
    // Center and zoom to fit after a short delay for DOM update
    setTimeout(() => {
      centerCanvas();
    }, 100);
    
    setShowCustomTemplateModal(false);
    setShowTemplates(false);
  }, [customTemplateSize, centerCanvas]);

  // Auto-center on window resize
  useEffect(() => {
    const handleResize = () => {
      centerCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [centerCanvas]);

  // GradientPicker is now imported from components

  // Handle image upload
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

  // Update element properties
  const updateElement = useCallback((id, updates) => {
    const currentElements = getCurrentPageElements();
    const newElements = currentElements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setCurrentPageElements(newElements);
    saveToHistory(newElements);
  }, [getCurrentPageElements, setCurrentPageElements, saveToHistory]);

  // Delete element
  const deleteElement = useCallback((id) => {
    if (lockedElements.has(id)) return;
    
    const currentElements = getCurrentPageElements();
    const newElements = currentElements.filter(el => el.id !== id);
    setCurrentPageElements(newElements);
    if (selectedElement === id) setSelectedElement(null);
    const newSelected = new Set(selectedElements);
    newSelected.delete(id);
    setSelectedElements(newSelected);
    saveToHistory(newElements);
  }, [lockedElements, getCurrentPageElements, setCurrentPageElements, selectedElement, selectedElements, saveToHistory]);

  // Duplicate element
  const duplicateElement = useCallback((id) => {
    if (lockedElements.has(id)) return;
    
    const currentElements = getCurrentPageElements();
    const element = currentElements.find(el => el.id === id);
    if (element) {
      const duplicated = {
        ...element,
        id: generateId(),
        x: element.x + 20,
        y: element.y + 20,
        zIndex: currentElements.length
      };
      const newElements = [...currentElements, duplicated];
      setCurrentPageElements(newElements);
      setSelectedElement(duplicated.id);
      setSelectedElements(new Set([duplicated.id]));
      saveToHistory(newElements);
    }
  }, [lockedElements, getCurrentPageElements, setCurrentPageElements, saveToHistory]);

  // Toggle element lock
  const toggleElementLock = useCallback((id) => {
    const newLocked = new Set(lockedElements);
    if (newLocked.has(id)) {
      newLocked.delete(id);
      updateElement(id, { locked: false });
    } else {
      newLocked.add(id);
      updateElement(id, { locked: true });
    }
    setLockedElements(newLocked);
  }, [lockedElements, updateElement]);

  // Update filter value
  const updateFilter = useCallback((elementId, filterName, value) => {
    const currentElements = getCurrentPageElements();
    const element = currentElements.find(el => el.id === elementId);
    if (element) {
      const updatedFilters = { ...element.filters };
      if (updatedFilters[filterName]) {
        updatedFilters[filterName] = { ...updatedFilters[filterName], value };
        updateElement(elementId, { filters: updatedFilters });
      }
    }
  }, [getCurrentPageElements, updateElement]);

  // Get filter CSS string
  const getFilterCSS = useCallback((filters) => {
    if (!filters) return '';
    return Object.entries(filters)
      .map(([key, filter]) => {
        if ((filter && filter.value > 0) || (key === 'opacity' && filter.value < 100)) {
          return `${key}(${filter.value}${filter.unit})`;
        }
        return '';
      })
      .filter(Boolean)
      .join(' ');
  }, []);

  // Fixed getBackgroundStyle function
  const getBackgroundStyle = useCallback((element) => {
    if (!element) return '#3b82f6';
    
    // If element doesn't have gradient fill type or gradient data, return solid color
    if (element.fillType !== 'gradient' || !element.gradient) {
      return element.fill || '#3b82f6';
    }
    
    const grad = element.gradient;
    
    // Validate gradient data structure
    if (!grad.colors || !Array.isArray(grad.colors) || grad.colors.length === 0) {
      return element.fill || '#3b82f6';
    }
    
    // Validate and filter colors
    const validColors = grad.colors.filter(color => 
      color && typeof color === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(color)
    );
    
    if (validColors.length === 0) {
      return element.fill || '#3b82f6';
    }
    
    // Ensure we have valid stops
    const validStops = grad.stops || [];
    const stops = [];
    
    for (let i = 0; i < validColors.length; i++) {
      if (validStops[i] !== undefined && validStops[i] !== null) {
        stops[i] = Math.max(0, Math.min(100, parseInt(validStops[i]) || 0));
      } else {
        // Auto-generate stops if missing or invalid
        if (validColors.length === 1) {
          stops[i] = 0;
        } else {
          stops[i] = i === 0 ? 0 : (i === validColors.length - 1 ? 100 : Math.round((i / (validColors.length - 1)) * 100));
        }
      }
    }
    
    // Ensure stops are in correct order
    const colorStopPairs = validColors.map((color, i) => ({
      color,
      stop: stops[i] || 0
    })).sort((a, b) => a.stop - b.stop);
    
    // Build gradient string
    const colorStops = colorStopPairs.map(pair => 
      `${pair.color} ${pair.stop}%`
    ).join(', ');
    
    if (grad.type === 'radial') {
      const posX = (grad.position && grad.position.x !== undefined) ? grad.position.x : 50;
      const posY = (grad.position && grad.position.y !== undefined) ? grad.position.y : 50;
      return `radial-gradient(circle at ${posX}% ${posY}%, ${colorStops})`;
    } else {
      // Linear gradient (default)
      const angle = (grad.angle !== undefined && grad.angle !== null) ? grad.angle : 90;
      return `linear-gradient(${angle}deg, ${colorStops})`;
    }
  }, []);

  // Get canvas-compatible gradient for export
  const getCanvasGradient = useCallback((ctx, element) => {
    if (!element || element.fillType !== 'gradient' || !element.gradient) {
      return element.fill || '#3b82f6';
    }
    
    const grad = element.gradient;
    
    // Validate gradient data
    if (!grad.colors || !Array.isArray(grad.colors) || grad.colors.length === 0) {
      return element.fill || '#3b82f6';
    }
    
    // Validate and filter colors
    const validColors = grad.colors.filter(color => 
      color && typeof color === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(color)
    );
    
    if (validColors.length === 0) {
      return element.fill || '#3b82f6';
    }
    
    // Ensure we have valid stops
    const validStops = grad.stops || [];
    const stops = [];
    
    for (let i = 0; i < validColors.length; i++) {
      if (validStops[i] !== undefined && validStops[i] !== null) {
        stops[i] = Math.max(0, Math.min(100, parseInt(validStops[i]) || 0)) / 100;
      } else {
        if (validColors.length === 1) {
          stops[i] = 0;
        } else {
          stops[i] = i === 0 ? 0 : (i === validColors.length - 1 ? 1 : i / (validColors.length - 1));
        }
      }
    }
    
    let canvasGradient;
    
    if (grad.type === 'radial') {
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      const radius = Math.max(element.width, element.height) / 2;
      
      canvasGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    } else {
      // Linear gradient
      const angle = (grad.angle !== undefined && grad.angle !== null) ? grad.angle : 90;
      const angleRad = (angle - 90) * Math.PI / 180;
      
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      const length = Math.max(element.width, element.height);
      
      const x1 = centerX - Math.cos(angleRad) * length / 2;
      const y1 = centerY - Math.sin(angleRad) * length / 2;
      const x2 = centerX + Math.cos(angleRad) * length / 2;
      const y2 = centerY + Math.sin(angleRad) * length / 2;
      
      canvasGradient = ctx.createLinearGradient(x1, y1, x2, y2);
    }
    
    // Add color stops
    validColors.forEach((color, i) => {
      canvasGradient.addColorStop(stops[i], color);
    });
    
    return canvasGradient;
  }, []);

  // NEW: Get canvas-compatible effects
  const getCanvasEffects = useCallback((element) => {
    const effects = {
      shadow: {},
      filters: ''
    };
    
    // Text effects for canvas
    if (element.type === 'text' && element.textEffect && element.textEffect !== 'none') {
      switch(element.textEffect) {
        case 'shadow':
          effects.shadow = {
            color: 'rgba(0,0,0,0.5)',
            blur: 4,
            offsetX: 2,
            offsetY: 2
          };
          break;
        case 'lift':
          effects.shadow = {
            color: 'rgba(0,0,0,0.3)',
            blur: 8,
            offsetX: 0,
            offsetY: 4
          };
          break;
        case 'neon':
          effects.shadow = {
            color: '#ff00de',
            blur: 10,
            offsetX: 0,
            offsetY: 0
          };
          break;
        // Add other text effects...
      }
    }
    
    // Image effects for canvas
    if (element.type === 'image' && element.imageEffect && element.imageEffect !== 'none') {
      const effect = imageEffects[element.imageEffect];
      if (effect && effect.filter) {
        effects.filters += ' ' + effect.filter;
      }
    }
    
    // Shape effects for canvas
    if (['rectangle', 'circle', 'triangle', 'star', 'hexagon'].includes(element.type) && 
        element.shapeEffect && element.shapeEffect !== 'none') {
      switch(element.shapeEffect) {
        case 'shadow':
          effects.shadow = {
            color: 'rgba(0,0,0,0.3)',
            blur: 8,
            offsetX: 4,
            offsetY: 4
          };
          break;
        case 'glow':
          effects.shadow = {
            color: 'rgba(255,255,255,0.8)',
            blur: 10,
            offsetX: 0,
            offsetY: 0
          };
          break;
        // Add other shape effects...
      }
    }
    
    return effects;
  }, [imageEffects]);

  // Get effect CSS for an element
  const getEffectCSS = useCallback((element) => {
    let effectCSS = '';
    
    // Text effects
    if (element.type === 'text' && element.textEffect && element.textEffect !== 'none') {
      effectCSS += textEffects[element.textEffect]?.css || '';
    }
    
    // Image effects
    if (element.type === 'image' && element.imageEffect && element.imageEffect !== 'none') {
      effectCSS += imageEffects[element.imageEffect]?.filter ? `filter: ${imageEffects[element.imageEffect].filter};` : '';
    }
    
    // Shape effects
    if (['rectangle', 'circle', 'triangle', 'star', 'hexagon'].includes(element.type) && 
        element.shapeEffect && element.shapeEffect !== 'none') {
      effectCSS += shapeEffects[element.shapeEffect]?.css || '';
    }
    
    // Special effects for all elements
    if (element.specialEffect && element.specialEffect !== 'none') {
      effectCSS += specialEffects[element.specialEffect]?.css || '';
    }
    
    return effectCSS;
  }, []);

  // Group selected elements
  const groupElements = useCallback(() => {
    const currentElements = getCurrentPageElements();
    if (selectedElements.size < 2) return;
    
    const groupId = generateId();
    const selectedIds = Array.from(selectedElements);
    const selectedEls = currentElements.filter(el => selectedIds.includes(el.id));
    
    const minX = Math.min(...selectedEls.map(el => el.x));
    const minY = Math.min(...selectedEls.map(el => el.y));
    const maxX = Math.max(...selectedEls.map(el => el.x + el.width));
    const maxY = Math.max(...selectedEls.map(el => el.y + el.height));
    
    const group = {
      id: groupId,
      type: 'group',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      rotation: 0,
      children: selectedIds,
      zIndex: currentElements.length,
      fill: 'transparent',
      stroke: '#8b5cf6',
      strokeWidth: 2,
      strokeDasharray: '5,5'
    };
    
    const updatedElements = currentElements.map(el => {
      if (selectedIds.includes(el.id)) {
        return {
          ...el,
          groupId,
          relativeX: el.x - minX,
          relativeY: el.y - minY,
          relativeRotation: el.rotation || 0
        };
      }
      return el;
    });
    
    const newElements = [...updatedElements, group];
    setCurrentPageElements(newElements);
    setSelectedElement(groupId);
    setSelectedElements(new Set([groupId]));
    saveToHistory(newElements);
  }, [getCurrentPageElements, selectedElements, setCurrentPageElements, saveToHistory]);

  // Ungroup elements
  const ungroupElements = useCallback((groupId) => {
    const currentElements = getCurrentPageElements();
    const group = currentElements.find(el => el.id === groupId);
    if (!group || group.type !== 'group') return;
    
    const updatedElements = currentElements.map(el => {
      if (el.groupId === groupId) {
        const { groupId: _, relativeX, relativeY, relativeRotation, ...rest } = el;
        return {
          ...rest,
          x: group.x + (relativeX || 0),
          y: group.y + (relativeY || 0),
          rotation: (group.rotation || 0) + (relativeRotation || 0)
        };
      }
      return el;
    }).filter(el => el.id !== groupId);
    
    setCurrentPageElements(updatedElements);
    setSelectedElement(null);
    setSelectedElements(new Set());
    saveToHistory(updatedElements);
  }, [getCurrentPageElements, setCurrentPageElements, saveToHistory]);

  // Change element z-index
  const changeZIndex = useCallback((id, direction) => {
    if (lockedElements.has(id)) return;
    
    const currentElements = getCurrentPageElements();
    const elementIndex = currentElements.findIndex(el => el.id === id);
    if (elementIndex === -1) return;
    
    let newIndex;
    if (direction === 'front') {
      newIndex = currentElements.length - 1;
    } else if (direction === 'forward') {
      newIndex = Math.min(elementIndex + 1, currentElements.length - 1);
    } else if (direction === 'backward') {
      newIndex = Math.max(elementIndex - 1, 0);
    } else if (direction === 'back') {
      newIndex = 0;
    } else {
      return;
    }
    
    const newElements = [...currentElements];
    const [element] = newElements.splice(elementIndex, 1);
    newElements.splice(newIndex, 0, element);
    
    const updatedElements = newElements.map((el, idx) => ({
      ...el,
      zIndex: idx
    }));
    
    setCurrentPageElements(updatedElements);
    saveToHistory(updatedElements);
  }, [lockedElements, getCurrentPageElements, setCurrentPageElements, saveToHistory]);

  // Calculate alignment lines
  const calculateAlignmentLines = useCallback((movingElement) => {
    const currentElements = getCurrentPageElements();
    const lines = { vertical: [], horizontal: [] };
    const threshold = 5;

    currentElements.forEach(el => {
      if (el.id === movingElement.id || selectedElements.has(el.id) || lockedElements.has(el.id)) return;

      if (Math.abs(el.x - movingElement.x) < threshold) {
        lines.vertical.push(el.x);
      }
      if (Math.abs(el.x + el.width - movingElement.x) < threshold) {
        lines.vertical.push(el.x + el.width);
      }
      if (Math.abs(el.x - (movingElement.x + movingElement.width)) < threshold) {
        lines.vertical.push(el.x);
      }

      if (Math.abs(el.y - movingElement.y) < threshold) {
        lines.horizontal.push(el.y);
      }
      if (Math.abs(el.y + el.height - movingElement.y) < threshold) {
        lines.horizontal.push(el.y + el.height);
      }
      if (Math.abs(el.y - (movingElement.y + movingElement.height)) < threshold) {
        lines.horizontal.push(el.y);
      }
    });

    setAlignmentLines(lines);
  }, [selectedElements, getCurrentPageElements, lockedElements]);

  // Handle selection
  const handleSelectElement = useCallback((e, elementId) => {
    e.stopPropagation();
    
    const currentElements = getCurrentPageElements();
    const element = currentElements.find(el => el.id === elementId);
    
    if (!element) return;
    
    // If element is in a group, select the group instead
    if (element.groupId && !selectedElements.has(element.groupId)) {
      const groupElement = currentElements.find(el => el.id === element.groupId);
      if (groupElement && !lockedElements.has(groupElement.id)) {
        // Select the group instead of the individual element
        if (e.ctrlKey || e.metaKey) {
          const newSelected = new Set(selectedElements);
          if (newSelected.has(groupElement.id)) {
            newSelected.delete(groupElement.id);
          } else {
            newSelected.add(groupElement.id);
          }
          setSelectedElement(groupElement.id);
          setSelectedElements(newSelected);
        } else {
          setSelectedElement(groupElement.id);
          setSelectedElements(new Set([groupElement.id]));
        }
        return;
      }
    }
    
    if (lockedElements.has(elementId)) {
      setSelectedElement(elementId);
      setSelectedElements(new Set([elementId]));
      return;
    }
    
    if (e.ctrlKey || e.metaKey) {
      const newSelected = new Set(selectedElements);
      if (newSelected.has(elementId)) {
        newSelected.delete(elementId);
        if (newSelected.size === 0) {
          setSelectedElement(null);
        } else if (selectedElement === elementId) {
          setSelectedElement(Array.from(newSelected)[0]);
        }
      } else {
        newSelected.add(elementId);
        setSelectedElement(elementId);
      }
      setSelectedElements(newSelected);
    } else {
      setSelectedElement(elementId);
      setSelectedElements(new Set([elementId]));
    }
  }, [selectedElements, selectedElement, lockedElements, getCurrentPageElements]);

  // Handle drawing with pen tool
  const handleDrawing = useCallback((e) => {
    if (currentTool !== 'pen' || !isDrawing || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvasOffset.x) / zoomLevel;
    const y = (e.clientY - rect.top - canvasOffset.y) / zoomLevel;
    
    setDrawingPath(prev => [...prev, { x, y }]);
  }, [currentTool, isDrawing, zoomLevel, canvasOffset]);

  // Finish drawing and create a path element
  const finishDrawing = useCallback(() => {
    if (currentTool !== 'pen' || drawingPath.length === 0) return;
    
    addElement('drawing', { path: [...drawingPath] });
    setDrawingPath([]);
    setIsDrawing(false);
  }, [currentTool, drawingPath, addElement]);

  // Enhanced selection handles with corner pointers and center slots - FIXED VERSION
  const renderSelectionHandles = useCallback((element) => {
    if (!element || lockedElements.has(element.id)) return null;

    const handleSize = 12;
    const handleBorder = 2;
    const slotSize = 8;
    const connectionLineColor = '#8b5cf6';
    const handleColor = '#ffffff';
    const handleBorderColor = '#8b5cf6';

    const handles = [
      // Corner handles (white circles with purple border)
      { x: -handleSize/2, y: -handleSize/2, cursor: 'nw-resize', type: 'nw' },
      { x: element.width - handleSize/2, y: -handleSize/2, cursor: 'ne-resize', type: 'ne' },
      { x: -handleSize/2, y: element.height - handleSize/2, cursor: 'sw-resize', type: 'sw' },
      { x: element.width - handleSize/2, y: element.height - handleSize/2, cursor: 'se-resize', type: 'se' },
      
      // Center slot handles (purple slots)
      { x: element.width/2 - slotSize/2, y: -slotSize/2, cursor: 'n-resize', type: 'n', isSlot: true },
      { x: element.width/2 - slotSize/2, y: element.height - slotSize/2, cursor: 's-resize', type: 's', isSlot: true },
      { x: -slotSize/2, y: element.height/2 - slotSize/2, cursor: 'w-resize', type: 'w', isSlot: true },
      { x: element.width - slotSize/2, y: element.height/2 - slotSize/2, cursor: 'e-resize', type: 'e', isSlot: true }
    ];

    const handleMouseDown = (e, action, direction = '') => {
      e.stopPropagation();
      e.preventDefault();
      
      if (action === 'resize') {
        setIsResizing(true);
        // setResizeDirection(direction);
        
        const rect = canvasRef.current.getBoundingClientRect();
        setDragStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          elementX: element.x,
          elementY: element.y,
          elementWidth: element.width,
          elementHeight: element.height,
          elementRotation: element.rotation,
          resizeDirection: direction
        });
      } else if (action === 'rotate') {
        setIsRotating(true);
        
        const rect = canvasRef.current.getBoundingClientRect();
        setDragStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          elementX: element.x,
          elementY: element.y,
          elementWidth: element.width,
          elementHeight: element.height,
          elementRotation: element.rotation
        });
      }
    };

    const selectionBoxStyle = {
      position: 'absolute',
      left: element.x - 10,
      top: element.y - 10,
      width: element.width + 20,
      height: element.height + 20,
      pointerEvents: 'none',
      transform: `rotate(${element.rotation || 0}deg)`,
      zIndex: element.zIndex + 1000
    };

    const selectionBorderStyle = {
      position: 'absolute',
      left: 10,
      top: 10,
      width: element.width,
      height: element.height,
      border: `2px dashed ${connectionLineColor}`,
      borderRadius: '2px',
      pointerEvents: 'none'
    };

    return (
      <div
        className={styles.selectionBox || ''}
        style={selectionBoxStyle}
      >
        {/* Selection border */}
        <div style={selectionBorderStyle} />

        {/* Handles */}
        {handles.map((handle, index) => {
          const handleStyle = {
            position: 'absolute',
            left: handle.x + 10,
            top: handle.y + 10,
            width: handle.isSlot ? slotSize : handleSize,
            height: handle.isSlot ? slotSize : handleSize,
            backgroundColor: handle.isSlot ? connectionLineColor : handleColor,
            border: handle.isSlot ? 'none' : `${handleBorder}px solid ${handleBorderColor}`,
            borderRadius: handle.isSlot ? '1px' : '50%',
            cursor: handle.cursor,
            pointerEvents: 'auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          };
          
          return (
            <div
              key={index}
              className={styles.resizeHandle || ''}
              style={handleStyle}
              onMouseDown={(e) => handleMouseDown(e, 'resize', handle.type)}
            />
          );
        })}

        {/* Rotate handle */}
        <div
          className={styles.rotateHandle || ''}
          style={{
            position: 'absolute',
            top: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            width: handleSize,
            height: handleSize,
            backgroundColor: '#ef4444',
            border: `2px solid #ffffff`,
            borderRadius: '50%',
            cursor: 'grab',
            pointerEvents: 'auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
          onMouseDown={(e) => handleMouseDown(e, 'rotate')}
        />

        {/* Connection line to rotate handle */}
        <svg
          style={{
            position: 'absolute',
            top: -25,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 2,
            height: 15,
            pointerEvents: 'none'
          }}
        >
          <line x1="1" y1="0" x2="1" y2="15" stroke="#ef4444" strokeWidth="2" />
        </svg>
      </div>
    );
  }, [lockedElements]);

  // Enhanced mouse down handler with resize direction - FIXED VERSION
  const handleMouseDown = useCallback((e, elementId, action = 'drag', direction = '') => {
    e.stopPropagation();
    e.preventDefault();
    
    const currentElements = getCurrentPageElements();
    const element = currentElements.find(el => el.id === elementId);
    if (!element) return;

    // If element is in a group, use the group for operations
    const targetElement = element.groupId 
      ? currentElements.find(el => el.id === element.groupId) 
      : element;
    
    if (!targetElement || (lockedElements.has(targetElement.id) && action !== 'select')) return;

    handleSelectElement(e, targetElement.id);
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    if (action === 'drag' && !lockedElements.has(targetElement.id)) {
      setIsDragging(true);
      setShowAlignmentLines(true);
    } else if (action === 'resize' && !lockedElements.has(targetElement.id)) {
      setIsResizing(true);
      // setResizeDirection(direction);
    } else if (action === 'rotate' && !lockedElements.has(targetElement.id)) {
      setIsRotating(true);
    }

    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      elementX: targetElement.x,
      elementY: targetElement.y,
      elementWidth: targetElement.width,
      elementHeight: targetElement.height,
      elementRotation: targetElement.rotation,
      resizeDirection: direction
    });
  }, [getCurrentPageElements, lockedElements, handleSelectElement]);

  // Enhanced mouse move handler with directional resizing - FIXED VERSION
  const handleMouseMove = useCallback((e) => {
    if (!canvasRef.current) return;

    if (currentTool === 'pen' && isDrawing) {
      handleDrawing(e);
      return;
    }

    if (!selectedElement || (!isDragging && !isResizing && !isRotating && !isPanning)) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - canvasOffset.x) / zoomLevel;
    const mouseY = (e.clientY - rect.top - canvasOffset.y) / zoomLevel;
    
    if (isPanning) {
      setCanvasOffset({
        x: canvasOffset.x + e.movementX,
        y: canvasOffset.y + e.movementY
      });
      return;
    }
    
    const currentElements = getCurrentPageElements();
    const element = currentElements.find(el => el.id === selectedElement);
    if (!element) return;
    
    // Handle group movement
    if (element.type === 'group' && isDragging) {
      const deltaX = mouseX - dragStart.x;
      const deltaY = mouseY - dragStart.y;
      
      let newX = dragStart.elementX + deltaX;
      let newY = dragStart.elementY + deltaY;
      
      if (snapToGrid) {
        newX = Math.round(newX / 10) * 10;
        newY = Math.round(newY / 10) * 10;
      }
      
      // Move all children of the group
      const newElements = currentElements.map(el => {
        if (el.groupId === selectedElement) {
          return {
            ...el,
            x: newX + (el.relativeX || 0),
            y: newY + (el.relativeY || 0)
          };
        } else if (el.id === selectedElement) {
          return {
            ...el,
            x: newX,
            y: newY
          };
        }
        return el;
      });
      
      setCurrentPageElements(newElements);
      saveToHistory(newElements);
      calculateAlignmentLines({ ...element, x: newX, y: newY });
    } else if (isDragging) {
      const deltaX = mouseX - dragStart.x;
      const deltaY = mouseY - dragStart.y;
      
      let newX = dragStart.elementX + deltaX;
      let newY = dragStart.elementY + deltaY;
      
      if (snapToGrid) {
        newX = Math.round(newX / 10) * 10;
        newY = Math.round(newY / 10) * 10;
      }
      
      if (selectedElements.size === 1) {
        updateElement(selectedElement, { x: newX, y: newY });
        calculateAlignmentLines({ ...element, x: newX, y: newY });
      } else {
        const deltaMoveX = newX - element.x;
        const deltaMoveY = newY - element.y;
        
        const newElements = currentElements.map(el => {
          if (selectedElements.has(el.id) && !lockedElements.has(el.id)) {
            return {
              ...el,
              x: el.x + deltaMoveX,
              y: el.y + deltaMoveY
            };
          }
          return el;
        });
        
        setCurrentPageElements(newElements);
        saveToHistory(newElements);
      }
    } else if (isResizing) {
      const deltaX = mouseX - dragStart.x;
      const deltaY = mouseY - dragStart.y;
      
      let newX = dragStart.elementX;
      let newY = dragStart.elementY;
      let newWidth = dragStart.elementWidth;
      let newHeight = dragStart.elementHeight;

      switch (dragStart.resizeDirection) {
        case 'nw':
          newX = dragStart.elementX + deltaX;
          newY = dragStart.elementY + deltaY;
          newWidth = Math.max(20, dragStart.elementWidth - deltaX);
          newHeight = Math.max(20, dragStart.elementHeight - deltaY);
          break;
        case 'ne':
          newY = dragStart.elementY + deltaY;
          newWidth = Math.max(20, dragStart.elementWidth + deltaX);
          newHeight = Math.max(20, dragStart.elementHeight - deltaY);
          break;
        case 'sw':
          newX = dragStart.elementX + deltaX;
          newWidth = Math.max(20, dragStart.elementWidth - deltaX);
          newHeight = Math.max(20, dragStart.elementHeight + deltaY);
          break;
        case 'se':
          newWidth = Math.max(20, dragStart.elementWidth + deltaX);
          newHeight = Math.max(20, dragStart.elementHeight + deltaY);
          break;
        case 'n':
          newY = dragStart.elementY + deltaY;
          newHeight = Math.max(20, dragStart.elementHeight - deltaY);
          break;
        case 's':
          newHeight = Math.max(20, dragStart.elementHeight + deltaY);
          break;
        case 'w':
          newX = dragStart.elementX + deltaX;
          newWidth = Math.max(20, dragStart.elementWidth - deltaX);
          break;
        case 'e':
          newWidth = Math.max(20, dragStart.elementWidth + deltaX);
          break;
        default:
          // No resize direction specified
          break;
      }

      updateElement(selectedElement, { 
        x: newX, 
        y: newY, 
        width: newWidth, 
        height: newHeight 
      });
    } else if (isRotating) {
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;
      updateElement(selectedElement, { rotation: angle });
    }
  }, [selectedElement, isDragging, isResizing, isRotating, isPanning, dragStart, getCurrentPageElements, calculateAlignmentLines, zoomLevel, canvasOffset, selectedElements, snapToGrid, updateElement, saveToHistory, currentTool, isDrawing, handleDrawing, lockedElements]);

  const handleMouseUp = useCallback(() => {
    if (currentTool === 'pen' && isDrawing) {
      finishDrawing();
    }
    
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setIsPanning(false);
    setShowAlignmentLines(false);
    setAlignmentLines({ vertical: [], horizontal: [] });
    // setResizeDirection('');
  }, [currentTool, isDrawing, finishDrawing]);

  // Canvas panning
  const handleCanvasMouseDown = useCallback((e) => {
    if (currentTool === 'pen') {
      setIsDrawing(true);
      setDrawingPath([]);
      return;
    }
    
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      return;
    }
    
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
      setSelectedElements(new Set());
      setTextEditing(null);
    }
  }, [currentTool]);

  // Handle text editing
  const handleTextEdit = useCallback((e, elementId) => {
    if (lockedElements.has(elementId)) return;
    
    e.stopPropagation();
    setTextEditing(elementId);
    setSelectedElement(elementId);
    setSelectedElements(new Set([elementId]));
    
    setTimeout(() => {
      const element = document.getElementById(`element-${elementId}`);
      if (element) {
        element.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        
        if (element.childNodes.length > 0) {
          range.setStart(element, element.childNodes.length);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }, 0);
  }, [lockedElements]);

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

  // Add new page
  const addNewPage = useCallback(() => {
    const newPageId = `page-${pages.length + 1}`;
    setPages([...pages, { id: newPageId, name: `Page ${pages.length + 1}`, elements: [] }]);
    setCurrentPage(newPageId);
    setSelectedElement(null);
    setSelectedElements(new Set());
  }, [pages]);

  // Delete current page
  const deleteCurrentPage = useCallback(() => {
    if (pages.length <= 1) return;
    const newPages = pages.filter(page => page.id !== currentPage);
    setPages(newPages);
    setCurrentPage(newPages[0].id);
    setSelectedElement(null);
    setSelectedElements(new Set());
  }, [pages, currentPage]);

  // Rename current page
  const renameCurrentPage = useCallback(() => {
    const newName = prompt('Enter new page name:', pages.find(p => p.id === currentPage)?.name || 'Page');
    if (newName) {
      setPages(pages.map(page => 
        page.id === currentPage ? { ...page, name: newName } : page
      ));
    }
  }, [pages, currentPage]);

  // Play animations
  const playAnimations = useCallback(() => {
    setIsPlaying(true);
    const currentElements = getCurrentPageElements();
    currentElements.forEach((element, index) => {
      if (element.animation) {
        const elementDOM = document.getElementById(`element-${element.id}`);
        if (elementDOM) {
          elementDOM.style.animation = 'none';
          setTimeout(() => {
            elementDOM.style.animation = `${element.animation} 1s ease-out forwards`;
          }, index * 200);
        }
      }
    });
    
    setTimeout(() => setIsPlaying(false), currentElements.length * 200 + 1000);
  }, [getCurrentPageElements]);

  // Reset animations
  const resetAnimations = useCallback(() => {
    const currentElements = getCurrentPageElements();
    currentElements.forEach(element => {
      const elementDOM = document.getElementById(`element-${element.id}`);
      if (elementDOM) {
        elementDOM.style.animation = 'none';
      }
    });
    setIsPlaying(false);
  }, [getCurrentPageElements]);

  // Preload images for recording
  const preloadImages = useCallback(() => {
    const currentElements = getCurrentPageElements();
    const imageElements = currentElements.filter(el => el.type === 'image');
    
    return Promise.all(
      imageElements.map(element => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.src = element.src;
          img.onload = resolve;
          img.onerror = reject;
        });
      })
    );
  }, [getCurrentPageElements]);

  // Enhanced drawElementToCanvas function with effects support - FIXED VERSION
  const drawElementToCanvas = useCallback((ctx, element, time, elementIndex) => {
    ctx.save();
    
    let translateX = 0;
    let translateY = 0;
    let scale = 1;
    let rotation = element.rotation || 0;
    let opacity = 1;
    
    if (element.animation && time !== undefined) {
      const staggeredTime = Math.max(0, time - (elementIndex * 0.2));
      const animTime = Math.min(Math.max(staggeredTime, 0), 1);
      
      if (animTime > 0 && animTime <= 1) {
        switch (element.animation) {
          case 'rise':
            translateY = -100 * (1 - animTime);
            opacity = animTime;
            break;
          case 'pan':
            translateX = -100 * (1 - animTime);
            opacity = animTime;
            break;
          case 'fade':
            opacity = animTime;
            break;
          case 'bounce':
            translateY = -50 * Math.sin(animTime * Math.PI * 2);
            opacity = animTime;
            break;
          case 'zoomIn':
            scale = 0.3 + 0.7 * animTime;
            opacity = animTime;
            break;
          case 'zoomOut':
            scale = 2 - 1 * animTime;
            opacity = animTime;
            break;
          case 'slideInLeft':
            translateX = -200 * (1 - animTime);
            opacity = animTime;
            break;
          case 'slideInRight':
            translateX = 200 * (1 - animTime);
            opacity = animTime;
            break;
          case 'slideInUp':
            translateY = -200 * (1 - animTime);
            opacity = animTime;
            break;
          case 'slideInDown':
            translateY = 200 * (1 - animTime);
            opacity = animTime;
            break;
          case 'spin':
            rotation += 360 * animTime;
            opacity = animTime;
            break;
          case 'pulse':
            scale = 1 + 0.2 * Math.sin(animTime * Math.PI * 4);
            opacity = animTime;
            break;
          case 'typewriter':
            opacity = animTime;
            break;
          case 'tumble':
            rotation = 180 * (1 - animTime);
            scale = animTime;
            opacity = animTime;
            break;
          case 'wipe':
            opacity = animTime;
            break;
          case 'pop':
            scale = animTime < 0.8 ? (0.3 + 0.7 * (animTime / 0.8) * 1.2) : (1 - (animTime - 0.8) / 0.2 * 0.2);
            opacity = animTime;
            break;
          case 'flip':
            rotation = 90 * (1 - animTime);
            opacity = animTime;
            break;
          case 'flash':
            opacity = Math.sin(animTime * Math.PI * 4) > 0 ? 1 : 0.3;
            break;
          case 'glitch':
            translateX = (Math.sin(animTime * Math.PI * 8) * 5);
            translateY = (Math.cos(animTime * Math.PI * 6) * 3);
            break;
          case 'heartbeat':
            scale = 1 + 0.1 * Math.sin(animTime * Math.PI * 6);
            opacity = animTime;
            break;
          case 'wiggle':
            rotation = 5 * Math.sin(animTime * Math.PI * 4);
            opacity = animTime;
            break;
          case 'jiggle':
            translateX = 2 * Math.sin(animTime * Math.PI * 8);
            translateY = 2 * Math.cos(animTime * Math.PI * 6);
            opacity = animTime;
            break;
          case 'shake':
            translateX = 10 * Math.sin(animTime * Math.PI * 10);
            opacity = animTime;
            break;
          case 'fadeOut':
            opacity = 1 - animTime;
            break;
          case 'slideOutLeft':
            translateX = -200 * animTime;
            opacity = 1 - animTime;
            break;
          case 'slideOutRight':
            translateX = 200 * animTime;
            opacity = 1 - animTime;
            break;
          case 'blurIn':
            opacity = animTime;
            break;
          case 'flicker':
            opacity = 0.3 + 0.7 * Math.sin(animTime * Math.PI * 8);
            break;
          case 'rotate':
            rotation = 360 * animTime;
            opacity = animTime;
            break;
          default:
            opacity = animTime;
            break;
        }
      } else {
        if (staggeredTime < 0) {
          opacity = 0;
        } else if (staggeredTime > 1) {
          opacity = 1;
        }
      }
    }
    
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    ctx.translate(translateX, translateY);
    
    // Apply canvas effects
    const canvasEffects = getCanvasEffects(element);
    
    // Apply shadow effects
    if (canvasEffects.shadow && Object.keys(canvasEffects.shadow).length > 0) {
      ctx.shadowColor = canvasEffects.shadow.color;
      ctx.shadowBlur = canvasEffects.shadow.blur || 0;
      ctx.shadowOffsetX = canvasEffects.shadow.offsetX || 0;
      ctx.shadowOffsetY = canvasEffects.shadow.offsetY || 0;
    }
    
    // Apply filters
    if (element.filters) {
      const filterCSS = getFilterCSS(element.filters);
      if (filterCSS) {
        ctx.filter = filterCSS;
      }
    }
    
    // Add image effect filters
    if (canvasEffects.filters) {
      ctx.filter += ' ' + canvasEffects.filters;
    }
    
    ctx.globalAlpha = opacity;
    
    const backgroundStyle = getCanvasGradient(ctx, element);
    
    // FIXED: Rectangle with proper border radius handling
    if (element.type === 'rectangle') {
      ctx.fillStyle = backgroundStyle;
      ctx.strokeStyle = element.stroke;
      ctx.lineWidth = element.strokeWidth;
      
      const borderRadius = element.borderRadius || 0;
      
      if (borderRadius > 0) {
        // Use roundRect for browsers that support it
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(element.x, element.y, element.width, element.height, borderRadius);
          ctx.fill();
          if (element.strokeWidth > 0) ctx.stroke();
        } else {
          // Fallback for browsers without roundRect
          ctx.beginPath();
          ctx.moveTo(element.x + borderRadius, element.y);
          ctx.lineTo(element.x + element.width - borderRadius, element.y);
          ctx.arcTo(element.x + element.width, element.y, element.x + element.width, element.y + borderRadius, borderRadius);
          ctx.lineTo(element.x + element.width, element.y + element.height - borderRadius);
          ctx.arcTo(element.x + element.width, element.y + element.height, element.x + element.width - borderRadius, element.y + element.height, borderRadius);
          ctx.lineTo(element.x + borderRadius, element.y + element.height);
          ctx.arcTo(element.x, element.y + element.height, element.x, element.y + element.height - borderRadius, borderRadius);
          ctx.lineTo(element.x, element.y + borderRadius);
          ctx.arcTo(element.x, element.y, element.x + borderRadius, element.y, borderRadius);
          ctx.closePath();
          ctx.fill();
          if (element.strokeWidth > 0) ctx.stroke();
        }
      } else {
        // No border radius
        ctx.fillRect(element.x, element.y, element.width, element.height);
        if (element.strokeWidth > 0) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
        }
      }
    } else if (element.type === 'circle') {
      ctx.fillStyle = backgroundStyle;
      ctx.strokeStyle = element.stroke;
      ctx.lineWidth = element.strokeWidth;
      ctx.beginPath();
      ctx.arc(element.x + element.width / 2, element.y + element.height / 2, element.width / 2, 0, Math.PI * 2);
      ctx.fill();
      if (element.strokeWidth > 0) ctx.stroke();
    } else if (element.type === 'triangle') {
      ctx.fillStyle = backgroundStyle;
      ctx.strokeStyle = element.stroke;
      ctx.lineWidth = element.strokeWidth;
      ctx.beginPath();
      ctx.moveTo(element.x + element.width / 2, element.y);
      ctx.lineTo(element.x + element.width, element.y + element.height);
      ctx.lineTo(element.x, element.y + element.height);
      ctx.closePath();
      ctx.fill();
      if (element.strokeWidth > 0) ctx.stroke();
    } else if (element.type === 'text') {
      ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
      ctx.fillStyle = element.color;
      ctx.textAlign = element.textAlign;
      ctx.textBaseline = 'top'; // Add this for better text positioning
      
      let textX = element.x;
      if (element.textAlign === 'center') {
        textX = element.x + element.width / 2;
      } else if (element.textAlign === 'right') {
        textX = element.x + element.width;
      }
      
      let displayText = element.content;
      if (element.animation === 'typewriter' && time !== undefined) {
        const staggeredTime = Math.max(0, time - (elementIndex * 0.2));
        const animTime = Math.min(Math.max(staggeredTime, 0), 1);
        const charsToShow = Math.floor(element.content.length * animTime);
        displayText = element.content.substring(0, charsToShow);
      }
      
      // FIXED: Handle text wrapping for canvas
      const words = displayText.split(' ');
      const lineHeight = element.fontSize * 1.2;
      let line = '';
      let y = element.y;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > element.width && n > 0) {
          ctx.fillText(line, textX, y);
          line = words[n] + ' ';
          y += lineHeight;
          
          // Stop if we exceed the element height
          if (y > element.y + element.height - lineHeight) {
            break;
          }
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, textX, y);
      
      // Reset shadow for text
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } else if (element.type === 'image') {
      const img = new window.Image();
      img.src = element.src;
      
      // Handle border radius for images - FIXED: Remove stroke unless explicitly set
      const borderRadius = element.borderRadius || 0;
      
      if (borderRadius > 0) {
        // Create rounded clipping path
        ctx.save();
        ctx.beginPath();
        
        if (ctx.roundRect) {
          ctx.roundRect(element.x, element.y, element.width, element.height, borderRadius);
        } else {
          // Fallback for browsers without roundRect
          ctx.moveTo(element.x + borderRadius, element.y);
          ctx.lineTo(element.x + element.width - borderRadius, element.y);
          ctx.arcTo(element.x + element.width, element.y, element.x + element.width, element.y + borderRadius, borderRadius);
          ctx.lineTo(element.x + element.width, element.y + element.height - borderRadius);
          ctx.arcTo(element.x + element.width, element.y + element.height, element.x + element.width - borderRadius, element.y + element.height, borderRadius);
          ctx.lineTo(element.x + borderRadius, element.y + element.height);
          ctx.arcTo(element.x, element.y + element.height, element.x, element.y + element.height - borderRadius, borderRadius);
          ctx.lineTo(element.x, element.y + borderRadius);
          ctx.arcTo(element.x, element.y, element.x + borderRadius, element.y, borderRadius);
        }
        
        ctx.closePath();
        ctx.clip();
        
        ctx.drawImage(img, element.x, element.y, element.width, element.height);
        ctx.restore();
        
        // ONLY draw border if strokeWidth is explicitly set and greater than 0
        if (element.strokeWidth > 0 && element.stroke && element.stroke !== 'transparent') {
          ctx.strokeStyle = element.stroke;
          ctx.lineWidth = element.strokeWidth;
          ctx.beginPath();
          
          if (ctx.roundRect) {
            ctx.roundRect(element.x, element.y, element.width, element.height, borderRadius);
          } else {
            ctx.moveTo(element.x + borderRadius, element.y);
            ctx.lineTo(element.x + element.width - borderRadius, element.y);
            ctx.arcTo(element.x + element.width, element.y, element.x + element.width, element.y + borderRadius, borderRadius);
            ctx.lineTo(element.x + element.width, element.y + element.height - borderRadius);
            ctx.arcTo(element.x + element.width, element.y + element.height, element.x + element.width - borderRadius, element.y + element.height, borderRadius);
            ctx.lineTo(element.x + borderRadius, element.y + element.height);
            ctx.arcTo(element.x, element.y + element.height, element.x, element.y + element.height - borderRadius, borderRadius);
            ctx.lineTo(element.x, element.y + borderRadius);
            ctx.arcTo(element.x, element.y, element.x + borderRadius, element.y, borderRadius);
          }
          
          ctx.closePath();
          ctx.stroke();
        }
      } else {
        // No border radius - simple draw
        ctx.drawImage(img, element.x, element.y, element.width, element.height);
        
        // ONLY draw border if strokeWidth is explicitly set and greater than 0
        if (element.strokeWidth > 0 && element.stroke && element.stroke !== 'transparent') {
          ctx.strokeStyle = element.stroke;
          ctx.lineWidth = element.strokeWidth;
          ctx.strokeRect(element.x, element.y, element.width, element.height);
        }
      }
    } else if (element.type === 'line') {
      ctx.strokeStyle = element.stroke;
      ctx.lineWidth = element.strokeWidth;
      ctx.beginPath();
      ctx.moveTo(element.x, element.y);
      ctx.lineTo(element.x + element.width, element.y + element.height);
      ctx.stroke();
    } else if (element.type === 'arrow') {
      ctx.strokeStyle = element.stroke;
      ctx.lineWidth = element.strokeWidth;
      ctx.beginPath();
      ctx.moveTo(element.x, element.y + element.height / 2);
      ctx.lineTo(element.x + element.width - 10, element.y + element.height / 2);
      ctx.stroke();
      
      ctx.fillStyle = element.stroke;
      ctx.beginPath();
      ctx.moveTo(element.x + element.width - 10, element.y + element.height / 2);
      ctx.lineTo(element.x + element.width - 20, element.y + element.height / 2 - 5);
      ctx.lineTo(element.x + element.width - 20, element.y + element.height / 2 + 5);
      ctx.closePath();
      ctx.fill();
    } else if (element.type === 'star') {
      const points = element.points || 5;
      const outerRadius = Math.min(element.width, element.height) / 2;
      const innerRadius = outerRadius / 2;
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      
      ctx.fillStyle = backgroundStyle;
      ctx.strokeStyle = element.stroke;
      ctx.lineWidth = element.strokeWidth;
      ctx.beginPath();
      
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.fill();
      if (element.strokeWidth > 0) ctx.stroke();
    } else if (element.type === 'hexagon') {
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      const radius = Math.min(element.width, element.height) / 2;
      
      ctx.fillStyle = backgroundStyle;
      ctx.strokeStyle = element.stroke;
      ctx.lineWidth = element.strokeWidth;
      ctx.beginPath();
      
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 - Math.PI / 6;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.fill();
      if (element.strokeWidth > 0) ctx.stroke();
    } else if (element.type === 'drawing' && element.path.length > 1) {
      ctx.strokeStyle = element.stroke;
      ctx.lineWidth = element.strokeWidth;
      ctx.beginPath();
      ctx.moveTo(element.path[0].x, element.path[0].y);
      
      for (let i = 1; i < element.path.length; i++) {
        ctx.lineTo(element.path[i].x, element.path[i].y);
      }
      
      ctx.stroke();
    } else if (element.type === 'sticker') {
      ctx.fillStyle = backgroundStyle;
      ctx.beginPath();
      ctx.arc(element.x + element.width / 2, element.y + element.height / 2, element.width / 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      let iconChar = '⭐';
      if (element.sticker === 'smile') iconChar = '😊';
      else if (element.sticker === 'heart') iconChar = '❤️';
      else if (element.sticker === 'star') iconChar = '⭐';
      else if (element.sticker === 'flower') iconChar = '🌸';
      else if (element.sticker === 'sun') iconChar = '☀️';
      else if (element.sticker === 'moon') iconChar = '🌙';
      else if (element.sticker === 'cloud') iconChar = '☁️';
      else if (element.sticker === 'coffee') iconChar = '☕';
      else if (element.sticker === 'music') iconChar = '🎵';
      else if (element.sticker === 'camera') iconChar = '📷';
      else if (element.sticker === 'rocket') iconChar = '🚀';
      else if (element.sticker === 'car') iconChar = '🚗';
      
      ctx.fillText(iconChar, element.x + element.width / 2, element.y + element.height / 2);
    }
    
    ctx.restore();
  }, [getFilterCSS, getCanvasGradient, getCanvasEffects, imageEffects]);

  // Export as SVG
  const exportAsSVG = useCallback(() => {
    const currentElements = getCurrentPageElements();
    
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${canvasSize.width}" height="${canvasSize.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="100%" height="100%" fill="white"/>
  <defs>`;
    
    // Add gradient definitions
    currentElements.forEach((element, idx) => {
      if (element.fillType === 'gradient' && element.gradient) {
        const grad = element.gradient;
        if (grad.type === 'linear') {
          svgContent += `
    <linearGradient id="gradient-${idx}" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(${grad.angle || 90} 0.5 0.5)">`;
          grad.colors.forEach((color, i) => {
            svgContent += `
      <stop offset="${grad.stops[i]}%" style="stop-color:${color};stop-opacity:1" />`;
          });
          svgContent += `
    </linearGradient>`;
        } else {
          svgContent += `
    <radialGradient id="gradient-${idx}" cx="${grad.position?.x || 50}%" cy="${grad.position?.y || 50}%">`;
          grad.colors.forEach((color, i) => {
            svgContent += `
      <stop offset="${grad.stops[i]}%" style="stop-color:${color};stop-opacity:1" />`;
          });
          svgContent += `
    </radialGradient>`;
        }
      }
    });
    
    svgContent += `
  </defs>
  `;
    
    // Add elements
    currentElements.forEach((element, idx) => {
      const transform = `rotate(${element.rotation || 0} ${element.x + element.width/2} ${element.y + element.height/2})`;
      const fill = element.fillType === 'gradient' ? `url(#gradient-${idx})` : element.fill;
      
      if (element.type === 'rectangle') {
        svgContent += `
  <rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" 
        fill="${fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" 
        rx="${element.borderRadius || 0}" transform="${transform}"/>`;
      } else if (element.type === 'circle') {
        svgContent += `
  <circle cx="${element.x + element.width/2}" cy="${element.y + element.height/2}" r="${element.width/2}" 
          fill="${fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" 
          transform="${transform}"/>`;
      } else if (element.type === 'text') {
        svgContent += `
  <text x="${element.x}" y="${element.y + element.fontSize}" 
        font-family="${element.fontFamily}" font-size="${element.fontSize}" 
        fill="${element.color}" text-anchor="${element.textAlign === 'center' ? 'middle' : element.textAlign === 'right' ? 'end' : 'start'}" 
        transform="${transform}">${element.content}</text>`;
      }
    });
    
    svgContent += `
</svg>`;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sowntra-design.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [canvasSize, getCurrentPageElements, getBackgroundStyle]);

  // Export as image - FIXED VERSION with proper zIndex sorting
  const exportAsImage = useCallback((format) => {
    // Handle SVG export separately
    if (format === 'svg') {
      exportAsSVG();
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Could not get canvas context');
      alert('Error: Could not create canvas context');
      return;
    }
    
    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    // FIXED: Use the proper sorting function for correct zIndex layering
    const sortedElements = getSortedElementsForExport();
    
    const imageElements = sortedElements.filter(el => el.type === 'image');
    
    if (imageElements.length > 0) {
      let loadedImages = 0;
      const totalImages = imageElements.length;
      
      const drawAllElements = () => {
        try {
          // Clear and redraw background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
          
          // Draw ALL elements in correct zIndex order
          sortedElements.forEach((element, index) => {
            try {
              drawElementToCanvas(ctx, element, undefined, index);
            } catch (elementError) {
              console.error(`Error drawing element ${element.id}:`, elementError);
            }
          });
          
          // Export the final canvas
          const dataUrl = canvas.toDataURL(`image/${format}`, 0.95);
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `sowntra-design.${format}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (error) {
          console.error('Error in drawAllElements:', error);
          alert('Error exporting image. Please try again.');
        }
      };
      
      const checkAllLoaded = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          drawAllElements();
        }
      };
      
      imageElements.forEach(element => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = element.src;
        img.onload = () => {
          checkAllLoaded();
        };
        img.onerror = () => {
          console.error('Failed to load image:', element.src);
          checkAllLoaded(); // Continue even if some images fail
        };
      });
    } else {
      // No images, draw all elements directly in correct order
      try {
        sortedElements.forEach((element, index) => {
          drawElementToCanvas(ctx, element, undefined, index);
        });
        
        const dataUrl = canvas.toDataURL(`image/${format}`, 0.95);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `sowntra-design.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (error) {
        console.error('Error exporting canvas:', error);
        alert('Error exporting image. Please try again.');
      }
    }
  }, [canvasSize, getSortedElementsForExport, drawElementToCanvas, exportAsSVG]);

  // Export as PDF - FIXED VERSION with proper zIndex sorting
  const exportAsPDF = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Could not get canvas context');
      alert('Error: Could not create canvas context');
      return;
    }
    
    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    // FIXED: Use the proper sorting function for correct zIndex layering
    const sortedElements = getSortedElementsForExport();
    
    const imageElements = sortedElements.filter(el => el.type === 'image');
    
    const generatePDF = () => {
      try {
        const imgData = canvas.toDataURL('image/png');
        
        // Create PDF with canvas dimensions (convert pixels to mm, 96 DPI)
        const pdfWidth = canvasSize.width * 0.264583; // Convert px to mm
        const pdfHeight = canvasSize.height * 0.264583;
        
        const pdf = new jsPDF({
          orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [pdfWidth, pdfHeight]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('sowntra-design.pdf');
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF. Please try again.');
      }
    };
    
    if (imageElements.length > 0) {
      let loadedImages = 0;
      const totalImages = imageElements.length;
      
      const drawAllElements = () => {
        // Clear and redraw background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
        
        // Draw ALL elements in correct zIndex order
        sortedElements.forEach((element, index) => {
          drawElementToCanvas(ctx, element, undefined, index);
        });
        generatePDF();
      };
      
      const checkAllLoaded = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          drawAllElements();
        }
      };
      
      imageElements.forEach(element => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = element.src;
        img.onload = () => {
          checkAllLoaded();
        };
        img.onerror = () => {
          console.error('Failed to load image:', element.src);
          checkAllLoaded();
        };
      });
    } else {
      // No images, draw all elements directly in correct order
      // Clear and redraw background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      
      sortedElements.forEach((element, index) => {
        drawElementToCanvas(ctx, element, undefined, index);
      });
      generatePDF();
    }
  }, [canvasSize, getSortedElementsForExport, drawElementToCanvas]);

  // Logout handler
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, navigate]);

  // Zoom in/out
  const zoom = useCallback((direction) => {
    let newZoom;
    
    if (typeof direction === 'number') {
      // Direct zoom level passed
      newZoom = Math.max(0.1, Math.min(5, direction));
    } else if (direction === 'in') {
      newZoom = Math.min(zoomLevel + 0.2, 3);
    } else if (direction === 'out') {
      newZoom = Math.max(zoomLevel - 0.2, 0.5);
    } else {
      newZoom = zoomLevel;
    }
    
    setZoomLevel(newZoom);
    
    // Show zoom indicator on mobile
    setShowZoomIndicator(true);
    
    // Clear existing timeout
    if (zoomIndicatorTimeoutRef.current) {
      clearTimeout(zoomIndicatorTimeoutRef.current);
    }
    
    // Hide after 10 seconds
    zoomIndicatorTimeoutRef.current = setTimeout(() => {
      setShowZoomIndicator(false);
    }, 10000);
  }, [zoomLevel]);

  // Reset zoom and pan
  // const resetView = useCallback(() => {
  //   setZoomLevel(1);
  //   setCanvasOffset({ x: 0, y: 0 });
  // }, []);

  // Handle canvas mouse enter/leave for highlighting
  const handleCanvasMouseEnter = useCallback(() => {
    // setCanvasHighlighted(true);
  }, []);

  const handleCanvasMouseLeave = useCallback(() => {
    // setCanvasHighlighted(false);
  }, []);

  // Browser compatibility check
  const checkRecordingCompatibility = useCallback(() => {
    if (typeof MediaRecorder === 'undefined') {
      alert('Your browser does not support video recording. Please try Chrome, Firefox, or Edge.');
      return false;
    }
    
    const canvas = document.createElement('canvas');
    if (typeof canvas.captureStream !== 'function') {
      alert('Your browser does not support canvas recording. Please try Chrome or Firefox.');
      return false;
    }
    
    return true;
  }, []);

  // Enhanced startRecording function with MP4 support
  const startRecording = useCallback(async () => {
    try {
      if (recording) {
        console.log('Recording already in progress');
        return;
      }

      if (!checkRecordingCompatibility()) return;
      
      await preloadImages();
      
      setRecording(true);
      setRecordingStartTime(Date.now());
      setRecordingTimeElapsed(0);
      
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      let stream;
      try {
        stream = canvas.captureStream(30);
      } catch (error) {
        console.error('Error capturing stream:', error);
        alert('Your browser does not support canvas recording. Please try Chrome or Firefox.');
        setRecording(false);
        setRecordingStartTime(null);
        return;
      }
      
      // Enhanced MIME type detection with MP4 support
      const getSupportedMimeType = () => {
        const mimeTypes = [
          // MP4/H.264 options (try these first if MP4 is selected)
          'video/mp4;codecs=h264',
          'video/mp4;codecs=avc1.42E01E',
          'video/mp4;codecs=avc1.42801E',
          
          // WebM options (fallback)
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm'
        ];
        
        // If user selected MP4, prioritize MP4 codecs
        const preferredTypes = videoFormat === 'mp4' 
          ? mimeTypes.filter(type => type.includes('mp4'))
          : mimeTypes.filter(type => type.includes('webm'));
        
        // Add fallback types
        const allTypes = [...preferredTypes, ...mimeTypes];
        
        for (let mimeType of allTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            console.log('Supported MIME type:', mimeType);
            return mimeType;
          }
        }
        
        return null;
      };
      
      const mimeType = getSupportedMimeType();
      
      if (!mimeType) {
        alert('Your browser does not support any video recording formats. Please try Chrome.');
        setRecording(false);
        setRecordingStartTime(null);
        return;
      }
      
      const options = { mimeType };
      
      // Set bitrate based on quality
      switch(videoQuality) {
        case 'low':
          options.videoBitsPerSecond = 1000000;
          break;
        case 'medium':
          options.videoBitsPerSecond = 2500000;
          break;
        case 'high':
        default:
          options.videoBitsPerSecond = 5000000;
          break;
      }
      
      const recorder = new MediaRecorder(stream, options);
      
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        try {
          if (chunks.length === 0) {
            console.warn('No data recorded');
            return;
          }

          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          
          // Determine correct file extension
          let extension = 'webm';
          if (mimeType.includes('mp4')) {
            extension = 'mp4';
          } else if (videoFormat === 'gif') {
            extension = 'gif';
          }
          
          a.download = `sowntra-animation-${new Date().getTime()}.${extension}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          console.log('Recording saved successfully');
        } catch (error) {
          console.error('Error creating download:', error);
          alert('Error creating video file. Please try again.');
        } finally {
          setRecording(false);
          setRecordingStartTime(null);
          setRecordingTimeElapsed(0);
          setMediaRecorder(null);
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
          }
        }
      };
      
      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        alert('Error during recording: ' + event.error.message);
        setRecording(false);
        setRecordingStartTime(null);
        setRecordingTimeElapsed(0);
        setMediaRecorder(null);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      
      // Elapsed time counter
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTimeElapsed(prev => prev + 1);
      }, 1000);
      
      let startTime = null;
      const frameDuration = 1000 / 30;
      let lastFrameTime = 0;
      // eslint-disable-next-line no-unused-vars
      let animationId = null;
      
      const drawAnimationFrame = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        
        if (recorder.state === 'recording') {
          if (timestamp - lastFrameTime >= frameDuration) {
            lastFrameTime = timestamp;
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // FIXED: Use proper zIndex sorting for recording too
            const sortedElements = getSortedElementsForExport();
            
            sortedElements.forEach((element, index) => {
              // Use recordingDuration for animation loop timing
              const animationProgress = (elapsed / 1000) % recordingDuration;
              drawElementToCanvas(ctx, element, animationProgress, index);
            });
          }
          
          animationId = requestAnimationFrame(drawAnimationFrame);
        }
      };
      
      animationId = requestAnimationFrame(drawAnimationFrame);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error starting recording: ' + error.message);
      setRecording(false);
      setRecordingStartTime(null);
      setRecordingTimeElapsed(0);
      setMediaRecorder(null);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [recording, canvasSize, drawElementToCanvas, recordingDuration, videoQuality, checkRecordingCompatibility, preloadImages, videoFormat, getSortedElementsForExport]);

  // Stop recording
  const stopRecording = useCallback(() => {
    console.log('Stop recording called, state:', mediaRecorder?.state);
    
    if (!recording) {
      console.log('Not currently recording');
      return;
    }

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log('Stopping media recorder');
      mediaRecorder.stop();
      // State cleanup is handled in recorder.onstop callback
    } else {
      // Cleanup if recorder is in invalid state
      setRecording(false);
      setRecordingStartTime(null);
      setRecordingTimeElapsed(0);
      setMediaRecorder(null);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [mediaRecorder, recording]);

  // Show save dialog
  const handleSaveClick = useCallback(() => {
    setProjectName(`My Design ${new Date().toLocaleDateString()}`);
    setShowSaveDialog(true);
  }, []);

  // Save project to backend (PostgreSQL)
  const saveProject = useCallback(async (customTitle = null) => {
    try {
      const projectData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        title: customTitle || `My Design ${new Date().toLocaleDateString()}`,
        description: 'Created with Sowntra',
        pages: pages,
        currentPage: currentPage,
        canvasSize: canvasSize,
        zoomLevel: zoomLevel,
        canvasOffset: canvasOffset,
        showGrid: showGrid,
        snapToGrid: snapToGrid,
        currentLanguage: currentLanguage,
        textDirection: textDirection
      };

      // eslint-disable-next-line no-unused-vars
      const response = await projectAPI.saveProject(projectData);
      
      // Also save locally as backup
      const dataStr = JSON.stringify(projectData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sowntra-project-${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Project saved successfully to cloud and locally!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project to cloud. Saving locally only...');
      
      // Fallback to local save only
      try {
        const projectData = {
          version: '1.0',
          timestamp: new Date().toISOString(),
          pages: pages,
          currentPage: currentPage,
          canvasSize: canvasSize,
          zoomLevel: zoomLevel,
          canvasOffset: canvasOffset,
          showGrid: showGrid,
          snapToGrid: snapToGrid,
          currentLanguage: currentLanguage,
          textDirection: textDirection
        };

        const dataStr = JSON.stringify(projectData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sowntra-project-${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Project saved locally!');
      } catch (localError) {
        console.error('Error saving locally:', localError);
        alert('Error saving project. Please try again.');
      }
    }
  }, [pages, currentPage, canvasSize, zoomLevel, canvasOffset, showGrid, snapToGrid, currentLanguage, textDirection]);

  // Confirm save with project name
  const confirmSave = useCallback(async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }
    
    setShowSaveDialog(false);
    await saveProject(projectName.trim());
  }, [projectName, saveProject]);

  // Load project from JSON file
  const loadProject = useCallback(() => {
    loadProjectInputRef.current?.click();
  }, []);

  // Handle project file load
  const handleProjectFileLoad = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData = JSON.parse(e.target.result);
          
          // Validate project data
          if (!projectData.version || !projectData.pages) {
            throw new Error('Invalid project file');
          }

          // Restore project state
          setPages(projectData.pages);
          setCurrentPage(projectData.currentPage || projectData.pages[0]?.id);
          setCanvasSize(projectData.canvasSize || { width: 800, height: 600 });
          setZoomLevel(projectData.zoomLevel || 1);
          setCanvasOffset(projectData.canvasOffset || { x: 0, y: 0 });
          setShowGrid(projectData.showGrid || false);
          setSnapToGrid(projectData.snapToGrid || false);
          setCurrentLanguage(projectData.currentLanguage || 'en');
          setTextDirection(projectData.textDirection || 'ltr');
          
          // Clear selections
          setSelectedElement(null);
          setSelectedElements(new Set());
          
          alert('Project loaded successfully!');
        } catch (error) {
          console.error('Error loading project:', error);
          alert('Error loading project. Please make sure the file is a valid Sowntra project file.');
        }
      };
      reader.readAsText(file);
    }
    
    // Reset the input value so the same file can be loaded again
    event.target.value = '';
  }, []);

  // Transliteration Toggle Component
  const TransliterationToggle = useCallback(() => {
    const needsTransliteration = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or'].includes(currentLanguage);
    
    if (!needsTransliteration) return null;
    
    return (
      <div className="mb-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={transliterationEnabled}
            onChange={() => setTransliterationEnabled(!transliterationEnabled)}
            className="mr-2"
          />
          <span className="text-sm">Enable Transliteration (Type in English)</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Type English letters to get {supportedLanguages[currentLanguage]?.name} characters
        </p>
      </div>
    );
  }, [currentLanguage, transliterationEnabled]);

  // Video Settings Component
  const VideoSettings = useCallback(() => (
    <div className="mb-4 p-3 bg-gray-100 rounded">
      <h3 className="font-semibold mb-2 text-gray-700">{t('export.videoSettings')}</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">{t('recording.format')}</label>
          <select
            value={videoFormat}
            onChange={(e) => setVideoFormat(e.target.value)}
            className="w-full p-2 border rounded text-sm text-gray-700"
          >
            <option value="webm">{t('export.webmRecommended')}</option>
            <option value="mp4">{t('export.mp4Limited')}</option>
            <option value="gif">{t('export.gifAnimated')}</option>
          </select>
          {videoFormat === 'mp4' && (
            <p className="text-xs text-orange-600 mt-1">
              {t('export.mp4Warning')}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">{t('recording.quality')}</label>
          <select
            value={videoQuality}
            onChange={(e) => setVideoQuality(e.target.value)}
            className="w-full p-2 border rounded text-sm text-gray-700"
          >
            <option value="low">{t('export.lowQuality')}</option>
            <option value="medium">{t('export.mediumQuality')}</option>
            <option value="high">{t('export.highQuality')}</option>
          </select>
        </div>
      </div>
      
      <div className="mt-3">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Animation Loop: {recordingDuration}s
        </label>
        <input
          type="range"
          min="3"
          max="30"
          value={recordingDuration}
          onChange={(e) => setRecordingDuration(parseInt(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">Duration for animations to loop (not recording length)</p>
      </div>
    </div>
  ), [videoFormat, videoQuality, recordingDuration, t]);

  // RecordingStatus is now imported from components

  // Language Help Modal
  // LanguageHelpModal is now imported from components

  // EffectsPanel is now imported from components

  // Custom Template Modal Component
  // CustomTemplateModal is now imported from components

  // Render element with enhanced selection handles and effects - FIXED VERSION
  const renderElement = useCallback((element) => {
    const isSelected = selectedElements.has(element.id);
    const isEditing = textEditing === element.id;
    const isLocked = lockedElements.has(element.id);
    const needsComplexScript = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'ur', 'ar', 'he'].includes(currentLanguage);
    const isRTL = textDirection === 'rtl';
    
    // Handle group element rendering
    if (element.type === 'group') {
      const style = {
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation || 0}deg)`,
        zIndex: element.zIndex,
        cursor: 'move',
        border: `${element.strokeWidth}px dashed ${element.stroke}`,
        pointerEvents: 'none'
      };

      return (
        <div key={element.id}>
          {/* Group outline */}
          <div
            style={style}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleSelectElement(e, element.id);
            }}
          />
          
          {/* Render group children */}
          {getCurrentPageElements()
            .filter(el => el.groupId === element.id)
            .map(renderElement)}
          
          {/* Selection handles for the group */}
          {isSelected && currentTool === 'select' && !isLocked && (
            renderSelectionHandles(element)
          )}
        </div>
      );
    }

    const style = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation || 0}deg)`,
      zIndex: element.zIndex,
      cursor: isLocked ? 'not-allowed' : (currentTool === 'select' ? 'move' : 'default'),
      filter: element.filters ? getFilterCSS(element.filters) : 'none',
      opacity: element.filters?.opacity ? element.filters.opacity.value / 100 : 1
    };

    // Apply effects CSS
    const effectCSS = getEffectCSS(element);
    if (effectCSS) {
      Object.assign(style, parseCSS(effectCSS));
    }

    let content;
    if (element.type === 'text') {
      const textElementStyle = {
        ...style,
        fontSize: element.fontSize,
        fontFamily: needsComplexScript ? supportedLanguages[currentLanguage]?.font : element.fontFamily,
        fontWeight: element.fontWeight,
        fontStyle: element.fontStyle,
        textDecoration: element.textDecoration,
        color: element.color,
        textAlign: isRTL ? 'right' : element.textAlign,
        display: 'flex',
        alignItems: 'flex-start',
        cursor: isLocked ? 'not-allowed' : (isEditing ? 'text' : 'move'),
        outline: 'none',
        userSelect: isEditing ? 'text' : 'none',
        minHeight: element.height,
        minWidth: element.width,
        padding: '4px',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
        wordBreak: 'break-word'
      };
      
      content = (
        <div
          id={`element-${element.id}`}
          style={textElementStyle}
          className={`${styles.textElement || ''} text-element ${needsComplexScript ? 'complex-script' : ''} ${element.fillType === 'gradient' ? 'gradient-fix' : ''}`}
          contentEditable={!isLocked && isEditing}
          suppressContentEditableWarning={true}
          onBlur={(e) => {
            const newContent = e.target.textContent || '';
            updateElement(element.id, { content: newContent });
            setTextEditing(null);
          }}
          onInput={(e) => {
            // Auto-adjust height based on content
            if (isEditing) {
              const newHeight = Math.max(element.fontSize * 2, e.target.scrollHeight);
              updateElement(element.id, { height: newHeight });
            }
          }}
          onKeyDown={(e) => {
            // Prevent deletion of the entire element
            if (e.key === 'Backspace' && e.target.textContent === '') {
              e.preventDefault();
            }
          }}
          onDoubleClick={(e) => {
            if (!isLocked) {
              e.stopPropagation();
              handleTextEdit(e, element.id);
            }
          }}
          onMouseDown={(e) => {
            if (!isLocked && !isEditing) {
              e.stopPropagation();
              handleMouseDown(e, element.id);
            }
          }}
        >
          {element.content}
        </div>
      );
    } else if (element.type === 'rectangle') {
      const rectangleStyle = {
        ...style,
        backgroundColor: element.fillType === 'solid' ? element.fill : 'transparent',
        background: element.fillType === 'gradient' ? getBackgroundStyle(element) : 'none',
        border: `${element.strokeWidth}px solid ${element.stroke}`,
        borderRadius: element.borderRadius,
      };
      
      content = (
        <div
          id={`element-${element.id}`}
          className={`${styles.shapeElement || ''} ${element.fillType === 'gradient' ? 'gradient-fix' : ''}`}
          style={rectangleStyle}
          onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
        />
      );
    } else if (element.type === 'circle') {
      const circleStyle = {
        ...style,
        backgroundColor: element.fillType === 'solid' ? element.fill : 'transparent',
        background: element.fillType === 'gradient' ? getBackgroundStyle(element) : 'none',
        border: `${element.strokeWidth}px solid ${element.stroke}`,
        borderRadius: '50%',
      };
      
      content = (
        <div
          id={`element-${element.id}`}
          className={`${styles.shapeElement || ''} ${element.fillType === 'gradient' ? 'gradient-fix' : ''}`}
          style={circleStyle}
          onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
        />
      );
    } else if (element.type === 'triangle') {
      const triangleStyle = {
        ...style,
        width: 0,
        height: 0,
        borderLeft: `${element.width/2}px solid transparent`,
        borderRight: `${element.width/2}px solid transparent`,
        borderBottom: `${element.height}px solid ${element.fillType === 'solid' ? element.fill : getBackgroundStyle(element)}`,
        borderTop: 'none',
        background: element.fillType === 'gradient' ? getBackgroundStyle(element) : 'none'
      };
      
      content = (
        <div
          id={`element-${element.id}`}
          className={`${styles.shapeElement || ''} ${element.fillType === 'gradient' ? 'gradient-fix' : ''}`}
          style={triangleStyle}
          onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
        />
      );
    } else if (element.type === 'image') {
      const imageStyle = {
        ...style,
        objectFit: 'cover',
        borderRadius: element.borderRadius,
      };
      
      content = (
        <img
          id={`element-${element.id}`}
          src={element.src}
          alt=""
          className={styles.imageElement || ''}
          style={imageStyle}
          onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
          draggable={false}
        />
      );
    } else if (element.type === 'line') {
      content = (
        <svg
          id={`element-${element.id}`}
          style={{...style}}
          onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
        >
          <line
            x1={0}
            y1={0}
            x2={element.width}
            y2={element.height}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        </svg>
      );
    } else if (element.type === 'arrow') {
      content = (
        <svg
          id={`element-${element.id}`}
          style={{...style}}
          onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
        >
          <defs>
            <marker
              id={`arrowhead-${element.id}`}
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={element.stroke} />
            </marker>
          </defs>
          <line
            x1={0}
            y1={element.height / 2}
            x2={element.width - 10}
            y2={element.height / 2}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            markerEnd={`url(#arrowhead-${element.id})`}
          />
        </svg>
      );
    } else if (element.type === 'star') {
      const points = element.points || 5;
      const outerRadius = Math.min(element.width, element.height) / 2;
      const innerRadius = outerRadius / 2;
      const centerX = element.width / 2;
      const centerY = element.height / 2;
      
      let path = '';
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        path += (i === 0 ? 'M' : 'L') + x + ',' + y;
      }
      path += 'Z';
      
      content = (
        <svg
          id={`element-${element.id}`}
          style={{...style}}
          onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
        >
          <path
            d={path}
            fill={getBackgroundStyle(element)}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        </svg>
      );
    } else if (element.type === 'hexagon') {
      const centerX = element.width / 2;
      const centerY = element.height / 2;
      const radius = Math.min(element.width, element.height) / 2;
      
      let path = '';
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 - Math.PI / 6;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        path += (i === 0 ? 'M' : 'L') + x + ',' + y;
      }
      path += 'Z';
      
      content = (
        <svg
          id={`element-${element.id}`}
          style={{...style}}
          onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
        >
          <path
            d={path}
            fill={getBackgroundStyle(element)}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        </svg>
      );
    } else if (element.type === 'drawing' && element.path.length > 1) {
      if (element.path.length < 2) return null;
      
      let pathData = 'M ' + element.path[0].x + ' ' + element.path[0].y;
      for (let i = 1; i < element.path.length; i++) {
        pathData += ' L ' + element.path[i].x + ' ' + element.path[i].y;
      }
      
      content = (
        <svg
          id={`element-${element.id}`}
          style={{...style}}
          onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
        >
          <path
            d={pathData}
            fill="none"
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        </svg>
      );
    } else if (element.type === 'sticker') {
      content = (
        <div
          id={`element-${element.id}`}
          className={element.fillType === 'gradient' ? 'gradient-fix' : ''}
          style={{
            ...style,
            backgroundColor: element.fillType === 'solid' ? element.fill : 'transparent',
            background: element.fillType === 'gradient' ? getBackgroundStyle(element) : 'none',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
          }}
          onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
        >
          {stickerOptions.find(s => s.name === element.sticker)?.icon || '😊'}
        </div>
      );
    }

    return (
      <React.Fragment key={element.id}>
        {content}
        {isSelected && currentTool === 'select' && !isLocked && (
          renderSelectionHandles(element)
        )}
        {isLocked && (
          <div
            style={{
              position: 'absolute',
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              backgroundColor: 'rgba(0,0,0,0.1)',
              pointerEvents: 'none',
              zIndex: element.zIndex + 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Lock size={20} color="#666" />
          </div>
        )}
      </React.Fragment>
    );
  }, [selectedElements, textEditing, lockedElements, currentTool, getFilterCSS, handleTextEdit, handleMouseDown, currentLanguage, textDirection, getBackgroundStyle, renderSelectionHandles, updateElement, getEffectCSS, getCurrentPageElements, handleSelectElement]);

  // Helper function to parse CSS string to object
  const parseCSS = (cssString) => {
    const style = {};
    const declarations = cssString.split(';');
    declarations.forEach(decl => {
      const [property, value] = decl.split(':').map(s => s.trim());
      if (property && value) {
        style[property] = value;
      }
    });
    return style;
  };

  // Render drawing path in progress
  const renderDrawingPath = useCallback(() => {
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
          zIndex: 10000
        }}
      >
        <path
          d={pathData}
          fill="none"
          stroke="#000000"
          strokeWidth="3"
        />
      </svg>
    );
  }, [drawingPath]);

  // Keyboard shortcuts
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
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&family=Noto+Sans+Tamil:wght@400;700&family=Noto+Sans+Telugu:wght@400;700&family=Noto+Sans+Bengali:wght@400;700&family=Noto+Sans+Gujarati:wght@400;700&family=Noto+Sans+Kannada:wght@400;700&family=Noto+Sans+Malayalam:wght@400;700&family=Noto+Sans+Gurmukhi:wght@400;700&family=Noto+Sans+Oriya:wght@400;700&display=swap');
          
          .rtl-text {
            direction: rtl;
            text-align: right;
          }
          
          .complex-script {
            text-rendering: optimizeLegibility;
            font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
          }

          /* Animation Keyframes */
          @keyframes rise {
            from {
              transform: translateY(100px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes pan {
            from {
              transform: translateX(-100px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes fade {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes bounce {
            0% {
              transform: scale(0.3);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes typewriter {
            from {
              width: 0;
            }
            to {
              width: 100%;
            }
          }

          @keyframes tumble {
            from {
              transform: rotate(180deg) scale(0);
              opacity: 0;
            }
            to {
              transform: rotate(0deg) scale(1);
              opacity: 1;
            }
          }

          @keyframes wipe {
            from {
              clip-path: inset(0 100% 0 0);
            }
            to {
              clip-path: inset(0 0 0 0);
            }
          }

          @keyframes pop {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            80% {
              transform: scale(1.2);
              opacity: 0.8;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes zoomIn {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes zoomOut {
            from {
              transform: scale(2);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes flip {
            from {
              transform: rotateY(90deg);
              opacity: 0;
            }
            to {
              transform: rotateY(0deg);
              opacity: 1;
            }
          }

          @keyframes flash {
            0%, 50%, 100% {
              opacity: 1;
            }
            25%, 75% {
              opacity: 0;
            }
          }

          @keyframes glitch {
            0%, 100% {
              transform: translate(0);
              filter: hue-rotate(0deg);
              opacity: 1;
            }
            20% {
              transform: translate(-2px, 2px);
              filter: hue-rotate(90deg);
              opacity: 0.8;
            }
            40% {
              transform: translate(-2px, -2px);
              filter: hue-rotate(180deg);
              opacity: 0.9;
            }
            60% {
              transform: translate(2px, 2px);
              filter: hue-rotate(270deg);
              opacity: 0.7;
            }
            80% {
              transform: translate(2px, -2px);
              filter: hue-rotate(360deg);
              opacity: 0.8;
            }
          }

          @keyframes glitch-text {
            0% {
              transform: translate(0);
            }
            20% {
              transform: translate(-2px, 2px);
            }
            40% {
              transform: translate(-2px, -2px);
            }
            60% {
              transform: translate(2px, 2px);
            }
            80% {
              transform: translate(2px, -2px);
            }
            100% {
              transform: translate(0);
            }
          }

          @keyframes heartbeat {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }

          @keyframes wiggle {
            0%, 100% {
              transform: rotate(0deg);
            }
            25% {
              transform: rotate(-5deg);
            }
            75% {
              transform: rotate(5deg);
            }
          }

          @keyframes jiggle {
            0%, 100% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(-2px, -2px);
            }
            50% {
              transform: translate(2px, 2px);
            }
            75% {
              transform: translate(-2px, 2px);
            }
          }

          @keyframes shake {
            0%, 100% {
              transform: translateX(0);
            }
            10%, 30%, 50%, 70%, 90% {
              transform: translateX(-10px);
            }
            20%, 40%, 60%, 80% {
              transform: translateX(10px);
            }
          }

          @keyframes colorShift {
            0% {
              filter: hue-rotate(0deg);
            }
            33% {
              filter: hue-rotate(120deg);
            }
            66% {
              filter: hue-rotate(240deg);
            }
            100% {
              filter: hue-rotate(360deg);
            }
          }

          @keyframes fadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }

          @keyframes slideInLeft {
            from {
              transform: translateX(-100px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideInRight {
            from {
              transform: translateX(100px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideInUp {
            from {
              transform: translateY(100px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes slideInDown {
            from {
              transform: translateY(-100px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes slideOutLeft {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(-100px);
              opacity: 0;
            }
          }

          @keyframes slideOutRight {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100px);
              opacity: 0;
            }
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes blurIn {
            from {
              filter: blur(10px);
              opacity: 0;
            }
            to {
              filter: blur(0);
              opacity: 1;
            }
          }

          @keyframes flicker {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.3;
            }
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }

          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          /* Enhanced Effects Styles */
          .bg-grid {
            background-size: 20px 20px;
            background-image: linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px);
          }

          .canvas-highlight {
            box-shadow: 0 0 0 3px #8b5cf6;
          }

          .template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 8px;
          }

          .template-button {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 12px;
            border-radius: 8px;
            background-color: #f8fafc;
            border: 2px solid #e2e8f0;
            cursor: pointer;
            transition: all 0.2s;
            min-height: 100px;
          }

          .template-button:hover {
            background-color: #e2e8f0;
            transform: translateY(-2px);
            border-color: #3b82f6;
          }

          .template-button.active {
            background-color: #dbeafe;
            border-color: #3b82f6;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
          }

          .sticker-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }

          .sticker-button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            border-radius: 8px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            cursor: pointer;
            font-size: 24px;
            transition: all 0.2s;
          }

          .sticker-button:hover {
            background-color: #e2e8f0;
            transform: scale(1.1);
          }

          .gradient-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .floating-toolbar {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            border-radius: 12px;
            padding: 8px;
            display: flex;
            gap: 4px;
          }
          
          @media (max-width: 768px) {
            .floating-toolbar {
              bottom: 80px;
              left: 50%;
              transform: translateX(-50%);
              flex-wrap: wrap;
              max-width: 90%;
              padding: 6px;
              gap: 2px;
            }
          }

          .toolbar-button {
            padding: 8px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            cursor: pointer;
          }
          
          @media (max-width: 768px) {
            .toolbar-button {
              padding: 6px;
              min-width: 36px;
              min-height: 36px;
            }
          }

          .toolbar-button:hover {
            background-color: #f1f5f9;
          }

          .toolbar-button.active {
            background-color: #e0e7ff;
            color: #4f46e5;
          }

          .dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            padding: 8px;
            min-width: 150px;
            z-index: 1000;
          }

          .dropdown-item {
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            color: #374151;
            font-weight: 500;
          }

          .dropdown-item:hover {
            background-color: #f1f5f9;
          }

          /* FIXED: Canvas container that fills the screen - RESPONSIVE */
          .canvas-container {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            flex: 1;
            overflow: hidden;
            background-color: #f0f0f0;
            padding: 10px;
            width: 100%;
            height: 100%;
            min-height: 0;
            touch-action: none;
          }
          
          @media (max-width: 768px) {
            .canvas-container {
              padding: 5px;
            }
          }
          
          /* Touch-friendly styles */
          .touch-manipulation {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            min-height: 44px;
            min-width: 44px;
          }
          
          /* Make canvas elements touch-friendly */
          .canvas-element {
            touch-action: none;
            cursor: move;
          }
          
          button, input, select, textarea {
            touch-action: manipulation;
          }

          .main-content {
            display: flex;
            flex: 1;
            overflow: hidden;
            min-height: 0;
          }
          
          @media (max-width: 768px) {
            .main-content {
              width: 100%;
            }
          }

          .flex-1 {
            flex: 1;
            min-height: 0;
          }

          .relative {
            position: relative;
          }

          .bg-white {
            background-color: white;
          }

          .shadow-lg {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }

          .properties-panel {
            width: 280px;
            background: white;
            border-left: 1px solid #e2e8f0;
            overflow-y: auto;
            padding: 16px;
          }
          
          @media (max-width: 768px) {
            .properties-panel {
              display: none !important;
            }
          }

          .tools-panel {
            width: 64px;
            background: white;
            border-right: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px 0;
          }
          
          @media (max-width: 768px) {
            .tools-panel {
              display: none !important;
            }
          }

          .main-header {
            height: 60px;
            background: linear-gradient(135deg, #f5f6f8ff 0%, #bd83f8ff 100%);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            color: white;
            flex-wrap: wrap;
          }
          
          @media (max-width: 768px) {
            .main-header {
              height: auto;
              min-height: 50px;
              padding: 8px 12px;
              flex-wrap: nowrap;
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
            }
          }

          .filter-slider {
            margin-bottom: 12px;
          }

          .filter-slider label {
            display: block;
            margin-bottom: 4px;
            font-size: 12px;
            color: #64748b;
          }

          .filter-slider input {
            width: 100%;
          }

          .filter-value {
            font-size: 11px;
            color: #64748b;
            text-align: right;
          }

          .handwritten-logo {
            font-family: 'Comic Sans MS', cursive, sans-serif;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 1px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }

          .rtl-layout .tools-panel {
            border-right: none;
            border-left: 1px solid #e2e8f0;
          }
          
          .rtl-layout .properties-panel {
            border-left: none;
            border-right: 1px solid #e2e8f0;
          }
          
          .rtl-layout .main-header {
            direction: rtl;
          }
          
          .rtl-layout .floating-toolbar {
            left: auto;
            right: 50%;
            transform: translateX(50%);
          }

          .gradient-fix {
            background-repeat: no-repeat !important;
            background-size: 100% 100% !important;
            background-attachment: local !important;
          }

          .selection-handle {
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            transition: all 0.1s ease;
          }

          .selection-handle:hover {
            transform: scale(1.2);
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          }

          .selection-handle:active {
            transform: scale(1.1);
          }

          /* Ensure gradient backgrounds work properly */
          [style*="gradient"] {
            background-repeat: no-repeat !important;
            background-size: 100% 100% !important;
          }

          /* Text element selection improvements */
          [contenteditable="true"]:focus {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }

          /* FIXED: Text element wrapping improvements */
          .text-element {
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            hyphens: auto;
          }

          [contenteditable="true"] {
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            hyphens: auto;
          }

          /* Smooth transitions for zoom and pan */
          .relative {
            transition: transform 0.2s ease-in-out;
          }

          /* Effects specific styles */
          .text-shadow {
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          }

          .text-lift {
            text-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 6px 20px rgba(0,0,0,0.15);
          }

          .text-hollow {
            color: transparent;
            -webkit-text-stroke: 2px #000;
          }

          .text-neon {
            color: #fff;
            text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ff00de, 0 0 20px #ff00de;
          }

          .text-glitch {
            text-shadow: 2px 2px 0 #ff00de, -2px -2px 0 #00fff7;
            animation: glitch-text 0.3s infinite;
          }

          .text-background {
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
          }

          .text-retro {
            color: #ff6b6b;
            text-shadow: 3px 3px 0 #4ecdc4, 6px 6px 0 #45b7aa;
          }

          .shape-shadow {
            filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.3));
          }

          .shape-glow {
            filter: drop-shadow(0 0 10px rgba(255,255,255,0.8));
          }

          .shape-emboss {
            filter: contrast(1.5) brightness(1.2);
          }

          .shape-outline {
            outline: 3px solid #000;
            outline-offset: 2px;
          }

          /* FIXED: Ensure images don't have unexpected borders */
          img[id^="element-"] {
            border: none !important;
            outline: none !important;
          }

          /* Remove default borders from image elements */
          canvas img {
            border: 0;
          }
        `}
      </style>
      
      <div className={`h-screen flex flex-col ${textDirection === 'rtl' ? 'rtl-layout' : ''}`}>
        {/* Header - Responsive */}
        <div className="main-header flex">
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors p-2 touch-manipulation"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5 md:mr-1" />
            </button>
            <h1 className="text-base md:text-xl font-bold flex items-center">
              <span className="handwritten-logo">Sowntra</span>
            </h1>
            <div className="hidden md:flex space-x-2">
              <button
                onClick={() => zoom('in')}
                className="p-2 rounded hover:bg-white/20 touch-manipulation"
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={() => zoom('out')}
                className="p-2 rounded hover:bg-white/20 touch-manipulation"
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={centerCanvas}
                className="p-2 rounded hover:bg-white/20 touch-manipulation"
                title="Fit to Viewport"
              >
                <Maximize size={18} />
              </button>
              <span className="px-2 py-1 bg-white/20 rounded text-sm">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>
          </div>

          <div className="hidden md:flex space-x-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`px-3 py-2 rounded flex items-center touch-manipulation ${showTemplates ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'}`}
            >
              <Layers size={16} className="mr-1" />
              {t('toolbar.templates')}
            </button>
            <button
              onClick={() => setShowEffectsPanel(!showEffectsPanel)}
              className={`px-3 py-2 rounded flex items-center touch-manipulation ${showEffectsPanel ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'}`}
            >
              <Sparkles size={16} className="mr-1" />
              {t('toolbar.effects')}
            </button>
            <button
              onClick={playAnimations}
              disabled={isPlaying}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center touch-manipulation"
            >
              <Play size={16} className="mr-1" />
              {t('toolbar.play')}
            </button>
            <button
              onClick={resetAnimations}
              className="px-3 py-2 bg-white/20 text-white rounded hover:bg-white/30 flex items-center touch-manipulation"
            >
              <Pause size={16} className="mr-1" />
              {t('toolbar.reset')}
            </button>
            {recording ? (
              <div className="flex items-center space-x-2">
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded flex items-center text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                  Recording: {Math.floor(recordingTimeElapsed / 60)}:{(recordingTimeElapsed % 60).toString().padStart(2, '0')}
                </div>
                <button
                  onClick={stopRecording}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center touch-manipulation"
                >
                  <Square size={16} className="mr-1" />
                  Stop
                </button>
              </div>
            ) : (
              <button
                onClick={startRecording}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center touch-manipulation"
              >
                <Film size={16} className="mr-1" />
                {t('toolbar.record')}
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="px-2 md:px-3 py-1.5 md:py-2 rounded bg-white/10 hover:bg-white/20 flex items-center gap-1 md:gap-2 touch-manipulation transition-colors"
                title="Language"
              >
                <Languages size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="text-xs md:text-sm font-medium hidden sm:inline">
                  {supportedLanguages[currentLanguage]?.name}
                </span>
              </button>
              {showLanguageMenu && (
                <>
                  {/* Mobile: Full screen overlay */}
                  <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-50"
                    onClick={() => setShowLanguageMenu(false)}
                  />
                  <div className="md:dropdown-menu md:relative md:w-[200px] md:shadow-lg md:border md:border-gray-200 fixed md:static left-0 right-0 top-0 bottom-0 md:top-auto md:left-auto md:right-auto md:bottom-auto bg-white md:rounded-lg z-50 flex flex-col md:max-h-96 max-h-screen overflow-hidden">
                    <div className="font-semibold px-4 py-3 border-b text-gray-700 flex items-center justify-between sticky top-0 bg-white z-10">
                      <div className="text-base md:text-sm font-bold">{t('language.title')}</div>
                      <button 
                        onClick={() => setShowLanguageMenu(false)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 touch-manipulation text-2xl leading-none min-h-[44px] min-w-[44px]"
                      >
                        ×
                      </button>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {Object.entries(supportedLanguages).map(([code, lang]) => (
                        <div
                          key={code}
                          className={`dropdown-item md:px-3 md:py-2 px-4 py-3 cursor-pointer touch-manipulation ${currentLanguage === code ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-50'}`}
                          onClick={() => {
                            setCurrentLanguage(code);
                            i18n.changeLanguage(code);
                            setShowLanguageMenu(false);
                            setGradientPickerKey(prev => prev + 1);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm md:text-xs">{lang.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5 md:hidden">{lang.nativeName}</div>
                            </div>
                            {currentLanguage === code && (
                              <div className="text-blue-500 text-lg md:text-sm ml-2">✓</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t bg-white sticky bottom-0">
                      <div
                        className="dropdown-item md:px-3 md:py-2 px-5 py-3.5 text-blue-500 cursor-pointer hover:bg-blue-50 touch-manipulation flex items-center gap-3"
                        onClick={() => {
                          setShowLanguageHelp(true);
                          setShowLanguageMenu(false);
                        }}
                      >
                        <HelpCircle size={20} className="md:w-4 md:h-4" />
                        <div>
                          <div className="font-medium text-sm md:text-xs">Typing Help</div>
                          <div className="text-xs text-gray-500 md:hidden">Learn how to type in your language</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <ShareButton 
              url={window.location.href}
              title="Check out my design on Sowntra!"
              text="I created this amazing design on Sowntra. Check it out!"
              className="px-2 md:px-3 py-1.5 hidden md:flex"
            />
            
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="px-2 md:px-3 py-1.5 md:py-2 rounded bg-white/10 hover:bg-white/20 flex items-center gap-1 md:gap-2 touch-manipulation transition-colors min-h-[36px]"
                title="Account"
              >
                <User size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="text-xs md:text-sm font-medium hidden sm:inline truncate max-w-[60px] sm:max-w-[80px] md:max-w-[100px] lg:max-w-[120px]">
                  {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Account'}
                </span>
              </button>
              {showAccountMenu && (
                <>
                  {/* Mobile: Full screen overlay */}
                  <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-50"
                    onClick={() => setShowAccountMenu(false)}
                  />
                  {/* Dropdown menu - Full screen on mobile, normal dropdown on desktop */}
                  <div className="fixed md:absolute md:right-0 left-0 right-0 top-0 bottom-0 md:top-full md:mt-2 md:left-auto md:bottom-auto md:w-56 bg-white shadow-lg border border-gray-200 z-50 md:rounded-lg flex flex-col md:max-h-96 max-h-screen overflow-hidden">
                    {/* Mobile header */}
                    <div className="md:hidden font-semibold px-4 py-3 border-b text-gray-700 flex items-center justify-between sticky top-0 bg-white z-10">
                      <div className="text-base font-bold">Account</div>
                      <button 
                        onClick={() => setShowAccountMenu(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 touch-manipulation text-2xl leading-none min-h-[44px] min-w-[44px]"
                      >
                        ×
                      </button>
                    </div>
                    
                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto">
                      {/* User Info Card - Mobile only */}
                      <div className="px-4 py-3 border-b bg-gray-50 md:hidden">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{currentUser?.displayName || 'User'}</div>
                            <div className="text-xs text-gray-500 truncate">{currentUser?.email}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu items */}
                      <div className="py-1">
                        <div className="dropdown-item md:px-3 md:py-2 px-4 py-3 cursor-pointer touch-manipulation hover:bg-gray-50">
                          <User size={18} className="md:w-4 md:h-4" />
                          <span className="text-sm md:text-xs font-medium">Profile</span>
                        </div>
                        <div className="dropdown-item md:px-3 md:py-2 px-4 py-3 cursor-pointer touch-manipulation hover:bg-gray-50">
                          <Settings size={18} className="md:w-4 md:h-4" />
                          <span className="text-sm md:text-xs font-medium">Settings</span>
                        </div>
                        <div className="border-t my-1 md:my-0"></div>
                        <div 
                          className="dropdown-item text-red-600 hover:bg-red-50 md:px-3 md:py-2 px-4 py-3 cursor-pointer touch-manipulation"
                          onClick={handleLogout}
                        >
                          <LogOut size={18} className="md:w-4 md:h-4" />
                          <span className="text-sm md:text-xs font-medium">Logout</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Template Selector - Responsive */}
        <TemplatesModal 
          show={showTemplates}
          onClose={() => setShowTemplates(false)}
          onApplyTemplate={applyTemplate}
        />

        {/* Custom Template Modal */}
        <CustomTemplateModal 
          show={showCustomTemplateModal}
          templateSize={customTemplateSize}
          onSizeChange={setCustomTemplateSize}
          onCreate={createCustomTemplate}
          onCancel={() => setShowCustomTemplateModal(false)}
        />

        {/* Pages Navigation - Responsive */}
        <div className="bg-white shadow-sm p-2 border-b flex items-center space-x-2 overflow-x-auto md:p-2 sm:p-1.5">
          <span className="text-sm font-medium whitespace-nowrap md:text-sm sm:text-xs">{t('pages.title')}:</span>
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              className={`px-3 py-1 rounded text-sm whitespace-nowrap md:px-3 md:py-1 sm:px-2 sm:py-0.5 md:text-sm sm:text-xs flex-shrink-0 ${currentPage === page.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {page.name}
            </button>
          ))}
          <button
            onClick={addNewPage}
            className="p-1 rounded hover:bg-gray-100 flex-shrink-0"
            title="Add Page"
          >
            <Plus size={16} className="md:w-4 md:h-4 sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            onClick={deleteCurrentPage}
            className="p-1 rounded hover:bg-gray-100"
            title="Delete Page"
            disabled={pages.length <= 1}
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={renameCurrentPage}
            className="p-1 rounded hover:bg-gray-100"
            title="Rename Page"
          >
            <Type size={16} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {/* Left Tools Panel - Hidden on mobile */}
          <div className="tools-panel hidden md:flex">
            <h2 className="text-sm font-bold mb-4 text-center">{t('tools.title')}</h2>
            
            <div className="space-y-2">
              <button
                onClick={() => setCurrentTool('select')}
                className={`p-2 rounded-lg ${currentTool === 'select' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Select"
              >
                <MousePointer size={20} />
              </button>
              <button
                onClick={() => setCurrentTool('pan')}
                className={`p-2 rounded-lg ${currentTool === 'pan' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Pan"
              >
                <Move size={20} />
              </button>
              <button
                onClick={() => addElement('text')}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Text"
              >
                <Type size={20} />
              </button>
              <button
                onClick={() => addElement('rectangle')}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Rectangle"
              >
                <Square size={20} />
              </button>
              <button
                onClick={() => addElement('circle')}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Circle"
              >
                <Circle size={20} />
              </button>
              <button
                onClick={() => addElement('triangle')}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Triangle"
              >
                <Triangle size={20} />
              </button>
              <button
                onClick={() => addElement('line')}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Line"
              >
                <Minus size={20} />
              </button>
              <button
                onClick={() => addElement('arrow')}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Arrow"
              >
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => addElement('star')}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Star"
              >
                <Star size={20} />
              </button>
              <button
                onClick={() => addElement('hexagon')}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Hexagon"
              >
                <Hexagon size={20} />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Image"
              >
                <Image size={20} />
              </button>
              {/* <button
                onClick={() => setCurrentTool('pen')}
                className={`p-2 rounded-lg ${currentTool === 'pen' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Pen Tool"
              >
                <PenTool size={20} />
              </button>
              <button
                onClick={() => setCurrentTool('sticker')}
                className={`p-2 rounded-lg ${currentTool === 'sticker' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Stickers"
              >
                <Sticker size={20} />
              </button> */}
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                title="Undo"
              >
                <Undo size={20} />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                title="Redo"
              >
                <Redo size={20} />
              </button>
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-lg ${showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Toggle Grid"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`p-2 rounded-lg ${snapToGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Snap to Grid"
              >
                <Layers size={20} />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <input
              ref={loadProjectInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleProjectFileLoad}
              className="hidden"
            />
          </div>

          {/* Canvas Area - FILLS SCREEN */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div 
              className="canvas-container"
              ref={canvasContainerRef}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                overflow: 'hidden',
                backgroundColor: '#f0f0f0',
                padding: '5px',
                width: '100%',
                height: '100%'
              }}
            >
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: '100%'
                }}
              >
                <div
                  className="bg-white shadow-lg"
                  style={{
                    width: `${canvasSize.width}px`,
                    height: `${canvasSize.height}px`,
                    transform: `scale(${zoomLevel}) translate(${canvasOffset.x / zoomLevel}px, ${canvasOffset.y / zoomLevel}px)`,
                    transformOrigin: 'center center',
                    position: 'relative',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s ease-out',
                    touchAction: 'none'
                  }}
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseEnter={handleCanvasMouseEnter}
                  onMouseLeave={handleCanvasMouseLeave}
                  onTouchStart={(e) => {
                    if (e.touches.length === 2) {
                      // Two-finger pinch to zoom
                      e.preventDefault();
                      const touch1 = e.touches[0];
                      const touch2 = e.touches[1];
                      const distance = Math.hypot(
                        touch2.clientX - touch1.clientX,
                        touch2.clientY - touch1.clientY
                      );
                      setTouchStartDistance(distance);
                      setInitialZoomLevel(zoomLevel);
                    } else if (e.touches.length === 1) {
                      // Single touch - convert to mouse event for element interaction
                      const touch = e.touches[0];
                      const now = Date.now();
                      
                      // Detect double-tap to zoom
                      if (now - lastTouchEnd < 300) {
                        e.preventDefault();
                        // Double tap detected - zoom in/out
                        if (zoomLevel > 1) {
                          zoom(1); // Reset zoom
                        } else {
                          zoom(1.5); // Zoom in
                        }
                        setLastTouchEnd(0);
                        return;
                      }
                      setLastTouchEnd(now);
                      
                      const mouseEvent = new MouseEvent('mousedown', {
                        clientX: touch.clientX,
                        clientY: touch.clientY,
                        bubbles: true
                      });
                      e.target.dispatchEvent(mouseEvent);
                    }
                  }}
                  onTouchMove={(e) => {
                    if (e.touches.length === 2) {
                      // Pinch zoom
                      e.preventDefault();
                      const touch1 = e.touches[0];
                      const touch2 = e.touches[1];
                      const distance = Math.hypot(
                        touch2.clientX - touch1.clientX,
                        touch2.clientY - touch1.clientY
                      );
                      
                      if (touchStartDistance > 0) {
                        const scale = distance / touchStartDistance;
                        const newZoom = Math.max(0.1, Math.min(5, initialZoomLevel * scale));
                        setZoomLevel(newZoom);
                      }
                    } else if (e.touches.length === 1) {
                      // Single finger - pan or drag element
                      const touch = e.touches[0];
                      const mouseEvent = new MouseEvent('mousemove', {
                        clientX: touch.clientX,
                        clientY: touch.clientY,
                        bubbles: true
                      });
                      document.dispatchEvent(mouseEvent);
                    }
                  }}
                  onTouchEnd={(e) => {
                    if (e.touches.length === 0) {
                      // All touches ended
                      setTouchStartDistance(0);
                      setInitialZoomLevel(zoomLevel);
                      
                      // Dispatch mouseup event
                      const mouseEvent = new MouseEvent('mouseup', {
                        bubbles: true
                      });
                      document.dispatchEvent(mouseEvent);
                    } else if (e.touches.length === 1) {
                      // One finger still touching - reset pinch state
                      setTouchStartDistance(0);
                    }
                  }}
                >
                  {/* Grid */}
                  {showGrid && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundSize: '20px 20px',
                        backgroundImage: 'linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)',
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                  
                  {getCurrentPageElements().map(renderElement)}
                  {renderDrawingPath()}
                  
                  {/* Alignment Lines */}
                  {showAlignmentLines && (
                    <>
                      {alignmentLines.vertical.map((x, i) => (
                        <div
                          key={`v-${i}`}
                          style={{
                            position: 'absolute',
                            left: x,
                            top: 0,
                            width: 1,
                            height: '100%',
                            backgroundColor: '#cb0ee4ff',
                            pointerEvents: 'none',
                            zIndex: 10000
                          }}
                        />
                      ))}
                      {alignmentLines.horizontal.map((y, i) => (
                        <div
                          key={`h-${i}`}
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: y,
                            width: '100%',
                            height: 1,
                            backgroundColor: '#cb0ee4ff',
                            pointerEvents: 'none',
                            zIndex: 10000
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Properties Panel - Hidden on mobile */}
          <div className="properties-panel hidden md:block">
            {/* Properties Section */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-4">{t('properties.title')}</h2>
              
              {selectedElementData ? (
                <div>
                  {/* Animation Selection */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">{t('properties.animation')}</label>
                    <select
                      value={selectedElementData.animation || ''}
                      onChange={(e) => updateElement(selectedElement, { animation: e.target.value || null })}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">{t('effects.none')}</option>
                      {Object.entries(animations).map(([key, anim]) => (
                        <option key={key} value={key}>
                          {anim.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Effects Quick Access */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">{t('properties.quickEffects')}</label>
                    <button
                      onClick={() => setShowEffectsPanel(!showEffectsPanel)}
                      className="w-full p-2 bg-purple-100 text-purple-600 rounded text-sm hover:bg-purple-200 flex items-center justify-center"
                    >
                      <Sparkles size={14} className="mr-1" />
                      {t('properties.openEffectsPanel')}
                    </button>
                  </div>

                  {/* Position and Size */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('properties.x')}</label>
                      <input
                        type="number"
                        value={selectedElementData.x}
                        onChange={(e) => updateElement(selectedElement, { x: parseInt(e.target.value) })}
                        className="w-full p-2 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('properties.y')}</label>
                      <input
                        type="number"
                        value={selectedElementData.y}
                        onChange={(e) => updateElement(selectedElement, { y: parseInt(e.target.value) })}
                        className="w-full p-2 border rounded text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('properties.width')}</label>
                      <input
                        type="number"
                        value={selectedElementData.width}
                        onChange={(e) => updateElement(selectedElement, { width: parseInt(e.target.value) })}
                        className="w-full p-2 border rounded text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('properties.height')}</label>
                      <input
                        type="number"
                        value={selectedElementData.height}
                        onChange={(e) => updateElement(selectedElement, { height: parseInt(e.target.value) })}
                        className="w-full p-2 border rounded text-sm"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">{t('properties.rotation')}</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={selectedElementData.rotation || 0}
                      onChange={(e) => updateElement(selectedElement, { rotation: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-xs text-center">{selectedElementData.rotation || 0}°</div>
                  </div>

                  {/* Filters */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Filters</label>
                    {Object.entries(selectedElementData.filters || filterOptions).map(([key, filter]) => (
                      <div key={key} className="filter-slider">
                        <label>{filter.name}</label>
                        <input
                          type="range"
                          min="0"
                          max={filter.max}
                          value={filter.value}
                          onChange={(e) => updateFilter(selectedElement, key, parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="filter-value">{filter.value}{filter.unit}</div>
                      </div>
                    ))}
                  </div>

                  {/* Fill Type Selection */}
                  {['rectangle', 'circle', 'triangle', 'star', 'hexagon', 'sticker'].includes(selectedElementData.type) && (
                    <>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Fill Type</label>
                        <div className="flex space-x-2 mb-3">
                          <button
                            onClick={() => updateElement(selectedElement, { fillType: 'solid' })}
                            className={`p-2 rounded text-xs flex-1 ${
                              selectedElementData.fillType === 'solid' ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'bg-gray-100 border border-gray-300'
                            }`}
                          >
                            Solid Color
                          </button>
                          <button
                            onClick={() => updateElement(selectedElement, { fillType: 'gradient' })}
                            className={`p-2 rounded text-xs flex-1 ${
                              selectedElementData.fillType === 'gradient' ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'bg-gray-100 border border-gray-300'
                            }`}
                          >
                            Gradient
                          </button>
                        </div>
                      </div>

                      {/* SOLID COLOR PICKER */}
                      {selectedElementData.fillType === 'solid' && (
                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-1">Fill Color</label>
                          <input
                            type="color"
                            value={selectedElementData.fill}
                            onChange={(e) => updateElement(selectedElement, { fill: e.target.value })}
                            className="w-full p-2 border rounded text-sm h-10 cursor-pointer"
                          />
                        </div>
                      )}

                      {/* GRADIENT PICKER - NOW FULLY WORKING */}
                      {selectedElementData.fillType === 'gradient' && (
                        <GradientPicker
                          key={gradientPickerKey}
                          gradient={selectedElementData.gradient}
                          onGradientChange={(gradient) => updateElement(selectedElement, { gradient })}
                        />
                      )}
                    </>
                  )}

                  {/* Text Properties */}
                  {selectedElementData.type === 'text' && (
                    <>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">{t('text.fontSize')}</label>
                        <input
                          type="number"
                          value={selectedElementData.fontSize}
                          onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) })}
                          className="w-full p-2 border rounded text-sm"
                          min="8"
                          max="72"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">{t('text.fontFamily')}</label>
                        <select
                          value={selectedElementData.fontFamily}
                          onChange={(e) => updateElement(selectedElement, { fontFamily: e.target.value })}
                          className="w-full p-2 border rounded text-sm"
                        >
                          {fontFamilies.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">{t('text.color')}</label>
                        <input
                          type="color"
                          value={selectedElementData.color}
                          onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                          className="w-full p-2 border rounded text-sm h-10"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">{t('text.textAlign')}</label>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => updateElement(selectedElement, { textAlign: 'left' })}
                            className={`p-2 rounded ${selectedElementData.textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                            title={t('text.left')}
                          >
                            <AlignLeft size={16} />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElement, { textAlign: 'center' })}
                            className={`p-2 rounded ${selectedElementData.textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                            title={t('text.center')}
                          >
                            <AlignCenter size={16} />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElement, { textAlign: 'right' })}
                            className={`p-2 rounded ${selectedElementData.textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                            title={t('text.right')}
                          >
                            <AlignRight size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">{t('text.textStyle')}</label>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => updateElement(selectedElement, { 
                              fontWeight: selectedElementData.fontWeight === 'bold' ? 'normal' : 'bold' 
                            })}
                            className={`p-2 rounded ${selectedElementData.fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                            title={t('text.bold')}
                          >
                            <Bold size={16} />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElement, { 
                              fontStyle: selectedElementData.fontStyle === 'italic' ? 'normal' : 'italic' 
                            })}
                            className={`p-2 rounded ${selectedElementData.fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                            title={t('text.italic')}
                          >
                            <Italic size={16} />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElement, { 
                              textDecoration: selectedElementData.textDecoration === 'underline' ? 'none' : 'underline' 
                            })}
                            className={`p-2 rounded ${selectedElementData.textDecoration === 'underline' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                            title={t('text.underline')}
                          >
                            <Underline size={16} />
                          </button>
                        </div>
                      </div>
                      <TransliterationToggle />
                    </>
                  )}

                  {/* Shape Properties */}
                  {['rectangle', 'circle', 'triangle', 'star', 'hexagon'].includes(selectedElementData.type) && (
                    <>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Stroke Color</label>
                        <input
                          type="color"
                          value={selectedElementData.stroke}
                          onChange={(e) => updateElement(selectedElement, { stroke: e.target.value })}
                          className="w-full p-2 border rounded text-sm h-10 cursor-pointer"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Stroke Width</label>
                        <input
                          type="number"
                          value={selectedElementData.strokeWidth}
                          onChange={(e) => updateElement(selectedElement, { strokeWidth: parseInt(e.target.value) })}
                          className="w-full p-2 border rounded text-sm"
                          min="0"
                        />
                      </div>
                      {selectedElementData.type === 'rectangle' && (
                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-1">Border Radius</label>
                          <input
                            type="number"
                            value={selectedElementData.borderRadius}
                            onChange={(e) => updateElement(selectedElement, { borderRadius: parseInt(e.target.value) })}
                            className="w-full p-2 border rounded text-sm"
                            min="0"
                          />
                        </div>
                      )}
                      {selectedElementData.type === 'star' && (
                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-1">Points</label>
                          <input
                            type="number"
                            value={selectedElementData.points || 5}
                            onChange={(e) => updateElement(selectedElement, { points: parseInt(e.target.value) })}
                            className="w-full p-2 border rounded text-sm"
                            min="3"
                            max="20"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Image Properties */}
                  {selectedElementData.type === 'image' && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Border Radius</label>
                      <input
                        type="number"
                        value={selectedElementData.borderRadius}
                        onChange={(e) => updateElement(selectedElement, { borderRadius: parseInt(e.target.value) })}
                        className="w-full p-2 border rounded text-sm"
                        min="0"
                      />
                    </div>
                  )}

                  {/* Sticker Properties */}
                  {selectedElementData.type === 'sticker' && (
                    <>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Sticker</label>
                        <div className="sticker-grid">
                          {stickerOptions.map(sticker => (
                            <button
                              key={sticker.name}
                              onClick={() => updateElement(selectedElement, { sticker: sticker.name })}
                              className={`sticker-button ${selectedElementData.sticker === sticker.name ? 'bg-blue-100 border-blue-300' : ''}`}
                            >
                              {sticker.icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => duplicateElement(selectedElement)}
                      className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
                      disabled={lockedElements.has(selectedElement)}
                    >
                      <Copy size={14} className="mr-1" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => toggleElementLock(selectedElement)}
                      className={`p-2 rounded text-sm flex items-center justify-center ${
                        lockedElements.has(selectedElement) 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {lockedElements.has(selectedElement) ? (
                        <>
                          <Unlock size={14} className="mr-1" />
                          Unlock
                        </>
                      ) : (
                        <>
                          <Lock size={14} className="mr-1" />
                          Lock
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => changeZIndex(selectedElement, 'backward')}
                      className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
                      disabled={lockedElements.has(selectedElement)}
                    >
                      <MinusCircle size={14} className="mr-1" />
                      Backward
                    </button>
                    <button
                      onClick={() => changeZIndex(selectedElement, 'forward')}
                      className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
                      disabled={lockedElements.has(selectedElement)}
                    >
                      <PlusCircle size={14} className="mr-1" />
                      Forward
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => changeZIndex(selectedElement, 'back')}
                      className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
                      disabled={lockedElements.has(selectedElement)}
                    >
                      To Back
                    </button>
                    <button
                      onClick={() => changeZIndex(selectedElement, 'front')}
                      className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
                      disabled={lockedElements.has(selectedElement)}
                    >
                      To Front
                    </button>
                  </div>

                  <button
                    onClick={() => deleteElement(selectedElement)}
                    className="w-full p-2 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 flex items-center justify-center"
                    disabled={lockedElements.has(selectedElement)}
                  >
                    <Trash2 size={14} className="mr-1" />
                    {t('properties.delete')}
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">{t('properties.selectElement')}</p>
              )}
            </div>

            {/* Export Section */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-4 text-gray-700">{t('export.title')}</h2>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => exportAsImage('png')}
                  className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center text-gray-700"
                >
                  <Download size={14} className="mr-1" />
                  PNG
                </button>
                <button
                  onClick={() => exportAsImage('jpeg')}
                  className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center text-gray-700"
                >
                  <Download size={14} className="mr-1" />
                  JPEG
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => exportAsImage('webp')}
                  className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center text-gray-700"
                >
                  <Download size={14} className="mr-1" />
                  WebP
                </button>
                <button
                  onClick={() => exportAsImage('svg')}
                  className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center text-gray-700"
                >
                  <Download size={14} className="mr-1" />
                  SVG
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 mb-3">
                <button
                  onClick={exportAsPDF}
                  className="p-2 bg-blue-100 rounded text-sm hover:bg-blue-200 flex items-center justify-center text-blue-700 font-medium"
                >
                  <Download size={14} className="mr-1" />
                  PDF
                </button>
              </div>
              
              {/* Video Export Settings */}
              <VideoSettings />
              
              {!recording ? (
                <button
                  onClick={startRecording}
                  className="w-full p-2 rounded text-sm flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600"
                >
                  <Film size={14} className="mr-1" />
                  {t('export.exportVideo')}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="w-full p-2 bg-red-50 border border-red-200 rounded text-sm flex items-center justify-center text-red-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                      {t('recording.recording')}: {Math.floor(recordingTimeElapsed / 60)}:{(recordingTimeElapsed % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="w-full p-2 rounded text-sm flex items-center justify-center bg-red-500 text-white hover:bg-red-600"
                  >
                    <Square size={14} className="mr-1" />
                    {t('recording.stop')}
                  </button>
                </div>
              )}
            </div>

            {/* Project Actions */}
            <div>
              <h2 className="text-lg font-bold mb-4 text-gray-700">{t('project.title')}</h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSaveClick}
                  className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center text-gray-700"
                >
                  <Save size={14} className="mr-1" />
                  {t('project.save')}
                </button>
                <button
                  onClick={loadProject}
                  className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center text-gray-700"
                >
                  <FolderOpen size={14} className="mr-1" />
                  {t('project.load')}
                </button>
              </div>
            </div>
          </div>
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
            className={`${styles.toolbar || ''} fixed left-1/2 bottom-4 transform -translate-x-1/2 floating-toolbar`}
            style={{ zIndex: 1000 }}
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
        <LanguageHelpModal 
          show={showLanguageHelp}
          currentLanguage={currentLanguage}
          onClose={() => setShowLanguageHelp(false)}
        />

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
        <div className="md:hidden fixed bottom-4 right-4 flex flex-col gap-3 z-40">
          {/* Zoom In Button */}
          <button
            onClick={() => zoom('in')}
            className="w-12 h-12 bg-gray-700 hover:bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center touch-manipulation"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          
          {/* Zoom Out Button */}
          <button
            onClick={() => zoom('out')}
            className="w-12 h-12 bg-gray-700 hover:bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center touch-manipulation"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          
          {/* Fit to Screen Button */}
          <button
            onClick={centerCanvas}
            className="w-12 h-12 bg-gray-700 hover:bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center touch-manipulation"
            title="Fit to Screen"
          >
            <Maximize size={20} />
          </button>
          
          <button
            onClick={() => {
              setShowMobileTools(true);
              setShowMobileProperties(false);
            }}
            className="w-14 h-14 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center touch-manipulation"
            title="Tools"
          >
            <Layers size={24} />
          </button>
          
          {selectedElement && (
            <button
              onClick={() => {
                setShowMobileProperties(true);
                setShowMobileTools(false);
              }}
              className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center touch-manipulation"
              title="Properties"
            >
              <Settings size={24} />
            </button>
          )}
        </div>

        {/* Mobile Tools Drawer */}
        {showMobileTools && (
          <>
            <div 
              className="md:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowMobileTools(false)}
            />
            <div className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">{t('tools.title')}</h2>
                <button
                  onClick={() => setShowMobileTools(false)}
                  className="p-3 rounded-lg hover:bg-gray-100 text-2xl leading-none touch-manipulation min-h-[44px] min-w-[44px]"
                >
                  ×
                </button>
              </div>
              
              <div className="p-4 space-y-2">
                {/* Recording & Playback Controls */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg mb-3">
                  <h3 className="text-xs font-semibold text-gray-600 mb-2">RECORDING & PLAYBACK</h3>
                  {!recording ? (
                    <button onClick={() => { startRecording(); setShowMobileTools(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 touch-manipulation mb-2">
                      <Film size={20} /> <span className="font-medium">Start Recording</span>
                    </button>
                  ) : (
                    <button onClick={() => { stopRecording(); setShowMobileTools(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 touch-manipulation mb-2">
                      <Square size={20} /> <span className="font-medium">Stop Recording ({Math.floor(recordingTimeElapsed / 60)}:{(recordingTimeElapsed % 60).toString().padStart(2, '0')})</span>
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { playAnimations(); setShowMobileTools(false); }} disabled={isPlaying} className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 touch-manipulation">
                      <Play size={18} /> <span>Play</span>
                    </button>
                    <button onClick={() => { resetAnimations(); setShowMobileTools(false); }} className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 touch-manipulation">
                      <Pause size={18} /> <span>Reset</span>
                    </button>
                  </div>
                </div>
                
                {/* Templates & Effects */}
                <button onClick={() => { setShowTemplates(!showTemplates); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 hover:bg-purple-100 touch-manipulation">
                  <Layers size={20} className="text-purple-600" /> <span className="font-medium">Templates</span>
                </button>
                
                <button onClick={() => { setShowEffectsPanel(!showEffectsPanel); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 touch-manipulation">
                  <Sparkles size={20} className="text-indigo-600" /> <span className="font-medium">Effects</span>
                </button>
                
                <div className="border-t my-3" />
                
                {/* Add Elements */}
                <h3 className="text-xs font-semibold text-gray-500 mb-2">ADD ELEMENTS</h3>
                <button onClick={() => { setCurrentTool('select'); setShowMobileTools(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg touch-manipulation ${currentTool === 'select' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
                  <MousePointer size={20} /> <span>Select</span>
                </button>
                <button onClick={() => { addElement('text'); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 touch-manipulation">
                  <Type size={20} /> <span>Add Text</span>
                </button>
                <button onClick={() => { addElement('rectangle'); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 touch-manipulation">
                  <Square size={20} /> <span>Rectangle</span>
                </button>
                <button onClick={() => { addElement('circle'); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 touch-manipulation">
                  <Circle size={20} /> <span>Circle</span>
                </button>
                <button onClick={() => { addElement('triangle'); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 touch-manipulation">
                  <Triangle size={20} /> <span>Triangle</span>
                </button>
                <button onClick={() => { addElement('star'); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 touch-manipulation">
                  <Star size={20} /> <span>Star</span>
                </button>
                <button onClick={() => { fileInputRef.current?.click(); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 touch-manipulation">
                  <Image size={20} /> <span>Add Image</span>
                </button>
                
                <div className="border-t my-3" />
                
                {/* Zoom Controls */}
                <h3 className="text-xs font-semibold text-gray-500 mb-2">VIEW</h3>
                <div className="flex gap-2">
                  <button onClick={() => { zoom('in'); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-100 touch-manipulation">
                    <ZoomIn size={20} /> <span>Zoom In</span>
                  </button>
                  <button onClick={() => { zoom('out'); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-100 touch-manipulation">
                    <ZoomOut size={20} /> <span>Zoom Out</span>
                  </button>
                </div>
                
                <div className="border-t my-3" />
                
                {/* Undo/Redo & Save */}
                <h3 className="text-xs font-semibold text-gray-500 mb-2">ACTIONS</h3>
                <div className="flex gap-2">
                  <button onClick={undo} disabled={historyIndex <= 0} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 touch-manipulation">
                    <Undo size={20} /> <span>Undo</span>
                  </button>
                  <button onClick={redo} disabled={historyIndex >= history.length - 1} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 touch-manipulation">
                    <Redo size={20} /> <span>Redo</span>
                  </button>
                </div>
                
                <button onClick={() => { handleSaveClick(); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 touch-manipulation">
                  <Save size={20} /> <span>Save Project</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Mobile Properties Drawer */}
        {showMobileProperties && selectedElementData && (
          <>
            <div 
              className="md:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowMobileProperties(false)}
            />
            <div className="md:hidden fixed right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-2xl z-50 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">{t('properties.title')}</h2>
                <button onClick={() => setShowMobileProperties(false)} className="p-3 rounded-lg hover:bg-gray-100 text-2xl leading-none touch-manipulation min-h-[44px] min-w-[44px]">
                  ×
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-2">X</label>
                    <input type="number" value={Math.round(selectedElementData.x)} onChange={(e) => updateElement(selectedElement, { x: parseInt(e.target.value) })} className="w-full px-3 py-3 text-base border rounded-lg touch-manipulation" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2">Y</label>
                    <input type="number" value={Math.round(selectedElementData.y)} onChange={(e) => updateElement(selectedElement, { y: parseInt(e.target.value) })} className="w-full px-3 py-3 text-base border rounded-lg touch-manipulation" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2">Width</label>
                    <input type="number" value={Math.round(selectedElementData.width)} onChange={(e) => updateElement(selectedElement, { width: parseInt(e.target.value) })} className="w-full px-3 py-3 text-base border rounded-lg touch-manipulation" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2">Height</label>
                    <input type="number" value={Math.round(selectedElementData.height)} onChange={(e) => updateElement(selectedElement, { height: parseInt(e.target.value) })} className="w-full px-3 py-3 text-base border rounded-lg touch-manipulation" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-2">Rotation</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="0" max="360" value={selectedElementData.rotation || 0} onChange={(e) => updateElement(selectedElement, { rotation: parseInt(e.target.value) })} className="flex-1 h-8 touch-manipulation" />
                    <span className="text-base font-medium min-w-[50px]">{selectedElementData.rotation || 0}°</span>
                  </div>
                </div>

                {/* Animation Selection for Mobile */}
                <div>
                  <label className="block text-xs font-medium mb-2">Animation</label>
                  <select
                    value={selectedElementData.animation || ''}
                    onChange={(e) => updateElement(selectedElement, { animation: e.target.value || null })}
                    className="w-full px-3 py-3 text-base border rounded-lg touch-manipulation"
                  >
                    <option value="">None</option>
                    {Object.entries(animations).map(([key, anim]) => (
                      <option key={key} value={key}>
                        {anim.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedElementData.type === 'text' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium mb-2">Font Size</label>
                      <input type="number" value={selectedElementData.fontSize} onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) })} className="w-full px-3 py-3 text-base border rounded-lg touch-manipulation" min="8" max="200" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2">Color</label>
                      <input type="color" value={selectedElementData.color} onChange={(e) => updateElement(selectedElement, { color: e.target.value })} className="w-full h-12 rounded-lg cursor-pointer touch-manipulation" />
                    </div>
                  </>
                )}

                {['rectangle', 'circle', 'triangle', 'star', 'hexagon'].includes(selectedElementData.type) && (
                  <>
                    {/* Fill Type Selection for Mobile */}
                    <div>
                      <label className="block text-xs font-medium mb-2">Fill Type</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateElement(selectedElement, { fillType: 'solid' })}
                          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium touch-manipulation ${
                            selectedElementData.fillType === 'solid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          Solid Color
                        </button>
                        <button
                          onClick={() => updateElement(selectedElement, { fillType: 'gradient' })}
                          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium touch-manipulation ${
                            selectedElementData.fillType === 'gradient' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          Gradient
                        </button>
                      </div>
                    </div>

                    {/* Solid Color Picker for Mobile */}
                    {selectedElementData.fillType === 'solid' && (
                      <div>
                        <label className="block text-xs font-medium mb-2">Fill Color</label>
                        <input type="color" value={selectedElementData.fill} onChange={(e) => updateElement(selectedElement, { fill: e.target.value })} className="w-full h-12 rounded-lg cursor-pointer touch-manipulation" />
                      </div>
                    )}

                    {/* Gradient Picker for Mobile */}
                    {selectedElementData.fillType === 'gradient' && (
                      <div>
                        <label className="block text-xs font-medium mb-2">Gradient Fill</label>
                        <GradientPicker
                          key={gradientPickerKey}
                          gradient={selectedElementData.gradient}
                          onGradientChange={(gradient) => updateElement(selectedElement, { gradient })}
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="border-t pt-4 flex gap-2">
                  <button onClick={() => { duplicateElement(selectedElement); setShowMobileProperties(false); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-600 rounded-lg touch-manipulation">
                    <Copy size={18} /> <span>Duplicate</span>
                  </button>
                  <button onClick={() => { deleteElement(selectedElement); setShowMobileProperties(false); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-600 rounded-lg touch-manipulation">
                    <Trash2 size={18} /> <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Save Project Dialog */}
        <SaveDialog 
          show={showSaveDialog}
          projectName={projectName}
          onProjectNameChange={setProjectName}
          onSave={confirmSave}
          onCancel={() => setShowSaveDialog(false)}
        />
      </div>
    </>
  );
};

export default Sowntra;