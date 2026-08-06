import type { Session } from "next-auth";
import { connectToDB } from "@/lib/db";
import { UserProfile, IUserProfile } from "@/lib/models/UserProfile";
import { checkIsPro } from "@/lib/discord";

/** How long a PRO check is trusted before we ask Discord again. */
const PRO_TTL_MS = 60 * 60 * 1000;

/**
 * Upserts the signed-in user's profile and keeps their PRO flag fresh.
 *
 * Called from the endpoints the user hits anyway, so a pro who was just given
 * the role in Discord gets it on the site within the hour instead of having to
 * log out and back in. When Discord cannot be reached (or the env vars are not
 * set yet) the stored value is kept - never downgraded to false.
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

    const stale = !profile.proCheckedAt || now.getTime() - profile.proCheckedAt.getTime() > PRO_TTL_MS;
    if (stale) {
        const check = await checkIsPro(session.accessToken);
        profile.proCheckReason = check.status ? `${check.reason}:${check.status}` : check.reason;
        profile.proCheckAttemptedAt = now;
        if (check.isPro !== null) {
            profile.isPro = check.isPro;
            profile.proCheckedAt = now;
        }
    }

    await profile.save();
    return profile;
}
