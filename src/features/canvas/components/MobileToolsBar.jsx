import React, { useState } from 'react';
import {
  MousePointer, Type, Square, Circle, Triangle, Star, Image,
  Undo, Redo, Save, Film, Layers, Sparkles, Shapes, ChevronDown, ChevronUp,
  Hexagon, Minus, ArrowRight
} from 'lucide-react';

/**
 * Mobile Tools Bar Component
 * Horizontal scrolling toolbar at bottom of screen on mobile
 */
const MobileToolsBar = ({
  currentTool,
  setCurrentTool,
  addElement,
  fileInputRef,
  undo,
  redo,
  historyIndex,
  history,
  handleSaveClick,
  recording,
  startRecording,
  stopRecording,
  setShowTemplates,
  setShowEffectsPanel
}) => {
  const [showShapes, setShowShapes] = useState(false);

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
    <>
      {/* Shapes Popup Menu */}
      {showShapes && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowShapes(false)}
          />
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white shadow-2xl rounded-lg p-3 z-50 grid grid-cols-4 gap-2 max-w-[90vw]">
            {shapes.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => {
                  addElement(type);
                  setShowShapes(false);
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-100 touch-manipulation"
              >
                <Icon size={24} />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Horizontal Scrolling Toolbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30 overflow-x-auto overflow-y-hidden">
        <div className="flex items-center gap-1 p-2 min-w-max">
          {/* Select Tool */}
          <button
            onClick={() => setCurrentTool('select')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg touch-manipulation min-w-[60px] ${
              currentTool === 'select' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            }`}
          >
            <MousePointer size={20} />
            <span className="text-xs">Select</span>
          </button>

          {/* Text Tool */}
          <button
            onClick={() => addElement('text')}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 touch-manipulation min-w-[60px]"
          >
            <Type size={20} />
            <span className="text-xs">Text</span>
          </button>

          {/* Shapes */}
          <button
            onClick={() => setShowShapes(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 touch-manipulation min-w-[60px]"
          >
            <Shapes size={20} />
            <span className="text-xs">Shapes</span>
          </button>

          {/* Image */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 touch-manipulation min-w-[60px]"
          >
            <Image size={20} />
            <span className="text-xs">Image</span>
          </button>

          <div className="w-px h-8 bg-gray-300 mx-1" />

          {/* Templates */}
          <button
            onClick={() => setShowTemplates(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 touch-manipulation min-w-[60px]"
          >
            <Layers size={20} />
            <span className="text-xs">Templates</span>
          </button>

          {/* Effects */}
          <button
            onClick={() => setShowEffectsPanel(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 touch-manipulation min-w-[60px]"
          >
            <Sparkles size={20} />
            <span className="text-xs">Effects</span>
          </button>

          <div className="w-px h-8 bg-gray-300 mx-1" />

          {/* Recording */}
          {!recording ? (
            <button
              onClick={startRecording}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 touch-manipulation min-w-[60px]"
            >
              <Film size={20} />
              <span className="text-xs">Record</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-red-500 text-white touch-manipulation min-w-[60px]"
            >
              <Film size={20} />
              <span className="text-xs">Stop</span>
            </button>
          )}

          <div className="w-px h-8 bg-gray-300 mx-1" />

          {/* Undo */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 touch-manipulation min-w-[60px]"
          >
            <Undo size={20} />
            <span className="text-xs">Undo</span>
          </button>

          {/* Redo */}
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 touch-manipulation min-w-[60px]"
          >
            <Redo size={20} />
            <span className="text-xs">Redo</span>
          </button>

          <div className="w-px h-8 bg-gray-300 mx-1" />

          {/* Save */}
          <button
            onClick={handleSaveClick}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 touch-manipulation min-w-[60px]"
          >
            <Save size={20} />
            <span className="text-xs">Save</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileToolsBar;
