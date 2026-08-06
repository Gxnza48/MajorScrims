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
 * When it cannot tell, `isPro` is `null` (unknown) rather than `false`, so a
 * missing config or a dead token never demotes a real pro. `reason` says which
 * of those happened - it is surfaced to admins for debugging, because a silent
 * "nobody is a pro" is impossible to diagnose otherwise.
 */

export type ProCheckReason =
    | "ok"
    | "not-configured"
    | "no-token"
    | "token-rejected"
    | "not-in-guild"
    | "discord-error"
    | "no-roles-field";

export interface ProCheck {
    isPro: boolean | null;
    reason: ProCheckReason;
    /** Present on token-rejected / discord-error, to tell the two apart in logs. */
    status?: number;
}

export interface GuildMember {
    roles?: string[];
    joined_at?: string;
    nick?: string | null;
}

export function isProConfigured(): boolean {
    return !!process.env.MAJOR_SCRIMS_GUILD_ID && !!process.env.DISCORD_PRO_ROLE_ID;
}

export async function checkIsPro(accessToken: string | undefined): Promise<ProCheck> {
    const guildId = process.env.MAJOR_SCRIMS_GUILD_ID;
    const proRoleId = process.env.DISCORD_PRO_ROLE_ID;

    if (!guildId || !proRoleId) return { isPro: null, reason: "not-configured" };
    if (!accessToken) return { isPro: null, reason: "no-token" };

    let res: Response;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        res = await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
            cache: "no-store",
        });
        clearTimeout(timeout);
    } catch {
        return { isPro: null, reason: "discord-error" };
    }

    // 401 = the Discord access token expired (they last for a week and we do not
    // refresh them), 404 = the user is not in that server.
    if (res.status === 401) return { isPro: null, reason: "token-rejected", status: 401 };
    if (res.status === 404) return { isPro: false, reason: "not-in-guild", status: 404 };
    if (!res.ok) return { isPro: null, reason: "discord-error", status: res.status };

    let member: GuildMember;
    try {
        member = (await res.json()) as GuildMember;
    } catch {
        return { isPro: null, reason: "discord-error", status: res.status };
    }

    if (!Array.isArray(member.roles)) return { isPro: null, reason: "no-roles-field" };

    return { isPro: member.roles.includes(proRoleId), reason: "ok" };
}
