import React, { useState, useEffect, useRef } from 'react';

const DOMTextEditor = ({ element, stageScale, stagePosition, updateElement, closeEditor }) => {
  const [value, setValue] = useState(element.text || '');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to the end
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  }, []);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleBlur = () => {
    updateElement(element.id, { text: value });
    closeEditor();
  };

  const handleKeyDown = (e) => {
    // Escape to cancel or close? Close and save
    if (e.key === 'Escape') {
      textareaRef.current?.blur();
    }
  };

  // Calculate screen position
  let x = element.x * stageScale + stagePosition.x;
  let y = element.y * stageScale + stagePosition.y;
  let w = 200;
  let h = 100;
  let textAlign = 'center';

  if (element.type === 'rect' || element.type === 'sticky') {
    w = element.width * stageScale;
    h = element.height * stageScale;
  } else if (element.type === 'circle' || element.type === 'triangle' || element.type === 'diamond') {
    w = (element.radius * 2) * stageScale;
    h = (element.radius * 2) * stageScale;
    x = x - (element.radius * stageScale);
    y = y - (element.radius * stageScale);
  } else if (element.type === 'text') {
    w = (element.width || 300) * stageScale;
    h = 'auto';
    textAlign = 'left';
  }

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={{
        position: 'absolute',
        top: `${y}px`,
        left: `${x}px`,
        width: `${w}px`,
        height: h === 'auto' ? 'auto' : `${h}px`,
        minHeight: '2em',
        fontSize: `${(element.fontSize || 16) * stageScale}px`,
        fontFamily: 'Inter, sans-serif',
        lineHeight: 1.2,
        color: '#333',
        background: 'transparent', // Looks better while editing
        border: 'none',
        outline: 'none',
        resize: 'none',
        overflow: 'hidden',
        textAlign: textAlign,
        padding: `${10 * stageScale}px`,
        boxSizing: 'border-box',
        zIndex: 100,
        // Match the centering logic of Konva Text
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 0 2px #8b3dff'
      }}
    />
  );
};

export default DOMTextEditor;
