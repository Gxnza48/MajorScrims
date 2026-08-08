"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    ArrowLeft, Loader2, Trophy, Users, MapPin, LogIn, X, CalendarX, ShieldCheck, Swords, Info,
} from "lucide-react";
import { useI18n } from "@/i18n";
import DropMap, {
    MapZone, MapClaim, teamLabel, isZoneDisputed, claimBelongsTo,
} from "@/components/tournaments/DropMap";
import ClaimSpotModal, { TeammateOption } from "@/components/tournaments/ClaimSpotModal";

const POLL_MS = 10000;

interface WindowDTO {
    id: string;
    label: string;
    startsAt: string;
    zones: MapZone[];
}

interface PrizeRow {
    place: string;
    prize: string;
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
    description: string;
    prizePool: string;
    prizes: PrizeRow[];
    qualifiedCount: number;
    windows: WindowDTO[];
}

type BlockReason = "not-signed-in" | "finished" | "no-list" | "not-qualified" | null;

interface Viewer {
    signedIn: boolean;
    isAdmin: boolean;
    isPro: boolean;
    epicName: string;
    canClaim: boolean;
    blockedBecause: BlockReason;
}

interface Claim extends MapClaim {
    windowId: string;
    discordName: string;
    teammateIds: string[];
    disputed: boolean;
}

export default function TournamentDetailPage({ params }: { params: { slug: string } }) {
    const { t, language } = useI18n();
    const { data: session, status: authStatus } = useSession();

    const [tournament, setTournament] = useState<TournamentDetail | null>(null);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [teammateOptions, setTeammateOptions] = useState<TeammateOption[]>([]);
    const [viewer, setViewer] = useState<Viewer>({
        signedIn: false,
        isAdmin: false,
        isPro: false,
        epicName: "",
        canClaim: false,
        blockedBecause: null,
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
            setTeammateOptions(data.teammateOptions ?? []);
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

    // A duo shares one claim: the partner sees it as theirs and can release it.
    const isMyTeam = (c: Claim) => claimBelongsTo(c, myDiscordId);
    const myClaim = windowClaims.find(isMyTeam) ?? null;
    const selectedZone = activeWindow?.zones.find(z => z.id === selectedZoneId) ?? null;
    const selectedZoneClaims = windowClaims.filter(c => c.zoneId === selectedZoneId);
    const selectedZoneIsFull =
        !!selectedZone && selectedZoneClaims.length >= (selectedZone.capacity ?? 1);

    const disputedCount = windowClaims.filter(c => c.disputed).length;

    // The server already decided whether this viewer may claim and why not; the
    // page only renders that answer so button and API can never disagree.
    const blocked = viewer.blockedBecause;
    const claimsClosed = !viewer.canClaim;

    const selectedZoneContested =
        !!selectedZone && isZoneDisputed(selectedZoneClaims, selectedZone.capacity ?? 1);
    const myZoneIsSelected = !!selectedZone && myClaim?.zoneId === selectedZone.id;
    // A full zone is not a dead end any more: whoever may claim can dispute it.
    const canDisputeSelected = selectedZoneIsFull && !claimsClosed && !myZoneIsSelected;

    const blockMessage: Record<Exclude<BlockReason, null>, string> = {
        "not-signed-in": t.tournaments.loginToClaim,
        finished: t.tournaments.finishedNotice,
        "no-list": t.tournaments.blockedNoList,
        "not-qualified": t.tournaments.blockedNotQualified,
    };

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
                body: JSON.stringify({
                    windowId: activeWindowId,
                    zoneId: selectedZone.id,
                    epicName,
                    teammates,
                    // The server decides whether this really is a dispute; sending
                    // the flag is how the player confirms they meant to take a
                    // spot somebody else already has.
                    dispute: selectedZoneIsFull,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setShowClaim(false);
                await load();
            } else {
                setClaimError(data.error || "No se pudo reservar el spot.");
                // Reloading flips the modal into dispute mode when somebody took
                // the zone while this player was filling the form.
                await load();
            }
        } catch {
            setClaimError("Error de red.");
        }
        setSaving(false);
    };

    const removeClaim = async (claimId: string) => {
        setSaving(true);
        try {
            await fetch(`/api/tournaments/${params.slug}/claim`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ claimId }),
            });
            await load();
        } catch {
            /* the poll will resync */
        }
        setSaving(false);
    };

    const handleRelease = () => myClaim && removeClaim(myClaim.id);

    /** Admins take any team off a spot - that is how a dispute gets resolved. */
    const handleAdminRemove = (claim: Claim) => {
        if (!confirm(`${t.tournaments.removeTeamConfirm}\n\n${teamLabel(claim)}`)) return;
        removeClaim(claim.id);
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
                {/* Plain text on purpose: the moderator writes it from the panel and
                    it is rendered as text, so nothing they paste can inject markup. */}
                {tournament.description && (
                    <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/80">
                            <Info size={15} className="text-primary" /> {t.tournaments.infoTitle}
                        </h2>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-white/70">
                            {tournament.description}
                        </p>
                    </section>
                )}

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
                                            const mine = isMyTeam(claim);
                                            return (
                                                <li
                                                    key={claim.id}
                                                    className={`flex items-center justify-between gap-3 px-4 py-3 ${claim.disputed
                                                        ? "bg-red-500/[0.07]"
                                                        : mine
                                                            ? "bg-primary/[0.07]"
                                                            : ""
                                                        }`}
                                                >
                                                    <div className="min-w-0">
                                                        <p
                                                            className={`truncate text-sm font-bold ${claim.disputed ? "text-red-400" : "text-primary"
                                                                }`}
                                                        >
                                                            {claim.epicName}
                                                            {claim.teammates.length > 0 && (
                                                                <span className="font-medium text-white/70">
                                                                    {" + "}
                                                                    {claim.teammates.join(" + ")}
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-white/40">
                                                            {zone && <span className="truncate">{zone.label}</span>}
                                                            {claim.disputed && (
                                                                <span className="shrink-0 rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-black uppercase text-red-400">
                                                                    {t.tournaments.disputeBadge}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="flex shrink-0 items-center gap-1.5">
                                                        {mine && (
                                                            <button
                                                                onClick={handleRelease}
                                                                disabled={saving}
                                                                className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-[11px] font-bold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                                                            >
                                                                <X size={12} /> {t.tournaments.release}
                                                            </button>
                                                        )}
                                                        {/* Moderators take a team off a spot from the same list
                                                            they read it in - no separate admin screen needed. */}
                                                        {viewer.isAdmin && !mine && (
                                                            <button
                                                                onClick={() => handleAdminRemove(claim)}
                                                                disabled={saving}
                                                                title={`${t.tournaments.removeTeam} ${teamLabel(claim)}`}
                                                                className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-[11px] font-bold text-red-400 transition-colors hover:bg-red-500/15 disabled:opacity-50"
                                                            >
                                                                <X size={12} /> {t.tournaments.removeTeam}
                                                            </button>
                                                        )}
                                                    </div>
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
                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* Teams, not spots: a duo is one team on one spot. */}
                                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/70">
                                            <Users size={12} className="text-primary" />
                                            {windowClaims.length} {t.tournaments.teamsMarked}
                                        </span>
                                        {disputedCount > 0 && (
                                            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400">
                                                <Swords size={12} />
                                                {disputedCount} {t.tournaments.disputeBadge.toLowerCase()}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* One honest explanation instead of a mute disabled button. */}
                            {blocked && (
                                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                    {blocked === "finished" ? (
                                        <CalendarX size={15} className="mt-0.5 shrink-0 text-white/40" />
                                    ) : blocked === "not-signed-in" ? (
                                        <LogIn size={15} className="mt-0.5 shrink-0 text-primary" />
                                    ) : (
                                        <Users size={15} className="mt-0.5 shrink-0 text-primary" />
                                    )}
                                    <p className="text-xs leading-relaxed text-white/60">{blockMessage[blocked]}</p>
                                </div>
                            )}

                            {viewer.isAdmin && (
                                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3">
                                    <ShieldCheck size={15} className="mt-0.5 shrink-0 text-amber-400" />
                                    <p className="text-xs leading-relaxed text-white/60">
                                        {t.tournaments.adminOverride} {t.tournaments.adminCanRemove}{" "}
                                        <span className="text-white/40">
                                            ({tournament.qualifiedCount} {t.tournaments.qualified})
                                        </span>
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
                                        const mine = zoneClaims.some(isMyTeam);
                                        const taken = zoneClaims.length > 0;
                                        const contested = isZoneDisputed(zoneClaims, zone.capacity ?? 1);
                                        return (
                                            <button
                                                key={zone.id}
                                                onClick={() => setSelectedZoneId(zone.id)}
                                                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${contested
                                                    ? "border-red-500/50 bg-red-500/[0.07]"
                                                    : selectedZoneId === zone.id
                                                        ? "border-primary bg-primary/10"
                                                        : "border-white/10 bg-white/[0.03] hover:border-white/25"
                                                    }`}
                                            >
                                                <span
                                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${contested
                                                        ? "bg-red-500 text-white"
                                                        : mine
                                                            ? "bg-primary text-[#04130A]"
                                                            : taken
                                                                ? "bg-white/20 text-white/80"
                                                                : "bg-white/10 text-white/70"
                                                        }`}
                                                >
                                                    {index + 1}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="min-w-0 truncate text-sm font-bold text-white">
                                                            {zone.label}
                                                        </span>
                                                        {contested && (
                                                            <span className="shrink-0 rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-black uppercase text-red-400">
                                                                {t.tournaments.disputeBadge}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span
                                                        className={`block truncate text-[11px] ${zoneClaims.length ? "text-white/60" : "text-primary"
                                                            }`}
                                                    >
                                                        {zoneClaims.length
                                                            ? zoneClaims.map(teamLabel).join(" · ")
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
                                <div
                                    className={`mt-4 rounded-2xl border p-4 ${selectedZoneContested
                                        ? "border-red-500/40 bg-red-500/[0.05]"
                                        : "border-white/10 bg-white/[0.03]"
                                        }`}
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="truncate font-bold text-white">{selectedZone.label}</p>
                                            <p className="mt-0.5 text-xs text-white/50">
                                                {selectedZoneClaims.length > 0
                                                    ? selectedZoneClaims.map(teamLabel).join(" · ")
                                                    : t.tournaments.free}
                                            </p>
                                        </div>

                                        {blocked === "not-signed-in" ? (
                                            <Link
                                                href="/login"
                                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:border-primary/40 hover:text-primary"
                                            >
                                                <LogIn size={15} /> {t.tournaments.loginToClaim}
                                            </Link>
                                        ) : myZoneIsSelected ? (
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
                                                disabled={claimsClosed || (selectedZoneIsFull && !canDisputeSelected)}
                                                className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${canDisputeSelected
                                                    ? "bg-red-500 text-white hover:bg-red-600"
                                                    : "bg-primary text-[#04130A] hover:bg-[#43E97B]"
                                                    }`}
                                            >
                                                {canDisputeSelected ? <Swords size={15} /> : <MapPin size={15} />}
                                                {blocked === "finished"
                                                    ? t.tournaments.finished
                                                    : claimsClosed
                                                        ? t.tournaments.blockedLabel
                                                        : selectedZoneIsFull
                                                            ? t.tournaments.disputeConfirm
                                                            : t.tournaments.claim}
                                            </button>
                                        )}
                                    </div>

                                    {canDisputeSelected && (
                                        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-red-300/80">
                                            <Swords size={14} className="mt-0.5 shrink-0" />
                                            {t.tournaments.disputeHint}
                                        </p>
                                    )}

                                    {/* Resolving a dispute is just removing one of the teams. */}
                                    {viewer.isAdmin && selectedZoneClaims.length > 0 && (
                                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                                                {t.tournaments.removeTeam}:
                                            </span>
                                            {selectedZoneClaims.map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => handleAdminRemove(c)}
                                                    disabled={saving}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-[11px] font-bold text-red-400 transition-colors hover:bg-red-500/15 disabled:opacity-50"
                                                >
                                                    <X size={12} /> {teamLabel(c)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                )}

                {/* Prize pool: the last thing on the page, under the map. */}
                {(tournament.prizes.length > 0 || tournament.prizePool) && (
                    <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/80">
                                <Trophy size={15} className="text-primary" /> {t.tournaments.prizesTitle}
                            </h2>
                            {tournament.prizePool && (
                                <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">
                                    {t.tournaments.prizePoolLabel}: {tournament.prizePool}
                                </span>
                            )}
                        </div>
                        {tournament.prizes.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-white/40">
                                            <th className="px-5 py-2.5 font-bold">{t.tournaments.prizePlace}</th>
                                            <th className="px-5 py-2.5 text-right font-bold">
                                                {t.tournaments.prizeAmount}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {tournament.prizes.map((row, i) => (
                                            <tr key={`${row.place}-${i}`} className={i === 0 ? "bg-primary/[0.05]" : ""}>
                                                <td
                                                    className={`px-5 py-3 font-bold ${i === 0 ? "text-primary" : "text-white/80"
                                                        }`}
                                                >
                                                    {row.place}
                                                </td>
                                                <td className="px-5 py-3 text-right font-medium text-white">
                                                    {row.prize}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}
            </main>

            {showClaim && selectedZone && (
                <ClaimSpotModal
                    zoneLabel={selectedZone.label}
                    teamSize={tournament.teamSize}
                    // never the captain's name: myClaim can be the spot a duo
                    // partner marked this viewer into.
                    defaultEpicName={
                        (myClaim?.discordId === myDiscordId ? myClaim?.epicName : "") ||
                        viewer.epicName ||
                        savedEpicName ||
                        session?.user?.name ||
                        ""
                    }
                    teammateOptions={teammateOptions}
                    isDispute={selectedZoneIsFull}
                    occupiedBy={selectedZoneClaims.map(teamLabel)}
                    saving={saving}
                    error={claimError}
                    onConfirm={handleClaim}
                    onClose={() => setShowClaim(false)}
                />
            )}
        </div>
    );
}
