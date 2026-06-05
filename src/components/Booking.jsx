import { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';

const CONTACT_LINKS = [
  { ic: '@', label: 'Email', href: 'mailto:jacorydwiley@gmail.com' },
  { ic: 'fb', label: 'Facebook', href: 'https://www.facebook.com/jacory.wiley1' },
  { ic: 'ig', label: 'Instagram', href: 'https://www.instagram.com/mrdynamo21/' },
  { ic: 'in', label: 'LinkedIn', href: 'https://www.linkedin.com/in/jacory-wiley-99aa12107/' },
  { ic: '$', label: 'Cash App', href: 'https://cash.app/$jacorywiley' }
];

export function Booking() {
  const [state, handleSubmit] = useForm('mvznzrzd');
  const [name, setName] = useState('');

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
              {CONTACT_LINKS.map(({ ic, label, href }) =>
                href ? (
                  <a key={label} href={href}><span className="ic">{ic}</span> {label}</a>
                ) : (
                  <button key={label} type="button" className="bk-contact-btn"><span className="ic">{ic}</span> {label}</button>
                )
              )}
            </div>
          </div>

          <div className="bk-form reveal d2">
            {state.succeeded ? (
              <div className="form-ok">
                <div className="ck">✓</div>
                <h3>Thank you, {name.split(' ')[0] || 'friend'}.</h3>
                <p>Your message is on its way. Jacory reads every note himself and will be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3>Send a booking inquiry</h3>
                <input type="hidden" name="_cc" value="andrewjcook93@gmail.com" />
                <div className="field">
                  <label htmlFor="f-name">Your name</label>
                  <input
                    id="f-name"
                    type="text"
                    name="name"
                    required
                    placeholder="Jane Rivera"
                    onChange={(e) => setName(e.target.value)}
                  />
                  <ValidationError field="name" errors={state.errors} className="msg" />
                </div>
                <div className="field">
                  <label htmlFor="f-email">Email</label>
                  <input id="f-email" type="email" name="email" required placeholder="jane@school.org" />
                  <ValidationError field="email" errors={state.errors} className="msg" />
                </div>
                <div className="field">
                  <label htmlFor="f-org">
                    Organization <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <input id="f-org" type="text" name="organization" placeholder="Oak Grove Elementary" />
                </div>
                <div className="field">
                  <label htmlFor="f-type">What are you planning?</label>
                  <select id="f-type" name="event_type" defaultValue="Keynote">
                    <option>Keynote</option>
                    <option>School visit</option>
                    <option>Author reading</option>
                    <option>Workshop</option>
                    <option>Virtual session</option>
                    <option>Something else</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="f-msg">About your event</label>
                  <textarea
                    id="f-msg"
                    name="message"
                    required
                    placeholder="Audience, date, location, what you're hoping for…"
                  />
                  <ValidationError field="message" errors={state.errors} className="msg" />
                </div>
                {state.errors && state.errors.length > 0 && !state.errors.some(e => e.field) && (
                  <p className="msg" style={{ marginBottom: '0.75rem' }}>
                    Something went wrong. Please try emailing directly at jacorydwiley@gmail.com.
                  </p>
                )}
                <button type="submit" className="btn btn-solid" disabled={state.submitting}>
                  {state.submitting ? 'Sending…' : <span>Send inquiry <span className="arr">&rarr;</span></span>}
                </button>
              </form>
            )}
          </div>
        </div>

        <footer className="foot">
          <div className="fmark">Jacory Wiley<span className="dot">.</span></div>
          <div className="fcopy">&copy; {new Date().getFullYear()} Jacory Wiley · Houston &rarr; Atlanta</div>
        </footer>
      </div>
    </section>
  );
}
