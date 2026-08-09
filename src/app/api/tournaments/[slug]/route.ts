import { NextRequest, NextResponse } from "next/server";
import { connectToDB, requireAdminSession, requireSession, isAdminId } from "@/lib/db";
import { Tournament } from "@/lib/models/Tournament";
import { SpotClaim } from "@/lib/models/SpotClaim";
import { UserProfile } from "@/lib/models/UserProfile";
import { toDetailDTO, toClaimDTO } from "@/lib/tournamentDTO";
import { claimBlockReason } from "@/lib/claimRules";
import { resolveViewerRoles } from "@/lib/userProfile";
import { qualifiedProfiles, QualifiedSource } from "@/lib/qualifiedPlayers";
import { presetPartnersOf, presetTeamCount, normalisePresetTeams } from "@/lib/presetTeams";

export const dynamic = "force-dynamic";

const MAX_PRIZE_ROWS = 40;
const MAX_QUALIFIED_ROLES = 10;

export interface TeammateOption {
    discordId: string;
    discordName: string;
    epicName: string;
}

/**
 * The fixed partners a moderator gave this viewer for this tournament, with a
 * name to show. When this is non-empty the claim modal stops asking who your
 * duo is: marking the spot marks the whole team.
 */
async function presetTeamFor(
    tournament: { presetTeams?: { memberIds: string[] }[] },
    discordId: string
): Promise<TeammateOption[]> {
    const partners = presetPartnersOf(tournament, discordId);
    if (!partners.length) return [];

    const profiles = await UserProfile.find({ discordId: { $in: partners } });
    return partners.map(id => {
        const p = profiles.find(x => x.discordId === id);
        return {
            discordId: id,
            discordName: p?.discordName || "",
            // Somebody who never signed in has no name yet; the id is at least
            // something the moderator can recognise instead of a blank.
            epicName: p?.epicName || "",
        };
    });
}

/**
 * The players the claiming team can pick as duo/trio partners: the ones who
 * qualified for this tournament, whether by the Discord role or by being ticked.
 * Only sent to someone who may claim - for everyone else the list stays
 * admin-only.
 */
async function teammateOptionsFor(
    tournament: QualifiedSource & { participants?: string[] },
    selfDiscordId: string,
    selfEpicName: string
): Promise<TeammateOption[]> {
    const profiles = await qualifiedProfiles(tournament);

    const options: TeammateOption[] = profiles
        .filter(p => p.discordId !== selfDiscordId)
        .map(p => ({
            discordId: p.discordId,
            discordName: p.discordName || "",
            epicName: p.epicName || "",
        }));

    // Pre-authorised players who never signed in only exist as an Epic name.
    for (const name of tournament.participants ?? []) {
        options.push({ discordId: "", discordName: "", epicName: name });
    }

    const seen = new Set([selfEpicName.trim().toLowerCase()].filter(Boolean));
    return options
        .filter(o => {
            const key = (o.epicName || o.discordName).trim().toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) =>
            (a.epicName || a.discordName).localeCompare(b.epicName || b.discordName, "es", {
                sensitivity: "base",
            })
        );
}

/** Detail + every claim, so the page renders the map in a single round trip. */
export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        await connectToDB();

        const tournament = await Tournament.findOne({ slug: params.slug });
        if (!tournament) {
            return NextResponse.json({ success: false, error: "Torneo no encontrado" }, { status: 404 });
        }
        if (!tournament.published && !(await requireAdminSession())) {
            return NextResponse.json({ success: false, error: "Torneo no encontrado" }, { status: 404 });
        }

        const claims = await SpotClaim.find({ tournamentId: tournament._id });
        const session = await requireSession();
        const isAdmin = isAdminId(session?.user.id);

        // Resolve the viewer's own profile so the page can say exactly why they
        // can or cannot claim, instead of a mute disabled button.
        const profile = session
            ? await UserProfile.findOne({ discordId: session.user.id })
            : null;

        // Only ask Discord when the tournament is actually gated on a role. The
        // page polls every 10s, so this is cached for a minute (see
        // CLAIM_ROLE_TTL_MS); the claim endpoint re-checks live before writing.
        const qualifiedRoleIds = (tournament.qualifiedRoles ?? []).map(r => r.roleId);
        const viewerRoleIds =
            session && qualifiedRoleIds.length
                ? await resolveViewerRoles(profile, session.accessToken, session.user.id)
                : null;

        const blockedBecause = claimBlockReason({
            isAdmin,
            signedIn: !!session,
            discordId: session?.user.id,
            epicName: profile?.epicName,
            start: tournament.start,
            end: tournament.end,
            qualifiedRoleIds,
            viewerRoleIds,
            qualifiedIds: tournament.qualifiedIds ?? [],
            participants: tournament.participants ?? [],
            presetTeamCount: presetTeamCount(tournament),
            inPresetTeam: !!session && presetPartnersOf(tournament, session.user.id).length > 0,
        });

        const presetTeam = session ? await presetTeamFor(tournament, session.user.id) : [];

        // A fixed team makes the partner dropdown pointless, so it is not sent.
        const teammateOptions =
            session && blockedBecause === null && presetTeam.length === 0
                ? await teammateOptionsFor(tournament, session.user.id, profile?.epicName ?? "")
                : [];

        return NextResponse.json({
            success: true,
            tournament: toDetailDTO(tournament, isAdmin),
            claims: claims.map(toClaimDTO),
            viewer: {
                signedIn: !!session,
                isAdmin,
                isPro: profile?.isPro ?? false,
                epicName: profile?.epicName ?? "",
                canClaim: blockedBecause === null,
                blockedBecause,
            },
            teammateOptions,
            presetTeam,
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

/**
 * Admin edit of the tournament meta and its windows. Windows are reconciled by
 * id rather than replaced wholesale, so editing a label never orphans the zones
 * (and the claims that point at them).
 */
export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        if (!(await requireAdminSession())) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        await connectToDB();
        const tournament = await Tournament.findOne({ slug: params.slug });
        if (!tournament) {
            return NextResponse.json({ success: false, error: "Torneo no encontrado" }, { status: 404 });
        }

        const body = await request.json();
        const {
            name, poster, mode, teamSize, region, start, end, published, windows, participants,
            qualifiedIds, qualifiedRoles, presetTeams, description, prizePool, prizes,
        } = body;

        if (name !== undefined) tournament.name = String(name).trim();
        if (poster !== undefined) tournament.poster = poster;
        if (mode !== undefined) tournament.mode = mode;
        if (teamSize !== undefined) tournament.teamSize = teamSize;
        if (region !== undefined) tournament.region = region;
        if (start !== undefined) tournament.start = new Date(start);
        if (end !== undefined) tournament.end = new Date(end);
        if (published !== undefined) tournament.published = !!published;
        if (description !== undefined) tournament.description = String(description).slice(0, 8000);
        if (prizePool !== undefined) tournament.prizePool = String(prizePool).trim().slice(0, 80);
        if (Array.isArray(prizes)) {
            tournament.prizes = prizes
                .filter(p => p && String(p.place ?? "").trim())
                .slice(0, MAX_PRIZE_ROWS)
                .map(p => ({
                    place: String(p.place).trim().slice(0, 60),
                    prize: String(p.prize ?? "").trim().slice(0, 60),
                })) as never;
        }
        if (Array.isArray(qualifiedRoles)) {
            // A role id is a Discord snowflake; anything else is a typo in the
            // manual field and would silently never match anybody.
            const seenRoles = new Set<string>();
            tournament.qualifiedRoles = qualifiedRoles
                .map((r: unknown) => {
                    const row = (r ?? {}) as { roleId?: unknown; roleName?: unknown };
                    return {
                        roleId: String(row.roleId ?? "").trim(),
                        roleName: String(row.roleName ?? "").trim().slice(0, 100),
                    };
                })
                .filter(r => /^\d{5,25}$/.test(r.roleId))
                .filter(r => {
                    if (seenRoles.has(r.roleId)) return false;
                    seenRoles.add(r.roleId);
                    return true;
                })
                .slice(0, MAX_QUALIFIED_ROLES) as never;
        }
        if (Array.isArray(presetTeams)) {
            tournament.presetTeams = normalisePresetTeams(presetTeams) as never;
        }
        if (Array.isArray(qualifiedIds)) {
            tournament.qualifiedIds = Array.from(
                new Set(qualifiedIds.map((id: unknown) => String(id).trim()).filter(Boolean))
            );
        }
        if (Array.isArray(participants)) {
            // De-duplicate case-insensitively but keep the moderator's spelling.
            const seen = new Set<string>();
            tournament.participants = participants
                .map((p: unknown) => String(p).trim())
                .filter(Boolean)
                .filter(p => {
                    const key = p.toLowerCase();
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
        }

        if (new Date(tournament.end) < new Date(tournament.start)) {
            return NextResponse.json(
                { success: false, error: "La fecha de fin no puede ser anterior a la de inicio." },
                { status: 400 }
            );
        }

        if (Array.isArray(windows)) {
            const keptIds: string[] = [];

            for (const incoming of windows) {
                if (!incoming?.label?.trim() || !incoming?.startsAt) continue;

                const existing = incoming.id ? tournament.windows.id(incoming.id) : null;
                if (existing) {
                    existing.label = incoming.label.trim();
                    existing.startsAt = new Date(incoming.startsAt);
                    keptIds.push(String(existing._id));
                } else {
                    tournament.windows.push({
                        label: incoming.label.trim(),
                        startsAt: new Date(incoming.startsAt),
                        zones: [],
                    } as never);
                    keptIds.push(String(tournament.windows[tournament.windows.length - 1]._id));
                }
            }

            const removed = tournament.windows
                .filter(w => !keptIds.includes(String(w._id)))
                .map(w => String(w._id));

            if (removed.length) {
                tournament.windows = tournament.windows.filter(w =>
                    keptIds.includes(String(w._id))
                ) as typeof tournament.windows;
                await SpotClaim.deleteMany({ tournamentId: tournament._id, windowId: { $in: removed } });
            }
        }

        await tournament.save();
        return NextResponse.json({ success: true, tournament: toDetailDTO(tournament, true) });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        if (!(await requireAdminSession())) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        await connectToDB();
        const tournament = await Tournament.findOneAndDelete({ slug: params.slug });
        if (!tournament) {
            return NextResponse.json({ success: false, error: "Torneo no encontrado" }, { status: 404 });
        }

        await SpotClaim.deleteMany({ tournamentId: tournament._id });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
