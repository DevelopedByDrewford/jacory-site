import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

/* ── Image modal ────────────────────────────────────────────────── */
function ImageModal({ images, startIdx, onClose }) {
  const [cur, setCur] = useState(startIdx);
  const backdropRef = useRef();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (images.length > 1) {
        if (e.key === 'ArrowRight') setCur((i) => (i + 1) % images.length);
        if (e.key === 'ArrowLeft') setCur((i) => (i - 1 + images.length) % images.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      className="spl-modal-backdrop"
      role="dialog"
      aria-modal="true"
    >
      <button className="spl-modal-close" onClick={onClose} aria-label="Close">✕</button>
      <div className="spl-modal-img-wrap">
        <img src={images[cur]} alt="" className="spl-modal-img" />
      </div>
      {images.length > 1 && (
        <>
          <button className="spl-modal-prev" onClick={() => setCur((i) => (i - 1 + images.length) % images.length)} aria-label="Previous">‹</button>
          <button className="spl-modal-next" onClick={() => setCur((i) => (i + 1) % images.length)} aria-label="Next">›</button>
          <div className="spl-modal-dots">
            {images.map((_, i) => (
              <button key={i} className={`spl-modal-dot${i === cur ? ' active' : ''}`} onClick={() => setCur(i)} aria-label={`Image ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Image pile ─────────────────────────────────────────────────── */
function ImagePile({ images }) {
  const [modalOpen, setModalOpen] = useState(false);
  const count = Math.min(images.length, 3);
  const visible = images.slice(0, count);

  return (
    <>
      <div
        className="spl-pile"
        data-count={count}
        onClick={() => setModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setModalOpen(true); }}
        aria-label={`View ${count} image${count !== 1 ? 's' : ''}`}
      >
        {visible.map((url, i) => (
          <div key={i} className="spl-pile-img">
            <img src={url} alt="" />
          </div>
        ))}
      </div>
      {modalOpen && <ImageModal images={visible} startIdx={count - 1} onClose={() => setModalOpen(false)} />}
    </>
  );
}

/* ── Testimonial card ───────────────────────────────────────────── */
function TestimonialCard({ item, delay }) {
  const images = (item.images || []).filter(Boolean);

  return (
    <div className={`spl-card reveal d${delay}`}>
      <p className="spl-quote">
        <span className="spl-qmark">"</span>{item.quote}<span className="spl-qmark">"</span>
      </p>
      <div className="spl-card-foot">
        {images.length > 0 && <ImagePile images={images} />}
        <div className="spl-author">
          <div className="spl-author-name">{item.name}</div>
          {item.role && <div className="spl-author-role">{item.role}</div>}
        </div>
      </div>
    </div>
  );
}

/* ── Media carousel ─────────────────────────────────────────────── */
function MediaCarousel({ items }) {
  const [idx, setIdx] = useState(0);
  const total = items.length;
  const item = items[idx];

  return (
    <div className="spl-carousel">
      <div className="spl-slide reveal">
        {item.imageUrl && (
          <div className="spl-slide-img">
            <img src={item.imageUrl} alt={item.title} />
          </div>
        )}
        <div className="spl-slide-body">
          <p className="spl-slide-meta">Media Appearance</p>
          <h3 className="spl-slide-title">{item.title}</h3>
          {item.description && <p className="spl-slide-desc">{item.description}</p>}
          {item.link && (
            <a href={item.link} className="spl-slide-link" target="_blank" rel="noopener noreferrer">
              Read more <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </div>
      {total > 1 && (
        <div className="spl-nav">
          <button className="spl-nav-btn" onClick={() => setIdx((i) => (i - 1 + total) % total)} aria-label="Previous">‹</button>
          <div className="spl-dots">
            {items.map((_, i) => (
              <button key={i} className={`spl-dot${i === idx ? ' active' : ''}`} onClick={() => setIdx(i)} aria-label={`Item ${i + 1}`} />
            ))}
          </div>
          <button className="spl-nav-btn" onClick={() => setIdx((i) => (i + 1) % total)} aria-label="Next">›</button>
        </div>
      )}
    </div>
  );
}

/* ── Section ────────────────────────────────────────────────────── */
export default function Spotlight() {
  const [media, setMedia] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    getDocs(query(collection(db, 'mediaAppearances'), orderBy('addedAt', 'desc')))
      .then((snap) => setMedia(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch(() => {});
    getDocs(query(collection(db, 'testimonials'), orderBy('addedAt', 'asc')))
      .then((snap) => setTestimonials(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch(() => {});
  }, []);

  if (!media.length && !testimonials.length) return null;

  return (
    <section className="section spotlight" id="spotlight">
      <div className="wrap">
        <div className="section-eyebrow reveal">
          <span className="eyebrow">Spotlight</span>
          <span className="num">05</span>
          <span className="ln" />
        </div>

        {media.length > 0 && (
          <div id="spotlight-media" className="spl-block">
            <h2 className="spl-block-title reveal">In the <em>media</em></h2>
            <MediaCarousel items={media} />
          </div>
        )}

        {testimonials.length > 0 && (
          <div id="spotlight-testimonials" className={`spl-block${media.length ? ' spl-block--divided' : ''}`}>
            <h2 className="spl-block-title reveal">What people <em>say</em></h2>
            <div className="spl-grid">
              {testimonials.map((item, i) => (
                <TestimonialCard key={item.id} item={item} delay={(i % 3) + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
