import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OPTIONS = [
  { label: 'Go to Site', path: '/' },
  { label: 'Go to Manage', path: '/manage' },
];

export default function CmdK() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const selectedRef = useRef(selected);
  const closeRef = useRef(null);

  selectedRef.current = selected;

  // Global CMD+K / CTRL+K listener
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            const idx = OPTIONS.findIndex((o) => o.path !== pathname);
            setSelected(idx >= 0 ? idx : 0);
          }
          return !prev;
        });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [pathname]);

  // Modal keyboard navigation
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((i) => (i + 1) % OPTIONS.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((i) => (i - 1 + OPTIONS.length) % OPTIONS.length); }
      else if (e.key === 'Enter') { navigate(OPTIONS[selectedRef.current].path); setOpen(false); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, navigate]);

  if (!open) return null;

  return (
    <div className="cmdk-backdrop" onClick={() => setOpen(false)} role="presentation">
      <div className="cmdk" role="dialog" aria-modal="true" aria-label="Navigation" onClick={(e) => e.stopPropagation()}>
        <div className="cmdk-header">
          <span className="cmdk-heading">Navigate</span>
          <button ref={closeRef} className="cmdk-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>
        <ul className="cmdk-list" role="listbox">
          {OPTIONS.map((o, i) => (
            <li key={o.path} role="option" aria-selected={i === selected}>
              <button
                className={`cmdk-option${i === selected ? ' cmdk-option--active' : ''}`}
                onClick={() => { navigate(o.path); setOpen(false); }}
                onMouseEnter={() => setSelected(i)}
                tabIndex={-1}
              >
                <span className="cmdk-option-label">{o.label}</span>
                <span className="cmdk-option-meta">
                  {o.path === pathname
                    ? <span className="cmdk-badge">current</span>
                    : <span className="cmdk-arr">→</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="cmdk-footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> go</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
