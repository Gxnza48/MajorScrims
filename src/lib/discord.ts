/**
 * Reads a member's roles in the Major Scrims Discord server.
 *
 * There are two ways to ask Discord and we use both:
 *
 *  - **the bot token** (`DISCORD_BOT_TOKEN`) can read *anyone's* roles at any
 *    moment and never expires. This is what makes per-tournament roles usable:
 *    a moderator hands out the role two minutes before the round and the site
 *    sees it immediately. It also lists the server's roles by name, which is
 *    what fills the role picker in the tournament panel. Only needs the bot to
 *    be in the server - no privileged intent.
 *  - **the player's own OAuth token** (scope `guilds.members.read`, already
 *    requested in src/lib/auth.ts) is the fallback while no bot token is set.
 *    It only works for the person who is signed in and **Discord expires it
 *    after about a week** - we do not refresh it, so an old session reads as
 *    `token-rejected` until they sign out and back in.
 *
 * Env vars, all copied from Discord with Developer Mode on:
 *   MAJOR_SCRIMS_GUILD_ID  - right click the server -> Copy Server ID
 *   DISCORD_PRO_ROLE_ID    - the global PRO role, for the badge and the filter
 *   DISCORD_BOT_TOKEN      - Developer Portal > Bot > Reset Token (optional)
 *
 * When it cannot tell, `roles` is `null` (unknown) rather than an empty array,
 * so a missing config or a dead token never demotes a real pro to "no roles".
 * `reason` says which of those happened - it is surfaced to admins, because a
 * silent "nobody qualifies" is impossible to diagnose otherwise.
 */

export type ProCheckReason =
    | "ok"
    | "not-configured"
    | "no-token"
    | "token-rejected"
    | "not-in-guild"
    | "discord-error"
    | "no-roles-field";

export interface RoleCheck {
    /** Every role id this member has in the guild, or null when unknown. */
    roles: string[] | null;
    reason: ProCheckReason;
    /** Present on token-rejected / discord-error, to tell the two apart in logs. */
    status?: number;
    /** Which credential answered. The bot sees anyone; OAuth only its owner. */
    via: "bot" | "oauth" | "none";
}

export interface ProCheck {
    isPro: boolean | null;
    reason: ProCheckReason;
    status?: number;
}

/** A role of the guild, as offered in the tournament panel's picker. */
export interface GuildRole {
    id: string;
    name: string;
    /** Discord's decimal colour; 0 means "no colour", render it grey. */
    color: number;
    position: number;
    /** Managed roles belong to bots/integrations - noise in the picker. */
    managed: boolean;
}

export interface GuildMember {
    roles?: string[];
    joined_at?: string;
    nick?: string | null;
    user?: {
        id?: string;
        username?: string;
        global_name?: string | null;
        avatar?: string | null;
    };
}

/** How somebody is called in the server, in the order Discord shows it. */
export interface MemberName {
    discordId: string;
    /** Server nickname if they have one, otherwise their Discord name. */
    name: string;
    avatarUrl: string;
}

const avatarUrl = (id: string, hash?: string | null) =>
    hash ? `https://cdn.discordapp.com/avatars/${id}/${hash}.png?size=64` : "";

/**
 * A GET that waits out a rate limit instead of giving up on it. Resolving a
 * whole tournament's worth of ids is dozens of calls in a row, and Discord will
 * ask for a pause partway through.
 */
async function discordGetPatient(path: string, auth: string, tries = 3): Promise<Response | null> {
    for (let attempt = 0; attempt < tries; attempt++) {
        const res = await discordGet(path, auth);
        if (!res || res.status !== 429) return res;
        const body = await res.json().catch(() => ({}) as { retry_after?: number });
        const wait = Math.min(5000, Math.max(300, ((body as { retry_after?: number }).retry_after ?? 1) * 1000));
        await new Promise(done => setTimeout(done, wait));
    }
    return null;
}

/**
 * Looks up who an id belongs to, using the bot. Needed for players a moderator
 * wrote into a duo by id who have never signed in here - without this they read
 * as a row of digits in the panel.
 *
 * Tries the server first, because a nickname there is what everybody calls
 * them. Somebody who left the server, or never joined, still has a Discord
 * account, so their global name is the fallback rather than nothing at all.
 */
export async function fetchMemberName(discordId: string): Promise<MemberName | null> {
    const guildId = process.env.MAJOR_SCRIMS_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken || !/^\d{5,25}$/.test(discordId)) return null;
    const auth = `Bot ${botToken}`;

    if (guildId) {
        const res = await discordGetPatient(`/guilds/${guildId}/members/${discordId}`, auth);
        if (res?.ok) {
            const member = (await res.json().catch(() => null)) as GuildMember | null;
            const user = member?.user ?? {};
            const name = member?.nick || user.global_name || user.username || "";
            if (name) return { discordId, name, avatarUrl: avatarUrl(discordId, user.avatar) };
        }
    }

    const res = await discordGetPatient(`/users/${discordId}`, auth);
    if (!res?.ok) return null;
    const user = (await res.json().catch(() => null)) as
        | { global_name?: string | null; username?: string; avatar?: string | null }
        | null;
    const name = user?.global_name || user?.username || "";
    return name ? { discordId, name, avatarUrl: avatarUrl(discordId, user?.avatar) } : null;
}

const API = "https://discord.com/api";
const TIMEOUT_MS = 6000;

export function isProConfigured(): boolean {
    return !!process.env.MAJOR_SCRIMS_GUILD_ID && !!process.env.DISCORD_PRO_ROLE_ID;
}

export function hasBotToken(): boolean {
    return !!process.env.DISCORD_BOT_TOKEN;
}

/** True when we can offer the role picker (needs the guild *and* the bot). */
export function canListRoles(): boolean {
    return !!process.env.MAJOR_SCRIMS_GUILD_ID && hasBotToken();
}

async function discordGet(path: string, authorization: string): Promise<Response | null> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
        const res = await fetch(`${API}${path}`, {
            headers: { Authorization: authorization },
            signal: controller.signal,
            cache: "no-store",
        });
        clearTimeout(timeout);
        return res;
    } catch {
        return null;
    }
}

/** Turns a member response into a RoleCheck, sharing the status mapping. */
async function toRoleCheck(res: Response | null, via: "bot" | "oauth"): Promise<RoleCheck> {
    if (!res) return { roles: null, reason: "discord-error", via };

    // 401/403 = the credential was rejected (an expired OAuth token, or a bot
    // token that was reset), 404 = that user is not in the server.
    if (res.status === 401 || res.status === 403) {
        return { roles: null, reason: "token-rejected", status: res.status, via };
    }
    if (res.status === 404) return { roles: [], reason: "not-in-guild", status: 404, via };
    if (!res.ok) return { roles: null, reason: "discord-error", status: res.status, via };

    let member: GuildMember;
    try {
        member = (await res.json()) as GuildMember;
    } catch {
        return { roles: null, reason: "discord-error", status: res.status, via };
    }

    if (!Array.isArray(member.roles)) return { roles: null, reason: "no-roles-field", via };
    return { roles: member.roles, reason: "ok", via };
}

/** Reads any member's roles with the bot token - no sign-in of theirs needed. */
export async function fetchMemberRolesViaBot(discordId: string): Promise<RoleCheck> {
    const guildId = process.env.MAJOR_SCRIMS_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!guildId) return { roles: null, reason: "not-configured", via: "bot" };
    if (!botToken) return { roles: null, reason: "no-token", via: "bot" };
    if (!discordId) return { roles: null, reason: "no-token", via: "bot" };

    const res = await discordGet(`/guilds/${guildId}/members/${discordId}`, `Bot ${botToken}`);
    return toRoleCheck(res, "bot");
}

/** Reads the signed-in user's own roles with their OAuth token. */
export async function fetchMemberRolesViaOAuth(accessToken: string | undefined): Promise<RoleCheck> {
    const guildId = process.env.MAJOR_SCRIMS_GUILD_ID;

    if (!guildId) return { roles: null, reason: "not-configured", via: "oauth" };
    if (!accessToken) return { roles: null, reason: "no-token", via: "oauth" };

    const res = await discordGet(`/users/@me/guilds/${guildId}/member`, `Bearer ${accessToken}`);
    return toRoleCheck(res, "oauth");
}

/**
 * The roles of one member, asking the bot first because its answer is live and
 * works even for someone whose session is a week old. Falls back to their own
 * OAuth token when there is no bot token, or when the bot could not answer.
 */
export async function fetchMemberRoles(
    discordId: string | undefined,
    accessToken?: string
): Promise<RoleCheck> {
    if (hasBotToken() && discordId) {
        const viaBot = await fetchMemberRolesViaBot(discordId);
        if (viaBot.roles !== null) return viaBot;
        // The bot exists but could not answer (reset token, guild id wrong).
        // The user's own token may still work, so it is worth one more try.
        const viaOAuth = await fetchMemberRolesViaOAuth(accessToken);
        return viaOAuth.roles !== null ? viaOAuth : viaBot;
    }
    return fetchMemberRolesViaOAuth(accessToken);
}

/** Does this set of roles include the global PRO role? null = cannot tell. */
export function derivePro(roles: string[] | null): boolean | null {
    const proRoleId = process.env.DISCORD_PRO_ROLE_ID;
    if (!proRoleId || roles === null) return null;
    return roles.includes(proRoleId);
}

/** Kept for the callers that only care about the PRO badge. */
export async function checkIsPro(accessToken: string | undefined): Promise<ProCheck> {
    if (!isProConfigured()) return { isPro: null, reason: "not-configured" };
    const check = await fetchMemberRolesViaOAuth(accessToken);
    return { isPro: derivePro(check.roles), reason: check.reason, status: check.status };
}

export interface GuildRolesResult {
    roles: GuildRole[];
    /** null when the list came back fine. */
    error: ProCheckReason | null;
    status?: number;
}

/**
 * Every role in the server, for the tournament panel's picker. Bot only: an
 * OAuth token cannot read the role list, just the ids of its own member.
 *
 * `@everyone` (whose id is the guild id) and integration-managed roles are
 * dropped - nobody is going to gate a tournament on those, and they would bury
 * the handful of real roles a moderator created for it.
 */
export async function listGuildRoles(): Promise<GuildRolesResult> {
    const guildId = process.env.MAJOR_SCRIMS_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!guildId) return { roles: [], error: "not-configured" };
    if (!botToken) return { roles: [], error: "no-token" };

    const res = await discordGet(`/guilds/${guildId}/roles`, `Bot ${botToken}`);
    if (!res) return { roles: [], error: "discord-error" };
    if (res.status === 401 || res.status === 403) {
        return { roles: [], error: "token-rejected", status: res.status };
    }
    if (!res.ok) return { roles: [], error: "discord-error", status: res.status };

    let raw: GuildRole[];
    try {
        raw = (await res.json()) as GuildRole[];
    } catch {
        return { roles: [], error: "discord-error", status: res.status };
    }
    if (!Array.isArray(raw)) return { roles: [], error: "discord-error", status: res.status };

    const roles = raw
        .filter(r => r && r.id !== guildId && !r.managed)
        .map(r => ({
            id: String(r.id),
            name: String(r.name ?? ""),
            color: Number(r.color ?? 0),
            position: Number(r.position ?? 0),
            managed: !!r.managed,
        }))
        // Highest role first, the same order Discord shows them in the server.
        .sort((a, b) => b.position - a.position);

    return { roles, error: null };
}
