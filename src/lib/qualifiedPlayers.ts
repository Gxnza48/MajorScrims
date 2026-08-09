import { UserProfile, IUserProfile } from "@/lib/models/UserProfile";

/** The part of a tournament that decides who qualifies. */
export interface QualifiedSource {
    qualifiedIds?: string[];
    qualifiedRoles?: { roleId: string }[];
    presetTeams?: { memberIds: string[] }[];
}

/** Same ceiling the roster uses; a Fortnite round is far smaller than this. */
const MAX_PLAYERS = 500;

/**
 * Everyone who qualifies for a tournament *and* has signed in at least once:
 * the players ticked from the roster plus every holder of one of its Discord
 * roles. Used for the duo picker and to resolve a typed partner name into a
 * Discord id, both of which have to cover role-based players too - otherwise a
 * role-gated tournament would have an empty teammate dropdown.
 *
 * Role holders who never signed in cannot appear here: we only know a Discord
 * user exists once they visit the site.
 */
export async function qualifiedProfiles(t: QualifiedSource): Promise<IUserProfile[]> {
    // Preset team members count: an admin naming somebody as a partner is a way
    // of qualifying them, so they have to resolve here too - otherwise a typed
    // partner name never turns into a Discord id and the other half of the duo
    // stays free to take a second spot.
    const ids = [
        ...(t.qualifiedIds ?? []),
        ...(t.presetTeams ?? []).flatMap(team => team.memberIds ?? []),
    ].filter(Boolean);
    const roleIds = (t.qualifiedRoles ?? []).map(r => r.roleId).filter(Boolean);
    if (!ids.length && !roleIds.length) return [];

    const or: Record<string, unknown>[] = [];
    if (ids.length) or.push({ discordId: { $in: ids } });
    if (roleIds.length) or.push({ discordRoles: { $in: roleIds } });

    return UserProfile.find({ $or: or }).limit(MAX_PLAYERS);
}
