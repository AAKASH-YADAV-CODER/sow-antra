/**
 * Generates an SVG path string for a variable-width stroke based on pressure data.
 * @param {Array} points - Array of {x, y, p} points
 * @param {number} baseWidth - The base stroke width
 * @returns {string} SVG path data
 */
export const getVariableWidthPath = (points, baseWidth = 4) => {
  if (points.length < 2) return '';

  const leftPoints = [];
  const rightPoints = [];

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const prev = points[i - 1] || points[i];
    const next = points[i + 1] || points[i];

    // Calculate normal vector
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    // Use pressure (p) to determine width at this point
    // Default to 0.5 if no pressure data provided
    const pressure = point.p !== undefined ? point.p : 0.5;
    const halfWidth = (baseWidth * pressure);

    leftPoints.push({
      x: point.x + nx * halfWidth,
      y: point.y + ny * halfWidth
    });
    rightPoints.push({
      x: point.x - nx * halfWidth,
      y: point.y - ny * halfWidth
    });
  }

  // Combine into a single polygon path string
  let path = `M ${leftPoints[0].x.toFixed(2)} ${leftPoints[0].y.toFixed(2)}`;
  
  for (let i = 1; i < leftPoints.length; i++) {
    path += ` L ${leftPoints[i].x.toFixed(2)} ${leftPoints[i].y.toFixed(2)}`;
  }
  
  // Cap the end
  for (let i = rightPoints.length - 1; i >= 0; i--) {
    path += ` L ${rightPoints[i].x.toFixed(2)} ${rightPoints[i].y.toFixed(2)}`;
  }
  
  path += ' Z';
  return path;
};
