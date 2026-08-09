import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDB, requireSession, isAdminId } from "@/lib/db";
import { Tournament } from "@/lib/models/Tournament";
import { SpotClaim } from "@/lib/models/SpotClaim";
import { UserProfile } from "@/lib/models/UserProfile";
import { toClaimDTO } from "@/lib/tournamentDTO";
import { claimBlockReason } from "@/lib/claimRules";
import { teammateSlots } from "@/lib/teamFormat";
import { resolveViewerRoles } from "@/lib/userProfile";
import { qualifiedProfiles, QualifiedSource } from "@/lib/qualifiedPlayers";
import { presetPartnersOf, presetTeamCount } from "@/lib/presetTeams";

export const dynamic = "force-dynamic";

const MAX_TEAMMATES = 3;
/** How many teams may pile onto one zone beyond its capacity before we stop it. */
const MAX_DISPUTES_PER_ZONE = 4;

/**
 * A zone is only contested while more teams sit on it than it holds. After a
 * moderator (or a player) removes one, the survivors may fit again - in that
 * case the red flag has to come off, otherwise the zone stays red forever.
 */
async function settleDisputes(
    tournamentId: mongoose.Types.ObjectId,
    windowId: string,
    zoneId: string,
    capacity: number
) {
    const remaining = await SpotClaim.find({ tournamentId, windowId, zoneId }).sort({ createdAt: 1 });
    if (remaining.length > capacity) return;

    const stale = remaining.filter(c => c.disputed).map(c => c._id);
    if (stale.length) {
        await SpotClaim.updateMany({ _id: { $in: stale } }, { disputed: false });
    }
}

/**
 * Turns the names picked in the duo dropdown into Discord ids, so marking a
 * spot marks the whole team: the partner is taken as well and cannot claim
 * somewhere else. Names typed by hand that match a qualified player resolve
 * too; anything else stays a plain name on the claim.
 */
async function resolveTeammateIds(
    tournament: QualifiedSource,
    teammates: string[],
    selfDiscordId: string
): Promise<string[]> {
    if (!teammates.length) return [];

    const profiles = await qualifiedProfiles(tournament);
    const key = (v: string) => v.trim().toLowerCase();
    const ids: string[] = [];

    for (const name of teammates) {
        const needle = key(name);
        const match = profiles.find(
            p => key(p.epicName || "") === needle || key(p.discordName || "") === needle
        );
        if (match && match.discordId !== selfDiscordId && !ids.includes(match.discordId)) {
            ids.push(match.discordId);
        }
    }
    return ids;
}

/** A player (or team captain) takes a drop zone for one window. */
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const session = await requireSession();
        if (!session) {
            return NextResponse.json({ success: false, error: "Necesitás iniciar sesión." }, { status: 401 });
        }

        await connectToDB();
        const tournament = await Tournament.findOne({ slug: params.slug });
        if (!tournament) {
            return NextResponse.json({ success: false, error: "Torneo no encontrado" }, { status: 404 });
        }

        const body = await request.json();
        const windowId = String(body.windowId || "");
        const zoneId = String(body.zoneId || "");
        const epicName = String(body.epicName || "").trim();
        const typedTeammates: string[] = Array.isArray(body.teammates)
            ? body.teammates.map((n: unknown) => String(n).trim()).filter(Boolean).slice(0, MAX_TEAMMATES)
            : [];

        // A duo a moderator wrote down for this tournament wins over anything the
        // client sent: the team is the admin's decision, not the claimer's.
        const presetPartners = presetPartnersOf(tournament, session.user.id);
        const hasPresetTeam = presetPartners.length > 0;
        const teammates = hasPresetTeam ? [] : typedTeammates;
        // The player pressed "disputar" knowing the zone was already taken.
        const wantsDispute = body.dispute === true;

        if (!epicName) {
            return NextResponse.json(
                { success: false, error: "Ingresá tu nombre de Epic Games." },
                { status: 400 }
            );
        }

        // In a duos/trios/squads tournament the team is what takes the spot, so
        // the partner is not optional: without it we would mark half a team.
        // Nothing to ask when the moderator already fixed the team.
        const slots = teammateSlots(tournament.teamSize);
        if (!hasPresetTeam && teammates.length < slots) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        slots === 1
                            ? "Elegí a tu dúo antes de marcar el spot."
                            : `Este torneo es ${tournament.teamSize}: elegí a tus ${slots} compañeros antes de marcar el spot.`,
                },
                { status: 400 }
            );
        }

        // Same rule the page rendered, evaluated again here - the UI is only a
        // hint. Roles are read live (maxAge 0): a moderator may have just given
        // or just taken away the tournament's role.
        const qualifiedRoleIds = (tournament.qualifiedRoles ?? []).map(r => r.roleId);
        const viewerRoleIds = qualifiedRoleIds.length
            ? await resolveViewerRoles(
                await UserProfile.findOne({ discordId: session.user.id }),
                session.accessToken,
                session.user.id,
                0
            )
            : null;

        const blocked = claimBlockReason({
            isAdmin: isAdminId(session.user.id),
            signedIn: true,
            discordId: session.user.id,
            epicName,
            start: tournament.start,
            end: tournament.end,
            qualifiedRoleIds,
            viewerRoleIds,
            qualifiedIds: tournament.qualifiedIds ?? [],
            participants: tournament.participants ?? [],
            presetTeamCount: presetTeamCount(tournament),
            inPresetTeam: hasPresetTeam,
        });

        if (blocked) {
            const roleNames = (tournament.qualifiedRoles ?? [])
                .map(r => r.roleName || r.roleId)
                .join(" o ");
            const messages: Record<string, string> = {
                finished: "Este torneo ya terminó, no se pueden marcar spots.",
                "no-list": "Todavía no está publicada la lista de clasificados de este torneo.",
                "not-in-role": `Para marcar spot en este torneo necesitás el rol ${roleNames} en el Discord de Major Scrims. Si clasificaste, pedíselo a un moderador.`,
                "roles-unknown":
                    "No pudimos leer tus roles de Discord. Cerrá sesión, volvé a entrar y probá de nuevo.",
                "not-qualified":
                    "No figurás entre los clasificados de este torneo. Si clasificaste, avisale a un moderador y revisá que tu nombre de Epic sea exactamente el que usás para jugar.",
                "not-signed-in": "Necesitás iniciar sesión.",
            };
            return NextResponse.json(
                { success: false, error: messages[blocked], blockedBecause: blocked },
                { status: blocked === "finished" ? 409 : 403 }
            );
        }

        const validIds =
            mongoose.Types.ObjectId.isValid(windowId) && mongoose.Types.ObjectId.isValid(zoneId);
        const targetWindow = validIds ? tournament.windows.id(windowId) : null;
        const zone = targetWindow?.zones.id(zoneId);
        if (!targetWindow || !zone) {
            return NextResponse.json({ success: false, error: "Ese spot ya no existe." }, { status: 404 });
        }

        // One zone per player per window - including the spot a duo partner
        // already marked them into, otherwise the same player lands twice.
        const own = await SpotClaim.findOne({
            tournamentId: tournament._id,
            windowId,
            $or: [{ discordId: session.user.id }, { teammateIds: session.user.id }],
        });
        if (own) {
            const markedByPartner = own.discordId !== session.user.id;
            return NextResponse.json(
                {
                    success: false,
                    error: markedByPartner
                        ? `${own.epicName} ya te marcó en un spot de esta ronda. Liberalo antes de elegir otro.`
                        : "Ya tenés un spot en esta ventana. Liberalo antes de elegir otro.",
                    claimId: String(own._id),
                },
                { status: 409 }
            );
        }

        // With a preset team the ids are already known, so the names are looked
        // up rather than matched: no spelling to get wrong.
        let teammateIds: string[];
        let teammateNames: string[];
        if (hasPresetTeam) {
            const partners = await UserProfile.find({ discordId: { $in: presetPartners } });
            teammateIds = presetPartners;
            teammateNames = presetPartners.map(id => {
                const p = partners.find(x => x.discordId === id);
                return p?.epicName || p?.discordName || id;
            });
        } else {
            teammateIds = await resolveTeammateIds(tournament, teammates, session.user.id);
            teammateNames = teammates;
        }

        // The partner is being marked too, so they must be free as well.
        if (teammateIds.length) {
            const partnerBusy = await SpotClaim.findOne({
                tournamentId: tournament._id,
                windowId,
                $or: [{ discordId: { $in: teammateIds } }, { teammateIds: { $in: teammateIds } }],
            });
            if (partnerBusy) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Tu compañero ya está marcado en esta ronda con ${partnerBusy.epicName}. Tiene que liberar ese spot primero.`,
                    },
                    { status: 409 }
                );
            }
        }

        const capacity = zone.capacity ?? 1;
        const taken = await SpotClaim.countDocuments({ tournamentId: tournament._id, windowId, zoneId });
        // Over capacity is allowed, but only as an explicit dispute: the zone
        // turns red and a moderator decides who actually drops there.
        const isDispute = taken >= capacity;

        if (isDispute && taken >= capacity + MAX_DISPUTES_PER_ZONE) {
            return NextResponse.json(
                { success: false, error: "Este spot ya tiene demasiadas disputas. Elegí otro." },
                { status: 409 }
            );
        }
        if (isDispute && !wantsDispute) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Otro equipo tomó este spot recién. Podés disputarlo.",
                    canDispute: true,
                },
                { status: 409 }
            );
        }

        let claim;
        try {
            claim = await SpotClaim.create({
                tournamentId: tournament._id,
                windowId,
                zoneId,
                discordId: session.user.id,
                discordName: session.user.name || "",
                epicName,
                teammates: teammateNames,
                teammateIds,
                disputed: isDispute,
            });
        } catch (err) {
            // The unique index is the real guard against two simultaneous claims.
            if ((err as { code?: number }).code === 11000) {
                return NextResponse.json(
                    { success: false, error: "Ya tenés un spot en esta ventana." },
                    { status: 409 }
                );
            }
            throw err;
        }

        await UserProfile.findOneAndUpdate(
            { discordId: session.user.id },
            { discordId: session.user.id, epicName },
            { upsert: true }
        );

        return NextResponse.json({ success: true, claim: toClaimDTO(claim) }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

/**
 * Release a spot. Players can only release their own; admins can release
 * anyone's - that is how a moderator takes a team off a contested zone.
 */
export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const session = await requireSession();
        if (!session) {
            return NextResponse.json({ success: false, error: "Necesitás iniciar sesión." }, { status: 401 });
        }

        await connectToDB();
        const tournament = await Tournament.findOne({ slug: params.slug });
        if (!tournament) {
            return NextResponse.json({ success: false, error: "Torneo no encontrado" }, { status: 404 });
        }

        const { claimId } = await request.json();
        // A malformed id must read as "already gone", not blow up with a 500.
        if (!mongoose.Types.ObjectId.isValid(String(claimId ?? ""))) {
            return NextResponse.json({ success: false, error: "Ese spot ya está libre." }, { status: 404 });
        }

        const claim = await SpotClaim.findOne({ _id: claimId, tournamentId: tournament._id });
        if (!claim) {
            return NextResponse.json({ success: false, error: "Ese spot ya está libre." }, { status: 404 });
        }

        // Either member of the team can release it, plus any admin.
        const isOwnTeam =
            claim.discordId === session.user.id || (claim.teammateIds ?? []).includes(session.user.id);
        if (!isOwnTeam && !isAdminId(session.user.id)) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        const zone =
            mongoose.Types.ObjectId.isValid(claim.windowId) && mongoose.Types.ObjectId.isValid(claim.zoneId)
                ? tournament.windows.id(claim.windowId)?.zones.id(claim.zoneId)
                : null;
        await claim.deleteOne();
        await settleDisputes(tournament._id, claim.windowId, claim.zoneId, zone?.capacity ?? 1);

        return NextResponse.json({ success: true, removed: toClaimDTO(claim) });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
