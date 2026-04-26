/**
 * Simple Shape Recognizer for Whiteboard
 * Detects basic shapes from a set of points [x1, y1, s1, x2, y2, s2...]
 */

export const recognizeShape = (points) => {
  if (!points || points.length < 15) return null; // Too few points

  // Extract just X and Y
  const xy = [];
  for (let i = 0; i < points.length; i += 3) {
    xy.push({ x: points[i], y: points[i+1] });
  }

  const n = xy.length;
  const start = xy[0];
  const end = xy[n - 1];

  // Bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  xy.forEach(p => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });

  const width = maxX - minX;
  const height = maxY - minY;
  const cx = minX + width / 2;
  const cy = minY + height / 2;

  // Path metrics
  let totalDist = 0;
  for (let i = 1; i < n; i++) {
    totalDist += Math.sqrt(Math.pow(xy[i].x - xy[i-1].x, 2) + Math.pow(xy[i].y - xy[i-1].y, 2));
  }

  const distStartEnd = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
  const isClosed = distStartEnd < Math.max(width, height) * 0.3 || distStartEnd < 30;

  // 1. Check for Straight Line
  if (distStartEnd / totalDist > 0.92) {
    return { type: 'line', x1: start.x, y1: start.y, x2: end.x, y2: end.y };
  }

  if (isClosed) {
    // 2. Check for Circle
    const distsToCenter = xy.map(p => Math.sqrt(Math.pow(p.x - cx, 2) + Math.pow(p.y - cy, 2)));
    const avgDist = distsToCenter.reduce((a, b) => a + b, 0) / n;
    const variance = distsToCenter.reduce((a, b) => a + Math.abs(b - avgDist), 0) / n;
    
    if (variance / avgDist < 0.18) {
      return { type: 'circle', x: cx, y: cy, radius: avgDist };
    }

    // 3. Check for Rectangle
    // Simplified: check if the points are mostly near the corners
    const area = width * height;
    const hullArea = totalDist; // Not really area, but heuristic
    // If aspect ratio is close to square or rect and points are distributed
    if (width > 20 && height > 20) {
        // A rough heuristic: if it looks boxy
        // We'll just assume box for now if it's closed and not a circle
        // But let's add a bit more check
        const perimeter = 2 * (width + height);
        if (Math.abs(totalDist - perimeter) / perimeter < 0.3) {
            return { type: 'rect', x: minX, y: minY, width, height };
        }
    }
    
    // 4. Triangle (Check if 3 corners)
    // For now, let's keep it simple and just do Rect/Circle/Line
  }

  return null;
};
