import { useState } from 'react';
import { Placeholder, useBooks, useReveals } from '../hooks';
import BookModal from './BookModal';

export default function Books() {
  const [modalBook, setModalBook] = useState(null);
  const { books, loading } = useBooks();
  useReveals();
  const featured = books.find((b) => b.featured);
  const gridBooks = books.filter((b) => !b.featured).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  if (loading || !featured) return null;

  return (
    <section className="section books" id="books">
      <div className="wrap">
        <div className="section-eyebrow reveal">
          <span className="eyebrow">The Books</span>
          <span className="num">01</span>
          <span className="ln" />
        </div>

        <span aria-label="hello">Jacory</span>

        <div className="feat">
          <div className="feat-cover reveal" onClick={() => setModalBook(featured)} style={{ cursor: 'pointer' }}>
            {featured.coverImage
              ? <img src={featured.coverImage} alt={featured.cover} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Placeholder label={featured.cover} style={{ position: 'absolute', inset: 0 }} />}
          </div>
          <div className="feat-info">
            <span className="badge live reveal"><span className="pip" /> Out now</span>
            <h3 className="reveal d1">{featured.title}</h3>
            <div className="meta reveal d1">{featured.meta}</div>
            <p className="reveal d2">{featured.desc}</p>
            <div className="reveal d3" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-solid" onClick={() => setModalBook(featured)}>
                Get the book <span className="arr">&rarr;</span>
              </button>
              <button type="button" className="btn btn-ghost">
                Read an excerpt
              </button>
            </div>
          </div>
        </div>

        <div className="book-grid">
          {gridBooks.map((b, i) => (
            <article className={`book-card reveal d${(i % 3) + 1}`} key={b.id}>
              <div className="cover" onClick={() => setModalBook(b)} style={{ cursor: 'pointer' }}>
                {b.coverImage
                  ? <img src={b.coverImage} alt={b.cover} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Placeholder label={b.cover} style={{ position: 'absolute', inset: 0 }} />}
              </div>
              <span className={`badge ${b.live ? 'live' : 'soon'}`} style={{ marginBottom: '16px' }}>
                <span className="pip" /> {b.live ? 'Out now' : 'Coming soon'}
              </span>
              <h4>{b.title}</h4>
              <div className="bmeta">{b.meta}</div>
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.98rem', lineHeight: 1.6, margin: '0 0 16px' }}>{b.desc}</p>
              <button type="button" className="blink" onClick={() => setModalBook(b)}>
                {b.live ? 'Get the book' : 'Join the waitlist'} <span className="arr">&rarr;</span>
              </button>
            </article>
          ))}
        </div>
      </div>
      <BookModal open={!!modalBook} onClose={() => setModalBook(null)} book={modalBook} />
    </section>
  );
}
