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

/** `{label}(url)` or `[label](url)`, matched against *visible text*. */
const PATTERN = /[[{]([^[\]{}<>\n]{1,120})[\]}]\(\s*(https?:\/\/[^\s()<>"']{1,600})\s*\)/gi;

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

/** Safety cap; a legal page with this many buttons is already a mistake. */
const MAX_LINKS = 50;

/**
 * For content that is already HTML (the rich editor's output).
 *
 * Matching against the markup does not work here. The editor colours what you
 * type and autolinks URLs on the fly, so `{Discord}(https://x)` ends up spread
 * over five elements:
 *
 *   <span>{Discord}(</span><a href="x"><span>x</span></a><span>)</span>
 *
 * No regex over that string can reliably find a pattern that only exists in the
 * *rendered text*. So this walks the text nodes instead, finds the pattern in
 * the text they spell out together, and swaps that stretch - however many
 * elements it crosses - for one anchor, using a Range. Whatever inline markup
 * was inside the match (colours, the editor's own autolink) goes with it, which
 * is exactly what should happen: the moderator asked for a button.
 *
 * Needs a DOM, so it runs in the browser. On the server the text is left as it
 * is rather than half-transformed.
 */
export function renderRichLinks(html: string): string {
    if (!html) return "";
    if (typeof document === "undefined") return html;

    const root = document.createElement("div");
    root.innerHTML = html;

    for (let pass = 0; pass < MAX_LINKS; pass++) {
        const nodes: Text[] = [];
        const starts: number[] = [];
        let text = "";

        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode as Text;
            starts.push(text.length);
            nodes.push(node);
            text += node.data;
        }

        PATTERN.lastIndex = 0;
        const match = PATTERN.exec(text);
        if (!match) break;

        const at = (index: number) => {
            for (let i = 0; i < nodes.length; i++) {
                const start = starts[i];
                const end = start + nodes[i].data.length;
                if (index >= start && index <= end) return { node: nodes[i], offset: index - start };
            }
            return null;
        };

        const from = at(match.index);
        const to = at(match.index + match[0].length);
        if (!from || !to) break;

        const range = document.createRange();
        range.setStart(from.node, from.offset);
        range.setEnd(to.node, to.offset);
        range.deleteContents();

        const link = document.createElement("a");
        link.className = "rich-link";
        link.href = match[2];
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = match[1];
        range.insertNode(link);
    }

    return root.innerHTML;
}

/**
 * For plain text (a tournament description). Escapes first, so the text can
 * never inject markup, then adds the links and keeps the line breaks.
 */
export function renderPlainWithLinks(text: string): string {
    if (!text) return "";
    return linkify(escapeHtml(text));
}
