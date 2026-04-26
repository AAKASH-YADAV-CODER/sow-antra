import { useEffect } from 'react';

/**
 * Custom hook for handling keyboard shortcuts in the canvas editor
 * Manages shortcuts for:
 * - Delete/Backspace: Delete selected elements
 * - Ctrl/Cmd+Z: Undo
 * - Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z: Redo
 * - Arrow keys: Move selected elements (Shift for 10px increments)
 * - Escape: Clear selection and close effects panel
 * - Ctrl/Cmd+G: Group/ungroup elements
 * - Ctrl/Cmd+L: Lock/unlock element
 * - Ctrl/Cmd+E: Toggle effects panel
 * 
 * @param {Object} params - Hook parameters
 */
const useKeyboardShortcuts = ({
  textEditing,
  selectedElements,
  selectedElement,
  getCurrentPageElements,
  lockedElements,
  setCurrentPageElements,
  setSelectedElement,
  setSelectedElements,
  saveToHistory,
  undo,
  redo,
  groupElements,
  ungroupElements,
  toggleElementLock,
  setTextEditing,
  activeSidePanel,
  setActiveSidePanel,
  copyElements,
  pasteElements,
  splitPage,
  splitElement,
  onDeletePage,
  pages,
  currentPage,
  currentTime,
  showRulers,
  setShowRulers
}) => {

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle shortcuts when editing text
      if (textEditing) return;

      // Don't handle shortcuts when typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // 'S' key: Split clip (if selected) or Scene at current time
      if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        if (selectedElement && splitElement) {
          splitElement(selectedElement, currentTime);
        } else if (splitPage) {
          splitPage(currentTime);
        }
      }

      // Shift+R: Toggle Rulers
      if (e.key === 'R' && e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (setShowRulers) {
          setShowRulers(!showRulers);
        }
      }

      // Delete/Backspace: Delete selected elements
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElements.size > 0) {
          const currentElements = getCurrentPageElements();
          const newElements = currentElements.filter(
            el => !selectedElements.has(el.id) || lockedElements.has(el.id)
          );
          setCurrentPageElements(newElements);
          setSelectedElement(null);
          setSelectedElements(new Set());
          saveToHistory(newElements);
        } else if (onDeletePage && pages && pages.length > 1) {
          // If no elements selected, and we have the onDeletePage prop (Timeline Mode), 
          // delete the current page/scene
          onDeletePage(currentPage);
        }
      }

      // Ctrl/Cmd+Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Ctrl/Cmd+Y: Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }

      // Ctrl/Cmd+Shift+Z: Redo (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }

      // Ctrl/Cmd+C: Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copyElements();
      }

      // Ctrl/Cmd+V: Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        pasteElements();
      }

      // Arrow keys: Move selected elements
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedElements.size > 0) {
          e.preventDefault();
          const delta = e.shiftKey ? 10 : 1;
          const moveX = e.key === 'ArrowLeft' ? -delta : e.key === 'ArrowRight' ? delta : 0;
          const moveY = e.key === 'ArrowUp' ? -delta : e.key === 'ArrowDown' ? delta : 0;

          const currentElements = getCurrentPageElements();
          const newElements = currentElements.map(el => {
            if (selectedElements.has(el.id) && !lockedElements.has(el.id)) {
              return {
                ...el,
                x: el.x + moveX,
                y: el.y + moveY
              };
            }
            return el;
          });

          setCurrentPageElements(newElements);
          saveToHistory(newElements);
        }
      }

      // Escape: Clear selection and close effects panel
      if (e.key === 'Escape') {
        setSelectedElement(null);
        setSelectedElements(new Set());
        setTextEditing(null);
        setActiveSidePanel('none');
      }

      // Ctrl/Cmd+G: Group/ungroup elements
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        if (selectedElements.size > 1) {
          groupElements();
        } else if (selectedElement) {
          const currentElements = getCurrentPageElements();
          const element = currentElements.find(el => el.id === selectedElement);
          if (element?.type === 'group') {
            ungroupElements(selectedElement);
          }
        }
      }

      // Ctrl/Cmd+L: Lock/unlock element
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        if (selectedElement) {
          toggleElementLock(selectedElement);
        }
      }

      // Ctrl/Cmd+E: Toggle effects panel
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (selectedElement) {
          setActiveSidePanel(prev => prev === 'effects' ? 'none' : 'effects');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    textEditing,
    selectedElements,
    selectedElement,
    getCurrentPageElements,
    lockedElements,
    setCurrentPageElements,
    setSelectedElement,
    setSelectedElements,
    saveToHistory,
    undo,
    redo,
    groupElements,
    ungroupElements,
    toggleElementLock,
    setTextEditing,
    activeSidePanel,
    setActiveSidePanel,
    copyElements,
    pasteElements,
    splitPage,
    splitElement,
    onDeletePage,
    pages,
    currentPage,
    currentTime,
    showRulers,
    setShowRulers
  ]);
};

export default useKeyboardShortcuts;
