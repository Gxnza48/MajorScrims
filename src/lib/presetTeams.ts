/**
 * Duos (or trios/squads) a moderator writes down before the tournament, by
 * Discord id: "k1ng juega con fazer". Whoever of them marks a spot first drags
 * the rest of the team into it, so nobody picks a partner from a dropdown and
 * nobody can be left half-marked.
 *
 * It is per tournament on purpose - the same two players may not be a team in
 * the next one.
 */

export interface PresetTeamSource {
    presetTeams?: { memberIds: string[] }[];
}

/** Squads is the biggest Fortnite format. */
export const MAX_TEAM_MEMBERS = 4;
/** Far above any real BR round; only a runaway-input guard. */
export const MAX_PRESET_TEAMS = 300;

const isSnowflake = (v: string) => /^\d{5,25}$/.test(v);

/** The whole team `discordId` belongs to, or null when they are in none. */
export function findPresetTeam(t: PresetTeamSource, discordId: string): string[] | null {
    if (!discordId) return null;
    const team = (t.presetTeams ?? []).find(x => (x.memberIds ?? []).includes(discordId));
    return team ? team.memberIds.filter(Boolean) : null;
}

/** Their fixed partners: the team minus themselves. Empty when they have none. */
export function presetPartnersOf(t: PresetTeamSource, discordId: string): string[] {
    const team = findPresetTeam(t, discordId);
    return team ? team.filter(id => id !== discordId) : [];
}

export function presetTeamCount(t: PresetTeamSource): number {
    return (t.presetTeams ?? []).length;
}

/**
 * Cleans what the panel sent: real Discord ids only, at least two of them, and
 * **nobody in two teams** - that would make "who is k1ng's duo" ambiguous at
 * claim time. The panel blocks that case with a message; this is the safety net,
 * and it keeps the first team the player appears in.
 */
export function normalisePresetTeams(raw: unknown): { memberIds: string[] }[] {
    if (!Array.isArray(raw)) return [];

    const used = new Set<string>();
    const teams: { memberIds: string[] }[] = [];

    for (const row of raw.slice(0, MAX_PRESET_TEAMS)) {
        const ids = Array.isArray((row as { memberIds?: unknown })?.memberIds)
            ? ((row as { memberIds: unknown[] }).memberIds)
            : [];

        const clean: string[] = [];
        for (const value of ids) {
            const id = String(value ?? "").trim();
            if (!isSnowflake(id) || clean.includes(id) || used.has(id)) continue;
            clean.push(id);
            if (clean.length >= MAX_TEAM_MEMBERS) break;
        }

        if (clean.length < 2) continue; // a team of one is not a team
        clean.forEach(id => used.add(id));
        teams.push({ memberIds: clean });
    }

    return teams;
}
