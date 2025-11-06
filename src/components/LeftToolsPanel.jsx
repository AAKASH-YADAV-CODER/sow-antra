import React from 'react';
import { 
  MousePointer, Move, Type, Square, Circle, Triangle,
  Minus, ArrowRight, Star, Hexagon, Image,
  Undo, Redo, Grid, Layers
} from 'lucide-react';

const LeftToolsPanel = ({
  t,
  currentTool,
  setCurrentTool,
  addElement,
  fileInputRef,
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
    <div className="tools-panel">
      <h2 className="text-sm font-bold mb-4 text-center">{t('tools.title')}</h2>
      
      <div className="space-y-2">
        <button
          onClick={() => setCurrentTool('select')}
          className={`p-2 rounded-lg ${currentTool === 'select' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          title="Select"
        >
          <MousePointer size={20} />
        </button>
        <button
          onClick={() => setCurrentTool('pan')}
          className={`p-2 rounded-lg ${currentTool === 'pan' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          title="Pan"
        >
          <Move size={20} />
        </button>
        <button
          onClick={() => addElement('text')}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Text"
        >
          <Type size={20} />
        </button>
        <button
          onClick={() => addElement('rectangle')}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Rectangle"
        >
          <Square size={20} />
        </button>
        <button
          onClick={() => addElement('circle')}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Circle"
        >
          <Circle size={20} />
        </button>
        <button
          onClick={() => addElement('triangle')}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Triangle"
        >
          <Triangle size={20} />
        </button>
        <button
          onClick={() => addElement('line')}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Line"
        >
          <Minus size={20} />
        </button>
        <button
          onClick={() => addElement('arrow')}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Arrow"
        >
          <ArrowRight size={20} />
        </button>
        <button
          onClick={() => addElement('star')}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Star"
        >
          <Star size={20} />
        </button>
        <button
          onClick={() => addElement('hexagon')}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Hexagon"
        >
          <Hexagon size={20} />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Image"
        >
          <Image size={20} />
        </button>
      </div>

      <div className="mt-6 space-y-2">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          title="Undo"
        >
          <Undo size={20} />
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          title="Redo"
        >
          <Redo size={20} />
        </button>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-lg ${showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          title="Toggle Grid"
        >
          <Grid size={20} />
        </button>
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`p-2 rounded-lg ${snapToGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          title="Snap to Grid"
        >
          <Layers size={20} />
        </button>
      </div>
    </div>
  );
};

export default LeftToolsPanel;