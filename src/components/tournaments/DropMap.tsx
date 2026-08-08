"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";

export interface MapZone {
    id: string;
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
    capacity: number;
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

/** True when the viewer is in this team, as captain or as a picked teammate. */
export const claimBelongsTo = (claim: MapClaim, discordId?: string | null) =>
    !!discordId && (claim.discordId === discordId || (claim.teammateIds ?? []).includes(discordId));

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
    myDiscordId?: string | null;
    selectedZoneId?: string | null;
    onSelectZone?: (zoneId: string | null) => void;
    onZonesChange?: (zones: MapZone[]) => void;
    emptyLabel?: string;
}

const MIN_SIZE = 0.02;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

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
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [draft, setDraft] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    const dragStart = useRef<{ x: number; y: number } | null>(null);

    const claimsFor = (zoneId: string) => claims.filter(c => c.zoneId === zoneId);

    const pointToRatio = (clientX: number, clientY: number) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: clamp01((clientX - rect.left) / rect.width),
            y: clamp01((clientY - rect.top) / rect.height),
        };
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (mode !== "edit") return;
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
        if (mode !== "edit" || !dragStart.current) return;
        const point = pointToRatio(e.clientX, e.clientY);
        setDraft({
            x: Math.min(dragStart.current.x, point.x),
            y: Math.min(dragStart.current.y, point.y),
            w: Math.abs(point.x - dragStart.current.x),
            h: Math.abs(point.y - dragStart.current.y),
        });
    };

    const handlePointerUp = () => {
        if (mode !== "edit" || !dragStart.current) return;
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
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative aspect-square w-full select-none overflow-hidden rounded-2xl border border-white/10 bg-[#0a2733] ${mode === "edit" ? "cursor-crosshair touch-none" : ""
                }`}
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

            {zones.map((zone, index) => {
                const zoneClaims = claimsFor(zone.id);
                const capacity = zone.capacity ?? 1;
                const isMine = zoneClaims.some(c => claimBelongsTo(c, myDiscordId));
                const isTaken = zoneClaims.length > 0;
                const isDisputed = isZoneDisputed(zoneClaims, capacity);
                const isSelected = selectedZoneId === zone.id;

                // Green means you can drop there (or that it is your team's spot),
                // dark means somebody else took it, red means it is contested.
                // All fills stay translucent so the map reads underneath.
                const tone = isDisputed
                    ? "border-red-500 bg-red-500/35"
                    : isMine
                        ? "border-primary bg-primary/45"
                        : isTaken
                            ? "border-white/25 bg-black/70"
                            : "border-primary/60 bg-primary/25 hover:border-primary hover:bg-primary/35";

                return (
                    <button
                        key={zone.id}
                        type="button"
                        data-zone="1"
                        onClick={e => {
                            e.stopPropagation();
                            onSelectZone?.(zone.id);
                        }}
                        style={{
                            left: `${zone.x * 100}%`,
                            top: `${zone.y * 100}%`,
                            width: `${zone.w * 100}%`,
                            height: `${zone.h * 100}%`,
                        }}
                        className={`absolute flex items-center justify-center border-2 transition-colors ${tone} ${isSelected ? "ring-2 ring-primary ring-offset-1 ring-offset-transparent" : ""
                            } ${isDisputed ? "ring-1 ring-red-500/50" : ""}`}
                    >
                        {/* The number stays legible at any size; on phones the text below
                            has no room, so the numbered list under the map is the key. */}
                        <span
                            data-zone="1"
                            className={`pointer-events-none absolute -left-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white ring-1 ${isDisputed ? "bg-red-600 ring-red-300/60" : "bg-black/85 ring-white/40"
                                }`}
                        >
                            {index + 1}
                        </span>
                        <span
                            data-zone="1"
                            className="pointer-events-none hidden max-w-full break-words px-1 text-center text-[10px] font-bold leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] sm:line-clamp-3 sm:block sm:text-[11px]"
                        >
                            {mode === "edit" || zoneClaims.length === 0
                                ? zone.label
                                : zoneClaims.map(teamLabel).join(" · ")}
                        </span>
                        {isDisputed && mode !== "edit" && (
                            <span
                                data-zone="1"
                                className="pointer-events-none absolute -bottom-1.5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-red-600 px-1.5 py-[1px] text-[8px] font-black uppercase tracking-wide text-white sm:block"
                            >
                                en disputa
                            </span>
                        )}
                    </button>
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
