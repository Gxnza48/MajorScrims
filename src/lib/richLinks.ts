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

const PATTERN = /[[{]([^[\]{}<>\n]{1,120})[\]}]\((https?:\/\/[^\s()<>"']{1,600})\)/g;

const escapeHtml = (text: string) =>
    text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

/** The anchor itself. `label` must already be HTML-safe. */
function anchor(label: string, url: string): string {
    const href = escapeHtml(url);
    return `<a class="rich-link" href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

/** Applies the pattern to a run of text that is already HTML-escaped. */
const linkify = (safeText: string) =>
    safeText.replace(PATTERN, (_m, label: string, url: string) => anchor(label, url));

/**
 * For content that is already HTML (the rich editor's output). Tags are left
 * untouched, so the pattern can never be rewritten inside an attribute.
 */
export function renderRichLinks(html: string): string {
    if (!html) return "";
    return html
        .split(/(<[^>]*>)/g)
        .map(part => (part.startsWith("<") ? part : linkify(part)))
        .join("");
}

/**
 * For plain text (a tournament description). Escapes first, so the text can
 * never inject markup, then adds the links and keeps the line breaks.
 */
export function renderPlainWithLinks(text: string): string {
    if (!text) return "";
    return linkify(escapeHtml(text));
}
