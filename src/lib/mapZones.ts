/**
 * Shared validation for the rectangles a moderator draws on the map. The zones
 * route and the spot-template routes both write the same shape, so the clamping
 * lives here instead of being duplicated (and drifting) between them.
 */

export interface ZonePoint {
    x: number;
    y: number;
}

export interface CleanZone {
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
    capacity: number;
    /**
     * The zone's real outline, when it is not a rectangle. Official map
     * divisions have slanted and L-shaped areas, and a bounding box around one
     * of those overlaps its neighbours. `x/y/w/h` stay in step as the outline's
     * bounding box, so anything that only needs a rough position still works.
     */
    points?: ZonePoint[];
}

const clamp01 = (n: unknown) => Math.min(1, Math.max(0, Number(n) || 0));

/** A polygon worth keeping: at least a triangle, no more than a sane outline. */
const MAX_POINTS = 24;

function sanitizePoints(raw: unknown): ZonePoint[] | null {
    if (!Array.isArray(raw) || raw.length < 3) return null;
    const points = raw
        .slice(0, MAX_POINTS)
        .map(p => {
            const pair = Array.isArray(p) ? { x: p[0], y: p[1] } : (p as ZonePoint | null);
            if (!pair || typeof pair !== "object") return null;
            const x = Number(pair.x);
            const y = Number(pair.y);
            return Number.isFinite(x) && Number.isFinite(y) ? { x: clamp01(x), y: clamp01(y) } : null;
        })
        .filter((p): p is ZonePoint => p !== null);
    return points.length >= 3 ? points : null;
}

/** Returns null for a zone with no area, which the caller should drop. */
export function sanitizeZone(incoming: Record<string, unknown>): CleanZone | null {
    const points = sanitizePoints(incoming.points);

    // The outline is the source of truth when there is one: the box follows it,
    // so the two can never disagree about where the zone is.
    const box = points
        ? {
            x: Math.min(...points.map(p => p.x)),
            y: Math.min(...points.map(p => p.y)),
            w: Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x)),
            h: Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y)),
        }
        : {
            x: clamp01(incoming.x),
            y: clamp01(incoming.y),
            w: clamp01(incoming.w),
            h: clamp01(incoming.h),
        };

    if (box.w <= 0 || box.h <= 0) return null;

    return {
        label: String(incoming.label || "Spot").trim().slice(0, 60),
        x: box.x,
        y: box.y,
        // keep the zone inside the image even if the drag ran off the edge
        w: Math.min(box.w, 1 - box.x),
        h: Math.min(box.h, 1 - box.y),
        capacity: Math.max(1, Number(incoming.capacity) || 1),
        ...(points ? { points } : {}),
    };
}

/** Cap taken from what a map can realistically hold without becoming unusable. */
export const MAX_ZONES = 80;

export function sanitizeZones(list: unknown): CleanZone[] {
    if (!Array.isArray(list)) return [];
    return list
        .map(z => (z && typeof z === "object" ? sanitizeZone(z as Record<string, unknown>) : null))
        .filter((z): z is CleanZone => z !== null)
        .slice(0, MAX_ZONES);
}
