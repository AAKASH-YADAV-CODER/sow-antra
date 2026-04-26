import { useState, useCallback } from 'react';

export const useWhiteboard = () => {
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyStep, setHistoryStep] = useState(0);

  const [tool, setTool] = useState('select'); // 'select', 'pan', 'pen', 'rect', 'circle', 'triangle', 'diamond', 'sticky', 'text'
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [editingTextId, setEditingTextId] = useState(null);
  
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

  const [brushType, setBrushType] = useState('pen'); // 'pen', 'pencil', 'brush', 'highlighter', 'crayon'

  const [layers, setLayers] = useState([
    { id: 'layer-1', name: 'Background', visible: true, locked: false },
    { id: 'layer-2', name: 'Layer 1', visible: true, locked: false }
  ]);
  const [activeLayerId, setActiveLayerId] = useState('layer-2');

  const [smartShapesEnabled, setSmartShapesEnabled] = useState(true);

  const [drawingProps, setDrawingProps] = useState({
    stroke: '#000000',
    fill: '#FFAC00', // Default sticky note color
    strokeWidth: 4,
    opacity: 1,
    flow: 1,
    fontSize: 24,
  });

  const saveHistory = useCallback((newElements) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }, [history, historyStep]);

  const addElement = useCallback((element) => {
    setElements((prev) => {
      const newElements = [...prev, { ...element, layerId: activeLayerId }];
      saveHistory(newElements);
      return newElements;
    });
  }, [saveHistory, activeLayerId]);

  const updateElement = useCallback((id, newProps) => {
    setElements((prev) => {
      const newElements = prev.map((e) => (e.id === id ? { ...e, ...newProps } : e));
      saveHistory(newElements);
      return newElements;
    });
  }, [saveHistory]);

  const removeElement = useCallback((id) => {
    setElements((prev) => {
      const newElements = prev.filter((e) => e.id !== id);
      saveHistory(newElements);
      return newElements;
    });
  }, [saveHistory]);

  const removeElements = useCallback((ids) => {
    if (!ids || ids.length === 0) return;
    setElements((prev) => {
      const newElements = prev.filter((e) => !ids.includes(e.id));
      saveHistory(newElements);
      return newElements;
    });
  }, [saveHistory]);

  const undo = useCallback(() => {
    if (historyStep === 0) return;
    setHistoryStep((prev) => prev - 1);
    setElements(history[historyStep - 1]);
  }, [history, historyStep]);

  const redo = useCallback(() => {
    if (historyStep === history.length - 1) return;
    setHistoryStep((prev) => prev + 1);
    setElements(history[historyStep + 1]);
  }, [history, historyStep]);

  return {
    elements,
    setElements,
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
    removeElements,
    undo,
    redo,
    historyStep,
    historyLength: history.length,
    smartShapesEnabled,
    setSmartShapesEnabled,
    layers,
    setLayers,
    activeLayerId,
    setActiveLayerId,
  };
};
