import { useState, useEffect } from 'react';
import { collection, doc, getDocs, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

/* ── Shared style helpers ───────────────────────────────────────── */
const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid #d0cdc8',
  borderRadius: 6, fontSize: 13, color: '#1a1a1a', background: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
};

const textareaStyle = { ...inputStyle, resize: 'vertical', lineHeight: 1.6 };

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  color: '#888', marginBottom: 6,
};

const addBtn = (enabled) => ({
  padding: '8px 20px', background: '#1a1a1a', color: '#fff',
  border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13,
  cursor: enabled ? 'pointer' : 'default', opacity: enabled ? 1 : 0.4,
});

const deleteBtn = {
  padding: '6px 12px', fontSize: 12, background: 'none',
  border: '1px solid #e0ddd8', color: '#888', borderRadius: 5,
  cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
};

/* ── Media appearances ──────────────────────────────────────────── */
function MediaSection() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '', link: '' });

  const fetchItems = async () => {
    const snap = await getDocs(query(collection(db, 'mediaAppearances'), orderBy('addedAt', 'desc')));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchItems(); }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setStatus('');
    try {
      await addDoc(collection(db, 'mediaAppearances'), {
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        link: form.link.trim(),
        addedAt: Date.now(),
      });
      await fetchItems();
      setForm({ title: '', description: '', imageUrl: '', link: '' });
      setStatus('Appearance added.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this media appearance?')) return;
    try {
      await deleteDoc(doc(db, 'mediaAppearances', item.id));
      await fetchItems();
      setStatus('Deleted.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <section style={{ marginBottom: 52 }}>
      <h2 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>Media Appearances</h2>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: '#777' }}>Press, interviews, and features shown in a carousel. Displayed newest first.</p>

      <div style={{ marginBottom: 24, padding: '20px 24px', background: '#fff', border: '1px solid #e0ddd8', borderRadius: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 16 }}>Add appearance</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input type="text" placeholder="Interview with NPR…" value={form.title} onChange={set('title')} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Link</label>
            <input type="url" placeholder="https://…" value={form.link} onChange={set('link')} style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Image URL</label>
          <input type="url" placeholder="https://…" value={form.imageUrl} onChange={set('imageUrl')} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Description</label>
          <textarea placeholder="A brief description of the appearance…" value={form.description} onChange={set('description')} rows={2} style={textareaStyle} />
        </div>
        <button onClick={handleAdd} disabled={!form.title.trim()} style={addBtn(!!form.title.trim())}>Add</button>
      </div>

      {status && <p style={{ margin: '0 0 14px', fontSize: 13, color: status.startsWith('Error') ? '#c00' : '#2a7a2a' }}>{status}</p>}

      {items.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: 13 }}>No media appearances added yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item) => (
            <div key={item.id} style={{ background: '#fff', border: '1px solid #e0ddd8', borderRadius: 8, overflow: 'hidden', display: 'flex' }}>
              {item.imageUrl && (
                <div style={{ width: 96, flexShrink: 0, background: '#f0ede8' }}>
                  <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              )}
              <div style={{ flex: 1, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 16, minWidth: 0 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a', marginBottom: 4 }}>{item.title}</div>
                  {item.description && <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5, marginBottom: 4 }}>{item.description}</div>}
                  {item.link && <div style={{ fontSize: 11, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.link}</div>}
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>{new Date(item.addedAt).toLocaleDateString()}</div>
                </div>
                <button onClick={() => handleDelete(item)} style={deleteBtn}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Testimonials ───────────────────────────────────────────────── */
function TestimonialsSection() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ name: '', role: '', quote: '', img1: '', img2: '', img3: '' });

  const fetchItems = async () => {
    const snap = await getDocs(query(collection(db, 'testimonials'), orderBy('addedAt', 'asc')));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchItems(); }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAdd = async () => {
    if (!form.name.trim() || !form.quote.trim()) return;
    setStatus('');
    try {
      const images = [form.img1, form.img2, form.img3].map((s) => s.trim()).filter(Boolean);
      await addDoc(collection(db, 'testimonials'), {
        name: form.name.trim(),
        role: form.role.trim(),
        quote: form.quote.trim(),
        images,
        addedAt: Date.now(),
      });
      await fetchItems();
      setForm({ name: '', role: '', quote: '', img1: '', img2: '', img3: '' });
      setStatus('Testimonial added.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await deleteDoc(doc(db, 'testimonials', item.id));
      await fetchItems();
      setStatus('Deleted.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const canAdd = !!(form.name.trim() && form.quote.trim());

  return (
    <section>
      <h2 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>Testimonials</h2>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: '#777' }}>Quotes displayed in a card grid. Each card supports up to 3 photos that stack into a clickable pile.</p>

      <div style={{ marginBottom: 24, padding: '20px 24px', background: '#fff', border: '1px solid #e0ddd8', borderRadius: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 16 }}>Add testimonial</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Name *</label>
            <input type="text" placeholder="Jane Doe" value={form.name} onChange={set('name')} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Role / Context</label>
            <input type="text" placeholder="School Principal, Atlanta GA" value={form.role} onChange={set('role')} style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Quote *</label>
          <textarea placeholder="Jacory's talk moved every student in the room…" value={form.quote} onChange={set('quote')} rows={3} style={textareaStyle} />
        </div>
        <label style={{ ...labelStyle, marginBottom: 8 }}>Photos (up to 3)</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[['img1', 'Photo 1'], ['img2', 'Photo 2 (optional)'], ['img3', 'Photo 3 (optional)']].map(([key, lbl]) => (
            <div key={key}>
              <label style={{ ...labelStyle, color: '#b0aca8', fontSize: 10 }}>{lbl}</label>
              <input type="url" placeholder="https://…" value={form[key]} onChange={set(key)} style={inputStyle} />
            </div>
          ))}
        </div>
        <button onClick={handleAdd} disabled={!canAdd} style={addBtn(canAdd)}>Add</button>
      </div>

      {status && <p style={{ margin: '0 0 14px', fontSize: 13, color: status.startsWith('Error') ? '#c00' : '#2a7a2a' }}>{status}</p>}

      {items.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: 13 }}>No testimonials added yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item) => {
            const thumbs = (item.images || []).filter(Boolean);
            return (
              <div key={item.id} style={{ background: '#fff', border: '1px solid #e0ddd8', borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a', marginBottom: 2 }}>
                    {item.name}
                    {item.role && <span style={{ fontWeight: 400, color: '#888', fontSize: 12, marginLeft: 8 }}>{item.role}</span>}
                  </div>
                  <div style={{ fontSize: 13, color: '#555', lineHeight: 1.55, margin: '6px 0', fontStyle: 'italic' }}>"{item.quote}"</div>
                  {thumbs.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      {thumbs.map((url, i) => (
                        <img key={i} src={url} alt="" style={{ width: 34, height: 34, borderRadius: 4, objectFit: 'cover', border: '1px solid #e0ddd8' }} />
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>{new Date(item.addedAt).toLocaleDateString()}</div>
                </div>
                <button onClick={() => handleDelete(item)} style={deleteBtn}>Delete</button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function ManageSpotlight() {
  return (
    <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 14, color: '#1a1a1a' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>Spotlight</h1>
      <p style={{ margin: '0 0 40px', fontSize: 13, color: '#777' }}>Manage media appearances and testimonials for the Spotlight section.</p>

      <MediaSection />

      <div style={{ height: 1, background: '#c8c4be', margin: '0 0 48px' }} />

      <TestimonialsSection />
    </main>
  );
}
