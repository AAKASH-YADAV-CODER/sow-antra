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
import { getFilterCSS, getCanvasGradient, getCanvasEffects } from './helpers';

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
export const drawElementToCanvas = (ctx, element, time, elementIndex, imageEffects = {}) => {
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
      const animType = typeof element.animation === 'object' ? element.animation.type : element.animation;
      switch (animType) {
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
        case 'wipe':
          // Handled via clipping below, enable full opacity
          opacity = 1;
          break;
        case 'tumble':
          rotation = 180 * (1 - animTime);
          scale = animTime;
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
        case 'neon':
          // Simulate the very subtle CSS flicker (91-93% of duration)
          if (animTime > 0.91 && animTime < 0.93) {
            opacity = 0.5 + Math.random() * 0.2;
          } else {
            opacity = 1;
          }
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

  // Apply Wipe/Typewriter Clipping
  const animForClip = typeof element.animation === 'object' ? element.animation : { type: element.animation };
  if (element.animation && (animForClip.type === 'wipe' || animForClip.type === 'typewriter')) {
    const staggeredTime = Math.max(0, time - (elementIndex * 0.2));
    const animTime = Math.min(Math.max(staggeredTime, 0), 1);

    ctx.beginPath();
    ctx.rect(element.x, element.y, element.width * animTime, element.height);
    ctx.clip();
  }

  // Apply canvas effects
  const canvasEffects = getCanvasEffects(element, imageEffects);

  // Apply shadow effects
  if (canvasEffects.shadow && Object.keys(canvasEffects.shadow).length > 0) {
    ctx.shadowColor = canvasEffects.shadow.color;
    ctx.shadowBlur = canvasEffects.shadow.blur || 0;
    ctx.shadowOffsetX = canvasEffects.shadow.offsetX || 0;
    ctx.shadowOffsetY = canvasEffects.shadow.offsetY || 0;
  }

  // Neon Glow for Export
  const animForNeon = typeof element.animation === 'object' ? element.animation : null;
  if (animForNeon && animForNeon.type === 'neon') {
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
    ctx.filter += ' ' + canvasEffects.filters;
  }

  ctx.globalAlpha = opacity;

  const backgroundStyle = getCanvasGradient(ctx, element);

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
    ctx.textBaseline = 'top';
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
    // Handle text wrapping for canvas
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
    if (element.strokeWidth > 0) ctx.stroke();
  } else if (element.type === 'regularPolygon' || element.type === 'hexagon' || element.type === 'pentagon' || element.type === 'octagon') {
    const sides = element.sides || (element.type === 'hexagon' ? 6 : element.type === 'pentagon' ? 5 : element.type === 'octagon' ? 8 : 5);
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    const radius = Math.min(element.width, element.height) / 2;

    ctx.fillStyle = backgroundStyle;
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth;
    ctx.beginPath();

    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
    if (element.strokeWidth > 0) ctx.stroke();
  } else if (element.type === 'diamond') {
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    const w = element.width / 2;
    const h = element.height / 2;

    ctx.fillStyle = backgroundStyle;
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - h);
    ctx.lineTo(centerX + w, centerY);
    ctx.lineTo(centerX, centerY + h);
    ctx.lineTo(centerX - w, centerY);
    ctx.closePath();
    ctx.fill();
    if (element.strokeWidth > 0) ctx.stroke();
  } else if (element.type === 'trapezoid') {
    const w = element.width;
    const h = element.height;
    const inset = w * 0.2;

    ctx.fillStyle = backgroundStyle;
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth;
    ctx.beginPath();
    ctx.moveTo(element.x + inset, element.y);
    ctx.lineTo(element.x + w - inset, element.y);
    ctx.lineTo(element.x + w, element.y + h);
    ctx.lineTo(element.x, element.y + h);
    ctx.closePath();
    ctx.fill();
    if (element.strokeWidth > 0) ctx.stroke();
  } else if (element.type === 'parallelogram') {
    const w = element.width;
    const h = element.height;
    const skew = w * 0.2;

    ctx.fillStyle = backgroundStyle;
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth;
    ctx.beginPath();
    ctx.moveTo(element.x + skew, element.y);
    ctx.lineTo(element.x + w, element.y);
    ctx.lineTo(element.x + w - skew, element.y + h);
    ctx.lineTo(element.x, element.y + h);
    ctx.closePath();
    ctx.fill();
    if (element.strokeWidth > 0) ctx.stroke();
  } else if (element.type === 'heart') {
    const w = element.width;
    const h = element.height;

    ctx.fillStyle = backgroundStyle;
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth;
    ctx.beginPath();
    const topCurveHeight = h * 0.3;
    ctx.moveTo(element.x + w / 2, element.y + h / 5);
    ctx.bezierCurveTo(element.x + w / 2, element.y, element.x, element.y, element.x, element.y + topCurveHeight);
    ctx.bezierCurveTo(element.x, element.y + (h + topCurveHeight) / 2, element.x + w / 2, element.y + h, element.x + w / 2, element.y + h);
    ctx.bezierCurveTo(element.x + w / 2, element.y + h, element.x + w, element.y + (h + topCurveHeight) / 2, element.x + w, element.y + topCurveHeight);
    ctx.bezierCurveTo(element.x + w, element.y, element.x + w / 2, element.y, element.x + w / 2, element.y + h / 5);
    ctx.closePath();
    ctx.fill();
    if (element.strokeWidth > 0) ctx.stroke();
  } else if (element.type === 'cross') {
    const w = element.width;
    const h = element.height;
    const thickness = Math.min(w, h) / 3;

    ctx.fillStyle = backgroundStyle;
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth;

    ctx.beginPath();
    // Draw cross polygon
    const cx = element.x + w / 2;
    const cy = element.y + h / 2;

    // Horizontal bar
    ctx.rect(element.x, cy - thickness / 2, w, thickness);
    // Vertical bar
    ctx.rect(cx - thickness / 2, element.y, thickness, h);

    ctx.fill();
    // Stroke is tricky for 2 rects, ideally manual path:
    // Or simpler approximation
    if (element.strokeWidth > 0) {
      ctx.beginPath();
      ctx.moveTo(element.x, cy - thickness / 2);
      ctx.lineTo(cx - thickness / 2, cy - thickness / 2);
      ctx.lineTo(cx - thickness / 2, element.y);
      ctx.lineTo(cx + thickness / 2, element.y);
      ctx.lineTo(cx + thickness / 2, cy - thickness / 2);
      ctx.lineTo(element.x + w, cy - thickness / 2);
      ctx.lineTo(element.x + w, cy + thickness / 2);
      ctx.lineTo(cx + thickness / 2, cy + thickness / 2);
      ctx.lineTo(cx + thickness / 2, element.y + h);
      ctx.lineTo(cx - thickness / 2, element.y + h);
      ctx.lineTo(cx - thickness / 2, cy + thickness / 2);
      ctx.lineTo(element.x, cy + thickness / 2);
      ctx.closePath();
      ctx.stroke();
    }
  } else if (['speech_bubble', 'thought_bubble', 'speech_bubble_round', 'callout'].includes(element.type)) {
    const w = element.width;
    const h = element.height;

    ctx.fillStyle = backgroundStyle;
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth;
    ctx.beginPath();

    if (element.type === 'speech_bubble') {
      ctx.moveTo(element.x, element.y);
      ctx.lineTo(element.x + w, element.y);
      ctx.lineTo(element.x + w, element.y + h * 0.8);
      ctx.lineTo(element.x + w * 0.4, element.y + h * 0.8);
      ctx.lineTo(element.x + w * 0.2, element.y + h);
      ctx.lineTo(element.x + w * 0.3, element.y + h * 0.8);
      ctx.lineTo(element.x, element.y + h * 0.8);
      ctx.closePath();
    } else if (element.type === 'speech_bubble_round') {
      const r = 20;
      ctx.moveTo(element.x + r, element.y);
      ctx.lineTo(element.x + w - r, element.y);
      ctx.quadraticCurveTo(element.x + w, element.y, element.x + w, element.y + r);
      ctx.lineTo(element.x + w, element.y + h * 0.8 - r);
      ctx.quadraticCurveTo(element.x + w, element.y + h * 0.8, element.x + w - r, element.y + h * 0.8);
      ctx.lineTo(element.x + w * 0.4, element.y + h * 0.8);
      ctx.lineTo(element.x + w * 0.2, element.y + h);
      ctx.lineTo(element.x + w * 0.3, element.y + h * 0.8);
      ctx.lineTo(element.x + r, element.y + h * 0.8);
      ctx.quadraticCurveTo(element.x, element.y + h * 0.8, element.x, element.y + h * 0.8 - r);
      ctx.lineTo(element.x, element.y + r);
      ctx.quadraticCurveTo(element.x, element.y, element.x + r, element.y);
    } else if (element.type === 'thought_bubble' || element.type === 'cloud') {
      // Simple cloud shape
      const r = w * 0.15;
      ctx.arc(element.x + w * 0.2, element.y + h * 0.3, r, Math.PI * 0.8, Math.PI * 1.7);
      ctx.arc(element.x + w * 0.5, element.y + h * 0.2, r * 1.5, Math.PI, Math.PI * 2);
      ctx.arc(element.x + w * 0.8, element.y + h * 0.3, r, Math.PI * 1.3, Math.PI * 0.2);
      ctx.arc(element.x + w * 0.8, element.y + h * 0.7, r, Math.PI * 1.8, Math.PI * 0.7);
      ctx.arc(element.x + w * 0.5, element.y + h * 0.8, r * 1.2, 0, Math.PI);
      ctx.arc(element.x + w * 0.2, element.y + h * 0.7, r, Math.PI * 0.3, Math.PI * 1.2);
      // If thought bubble, add bubbles
      if (element.type === 'thought_bubble') {
        ctx.moveTo(element.x + w * 0.1, element.y + h * 0.9);
        ctx.arc(element.x + w * 0.15, element.y + h * 0.95, r / 3, 0, Math.PI * 2);
        ctx.moveTo(element.x, element.y + h);
        ctx.arc(element.x + w * 0.05, element.y + h, r / 5, 0, Math.PI * 2);
      }
    }

    ctx.fill();
    if (element.strokeWidth > 0) ctx.stroke();
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
  } else if (element.type === 'drawing' && element.path && element.path.length > 1) {
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
  } else if (element.type === 'frame') {
    const w = element.width;
    const h = element.height;
    const maskType = element.maskType || 'rect';
    const hasContent = !!element.content;

    // Apply Mask
    ctx.save();
    ctx.beginPath();

    if (maskType === 'circle') {
      ctx.arc(element.x + w / 2, element.y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
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
      const points = (element.points || '0.5,0 1,1 0,1').split(' ');
      points.forEach((p, idx) => {
        const [px, py] = p.split(',').map(Number);
        if (idx === 0) ctx.moveTo(element.x + px * w, element.y + py * h);
        else ctx.lineTo(element.x + px * w, element.y + py * h);
      });
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
        if (i === 0) ctx.moveTo(x, y);
        ctx.arc(x, y, 0.2 * Math.min(w, h), angle - Math.PI / 2, angle + Math.PI / 2);
      }
    } else if (maskType === 'device' && element.deviceType === 'phone') {
      const radius = 20;
      if (ctx.roundRect) {
        ctx.roundRect(element.x + 0.05 * w, element.y + 0.02 * h, 0.9 * w, 0.96 * h, radius);
      } else {
        ctx.rect(element.x + 0.05 * w, element.y + 0.02 * h, 0.9 * w, 0.96 * h);
      }
    } else {
      ctx.rect(element.x, element.y, w, h);
    }

    ctx.closePath();
    ctx.clip();

    if (hasContent) {
      if (element.contentType === 'video') {
        // Videos are hard to export to static images unless we capture a frame. 
        // For now, draw placeholder or attempt to draw the element if it's a ref.
        ctx.fillStyle = '#ebedef';
        ctx.fillRect(element.x, element.y, w, h);
      } else {
        const img = new window.Image();
        img.src = element.content;

        // Object-fit: cover logic
        const imgRatio = (img.width / img.height) || 1;
        const frameRatio = w / h;
        let drawW, drawH, drawX, drawY;

        if (imgRatio > frameRatio) {
          drawH = h;
          drawW = h * imgRatio;
          drawX = element.x - (drawW - w) / 2;
          drawY = element.y;
        } else {
          drawW = w;
          drawH = w / imgRatio;
          drawX = element.x;
          drawY = element.y - (drawH - h) / 2;
        }
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }
    } else {
      // Empty frame placeholder
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(element.x, element.y, w, h);

      // Draw dashed border
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      ctx.strokeRect(element.x, element.y, w, h);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  ctx.restore();
};

/**
 * Export canvas as SVG
 */
export const exportAsSVG = (elements, canvasSize) => {
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

    if (element.type === 'rectangle') {
      svgContent += `
  <rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" 
        fill="${fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" 
        rx="${element.borderRadius || 0}" transform="${transform}"/>`;
    } else if (element.type === 'circle') {
      svgContent += `
  <circle cx="${element.x + element.width / 2}" cy="${element.y + element.height / 2}" r="${element.width / 2}" 
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
};

/**
 * Export canvas as image (PNG, JPEG, WebP)
 */
export const exportAsImage = (elements, canvasSize, format, imageEffects = {}) => {
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

  const sortedElements = getSortedElementsForExport(elements);
  const imageElements = sortedElements.filter(el =>
    el.type === 'image' || (el.type === 'frame' && el.content && el.contentType !== 'video')
  );

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
            drawElementToCanvas(ctx, element, undefined, index, imageEffects);
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
      const imgSrc = element.type === 'frame' ? element.content : element.src;
      img.src = imgSrc;
      img.onload = () => {
        checkAllLoaded();
      };
      img.onerror = () => {
        console.error('Failed to load image:', imgSrc);
        checkAllLoaded(); // Continue even if some images fail
      };
    });
  } else {
    // No images, draw all elements directly in correct order
    try {
      sortedElements.forEach((element, index) => {
        drawElementToCanvas(ctx, element, undefined, index, imageEffects);
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
};

/**
 * Export canvas as PDF
 */
export const exportAsPDF = (elements, canvasSize, imageEffects = {}) => {
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

  const sortedElements = getSortedElementsForExport(elements);
  const imageElements = sortedElements.filter(el =>
    el.type === 'image' || (el.type === 'frame' && el.content && el.contentType !== 'video')
  );

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
        drawElementToCanvas(ctx, element, undefined, index, imageEffects);
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
      const imgSrc = element.type === 'frame' ? element.content : element.src;
      img.src = imgSrc;
      img.onload = () => {
        checkAllLoaded();
      };
      img.onerror = () => {
        console.error('Failed to load image:', imgSrc);
        checkAllLoaded();
      };
    });
  } else {
    // No images, draw directly
    try {
      sortedElements.forEach((element, index) => {
        drawElementToCanvas(ctx, element, undefined, index, imageEffects);
      });
      generatePDF();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    }
  }
};

/**
 * Export canvas as Video (WebM)
 */
export const exportAsVideo = (elements, canvasSize, imageEffects = {}, duration = 5000, onProgress, mimeType = 'video/webm') => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');

    if (!window.MediaRecorder) {
      alert("Video export is not supported in this browser.");
      reject("MediaRecorder not supported");
      return;
    }

    const stream = canvas.captureStream(30); // 30 FPS

    // Try to support MP4 if requested, fallback to WebM
    let options = { mimeType: 'video/webm' };
    if (mimeType === 'video/mp4') {
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        options = { mimeType: 'video/mp4' };
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
        options = { mimeType: 'video/webm;codecs=h264' }; // Often treated as MP4 compatible
      }
    }

    let recorder;
    try {
      recorder = new MediaRecorder(stream, options);
    } catch (e) {
      console.warn("MediaRecorder creation failed with options, falling back to default.", e);
      recorder = new MediaRecorder(stream);
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
      // Determine extension
      const ext = options.mimeType.includes('mp4') ? 'mp4' : 'webm';
      a.download = `sowntra-design.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      resolve();
    };

    recorder.start();

    const sortedElements = getSortedElementsForExport(elements);
    let startTime = null;
    const animationLength = duration || 5000;

    const animate = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
        // Force first draw immediately
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animationLength, 1);

      if (onProgress) onProgress(Math.floor(progress * 100));

      // Clear and draw background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      sortedElements.forEach((element, index) => {
        drawElementToCanvas(ctx, element, elapsed / 1000, index, imageEffects);
      });

      if (elapsed < animationLength) {
        requestAnimationFrame(animate);
      } else {
        recorder.stop();
      }
    };

    requestAnimationFrame(animate);
  });
};
