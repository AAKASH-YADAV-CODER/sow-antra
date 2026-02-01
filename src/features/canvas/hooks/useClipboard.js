import { useState, useCallback } from 'react';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * useClipboard Hook
 * Handles copy, paste, and copy style operations for canvas elements.
 */
const useClipboard = ({
    selectedElements,
    getCurrentPageElements,
    setCurrentPageElements,
    setSelectedElement,
    setSelectedElements,
    updateElement,
    saveToHistory
}) => {
    const [clipboard, setClipboard] = useState(null);
    const [styleClipboard, setStyleClipboard] = useState(null);

    // Copy selected elements
    const copyElements = useCallback(() => {
        if (selectedElements.size === 0) return;

        const currentElements = getCurrentPageElements();
        const elementsToCopy = currentElements.filter(el => selectedElements.has(el.id));

        setClipboard(JSON.parse(JSON.stringify(elementsToCopy)));
    }, [selectedElements, getCurrentPageElements]);

    // Copy style of the first selected element
    const copyStyle = useCallback(() => {
        if (selectedElements.size === 0) return;

        const currentElements = getCurrentPageElements();
        const element = currentElements.find(el => selectedElements.has(el.id));

        if (element) {
            // Pick style properties based on element type
            const styleProps = {
                fill: element.fill,
                fillType: element.fillType,
                gradient: element.gradient,
                stroke: element.stroke,
                strokeWidth: element.strokeWidth,
                strokeDasharray: element.strokeDasharray,
                opacity: element.opacity,
                borderRadius: element.borderRadius,
                // Text specific
                fontSize: element.fontSize,
                fontFamily: element.fontFamily,
                fontWeight: element.fontWeight,
                fontStyle: element.fontStyle,
                color: element.color,
                textAlign: element.textAlign,
                // Image specific
                filters: element.filters,
                imageEffects: element.imageEffects
            };
            setStyleClipboard(styleProps);
        }
    }, [selectedElements, getCurrentPageElements]);

    // Paste elements from clipboard
    const pasteElements = useCallback(() => {
        if (!clipboard || clipboard.length === 0) return;

        const currentElements = getCurrentPageElements();
        const newIdsMap = new Map();

        const elementsToPaste = clipboard.map(el => {
            const newId = generateId();
            newIdsMap.set(el.id, newId);
            return {
                ...el,
                id: newId,
                x: el.x + 20,
                y: el.y + 20,
                zIndex: currentElements.length + currentElements.findIndex(cell => cell.id === el.id) // simplistic zIndex
            };
        });

        // Fix group children IDs if any
        elementsToPaste.forEach(el => {
            if (el.type === 'group' && el.children) {
                el.children = el.children.map(childId => newIdsMap.get(childId) || childId);
            }
            if (el.groupId) {
                el.groupId = newIdsMap.get(el.groupId) || el.groupId;
            }
        });

        const newElements = [...currentElements, ...elementsToPaste];
        setCurrentPageElements(newElements);

        const newSelectedIds = new Set(elementsToPaste.map(el => el.id));
        setSelectedElements(newSelectedIds);
        if (elementsToPaste.length === 1) {
            setSelectedElement(elementsToPaste[0].id);
        }

        saveToHistory(newElements);
    }, [clipboard, getCurrentPageElements, setCurrentPageElements, setSelectedElements, setSelectedElement, saveToHistory]);

    // Paste style to selected elements
    const pasteStyle = useCallback(() => {
        if (!styleClipboard || selectedElements.size === 0) return;

        selectedElements.forEach(id => {
            updateElement(id, styleClipboard);
        });
    }, [styleClipboard, selectedElements, updateElement]);

    return {
        copyElements,
        copyStyle,
        pasteElements,
        pasteStyle,
        hasClipboard: !!clipboard,
        hasStyleClipboard: !!styleClipboard
    };
};

export default useClipboard;
