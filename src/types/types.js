import React from 'react';
import {
  Square,
  Smartphone,
  MessageCircle,
  Image,
  Type,
  Maximize,
  Users,
  Monitor,
  Film,
  Tv,
  Music,
  Zap,
  FileText,
  Printer,
  Megaphone,
  CreditCard,
  Heart,
  BookOpen,
} from "lucide-react";

// Font families with Canva-like variety and Indian language support
export const fontFamilies = [
  // --- Modern & clean (Sans-Serif) ---
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Ubuntu', 'Nunito', 'Raleway', 'Fira Sans', 'Quicksand', 'Comfortaa', 'Work Sans',

  // --- Elegant & Traditional (Serif) ---
  'Playfair Display', 'Merriweather', 'Lora', 'PT Serif', 'Libre Baskerville', 'Crimson Text', 'Cinzel', 'EB Garamond', 'Spectral',

  // --- Bold & Impactful (Display) ---
  'Anton', 'Bebas Neue', 'Oswald', 'League Spartan', 'Bangers', 'Monoton', 'Orbitron', 'Righteous', 'Fredoka One', 'Titan One', 'Abril Fatface', 'Alfa Slab One',

  // --- Handwriting & Script ---
  'Pacifico', 'Dancing Script', 'Caveat', 'Satisfy', 'Yellowtail', 'Great Vibes', 'Sacramento', 'Shadows Into Light', 'Amatic SC', 'Indie Flower', 'Kaushan Script', 'Cookie', 'Kalam', 'Courgette', 'Marck Script', 'Lobster', 'Lobster Two', 'Permanent Marker',

  // --- Standard System Fonts ---
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Impact', 'Comic Sans MS', 'Tahoma', 'Trebuchet MS',

  // --- Indian Language Fonts ---
  'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Telugu',
  'Noto Sans Bengali', 'Noto Sans Gurmukhi', 'Noto Sans Gujarati',
  'Noto Sans Kannada', 'Noto Sans Malayalam', 'Noto Sans Oriya',
  'Mangal', 'Lohit Devanagari', 'FreeSans', 'Kalimati', 'Lohit Tamil',
  'Lohit Telugu', 'Lohit Bengali', 'Lohit Gujarati', 'Lohit Kannada',
  'Lohit Malayalam', 'Lohit Oriya', 'Lohit Gurmukhi'
];

// Supported languages with their scripts
export const supportedLanguages = {
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
};

// Filter options
export const filterOptions = {
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

export const textEffects = {
  none: { name: 'None', controls: [], defaults: {} },
  shadow: {
    name: 'Shadow',
    controls: ['offset', 'direction', 'blur', 'transparency', 'color'],
    defaults: { offset: 50, direction: -45, blur: 0, transparency: 40, color: '#000000' }
  },
  lift: {
    name: 'Lift',
    controls: ['intensity'],
    defaults: { intensity: 50 }
  },
  hollow: {
    name: 'Hollow',
    controls: ['thickness'],
    defaults: { thickness: 50 }
  },
  splice: {
    name: 'Splice',
    controls: ['thickness', 'offset', 'direction', 'color'],
    defaults: { thickness: 50, offset: 50, direction: -45, color: '#000000' }
  },
  outline: {
    name: 'Outline',
    controls: ['thickness', 'color'],
    defaults: { thickness: 50, color: '#000000' }
  },
  echo: {
    name: 'Echo',
    controls: ['offset', 'direction', 'color'],
    defaults: { offset: 50, direction: -45, color: '#000000' }
  },
  glitch: {
    name: 'Glitch',
    controls: ['offset', 'direction'],
    defaults: { offset: 30, direction: 90 }
  },
  neon: {
    name: 'Neon',
    controls: ['intensity'],
    defaults: { intensity: 50 }
  },
  background: {
    name: 'Background',
    controls: ['roundness', 'spread', 'transparency', 'color'],
    defaults: { roundness: 50, spread: 50, transparency: 100, color: '#ffff00' }
  }
};

// Text Shapes
export const textShapes = {
  none: { name: 'None', controls: [], defaults: {} },
  curve: {
    name: 'Curve',
    controls: ['curve'],
    defaults: { curve: 70 }
  }
};

export const imageEffects = {
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

export const shapeEffects = {
  none: { name: 'None', css: '' },
  shadow: { name: 'Shadow', css: 'filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.3));' },
  glow: { name: 'Glow', css: 'filter: drop-shadow(0 0 10px rgba(255,255,255,0.8));' },
  emboss: { name: 'Emboss', css: 'filter: contrast(1.5) brightness(1.2);' },
  outline: { name: 'Outline', css: 'outline: 3px solid #000; outline-offset: 2px;' },
  gradientBorder: { name: 'Gradient Border', css: 'border: 4px solid; border-image: linear-gradient(45deg, #667eea, #764ba2) 1;' },
  metallic: { name: 'Metallic', css: 'background: linear-gradient(145deg, #bdc3c7, #2c3e50);' }
};

export const animations = {
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
  rotate: { name: 'Rotate', keyframes: 'rotate' },
  drift: { name: 'Drift', keyframes: 'drift' },
  breathe: { name: 'Breathe', keyframes: 'breathe' },
  neon: { name: 'Neon', keyframes: 'neon' },
  scrapbook: { name: 'Scrapbook', keyframes: 'scrapbook' }
};

export const stickerOptions = [
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

export const socialMediaTemplates = {
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
    aspectRatio: 9 / 16
  },
  facebookPost: {
    width: 940,
    height: 788,
    name: 'Facebook Post',
    icon: <MessageCircle size={16} />,
    aspectRatio: 940 / 788
  },
  facebookCover: {
    width: 820,
    height: 312,
    name: 'Facebook Cover',
    icon: <Image size={16} />,
    aspectRatio: 820 / 312
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
    aspectRatio: 16 / 9
  },
  youtubeChannelArt: {
    width: 2560,
    height: 1440,
    name: 'YouTube Channel Art',
    icon: <Tv size={16} />,
    aspectRatio: 16 / 9
  },
  tiktok: {
    width: 1080,
    height: 1920,
    name: 'TikTok Video',
    icon: <Music size={16} />,
    aspectRatio: 9 / 16
  },
  snapchat: {
    width: 1080,
    height: 1920,
    name: 'Snapchat',
    icon: <Zap size={16} />,
    aspectRatio: 9 / 16
  },
  a4Poster: {
    width: 2480,
    height: 3508,
    name: 'A4 Poster',
    icon: <FileText size={16} />,
    aspectRatio: 2480 / 3508
  },
  a3Poster: {
    width: 3508,
    height: 4961,
    name: 'A3 Poster',
    icon: <Printer size={16} />,
    aspectRatio: 3508 / 4961
  },
  a5Flyer: {
    width: 1748,
    height: 2480,
    name: 'A5 Flyer',
    icon: <Megaphone size={16} />,
    aspectRatio: 1748 / 2480
  },
  businessCard: {
    width: 1050,
    height: 600,
    name: 'Business Card',
    icon: <CreditCard size={16} />,
    aspectRatio: 7 / 4
  },
  invitationCard: {
    width: 1200,
    height: 1800,
    name: 'Invitation Card',
    icon: <Heart size={16} />,
    aspectRatio: 2 / 3
  },
  brochure: {
    width: 2480,
    height: 3508,
    name: 'Brochure',
    icon: <BookOpen size={16} />,
    aspectRatio: 2480 / 3508
  }
};

export const gradientPresets = [
  // Linear gradients with multiple color stops
  {
    colors: ['#ff6b6b', '#ff8e8e', '#4ecdc4'],
    stops: [0, 50, 100],
    angle: 90,
    type: 'linear',
    name: 'Coral Sunset'
  },
  {
    colors: ['#667eea', '#764ba2', '#f093fb'],
    stops: [0, 60, 100],
    angle: 135,
    type: 'linear',
    name: 'Purple Dream'
  },
  {
    colors: ['#f093fb', '#f5576c', '#ff9a9e'],
    stops: [0, 40, 100],
    angle: 45,
    type: 'linear',
    name: 'Pink Blush'
  },
  {
    colors: ['#4facfe', '#00f2fe', '#43e97b'],
    stops: [0, 70, 100],
    angle: 180,
    type: 'linear',
    name: 'Ocean Breeze'
  },
  {
    colors: ['#43e97b', '#38f9d7', '#a8edea'],
    stops: [0, 50, 100],
    angle: 270,
    type: 'linear',
    name: 'Mint Fresh'
  },
  {
    colors: ['#fa709a', '#fee140', '#ff9a9e'],
    stops: [0, 30, 100],
    angle: 0,
    type: 'linear',
    name: 'Sunset Glow'
  },
  {
    colors: ['#30cfd0', '#330867', '#667eea'],
    stops: [0, 80, 100],
    angle: 225,
    type: 'linear',
    name: 'Deep Ocean'
  },
  {
    colors: ['#a8edea', '#fed6e3', '#f093fb'],
    stops: [0, 60, 100],
    angle: 315,
    type: 'linear',
    name: 'Soft Pastel'
  },
  {
    colors: ['#5ee7df', '#b490ca', '#f093fb'],
    stops: [0, 40, 100],
    angle: 90,
    type: 'linear',
    name: 'Lavender Mist'
  },
  // Radial gradients with multiple color stops
  {
    colors: ['#ff6b6b', '#ff8e8e', '#4ecdc4', '#a8edea'],
    stops: [0, 30, 70, 100],
    angle: 0,
    type: 'radial',
    position: { x: 50, y: 50 },
    name: 'Radial Coral'
  },
  {
    colors: ['#667eea', '#764ba2', '#f093fb', '#ff9a9e'],
    stops: [0, 25, 60, 100],
    angle: 0,
    type: 'radial',
    position: { x: 30, y: 30 },
    name: 'Radial Purple'
  },
  {
    colors: ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7'],
    stops: [0, 40, 80, 100],
    angle: 0,
    type: 'radial',
    position: { x: 70, y: 70 },
    name: 'Radial Ocean'
  }
];