import { getStatus } from "@/lib/tournamentStatus";

/** Why a viewer cannot take a spot. `null` means they can. */
export type ClaimBlock =
    | "not-signed-in"
    | "finished"
    | "no-list"
    | "not-in-role"
    | "roles-unknown"
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
    /** Discord roles that qualify for this tournament (the moderators' own). */
    qualifiedRoleIds: string[];
    /** The viewer's Discord roles. `null` means we could not read them. */
    viewerRoleIds: string[] | null;
    qualifiedIds: string[];
    participants: string[];
    /** How many duos a moderator wrote down for this tournament. */
    presetTeamCount: number;
    /** This viewer is a member of one of them. */
    inPresetTeam: boolean;
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
 *  - a moderator must have set who qualifies - a Discord role, a ticked list,
 *    a preset duo, any of them. While all are empty nobody can claim (the
 *    strict behaviour Gonza asked for);
 *  - then any one of them lets you in: you hold one of the tournament's roles,
 *    or a moderator put you in a duo for it, or you were ticked from the roster,
 *    or your Epic name was pre-authorised.
 *
 * They add up rather than override each other, so a moderator can still wave
 * through one player the Discord role missed. Being written into a duo counts
 * as qualifying on purpose: an admin naming you as somebody's partner *is* a
 * statement that you are in, and otherwise whichever half of the duo lacked the
 * role could not claim while their partner could.
 */
export function claimBlockReason(ctx: ClaimContext): ClaimBlock {
    if (ctx.isAdmin) return null;
    if (!ctx.signedIn || !ctx.discordId) return "not-signed-in";
    if (getStatus(ctx.start, ctx.end) === "Completed") return "finished";

    const roleGated = ctx.qualifiedRoleIds.length > 0;
    const listGated = ctx.qualifiedIds.length > 0 || ctx.participants.length > 0;
    const teamGated = ctx.presetTeamCount > 0;
    if (!roleGated && !listGated && !teamGated) return "no-list";

    if (roleGated && ctx.viewerRoleIds?.some(id => ctx.qualifiedRoleIds.includes(id))) return null;

    if (ctx.inPresetTeam) return null;

    if (ctx.qualifiedIds.includes(ctx.discordId)) return null;

    const epic = ctx.epicName ? norm(ctx.epicName) : "";
    if (epic && ctx.participants.some(p => norm(p) === epic)) return null;

    // Being unable to read someone's roles must not read as "you did not
    // qualify" - it is a different problem with a different fix (sign in again,
    // or set the bot token), so it gets its own message.
    if (roleGated && ctx.viewerRoleIds === null) return "roles-unknown";

    // Only the ticked list changes the message: if the tournament runs on a role,
    // naming that role is the useful thing to say, and having written down some
    // duos does not make "no figurás entre los clasificados" any truer.
    return roleGated && !listGated ? "not-in-role" : "not-qualified";
}
