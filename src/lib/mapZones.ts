/**
 * Shared validation for the rectangles a moderator draws on the map. The zones
 * route and the spot-template routes both write the same shape, so the clamping
 * lives here instead of being duplicated (and drifting) between them.
 */

export interface CleanZone {
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
    capacity: number;
}

const clamp01 = (n: unknown) => Math.min(1, Math.max(0, Number(n) || 0));

/** Returns null for a rectangle with no area, which the caller should drop. */
export function sanitizeZone(incoming: Record<string, unknown>): CleanZone | null {
    const x = clamp01(incoming.x);
    const y = clamp01(incoming.y);
    const w = clamp01(incoming.w);
    const h = clamp01(incoming.h);
    if (w <= 0 || h <= 0) return null;

    return {
        label: String(incoming.label || "Spot").trim().slice(0, 60),
        x,
        y,
        // keep the rect inside the image even if the drag ran off the edge
        w: Math.min(w, 1 - x),
        h: Math.min(h, 1 - y),
        capacity: Math.max(1, Number(incoming.capacity) || 1),
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
