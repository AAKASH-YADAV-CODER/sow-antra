import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Plus, Square, Circle, Triangle, Type, Image, Play, Pause, 
  Copy, Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Download, Save, FolderOpen, Undo, Redo, Group, Ungroup, Move, Minus, 
  Maximize, MinusCircle, PlusCircle, Layers, Grid, MousePointer, ZoomIn,
  ZoomOut, Lock, Unlock, Share, Users, MessageCircle, Star,
  Hexagon, PenTool, ArrowRight, 
  Facebook, Twitter, Linkedin, Music,
  Film, FileText, BookOpen, Printer, Mail, Heart,
  Sticker, Zap, 
  CreditCard, 
  Tv, Smartphone, Monitor,
  Megaphone, 
  User, LogOut, Settings,
  Languages, Sparkles, HelpCircle
} from 'lucide-react';

const Sowntra = () => {
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
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [drawingPath, setDrawingPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textEditing, setTextEditing] = useState(null);
  const [pages, setPages] = useState([{ id: 'page-1', name: 'Page 1', elements: [] }]);
  const [currentPage, setCurrentPage] = useState('page-1');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [lockedElements, setLockedElements] = useState(new Set());
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [textDirection, setTextDirection] = useState('ltr');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [transliterationEnabled, setTransliterationEnabled] = useState(false);
  const [transliterationMap, setTransliterationMap] = useState({});
  const [showLanguageHelp, setShowLanguageHelp] = useState(false);
  const [videoFormat, setVideoFormat] = useState('webm');
  const [videoQuality, setVideoQuality] = useState('high');
  const [recordingDuration, setRecordingDuration] = useState(10);
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(0);
  const [gradientPickerKey, setGradientPickerKey] = useState(0);
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [canvasHighlighted, setCanvasHighlighted] = useState(false);
  
  // New state for custom template
  const [showCustomTemplateModal, setShowCustomTemplateModal] = useState(false);
  const [customTemplateSize, setCustomTemplateSize] = useState({
    width: 800,
    height: 600,
    unit: 'px'
  });

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const floatingToolbarRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const canvasContainerRef = useRef(null);

  // Get current page elements
  const getCurrentPageElements = useCallback(() => {
    const page = pages.find(p => p.id === currentPage);
    return page ? page.elements : [];
  }, [pages, currentPage]);

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
    en: { name: 'English', direction: 'ltr', font: 'Arial' },
    hi: { name: 'Hindi', direction: 'ltr', font: 'Noto Sans Devanagari' },
    ta: { name: 'Tamil', direction: 'ltr', font: 'Noto Sans Tamil' },
    te: { name: 'Telugu', direction: 'ltr', font: 'Noto Sans Telugu' },
    bn: { name: 'Bengali', direction: 'ltr', font: 'Noto Sans Bengali' },
    mr: { name: 'Marathi', direction: 'ltr', font: 'Noto Sans Devanagari' },
    gu: { name: 'Gujarati', direction: 'ltr', font: 'Noto Sans Gujarati' },
    kn: { name: 'Kannada', direction: 'ltr', font: 'Noto Sans Kannada' },
    ml: { name: 'Malayalam', direction: 'ltr', font: 'Noto Sans Malayalam' },
    pa: { name: 'Punjabi', direction: 'ltr', font: 'Noto Sans Gurmukhi' },
    or: { name: 'Odia', direction: 'ltr', font: 'Noto Sans Oriya' },
    ur: { name: 'Urdu', direction: 'rtl', font: 'Noto Sans Arabic' },
    ar: { name: 'Arabic', direction: 'rtl', font: 'Noto Sans Arabic' },
    he: { name: 'Hebrew', direction: 'rtl', font: 'Noto Sans Hebrew' }
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

  // FIXED: Center canvas function - now fits the screen
  const centerCanvas = useCallback(() => {
    const canvasContainer = canvasContainerRef.current;
    if (!canvasContainer) return;

    const containerWidth = canvasContainer.clientWidth;
    const containerHeight = canvasContainer.clientHeight;
    
    // Update canvas size to fill the available space (minus padding)
    const availableWidth = containerWidth - 20; // 10px padding on each side
    const availableHeight = containerHeight - 20; // 10px padding on each side
    
    setCanvasSize({
      width: Math.max(400, availableWidth), // Minimum width of 400px
      height: Math.max(300, availableHeight) // Minimum height of 300px
    });
    
    // Reset canvas offset and zoom since canvas now fills the space
    setCanvasOffset({ x: 0, y: 0 });
    setZoomLevel(1);
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

  // Load transliteration data
  useEffect(() => {
    const loadTransliterationData = async () => {
      try {
        // Tamil transliteration map (English to Tamil)
        const tamilMap = {
          'a': 'அ', 'aa': 'ஆ', 'i': 'இ', 'ii': 'ஈ', 'u': 'உ', 'uu': 'ஊ', 'e': 'எ', 'ee': 'ஏ',
          'ai': 'ஐ', 'o': 'ஒ', 'oo': 'ஓ', 'au': 'ஔ', 'k': 'க', 'ng': 'ங', 'ch': 'ச', 'j': 'ஜ',
          'ny': 'ஞ', 't': 'ட', 'th': 'த்', 'd': 'ட', 'dh': 'த', 'n': 'ன', 'p': 'ப', 'm': 'ம',
          'y': 'ய', 'r': 'ர', 'l': 'ல', 'v': 'வ', 'zh': 'ழ', 'L': 'ள', 'R': 'ற', 'n^': 'ண',
          's': 'ச', 'sh': 'ஷ', 'S': 'ஸ', 'h': 'ஹ', 'q': 'க்', 'w': 'ங்', 'E': 'ச்', 'r^': 'ன்',
          't^': 'ண்', 'y^': 'ம்', 'u^': 'ப்', 'i^': 'வ்'
        };
        
        // Hindi transliteration map (English to Devanagari)
        const hindiMap = {
          'a': 'अ', 'aa': 'आ', 'i': 'इ', 'ee': 'ई', 'u': 'उ', 'oo': 'ऊ', 'e': 'ए', 'ai': 'ऐ',
          'o': 'ओ', 'au': 'औ', 'k': 'क', 'kh': 'ख', 'g': 'ग', 'gh': 'घ', 'ng': 'ङ', 'ch': 'च',
          'chh': 'छ', 'j': 'ज', 'jh': 'झ', 'ny': 'ञ', 't': 'ट', 'th': 'ठ', 'd': 'ड', 'dh': 'ढ',
          'n': 'ण', 't^': 'त', 'th^': 'थ', 'd^': 'द', 'dh^': 'ध', 'n^': 'न', 'p': 'प', 'ph': 'फ',
          'b': 'ब', 'bh': 'भ', 'm': 'म', 'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'sh': 'श',
          'shh': 'ष', 's': 'س', 'h': 'ह'
        };
        
        // Set the appropriate map based on current language
        if (currentLanguage === 'ta') {
          setTransliterationMap(tamilMap);
        } else if (currentLanguage === 'hi') {
          setTransliterationMap(hindiMap);
        } else {
          setTransliterationMap({});
        }
      } catch (error) {
        console.error('Error loading transliteration data:', error);
      }
    };
    
    loadTransliterationData();
  }, [currentLanguage]);

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
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 50 : 100,
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
      stroke: properties.stroke || '#000000',
      strokeWidth: properties.strokeWidth || 2,
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
      ...properties
    };

    if (type === 'text') {
      newElement.content = 'Double click to edit';
      newElement.fontSize = 24;
      newElement.fontFamily = supportedLanguages[currentLanguage]?.font || 'Arial';
      newElement.fontWeight = 'normal';
      newElement.fontStyle = 'normal';
      newElement.textDecoration = 'none';
      newElement.color = '#000000';
      newElement.textAlign = textDirection === 'rtl' ? 'right' : 'left';
    } else if (type === 'rectangle') {
      newElement.borderRadius = 0;
    } else if (type === 'image') {
      newElement.src = properties.src || '';
      newElement.borderRadius = 0;
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
  }, [getCurrentPageElements, setCurrentPageElements, saveToHistory, currentLanguage, textDirection]);

  // FIXED: Enhanced applyTemplate function with proper centering and auto-zoom
  const applyTemplate = useCallback((platform) => {
    if (platform === 'custom') {
      setShowCustomTemplateModal(true);
      return;
    }
    
    const template = socialMediaTemplates[platform];
    if (template) {
      // Set the new canvas size
      setCanvasSize({ width: template.width, height: template.height });
      
      // Calculate optimal zoom to fit the template
      const calculateOptimalZoom = () => {
        const canvasContainer = canvasContainerRef.current;
        if (!canvasContainer) return 1;
        
        const containerWidth = canvasContainer.clientWidth - 80; // Account for padding
        const containerHeight = canvasContainer.clientHeight - 80;
        
        if (containerWidth <= 0 || containerHeight <= 0) return 1;
        
        const widthRatio = containerWidth / template.width;
        const heightRatio = containerHeight / template.height;
        
        // Use the smaller ratio to ensure the entire template fits
        const optimalZoom = Math.min(widthRatio, heightRatio, 1);
        return Math.max(0.1, optimalZoom);
      };
      
      // Reset canvas offset to center
      setCanvasOffset({ x: 0, y: 0 });
      
      // Set the optimal zoom after DOM update
      setTimeout(() => {
        const optimalZoom = calculateOptimalZoom();
        setZoomLevel(optimalZoom);
        
        // Center the canvas
        centerCanvas();
      }, 100);
      
      setShowTemplates(false);
    }
  }, [centerCanvas]);

  // FIXED: Create custom template function with proper centering
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
    
    // Calculate optimal zoom
    const calculateOptimalZoom = () => {
      const canvasContainer = canvasContainerRef.current;
      if (!canvasContainer) return 1;
      
      const containerWidth = canvasContainer.clientWidth - 80;
      const containerHeight = canvasContainer.clientHeight - 80;
      
      if (containerWidth <= 0 || containerHeight <= 0) return 1;
      
      const widthRatio = containerWidth / width;
      const heightRatio = containerHeight / height;
      
      const optimalZoom = Math.min(widthRatio, heightRatio, 1);
      return Math.max(0.1, optimalZoom);
    };
    
    // Reset canvas offset
    setCanvasOffset({ x: 0, y: 0 });
    
    // Apply zoom and center
    setTimeout(() => {
      const optimalZoom = calculateOptimalZoom();
      setZoomLevel(optimalZoom);
      centerCanvas();
    }, 100);
    
    setShowCustomTemplateModal(false);
    setShowTemplates(false);
  }, [customTemplateSize, centerCanvas]);

  // Auto-center when zoom changes or canvas resizes
  useEffect(() => {
    centerCanvas();
  }, [zoomLevel, canvasSize, centerCanvas]);

  // Auto-center on window resize
  useEffect(() => {
    const handleResize = () => {
      centerCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [centerCanvas]);

  // Fixed Gradient Picker Component
  const GradientPicker = ({ gradient, onGradientChange }) => {
    const [localGradient, setLocalGradient] = useState(() => {
      // Ensure we have a valid gradient structure
      const defaultGradient = {
        type: 'linear',
        colors: ['#3b82f6', '#ef4444'],
        stops: [0, 100],
        angle: 90,
        position: { x: 50, y: 50 }
      };
      
      return gradient ? { ...defaultGradient, ...gradient } : defaultGradient;
    });

    // Sync with parent component's gradient - with validation
    useEffect(() => {
      if (gradient) {
        const validatedGradient = {
          type: gradient.type || 'linear',
          colors: (gradient.colors && Array.isArray(gradient.colors) && gradient.colors.length > 0) 
            ? gradient.colors.filter(color => color && typeof color === 'string') 
            : ['#3b82f6', '#ef4444'],
          stops: (gradient.stops && Array.isArray(gradient.stops)) 
            ? gradient.stops.map(stop => Math.max(0, Math.min(100, stop || 0)))
            : [0, 100],
          angle: gradient.angle || 90,
          position: gradient.position || { x: 50, y: 50 }
        };
        
        setLocalGradient(validatedGradient);
      }
    }, [gradient]);

    const updateGradient = (updates) => {
      const newGradient = { ...localGradient, ...updates };
      setLocalGradient(newGradient);
      onGradientChange(newGradient);
    };

    const addColorStop = () => {
      if (localGradient.colors.length >= 5) return;
      
      const newColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
      const newColors = [...localGradient.colors, newColor];
      
      // Calculate new stop position more reliably
      const newStops = [...localGradient.stops];
      if (newStops.length === 0) {
        newStops.push(0, 100);
      } else if (newStops.length === 1) {
        newStops.push(50, 100);
      } else {
        // Find the largest gap and insert in the middle
        let maxGap = 0;
        let insertIndex = 0;
        
        for (let i = 0; i < newStops.length - 1; i++) {
          const gap = newStops[i + 1] - newStops[i];
          if (gap > maxGap) {
            maxGap = gap;
            insertIndex = i + 1;
          }
        }
        
        const newStop = newStops[insertIndex - 1] + Math.floor(maxGap / 2);
        newStops.splice(insertIndex, 0, newStop);
      }
      
      updateGradient({ colors: newColors, stops: newStops });
    };

    const removeColorStop = (index) => {
      if (localGradient.colors.length <= 2) return;
      const newColors = localGradient.colors.filter((_, i) => i !== index);
      const newStops = localGradient.stops.filter((_, i) => i !== index);
      updateGradient({ colors: newColors, stops: newStops });
    };

    const updateColorStop = (index, color) => {
      const newColors = [...localGradient.colors];
      newColors[index] = color;
      updateGradient({ colors: newColors });
    };

    const updateStopPosition = (index, position) => {
      const newStops = [...localGradient.stops];
      newStops[index] = Math.max(0, Math.min(100, parseInt(position) || 0));
      
      // Sort stops and colors together
      const sortedPairs = newStops.map((stop, i) => ({
        stop,
        color: localGradient.colors[i]
      })).sort((a, b) => a.stop - b.stop);
      
      const sortedStops = sortedPairs.map(pair => pair.stop);
      const sortedColors = sortedPairs.map(pair => pair.color);
      
      updateGradient({ stops: sortedStops, colors: sortedColors });
    };

    const getGradientString = () => {
      if (!localGradient.colors || localGradient.colors.length === 0) {
        return 'linear-gradient(90deg, #3b82f6 0%, #ef4444 100%)';
      }
      
      const colorStops = localGradient.colors.map((color, i) => 
        `${color} ${localGradient.stops[i]}%`
      ).join(', ');
      
      if (localGradient.type === 'linear') {
        return `linear-gradient(${localGradient.angle || 0}deg, ${colorStops})`;
      } else {
        return `radial-gradient(circle at ${localGradient.position?.x || 50}% ${localGradient.position?.y || 50}%, ${colorStops})`;
      }
    };

    const gradientPresets = [
      { colors: ['#ff6b6b', '#4ecdc4'], stops: [0, 100], angle: 90, type: 'linear' },
      { colors: ['#667eea', '#764ba2'], stops: [0, 100], angle: 90, type: 'linear' },
      { colors: ['#f093fb', '#f5576c'], stops: [0, 100], angle: 90, type: 'linear' },
      { colors: ['#4facfe', '#00f2fe'], stops: [0, 100], angle: 90, type: 'linear' },
      { colors: ['#43e97b', '#38f9d7'], stops: [0, 100], angle: 90, type: 'linear' },
      { colors: ['#fa709a', '#fee140'], stops: [0, 100], angle: 90, type: 'linear' },
      { colors: ['#30cfd0', '#330867'], stops: [0, 100], angle: 90, type: 'linear' },
      { colors: ['#a8edea', '#fed6e3'], stops: [0, 100], angle: 90, type: 'linear' },
      { colors: ['#5ee7df', '#b490ca'], stops: [0, 100], angle: 90, type: 'linear' }
    ];

    const applyPreset = (preset) => {
      updateGradient({
        colors: [...preset.colors],
        stops: [...preset.stops],
        angle: preset.angle || 90,
        type: preset.type || 'linear',
        position: preset.position || { x: 50, y: 50 }
      });
    };

    return (
      <div key={gradientPickerKey} className="gradient-picker mt-3 p-3 bg-gray-50 rounded border">
        <div className="mb-3">
          <label className="block text-sm font-medium mb-2">Gradient Type</label>
          <div className="flex space-x-2">
            {['linear', 'radial'].map(type => (
              <button
                key={type}
                onClick={() => updateGradient({ type })}
                className={`p-2 rounded text-xs flex-1 ${
                  localGradient.type === type ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'bg-gray-100 border border-gray-300'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <div 
            className="w-full h-8 rounded border border-gray-300 mb-2 gradient-fix"
            style={{ background: getGradientString() }}
          />
          <div className="text-xs text-gray-500 text-center">
            {localGradient.colors.length} color stops
          </div>
        </div>

        {localGradient.type === 'linear' && (
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Angle: {localGradient.angle || 0}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={localGradient.angle || 0}
              onChange={(e) => updateGradient({ angle: parseInt(e.target.value) || 0 })}
              className="w-full"
            />
          </div>
        )}

        {localGradient.type === 'radial' && (
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Position</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs block mb-1">X: {localGradient.position?.x || 50}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localGradient.position?.x || 50}
                  onChange={(e) => updateGradient({ 
                    position: { 
                      ...localGradient.position, 
                      x: parseInt(e.target.value) || 50 
                    }
                  })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs block mb-1">Y: {localGradient.position?.y || 50}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localGradient.position?.y || 50}
                  onChange={(e) => updateGradient({ 
                    position: { 
                      ...localGradient.position, 
                      y: parseInt(e.target.value) || 50 
                    }
                  })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Color Stops</label>
            <button
              onClick={addColorStop}
              disabled={localGradient.colors.length >= 5}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded disabled:opacity-50"
            >
              Add Color +
            </button>
          </div>
          
          <div className="space-y-3">
            {localGradient.colors.map((color, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => updateColorStop(index, e.target.value)}
                    className="w-8 h-8 cursor-pointer rounded border"
                  />
                  <span className="text-xs w-12 font-mono">{localGradient.stops[index]}%</span>
                </div>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={localGradient.stops[index]}
                    onChange={(e) => updateStopPosition(index, e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <button
                  onClick={() => removeColorStop(index)}
                  disabled={localGradient.colors.length <= 2}
                  className="p-1 text-red-500 hover:text-red-700 disabled:opacity-30 transition-colors"
                  title="Remove color stop"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-2">Quick Presets</label>
          <div className="grid grid-cols-3 gap-2">
            {gradientPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset)}
                className="h-8 rounded border border-gray-300 hover:border-blue-400 hover:scale-105 transition-all duration-200 gradient-fix"
                style={{
                  background: `linear-gradient(90deg, ${preset.colors[0]} ${preset.stops[0]}%, ${preset.colors[1]} ${preset.stops[1]}%)`
                }}
                title={`Preset ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

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
        if (filter && filter.value > 0 || (key === 'opacity' && filter.value < 100)) {
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
        setResizeDirection(direction);
        
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

    return (
      <div
        style={{
          position: 'absolute',
          left: element.x - 10,
          top: element.y - 10,
          width: element.width + 20,
          height: element.height + 20,
          pointerEvents: 'none',
          transform: `rotate(${element.rotation || 0}deg)`,
          zIndex: element.zIndex + 1000
        }}
      >
        {/* Selection border */}
        <div
          style={{
            position: 'absolute',
            left: 10,
            top: 10,
            width: element.width,
            height: element.height,
            border: `2px dashed ${connectionLineColor}`,
            borderRadius: '2px'
          }}
        />

        {/* Handles */}
        {handles.map((handle, index) => (
          <div
            key={index}
            style={{
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
            }}
            onMouseDown={(e) => handleMouseDown(e, 'resize', handle.type)}
          />
        ))}

        {/* Rotate handle */}
        <div
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
      setResizeDirection(direction);
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
    setResizeDirection('');
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
  const handleTextChange = useCallback((e, elementId) => {
    let newContent = e.target.textContent;
    
    if (transliterationEnabled && Object.keys(transliterationMap).length > 0) {
      let transliteratedContent = newContent;
      
      Object.entries(transliterationMap).forEach(([english, native]) => {
        const regex = new RegExp(english, 'gi');
        transliteratedContent = transliteratedContent.replace(regex, native);
      });
      
      newContent = transliteratedContent;
      
      if (e.target.textContent !== newContent) {
        e.target.textContent = newContent;
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(e.target);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    
    updateElement(elementId, { content: newContent });
  }, [transliterationEnabled, transliterationMap, updateElement]);

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

  // Enhanced drawElementToCanvas function with effects support
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
    
    // Apply filters
    if (element.filters) {
      const filterCSS = getFilterCSS(element.filters);
      if (filterCSS) {
        ctx.filter = filterCSS;
      }
    }
    
    // Apply image effects
    if (element.type === 'image' && element.imageEffect && element.imageEffect !== 'none') {
      const effect = imageEffects[element.imageEffect];
      if (effect && effect.filter) {
        ctx.filter += ' ' + effect.filter;
      }
    }
    
    ctx.globalAlpha = opacity;
    
    const backgroundStyle = getBackgroundStyle(element);
    
    if (element.type === 'rectangle') {
      ctx.fillStyle = backgroundStyle;
      ctx.strokeStyle = element.stroke;
      ctx.lineWidth = element.strokeWidth;
      ctx.beginPath();
      ctx.roundRect(element.x, element.y, element.width, element.height, element.borderRadius);
      ctx.fill();
      if (element.strokeWidth > 0) ctx.stroke();
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
      
      ctx.fillText(displayText, textX, element.y + element.fontSize);
    } else if (element.type === 'image') {
      const img = new window.Image();
      img.src = element.src;
      ctx.drawImage(img, element.x, element.y, element.width, element.height);
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
      if (element.path.length < 2) return null;
      
      let pathData = 'M ' + element.path[0].x + ' ' + element.path[0].y;
      for (let i = 1; i < element.path.length; i++) {
        pathData += ' L ' + element.path[i].x + ' ' + element.path[i].y;
      }
      let content;
      content = (
        <svg
          id={`element-${element.id}`}
          style={{ ...element.style }}
          onMouseDown={(e) => !element.locked && handleMouseDown(e, element.id)}
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
  }, [getFilterCSS, getBackgroundStyle, imageEffects]);

  // Export as image
  const exportAsImage = useCallback((format) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    const currentElements = getCurrentPageElements();
    const imageElements = currentElements.filter(el => el.type === 'image');
    
    if (imageElements.length > 0) {
      let loadedImages = 0;
      const totalImages = imageElements.length;
      
      const drawAllElements = () => {
        currentElements.forEach(element => {
          if (element.type !== 'image') {
            drawElementToCanvas(ctx, element);
          }
        });
        
        try {
          const dataUrl = canvas.toDataURL(`image/${format}`);
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `sowntra-design.${format}`;
          a.click();
        } catch (error) {
          console.error('Error exporting canvas:', error);
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
          ctx.save();
          ctx.translate(element.x + element.width/2, element.y + element.height/2);
          ctx.rotate((element.rotation || 0) * Math.PI / 180);
          ctx.translate(-element.x - element.width/2, -element.y - element.height/2);
          
          ctx.drawImage(img, element.x, element.y, element.width, element.height);
          ctx.restore();
          checkAllLoaded();
        };
        img.onerror = checkAllLoaded;
      });
    } else {
      currentElements.forEach(element => {
        drawElementToCanvas(ctx, element);
      });
      
      try {
        const dataUrl = canvas.toDataURL(`image/${format}`);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `sowntra-design.${format}`;
        a.click();
      } catch (error) {
        console.error('Error exporting canvas:', error);
        alert('Error exporting image. Please try again.');
      }
    }
  }, [canvasSize, getCurrentPageElements, drawElementToCanvas]);

  // Zoom in/out
  const zoom = useCallback((direction) => {
    const newZoom = direction === 'in' 
      ? Math.min(zoomLevel + 0.1, 3)
      : Math.max(zoomLevel - 0.1, 0.5);
    
    setZoomLevel(newZoom);
  }, [zoomLevel]);

  // Reset zoom and pan
  const resetView = useCallback(() => {
    setZoomLevel(1);
    setCanvasOffset({ x: 0, y: 0 });
  }, []);

  // Handle canvas mouse enter/leave for highlighting
  const handleCanvasMouseEnter = useCallback(() => {
    setCanvasHighlighted(true);
  }, []);

  const handleCanvasMouseLeave = useCallback(() => {
    setCanvasHighlighted(false);
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
      if (!checkRecordingCompatibility()) return;
      
      await preloadImages();
      
      setRecording(true);
      setRecordingTimeLeft(recordingDuration);
      
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
        } catch (error) {
          console.error('Error creating download:', error);
          alert('Error creating video file. Please try again.');
        } finally {
          setRecording(false);
          setRecordingTimeLeft(0);
          clearInterval(recordingIntervalRef.current);
        }
      };
      
      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        alert('Error during recording: ' + event.error.message);
        setRecording(false);
        setRecordingTimeLeft(0);
        clearInterval(recordingIntervalRef.current);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setRecordedChunks(chunks);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(recordingIntervalRef.current);
            if (recorder.state === 'recording') {
              recorder.stop();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      let startTime = null;
      const frameDuration = 1000 / 30;
      let lastFrameTime = 0;
      
      const drawAnimationFrame = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        
        if (recorder.state === 'recording' && elapsed < recordingDuration * 1000) {
          if (timestamp - lastFrameTime >= frameDuration) {
            lastFrameTime = timestamp;
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const currentElements = getCurrentPageElements();
            const sortedElements = [...currentElements].sort((a, b) => a.zIndex - b.zIndex);
            
            sortedElements.forEach((element, index) => {
              const animationProgress = Math.min(elapsed / 1000, recordingDuration);
              drawElementToCanvas(ctx, element, animationProgress, index);
            });
          }
          
          requestAnimationFrame(drawAnimationFrame);
        } else if (recorder.state === 'recording') {
          recorder.stop();
          clearInterval(recordingIntervalRef.current);
        }
      };
      
      requestAnimationFrame(drawAnimationFrame);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error starting recording: ' + error.message);
      setRecording(false);
      setRecordingTimeLeft(0);
      clearInterval(recordingIntervalRef.current);
    }
  }, [canvasSize, getCurrentPageElements, drawElementToCanvas, recordingDuration, videoQuality, checkRecordingCompatibility, preloadImages, videoFormat]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    setRecording(false);
    setRecordingTimeLeft(0);
    clearInterval(recordingIntervalRef.current);
  }, [mediaRecorder]);

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
      <h3 className="font-semibold mb-2">Video Settings</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Format</label>
          <select
            value={videoFormat}
            onChange={(e) => setVideoFormat(e.target.value)}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="webm">WebM (Recommended)</option>
            <option value="mp4">MP4 (Limited Browser Support)</option>
            <option value="gif">GIF (Animated)</option>
          </select>
          {videoFormat === 'mp4' && (
            <p className="text-xs text-orange-600 mt-1">
              MP4 may not work in all browsers
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Quality</label>
          <select
            value={videoQuality}
            onChange={(e) => setVideoQuality(e.target.value)}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="low">Low (Smaller file)</option>
            <option value="medium">Medium</option>
            <option value="high">High (Better quality)</option>
          </select>
        </div>
      </div>
      
      <div className="mt-3">
        <label className="block text-sm font-medium mb-1">
          Duration: {recordingDuration} seconds
        </label>
        <input
          type="range"
          min="3"
          max="30"
          value={recordingDuration}
          onChange={(e) => setRecordingDuration(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  ), [videoFormat, videoQuality, recordingDuration]);

  // Recording Status Component
  const RecordingStatus = useCallback(() => {
    if (!recording) return null;
    
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg z-50">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
          <span>Recording... {recordingTimeLeft}s</span>
        </div>
      </div>
    );
  }, [recording, recordingTimeLeft]);

  // Language Help Modal
  const LanguageHelpModal = useCallback(() => {
    if (!showLanguageHelp) return null;
    
    const getLanguageInstructions = () => {
      switch(currentLanguage) {
        case 'ta':
          return (
            <div>
              <h3 className="font-bold mb-2">Typing in Tamil</h3>
              <p className="text-sm mb-2">You can type Tamil using either:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>Virtual Keyboard:</strong> Click on the Tamil characters shown on the screen keyboard</li>
                <li><strong>Transliteration:</strong> Enable transliteration and type English letters that sound like Tamil words</li>
                <li><strong>System Keyboard:</strong> Set up Tamil input on your operating system</li>
              </ul>
              <div className="mt-4 p-2 bg-gray-100 rounded">
                <p className="text-sm font-semibold">Common transliterations:</p>
                <p className="text-sm">nandri = நன்றி (Thank you)</p>
                <p className="text-sm">vanakkam = வணக்கம் (Hello)</p>
                <p className="text-sm">tamil = தமிழ் (Tamil)</p>
              </div>
            </div>
          );
        case 'hi':
          return (
            <div>
              <h3 className="font-bold mb-2">Typing in Hindi</h3>
              <p className="text-sm mb-2">You can type Hindi using either:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>Virtual Keyboard:</strong> Click on the Devanagari characters shown on the screen keyboard</li>
                <li><strong>Transliteration:</strong> Enable transliteration and type English letters that sound like Hindi words</li>
                <li><strong>System Keyboard:</strong> Set up Hindi input on your operating system</li>
              </ul>
              <div className="mt-4 p-2 bg-gray-100 rounded">
                <p className="text-sm font-semibold">Common transliterations:</p>
                <p className="text-sm">dhanyavaad = धन्यवाद (Thank you)</p>
                <p className="text-sm">namaste = नमस्ते (Hello)</p>
                <p className="text-sm">bhaarat = भारत (India)</p>
              </div>
            </div>
          );
        default:
          return <p className="text-sm">Select an Indian language to see typing instructions.</p>;
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Typing Help - {supportedLanguages[currentLanguage]?.name}</h2>
            <button 
              onClick={() => setShowLanguageHelp(false)}
              className="p-1 rounded hover:bg-gray-200"
            >
              ×
            </button>
          </div>
          {getLanguageInstructions()}
          <button 
            onClick={() => setShowLanguageHelp(false)}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }, [showLanguageHelp, currentLanguage]);

  // Effects Panel Component
  const EffectsPanel = useCallback(() => {
    if (!showEffectsPanel || !selectedElementData) return null;
    
    return (
      <div className="fixed right-80 top-20 bg-white shadow-lg rounded-lg p-4 w-80 z-40">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Effects</h3>
          <button 
            onClick={() => setShowEffectsPanel(false)}
            className="p-1 rounded hover:bg-gray-200"
          >
            ×
          </button>
        </div>
        
        {/* Text Effects */}
        {selectedElementData.type === 'text' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Text Effects</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(textEffects).map(([key, effect]) => (
                <button
                  key={key}
                  onClick={() => updateElement(selectedElement, { textEffect: key })}
                  className={`p-2 rounded text-xs ${
                    selectedElementData.textEffect === key 
                      ? 'bg-blue-100 text-blue-600 border border-blue-300' 
                      : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {effect.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Image Effects */}
        {selectedElementData.type === 'image' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Image Effects</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(imageEffects).map(([key, effect]) => (
                <button
                  key={key}
                  onClick={() => updateElement(selectedElement, { imageEffect: key })}
                  className={`p-2 rounded text-xs ${
                    selectedElementData.imageEffect === key 
                      ? 'bg-blue-100 text-blue-600 border border-blue-300' 
                      : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {effect.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Shape Effects */}
        {['rectangle', 'circle', 'triangle', 'star', 'hexagon'].includes(selectedElementData.type) && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Shape Effects</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(shapeEffects).map(([key, effect]) => (
                <button
                  key={key}
                  onClick={() => updateElement(selectedElement, { shapeEffect: key })}
                  className={`p-2 rounded text-xs ${
                    selectedElementData.shapeEffect === key 
                      ? 'bg-blue-100 text-blue-600 border border-blue-300' 
                      : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {effect.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Special Effects for All Elements */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Special Effects</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(specialEffects).map(([key, effect]) => (
              <button
                key={key}
                onClick={() => updateElement(selectedElement, { specialEffect: key })}
                className={`p-2 rounded text-xs ${
                  selectedElementData.specialEffect === key 
                    ? 'bg-blue-100 text-blue-600 border border-blue-300' 
                    : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {effect.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }, [showEffectsPanel, selectedElementData, selectedElement, updateElement]);

  // Custom Template Modal Component
  const CustomTemplateModal = useCallback(() => {
    if (!showCustomTemplateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Custom Template Size</h2>
            <button 
              onClick={() => setShowCustomTemplateModal(false)}
              className="p-1 rounded hover:bg-gray-200"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Width</label>
                <input
                  type="number"
                  value={customTemplateSize.width}
                  onChange={(e) => setCustomTemplateSize(prev => ({
                    ...prev,
                    width: parseInt(e.target.value) || 800
                  }))}
                  className="w-full p-2 border rounded"
                  min="100"
                  max="10000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <select
                  value={customTemplateSize.unit}
                  onChange={(e) => setCustomTemplateSize(prev => ({
                    ...prev,
                    unit: e.target.value
                  }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="px">px</option>
                  <option value="in">in</option>
                  <option value="mm">mm</option>
                  <option value="cm">cm</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Height</label>
              <input
                type="number"
                value={customTemplateSize.height}
                onChange={(e) => setCustomTemplateSize(prev => ({
                  ...prev,
                  height: parseInt(e.target.value) || 600
                }))}
                className="w-full p-2 border rounded"
                min="100"
                max="10000"
              />
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">
                <strong>Preview:</strong> {customTemplateSize.width} × {customTemplateSize.height} {customTemplateSize.unit}
                <br />
                {customTemplateSize.unit !== 'px' && (
                  <span className="text-xs">
                    Approximately: {Math.round(customTemplateSize.width * (customTemplateSize.unit === 'in' ? 96 : customTemplateSize.unit === 'mm' ? 3.78 : 37.8))} × {Math.round(customTemplateSize.height * (customTemplateSize.unit === 'in' ? 96 : customTemplateSize.unit === 'mm' ? 3.78 : 37.8))} pixels
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCustomTemplateModal(false)}
                className="flex-1 p-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={createCustomTemplate}
                className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create Design
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [showCustomTemplateModal, customTemplateSize, createCustomTemplate]);

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
      content = (
        <div
          id={`element-${element.id}`}
          style={{
            ...style,
            fontSize: element.fontSize,
            fontFamily: needsComplexScript ? supportedLanguages[currentLanguage]?.font : element.fontFamily,
            fontWeight: element.fontWeight,
            fontStyle: element.fontStyle,
            textDecoration: element.textDecoration,
            color: element.color,
            textAlign: isRTL ? 'right' : element.textAlign,
            display: 'flex',
            alignItems: 'center',
            cursor: isLocked ? 'not-allowed' : (isEditing ? 'text' : 'move'),
            outline: 'none',
            userSelect: isEditing ? 'text' : 'none',
            minHeight: element.height,
            minWidth: element.width,
            padding: '4px',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
          className={`${needsComplexScript ? 'complex-script' : ''} ${element.fillType === 'gradient' ? 'gradient-fix' : ''}`}
          contentEditable={!isLocked && isEditing}
          suppressContentEditableWarning={true}
          onBlur={(e) => {
            const newContent = e.target.textContent || '';
            updateElement(element.id, { content: newContent });
            setTextEditing(null);
          }}
          onInput={(e) => {
            // Only update on blur, not on every input
            // This prevents cursor jumping during typing
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
      content = (
        <div
          id={`element-${element.id}`}
          className={element.fillType === 'gradient' ? 'gradient-fix' : ''}
          style={{
            ...style,
            backgroundColor: element.fillType === 'solid' ? element.fill : 'transparent',
            background: element.fillType === 'gradient' ? getBackgroundStyle(element) : 'none',
            border: `${element.strokeWidth}px solid ${element.stroke}`,
            borderRadius: element.borderRadius,
          }}
          onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
        />
      );
    } else if (element.type === 'circle') {
      content = (
        <div
          id={`element-${element.id}`}
          className={element.fillType === 'gradient' ? 'gradient-fix' : ''}
          style={{
            ...style,
            backgroundColor: element.fillType === 'solid' ? element.fill : 'transparent',
            background: element.fillType === 'gradient' ? getBackgroundStyle(element) : 'none',
            border: `${element.strokeWidth}px solid ${element.stroke}`,
            borderRadius: '50%',
          }}
          onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
        />
      );
    } else if (element.type === 'triangle') {
      content = (
        <div
          id={`element-${element.id}`}
          className={element.fillType === 'gradient' ? 'gradient-fix' : ''}
          style={{
            ...style,
            width: 0,
            height: 0,
            borderLeft: `${element.width/2}px solid transparent`,
            borderRight: `${element.width/2}px solid transparent`,
            borderBottom: `${element.height}px solid ${element.fillType === 'solid' ? element.fill : getBackgroundStyle(element)}`,
            borderTop: 'none',
            background: element.fillType === 'gradient' ? getBackgroundStyle(element) : 'none'
          }}
          onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
        />
      );
    } else if (element.type === 'image') {
      content = (
        <img
          id={`element-${element.id}`}
          src={element.src}
          alt=""
          style={{
            ...style,
            objectFit: 'cover',
            borderRadius: element.borderRadius,
          }}
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
      <div key={element.id}>
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
      </div>
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

          .toolbar-button {
            padding: 8px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            cursor: pointer;
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
          }

          .dropdown-item:hover {
            background-color: #f1f5f9;
          }

          /* FIXED: Canvas container that fills the screen */
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
          }

          .main-content {
            display: flex;
            flex: 1;
            overflow: hidden;
            min-height: 0;
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

          .tools-panel {
            width: 64px;
            background: white;
            border-right: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px 0;
          }

          .main-header {
            height: 60px;
            background: linear-gradient(135deg, #f5f6f8ff 0%, #bd83f8ff 100%);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            color: white;
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
        `}
      </style>
      
      <div className={`h-screen flex flex-col ${textDirection === 'rtl' ? 'rtl-layout' : ''}`}>
        {/* Header */}
        <div className="main-header">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold flex items-center">
              <span className="handwritten-logo">Sowntra</span>
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={() => zoom('in')}
                className="p-2 rounded hover:bg-white/20"
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={() => zoom('out')}
                className="p-2 rounded hover:bg-white/20"
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={centerCanvas}
                className="p-2 rounded hover:bg-white/20"
                title="Fit to Viewport"
              >
                <Maximize size={18} />
              </button>
              <span className="px-2 py-1 bg-white/20 rounded text-sm">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`px-3 py-2 rounded flex items-center ${showTemplates ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'}`}
            >
              <Layers size={16} className="mr-1" />
              Templates
            </button>
            <button
              onClick={() => setShowEffectsPanel(!showEffectsPanel)}
              className={`px-3 py-2 rounded flex items-center ${showEffectsPanel ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'}`}
            >
              <Sparkles size={16} className="mr-1" />
              Effects
            </button>
            <button
              onClick={playAnimations}
              disabled={isPlaying}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center"
            >
              <Play size={16} className="mr-1" />
              Play
            </button>
            <button
              onClick={resetAnimations}
              className="px-3 py-2 bg-white/20 text-white rounded hover:bg-white/30 flex items-center"
            >
              <Pause size={16} className="mr-1" />
              Reset
            </button>
            {recording ? (
              <button
                onClick={stopRecording}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
            >
                <Square size={16} className="mr-1" />
                Stop Recording
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
              >
                <Film size={16} className="mr-1" />
                Record Video
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="p-2 rounded hover:bg-white/20"
                title="Language"
              >
                <Languages size={20} />
              </button>
              {showLanguageMenu && (
                <div className="dropdown-menu" style={{ width: '200px' }}>
                  <div className="font-semibold px-3 py-2 border-b">Select Language</div>
                  {Object.entries(supportedLanguages).map(([code, lang]) => (
                    <div
                      key={code}
                      className={`dropdown-item ${currentLanguage === code ? 'bg-blue-100' : ''}`}
                      onClick={() => {
                        setCurrentLanguage(code);
                        setShowLanguageMenu(false);
                        setGradientPickerKey(prev => prev + 1);
                      }}
                    >
                      <span>{lang.name}</span>
                    </div>
                  ))}
                  <div className="border-t mt-1">
                    <div
                      className="dropdown-item text-blue-500"
                      onClick={() => {
                        setShowLanguageHelp(true);
                        setShowLanguageMenu(false);
                      }}
                    >
                      <HelpCircle size={16} className="mr-2" />
                      Typing Help
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 rounded hover:bg-white/20"
                title="Share"
              >
                <Share size={20} />
              </button>
              {showShareMenu && (
                <div className="dropdown-menu">
                  <div className="dropdown-item">
                    <Copy size={16} />
                    Copy Link
                  </div>
                  <div className="dropdown-item">
                    <Mail size={16} />
                    Email
                  </div>
                  <div className="dropdown-item">
                    <Facebook size={16} />
                    Facebook
                  </div>
                  <div className="dropdown-item">
                    <Twitter size={16} />
                    Twitter
                  </div>
                  <div className="dropdown-item">
                    <Linkedin size={16} />
                    LinkedIn
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="p-2 rounded hover:bg-white/20"
                title="Account"
              >
                <User size={20} />
              </button>
              {showAccountMenu && (
                <div className="dropdown-menu">
                  <div className="dropdown-item">
                    <User size={16} />
                    Profile
                  </div>
                  <div className="dropdown-item">
                    <Settings size={16} />
                    Settings
                  </div>
                  <div className="dropdown-item">
                    <LogOut size={16} />
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Template Selector */}
        {showTemplates && (
          <div className="bg-white shadow-sm p-3 border-b">
            <h3 className="font-semibold mb-2">Select Template</h3>
            <div className="template-grid">
              {/* Custom Template Option */}
              <button
                onClick={() => applyTemplate('custom')}
                className="template-button"
              >
                <div className="mb-1"><Plus size={24} /></div>
                <div className="text-xs text-center">Custom Size</div>
                <div className="text-xs text-gray-500 mt-1">Create your own</div>
              </button>
              
              {Object.entries(socialMediaTemplates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => applyTemplate(key)}
                  className="template-button"
                >
                  <div className="mb-1">{template.icon}</div>
                  <div className="text-xs text-center">{template.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{template.width}×{template.height}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Template Modal */}
        <CustomTemplateModal />

        {/* Pages Navigation */}
        <div className="bg-white shadow-sm p-2 border-b flex items-center space-x-2">
          <span className="text-sm font-medium">Pages:</span>
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              className={`px-3 py-1 rounded text-sm ${currentPage === page.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {page.name}
            </button>
          ))}
          <button
            onClick={addNewPage}
            className="p-1 rounded hover:bg-gray-100"
            title="Add Page"
          >
            <Plus size={16} />
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
          {/* Left Tools Panel */}
          <div className="tools-panel">
            <h2 className="text-sm font-bold mb-4 text-center">Tools</h2>
            
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
              <button
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
              </button>
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
                padding: '10px',
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
                    width: '100%',
                    height: '100%',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
                    position: 'relative',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    minWidth: '400px',
                    minHeight: '300px'
                  }}
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseEnter={handleCanvasMouseEnter}
                  onMouseLeave={handleCanvasMouseLeave}
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

          {/* Right Properties Panel */}
          <div className="properties-panel">
            {/* Properties Section */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-4">Properties</h2>
              
              {selectedElementData ? (
                <div>
                  {/* Animation Selection */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Animation</label>
                    <select
                      value={selectedElementData.animation || ''}
                      onChange={(e) => updateElement(selectedElement, { animation: e.target.value || null })}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">None</option>
                      {Object.entries(animations).map(([key, anim]) => (
                        <option key={key} value={key}>
                          {anim.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Effects Quick Access */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Quick Effects</label>
                    <button
                      onClick={() => setShowEffectsPanel(!showEffectsPanel)}
                      className="w-full p-2 bg-purple-100 text-purple-600 rounded text-sm hover:bg-purple-200 flex items-center justify-center"
                    >
                      <Sparkles size={14} className="mr-1" />
                      Open Effects Panel
                    </button>
                  </div>

                  {/* Position and Size */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">X</label>
                      <input
                        type="number"
                        value={selectedElementData.x}
                        onChange={(e) => updateElement(selectedElement, { x: parseInt(e.target.value) })}
                        className="w-full p-2 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Y</label>
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
                      <label className="block text-sm font-medium mb-1">Width</label>
                      <input
                        type="number"
                        value={selectedElementData.width}
                        onChange={(e) => updateElement(selectedElement, { width: parseInt(e.target.value) })}
                        className="w-full p-2 border rounded text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Height</label>
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
                    <label className="block text-sm font-medium mb-1">Rotation</label>
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
                        <label className="block text-sm font-medium mb-1">Font Size</label>
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
                        <label className="block text-sm font-medium mb-1">Font Family</label>
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
                        <label className="block text-sm font-medium mb-1">Color</label>
                        <input
                          type="color"
                          value={selectedElementData.color}
                          onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                          className="w-full p-2 border rounded text-sm h-10"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Text Alignment</label>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => updateElement(selectedElement, { textAlign: 'left' })}
                            className={`p-2 rounded ${selectedElementData.textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                            title="Align Left"
                          >
                            <AlignLeft size={16} />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElement, { textAlign: 'center' })}
                            className={`p-2 rounded ${selectedElementData.textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                            title="Align Center"
                          >
                            <AlignCenter size={16} />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElement, { textAlign: 'right' })}
                            className={`p-2 rounded ${selectedElementData.textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                            title="Align Right"
                          >
                            <AlignRight size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Text Style</label>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => updateElement(selectedElement, { 
                              fontWeight: selectedElementData.fontWeight === 'bold' ? 'normal' : 'bold' 
                            })}
                            className={`p-2 rounded ${selectedElementData.fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                            title="Bold"
                          >
                            <Bold size={16} />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElement, { 
                              fontStyle: selectedElementData.fontStyle === 'italic' ? 'normal' : 'italic' 
                            })}
                            className={`p-2 rounded ${selectedElementData.fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                            title="Italic"
                          >
                            <Italic size={16} />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElement, { 
                              textDecoration: selectedElementData.textDecoration === 'underline' ? 'none' : 'underline' 
                            })}
                            className={`p-2 rounded ${selectedElementData.textDecoration === 'underline' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                            title="Underline"
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
                    Delete
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Select an element to edit its properties</p>
              )}
            </div>

            {/* Export Section */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-4">Export</h2>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => exportAsImage('png')}
                  className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
                >
                  <Download size={14} className="mr-1" />
                  PNG
                </button>
                <button
                  onClick={() => exportAsImage('jpeg')}
                  className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
                >
                  <Download size={14} className="mr-1" />
                  JPEG
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => exportAsImage('webp')}
                  className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
                >
                  <Download size={14} className="mr-1" />
                  WebP
                </button>
                <button
                  onClick={() => exportAsImage('svg')}
                  className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
                >
                  <Download size={14} className="mr-1" />
                  SVG
                </button>
              </div>
              
              {/* Video Export Settings */}
              <VideoSettings />
              
              <button
                onClick={startRecording}
                disabled={recording}
                className={`w-full p-2 rounded text-sm flex items-center justify-center ${
                  recording ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <Film size={14} className="mr-1" />
                {recording ? 'Recording...' : 'Export Video'}
              </button>
            </div>

            {/* Project Actions */}
            <div>
              <h2 className="text-lg font-bold mb-4">Project</h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {/* Save project functionality */}}
                  className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
                >
                  <Save size={14} className="mr-1" />
                  Save
                </button>
                <button
                  onClick={() => {/* Load project functionality */}}
                  className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
                >
                  <FolderOpen size={14} className="mr-1" />
                  Load
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Effects Panel */}
        <EffectsPanel />

        {/* Floating Toolbar for Selected Elements */}
        {selectedElements.size > 0 && (
          <div
            ref={floatingToolbarRef}
            className="fixed left-1/2 bottom-4 transform -translate-x-1/2 floating-toolbar"
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
        <LanguageHelpModal />

        {/* Recording Status */}
        <RecordingStatus />
      </div>
    </>
  );
};

export default Sowntra;