/**
 * How many teammates a tournament format needs besides the player claiming.
 *
 * The format is free text typed by a moderator, so it is normalised: "Duos",
 * "Duo", "Duplas" and "DUO" all mean one teammate. Getting this wrong silently
 * hides the teammate picker, which is exactly how the duo field went missing.
 */
const normalize = (value: string) =>
    (value || "")
        .normalize("NFD")
        // NFD splits accents into combining marks; dropping non-ASCII removes
        // them, so "Duos" and "Duos" with an accent normalise the same way.
        .replace(/[^\x00-\x7F]/g, "")
        .trim()
        .toLowerCase();

export function teammateSlots(teamSize: string): number {
    const v = normalize(teamSize);
    if (!v) return 0;
    if (v.startsWith("duo") || v.startsWith("dupla") || v.startsWith("dua") || v === "2") return 1;
    if (v.startsWith("trio") || v.startsWith("tri") || v === "3") return 2;
    if (
        v.startsWith("squad") ||
        v.startsWith("quad") ||
        v.startsWith("cuarteto") ||
        v.startsWith("quarteto") ||
        v === "4"
    ) {
        return 3;
    }
    return 0;
}
