"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutTemplate, Save, Trash2, Upload, Download, Loader2 } from "lucide-react";
import { MapZone, nextDraftId } from "@/components/tournaments/DropMap";

interface TemplateZone {
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
    capacity: number;
}

interface Template {
    id: string;
    name: string;
    createdByName: string;
    updatedAt: string;
    zones: TemplateZone[];
}

const isNumber = (n: unknown) => typeof n === "number" && Number.isFinite(n);

const num = (...values: unknown[]): number | null => {
    for (const v of values) {
        if (isNumber(v)) return v as number;
        if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
    }
    return null;
};

type Row = Record<string, unknown>;

/** Where the list of spots can live in somebody else's export. */
function findList(data: unknown): Row[] | null {
    if (Array.isArray(data)) return data as Row[];
    const d = (data ?? {}) as Row;
    for (const key of ["zones", "spots", "points", "pois", "locations", "markers", "data", "items"]) {
        if (Array.isArray(d[key])) return d[key] as Row[];
    }
    // Our own tournament export nests them one level deeper.
    const windows = d.windows as Row[] | undefined;
    if (Array.isArray(windows)) {
        const all = windows.flatMap(w => (Array.isArray(w?.zones) ? (w.zones as Row[]) : []));
        if (all.length) return all;
    }
    return null;
}

/** Fortnite's world coordinates run about -135k..135k on both axes. */
const WORLD_HALF = 135000;
/** A point with no size becomes a small square, in map fractions. */
const POINT_SIZE = 0.055;

interface RawSpot {
    label: string;
    x: number;
    y: number;
    w: number | null;
    h: number | null;
    capacity: number;
}

/**
 * Reads one spot out of whatever the file calls its fields. Covers our own
 * export, a plain list of rectangles, and a list of POIs that only carry a
 * point (`location: {x, y}`), which is how the official map data ships them.
 */
function readSpot(row: Row, index: number): RawSpot | null {
    if (!row || typeof row !== "object") return null;
    const loc = (row.location ?? row.position ?? row.coords ?? row.coordinates ?? {}) as Row;

    const x = num(row.x, row.left, row.cx, loc.x, (row as Row).lng);
    const y = num(row.y, row.top, row.cy, loc.y, (row as Row).lat);
    if (x === null || y === null) return null;

    return {
        label: String(
            row.label ?? row.name ?? row.title ?? (row as Row).poi ?? `Spot ${index + 1}`
        ).slice(0, 60),
        x,
        y,
        w: num(row.w, row.width, (row as Row).sizeX),
        h: num(row.h, row.height, (row as Row).sizeY),
        capacity: Math.max(1, num(row.capacity, row.slots, row.teams) ?? 1),
    };
}

/**
 * Accepts a template file from us or from somewhere else.
 *
 * Coordinates may arrive in three scales and we work out which by looking at
 * the numbers themselves, because no export says so:
 *  - already normalised 0..1, which is what the map stores;
 *  - pixels over the map image (0..2048 or whatever the biggest value is);
 *  - Fortnite world units, which are the only ones that go negative.
 * A spot with no width and height becomes a small square on that point.
 */
function parseTemplateFile(raw: string): { name: string; zones: TemplateZone[] } {
    let data: unknown;
    try {
        data = JSON.parse(raw);
    } catch {
        throw new Error("Ese archivo no es un JSON válido.");
    }

    const list = findList(data);
    if (!list) {
        throw new Error(
            "No encontré la lista de spots. El archivo tiene que ser una lista, o un objeto con «zones» o «spots» adentro."
        );
    }
    if (list.length === 0) throw new Error("El archivo está vacío: no trae ningún spot.");

    const spots = list.map(readSpot).filter((s): s is RawSpot => s !== null);
    if (spots.length === 0) {
        throw new Error(
            "Ningún spot del archivo trae coordenadas. Cada uno necesita x e y (o location con x e y)."
        );
    }

    const values = spots.flatMap(s => [s.x, s.y]);
    const maxAbs = Math.max(...values.map(Math.abs));
    const negative = values.some(v => v < 0);

    // World units are the only ones that go negative and reach six figures.
    const world = negative || maxAbs > 4096;
    // Pixels: anything clearly beyond a fraction but inside an image.
    const pixelSpan = maxAbs > 1.5 ? Math.max(maxAbs, 1) : 0;

    const toX = (v: number) => (world ? (v + WORLD_HALF) / (WORLD_HALF * 2) : pixelSpan ? v / pixelSpan : v);
    // In world space the Y axis points north, the opposite of an image.
    const toY = (v: number) => (world ? (WORLD_HALF - v) / (WORLD_HALF * 2) : pixelSpan ? v / pixelSpan : v);
    const toSize = (v: number) => (world ? v / (WORLD_HALF * 2) : pixelSpan ? v / pixelSpan : v);

    const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

    const zones: TemplateZone[] = spots.map(s => {
        const hasSize = s.w !== null && s.h !== null && s.w > 0 && s.h > 0;
        const w = hasSize ? toSize(s.w as number) : POINT_SIZE;
        const h = hasSize ? toSize(s.h as number) : POINT_SIZE;
        // A rectangle is stored by its top-left corner; a bare point is centred.
        const x = hasSize ? toX(s.x) : toX(s.x) - w / 2;
        const y = hasSize ? toY(s.y) : toY(s.y) - h / 2;

        return {
            label: s.label,
            x: clamp01(x),
            y: clamp01(y),
            w: Math.min(Math.max(w, 0.01), 1),
            h: Math.min(Math.max(h, 0.01), 1),
            capacity: s.capacity,
        };
    });

    const name = String((data as Row)?.name ?? (data as Row)?.title ?? "").slice(0, 80);
    return { name, zones };
}

const toDraftZones = (zones: TemplateZone[]): MapZone[] =>
    zones.map(z => ({ ...z, id: nextDraftId() }));

/**
 * Save the map division once and reuse it: a moderator draws the spots for one
 * round, stores it as a template, and drops it on any round of any tournament
 * instead of redrawing everything each time.
 */
export default function SpotTemplatePanel({
    zones,
    roundCount,
    onApply,
    onApplyToAllRounds,
    busy,
}: {
    zones: MapZone[];
    roundCount: number;
    onApply: (zones: MapZone[]) => void;
    onApplyToAllRounds: (zones: MapZone[]) => Promise<void>;
    busy: boolean;
}) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedId, setSelectedId] = useState("");
    const [name, setName] = useState("");
    const [applyToAll, setApplyToAll] = useState(false);
    const [working, setWorking] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        try {
            const res = await fetch("/api/spot-templates");
            const data = await res.json();
            if (data.success) setTemplates(data.templates);
        } catch {
            /* the panel still works with import/export only */
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const selected = templates.find(t => t.id === selectedId) ?? null;

    const applyZones = async (incoming: TemplateZone[], sourceName: string) => {
        const total = roundCount;
        if (
            !confirm(
                applyToAll
                    ? `Se reemplazan los spots de las ${total} rondas por los ${incoming.length} de «${sourceName}». Los reclamos de los spots que se borren se pierden. ¿Seguir?`
                    : `Se reemplazan los spots de esta ronda por los ${incoming.length} de «${sourceName}». ¿Seguir?`
            )
        ) {
            return;
        }

        setError("");
        setNotice("");

        if (applyToAll) {
            setWorking(true);
            try {
                await onApplyToAllRounds(toDraftZones(incoming));
                setNotice(`Plantilla aplicada a las ${total} rondas.`);
            } catch (e) {
                setError((e as Error).message || "No se pudo aplicar a todas las rondas.");
            }
            setWorking(false);
            return;
        }

        onApply(toDraftZones(incoming));
        setNotice("Plantilla cargada. Acordate de guardar los spots.");
    };

    const handleSave = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            setError("Ponele un nombre a la plantilla.");
            return;
        }
        if (zones.length === 0) {
            setError("Dibujá al menos un spot antes de guardar la plantilla.");
            return;
        }
        if (
            templates.some(t => t.name.toLowerCase() === trimmed.toLowerCase()) &&
            !confirm(`Ya existe una plantilla «${trimmed}». ¿Sobrescribirla?`)
        ) {
            return;
        }

        setWorking(true);
        setError("");
        setNotice("");
        try {
            const res = await fetch("/api/spot-templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: trimmed, zones }),
            });
            const data = await res.json();
            if (data.success) {
                setNotice(
                    data.replaced
                        ? `Plantilla «${trimmed}» actualizada con ${zones.length} spots.`
                        : `Plantilla «${trimmed}» guardada con ${zones.length} spots.`
                );
                setName("");
                await load();
                setSelectedId(data.template.id);
            } else {
                setError(data.error || "No se pudo guardar la plantilla.");
            }
        } catch {
            setError("Error de red.");
        }
        setWorking(false);
    };

    const handleDelete = async () => {
        if (!selected) return;
        if (!confirm(`¿Borrar la plantilla «${selected.name}»?`)) return;

        setWorking(true);
        setError("");
        setNotice("");
        try {
            const res = await fetch(`/api/spot-templates/${selected.id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setNotice("Plantilla borrada.");
                setSelectedId("");
                await load();
            } else {
                setError(data.error || "No se pudo borrar.");
            }
        } catch {
            setError("Error de red.");
        }
        setWorking(false);
    };

    const handleFile = async (file: File) => {
        setError("");
        setNotice("");
        try {
            const parsed = parseTemplateFile(await file.text());
            if (!name.trim() && parsed.name) setName(parsed.name);
            await applyZones(parsed.zones, parsed.name || file.name);
        } catch (e) {
            setError(`Archivo inválido: ${(e as Error).message}`);
        }
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleExport = () => {
        const blob = new Blob(
            [
                JSON.stringify(
                    {
                        name: name.trim() || "spots",
                        zones: zones.map(({ label, x, y, w, h, capacity }) => ({
                            label,
                            x,
                            y,
                            w,
                            h,
                            capacity,
                        })),
                    },
                    null,
                    2
                ),
            ],
            { type: "application/json" }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(name.trim() || "spots").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const disabled = busy || working;

    return (
        <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <h3 className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
                <LayoutTemplate size={14} className="text-primary" /> Plantillas de spots
            </h3>
            <p className="mb-4 text-[11px] leading-relaxed text-white/45">
                Dibujá el mapa una sola vez, guardalo como plantilla y aplicalo en cualquier torneo. También
                podés subir o bajar la plantilla como archivo .json.
            </p>

            {(error || notice) && (
                <div
                    className={`mb-3 rounded-lg border px-3 py-2 text-xs ${error
                        ? "border-red-500/20 bg-red-500/10 text-red-400"
                        : "border-primary/20 bg-primary/10 text-primary"
                        }`}
                >
                    {error || notice}
                </div>
            )}

            {/* Apply */}
            <div className="flex flex-col gap-2 sm:flex-row">
                <select
                    value={selectedId}
                    onChange={e => setSelectedId(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-primary/40"
                >
                    <option value="" className="bg-[#0B1F14]">
                        {templates.length ? "Elegí una plantilla..." : "Todavía no guardaste ninguna plantilla"}
                    </option>
                    {templates.map(t => (
                        <option key={t.id} value={t.id} className="bg-[#0B1F14]">
                            {t.name} ({t.zones.length} spots)
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => selected && applyZones(selected.zones, selected.name)}
                    disabled={!selected || disabled}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-[#04130A] transition-colors hover:bg-[#43E97B] disabled:opacity-40"
                >
                    {working ? <Loader2 size={15} className="animate-spin" /> : <LayoutTemplate size={15} />}
                    Aplicar
                </button>
                <button
                    onClick={handleDelete}
                    disabled={!selected || disabled}
                    aria-label="Borrar plantilla"
                    className="flex h-[38px] w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40"
                >
                    <Trash2 size={15} />
                </button>
            </div>

            {roundCount > 1 && (
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-[11px] text-white/60">
                    <input
                        type="checkbox"
                        checked={applyToAll}
                        onChange={e => setApplyToAll(e.target.checked)}
                        className="h-3.5 w-3.5 accent-[#22D962]"
                    />
                    Aplicar a las {roundCount} rondas del torneo (se guarda al instante)
                </label>
            )}

            {/* Save / files */}
            <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row">
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nombre de la plantilla (ej: Mapa BR 32 spots)"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary/40"
                />
                <button
                    onClick={handleSave}
                    disabled={disabled || zones.length === 0}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white transition-colors hover:border-primary/40 disabled:opacity-40"
                >
                    <Save size={15} /> Guardar estos {zones.length} spots
                </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-4">
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={disabled}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/50 transition-colors hover:text-primary disabled:opacity-40"
                >
                    <Upload size={13} /> Subir plantilla (.json)
                </button>
                <button
                    onClick={handleExport}
                    disabled={zones.length === 0}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/50 transition-colors hover:text-primary disabled:opacity-40"
                >
                    <Download size={13} /> Bajar los spots de esta ronda
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                    }}
                    className="hidden"
                />
            </div>
        </div>
    );
}
