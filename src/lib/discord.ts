/**
 * Reads the signed-in user's roles in the Major Scrims Discord server.
 *
 * The OAuth scope this needs (`guilds.members.read`) is already requested in
 * src/lib/auth.ts, and /api/discord/member-since already calls the same
 * endpoint - it just keeps `joined_at` and throws the roles away.
 *
 * Needs two env vars, both copied from Discord with Developer Mode on:
 *   MAJOR_SCRIMS_GUILD_ID  - right click the server  -> Copy Server ID
 *   DISCORD_PRO_ROLE_ID    - Server Settings > Roles -> right click PRO -> Copy Role ID
 *
 * While they are missing every lookup returns `null` (unknown) rather than
 * `false`, so a missing config never silently marks real pros as non-pros.
 */

export interface GuildMember {
    roles?: string[];
    joined_at?: string;
    nick?: string | null;
}

export function isProConfigured(): boolean {
    return !!process.env.MAJOR_SCRIMS_GUILD_ID && !!process.env.DISCORD_PRO_ROLE_ID;
}

export async function fetchGuildMember(accessToken: string): Promise<GuildMember | null> {
    const guildId = process.env.MAJOR_SCRIMS_GUILD_ID;
    if (!guildId || !accessToken) return null;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
            cache: "no-store",
        });
        clearTimeout(timeout);

        // 401 = token expired, 404 = not in the server. Both mean "cannot tell".
        if (!res.ok) return null;
        return (await res.json()) as GuildMember;
    } catch {
        return null;
    }
}

/** true / false when we could check, null when we could not. */
export function memberHasProRole(member: GuildMember | null): boolean | null {
    const proRoleId = process.env.DISCORD_PRO_ROLE_ID;
    if (!proRoleId || !member || !Array.isArray(member.roles)) return null;
    return member.roles.includes(proRoleId);
}

export async function checkIsPro(accessToken: string | undefined): Promise<boolean | null> {
    if (!isProConfigured() || !accessToken) return null;
    return memberHasProRole(await fetchGuildMember(accessToken));
}
