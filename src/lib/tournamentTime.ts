/**
 * When a tournament runs, written out for whoever is reading.
 *
 * The dates are stored as instants (the panel's `datetime-local` is read in the
 * moderator's own timezone and saved as UTC), so formatting them with no
 * `timeZone` option renders each visitor's local time on its own: a round at
 * 21:00 in Brazil reads 21:00 there and 20:00 in Chile, which is the point.
 *
 * The zone's name is spelled out because "21:00" with no reference is exactly
 * the sort of thing a player gets wrong by an hour.
 */

const time: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };

/** "GMT-3", "ART", whatever the browser calls the reader's zone. */
export function zoneLabel(date: Date, locale: string): string {
    try {
        return (
            new Intl.DateTimeFormat(locale, { timeZoneName: "short" })
                .formatToParts(date)
                .find(part => part.type === "timeZoneName")?.value ?? ""
        );
    } catch {
        return "";
    }
}

export function formatTournamentRange(
    startIso: string,
    endIso: string,
    locale: string
): string {
    const start = new Date(startIso);
    const end = new Date(endIso);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";

    const sameDay = start.toDateString() === end.toDateString();
    const day: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
    const zone = zoneLabel(start, locale);
    const suffix = zone ? ` (${zone})` : "";

    if (sameDay) {
        return (
            `${start.toLocaleDateString(locale, { ...day, year: "numeric" })} · ` +
            `${start.toLocaleTimeString(locale, time)} - ${end.toLocaleTimeString(locale, time)}${suffix}`
        );
    }

    return (
        `${start.toLocaleDateString(locale, day)} ${start.toLocaleTimeString(locale, time)} - ` +
        `${end.toLocaleDateString(locale, { ...day, year: "numeric" })} ` +
        `${end.toLocaleTimeString(locale, time)}${suffix}`
    );
}

/** One round's start, same idea: the reader's own clock. */
export function formatWindowStart(iso: string, locale: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString(locale, {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}
