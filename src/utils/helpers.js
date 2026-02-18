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
  if (!element) return '#3b82f6';

  // Support for direct gradient object (like page background)
  const isDirectGradient = element.type === 'gradient' || (!element.type && element.colors);
  const grad = isDirectGradient ? element : element.gradient;

  if (element.fillType !== 'gradient' && !isDirectGradient) {
    return element.fill || '#3b82f6';
  }

  if (!grad || !grad.colors || !Array.isArray(grad.colors) || grad.colors.length === 0) {
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

  // For page background, use 0,0 and canvas width/height
  const x = element.x !== undefined ? element.x : 0;
  const y = element.y !== undefined ? element.y : 0;
  const w = element.width !== undefined ? element.width : ctx.canvas.width;
  const h = element.height !== undefined ? element.height : ctx.canvas.height;

  if (grad.type === 'radial') {
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    const radius = Math.max(w, h) / 2;

    canvasGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  } else {
    const angle = (grad.angle !== undefined && grad.angle !== null) ? grad.angle : 90;
    const angleRad = (angle - 90) * Math.PI / 180;

    const centerX = x + w / 2;
    const centerY = y + h / 2;
    const length = Math.max(w, h);

    const x1 = centerX - Math.cos(angleRad) * length / 2;
    const y1 = centerY - Math.sin(angleRad) * length / 2;
    const x2 = centerX + Math.cos(angleRad) * length / 2;
    const y2 = centerY + Math.sin(angleRad) * length / 2;

    canvasGradient = ctx.createLinearGradient(x1, y1, x2, y2);
  }

  validColors.forEach((color, i) => {
    canvasGradient.addColorStop(stops[i] || 0, color);
  });

  return canvasGradient;
};

// Parse CSS string to object (camelCase for React)
export const parseCSS = (cssString) => {
  const style = {};
  if (!cssString) return style;

  const declarations = cssString.split(';');
  declarations.forEach(decl => {
    const colonIndex = decl.indexOf(':');
    if (colonIndex !== -1) {
      const property = decl.slice(0, colonIndex).trim();
      const value = decl.slice(colonIndex + 1).trim();

      if (property && value) {
        // Convert property to camelCase
        let camelProp = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

        // Special handling for browser prefixes (React expectations)
        if (property.startsWith('-webkit-')) {
          camelProp = 'Webkit' + camelProp.slice(6);
        } else if (property.startsWith('-ms-')) {
          camelProp = 'ms' + camelProp.slice(2);
        } else if (property.startsWith('-moz-')) {
          camelProp = 'Moz' + camelProp.slice(3);
        }

        style[camelProp] = value;
      }
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
    const s = element.textEffectSettings || {};
    const coords = getOffsetCoords(s.offset || 0, s.direction || 0);
    const color = hexToRGBA(s.color || '#000000', s.transparency ?? 100);

    switch (element.textEffect) {
      case 'shadow':
        effects.shadow = {
          color: color,
          blur: s.blur || 0,
          offsetX: coords.x,
          offsetY: coords.y
        };
        break;
      case 'lift':
        const liftBlur = (s.intensity || 50) / 10;
        effects.shadow = {
          color: 'rgba(0,0,0,0.3)',
          blur: liftBlur,
          offsetX: 0,
          offsetY: liftBlur / 2
        };
        break;
      case 'neon':
        effects.shadow = {
          color: element.color || '#fff',
          blur: (s.intensity || 50) / 5,
          offsetX: 0,
          offsetY: 0
        };
        break;
      case 'hollow':
      case 'splice':
      case 'outline':
      case 'echo':
      case 'glitch':
        // Complex effects approximate with the primary shadow for canvas export
        effects.shadow = {
          color: color,
          blur: s.blur || 0,
          offsetX: coords.x,
          offsetY: coords.y
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
    switch (element.shapeEffect) {
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

// Helper to convert hex to rgba
export const hexToRGBA = (hex, alpha) => {
  if (!hex || typeof hex !== 'string') return `rgba(0,0,0,${alpha / 100})`;

  let r = 0, g = 0, b = 0;

  // Remove # if present
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16) || 0;
    g = parseInt(cleanHex[1] + cleanHex[1], 16) || 0;
    b = parseInt(cleanHex[2] + cleanHex[2], 16) || 0;
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.slice(0, 2), 16) || 0;
    g = parseInt(cleanHex.slice(2, 4), 16) || 0;
    b = parseInt(cleanHex.slice(4, 6), 16) || 0;
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
};

// Helper to get x,y from offset and direction
const getOffsetCoords = (offset, direction) => {
  const rad = (direction * Math.PI) / 180;
  return {
    x: Math.round((offset / 10) * Math.cos(rad)),
    y: Math.round((offset / 10) * Math.sin(rad))
  };
};

// Get effect CSS for an element
export const getEffectCSS = (element, textEffects = {}, imageEffects = {}, shapeEffects = {}) => {
  let effectCSS = '';

  if (element.type === 'text' && element.textEffect && element.textEffect !== 'none') {
    const s = element.textEffectSettings || {};
    const coords = getOffsetCoords(s.offset || 0, s.direction || 0);
    const color = hexToRGBA(s.color || '#000000', s.transparency ?? 100);

    switch (element.textEffect) {
      case 'shadow':
        effectCSS += `text-shadow: ${coords.x}px ${coords.y}px ${s.blur || 0}px ${color};`;
        break;
      case 'lift':
        const liftBlur = (s.intensity || 50) / 10;
        effectCSS += `text-shadow: 0 ${liftBlur / 2}px ${liftBlur}px rgba(0,0,0,0.3), 0 ${liftBlur}px ${liftBlur * 2.5}px rgba(0,0,0,0.15);`;
        break;
      case 'hollow':
        effectCSS += `color: transparent; -webkit-text-stroke: ${(s.thickness || 50) / 10}px ${element.color || '#000'};`;
        break;
      case 'splice':
        const spliceThickness = (s.thickness || 50) / 10;
        effectCSS += `color: transparent; -webkit-text-stroke: ${spliceThickness}px ${element.color || '#000'}; text-shadow: ${coords.x}px ${coords.y}px 0 ${color};`;
        break;
      case 'outline':
        effectCSS += `-webkit-text-stroke: ${(s.thickness || 50) / 10}px ${s.color || '#000'};`;
        break;
      case 'echo':
        effectCSS += `text-shadow: ${coords.x}px ${coords.y}px 0 ${color}, ${coords.x * 2}px ${coords.y * 2}px 0 ${color}, ${coords.x * 3}px ${coords.y * 3}px 0 ${color};`;
        break;
      case 'glitch':
        effectCSS += `text-shadow: ${coords.x}px ${coords.y}px 0 #ff00de, ${-coords.x}px ${-coords.y}px 0 #00fff7;`;
        break;
      case 'neon':
        const neonBlur = (s.intensity || 50) / 5;
        const neonColor = element.color || '#fff';
        effectCSS += `text-shadow: 0 0 ${neonBlur / 2}px #fff, 0 0 ${neonBlur}px #fff, 0 0 ${neonBlur * 1.5}px ${neonColor}, 0 0 ${neonBlur * 2}px ${neonColor};`;
        break;
      case 'background':
        // Background is handled separately in CanvasElement rendering
        break;
      default:
        effectCSS += textEffects[element.textEffect]?.css || '';
    }
  }

  if (element.type === 'image') {
    let filters = [];

    // Basic Filters (Adjustments)
    if (element.filters) {
      const basicFilter = getFilterCSS(element.filters);
      if (basicFilter && basicFilter !== 'none') filters.push(basicFilter);
    }

    // Image Effects (Presets)
    if (element.imageEffect && element.imageEffect !== 'none') {
      const presetFilter = imageEffects[element.imageEffect]?.filter;
      if (presetFilter) filters.push(presetFilter);
    }

    // Shadow Effects
    if (element.shadowType && element.shadowType !== 'none') {
      const s = element.shadowSettings || {};
      const color = s.color || '#000000';
      const intensity = (s.intensity || 50) / 100;
      const blur = s.blur || 0;
      const shadowColor = hexToRGBA(color, intensity * 100);

      if (element.shadowType === 'glow') {
        const size = s.size || 0;
        filters.push(`drop-shadow(0 0 ${size + blur}px ${shadowColor})`);
      } else if (element.shadowType === 'drop') {
        const rad = ((s.angle || 0) * Math.PI) / 180;
        const dist = s.distance || 0;
        const ox = dist * Math.cos(rad);
        const oy = dist * Math.sin(rad);
        filters.push(`drop-shadow(${ox}px ${oy}px ${blur}px ${shadowColor})`);
      } else if (element.shadowType === 'outline') {
        const size = s.size || 0;
        // Approximation of outline with 4 drop-shadows
        filters.push(`drop-shadow(${size}px 0 0 ${shadowColor}) drop-shadow(-${size}px 0 0 ${shadowColor}) drop-shadow(0 ${size}px 0 ${shadowColor}) drop-shadow(0 -${size}px 0 ${shadowColor})`);
      } else if (['curved', 'page_lift', 'angled', 'backdrop'].includes(element.shadowType)) {
        // Simple shadows for complex types on canvas
        filters.push(`drop-shadow(0 10px 10px ${shadowColor})`);
      }
    }

    if (filters.length > 0) {
      effectCSS += `filter: ${filters.join(' ')};`;
    }
  }

  if (['rectangle', 'circle', 'triangle', 'star', 'hexagon'].includes(element.type) &&
    element.shapeEffect && element.shapeEffect !== 'none') {
    effectCSS += shapeEffects[element.shapeEffect]?.css || '';
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
/**
 * Maps CSS mix-blend-mode to Canvas globalCompositeOperation
 * @param {string} blendMode - CSS mix-blend-mode value
 * @returns {string} - Canvas globalCompositeOperation value
 */
export const getCanvasBlendMode = (blendMode) => {
  if (!blendMode || blendMode === 'normal') return 'source-over';
  return blendMode; // Most blend modes map 1:1 (multiply, screen, etc.)
};
