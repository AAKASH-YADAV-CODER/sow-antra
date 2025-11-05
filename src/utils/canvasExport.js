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
  
  // Apply canvas effects
  const canvasEffects = getCanvasEffects(element, imageEffects);
  
  // Apply shadow effects
  if (canvasEffects.shadow && Object.keys(canvasEffects.shadow).length > 0) {
    ctx.shadowColor = canvasEffects.shadow.color;
    ctx.shadowBlur = canvasEffects.shadow.blur || 0;
    ctx.shadowOffsetX = canvasEffects.shadow.offsetX || 0;
    ctx.shadowOffsetY = canvasEffects.shadow.offsetY || 0;
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
    const transform = `rotate(${element.rotation || 0} ${element.x + element.width/2} ${element.y + element.height/2})`;
    const fill = element.fillType === 'gradient' ? `url(#gradient-${idx})` : element.fill;
    
    if (element.type === 'rectangle') {
      svgContent += `
  <rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" 
        fill="${fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" 
        rx="${element.borderRadius || 0}" transform="${transform}"/>`;
    } else if (element.type === 'circle') {
      svgContent += `
  <circle cx="${element.x + element.width/2}" cy="${element.y + element.height/2}" r="${element.width/2}" 
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
  const imageElements = sortedElements.filter(el => el.type === 'image');
  
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
      img.src = element.src;
      img.onload = () => {
        checkAllLoaded();
      };
      img.onerror = () => {
        console.error('Failed to load image:', element.src);
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
  const imageElements = sortedElements.filter(el => el.type === 'image');
  
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
      img.src = element.src;
      img.onload = () => {
        checkAllLoaded();
      };
      img.onerror = () => {
        console.error('Failed to load image:', element.src);
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
