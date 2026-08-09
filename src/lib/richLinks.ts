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

/**
 * `{label}(url)` or `[label](url)`.
 *
 * The URL part tolerates being wrapped in an `<a>`: the rich editor autolinks
 * any URL as you type it, which leaves `{Discord}(<a ...>https://...</a>)` and
 * used to stop the pattern from ever matching - the braces ended up in one text
 * node and the URL in another. Requiring the literal `{...}(` prefix is what
 * keeps this from firing inside a tag's attributes.
 */
const PATTERN =
    /[[{]([^[\]{}<>\n]{1,120})[\]}]\(\s*(?:<a\b[^>]*>)?\s*(https?:\/\/[^\s()<>"']{1,600}?)\s*(?:<\/a>)?\s*\)/gi;

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
 * For content that is already HTML (the rich editor's output).
 *
 * Runs over the whole string rather than per text node, because the editor
 * autolinks URLs and splits the pattern across tags. The label can contain no
 * `<` or `>`, so a tag can never be swallowed into one.
 */
export function renderRichLinks(html: string): string {
    if (!html) return "";
    return linkify(html);
}

/**
 * For plain text (a tournament description). Escapes first, so the text can
 * never inject markup, then adds the links and keeps the line breaks.
 */
export function renderPlainWithLinks(text: string): string {
    if (!text) return "";
    return linkify(escapeHtml(text));
}
