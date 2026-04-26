import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Group, RegularPolygon } from 'react-konva';
import DOMTextEditor from './DOMTextEditor';
import ElementFloatingMenu from './ElementFloatingMenu';
import WhiteboardPropertyPanel from './WhiteboardPropertyPanel';
import { recognizeShape } from '../utils/shapeRecognizer';

const WhiteboardCanvas = ({
  stageRef,
  elements,
  tool,
  brushType,
  selectedElementId,
  setSelectedElementId,
  editingTextId,
  setEditingTextId,
  stageScale,
  setStageScale,
  stagePosition,
  setStagePosition,
  drawingProps,
  addElement,
  updateElement,
  smartShapesEnabled,
  layers,
  activeLayerId
}) => {
  const layerRefs = useRef({});
  // const stageRef = useRef(null); // Now using prop
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  const [currentShape, setCurrentShape] = useState(null);
  
  // Smoothing and Dynamics refs
  const pointsRef = useRef([]);
  const lastPointRef = useRef(null);
  const lastTimeRef = useRef(0);
  const currentSpeedRef = useRef(0);
  const STABILIZATION_FACTOR = 0.88; // Slightly more responsive (Higher = faster, lower = smoother)

  // Deterministic randomness helper for stable redraws
  const getPseudoRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Keyboard events for deleting
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        // Find and delete the element via a callback prop if possible,
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stageScale;
    
    // Zoom from center of the screen
    const center = {
      x: stage.width() / 2,
      y: stage.height() / 2
    };

    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };

    let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    newScale = Math.max(0.1, Math.min(newScale, 5));

    setStageScale(newScale);
    setStagePosition({
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    });
  };

  const handleMouseDown = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty && tool === 'select') {
      setSelectedElementId(null);
      setEditingTextId(null);
    }

    if (tool === 'select' || tool === 'pan') return;

    const pos = e.target.getStage().getRelativePointerPosition();
    setIsDrawing(true);
    
    lastTimeRef.current = Date.now();
    currentSpeedRef.current = 0;
    const baseId = Date.now();

    if (tool === 'pen' || tool === 'eraser') {
      const startPoint = { x: pos.x, y: pos.y };
      lastPointRef.current = startPoint;
      
      // Capture initial pressure (fallback to 0.5 for mouse)
      const initialPressure = (e.evt.pressure && e.evt.pressure > 0) ? e.evt.pressure : 0.5;
      pointsRef.current = [pos.x, pos.y, initialPressure]; 

      setCurrentLine({
        id: `line_${baseId}`,
        type: 'line',
        brushType: tool === 'eraser' ? 'eraser' : brushType, 
        points: [pos.x, pos.y, initialPressure],
        stroke: drawingProps.stroke,
        strokeWidth: drawingProps.strokeWidth,
        opacity: drawingProps.opacity || 1,
        flow: drawingProps.flow || 0.5,
        jitter: drawingProps.jitter || 0
      });
    } else if (['rect', 'circle', 'triangle', 'diamond'].includes(tool)) {
      setCurrentShape({
        id: `${tool}_${baseId}`,
        type: tool,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        radius: 0,
        fill: '#ffffff',
        stroke: drawingProps.stroke,
        strokeWidth: drawingProps.strokeWidth,
        text: ''
      });
    } else if (tool === 'sticky') {
      addElement({
        id: `sticky_${baseId}`,
        type: 'sticky',
        x: pos.x - 75,
        y: pos.y - 75,
        width: 150,
        height: 150,
        fill: drawingProps.fill,
        stroke: null,
        text: '',
      });
      setIsDrawing(false);
      // Auto focus text editing for sticky
      setSelectedElementId(`sticky_${baseId}`);
      setEditingTextId(`sticky_${baseId}`);
    } else if (tool === 'text') {
       addElement({
        id: `text_${baseId}`,
        type: 'text',
        x: pos.x,
        y: pos.y - 12,
        width: 200,
        height: 50,
        text: '',
        fontSize: drawingProps.fontSize,
        fill: drawingProps.stroke,
        stroke: null
      });
      setIsDrawing(false);
      // Set to select tool and auto edit
      setSelectedElementId(`text_${baseId}`);
      setEditingTextId(`text_${baseId}`);
      // Not changing tool here to not break parent state without callback, but typically we switch to select
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const pos = e.target.getStage().getRelativePointerPosition();

    if ((tool === 'pen' || tool === 'eraser') && currentLine) {
      if (!lastPointRef.current) return;

      const newX = lastPointRef.current.x + (pos.x - lastPointRef.current.x) * STABILIZATION_FACTOR;
      const newY = lastPointRef.current.y + (pos.y - lastPointRef.current.y) * STABILIZATION_FACTOR;
      
      const now = Date.now();
      const dt = now - lastTimeRef.current;
      const dist = Math.sqrt(Math.pow(newX - lastPointRef.current.x, 2) + Math.pow(newY - lastPointRef.current.y, 2));
      
      if (dt > 0) {
        const instantaneousSpeed = dist / dt;
        currentSpeedRef.current = currentSpeedRef.current * 0.8 + instantaneousSpeed * 0.2;
      }
      lastTimeRef.current = now;
      
      // Optimization: Only add point if moved or for the very second point to ensure stroke start
      if (dist > 0.5 || pointsRef.current.length === 3) { 
        lastPointRef.current = { x: newX, y: newY };
        
        // PRESSURE CALCULATION:
        // Priority: 1. e.evt.pressure (if valid tablet pressure) 
        //           2. speed-based simulation (faster = less pressure)
        let pressure = 0.5;
        if (e.evt.pressure && e.evt.pressure > 0 && e.evt.pressure !== 0.5) {
          pressure = e.evt.pressure;
        } else {
          // Speed to Pressure: 0 speed = 1 pressure, 5 speed = 0 pressure
          pressure = Math.max(0.1, 1 - (currentSpeedRef.current * 0.15));
        }

        pointsRef.current.push(newX, newY, pressure);
        
        setCurrentLine(prev => ({
          ...prev,
          points: [...pointsRef.current] 
        }));
      }
    } else if (['rect', 'circle', 'triangle', 'diamond'].includes(tool) && currentShape) {
      setCurrentShape(prev => {
        const width = pos.x - prev.x;
        const height = pos.y - prev.y;
        const radius = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
        return {
          ...prev,
          width,
          height,
          radius: tool === 'rect' ? 0 : radius
        };
      });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);

      if ((tool === 'pen' || tool === 'eraser') && currentLine) {
        // Smart Shape Recognition
        if (tool === 'pen' && smartShapesEnabled) {
          const recognized = recognizeShape(currentLine.points);
          if (recognized) {
            const baseProps = {
              id: Date.now().toString(),
              stroke: currentLine.stroke,
              strokeWidth: currentLine.strokeWidth,
              opacity: currentLine.opacity,
            };

            if (recognized.type === 'circle') {
              addElement({ ...baseProps, type: 'circle', x: recognized.x, y: recognized.y, radius: recognized.radius });
            } else if (recognized.type === 'rect') {
              addElement({ ...baseProps, type: 'rect', x: recognized.x, y: recognized.y, width: recognized.width, height: recognized.height });
            } else if (recognized.type === 'line') {
              // Convert freehand to straight line
              addElement({ ...baseProps, type: 'line', points: [recognized.x1, recognized.y1, 1, recognized.x2, recognized.y2, 1] });
            }
          } else {
            addElement(currentLine);
          }
        } else {
          addElement(currentLine);
        }

        // Important: We don't null currentLine immediately to prevent flickering
        // Instead, we wait for the next frame or use a small timeout if needed,
        // but adding it to elements first usually handles it if we manage the nulling carefully.
        
        // Reset drawing refs
        pointsRef.current = []; 
        lastPointRef.current = null;
        currentSpeedRef.current = 0;

        // Increase delay significantly to ensure main elements layer has updated
        setTimeout(() => {
          setCurrentLine(null);
        }, 150);
      } else if (['rect', 'circle', 'triangle', 'diamond'].includes(tool) && currentShape) {
        addElement(currentShape);
        setTimeout(() => {
          setCurrentShape(null);
        }, 150);
      }
    }
  };

  // Performance: Auto-cache static layers
  useEffect(() => {
    if (isDrawing) return;
    
    // Small delay to ensure render is complete before caching
    const timer = setTimeout(() => {
      Object.keys(layerRefs.current).forEach(id => {
        const layer = layerRefs.current[id];
        if (layer) {
          // Clear cache before re-caching to avoid artifacts
          layer.clearCache();
          
          // Get layer bounds to ensure we cache enough area including bleeds
          const box = layer.getClientRect({ skipTransform: true });
          if (box.width > 0 && box.height > 0) {
            layer.cache({
              x: box.x - 50,
              y: box.y - 50,
              width: box.width + 100,
              height: box.height + 100,
              pixelRatio: window.devicePixelRatio || 1
            });
          }
          layer.draw();
        }
      });
    }, 200);
    
    return () => clearTimeout(timer);
  }, [elements, isDrawing, stageScale]);

  const handleDragEnd = (e, id) => {
    updateElement(id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const renderElement = (el) => {
    const isSelected = selectedElementId === el.id;
    const draggable = tool === 'select';
    
    const commonProps = {
      key: el.id,
      id: el.id,
      x: el.x,
      y: el.y,
      draggable,
      opacity: el.opacity !== undefined ? el.opacity : 1,
      onClick: () => {
        if (tool === 'select') setSelectedElementId(el.id);
      },
      onTap: () => {
        if (tool === 'select') setSelectedElementId(el.id);
      },
      onDblClick: () => {
        if (tool === 'select') setEditingTextId(el.id);
      },
      onDblTap: () => {
        if (tool === 'select') setEditingTextId(el.id);
      },
      onDragEnd: (e) => handleDragEnd(e, el.id),
    };

    const { key, ...cleanCommonProps } = commonProps;

    const isShape = ['rect', 'circle', 'triangle', 'diamond', 'sticky', 'text'].includes(el.type);
    const shadowProps = isSelected && tool === 'select' && isShape ? {
      shadowColor: '#8b3dff',
      shadowBlur: 10,
      shadowOpacity: 0.6
    } : {};

    // For rendering inner text across all shape types
    const textNode = (width, height, isCentered = true) => (
      <Text
        text={el.text || ''}
        width={width}
        height={height}
        x={isCentered ? -width / 2 : 0}
        y={isCentered ? -height / 2 : 0}
        align="center"
        verticalAlign="middle"
        fontSize={el.fontSize || 16}
        fontFamily="Inter, sans-serif"
        fill="#333"
        padding={10}
        opacity={1} // Important: keep text opaque even if shape has opacity
      />
    );

    switch (el.type) {
      case 'line':
        // Standard Konva Line expects [x, y, x, y...]. 
        // We store [x, y, s, x, y, s...]. We must filter out 's' for standard lines.
        const renderPoints = [];
        for (let i = 0; i < el.points.length; i += 3) {
           renderPoints.push(el.points[i], el.points[i+1]);
        }

        const baseLine = {
          ...cleanCommonProps,
          points: renderPoints,
          stroke: el.stroke,
          strokeWidth: el.strokeWidth,
          tension: 0.5,
          lineCap: "round",
          lineJoin: "round",
          ...shadowProps
        };

        if (el.brushType === 'pencil') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                const baseOpacity = el.opacity || 1;
                
                context.beginPath();
                context.lineCap = 'round';
                context.lineJoin = 'round';
                context.strokeStyle = el.stroke;
                
                context.moveTo(points[0], points[1]);
                for (let i = 3; i < points.length; i += 3) {
                  const speed = points[i+2] || 1;
                  const taper = Math.min(1, i / (points.length * 0.2)) * Math.min(1, (points.length - i) / (points.length * 0.2));
                  context.lineWidth = Math.max(0.2, (el.strokeWidth * 0.4) * (1 - speed * 0.1) * taper);
                  context.globalAlpha = baseOpacity * 0.6 * taper;
                  context.lineTo(points[i], points[i+1]);
                }
                context.stroke();

                // Graphite grain
                for (let i = 0; i < points.length; i += 3) {
                  const px = points[i];
                  const py = points[i+1];
                  const pressure = points[i+2] || 0.5;
                  const density = Math.floor(4 * pressure);
                  for (let d = 0; d < density; d++) {
                    const salt = px * 12.9898 + py * 78.233 + d;
                    const r1 = (Math.sin(salt) * 43758.5453) % 1;
                    const r2 = (Math.cos(salt) * 43758.5453) % 1;
                    if (r1 > 0.6) {
                      context.globalAlpha = baseOpacity * 0.2;
                      context.fillRect(px + r1 * el.strokeWidth, py + r2 * el.strokeWidth, 0.8, 0.8);
                    }
                  }
                }
              }}
            />
          );
        } else if (el.brushType === 'pen' || !el.brushType) {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.beginPath();
                context.lineCap = 'round';
                context.lineJoin = 'round';
                context.strokeStyle = el.stroke;
                
                context.globalAlpha = el.opacity || 1;
                for (let i = 0; i < points.length - 3; i += 3) {
                  const speed = points[i+2] || 1;
                  const progress = i / points.length;
                  const taper = Math.min(progress * 8, (1 - progress) * 8, 1);
                  context.lineWidth = Math.max(1, el.strokeWidth * (1 - speed * 0.2) * taper);
                  context.beginPath();
                  context.moveTo(points[i], points[i+1]);
                  context.lineTo(points[i+3], points[i+4]);
                  context.stroke();
                }
              }}
            />
          );
        } else if (el.brushType === 'eraser') {
          return <Line key={key} {...baseLine} globalCompositeOperation="destination-out" strokeWidth={el.strokeWidth * 2} stroke="#fff" />;
        } else if (el.brushType === 'highlighter') {
          return <Line key={key} {...baseLine} opacity={(el.opacity || 1) * 0.4} strokeWidth={el.strokeWidth * 3} lineCap="square" globalCompositeOperation="multiply" />;
        } else if (el.brushType === 'brush') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.beginPath();
                context.lineCap = 'butt';
                context.lineJoin = 'bevel';
                context.fillStyle = el.stroke;
                const baseOpacity = el.opacity || 1;
                const flow = el.flow || 0.6;
                const radius = el.strokeWidth / 2;
                
                for (let i = 0; i < points.length - 3; i += 3) {
                  const x1 = points[i], y1 = points[i+1], x2 = points[i+3], y2 = points[i+4];
                  const pressure = points[i+2] || 0.5;
                  const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                  const steps = Math.max(1, Math.floor(dist / 2.0)); // Optimized step size (from 0.4 to 2.0)
                  
                  const angle = Math.atan2(y2 - y1, x2 - x1);
                  
                  for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const px = x1 + (x2 - x1) * t;
                    const py = y1 + (y2 - y1) * t;
                    const progress = i / points.length;
                    const taper = Math.min(progress * 5, (1 - progress) * 5, 1);
                    const depletion = 1 - (progress * 0.15);
                    
                    // Main Flat Brush Mark
                    context.save();
                    context.translate(px, py);
                    context.rotate(angle);
                    
                    const w = radius * 2 * pressure;
                    const h = Math.max(1, radius * 0.1);
                    
                    context.globalAlpha = baseOpacity * 0.8 * taper * depletion * flow * pressure; // Increased from 0.25 to 0.8
                    context.fillRect(-w/2, -h/2, w, h);

                    //Bristle marks (Scumble effect)
                    const bristleCount = Math.floor(6 * pressure);
                    for (let d = 0; d < bristleCount; d++) {
                      const salt = px * 12.9898 + py * 78.233 + d;
                      const r1 = (Math.sin(salt) * 43758.5453) % 1;
                      const offW = r1 * w * 0.9;
                      const offH = Math.cos(salt) * h * 4; // Longer bristles
                      
                      context.globalAlpha = baseOpacity * 0.4 * taper * depletion * flow; // Increased from 0.15 to 0.4
                      context.fillRect(offW - 1, offH - 1, 1.5, 1.5);
                    }
                    context.restore();
                  }
                }
                context.globalAlpha = 1;
              }}
            />
          );
        } else if (el.brushType === 'palette') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.beginPath();
                context.fillStyle = el.stroke;
                const baseOpacity = el.opacity || 1;
                for (let i = 0; i < points.length - 3; i += 3) {
                  const x1 = points[i], y1 = points[i+1], x2 = points[i+3], y2 = points[i+4];
                  const speed = points[i+2] || 1;
                  const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                  const steps = Math.max(1, Math.floor(dist / 2));
                  const angle = Math.atan2(y2 - y1, x2 - x1);
                  for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const px = x1 + (x2 - x1) * t;
                    const py = y1 + (y2 - y1) * t;
                    context.save();
                    context.translate(px, py);
                    context.rotate(angle + Math.PI/4); // 45 degree tilt
                    const w = el.strokeWidth * 3 * (1 + speed * 0.5);
                    const h = el.strokeWidth * 0.8;
                    context.globalAlpha = baseOpacity * 0.8;
                    context.fillRect(-w/2, -h/2, w, h);
                    // Add "broken" paint texture at edges
                    if (speed > 0.6) {
                       context.globalAlpha = baseOpacity * 0.4;
                       context.fillRect(w/2, -h/2, w*0.2, h);
                    }
                    context.restore();
                  }
                }
              }}
            />
          );
        } else if (el.brushType === 'foliage') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 3) return;
                context.beginPath();
                context.fillStyle = el.stroke;
                const baseOpacity = el.opacity || 1;
                for (let i = 0; i < points.length; i += 6) {
                  const px = points[i], py = points[i+1], p = points[i+2] || 0.5;
                  const clusterSize = el.strokeWidth * 2 * p;
                  const leaves = Math.floor(12 * p);
                  for (let j = 0; j < leaves; j++) {
                    const salt = px * 12.9898 + py * 78.233 + j;
                    const r1 = (Math.sin(salt) * 43758.5453) % 1;
                    const r2 = (Math.cos(salt) * 43758.5453) % 1;
                    const lx = px + r1 * clusterSize;
                    const ly = py + r2 * clusterSize;
                    context.save();
                    context.translate(lx, ly);
                    context.rotate(r1 * Math.PI);
                    context.globalAlpha = baseOpacity * (0.4 + Math.abs(r2) * 0.6);
                    // Draw a leaf shape (diamond/oval)
                    context.beginPath();
                    context.moveTo(0, -el.strokeWidth/2);
                    context.lineTo(el.strokeWidth/4, 0);
                    context.lineTo(0, el.strokeWidth/2);
                    context.lineTo(-el.strokeWidth/4, 0);
                    context.fill();
                    context.restore();
                  }
                }
              }}
            />
          );
        } else if (el.brushType === 'oil') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.lineCap = 'round';
                context.lineJoin = 'round';
                const baseOpacity = el.opacity || 1;
                const radius = el.strokeWidth / 2;
                
                for (let i = 0; i < points.length - 3; i += 3) {
                  const x1 = points[i], y1 = points[i+1], x2 = points[i+3], y2 = points[i+4];
                  const pressure = points[i+2] || 0.5;
                  const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                  const steps = Math.max(1, Math.floor(dist / 1.0));
                  
                  const angle = Math.atan2(y2 - y1, x2 - x1);
                  
                  for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const px = x1 + (x2 - x1) * t;
                    const py = y1 + (y2 - y1) * t;
                    
                    const progress = i / points.length;
                    const taper = Math.min(progress * 10, (1 - progress) * 10, 1);
                    const currentRadius = radius * pressure * taper;
                    
                    // 1. Thick Base (The "body" of the paint)
                    context.globalAlpha = baseOpacity;
                    context.fillStyle = el.stroke;
                    context.beginPath();
                    context.arc(px, py, currentRadius, 0, Math.PI * 2);
                    context.fill();

                    // 2. Impasto Highlight (The 3D "ridge" of the paint)
                    // Offset slightly to simulate top-down lighting
                    const highlightOffset = currentRadius * 0.3;
                    context.globalAlpha = baseOpacity * 0.3;
                    context.fillStyle = '#ffffff';
                    context.beginPath();
                    context.arc(px - highlightOffset, py - highlightOffset, currentRadius * 0.4, 0, Math.PI * 2);
                    context.fill();

                    // 3. Shadow Edge (Depth)
                    context.globalAlpha = baseOpacity * 0.2;
                    context.fillStyle = '#000000';
                    context.beginPath();
                    context.arc(px + highlightOffset, py + highlightOffset, currentRadius * 0.9, 0, Math.PI * 2);
                    context.stroke();

                    // 4. Bristle Texture (The brush marks)
                    if (s % 5 === 0) {
                      context.save();
                      context.translate(px, py);
                      context.rotate(angle);
                      context.globalAlpha = baseOpacity * 0.15;
                      context.strokeStyle = '#ffffff';
                      context.lineWidth = 1;
                      context.beginPath();
                      context.moveTo(-currentRadius, -currentRadius * 0.5);
                      context.lineTo(currentRadius, -currentRadius * 0.5);
                      context.stroke();
                      context.restore();
                    }
                  }
                }
                context.globalAlpha = 1;
              }}
            />
          );
        } else if (el.brushType === 'cloud') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              strokeWidth={el.strokeWidth * 10}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.beginPath();
                const baseOpacity = el.opacity || 1;
                for (let i = 0; i < points.length - 3; i += 3) {
                  const x1 = points[i], y1 = points[i+1], x2 = points[i+3], y2 = points[i+4];
                  const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                  const steps = Math.max(1, Math.floor(dist / 8));
                  for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const px = x1 + (x2 - x1) * t;
                    const py = y1 + (y2 - y1) * t;
                    const radius = el.strokeWidth * 4;
                    const grad = context.createRadialGradient(px, py, 0, px, py, radius);
                    grad.addColorStop(0, el.stroke);
                    grad.addColorStop(0.4, el.stroke);
                    grad.addColorStop(1, 'transparent');
                    context.fillStyle = grad;
                    context.globalAlpha = baseOpacity * 0.05;
                    context.beginPath();
                    context.arc(px, py, radius, 0, Math.PI * 2);
                    context.fill();
                  }
                }
              }}
            />
          );
        } else if (el.brushType === 'crayon') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.beginPath();
                
                context.lineCap = 'round';
                context.lineJoin = 'round';
                
                // Crayon: Waxy texture with paper grain simulation
                const strokePoints = el.points;
                const baseOpacity = el.opacity || 1;
                
                for (let i = 0; i < strokePoints.length - 3; i += 3) {
                  const x1 = strokePoints[i];
                  const y1 = strokePoints[i+1];
                  const x2 = strokePoints[i+3];
                  const y2 = strokePoints[i+4];
                  const speed = strokePoints[i+2] || 1;
                  
                  const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                  // Optimization: Increase step size for performance while maintaining waxy look
                  const steps = Math.max(1, Math.floor(dist / 2.0)); 
                  
                  for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const px = x1 + (x2 - x1) * t;
                    const py = y1 + (y2 - y1) * t;
                    
                    const progress = i / strokePoints.length;
                    const taper = Math.min(progress * 10, (1 - progress) * 10, 1);
                    
                    // 1. Soft base coverage (the "wax" that fills the grain)
                    context.beginPath();
                    context.fillStyle = el.stroke;
                    context.globalAlpha = baseOpacity * 0.15 * taper * (1 - speed * 0.1);
                    context.arc(px, py, el.strokeWidth * 0.5, 0, Math.PI * 2);
                    context.fill();
                    
                    // 2. Gritty grain particles (the "wax" that catches on peaks)
                    const particleCount = 6;
                    for (let d = 0; d < particleCount; d++) {
                      // Deterministic noise for consistent grain
                      const salt = Math.floor(px) * 12.9898 + Math.floor(py) * 78.233 + d;
                      const r1 = (Math.sin(salt) * 43758.5453) % 1;
                      const r2 = (Math.cos(salt) * 43758.5453) % 1;
                      
                      const offsetX = (r1 * el.strokeWidth * 0.8);
                      const offsetY = (r2 * el.strokeWidth * 0.8);
                      
                      // Cluster particles towards the center but allow some stray grains
                      const pRadius = Math.max(0.4, (el.strokeWidth * 0.12) * Math.abs(r1));
                      
                      context.beginPath();
                      context.globalAlpha = baseOpacity * Math.abs(r2) * 0.5 * taper;
                      context.arc(px + offsetX, py + offsetY, pRadius, 0, Math.PI * 2);
                      context.fill();
                    }
                  }
                }
                context.globalAlpha = 1;
              }}
            />
          );
        } else if (el.brushType === 'watercolor') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              globalCompositeOperation="multiply"
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.lineCap = 'round';
                context.lineJoin = 'round';
                const baseOpacity = el.opacity || 1;
                const bleedRadius = el.strokeWidth * 1.8; // Increased for better wash

                for (let i = 0; i < points.length - 3; i += 3) {
                  const x1 = points[i];
                  const y1 = points[i+1];
                  const x2 = points[i+3];
                  const y2 = points[i+4];
                  const speed = points[i+2] || 1;
                  const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                  
                  // Much denser steps for smoothness (from 2.5 to 0.8)
                  const steps = Math.max(1, Math.floor(dist / 0.8)); 
                  
                  for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const px = x1 + (x2 - x1) * t;
                    const py = y1 + (y2 - y1) * t;
                    
                    const progress = i / points.length;
                    // Dynamic radius for a "watery" flow look
                    const radius = bleedRadius * (1.1 + Math.sin(progress * 12) * 0.15) * Math.max(0.8, 1 - speed * 0.1);
                    
                    const grad = context.createRadialGradient(px, py, 0, px, py, radius);
                    grad.addColorStop(0, el.stroke);
                    grad.addColorStop(0.2, el.stroke);
                    grad.addColorStop(0.6, 'transparent'); // Softer falloff
                    
                    context.fillStyle = grad;
                    // Lower opacity per step because we have more steps now
                    context.globalAlpha = baseOpacity * Math.max(0.01, 0.04 - speed * 0.01);
                    
                    context.beginPath();
                    context.arc(px, py, radius, 0, Math.PI * 2);
                    context.fill();

                    // Occasional "pigment" spots for texture
                    if (s % 10 === 0) {
                      context.globalAlpha = baseOpacity * 0.02;
                      context.beginPath();
                      context.arc(px + (Math.random()-0.5)*radius, py + (Math.random()-0.5)*radius, radius*0.3, 0, Math.PI * 2);
                      context.fill();
                    }
                  }
                }
                context.globalAlpha = 1;
              }}
            />
          );
        } else if (el.brushType === 'airbrush') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.beginPath();
                context.lineCap = 'round';
                context.lineJoin = 'round';
                for (let i = 0; i < points.length - 3; i += 3) {
                  const x1 = points[i];
                  const y1 = points[i+1];
                  const x2 = points[i+3];
                  const y2 = points[i+4];
                  const speed = points[i+2] || 1;
                  const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                  const steps = Math.max(1, Math.floor(dist / 6));
                  for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const px = x1 + (x2 - x1) * t;
                    const py = y1 + (y2 - y1) * t;
                    const speedFactor = Math.max(0.15, 1 - (speed * 0.2));
                    const radius = el.strokeWidth * 5 * speedFactor;
                    const opacity = 0.08 * speedFactor;
                    const grad = context.createRadialGradient(px, py, 0, px, py, radius);
                    grad.addColorStop(0, el.stroke);
                    grad.addColorStop(1, 'transparent');
                    context.fillStyle = grad;
                    context.globalAlpha = (el.opacity || 1) * opacity;
                    context.beginPath();
                    context.arc(px, py, radius, 0, Math.PI * 2);
                    context.fill();
                  }
                }
                context.globalAlpha = 1;
              }}
            />
          );
        } else if (el.brushType === 'splatter') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
               sceneFunc={(context, shape) => {
                 const points = el.points;
                 if (points.length < 3) return;
                 context.beginPath();
                 context.beginPath();
                 context.fillStyle = el.stroke;
                 context.globalAlpha = el.opacity || 1;
                 for (let i = 0; i < points.length; i += 6) {
                    const px = points[i];
                    const py = points[i+1];
                    const speed = points[i+2] || 1;
                    const salt = px * 12.9898 + py * 78.233;
                    const pseudoRandom1 = (Math.sin(salt) * 43758.5453) - Math.floor(Math.sin(salt) * 43758.5453);
                    const pseudoRandom2 = (Math.cos(salt) * 43758.5453) - Math.floor(Math.cos(salt) * 43758.5453);
                    const spread = el.strokeWidth * (3 + speed * 2);
                    const cx = px + (pseudoRandom1 - 0.5) * spread;
                    const cy = py + (pseudoRandom2 - 0.5) * spread;
                    const radius = (pseudoRandom1 * el.strokeWidth) / (1 + speed * 1.5);
                    context.moveTo(cx + radius, cy);
                    context.arc(cx, cy, Math.max(radius, 0.5), 0, Math.PI * 2);
                    if (pseudoRandom1 > 0.6) {
                       const offset = spread * 1.5;
                       context.moveTo(px + (pseudoRandom2 - 0.5) * offset + 0.8, py + (pseudoRandom1 - 0.5) * offset);
                       context.arc(px + (pseudoRandom2 - 0.5) * offset, py + (pseudoRandom1 - 0.5) * offset, 0.8, 0, Math.PI * 2);
                    }
                 }
                 context.fill();
               }}
               strokeHitEnabled={false}
               fillHitEnabled={true}
             />
          );
        } else if (el.brushType === 'charcoal') {
          return (
            <Line
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.beginPath();
                context.fillStyle = el.stroke;
                context.shadowColor = el.stroke;
                context.shadowBlur = el.strokeWidth * 1.5;
                for (let i = 0; i < points.length; i += 3) {
                  const px = points[i];
                  const py = points[i+1];
                  const speed = points[i+2] || 1;
                  const density = Math.max(1, 4 - speed);
                  for (let d = 0; d < density; d++) {
                    const salt = px * 12.9898 + py * 78.233 + d;
                    const r1 = (Math.sin(salt) * 43758.5453) % 1;
                    const r2 = (Math.cos(salt) * 43758.5453) % 1;
                    const offsetX = r1 * el.strokeWidth;
                    const offsetY = r2 * el.strokeWidth;
                    const radius = Math.abs(r1) * (el.strokeWidth * 0.4);
                    context.globalAlpha = (el.opacity || 1) * Math.abs(r2) * 0.4;
                    context.beginPath();
                    context.arc(px + offsetX, py + offsetY, radius, 0, Math.PI * 2);
                    context.fill();
                  }
                }
                context.shadowBlur = 0;
                context.globalAlpha = 1;
              }}
            />
          );
        } else if (el.brushType === 'marker') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              globalCompositeOperation="multiply"
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.beginPath();
                context.lineCap = 'butt';
                context.lineJoin = 'bevel';
                context.strokeStyle = el.stroke;
                context.globalAlpha = (el.opacity || 1) * 0.7;
                context.lineWidth = el.strokeWidth * 2;
                context.moveTo(points[0], points[1]);
                for (let i = 3; i < points.length; i += 3) {
                  context.lineTo(points[i], points[i+1]);
                }
                context.stroke();
              }}
            />
          );
        } else if (el.brushType === 'spray') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 3) return;
                context.beginPath();
                context.fillStyle = el.stroke;
                for (let i = 0; i < points.length; i += 3) {
                  const px = points[i];
                  const py = points[i+1];
                  const speed = points[i+2] || 1;
                  const density = Math.max(2, 8 - speed);
                  const radius = el.strokeWidth * 3;
                  for (let d = 0; d < density; d++) {
                    const salt = px * 12.9898 + py * 78.233 + d;
                    const r1 = (Math.sin(salt) * 43758.5453) % 1;
                    const r2 = (Math.cos(salt) * 43758.5453) % 1;
                    const angle = r1 * Math.PI * 2;
                    const mag = Math.abs(r2) * radius;
                    const offsetX = Math.cos(angle) * mag;
                    const offsetY = Math.sin(angle) * mag;
                    context.globalAlpha = (el.opacity || 1) * (1 - mag / radius) * 0.3;
                    context.beginPath();
                    context.arc(px + offsetX, py + offsetY, 0.5, 0, Math.PI * 2);
                    context.fill();
                  }
                }
              }}
            />
          );
        } else if (el.brushType === 'neon') {
          return (
             <Line 
               key={key} 
               {...cleanCommonProps}
               points={renderPoints} 
               stroke={el.stroke} 
               strokeWidth={el.strokeWidth} 
               tension={0.5} 
               lineCap="round" 
               lineJoin="round" 
               opacity={el.opacity || 1}
               shadowColor={el.stroke}
               shadowBlur={20}
               shadowOpacity={0.8}
             />
          );
        } else if (el.brushType === 'ink') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.beginPath();
                context.lineCap = 'round';
                context.lineJoin = 'round';
                context.fillStyle = el.stroke;
                context.globalAlpha = el.opacity || 1;
                
                for (let i = 0; i < points.length - 3; i += 3) {
                  const x1 = points[i];
                  const y1 = points[i+1];
                  const x2 = points[i+3];
                  const y2 = points[i+4];
                  const speed = points[i+2] || 1;
                  
                  const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                  const steps = Math.max(1, Math.floor(dist / 2.0)); // Optimized step size (from 0.5)
                  
                  for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const px = x1 + (x2 - x1) * t;
                    const py = y1 + (y2 - y1) * t;
                    const progress = i / points.length;
                    const pressure = Math.max(0.1, 1 - speed * 0.2) * Math.min(progress * 15, (1-progress)*15, 1);
                    context.globalAlpha = (el.opacity || 1) * Math.min(1, 0.8 + speed * 0.2); // Faster = more ink flow
                    context.beginPath();
                    context.arc(px, py, (el.strokeWidth / 2) * pressure, 0, Math.PI * 2);
                    context.fill();
                  }
                }
                context.globalAlpha = 1;
              }}
            />
          );
        } else if (el.brushType === 'fill') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 3) return;
                context.beginPath();
                context.fillStyle = el.stroke;
                context.globalAlpha = (el.opacity || 1) * 0.3;
                
                context.beginPath();
                context.moveTo(points[0], points[1]);
                for (let i = 3; i < points.length; i += 3) {
                  context.lineTo(points[i], points[i+1]);
                }
                context.fill();
                context.globalAlpha = 1;
              }}
            />
          );
        } else if (el.brushType === 'pixel') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.beginPath();
                context.fillStyle = el.stroke;
                const flow = el.flow || 0.5; 
                const jitter = el.jitter || 0;
                for (let i = 0; i < points.length - 3; i += 3) {
                  const pressure = points[i+2] || 0.5;
                  const x1 = points[i];
                  const y1 = points[i+1];
                  const x2 = points[i+3];
                  const y2 = points[i+4];
                  const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                  const steps = Math.max(1, Math.floor(dist / 0.5));
                  for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const px = x1 + (x2 - x1) * t;
                    const py = y1 + (y2 - y1) * t;
                    const seed = (Math.floor(px) * 12.9898 + Math.floor(py) * 78.233);
                    const offX = (getPseudoRandom(seed) - 0.5) * jitter;
                    const offY = (getPseudoRandom(seed + 1) - 0.5) * jitter;
                    const size = el.strokeWidth * pressure;
                    context.globalAlpha = (el.opacity || 1) * flow * pressure;
                    context.fillRect(px + offX - size/2, py + offY - size/2, size, size);
                  }
                }
              }}
            />
          );
        } else if (el.brushType === 'smudge') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.beginPath();
                const flow = el.flow || 0.5;
                const jitter = el.jitter || 0;
                for (let i = 0; i < points.length - 3; i += 3) {
                  const pressure = points[i+2] || 0.5;
                  const x1 = points[i];
                  const y1 = points[i+1];
                  const x2 = points[i+3];
                  const y2 = points[i+4];
                  const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                  const steps = Math.max(1, Math.floor(dist / 2));
                  for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const px = x1 + (x2 - x1) * t;
                    const py = y1 + (y2 - y1) * t;
                    const seed = (Math.floor(px) * 12.9898 + Math.floor(py) * 78.233);
                    const offX = (getPseudoRandom(seed) - 0.5) * jitter;
                    const offY = (getPseudoRandom(seed + 1) - 0.5) * jitter;
                    const radius = el.strokeWidth * 1.5 * pressure;
                    const grad = context.createRadialGradient(px + offX, py + offY, 0, px + offX, py + offY, radius);
                    grad.addColorStop(0, el.stroke);
                    grad.addColorStop(1, 'transparent');
                    context.fillStyle = grad;
                    context.globalAlpha = (el.opacity || 1) * 0.15 * flow * pressure;
                    context.beginPath();
                    context.arc(px + offX, py + offY, radius, 0, Math.PI * 2);
                    context.fill();
                  }
                }
              }}
            />
          );
        } else if (el.brushType === 'texture') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.beginPath();
                context.fillStyle = el.stroke;
                for (let i = 0; i < points.length - 3; i += 3) {
                  const x1 = points[i];
                  const y1 = points[i+1];
                  const x2 = points[i+3];
                  const y2 = points[i+4];
                  const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                  const steps = Math.max(1, Math.floor(dist / 1));
                  for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const px = x1 + (x2 - x1) * t;
                    const py = y1 + (y2 - y1) * t;
                    const density = 6;
                    for (let j = 0; j < density; j++) {
                      const salt = Math.floor(px) * 12.9898 + Math.floor(py) * 78.233 + j;
                      const r = (Math.sin(salt) * 43758.5453) % 1;
                      const offX = r * el.strokeWidth;
                      const offY = Math.cos(salt) * el.strokeWidth;
                      context.globalAlpha = (el.opacity || 1) * 0.4;
                      context.fillRect(px + offX, py + offY, 1.5, 1.5);
                    }
                  }
                }
              }}
            />
          );
        } else if (el.brushType === 'particle') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 3) return;
                context.beginPath();
                context.fillStyle = el.stroke;
                const flow = el.flow || 0.5;
                const jitter = el.jitter || 0;
                for (let i = 0; i < points.length; i += 3) {
                  const px = points[i];
                  const py = points[i+1];
                  const pressure = points[i+2] || 0.5;
                  const particleCount = Math.floor(10 * flow * pressure);
                  for (let j = 0; j < particleCount; j++) {
                    const salt = px * 12.9898 + py * 78.233 + j;
                    const r1 = (Math.sin(salt) * 43758.5453) % 1;
                    const r2 = (Math.cos(salt) * 43758.5453) % 1;
                    const spread = (el.strokeWidth + jitter) * (2 * pressure);
                    context.globalAlpha = (el.opacity || 1) * Math.abs(r1) * flow;
                    context.beginPath();
                    context.arc(px + r1 * spread, py + r2 * spread, Math.abs(r1) * 2.5 * pressure, 0, Math.PI * 2);
                    context.fill();
                  }
                }
              }}
            />
          );
        } else if (el.brushType === 'hair') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.beginPath();
                context.strokeStyle = el.stroke;
                context.lineWidth = 0.5;
                const strands = 12;
                const jitter = el.jitter || 0;
                for (let j = 0; j < strands; j++) {
                  const pressure = points[2] || 0.5; // Use start pressure for strands
                  const offset = (j - strands/2) * (el.strokeWidth / strands) * 2 * pressure;
                  const seed = j * 1.5;
                  const jitterOff = (getPseudoRandom(seed) - 0.5) * jitter;
                  context.beginPath();
                  context.globalAlpha = (el.opacity || 1) * (1 - Math.abs(j - strands/2) / (strands/2 + 1));
                  context.moveTo(points[0] + offset + jitterOff, points[1] + offset + jitterOff);
                  for (let i = 3; i < points.length; i += 3) {
                    const p = points[i+2] || 0.5;
                    context.lineTo(points[i] + offset * p + jitterOff, points[i+1] + offset * p + jitterOff);
                  }
                  context.stroke();
                }
              }}
            />
          );
        } else if (el.brushType === 'clone') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                const offset = el.strokeWidth * 2;
                context.beginPath();
                context.strokeStyle = el.stroke;
                context.lineWidth = el.strokeWidth;
                context.globalAlpha = el.opacity || 1;
                context.lineCap = 'round';
                context.lineJoin = 'round';
                
                // Main
                context.beginPath();
                context.moveTo(points[0], points[1]);
                for (let i = 3; i < points.length; i += 3) context.lineTo(points[i], points[i+1]);
                context.stroke();
                
                // Clone
                context.beginPath();
                context.moveTo(points[0] + offset, points[1] + offset);
                for (let i = 3; i < points.length; i += 3) context.lineTo(points[i] + offset, points[i+1] + offset);
                context.stroke();
              }}
            />
          );
        } else if (el.brushType === 'filter') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.beginPath();
                context.strokeStyle = el.stroke;
                context.lineWidth = el.strokeWidth;
                context.lineCap = 'round';
                context.lineJoin = 'round';
                context.globalAlpha = (el.opacity || 1) * 0.6;
                context.shadowBlur = el.strokeWidth * 2;
                context.shadowColor = el.stroke;
                context.beginPath();
                context.moveTo(points[0], points[1]);
                for (let i = 3; i < points.length; i += 3) context.lineTo(points[i], points[i+1]);
                context.stroke();
                context.shadowBlur = 0;
              }}
            />
          );
        } else if (el.brushType === 'calligraphy') {
          return (
            <Line
              key={key}
              {...cleanCommonProps}
              {...shadowProps}
              points={renderPoints}
              sceneFunc={(context, shape) => {
                const points = el.points;
                if (points.length < 6) return;
                context.beginPath();
                context.fillStyle = el.stroke;
                context.globalAlpha = el.opacity || 1;
                const angle = Math.PI / 4;
                for (let i = 0; i < points.length - 3; i += 3) {
                  const x1 = points[i];
                  const y1 = points[i+1];
                  const x2 = points[i+3];
                  const y2 = points[i+4];
                  const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                  const steps = Math.max(1, Math.floor(dist / 0.5));
                  for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const px = x1 + (x2 - x1) * t;
                    const py = y1 + (y2 - y1) * t;
                    const w = el.strokeWidth * 1.5; // Wider chisel
                    const h = Math.max(1, el.strokeWidth * 0.15); // Thinner edge
                    context.save();
                    context.translate(px, py);
                    // Add dynamic rotation based on movement direction for real calligraphy feel
                    const moveAngle = Math.atan2(y2 - y1, x2 - x1);
                    context.rotate(angle + moveAngle * 0.1); 
                    context.fillRect(-w/2, -h/2, w, h);
                    context.restore();
                  }
                }
              }}
            />
          );
        }

        return <Line key={key} {...baseLine} />;
      case 'rect':
        return (
          <Group key={key} {...cleanCommonProps} x={el.x} y={el.y}>
            <Rect
              width={el.width}
              height={el.height}
              fill={el.fill}
              stroke={el.stroke}
              strokeWidth={el.strokeWidth}
              {...shadowProps}
            />
            {textNode(el.width, el.height, false)}
          </Group>
        );
      case 'sticky':
        return (
          <Group key={key} {...cleanCommonProps} x={el.x} y={el.y}>
            <Rect
              width={el.width}
              height={el.height}
              fill={el.fill}
              shadowColor="rgba(0,0,0,0.1)"
              shadowBlur={10}
              shadowOffset={{ x: 2, y: 4 }}
              {...shadowProps}
            />
            {textNode(el.width, el.height, false)}
          </Group>
        );
      case 'circle':
        return (
          <Group key={key} {...cleanCommonProps} x={el.x} y={el.y}>
            <Circle
              radius={el.radius}
              fill={el.fill}
              stroke={el.stroke}
              strokeWidth={el.strokeWidth}
              {...shadowProps}
            />
            {textNode(el.radius * 2, el.radius * 2, true)}
          </Group>
        );
      case 'triangle':
        return (
          <Group key={key} {...cleanCommonProps} x={el.x} y={el.y}>
            <RegularPolygon
              sides={3}
              radius={el.radius}
              fill={el.fill}
              stroke={el.stroke}
              strokeWidth={el.strokeWidth}
              {...shadowProps}
            />
            <Group y={el.radius * 0.2}>
              {textNode(el.radius * 1.5, el.radius * 1.5, true)}
            </Group>
          </Group>
        );
      case 'diamond':
        return (
          <Group key={key} {...cleanCommonProps} x={el.x} y={el.y}>
            <RegularPolygon
              sides={4}
              radius={el.radius}
              fill={el.fill}
              stroke={el.stroke}
              strokeWidth={el.strokeWidth}
              {...shadowProps}
            />
            {textNode(el.radius * 1.4, el.radius * 1.4, true)}
          </Group>
        );
      case 'text':
        return (
          <Text
            key={key}
            {...cleanCommonProps}
            text={el.text || 'Double Click to Edit'}
            fontSize={el.fontSize || 24}
            fill={el.fill || '#000000'}
            fontFamily="Inter, sans-serif"
            width={el.width || 300}
            {...shadowProps}
          />
        );
      default:
        return null;
    }
  };

  const renderedElements = useMemo(() => {
    return elements.map(renderElement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, selectedElementId, tool]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      cursor: tool === 'pan' ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'),
      touchAction: 'none' // Prevent browser scrolling/moving when drawing
    }}>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight - 64}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        draggable={tool === 'pan'}
        onDragEnd={(e) => {
          if (tool === 'pan') {
            setStagePosition({ x: e.target.x(), y: e.target.y() });
          }
        }}
      >
        {/* Multi-Layer System */}
        {layers.map((layer) => (
          <Layer 
            key={layer.id}
            ref={el => layerRefs.current[layer.id] = el}
            visible={layer.visible} 
            listening={!layer.locked && !isDrawing}
          >
            {/* Filter and render memoized elements for this layer */}
            {elements
              .filter(el => el.layerId === layer.id || (!el.layerId && layer.id === 'layer-2'))
              .map(el => {
                // Return pre-rendered element from memo if available (optional optimization)
                return renderElement(el);
              })}
          </Layer>
        ))}
        
        {/* Active Drawing Layer (Optimized for performance) */}
        <Layer listening={false}>
          {currentLine && renderElement({ 
            ...currentLine, 
            id: 'active-drawing-preview'
          })}
        </Layer>

        <Layer>
          {currentShape && currentShape.type === 'rect' && (
            <Rect
              x={currentShape.x} y={currentShape.y}
              width={currentShape.width} height={currentShape.height}
              fill="transparent" stroke={currentShape.stroke} strokeWidth={currentShape.strokeWidth}
            />
          )}
          {currentShape && currentShape.type === 'circle' && (
            <Circle
              x={currentShape.x} y={currentShape.y} radius={currentShape.radius}
              fill="transparent" stroke={currentShape.stroke} strokeWidth={currentShape.strokeWidth}
            />
          )}
          {currentShape && currentShape.type === 'triangle' && (
            <RegularPolygon
              x={currentShape.x} y={currentShape.y} sides={3} radius={currentShape.radius}
              fill="transparent" stroke={currentShape.stroke} strokeWidth={currentShape.strokeWidth}
            />
          )}
          {currentShape && currentShape.type === 'diamond' && (
            <RegularPolygon
              x={currentShape.x} y={currentShape.y} sides={4} radius={currentShape.radius}
              fill="transparent" stroke={currentShape.stroke} strokeWidth={currentShape.strokeWidth}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default React.memo(WhiteboardCanvas);
