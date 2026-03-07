/**
 * Bezier Curve Utilities
 * Helper functions for vector path editing
 */

// Mirror a handle to keep the curve smooth (C1 continuity)
export const mirrorHandle = (anchor, type) => {
    const newAnchor = { ...anchor };

    if (type === 'in') {
        // We moved handleIn, so mirror handleOut
        const dx = newAnchor.point.x - newAnchor.handleIn.x;
        const dy = newAnchor.point.y - newAnchor.handleIn.y;
        newAnchor.handleOut = {
            x: newAnchor.point.x + dx,
            y: newAnchor.point.y + dy
        };
    } else if (type === 'out') {
        // We moved handleOut, so mirror handleIn
        const dx = newAnchor.point.x - newAnchor.handleOut.x;
        const dy = newAnchor.point.y - newAnchor.handleOut.y;
        newAnchor.handleIn = {
            x: newAnchor.point.x + dx,
            y: newAnchor.point.y + dy
        };
    }

    return newAnchor;
};

// Convert custom anchor format to SVG Path 'd' string
export const generateSVGPath = (anchors, isClosed = false) => {
    if (!anchors || anchors.length === 0) return '';

    // For a single point, render a tiny dot so it's visible
    if (anchors.length === 1) {
        const a = anchors[0];
        const r = 0.5;
        return `M ${a.point.x - r} ${a.point.y} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`;
    }

    let d = `M ${anchors[0].point.x} ${anchors[0].point.y}`;

    const isSharp = (p1, p2) => Math.abs(p1.x - p2.x) < 0.01 && Math.abs(p1.y - p2.y) < 0.01;

    for (let i = 1; i < anchors.length; i++) {
        const curr = anchors[i];
        const prev = anchors[i - 1];

        if (isSharp(prev.handleOut, prev.point) && isSharp(curr.handleIn, curr.point)) {
            d += ` L ${curr.point.x} ${curr.point.y}`;
        } else {
            d += ` C ${prev.handleOut.x} ${prev.handleOut.y}, ${curr.handleIn.x} ${curr.handleIn.y}, ${curr.point.x} ${curr.point.y}`;
        }
    }

    if (isClosed) {
        const first = anchors[0];
        const last = anchors[anchors.length - 1];

        if (isSharp(last.handleOut, last.point) && isSharp(first.handleIn, first.point)) {
            d += ` Z`;
        } else {
            d += ` C ${last.handleOut.x} ${last.handleOut.y}, ${first.handleIn.x} ${first.handleIn.y}, ${first.point.x} ${first.point.y} Z`;
        }
    }

    return d;
};

// Calculate distance between two points
export const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Check if three points are collinear (for determining if a segment is a line)
export const isCollinear = (p1, p2, p3) => {
    return Math.abs((p2.y - p1.y) * (p3.x - p2.x) - (p3.y - p2.y) * (p2.x - p1.x)) < 1e-5;
};
// Calculate the bounding box for a set of Bezier anchors
export const getPathBoundingBox = (anchors) => {
    if (!anchors || anchors.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    // Include points and handles in the bounding box calculation
    // Note: For a true Bezier bbox, we'd solve for extrema, but including handles is safe and standard for selection
    const allPoints = anchors.flatMap(a => [
        a.point,
        a.handleIn,
        a.handleOut
    ]);

    const minX = Math.min(...allPoints.map(p => p.x));
    const minY = Math.min(...allPoints.map(p => p.y));
    const maxX = Math.max(...allPoints.map(p => p.x));
    const maxY = Math.max(...allPoints.map(p => p.y));

    return { minX, minY, maxX, maxY };
};

// --- New Utilities for "Add Point" ---

/**
 * Split a cubic bezier curve at parameter t (0..1) using De Casteljau's algorithm
 * Returns two cubic bezier segments.
 */
export const splitBezier = (p0, p1, p2, p3, t) => {
    const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

    const q0 = lerp(p0, p1, t);
    const q1 = lerp(p1, p2, t);
    const q2 = lerp(p2, p3, t);

    const r0 = lerp(q0, q1, t);
    const r1 = lerp(q1, q2, t);

    const s = lerp(r0, r1, t); // Split point

    // Segment 1: p0 -> q0 -> r0 -> s
    // Segment 2: s -> r1 -> q2 -> p3
    return {
        left: { p0: p0, p1: q0, p2: r0, p3: s },
        right: { p0: s, p1: r1, p2: q2, p3: p3 },
        splitPoint: s
    };
};

/**
 * Get coordinates of a point on a cubic bezier at t
 */
export const getBezierPoint = (p0, p1, p2, p3, t) => {
    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;

    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;

    const tSquared = t * t;
    const tCubed = tSquared * t;

    return {
        x: (ax * tCubed) + (bx * tSquared) + (cx * t) + p0.x,
        y: (ay * tCubed) + (by * tSquared) + (cy * t) + p0.y
    };
};

/**
 * Find the closest point on a path to a given point.
 * Returns { segmentIndex, t, distance, point } or null if not found.
 */
export const findClosestPointOnPath = (anchors, targetPoint, threshold = 10, isClosed = false) => {
    let closest = null;
    let minDistSq = threshold * threshold;

    const segmentsCount = anchors.length - (isClosed ? 0 : 1);

    for (let i = 0; i < segmentsCount; i++) {
        const p0 = anchors[i].point;
        const p1 = anchors[i].handleOut;
        const nextIdx = (i + 1) % anchors.length;
        const p2 = anchors[nextIdx].handleIn;
        const p3 = anchors[nextIdx].point;

        // Sample points to find approximate t
        const samples = 20;
        for (let j = 0; j <= samples; j++) {
            const t = j / samples;
            const pt = getBezierPoint(p0, p1, p2, p3, t);
            const distSq = Math.pow(pt.x - targetPoint.x, 2) + Math.pow(pt.y - targetPoint.y, 2);

            if (distSq < minDistSq) {
                minDistSq = distSq;
                closest = {
                    segmentIndex: i,
                    t: t,
                    distance: Math.sqrt(distSq),
                    point: pt
                };
            }
        }
    }

    return closest;
};

/**
 * Insert a new anchor point into the path if close enough.
 * Returns new anchors array or null.
 */
export const insertPointInPath = (anchors, point, isClosed = false) => {
    const match = findClosestPointOnPath(anchors, point, 10, isClosed);
    if (!match) return null;

    const { segmentIndex, t } = match;

    const p0 = anchors[segmentIndex].point;
    const p1 = anchors[segmentIndex].handleOut;
    const nextIdx = (segmentIndex + 1) % anchors.length;
    const p2 = anchors[nextIdx].handleIn;
    const p3 = anchors[nextIdx].point;

    const split = splitBezier(p0, p1, p2, p3, t);

    // Create new anchor from split point
    const newAnchor = {
        point: split.splitPoint,
        handleIn: split.left.p2,  // End handle of left segment
        handleOut: split.right.p1 // Start handle of right segment
    };

    // Update existing handles
    const newAnchors = [...anchors];

    // Update previous anchor's handleOut
    newAnchors[segmentIndex] = {
        ...newAnchors[segmentIndex],
        handleOut: split.left.p1
    };

    // Update next anchor's handleIn
    newAnchors[nextIdx] = {
        ...newAnchors[nextIdx],
        handleIn: split.right.p2
    };

    // Insert new anchor
    newAnchors.splice(segmentIndex + 1, 0, newAnchor);

    return newAnchors;
};
