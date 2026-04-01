import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';

const CourseSearchInput = ({ selected, onChange }) => {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);
  const timer = useRef(null);

  const search = (q) => {
    setQuery(q);
    if (q.length < 2) return setResults([]);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await api.get('/courses', { params: { search: q, limit: 8 } });
        setResults(res.data?.data?.courses || []);
        setOpen(true);
      } catch { setResults([]); }
    }, 300);
  };

  const add = (course) => {
    if (!selected.find(s => s.id === course._id)) {
      onChange([...selected, { id: course._id, name: course.name }]);
    }
    setQuery(''); setResults([]); setOpen(false);
  };

  const remove = (id) => onChange(selected.filter(s => s.id !== id));

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: selected.length ? 8 : 0 }}>
        {selected.map(s => (
          <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0fdf4', color: '#166534', padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>
            {s.name}
            <button type="button" onClick={() => remove(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontWeight: 700, padding: 0, lineHeight: 1 }}>×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={query}
        onChange={e => search(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        placeholder="Search courses..."
        style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid var(--border, #E8E3DB)', borderRadius: 8, fontSize: '0.875rem', outline: 'none', background: 'var(--bg-soft, #F7F4EF)', boxSizing: 'border-box' }}
      />
      {open && results.length > 0 && (
        <ul style={{ position: 'absolute', zIndex: 50, width: '100%', background: '#fff', border: '1px solid var(--border, #E8E3DB)', borderRadius: 8, marginTop: 4, padding: 0, listStyle: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', maxHeight: 220, overflowY: 'auto' }}>
          {results.map(c => (
            <li key={c._id} onMouseDown={() => add(c)}
              style={{ padding: '0.55rem 1rem', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid var(--border, #E8E3DB)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-soft, #F7F4EF)'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              {c.name}
              {c.category && <span style={{ color: 'var(--muted)', fontSize: '0.72rem', marginLeft: 6 }}>{c.category}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CourseSearchInput;
