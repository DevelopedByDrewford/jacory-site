import { useState, useEffect } from 'react';
import { scrollToId } from '../hooks';

const links = [
  ['books', 'Books'],
  ['speaking', 'Speaking'],
  ['about', 'About'],
];

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const go = (id) => { setOpen(false); scrollToId(id); };

  return (
    <>
      <nav className={`nav ${solid ? 'solid' : ''}`} aria-label="Primary">
        <button className="nav-mark" onClick={() => go('top')} aria-label="Jacory Wiley — back to top">
          Jacory Wiley<span className="dot">.</span>
        </button>
        <div className="nav-links">
          {links.map(([id, label]) => (
            <button key={id} className="link" onClick={() => go(id)}>{label}</button>
          ))}
          <button className="nav-cta" onClick={() => go('booking')}>Work with Jacory</button>
        </div>
        <button
          className="nav-burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span /><span /><span />
        </button>
      </nav>

      <div className={`mobile-menu ${open ? 'open' : ''}`} aria-hidden={!open}>
        {links.map(([id, label]) => (
          <button key={id} onClick={() => go(id)}>{label}</button>
        ))}
        <button onClick={() => go('booking')} style={{ color: 'var(--gold)' }}>Work with Jacory</button>
      </div>
    </>
  );
}
