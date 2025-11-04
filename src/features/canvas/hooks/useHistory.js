import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for managing undo/redo history
 * @param {*} initialState - Initial state value
 * @param {number} maxHistory - Maximum number of history entries (default: 50)
 * @returns {object} - { state, setState, undo, redo, canUndo, canRedo, clearHistory }
 */
const useHistory = (initialState, maxHistory = 50) => {
  const [state, setStateInternal] = useState(initialState);
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Track if we're currently applying history (to prevent adding to history)
  const isApplyingHistory = useRef(false);

  // Set state and add to history
  const setState = useCallback((newState) => {
    if (isApplyingHistory.current) {
      // Don't add to history if we're applying undo/redo
      setStateInternal(newState);
      return;
    }

    setStateInternal(newState);
    setHistory((prev) => {
      // Remove any "future" history if we're not at the end
      const newHistory = prev.slice(0, currentIndex + 1);
      // Add new state
      newHistory.push(newState);
      // Limit history size
      if (newHistory.length > maxHistory) {
        return newHistory.slice(newHistory.length - maxHistory);
      }
      return newHistory;
    });
    setCurrentIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex >= maxHistory ? maxHistory - 1 : newIndex;
    });
  }, [currentIndex, maxHistory]);

  // Undo to previous state
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isApplyingHistory.current = true;
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setStateInternal(history[newIndex]);
      // Reset flag after state update
      setTimeout(() => {
        isApplyingHistory.current = false;
      }, 0);
    }
  }, [currentIndex, history]);

  // Redo to next state
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isApplyingHistory.current = true;
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setStateInternal(history[newIndex]);
      // Reset flag after state update
      setTimeout(() => {
        isApplyingHistory.current = false;
      }, 0);
    }
  }, [currentIndex, history]);

  // Check if undo is available
  const canUndo = currentIndex > 0;

  // Check if redo is available
  const canRedo = currentIndex < history.length - 1;

  // Clear all history and reset to current state
  const clearHistory = useCallback(() => {
    setHistory([state]);
    setCurrentIndex(0);
  }, [state]);

  // Reset to a specific state and clear history
  const resetHistory = useCallback((newState) => {
    setStateInternal(newState);
    setHistory([newState]);
    setCurrentIndex(0);
  }, []);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    resetHistory,
    historyLength: history.length,
    currentIndex,
  };
};

export default useHistory;
