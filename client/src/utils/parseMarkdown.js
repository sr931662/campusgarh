/**
 * Lightweight markdown-to-HTML parser for blog content.
 * Supports: headings, bold, italic, code blocks, inline code,
 * blockquotes, ordered/unordered lists, horizontal rules, links, paragraphs.
 */
export function parseMarkdown(md) {
  if (!md) return '';

  // If content starts with an HTML tag, return as-is (rich-text editor output)
  if (md.trimStart().startsWith('<')) return md;

  let html = md;

  // Fenced code blocks
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code class="language-${lang}">${escHtml(code.trim())}</code></pre>`
  );

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Headings
  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr>');
    // Tables
  html = html.replace(/((?:^\|.+\|\s*\n?)+)/gm, (block) => {
    const rows = block.trim().split('\n').filter(r => r.trim());
    if (rows.length < 2) return block;
    const isSep = (r) => /^\|[\s|:\-]+\|$/.test(r.trim());
    const parseCells = (r) => r.split('|').filter((_, j, a) => j > 0 && j < a.length - 1).map(c => c.trim());
    let out = '<table><thead><tr>';
    out += parseCells(rows[0]).map(c => `<th>${c}</th>`).join('');
    out += '</tr></thead><tbody>';
    rows.filter((r, i) => i > 0 && !isSep(r)).forEach(r => {
      out += '<tr>' + parseCells(r).map(c => `<td>${c}</td>`).join('') + '</tr>';
    });
    return out + '</tbody></table>';
  });


  // Unordered lists (groups)
  html = html.replace(/((?:^[-*] .+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map(l => `<li>${l.replace(/^[-*] /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  // Ordered lists (groups)
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

  // Paragraphs — wrap lines not already wrapped in a block element
  html = html.replace(/^(?!<[hou\d]|<blockquote|<pre|<hr)(.+)$/gm, '<p>$1</p>');

  // Clean up extra blank lines between block elements
  html = html.replace(/\n{2,}/g, '\n');

  return html;
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
