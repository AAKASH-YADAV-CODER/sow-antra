// Helper functions for canvas operations

// Get filter CSS string
export const getFilterCSS = (filters) => {
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
};

// Get background style for gradient or solid color
export const getBackgroundStyle = (element) => {
  if (!element) return '#3b82f6';
  
  if (element.fillType !== 'gradient' || !element.gradient) {
    return element.fill || '#3b82f6';
  }
  
  const grad = element.gradient;
  
  if (!grad.colors || !Array.isArray(grad.colors) || grad.colors.length === 0) {
    return element.fill || '#3b82f6';
  }
  
  const validColors = grad.colors.filter(color => 
    color && typeof color === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(color)
  );
  
  if (validColors.length === 0) {
    return element.fill || '#3b82f6';
  }
  
  const validStops = grad.stops || [];
  const stops = [];
  
  for (let i = 0; i < validColors.length; i++) {
    if (validStops[i] !== undefined && validStops[i] !== null) {
      stops[i] = Math.max(0, Math.min(100, parseInt(validStops[i]) || 0));
    } else {
      if (validColors.length === 1) {
        stops[i] = 0;
      } else {
        stops[i] = i === 0 ? 0 : (i === validColors.length - 1 ? 100 : Math.round((i / (validColors.length - 1)) * 100));
      }
    }
  }
  
  const colorStopPairs = validColors.map((color, i) => ({
    color,
    stop: stops[i] || 0
  })).sort((a, b) => a.stop - b.stop);
  
  const colorStops = colorStopPairs.map(pair => 
    `${pair.color} ${pair.stop}%`
  ).join(', ');
  
  if (grad.type === 'radial') {
    const posX = (grad.position && grad.position.x !== undefined) ? grad.position.x : 50;
    const posY = (grad.position && grad.position.y !== undefined) ? grad.position.y : 50;
    return `radial-gradient(circle at ${posX}% ${posY}%, ${colorStops})`;
  } else {
    const angle = (grad.angle !== undefined && grad.angle !== null) ? grad.angle : 90;
    return `linear-gradient(${angle}deg, ${colorStops})`;
  }
};

// Get canvas-compatible gradient for export
export const getCanvasGradient = (ctx, element) => {
  if (!element || element.fillType !== 'gradient' || !element.gradient) {
    return element.fill || '#3b82f6';
  }
  
  const grad = element.gradient;
  
  if (!grad.colors || !Array.isArray(grad.colors) || grad.colors.length === 0) {
    return element.fill || '#3b82f6';
  }
  
  const validColors = grad.colors.filter(color => 
    color && typeof color === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(color)
  );
  
  if (validColors.length === 0) {
    return element.fill || '#3b82f6';
  }
  
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
  
  validColors.forEach((color, i) => {
    canvasGradient.addColorStop(stops[i], color);
  });
  
  return canvasGradient;
};

// Parse CSS string to object
export const parseCSS = (cssString) => {
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

// Get canvas effects for an element
export const getCanvasEffects = (element, imageEffects = {}) => {
  const effects = {
    shadow: {},
    filters: ''
  };
  
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
      default:
        break;
    }
  }
  
  if (element.type === 'image' && element.imageEffect && element.imageEffect !== 'none') {
    const effect = imageEffects[element.imageEffect];
    if (effect && effect.filter) {
      effects.filters += ' ' + effect.filter;
    }
  }
  
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
      default:
        break;
    }
  }
  
  return effects;
};

// Get effect CSS for an element
export const getEffectCSS = (element, textEffects = {}, imageEffects = {}, shapeEffects = {}, specialEffects = {}) => {
  let effectCSS = '';
  
  if (element.type === 'text' && element.textEffect && element.textEffect !== 'none') {
    effectCSS += textEffects[element.textEffect]?.css || '';
  }
  
  if (element.type === 'image' && element.imageEffect && element.imageEffect !== 'none') {
    effectCSS += imageEffects[element.imageEffect]?.filter ? `filter: ${imageEffects[element.imageEffect].filter};` : '';
  }
  
  if (['rectangle', 'circle', 'triangle', 'star', 'hexagon'].includes(element.type) && 
      element.shapeEffect && element.shapeEffect !== 'none') {
    effectCSS += shapeEffects[element.shapeEffect]?.css || '';
  }
  
  if (element.specialEffect && element.specialEffect !== 'none') {
    effectCSS += specialEffects[element.specialEffect]?.css || '';
  }
  
  return effectCSS;
};

// Detect if device is mobile
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth < 768;
};

// Detect if device has touch support
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Get responsive canvas size based on device
export const getResponsiveCanvasSize = (baseWidth, baseHeight) => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  if (isMobileDevice()) {
    // On mobile, scale down to fit screen
    const maxWidth = screenWidth - 40; // padding
    const maxHeight = screenHeight - 200; // header + controls
    
    const scaleX = maxWidth / baseWidth;
    const scaleY = maxHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    return {
      width: Math.round(baseWidth * scale),
      height: Math.round(baseHeight * scale),
      scale
    };
  }
  
  return {
    width: baseWidth,
    height: baseHeight,
    scale: 1
  };
};
