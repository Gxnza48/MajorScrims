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

/** Accepts either a full export ({name, zones}) or a bare array of zones. */
function parseTemplateFile(raw: string): { name: string; zones: TemplateZone[] } {
    const data = JSON.parse(raw);
    const list = Array.isArray(data) ? data : data?.zones;
    if (!Array.isArray(list)) throw new Error("El archivo no tiene una lista de spots.");

    const zones: TemplateZone[] = list
        .filter(
            (z: Record<string, unknown>) =>
                z && isNumber(z.x) && isNumber(z.y) && isNumber(z.w) && isNumber(z.h)
        )
        .map((z: Record<string, unknown>, i: number) => ({
            label: String(z.label || `Spot ${i + 1}`).slice(0, 60),
            x: z.x as number,
            y: z.y as number,
            w: z.w as number,
            h: z.h as number,
            capacity: Math.max(1, Number(z.capacity) || 1),
        }));

    if (zones.length === 0) throw new Error("El archivo no tiene ningún spot válido.");
    return { name: String(data?.name || "").slice(0, 80), zones };
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
