import React from 'react';
import { useWhiteboard } from '../hooks/useWhiteboard';
import WhiteboardToolbar from './WhiteboardToolbar';
import WhiteboardCanvas from './WhiteboardCanvas';
import DOMTextEditor from './DOMTextEditor';
import ElementFloatingMenu from './ElementFloatingMenu';
import WhiteboardPropertyPanel from './WhiteboardPropertyPanel';
import WhiteboardLayersPanel from './WhiteboardLayersPanel';

const WhiteboardWorkspace = ({ stageRef }) => {
  const {
    elements,
    tool,
    setTool,
    selectedElementId,
    setSelectedElementId,
    editingTextId,
    setEditingTextId,
    stageScale,
    setStageScale,
    stagePosition,
    setStagePosition,
    brushType,
    setBrushType,
    drawingProps,
    setDrawingProps,
    addElement,
    updateElement,
    removeElement,
    undo,
    redo,
    historyStep,
    historyLength,
    smartShapesEnabled,
    setSmartShapesEnabled,
    layers,
    setLayers,
    activeLayerId,
    setActiveLayerId
  } = useWhiteboard();

  return (
    <div className="flex-1 relative bg-[#f0f0f0] overflow-hidden flex items-center justify-center">
      {/* Background Dots Concept (CSS Pattern) */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        opacity: 0.5
      }} />

      {/* Main Canvas Area */}
      <div className="absolute inset-0 z-10">
        <WhiteboardCanvas
          stageRef={stageRef}
          elements={elements}
          tool={tool}
          selectedElementId={selectedElementId}
          setSelectedElementId={setSelectedElementId}
          editingTextId={editingTextId}
          setEditingTextId={setEditingTextId}
          stageScale={stageScale}
          setStageScale={setStageScale}
          stagePosition={stagePosition}
          setStagePosition={setStagePosition}
          brushType={brushType}
          drawingProps={drawingProps}
          addElement={addElement}
          updateElement={updateElement}
          smartShapesEnabled={smartShapesEnabled}
          layers={layers}
          activeLayerId={activeLayerId}
        />
      </div>

      {/* Contextual Properties Panel (Floating at top) */}
      <WhiteboardPropertyPanel 
        tool={tool}
        brushType={brushType}
        drawingProps={drawingProps}
        setDrawingProps={setDrawingProps}
      />

      {/* Layers Management Panel */}
      <WhiteboardLayersPanel 
        layers={layers}
        setLayers={setLayers}
        activeLayerId={activeLayerId}
        setActiveLayerId={setActiveLayerId}
      />

      {/* DOM Overlays */}
      {editingTextId && elements.find(e => e.id === editingTextId) && (
        <DOMTextEditor
          element={elements.find(e => e.id === editingTextId)}
          stageScale={stageScale}
          stagePosition={stagePosition}
          updateElement={updateElement}
          closeEditor={() => setEditingTextId(null)}
        />
      )}

      {selectedElementId && !editingTextId && tool === 'select' && elements.find(e => e.id === selectedElementId) && (
        <ElementFloatingMenu
          element={elements.find(e => e.id === selectedElementId)}
          stageScale={stageScale}
          stagePosition={stagePosition}
          updateElement={updateElement}
          removeElement={removeElement}
        />
      )}

      {/* Floating Toolbar Sidebar */}
      <WhiteboardToolbar
        tool={tool}
        setTool={setTool}
        brushType={brushType}
        setBrushType={setBrushType}
        drawingProps={drawingProps}
        setDrawingProps={setDrawingProps}
        canUndo={historyStep > 0}
        canRedo={historyStep < historyLength - 1}
        onUndo={undo}
        onRedo={redo}
        selectedElementId={selectedElementId}
        onDelete={removeElement}
        smartShapesEnabled={smartShapesEnabled}
        setSmartShapesEnabled={setSmartShapesEnabled}
      />

      {/* Zoom Controls */}
      <div className="absolute right-6 bottom-6 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center p-1 z-40">
        <button 
          onClick={() => setStageScale(s => Math.max(0.1, s / 1.2))}
          className="p-2 hover:bg-gray-50 text-gray-500 rounded-lg text-sm font-bold"
        >—</button>
        <span className="px-3 text-xs font-black text-gray-400">{Math.round(stageScale * 100)}%</span>
        <button 
           onClick={() => setStageScale(s => Math.min(5, s * 1.2))}
          className="p-2 hover:bg-gray-50 text-gray-500 rounded-lg text-sm font-bold"
        >+</button>
      </div>
    </div>
  );
};

export default WhiteboardWorkspace;
