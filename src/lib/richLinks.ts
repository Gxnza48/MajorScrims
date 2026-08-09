/**
 * Turns `{Discord}(https://discord.gg/...)` into a blue link button.
 *
 * Moderators write plain text in the legal pages and in a tournament's
 * description, and asked for a way to drop a link in without an editor toolbar.
 * Markdown's own `[text](url)` works too, because half the people who try this
 * will type that out of habit.
 *
 * Only http(s) URLs are turned into links - never `javascript:` and friends.
 */

const LABEL = String.raw`[[{]([^[\]{}<>\n]{1,120})[\]}]`;

/**
 * Undoes the editor's autolink, but **only** right after a `{label}(`.
 *
 * The rich editor turns any URL into an `<a>` while you type, and its linkifier
 * happily swallows the closing parenthesis too, so what gets stored is
 * `{Discord}(<a href="https://x/)">https://x/)</a>` - the URL, the closing
 * paren and sometimes nothing else end up on the wrong side of a tag. Pulling
 * the anchor's text back out puts `{label}(url)` together again as plain text.
 *
 * Anchored to the `{label}(` prefix on purpose: a link the moderator made with
 * the editor's own button, anywhere else in the document, is left alone.
 */
const AUTOLINKED = new RegExp(`(${LABEL}\\()\\s*<a\\b[^>]*>(.*?)</a>`, "gis");

/** `{label}(url)` or `[label](url)`, once the text is whole again. */
const PATTERN = new RegExp(`${LABEL}\\(\\s*(https?://[^\\s()<>"']{1,600})\\s*\\)`, "gi");

const escapeHtml = (text: string) =>
    text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

/** The anchor itself. `label` must already be HTML-safe. */
function anchor(label: string, url: string): string {
    // The editor stores `&` escaped; unescape before re-escaping the href, or a
    // URL with query parameters ends up with `&amp;amp;` in it.
    const href = escapeHtml(url.replace(/&amp;/g, "&"));
    return `<a class="rich-link" href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

/** Applies the pattern to text that is already HTML-escaped, or to full HTML. */
const linkify = (safe: string) =>
    safe.replace(PATTERN, (_m, label: string, url: string) => anchor(label, url));

/**
 * For content that is already HTML (the rich editor's output): put the pattern
 * back together where the editor autolinked it, then turn it into a button.
 */
export function renderRichLinks(html: string): string {
    if (!html) return "";
    // `$1` is the `{label}(` prefix, `$3` the anchor's visible text.
    return linkify(html.replace(AUTOLINKED, "$1$3"));
}

/**
 * For plain text (a tournament description). Escapes first, so the text can
 * never inject markup, then adds the links and keeps the line breaks.
 */
export function renderPlainWithLinks(text: string): string {
    if (!text) return "";
    return linkify(escapeHtml(text));
}
