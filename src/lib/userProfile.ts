import type { Session } from "next-auth";
import { connectToDB } from "@/lib/db";
import { UserProfile, IUserProfile } from "@/lib/models/UserProfile";
import { fetchMemberRoles, derivePro, hasBotToken } from "@/lib/discord";

/** How long a role lookup is trusted before we ask Discord again. */
const ROLE_TTL_MS = 60 * 60 * 1000;

/**
 * How long roles are trusted when a tournament page asks for them. Much shorter
 * than the badge's hour: moderators hand out the tournament role minutes before
 * the round, and a player who was just given it must not have to wait.
 */
export const CLAIM_ROLE_TTL_MS = 60 * 1000;

/** Writes a role lookup onto the profile, leaving the old value if it failed. */
function applyRoleCheck(
    profile: IUserProfile,
    check: Awaited<ReturnType<typeof fetchMemberRoles>>,
    now: Date
) {
    profile.proCheckReason = check.status ? `${check.reason}:${check.status}` : check.reason;
    profile.proCheckAttemptedAt = now;

    if (check.roles === null) return;

    profile.discordRoles = check.roles;
    profile.rolesCheckedAt = now;

    const isPro = derivePro(check.roles);
    if (isPro !== null) {
        profile.isPro = isPro;
        profile.proCheckedAt = now;
    }
}

/**
 * Upserts the signed-in user's profile and keeps their Discord roles fresh.
 *
 * Called from the endpoints the user hits anyway, so someone who was just given
 * a role in Discord gets it on the site within the hour instead of having to
 * log out and back in. When Discord cannot be reached (or the env vars are not
 * set yet) the stored roles are kept - never wiped.
 */
export async function syncProfile(session: Session): Promise<IUserProfile> {
    await connectToDB();

    const discordId = session.user.id;
    const now = new Date();

    let profile = await UserProfile.findOne({ discordId });
    if (!profile) {
        profile = new UserProfile({ discordId, isPro: false });
    }

    if (session.user.name) profile.discordName = session.user.name;
    if (session.user.image) profile.avatarUrl = session.user.image;
    profile.lastSeenAt = now;

    const checkedAt = profile.rolesCheckedAt ?? profile.proCheckedAt;
    const stale = !checkedAt || now.getTime() - checkedAt.getTime() > ROLE_TTL_MS;
    if (stale) {
        applyRoleCheck(profile, await fetchMemberRoles(discordId, session.accessToken), now);
    }

    await profile.save();
    return profile;
}

/**
 * The viewer's Discord roles for a claim decision, refreshed when the cached
 * copy is older than `maxAgeMs` (pass 0 to always ask Discord, which is what
 * the claim endpoint does - the page is only a hint, this is the real gate).
 *
 * Returns `null` when we genuinely could not tell, so the caller can say "no
 * pudimos leer tus roles" instead of silently treating the player as unqualified.
 * Without a bot token this can only ever answer for the person signed in, and
 * only while their week-old OAuth token still works.
 */
export async function resolveViewerRoles(
    profile: IUserProfile | null,
    accessToken: string | undefined,
    discordId: string,
    maxAgeMs = CLAIM_ROLE_TTL_MS
): Promise<string[] | null> {
    // An empty `discordRoles` only means "no roles" once a lookup actually
    // succeeded; on a profile that predates this feature it means "never asked".
    const known = profile?.rolesCheckedAt ? profile.discordRoles ?? [] : null;

    const fresh =
        profile?.rolesCheckedAt && Date.now() - profile.rolesCheckedAt.getTime() <= maxAgeMs;
    if (fresh) return known;

    // Nothing to ask with: no bot token and no session of theirs to borrow.
    if (!hasBotToken() && !accessToken) return known;

    const check = await fetchMemberRoles(discordId, accessToken);
    if (profile) {
        applyRoleCheck(profile, check, new Date());
        await profile.save();
    }
    // A failed lookup falls back to whatever we knew before, and only reports
    // "unknown" when we never managed to read this user's roles at all.
    return check.roles ?? known;
}
