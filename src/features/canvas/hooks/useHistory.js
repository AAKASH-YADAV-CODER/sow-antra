import { useState, useCallback } from 'react';

/**
 * useHistory Hook
 * Manages undo/redo history for canvas elements
 * Uses JSON serialization to store element states
 * 
 * @param {Function} setCurrentPageElements - Function to update current page elements
 * @returns {object} - { history, historyIndex, saveToHistory, undo, redo, canUndo, canRedo }
 */
const useHistory = (setCurrentPageElements, setCanvasSize, setZoom) => {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save current state to history
  const saveToHistory = useCallback((newElements, newCanvasSize, newZoom) => {
    const stateToSave = {
      elements: newElements,
      canvasSize: newCanvasSize,
      zoom: newZoom
    };
    const serialized = JSON.stringify(stateToSave);

    setHistory(prevHistory => {
      // Use the latest index to slice
      const newHistory = prevHistory.slice(0, historyIndex + 1);

      // Don't save if it's identical to the last state to save memory/perf
      if (newHistory.length > 0 && newHistory[newHistory.length - 1] === serialized) {
        return prevHistory;
      }

      newHistory.push(serialized);
      return newHistory;
    });

    setHistoryIndex(prevIndex => prevIndex + 1);
  }, [historyIndex]); // removed history dep

  // Undo to previous state
  const undo = useCallback(() => {
    if (historyIndex > 0 && history[historyIndex - 1]) {
      try {
        const prevState = JSON.parse(history[historyIndex - 1]);
        if (prevState.elements) setCurrentPageElements(prevState.elements);
        if (prevState.canvasSize && setCanvasSize) setCanvasSize(prevState.canvasSize);
        if (prevState.zoom && setZoom) setZoom(prevState.zoom);
        setHistoryIndex(historyIndex - 1);
      } catch (error) {
        console.error('Error parsing undo state:', error);
      }
    }
  }, [history, historyIndex, setCurrentPageElements, setCanvasSize, setZoom]);

  // Redo to next state
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1 && history[historyIndex + 1]) {
      try {
        const nextState = JSON.parse(history[historyIndex + 1]);
        if (nextState.elements) setCurrentPageElements(nextState.elements);
        if (nextState.canvasSize && setCanvasSize) setCanvasSize(nextState.canvasSize);
        if (nextState.zoom && setZoom) setZoom(nextState.zoom);
        setHistoryIndex(historyIndex + 1);
      } catch (error) {
        console.error('Error parsing redo state:', error);
      }
    }
  }, [history, historyIndex, setCurrentPageElements, setCanvasSize, setZoom]);

  // Check if undo is available
  const canUndo = historyIndex > 0;

  // Check if redo is available
  const canRedo = historyIndex < history.length - 1;

  return {
    history,
    historyIndex,
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  };
};

export default useHistory;
