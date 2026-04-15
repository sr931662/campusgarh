import { useState } from 'react';
import { parseMarkdown } from '../../../utils/parseMarkdown';
import styles from './MarkdownField.module.css';

/**
 * Drop-in replacement for a plain <textarea> that adds:
 *  - Live markdown preview (side-by-side on desktop, tabbed on mobile)
 *  - Inline toolbar for common markdown shortcuts
 *  - Collapsible markdown guide
 *
 * Usage:
 *   <MarkdownField
 *     label="Description"
 *     name="description"
 *     value={form.description}
 *     onChange={handleChange}
 *     placeholder="Write here..."
 *     rows={6}
 *   />
 */
export default function MarkdownField({ label, name, value, onChange, placeholder, rows = 6, required }) {
  const [tab, setTab] = useState('write'); // 'write' | 'preview'
  const [showGuide, setShowGuide] = useState(false);

  const cs = { background: 'rgba(201,168,76,0.12)', color: '#C9A84C', padding: '0.8rem 0.4rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem' };

  // Insert markdown syntax at cursor position
  const wrap = (before, after = '') => {
    const el = document.querySelector(`textarea[name="${name}"]`);
    if (!el) return;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const sel   = el.value.slice(start, end) || 'text';
    const newVal = el.value.slice(0, start) + before + sel + after + el.value.slice(end);
    onChange({ target: { name, value: newVal } });
    setTimeout(() => { el.focus(); el.setSelectionRange(start + before.length, start + before.length + sel.length); }, 0);
  };

  const TOOLBAR = [
    { label: 'B',  title: 'Bold',        action: () => wrap('**', '**') },
    { label: 'I',  title: 'Italic',      action: () => wrap('*', '*')   },
    { label: 'H2', title: 'Heading',     action: () => wrap('## ')      },
    { label: 'H3', title: 'Sub-heading', action: () => wrap('### ')     },
    { label: '—',  title: 'Divider',     action: () => wrap('\n---\n')  },
    { label: '•',  title: 'Bullet list', action: () => wrap('- ')       },
    { label: '1.', title: 'Numbered',    action: () => wrap('1. ')      },
    { label: '❝',  title: 'Blockquote',  action: () => wrap('> ')       },
    { label: '</>',title: 'Code',        action: () => wrap('`', '`')   },
    { label: '🔗', title: 'Link',        action: () => wrap('[', '](url)') },
  ];

  return (
    <div className={styles.wrap}>
      {label && (
        <label className={styles.label}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
          <span className={styles.mdBadge}>Markdown</span>
        </label>
      )}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        {TOOLBAR.map(btn => (
          <button key={btn.label} type="button" title={btn.title}
            className={styles.toolbarBtn} onClick={btn.action}>
            {btn.label}
          </button>
        ))}
        <div className={styles.spacer} />
        <button type="button" className={`${styles.tabBtn} ${tab === 'write' ? styles.tabActive : ''}`} onClick={() => setTab('write')}>Edit</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'preview' ? styles.tabActive : ''}`} onClick={() => setTab('preview')}>Preview</button>
      </div>

      {/* Editor / Preview */}
      {tab === 'write' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
          className={styles.editor}
        />
      ) : (
        <div
          className={styles.preview}
          style={{ minHeight: `${rows * 1.6}rem` }}
          dangerouslySetInnerHTML={{
            __html: parseMarkdown(value) || '<p style="color:#9ca3af">Nothing to preview yet…</p>'
          }}
        />
      )}

      {/* Collapsible guide */}
      <button type="button" className={styles.guideToggle} onClick={() => setShowGuide(v => !v)}>
        {showGuide ? '▲ Hide' : '▼ Show'} Markdown Guide
      </button>

      {showGuide && (
        <div className={styles.guide}>
          {[
            ['Headings',           ['# H1', '## H2', '### H3']],
            ['Text',               ['**bold**', '*italic*', '~~strike~~']],
            ['Lists',              ['- Bullet', '1. Numbered']],
            ['Link / Image',       ['[text](url)', '![alt](img-url)']],
            ['Quote & Code',       ['> blockquote', '`inline code`']],
            ['Divider',            ['---']],
          ].map(([title, items]) => (
            <div key={title} className={styles.guideGroup}>
              <strong>{title}</strong>
              {items.map(i => <code key={i} style={cs}>{i}</code>)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
