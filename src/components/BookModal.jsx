import { useEffect, useRef } from 'react';
import { trackBookClick } from '../hooks';

export default function BookModal({ open, onClose, book }) {
  const sections = book?.purchaseSections ?? [];
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">{book?.title}</div>
            <h2 className="modal-title" id="modal-title">Get the book</h2>
          </div>
          <button
            ref={closeRef}
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-sections">
            {sections.map((s) => (
              <div className="modal-section" key={s.label}>
                <div className="modal-section-head">
                  <span className="modal-section-icon" aria-hidden="true">{s.icon}</span>
                  <span className="modal-section-label">{s.label}</span>
                </div>
                <ul className="modal-links">
                  {s.links.map((l) => (
                    <li key={l.name}>
                      <a
                        href={l.href}
                        className="modal-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackBookClick(book?.title, s.label, l.name)}
                      >
                        {l.name}
                        <span className="modal-link-arr" aria-hidden="true">→</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="modal-library">
            <div className="modal-library-inner">
              <div className="modal-library-text">
                <span className="modal-library-icon" aria-hidden="true">🏛️</span>
                <div>
                  <div className="modal-library-title">Check your local library</div>
                  <div className="modal-library-sub">
                    Free to borrow — support your community library.
                  </div>
                </div>
              </div>
              <a
                href="https://www.worldcat.org"
                className="btn btn-ghost modal-library-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Find it <span className="arr">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
