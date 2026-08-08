import { ITournament } from "@/lib/models/Tournament";
import { ISpotClaim } from "@/lib/models/SpotClaim";
import { getStatus } from "@/lib/tournamentStatus";

export interface ZoneDTO {
    id: string;
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
    capacity: number;
}

export interface WindowDTO {
    id: string;
    label: string;
    startsAt: string;
    zones: ZoneDTO[];
}

export interface ClaimDTO {
    id: string;
    windowId: string;
    zoneId: string;
    discordId: string;
    discordName: string;
    epicName: string;
    teammates: string[];
    /** This team took a zone that was already full: the zone is contested. */
    disputed: boolean;
    disputeNote: string;
    createdAt: string;
}

export interface PrizeDTO {
    place: string;
    prize: string;
}

export interface TournamentDTO {
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
    published: boolean;
    windowCount: number;
    /** Headline prize ("R$ 10.000"); the breakdown only travels in the detail. */
    prizePool: string;
    /** Detail only - long text, no reason to ship it with the whole list. */
    description?: string;
    prizes?: PrizeDTO[];
    /** How many players a moderator marked as qualified. 0 = nobody can claim yet. */
    qualifiedCount: number;
    /** Admin-only: the actual roster selection, for the moderator UI. */
    qualifiedIds?: string[];
    participants?: string[];
    windows?: WindowDTO[];
}

export function toListDTO(t: ITournament): TournamentDTO {
    return {
        id: String(t._id),
        slug: t.slug,
        name: t.name,
        poster: t.poster || "",
        mode: t.mode,
        teamSize: t.teamSize,
        region: t.region,
        start: new Date(t.start).toISOString(),
        end: new Date(t.end).toISOString(),
        status: getStatus(t.start, t.end),
        published: t.published,
        windowCount: t.windows?.length ?? 0,
        prizePool: t.prizePool || "",
        qualifiedCount: (t.qualifiedIds?.length ?? 0) + (t.participants?.length ?? 0),
    };
}

/** `forAdmin` adds the roster selection, which players have no reason to see. */
export function toDetailDTO(t: ITournament, forAdmin = false): TournamentDTO {
    return {
        ...toListDTO(t),
        description: t.description || "",
        prizes: (t.prizes ?? []).map(p => ({ place: p.place, prize: p.prize || "" })),
        ...(forAdmin
            ? { qualifiedIds: t.qualifiedIds ?? [], participants: t.participants ?? [] }
            : {}),
        windows: (t.windows ?? []).map(w => ({
            id: String(w._id),
            label: w.label,
            startsAt: new Date(w.startsAt).toISOString(),
            zones: (w.zones ?? []).map(z => ({
                id: String(z._id),
                label: z.label,
                x: z.x,
                y: z.y,
                w: z.w,
                h: z.h,
                capacity: z.capacity ?? 1,
            })),
        })),
    };
}

export function toClaimDTO(c: ISpotClaim): ClaimDTO {
    return {
        id: String(c._id),
        windowId: c.windowId,
        zoneId: c.zoneId,
        discordId: c.discordId,
        discordName: c.discordName || "",
        epicName: c.epicName,
        teammates: c.teammates ?? [],
        disputed: !!c.disputed,
        disputeNote: c.disputeNote || "",
        createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : "",
    };
}
