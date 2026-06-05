import { useParallax, Placeholder } from '../hooks';

const miles = [
  ['Houston', 'Born and raised in Texas. He lost his sight as a child — and decided early he would never lose his vision.'],
  ['2022', 'Stepped into the batter’s box of beep baseball and found his swing, his team, and his nerve.'],
  ['Sam Houston', 'Earned his degree at Sam Houston State University, learning to tell stories that travel further than sight.'],
  ['Atlanta', 'Now lives in Georgia, writing children’s books for the next generation of dreamers.'],
];

export function About() {
  const portraitRef = useParallax(0.08);
  return (
    <section className="section about" id="about">
      <div className="wrap">
        <div className="section-eyebrow reveal">
          <span className="eyebrow">About</span>
          <span className="num">01</span>
          <span className="ln" />
        </div>

        <h2 className="about-lede reveal d1">
          He was told the world would get smaller. <em>So he made it bigger</em> — one page, one swing, one talk at a time.
        </h2>

        <div className="about-grid">
          <div className="about-portrait reveal">
            <div className="pframe" />
            <div ref={portraitRef} style={{ position: 'absolute', inset: 0 }}>
              <div
                className="ph"
                data-label="Portrait — Jacory, warm natural light, three-quarter, holding one of his books"
                style={{ position: 'absolute', inset: '-6% 0' }}
              >
                <img
                  src="https://photos.smugmug.com/photos/i-6P9dWTm/0/KF7jsWJWKG688RbdbdBnWPKqrCKFDfdnLm2z6tQ3J/L/i-6P9dWTm-L.jpg"
                  alt="Portrait — Jacory, warm natural light, three-quarter, holding one of his books"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          </div>

          <div className="about-body">
            <p className="reveal d1">
              <strong>Jacory Wiley is a children’s author and motivational speaker from Houston, Texas.</strong>{' '}
              He became visually impaired as a boy — an age when most kids are still learning what they want to be.
              Jacory learned something harder, and more useful: how to keep dreaming when you can no longer see the finish line.
            </p>
            <p className="reveal d2">
              Sport gave him his first answer. In 2022 he found <strong>beep baseball</strong> — the game played by athletes
              who are blind, with a ball that beeps and bases that buzz — and discovered that the diamond didn’t care
              what he couldn’t see. It only cared whether he’d swing.
            </p>
            <p className="reveal d3">
              He carried that same belief through Sam Houston State University and into the work he does now from Atlanta,
              Georgia: <strong>writing books for kids</strong> who are figuring out that being different isn’t the same as being less.
            </p>
            <p className="about-sig reveal d3">Jacory Wiley</p>
          </div>
        </div>

        <div className="miles">
          {miles.map(([yr, lb], i) => (
            <div className={`mile reveal d${(i % 4) + 1}`} key={yr}>
              <div className="yr">{yr}</div>
              <div className="lb">{lb}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function QuoteBand() {
  const imgRef = useParallax(0.22);
  return (
    <section className="band" aria-label="Quote">
      <div ref={imgRef} className="band-img">
        <Placeholder
          label="Wide cinematic — Jacory mid-swing on the beep baseball field, motion, dust"
          style={{ position: 'absolute', inset: 0 }}
        />
      </div>
      <div className="band-veil" />
      <div className="wrap band-inner reveal">
        <p className="band-q">
          <span className="mark">“</span>You don’t need to see the pitch coming to be ready to swing.
          You just have to believe it’s yours.<span className="mark">”</span>
        </p>
        <p className="band-by">Jacory Wiley</p>
      </div>
    </section>
  );
}
