import { useState, useEffect } from 'react';
import { collection, doc, getDocs, getDoc, query, orderBy, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const FALLBACK_LINKS = [
  { ic: '@', label: 'Email', href: 'mailto:jacorydwiley@gmail.com' },
  { ic: 'fb', label: 'Facebook', href: 'https://www.facebook.com/jacory.wiley1' },
  { ic: 'ig', label: 'Instagram', href: 'https://www.instagram.com/mrdynamo21/' },
  { ic: 'in', label: 'LinkedIn', href: 'https://www.linkedin.com/in/jacory-wiley-99aa12107/' },
  { ic: '$', label: 'Cash App', href: 'https://cash.app/$jacorywiley' },
];

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', organization: '', event_type: 'Keynote', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState('');
  const [contactLinks, setContactLinks] = useState(FALLBACK_LINKS);
  const [notifyEmails, setNotifyEmails] = useState([]);

  useEffect(() => {
    getDocs(query(collection(db, 'contactLinks'), orderBy('order')))
      .then((snap) => { if (!snap.empty) setContactLinks(snap.docs.map((d) => d.data())); })
      .catch(() => {});
    getDoc(doc(db, 'config', 'submissionSettings'))
      .then((snap) => { if (snap.exists()) setNotifyEmails(snap.data().notifyEmails || []); })
      .catch(() => {});
  }, []);

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const docRef = await addDoc(collection(db, 'submissions'), {
        ...form,
        submittedAt: serverTimestamp(),
        notifiedEmails: [],
      });

      if (notifyEmails.length > 0) {
        let sent = [];
        try {
          const res = await fetch('/.netlify/functions/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: notifyEmails, submission: form }),
          });
          if (res.ok) sent = (await res.json()).sent || [];
        } catch {
          // Email notification failed silently — submission already saved
        }
        await updateDoc(docRef, { notifiedEmails: sent });
      }

      setSucceeded(true);
    } catch {
      setError('Something went wrong. Please email jacorydwiley@gmail.com directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="booking" id="booking">
      <div className="wrap">
        <div className="book-grid2">
          <div className="bk-pitch">
            <div className="section-eyebrow reveal">
              <span className="eyebrow">Work with Jacory</span>
              <span className="num">05</span>
              <span className="ln" />
            </div>
            <h2 className="reveal d1">Let&rsquo;s put your audience in the <em>batter&rsquo;s box</em>.</h2>
            <p className="reveal d2">
              Booking a school visit, a keynote, an author reading, or a virtual session? Send a few details
              and Jacory will get back to you personally.
            </p>
            <div className="bk-contact reveal d3">
              {contactLinks.map(({ ic, label, href }) =>
                href ? (
                  <a key={label} href={href} target='_blank' rel="noreferrer"><span className="ic">{ic}</span> {label}</a>
                ) : (
                  <button key={label} type="button" className="bk-contact-btn"><span className="ic">{ic}</span> {label}</button>
                )
              )}
            </div>
          </div>

          <div className="bk-form reveal d2">
            {succeeded ? (
              <div className="form-ok">
                <div className="ck">✓</div>
                <h3>Thank you, {form.name.split(' ')[0] || 'friend'}.</h3>
                <p>Your message is on its way. Jacory reads every note himself and will be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3>Send a booking inquiry</h3>
                <div className="field">
                  <label htmlFor="f-name">Your name</label>
                  <input
                    id="f-name"
                    type="text"
                    required
                    placeholder="Jane Rivera"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="f-email">Email</label>
                  <input
                    id="f-email"
                    type="email"
                    required
                    placeholder="jane@school.org"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="f-org">
                    Organization <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <input
                    id="f-org"
                    type="text"
                    placeholder="Oak Grove Elementary"
                    value={form.organization}
                    onChange={(e) => setField('organization', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="f-type">What are you planning?</label>
                  <select
                    id="f-type"
                    value={form.event_type}
                    onChange={(e) => setField('event_type', e.target.value)}
                  >
                    <option>Keynote</option>
                    <option>School visit</option>
                    <option>Author reading</option>
                    <option>Workshop</option>
                    <option>Virtual session</option>
                    <option>Interview</option>
                    <option>Something else</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="f-msg">About your event</label>
                  <textarea
                    id="f-msg"
                    required
                    placeholder="Audience, date, location, what you're hoping for…"
                    value={form.message}
                    onChange={(e) => setField('message', e.target.value)}
                  />
                </div>
                {error && (
                  <p className="msg" style={{ marginBottom: '0.75rem' }}>{error}</p>
                )}
                <button type="submit" className="btn btn-solid" disabled={submitting}>
                  {submitting ? 'Sending…' : <span>Send inquiry <span className="arr">&rarr;</span></span>}
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
