/**
 * Lightweight markdown-to-HTML parser.
 * Supports: headings (with IDs), bold, italic, strikethrough,
 * inline code, fenced code blocks, blockquotes, ordered/unordered
 * lists, horizontal rules, links, images, tables (with alignment), paragraphs.
 */
export function parseMarkdown(md) {
  if (!md) return '';

  // Rich-text editor output — return as-is
  if (md.trimStart().startsWith('<')) return md;

  let html = md;

  // ── Fenced code blocks (must come first) ──────────────────────────────────
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code class="language-${lang}">${escHtml(code.trim())}</code></pre>`
  );

  // ── Blockquotes ────────────────────────────────────────────────────────────
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // ── Headings with slugified IDs ────────────────────────────────────────────
  const slugify = (t) =>
    t.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
  html = html.replace(/^###### (.+)$/gm, (_, t) => `<h6 id="${slugify(t)}">${t}</h6>`);
  html = html.replace(/^##### (.+)$/gm,  (_, t) => `<h5 id="${slugify(t)}">${t}</h5>`);
  html = html.replace(/^#### (.+)$/gm,   (_, t) => `<h4 id="${slugify(t)}">${t}</h4>`);
  html = html.replace(/^### (.+)$/gm,    (_, t) => `<h3 id="${slugify(t)}">${t}</h3>`);
  html = html.replace(/^## (.+)$/gm,     (_, t) => `<h2 id="${slugify(t)}">${t}</h2>`);
  html = html.replace(/^# (.+)$/gm,      (_, t) => `<h1 id="${slugify(t)}">${t}</h1>`);

  // ── Horizontal rule ────────────────────────────────────────────────────────
  html = html.replace(/^---+$/gm, '<hr>');

  // ── Tables (GFM-style with alignment) ─────────────────────────────────────
  html = html.replace(/((?:^\|.+\|\s*\n?)+)/gm, (block) => {
    const rows = block.trim().split('\n').filter(r => r.trim());
    if (rows.length < 2) return block;

    const isSep = (r) => /^\|[\s|:\-]+\|$/.test(r.trim());
    const sepRow = rows.find(isSep);

    // Determine column alignments from separator row
    const alignments = sepRow
      ? sepRow.split('|')
          .filter((_, j, a) => j > 0 && j < a.length - 1)
          .map(cell => {
            const c = cell.trim();
            if (c.startsWith(':') && c.endsWith(':')) return 'center';
            if (c.endsWith(':')) return 'right';
            if (c.startsWith(':')) return 'left';
            return '';
          })
      : [];

    const parseCells = (r) =>
      r.split('|').filter((_, j, a) => j > 0 && j < a.length - 1).map(c => c.trim());

    const alignAttr = (i) => alignments[i] ? ` style="text-align:${alignments[i]}"` : '';

    const headerCells = parseCells(rows[0]);
    let out = '<div class="mdTableWrap"><table class="mdTable"><thead><tr>';
    out += headerCells.map((c, i) => `<th${alignAttr(i)}>${c}</th>`).join('');
    out += '</tr></thead><tbody>';

    rows.filter(r => !isSep(r) && r !== rows[0]).forEach(r => {
      const cells = parseCells(r);
      out += '<tr>' + cells.map((c, i) => `<td${alignAttr(i)}>${c}</td>`).join('') + '</tr>';
    });

    return out + '</tbody></table></div>';
  });

  // ── Unordered lists ────────────────────────────────────────────────────────
  html = html.replace(/((?:^[-*] .+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n')
      .map(l => `<li>${l.replace(/^[-*] /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  // ── Ordered lists ──────────────────────────────────────────────────────────
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n')
      .map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // ── Inline image (before links) ────────────────────────────────────────────
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width:100%;height:auto;border-radius:8px;margin:1em 0;">');

  // ── Inline code ────────────────────────────────────────────────────────────
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // ── Bold, italic, strikethrough ────────────────────────────────────────────
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // ── Links ──────────────────────────────────────────────────────────────────
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // ── Paragraphs — skip lines already inside a block element ─────────────────
  html = html.replace(
    /^(?!<h[1-6]|<ul|<ol|<li|<blockquote|<pre|<hr|<table|<div|<p|<img)(.+)$/gm,
    '<p>$1</p>'
  );

  // ── Clean extra blank lines ────────────────────────────────────────────────
  html = html.replace(/\n{2,}/g, '\n');

  return html;
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
