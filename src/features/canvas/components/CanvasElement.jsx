import React from 'react';
import { Lock, Image as ImageIcon, MessageCircle } from 'lucide-react';

import styles from '../../../styles/MainPage.module.css';

/**
 * CanvasElement Component
 * 
 * Renders individual canvas elements (text, shapes, images, stickers, drawings, groups)
 * with selection handles, effects, filters, and interaction handlers.
 * 
 * @param {Object} element - The element to render
 * @param {Set} selectedElements - Set of selected element IDs
 * @param {string|null} textEditing - ID of element currently being text-edited
 * @param {Set} lockedElements - Set of locked element IDs
 * @param {string} currentTool - Current tool being used ('select', 'pen', etc.)
 * @param {string} currentLanguage - Current UI language
 * @param {string} textDirection - Text direction ('ltr' or 'rtl')
 * @param {Array} fontFamilies - Available font families
 * @param {Object} supportedLanguages - Language configuration object
 * @param {Array} stickerOptions - Available sticker options
 * @param {Function} handleMouseDown - Mouse down handler for element interaction
 * @param {Function} handleSelectElement - Handler for selecting elements
 * @param {Function} updateElement - Handler for updating element properties
 * @param {Function} setTextEditing - Handler for setting text editing state
 * @param {Function} getCurrentPageElements - Get elements for current page
 * @param {Function} getBackgroundStyle - Get background style for gradients
 * @param {Function} getFilterCSS - Get filter CSS for element filters
 * @param {Function} getEffectCSS - Get effect CSS for element effects
 * @param {Function} parseCSS - Parse CSS string to object
 * @param {Function} renderSelectionHandles - Render selection handles for element
 * @param {Function} handleTextEdit - Handler for text editing
 * @param {number} zoom - Current canvas zoom level

 */
const CanvasElement = ({
  element,
  selectedElements,
  textEditing,
  lockedElements,
  currentTool,
  currentLanguage,
  textDirection,
  fontFamilies,
  supportedLanguages,
  stickerOptions,
  handleMouseDown,
  handleSelectElement,
  updateElement,
  setTextEditing,
  getCurrentPageElements,
  getBackgroundStyle,
  getFilterCSS,
  getEffectCSS,
  parseCSS,
  renderSelectionHandles,
  handleTextEdit,
  onCommentClick,
  zoom = 1

}) => {
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
          .map(el => (
            <CanvasElement
              key={el.id}
              element={el}
              selectedElements={selectedElements}
              textEditing={textEditing}
              lockedElements={lockedElements}
              currentTool={currentTool}
              currentLanguage={currentLanguage}
              textDirection={textDirection}
              fontFamilies={fontFamilies}
              supportedLanguages={supportedLanguages}
              stickerOptions={stickerOptions}
              handleMouseDown={handleMouseDown}
              handleSelectElement={handleSelectElement}
              updateElement={updateElement}
              setTextEditing={setTextEditing}
              getCurrentPageElements={getCurrentPageElements}
              getBackgroundStyle={getBackgroundStyle}
              getFilterCSS={getFilterCSS}
              getEffectCSS={getEffectCSS}
              parseCSS={parseCSS}
              renderSelectionHandles={renderSelectionHandles}
              handleTextEdit={handleTextEdit}
            />
          ))}


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
    opacity: element.filters?.opacity ? element.filters.opacity.value / 100 : 1,
    // Animation Support
    // Logic: Map 'typewriter' to 'wipe' for non-text elements to avoid distortion
    // Logic: Map 'typewriter' to 'wipe' for ALL elements to avoid layout shifts/reflow issues on text
    animationName: (element.animation?.type === 'typewriter')
      ? 'wipe'
      : (element.animation?.type || 'none'),
    animationDuration: `${element.animation?.duration || 1}s`,
    animationDelay: `${element.animation?.delay || 0}s`,
    animationIterationCount: element.animation?.iteration || 1,
    animationFillMode: 'both'

  };

  // Apply effects CSS
  const effectCSS = getEffectCSS(element);
  if (effectCSS) {
    Object.assign(style, parseCSS(effectCSS));
  }




  let content;
  if (element.type === 'text') {
    const textElementStyle = {
      ...style,
      fontSize: element.fontSize,
      fontFamily: needsComplexScript ? supportedLanguages[currentLanguage]?.font : element.fontFamily,
      fontWeight: element.fontWeight,
      fontStyle: element.fontStyle,
      textDecoration: element.textDecoration,
      color: element.color,
      textAlign: isRTL ? 'right' : element.textAlign,
      display: 'flex',
      alignItems: 'flex-start',
      cursor: isLocked ? 'not-allowed' : (isEditing ? 'text' : 'move'),
      outline: 'none',
      userSelect: isEditing ? 'text' : 'none',
      minHeight: element.height,
      minWidth: element.width,
      padding: '4px',
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
      overflow: 'hidden',
      wordBreak: 'break-word'
    };




    content = (
      <div
        id={`element-${element.id}`}
        style={textElementStyle}
        className={`${styles.textElement || ''} text-element ${needsComplexScript ? 'complex-script' : ''} ${element.fillType === 'gradient' ? 'gradient-fix' : ''}`}
        contentEditable={!isLocked && isEditing}
        suppressContentEditableWarning={true}
        onBlur={(e) => {
          const newContent = e.target.textContent || '';
          const newHeight = Math.max(element.fontSize * 2, e.target.scrollHeight);
          updateElement(element.id, { content: newContent, height: newHeight });
          setTextEditing(null);
        }}
        onInput={(e) => {
          // Don't update element state during typing to prevent sync conflicts
          // Just let the contentEditable handle the input naturally
          // Height will be updated on blur
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
    const rectangleStyle = {
      ...style,
      backgroundColor: element.fillType === 'solid' ? element.fill : 'transparent',
      background: element.fillType === 'gradient' ? getBackgroundStyle(element) : 'none',
      border: `${element.strokeWidth}px solid ${element.stroke}`,
      borderRadius: element.borderRadius,
    };


    content = (
      <div
        id={`element-${element.id}`}
        className={`${styles.shapeElement || ''} ${element.fillType === 'gradient' ? 'gradient-fix' : ''}`}
        style={rectangleStyle}
        onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
      />
    );
  } else if (element.type === 'circle') {
    const circleStyle = {
      ...style,
      backgroundColor: element.fillType === 'solid' ? element.fill : 'transparent',
      background: element.fillType === 'gradient' ? getBackgroundStyle(element) : 'none',
      border: `${element.strokeWidth}px solid ${element.stroke}`,
      borderRadius: '50%',
    };


    content = (
      <div
        id={`element-${element.id}`}
        className={`${styles.shapeElement || ''} ${element.fillType === 'gradient' ? 'gradient-fix' : ''}`}
        style={circleStyle}
        onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
      />
    );
  } else if (element.type === 'triangle') {
    const clipPathId = `triangle-clip-${element.id}`;


    const triangleStyle = {
      ...style,
      width: element.width,
      height: element.height
    };


    const fillStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: element.fillType === 'solid' ? element.fill : 'transparent',
      background: element.fillType === 'gradient' ? getBackgroundStyle(element) : 'none',
      clipPath: `url(#${clipPathId})`,
      WebkitClipPath: `url(#${clipPathId})`
    };


    content = (
      <div
        id={`element-${element.id}`}
        className={`${styles.shapeElement || ''}`}
        style={triangleStyle}
        onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
      >
        {/* Fill layer */}
        <div
          className={element.fillType === 'gradient' ? 'gradient-fix' : ''}
          style={fillStyle}
        />

        {/* Stroke layer using SVG */}
        <svg
          width="100%"
          height="100%"

          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          viewBox={`0 0 ${element.width} ${element.height}`}
          preserveAspectRatio="none"
        >
          <polygon
            points={`${element.width / 2},0 ${element.width},${element.height} 0,${element.height}`}

            fill="none"
            stroke={element.stroke || '#000000'}
            strokeWidth={element.strokeWidth || 2}
          />
        </svg>


        {/* Clip path definition */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
              <polygon points="0.5,0 1,1 0,1" />
            </clipPath>
          </defs>
        </svg>
      </div>
    );
  } else if (element.type === 'image') {
    const imageStyle = {
      ...style,
      objectFit: 'cover',
      borderRadius: element.borderRadius,
      pointerEvents: 'auto',
      userSelect: 'none'
    };


    content = (
      <img
        id={`element-${element.id}`}
        src={element.src}
        alt=""
        className={styles.imageElement || ''}
        style={imageStyle}
        onMouseDown={(e) => {
          if (!isLocked) {
            e.preventDefault();
            e.stopPropagation();
            handleMouseDown(e, element.id);
          }
        }}
        onClick={(e) => {
          if (!isLocked) {
            e.stopPropagation();
            handleSelectElement(e, element.id);
          }
        }}
        draggable={false}
      />
    );
  } else if (element.type === 'line' || element.type === 'line_double') {
    content = (
      <svg
        id={`element-${element.id}`}
        style={{ ...style, overflow: 'visible' }}

        onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
      >
        <line
          x1={0}
          y1={element.height / 2}
          x2={element.width}
          y2={element.height / 2}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
          strokeDasharray={element.strokeDasharray}
          strokeLinecap={element.strokeLinecap}
        />
        {element.type === 'line_double' && (
          <line
            x1={0}
            y1={element.height / 2 + (element.strokeWidth || 2) * 2}
            x2={element.width}
            y2={element.height / 2 + (element.strokeWidth || 2) * 2}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            strokeDasharray={element.strokeDasharray}
            strokeLinecap={element.strokeLinecap}
          />
        )}
      </svg>
    );
  } else if (element.type === 'arrow' || element.type === 'arrow_double') {
    content = (
      <svg
        id={`element-${element.id}`}
        style={{ ...style, overflow: 'visible' }}

        onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
      >
        <defs>
          <marker
            id={`arrowhead-${element.id}`}
            markerWidth="4"
            markerHeight="4"
            refX="0.1"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 4 2, 0 4" fill={element.stroke} />
          </marker>
          {element.type === 'arrow_double' && (
            <marker
              id={`arrowhead-start-${element.id}`}
              markerWidth="4"
              markerHeight="4"
              refX="3.9"
              refY="2"
              orient="auto-start-reverse"
            >
              <polygon points="4 0, 0 2, 4 4" fill={element.stroke} />
            </marker>
          )}
        </defs>
        <line
          x1={element.type === 'arrow_double' ? (element.strokeWidth || 2) * 4 : 0}
          y1={element.height / 2}
          x2={element.width - (element.strokeWidth || 2) * 4}
          y2={element.height / 2}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
          strokeDasharray={element.strokeDasharray}
          strokeLinecap="butt"
          markerEnd={`url(#arrowhead-${element.id})`}
          markerStart={element.type === 'arrow_double' ? `url(#arrowhead-start-${element.id})` : ''}

        />
      </svg>
    );
  } else if (element.type === 'star') {
    const clipPathId = `star-clip-${element.id}`;
    const points = element.points || 5;


    // Calculate star points to fill the entire bounding box
    const padding = 0.02; // Small padding to prevent clipping
    const outerRadius = 0.5 - padding;
    const innerRadius = outerRadius * 0.4;
    const centerX = 0.5;
    const centerY = 0.5;


    let clipPathPoints = '';
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      clipPathPoints += x + ',' + y + ' ';
    }


    const starStyle = {
      ...style,
      width: element.width,
      height: element.height
    };


    const fillStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: element.fillType === 'solid' ? element.fill : 'transparent',
      background: element.fillType === 'gradient' ? getBackgroundStyle(element) : 'none',
      clipPath: `url(#${clipPathId})`,
      WebkitClipPath: `url(#${clipPathId})`
    };


    // Create SVG path for stroke (matching clipPath proportions)
    const paddingPx = Math.min(element.width, element.height) * 0.02;
    const maxRadius = Math.min(element.width, element.height) / 2;
    const outerRadiusPx = maxRadius - paddingPx;
    const innerRadiusPx = outerRadiusPx * 0.4; // Same proportion as clipPath
    const centerXPx = element.width / 2;
    const centerYPx = element.height / 2;


    let strokePath = '';
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadiusPx : innerRadiusPx;
      const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
      const x = centerXPx + radius * Math.cos(angle);
      const y = centerYPx + radius * Math.sin(angle);
      strokePath += (i === 0 ? 'M' : 'L') + x + ',' + y;
    }
    strokePath += 'Z';


    content = (
      <div
        id={`element-${element.id}`}
        className={`${styles.shapeElement || ''}`}
        style={starStyle}
        onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
      >
        {/* Fill layer */}
        <div
          className={element.fillType === 'gradient' ? 'gradient-fix' : ''}
          style={fillStyle}
        />

        {/* Stroke layer using SVG */}
        <svg
          width="100%"
          height="100%"

          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          viewBox={`0 0 ${element.width} ${element.height}`}
          preserveAspectRatio="none"
        >
          <path
            d={strokePath}
            fill="none"
            stroke={element.stroke || '#000000'}
            strokeWidth={element.strokeWidth || 2}
          />
        </svg>


        {/* Clip path definition */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
              <polygon points={clipPathPoints} />
            </clipPath>
          </defs>
        </svg>
      </div>
    );
  } else if (element.type === 'regularPolygon') {
    const sides = element.sides || 6;
    const centerX = element.width / 2;
    const centerY = element.height / 2;
    // Use slightly less than half width to avoid clipping stroke
    const radius = (Math.min(element.width, element.height) / 2) - ((element.strokeWidth || 0) / 2);

    let path = '';
    // Start from top (rotate -90deg or -PI/2)
    // Formula: angle = i * 2PI / sides - PI/2
    const startAngle = -Math.PI / 2;

    for (let i = 0; i < sides; i++) {
      const angle = startAngle + (Math.PI * 2 * i) / sides;

      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      path += (i === 0 ? 'M' : 'L') + x + ',' + y;
    }
    path += 'Z';

    const polygonStyle = {
      ...style,
      backgroundColor: 'transparent', // We use SVG fill
      border: 'none',
      borderRadius: '0'
    };

    // Handle gradient separately if needed, but for SVG path 'fill' works with url(#id)
    // For simplicity, we pass the generic background style to fill
    // If it's a gradient object, getBackgroundStyle returns the CSS string (linear-gradient(...))
    // SVG fill doesn't support CSS gradients directly unless defined in <defs>. 
    // For now, let's assume solid fill until complex gradient refactor.
    // However, the original code had: fill={getBackgroundStyle(element)}
    // If getBackgroundStyle returns "linear-gradient(...)", SVG fill will fail.
    // We should ideally use a clip-path div approach like 'star' for full gradient support.

    // Better Approach: Re-use the Star approach (Div with ClipPath) for perfect Gradient support

    const clipPathId = `poly-clip-${element.id}`;

    // Generate 0-1 coords for clipPath
    let clipPoints = '';
    for (let i = 0; i < sides; i++) {
      const angle = startAngle + (Math.PI * 2 * i) / sides;
      // Map -1..1 to 0..1
      // x = 0.5 + 0.5 * cos
      const xCP = 0.5 + 0.5 * Math.cos(angle);
      const yCP = 0.5 + 0.5 * Math.sin(angle);
      clipPoints += xCP + ',' + yCP + ' ';
    }

    content = (
      <div
        id={`element-${element.id}`}
        className={`${styles.shapeElement || ''}`}
        style={polygonStyle}
        onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
      >
        {/* Fill layer */}
        <div
          className={element.fillType === 'gradient' ? 'gradient-fix' : ''}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: element.fillType === 'solid' ? element.fill : 'transparent',
            background: element.fillType === 'gradient' ? getBackgroundStyle(element) : 'none',
            clipPath: `url(#${clipPathId})`,
            WebkitClipPath: `url(#${clipPathId})`
          }}
        />

        {/* Stroke layer */}
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          viewBox={`0 0 ${element.width} ${element.height}`}
          preserveAspectRatio="none"
        >
          <path
            d={path}
            fill="none"
            stroke={element.stroke || '#000000'}
            strokeWidth={element.strokeWidth || 2}
          />
        </svg>

        {/* Clip defs */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
              <polygon points={clipPoints} />
            </clipPath>
          </defs>
        </svg>
      </div>
    );
  } else if (element.type === 'drawing' && element.path && element.path.length > 1) {
    if (element.path.length < 2) return null;


    let pathData = 'M ' + element.path[0].x + ' ' + element.path[0].y;
    for (let i = 1; i < element.path.length; i++) {
      pathData += ' L ' + element.path[i].x + ' ' + element.path[i].y;
    }

    content = (
      <svg
        id={`element-${element.id}`}
        style={{ ...style }}

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
  } else if (['trapezoid', 'parallelogram', 'triangle_right', 'cross', 'speech_bubble', 'speech_bubble_round', 'thought_bubble', 'callout', 'location', 'shield', 'banner', 'ribbon', 'search', 'diamond'].includes(element.type)) {
    const w = element.width;
    const h = element.height;
    const clipPathId = `path-clip-${element.id}`;

    // Path definitions in 0-1 coordinate space for ClipPath
    let clipPathPoints = '';
    let svgPath = ''; // For the stroke layer (in pixels)

    if (element.type === 'trapezoid') {
      clipPathPoints = '0.2,0 0.8,0 1,1 0,1';
      svgPath = `M ${w * 0.2},0 L ${w * 0.8},0 L ${w},${h} L 0,${h} Z`;
    } else if (element.type === 'parallelogram') {
      clipPathPoints = '0.25,0 1,0 0.75,1 0,1';
      svgPath = `M ${w * 0.25},0 L ${w},0 L ${w * 0.75},${h} L 0,${h} Z`;
    } else if (element.type === 'triangle_right') {
      clipPathPoints = '0,0 0,1 1,1';
      svgPath = `M 0,0 L 0,${h} L ${w},${h} Z`;
    } else if (element.type === 'diamond') {
      clipPathPoints = '0.5,0 1,0.5 0.5,1 0,0.5';
      svgPath = `M ${w * 0.5},0 L ${w},${h * 0.5} L ${w * 0.5},${h} L 0,${h * 0.5} Z`;
    } else if (element.type === 'cross') {
      clipPathPoints = '0.35,0 0.65,0 0.65,0.35 1,0.35 1,0.65 0.65,0.65 0.65,1 0.35,1 0.35,0.65 0,0.65 0,0.35 0.35,0.35';
      const t = Math.min(w, h) * 0.3;
      const cx = w / 2, cy = h / 2;
      svgPath = `M ${cx - t / 2},0 L ${cx + t / 2},0 L ${cx + t / 2},${cy - t / 2} L ${w},${cy - t / 2} L ${w},${cy + t / 2} L ${cx + t / 2},${cy + t / 2} L ${cx + t / 2},${h} L ${cx - t / 2},${h} L ${cx - t / 2},${cy + t / 2} L 0,${cy + t / 2} L 0,${cy - t / 2} L ${cx - t / 2},${cy - t / 2} Z`;
    } else if (element.type === 'speech_bubble') {
      clipPathPoints = '0,0 1,0 1,0.8 0.6,0.8 0.2,1 0.3,0.8 0,0.8';
      svgPath = `M 0,0 L ${w},0 L ${w},${h * 0.8} L ${w * 0.6},${h * 0.8} L ${w * 0.2},${h} L ${w * 0.3},${h * 0.8} L 0,${h * 0.8} Z`;
    } else if (element.type === 'speech_bubble_round') {
      // Approximate round speech bubble in 0-1 space: Circle at top, tail at bottom
      // Using polygon for clipPath is hard for curves, but we'll use a dense polygon for approximation
      clipPathPoints = '0.5,0 0.85,0.15 1,0.4 1,0.7 0.8,0.8 0.6,0.8 0.4,1 0.4,0.8 0.2,0.8 0,0.7 0,0.4 0.15,0.15';
      svgPath = `M ${w * 0.5},0 C ${w * 0.8},0 ${w},${h * 0.2} ${w},${h * 0.4} C ${w},${h * 0.6} ${w * 0.8},${h * 0.8} ${w * 0.5},${h * 0.8} L ${w * 0.3},${h} L ${w * 0.4},${h * 0.8} C ${w * 0.2},${h * 0.8} 0,${h * 0.6} 0,${h * 0.4} C 0,${h * 0.2} ${w * 0.2},0 ${w * 0.5},0 Z`;
    } else if (element.type === 'thought_bubble') {
      clipPathPoints = '0.1,0.5 0.4,0.2 0.7,0.2 0.9,0.5 0.9,0.8 0.6,0.9 0.2,0.9';
      svgPath = `M ${w * 0.1},${h * 0.5} Q ${w * 0.1},${h * 0.1} ${w * 0.4},${h * 0.2} Q ${w * 0.5},${h * 0.0} ${w * 0.7},${h * 0.2} Q ${w * 0.9},${h * 0.1} ${w * 0.9},${h * 0.5} Q ${w},${h * 0.6} ${w * 0.9},${h * 0.8} Q ${w * 0.95},${h} ${w * 0.6},${h * 0.9} Q ${w * 0.4},${h} ${w * 0.2},${h * 0.9} Q 0,${h} ${w * 0.1},${h * 0.5} Z`;
    } else if (element.type === 'shield') {
      clipPathPoints = '0,0 1,0 1,0.6 0.5,1 0,0.6';
      svgPath = `M 0,0 L ${w},0 L ${w},${h * 0.6} L ${w * 0.5},${h} L 0,${h * 0.6} Z`;
    } else if (element.type === 'banner') {
      clipPathPoints = '0,0 1,0 0.8,0.5 1,1 0,1 0.2,0.5';
      svgPath = `M 0,0 L ${w},0 L ${w * 0.8},${h * 0.5} L ${w},${h} L 0,${h} L ${w * 0.2},${h * 0.5} Z`;
    } else if (element.type === 'ribbon') {
      clipPathPoints = '0.1,0 0.9,0 1,0.2 1,0.8 0.9,1 0.1,1 0,0.8 0,0.2';
      svgPath = `M ${w * 0.1},0 L ${w * 0.9},0 L ${w},${h * 0.2} L ${w},${h * 0.8} L ${w * 0.9},${h} L ${w * 0.1},${h} L 0,${h * 0.8} L 0,${h * 0.2} Z`;
    } else if (element.type === 'location') {
      clipPathPoints = '0.5,0 1,0.35 0.5,1 0,0.35';
      svgPath = `M ${w / 2},${h} C ${w / 2},${h} 0,${h * 0.6} 0,${h * 0.35} A ${w / 2},${w / 2} 0 1,1 ${w},${h * 0.35} C ${w},${h * 0.6} ${w / 2},${h} ${w / 2},${h} Z`;
    } else if (element.type === 'callout') {
      clipPathPoints = '0,0 1,0 1,0.8 0.4,0.8 0.3,1 0.2,0.8 0,0.8';
      svgPath = `M 0,0 L ${w},0 L ${w},${h * 0.8} L ${w * 0.4},${h * 0.8} L ${w * 0.3},${h} L ${w * 0.2},${h * 0.8} L 0,${h * 0.8} Z`;
    } else if (element.type === 'search') {
      // Loupe shape
      clipPathPoints = '0.4,0 0.7,0 0.8,0.1 0.8,0.4 1,0.9 0.9,1 0.4,0.8 0.1,0.8 0,0.7 0,0.4';
      svgPath = `M ${w * 0.4},${h * 0.8} L ${w * 0.8},${h * 0.8} L ${w},${h} L ${w * 0.9},${h * 1} L ${w * 0.7},${h * 0.8} A ${w * 0.4},${h * 0.4} 0 1,1 ${w * 0.4},0 A ${w * 0.4},${h * 0.4} 0 1,1 ${w * 0.4},${h * 0.8} Z`;
    }

    content = (
      <div
        id={`element-${element.id}`}
        className={`${styles.shapeElement || ''}`}
        style={{ ...style, backgroundColor: 'transparent', border: 'none' }}
        onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
      >
        {/* Fill layer */}
        <div
          className={element.fillType === 'gradient' ? 'gradient-fix' : ''}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: element.fillType === 'solid' ? element.fill : 'transparent',
            background: element.fillType === 'gradient' ? getBackgroundStyle(element) : 'none',
            clipPath: `url(#${clipPathId})`,
            WebkitClipPath: `url(#${clipPathId})`
          }}
        />

        {/* Stroke layer */}
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
        >
          <path
            d={svgPath}
            fill="none"
            stroke={element.stroke || '#000000'}
            strokeWidth={element.strokeWidth || 2}
            strokeDasharray={element.strokeDasharray}
            strokeLinecap={element.strokeLinecap}
          />
        </svg>

        {/* Clip defs */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
              <polygon points={clipPathPoints} />
            </clipPath>
          </defs>
        </svg>
      </div>
    );

  } else if (element.type === 'frame') {
    const w = element.width;
    const h = element.height;
    const clipPathId = `frame-clip-${element.id}`;
    const maskType = element.maskType || 'rect';
    const hasContent = !!element.content;

    // Handle Drop
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target.result;
          const contentType = file.type.startsWith('image/') ? 'image' : 'video';
          updateElement(element.id, { content: url, contentType });
        };
        reader.readAsDataURL(file);
      } else {
        // Handle drag from elements (if any)
        const data = e.dataTransfer.getData('text/plain');
        if (data && (data.startsWith('http') || data.startsWith('data:image'))) {
          updateElement(element.id, { content: data, contentType: 'image' });
        }
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    let clipPathPoints = '0,0 1,0 1,1 0,1';
    let isPath = false;
    let isCircle = false;
    let isRounded = false;

    if (maskType === 'circle') isCircle = true;
    else if (maskType === 'rounded') isRounded = true;
    else if (maskType === 'polygon' || maskType === 'star') clipPathPoints = element.points || '0.5,0 1,1 0,1';
    else if (maskType === 'heart') {
      isPath = true;
      clipPathPoints = "M 0.5,0.2 C 0.5,0.2 0.4,0 0.25,0 C 0.1,0 0,0.1 0,0.25 C 0,0.45 0.2,0.65 0.5,0.9 C 0.8,0.65 1,0.45 1,0.25 C 1,0.1 0.9,0 0.75,0 C 0.6,0 0.5,0.2 0.5,0.2 Z";
    } else if (maskType === 'cloud') {
      isPath = true;
      clipPathPoints = "M 0.25,0.3 C 0.1,0.3 0,0.45 0,0.6 C 0,0.75 0.1,0.9 0.25,0.9 L 0.75,0.9 C 0.9,0.9 1,0.75 1,0.6 C 1,0.45 0.85,0.3 0.7,0.3 C 0.7,0.15 0.55,0 0.4,0 C 0.25,0 0.25,0.15 0.25,0.3 Z";
    } else if (maskType === 'flower') {
      isPath = true;
      clipPathPoints = "M 0.5,0.5 L 0.5,0 A 0.2,0.2 0 1,1 0.7,0.1 L 0.5,0.5 L 0.9,0.2 A 0.2,0.2 0 1,1 1,0.5 L 0.5,0.5 L 0.9,0.8 A 0.2,0.2 0 1,1 0.6,0.9 L 0.5,0.5 L 0.3,1 A 0.2,0.2 0 1,1 0.1,0.8 L 0.5,0.5 L 0.1,0.5 A 0.2,0.2 0 1,1 0,0.2 L 0.5,0.5 Z";
    } else if (maskType === 'device') {
      if (element.deviceType === 'phone') {
        clipPathPoints = '0.05,0.02 0.4,0.02 0.4,0.05 0.6,0.05 0.6,0.02 0.95,0.02 0.95,0.98 0.05,0.98';
        isRounded = true;
      } else if (element.deviceType === 'laptop') {
        clipPathPoints = '0.1,0.05 0.9,0.05 0.9,0.85 0.1,0.85';
      } else if (element.deviceType === 'browser') {
        clipPathPoints = '0,0.1 1,0.1 1,1 0,1';
      }
    }

    content = (
      <div
        id={`element-${element.id}`}
        style={{
          ...style,
          overflow: 'hidden',
          backgroundColor: hasContent ? 'transparent' : '#f3f4f6',
          // Use clipPath on the container so the placeholder shape is correct
          clipPath: isCircle ? 'circle(50%)' : `url(#${clipPathId})`,
          WebkitClipPath: isCircle ? 'circle(50%)' : `url(#${clipPathId})`,
          border: hasContent ? 'none' : '2px dashed #d1d5db',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: isCircle ? '50%' : isRounded ? (element.borderRadius || 20) + 'px' : '0'
        }}
        onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* MASKED CONTENT */}
        {hasContent ? (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {element.contentType === 'video' ? (
              <video src={element.content} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop />
            ) : (
              <img src={element.content} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <ImageIcon size={32} strokeWidth={1.5} />
            <span className="text-[10px] mt-1 font-medium text-center px-2">Drop media here</span>
          </div>
        )}

        {/* BORDER FOR EMPTY IRREGULAR SHAPES */}
        {!hasContent && !isCircle && !isRounded && maskType !== 'rect' && (
          <svg
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            {isPath ? (
              <path d={clipPathPoints} fill="none" stroke="#d1d5db" strokeWidth="0.02" strokeDasharray="0.05, 0.05" />
            ) : (
              <polygon points={clipPathPoints} fill="none" stroke="#d1d5db" strokeWidth="0.02" strokeDasharray="0.05, 0.05" />
            )}
          </svg>
        )}

        {/* DEVICE OVERLAYS */}
        {maskType === 'device' && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {element.deviceType === 'phone' && (
              <div style={{ width: '100%', height: '100%', border: '4px solid #374151', borderRadius: '24px', boxSizing: 'border-box' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '30%', height: '15px', backgroundColor: '#374151', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }} />
              </div>
            )}
            {element.deviceType === 'laptop' && (
              <div style={{ width: '100%', height: '100%', boxSizing: 'border-box' }}>
                <div style={{ width: '100%', height: '90%', border: '6px solid #4b5563', borderRadius: '8px 8px 0 0' }} />
                <div style={{ width: '120%', height: '10%', backgroundColor: '#9ca3af', position: 'absolute', bottom: 0, left: '-10%', borderRadius: '0 0 8px 8px' }} />
              </div>
            )}
            {element.deviceType === 'browser' && (
              <div style={{ width: '100%', height: '100%', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                <div style={{ width: '100%', height: '10%', backgroundColor: '#f9fafb', borderBottom: '1px solid #d1d5db', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CLIP DEFS */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
              {isPath ? (
                <path d={clipPathPoints} />
              ) : (
                <polygon points={clipPathPoints} />
              )}
            </clipPath>
          </defs>
        </svg>
      </div>
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
    <React.Fragment key={element.id}>
      {content}
      {isSelected && currentTool === 'select' && !isLocked && (
        renderSelectionHandles(element)
      )}
      {isLocked && selectedElements.has(element.id) && (
        <div
          style={{
            position: 'absolute',
            left: element.x + element.width / 2 - 15 / zoom,
            top: element.y + element.height / 2 - 15 / zoom,
            width: 30 / zoom,
            height: 30 / zoom,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: element.zIndex + 500,
            cursor: 'pointer',
            pointerEvents: 'auto'

          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleSelectElement(e, element.id);
          }}
          title="Click to select and unlock this element"
        >
          <Lock size={20 / zoom} color="#666" />
        </div>
      )}
      {element.comments?.length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: element.x + element.width - 14 / zoom,
            top: element.y - 14 / zoom,
            zIndex: element.zIndex + 600,
            backgroundColor: '#8b3dff',
            color: 'white',
            borderRadius: '50%',
            width: 28 / zoom + 'px',
            height: 28 / zoom + 'px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 ${4 / zoom}px ${12 / zoom}px rgba(139, 61, 255, 0.4)`,
            pointerEvents: 'auto',
            cursor: 'pointer',
            border: `${2 / zoom}px solid white`,
            transform: `rotate(${element.rotation || 0}deg)`,
            transformOrigin: `${-element.width / 2 + 14 / zoom}px ${element.height / 2 + 14 / zoom}px`
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onCommentClick && onCommentClick(element);
          }}
        >
          <MessageCircle size={14 / zoom} fill="white" />

        </div>
      )}
    </React.Fragment>
  );
};

export default CanvasElement;
