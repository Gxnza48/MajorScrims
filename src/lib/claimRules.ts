import { getStatus } from "@/lib/tournamentStatus";

/** Why a viewer cannot take a spot. `null` means they can. */
export type ClaimBlock =
    | "not-signed-in"
    | "finished"
    | "no-list"
    | "not-qualified"
    | null;

export interface ClaimContext {
    isAdmin: boolean;
    signedIn: boolean;
    discordId?: string | null;
    /** Epic name we already know for this user, or the one they just typed. */
    epicName?: string | null;
    start: string | Date;
    end: string | Date;
    qualifiedIds: string[];
    participants: string[];
}

const norm = (v: string) => v.trim().toLowerCase();

/**
 * The single source of truth for who may claim a drop spot. The API enforces it
 * and the page renders its result, so the button never disagrees with the server.
 *
 * Rules, in order:
 *  - admins always may, so a moderator can test a tournament end to end;
 *  - you must be signed in;
 *  - a finished tournament takes no more spots;
 *  - a moderator must have marked who qualified - while that list is empty
 *    nobody can claim (this is the strict behaviour Gonza asked for);
 *  - you must be on that list, either ticked from the roster or pre-authorised
 *    by Epic name.
 */
export function claimBlockReason(ctx: ClaimContext): ClaimBlock {
    if (ctx.isAdmin) return null;
    if (!ctx.signedIn || !ctx.discordId) return "not-signed-in";
    if (getStatus(ctx.start, ctx.end) === "Completed") return "finished";

    const hasList = ctx.qualifiedIds.length > 0 || ctx.participants.length > 0;
    if (!hasList) return "no-list";

    if (ctx.qualifiedIds.includes(ctx.discordId)) return null;

    const epic = ctx.epicName ? norm(ctx.epicName) : "";
    if (epic && ctx.participants.some(p => norm(p) === epic)) return null;

    return "not-qualified";
}
