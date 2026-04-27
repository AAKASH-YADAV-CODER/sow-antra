// A highly refined local "AI" engine that uses advanced heuristics and 
// smart geometry to generate professional Canva-style templates.

const SIZES = {
  instagram: { width: 1080, height: 1080, name: 'Instagram Post' },
  story: { width: 1080, height: 1920, name: 'Instagram Story' },
  flyer: { width: 1414, height: 2000, name: 'A4 Flyer' },
  poster: { width: 1500, height: 2100, name: 'Poster' },
  youtube: { width: 1920, height: 1080, name: 'YouTube Thumbnail' },
  presentation: { width: 1920, height: 1080, name: 'Presentation' },
  default: { width: 1080, height: 1080, name: 'Custom Design' }
};

const COLOR_PALETTES = [
  { name: 'Vibrant Startup', bg: '#F8F9FA', primary: '#4361EE', secondary: '#3A0CA3', accent: '#F72585' },
  { name: 'Elegant Minimal', bg: '#Fdfcfb', primary: '#2b2d42', secondary: '#8d99ae', accent: '#edf2f4' },
  { name: 'Earthy Organic', bg: '#FEFAE0', primary: '#283618', secondary: '#606C38', accent: '#DDA15E' },
  { name: 'Bold Pop', bg: '#FFD166', primary: '#118AB2', secondary: '#073B4C', accent: '#EF476F' },
  { name: 'Luxury Dark', bg: '#0b090a', primary: '#f5ebe0', secondary: '#d5bdaf', accent: '#e3d5ca' },
  { name: 'Tech Modern', bg: '#0F172A', primary: '#38BDF8', secondary: '#94A3B8', accent: '#F1F5F9' },
  { name: 'Soft Pastel', bg: '#E0B1CB', primary: '#231942', secondary: '#5E548E', accent: '#9F86C0' }
];

const FONTS = {
  modern: { title: 'Outfit', body: 'Inter' },
  elegant: { title: 'Playfair Display', body: 'Lora' },
  bold: { title: 'Impact', body: 'Roboto' },
  friendly: { title: 'Poppins', body: 'Nunito' }
};

// Helper: Pick random item from array
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
// Helper: Unique ID
const uid = () => 'layer_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

// Helper: Unsplash Source is deprecated. Using LoremFlickr or Picsum.
const getImage = (keyword, width, height) => {
  return `https://loremflickr.com/${width}/${height}/${encodeURIComponent(keyword)}?random=${Date.now()}`;
};

/**
 * Extracts intelligence from the prompt to guide the design.
 */
const analyzePrompt = (prompt) => {
  const p = prompt.toLowerCase();
  
  // 1. Detect Intent/Topic
  const topicsList = ['pizza', 'coffee', 'bakery', 'gym', 'fitness', 'real estate', 'car', 'travel', 'nature', 'fashion', 'tech', 'wedding', 'birthday', 'party', 'medical', 'food'];
  let topic = 'abstract';
  for (const t of topicsList) {
    if (p.includes(t)) { topic = t; break; }
  }

  // 2. Detect Event Type
  let isSale = p.includes('sale') || p.includes('offer') || p.includes('discount') || p.includes('%');
  let isHiring = p.includes('hiring') || p.includes('job') || p.includes('career');
  let isEvent = p.includes('party') || p.includes('event') || p.includes('wedding');

  // 3. Size
  let dimensions = SIZES.default;
  for (const [key, val] of Object.entries(SIZES)) {
    if (p.includes(key)) dimensions = val;
  }

  // Generate copy based on intent
  let headline = `Amazing ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
  let subhead = "Discover our newest collection today.";
  let badge = null;

  if (isSale) {
    headline = `Huge ${topic.toUpperCase()} Sale`;
    subhead = `Grab the best deals on ${topic} before time runs out.`;
    badge = "Up to 50% OFF";
  } else if (isHiring) {
    headline = "We are Hiring!";
    subhead = `Join our dynamic ${topic} team today.`;
    badge = "Apply Now";
  } else if (isEvent) {
    headline = `Special ${topic.charAt(0).toUpperCase() + topic.slice(1)} Event`;
    subhead = "Join us this weekend for an unforgettable experience.";
  } else {
    // Attempt to use the original prompt intelligently if short
    if (prompt.length < 30) headline = prompt.toUpperCase();
  }

  return { topic, dimensions, headline, subhead, badge };
};

/**
 * Parses user prompt and generates highly refined JSON layout
 */
export const generateMagicLayout = async (prompt) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { topic, dimensions, headline, subhead, badge } = analyzePrompt(prompt);
      const { width, height } = dimensions;
      
      const palette = pickRandom(COLOR_PALETTES);
      const typography = pickRandom(Object.values(FONTS));
      const layoutType = pickRandom(['magazine', 'split-card', 'modern-rounded', 'overlay-badge']);
      
      const elements = [];
      const titleSize = Math.max(60, Math.floor(width * 0.08));
      const subSize = Math.max(24, Math.floor(width * 0.035));
      const pad = Math.floor(width * 0.08);

      if (layoutType === 'magazine') {
        // Full bleed image with aesthetic typography blocks
        elements.push({
          id: uid(), type: 'image',
          src: getImage(topic, width, height),
          x: 0, y: 0, width, height, name: 'Background Image'
        });

        // Dark gradient overlay from bottom
        elements.push({
          id: uid(), type: 'shape', shapeType: 'rectangle',
          x: 0, y: height * 0.4, width, height: height * 0.6,
          fill: `linear-gradient(to bottom, transparent, ${palette.bg})`,
          name: 'Gradient Fade'
        });

        if (badge) {
          elements.push({
            id: uid(), type: 'shape', shapeType: 'rectangle',
            x: pad, y: pad, width: width * 0.25, height: subSize * 2,
            fill: palette.accent, rx: 10,
            name: 'Badge BG'
          });
          elements.push({
            id: uid(), type: 'text', content: badge.toUpperCase(),
            x: pad + (width * 0.125), y: pad + (subSize * 0.5),
            fill: '#ffffff', fontSize: subSize * 0.8, fontFamily: typography.body, fontWeight: 'bold', textAlign: 'center',
            name: 'Badge Text'
          });
        }

        elements.push({
          id: uid(), type: 'text', content: headline,
          x: pad, y: height - pad - (titleSize * 1.5),
          fill: palette.primary, fontSize: titleSize, fontFamily: typography.title, fontWeight: '900', textAlign: 'left',
          width: width - (pad * 2), // Wrap width constraint if engine supports it
          name: 'Headline'
        });

      } else if (layoutType === 'split-card') {
        // Modern 50/50 split layout
        const isHorizontalLayout = width > height;
        
        elements.push({
          id: uid(), type: 'shape', shapeType: 'rectangle',
          x: 0, y: 0, width, height, fill: palette.bg, name: 'Background'
        });

        if (isHorizontalLayout) {
          // Image Left, Text Right
          elements.push({
            id: uid(), type: 'image', src: getImage(topic, width/2, height),
            x: 0, y: 0, width: width/2, height, name: 'Side Image'
          });
          
          elements.push({
            id: uid(), type: 'text', content: headline,
            x: (width/2) + pad, y: height/2 - titleSize,
            fill: palette.primary, fontSize: titleSize, fontFamily: typography.title, fontWeight: 'bold', textAlign: 'left',
            name: 'Headline'
          });
          elements.push({
            id: uid(), type: 'text', content: subhead,
            x: (width/2) + pad, y: height/2 + titleSize * 0.5,
            fill: palette.secondary, fontSize: subSize, fontFamily: typography.body, textAlign: 'left',
            name: 'Subheadline'
          });
        } else {
          // Image Top, Text Bottom
          elements.push({
            id: uid(), type: 'image', src: getImage(topic, width, height/2),
            x: 0, y: 0, width, height: height/2, name: 'Top Image'
          });
          
          elements.push({
            id: uid(), type: 'text', content: headline,
            x: width/2, y: (height/2) + pad,
            fill: palette.primary, fontSize: titleSize, fontFamily: typography.title, fontWeight: '800', textAlign: 'center',
            name: 'Headline'
          });
          elements.push({
            id: uid(), type: 'text', content: subhead,
            x: width/2, y: (height/2) + pad + titleSize * 1.5,
            fill: palette.secondary, fontSize: subSize, fontFamily: typography.body, textAlign: 'center',
            name: 'Subheadline'
          });
        }
      } else if (layoutType === 'modern-rounded') {
        // Aesthetic solid background with a large rounded image in center
        elements.push({
          id: uid(), type: 'shape', shapeType: 'rectangle',
          x: 0, y: 0, width, height, fill: palette.bg, name: 'Canvas BG'
        });

        elements.push({
          id: uid(), type: 'text', content: headline,
          x: width/2, y: pad * 1.5,
          fill: palette.primary, fontSize: titleSize, fontFamily: typography.title, fontWeight: '900', textAlign: 'center',
          name: 'Top Headline'
        });

        const imgWidth = Math.floor(width * 0.8);
        const imgHeight = Math.floor(height * 0.5);
        
        elements.push({
          id: uid(), type: 'image', src: getImage(topic, imgWidth, imgHeight),
          x: (width - imgWidth)/2, y: pad * 2 + titleSize,
          width: imgWidth, height: imgHeight, rx: 40, name: 'Feature Image'
        });

        if (badge) {
          elements.push({
            id: uid(), type: 'shape', shapeType: 'circle',
            x: (width - imgWidth)/2 - 30, y: pad * 2 + titleSize - 30,
            width: 140, height: 140, fill: palette.accent, name: 'Badge Circle'
          });
          elements.push({
            id: uid(), type: 'text', content: badge,
            x: (width - imgWidth)/2 + 40, y: pad * 2 + titleSize + 30,
            fill: '#ffffff', fontSize: 24, fontFamily: typography.title, fontWeight: 'bold', textAlign: 'center',
            name: 'Badge Float Text'
          });
        }

      } else {
        // overlay-badge: Image background with a distinct colored card overlay in center
        elements.push({
          id: uid(), type: 'image', src: getImage(topic, width, height),
          x: 0, y: 0, width, height, opacity: 0.9, name: 'Background Layer'
        });

        const cardW = width * 0.7;
        const cardH = Math.max(height * 0.4, titleSize * 3);
        
        // Glass/Solid Card
        elements.push({
          id: uid(), type: 'shape', shapeType: 'rectangle',
          x: (width - cardW)/2, y: (height - cardH)/2,
          width: cardW, height: cardH, fill: palette.bg, opacity: 0.95, rx: 24,
          name: 'Center Card'
        });

        elements.push({
          id: uid(), type: 'text', content: headline,
          x: width/2, y: (height - cardH)/2 + pad,
          fill: palette.primary, fontSize: titleSize, fontFamily: typography.title, fontWeight: '900', textAlign: 'center',
          name: 'Card Title'
        });
        
        elements.push({
          id: uid(), type: 'shape', shapeType: 'rectangle', // divider line
          x: width/2 - 50, y: (height - cardH)/2 + pad + titleSize,
          width: 100, height: 4, fill: palette.accent, name: 'Divider'
        });

        elements.push({
          id: uid(), type: 'text', content: subhead,
          x: width/2, y: (height - cardH)/2 + pad + titleSize + 24,
          fill: palette.secondary, fontSize: subSize, fontFamily: typography.body, textAlign: 'center',
          name: 'Card Subtitle'
        });
      }

      const result = {
        magic_ai: true,
        dimensions: { width, height, unit: 'px' },
        projectData: { title: `${topic} Magic Design` },
        elements: elements
      };

      resolve(result);
    }, 2000); 
  });
};
