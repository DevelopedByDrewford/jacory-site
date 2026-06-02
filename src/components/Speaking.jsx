import { useState } from 'react';
import { scrollToId, Placeholder } from '../hooks';

const topics = [
  ['01', "Dream Past What You Can See", "A keynote on chasing a goal when the odds — or your own body — tell you no. Jacory’s own story, and the mindset behind it."],
  ['02', "Different Isn’t Less", "For students and young audiences: disability, identity, and the quiet confidence of knowing your worth was never up for debate."],
  ['03', "Swing Anyway", "Resilience drawn from the beep baseball diamond — how to show up, prepared and unafraid, even when you can’t see what’s coming."],
];

export function Speaking() {
  return (
    <section className="section speaking" id="speaking">
      <div className="wrap">
        <div className="section-eyebrow reveal">
          <span className="eyebrow">Speaking</span>
          <span className="num">03</span>
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
            <Placeholder
              label="Portrait — Jacory speaking on stage, mic in hand, warm light"
              style={{ position: 'absolute', inset: 0 }}
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

export function Booking() {
  const [form, setForm] = useState({ name: '', email: '', org: '', type: 'Keynote', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Please add your name.';
    if (!form.email.trim()) er.email = 'Please add an email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = 'That email looks off.';
    if (!form.message.trim()) er.message = 'Tell Jacory a little about your event.';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (validate()) setSent(true);
  };

  return (
    <section className="booking" id="booking">
      <div className="wrap">
        <div className="book-grid2">
          <div className="bk-pitch">
            <div className="section-eyebrow reveal">
              <span className="eyebrow">Work with Jacory</span>
              <span className="num">04</span>
              <span className="ln" />
            </div>
            <h2 className="reveal d1">Let&rsquo;s put your audience in the <em>batter&rsquo;s box</em>.</h2>
            <p className="reveal d2">
              Booking a school visit, a keynote, an author reading, or a virtual session? Send a few details
              and Jacory will get back to you personally.
            </p>
            <div className="bk-contact reveal d3">
              <a href="mailto:hello@jacorywiley.com"><span className="ic">@</span> hello@jacorywiley.com</a>
              <a href="#" onClick={(e) => e.preventDefault()}><span className="ic">in</span> Connect on LinkedIn</a>
              <a href="#" onClick={(e) => e.preventDefault()}><span className="ic">ig</span> @jacorywiley</a>
            </div>
          </div>

          <div className="bk-form reveal d2">
            {sent ? (
              <div className="form-ok">
                <div className="ck">✓</div>
                <h3>Thank you, {form.name.split(' ')[0] || 'friend'}.</h3>
                <p>Your message is on its way. Jacory reads every note himself and will be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <h3>Send a booking inquiry</h3>
                <div className={`field ${errors.name ? 'err' : ''}`}>
                  <label htmlFor="f-name">Your name</label>
                  <input id="f-name" type="text" value={form.name} onChange={set('name')} placeholder="Jane Rivera" />
                  <div className="msg">{errors.name}</div>
                </div>
                <div className={`field ${errors.email ? 'err' : ''}`}>
                  <label htmlFor="f-email">Email</label>
                  <input id="f-email" type="email" value={form.email} onChange={set('email')} placeholder="jane@school.org" />
                  <div className="msg">{errors.email}</div>
                </div>
                <div className="field">
                  <label htmlFor="f-org">
                    Organization <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <input id="f-org" type="text" value={form.org} onChange={set('org')} placeholder="Oak Grove Elementary" />
                </div>
                <div className="field">
                  <label htmlFor="f-type">What are you planning?</label>
                  <select id="f-type" value={form.type} onChange={set('type')}>
                    <option>Keynote</option>
                    <option>School visit</option>
                    <option>Author reading</option>
                    <option>Workshop</option>
                    <option>Virtual session</option>
                    <option>Something else</option>
                  </select>
                </div>
                <div className={`field ${errors.message ? 'err' : ''}`}>
                  <label htmlFor="f-msg">About your event</label>
                  <textarea
                    id="f-msg"
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Audience, date, location, what you're hoping for…"
                  />
                  <div className="msg">{errors.message}</div>
                </div>
                <button type="submit" className="btn btn-solid">
                  Send inquiry <span className="arr">&rarr;</span>
                </button>
              </form>
            )}
          </div>
        </div>

        <footer className="foot">
          <div className="fmark">Jacory Wiley<span className="dot">.</span></div>
          <div className="fsoc">
            <a href="#" onClick={(e) => e.preventDefault()}>Instagram</a>
            <a href="#" onClick={(e) => e.preventDefault()}>LinkedIn</a>
            <a href="#" onClick={(e) => e.preventDefault()}>YouTube</a>
          </div>
          <div className="fcopy">&copy; {new Date().getFullYear()} Jacory Wiley · Houston &rarr; Atlanta</div>
        </footer>
      </div>
    </section>
  );
}
