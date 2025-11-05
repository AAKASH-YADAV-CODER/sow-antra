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
import PropertiesPanel from '../features/canvas/components/PropertiesPanel';
import { MobileToolsDrawer, MobilePropertiesDrawer } from '../features/canvas/components/MobileDrawers';
import MobileFABButtons from '../features/canvas/components/MobileFABButtons';
import CanvasElement from '../features/canvas/components/CanvasElement';
// Style imports
import styles from '../styles/MainPage.module.css';
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
  // history and historyIndex now managed by useHistory hook
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

  // getCurrentPageElements will be provided by useElements hook below

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

  // Export-ready elements with proper filtering (now that getCurrentPageElements is available)
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

  // Calculate selectedElementData (now that getCurrentPageElements is available)
  const selectedElementData = getCurrentPageElements().find(el => el.id === selectedElement);

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

  // Wrapper for drawElementToCanvas from canvasExport utility with imageEffects
  const drawElementToCanvas = useCallback((ctx, element, time, elementIndex) => {
    return drawElementToCanvasUtil(ctx, element, time, elementIndex, imageEffects);
  }, [imageEffects]);

  // Export functions - wrappers that provide current elements and state
  const exportAsSVG = useCallback(() => {
    const currentElements = getCurrentPageElements();
    return exportAsSVGUtil(currentElements, canvasSize);
  }, [getCurrentPageElements, canvasSize]);

  const exportAsImage = useCallback((format) => {
    if (format === 'svg') {
      exportAsSVG();
      return;
    }
    const currentElements = getCurrentPageElements();
    return exportAsImageUtil(currentElements, canvasSize, format, imageEffects);
  }, [getCurrentPageElements, canvasSize, imageEffects, exportAsSVG]);

  const exportAsPDF = useCallback(() => {
    const currentElements = getCurrentPageElements();
    return exportAsPDFUtil(currentElements, canvasSize, imageEffects);
  }, [getCurrentPageElements, canvasSize, imageEffects]);

  // Wrapper functions for imported helpers that need access to state
  const getEffectCSSWrapper = useCallback((element) => {
    return getEffectCSS(element, textEffects, imageEffects, shapeEffects, specialEffects);
  }, []);
  
  const getCanvasEffectsWrapper = useCallback((element) => {
    return getCanvasEffects(element, imageEffects);
  }, [imageEffects]);

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

  // Create custom template
  const createCustomTemplate = useCallback(() => {
    if (customTemplateSize.width > 0 && customTemplateSize.height > 0) {
      setCanvasSize({
        width: customTemplateSize.width,
        height: customTemplateSize.height
      });
      
      setTimeout(() => {
        centerCanvas();
      }, 100);
      
      setShowCustomTemplateModal(false);
      setShowTemplates(false);
    }
  }, [customTemplateSize, centerCanvas]);

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
      let animationId;
      
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
  // Wrapper function to render elements using CanvasElement component
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
