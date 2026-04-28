import React, { memo } from 'react';
import { Lock, Image as ImageIcon, MessageCircle } from 'lucide-react';
import styles from '../../../styles/MainPage.module.css';

import { imageEffects } from '../../../utils/constants';
import VectorOverlay from './VectorOverlay';
import { generateSVGPath } from '../../../utils/bezier';
import { getVariableWidthPath } from '../../../utils/strokeUtils';

/**
 * CanvasElement Component
 * 
 * Renders individual canvas elements (text, shapes, images, stickers, drawings, groups)
 * with selection handles, effects, filters, and interaction handlers.
 * 
 * @param {Object} element - The element to render
  * @param { Set } selectedElements - Set of selected element IDs
    * @param { string | null } textEditing - ID of element currently being text - edited
      * @param { Set } lockedElements - Set of locked element IDs
        * @param { string } currentTool - Current tool being used('select', 'pen', etc.)
          * @param { string } currentLanguage - Current UI language
            * @param { string } textDirection - Text direction('ltr' or 'rtl')
              * @param { Array } fontFamilies - Available font families
                * @param { Object } supportedLanguages - Language configuration object
                  * @param { Array } stickerOptions - Available sticker options
                    * @param { Function } handleMouseDown - Mouse down handler for element interaction
                      * @param { Function } handleSelectElement - Handler for selecting elements
                        * @param { Function } updateElement - Handler for updating element properties
                          * @param { Function } setTextEditing - Handler for setting text editing state
                            * @param { Function } getCurrentPageElements - Get elements for current page
                              * @param { Function } getBackgroundStyle - Get background style for gradients
                                * @param { Function } getFilterCSS - Get filter CSS for element filters
                                  * @param { Function } getEffectCSS - Get effect CSS for element effects
                                    * @param { Function } parseCSS - Parse CSS string to object
                                      * @param { Function } renderSelectionHandles - Render selection handles for element
                                        * @param { Function } handleTextEdit - Handler for text editing
                                          * @param { number } zoom - Current canvas zoom level
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
  zoom = 1,
  currentTime = 0,
  isPlaying = false,
  pageStartTime = 0, // NEW: Start time of this page relative to video start
  frameEditing = null,
  setFrameEditing = () => { },
  penCursorPos = null
}) => {
  const isSelected = selectedElements.has(element.id);
  const isEditing = textEditing === element.id;
  const isLocked = lockedElements.has(element.id);
  const needsComplexScript = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'ur', 'ar', 'he'].includes(currentLanguage);
  const isRTL = textDirection === 'rtl';
  const elementRef = React.useRef(null);
  
  // -- ANIMATION PREVIEW STATE --
  const [isPreviewing, setIsPreviewing] = React.useState(false);
  const lastAppliedRef = React.useRef(element.animation?.lastApplied);

  // Trigger instant preview when animation is first applied
  React.useEffect(() => {
    if (element.animation?.lastApplied && element.animation.lastApplied !== lastAppliedRef.current) {
      setIsPreviewing(true);
      lastAppliedRef.current = element.animation.lastApplied;
      const duration = (element.animation.duration || 1) * 1000;
      const timer = setTimeout(() => setIsPreviewing(false), duration);
      return () => clearTimeout(timer);
    }
  }, [element.animation?.lastApplied, element.animation?.duration]);


  // Sync scrollHeight with state height
  React.useEffect(() => {
    if (element.type === 'text' && elementRef.current) {
      const newHeight = elementRef.current.scrollHeight;
      if (Math.abs(newHeight - (element.height || 0)) > 1) {
        updateElement(element.id, { height: newHeight }, false);
      }
    }
  }, [element.width, element.height, element.fontSize, element.fontFamily, element.lineHeight, element.letterSpacing, element.padding, element.content, updateElement, element.id, element.type]);

  // Sync content via innerText only when NOT editing AND when DOM is empty (e.g., after remount from key change)
  // This prevents cursor jumping during editing while ensuring text is visible after remount.
  React.useEffect(() => {
    if (element.type === 'text' && elementRef.current) {
      const domContent = elementRef.current.textContent || '';
      const stateContent = element.content || '';
      // Only sync if: not currently editing, OR the DOM content is empty (freshly mounted)
      if (!isEditing || domContent === '') {
        if (elementRef.current.innerText !== stateContent) {
          elementRef.current.innerText = stateContent;
        }
      }
    }
  }, [element.content, isEditing, element.type]);

  // Load frame image content dimensions if missing (Top-Level Hook)
  React.useEffect(() => {
    if (element.type === 'frame' && element.content && element.contentType === 'image' && (!element.contentWidth || !element.contentHeight)) {
      const img = new Image();
      img.onload = () => {
        // Avoid loop if component unmounts
        updateElement(element.id, {
          contentWidth: img.naturalWidth,
          contentHeight: img.naturalHeight
        });
      };
      img.src = element.content;
    }
  }, [element.type, element.content, element.contentType, element.contentWidth, element.contentHeight, updateElement, element.id]);

  // Adjust image aspect ratio if pending (e.g. newly added without explicit dimensions)
  React.useEffect(() => {
    if (element.type === 'image' && element.pendingAspectRatio && element.src) {
      const img = new Image();
      img.onload = () => {
        const aspect = img.naturalWidth / img.naturalHeight;
        // Keep width fixed (e.g. 200), adjust height
        const newHeight = element.width / aspect;

        updateElement(element.id, {
          height: newHeight,
          pendingAspectRatio: false
        });
      };
      img.src = element.src;
    } else if (element.type === 'video' && element.pendingAspectRatio && element.src) {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        const aspect = video.videoWidth / video.videoHeight;
        const newHeight = element.width / aspect;
        updateElement(element.id, {
          height: newHeight,
          pendingAspectRatio: false
        });
      };
      video.src = element.src;
    }
  }, [element.type, element.src, element.pendingAspectRatio, element.width, updateElement, element.id]);

  const videoRef = React.useRef(null);

  // Sync video playback and handle looping
  React.useEffect(() => {
    if (element.type === 'video' && videoRef.current) {
      const video = videoRef.current;
      
      if (isPlaying) {
        // Sync with timeline if playing
        const localTime = Math.max(0, currentTime - pageStartTime - (element.startTime || 0));
        // We only sync if the video is actually long enough, otherwise it loops naturally
        if (video.duration > 0) {
          if (Math.abs(video.currentTime - (localTime % video.duration)) > 0.2) {
            video.currentTime = localTime % video.duration;
          }
        }
        video.play().catch(err => console.log("Video play interrupted:", err));
      } else {
        // In edit mode, keep it playing for preview
        video.play().catch(err => console.log("Video play interrupted:", err));
      }
    }
  }, [element.type, isPlaying, currentTime, pageStartTime, element.startTime]);



  // Handle group element rendering

  // Animation Synchronization Logic (Canva-style)
  const animStartTime = element.startTime || 0;
  const animDuration = element.animation?.duration || 1;
  // Local time relative to element start is (global currentTime - page relative start - element offset)
  const animProgress = Math.max(0, currentTime - pageStartTime - animStartTime);
  const hasAnimation = !!(element.animation?.type && element.animation.type !== 'none');

  // Determine the real animation name (none = no animation assigned)
  const realAnimName = hasAnimation
    ? (element.animation.type === 'typewriter' ? 'wipe' : element.animation.type)
    : 'none';

  // Animation timing & play state logic:
  //
  // PREVIEW MODE (just clicked animation icon):
  //   - Run from t=0, play state = running
  //
  // PLAYING (video timeline running):
  //   - Sync to currentTime via negative delay, play state = running
  //
  // EDITING / PAUSED (default state):
  //   - Keep animation name set but paused AT THE END FRAME
  //   - delay = -animDuration forces fill-mode:both to show the 'to' (fully visible) state
  //   - This prevents elements from disappearing when animation is assigned but not playing

  let effectiveAnimName;
  let syncDelay;
  let animationPlayState;

  if (!hasAnimation) {
    // No animation — plain element, no CSS animation at all
    effectiveAnimName = 'none';
    syncDelay = '0s';
    animationPlayState = 'paused';
  } else if (isPreviewing) {
    // Instant preview from start
    effectiveAnimName = realAnimName;
    syncDelay = '0s';
    animationPlayState = 'running';
  } else if (isPlaying) {
    // Sync with timeline playhead
    effectiveAnimName = realAnimName;
    syncDelay = `-${animProgress}s`;
    animationPlayState = 'running';
  } else {
    // Editing / paused — always keep element FULLY VISIBLE:
    //
    // normal direction (Beginning/Middle entrance):
    //   Use negative delay to fast-forward to end frame (fully visible) ✅
    //
    // reverse direction (End exit):
    //   Use animationName='none' — no CSS animation applied at all.
    //   This prevents animation-fill-mode:forwards from freezing the element
    //   at the invisible exit state after a preview completes. ✅
    //   During isPreviewing or isPlaying the reverse animation fires correctly.
    const isReverse = element.animation?.animationDirection === 'reverse';
    if (isReverse) {
      // No animation in editing mode — element is naturally visible
      effectiveAnimName = 'none';
      syncDelay = '0s';
    } else {
      effectiveAnimName = realAnimName;
      syncDelay = `-${animDuration}s`;
    }
    animationPlayState = 'paused';
  }

  // -- LAYERED STYLE DEFINITIONS --
  // Layer 1: Outer (Position & Size) - Handles canvas placement
  const outerStyle = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    zIndex: element.zIndex,
    cursor: isLocked ? 'not-allowed' : (currentTool === 'select' ? 'move' : 'default'),
    visibility: element.hidden ? 'hidden' : 'visible',
    pointerEvents: 'auto',
  };

  // Layer 2: Animation (Playback & Sync) - Handles dynamic CSS animations
  const animationStyle = {
    width: '100%',
    height: '100%',
    animationName: effectiveAnimName,
    animationDuration: `${animDuration}s`,
    animationDelay: syncDelay,
    animationPlayState: animationPlayState,
    animationIterationCount: element.animation?.iteration || 1,
    animationFillMode: 'both',
    animationTimingFunction: (element.animation?.type === 'scrapbook') ? 'steps(5)' : 'ease',
    // 'normal' = entrance (plays forward), 'reverse' = exit (plays backward)
    animationDirection: element.animation?.animationDirection || 'normal',
    overflow: 'visible',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Layer 3: Inner (Visual Props) - Handles static transforms, opacity, and filters
  const innerStyle = {
    width: '100%',
    height: '100%',
    transform: element.transform3d
      ? `rotate(${element.rotation || 0}deg) perspective(${element.transform3d.perspective || 1000}px) rotateX(${element.transform3d.rotateX || 0}deg) rotateY(${element.transform3d.rotateY || 0}deg) scale(${element.transform3d.scale || 1})`
      : `rotate(${element.rotation || 0}deg)`,
    filter: element.filters ? getFilterCSS(element.filters) : 'none',
    opacity: element.opacity !== undefined
      ? element.opacity
      : (element.filters?.opacity ? element.filters.opacity.value / 100 : 1),
    mixBlendMode: element.blendMode || 'normal',
    WebkitBackfaceVisibility: (element.type === 'type_extrude' || element.transform3d) ? 'visible' : 'hidden',
    backfaceVisibility: (element.type === 'type_extrude' || element.transform3d) ? 'visible' : 'hidden',
    transformStyle: element.transform3d ? 'preserve-3d' : 'flat',
  };

  // Apply custom effects (like shadows or glows) to the inner style
  const effectCSS = getEffectCSS(element);
  if (effectCSS) {
    Object.assign(innerStyle, parseCSS(effectCSS));
  }

  // Easy Reflections Mode
  if (element.reflection?.enabled) {
    const { position = 'below', offset = 50, opacity = 50 } = element.reflection;
    const alpha = (opacity / 100).toFixed(2);
    const gapPx = offset / 2; // Map 0-100 to 0-50px gap

    let gradientFallback = '';
    if (position === 'below') {
      gradientFallback = `linear-gradient(to bottom, rgba(255, 255, 255, ${alpha}), transparent)`;
    } else if (position === 'above') {
      gradientFallback = `linear-gradient(to top, rgba(255, 255, 255, ${alpha}), transparent)`;
    } else if (position === 'left') {
      gradientFallback = `linear-gradient(to left, rgba(255, 255, 255, ${alpha}), transparent)`;
    } else if (position === 'right') {
      gradientFallback = `linear-gradient(to right, rgba(255, 255, 255, ${alpha}), transparent)`;
    }

    innerStyle.WebkitBoxReflect = `${position} ${gapPx}px ${gradientFallback}`;
  }



  let content;
  if (element.type === 'text') {
    const textElementStyle = {
      fontSize: (element.textPosition === 'superscript' || element.textPosition === 'subscript')
        ? element.fontSize * 0.65
        : element.fontSize,
      // verticalAlign doesn't work on block elements, using relative positioning instead
      position: 'relative',
      top: element.textPosition === 'superscript' ? '-0.3em' : (element.textPosition === 'subscript' ? '0.3em' : '0'),
      lineHeight: element.lineHeight || 1.4,
      letterSpacing: `${(element.letterSpacing || 0) / 1000}em`,
      fontFamily: needsComplexScript ? supportedLanguages[currentLanguage]?.font : element.fontFamily,
      fontWeight: element.fontWeight,
      fontStyle: element.fontStyle,
      textDecoration: element.textDecoration,
      textTransform: element.textTransform,
      color: innerStyle.color || element.color, // Respect effect color (like transparent) if set
      textAlign: isRTL ? 'right' : element.textAlign,
      cursor: isLocked ? 'not-allowed' : (isEditing ? 'text' : (currentTool === 'select' ? 'move' : 'default')),
      outline: 'none',
      userSelect: isEditing ? 'text' : 'none',
      minHeight: 10,
      width: '100%',
      height: 'auto',
      padding: `${element.padding || 4}px`,
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
      overflow: 'visible',
      wordBreak: 'break-word',
      fontKerning: element.fontKerning || 'auto',
      fontVariantLigatures: element.fontVariantLigatures || 'normal',
      background: element.fillType === 'gradient' ? getBackgroundStyle(element) : 'none',
      WebkitBackgroundClip: element.fillType === 'gradient' ? 'text' : 'border-box',
      WebkitTextFillColor: element.fillType === 'gradient' ? 'transparent' : 'inherit',
    };

    content = (
      <div
        key={`text-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={outerStyle}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isLocked) {
            if (handleSelectElement) handleSelectElement(e, element.id);
          } else {
            if (!isEditing) {
              handleMouseDown(e, element.id);
            }
          }
        }}
        onDoubleClick={(e) => {
          if (!isLocked && currentTool === 'select') {
            e.stopPropagation();
            setTextEditing(element.id);
          }
        }}
      >
        <div style={animationStyle}>
          <div
            style={{
              ...innerStyle,
              ...textElementStyle,
              height: element.height || 'auto',
              minHeight: (element.fontSize || 20) * 1.2,
              display: 'flex',
              alignItems: element.textAnchor === 'top' ? 'flex-start' : (element.textAnchor === 'bottom' ? 'flex-end' : 'center'),
              justifyContent: element.textAlign === 'center' ? 'center' : (element.textAlign === 'right' ? 'flex-end' : 'flex-start'),
              overflow: 'visible'
            }}
            className={`${styles.textElement || ''} text-element ${needsComplexScript ? 'complex-script' : ''} ${element.fillType === 'gradient' ? 'text-gradient' : ''}`}
          >
        {/* Background Effect Layer */}
        {element.textEffect === 'background' && (
          <div
            style={{
              position: 'absolute',
              inset: `-${(element.textEffectSettings?.spread || 0) / 4}px`,
              backgroundColor: element.textEffectSettings?.color || '#ffff00',
              borderRadius: `${(element.textEffectSettings?.roundness || 0)}px`,
              opacity: (element.textEffectSettings?.transparency ?? 100) / 100,
              zIndex: -1,
              pointerEvents: 'none'
            }}
          />
        )}

        <div
          ref={elementRef}
          contentEditable={!isLocked && isEditing}
          suppressContentEditableWarning={true}
          style={{
            ...textElementStyle,
            position: 'relative',
            left: 0,
            top: 0,
            transform: element.textShape === 'curve' ? `perspective(100px) rotateX(${(element.textShapeSettings?.curve || 0) / 5}deg)` : 'none',
            zIndex: 1,
            width: '100%',
            height: '100%',
            background: 'none',
            border: 'none',
            outline: 'none',
            padding: 0
          }}
          onBlur={(e) => {
            const newContent = e.target.textContent || '';
            const newHeight = Math.max(element.fontSize * 2, e.target.scrollHeight);
            updateElement(element.id, { content: newContent, height: newHeight });
            setTextEditing(null);
          }}
          onInput={(e) => {
            const target = e.target;
            const newHeight = target.scrollHeight;
            const updates = {
              height: newHeight,
              content: target.innerText
            };

            // Auto-Width Logic: Fit box to content width
            if (element.isAutoWidth) {
              // We need a slight delay or use a temporary container to get the true width
              // but scrollWidth usually works if width is 'auto' or 'max-content'
              const newWidth = target.scrollWidth;
              updates.width = newWidth + 2; // small buffer
            }

            updateElement(element.id, updates, false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && e.target.textContent === '') {
              e.preventDefault();
            }
          }}
        >
          {/* Render content as children ONLY when not editing, to prevent React from resetting cursor position.
              When editing, the browser manages the DOM content natively via contentEditable.
              This ensures text is always visible on first render and after key-based remounts (e.g., on animation apply). */}
          {!isEditing ? (element.content || '') : null}
        </div>
      </div>
    </div>
  </div>
    );
  } else if (element.type === 'text_studio') {
    const rad = (45 * Math.PI) / 180;
    const depth = element.extrudeDepth || 15;
    let textShadow = '';
    
    // Extrusion solid shadow
    for (let i = 1; i <= depth; i++) {
        const sx = Math.cos(rad) * i;
        const sy = Math.sin(rad) * i;
        textShadow += `${sx}px ${sy}px 0px ${element.extrudeColor || '#FFAC00'}, `;
    }
    
    // Drop shadow (blur)
    if (element.shadowEnabled !== false) {
        const sx = Math.cos(rad) * (depth + (element.shadowOffset || 10));
        const sy = Math.sin(rad) * (depth + (element.shadowOffset || 10));
        textShadow += `${sx}px ${sy}px ${element.shadowBlur || 15}px rgba(0,0,0,${element.shadowOpacity || 0.3})`;
    } else {
        if (textShadow.length > 0) {
            textShadow = textShadow.slice(0, -2);
        }
    }

    const textStudioStyle = {
      ...outerStyle,
      ...innerStyle,
      display: 'flex',
      alignItems: 'center',
      justifyContent: element.textAlign === 'center' ? 'center' : (element.textAlign === 'right' ? 'flex-end' : 'flex-start'),
      padding: '20px', // Prevent shadow clipping inside bounding box
      overflow: 'visible'
    };

    const textStyle = {
      fontFamily: element.fontFamily || 'Inter',
      fontSize: element.fontSize || 64,
      fontWeight: element.fontWeight || '900',
      color: element.color || '#FFFFFF',
      textAlign: element.textAlign || 'center',
      letterSpacing: `${element.letterSpacing || 0}px`,
      lineHeight: element.lineHeight || 1.2,
      textShadow: textShadow,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      width: '100%'
    };

    content = (
      <div
        key={`textstudio-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={outerStyle}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isLocked) {
            if (handleSelectElement) handleSelectElement(e, element.id);
          } else {
            handleMouseDown(e, element.id);
          }
        }}
      >
        <div style={animationStyle}>
          <div style={{ ...innerStyle, ...textStudioStyle }}>
            <div style={textStyle}>
              {element.content}
            </div>
          </div>
        </div>
      </div>
    );
  } else if (element.type === 'rectangle') {
    const rectangleStyle = {
      ...(element.fillType === 'gradient' 
        ? { background: getBackgroundStyle(element) } 
        : { backgroundColor: element.fillType === 'solid' || !element.fillType ? (element.fill || '#cbd5e1') : 'transparent' }),
      border: `${element.strokeWidth}px solid ${element.stroke}`,
      borderRadius: element.borderRadius,
    };

    content = (
      <div
        key={`rect-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={outerStyle}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isLocked) {
            if (handleSelectElement) handleSelectElement(e, element.id);
          } else {
            handleMouseDown(e, element.id);
          }
        }}
      >
        <div style={animationStyle}>
          <div
            className={`${styles.shapeElement || ''} ${element.fillType === 'gradient' ? 'gradient-fix' : ''}`}
            style={{ ...innerStyle, ...rectangleStyle }}
          />
        </div>
      </div>
    );
  } else if (element.type === 'circle') {
    const circleStyle = {
      ...(element.fillType === 'gradient' 
        ? { background: getBackgroundStyle(element) } 
        : { backgroundColor: element.fillType === 'solid' || !element.fillType ? (element.fill || '#cbd5e1') : 'transparent' }),
      border: `${element.strokeWidth}px solid ${element.stroke}`,
      borderRadius: '50%',
    };

    content = (
      <div
        key={`circle-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={outerStyle}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isLocked) {
            if (handleSelectElement) handleSelectElement(e, element.id);
          } else {
            handleMouseDown(e, element.id);
          }
        }}
      >
        <div style={animationStyle}>
          <div
            className={`${styles.shapeElement || ''} ${element.fillType === 'gradient' ? 'gradient-fix' : ''}`}
            style={{ ...innerStyle, ...circleStyle }}
          />
        </div>
      </div>
    );
  } else if (element.type === 'triangle') {
    const clipPathId = `triangle-clip-${element.id}`;


    const fillStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      ...(element.fillType === 'gradient' 
        ? { background: getBackgroundStyle(element) } 
        : {}), // Solid fills are handled directly by the SVG polygon
      clipPath: `url(#${clipPathId})`,
      WebkitClipPath: `url(#${clipPathId})`
    };

    content = (
      <div
        key={`triangle-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={outerStyle}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isLocked) {
            if (handleSelectElement) handleSelectElement(e, element.id);
          } else {
            handleMouseDown(e, element.id);
          }
        }}
      >
        <div style={animationStyle}>
          <div
            className={`${styles.shapeElement || ''}`}
            style={{ ...innerStyle, width: element.width, height: element.height }}
          >
            {/* Fill layer (Gradients only, solid fills drawn by SVG) */}
            {element.fillType === 'gradient' && (
              <div
                className="gradient-fix"
                style={fillStyle}
              />
            )}

            {/* Stroke layer using SVG */}
            <svg
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
              viewBox={`0 0 ${element.width} ${element.height}`}
              preserveAspectRatio="none"
            >
              <defs>
                <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
                  <polygon points="0.5,0 1,1 0,1" />
                </clipPath>
              </defs>
              <polygon
                points={`${element.width / 2},0 ${element.width},${element.height} 0,${element.height}`}
                fill={element.fillType === 'gradient' ? 'none' : (element.fill || '#cbd5e1')}
                stroke={element.stroke || '#000000'}
                strokeWidth={element.strokeWidth ?? 2}
              />
            </svg>
          </div>
        </div>
      </div>
    );
  } else if (element.type === 'image') {
    const isCropping = element.isCropping;

    const imageContainerStyle = {
      overflow: element.transform3d ? 'visible' : 'hidden',
      borderRadius: element.borderRadius,
      pointerEvents: 'auto',
      userSelect: 'none',
      border: element.strokeWidth > 0 ? `${element.strokeWidth}px solid ${element.stroke}` : 'none'
    };

    const imgStyle = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transform: `scale(${element.flipX ? -1 : 1}, ${element.flipY ? -1 : 1})`,
      pointerEvents: 'none', // Let container handle events
      borderRadius: element.borderRadius, // Ensure radius is applied to image when overflow is visible
      maxWidth: 'none',
      maxHeight: 'none'
    };

    // Crop Logic - Percentage Based (t, b, l, r)
    if (element.crop) {
      const { t = 0, b = 0, l = 0, r = 0 } = element.crop;
      const visibleW = 1 - l - r;
      const visibleH = 1 - t - b;

      imgStyle.width = `${100 / Math.max(0.01, visibleW)}%`;
      imgStyle.height = `${100 / Math.max(0.01, visibleH)}%`;

      // Translation is relative to the image tag's own size (the uncropped size)
      const translateX = -l * 100;
      const translateY = -t * 100;

      imgStyle.transform = `scale(${element.flipX ? -1 : 1}, ${element.flipY ? -1 : 1}) translate(${translateX}%, ${translateY}%)`;
      imgStyle.objectFit = 'fill';
    }

    // Adjustments Filter
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

    // Shadow Logic (Glow, Drop, Outline)
    const shadowType = element.shadowType || 'none';
    const shadowSettings = element.shadowSettings || {};
    const shadowFilterId = `shadow-filter-${element.id}`;
    let shadowFilterSVG = null;
    let shadowFilterCSS = '';

    if (shadowType !== 'none') {
      const { size = 0, blur = 0, angle = 0, distance = 0, color = '#000000', intensity = 50 } = shadowSettings;
      const opacity = intensity / 100;

      // Note: Filters need to handle "SourceAlpha" to properly shadow transparent images
      if (shadowType === 'glow') {
        // Glow: Blur + Dilate (Size) - Simulated via morphology if supported, or just blur
        // Note: Dilate on alpha can be blocky. We smooth it with blur.
        // Filter Sequence: SourceAlpha -> Dilate (Size) -> Blur -> Colorize -> Merge
        shadowFilterSVG = (
          <filter id={shadowFilterId} x="-100%" y="-100%" width="300%" height="300%">
            <feMorphology in="SourceAlpha" operator="dilate" radius={size ? size / 2 : 0} result="DILATED" />
            <feGaussianBlur in="DILATED" stdDeviation={blur ? blur / 2 : 0} result="BLURRED" />
            <feFlood floodColor={color} floodOpacity={opacity} result="COLOR" />
            <feComposite in="COLOR" in2="BLURRED" operator="in" result="SHADOW" />
            <feMerge>
              <feMergeNode in="SHADOW" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        );
      } else if (shadowType === 'drop') {
        const rad = (angle * Math.PI) / 180;
        // Canva's angle might be different. 0 is usually right.
        // dx = distance * cos(rad), dy = -distance * sin(rad) (CSS coords y is down)
        // Let's assume standard CSS angle: 0deg is up? No, box-shadow 0 is right?
        // Usually 90deg is down.
        // We use standard trig: 0 is right, 90 is down.
        const dx = distance * Math.cos(rad);
        const dy = distance * Math.sin(rad);

        shadowFilterSVG = (
          <filter id={shadowFilterId} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceAlpha" stdDeviation={blur ? blur / 3 : 0} result="BLURRED" />
            <feOffset in="BLURRED" dx={dx} dy={dy} result="OFFSET" />
            <feFlood floodColor={color} floodOpacity={opacity} result="COLOR" />
            <feComposite in="COLOR" in2="OFFSET" operator="in" result="SHADOW" />
            <feMerge>
              <feMergeNode in="SHADOW" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        );
      } else if (shadowType === 'outline') {
        shadowFilterSVG = (
          <filter id={shadowFilterId} x="-100%" y="-100%" width="300%" height="300%">
            <feMorphology in="SourceAlpha" operator="dilate" radius={size ? size / 1 : 0} result="DILATED" />
            <feFlood floodColor={color} floodOpacity={opacity} result="COLOR" />
            <feComposite in="COLOR" in2="DILATED" operator="in" result="OUTLINE" />
            <feMerge>
              <feMergeNode in="OUTLINE" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        );
      }
      if (shadowType === 'glow' || shadowType === 'drop' || shadowType === 'outline') {
        shadowFilterCSS = `url(#${shadowFilterId})`;
      }
    }

    const finalFilter = `${effectFilter} ${adjustFilter} ${shadowFilterCSS}`.trim();
    const intensity = element.filterIntensity !== undefined ? element.filterIntensity / 100 : 1;
    const showOverlay = intensity > 0 && intensity < 1 && !!effectFilter;

    // Geometric Shadow Logic (Curved, Lift, Angled, Backdrop)
    let geometricShadow = null;
    if (['curved', 'page_lift', 'angled', 'backdrop'].includes(shadowType)) {
      const { curve = 50, blur = 0, angle = 0, distance = 0, color = '#000000', intensity = 50 } = shadowSettings;
      const opacity = intensity / 100;

      if (shadowType === 'curved') {
        // Curved shadow: Ellipse div with blur to match export cy/rh logic
        const rh = 5 + (curve / 10);
        geometricShadow = (
          <div style={{
            position: 'absolute', bottom: `${-rh - (distance / 4)}px`, left: '15%', width: '70%', height: `${rh * 2}px`,
            borderRadius: '50%', backgroundColor: color,
            filter: `blur(${blur / 2}px)`,
            opacity: opacity, zIndex: -1, pointerEvents: 'none'
          }} />
        );
      } else if (shadowType === 'page_lift') {
        const liftAngle = 1 + (curve / 20); // Scale 1-6deg
        // yOffset moves shadows DOWN
        const yOffset = -5 - (distance / 4);
        geometricShadow = (
          <>
            <div style={{
              position: 'absolute', bottom: `${yOffset}px`, left: '5px', width: '45%', height: '20%', maxWidth: '300px',
              boxShadow: `0 10px ${blur}px ${color}`, transform: `rotate(-${liftAngle}deg) skew(-${liftAngle + 2}deg)`,
              opacity: opacity, zIndex: -1, pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute', bottom: `${yOffset}px`, right: '5px', width: '45%', height: '20%', maxWidth: '300px',
              boxShadow: `0 10px ${blur}px ${color}`, transform: `rotate(${liftAngle}deg) skew(${liftAngle + 2}deg)`,
              opacity: opacity, zIndex: -1, pointerEvents: 'none'
            }} />
          </>
        );
      } else if (shadowType === 'angled') {
        const rad = (angle * Math.PI) / 180;
        const tx = distance * Math.cos(rad);
        const ty = distance * Math.sin(rad);
        geometricShadow = (
          <div style={{
            position: 'absolute', inset: 0, backgroundColor: color, transformOrigin: 'center',
            transform: `skewX(${angle - 45}deg) translate(${tx}px, ${ty}px)`,
            filter: `blur(${blur}px)`, opacity: opacity, zIndex: -1, borderRadius: element.borderRadius, pointerEvents: 'none'
          }} />
        );
      } else if (shadowType === 'backdrop') {
        const rad = ((angle || -45) * Math.PI) / 180;
        const x = (distance || 20) * Math.cos(rad);
        const y = (distance || 20) * Math.sin(rad);
        geometricShadow = (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: color,
            transform: `translate(${x}px, ${y}px)`, opacity: opacity, zIndex: -1, borderRadius: element.borderRadius, pointerEvents: 'none'
          }} />
        );
      }

    }


    // Override overflow for shadows (geometric or SVG) to be visible outside, if NOT cropping
    if ((geometricShadow || (shadowType !== 'none' && !element.crop))) {
      imageContainerStyle.overflow = 'visible';
    }

    content = (
      <div
        key={`image-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={outerStyle}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isLocked) {
            if (handleSelectElement) handleSelectElement(e, element.id);
          } else {
            e.preventDefault();
            handleMouseDown(e, element.id);
          }
        }}
        onClick={(e) => {
          if (isLocked) {
            e.stopPropagation();
            handleSelectElement(e, element.id);
          } else {
            e.stopPropagation();
            handleSelectElement(e, element.id);
          }
        }}
      >
        <div style={animationStyle}>
          <div
            style={{ ...innerStyle, ...imageContainerStyle }}
            className={styles.imageElement || ''}
          >
            {/* Geometric Shadow Layer */}
            {geometricShadow}

            {/* Base Image (Background) - Visible if overlaying or if no effect AND no shadow, or intensity 0 */}
            {(showOverlay || (!effectFilter && !shadowFilterCSS) || intensity === 0) && (
              <img
                src={element.src}
                alt=""
                style={{
                  ...imgStyle,
                  filter: adjustFilter, // Only adjustments, no effect
                  position: showOverlay ? 'absolute' : (imgStyle.position || 'relative'),
                  top: showOverlay ? 0 : 'auto',
                  left: showOverlay ? 0 : 'auto'
                }}
                draggable={false}
              />
            )}

            {/* Filtered Image (Overlay) - Visible if intensity > 0 or if there's a shadow */}
            {(showOverlay || (!!effectFilter && intensity === 1) || !!shadowFilterCSS) && (
              <img
                src={element.src}
                alt=""
                style={{
                  ...imgStyle,
                  filter: finalFilter, // Adjustments + Effect
                  opacity: intensity,
                  position: showOverlay ? 'absolute' : (imgStyle.position || 'relative'),
                  top: showOverlay ? 0 : 'auto',
                  left: showOverlay ? 0 : 'auto'
                }}
                draggable={false}
              />
            )}
            {/* Crop Overlay */}
            {isCropping && (
              <div className="absolute inset-0 border-2 border-white pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] z-10">
                <div className="absolute top-1/3 left-0 w-full h-px bg-white/50" />
                <div className="absolute top-2/3 left-0 w-full h-px bg-white/50" />
                <div className="absolute left-1/3 top-0 h-full w-px bg-white/50" />
                <div className="absolute left-2/3 top-0 h-full w-px bg-white/50" />
              </div>
            )}

            {/* SVG Filter Definition */}
            {shadowFilterSVG && (
              <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', visibility: 'visible' }}>
                <defs>
                  {shadowFilterSVG}
                </defs>
              </svg>
            )}
          </div>
        </div>
      </div>
    );
  } else if (element.type === 'line' || element.type === 'line_double') {
    content = (
      <div
        key={`line-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={outerStyle}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isLocked) {
            if (handleSelectElement) handleSelectElement(e, element.id);
          } else {
            handleMouseDown(e, element.id);
          }
        }}
      >
        <div style={animationStyle}>
          <div style={{ ...innerStyle, overflow: 'visible' }}>
            <svg
              width="100%"
              height="100%"
              style={{ overflow: 'visible' }}
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
          </div>
        </div>
      </div>
    );
  } else if (element.type === 'arrow' || element.type === 'arrow_double') {
    const isArrow = element.type === 'arrow';
    const isDoubleArrow = element.type === 'arrow_double';

    content = (
      <div
        key={`arrow-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={outerStyle}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isLocked) {
            if (handleSelectElement) handleSelectElement(e, element.id);
          } else {
            handleMouseDown(e, element.id);
          }
        }}
      >
        <div style={animationStyle}>
          <div style={{ ...innerStyle, overflow: 'visible' }}>
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${element.width} ${element.height}`}
              preserveAspectRatio="none"
              style={{ overflow: 'visible' }}
            >
              {(isDoubleArrow || isArrow) && (
                <defs>
                  {isDoubleArrow && (
                    <marker
                      id={`arrowhead-start-${element.id}`}
                      markerWidth="10"
                      markerHeight="7"
                      refX="0"
                      refY="3.5"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <polygon points="10 0, 0 3.5, 10 7" fill={element.stroke || '#000000'} />
                    </marker>
                  )}
                  <marker
                    id={`arrowhead-end-${element.id}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill={element.stroke || '#000000'} />
                  </marker>
                </defs>
              )}
              <line
                x1={0}
                y1={element.height / 2}
                x2={element.width}
                y2={element.height / 2}
                stroke={element.stroke || '#000000'}
                strokeWidth={element.strokeWidth || 2}
                strokeDasharray={element.strokeDasharray}
                strokeLinecap="round"
                markerStart={isDoubleArrow ? `url(#arrowhead-start-${element.id})` : undefined}
                markerEnd={isArrow || isDoubleArrow ? `url(#arrowhead-end-${element.id})` : undefined}
              />
            </svg>
          </div>
        </div>
      </div>
    );
  } else if (element.type === 'star') {
    const clipPathId = `star-clip-${element.id}`;
    const points = element.points || 5;

    const strokeW = element.strokeWidth || 0;
    const innerRadiusRatio = element.innerRadius || 0.4;
    
    // Calculate raw points
    const rawPoints = [];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? 1 : innerRadiusRatio;
      const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      rawPoints.push({ x, y });
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    
    // Generate clipPath points (normalized 0..1)
    let clipPathPoints = '';
    rawPoints.forEach((pt) => {
      const nx = (pt.x - minX) / rangeX;
      const ny = (pt.y - minY) / rangeY;
      clipPathPoints += nx + ',' + ny + ' ';
    });

    const fillStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: (element.fillType === 'solid' || !element.fillType) ? (element.fill || '#cbd5e1') : 'transparent',
      background: element.fillType === 'gradient' ? getBackgroundStyle(element) : undefined,
      clipPath: `url(#${clipPathId})`,
      WebkitClipPath: `url(#${clipPathId})`
    };

    // Create SVG path for stroke (matching clipPath proportions)
    const pad = strokeW / 2;
    const innerW = Math.max(0, element.width - strokeW);
    const innerH = Math.max(0, element.height - strokeW);

    let strokePath = '';
    rawPoints.forEach((pt, i) => {
      const nx = (pt.x - minX) / rangeX;
      const ny = (pt.y - minY) / rangeY;
      const px = pad + nx * innerW;
      const py = pad + ny * innerH;
      strokePath += (i === 0 ? 'M' : 'L') + px + ',' + py;
    });
    strokePath += 'Z';

    content = (
      <div
        key={`star-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={outerStyle}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isLocked) {
            if (handleSelectElement) handleSelectElement(e, element.id);
          } else {
            handleMouseDown(e, element.id);
          }
        }}
      >
        <div style={animationStyle}>
          <div
            className={`${styles.shapeElement || ''}`}
            style={{ ...innerStyle, width: element.width, height: element.height }}
          >
            {/* Fill layer (Only for gradient) */}
            {element.fillType === 'gradient' && (
              <div
                className="gradient-fix"
                style={fillStyle}
              />
            )}

            {/* Stroke and Solid Fill layer using SVG */}
            <svg
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
              viewBox={`0 0 ${element.width} ${element.height}`}
              preserveAspectRatio="none"
            >
              {element.fillType === 'gradient' && (
                <defs>
                  <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
                    <polygon points={clipPathPoints} />
                  </clipPath>
                </defs>
              )}
              <path
                d={strokePath}
                fill={element.fillType === 'gradient' ? 'none' : (element.fill || '#cbd5e1')}
                stroke={element.stroke || '#000000'}
                strokeWidth={element.strokeWidth ?? 2}
              />
            </svg>
          </div>
        </div>
      </div>
    );
  } else if (element.type === 'regularPolygon') {
    const sides = element.sides || 6;
    const strokeW = element.strokeWidth || 0;
    
    // Calculate raw points to find true bounding box
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

    let path = '';
    rawPoints.forEach((pt, i) => {
      const nx = (pt.x - minX) / rangeX;
      const ny = (pt.y - minY) / rangeY;
      const px = pad + nx * innerW;
      const py = pad + ny * innerH;
      path += (i === 0 ? 'M' : 'L') + px + ',' + py;
    });
    path += 'Z';

    const polygonStyle = {
      ...innerStyle,
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
    rawPoints.forEach((pt) => {
      const nx = (pt.x - minX) / rangeX;
      const ny = (pt.y - minY) / rangeY;
      clipPoints += nx + ',' + ny + ' ';
    });

    content = (
      <div
        key={`poly-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={outerStyle}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isLocked) {
            if (handleSelectElement) handleSelectElement(e, element.id);
          } else {
            handleMouseDown(e, element.id);
          }
        }}
      >
        <div style={animationStyle}>
          <div
            className={`${styles.shapeElement || ''}`}
            style={{ ...innerStyle, ...polygonStyle }}
          >
            {/* Fill layer (Only for gradient) */}
            {element.fillType === 'gradient' && (
              <div
                className="gradient-fix"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: getBackgroundStyle(element),
                  clipPath: `url(#${clipPathId})`,
                  WebkitClipPath: `url(#${clipPathId})`
                }}
              />
            )}

            {/* Stroke and Solid Fill layer */}
            <svg
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
              viewBox={`0 0 ${element.width} ${element.height}`}
              preserveAspectRatio="none"
            >
              {element.fillType === 'gradient' && (
                <defs>
                  <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
                    <polygon points={clipPoints} />
                  </clipPath>
                </defs>
              )}
              <path
                d={path}
                fill={element.fillType === 'gradient' ? 'none' : (element.fill || '#cbd5e1')}
                stroke={element.stroke || '#000000'}
                strokeWidth={element.strokeWidth ?? 2}
              />
            </svg>
          </div>
        </div>
      </div>
    );
  } else if (element.type === 'drawing' && element.path && element.path.length > 1) {
    // Use the variable-width path generator for pressure-sensitive final rendering
    const pathData = getVariableWidthPath(element.path, element.strokeWidth || 4);

    content = (
      <div
        key={`drawing-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={outerStyle}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isLocked) {
            if (handleSelectElement) handleSelectElement(e, element.id);
          } else {
            handleMouseDown(e, element.id);
          }
        }}
      >
        <div style={animationStyle}>
          <div style={{ ...innerStyle, overflow: 'visible' }}>
            <svg
              style={{ overflow: 'visible' }}
              viewBox={`0 0 ${element.width} ${element.height}`}
              preserveAspectRatio="none"
              width="100%"
              height="100%"
            >
              <path
                d={pathData}
                fill={element.stroke || '#000000'}
                stroke="none"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  } else if (['trapezoid', 'parallelogram', 'triangle_right', 'cross', 'speech_bubble', 'speech_bubble_round', 'thought_bubble', 'callout', 'location', 'shield', 'banner', 'ribbon', 'search', 'diamond', 'heart'].includes(element.type)) {
    const w = element.width;
    const h = element.height;
    const clipPathId = `path-clip-${element.id}`;

    // SVG Path implementation for better curves
    let svgPath = '';

    // NOTE: For curvy shapes like Cloud/Heart, we use the SVG Path for BOTH 
    // the stroke AND the clip-path. This ensures perfect match and smooth curves.

    if (element.type === 'trapezoid') {
      svgPath = `M ${w * 0.2},0 L ${w * 0.8},0 L ${w},${h} L 0,${h} Z`;
    } else if (element.type === 'heart') {
      // Smooth Heart Shape
      svgPath = `M ${w * 0.5},${h * 0.3} 
                  C ${w * 0.5},${h * 0.1} ${w * 0.35},${0} ${w * 0.25},${0} 
                  C ${w * 0.1},${0} ${0},${h * 0.15} ${0},${h * 0.3} 
                  C ${0},${h * 0.55} ${w * 0.25},${h * 0.75} ${w * 0.5},${h} 
                  C ${w * 0.75},${h * 0.75} ${w},${h * 0.55} ${w},${h * 0.3} 
                  C ${w},${h * 0.15} ${w * 0.9},${0} ${w * 0.75},${0} 
                  C ${w * 0.65},${0} ${w * 0.5},${h * 0.1} ${w * 0.5},${h * 0.3} Z`;
    } else if (element.type === 'parallelogram') {
      svgPath = `M ${w * 0.25},0 L ${w},0 L ${w * 0.75},${h} L 0,${h} Z`;
    } else if (element.type === 'triangle_right') {
      svgPath = `M 0,0 L 0,${h} L ${w},${h} Z`;
    } else if (element.type === 'diamond') {
      svgPath = `M ${w * 0.5},0 L ${w},${h * 0.5} L ${w * 0.5},${h} L 0,${h * 0.5} Z`;
    } else if (element.type === 'cross') {
      const t = Math.min(w, h) * 0.3;
      const cx = w / 2, cy = h / 2;
      svgPath = `M ${cx - t / 2},0 L ${cx + t / 2},0 L ${cx + t / 2},${cy - t / 2} L ${w},${cy - t / 2} L ${w},${cy + t / 2} L ${cx + t / 2},${cy + t / 2} L ${cx + t / 2},${h} L ${cx - t / 2},${h} L ${cx - t / 2},${cy + t / 2} L 0,${cy + t / 2} L 0,${cy - t / 2} L ${cx - t / 2},${cy - t / 2} Z`;
    } else if (element.type === 'speech_bubble') {
      svgPath = `M 0,0 L ${w},0 L ${w},${h * 0.8} L ${w * 0.6},${h * 0.8} L ${w * 0.2},${h} L ${w * 0.3},${h * 0.8} L 0,${h * 0.8} Z`;
    } else if (element.type === 'speech_bubble_round') {
      svgPath = `M ${w * 0.5},0 C ${w * 0.8},0 ${w},${h * 0.2} ${w},${h * 0.4} C ${w},${h * 0.6} ${w * 0.8},${h * 0.8} ${w * 0.5},${h * 0.8} L ${w * 0.3},${h} L ${w * 0.4},${h * 0.8} C ${w * 0.2},${h * 0.8} 0,${h * 0.6} 0,${h * 0.4} C 0,${h * 0.2} ${w * 0.2},0 ${w * 0.5},0 Z`;
    } else if (element.type === 'thought_bubble' || element.type === 'cloud') {
      // Improved Cloud/Thought Bubble Path (Smooth Curves)
      // M 0.25,0.3 C 0.1,0.3 0,0.45 0,0.6 C 0,0.75 0.1,0.9 0.25,0.9 L 0.75,0.9 C 0.9,0.9 1,0.75 1,0.6 C 1,0.45 0.85,0.3 0.7,0.3 C 0.7,0.15 0.55,0 0.4,0 C 0.25,0 0.25,0.15 0.25,0.3 Z
      // Using generic cloud shape
      // To support "Thought Bubble" tail, we can add it conditionally


      svgPath = `M ${0.25 * w},${0.3 * h}
          C ${0.1 * w},${0.3 * h} ${0 * w},${0.45 * h} ${0 * w},${0.6 * h}
          C ${0 * w},${0.75 * h} ${0.1 * w},${0.9 * h} ${0.25 * w},${0.9 * h}
          L ${0.75 * w},${0.9 * h}
          C ${0.9 * w},${0.9 * h} ${1 * w},${0.75 * h} ${1 * w},${0.6 * h}
          C ${1 * w},${0.45 * h} ${0.85 * w},${0.3 * h} ${0.7 * w},${0.3 * h}
          C ${0.7 * w},${0.15 * h} ${0.55 * w},${0 * h} ${0.4 * w},${0 * h}
          C ${0.25 * w},${0 * h} ${0.25 * w},${0.15 * h} ${0.25 * w},${0.3 * h} Z`;

      if (element.type === 'thought_bubble') {
        // Add thought bubbles as separate circles on top? NO, must be one path for clip.
        // Let's stick to the cloud main body for now, or append circles to path?
        // Appending disjoint subpaths works fine in SVG paths!
        // Small bubbles:
        svgPath += ` M ${w * 0.1},${h * 0.9} A ${w * 0.05},${w * 0.05} 0 1,0 ${w * 0.2},${h * 0.95}`; // Bubble 1
        svgPath += ` M ${0},${h} A ${w * 0.03},${w * 0.03} 0 1,0 ${w * 0.06},${h}`; // Bubble 2
      }
    } else if (element.type === 'shield') {
      svgPath = `M 0,0 L ${w},0 L ${w},${h * 0.6} L ${w * 0.5},${h} L 0,${h * 0.6} Z`;
    } else if (element.type === 'banner') {
      svgPath = `M 0,0 L ${w},0 L ${w * 0.8},${h * 0.5} L ${w},${h} L 0,${h} L ${w * 0.2},${h * 0.5} Z`;
    } else if (element.type === 'ribbon') {
      svgPath = `M ${w * 0.1},0 L ${w * 0.9},0 L ${w},${h * 0.2} L ${w},${h * 0.8} L ${w * 0.9},${h} L ${w * 0.1},${h} L 0,${h * 0.8} L 0,${h * 0.2} Z`;
    } else if (element.type === 'location') {
      svgPath = `M ${w / 2},${h} C ${w / 2},${h} 0,${h * 0.6} 0,${h * 0.35} A ${w / 2},${w / 2} 0 1,1 ${w},${h * 0.35} C ${w},${h * 0.6} ${w / 2},${h} ${w / 2},${h} Z`;
    } else if (element.type === 'callout') {
      svgPath = `M 0,0 L ${w},0 L ${w},${h * 0.8} L ${w * 0.4},${h * 0.8} L ${w * 0.3},${h} L ${w * 0.2},${h * 0.8} L 0,${h * 0.8} Z`;
    } else if (element.type === 'search') {
      // Loupe
      svgPath = `M ${w * 0.4},${h * 0.8} L ${w * 0.8},${h * 0.8} L ${w},${h} L ${w * 0.9},${h * 1} L ${w * 0.7},${h * 0.8} A ${w * 0.4},${h * 0.4} 0 1,1 ${w * 0.4},0 A ${w * 0.4},${h * 0.4} 0 1,1 ${w * 0.4},${h * 0.8} Z`;
    }

    content = (
      <div
        key={`shape-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={outerStyle}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isLocked) {
            if (handleSelectElement) handleSelectElement(e, element.id);
          } else {
            handleMouseDown(e, element.id);
          }
        }}
      >
        <div style={animationStyle}>
          <div
            className={`${styles.shapeElement || ''}`}
            style={{ ...innerStyle, backgroundColor: 'transparent', border: 'none' }}
          >
            {/* Fill layer (Gradients only, solid fills drawn by SVG to prevent clip-path animation bugs) */}
            {element.fillType === 'gradient' && (
              <div
                className="gradient-fix"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: getBackgroundStyle(element),
                  clipPath: `url(#${clipPathId})`,
                  WebkitClipPath: `url(#${clipPathId})`
                }}
              />
            )}

            {/* Stroke layer */}
            <svg
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
              viewBox={`0 0 ${w} ${h}`}
              preserveAspectRatio="none"
            >
              <defs>
                <clipPath id={clipPathId} clipPathUnits="userSpaceOnUse">
                  <path d={svgPath} />
                </clipPath>
              </defs>
              <path
                d={svgPath}
                fill={element.fillType === 'gradient' ? 'none' : (element.fill || '#cbd5e1')}
                stroke={element.stroke || '#000000'}
                strokeWidth={element.strokeWidth ?? 2}
                strokeDasharray={element.strokeDasharray}
                strokeLinecap={element.strokeLinecap}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      </div>
    );

  } else if (element.type === 'type_extrude') {
    const length = element.length || 0;
    // Dynamic layering: 
    // - For short extrusions, use 2px steps.
    // - For long extrusions, cap layers at 150 and increase step size to reach full length.
    const numLayers = Math.min(150, Math.max(1, Math.floor(length / 2)));
    const step = numLayers > 1 ? (length / numLayers) : length;

    const radians = ((element.angle || 0) * Math.PI) / 180;
    const mappedLineHeight = 1.4 + ((element.lineHeightValue || 0) / 10);
    const fontSize = element.fontSize || 64;

    const textStyle = {
      fontFamily: `'${element.fontFamily || 'Gasoek One'}'`,
      fontSize: `${fontSize}px`,
      fontWeight: element.fontWeight || '900',
      lineHeight: mappedLineHeight,
      textAlign: element.textAlign || 'center',
      whiteSpace: 'nowrap', // Prevent wrapping from shrinking the visual bounds
    };

    content = (
      <div
        key={`extrude-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={outerStyle}
      >
        <div style={animationStyle}>
          <div
            style={{
              ...innerStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'visible',
              backgroundColor: 'transparent',
              border: 'none',
              pointerEvents: 'none',
            }}
          >
            {/* Inner Target Wrapper */}
            <div
              style={{
                position: 'relative',
                pointerEvents: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                overflow: 'visible',
                transformStyle: 'preserve-3d', // Enable true 3D layering
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                handleSelectElement(e, element.id);
                handleMouseDown(e, element.id);
              }}
            >
              {/* 3D Extrude Layers */}
              {Array.from({ length: numLayers }).map((_, i) => {
                const offset = (i + 1) * step;
                const x = Math.cos(radians) * offset;
                const y = Math.sin(radians) * offset;
                return (
                  <div
                    key={i}
                    className="whitespace-pre select-none"
                    style={{
                      ...textStyle,
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      // Use a small negative translateZ for layers to stay behind the face
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) translateZ(-${i + 1}px)`,
                      color: element.extrudeColor || '#000000',
                      zIndex: i + 1,
                      opacity: 1,
                      pointerEvents: 'none',
                      overflow: 'visible'
                    }}
                  >
                    {(element.content || '').toUpperCase()}
                  </div>
                );
              })}

              {/* Main Surface (Face) */}
              <div
                className="whitespace-pre select-none"
                style={{
                  ...textStyle,
                  position: 'relative',
                  // Positive translateZ ensures it's always in front of layers
                  transform: 'translate(0, 0) translateZ(1px)',
                  color: element.color || '#ff0000',
                  zIndex: 1000,
                  textShadow: element.borderWidth ? `${element.extrudeColor || '#000'} -${element.borderWidth}px -${element.borderWidth}px 0, ${element.extrudeColor || '#000'} ${element.borderWidth}px -${element.borderWidth}px 0, ${element.extrudeColor || '#000'} -${element.borderWidth}px ${element.borderWidth}px 0, ${element.extrudeColor || '#000'} ${element.borderWidth}px ${element.borderWidth}px 0` : 'none',
                  overflow: 'visible'
                }}
              >
                {(element.content || '').toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  } else if (element.type === 'frame') {
    const w = element.width;
    const h = element.height;
    const clipPathId = `frame-clip-${element.id}`;
    const maskType = element.maskType || 'rect';
    const hasContent = !!element.content && (element.contentType === 'image' || element.contentType === 'video');

    // Handle Drop
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer.files;

      const processUrl = (url, type) => {
        if (type === 'image') {
          const img = new Image();
          img.onload = () => {
            updateElement(element.id, {
              content: url,
              contentType: 'image',
              contentWidth: img.naturalWidth,
              contentHeight: img.naturalHeight
            });
          };
          img.src = url;
        } else {
          // Video - we can try to get dimensions but it's harder async without efficient video loading
          // For now just set content
          updateElement(element.id, { content: url, contentType: 'video' });
        }
      };

      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target.result;
          const contentType = file.type.startsWith('image/') ? 'image' : 'video';
          processUrl(url, contentType);
        };
        reader.readAsDataURL(file);
      } else {
        // Handle drag from elements (if any)
        const data = e.dataTransfer.getData('text/plain');
        if (data && (data.startsWith('http') || data.startsWith('data:image'))) {
          processUrl(data, 'image');
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
    else if (maskType === 'polygon' || maskType === 'star') {
      if (maskType === 'star' && typeof element.points === 'number') {
        // Calculate star points dynamically
        const points = element.points || 5;
        const outerRadius = 0.5;
        const innerRadius = outerRadius * (element.innerRadius || 0.4);
        const centerX = 0.5;
        const centerY = 0.5;


        let pointsList = [];
        for (let i = 0; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          pointsList.push(`${x},${y}`);
        }
        clipPathPoints = pointsList.join(' ');
      } else {
        clipPathPoints = element.points || '0.5,0 1,1 0,1';
      }
    } else if (maskType === 'heart') {
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
    } else if (maskType === 'path') {
      isPath = true;
      // Expect element.path to be a normalized SVG string (0..1 coordinates)
      clipPathPoints = element.path || 'M0,0 L1,0 L1,1 L0,1 Z';
    }

    const isEditingFrame = frameEditing === element.id;

    // Defines the clip path string
    const clipPathStyle = isCircle ? 'circle(50%)' : `url(#${clipPathId})`;

    // Calculate dimensions to COVER the frame
    let coverWidth = '100%';
    let coverHeight = '100%';

    if (element.contentWidth && element.contentHeight) {
      const frameRatio = w / h;
      const contentRatio = element.contentWidth / element.contentHeight;

      // If content is wider than frame (relatively), we fit Height to 100% and Width > 100%
      if (contentRatio > frameRatio) {
        coverHeight = '100%';
        coverWidth = `${(contentRatio / frameRatio) * 100}%`;
      } else {
        // If content is taller, fit Width to 100% and Height > 100%
        coverWidth = '100%';
        coverHeight = `${(frameRatio / contentRatio) * 100}%`;
      }
    }

    const scale = element.contentScale || 1;
    const crop = element.contentCrop || { t: 0, b: 0, l: 0, r: 0 };

    // Calculate clip path based on crop percentages
    // inset(top right bottom left)
    const contentClipPath = `inset(${crop.t * 100}% ${crop.r * 100}% ${crop.b * 100}% ${crop.l * 100}%)`;

    // Final style values for the image/video content
    const imgStyle = {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: coverWidth, // e.g. "150%"
      height: coverHeight,
      // Apply user scale and translate.
      // Translate is in px (e.g. from dragging).
      transform: `translate(-50%, -50%) translate(${(element.contentX || 0)}px, ${(element.contentY || 0)}px) scale(${scale})`,
      transformOrigin: 'center center',
      objectFit: 'fill', // We manually sized it, so fill the box we created
      maxWidth: 'none', // Allow overflow
      maxHeight: 'none',
      clipPath: contentClipPath, // Apply crop to image content
      WebkitClipPath: contentClipPath
    };


    content = (
      <div
        key={`frame-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={{
          ...outerStyle,
          // IMPORTANT: When editing, we MUST allow overflow to see the ghost image outside
          overflow: isEditingFrame ? 'visible' : 'hidden',
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isLocked) {
            if (handleSelectElement) handleSelectElement(e, element.id);
          } else {
            handleMouseDown(e, element.id);
          }
        }}
        onDoubleClick={(e) => {
          if (!isLocked && currentTool === 'select' && (hasContent || maskType === 'text')) {
            e.stopPropagation();
            setFrameEditing(element.id);
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div style={animationStyle}>
          <div
             style={{
              ...innerStyle,
              width: '100%',
              height: '100%',
              backgroundColor: hasContent ? 'transparent' : '#f3f4f6',
              border: (hasContent && !isEditingFrame) ? 'none' : '2px dashed #d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: isCircle ? '50%' : isRounded ? (element.borderRadius || 20) + 'px' : '0',
              overflow: isEditingFrame ? 'visible' : 'hidden',
            }}
          >


        {/* GHOST CONTENT - Visible OUTSIDE the mask when editing */}
        {isEditingFrame && hasContent && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              // [REFINEMENT] Allow dragging the ghost image even outside frame bounds
              pointerEvents: 'auto',
              zIndex: 1, // Above backdrop, below mask
              overflow: 'visible' // Allow ghost content to overflow its container
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              handleMouseDown(e, element.id, 'drag');
            }}
          >
            {element.contentType === 'video' ? (
              <video
                src={element.content}
                style={{ ...imgStyle, opacity: 0.5 }}
                autoPlay
                muted
                loop
              />
            ) : (
              <img
                src={element.content}
                alt=""
                style={{ ...imgStyle, opacity: 0.5 }}
              />
            )}

            {/* Bounding Box for the full image */}
            <div
              style={{
                ...imgStyle,
                border: '1px solid #3b82f6', // Blue outline
                boxSizing: 'border-box',
                background: 'transparent',
                pointerEvents: 'none' // Don't block clicks
              }}
            />
          </div>
        )}

        {/* MASKED CONTENT CONTAINER */}
        {/* If editing, this container applies the clip. If not, the root applied it. */}
        {(!hasContent && maskType === 'text') ? (
          <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2
          }}>
            <svg
              viewBox={`0 0 ${w} ${h}`}
              preserveAspectRatio="xMidYMid slice"
              style={{ width: '100%', height: '100%' }}
            >
              <defs>
                <linearGradient id={`grad-${element.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#87CEEB" />
                  <stop offset="100%" stopColor="#E0F6FF" />
                </linearGradient>
                <clipPath id={`${clipPathId}-inner`} clipPathUnits="userSpaceOnUse">
                  <text
                    x={w / 2}
                    y={h / 2 + (h * 0.04)} // Slightly increase offset for better optical centering
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                      fontFamily: element.fontFamily || 'Gasoek One',
                      fontWeight: 'bold',
                      fontSize: (element.text || 'TEXT').length > 5 ? h * 0.4 :
                        (element.text || 'TEXT').length > 1 ? h * 0.6 : h * 0.8,
                      letterSpacing: (element.letterSpacing || 0) * 0.001 * w + 'px'
                    }}
                  >
                    {element.text || 'TEXT'}
                  </text>
                </clipPath>
              </defs>

              {/* Masked Holder Content (Hills) - Normalized to pixel bounds */}
              <g clipPath={`url(#${clipPathId}-inner)`}>
                <rect width={w} height={h} fill={`url(#grad-${element.id})`} />
                <path d={`M 0,${h * 0.7} Q ${w * 0.3},${h * 0.5} ${w * 0.5},${h * 0.7} T ${w},${h * 0.6} L ${w},${h} L 0,${h} Z`} fill="#8cb11c" />
                <path d={`M 0,${h * 0.85} Q ${w * 0.4},${h * 0.75} ${w * 0.7},${h * 0.85} T ${w},${h * 0.8} L ${w},${h} L 0,${h} Z`} fill="#a0c820" />
                <circle cx={w * 0.2} cy={h * 0.3} r={Math.min(w, h) * 0.05} fill="white" opacity="0.4" />
                <circle cx={w * 0.25} cy={h * 0.35} r={Math.min(w, h) * 0.04} fill="white" opacity="0.4" />
                <circle cx={w * 0.7} cy={h * 0.2} r={Math.min(w, h) * 0.06} fill="white" opacity="0.3" />
              </g>

              {/* Dashed Outline - Exact Same Geometry */}
              <text
                x={w / 2}
                y={h / 2 + (h * 0.04)}
                textAnchor="middle"
                dominantBaseline="central"
                fill="none"
                stroke="#d1d5db"
                strokeWidth={Math.min(w, h) * 0.01}
                strokeDasharray={`${Math.min(w, h) * 0.04}, ${Math.min(w, h) * 0.04}`}
                style={{
                  fontFamily: element.fontFamily || 'Gasoek One',
                  fontWeight: 'bold',
                  fontSize: (element.text || 'TEXT').length > 5 ? h * 0.4 :
                    (element.text || 'TEXT').length > 1 ? h * 0.6 : h * 0.8,
                  letterSpacing: (element.letterSpacing || 0) * 0.001 * w + 'px'
                }}
              >
                {element.text || 'TEXT'}
              </text>
            </svg>
          </div>
        ) : hasContent ? (
          <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            clipPath: clipPathStyle, // Always clip this inner container to shapes
            WebkitClipPath: clipPathStyle,
            borderRadius: isCircle ? '50%' : isRounded ? (element.borderRadius || 20) + 'px' : '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2 // Above ghost
          }}>
            {/* Bright/Visible Content inside the frame */}
            {element.contentType === 'video' ? (
              <video
                src={element.content}
                style={{ ...imgStyle, opacity: 1 }}
                autoPlay
                muted
                loop
              />
            ) : (
              <img
                src={element.content}
                alt=""
                style={{ ...imgStyle, opacity: 1 }}
              />
            )}
          </div>
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            clipPath: clipPathStyle,
            WebkitClipPath: clipPathStyle,
            borderRadius: isCircle ? '50%' : isRounded ? (element.borderRadius || 20) + 'px' : '0'
          }}>
            <div className="flex flex-col items-center justify-center relative w-full h-full bg-[#E0F6FF] overflow-hidden">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
              >
                {/* Sky Gradient */}
                <defs>
                  <linearGradient id="placeholder-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#87CEEB" />
                    <stop offset="100%" stopColor="#E0F6FF" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" fill="url(#placeholder-sky)" />

                {/* Hills matching preview style */}
                <path
                  d="M 0,70 Q 30,50 50,70 T 100,60 L 100,100 L 0,100 Z"
                  fill="#8cb11c"
                />
                <path
                  d="M 0,85 Q 40,75 70,85 T 100,80 L 100,100 L 0,100 Z"
                  fill="#a0c820"
                />

                {/* Clouds/Details */}
                <circle cx="20" cy="30" r="5" fill="white" opacity="0.4" />
                <circle cx="25" cy="35" r="4" fill="white" opacity="0.4" />
                <circle cx="70" cy="20" r="6" fill="white" opacity="0.3" />
              </svg>
              <div className="relative z-10 flex flex-col items-center justify-center text-white drop-shadow-md">
                <ImageIcon size={32} strokeWidth={1.5} />
                <span className="text-[8px] mt-1 font-bold uppercase tracking-widest opacity-80">Drop media</span>
              </div>
            </div>
          </div>
        )}

        {/* BORDER FOR EMPTY IRREGULAR SHAPES (EXCLUDING TEXT WHICH IS HANDLED ABOVE) */}
        {!hasContent && !isCircle && !isRounded && maskType !== 'rect' && maskType !== 'text' && (
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
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
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
            <clipPath id={clipPathId} clipPathUnits={maskType === 'text' ? 'userSpaceOnUse' : 'objectBoundingBox'}>
              {isPath ? (
                <path d={clipPathPoints} />
              ) : maskType === 'text' ? (
                <text
                  x={w / 2}
                  y={h / 2 + (h * 0.04)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: element.fontFamily || 'Gasoek One',
                    fontWeight: 'bold',
                    letterSpacing: (element.letterSpacing || 0) * 0.001 * w + 'px',
                    fontSize: (element.text || 'TEXT').length > 5 ? h * 0.4 :
                      (element.text || 'TEXT').length > 1 ? h * 0.6 : h * 0.8
                  }}
                >
                  {element.text || 'TEXT'}
                </text>
              ) : (
                <polygon points={clipPathPoints} />
              )}
            </clipPath>
          </defs>
        </svg>
          </div>
        </div>
      </div>
    );
  } else if (element.type === 'vector_path') {
    const d = generateSVGPath(element.bezierAnchors, element.isClosed);    content = (
      <div
        key={`vector-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={outerStyle}
      >
        <div style={animationStyle}>
          <div
            style={{
              ...innerStyle,
              pointerEvents: 'none'
            }}
            className={styles.canvasElement}
          >
            <div
              style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
              onPointerDown={(e) => {
                e.stopPropagation();
                if (isLocked) {
                  if (handleSelectElement) handleSelectElement(e, element.id);
                } else {
                  handleMouseDown(e, element.id);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (handleSelectElement) handleSelectElement(e, element.id);
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${element.width} ${element.height}`}
                style={{ overflow: 'visible' }}
              >
                {/* Hide static path if VectorOverlay is rendering the live one */}
                {!(isSelected && (currentTool === 'pen' || isEditing)) && (
                  <path
                    d={d}
                    fill={element.fill || 'none'}
                    stroke={element.stroke || '#000'}
                    strokeWidth={element.strokeWidth || 2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>

              {/* Vector Editing Overlay */}
              {(element.type === 'vector_path' && (currentTool === 'pen' || isSelected || isEditing)) && (
                <VectorOverlay
                  element={element}
                  zoom={zoom}
                  currentTool={currentTool}
                  onUpdate={updateElement}
                  cursorPos={penCursorPos}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } else if (element.type === 'video') {

    content = (
      <div
        key={`video-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={outerStyle}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isLocked) {
            if (handleSelectElement) handleSelectElement(e, element.id);
          } else {
            handleMouseDown(e, element.id);
          }
        }}
      >
        <div style={animationStyle}>
          <div
            style={{
              ...innerStyle,
              backgroundColor: 'transparent',
              overflow: 'hidden'
            }}
            className={styles.canvasElement}
          >
            <video
              ref={videoRef}
              src={element.src}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: getFilterCSS(element.filters || {}),
                opacity: element.opacity !== undefined ? element.opacity : 1,
                ...getEffectCSS(element)
              }}
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        </div>
      </div>
    );
  } else if (element.type === 'sticker') {
    content = (
      <div
        key={`sticker-${element.id}-${element.animation?.type || 'none'}-${element.animation?.lastApplied || 0}`}
        id={`element-${element.id}`}
        style={outerStyle}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isLocked) {
            if (handleSelectElement) handleSelectElement(e, element.id);
          } else {
            handleMouseDown(e, element.id);
          }
        }}
      >
        <div style={animationStyle}>
          <div
            style={{
              ...innerStyle,
              backgroundColor: element.fillType === 'solid' ? element.fill : 'transparent',
              background: element.fillType === 'gradient' ? getBackgroundStyle(element) : undefined,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
            }}
            className={element.fillType === 'gradient' ? 'gradient-fix' : ''}
          >
            {stickerOptions.find(s => s.name === element.sticker)?.icon || '😊'}
          </div>
        </div>
      </div>
    );
  } else if (element.type === 'group') {
    content = (
      <div id={`element-${element.id}`} style={outerStyle}>
        <div style={animationStyle}>
          <div
            style={{
              ...innerStyle,
              backgroundColor: 'transparent',
              border: 'none',
              pointerEvents: 'none'
            }}
          >
            {/* Group interaction area */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                cursor: isLocked ? 'not-allowed' : 'move',
                pointerEvents: 'auto',
                zIndex: 1
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                if (isLocked) {
                  if (handleSelectElement) handleSelectElement(e, element.id);
                } else {
                  handleMouseDown(e, element.id);
                }
              }}
            />

            {/* Render group children with RELATIVE positions (offset from group origin) */}
            {getCurrentPageElements()
              .filter(el => el.groupId === element.id)
              .map(el => {
                // Children store their absolute page positions.
                // Since this div is positioned at group.x, group.y (via outerStyle),
                // we must subtract the group's origin to get the correct visual position.
                const relEl = {
                  ...el,
                  x: el.x - element.x,
                  y: el.y - element.y,
                };
                return (
                  <CanvasElement
                    key={el.id}
                    element={relEl}
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
                    onCommentClick={onCommentClick}
                    zoom={zoom}
                    currentTime={currentTime}
                    isPlaying={isPlaying}
                    isPreviewing={isPreviewing}
                  />
                );
              })}
          </div>
        </div>
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
          onPointerDown={(e) => {
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
          onPointerDown={(e) => {
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

// Memoize the component to prevent re-renders when other elements are dragged
// and the pages state changes but THIS element properties didn't.
export default memo(CanvasElement, (prevProps, nextProps) => {
  // Simple check: if element props are stable, we compare the objects
  // We MUST re-render if:
  // 1. the element object itself changed (important for updates)
  if (prevProps.element !== nextProps.element) return false;
  // 2. its selection status changed
  const prevIsSelected = prevProps.selectedElements.has(prevProps.element.id);
  const nextIsSelected = nextProps.selectedElements.has(nextProps.element.id);
  if (prevIsSelected !== nextIsSelected) return false;
  // 3. its lock status changed
  const prevIsLocked = prevProps.lockedElements.has(prevProps.element.id);
  const nextIsLocked = nextProps.lockedElements.has(nextProps.element.id);
  if (prevIsLocked !== nextIsLocked) return false;
  // 4. its editing status changed
  if (prevProps.textEditing !== nextProps.textEditing) return false;
  // 5. frame editing status changed
  if (prevProps.frameEditing !== nextProps.frameEditing) return false;
  // 6. some global props changed
  if (prevProps.zoom !== nextProps.zoom) return false;
  if (prevProps.currentTool !== nextProps.currentTool) return false;
  if (prevProps.currentLanguage !== nextProps.currentLanguage) return false;
  
  // 7. Playback state changed (CRITICAL for animations)
  // We MUST re-render on currentTime change even when playing for sync
  if (prevProps.isPlaying !== nextProps.isPlaying) return false;
  if (prevProps.currentTime !== nextProps.currentTime) return false;
  if (prevProps.isSelected !== nextProps.isSelected) return false;

  // Otherwise, skip re-render
  return true;
});
