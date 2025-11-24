import React, { useState } from 'react';
import {
  MousePointer, Move, Type, Square, Circle, Triangle, Minus, ArrowRight,
  Star, Hexagon, Image, Undo, Redo, Grid, Layers, Shapes, ChevronDown
} from 'lucide-react';

/**
 * ToolsSidebar Component
 * Left sidebar with tool selection buttons, shape tools, and canvas controls
 * Hidden on mobile devices
 */
const ToolsSidebar = ({
  t,
  currentTool,
  setCurrentTool,
  addElement,
  fileInputRef,
  handleImageUpload,
  loadProjectInputRef,
  handleProjectFileLoad,
  undo,
  redo,
  historyIndex,
  history,
  showGrid,
  setShowGrid,
  snapToGrid,
  setSnapToGrid
}) => {
  return (
    <div className="tools-panel hidden md:flex">
      <h2 className="text-sm font-bold mb-4 text-center">{t('tools.title')}</h2>
      
      {/* Tool Selection */}
      <div className="space-y-2">
        <button
          onClick={() => setCurrentTool('select')}
          className={`p-2 rounded-lg flex items-center justify-center ${currentTool === 'select' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          title="Select"
        >
          <MousePointer size={20} />
        </button>
        
        <button
          onClick={() => setCurrentTool('pan')}
          className={`p-2 rounded-lg flex items-center justify-center ${currentTool === 'pan' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          title="Pan"
        >
          <Move size={20} />
        </button>
        
        <button
          onClick={() => addElement('text')}
          className="p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center"
          title="Text"
        >
          <Type size={20} />
        </button>
        
        <ShapesDropdown addElement={addElement} />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center"
          title="Image"
        >
          <Image size={20} />
        </button>
      </div>

      {/* Canvas Controls */}
      <div className="mt-6 space-y-2">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center"
          title="Undo"
        >
          <Undo size={20} />
        </button>
        
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center"
          title="Redo"
        >
          <Redo size={20} />
        </button>
        
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-lg flex items-center justify-center ${showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          title="Toggle Grid"
        >
          <Grid size={20} />
        </button>
        
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`p-2 rounded-lg flex items-center justify-center ${snapToGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          title="Snap to Grid"
        >
          <Layers size={20} />
        </button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      <input
        ref={loadProjectInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleProjectFileLoad}
        className="hidden"
      />
    </div>
  );
};

// Shapes Dropdown Component
const ShapesDropdown = ({ addElement }) => {
  const [isOpen, setIsOpen] = useState(false);

  const shapes = [
    { type: 'rectangle', icon: Square, label: 'Rectangle' },
    { type: 'circle', icon: Circle, label: 'Circle' },
    { type: 'triangle', icon: Triangle, label: 'Triangle' },
    { type: 'star', icon: Star, label: 'Star' },
    { type: 'hexagon', icon: Hexagon, label: 'Hexagon' },
    { type: 'line', icon: Minus, label: 'Line' },
    { type: 'arrow', icon: ArrowRight, label: 'Arrow' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 w-full flex items-center justify-center"
        title="Shapes"
      >
        <Shapes size={20} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-full ml-2 top-0 bg-white shadow-lg rounded-lg p-2 z-50 min-w-[160px]">
            {shapes.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => {
                  addElement(type);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-left"
              >
                <Icon size={18} />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ToolsSidebar;
