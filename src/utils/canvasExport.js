/**
 * Canvas Export Utilities
 * 
 * Functions for exporting canvas designs to various formats:
 * - PNG, JPEG, WebP images
 * - SVG vector graphics
 * - PDF documents
 * - Video recording (via drawElementToCanvas)
 */

import jsPDF from 'jspdf';
import { getFilterCSS, getCanvasGradient, getCanvasEffects, hexToRGBA, getCanvasBlendMode } from './helpers';
import { imageEffects as IMAGE_EFFECTS } from './constants';
import * as Mp4Muxer from 'mp4-muxer';
import { generateSVGPath } from './bezier';

// Image cache to store preloaded images for export
const imageCache = new Map();

// Scratch canvas for complex compositions (reused for performance)
let scratchCanvas = null;
const getScratchCanvas = (w, h) => {
  if (!scratchCanvas) {
    scratchCanvas = document.createElement('canvas');
  }
  if (scratchCanvas.width < w || scratchCanvas.height < h) {
    scratchCanvas.width = Math.max(scratchCanvas.width, w);
    scratchCanvas.height = Math.max(scratchCanvas.height, h);
  }
  const ctx = scratchCanvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
  ctx.filter = 'none';
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  return scratchCanvas;
};

/**
 * Helper to draw an image with object-fit: cover behavior
 */
function drawImageCover(ctx, img, x, y, w, h, flipX = false, flipY = false, crop = null) {
  ctx.save();
  ctx.translate(x, y);
  if (flipX || flipY) {
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.translate(flipX ? -w : 0, flipY ? -h : 0);
  }

  if (crop) {
    const { t = 0, b = 0, l = 0, r = 0 } = crop;
    const visibleW = 1 - l - r;
    const visibleH = 1 - t - b;

    const sw = img.width * visibleW;
    const sh = img.height * visibleH;
    const sx = img.width * l;
    const sy = img.height * t;

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  } else {
    // Standard cover logic if no manual crop
    const imgRatio = img.width / img.height;
    const containerRatio = w / h;

    let sw, sh, sx, sy;
    if (imgRatio > containerRatio) {
      sh = img.height;
      sw = img.height * containerRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = img.width / containerRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  }
  ctx.restore();
}

/**
 * Renders an image with 3D perspective using vertical strip rendering.
 * Simulates rotateX and rotateY effect in a 2D canvas context.
 */
function drawPerspectiveImage(ctx, img, x, y, width, height, rotateX, rotateY, scale = 1) {
  const rx = rotateX * (Math.PI / 180);
  const ry = rotateY * (Math.PI / 180);

  // Vertical strip rendering for horizontal tilt (rotateY)
  // Higher strip count = smoother perspective
  const numStrips = 120;
  const stripWidth = (width * scale) / numStrips;

  ctx.save();
  // Center alignment for rotation
  const centerY = y + (height * scale) / 2;

  for (let i = 0; i < numStrips; i++) {
    // Source coordinates
    const sx = i * (img.width / numStrips);
    const sw = img.width / numStrips;

    // Destination coordinates
    const dx = x + i * stripWidth;

    // Calculate vertical scale and offset based on rotateY (perspective projection)
    const distFromCenter = (i - numStrips / 2) / (numStrips / 2); // -1 to 1

    // Perspective math: 
    // This is a simplified projection. 
    // We use a constant to control the 'strength' of the vanishing point effect
    const persStrength = 0.45;
    const perspectiveScale = 1 + Math.sin(ry) * distFromCenter * persStrength;

    // Combine with rotateX scaling and global scale
    const finalH = height * scale * perspectiveScale * Math.abs(Math.cos(rx));
    const finalY = centerY - (finalH / 2);

    ctx.drawImage(img, sx, 0, sw, img.height, dx, finalY, stripWidth + 0.5, finalH);
  }
  ctx.restore();
}

/**
 * Preload all images and stickers required for export
 */
export const preloadAllImages = async (elements) => {
  const imagesToLoad = elements.filter(el =>
    el.type === 'image' ||
    el.type === 'sticker' ||
    (el.type === 'frame' && el.content && el.contentType !== 'video')
  );

  const loadPromises = imagesToLoad.map(element => {
    let src = '';
    if (element.type === 'image') src = element.src;
    else if (element.type === 'frame') src = element.content;
    else if (element.type === 'sticker') {
      // Stickers are text-based, no image to preload unless it's an SVG asset
      return Promise.resolve();
    }

    if (!src || imageCache.has(src)) return Promise.resolve();

    return new Promise((resolve) => {
      const img = new window.Image();
      // Only set crossOrigin if it's an external URL
      if (src.startsWith('http')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        imageCache.set(src, img);
        resolve();
      };
      img.onerror = () => {
        console.error(`Failed to preload image: ${src}`);
        resolve(); // Continue anyway
      };
      img.src = src;
    });
  });

  await Promise.all(loadPromises);
};

/**
 * Sort elements for export with proper zIndex layering
 */
export const getSortedElementsForExport = (elements) => {
  // Create a copy and sort by zIndex to ensure proper layering
  const sortedElements = [...elements].sort((a, b) => {
    // Handle groups and their children properly
    if (a.type === 'group' && b.groupId === a.id) return -1;
    if (b.type === 'group' && a.groupId === b.id) return 1;

    // Regular zIndex comparison
    return a.zIndex - b.zIndex;
  });

  return sortedElements;
};

/**
 * Draw an element to canvas context with animations and effects
 * Used for PDF/PNG/Video export
 */
export const drawElementToCanvas = (ctx, element, time, elementIndex, imageEffects = IMAGE_EFFECTS) => {
  ctx.save();

  // Handle Blend Mode
  if (element.blendMode) {
    ctx.globalCompositeOperation = getCanvasBlendMode(element.blendMode);
  }

  let translateX = 0;
  let translateY = 0;
  let scaleX = 1;
  let scaleY = 1;
  let rotation = element.rotation || 0;
  // Prioritize direct opacity property, fallback to filter-based opacity
  const elementOpacity = element.opacity !== undefined
    ? element.opacity
    : (element.filters?.opacity ? element.filters.opacity.value / 100 : 1);
  let opacity = elementOpacity;

  const exportTime = time === undefined ? 9999 : time;
  const staggeredTime = Math.max(0, exportTime - (elementIndex * 0.2));
  const animTime = Math.min(Math.max(staggeredTime, 0), 1);

  if (animTime > 0 && animTime <= 1) {
    const animType = (element.animation && typeof element.animation === 'object') ? element.animation.type : element.animation;
    switch (animType) {
      case 'rise':
        translateY = 100 * (1 - animTime);
        opacity = animTime * elementOpacity;
        break;
      case 'pan':
        translateX = -100 * (1 - animTime);
        opacity = animTime * elementOpacity;
        break;
      case 'fade':
        opacity = animTime * elementOpacity;
        break;
      case 'bounce':
        // CSS: 0% scale 0.3 -> 50% scale 1.1 -> 100% scale 1
        if (animTime < 0.5) {
          // 0 -> 0.5 maps to scale 0.3 -> 1.1
          const t = animTime * 2;
          const s = 0.3 + (0.8 * t);
          scaleX = s;
          scaleY = s;
          opacity = (animTime / 0.5) * 0.8 * elementOpacity;
        } else {
          // 0.5 -> 1.0 maps to scale 1.1 -> 1.0
          const t = (animTime - 0.5) * 2;
          const s = 1.1 - (0.1 * t);
          scaleX = s;
          scaleY = s;
          opacity = (0.8 + (t * 0.2)) * elementOpacity;
        }
        break;
      case 'zoomIn':
        scaleX = animTime;
        scaleY = animTime;
        opacity = animTime * elementOpacity;
        break;
      case 'zoomOut':
        scaleX = 2 - 1 * animTime;
        scaleY = 2 - 1 * animTime;
        opacity = animTime * elementOpacity;
        break;
      case 'slideInLeft':
        translateX = -200 * (1 - animTime);
        opacity = animTime * elementOpacity;
        break;
      case 'slideInRight':
        translateX = 200 * (1 - animTime);
        opacity = animTime * elementOpacity;
        break;
      case 'slideInUp':
        translateY = 100 * (1 - animTime);
        opacity = animTime * elementOpacity;
        break;
      case 'slideInDown':
        translateY = -100 * (1 - animTime);
        opacity = animTime * elementOpacity;
        break;
      case 'spin':
        rotation += 360 * animTime;
        opacity = animTime * elementOpacity;
        break;
      case 'pulse':
        // 0 -> 1 scale, 50% 1.05
        const pScale = 1 + 0.05 * Math.sin(animTime * Math.PI);
        scaleX = pScale;
        scaleY = pScale;
        opacity = elementOpacity;
        break;
      case 'typewriter':
      case 'wipe':
        // Handled via clipping below, enable full opacity
        opacity = elementOpacity;
        break;
      case 'tumble':
        rotation = 180 * (1 - animTime);
        scaleX = animTime;
        scaleY = animTime;
        opacity = animTime * elementOpacity;
        break;
      case 'pop':
        // 0% -> 80% (scale 0 -> 1.2), 80% -> 100% (scale 1.2 -> 1)
        if (animTime < 0.8) {
          const t = animTime / 0.8;
          const s = 1.2 * t;
          scaleX = s;
          scaleY = s;
          opacity = (animTime / 0.8) * 0.8 * elementOpacity;
        } else {
          const t = (animTime - 0.8) / 0.2;
          const s = 1.2 - (0.2 * t);
          scaleX = s;
          scaleY = s;
          opacity = (0.8 + (t * 0.2)) * elementOpacity;
        }
        break;
      case 'flip':
        // 3D Flip simulated via scaleX 0 -> 1 (approx 90deg -> 0deg)
        scaleX = animTime;
        opacity = animTime * elementOpacity;
        break;
      case 'flash':
        // 0, 50, 100 -> op 1. 25, 75 -> op 0
        if ((animTime > 0.12 && animTime < 0.38) || (animTime > 0.62 && animTime < 0.88)) {
          opacity = 0;
        } else {
          opacity = elementOpacity;
        }
        break;
      case 'glitch':
        if (animTime < 1) {
          const step = Math.floor(animTime * 5); // 5 steps
          if (step === 1) { translateX = -2; translateY = 2; opacity = 0.8 * elementOpacity; }
          else if (step === 2) { translateX = -2; translateY = -2; opacity = 0.9 * elementOpacity; }
          else if (step === 3) { translateX = 2; translateY = 2; opacity = 0.7 * elementOpacity; }
          else if (step === 4) { translateX = 2; translateY = -2; opacity = 0.8 * elementOpacity; }
        }
        break;
      case 'heartbeat':
        // 0, 100 -> 1. 50 -> 1.1
        {
          const hb = 1 + 0.1 * Math.sin(animTime * Math.PI);
          scaleX = hb;
          scaleY = hb;
          opacity = elementOpacity;
        }
        break;
      case 'wiggle':
        rotation += 5 * Math.sin(animTime * Math.PI * 2);
        opacity = elementOpacity;
        break;
      case 'jiggle':
        if (animTime < 1) {
          const step = Math.floor(animTime * 4);
          if (step === 1) { translateX = -2; translateY = -2; }
          else if (step === 2) { translateX = 2; translateY = 2; }
          else if (step === 3) { translateX = -2; translateY = 2; }
        }
        opacity = elementOpacity;
        break;
      case 'shake':
        translateX = 10 * Math.sin(animTime * Math.PI * 10);
        opacity = elementOpacity;
        break;
      case 'drift':
        // 0->0, 50-> -15px, 1deg, 100->0
        {
          const t = Math.sin(animTime * Math.PI); // 0 -> 1 -> 0
          translateY = -15 * t;
          rotation += 1 * t;
          opacity = elementOpacity;
        }
        break;
      case 'breathe':
        // 0->1, 50->1.08, 100->1
        {
          const t = Math.sin(animTime * Math.PI); // 0 -> 1 -> 0
          const s = 1 + (0.08 * t);
          scaleX = s;
          scaleY = s;
          opacity = elementOpacity;
        }
        break;
      case 'fadeOut':
        opacity = elementOpacity * (1 - animTime);
        break;
      case 'slideOutLeft':
        translateX = -200 * animTime;
        opacity = elementOpacity * (1 - animTime);
        break;
      case 'slideOutRight':
        translateX = 200 * animTime;
        opacity = elementOpacity * (1 - animTime);
        break;
      case 'blurIn':
        opacity = animTime * elementOpacity;
        break;
      case 'flicker':
        opacity = elementOpacity * (0.3 + 0.7 * Math.sin(animTime * Math.PI * 8));
        break;
      case 'rotate':
        rotation += 360 * animTime;
        opacity = animTime * elementOpacity;
        break;
      case 'neon':
        if ((animTime > 0.90 && animTime < 0.92) || (animTime > 0.94 && animTime < 0.96)) {
          opacity = elementOpacity * 0.4;
        } else {
          opacity = elementOpacity;
        }
        break;
      default:
        opacity = animTime * elementOpacity;
        break;
    }
  } else {
    // For static exports or end of animation
    if (time === undefined || exportTime > 5) {
      const animType = (element.animation && typeof element.animation === 'object') ? element.animation.type : element.animation;
      if (animType === 'fadeOut' || (typeof animType === 'string' && animType.includes('slideOut'))) {
        opacity = 0;
      } else {
        // Reset to static state
        opacity = elementOpacity;
        scaleX = 1;
        scaleY = 1;
        translateX = 0;
        translateY = 0;
        rotation = element.rotation || 0;
      }
    } else {
      opacity = staggeredTime < 0 ? 0 : elementOpacity;
    }
  }

  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;

  ctx.translate(centerX, centerY);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(scaleX, scaleY);
  ctx.translate(-centerX, -centerY);
  ctx.translate(translateX, translateY);

  // Apply Wipe/Typewriter Clipping
  if (element.animation && (element.animation.type === 'wipe' || element.animation.type === 'typewriter')) {
    const animTime = Math.min(Math.max(staggeredTime, 0), 1);

    // Safeguard clipping with an extra save/restore specifically for this element's inner content
    ctx.save();
    ctx.beginPath();

    // For text-like elements, allow side overflow to prevent cutting off wide characters/extrusion
    const isTextLike = element.type === 'text' || element.type === 'type_extrude';
    const overflow = isTextLike ? 1000 : 0;

    // Clip from Left to Right
    const clipWidth = (element.width + overflow * 2) * animTime;
    ctx.rect(element.x - overflow, element.y - 100, clipWidth, element.height + 200);
    ctx.clip();
  }

  // Apply canvas effects
  const canvasEffects = getCanvasEffects(element, imageEffects);

  // Apply shadow effects (Basic Shadows like Drop/Glow from helper)
  // Note: We now have advanced shadowType logic below which might override this
  if (canvasEffects.shadow && Object.keys(canvasEffects.shadow).length > 0 && (!element.shadowType || element.shadowType === 'none')) {
    ctx.shadowColor = canvasEffects.shadow.color;
    ctx.shadowBlur = canvasEffects.shadow.blur || 0;
    ctx.shadowOffsetX = canvasEffects.shadow.offsetX || 0;
    ctx.shadowOffsetY = canvasEffects.shadow.offsetY || 0;
  }

  // NEW: Advanced Shadow Logic (Glow, Drop, Outline, Geometric)
  // We handle Geometric shadows separately as they are drawn BEHIND the element.
  // We handle Glow/Drop via context shadow properties.
  // We handle Outline via explicit stroke.

  if (element.shadowType && element.shadowType !== 'none') {
    // const shape = element.type; // Unused
    const s = element.shadowSettings || {};
    const color = s.color || '#000000';
    const intensity = (s.intensity || 50) / 100;
    const blur = s.blur || 0;
    // Helper to apply opacity to hex/rgb color
    const applyOpacity = (c, o) => {
      // Simple check if it's hex, otherwise assumes rgba or color name
      if (c.startsWith('#')) {
        const r = parseInt(c.slice(1, 3), 16);
        const g = parseInt(c.slice(3, 5), 16);
        const b = parseInt(c.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${o})`;
      }
      return c; // Fallback
    };
    const shadowColor = applyOpacity(color, intensity);

    if (element.shadowType === 'glow') {
      // Glow: No offset, high blur
      if (element.type === 'image') {
        // Image silhouette glow via filter later
      } else {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = (s.size || 0) + (blur || 0);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    } else if (element.shadowType === 'drop') {
      // Drop: Angled offset
      if (element.type === 'image') {
        // Image silhouette drop via filter later
      } else {
        const rad = ((s.angle || 0) * Math.PI) / 180;
        const dist = s.distance || 0;
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = blur;
        ctx.shadowOffsetX = dist * Math.cos(rad);
        ctx.shadowOffsetY = dist * Math.sin(rad);
      }
    } else if (['curved', 'page_lift', 'angled', 'backdrop'].includes(element.shadowType)) {
      ctx.save();
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = blur;
      ctx.fillStyle = shadowColor;
      ctx.globalAlpha = intensity; // Combine with element opacity

      if (element.shadowType === 'angled') {
        // Angled: Skewed rect behind
        const angle = s.angle || 45;
        const dist = s.distance || 10;
        const skewRad = ((angle - 45) * Math.PI) / 180;
        const rad = (angle * Math.PI) / 180;
        const tx = dist * Math.cos(rad);
        const ty = dist * Math.sin(rad);

        ctx.translate(element.x + tx, element.y + ty);
        ctx.transform(1, 0, Math.tan(skewRad), 1, 0, 0); // Horizontal skew

        // Draw skewed rect
        if (element.borderRadius) {
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(0, 0, element.width, element.height, element.borderRadius);
          else ctx.fillRect(0, 0, element.width, element.height);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, element.width, element.height);
        }
      } else if (element.shadowType === 'backdrop') {
        // Backdrop: Flat offset
        const rad = ((s.angle || -45) * Math.PI) / 180;
        const dist = s.distance || 20;
        const ox = dist * Math.cos(rad);
        const oy = dist * Math.sin(rad);

        if (element.borderRadius) {
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(element.x + ox, element.y + oy, element.width, element.height, element.borderRadius);
          else ctx.fillRect(element.x + ox, element.y + oy, element.width, element.height);
          ctx.fill();
        } else {
          ctx.fillRect(element.x + ox, element.y + oy, element.width, element.height);
        }
      } else if (element.shadowType === 'curved') {
        // Curved: Ellipse at bottom
        const dist = s.distance || 0;
        const curveVal = s.curve || 0;
        const cx = element.x + element.width / 2;
        const cy = element.y + element.height + (dist / 4);
        const rw = element.width * 0.45;
        const rh = 5 + (curveVal / 10);

        ctx.beginPath();
        ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (element.shadowType === 'page_lift') {
        // Page Lift: Two skewed rects at bottom corners
        const dist = s.distance || 0;
        const curveVal = s.curve || 0;
        const liftAngle = (1 + (curveVal / 20)) * (Math.PI / 180);
        const w = element.width * 0.5;
        const h = element.height * 0.2;
        const yOffset = dist / 5;

        // Left Shadow
        ctx.save();
        ctx.translate(element.x + 5, element.y + element.height + yOffset);
        ctx.rotate(-liftAngle);
        ctx.transform(1, 0, Math.tan(-liftAngle - 0.03), 1, 0, 0);
        ctx.fillRect(0, -h, w, h);
        ctx.restore();

        // Right Shadow
        ctx.save();
        ctx.translate(element.x + element.width - 5 - w, element.y + element.height + yOffset);
        ctx.rotate(liftAngle);
        ctx.transform(1, 0, Math.tan(liftAngle + 0.03), 1, 0, 0);
        ctx.fillRect(0, -h, w, h);
        ctx.restore();
      }
      ctx.restore();
    } else if (element.shadowType === 'outline') {
      // Outline: solid stroke behind
      if (element.type === 'image') {
        // Image silhouette outline via filter later
      } else {
        const sSize = (s.size || 0);
        ctx.save();
        ctx.strokeStyle = shadowColor;
        ctx.lineWidth = sSize * 2;
        ctx.lineJoin = 'round';

        ctx.beginPath();
        const br = element.borderRadius || 0;
        if (element.type === 'circle') {
          ctx.ellipse(element.x + element.width / 2, element.y + element.height / 2, element.width / 2, element.height / 2, 0, 0, Math.PI * 2);
        } else {
          if (ctx.roundRect) ctx.roundRect(element.x, element.y, element.width, element.height, br);
          else ctx.rect(element.x, element.y, element.width, element.height);
        }
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  // Neon Glow for Export
  if (element.animation && element.animation.type === 'neon') {
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 10;
    ctx.filter = (ctx.filter && ctx.filter !== 'none' ? ctx.filter + ' ' : '') + 'brightness(1.2)';
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
    if (!ctx.filter || ctx.filter === 'none') {
      ctx.filter = canvasEffects.filters;
    } else {
      ctx.filter += ' ' + canvasEffects.filters;
    }
  }

  // IMAGE SPECIFIC SILHOUETTE SHADOWS (matching helpers.js getEffectCSS)
  if (element.type === 'image' && element.shadowType && ['glow', 'drop', 'outline'].includes(element.shadowType)) {
    const s = element.shadowSettings || {};
    const color = s.color || '#000000';
    const intensity = (s.intensity || 50) / 100;
    const blur = s.blur || 0;
    const size = s.size || 0;
    const shadowColor = hexToRGBA(color, intensity * 100);

    let shadowFilter = '';
    if (element.shadowType === 'glow') {
      // Glow: Stacked shadows to simulate dilation + blur
      // Canvas SVG uses feMorphology (dilate radius size/2) + feGaussianBlur (stdDev blur/2)
      const radius = (size + blur) / 1.5; // Calibrated factor
      shadowFilter = `drop-shadow(0 0 ${radius}px ${shadowColor}) drop-shadow(0 0 ${radius / 2}px ${shadowColor})`;
    } else if (element.shadowType === 'drop') {
      const rad = ((s.angle || 0) * Math.PI) / 180;
      const dist = s.distance || 0;
      const ox = dist * Math.cos(rad);
      const oy = dist * Math.sin(rad);
      // Canvas SVG uses stdDeviation = blur / 3, so radius should be approx blur * 0.66
      const dropBlur = blur * 0.66;
      shadowFilter = `drop-shadow(${ox}px ${oy}px ${dropBlur}px ${shadowColor})`;
    } else if (element.shadowType === 'outline') {
      // Outline: 8-way shadow for smoother coverage without SVG Morphology
      const ds = `drop-shadow(${size}px 0 0 ${shadowColor}) drop-shadow(-${size}px 0 0 ${shadowColor}) drop-shadow(0 ${size}px 0 ${shadowColor}) drop-shadow(0 -${size}px 0 ${shadowColor})`;
      const diag = size * 0.707;
      const dds = `drop-shadow(${diag}px ${diag}px 0 ${shadowColor}) drop-shadow(-${diag}px ${diag}px 0 ${shadowColor}) drop-shadow(${diag}px -${diag}px 0 ${shadowColor}) drop-shadow(-${diag}px -${diag}px 0 ${shadowColor})`;
      shadowFilter = `${ds} ${dds}`;
    }

    if (shadowFilter) {
      if (!ctx.filter || ctx.filter === 'none') {
        ctx.filter = shadowFilter;
      } else {
        ctx.filter += ' ' + shadowFilter;
      }
    }
  }

  ctx.globalAlpha = opacity;

  // Use getCanvasGradient for everything (supports solid color fallback)
  const backgroundStyle = getCanvasGradient(ctx, element);
  const fillStyle = (element.type === 'frame' && !element.content) ? '#f3f4f6' : (element.fill || backgroundStyle);

  // Rectangle with proper border radius handling
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
    ctx.ellipse(element.x + element.width / 2, element.y + element.height / 2, element.width / 2, element.height / 2, 0, 0, Math.PI * 2);
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
  } else if (element.type === 'image') {
    // IMAGE EXPORT LOGIC WITH FLIP AND CROP

    // 1. Loading Image
    let img = imageCache.get(element.src);
    if (!img) {
      // Synchronous fallback attempt (Note: this often fails if not preloaded)
      // We really rely on preloadAllImages.
      const tempImg = new window.Image();
      tempImg.src = element.src;
      // If it's a data URL or blob, it might render immediately?
      // If it's an external URL, it won't render synchronously.
      img = tempImg;
    }

    if (img) {
      // 1b. Apply Filters (Before save/clip)
      const adjustments = element.adjustments || {};
      const adjustFilter = [
        adjustments.brightness ? `brightness(${100 + adjustments.brightness}%)` : '',
        adjustments.contrast ? `contrast(${100 + adjustments.contrast}%)` : '',
        adjustments.saturation ? `saturate(${100 + adjustments.saturation}%)` : '',
        adjustments.tint ? `hue-rotate(${adjustments.tint}deg)` : '',
        adjustments.blur ? `blur(${adjustments.blur}px)` : '',
        adjustments.sepia ? `sepia(${adjustments.sepia}%)` : ''
      ].filter(Boolean).join(' ');

      const effectFilter = element.imageEffect && imageEffects[element.imageEffect]
        ? imageEffects[element.imageEffect].filter
        : '';

      const finalFilter = `${effectFilter} ${adjustFilter}`.trim();

      // Use scratch canvas for perfect composition (Shadow + Filter + Clip)
      // This ensures that filters and clipping are applied isolated from the main canvas shadow
      const scratch = getScratchCanvas(element.width, element.height);
      const sCtx = scratch.getContext('2d');

      sCtx.save();
      // 1. Set filter on scratch
      if (finalFilter && finalFilter !== 'none') sCtx.filter = finalFilter;

      // 2. Clip on scratch (at 0,0)
      const borderRadius = element.borderRadius || 0;
      if (borderRadius > 0) {
        sCtx.beginPath();
        if (sCtx.roundRect) sCtx.roundRect(0, 0, element.width, element.height, borderRadius);
        else sCtx.rect(0, 0, element.width, element.height);
        sCtx.clip();
      }

      // 3. Draw image to scratch (translated to 0,0)
      if (element.transform3d) {
        drawPerspectiveImage(sCtx, img, 0, 0, element.width, element.height, element.transform3d.rotateX || 0, element.transform3d.rotateY || 0, element.transform3d.scale || 1);
      } else {
        drawImageCover(sCtx, img, 0, 0, element.width, element.height, element.flipX, element.flipY, element.crop);
      }
      sCtx.restore();

      // 4. Draw scratch to main canvas
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.drawImage(scratch, 0, 0, element.width, element.height, element.x, element.y, element.width, element.height);
      ctx.restore();

      // Reset filter on main context (crucial for next elements)
      ctx.filter = 'none';
    }
  } else if (element.type === 'type_extrude') {
    const word = (element.content || '').toUpperCase();
    const fontSize = parseFloat(element.fontSize) || 64;
    const length = element.length || 0;
    // Sync with CanvasElement.jsx layer logic
    const numLayers = Math.min(150, Math.max(1, Math.floor(length / 2)));
    const step = numLayers > 1 ? (length / numLayers) : length;
    const radians = ((element.angle || 0) * Math.PI) / 180;
    const mappedLineHeight = 1.4 + ((element.lineHeightValue || 0) / 10);
    const lineHeight = fontSize * mappedLineHeight;
    const borderWidth = element.borderWidth || 0;

    ctx.save();
    ctx.font = `${element.fontWeight || '900'} ${fontSize}px '${element.fontFamily || 'Gasoek One'}'`;
    ctx.textAlign = element.textAlign || 'center';
    ctx.textBaseline = 'middle';

    const lines = word.split('\n');
    const totalHeight = lines.length * lineHeight;

    let tx = element.x + element.width / 2;
    if (element.textAlign === 'left') tx = element.x + 10;
    if (element.textAlign === 'right') tx = element.x + element.width - 10;

    const startY = element.y + (element.height - totalHeight) / 2 + lineHeight / 2;

    const drawLines = (ctx, ox = 0, oy = 0, isStroke = false) => {
      lines.forEach((line, index) => {
        const ly = startY + index * lineHeight;
        if (isStroke) {
          ctx.strokeText(line, tx + ox, ly + oy);
        } else {
          ctx.fillText(line, tx + ox, ly + oy);
        }
      });
    };

    // 1. Draw Extrude Layers (Back to Front)
    ctx.fillStyle = element.extrudeColor || '#000000';
    for (let i = numLayers - 1; i >= 0; i--) {
      const offset = (i + 1) * step;
      const ox = Math.cos(radians) * offset;
      const oy = Math.sin(radians) * offset;
      drawLines(ctx, ox, oy);
    }

    // 2. Draw Main Surface (Face)
    // Mirror the textShadow border if borderWidth > 0
    // lineWidth = borderWidth * 2 because filled last (covers inner half)
    if (borderWidth > 0) {
      ctx.strokeStyle = element.extrudeColor || '#000000';
      ctx.lineWidth = borderWidth * 2;
      ctx.lineJoin = 'round';
      drawLines(ctx, 0, 0, true);
    }
    ctx.fillStyle = element.color || '#FFFFFF';
    drawLines(ctx, 0, 0);

    ctx.restore();
  } else if (element.type === 'text') {
    // Draw Background Effect if enabled
    if (element.textEffect === 'background') {
      const bgS = element.textEffectSettings || {};
      const spread = bgS.spread || 0;
      const roundness = bgS.roundness || 0;
      const bgOpacity = (bgS.transparency ?? 100) / 100;

      // Calculate background rect (apply spread)
      const bgX = element.x - (spread / 4);
      const bgY = element.y - (spread / 4);
      const bgW = element.width + (spread / 2);
      const bgH = element.height + (spread / 2);

      ctx.save();
      ctx.globalAlpha = opacity * bgOpacity;
      ctx.fillStyle = bgS.color || '#ffff00';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bgX, bgY, bgW, bgH, roundness);
      } else {
        // Simple fallback to rectangle if roundRect not available in this env
        ctx.rect(bgX, bgY, bgW, bgH);
      }
      ctx.fill();
      ctx.restore();
    }

    const isSubSuper = element.textPosition === 'superscript' || element.textPosition === 'subscript';
    const exportFontSize = isSubSuper ? (parseFloat(element.fontSize) || 16) * 0.65 : (parseFloat(element.fontSize) || 16);

    ctx.font = `${element.fontWeight || 'normal'} ${exportFontSize}px ${element.fontFamily || 'Arial'}`;

    // Support for text gradients
    if (element.fillType === 'gradient' && element.gradient) {
      ctx.fillStyle = getCanvasGradient(ctx, element);
    } else {
      ctx.fillStyle = element.color || '#000000';
    }

    ctx.strokeStyle = ctx.fillStyle; // Used for hollow/outline
    ctx.textAlign = element.textAlign || 'left';
    ctx.textBaseline = 'top';

    // Set letter spacing if supported (Chrome 94+, Firefox 94+)
    if (element.letterSpacing !== undefined && 'letterSpacing' in ctx) {
      ctx.letterSpacing = `${element.letterSpacing}px`;
    }

    // Modern Typography Support (if available in context)
    if (element.fontKerning && 'fontKerning' in ctx) {
      ctx.fontKerning = element.fontKerning;
    }
    if (element.fontVariantLigatures && 'fontVariantLigatures' in ctx) {
      ctx.fontVariantLigatures = element.fontVariantLigatures;
    }

    let textX = element.x;
    if (element.textAlign === 'center') {
      textX = element.x + element.width / 2;
    } else if (element.textAlign === 'right') {
      textX = element.x + element.width;
    }

    let displayText = element.content || '';
    if (element.animation === 'typewriter' && exportTime !== undefined) {
      const animTime = Math.min(Math.max(staggeredTime, 0), 1);
      const charsToShow = Math.floor(displayText.length * animTime);
      displayText = displayText.substring(0, charsToShow);
    }

    // Apply text transform if set
    if (element.textTransform === 'uppercase') {
      displayText = displayText.toUpperCase();
    } else if (element.textTransform === 'lowercase') {
      displayText = displayText.toLowerCase();
    }

    const padding = parseFloat(element.padding) || 4;
    const currentFontSize = parseFloat(element.fontSize) || 16;
    const lineHeightMultiplier = element.lineHeight || 1.2;
    const lineHeight = currentFontSize * lineHeightMultiplier;

    const maxWidth = Math.max(1, element.width - (padding * 2));

    const subSuperOffset = element.textPosition === 'superscript'
      ? -(currentFontSize * 0.35)
      : (element.textPosition === 'subscript' ? (currentFontSize * 0.1) : 0);

    const lines = displayText.split('\n');
    let currentY = element.y + padding + (currentFontSize * 0.1) + subSuperOffset; // Small offset for alignment

    const drawLine = (text, lx, ly) => {
      if (!text || !text.trim()) return;
      const s = element.textEffectSettings || {};
      if (element.textEffect === 'hollow' || element.textEffect === 'splice') {
        ctx.lineWidth = (s.thickness || 50) / 10;
        ctx.strokeText(text, lx, ly);
      } else if (element.textEffect === 'outline') {
        ctx.lineWidth = (s.thickness || 50) / 10;
        ctx.strokeStyle = s.color || '#000';
        ctx.strokeText(text, lx, ly);
        ctx.fillText(text, lx, ly);
      } else {
        ctx.fillText(text, lx, ly);
      }
    };

    lines.forEach(lineText => {
      if (!lineText.trim() && lineText.length === 0) {
        currentY += lineHeight;
        return;
      }

      const words = lineText.split(' ');
      let currentLine = '';

      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + (n < words.length - 1 ? ' ' : '');
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
          drawLine(currentLine.trim(), textX, currentY);
          currentLine = words[n] + ' ';
          currentY += lineHeight;
        } else {
          currentLine = testLine;
        }
      }
      drawLine(currentLine.trim(), textX, currentY);
      currentY += lineHeight;
    });

    // Reset properties
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  } else if (['line', 'line_double', 'arrow', 'arrow_double'].includes(element.type)) {
    const w = element.width;
    const h = element.height;
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth;
    ctx.lineCap = element.strokeLinecap || 'butt';
    if (element.strokeDasharray) ctx.setLineDash(element.strokeDasharray.split(',').map(Number));

    const drawSingleLine = (yOffset = 0) => {
      const strokeWidth = element.strokeWidth ?? 2;
      const arrowSize = Math.max(8, strokeWidth * 4); // Match SVG marker scale (4x)

      // Shorten line so it doesn't run through the arrow head (matching SVG behavior)
      const startX = element.type.includes('double') ? element.x + arrowSize : element.x;
      const endX = element.type.includes('arrow') ? element.x + w - arrowSize : element.x + w;

      ctx.beginPath();
      ctx.moveTo(startX, element.y + h / 2 + yOffset);
      ctx.lineTo(endX, element.y + h / 2 + yOffset);
      ctx.stroke();

      if (element.type.includes('arrow')) {
        // Draw arrowhead at the end
        ctx.save();
        ctx.fillStyle = element.stroke;

        // Marker in SVG is 4x4 units relative to strokeWidth.
        // Points: 0,0 -> 4,2 -> 0,4
        // The tip (4,2) is at the element edge.
        // Base is at 0.

        ctx.beginPath();
        // Tip
        ctx.moveTo(element.x + w, element.y + h / 2 + yOffset);
        // Top Base
        ctx.lineTo(element.x + w - arrowSize, element.y + h / 2 + yOffset - arrowSize / 2);
        // Bottom Base
        ctx.lineTo(element.x + w - arrowSize, element.y + h / 2 + yOffset + arrowSize / 2);
        ctx.closePath();
        ctx.fill();

        // Start Arrow (if double)
        if (element.type.includes('double')) {
          ctx.beginPath();
          // Tip
          ctx.moveTo(element.x, element.y + h / 2 + yOffset);
          // Top Base
          ctx.lineTo(element.x + arrowSize, element.y + h / 2 + yOffset - arrowSize / 2);
          // Bottom Base
          ctx.lineTo(element.x + arrowSize, element.y + h / 2 + yOffset + arrowSize / 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    };

    drawSingleLine();
    if (element.type === 'line_double') {
      drawSingleLine((element.strokeWidth ?? 2) * 2);
    }
    ctx.setLineDash([]);
  } else if (['trapezoid', 'parallelogram', 'triangle_right', 'cross', 'speech_bubble', 'speech_bubble_round', 'thought_bubble', 'cloud', 'callout', 'location', 'shield', 'banner', 'ribbon', 'search', 'diamond', 'heart'].includes(element.type)) {
    const w = element.width;
    const h = element.height;

    ctx.fillStyle = backgroundStyle;
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth;
    ctx.beginPath();

    if (element.type === 'trapezoid') {
      ctx.moveTo(element.x + w * 0.2, element.y);
      ctx.lineTo(element.x + w * 0.8, element.y);
      ctx.lineTo(element.x + w, element.y + h);
      ctx.lineTo(element.x, element.y + h);
      ctx.closePath();
    } else if (element.type === 'heart') {
      const x = element.x;
      const y = element.y;
      ctx.moveTo(x + w * 0.5, y + h * 0.3);
      ctx.bezierCurveTo(x + w * 0.5, y + h * 0.1, x + w * 0.35, y, x + w * 0.25, y);
      ctx.bezierCurveTo(x + w * 0.1, y, x, y + h * 0.15, x, y + h * 0.3);
      ctx.bezierCurveTo(x, y + h * 0.55, x + w * 0.25, y + h * 0.75, x + w * 0.5, y + h);
      ctx.bezierCurveTo(x + w * 0.75, y + h * 0.75, x + w, y + h * 0.55, x + w, y + h * 0.3);
      ctx.bezierCurveTo(x + w, y + h * 0.15, x + w * 0.9, y, x + w * 0.75, y);
      ctx.bezierCurveTo(x + w * 0.65, y, x + w * 0.5, y + h * 0.1, x + w * 0.5, y + h * 0.3);
      ctx.closePath();
    } else if (element.type === 'parallelogram') {
      ctx.moveTo(element.x + w * 0.25, element.y);
      ctx.lineTo(element.x + w, element.y);
      ctx.lineTo(element.x + w * 0.75, element.y + h);
      ctx.lineTo(element.x, element.y + h);
      ctx.closePath();
    } else if (element.type === 'triangle_right') {
      ctx.moveTo(element.x, element.y);
      ctx.lineTo(element.x, element.y + h);
      ctx.lineTo(element.x + w, element.y + h);
      ctx.closePath();
    } else if (element.type === 'diamond') {
      ctx.moveTo(element.x + w * 0.5, element.y);
      ctx.lineTo(element.x + w, element.y + h * 0.5);
      ctx.lineTo(element.x + w * 0.5, element.y + h);
      ctx.lineTo(element.x, element.y + h * 0.5);
      ctx.closePath();
    } else if (element.type === 'cross') {
      const t = Math.min(w, h) * 0.3;
      const cx = element.x + w / 2, cy = element.y + h / 2;
      ctx.moveTo(cx - t / 2, element.y);
      ctx.lineTo(cx + t / 2, element.y);
      ctx.lineTo(cx + t / 2, cy - t / 2);
      ctx.lineTo(element.x + w, cy - t / 2);
      ctx.lineTo(element.x + w, cy + t / 2);
      ctx.lineTo(cx + t / 2, cy + t / 2);
      ctx.lineTo(cx + t / 2, element.y + h);
      ctx.lineTo(cx - t / 2, element.y + h);
      ctx.lineTo(cx - t / 2, cy + t / 2);
      ctx.lineTo(element.x, cy + t / 2);
      ctx.lineTo(element.x, cy - t / 2);
      ctx.lineTo(cx - t / 2, cy - t / 2);
      ctx.closePath();
    } else if (element.type === 'speech_bubble' || element.type === 'callout') {
      ctx.moveTo(element.x, element.y);
      ctx.lineTo(element.x + w, element.y);
      ctx.lineTo(element.x + w, element.y + h * 0.8);
      ctx.lineTo(element.x + w * 0.4, element.y + h * 0.8);
      ctx.lineTo(element.x + w * 0.3, element.y + h);
      ctx.lineTo(element.x + w * 0.2, element.y + h * 0.8);
      ctx.lineTo(element.x, element.y + h * 0.8);
      ctx.closePath();
    } else if (element.type === 'speech_bubble_round') {
      const x = element.x, y = element.y;
      ctx.moveTo(x + w * 0.5, y);
      ctx.bezierCurveTo(x + w * 0.8, y, x + w, y + h * 0.2, x + w, y + h * 0.4);
      ctx.bezierCurveTo(x + w, y + h * 0.6, x + w * 0.8, y + h * 0.8, x + w * 0.5, y + h * 0.8);
      ctx.lineTo(x + w * 0.3, y + h);
      ctx.lineTo(x + w * 0.4, y + h * 0.8);
      ctx.bezierCurveTo(x + w * 0.2, y + h * 0.8, x, y + h * 0.6, x, y + h * 0.4);
      ctx.bezierCurveTo(x, y + h * 0.2, x + w * 0.2, y, x + w * 0.5, y);
      ctx.closePath();
    } else if (element.type === 'thought_bubble' || element.type === 'cloud') {
      const x = element.x, y = element.y;
      ctx.moveTo(x + 0.25 * w, y + 0.3 * h);
      ctx.bezierCurveTo(x + 0.1 * w, y + 0.3 * h, x + 0 * w, y + 0.45 * h, x + 0 * w, y + 0.6 * h);
      ctx.bezierCurveTo(x + 0 * w, y + 0.75 * h, x + 0.1 * w, y + 0.9 * h, x + 0.25 * w, y + 0.9 * h);
      ctx.lineTo(x + 0.75 * w, y + 0.9 * h);
      ctx.bezierCurveTo(x + 0.9 * w, y + 0.9 * h, x + 1 * w, y + 0.75 * h, x + 1 * w, y + 0.6 * h);
      ctx.bezierCurveTo(x + 1 * w, y + 0.45 * h, x + 0.85 * w, y + 0.3 * h, x + 0.7 * w, y + 0.3 * h);
      ctx.bezierCurveTo(x + 0.7 * w, y + 0.15 * h, x + 0.55 * w, y + 0 * h, x + 0.4 * w, y + 0 * h);
      ctx.bezierCurveTo(x + 0.25 * w, y + 0 * h, x + 0.25 * w, y + 0.15 * h, x + 0.25 * w, y + 0.3 * h);
      ctx.closePath();
      if (element.type === 'thought_bubble') {
        ctx.moveTo(x + w * 0.1, y + h * 0.9);
        ctx.arc(x + w * 0.15, y + h * 0.95, w * 0.05, 0, Math.PI * 2);
        ctx.moveTo(x, y + h);
        ctx.arc(x + w * 0.03, y + h, w * 0.03, 0, Math.PI * 2);
      }
    } else if (element.type === 'shield') {
      ctx.moveTo(element.x, element.y);
      ctx.lineTo(element.x + w, element.y);
      ctx.lineTo(element.x + w, element.y + h * 0.6);
      ctx.lineTo(element.x + w * 0.5, element.y + h);
      ctx.lineTo(element.x, element.y + h * 0.6);
      ctx.closePath();
    } else if (element.type === 'banner') {
      ctx.moveTo(element.x, element.y);
      ctx.lineTo(element.x + w, element.y);
      ctx.lineTo(element.x + w * 0.8, element.y + h * 0.5);
      ctx.lineTo(element.x + w, element.y + h);
      ctx.lineTo(element.x, element.y + h);
      ctx.lineTo(element.x + w * 0.2, element.y + h * 0.5);
      ctx.closePath();
    } else if (element.type === 'ribbon') {
      ctx.moveTo(element.x + w * 0.1, element.y);
      ctx.lineTo(element.x + w * 0.9, element.y);
      ctx.lineTo(element.x + w, element.y + h * 0.2);
      ctx.lineTo(element.x + w, element.y + h * 0.8);
      ctx.lineTo(element.x + w * 0.9, element.y + h);
      ctx.lineTo(element.x + w * 0.1, element.y + h);
      ctx.lineTo(element.x, element.y + h * 0.8);
      ctx.lineTo(element.x, element.y + h * 0.2);
      ctx.closePath();
    } else if (element.type === 'location') {
      const x = element.x, y = element.y;
      ctx.moveTo(x + w / 2, y + h);
      ctx.bezierCurveTo(x + w / 2, y + h, x, y + h * 0.6, x, y + h * 0.35);
      ctx.arc(x + w / 2, y + h * 0.35, w / 2, Math.PI, 0);
      ctx.bezierCurveTo(x + w, y + h * 0.6, x + w / 2, y + h, x + w / 2, y + h);
      ctx.closePath();
    } else if (element.type === 'search') {
      const x = element.x, y = element.y;
      ctx.moveTo(x + w * 0.4, y + h * 0.8);
      ctx.lineTo(x + w * 0.8, y + h * 0.8);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w * 0.9, y + h);
      ctx.lineTo(x + w * 0.7, y + h * 0.8);
      ctx.arc(x + w * 0.4, y + h * 0.4, w * 0.4, Math.PI * 0.25, Math.PI * 2.25);
      ctx.closePath();
    }

    ctx.fill();
    if (element.strokeWidth > 0) ctx.stroke();
  } else if (element.type === 'star') {
    const points = element.points || 5;
    const strokeW = element.strokeWidth || 0;
    const innerRadiusRatio = element.innerRadius || 0.4;
    
    const rawPoints = [];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? 1 : innerRadiusRatio;
      const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      rawPoints.push({ x, y });
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    
    const pad = strokeW / 2;
    const innerW = Math.max(0, element.width - strokeW);
    const innerH = Math.max(0, element.height - strokeW);

    ctx.fillStyle = backgroundStyle;
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth;
    ctx.beginPath();

    rawPoints.forEach((pt, i) => {
      const nx = (pt.x - minX) / rangeX;
      const ny = (pt.y - minY) / rangeY;
      const px = element.x + pad + nx * innerW;
      const py = element.y + pad + ny * innerH;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });

    ctx.closePath();
    ctx.fill();
    if (element.strokeWidth > 0) ctx.stroke();
  } else if (element.type === 'regularPolygon' || element.type === 'hexagon' || element.type === 'pentagon' || element.type === 'octagon' || element.type === 'decagon') {
    const sides = element.sides || (element.type === 'hexagon' ? 6 : element.type === 'pentagon' ? 5 : element.type === 'octagon' ? 8 : element.type === 'decagon' ? 10 : 6);
    const strokeW = element.strokeWidth || 0;
    
    const startAngle = -Math.PI / 2;
    const rawPoints = [];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (let i = 0; i < sides; i++) {
      const angle = startAngle + (Math.PI * 2 * i) / sides;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      rawPoints.push({ x, y });
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    
    const pad = strokeW / 2;
    const innerW = Math.max(0, element.width - strokeW);
    const innerH = Math.max(0, element.height - strokeW);

    ctx.fillStyle = backgroundStyle;
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth;
    ctx.beginPath();

    rawPoints.forEach((pt, i) => {
      const nx = (pt.x - minX) / rangeX;
      const ny = (pt.y - minY) / rangeY;
      const px = element.x + pad + nx * innerW;
      const py = element.y + pad + ny * innerH;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });

    ctx.closePath();
    ctx.fill();
    if (element.strokeWidth > 0) ctx.stroke();
  } else if (element.type === 'drawing' && element.path && element.path.length > 1) {
    ctx.save();
    ctx.translate(element.x, element.y);
    ctx.strokeStyle = element.stroke || '#000000';
    ctx.lineWidth = element.strokeWidth || 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(element.path[0].x, element.path[0].y);

    for (let i = 1; i < element.path.length; i++) {
      ctx.lineTo(element.path[i].x, element.path[i].y);
    }

    ctx.stroke();
    ctx.restore();
  } else if (element.type === 'vector_path' && element.bezierAnchors && element.bezierAnchors.length > 0) {
    const d = generateSVGPath(element.bezierAnchors, element.isClosed);
    const p = new Path2D(d);

    ctx.save();
    ctx.translate(element.x, element.y);

    ctx.fillStyle = element.fill || 'none';
    ctx.strokeStyle = element.stroke || '#000000';
    ctx.lineWidth = element.strokeWidth || 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (element.fill && element.fill !== 'none') {
      ctx.fill(p);
    }
    ctx.stroke(p);
    ctx.restore();
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
  } else if (element.type === 'frame') {
    const w = element.width;
    const h = element.height;
    const maskType = element.maskType || 'rect';
    const hasContent = !!element.content;
    let skipDefaultFillClip = false;
    let isTextMask = false;

    // Apply Mask
    ctx.save();
    ctx.beginPath();

    if (maskType === 'circle') {
      ctx.ellipse(element.x + w / 2, element.y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    } else if (maskType === 'rounded') {
      const radius = element.borderRadius || 20;
      if (ctx.roundRect) {
        ctx.roundRect(element.x, element.y, w, h, radius);
      } else {
        ctx.moveTo(element.x + radius, element.y);
        ctx.arcTo(element.x + w, element.y, element.x + w, element.y + h, radius);
        ctx.arcTo(element.x + w, element.y + h, element.x, element.y + h, radius);
        ctx.arcTo(element.x, element.y + h, element.x, element.y, radius);
        ctx.arcTo(element.x, element.y, element.x + w, element.y, radius);
      }
    } else if (maskType === 'polygon' || maskType === 'star') {
      if (maskType === 'star' && typeof element.points === 'number') {
        const pointsCount = element.points || 5;
        const outerRadius = 0.5;
        const innerRadius = outerRadius * (element.innerRadius || 0.4);
        const centerX = 0.5;
        const centerY = 0.5;

        for (let i = 0; i < pointsCount * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * 2 * i) / (pointsCount * 2) - Math.PI / 2;
          const x = element.x + (centerX + radius * Math.cos(angle)) * w;
          const y = element.y + (centerY + radius * Math.sin(angle)) * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else {
        const pointsStr = (element.points || '0.5,0 1,1 0,1').toString();
        const points = pointsStr.split(' ').filter(p => p.includes(',')); // Simple validation

        points.forEach((p, idx) => {
          const parts = p.split(',');
          if (parts.length === 2) {
            const px = parseFloat(parts[0]);
            const py = parseFloat(parts[1]);
            if (!isNaN(px) && !isNaN(py)) {
              if (idx === 0) ctx.moveTo(element.x + px * w, element.y + py * h);
              else ctx.lineTo(element.x + px * w, element.y + py * h);
            }
          }
        });
      }
    } else if (maskType === 'heart') {
      // Manual path for heart in 0-1 space: M 0.5,0.2 C 0.5,0.2 0.4,0 0.25,0 C 0.1,0 0,0.1 0,0.25 C 0,0.45 0.2,0.65 0.5,0.9 C 0.8,0.65 1,0.45 1,0.25 C 1,0.1 0.9,0 0.75,0 C 0.6,0 0.5,0.2 0.5,0.2 Z
      ctx.moveTo(element.x + 0.5 * w, element.y + 0.2 * h);
      ctx.bezierCurveTo(element.x + 0.5 * w, element.y + 0.2 * h, element.x + 0.4 * w, element.y + 0 * h, element.x + 0.25 * w, element.y + 0 * h);
      ctx.bezierCurveTo(element.x + 0.1 * w, element.y + 0 * h, element.x + 0 * w, element.y + 0.1 * h, element.x + 0 * w, element.y + 0.25 * h);
      ctx.bezierCurveTo(element.x + 0 * w, element.y + 0.45 * h, element.x + 0.2 * w, element.y + 0.65 * h, element.x + 0.5 * w, element.y + 0.9 * h);
      ctx.bezierCurveTo(element.x + 0.8 * w, element.y + 0.65 * h, element.x + 1 * w, element.y + 0.45 * h, element.x + 1 * w, element.y + 0.25 * h);
      ctx.bezierCurveTo(element.x + 1 * w, element.y + 0.1 * h, element.x + 0.9 * w, element.y + 0 * h, element.x + 0.75 * w, element.y + 0 * h);
      ctx.bezierCurveTo(element.x + 0.6 * w, element.y + 0 * h, element.x + 0.5 * w, element.y + 0.2 * h, element.x + 0.5 * w, element.y + 0.2 * h);
    } else if (maskType === 'cloud') {
      // M 0.25,0.3 C 0.1,0.3 0,0.45 0,0.6 C 0,0.75 0.1,0.9 0.25,0.9 L 0.75,0.9 C 0.9,0.9 1,0.75 1,0.6 C 1,0.45 0.85,0.3 0.7,0.3 C 0.7,0.15 0.55,0 0.4,0 C 0.25,0 0.25,0.15 0.25,0.3 Z
      ctx.moveTo(element.x + 0.25 * w, element.y + 0.3 * h);
      ctx.bezierCurveTo(element.x + 0.1 * w, element.y + 0.3 * h, element.x + 0 * w, element.y + 0.45 * h, element.x + 0 * w, element.y + 0.6 * h);
      ctx.bezierCurveTo(element.x + 0 * w, element.y + 0.75 * h, element.x + 0.1 * w, element.y + 0.9 * h, element.x + 0.25 * w, element.y + 0.9 * h);
      ctx.lineTo(element.x + 0.75 * w, element.y + 0.9 * h);
      ctx.bezierCurveTo(element.x + 0.9 * w, element.y + 0.9 * h, element.x + 1 * w, element.y + 0.75 * h, element.x + 1 * w, element.y + 0.6 * h);
      ctx.bezierCurveTo(element.x + 1 * w, element.y + 0.45 * h, element.x + 0.85 * w, element.y + 0.3 * h, element.x + 0.7 * w, element.y + 0.3 * h);
      ctx.bezierCurveTo(element.x + 0.7 * w, element.y + 0.15 * h, element.x + 0.55 * w, element.y + 0 * h, element.x + 0.4 * w, element.y + 0 * h);
      ctx.bezierCurveTo(element.x + 0.25 * w, element.y + 0 * h, element.x + 0.25 * w, element.y + 0.15 * h, element.x + 0.25 * w, element.y + 0.3 * h);
    } else if (maskType === 'flower') {
      // M 0.5,0.5 L 0.5,0 A 0.2,0.2 0 1,1 0.7,0.1 L 0.5,0.5 L 0.9,0.2 A 0.2,0.2 0 1,1 1,0.5 L 0.5,0.5 L 0.9,0.8 A 0.2,0.2 0 1,1 0.6,0.9 L 0.5,0.5 L 0.3,1 A 0.2,0.2 0 1,1 0.1,0.8 L 0.5,0.5 L 0.1,0.5 A 0.2,0.2 0 1,1 0,0.2 L 0.5,0.5 Z
      // Approximate flower petals
      const centerX = element.x + 0.5 * w, centerY = element.y + 0.5 * h;
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * 0.4 * w;
        const y = centerY + Math.sin(angle) * 0.4 * h;
        if (i === 0) ctx.moveTo(x + Math.cos(angle - Math.PI / 2) * 0.2 * w, y + Math.sin(angle - Math.PI / 2) * 0.2 * h);
        ctx.ellipse(x, y, 0.2 * w, 0.2 * h, angle, -Math.PI / 2, Math.PI / 2);
      }
    } else if (maskType === 'path') {
      if (element.path) {
        const p = new Path2D(element.path);
        ctx.save();
        ctx.translate(element.x, element.y);
        ctx.scale(w, h); // Scale 0..1 to dimensions
        ctx.fillStyle = fillStyle;
        ctx.fill(p);
        ctx.clip(p);
        // Inverse transform to restore coordinate space but keep clip
        ctx.scale(1 / w, 1 / h);
        ctx.translate(-element.x, -element.y);
        // We do NOT restore yet. We are now in absolute coords with the clip active.
        // The restore at line 1260/1267 will clean this up.
        skipDefaultFillClip = true;
      }
    } else if (maskType === 'device') {
      if (element.deviceType === 'phone') {
        const radius = 20;
        if (ctx.roundRect) {
          ctx.roundRect(element.x + 0.05 * w, element.y + 0.02 * h, 0.9 * w, 0.96 * h, radius);
        } else {
          ctx.rect(element.x + 0.05 * w, element.y + 0.02 * h, 0.9 * w, 0.96 * h);
        }
      } else if (element.deviceType === 'laptop') {
        // Laptop screen area: 0.1,0.05 to 0.9,0.85
        ctx.beginPath();
        ctx.moveTo(element.x + 0.1 * w, element.y + 0.05 * h);
        ctx.lineTo(element.x + 0.9 * w, element.y + 0.05 * h);
        ctx.lineTo(element.x + 0.9 * w, element.y + 0.85 * h);
        ctx.lineTo(element.x + 0.1 * w, element.y + 0.85 * h);
        ctx.closePath();
      } else if (element.deviceType === 'browser' || element.deviceType === 'desktop') {
        // Browser/Desktop content area: 0,0.1 to 1,1
        ctx.beginPath();
        ctx.moveTo(element.x, element.y + 0.1 * h);
        ctx.lineTo(element.x + w, element.y + 0.1 * h);
        ctx.lineTo(element.x + w, element.y + h);
        ctx.lineTo(element.x, element.y + h);
        ctx.closePath();
      } else {
        ctx.rect(element.x, element.y, w, h);
      }
    } else if (maskType === 'text') {
      // For text mask in canvas, we use the same scratch canvas trick but with source-in
      isTextMask = true;
      skipDefaultFillClip = true;
    } else {
      ctx.rect(element.x, element.y, w, h);
    }

    ctx.closePath();

    ctx.closePath();

    if (!skipDefaultFillClip) {
      // Draw background for frame (matching UI)
      ctx.fillStyle = fillStyle;
      ctx.fill();
      ctx.clip();
    }

    if (hasContent) {
      if (element.contentType === 'video') {
        // Videos are hard to export to static images unless we capture a frame. 
        // For now, draw placeholder or attempt to draw the element if it's a ref.
        ctx.fillStyle = '#ebedef';
        ctx.fillRect(element.x, element.y, w, h);
      } else {
        const img = imageCache.get(element.content);

        if (!img) {
          // Fallback
          const tempImg = new window.Image();
          tempImg.src = element.content;
          ctx.drawImage(tempImg, element.x, element.y, w, h);
        } else {

          // WYSIWYG Logic matching CanvasElement.jsx
          const imgW = img.naturalWidth || img.width || 100;
          const imgH = img.naturalHeight || img.height || 100;
          const imgRatio = imgW / imgH;
          const frameRatio = w / h;

          // 1. Calculate base "cover" dimensions (before user scale)
          let baseW, baseH;
          if (imgRatio > frameRatio) {
            // Image is wider than frame -> Match height, overflow width
            baseH = h;
            baseW = h * imgRatio;
          } else {
            // Image is taller -> Match width, overflow height
            baseW = w;
            baseH = w / imgRatio;
          }

          // 2. Setup Transform for User Adjustments (Pan/Zoom)
          ctx.save();

          // Move to center of frame
          ctx.translate(element.x + w / 2, element.y + h / 2);

          // Apply User Pan (contentX/Y)
          // Note: CanvasElement transform is translate(-50%, -50%) translate(contentX, contentY)
          // We already moved to center (translating -50% -50% effectively), so just add content offsets
          ctx.translate(element.contentX || 0, element.contentY || 0);

          // Apply User Scale
          const s = element.contentScale || 1;
          ctx.scale(s, s);

          // 3. Draw Image centered at origin
          // If we had cropping (contentCrop), we'd clip here before drawing
          if (element.contentCrop) {
            const c = element.contentCrop;
            const cropX = -baseW / 2 + (c.l * baseW);
            const cropY = -baseH / 2 + (c.t * baseH);
            const cropW = baseW * (1 - c.l - c.r);
            const cropH = baseH * (1 - c.t - c.b);
            ctx.beginPath();
            ctx.rect(cropX, cropY, cropW, cropH);
            ctx.clip();
          }

          if (isTextMask) {
            // Text Mask Logic for Canvas - DECOUPLED FROM PAN/SCALE
            // 1. Restore context to element's base state (undoes content adjustments)
            ctx.restore();

            // 2. We use a scratch canvas the size of the FRAME
            const fScratch = getScratchCanvas(w, h);
            const fCtx = fScratch.getContext('2d');

            // a. Draw the text mask fixed to top-left of this scratch area
            const word = element.text || element.content || 'TEXT';
            const fontSizeNum = word.length > 5 ? 0.4 : word.length > 1 ? 0.6 : 0.8;
            const letterSpacing = (element.letterSpacing || 0) * 0.001;

            fCtx.font = `bold ${fontSizeNum * h}px '${element.fontFamily || 'Gasoek One'}'`;
            if (letterSpacing !== 0) fCtx.letterSpacing = `${letterSpacing * h}px`;
            fCtx.textAlign = 'center';
            fCtx.textBaseline = 'middle';
            fCtx.fillStyle = 'black';
            fCtx.fillText(word, w / 2, 0.54 * h); // Match CanvasElement offset (h/2 + 0.04h)

            // b. Draw the image with transforms using 'source-in'
            fCtx.globalCompositeOperation = 'source-in';
            fCtx.save();
            fCtx.translate(w / 2 + (element.contentX || 0), h / 2 + (element.contentY || 0));
            fCtx.scale(element.contentScale || 1, element.contentScale || 1);
            fCtx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);
            fCtx.restore();

            // 3. Draw the finished panned frame back to main canvas at its absolute element position
            ctx.drawImage(fScratch, element.x, element.y);
          } else {
            ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);
            ctx.restore();
          }
          // The final restore for ctx.save() at 1409 is now handled inside each branch.
        }
      }
    } else {
      // Empty frame placeholder
      if (maskType === 'text') {
        const word = element.text || element.content || 'TEXT';
        const fontSizeNum = word.length > 5 ? 0.4 : word.length > 1 ? 0.6 : 0.8;

        ctx.save();
        ctx.translate(element.x + w / 2, element.y + h / 2);

        // Draw Fill (Placeholder Gradient)
        ctx.fillStyle = '#f3f4f6';
        ctx.font = `bold ${fontSizeNum * h}px '${element.fontFamily || 'Gasoek One'}'`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(word, 0, (0.54 - 0.5) * h);

        // Draw Dashed Border
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
        ctx.strokeText(word, 0, (0.54 - 0.5) * h);

        ctx.restore();
      } else {
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(element.x, element.y, w, h);

        // Draw dashed border
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 2;
        ctx.strokeRect(element.x, element.y, w, h);
      }
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  if (element.animation && (element.animation.type === 'wipe' || element.animation.type === 'typewriter')) {
    ctx.restore();
  }

  ctx.restore();
};

/**
 * Export canvas as SVG
 */
export const exportAsSVG = (elements, canvasSize, filename = 'sowntra-design') => {
  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${canvasSize.width}" height="${canvasSize.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="100%" height="100%" fill="white"/>
  <defs>`;

  // Add gradient definitions
  elements.forEach((element, idx) => {
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
  elements.forEach((element, idx) => {
    const transform = `rotate(${element.rotation || 0} ${element.x + element.width / 2} ${element.y + element.height / 2})`;
    const fill = element.fillType === 'gradient' ? `url(#gradient-${idx})` : element.fill;

    const w = element.width;
    const h = element.height;

    if (element.type === 'rectangle') {
      svgContent += `
  <rect x="${element.x}" y="${element.y}" width="${w}" height="${h}" 
        fill="${fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" 
        rx="${element.borderRadius || 0}" transform="${transform}"/>`;
    } else if (element.type === 'circle') {
      svgContent += `
  <ellipse cx="${element.x + w / 2}" cy="${element.y + h / 2}" rx="${w / 2}" ry="${h / 2}" 
          fill="${fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" 
          transform="${transform}"/>`;
    } else if (element.type === 'star' || element.type === 'regularPolygon' || element.type === 'hexagon' || element.type === 'pentagon' || element.type === 'octagon' || element.type === 'decagon') {
      let d = '';
      if (element.type === 'star') {
        const pointsCount = element.points || 5;
        const innerRadiusRatio = element.innerRadius || 0.4;
        
        const rawPoints = [];
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        for (let i = 0; i < pointsCount * 2; i++) {
          const radius = i % 2 === 0 ? 1 : innerRadiusRatio;
          const angle = (Math.PI * 2 * i) / (pointsCount * 2) - Math.PI / 2;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          rawPoints.push({ x, y });
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }

        const rangeX = maxX - minX;
        const rangeY = maxY - minY;

        rawPoints.forEach((pt, i) => {
          const nx = (pt.x - minX) / rangeX;
          const ny = (pt.y - minY) / rangeY;
          const px = element.x + nx * w;
          const py = element.y + ny * h;
          d += (i === 0 ? 'M' : 'L') + px + ' ' + py;
        });
      } else {
        const sides = element.sides || (element.type === 'hexagon' ? 6 : element.type === 'pentagon' ? 5 : element.type === 'octagon' ? 8 : element.type === 'decagon' ? 10 : 6);
        const startAngle = -Math.PI / 2;
        const rawPoints = [];
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        for (let i = 0; i < sides; i++) {
          const angle = startAngle + (Math.PI * 2 * i) / sides;
          const x = Math.cos(angle);
          const y = Math.sin(angle);
          rawPoints.push({ x, y });
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }

        const rangeX = maxX - minX;
        const rangeY = maxY - minY;

        rawPoints.forEach((pt, i) => {
          const nx = (pt.x - minX) / rangeX;
          const ny = (pt.y - minY) / rangeY;
          const px = element.x + nx * w;
          const py = element.y + ny * h;
          d += (i === 0 ? 'M' : 'L') + px + ' ' + py;
        });
      }
      d += 'Z';
      svgContent += `
  <path d="${d}" fill="${fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" transform="${transform}"/>`;
    } else if (element.type === 'type_extrude') {
      const word = (element.content || '').toUpperCase();
      const fontSize = parseFloat(element.fontSize) || 64;
      const layers = Math.max(1, Math.floor((element.length || 0) / 2));
      const radians = ((element.angle || 0) * Math.PI) / 180;
      const textAlign = element.textAlign || 'center';
      const anchor = textAlign === 'center' ? 'middle' : (textAlign === 'right' ? 'end' : 'start');
      const mappedLineHeight = 1.4 + ((element.lineHeightValue || 0) / 10);
      const lineHeight = fontSize * mappedLineHeight;
      const borderWidth = element.borderWidth || 0;

      const lines = word.split('\n');
      const totalHeight = lines.length * lineHeight;

      let tx = element.x + w / 2;
      if (textAlign === 'left') tx = element.x + 10;
      if (textAlign === 'right') tx = element.x + w - 10;

      const startY = element.y + (h - totalHeight) / 2 + lineHeight / 2;

      let layerElements = '';

      // 1. Draw Extrude Layers
      for (let i = 0; i < layers; i++) {
        const offset = (i + 1) * 2;
        const ox = Math.cos(radians) * offset;
        const oy = Math.sin(radians) * offset;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          const line = lines[lineIndex];
          const ly = startY + lineIndex * lineHeight;
          layerElements += `
    <text x="${tx + ox}" y="${ly + oy}" 
          font-family="'${element.fontFamily || 'Gasoek One'}'" font-size="${fontSize}" font-weight="900" 
          fill="${element.extrudeColor || '#000000'}" text-anchor="${anchor}" dominant-baseline="central"
          transform="${transform}">${line}</text>`;
        }
      }

      // 2. Draw Main Surface
      let surfaceElements = '';
      lines.forEach((line, lineIndex) => {
        const ly = startY + lineIndex * lineHeight;
        const strokeAttr = borderWidth > 0 ? `stroke="${element.color || '#FFFFFF'}" stroke-width="${borderWidth}" stroke-linejoin="round"` : '';
        surfaceElements += `
    <text x="${tx}" y="${ly}" 
          font-family="'${element.fontFamily || 'Gasoek One'}'" font-size="${fontSize}" font-weight="900" 
          fill="${element.color || '#FFFFFF'}" text-anchor="${anchor}" dominant-baseline="central"
          ${strokeAttr} transform="${transform}">${line}</text>`;
      });

      svgContent += layerElements + surfaceElements;
    } else if (element.type === 'text') {
      svgContent += `
  <text x="${element.x}" y="${element.y + element.fontSize}" 
        font-family="${element.fontFamily}" font-size="${element.fontSize}" 
        fill="${element.color}" text-anchor="${element.textAlign === 'center' ? 'middle' : element.textAlign === 'right' ? 'end' : 'start'}" 
        transform="${transform}">${element.content}</text>`;
    } else if (element.type === 'image') {
      svgContent += `
  <image x="${element.x}" y="${element.y}" width="${w}" height="${h}" 
         href="${element.src}" transform="${transform}"/>`;
    } else if (['triangle', 'star', 'regularPolygon', 'trapezoid', 'parallelogram', 'triangle_right', 'cross', 'speech_bubble', 'speech_bubble_round', 'thought_bubble', 'cloud', 'callout', 'location', 'shield', 'banner', 'ribbon', 'search', 'diamond', 'heart'].includes(element.type)) {
      let d = '';
      if (element.type === 'triangle') {
        d = `M ${element.x + w / 2},${element.y} L ${element.x + w},${element.y + h} L ${element.x},${element.y + h} Z`;
      } else if (element.type === 'heart') {
        const x = element.x, y = element.y;
        d = `M ${x + w * 0.5},${y + h * 0.3} 
             C ${x + w * 0.5},${y + h * 0.1} ${x + w * 0.35},${y} ${x + w * 0.25},${y} 
             C ${x + w * 0.1},${y} ${x},${y + h * 0.15} ${x},${y + h * 0.3} 
             C ${x},${y + h * 0.55} ${x + w * 0.25},${y + h * 0.75} ${x + w * 0.5},${y + h} 
             C ${x + w * 0.75},${y + h * 0.75} ${x + w},${y + h * 0.55} ${x + w},${y + h * 0.3} 
             C ${x + w},${y + h * 0.15} ${x + w * 0.9},${y} ${x + w * 0.75},${y} 
             C ${x + w * 0.65},${y} ${x + w * 0.5},${y + h * 0.1} ${x + w * 0.5},${y + h * 0.3} Z`;
      } else if (element.type === 'star') {
        const pointsCount = element.points || 5;
        const innerRadiusRatio = element.innerRadius || 0.4;
        const rawPoints = [];
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let i = 0; i < pointsCount * 2; i++) {
          const r = i % 2 === 0 ? 1 : innerRadiusRatio;
          const angle = (Math.PI * 2 * i) / (pointsCount * 2) - Math.PI / 2;
          const x = r * Math.cos(angle), y = r * Math.sin(angle);
          rawPoints.push({ x, y });
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
        const rangeX = maxX - minX;
        const rangeY = maxY - minY;
        rawPoints.forEach((pt, i) => {
          const nx = (pt.x - minX) / rangeX;
          const ny = (pt.y - minY) / rangeY;
          const px = element.x + nx * w;
          const py = element.y + ny * h;
          d += (i === 0 ? 'M' : 'L') + px + ',' + py;
        });
        d += 'Z';
      } else if (element.type === 'regularPolygon') {
        const sides = element.sides || 6;
        const startAngle = -Math.PI / 2;
        const rawPoints = [];
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let i = 0; i < sides; i++) {
          const angle = startAngle + (Math.PI * 2 * i) / sides;
          const x = Math.cos(angle), y = Math.sin(angle);
          rawPoints.push({ x, y });
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
        const rangeX = maxX - minX;
        const rangeY = maxY - minY;
        rawPoints.forEach((pt, i) => {
          const nx = (pt.x - minX) / rangeX;
          const ny = (pt.y - minY) / rangeY;
          const px = element.x + nx * w;
          const py = element.y + ny * h;
          d += (i === 0 ? 'M' : 'L') + px + ',' + py;
        });
        d += 'Z';
      } else if (element.type === 'trapezoid') {
        d = `M ${element.x + w * 0.2},${element.y} L ${element.x + w * 0.8},${element.y} L ${element.x + w},${element.y + h} L ${element.x},${element.y + h} Z`;
      } else if (element.type === 'parallelogram') {
        d = `M ${element.x + w * 0.25},${element.y} L ${element.x + w},${element.y} L ${element.x + w * 0.75},${element.y + h} L ${element.x},${element.y + h} Z`;
      } else if (element.type === 'triangle_right') {
        d = `M ${element.x},${element.y} L ${element.x},${element.y + h} L ${element.x + w},${element.y + h} Z`;
      } else if (element.type === 'diamond') {
        d = `M ${element.x + w * 0.5},${element.y} L ${element.x + w},${element.y + h * 0.5} L ${element.x + w * 0.5},${element.y + h} L ${element.x},${element.y + h * 0.5} Z`;
      } else if (element.type === 'cross') {
        const t = Math.min(w, h) * 0.3;
        const cx = element.x + w / 2, cy = element.y + h / 2;
        d = `M ${cx - t / 2},${element.y} L ${cx + t / 2},${element.y} L ${cx + t / 2},${cy - t / 2} L ${element.x + w},${cy - t / 2} L ${element.x + w},${cy + t / 2} L ${cx + t / 2},${cy + t / 2} L ${cx + t / 2},${element.y + h} L ${cx - t / 2},${element.y + h} L ${cx - t / 2},${cy + t / 2} L ${element.x},${cy + t / 2} L ${element.x},${cy - t / 2} L ${cx - t / 2},${cy - t / 2} Z`;
      } else if (element.type === 'speech_bubble' || element.type === 'callout') {
        d = `M ${element.x},${element.y} L ${element.x + w},${element.y} L ${element.x + w},${element.y + h * 0.8} L ${element.x + w * 0.4},${element.y + h * 0.8} L ${element.x + w * 0.3},${element.y + h} L ${element.x + w * 0.2},${element.y + h * 0.8} L ${element.x},${element.y + h * 0.8} Z`;
      } else if (element.type === 'speech_bubble_round') {
        const x = element.x, y = element.y;
        d = `M ${x + w * 0.5},${y} 
             C ${x + w * 0.8},${y} ${x + w},${y + h * 0.2} ${x + w},${y + h * 0.4} 
             C ${x + w},${y + h * 0.6} ${x + w * 0.8},${y + h * 0.8} ${x + w * 0.5},${y + h * 0.8} 
             L ${x + w * 0.3},${y + h} L ${x + w * 0.4},${y + h * 0.8} 
             C ${x + w * 0.2},${y + h * 0.8} ${x},${y + h * 0.6} ${x},${y + h * 0.4} 
             C ${x},${y + h * 0.2} ${x + w * 0.2},${y} ${x + w * 0.5},${y} Z`;
      } else if (element.type === 'thought_bubble' || element.type === 'cloud') {
        const x = element.x, y = element.y;
        d = `M ${x + 0.25 * w},${y + 0.3 * h}
             C ${x + 0.1 * w},${y + 0.3 * h} ${x + 0 * w},${y + 0.45 * h} ${x + 0 * w},${y + 0.6 * h}
             C ${x + 0 * w},${y + 0.75 * h} ${x + 0.1 * w},${y + 0.9 * h} ${x + 0.25 * w},${y + 0.9 * h}
             L ${x + 0.75 * w},${y + 0.9 * h}
             C ${x + 0.9 * w},${y + 0.9 * h} ${x + 1 * w},${y + 0.75 * h} ${x + 1 * w},${y + 0.6 * h}
             C ${x + 1 * w},${y + 0.45 * h} ${x + 0.85 * w},${y + 0.3 * h} ${x + 0.7 * w},${y + 0.3 * h}
             C ${x + 0.7 * w},${y + 0.15 * h} ${x + 0.55 * w},${y + 0 * h} ${x + 0.4 * w},${y + 0 * h}
             C ${x + 0.25 * w},${y + 0 * h} ${x + 0.25 * w},${y + 0.15 * h} ${x + 0.25 * w},${y + 0.3 * h} Z`;
      } else if (element.type === 'shield') {
        d = `M ${element.x},${element.y} L ${element.x + w},${element.y} L ${element.x + w},${element.y + h * 0.6} L ${element.x + w * 0.5},${element.y + h} L ${element.x},${element.y + h * 0.6} Z`;
      } else if (element.type === 'banner') {
        d = `M ${element.x},${element.y} L ${element.x + w},${element.y} L ${element.x + w * 0.8},${element.y + h * 0.5} L ${element.x + w},${element.y + h} L ${element.x},${element.y + h} L ${element.x + w * 0.2},${element.y + h * 0.5} Z`;
      } else if (element.type === 'ribbon') {
        d = `M ${element.x + w * 0.1},${element.y} L ${element.x + w * 0.9},${element.y} L ${element.x + w},${element.y + h * 0.2} L ${element.x + w},${element.y + h * 0.8} L ${element.x + w * 0.9},${element.y + h} L ${element.x + w * 0.1},${element.y + h} L ${element.x},${element.y + h * 0.8} L ${element.x},${element.y + h * 0.2} Z`;
      } else if (element.type === 'location') {
        const x = element.x, y = element.y;
        d = `M ${x + w / 2},${y + h} C ${x + w / 2},${y + h} ${x},${y + h * 0.6} ${x},${y + h * 0.35} A ${w / 2},${w / 2} 0 1,1 ${x + w},${y + h * 0.35} C ${x + w},${y + h * 0.6} ${x + w / 2},${y + h} ${x + w / 2},${y + h} Z`;
      } else if (element.type === 'search') {
        const x = element.x, y = element.y;
        d = `M ${x + w * 0.4},${y + h * 0.8} L ${x + w * 0.8},${y + h * 0.8} L ${x + w},${y + h} L ${x + w * 0.9},${y + h} L ${x + w * 0.7},${y + h * 0.8} A ${w * 0.4},${w * 0.4} 0 1,1 ${x + w * 0.4},${y} A ${w * 0.4},${w * 0.4} 0 1,1 ${x + w * 0.4},${y + h * 0.8} Z`;
      }

      svgContent += `
  <path d="${d}" fill="${fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" transform="${transform}"/>`;
    } else if (element.type === 'frame') {
      const maskType = element.maskType || 'rect';
      const clipPathId = `frame-clip-${idx}`;
      let maskD = '';
      let skipClipDefCreation = false;

      if (maskType === 'circle') {
        maskD = `M ${element.x + w / 2},${element.y} A ${w / 2},${h / 2} 0 1,1 ${element.x + w / 2},${element.y + h} A ${w / 2},${h / 2} 0 1,1 ${element.x + w / 2},${element.y} Z`;
      } else if (maskType === 'rounded') {
        const r = element.borderRadius || 20;
        maskD = `M ${element.x + r},${element.y} L ${element.x + w - r},${element.y} Q ${element.x + w},${element.y} ${element.x + w},${element.y + r} L ${element.x + w},${element.y + h - r} Q ${element.x + w},${element.y + h} ${element.x + w - r},${element.y + h} L ${element.x + r},${element.y + h} Q ${element.x},${element.y + h} ${element.x},${element.y + h - r} L ${element.x},${element.y + r} Q ${element.x},${element.y} ${element.x + r},${element.y} Z`;
      } else if (maskType === 'polygon' || maskType === 'star') {
        if (maskType === 'star' && typeof element.points === 'number') {
          const pts = element.points || 5;
          const outR = Math.min(w, h) / 2;
          const inR = outR * (element.innerRadius || 0.4);
          const cx = element.x + w / 2, cy = element.y + h / 2;
          for (let i = 0; i < pts * 2; i++) {
            const r = i % 2 === 0 ? outR : inR;
            const angle = (Math.PI * 2 * i) / (pts * 2) - Math.PI / 2;
            const px = cx + r * Math.cos(angle), py = cy + r * Math.sin(angle);
            maskD += (i === 0 ? 'M' : 'L') + px + ',' + py;
          }
        } else {
          // Robust parsing of points string
          const ptsStr = (element.points || '0.5,0 1,1 0,1').toString();
          const pts = ptsStr.split(' ').filter(p => p.includes(','));

          pts.forEach((p, i) => {
            const parts = p.split(',');
            if (parts.length === 2) {
              const px = parseFloat(parts[0]);
              const py = parseFloat(parts[1]);
              if (!isNaN(px) && !isNaN(py)) {
                maskD += (i === 0 ? 'M' : 'L') + (element.x + px * w) + ',' + (element.y + py * h);
              }
            }
          });
        }
        maskD += 'Z';
      } else if (maskType === 'heart') {
        const x = element.x, y = element.y;
        maskD = `M ${x + w * 0.5},${y + h * 0.3} 
             C ${x + w * 0.5},${y + h * 0.1} ${x + w * 0.35},${y} ${x + w * 0.25},${y} 
             C ${x + w * 0.1},${y} ${x},${y + h * 0.15} ${x},${y + h * 0.3} 
             C ${x},${y + h * 0.55} ${x + w * 0.25},${y + h * 0.75} ${x + w * 0.5},${y + h} 
             C ${x + w * 0.75},${y + h * 0.75} ${x + w},${y + h * 0.55} ${x + w},${y + h * 0.3} 
             C ${x + w},${y + h * 0.15} ${x + w * 0.9},${y} ${x + w * 0.75},${y} 
             C ${x + w * 0.65},${y} ${x + w * 0.5},${y + h * 0.2} ${x + w * 0.5},${y + h * 0.3} Z`;
      } else if (maskType === 'cloud') {
        const x = element.x, y = element.y;
        maskD = `M ${x + 0.25 * w},${y + 0.3 * h}
             C ${x + 0.1 * w},${y + 0.3 * h} ${x + 0 * w},${y + 0.45 * h} ${x + 0 * w},${y + 0.6 * h}
             C ${x + 0 * w},${y + 0.75 * h} ${x + 0.1 * w},${y + 0.9 * h} ${x + 0.25 * w},${y + 0.9 * h}
             L ${x + 0.75 * w},${y + 0.9 * h}
             C ${x + 0.9 * w},${y + 0.9 * h} ${x + 1 * w},${y + 0.75 * h} ${x + 1 * w},${y + 0.6 * h}
             C ${x + 1 * w},${y + 0.45 * h} ${x + 0.85 * w},${y + 0.3 * h} ${x + 0.7 * w},${y + 0.3 * h}
             C ${x + 0.7 * w},${y + 0.15 * h} ${x + 0.55 * w},${y + 0 * h} ${x + 0.4 * w},${y + 0 * h}
             C ${x + 0.25 * w},${y + 0 * h} ${x + 0.25 * w},${y + 0.15 * h} ${x + 0.25 * w},${y + 0.3 * h} Z`;
      } else if (maskType === 'text') {
        const word = element.text || element.content || 'TEXT';
        const fontSizeNum = word.length > 5 ? 0.4 : word.length > 1 ? 0.5 : 0.7;
        const fontSize = `${fontSizeNum * h}px`;
        const letterSpacing = (element.letterSpacing || 0) * 0.001 * h + 'px';

        svgContent = svgContent.replace('</defs>', `
    <clipPath id="${clipPathId}">
      <text x="${element.x + w / 2}" y="${element.y + 0.53 * h}" text-anchor="middle" dominant-baseline="central"
            style="font-family: '${element.fontFamily || 'Gasoek One'}'; font-weight: bold; font-size: ${fontSize}; letter-spacing: ${letterSpacing};">
        ${word}
      </text>
    </clipPath>
  </defs>`);
        skipClipDefCreation = true;
      } else {
        maskD = `M ${element.x},${element.y} L ${element.x + w},${element.y} L ${element.x + w},${element.y + h} L ${element.x},${element.y + h} Z`;
      }

      if (!skipClipDefCreation) {
        svgContent = svgContent.replace('</defs>', `
    <clipPath id="${clipPathId}">
      <path d="${maskD}" />
    </clipPath>
  </defs>`);
      }

      if (element.content) {
        // Calculate base cover dimensions for SVG
        // Note: We need a placeholder image object to calculate ratios if not preloaded, 
        // but for SVG export we'll assume the same ratios as canvas.
        // We actually want to apply the same contentX/Y/Scale logic.

        const contentX = element.contentX || 0;
        const contentY = element.contentY || 0;
        const s = element.contentScale || 1;

        // Complex transform for SVG:
        // 1. Move to center of frame
        // 2. Move by contentX/Y
        // 3. Scale by contentScale
        // 4. Move by -50% of the image size (which is w,h in this tag)
        const contentTransform = `translate(${element.x + w / 2 + contentX} ${element.y + h / 2 + contentY}) scale(${s}) translate(${-w / 2} ${-h / 2})`;

        svgContent += `
  <g clip-path="url(#${clipPathId})">
    <image x="0" y="0" width="${w}" height="${h}" 
           href="${element.content}" transform="${contentTransform}" preserveAspectRatio="xMidYMid slice"/>
  </g>`;
      } else {
        svgContent += `
  <rect x="${element.x}" y="${element.y}" width="${w}" height="${h}" 
        fill="#f3f4f6" stroke="#d1d5db" stroke-width="2" stroke-dasharray="5,5" 
        clip-path="url(#${clipPathId})" transform="${transform}"/>`;
      }
    } else if (element.type === 'drawing' && element.path && element.path.length > 1) {
      let d = 'M ' + (element.x + element.path[0].x) + ' ' + (element.y + element.path[0].y);
      for (let i = 1; i < element.path.length; i++) {
        d += ' L ' + (element.x + element.path[i].x) + ' ' + (element.y + element.path[i].y);
      }
      svgContent += `
  <path d="${d}" fill="none" stroke="${element.stroke || '#000'}" stroke-width="${element.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" transform="${transform}"/>`;
    } else if (element.type === 'vector_path' && element.bezierAnchors && element.bezierAnchors.length > 0) {
      // For vector_path, we need to pass the offset to generateSVGPath or map the anchors
      const shiftedAnchors = element.bezierAnchors.map(a => ({
        point: { x: a.point.x + element.x, y: a.point.y + element.y },
        handleIn: { x: a.handleIn.x + element.x, y: a.handleIn.y + element.y },
        handleOut: { x: a.handleOut.x + element.x, y: a.handleOut.y + element.y }
      }));
      const d = generateSVGPath(shiftedAnchors, element.isClosed);
      svgContent += `
  <path d="${d}" fill="${element.fill || 'none'}" stroke="${element.stroke || '#000'}" stroke-width="${element.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" transform="${transform}"/>`;
    } else if (['line', 'line_double', 'arrow', 'arrow_double'].includes(element.type)) {
      const isArrow = element.type.includes('arrow');
      const isDouble = element.type.includes('double');
      const markerEnd = isArrow ? `marker-end="url(#arrowhead-${idx})"` : '';
      const markerStart = (isArrow && isDouble) ? `marker-start="url(#arrowhead-start-${idx})"` : '';

      if (isArrow) {
        svgContent = svgContent.replace('</defs>', `
    <marker id="arrowhead-${idx}" markerWidth="4" markerHeight="4" refX="0.1" refY="2" orient="auto">
      <polygon points="0 0, 4 2, 0 4" fill="${element.stroke}" />
    </marker>
    <marker id="arrowhead-start-${idx}" markerWidth="4" markerHeight="4" refX="3.9" refY="2" orient="auto-start-reverse">
      <polygon points="4 0, 0 2, 4 4" fill="${element.stroke}" />
    </marker>
  </defs>`);
      }

      svgContent += `
  <line x1="${element.x}" y1="${element.y + h / 2}" x2="${element.x + w}" y2="${element.y + h / 2}" 
        stroke="${element.stroke}" stroke-width="${element.strokeWidth}" 
        stroke-dasharray="${element.strokeDasharray || ''}" stroke-linecap="${element.strokeLinecap || 'butt'}" 
        ${markerEnd} ${markerStart} transform="${transform}"/>`;

      if (element.type === 'line_double') {
        svgContent += `
  <line x1="${element.x}" y1="${element.y + h / 2 + (element.strokeWidth || 2) * 2}" x2="${element.x + w}" y2="${element.y + h / 2 + (element.strokeWidth || 2) * 2}" 
        stroke="${element.stroke}" stroke-width="${element.strokeWidth}" 
        stroke-dasharray="${element.strokeDasharray || ''}" stroke-linecap="${element.strokeLinecap || 'butt'}" 
        transform="${transform}"/>`;
      }
    }
  });

  svgContent += `
</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.svg`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Export canvas as image (PNG, JPEG, WebP)
 */
export const exportAsImage = async (elements, canvasSize, format, imageEffects = {}, backgroundColor = '#ffffff', filename = 'sowntra-design') => {
  const canvas = document.createElement('canvas');
  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('Could not get canvas context');
    alert('Error: Could not create canvas context');
    return;
  }

  // Preload all images and fonts first
  await Promise.all([
    preloadAllImages(elements),
    document.fonts.ready
  ]);

  // Wait a small extra bit for complex fonts to settle metrics
  await new Promise(resolve => setTimeout(resolve, 100));

  // Set background (supports solid color or gradient)
  if (typeof backgroundColor === 'object' && backgroundColor !== null) {
    // Create a mock element for the gradient background
    const bgGradient = getCanvasGradient(ctx, {
      fillType: 'gradient',
      gradient: backgroundColor,
      width: canvasSize.width,
      height: canvasSize.height,
      x: 0,
      y: 0
    });
    ctx.fillStyle = bgGradient;
  } else {
    ctx.fillStyle = backgroundColor || '#ffffff';
  }
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

  const sortedElements = getSortedElementsForExport(elements);

  try {
    // Draw ALL elements in correct zIndex order
    sortedElements.forEach((element, index) => {
      if (!element) return;
      try {
        drawElementToCanvas(ctx, element, undefined, index, imageEffects);
      } catch (elementError) {
        console.error(`Error drawing element ${element?.id}: `, elementError);
      }
    });

    // Export the final canvas
    const dataUrl = canvas.toDataURL(`image/${format}`, 0.95);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error exporting canvas:', error);
    alert('Error exporting image. Please try again.');
  }
};

/**
 * Capture canvas as Data URL (without downloading)
 * Used for previews and thumbnails
 */
export const getCanvasDataURL = async (elements, canvasSize, format = 'png', imageEffects = {}, backgroundColor = '#ffffff', maxWidth = 480) => {
  const scale = Math.min(1, maxWidth / canvasSize.width);
  const width = canvasSize.width * scale;
  const height = canvasSize.height * scale;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  // Scale context for all following draw calls
  ctx.scale(scale, scale);

  await Promise.all([
    preloadAllImages(elements),
    document.fonts.ready
  ]);

  // Set background
  if (typeof backgroundColor === 'object' && backgroundColor !== null) {
    const bgGradient = getCanvasGradient(ctx, {
      fillType: 'gradient',
      gradient: backgroundColor,
      width: canvasSize.width,
      height: canvasSize.height,
      x: 0,
      y: 0
    });
    ctx.fillStyle = bgGradient;
  } else {
    ctx.fillStyle = backgroundColor || '#ffffff';
  }
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

  const sortedElements = getSortedElementsForExport(elements);

  sortedElements.forEach((element, index) => {
    if (!element) return;
    try {
      drawElementToCanvas(ctx, element, undefined, index, imageEffects);
    } catch (e) {
      console.error(e);
    }
  });

  return canvas.toDataURL(`image/${format}`, 0.8); // 80% quality for preview
};

/**
 * Export canvas as PDF
 */
export const exportAsPDF = async (elements, canvasSize, imageEffects = {}, backgroundColor = '#ffffff', filename = 'sowntra-design') => {
  const canvas = document.createElement('canvas');
  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('Could not get canvas context');
    alert('Error: Could not create canvas context');
    return;
  }

  // Preload all images and fonts first
  await Promise.all([
    preloadAllImages(elements),
    document.fonts.ready
  ]);

  // Wait a small extra bit for complex fonts to settle metrics
  await new Promise(resolve => setTimeout(resolve, 100));

  // Set background (supports solid color or gradient)
  if (typeof backgroundColor === 'object' && backgroundColor !== null) {
    const bgGradient = getCanvasGradient(ctx, {
      fillType: 'gradient',
      gradient: backgroundColor,
      width: canvasSize.width,
      height: canvasSize.height,
      x: 0,
      y: 0
    });
    ctx.fillStyle = bgGradient;
  } else {
    ctx.fillStyle = backgroundColor || '#ffffff';
  }
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

  const sortedElements = getSortedElementsForExport(elements);

  try {
    // Draw ALL elements in correct zIndex order
    sortedElements.forEach((element, index) => {
      if (element) {
        drawElementToCanvas(ctx, element, undefined, index, imageEffects);
      }
    });

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
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    alert('Error exporting PDF. Please try again.');
  }
};

/**
 * Export canvas as Video (WebM)
 */
export const exportAsVideo = async (elements, canvasSize, imageEffects = {}, duration = 5000, onProgress, mimeType = 'video/webm', backgroundColor = '#ffffff', videoQuality = 'medium', filename = 'sowntra-design') => {
  // Determine target resolution
  let videoWidth = canvasSize.width;
  let videoHeight = canvasSize.height;

  // Scale to 1080p if high quality is requested or specifically 1080p
  if (videoQuality === 'high' || videoQuality === '1080p') {
    const scale = 1080 / Math.min(canvasSize.width, canvasSize.height);
    videoWidth = Math.round((canvasSize.width * scale) / 2) * 2;
    videoHeight = Math.round((canvasSize.height * scale) / 2) * 2;

    // Cap at reasonable 4K limits just in case
    if (videoWidth > 3840) {
      const capScale = 3840 / videoWidth;
      videoWidth = 3840;
      videoHeight = Math.round((videoHeight * capScale) / 2) * 2;
    }
  } else {
    // Ensure even dimensions for VideoEncoder (required by H.264)
    videoWidth = Math.floor(canvasSize.width / 2) * 2;
    videoHeight = Math.floor(canvasSize.height / 2) * 2;
  }

  const canvas = document.createElement('canvas');
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  const ctx = canvas.getContext('2d');

  // Helper to draw a single frame
  const drawFrame = (elapsed) => {
    // Reset context state to absolute defaults to prevent state leakage between frames
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.filter = 'none';

    // Scale the context to fit the video resolution
    const scale = videoWidth / canvasSize.width;
    ctx.scale(scale, scale);

    // Clear and draw background (in original coordinates because of scale)
    if (typeof backgroundColor === 'object' && backgroundColor !== null) {
      const bgGradient = getCanvasGradient(ctx, {
        fillType: 'gradient',
        gradient: backgroundColor,
        width: canvasSize.width,
        height: canvasSize.height,
        x: 0,
        y: 0
      });
      ctx.fillStyle = bgGradient;
    } else {
      ctx.fillStyle = backgroundColor || '#ffffff';
    }
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    const sortedElements = getSortedElementsForExport(elements);
    sortedElements.forEach((element, idx) => {
      if (element) {
        drawElementToCanvas(ctx, element, elapsed / 1000, idx, imageEffects);
      }
    });
  };

  // Preload assets
  await Promise.all([preloadAllImages(elements), document.fonts.ready]);
  await new Promise(resolve => setTimeout(resolve, 150)); // Safety buffer for font metrics

  // MP4 Export using VideoEncoder + mp4-muxer
  if (mimeType === 'video/mp4' && 'VideoEncoder' in window) {
    try {
      const fps = 30;
      const totalFrames = Math.ceil((duration / 1000) * fps);

      let muxer = new Mp4Muxer.Muxer({
        target: new Mp4Muxer.ArrayBufferTarget(),
        video: {
          codec: 'avc',
          width: videoWidth,
          height: videoHeight
        },
        fastStart: 'in-memory'
      });

      let videoEncoder = new window.VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => console.error("VideoEncoder error:", e)
      });

      videoEncoder.configure({
        codec: 'avc1.4d002a', // H.264 Main Profile Level 4.2 (More modern and widely supported)
        width: videoWidth,
        height: videoHeight,
        bitrate: (videoQuality === 'high' || videoQuality === '1080p') ? 10_000_000 : 4_000_000
      });

      for (let i = 0; i < totalFrames; i++) {
        const elapsed = (i / fps) * 1000;
        drawFrame(elapsed, i); // Draw to canvas

        // Create VideoFrame from canvas
        const frame = new window.VideoFrame(canvas, { timestamp: i * (1000000 / fps) }); // timestamp in microseconds

        await videoEncoder.encode(frame, { keyFrame: i % 30 === 0 });
        frame.close();

        if (onProgress) onProgress(Math.floor((i / totalFrames) * 100));

        // Yield to event loop to prevent freezing - less frequently for speed
        if (i % 5 === 0) await new Promise(r => setTimeout(r, 0));
      }

      await videoEncoder.flush();
      muxer.finalize();

      const { buffer } = muxer.target;
      const blob = new Blob([buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
      return;

    } catch (e) {
      console.error("MP4 encoding failed, falling back to MediaRecorder", e);
      // Fallthrough to MediaRecorder
    }
  }

  // --- Fallback / WebM Logic (MediaRecorder) ---

  return new Promise((resolve, reject) => {
    if (!window.MediaRecorder) {
      alert("Video export is not supported in this browser.");
      reject("MediaRecorder not supported");
      return;
    }

    const stream = canvas.captureStream(30); // 30 FPS

    // Helper logic for MIME type selection (same as before)
    let options = { mimeType: 'video/webm;codecs=vp9' };
    let actualMime = 'video/webm';
    let isMp4Supported = false;

    if (mimeType === 'video/mp4') {
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        options = { mimeType: 'video/mp4' };
        actualMime = 'video/mp4';
        isMp4Supported = true;
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
        options = { mimeType: 'video/webm;codecs=h264' };
        actualMime = 'video/webm';
      }
    }

    if (mimeType === 'video/mp4' && !isMp4Supported) {
      console.warn("Native MP4 recording not supported, checking for WebCodecs fallback above. If fallback failed, we are here with WebM.");
      // Note: The alert logic was moved to before the fallback attempt usually, but here we are in legacy path.
      // We can alert if we really are stuck with WebM when MP4 was asked.
    }

    let recorder;
    try {
      recorder = new MediaRecorder(stream, options);
    } catch (e) {
      console.warn("MediaRecorder creation failed with options, falling back to default.", e);
      recorder = new MediaRecorder(stream);
      actualMime = 'video/webm';
    }

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: options.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = actualMime.includes('mp4') ? 'mp4' : 'webm';
      a.download = `sowntra-design.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      resolve();
    };

    recorder.start();
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (onProgress) onProgress(Math.floor(progress * 100));

      drawFrame(elapsed);

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        recorder.stop();
      }
    };

    requestAnimationFrame(animate);
  });
};
