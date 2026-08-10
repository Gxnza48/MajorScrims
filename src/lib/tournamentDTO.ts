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
    /** Present when the zone is not a rectangle; x/y/w/h is its bounding box. */
    points?: { x: number; y: number }[];
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
    /** Discord ids of the teammates, so both members see the spot as theirs. */
    teammateIds: string[];
    /** This team took a zone that was already full: the zone is contested. */
    disputed: boolean;
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
    /** How many players a moderator ticked or pre-authorised by name. */
    qualifiedCount: number;
    /**
     * Names of the Discord roles that qualify, so the page can say which one you
     * are missing. Public: the role name is not a secret, its id stays admin-only.
     */
    requiredRoleNames: string[];
    /** False = no role and no list, so nobody but an admin can claim yet. */
    hasAccessList: boolean;
    /** How many duos a moderator wrote down. Public: the page says so. */
    presetTeamCount: number;
    /** Admin-only: the actual roster selection, for the moderator UI. */
    qualifiedRoles?: QualifiedRoleDTO[];
    qualifiedIds?: string[];
    participants?: string[];
    /** Admin-only: the duos, by Discord id (the panel puts names on them). */
    presetTeams?: { memberIds: string[] }[];
    windows?: WindowDTO[];
}

export interface QualifiedRoleDTO {
    roleId: string;
    roleName: string;
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
        requiredRoleNames: (t.qualifiedRoles ?? []).map(r => r.roleName || r.roleId),
        presetTeamCount: t.presetTeams?.length ?? 0,
        hasAccessList:
            (t.qualifiedRoles?.length ?? 0) > 0 ||
            (t.qualifiedIds?.length ?? 0) > 0 ||
            (t.participants?.length ?? 0) > 0 ||
            (t.presetTeams?.length ?? 0) > 0,
    };
}

/** `forAdmin` adds the roster selection, which players have no reason to see. */
export function toDetailDTO(t: ITournament, forAdmin = false): TournamentDTO {
    return {
        ...toListDTO(t),
        description: t.description || "",
        prizes: (t.prizes ?? []).map(p => ({ place: p.place, prize: p.prize || "" })),
        ...(forAdmin
            ? {
                qualifiedIds: t.qualifiedIds ?? [],
                participants: t.participants ?? [],
                qualifiedRoles: (t.qualifiedRoles ?? []).map(r => ({
                    roleId: r.roleId,
                    roleName: r.roleName || "",
                })),
                presetTeams: (t.presetTeams ?? []).map(x => ({ memberIds: [...(x.memberIds ?? [])] })),
            }
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
                ...(z.points?.length ? { points: z.points.map(p => ({ x: p.x, y: p.y })) } : {}),
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
        teammateIds: c.teammateIds ?? [],
        disputed: !!c.disputed,
        createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : "",
    };
}
