"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    ArrowLeft, Plus, Save, Trash2, MapPin, ExternalLink, Loader2, CalendarX, AlertTriangle, Search,
} from "lucide-react";
import DropMap, { MapZone, MapClaim, ZoneEditorPanel } from "@/components/tournaments/DropMap";

interface WindowRow {
    id: string;
    label: string;
    startsAt: string;
    zones: MapZone[];
}

interface Detail {
    slug: string;
    name: string;
    teamSize: string;
    status: string;
    published: boolean;
    qualifiedIds: string[];
    participants: string[];
    windows: WindowRow[];
}

interface RosterUser {
    discordId: string;
    discordName: string;
    avatarUrl: string;
    epicName: string;
    isPro: boolean;
}

interface Claim extends MapClaim {
    windowId: string;
}

function toInputValue(iso: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-primary/40";

export default function TournamentZonesAdminPage({ params }: { params: { slug: string } }) {
    const { status } = useSession();
    const router = useRouter();

    const [detail, setDetail] = useState<Detail | null>(null);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
    const [zones, setZones] = useState<MapZone[]>([]);
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    // Window editor state (labels + times are saved through the tournament PUT)
    const [windowDrafts, setWindowDrafts] = useState<{ id?: string; label: string; startsAt: string }[]>([]);
    const [savingWindows, setSavingWindows] = useState(false);

    // Who qualified: ticked from the roster, plus an Epic-name escape hatch for
    // players who qualified but have never signed in (so they are not listed yet).
    const [roster, setRoster] = useState<RosterUser[]>([]);
    const [proDetectionReady, setProDetectionReady] = useState(true);
    const [qualifiedIds, setQualifiedIds] = useState<string[]>([]);
    const [rosterQuery, setRosterQuery] = useState("");
    const [onlyPros, setOnlyPros] = useState(true);
    const [participantsText, setParticipantsText] = useState("");
    const [savingParticipants, setSavingParticipants] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await fetch(`/api/tournaments/${params.slug}`);
            const data = await res.json();
            if (!data.success) {
                setError(data.error || "Torneo no encontrado.");
                return;
            }
            setDetail(data.tournament);
            setClaims(data.claims);
            setParticipantsText((data.tournament.participants ?? []).join("\n"));
            setQualifiedIds(data.tournament.qualifiedIds ?? []);
            setWindowDrafts(
                data.tournament.windows.map((w: WindowRow) => ({
                    id: w.id,
                    label: w.label,
                    startsAt: toInputValue(w.startsAt),
                }))
            );
            setActiveWindowId((prev: string | null) => {
                const next = prev ?? data.tournament.windows[0]?.id ?? null;
                const target = data.tournament.windows.find((w: WindowRow) => w.id === next);
                setZones(target ? target.zones : []);
                return next;
            });
            setDirty(false);
        } catch {
            setError("Error de red.");
        }
    }, [params.slug]);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (status === "authenticated") load();
    }, [status, router, load]);

    useEffect(() => {
        if (status !== "authenticated") return;
        fetch("/api/roster")
            .then(res => res.json())
            .then(data => {
                if (!data.success) return;
                setRoster(data.users);
                setProDetectionReady(data.proDetectionReady);
                // without the Discord env vars nobody is flagged as pro, so showing
                // only pros would render an empty and very confusing list
                if (!data.proDetectionReady) setOnlyPros(false);
            })
            .catch(() => { });
    }, [status]);

    const selectWindow = (id: string) => {
        if (dirty && !confirm("Tenés cambios sin guardar en el mapa. ¿Descartarlos?")) return;
        setActiveWindowId(id);
        setZones(detail?.windows.find(w => w.id === id)?.zones ?? []);
        setSelectedZoneId(null);
        setDirty(false);
    };

    const updateZone = (id: string, patch: Partial<MapZone>) => {
        setZones(prev => prev.map(z => (z.id === id ? { ...z, ...patch } : z)));
        setDirty(true);
    };

    const deleteZone = (id: string) => {
        setZones(prev => prev.filter(z => z.id !== id));
        setSelectedZoneId(null);
        setDirty(true);
    };

    const saveZones = async () => {
        if (!activeWindowId) return;
        setSaving(true);
        setError("");
        setNotice("");
        try {
            const res = await fetch(`/api/tournaments/${params.slug}/zones`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    windowId: activeWindowId,
                    // draft ids are dropped so the server mints real ObjectIds
                    zones: zones.map(z => ({
                        id: z.id.startsWith("draft-") ? undefined : z.id,
                        label: z.label,
                        x: z.x,
                        y: z.y,
                        w: z.w,
                        h: z.h,
                        capacity: z.capacity,
                    })),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setDetail(data.tournament);
                setZones(data.tournament.windows.find((w: WindowRow) => w.id === activeWindowId)?.zones ?? []);
                setSelectedZoneId(null);
                setDirty(false);
                setNotice("Spots guardados.");
            } else {
                setError(data.error || "No se pudieron guardar los spots.");
            }
        } catch {
            setError("Error de red.");
        }
        setSaving(false);
    };

    const saveWindows = async () => {
        setSavingWindows(true);
        setError("");
        setNotice("");
        try {
            const res = await fetch(`/api/tournaments/${params.slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    windows: windowDrafts
                        .filter(w => w.label.trim() && w.startsAt)
                        .map(w => ({ id: w.id, label: w.label, startsAt: new Date(w.startsAt).toISOString() })),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setNotice("Rondas guardadas.");
                setActiveWindowId(null);
                await load();
            } else {
                setError(data.error || "No se pudieron guardar las rondas.");
            }
        } catch {
            setError("Error de red.");
        }
        setSavingWindows(false);
    };

    const saveQualified = async () => {
        setSavingParticipants(true);
        setError("");
        setNotice("");
        try {
            const list = participantsText
                .split("\n")
                .map(n => n.trim())
                .filter(Boolean);
            const res = await fetch(`/api/tournaments/${params.slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qualifiedIds, participants: list }),
            });
            const data = await res.json();
            if (data.success) {
                setDetail(data.tournament);
                setParticipantsText((data.tournament.participants ?? []).join("\n"));
                setQualifiedIds(data.tournament.qualifiedIds ?? []);
                const total =
                    (data.tournament.qualifiedIds?.length ?? 0) + (data.tournament.participants?.length ?? 0);
                setNotice(
                    total > 0
                        ? `${total} clasificados guardados. Solo ellos pueden marcar spot.`
                        : "Lista vacía: por ahora nadie va a poder marcar spot en este torneo."
                );
            } else {
                setError(data.error || "No se pudo guardar la lista.");
            }
        } catch {
            setError("Error de red.");
        }
        setSavingParticipants(false);
    };

    const toggleQualified = (discordId: string) =>
        setQualifiedIds(prev =>
            prev.includes(discordId) ? prev.filter(id => id !== discordId) : [...prev, discordId]
        );

    if (status === "loading" || !detail) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                {error ? (
                    <p className="text-sm text-red-400">{error}</p>
                ) : (
                    <Loader2 size={40} className="animate-spin text-primary" />
                )}
            </div>
        );
    }

    const selectedZone = zones.find(z => z.id === selectedZoneId) ?? null;
    const windowClaims = claims.filter(c => c.windowId === activeWindowId);

    const preAuthorized = participantsText.split("\n").map(n => n.trim()).filter(Boolean);
    const totalQualified = qualifiedIds.length + preAuthorized.length;

    const rosterNeedle = rosterQuery.trim().toLowerCase();
    const visibleRoster = roster.filter(u => {
        // never hide someone already ticked, or the moderator could not untick them
        const ticked = qualifiedIds.includes(u.discordId);
        if (!ticked && onlyPros && !u.isPro) return false;
        if (!rosterNeedle) return true;
        return `${u.discordName} ${u.epicName}`.toLowerCase().includes(rosterNeedle);
    });

    return (
        <div className="min-h-screen text-white">
            <div className="container mx-auto max-w-6xl px-6 py-16">
                <div className="mb-8">
                    <Link
                        href="/dashboard/tournaments"
                        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-primary"
                    >
                        <ArrowLeft size={16} /> Volver a torneos
                    </Link>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-white md:text-3xl">{detail.name}</h1>
                        <Link
                            href={`/tournaments/${detail.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                        >
                            ver en la web <ExternalLink size={12} />
                        </Link>
                    </div>
                </div>

                {/* The imported templates carry the snapshot's old dates, so they land
                    already finished - which silently blocks every player from claiming. */}
                {detail.status === "Completed" && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3">
                        <CalendarX size={16} className="mt-0.5 shrink-0 text-amber-400" />
                        <p className="text-sm leading-relaxed text-white/70">
                            <span className="font-bold text-amber-400">Este torneo figura como finalizado.</span>{" "}
                            Mientras la fecha de fin esté en el pasado, los jugadores no van a poder marcar su spot
                            (vos sí, porque sos admin). Si es un torneo que todavía se va a jugar, corregí las
                            fechas desde{" "}
                            <Link href="/dashboard/tournaments" className="font-bold text-primary hover:underline">
                                el listado de torneos
                            </Link>
                            .
                        </p>
                    </div>
                )}

                {(error || notice) && (
                    <div
                        className={`mb-6 rounded-lg border px-4 py-3 text-sm ${error
                            ? "border-red-500/20 bg-red-500/10 text-red-400"
                            : "border-primary/20 bg-primary/10 text-primary"
                            }`}
                    >
                        {error || notice}
                    </div>
                )}

                {/* Windows */}
                <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/80">Rondas</h2>

                    <div className="space-y-3">
                        {windowDrafts.map((w, i) => (
                            <div key={w.id ?? `new-${i}`} className="flex flex-col gap-3 sm:flex-row">
                                <input
                                    type="text"
                                    value={w.label}
                                    onChange={e =>
                                        setWindowDrafts(prev =>
                                            prev.map((x, j) => (j === i ? { ...x, label: e.target.value } : x))
                                        )
                                    }
                                    className={inputClass}
                                    placeholder="Grupo A"
                                />
                                <input
                                    type="datetime-local"
                                    value={w.startsAt}
                                    onChange={e =>
                                        setWindowDrafts(prev =>
                                            prev.map((x, j) => (j === i ? { ...x, startsAt: e.target.value } : x))
                                        )
                                    }
                                    className={`${inputClass} sm:w-64`}
                                />
                                <button
                                    onClick={() => setWindowDrafts(prev => prev.filter((_, j) => j !== i))}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                                    aria-label="Quitar ronda"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            onClick={() =>
                                setWindowDrafts(prev => [
                                    ...prev,
                                    { label: `Ronda ${prev.length + 1}`, startsAt: toInputValue(new Date().toISOString()) },
                                ])
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white transition-colors hover:border-primary/40"
                        >
                            <Plus size={15} /> Agregar ronda
                        </button>
                        <button
                            onClick={saveWindows}
                            disabled={savingWindows}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-[#04130A] transition-colors hover:bg-[#43E97B] disabled:opacity-50"
                        >
                            <Save size={15} /> {savingWindows ? "..." : "Guardar rondas"}
                        </button>
                    </div>
                    <p className="mt-3 text-[11px] text-white/40">
                        Borrar una ronda elimina también sus spots y los reclamos de esa ronda.
                    </p>
                </div>

                {/* Qualified players */}
                <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
                            Jugadores clasificados
                        </h2>
                        <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${totalQualified > 0 ? "bg-primary/15 text-primary" : "bg-red-500/15 text-red-400"
                                }`}
                        >
                            {totalQualified > 0 ? `${totalQualified} clasificados` : "nadie puede marcarse"}
                        </span>
                    </div>

                    <p className="mb-4 text-xs leading-relaxed text-white/50">
                        Verificá en la web oficial de Fortnite quiénes clasificaron y tildalos acá. Solo ellos
                        pueden marcar su spot; el resto entra igual y ve dónde caen los pros, pero no puede
                        reclamar. Los admins siempre pueden marcarse, para poder probarlo.
                    </p>

                    {/* The strict rule Gonza chose makes an empty list a dead tournament,
                        so it has to be impossible to miss. */}
                    {totalQualified === 0 && (
                        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/[0.08] px-4 py-3">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-400" />
                            <p className="text-xs leading-relaxed text-white/70">
                                <span className="font-bold text-red-400">Todavía no tildaste a nadie.</span>{" "}
                                Mientras la lista esté vacía ningún jugador va a poder marcar su spot en este
                                torneo.
                            </p>
                        </div>
                    )}

                    {!proDetectionReady && (
                        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />
                            <p className="text-xs leading-relaxed text-white/70">
                                Falta configurar <code className="text-amber-400">MAJOR_SCRIMS_GUILD_ID</code> y{" "}
                                <code className="text-amber-400">DISCORD_PRO_ROLE_ID</code> en Vercel, así que
                                todavía no se puede saber quién tiene el rol PRO en Discord. Mientras tanto la
                                lista muestra a todos los usuarios que entraron a la web.
                            </p>
                        </div>
                    )}

                    {/* Roster picker */}
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[200px] flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                            <input
                                type="search"
                                value={rosterQuery}
                                onChange={e => setRosterQuery(e.target.value)}
                                placeholder="Buscar por nombre de Discord o de Epic..."
                                className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-primary/40"
                            />
                        </div>
                        <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-white/60">
                            <input
                                type="checkbox"
                                checked={onlyPros}
                                onChange={e => setOnlyPros(e.target.checked)}
                                className="h-4 w-4 accent-[#22D962]"
                            />
                            Solo con rol PRO
                        </label>
                    </div>

                    <div className="max-h-80 overflow-y-auto rounded-xl border border-white/10">
                        {visibleRoster.length === 0 ? (
                            <p className="px-4 py-8 text-center text-sm text-white/50">
                                {roster.length === 0
                                    ? "Todavía no entró nadie a la web. Apenas un pro inicie sesión una vez, aparece acá."
                                    : "Ningún usuario coincide con la búsqueda."}
                            </p>
                        ) : (
                            <ul className="divide-y divide-white/5">
                                {visibleRoster.map(u => (
                                    <li key={u.discordId}>
                                        <label
                                            className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors ${qualifiedIds.includes(u.discordId)
                                                ? "bg-primary/[0.08]"
                                                : "hover:bg-white/[0.03]"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={qualifiedIds.includes(u.discordId)}
                                                onChange={() => toggleQualified(u.discordId)}
                                                aria-label={`Clasificar a ${u.discordName}`}
                                                className="h-4 w-4 shrink-0 accent-[#22D962]"
                                            />
                                            {u.avatarUrl ? (
                                                <img
                                                    src={u.avatarUrl}
                                                    alt=""
                                                    className="h-7 w-7 shrink-0 rounded-full border border-white/10"
                                                />
                                            ) : (
                                                <div className="h-7 w-7 shrink-0 rounded-full bg-white/10" />
                                            )}
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center gap-2">
                                                    <span className="truncate text-sm font-medium text-white">
                                                        {u.discordName}
                                                    </span>
                                                    {u.isPro && (
                                                        <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-black uppercase text-primary">
                                                            pro
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="block truncate text-[11px] text-white/40">
                                                    {u.epicName ? `Epic: ${u.epicName}` : "sin nombre de Epic cargado"}
                                                </span>
                                            </span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Escape hatch */}
                    <details className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                        <summary className="cursor-pointer text-xs font-bold text-white/70">
                            ¿Clasificó alguien que nunca entró a la web? Autorizalo por nombre de Epic
                        </summary>
                        <p className="mb-3 mt-3 text-xs leading-relaxed text-white/50">
                            Un nombre de Epic por línea. Cuando esa persona entre por primera vez y ponga ese
                            mismo nombre al marcar su spot, la va a dejar pasar.
                        </p>
                        <textarea
                            value={participantsText}
                            onChange={e => setParticipantsText(e.target.value)}
                            rows={5}
                            spellCheck={false}
                            placeholder={"Peterbot\nPollo"}
                            className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-primary/40"
                        />
                    </details>

                    <button
                        onClick={saveQualified}
                        disabled={savingParticipants}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-[#04130A] transition-colors hover:bg-[#43E97B] disabled:opacity-50"
                    >
                        <Save size={15} /> {savingParticipants ? "..." : "Guardar clasificados"}
                    </button>
                </div>

                {/* Zones */}
                {detail.windows.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-16 text-center">
                        <MapPin size={36} className="mx-auto mb-4 text-primary/60" />
                        <p className="text-sm text-white/60">
                            Creá al menos una ronda para poder marcar los spots en el mapa.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
                                Spots del mapa
                            </h2>
                            <button
                                onClick={saveZones}
                                disabled={saving || !dirty}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-[#04130A] transition-colors hover:bg-[#43E97B] disabled:opacity-40"
                            >
                                <Save size={15} /> {saving ? "..." : dirty ? "Guardar spots" : "Sin cambios"}
                            </button>
                        </div>

                        <div className="mb-5 flex flex-wrap gap-2">
                            {detail.windows.map(w => (
                                <button
                                    key={w.id}
                                    onClick={() => selectWindow(w.id)}
                                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${activeWindowId === w.id
                                        ? "bg-primary text-[#04130A]"
                                        : "border border-white/10 text-white/60 hover:border-white/25 hover:text-white"
                                        }`}
                                >
                                    {w.label}
                                </button>
                            ))}
                        </div>

                        <p className="mb-4 text-xs text-white/50">
                            Arrastrá sobre el mapa para dibujar un spot. Hacé clic en un spot existente para
                            renombrarlo, cambiarle el cupo o borrarlo.
                        </p>

                        <div className="mx-auto max-w-2xl">
                            <DropMap
                                mode="edit"
                                zones={zones}
                                claims={windowClaims}
                                selectedZoneId={selectedZoneId}
                                onSelectZone={setSelectedZoneId}
                                onZonesChange={next => {
                                    setZones(next);
                                    setDirty(true);
                                }}
                                emptyLabel="Arrastrá sobre el mapa para marcar el primer spot."
                            />
                        </div>

                        {selectedZone && (
                            <div className="mx-auto max-w-2xl">
                                <ZoneEditorPanel
                                    zone={selectedZone}
                                    onChange={patch => updateZone(selectedZone.id, patch)}
                                    onDelete={() => deleteZone(selectedZone.id)}
                                />
                            </div>
                        )}

                        <p className="mt-4 text-center text-xs text-white/40">
                            {zones.length} {zones.length === 1 ? "spot marcado" : "spots marcados"}
                            {windowClaims.length > 0 && ` · ${windowClaims.length} reclamados por jugadores`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
