"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    ArrowLeft, Plus, Save, Trash2, MapPin, ExternalLink, Loader2, CalendarX, AlertTriangle, Search, Info,
    Trophy, X, Users,
} from "lucide-react";
import DropMap, { MapZone, MapClaim, ZoneEditorPanel, teamLabel } from "@/components/tournaments/DropMap";
import SpotTemplatePanel from "@/components/tournaments/SpotTemplatePanel";
import { teammateSlots } from "@/lib/teamFormat";

const TEAM_SIZES = ["Solo", "Duos", "Trios", "Squads"];

interface WindowRow {
    id: string;
    label: string;
    startsAt: string;
    zones: MapZone[];
}

interface PrizeRow {
    place: string;
    prize: string;
}

interface Detail {
    slug: string;
    name: string;
    teamSize: string;
    status: string;
    published: boolean;
    description: string;
    prizePool: string;
    prizes: PrizeRow[];
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

    // Public info: format, description and the prize pool table under the map.
    const [teamSize, setTeamSize] = useState("Solo");
    const [description, setDescription] = useState("");
    const [prizePool, setPrizePool] = useState("");
    const [prizes, setPrizes] = useState<PrizeRow[]>([]);
    const [savingInfo, setSavingInfo] = useState(false);

    // Who qualified: ticked from the roster, plus an Epic-name escape hatch for
    // players who qualified but have never signed in (so they are not listed yet).
    const [roster, setRoster] = useState<RosterUser[]>([]);
    const [proDetectionReady, setProDetectionReady] = useState(true);
    const [proCount, setProCount] = useState(0);
    const [checkReasons, setCheckReasons] = useState<Record<string, number>>({});
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
            setDescription(data.tournament.description ?? "");
            setPrizePool(data.tournament.prizePool ?? "");
            setPrizes(data.tournament.prizes ?? []);
            setTeamSize(data.tournament.teamSize || "Solo");
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
                setProCount(data.proCount ?? 0);
                setCheckReasons(data.checkReasons ?? {});
                // Filtering to pros when none are flagged yet renders an empty list
                // that reads like a bug, so only enable it once there is something.
                if (!data.proCount) setOnlyPros(false);
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

    /** One PUT per round: the zones endpoint works on a single window at a time. */
    const applyTemplateToAllRounds = async (templateZones: MapZone[]) => {
        if (!detail) return;
        const payload = templateZones.map(z => ({
            label: z.label,
            x: z.x,
            y: z.y,
            w: z.w,
            h: z.h,
            capacity: z.capacity,
        }));

        for (const w of detail.windows) {
            const res = await fetch(`/api/tournaments/${params.slug}/zones`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ windowId: w.id, zones: payload }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || `No se pudieron guardar los spots de ${w.label}.`);
        }

        await load();
    };

    const removeClaim = async (claim: Claim) => {
        if (!confirm(`¿Sacar a ${teamLabel(claim)} de su spot?`)) return;
        setSaving(true);
        setError("");
        setNotice("");
        try {
            const res = await fetch(`/api/tournaments/${params.slug}/claim`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ claimId: claim.id }),
            });
            const data = await res.json();
            if (data.success) {
                setNotice(`${teamLabel(claim)} quedó fuera del spot.`);
                await load();
            } else {
                setError(data.error || "No se pudo sacar al equipo.");
            }
        } catch {
            setError("Error de red.");
        }
        setSaving(false);
    };

    const saveInfo = async () => {
        setSavingInfo(true);
        setError("");
        setNotice("");
        try {
            const res = await fetch(`/api/tournaments/${params.slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teamSize,
                    description,
                    prizePool,
                    prizes: prizes.filter(p => p.place.trim()),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setDetail(data.tournament);
                setPrizes(data.tournament.prizes ?? []);
                setNotice(
                    teammateSlots(teamSize) > 0
                        ? `Guardado. Al marcar spot cada jugador va a tener que elegir a su ${teammateSlots(teamSize) === 1 ? "dúo" : "equipo"}.`
                        : "Guardado. En formato Solo no se pide compañero al marcar el spot."
                );
            } else {
                setError(data.error || "No se pudo guardar la información.");
            }
        } catch {
            setError("Error de red.");
        }
        setSavingInfo(false);
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

    // Discord access tokens last a week and we do not refresh them, so a long-lived
    // session cannot be used to read roles until the user signs in again.
    const staleTokens = Object.entries(checkReasons)
        .filter(([reason]) => reason.startsWith("token-rejected") || reason === "no-token")
        .reduce((sum, [, n]) => sum + n, 0);

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

                {/* Description + prize pool: both are shown on the public page. */}
                <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/80">
                        Formato, descripción y premios
                    </h2>

                    {/* The format is what turns the duo picker on: in Solo nobody is
                        asked for a teammate, which reads as "the duo thing is missing". */}
                    <div className="mb-5 flex flex-wrap items-end gap-3">
                        <div className="w-full sm:w-48">
                            <label className="mb-1.5 block text-xs text-white/60">Formato</label>
                            <select
                                value={teamSize}
                                onChange={e => setTeamSize(e.target.value)}
                                className={inputClass}
                            >
                                {TEAM_SIZES.map(s => (
                                    <option key={s} value={s} className="bg-[#0B1F14]">
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <p className="flex items-start gap-1.5 pb-2 text-[11px] leading-relaxed text-white/45 sm:max-w-md">
                            <Users size={13} className="mt-0.5 shrink-0 text-primary" />
                            {teammateSlots(teamSize) > 0
                                ? `Al marcar el spot, cada jugador tiene que elegir a ${teammateSlots(teamSize) === 1 ? "su dúo" : `sus ${teammateSlots(teamSize)} compañeros`} de la lista de clasificados y quedan marcados todos juntos en el mismo spot.`
                                : "En Solo no se pide compañero. Poné Duos para que cada jugador elija a su dúo al marcar el spot."}
                        </p>
                    </div>

                    <label className="mb-1.5 block text-xs text-white/60">
                        Descripción del torneo (se muestra arriba del mapa)
                    </label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={5}
                        maxLength={8000}
                        placeholder={"Formato, horarios, reglas, cómo se juega la final...\nLos saltos de línea se respetan."}
                        className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm leading-relaxed text-white placeholder-white/25 outline-none transition-colors focus:border-primary/40"
                    />

                    <div className="mt-5 flex flex-wrap items-end gap-3">
                        <div className="w-full sm:w-64">
                            <label className="mb-1.5 block text-xs text-white/60">
                                Prize pool total (texto libre)
                            </label>
                            <input
                                type="text"
                                value={prizePool}
                                onChange={e => setPrizePool(e.target.value)}
                                className={inputClass}
                                placeholder="R$ 10.000"
                            />
                        </div>
                        <p className="flex items-center gap-1.5 pb-2 text-[11px] text-white/40">
                            <Trophy size={13} className="text-primary" /> La tabla se muestra abajo de todo en el
                            mapa del torneo.
                        </p>
                    </div>

                    <div className="mt-4 space-y-2">
                        {prizes.map((row, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    type="text"
                                    value={row.place}
                                    onChange={e =>
                                        setPrizes(prev =>
                                            prev.map((p, j) => (j === i ? { ...p, place: e.target.value } : p))
                                        )
                                    }
                                    className={`${inputClass} sm:w-48`}
                                    placeholder={`${i + 1}°`}
                                />
                                <input
                                    type="text"
                                    value={row.prize}
                                    onChange={e =>
                                        setPrizes(prev =>
                                            prev.map((p, j) => (j === i ? { ...p, prize: e.target.value } : p))
                                        )
                                    }
                                    className={inputClass}
                                    placeholder="R$ 3.000"
                                />
                                <button
                                    onClick={() => setPrizes(prev => prev.filter((_, j) => j !== i))}
                                    aria-label={`Quitar puesto ${i + 1}`}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            onClick={() =>
                                setPrizes(prev => [...prev, { place: `${prev.length + 1}°`, prize: "" }])
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white transition-colors hover:border-primary/40"
                        >
                            <Plus size={15} /> Agregar puesto
                        </button>
                        <button
                            onClick={saveInfo}
                            disabled={savingInfo}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-[#04130A] transition-colors hover:bg-[#43E97B] disabled:opacity-50"
                        >
                            <Save size={15} /> {savingInfo ? "..." : "Guardar formato, descripción y premios"}
                        </button>
                    </div>
                </div>

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

                    {!proDetectionReady ? (
                        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />
                            <p className="text-xs leading-relaxed text-white/70">
                                Falta configurar <code className="text-amber-400">MAJOR_SCRIMS_GUILD_ID</code> y{" "}
                                <code className="text-amber-400">DISCORD_PRO_ROLE_ID</code> en Vercel, así que
                                todavía no se puede saber quién tiene el rol PRO en Discord. Mientras tanto la
                                lista muestra a todos los usuarios que entraron a la web.
                            </p>
                        </div>
                    ) : (
                        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                            <Info size={16} className="mt-0.5 shrink-0 text-primary" />
                            <div className="text-xs leading-relaxed text-white/60">
                                <p>
                                    El rol PRO se lee de Discord{" "}
                                    <span className="text-white/80">cuando cada jugador entra a la web</span>, no
                                    desde el servidor entero. Por eso acá solo aparecen los que ya iniciaron
                                    sesión al menos una vez: hoy son{" "}
                                    <span className="font-bold text-white">{roster.length}</span>, de los cuales{" "}
                                    <span className="font-bold text-primary">{proCount}</span> tienen el rol PRO.
                                </p>
                                {staleTokens > 0 && (
                                    <p className="mt-1.5 text-amber-400">
                                        {staleTokens} {staleTokens === 1 ? "usuario tiene" : "usuarios tienen"} el
                                        token de Discord vencido (dura una semana y no lo renovamos). Hasta que
                                        cierren sesión y vuelvan a entrar no podemos leerles el rol.
                                    </p>
                                )}
                                {Object.keys(checkReasons).length > 0 && (
                                    <p className="mt-1.5 text-white/35">
                                        Diagnóstico:{" "}
                                        {Object.entries(checkReasons)
                                            .map(([r, n]) => `${r}=${n}`)
                                            .join(" · ")}
                                    </p>
                                )}
                            </div>
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
                            <div className="px-4 py-8 text-center">
                                {roster.length === 0 ? (
                                    <p className="text-sm text-white/50">
                                        Todavía no entró nadie a la web. Apenas un pro inicie sesión una vez,
                                        aparece acá.
                                    </p>
                                ) : onlyPros ? (
                                    <>
                                        <p className="mb-3 text-sm text-white/50">
                                            Ninguno de los {roster.length} usuarios que entraron figura con el rol
                                            PRO todavía.
                                        </p>
                                        <button
                                            onClick={() => setOnlyPros(false)}
                                            className="rounded-lg border border-white/15 px-4 py-2 text-xs font-bold text-white transition-colors hover:border-primary/40 hover:text-primary"
                                        >
                                            Mostrar a todos igual
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-sm text-white/50">
                                        Ningún usuario coincide con la búsqueda.
                                    </p>
                                )}
                            </div>
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

                        <SpotTemplatePanel
                            zones={zones}
                            roundCount={detail.windows.length}
                            busy={saving}
                            onApply={next => {
                                setZones(next);
                                setSelectedZoneId(null);
                                setDirty(true);
                            }}
                            onApplyToAllRounds={applyTemplateToAllRounds}
                        />

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

                        {/* Taking a team off a spot: also how a dispute gets resolved. */}
                        {windowClaims.length > 0 && (
                            <div className="mt-5 border-t border-white/10 pt-5">
                                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
                                    <Users size={14} className="text-primary" /> Equipos anotados en esta ronda (
                                    {windowClaims.length})
                                </h3>
                                <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10">
                                    {windowClaims.map(claim => {
                                        const savedZones =
                                            detail.windows.find(w => w.id === activeWindowId)?.zones ?? [];
                                        const zone = savedZones.find(z => z.id === claim.zoneId);
                                        return (
                                            <li
                                                key={claim.id}
                                                className={`flex items-center justify-between gap-3 px-4 py-2.5 ${claim.disputed ? "bg-red-500/[0.07]" : ""
                                                    }`}
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-white">
                                                        {teamLabel(claim)}
                                                    </p>
                                                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/40">
                                                        <span className="truncate">
                                                            {zone?.label ?? "spot borrado"}
                                                        </span>
                                                        {claim.disputed && (
                                                            <span className="shrink-0 rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-black uppercase text-red-400">
                                                                en disputa
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeClaim(claim)}
                                                    disabled={saving}
                                                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-[11px] font-bold text-red-400 transition-colors hover:bg-red-500/15 disabled:opacity-50"
                                                >
                                                    <X size={12} /> Sacar
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
