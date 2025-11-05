import { useState, useCallback } from 'react';

/**
 * useHistory Hook
 * Manages undo/redo history for canvas elements
 * Uses JSON serialization to store element states
 * 
 * @param {Function} setCurrentPageElements - Function to update current page elements
 * @returns {object} - { history, historyIndex, saveToHistory, undo, redo, canUndo, canRedo }
 */
const useHistory = (setCurrentPageElements) => {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save current state to history
  const saveToHistory = useCallback((newElements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(newElements));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo to previous state
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevElements = JSON.parse(history[historyIndex - 1]);
      setCurrentPageElements(prevElements);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setCurrentPageElements]);

  // Redo to next state
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextElements = JSON.parse(history[historyIndex + 1]);
      setCurrentPageElements(nextElements);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setCurrentPageElements]);

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
