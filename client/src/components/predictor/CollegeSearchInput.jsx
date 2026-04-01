import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';

const CollegeSearchInput = ({ selected, onChange, maxSelect = 10 }) => {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);
  const timer   = useRef(null);
  const inputRef = useRef(null);

  const search = (q) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await api.get('/colleges', { params: { search: q, limit: 8 } });
        const list = res.data?.data?.colleges || [];
        setResults(list);
        setOpen(list.length > 0);
      } catch { setResults([]); setOpen(false); }
    }, 300);
  };

  const add = (college) => {
    if (selected.length >= maxSelect) return;
    if (!selected.find(s => s.id === college._id)) {
      onChange([...selected, { id: college._id, name: college.name }]);
    }
    setQuery(''); setResults([]); setOpen(false);
    // Keep focus on input so keyboard stays open on mobile
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const remove = (id) => onChange(selected.filter(s => s.id !== id));

  const handleBlur = () => {
    // Delay close so onPointerDown on list item can fire first
    setTimeout(() => setOpen(false), 200);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div style={{ position: 'relative' }}>
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {selected.map(s => (
            <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>
              {s.name}
              <button type="button" onPointerDown={e => { e.preventDefault(); remove(s.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d4ed8', fontWeight: 700, padding: 0, lineHeight: 1, fontSize: '1rem' }}>×</button>
            </span>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => search(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={handleBlur}
        placeholder="Search colleges..."
        autoComplete="off"
        style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid var(--border, #E8E3DB)', borderRadius: 8, fontSize: '0.875rem', outline: 'none', background: 'var(--bg-soft, #F7F4EF)', boxSizing: 'border-box' }}
      />
      {open && results.length > 0 && (
        <ul
          onMouseDown={e => e.preventDefault()} /* prevents input blur on click */
          style={{ position: 'absolute', zIndex: 100, width: '100%', background: '#fff', border: '1px solid var(--border, #E8E3DB)', borderRadius: 8, marginTop: 4, padding: 0, listStyle: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', maxHeight: 240, overflowY: 'auto' }}>
          {results.map(c => (
            <li key={c._id}
              onPointerDown={() => add(c)}
              style={{ padding: '0.55rem 1rem', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid var(--border, #E8E3DB)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{c.name}</span>
              {c.contact?.state && <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>{c.contact.state}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CollegeSearchInput;
