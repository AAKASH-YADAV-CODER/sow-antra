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
    const [hoveredHandle, setHoveredHandle] = useState(null); // { idx, part: 'handleIn'|'handleOut' }

    const lastMousePos = useRef({ x: 0, y: 0 });
    const anchorsRef = useRef(localAnchors);
    const elementRef = useRef(element);

    useEffect(() => {
        elementRef.current = element;
    }, [element]);

    // Keep ref in sync for the drag handler
    useEffect(() => {
        anchorsRef.current = localAnchors;
    }, [localAnchors]);

    const finalizeUpdate = useCallback((anchors) => {
        if (!anchors || anchors.length === 0) return;
        const { minX, minY, maxX, maxY } = getPathBoundingBox(anchors);
        const globalX = elementRef.current.x + minX;
        const globalY = elementRef.current.y + minY;
        const width = Math.max(1, maxX - minX);
        const height = Math.max(1, maxY - minY);

        const normalizedAnchors = anchors.map(a => ({
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
    }, [onUpdate]);

    // Sync local state when element updates externally
    useEffect(() => {
        if (activeAnchorIdx === null) {
            setLocalAnchors(element.bezierAnchors || []);
        }
    }, [element.bezierAnchors, activeAnchorIdx]);

    const visualScale = 1 / zoom;
    const visualStrokeWidth = Math.max(visualScale * 2, element.strokeWidth || 2);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey) setIsAltPressed(true);
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnchorIdx !== null) {
                e.preventDefault();
                e.stopPropagation();
                const newAnchors = [...anchorsRef.current];
                newAnchors.splice(selectedAnchorIdx, 1);
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
    }, [selectedAnchorIdx, finalizeUpdate]);

    const handlePointMouseDown = (e, idx, part) => {
        e.stopPropagation();
        e.preventDefault();
        if (currentTool === 'pen' && idx === 0 && part === 'point' && (element.bezierAnchors?.length || 0) >= 2 && !element.isClosed) {
            onUpdate(element.id, { isClosed: true });
            return;
        }

        // Capture pointer so pointermove/pointerup fire even if cursor leaves the SVG
        if (e.target && e.target.setPointerCapture) {
            try { e.target.setPointerCapture(e.pointerId); } catch (_) {}
        }

        setActiveAnchorIdx(idx);
        setActivePart(part);
        if (part === 'point') setSelectedAnchorIdx(idx);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePathClick = (e) => {
        if (currentTool !== 'pen') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        const newAnchors = insertPointInPath(anchorsRef.current, { x, y }, element.isClosed);
        if (newAnchors) {
            setLocalAnchors(newAnchors);
            finalizeUpdate(newAnchors);
        }
    };

    const handleDoubleClick = (e, idx) => {
        e.stopPropagation();
        const newAnchors = [...anchorsRef.current];
        const anchor = { ...newAnchors[idx] };
        const isSmooth = getDistance(anchor.handleIn, anchor.point) > 0.1 || getDistance(anchor.handleOut, anchor.point) > 0.1;

        if (isSmooth) {
            anchor.handleIn = { ...anchor.point };
            anchor.handleOut = { ...anchor.point };
        } else {
            anchor.handleIn = { x: anchor.point.x - 20, y: anchor.point.y };
            anchor.handleOut = { x: anchor.point.x + 20, y: anchor.point.y };
        }
        newAnchors[idx] = anchor;
        setLocalAnchors(newAnchors);
        finalizeUpdate(newAnchors);
    };

    useEffect(() => {
        if (activeAnchorIdx === null) return;

        const handlePointerMove = (e) => {
            if (activeAnchorIdx === null || !activePart) return;

            const dx = (e.clientX - lastMousePos.current.x) / zoom;
            const dy = (e.clientY - lastMousePos.current.y) / zoom;
            lastMousePos.current = { x: e.clientX, y: e.clientY };

            if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return;

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

        const handlePointerUp = () => {
            if (activeAnchorIdx !== null) {
                finalizeUpdate(anchorsRef.current);
            }
            setActiveAnchorIdx(null);
            setActivePart(null);
        };

        // Use pointermove/pointerup to be consistent with onPointerDown
        // This ensures events fire correctly after setPointerCapture
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [activeAnchorIdx, activePart, isAltPressed, zoom, finalizeUpdate]);

    // Scaled sizes for UI elements
    const pointRadius = 5 / zoom;
    const hitRadius = 15 / zoom; // Large invisible hit area for easier grabbing
    const handleRadius = 4 / zoom;
    const handleHitRadius = 12 / zoom; // Large invisible hit area for handles
    const lineWidth = 2 / zoom; 

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
                pointerEvents: 'none' 
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
                style={{ pointerEvents: 'none' }} 
            />

            {/* Rubber Band Line for Pen Tool */}
            {currentTool === 'pen' && cursorPos && !element.isClosed && localAnchors.length > 0 && (
                <line
                    x1={localAnchors[localAnchors.length - 1].point.x}
                    y1={localAnchors[localAnchors.length - 1].point.y}
                    x2={cursorPos.x - element.x}
                    y2={cursorPos.y - element.y}
                    stroke="#2563eb"
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

                const showSnapFeedback = isFirst && currentTool === 'pen' && !element.isClosed;

                return (
                    <g key={`anchor-${idx}`} style={{ pointerEvents: 'auto' }}>
                        {/* Handle Lines */}
                        {anchor.handleIn && (
                            <line
                                x1={anchor.point.x} y1={anchor.point.y}
                                x2={anchor.handleIn.x} y2={anchor.handleIn.y}
                                stroke="#f59e0b"
                                strokeWidth={lineWidth / 2}
                                strokeDasharray={`${4 / zoom}, ${4 / zoom}`}
                            />
                        )}
                        {anchor.handleOut && (
                            <line
                                x1={anchor.point.x} y1={anchor.point.y}
                                x2={anchor.handleOut.x} y2={anchor.handleOut.y}
                                stroke="#f59e0b"
                                strokeWidth={lineWidth / 2}
                                strokeDasharray={`${4 / zoom}, ${4 / zoom}`}
                            />
                        )}

                        {/* Anchor Hit Area (Invisible) */}
                        <circle
                            cx={anchor.point.x} cy={anchor.point.y}
                            r={hitRadius}
                            fill="transparent"
                            style={{ cursor: currentTool === 'pen' && isFirst && !element.isClosed ? 'pointer' : 'move' }}
                            onPointerDown={(e) => handlePointMouseDown(e, idx, 'point')}
                            onDoubleClick={(e) => handleDoubleClick(e, idx)}
                            onMouseEnter={() => setHoveredIdx(idx)}
                            onMouseLeave={() => setHoveredIdx(null)}
                        />

                        {/* Anchor Point (Visible) */}
                        <circle
                            cx={anchor.point.x} cy={anchor.point.y}
                            r={showSnapFeedback && isHovered ? pointRadius * 1.5 : (activeAnchorIdx === idx && activePart === 'point' ? pointRadius * 1.2 : pointRadius)}
                            fill={showSnapFeedback && isHovered ? "#8b5cf6" : (idx === activeAnchorIdx || (isSelected && currentTool === 'pen') ? "#2563eb" : "#ffffff")} 
                            stroke="#2563eb" 
                            strokeWidth={lineWidth}
                            style={{
                                pointerEvents: 'none',
                                filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.2))'
                            }}
                        />

                        {/* Handle In Control */}
                        {anchor.handleIn && (() => {
                            const hInDist = Math.hypot(anchor.handleIn.x - anchor.point.x, anchor.handleIn.y - anchor.point.y);
                            const hInAtPoint = hInDist < 0.5;
                            return (
                            <g>
                                {/* Handle In Hit Area */}
                                {!hInAtPoint && (
                                <circle
                                    cx={anchor.handleIn.x} cy={anchor.handleIn.y}
                                    r={handleHitRadius}
                                    fill="transparent"
                                    style={{ cursor: 'move', pointerEvents: 'auto' }}
                                    onPointerDown={(e) => handlePointMouseDown(e, idx, 'handleIn')}
                                    onMouseEnter={() => setHoveredHandle({ idx, part: 'handleIn' })}
                                    onMouseLeave={() => setHoveredHandle(null)}
                                />)}
                                {/* Handle In Visual */}
                                {!hInAtPoint && (
                                <circle
                                    cx={anchor.handleIn.x} cy={anchor.handleIn.y}
                                    r={hoveredHandle?.idx === idx && hoveredHandle?.part === 'handleIn' ? handleRadius * 1.4 : handleRadius}
                                    fill="#f59e0b"
                                    stroke="#ffffff"
                                    strokeWidth={lineWidth / 2}
                                    style={{
                                        pointerEvents: 'none',
                                        filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.15))',
                                        transition: 'r 0.1s'
                                    }}
                                />)}
                            </g>
                        );})()}

                        {/* Handle Out Control */}
                        {anchor.handleOut && (() => {
                            const hOutDist = Math.hypot(anchor.handleOut.x - anchor.point.x, anchor.handleOut.y - anchor.point.y);
                            const hOutAtPoint = hOutDist < 0.5;
                            return (
                            <g>
                                {/* Handle Out Hit Area */}
                                {!hOutAtPoint && (
                                <circle
                                    cx={anchor.handleOut.x} cy={anchor.handleOut.y}
                                    r={handleHitRadius}
                                    fill="transparent"
                                    style={{ cursor: 'move', pointerEvents: 'auto' }}
                                    onPointerDown={(e) => handlePointMouseDown(e, idx, 'handleOut')}
                                    onMouseEnter={() => setHoveredHandle({ idx, part: 'handleOut' })}
                                    onMouseLeave={() => setHoveredHandle(null)}
                                />)}
                                {/* Handle Out Visual */}
                                {!hOutAtPoint && (
                                <circle
                                    cx={anchor.handleOut.x} cy={anchor.handleOut.y}
                                    r={hoveredHandle?.idx === idx && hoveredHandle?.part === 'handleOut' ? handleRadius * 1.4 : handleRadius}
                                    fill="#f59e0b"
                                    stroke="#ffffff"
                                    strokeWidth={lineWidth / 2}
                                    style={{
                                        pointerEvents: 'none',
                                        filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.15))',
                                        transition: 'r 0.1s'
                                    }}
                                />)}
                            </g>
                        );})()}

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
