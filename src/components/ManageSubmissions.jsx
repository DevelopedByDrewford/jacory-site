import React, { useState, useEffect, useCallback } from 'react';
import { collection, doc, getDoc, setDoc, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase';

const PAGE_SIZE = 20;

const EVENT_COLORS = {
  'Keynote':        { bg: '#eff6ff', color: '#1d4ed8' },
  'School visit':   { bg: '#f0fdf4', color: '#166534' },
  'Author reading': { bg: '#faf5ff', color: '#6b21a8' },
  'Workshop':       { bg: '#fff7ed', color: '#9a3412' },
  'Virtual session':{ bg: '#f0fdfa', color: '#0f766e' },
};

function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  );
}

function EventBadge({ type }) {
  if (!type) return null;
  const style = EVENT_COLORS[type] || { bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 9px', borderRadius: 100,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
      background: style.bg, color: style.color,
    }}>
      {type}
    </span>
  );
}

function SubmissionCard({ sub }) {
  const [expanded, setExpanded] = useState(false);
  const message = sub.message || '';
  const isLong = message.length > 220;
  const notified = sub.notifiedEmails || [];

  return (
    <div style={{ background: '#fff', border: '1px solid #e0ddd8', borderRadius: 8, padding: '18px 20px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', whiteSpace: 'nowrap' }}>
            {sub.name || <em style={{ color: '#bbb', fontWeight: 400 }}>No name</em>}
          </span>
          <EventBadge type={sub.event_type} />
        </div>
        <span style={{ fontSize: 12, color: '#aaa', whiteSpace: 'nowrap', flexShrink: 0, paddingTop: 1 }}>
          {formatDate(sub.submittedAt)}
        </span>
      </div>

      <div style={{ fontSize: 13, color: '#666', marginBottom: (message || notified.length) ? 12 : 0 }}>
        <a href={`mailto:${sub.email}`} style={{ color: '#555', textDecoration: 'none', fontWeight: 500 }}>
          {sub.email}
        </a>
        {sub.organization && <span style={{ color: '#aaa' }}> · {sub.organization}</span>}
      </div>

      {message && (
        <div style={{ borderTop: '1px solid #f0ede8', paddingTop: 12, marginBottom: notified.length ? 12 : 0 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#444', lineHeight: 1.65 }}>
            {expanded || !isLong ? message : message.slice(0, 220) + '…'}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded((e) => !e)}
              style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#888', padding: 0, fontFamily: 'inherit' }}
            >
              {expanded ? 'Show less ↑' : 'Show more ↓'}
            </button>
          )}
        </div>
      )}

      {notified.length > 0 && (
        <div style={{ fontSize: 11, color: '#bbb', borderTop: message ? '1px solid #f5f3f0' : 'none', paddingTop: message ? 10 : 0 }}>
          Notified: {notified.join(', ')}
        </div>
      )}
    </div>
  );
}

function NotificationSettings() {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'config', 'submissionSettings'))
      .then((snap) => { if (snap.exists()) setEmails(snap.data().notifyEmails || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addEmail = () => {
    const trimmed = newEmail.trim();
    if (!trimmed || emails.includes(trimmed)) return;
    setEmails((prev) => [...prev, trimmed]);
    setNewEmail('');
  };

  const removeEmail = (email) => setEmails((prev) => prev.filter((e) => e !== email));

  const save = async () => {
    setSaving(true);
    setStatus('');
    try {
      await setDoc(doc(db, 'config', 'submissionSettings'), { notifyEmails: emails }, { merge: true });
      setStatus('Saved.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div style={{ marginBottom: 32, padding: '18px 20px', background: '#fff', border: '1px solid #e0ddd8', borderRadius: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginBottom: 10 }}>
        Notification emails
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {emails.map((email) => (
          <span key={email} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#f0ede8', borderRadius: 4, padding: '4px 8px 4px 10px', color: '#555' }}>
            {email}
            <button
              onClick={() => removeEmail(email)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: 0, fontSize: 11, lineHeight: 1, display: 'flex', alignItems: 'center' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#c00'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#bbb'; }}
            >
              ✕
            </button>
          </span>
        ))}
        {emails.length === 0 && <span style={{ fontSize: 12, color: '#ccc' }}>No emails configured — submissions will not be emailed.</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEmail(); } }}
          placeholder="notify@example.com"
          style={{ height: 32, padding: '0 10px', border: '1px solid #d8d5d0', borderRadius: 6, fontSize: 13, color: '#1a1a1a', background: '#fff', outline: 'none', fontFamily: 'inherit', flex: 1, maxWidth: 260 }}
        />
        <button
          onClick={addEmail}
          style={{ height: 32, padding: '0 14px', background: '#f0ede8', border: '1px solid #d8d5d0', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#444', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          + Add
        </button>
        <button
          onClick={save}
          disabled={saving}
          style={{ height: 32, padding: '0 16px', background: '#1a1a1a', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#fff', cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {status && (
          <span style={{ fontSize: 12, color: status.startsWith('Error') ? '#c00' : '#2a7a2a' }}>{status}</span>
        )}
      </div>
      <p style={{ margin: '10px 0 0', fontSize: 11, color: '#ccc', lineHeight: 1.5 }}>
        New submissions will be emailed here via the Netlify function. Requires GMAIL_USER and GMAIL_APP_PASSWORD set in Netlify environment variables.
      </p>
    </div>
  );
}

export default function ManageSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchPage = useCallback(async (after = null) => {
    try {
      let q = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'), limit(PAGE_SIZE));
      if (after) {
        q = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'), startAfter(after), limit(PAGE_SIZE));
      }
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSubmissions((prev) => (after ? [...prev, ...docs] : docs));
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      setError(`Failed to load submissions: ${err.message}`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  return (
    <main className="manage-main">
      <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700 }}>Submissions</h1>
      <p style={{ margin: '0 0 28px', fontSize: 13, color: '#777' }}>
        Booking inquiries submitted through the contact form.
      </p>

      <NotificationSettings />

      {loading && <p style={{ color: '#aaa', fontSize: 13 }}>Loading…</p>}

      {error && (
        <div style={{ padding: '16px 20px', background: '#fff8f8', border: '1px solid #ffd0cc', borderRadius: 8, fontSize: 13, color: '#c00', lineHeight: 1.6 }}>
          {error}
        </div>
      )}

      {!loading && !error && submissions.length === 0 && (
        <p style={{ color: '#aaa', fontSize: 13 }}>No submissions yet.</p>
      )}

      {submissions.map((sub) => (
        <SubmissionCard key={sub.id} sub={sub} />
      ))}

      {hasMore && (
        <button
          onClick={() => { setLoadingMore(true); fetchPage(lastDoc); }}
          disabled={loadingMore}
          style={{ marginTop: 8, padding: '10px 24px', background: '#fff', border: '1px solid #d8d5d0', borderRadius: 7, fontSize: 13, fontWeight: 600, color: '#444', cursor: loadingMore ? 'default' : 'pointer', fontFamily: 'inherit' }}
        >
          {loadingMore ? 'Loading…' : 'Load more'}
        </button>
      )}
    </main>
  );
}
