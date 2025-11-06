import React from 'react';
import { 
  Square, Type, Image, Smartphone, MessageCircle, 
  Monitor, Film, FileText, Printer, Heart, Music, Zap, CreditCard, 
  Tv, Megaphone, Users, BookOpen 
} from 'lucide-react';

// Font families with Indian language support
export const fontFamilies = [
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

// Enhanced Text Effects
export const textEffects = {
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

// Shape Effects
export const shapeEffects = {
  none: { name: 'None', css: '' },
  shadow: { name: 'Shadow', css: 'filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.3));' },
  glow: { name: 'Glow', css: 'filter: drop-shadow(0 0 10px rgba(255,255,255,0.8));' },
  emboss: { name: 'Emboss', css: 'filter: contrast(1.5) brightness(1.2);' },
  outline: { name: 'Outline', css: 'outline: 3px solid #000; outline-offset: 2px;' },
  gradientBorder: { name: 'Gradient Border', css: 'border: 4px solid; border-image: linear-gradient(45deg, #667eea, #764ba2) 1;' },
  metallic: { name: 'Metallic', css: 'background: linear-gradient(145deg, #bdc3c7, #2c3e50);' }
};

// Special Effects for All Elements
export const specialEffects = {
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

// Social media templates with correct dimensions
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
    icon: <Monitor size={16} />,
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

// Animation options
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
  rotate: { name: 'Rotate', keyframes: 'rotate' }
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

// Generate unique ID
export const generateId = () => Math.random().toString(36).substr(2, 9);
