"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2, Trophy, Users, MapPin, LogIn, X, CalendarX } from "lucide-react";
import { useI18n } from "@/i18n";
import DropMap, { MapZone, MapClaim } from "@/components/tournaments/DropMap";
import ClaimSpotModal from "@/components/tournaments/ClaimSpotModal";

const POLL_MS = 10000;

interface WindowDTO {
    id: string;
    label: string;
    startsAt: string;
    zones: MapZone[];
}

interface TournamentDetail {
    id: string;
    slug: string;
    name: string;
    poster: string;
    mode: string;
    teamSize: string;
    region: string;
    start: string;
    end: string;
    status: string;
    restricted: boolean;
    participants: string[];
    windows: WindowDTO[];
}

interface Claim extends MapClaim {
    windowId: string;
    discordName: string;
}

export default function TournamentDetailPage({ params }: { params: { slug: string } }) {
    const { t, language } = useI18n();
    const { data: session, status: authStatus } = useSession();

    const [tournament, setTournament] = useState<TournamentDetail | null>(null);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [viewer, setViewer] = useState<{ signedIn: boolean; isAdmin: boolean }>({
        signedIn: false,
        isAdmin: false,
    });
    const [notFound, setNotFound] = useState(false);
    const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [showClaim, setShowClaim] = useState(false);
    const [saving, setSaving] = useState(false);
    const [claimError, setClaimError] = useState("");
    const [savedEpicName, setSavedEpicName] = useState("");

    const locale = language === "pt" ? "pt-BR" : "es-AR";
    const myDiscordId = session?.user?.id ?? null;

    const load = useCallback(async () => {
        try {
            const res = await fetch(`/api/tournaments/${params.slug}`);
            const data = await res.json();
            if (!data.success) {
                setNotFound(true);
                return;
            }
            setTournament(data.tournament);
            setClaims(data.claims);
            if (data.viewer) setViewer(data.viewer);
            setActiveWindowId(prev => prev ?? data.tournament.windows[0]?.id ?? null);
        } catch {
            setNotFound(true);
        }
    }, [params.slug]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (authStatus !== "authenticated") return;
        fetch("/api/me/profile")
            .then(res => res.json())
            .then(data => setSavedEpicName(data.epicName || ""))
            .catch(() => { });
    }, [authStatus]);

    // Nothing pushes spot changes to us (Vercel has no websockets), so poll while
    // the tab is visible and other people's claims show up within ~10s.
    useEffect(() => {
        const id = setInterval(() => {
            if (document.visibilityState === "visible") load();
        }, POLL_MS);
        return () => clearInterval(id);
    }, [load]);

    const activeWindow = useMemo(
        () => tournament?.windows.find(w => w.id === activeWindowId) ?? null,
        [tournament, activeWindowId]
    );

    const windowClaims = useMemo(
        () => claims.filter(c => c.windowId === activeWindowId),
        [claims, activeWindowId]
    );

    const myClaim = windowClaims.find(c => c.discordId === myDiscordId) ?? null;
    const selectedZone = activeWindow?.zones.find(z => z.id === selectedZoneId) ?? null;
    const selectedZoneClaims = windowClaims.filter(c => c.zoneId === selectedZoneId);
    const selectedZoneIsFull =
        !!selectedZone && selectedZoneClaims.length >= (selectedZone.capacity ?? 1);

    const totalCapacity = (activeWindow?.zones ?? []).reduce((sum, z) => sum + (z.capacity ?? 1), 0);

    // A finished tournament stops accepting spots - except for admins, who need to
    // be able to test a tournament whose dates have not been corrected yet.
    const isFinished = tournament?.status === "Completed";
    const claimsClosed = isFinished && !viewer.isAdmin;

    const formatRange = () => {
        if (!tournament) return "";
        const start = new Date(tournament.start);
        const end = new Date(tournament.end);
        const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
        const sameDay = start.toDateString() === end.toDateString();
        return sameDay
            ? `${start.toLocaleDateString(locale, { ...opts, year: "numeric" })}`
            : `${start.toLocaleDateString(locale, opts)} - ${end.toLocaleDateString(locale, { ...opts, year: "numeric" })}`;
    };

    const handleClaim = async (epicName: string, teammates: string[]) => {
        if (!selectedZone || !activeWindowId) return;
        setSaving(true);
        setClaimError("");
        try {
            const res = await fetch(`/api/tournaments/${params.slug}/claim`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ windowId: activeWindowId, zoneId: selectedZone.id, epicName, teammates }),
            });
            const data = await res.json();
            if (data.success) {
                setShowClaim(false);
                await load();
            } else {
                setClaimError(data.error || "No se pudo reservar el spot.");
                await load();
            }
        } catch {
            setClaimError("Error de red.");
        }
        setSaving(false);
    };

    const handleRelease = async () => {
        if (!myClaim) return;
        setSaving(true);
        try {
            await fetch(`/api/tournaments/${params.slug}/claim`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ claimId: myClaim.id }),
            });
            await load();
        } catch {
            /* the poll will resync */
        }
        setSaving(false);
    };

    if (notFound) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center text-white">
                <Trophy size={40} className="text-primary/60" />
                <p className="text-white/70">Torneo no encontrado.</p>
                <Link href="/tournaments" className="text-sm font-bold text-primary hover:underline">
                    {t.tournaments.back}
                </Link>
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 size={40} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white">
            {/* -mt-[88px] pulls the banner up behind the sticky nav (nav height = 88px) */}
            <section className="relative -mt-[88px] overflow-hidden border-b border-white/10">
                {tournament.poster && (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-30"
                        style={{ backgroundImage: `url(${tournament.poster})` }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg0,#04130A)] via-[var(--bg0,#04130A)]/85 to-transparent" />

                <div className="container relative z-10 mx-auto max-w-7xl px-6 pb-10 pt-[112px] md:pt-[140px]">
                    <Link
                        href="/tournaments"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-primary"
                    >
                        <ArrowLeft size={16} /> {t.tournaments.back}
                    </Link>
                    <h1 className="text-2xl font-black tracking-tight md:text-4xl">{tournament.name}</h1>
                    <p className="mt-2 text-sm text-white/60">
                        {formatRange()} · {tournament.mode} · {tournament.teamSize} · {tournament.region}
                    </p>
                </div>
            </section>

            {tournament.windows.length > 1 && (
                <div className="border-b border-white/10 bg-white/[0.02]">
                    <div className="container mx-auto max-w-7xl overflow-x-auto px-6">
                        <div className="flex min-w-max">
                            {tournament.windows.map(w => (
                                <button
                                    key={w.id}
                                    onClick={() => {
                                        setActiveWindowId(w.id);
                                        setSelectedZoneId(null);
                                    }}
                                    className={`border-b-2 px-6 py-4 text-center transition-colors ${activeWindowId === w.id
                                        ? "border-primary text-primary"
                                        : "border-transparent text-white/50 hover:text-white"
                                        }`}
                                >
                                    <span className="block text-sm font-bold">{w.label}</span>
                                    <span className="mt-0.5 block text-[11px] text-white/40">
                                        {new Date(w.startsAt).toLocaleString(locale, {
                                            day: "numeric",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <main className="container mx-auto max-w-7xl px-6 py-10">
                {!activeWindow ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-20 text-center">
                        <MapPin size={40} className="mx-auto mb-4 text-primary/60" />
                        <p className="text-sm text-white/60">{t.tournaments.noWindows}</p>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
                        {/* Teams */}
                        <div>
                            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/80">
                                <Users size={15} className="text-primary" /> {t.tournaments.teamsTitle}
                            </h2>

                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                                {windowClaims.length === 0 ? (
                                    <p className="px-4 py-10 text-center text-sm text-white/50">
                                        {t.tournaments.noTeams}
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-white/5">
                                        {windowClaims.map(claim => {
                                            const zone = activeWindow.zones.find(z => z.id === claim.zoneId);
                                            const mine = claim.discordId === myDiscordId;
                                            return (
                                                <li
                                                    key={claim.id}
                                                    className={`flex items-center justify-between gap-3 px-4 py-3 ${mine ? "bg-primary/[0.07]" : ""
                                                        }`}
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-bold text-primary">
                                                            {claim.epicName}
                                                            {claim.teammates.length > 0 && (
                                                                <span className="font-medium text-white/70">
                                                                    {" + "}
                                                                    {claim.teammates.join(" + ")}
                                                                </span>
                                                            )}
                                                        </p>
                                                        {zone && (
                                                            <p className="mt-0.5 truncate text-[11px] text-white/40">
                                                                {zone.label}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {mine && (
                                                        <button
                                                            onClick={handleRelease}
                                                            disabled={saving}
                                                            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-[11px] font-bold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                                                        >
                                                            <X size={12} /> {t.tournaments.release}
                                                        </button>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Map */}
                        <div>
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/80">
                                    <MapPin size={15} className="text-primary" /> {t.tournaments.mapTitle}
                                </h2>
                                {activeWindow.zones.length > 0 && (
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/70">
                                        <Users size={12} className="text-primary" />
                                        {windowClaims.length} / {totalCapacity} {t.tournaments.spotsTaken}
                                    </span>
                                )}
                            </div>

                            {isFinished && (
                                <div
                                    className={`mb-4 flex items-start gap-2.5 rounded-xl border px-4 py-3 ${viewer.isAdmin
                                        ? "border-amber-400/25 bg-amber-400/[0.07]"
                                        : "border-white/10 bg-white/[0.03]"
                                        }`}
                                >
                                    <CalendarX
                                        size={15}
                                        className={`mt-0.5 shrink-0 ${viewer.isAdmin ? "text-amber-400" : "text-white/40"}`}
                                    />
                                    <p className="text-xs leading-relaxed text-white/60">
                                        {viewer.isAdmin ? t.tournaments.finishedAdmin : t.tournaments.finishedNotice}
                                    </p>
                                </div>
                            )}

                            {tournament.restricted && (
                                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                    <Users size={15} className="mt-0.5 shrink-0 text-primary" />
                                    <p className="text-xs leading-relaxed text-white/60">
                                        {t.tournaments.onlyQualified}{" "}
                                        <span className="text-white/40">
                                            ({tournament.participants.length} {t.tournaments.qualified})
                                        </span>
                                        {viewer.isAdmin && (
                                            <span className="ml-1 text-primary">{t.tournaments.adminOverride}</span>
                                        )}
                                    </p>
                                </div>
                            )}

                            <DropMap
                                zones={activeWindow.zones}
                                claims={windowClaims}
                                myDiscordId={myDiscordId}
                                selectedZoneId={selectedZoneId}
                                onSelectZone={setSelectedZoneId}
                                emptyLabel={t.tournaments.noZones}
                            />

                            {/* Numbered legend - on phones the labels do not fit inside the
                                rectangles, so this list is how a player reads and picks a spot. */}
                            {activeWindow.zones.length > 0 && (
                                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                    {activeWindow.zones.map((zone, index) => {
                                        const zoneClaims = windowClaims.filter(c => c.zoneId === zone.id);
                                        const mine = zoneClaims.some(c => c.discordId === myDiscordId);
                                        const full = zoneClaims.length >= (zone.capacity ?? 1);
                                        return (
                                            <button
                                                key={zone.id}
                                                onClick={() => setSelectedZoneId(zone.id)}
                                                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${selectedZoneId === zone.id
                                                    ? "border-primary bg-primary/10"
                                                    : "border-white/10 bg-white/[0.03] hover:border-white/25"
                                                    }`}
                                            >
                                                <span
                                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${mine
                                                        ? "bg-primary text-[#04130A]"
                                                        : full
                                                            ? "bg-red-500/20 text-red-300"
                                                            : "bg-white/10 text-white/70"
                                                        }`}
                                                >
                                                    {index + 1}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-bold text-white">
                                                        {zone.label}
                                                    </span>
                                                    <span
                                                        className={`block truncate text-[11px] ${zoneClaims.length ? "text-white/60" : "text-primary"
                                                            }`}
                                                    >
                                                        {zoneClaims.length
                                                            ? zoneClaims
                                                                .map(c => [c.epicName, ...c.teammates].join(" + "))
                                                                .join(" · ")
                                                            : t.tournaments.free}
                                                    </span>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Selected zone actions */}
                            {selectedZone && (
                                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="truncate font-bold text-white">{selectedZone.label}</p>
                                        <p className="mt-0.5 text-xs text-white/50">
                                            {selectedZoneClaims.length > 0
                                                ? selectedZoneClaims
                                                    .map(c => [c.epicName, ...c.teammates].join(" + "))
                                                    .join(" · ")
                                                : t.tournaments.free}
                                        </p>
                                    </div>

                                    {authStatus !== "authenticated" ? (
                                        <Link
                                            href="/login"
                                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:border-primary/40 hover:text-primary"
                                        >
                                            <LogIn size={15} /> {t.tournaments.loginToClaim}
                                        </Link>
                                    ) : myClaim?.zoneId === selectedZone.id ? (
                                        <button
                                            onClick={handleRelease}
                                            disabled={saving}
                                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                                        >
                                            <X size={15} /> {t.tournaments.release}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setClaimError("");
                                                setShowClaim(true);
                                            }}
                                            disabled={selectedZoneIsFull || claimsClosed}
                                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-[#04130A] transition-colors hover:bg-[#43E97B] disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <MapPin size={15} />
                                            {claimsClosed
                                                ? t.tournaments.finished
                                                : selectedZoneIsFull
                                                    ? t.tournaments.taken
                                                    : t.tournaments.claim}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {showClaim && selectedZone && (
                <ClaimSpotModal
                    zoneLabel={selectedZone.label}
                    teamSize={tournament.teamSize}
                    participants={tournament.participants}
                    enforceQualified={tournament.restricted && !viewer.isAdmin}
                    defaultEpicName={myClaim?.epicName || savedEpicName || session?.user?.name || ""}
                    saving={saving}
                    error={claimError}
                    onConfirm={handleClaim}
                    onClose={() => setShowClaim(false)}
                />
            )}
        </div>
    );
}
