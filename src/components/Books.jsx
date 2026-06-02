import { Placeholder } from '../hooks';

const grid = [
  {
    title: 'Ballin’ Beyond the Wheels',
    meta: 'Picture book · Out now',
    live: true,
    desc: 'A celebration of every kid who was told to sit on the sidelines — and rolled, ran, or swung their way onto the field anyway.',
    cover: 'Book cover — Ballin’ Beyond the Wheels',
  },
  {
    title: 'Bigger Than Life',
    meta: 'Picture book · Coming soon',
    live: false,
    desc: 'A new story about how the smallest kid in the room can carry the biggest dream of all.',
    cover: 'Book cover — Bigger Than Life (coming soon)',
  },
  {
    title: 'I Can’t See, But I’m Still Perfect as Me',
    meta: 'First chapter book · Coming soon',
    live: false,
    desc: 'Jacory’s first chapter book — a young reader discovers that being different was never the same as being less.',
    cover: 'Book cover — I Can’t See, But I’m Still Perfect as Me (coming soon)',
  },
];

export default function Books() {
  return (
    <section className="section books" id="books">
      <div className="wrap">
        <div className="books-head">
          <div>
            <div className="section-eyebrow reveal">
              <span className="eyebrow">The Books</span>
              <span className="num">02</span>
              <span className="ln" />
            </div>
            <h2 className="books-title reveal d1">Stories for kids who dream in the <em>dark</em>.</h2>
          </div>
          <p className="books-intro reveal d2">
            Warm, honest picture books about difference, courage, and the kind of vision that has nothing to do with eyesight.
          </p>
        </div>

        <div className="feat">
          <div className="feat-cover reveal">
            <Placeholder label="Featured cover — Vision to Dream" style={{ position: 'absolute', inset: 0 }} />
          </div>
          <div className="feat-info">
            <span className="badge live reveal"><span className="pip" /> Out now</span>
            <h3 className="reveal d1">Vision to Dream</h3>
            <div className="meta reveal d1">Picture book · Ages 4–8</div>
            <p className="reveal d2">
              The book that started it all. A tender, joyful story about chasing a dream you can't yet see — and
              discovering that not being able to see it is exactly how every great dream begins.
            </p>
            <div className="reveal d3" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <a className="btn btn-solid" href="#" onClick={(e) => e.preventDefault()}>
                Get the book <span className="arr">&rarr;</span>
              </a>
              <a className="btn btn-ghost" href="#" onClick={(e) => e.preventDefault()}>
                Read an excerpt
              </a>
            </div>
          </div>
        </div>

        <div className="book-grid">
          {grid.map((b, i) => (
            <article className={`book-card reveal d${(i % 3) + 1}`} key={b.title}>
              <div className="cover">
                <Placeholder label={b.cover} style={{ position: 'absolute', inset: 0 }} />
              </div>
              <span className={`badge ${b.live ? 'live' : 'soon'}`} style={{ marginBottom: '16px' }}>
                <span className="pip" /> {b.live ? 'Out now' : 'Coming soon'}
              </span>
              <h4>{b.title}</h4>
              <div className="bmeta">{b.meta}</div>
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.98rem', lineHeight: 1.6, margin: '0 0 16px' }}>{b.desc}</p>
              <a className="blink" href="#" onClick={(e) => e.preventDefault()}>
                {b.live ? 'Get the book' : 'Join the waitlist'} <span className="arr">&rarr;</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
