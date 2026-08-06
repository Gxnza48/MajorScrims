export type TournamentStatus = "Upcoming" | "Live" | "Completed";

/**
 * Status is never stored - it is always derived from the dates, so a tournament
 * flips to Live/Completed on its own without anyone editing it.
 */
export function getStatus(start: string | Date, end: string | Date, now: Date = new Date()): TournamentStatus {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now > endDate) return "Completed";
    if (now >= startDate) return "Live";
    return "Upcoming";
}

/** Live first, then soonest upcoming, then most recently finished. */
export function compareTournaments(
    a: { start: string | Date; end: string | Date },
    b: { start: string | Date; end: string | Date },
    now: Date = new Date()
): number {
    const sa = getStatus(a.start, a.end, now);
    const sb = getStatus(b.start, b.end, now);

    if (sa === "Live" && sb !== "Live") return -1;
    if (sa !== "Live" && sb === "Live") return 1;
    if (sa === "Upcoming" && sb === "Upcoming") {
        return new Date(a.start).getTime() - new Date(b.start).getTime();
    }
    if (sa === "Upcoming" && sb === "Completed") return -1;
    if (sa === "Completed" && sb === "Upcoming") return 1;
    return new Date(b.end).getTime() - new Date(a.end).getTime();
}

/** "EWC Reload Elite Series" -> "ewc-reload-elite-series" */
export function slugify(value: string): string {
    return value
        .normalize("NFD")
        // NFD splits accents into combining marks; dropping non-ASCII removes them
        // so "Solo Séries" slugs to "solo-series" and not "solo-s-ries".
        .replace(/[^\x00-\x7F]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}
