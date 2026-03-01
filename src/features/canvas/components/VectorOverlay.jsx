import React, { useState, useEffect, useRef, useCallback } from 'react';
import { mirrorHandle, getPathBoundingBox, getDistance, generateSVGPath, insertPointInPath } from '../../../utils/bezier';

/**
 * VectorOverlay
 * 
 * SVG-based overlay for editing Bezier path anchors and handles.
 * Translates intuitive drag actions into anchor updates.
 */
const VectorOverlay = ({
    element,
    zoom,
    currentTool,
    onUpdate,
    onDelete, // Optional callback if we want to delete the whole element
    cursorPos = null
}) => {
    // Local state for smooth dragging without re-renders of parent
    const [localAnchors, setLocalAnchors] = useState(element.bezierAnchors || []);
    const [selectedAnchorIdx, setSelectedAnchorIdx] = useState(null);
    const [activeAnchorIdx, setActiveAnchorIdx] = useState(null);
    const [activePart, setActivePart] = useState(null);
    const [isAltPressed, setIsAltPressed] = useState(false);
    const [hoveredIdx, setHoveredIdx] = useState(null);

    const lastMousePos = useRef({ x: 0, y: 0 });
    const elementRef = useRef(element);

    useEffect(() => {
        elementRef.current = element;
    }, [element]);

    const finalizeUpdate = useCallback((anchors) => {
        // Finalize the element's bounding box and normalize anchor points
        const { minX, minY, maxX, maxY } = getPathBoundingBox(anchors);

        // Absolute global top-left
        const globalX = elementRef.current.x + minX;
        const globalY = elementRef.current.y + minY;
        const width = Math.max(1, maxX - minX);
        const height = Math.max(1, maxY - minY);

        // Relativize anchors to new top-left
        const normalizedAnchors = (anchors || []).map(a => ({
            point: { x: a.point.x - minX, y: a.point.y - minY },
            handleIn: { x: a.handleIn.x - minX, y: a.handleIn.y - minY },
            handleOut: { x: a.handleOut.x - minX, y: a.handleOut.y - minY }
        }));

        onUpdate(elementRef.current.id, {
            x: globalX,
            y: globalY,
            width,
            height,
            bezierAnchors: normalizedAnchors
        }, true);
    }, [onUpdate]); // elementRef is ref, stable

    // Sync local state when element updates externally (unless dragging)
    useEffect(() => {
        if (activeAnchorIdx === null) {
            setLocalAnchors(element.bezierAnchors || []);
        }
    }, [element.bezierAnchors, activeAnchorIdx]);

    // Calculate visual scale to keep handles consistent size
    const visualScale = 1 / zoom;
    const visualStrokeWidth = Math.max(visualScale * 2, element.strokeWidth || 2);

    // Handle Keyboard Events (Delete, Alt)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey) setIsAltPressed(true);

            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnchorIdx !== null) {
                // Delete Point
                e.preventDefault();
                e.stopPropagation();

                const newAnchors = [...localAnchors];

                // Remove the point
                newAnchors.splice(selectedAnchorIdx, 1);

                // If we have fewer than 2 points, we might want to just clear it or handle it.
                // For now, let's allow single point or empty, but standard SVG paths need 2.

                setLocalAnchors(newAnchors);
                setSelectedAnchorIdx(null);
                finalizeUpdate(newAnchors);
            }
        };
        const handleKeyUp = (e) => {
            if (!e.altKey) setIsAltPressed(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [selectedAnchorIdx, localAnchors, finalizeUpdate]);

    // Handle Dragging Logic
    const handlePointMouseDown = (e, idx, part) => {
        e.stopPropagation(); // Prevent canvas selection or panning

        // Auto-join logic: Click first point to close path
        if (currentTool === 'pen' && idx === 0 && part === 'point' && element.bezierAnchors.length >= 2 && !element.isClosed) {
            onUpdate(element.id, { isClosed: true });
            return;
        }

        setActiveAnchorIdx(idx);
        setActivePart(part);

        // Select logic
        if (part === 'point') {
            setSelectedAnchorIdx(idx);
        }

        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    // Handle Click on Path (Add Point)
    const handlePathClick = (e) => {
        if (currentTool !== 'pen') return;

        // Calculate click position relative to element (0,0 is element top-left)
        // The SVG is positioned at top:0, left:0 of element?
        // Wait, VectorOverlay is usually absolute positioned over the element.
        // Yes, "style={{ position: 'absolute', top: 0, left: 0... }}"
        // And rendering assumes local coordinates.

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;

        const newAnchors = insertPointInPath(localAnchors, { x, y }, element.isClosed);

        if (newAnchors) {
            setLocalAnchors(newAnchors);
            finalizeUpdate(newAnchors);
        }
    };

    // Toggle Smooth/Sharp on Double Click
    const handleDoubleClick = (e, idx) => {
        e.stopPropagation();
        const newAnchors = [...localAnchors];
        const anchor = { ...newAnchors[idx] };

        // Check if currently smooth (handles are extended)
        const isSmooth = getDistance(anchor.handleIn, anchor.point) > 0.1 || getDistance(anchor.handleOut, anchor.point) > 0.1;

        if (isSmooth) {
            // Make Sharp (collapse handles to point)
            anchor.handleIn = { ...anchor.point };
            anchor.handleOut = { ...anchor.point };
        } else {
            // Make Smooth (extend handles)
            // Default extension: 20px horizontally
            anchor.handleIn = { x: anchor.point.x - 20, y: anchor.point.y };
            anchor.handleOut = { x: anchor.point.x + 20, y: anchor.point.y };
        }

        newAnchors[idx] = anchor;
        setLocalAnchors(newAnchors);

        // Commit change immediately
        finalizeUpdate(newAnchors);
    };


    useEffect(() => {
        let animationFrameId;

        const handleWindowMouseMove = (e) => {
            if (activeAnchorIdx === null || !activePart) return;

            // Calculate movement delta in screen pixels using clientX/Y for smoothness
            const dx = (e.clientX - lastMousePos.current.x) / zoom;
            const dy = (e.clientY - lastMousePos.current.y) / zoom;

            lastMousePos.current = { x: e.clientX, y: e.clientY };

            if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return;

            // Update LOCAL state
            setLocalAnchors(prevAnchors => {
                const newAnchors = [...prevAnchors];
                const anchor = { ...newAnchors[activeAnchorIdx] };

                if (activePart === 'point') {
                    anchor.point = { x: anchor.point.x + dx, y: anchor.point.y + dy };
                    anchor.handleIn = { x: anchor.handleIn.x + dx, y: anchor.handleIn.y + dy };
                    anchor.handleOut = { x: anchor.handleOut.x + dx, y: anchor.handleOut.y + dy };
                } else if (activePart === 'handleIn') {
                    anchor.handleIn = { x: anchor.handleIn.x + dx, y: anchor.handleIn.y + dy };
                    if (!isAltPressed) {
                        const mirrored = mirrorHandle(anchor, 'in');
                        anchor.handleOut = mirrored.handleOut;
                    }
                } else if (activePart === 'handleOut') {
                    anchor.handleOut = { x: anchor.handleOut.x + dx, y: anchor.handleOut.y + dy };
                    if (!isAltPressed) {
                        const mirrored = mirrorHandle(anchor, 'out');
                        anchor.handleIn = mirrored.handleIn;
                    }
                }

                newAnchors[activeAnchorIdx] = anchor;
                return newAnchors;
            });
        };

        const handleWindowMouseUp = () => {
            if (activeAnchorIdx !== null) {
                // Commit the local state to global state on mouse up
                finalizeUpdate(localAnchors);
            }
            setActiveAnchorIdx(null);
            setActivePart(null);
        };

        if (activeAnchorIdx !== null) {
            window.addEventListener('mousemove', handleWindowMouseMove);
            window.addEventListener('mouseup', handleWindowMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
            cancelAnimationFrame(animationFrameId);
        };
    }, [activeAnchorIdx, activePart, isAltPressed, zoom, localAnchors, finalizeUpdate]); // Dependencies needed for drag logic

    // Scaled sizes for UI elements so they stay constant visual size regardless of zoom
    const pointRadius = (activePart === 'point' ? 6 : 5) / zoom;
    const handleRadius = 4 / zoom;
    const lineWidth = 2 / zoom; // Slightly thicker for better visibility


    if (!localAnchors || localAnchors.length === 0) return null;

    const hoverPath = generateSVGPath(localAnchors, element.isClosed);

    return (
        <svg
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                overflow: 'visible',
                pointerEvents: 'none' // Let events pass through empty space
            }}
        >
            {/* Live Visible Path during Editing */}
            <path
                d={hoverPath}
                fill={element.fill || 'none'}
                stroke={element.stroke || '#000'}
                strokeWidth={visualStrokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pointerEvents: 'none' }} // Visual only
            />

            {/* Rubber Band Line for Pen Tool */}
            {currentTool === 'pen' && cursorPos && !element.isClosed && localAnchors.length > 0 && (
                <line
                    x1={localAnchors[localAnchors.length - 1].point.x}
                    y1={localAnchors[localAnchors.length - 1].point.y}
                    x2={cursorPos.x - element.x}
                    y2={cursorPos.y - element.y}
                    stroke="#3b82f6"
                    strokeWidth={visualScale * 2}
                    strokeDasharray={`${4 * visualScale}, ${4 * visualScale}`}
                    opacity={0.6}
                />
            )}

            {/* Hit Area for Adding Points */}
            {currentTool === 'pen' && (
                <path
                    d={hoverPath}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={15 / zoom}
                    style={{ pointerEvents: 'stroke', cursor: 'copy' }}
                    onClick={handlePathClick}
                />
            )}

            {localAnchors.map((anchor, idx) => {
                const isFirst = idx === 0;
                const isSelected = selectedAnchorIdx === idx;
                const isHovered = hoveredIdx === idx;

                if (!anchor || !anchor.point) return null;

                // Only show "snap" feedback for the first point when using Pen tool
                const showSnapFeedback = isFirst && currentTool === 'pen' && !element.isClosed;

                return (
                    <g key={`anchor-${idx}`} style={{ pointerEvents: 'auto' }}>
                        {/* Handle Lines */}
                        {anchor.handleIn && (
                            <line
                                x1={anchor.point.x} y1={anchor.point.y}
                                x2={anchor.handleIn.x} y2={anchor.handleIn.y}
                                stroke="#4ade80"
                                strokeWidth={lineWidth / 2}
                                strokeDasharray={`${4 / zoom}, ${4 / zoom}`}
                            />
                        )}
                        {anchor.handleOut && (
                            <line
                                x1={anchor.point.x} y1={anchor.point.y}
                                x2={anchor.handleOut.x} y2={anchor.handleOut.y}
                                stroke="#4ade80"
                                strokeWidth={lineWidth / 2}
                                strokeDasharray={`${4 / zoom}, ${4 / zoom}`}
                            />
                        )}

                        {/* Anchor Point (Main) */}
                        <circle
                            cx={anchor.point.x} cy={anchor.point.y}
                            r={showSnapFeedback && isHovered ? pointRadius * 1.5 : pointRadius}
                            fill={showSnapFeedback && isHovered ? "#8b5cf6" : (idx === activeAnchorIdx || isSelected ? "#f3f4f6" : "#ffffff")} // Highlight selected
                            stroke={showSnapFeedback && isHovered ? "#ffffff" : (isSelected ? "#2563eb" : "#000000")} // Blue stroke if selected
                            strokeWidth={lineWidth}
                            style={{
                                cursor: currentTool === 'pen' && isFirst ? 'pointer' : 'move'
                            }}
                            onMouseDown={(e) => handlePointMouseDown(e, idx, 'point')}
                            onDoubleClick={(e) => handleDoubleClick(e, idx)}
                            onMouseEnter={() => setHoveredIdx(idx)}
                            onMouseLeave={() => setHoveredIdx(null)}
                        />

                        {/* Handle In Control */}
                        {anchor.handleIn && (
                            <circle
                                cx={anchor.handleIn.x} cy={anchor.handleIn.y}
                                r={handleRadius}
                                fill="#4ade80"
                                stroke="#ffffff"
                                strokeWidth={lineWidth / 2}
                                style={{
                                    cursor: 'crosshair',
                                    opacity: (anchor.handleIn.x === anchor.point.x && anchor.handleIn.y === anchor.point.y) ? 0.3 : 1
                                }}
                                onMouseDown={(e) => handlePointMouseDown(e, idx, 'handleIn')}
                            />
                        )}

                        {/* Handle Out Control */}
                        {anchor.handleOut && (
                            <circle
                                cx={anchor.handleOut.x} cy={anchor.handleOut.y}
                                r={handleRadius}
                                fill="#4ade80"
                                stroke="#ffffff"
                                strokeWidth={lineWidth / 2}
                                style={{
                                    cursor: 'crosshair',
                                    opacity: (anchor.handleOut.x === anchor.point.x && anchor.handleOut.y === anchor.point.y) ? 0.3 : 1
                                }}
                                onMouseDown={(e) => handlePointMouseDown(e, idx, 'handleOut')}
                            />
                        )}

                        {/* Snap label / hint */}
                        {showSnapFeedback && isHovered && (
                            <text
                                x={anchor.point.x}
                                y={anchor.point.y - 20 / zoom}
                                fontSize={12 / zoom}
                                textAnchor="middle"
                                fill="#8b5cf6"
                                fontWeight="bold"
                                style={{ pointerEvents: 'none', filter: 'drop-shadow(0 1px 1px white)' }}
                            >
                                Close Path
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
};

export default VectorOverlay;
