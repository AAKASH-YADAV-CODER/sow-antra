import React, { useEffect, useRef } from 'react';
import { getEffectCSS, getBackgroundStyle } from '../../utils/helpers';

const CanvasElement = ({ 
  element, 
  isSelected, 
  onClick, 
  onDoubleClick,
  zoom = 1,
  canvasOffset = { x: 0, y: 0 }
}) => {
  const elementRef = useRef(null);
  const imageRef = useRef(null);

  // Load image if element is an image type
  useEffect(() => {
    if (element.type === 'image' && element.src && imageRef.current) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (imageRef.current) {
          imageRef.current.src = img.src;
        }
      };
      img.src = element.src;
    }
  }, [element.type, element.src]);

  // Calculate transform style
  const getTransformStyle = () => {
    const transforms = [];
    
    if (element.rotation) {
      transforms.push(`rotate(${element.rotation}deg)`);
    }
    
    if (element.flipX) {
      transforms.push('scaleX(-1)');
    }
    
    if (element.flipY) {
      transforms.push('scaleY(-1)');
    }
    
    return transforms.length > 0 ? transforms.join(' ') : 'none';
  };

  // Get base style for all elements
  const getBaseStyle = () => ({
    position: 'absolute',
    left: element.x * zoom + canvasOffset.x,
    top: element.y * zoom + canvasOffset.y,
    width: element.width * zoom,
    height: element.height * zoom,
    transform: getTransformStyle(),
    transformOrigin: 'center center',
    cursor: isSelected ? 'move' : 'pointer',
    opacity: element.opacity !== undefined ? element.opacity : 1,
    zIndex: element.zIndex || 'auto',
    pointerEvents: 'auto',
    ...getEffectCSS(element),
  });

  // Render text element
  const renderText = () => {
    const style = {
      ...getBaseStyle(),
      fontFamily: element.fontFamily || 'Arial',
      fontSize: (element.fontSize || 20) * zoom,
      fontWeight: element.fontWeight || 'normal',
      fontStyle: element.fontStyle || 'normal',
      textDecoration: element.textDecoration || 'none',
      textAlign: element.textAlign || 'left',
      lineHeight: element.lineHeight || '1.5',
      letterSpacing: element.letterSpacing || 'normal',
      color: element.color || '#000000',
      background: getBackgroundStyle(element.background || { type: 'color', value: 'transparent' }),
      WebkitBackgroundClip: element.background?.type === 'gradient' ? 'text' : 'border-box',
      WebkitTextFillColor: element.background?.type === 'gradient' ? 'transparent' : element.color || '#000000',
      backgroundClip: element.background?.type === 'gradient' ? 'text' : 'border-box',
      padding: (element.padding || 0) * zoom,
      border: element.stroke ? `${(element.strokeWidth || 1) * zoom}px solid ${element.stroke}` : 'none',
      borderRadius: element.borderRadius ? (element.borderRadius * zoom) : 0,
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      overflow: 'hidden',
      userSelect: 'none',
    };

    return (
      <div
        ref={elementRef}
        style={style}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={isSelected ? 'ring-2 ring-blue-500' : ''}
      >
        {element.text || 'Text'}
      </div>
    );
  };

  // Render image element
  const renderImage = () => {
    const style = {
      ...getBaseStyle(),
      objectFit: element.objectFit || 'contain',
      border: element.stroke ? `${(element.strokeWidth || 1) * zoom}px solid ${element.stroke}` : 'none',
      borderRadius: element.borderRadius ? (element.borderRadius * zoom) : 0,
      background: getBackgroundStyle(element.background || { type: 'color', value: 'transparent' }),
    };

    return (
      <img
        ref={imageRef}
        src={element.src}
        alt={element.alt || 'Canvas image'}
        style={style}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={isSelected ? 'ring-2 ring-blue-500' : ''}
        draggable={false}
      />
    );
  };

  // Render shape element (rectangle, circle, triangle, etc.)
  const renderShape = () => {
    const style = {
      ...getBaseStyle(),
      background: getBackgroundStyle(element.background || { type: 'color', value: '#cccccc' }),
      border: element.stroke ? `${(element.strokeWidth || 2) * zoom}px solid ${element.stroke}` : 'none',
    };

    // Shape-specific styles
    switch (element.type) {
      case 'circle':
        style.borderRadius = '50%';
        break;
      case 'triangle':
        style.background = 'transparent';
        style.width = 0;
        style.height = 0;
        style.borderLeft = `${(element.width / 2) * zoom}px solid transparent`;
        style.borderRight = `${(element.width / 2) * zoom}px solid transparent`;
        style.borderBottom = `${element.height * zoom}px solid ${element.background?.value || '#cccccc'}`;
        style.border = 'none';
        break;
      case 'star':
        // Star uses clip-path
        style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
        break;
      case 'hexagon':
        style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
        break;
      case 'rectangle':
      default:
        style.borderRadius = element.borderRadius ? (element.borderRadius * zoom) : 0;
        break;
    }

    return (
      <div
        ref={elementRef}
        style={style}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={isSelected ? 'ring-2 ring-blue-500' : ''}
      />
    );
  };

  // Render sticker/emoji element
  const renderSticker = () => {
    const style = {
      ...getBaseStyle(),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: (element.fontSize || element.height * 0.8) * zoom,
      userSelect: 'none',
    };

    return (
      <div
        ref={elementRef}
        style={style}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={isSelected ? 'ring-2 ring-blue-500' : ''}
      >
        {element.content || '😀'}
      </div>
    );
  };

  // Render line element
  const renderLine = () => {
    const style = {
      ...getBaseStyle(),
      height: (element.strokeWidth || 2) * zoom,
      background: element.stroke || '#000000',
      transformOrigin: 'left center',
    };

    return (
      <div
        ref={elementRef}
        style={style}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={isSelected ? 'ring-2 ring-blue-500' : ''}
      />
    );
  };

  // Render group element (recursive)
  const renderGroup = () => {
    const style = {
      ...getBaseStyle(),
      border: isSelected ? '2px dashed #3b82f6' : 'none',
    };

    return (
      <div
        ref={elementRef}
        style={style}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        {element.children?.map((child) => (
          <CanvasElement
            key={child.id}
            element={child}
            isSelected={false}
            onClick={(e) => {
              e.stopPropagation();
              onClick(e);
            }}
            zoom={zoom}
            canvasOffset={{ x: 0, y: 0 }} // Children use relative positioning
          />
        ))}
      </div>
    );
  };

  // Render appropriate element based on type
  switch (element.type) {
    case 'text':
      return renderText();
    case 'image':
      return renderImage();
    case 'circle':
    case 'rectangle':
    case 'triangle':
    case 'star':
    case 'hexagon':
      return renderShape();
    case 'sticker':
      return renderSticker();
    case 'line':
      return renderLine();
    case 'group':
      return renderGroup();
    default:
      return null;
  }
};

export default CanvasElement;
