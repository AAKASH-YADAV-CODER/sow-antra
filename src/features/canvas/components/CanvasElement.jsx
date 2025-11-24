import React from 'react';
import { Lock } from 'lucide-react';
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
  handleTextEdit
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
    opacity: element.filters?.opacity ? element.filters.opacity.value / 100 : 1
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
          updateElement(element.id, { content: newContent });
          setTextEditing(null);
        }}
        onInput={(e) => {
          // Auto-adjust height based on content
          if (isEditing) {
            const newHeight = Math.max(element.fontSize * 2, e.target.scrollHeight);
            updateElement(element.id, { height: newHeight });
          }
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
            points={`${element.width/2},0 ${element.width},${element.height} 0,${element.height}`}
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
  } else if (element.type === 'line') {
    content = (
      <svg
        id={`element-${element.id}`}
        style={{...style}}
        onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
      >
        <line
          x1={0}
          y1={0}
          x2={element.width}
          y2={element.height}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
        />
      </svg>
    );
  } else if (element.type === 'arrow') {
    content = (
      <svg
        id={`element-${element.id}`}
        style={{...style}}
        onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
      >
        <defs>
          <marker
            id={`arrowhead-${element.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={element.stroke} />
          </marker>
        </defs>
        <line
          x1={0}
          y1={element.height / 2}
          x2={element.width - 10}
          y2={element.height / 2}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
          markerEnd={`url(#arrowhead-${element.id})`}
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
  } else if (element.type === 'hexagon') {
    const centerX = element.width / 2;
    const centerY = element.height / 2;
    const radius = Math.min(element.width, element.height) / 2;
    
    let path = '';
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 6;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      path += (i === 0 ? 'M' : 'L') + x + ',' + y;
    }
    path += 'Z';
    
    content = (
      <svg
        id={`element-${element.id}`}
        style={{...style}}
        onMouseDown={(e) => !isLocked && handleMouseDown(e, element.id)}
      >
        <path
          d={path}
          fill={getBackgroundStyle(element)}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
        />
      </svg>
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
        style={{...style}}
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
      {isLocked && (
        <div
          style={{
            position: 'absolute',
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            backgroundColor: 'rgba(0,0,0,0.1)',
            pointerEvents: 'auto',
            zIndex: element.zIndex + 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleSelectElement(e, element.id);
          }}
          title="Click to select and unlock this element"
        >
          <Lock size={20} color="#666" />
        </div>
      )}
    </React.Fragment>
  );
};

export default CanvasElement;
