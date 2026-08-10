"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2, ZoomOut } from "lucide-react";

export interface MapZone {
    id: string;
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
    capacity: number;
    /** Outline for a zone that is not a rectangle; x/y/w/h is its box. */
    points?: { x: number; y: number }[];
}

/** The zone's corners, four of them when it is a plain rectangle. */
export const zoneOutline = (z: MapZone) =>
    z.points && z.points.length >= 3
        ? z.points
        : [
            { x: z.x, y: z.y },
            { x: z.x + z.w, y: z.y },
            { x: z.x + z.w, y: z.y + z.h },
            { x: z.x, y: z.y + z.h },
        ];

/**
 * Where the zone's name goes: the average of its corners rather than the middle
 * of its box, so a slanted or L-shaped zone gets its label inside itself.
 */
export function zoneCentre(z: MapZone) {
    const pts = zoneOutline(z);
    return {
        x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
        y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
    };
}

export interface MapClaim {
    id: string;
    zoneId: string;
    discordId: string;
    epicName: string;
    teammates: string[];
    /** Discord ids of the teammates: a duo marks the spot for both of them. */
    teammateIds?: string[];
    /** Team that took an already-full zone: the zone is contested. */
    disputed?: boolean;
}

/**
 * True when the viewer is in this team: as captain, as a picked teammate, or
 * because the claim belongs to somebody a moderator made their fixed partner.
 * `discordId` may be a list - the viewer plus their preset team.
 */
export const claimBelongsTo = (claim: MapClaim, discordId?: string | string[] | null) => {
    const ids = (Array.isArray(discordId) ? discordId : [discordId]).filter(Boolean) as string[];
    if (!ids.length) return false;
    return (
        ids.includes(claim.discordId) ||
        (claim.teammateIds ?? []).some(id => ids.includes(id))
    );
};

/** One team as it reads on the map: "Peterbot + Pollo". */
export const teamLabel = (claim: MapClaim) =>
    [claim.epicName, ...(claim.teammates ?? [])].filter(Boolean).join(" + ");

/** A zone is contested while more teams sit on it than it holds. */
export const isZoneDisputed = (claims: MapClaim[], capacity: number) =>
    claims.length > Math.max(1, capacity) || claims.some(c => c.disputed);

interface Props {
    zones: MapZone[];
    claims: MapClaim[];
    mode?: "view" | "edit";
    /** The viewer, plus anyone a moderator made their fixed teammate. */
    myDiscordId?: string | string[] | null;
    selectedZoneId?: string | null;
    onSelectZone?: (zoneId: string | null) => void;
    onZonesChange?: (zones: MapZone[]) => void;
    emptyLabel?: string;
    /** Zone to fly to and enlarge - set by clicking a team in the list. */
    zoomZoneId?: string | null;
    onZoomOut?: () => void;
    zoomOutLabel?: string;
}

const MIN_SIZE = 0.02;
/** How much the map grows when you click a team. Enough to read the tag. */
const ZOOM = 3;
const MAX_ZOOM = 6;
/** Movement, in pixels, past which a click counts as a drag instead. */
const DRAG_SLOP = 4;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * How the map is framed: a scale and a translation, both in fractions of the
 * container. With `origin-top-left` a content point p lands at `scale*p + t`,
 * which is all the arithmetic here needs.
 */
interface View {
    scale: number;
    tx: number;
    ty: number;
}

const IDENTITY: View = { scale: 1, tx: 0, ty: 0 };

/** Keeps the map inside its frame: no panning off into empty background. */
function clampView(v: View): View {
    const scale = clamp(v.scale, 1, MAX_ZOOM);
    return {
        scale,
        tx: clamp(v.tx, 1 - scale, 0),
        ty: clamp(v.ty, 1 - scale, 0),
    };
}

/** Rescales around a point of the container, so it stays under the cursor. */
function zoomAround(v: View, scale: number, cx: number, cy: number): View {
    const next = clamp(scale, 1, MAX_ZOOM);
    return clampView({
        scale: next,
        tx: cx - ((cx - v.tx) / v.scale) * next,
        ty: cy - ((cy - v.ty) / v.scale) * next,
    });
}

/** Local-only ids for zones the moderator just drew; the server assigns real ones on save. */
let draftCounter = 0;
export const nextDraftId = () => `draft-${++draftCounter}`;

export default function DropMap({
    zones,
    claims,
    mode = "view",
    myDiscordId,
    selectedZoneId,
    onSelectZone,
    onZonesChange,
    emptyLabel,
    zoomZoneId,
    onZoomOut,
    zoomOutLabel = "Salir del zoom",
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [draft, setDraft] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    const dragStart = useRef<{ x: number; y: number } | null>(null);

    const [view, setView] = useState<View>(IDENTITY);
    /** Where a pan began, and the view it started from. */
    const panFrom = useRef<{ x: number; y: number; view: View } | null>(null);
    /** True once the pointer moved enough that letting go must not claim a spot. */
    const panned = useRef(false);
    const [panning, setPanning] = useState(false);

    const interactive = mode !== "edit";

    const claimsFor = (zoneId: string) => claims.filter(c => c.zoneId === zoneId);

    /**
     * Flying to a zone when a team is clicked in the list: put its centre in
     * the middle of the frame. Clearing `zoomZoneId` frames the whole map again.
     */
    useEffect(() => {
        if (!interactive) return;
        const zone = zones.find(z => z.id === zoomZoneId);
        if (!zone) {
            setView(IDENTITY);
            return;
        }
        setView(
            clampView({
                scale: ZOOM,
                tx: 0.5 - ZOOM * (zone.x + zone.w / 2),
                ty: 0.5 - ZOOM * (zone.y + zone.h / 2),
            })
        );
        // Following `zones` here would re-centre on every poll of the page.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zoomZoneId, interactive]);

    /**
     * The wheel zooms towards the cursor. Registered by hand because React's
     * own wheel listener is passive, and a passive listener cannot stop the
     * page from scrolling underneath the map.
     */
    useEffect(() => {
        const el = containerRef.current;
        if (!el || !interactive) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            const cx = (e.clientX - rect.left) / rect.width;
            const cy = (e.clientY - rect.top) / rect.height;
            // Exponential so every notch feels the same at any zoom level.
            setView(v => zoomAround(v, v.scale * Math.exp(-e.deltaY * 0.0015), cx, cy));
        };

        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [interactive]);

    const zoomBy = (factor: number) => setView(v => zoomAround(v, v.scale * factor, 0.5, 0.5));

    const resetView = () => {
        setView(IDENTITY);
        onZoomOut?.();
    };

    const transform =
        view.scale === 1 && view.tx === 0 && view.ty === 0
            ? "none"
            : `translate(${view.tx * 100}%, ${view.ty * 100}%) scale(${view.scale})`;

    const pointToRatio = (clientX: number, clientY: number) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: clamp01((clientX - rect.left) / rect.width),
            y: clamp01((clientY - rect.top) / rect.height),
        };
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (interactive) {
            // Cleared for every press, including taps: a stale flag from an
            // earlier drag would swallow the next click on a spot.
            panned.current = false;
            // Panning is mouse only - on a phone a drag has to keep scrolling
            // the page, which is what the +/- buttons are there for instead.
            if (e.pointerType !== "mouse" || e.button !== 0) return;
            panFrom.current = { x: e.clientX, y: e.clientY, view };
            return;
        }

        // Clicking a zone selects it; only empty space starts a new rectangle.
        if ((e.target as HTMLElement).dataset.zone) return;

        e.preventDefault();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        const point = pointToRatio(e.clientX, e.clientY);
        dragStart.current = point;
        setDraft({ ...point, w: 0, h: 0 });
        onSelectZone?.(null);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (interactive) {
            const from = panFrom.current;
            if (!from) return;

            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const dx = e.clientX - from.x;
            const dy = e.clientY - from.y;
            if (!panned.current && Math.hypot(dx, dy) < DRAG_SLOP) return;

            if (!panned.current) {
                panned.current = true;
                setPanning(true);
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            }
            setView(
                clampView({
                    scale: from.view.scale,
                    tx: from.view.tx + dx / rect.width,
                    ty: from.view.ty + dy / rect.height,
                })
            );
            return;
        }

        if (!dragStart.current) return;
        const point = pointToRatio(e.clientX, e.clientY);
        setDraft({
            x: Math.min(dragStart.current.x, point.x),
            y: Math.min(dragStart.current.y, point.y),
            w: Math.abs(point.x - dragStart.current.x),
            h: Math.abs(point.y - dragStart.current.y),
        });
    };

    const handlePointerUp = () => {
        if (interactive) {
            panFrom.current = null;
            setPanning(false);
            // `panned` is cleared on the next press, not here: the click event
            // fires after this one and has to know the pointer was dragged.
            return;
        }
        if (!dragStart.current) return;
        dragStart.current = null;

        if (draft && draft.w >= MIN_SIZE && draft.h >= MIN_SIZE) {
            const created: MapZone = {
                id: nextDraftId(),
                label: `Spot ${zones.length + 1}`,
                x: draft.x,
                y: draft.y,
                w: draft.w,
                h: draft.h,
                capacity: 1,
            };
            onZonesChange?.([...zones, created]);
            onSelectZone?.(created.id);
        }
        setDraft(null);
    };

    return (
        <div
            ref={containerRef}
            /* The site runs Lenis for smooth scrolling, and Lenis takes the wheel
               at the window level: our own preventDefault never reaches it, so
               zooming the map scrolled the page underneath. This is the attribute
               Lenis honours to keep its hands off a subtree. */
            data-lenis-prevent={interactive ? "" : undefined}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative aspect-square w-full select-none overflow-hidden rounded-2xl border border-white/10 bg-[#0a2733] ${mode === "edit"
                ? "cursor-crosshair touch-none"
                : panning
                    ? "cursor-grabbing"
                    : view.scale > 1
                        ? "cursor-grab"
                        : ""
                }`}
        >
            {/* Image and zones move together, so a zoomed spot stays on its POI.
                While dragging the transform must follow the pointer exactly, so
                the easing only applies to the jumps (buttons, flying to a team). */}
            <div
                className={`absolute inset-0 origin-top-left ${panning ? "" : "transition-transform duration-500 ease-out"
                    }`}
                style={{ transform }}
            >
                {/* next/image, not <img>: the source PNG is 2048x2048 / ~2.6MB and every
                visitor of a tournament page would download it raw otherwise. */}
                <Image
                    src="/images/fortnite-map.png"
                    alt="Mapa de Fortnite"
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    draggable={false}
                    className="pointer-events-none select-none object-cover"
                    priority
                />

                {/* One SVG for every zone. Zones are not all rectangles - an
                    official map division has slanted and L-shaped areas - and a
                    div can only be a box. Drawing the real outline also makes
                    the click land on the shape instead of on its bounding box,
                    which matters where two zones sit corner to corner. */}
                <svg
                    viewBox="0 0 1000 1000"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full overflow-visible"
                >
                    {zones.map(zone => {
                        const zoneClaims = claimsFor(zone.id);
                        const isMine = zoneClaims.some(c => claimBelongsTo(c, myDiscordId));
                        const isTaken = zoneClaims.length > 0;
                        const isDisputed = isZoneDisputed(zoneClaims, zone.capacity ?? 1);
                        const isSelected = selectedZoneId === zone.id;

                        // Green means you can drop there (or that it is your
                        // team's spot), dark means somebody else took it, red
                        // means contested - red alone says it, no label on top.
                        // Fills stay translucent so the map reads underneath.
                        const tone = isDisputed
                            ? { stroke: "#ef4444", fill: "rgba(239,68,68,0.35)" }
                            : isMine
                                ? { stroke: "#22D962", fill: "rgba(34,217,98,0.45)" }
                                : isTaken
                                    ? { stroke: "rgba(255,255,255,0.25)", fill: "rgba(0,0,0,0.7)" }
                                    : { stroke: "rgba(34,217,98,0.6)", fill: "rgba(34,217,98,0.25)" };

                        return (
                            <polygon
                                key={zone.id}
                                data-zone="1"
                                points={zoneOutline(zone)
                                    .map(p => `${p.x * 1000},${p.y * 1000}`)
                                    .join(" ")}
                                fill={tone.fill}
                                stroke={isSelected ? "#22D962" : tone.stroke}
                                strokeWidth={isSelected ? 5 : 2.5}
                                className={
                                    interactive
                                        ? "cursor-pointer transition-colors"
                                        : "transition-colors"
                                }
                                onClick={e => {
                                    e.stopPropagation();
                                    // Letting go after dragging the map is not a
                                    // click on whatever was under the pointer.
                                    if (panned.current) return;
                                    onSelectZone?.(zone.id);
                                }}
                            />
                        );
                    })}
                </svg>

                {/* Labels stay HTML: names wrap onto their own lines and scale
                    with the breakpoints, neither of which SVG text does. */}
                {zones.map((zone, index) => {
                    const zoneClaims = claimsFor(zone.id);
                    const centre = zoneCentre(zone);
                    return (
                        <div
                            key={zone.id}
                            className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 break-words text-center font-bold leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]"
                            style={{
                                left: `${centre.x * 100}%`,
                                top: `${centre.y * 100}%`,
                                maxWidth: `${zone.w * 100}%`,
                            }}
                        >
                            {/* Only while drawing: the number keys into nothing
                                on the public page and sat on the first letter of
                                a team's name on a phone-sized zone. */}
                            {mode === "edit" && (
                                <span className="rounded-full bg-black/85 px-1.5 text-[9px] font-black ring-1 ring-white/40">
                                    {index + 1}
                                </span>
                            )}
                            {mode === "edit" || zoneClaims.length === 0 ? (
                                <span className="text-[10px] sm:text-[11px]">{zone.label}</span>
                            ) : (
                                zoneClaims.map(claim => (
                                    <span
                                        key={claim.id}
                                        className={
                                            zoneClaims.length > 1
                                                ? "text-[9px] sm:text-[10px]"
                                                : "text-[10px] sm:text-[11px]"
                                        }
                                    >
                                        {teamLabel(claim)}
                                    </span>
                                ))
                            )}
                        </div>
                    );
                })}

                {draft && draft.w > 0 && draft.h > 0 && (
                    <div
                        style={{
                            left: `${draft.x * 100}%`,
                            top: `${draft.y * 100}%`,
                            width: `${draft.w * 100}%`,
                            height: `${draft.h * 100}%`,
                        }}
                        className="pointer-events-none absolute border-2 border-dashed border-primary bg-primary/10"
                    />
                )}
            </div>

            {/* Wheel and drag are not discoverable on their own, and a phone has
                neither, so the same three moves live here as buttons. */}
            {interactive && zones.length > 0 && (
                <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
                    <div className="flex overflow-hidden rounded-lg border border-white/20 bg-black/70">
                        <button
                            type="button"
                            onClick={() => zoomBy(1.6)}
                            disabled={view.scale >= MAX_ZOOM}
                            aria-label="Acercar"
                            className="flex h-11 w-11 items-center justify-center text-white transition-colors hover:text-primary disabled:opacity-30 sm:h-9 sm:w-10"
                        >
                            <Plus size={16} />
                        </button>
                        <span className="w-px bg-white/20" />
                        <button
                            type="button"
                            onClick={() => zoomBy(1 / 1.6)}
                            disabled={view.scale <= 1}
                            aria-label="Alejar"
                            className="flex h-11 w-11 items-center justify-center text-white transition-colors hover:text-primary disabled:opacity-30 sm:h-9 sm:w-10"
                        >
                            <Minus size={16} />
                        </button>
                    </div>
                    {view.scale > 1 && (
                        <button
                            type="button"
                            onClick={resetView}
                            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/20 bg-black/70 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:border-primary/50 hover:text-primary sm:min-h-0 sm:py-1.5"
                        >
                            <ZoomOut size={13} /> {zoomOutLabel}
                        </button>
                    )}
                </div>
            )}

            {zones.length === 0 && emptyLabel && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                    <p className="max-w-xs rounded-xl bg-black/70 px-4 py-3 text-center text-xs text-white/80 backdrop-blur-sm">
                        {emptyLabel}
                    </p>
                </div>
            )}
        </div>
    );
}

/** Small helper the admin editor uses to render the selected-zone controls. */
export function ZoneEditorPanel({
    zone,
    onChange,
    onDelete,
}: {
    zone: MapZone;
    onChange: (patch: Partial<MapZone>) => void;
    onDelete: () => void;
}) {
    return (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-end">
            <div className="flex-1">
                <label className="mb-1.5 block text-xs text-white/60">Nombre del spot</label>
                <input
                    type="text"
                    value={zone.label}
                    onChange={e => onChange({ label: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-primary/40"
                    placeholder="Tilted Towers"
                />
            </div>
            <div className="w-full sm:w-32">
                <label className="mb-1.5 block text-xs text-white/60">Cupo</label>
                <input
                    type="number"
                    min={1}
                    value={zone.capacity}
                    onChange={e => onChange({ capacity: Math.max(1, Number(e.target.value) || 1) })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-primary/40"
                />
            </div>
            <button
                onClick={onDelete}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/20"
            >
                <Trash2 size={15} /> Borrar spot
            </button>
        </div>
    );
}
