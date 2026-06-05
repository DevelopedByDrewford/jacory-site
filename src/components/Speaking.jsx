import { scrollToId, Placeholder } from '../hooks';

const topics = [
  ['01', "Dream Past What You Can See", "A keynote on chasing a goal when the odds — or your own body — tell you no. Jacory's own story, and the mindset behind it."],
  ['02', "Different Isn't Less", "For students and young audiences: disability, identity, and the quiet confidence of knowing your worth was never up for debate."],
  ['03', "Swing Anyway", "Resilience drawn from the beep baseball diamond — how to show up, prepared and unafraid, even when you can't see what's coming."],
];

export function Speaking() {
  return (
    <section className="section speaking" id="speaking">
      <div className="wrap">
        <div className="section-eyebrow reveal">
          <span className="eyebrow">Speaking</span>
          <span className="num">02</span>
          <span className="ln" />
        </div>
        <div className="spk-grid">
          <div>
            <h2 className="spk-title reveal d1">Talks that help people <em>dream louder</em>.</h2>
            <p className="spk-lede reveal d2">
              Jacory speaks to schools, teams, and organizations about achieving your dreams in the face of adversity —
              and about what disability has taught him that nothing else could. Honest, funny, and impossible to forget.
            </p>
            <ul className="spk-topics">
              {topics.map(([n, t, d], i) => (
                <li className={`reveal d${i + 1}`} key={n}>
                  <span className="ti">{n}</span>
                  <div className="td">
                    <h5>{t}</h5>
                    <p>{d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <a
              className="btn btn-solid reveal"
              href="#booking"
              onClick={(e) => { e.preventDefault(); scrollToId('booking'); }}
            >
              Book Jacory to speak <span className="arr">&rarr;</span>
            </a>
          </div>
          <div className="spk-visual reveal d2">
            <img
              src="https://photos.smugmug.com/photos/i-R8CcRxj/0/MpBNZZGz6rWvNMzfvxhFT5JVFvx87pkz82F6gKvKJ/X2/i-R8CcRxj-X2.jpg"
              alt="Portrait — Jacory speaking on stage, mic in hand, warm light"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="spk-stat">
              <div className="big">Any age.</div>
              <div className="sm">From kindergarten classrooms to corporate keynotes — in person or virtual.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
