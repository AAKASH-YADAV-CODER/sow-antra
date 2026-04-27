import React from 'react';
import {
  Square, Type, Image, Smartphone, MessageCircle,
  Monitor, Film, FileText, Printer, Heart, Music, Zap, CreditCard,
  Tv, Megaphone, Users, BookOpen, Maximize
} from 'lucide-react';

// Font families with Indian language support
// Google Fonts Collection (500+ popular fonts)
export const fontFamilies = [...new Set([
  // ... Sans Serif ...
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Oswald', 'Source Sans Pro', 'Raleway', 'Nunito', 'PT Sans',
  'Noto Sans', 'Ubuntu', 'Mukta', 'Roboto Condensed', 'Rubik', 'Work Sans', 'Kanit', 'Fira Sans', 'Quicksand', 'Hind',
  'Inter', 'Barlow', 'Titillium Web', 'Heebo', 'Libre Franklin', 'Karla', 'Mulish', 'Oxygen', 'Arimo', 'Josefin Sans',
  'Dosis', 'Cairo', 'Cabin', 'DM Sans', 'Signika', 'Maven Pro', 'Assistant', 'Catamaran', 'Questrial', 'Exo 2',
  'Bitter', 'Prompt', 'Barlow Condensed', 'Asap', 'Overpass', 'Teko', 'Archivo', 'Varela Round', 'Comfortaa', 'Fjalla One',
  'Muli', 'Signika Negative', 'Rajdhani', 'Inconsolata', 'Exo', 'Changa', 'Didact Gothic', 'Ruda', 'Antic', 'Monda',
  'Julius Sans One', 'Cantarell', 'Pathway Gothic One', 'Pontano Sans', 'Hammersmith One', 'Gudea', 'Tenor Sans', 'Advent Pro', 'Arsenal',
  'Istok Web', 'Economica', 'Saira', 'Saira Condensed', 'Saira Extra Condensed', 'Saira Semi Condensed', 'Saira Stencil One', 'Marvel', 'Actor',
  'Alef', 'Average Sans', 'Basic', 'Belleza', 'BenchNine', 'Carme', 'Chau Philomene One', 'Coda', 'Convergence', 'Doppio One',
  'Duru Sans', 'Electrolize', 'Engagement', 'Fauna One', 'Federo', 'Fresca', 'Galdeano', 'Geostar', 'Geostar Fill', 'Glegoo',
  'Homenaje', 'Imprima', 'Jaldi', 'Jura', 'Kite One', 'Krona One', 'Lekton', 'Life Savers', 'Magra', 'Mako',
  'Metrophobic', 'Michroma', 'Molengo', 'Mouse Memoirs', 'News Cycle', 'Nobile', 'Numans', 'Offside', 'Orienta', 'Overlock',
  'Overlock SC', 'Oxygen Mono', 'Paytone One', 'Philosopher', 'Play', 'Port Ligh', 'Puritan', 'Quantico', 'Quattrocento Sans', 'Racing Sans One',
  'Rationale', 'Revalia', 'Rosario', 'Ruluko', 'Rum Raisin', 'Russo One', 'Sarpanch', 'Scada', 'Seymour One', 'Shanti',
  'Short Stack', 'Sintony', 'Six Caps', 'Snippet', 'Sonsie One', 'Source Sans 3', 'Spinnaker', 'Strait', 'Strong', 'Syncopate',
  'Tauri', 'Text Me One', 'Thasadith', 'Tulpen One', 'Unica One', 'Vibur', 'Voltaire', 'Wire One', 'Yanone Kaffeesatz', 'Zencdn',

  // ... Serif ...
  'Roboto Slab', 'Merriweather', 'Playfair Display', 'Lora', 'PT Serif', 'Noto Serif', 'Arvo', 'Slabo 27px', 'Crimson Text', 'Libre Baskerville',
  'Josefin Slab', 'Anton', 'EB Garamond', 'Bree Serif', 'Vollkorn', 'Abril Fatface', 'Old Standard TT', 'Cinzel', 'Cardo', 'Chivo',
  'Domine', 'Rokkitt', 'Bitter', 'Alfa Slab One', 'Cormorant Garamond', 'Glegoo', 'Crete Round', 'Patua One', 'Tinos', 'Caudex',
  'Frank Ruhl Libre', 'Ultra', 'Amiri', 'Spectral', 'Gentium Book Basic', 'Neuton', 'Alegreya', 'Alice', 'BioRhyme', 'Lustria',
  'Prata', 'Quando', 'Rufina', 'Sanchez', 'Unna', 'Vidaloka', 'Yeseva One', 'Zilla Slab', 'Abhaya Libre', 'Adamina',
  'Alegreya SC', 'Almendra', 'Almendra Display', 'Almendra SC', 'Amethysta', 'Antic Didone', 'Antic Slab', 'Arapey', 'Artifika', 'Average',
  'Balsamiq Sans', 'Belgrano', 'Bentham', 'Bevan', 'Bigshot One', 'Bilbo', 'Bilbo Swash Caps', 'Bokor', 'Bonbon', 'Buenard',
  'Bungee', 'Bungee Hairline', 'Burchuell', 'Butcherman', 'Caesar Dressing', 'Cagliostro', 'Cambo', 'Candal', 'Cantata One', 'Castoro',
  'Cedarville Cursive', 'Cherry Cream Soda', 'Cherry Swash', 'Chonburi', 'Cinzel Decorative', 'Clicker Script', 'Coda Caption', 'Copse', 'Corben', 'Cormorant',
  'Cormorant Infant', 'Cormorant SC', 'Cormorant Unicase', 'Cormorant Upright', 'Courgette', 'Coustard', 'Covered By Your Grace', 'Crafty Girls', 'Creepster', 'Croissant One',
  'Crushed', 'Cuprum', 'Cutive', 'Cutive Mono', 'Damion', 'Dancing Script', 'Dawning of a New Day', 'Days One', 'Delius', 'Delius Swash Caps',
  'Delius Unicase', 'Della Respira', 'Denk One', 'Devonshire', 'Dhurjati', 'Diplomata', 'Diplomata SC', 'Donegal One', 'Dr Sugiyama', 'Dosis',

  // ... Display / Handwriting / Script ...
  'Pacifico', 'Shadows Into Light', 'Dancing Script', 'Indie Flower', 'Amatic SC', 'Lobster', 'Permanent Marker', 'Kaushan Script', 'Cookie', 'Righteous',
  'Satisfy', 'Great Vibes', 'Courgette', 'Sacramento', 'Handlee', 'Bangers', 'Patrick Hand', 'Yellowtail', 'Gloria Hallelujah', 'Chewy',
  'Kalam', 'Coming Soon', 'Fredoka One', 'Luckiest Guy', 'Pathway Gothic One', 'Architects Daughter', 'Schoolbell', 'Covered By Your Grace', 'Homemade Apple', 'Creepster',
  'Special Elite', 'Allura', 'Berkshire Swash', 'Nothing You Could Do', 'Pinyon Script', 'Rancho', 'Grand Hotel', 'Leckerli One', 'Just Another Hand', 'Damion',
  'Mr Dafoe', 'Reenie Beanie', 'Walter Turncoat', 'Parisienne', 'Rochester', 'Tangerine', 'Italianno', 'Bad Script', 'Norican', 'Yesteryear',
  'Montez', 'Marck Script', 'Bilbo', 'Cedarville Cursive', 'Clicker Script', 'Dawning of a New Day', 'Dr Sugiyama', 'Engagement', 'Euphoria Script', 'Ewert',
  'Eczar', 'El Messiri', 'Emblema One', 'Emilys Candy', 'Erica One', 'Esteban', 'Fanwood Text', 'Fascinate', 'Fascinate Inline', 'Faster One',
  'Fasthand', 'Favela', 'Felipa', 'Fenix', 'Finger Paint', 'Flamenco', 'Flavors', 'Fondamento', 'Fontdiner Swanky', 'Forum',
  'Francois One', 'Freckle Face', 'Fredericka the Great', 'Frijole', 'Fruktur', 'Fugaz One', 'Gabriela', 'Galada', 'Galindo', 'Gentium Basic',
  'Geo', 'Germania One', 'Give You Glory', 'Glass Antiqua', 'Goblin One', 'Gochi Hand', 'Goldman', 'Gorditas', 'Goudy Bookletter 1911', 'Graduate',
  'Grandstander', 'Gravitas One', 'Griffy', 'Gruppo', 'Habibi', 'Halant', 'Hanalei', 'Hanalei Fill', 'Happy Monkey', 'Harmattan',
  'Headland One', 'Henny Penny', 'Herr Von Muellerhoff', 'Hi Melody', 'Hind Guntur', 'Hind Madurai', 'Hind Siliguri', 'Hind Vadodara', 'Holtwood One SC', 'Iceberg',
  'Iceland', 'IM Fell Double Pica', 'IM Fell Double Pica SC', 'IM Fell DW Pica', 'IM Fell DW Pica SC', 'IM Fell English', 'IM Fell English SC', 'IM Fell French Canon', 'IM Fell French Canon SC', 'IM Fell Great Primer',

  // ... Monospace ...
  'Roboto Mono', 'Source Code Pro', 'Space Mono', 'Ubuntu Mono', 'Inconsolata', 'Fira Mono', 'PT Mono', 'Cutive Mono', 'Anonymous Pro', 'Overpass Mono',
  'Share Tech Mono', 'Nova Mono', 'VT323', 'Cousine', 'Oxygen Mono', 'B612 Mono', 'Major Mono Display', 'Syne Mono', 'JetBrains Mono', 'IBM Plex Mono',

  // ... More Unique / Decorative ...
  'Audiowide', 'Black Ops One', 'Carter One', 'Changa One', 'Chelsea Market', 'Contrail One', 'Corben', 'Creepster', 'Eater', 'Ewert',
  'Fascinate Inline', 'Faster One', 'Fontdiner Swanky', 'Frijole', 'Fruktur', 'Geostar', 'Glass Antiqua', 'Goblin One', 'Gorditas', 'Graduate',
  'Griffy', 'Gruppo', 'Hanalei', 'Henny Penny', 'Holtwood One SC', 'Iceberg', 'Jacques Francois Shadow', 'Jolly Lodger', 'Keania One', 'Kelly Slab',
  'Kenia', 'Kranky', 'Creepster', 'Nosifer', 'Pirata One', 'Plaster', 'Playball', 'Poiret One', 'Poller One', 'Pompiere',
  'Press Start 2P', 'Prosto One', 'Purple Purse', 'Quando', 'Racing Sans One', 'Ranchers', 'Rye', 'Sacramento', 'Sail', 'Salsa',
  'Sancreek', 'Sansita', 'Sarina', 'Satisfy', 'Scada', 'Scheherazade', 'Seaweed Script', 'Sevillana', 'Seymour One', 'Shadows Into Light Two',
  'Shojumaru', 'Sigmar One', 'Simonetta', 'Sirin Stencil', 'Six Caps', 'Skranji', 'Slabo 13px', 'Slackey', 'Smokum', 'Smythe',
  'Sniglet', 'Snowburst One', 'Sofadi One', 'Sofia', 'Sonsie One', 'Sorts Mill Goudy', 'Special Elite', 'Spicy Rice', 'Spirax', 'Squada One',
  'Stalemate', 'Stalinist One', 'Stardos Stencil', 'Stint Ultra Condensed', 'Stint Ultra Expanded', 'Stoke', 'Stolzl', 'Sue Ellen Francisco', 'Sunshiney', 'Supermercado One'
])].sort();

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

// Enhanced Image Effects
// Enhanced Image Filters (Categorized)
// Enhanced Image Filters (Categorized)
export const imageEffects = {
  // Natural
  fresco: { name: 'Fresco', filter: 'sepia(0.3) contrast(1.2) brightness(1.05) saturate(1.1)' },
  belvedere: { name: 'Belvedere', filter: 'hue-rotate(10deg) saturate(1.4) contrast(1.1) brightness(1.1)' },
  flint: { name: 'Flint', filter: 'grayscale(0.2) contrast(0.9) brightness(1.15) hue-rotate(-10deg) saturate(0.8)' },

  // Warm
  luna: { name: 'Luna', filter: 'brightness(1.2) saturate(0.9) contrast(1.1) hue-rotate(-5deg)' },
  aero: { name: 'Aero', filter: 'sepia(0.3) contrast(0.8) brightness(1.2)' },
  myst: { name: 'Myst', filter: 'sepia(0.4) contrast(0.9) saturate(0.8)' },

  // Cool
  bali: { name: 'Bali', filter: 'hue-rotate(-20deg) contrast(1.1)' },
  capri: { name: 'Capri', filter: 'sepia(0.2) hue-rotate(180deg) saturate(0.8)' },
  latte: { name: 'Latte', filter: 'sepia(0.4) contrast(0.9)' },

  // Vivid
  bronz: { name: 'Bronz', filter: 'sepia(0.5) contrast(1.2) saturate(1.3)' },
  sandi: { name: 'Sandi', filter: 'sepia(0.3) contrast(1.1) saturate(1.4)' },
  sangri: { name: 'Sangri', filter: 'sepia(0.2) contrast(1.1) saturate(1.6)' },

  // Soft
  scandi: { name: 'Scandi', filter: 'sepia(0.1) contrast(0.9) brightness(1.1)' },
  nordic: { name: 'Nordic', filter: 'sepia(0.2) contrast(0.8) brightness(1.2)' },
  astro: { name: 'Astro', filter: 'sepia(0.1) contrast(1.2) brightness(1.1)' },

  // Vintage
  vinto: { name: 'Vinto', filter: 'sepia(0.6) contrast(1.2) brightness(0.9)' },
  fade: { name: 'Fade', filter: 'sepia(0.4) contrast(0.9) brightness(1.1)' },
  antiq: { name: 'Antiq', filter: 'sepia(0.5) contrast(1.1) brightness(0.9) grayscale(0.2)' },

  // Mono
  classic: { name: 'Classic', filter: 'grayscale(100%)' },
  ink: { name: 'Ink', filter: 'grayscale(100%) contrast(1.2) brightness(0.9)' },
  noir: { name: 'Noir', filter: 'grayscale(100%) contrast(1.5) brightness(0.8)' },

  // Default
  none: { name: 'None', filter: '' },
};

// Image Shadow Types & Controls
export const imageShadows = {
  none: { name: 'None', controls: [], defaults: {} },
  glow: {
    name: 'Glow',
    controls: ['size', 'blur', 'color', 'intensity'],
    defaults: { size: 15, blur: 30, color: '#000000', intensity: 50 }
  },
  drop: {
    name: 'Drop',
    controls: ['blur', 'angle', 'distance', 'color', 'intensity'],
    defaults: { blur: 20, angle: 60, distance: 50, color: '#000000', intensity: 50 }
  },
  outline: {
    name: 'Outline',
    controls: ['size', 'color', 'intensity'],
    defaults: { size: 25, color: '#000000', intensity: 100 }
  },
  curved: {
    name: 'Curved',
    controls: ['curve', 'distance', 'blur', 'color', 'intensity'],
    defaults: { curve: 50, distance: 10, blur: 20, color: '#000000', intensity: 50 }
  },
  page_lift: {
    name: 'Angled',
    controls: ['curve', 'distance', 'blur', 'color', 'intensity'],
    defaults: { curve: 50, distance: 10, blur: 20, color: '#000000', intensity: 50 }
  },
  angled: {
    name: 'Page Lift',
    controls: ['angle', 'distance', 'blur', 'color', 'intensity'],
    defaults: { angle: 45, distance: 10, blur: 20, color: '#000000', intensity: 50 }
  },
  backdrop: {
    name: 'Backdrop',
    controls: ['angle', 'distance', 'color', 'intensity'], // Backdrop often implies a sharp shadow/flat plane
    defaults: { angle: -45, distance: 20, color: '#000000', intensity: 50 }
  }
};

// Category mapping for UI
export const imageFilterCategories = [
  {
    id: 'natural',
    name: 'Natural',
    filters: ['fresco', 'belvedere', 'flint']
  },
  {
    id: 'warm',
    name: 'Warm',
    filters: ['luna', 'aero', 'myst']
  },
  {
    id: 'cool',
    name: 'Cool',
    filters: ['bali', 'capri', 'latte']
  },
  {
    id: 'vivid',
    name: 'Vivid',
    filters: ['bronz', 'sandi', 'sangri']
  },
  {
    id: 'soft',
    name: 'Soft',
    filters: ['scandi', 'nordic', 'astro']
  },
  {
    id: 'vintage',
    name: 'Vintage',
    filters: ['vinto', 'fade', 'antiq']
  },
  {
    id: 'mono',
    name: 'Mono',
    filters: ['classic', 'ink', 'noir']
  }
];



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
  presentation: {
    width: 1920,
    height: 1080,
    name: 'Presentation',
    icon: <Monitor size={16} />,
    aspectRatio: 16 / 9
  },
  a4Document: {
    width: 2480,
    height: 3508,
    name: 'A4 Document',
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
  poster: {
    width: 1587,
    height: 2245,
    name: 'Poster (A2)',
    icon: <Image size={16} />,
    aspectRatio: 1587 / 2245
  },
  logo: {
    width: 1000,
    height: 1000,
    name: 'Logo',
    icon: <Maximize size={16} />,
    aspectRatio: 1
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

// Smart Page Animation Presets (Recipes)
export const pageAnimations = {
  simple: {
    name: 'Simple',
    description: 'Elegant fade-in for all elements.',
    recipes: {
      text: { type: 'fade', duration: 0.8 },
      image: { type: 'fade', duration: 1.0 },
      shape: { type: 'fade', duration: 0.8 },
      default: { type: 'fade', duration: 0.8 }
    },
    stagger: 0
  },
  sleek: {
    name: 'Sleek',
    description: 'Professional slide and zoom combo.',
    recipes: {
      text: { type: 'wipe', duration: 1.0 },
      image: { type: 'zoomIn', duration: 1.2 },
      shape: { type: 'pan', duration: 1.0 },
      default: { type: 'pan', duration: 1.0 }
    },
    stagger: 0
  },
  tech: {
    name: 'Tech',
    description: 'Futuristic glitch and typewriter effects.',
    recipes: {
      text: { type: 'typewriter', duration: 1.5 },
      image: { type: 'glitch', duration: 0.8 },
      shape: { type: 'flicker', duration: 1.0 },
      default: { type: 'fade', duration: 1.0 }
    },
    stagger: 0
  },
  fun: {
    name: 'Fun',
    description: 'Bouncy and energetic.',
    recipes: {
      text: { type: 'bounce', duration: 1.0 },
      image: { type: 'pop', duration: 0.8 },
      shape: { type: 'rotate', duration: 1.0 },
      default: { type: 'bounce', duration: 1.0 }
    },
    stagger: 0
  },
  elegant: {
    name: 'Elegant',
    description: 'Smooth rising motions.',
    recipes: {
      text: { type: 'rise', duration: 1.2 },
      image: { type: 'pan', duration: 1.5 },
      shape: { type: 'fade', duration: 1.2 },
      default: { type: 'rise', duration: 1.2 }
    },
    stagger: 0
  },
  party: {
    name: 'Party',
    description: 'Wild and colorful entrance.',
    recipes: {
      text: { type: 'shake', duration: 0.8 },
      image: { type: 'tumble', duration: 1.0 },
      shape: { type: 'jiggle', duration: 0.8 },
      default: { type: 'tumble', duration: 1.0 }
    },
    stagger: 0
  },
  corporate: {
    name: 'Corporate',
    description: 'Clean, standard business presentation style.',
    recipes: {
      text: { type: 'slideInUp', duration: 1.0 },
      image: { type: 'fade', duration: 1.2 },
      shape: { type: 'pan', duration: 1.0 },
      default: { type: 'slideInUp', duration: 1.0 }
    },
    stagger: 0
  },
  disco: {
    name: 'Disco',
    description: 'Flashy and pulsing.',
    recipes: {
      text: { type: 'colorShift', duration: 1.5 },
      image: { type: 'flash', duration: 0.5 },
      shape: { type: 'pulse', duration: 1.0 },
      default: { type: 'flash', duration: 1.0 }
    },
    stagger: 0
  },
  scrapbook: {
    name: 'Scrapbook',
    description: 'Stop-motion collage feel.',
    recipes: {
      text: { type: 'typewriter', duration: 1.2 },
      image: { type: 'pop', duration: 0.8 },
      shape: { type: 'wiggle', duration: 1.0 },
      default: { type: 'pop', duration: 1.0 }
    },
    stagger: 0
  },
  bold: {
    name: 'Bold',
    description: 'Aggressive zooms and slides.',
    recipes: {
      text: { type: 'zoomIn', duration: 0.6 },
      image: { type: 'slideInRight', duration: 0.8 },
      shape: { type: 'wipe', duration: 0.8 },
      default: { type: 'zoomIn', duration: 0.8 }
    },
    stagger: 0
  },
  chill: {
    name: 'Chill',
    description: 'Relaxed, slow drifting.',
    recipes: {
      text: { type: 'blurIn', duration: 1.5 },
      image: { type: 'pan', duration: 2.0 },
      shape: { type: 'fade', duration: 1.5 },
      default: { type: 'fade', duration: 1.5 }
    },
    stagger: 0
  },
  action: {
    name: 'Action',
    description: 'Dynamic directional slides.',
    recipes: {
      text: { type: 'slideInLeft', duration: 0.8 },
      image: { type: 'slideInRight', duration: 0.8 },
      shape: { type: 'zoomIn', duration: 0.8 },
      default: { type: 'slideInUp', duration: 0.8 }
    },
    stagger: 0
  }
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

// Video Editor Constants
export const PIXELS_PER_SECOND = 40;
