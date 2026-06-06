import React, { useState, useEffect, useContext, useRef } from 'react';
import { collection, doc, setDoc, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { ManageBooksCtx } from './Manage';

const SECTION_PRESETS = {
  Physical: ['Amazon', 'Barnes & Noble', 'Bookshop.org', 'IndieBound', 'Hardcover', 'Paperback'],
  Digital: ['Kindle', 'Apple Books', 'Google Play Books', 'Nook'],
  Audio: ['Audible', 'Libro.fm', 'Apple Books Audio'],
};

const EMPTY_SECTIONS = [
  { label: 'Physical', icon: '📖', links: [] },
  { label: 'Digital', icon: '📱', links: [] },
  { label: 'Audio', icon: '🎧', links: [] },
];

const EMPTY_FORM = {
  title: '',
  cover: '',
  coverImage: '',
  desc: '',
  live: false,
  meta: '',
  order: '',
  purchaseSections: EMPTY_SECTIONS,
};

function toFormSections(purchaseSections) {
  return EMPTY_SECTIONS.map((s) => {
    const existing = (purchaseSections || []).find((p) => p.label === s.label);
    const links = (existing?.links || []).map((l) => ({
      name: l.name,
      href: l.href,
      isCustom: !(SECTION_PRESETS[s.label] || []).includes(l.name),
    }));
    return { ...s, links };
  });
}

function toFirestoreSections(purchaseSections) {
  return purchaseSections.map(({ label, icon, links }) => ({
    label,
    icon,
    links: links.map(({ name, href }) => ({ name, href })),
  }));
}

export default function ManageBooks() {
  const { books, fetchBooks, editingId, setEditingId } = useContext(ManageBooksCtx);
  const [orderList, setOrderList] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [orderSaving, setOrderSaving] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const formLoadedForRef = useRef(undefined);

  useEffect(() => {
    setOrderList([...books].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)));
  }, [books]);

  // Load form when selection changes. The ref prevents reloading when books
  // refresh after a save (editingId unchanged = no form reset).
  useEffect(() => {
    if (editingId === formLoadedForRef.current) return;
    if (editingId === null) {
      formLoadedForRef.current = null;
      setStatus('');
      setForm(EMPTY_FORM);
      return;
    }
    const book = books.find((b) => b.id === editingId);
    if (!book) return; // books not fetched yet — effect re-runs when they arrive
    formLoadedForRef.current = editingId;
    setStatus('');
    setForm({
      title: book.title || '',
      cover: book.cover || '',
      coverImage: book.coverImage || '',
      desc: book.desc || '',
      live: book.live || false,
      meta: book.meta || '',
      order: book.order ?? '',
      purchaseSections: toFormSections(book.purchaseSections),
    });
  }, [editingId, books]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const setLink = (si, li, key, value) => {
    setForm((f) => ({
      ...f,
      purchaseSections: f.purchaseSections.map((s, i) => {
        if (i !== si) return s;
        return {
          ...s,
          links: s.links.map((l, j) => {
            if (j !== li) return l;
            if (key === 'select') {
              return value === '__custom__'
                ? { ...l, isCustom: true, name: '' }
                : { ...l, isCustom: false, name: value };
            }
            return { ...l, [key]: value };
          }),
        };
      }),
    }));
  };

  const addLink = (si) =>
    setForm((f) => ({
      ...f,
      purchaseSections: f.purchaseSections.map((s, i) =>
        i !== si ? s : { ...s, links: [...s.links, { name: '', href: '', isCustom: false }] }
      ),
    }));

  const removeLink = (si, li) =>
    setForm((f) => ({
      ...f,
      purchaseSections: f.purchaseSections.map((s, i) =>
        i !== si ? s : { ...s, links: s.links.filter((_, j) => j !== li) }
      ),
    }));

  const handleDragStart = (e, i) => {
    setDragIndex(i);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, i) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== i) setDragOverIndex(i);
  };

  const handleDrop = (e, i) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setOrderList((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(i, 0, moved);
      return next;
    });
    setDragIndex(null);
    setDragOverIndex(null);
    setOrderStatus('');
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const saveOrder = async () => {
    setOrderSaving(true);
    setOrderStatus('');
    try {
      const batch = writeBatch(db);
      orderList.forEach((b, i) => batch.update(doc(db, 'books', b.id), { order: i, featured: i === 0 }));
      await batch.commit();
      await fetchBooks();
      setOrderStatus('Saved.');
    } catch (e) {
      setOrderStatus(`Error: ${e.message}`);
    } finally {
      setOrderSaving(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setStatus('');
    try {
      const data = {
        ...form,
        order: form.order === '' ? null : Number(form.order),
        purchaseSections: toFirestoreSections(form.purchaseSections),
      };
      if (editingId) {
        await setDoc(doc(db, 'books', editingId), data);
      } else {
        const ref = await addDoc(collection(db, 'books'), data);
        setEditingId(ref.id);
      }
      await fetchBooks();
      setStatus('Saved.');
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteBook = async () => {
    if (!editingId || !window.confirm(`Delete "${form.title}"?`)) return;
    await deleteDoc(doc(db, 'books', editingId));
    await fetchBooks();
    setEditingId(null);
    setStatus('Deleted.');
  };

  const pickerBtn = (active) => ({
    flexShrink: 0,
    padding: '6px 14px',
    borderRadius: 20,
    border: `1px solid ${active ? '#1a1a1a' : '#d0cdc8'}`,
    background: active ? '#1a1a1a' : '#fff',
    color: active ? '#fff' : '#555',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
  });

  return (
    <main className="manage-main" style={{ maxWidth: 800 }}>
      <div className="manage-books-picker">
        {books.map((b) => (
          <button key={b.id} onClick={() => setEditingId(b.id)} style={pickerBtn(editingId === b.id)}>
            {b.title || 'Untitled'}
          </button>
        ))}
        <button onClick={() => setEditingId(null)} style={pickerBtn(editingId === null)}>
          + New book
        </button>
      </div>

      <div style={{ marginBottom: 32, padding: '20px 20px 16px', background: '#fff', border: '1px solid #e0ddd8', borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>Display order</div>
          <div style={{ fontSize: 12, color: '#aaa' }}>Drag to reorder</div>
        </div>
        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#888' }}>Controls the order books appear in the grid on the site.</p>
        <div onDragLeave={() => setDragOverIndex(null)}>
          {orderList.map((b, i) => (
            <React.Fragment key={b.id}>
              {i === 0 && (
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#aaa', marginBottom: 6 }}>
                  Featured
                </div>
              )}
              {i === 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0 8px' }}>
                  <div style={{ flex: 1, height: 1, background: '#e8e5e0' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#aaa' }}>Grid</span>
                  <div style={{ flex: 1, height: 1, background: '#e8e5e0' }} />
                </div>
              )}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={(e) => handleDrop(e, i)}
                onDragEnd={handleDragEnd}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  marginBottom: 6,
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: dragOverIndex === i && dragIndex !== i ? '#1a1a1a' : '#e0ddd8',
                  background: dragIndex === i ? '#f8f7f5' : '#fff',
                  opacity: dragIndex === i ? 0.45 : 1,
                  cursor: 'grab',
                  userSelect: 'none',
                  transition: 'border-color 0.1s, opacity 0.12s',
                  boxShadow: dragOverIndex === i && dragIndex !== i ? '0 0 0 1px #1a1a1a' : 'none',
                }}
              >
                <svg width="10" height="14" viewBox="0 0 10 14" style={{ flexShrink: 0 }}>
                  <circle cx="2" cy="2.5" r="1.3" fill="#c8c5c0" />
                  <circle cx="8" cy="2.5" r="1.3" fill="#c8c5c0" />
                  <circle cx="2" cy="7" r="1.3" fill="#c8c5c0" />
                  <circle cx="8" cy="7" r="1.3" fill="#c8c5c0" />
                  <circle cx="2" cy="11.5" r="1.3" fill="#c8c5c0" />
                  <circle cx="8" cy="11.5" r="1.3" fill="#c8c5c0" />
                </svg>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>
                  {b.title || <em style={{ color: '#bbb', fontWeight: 400 }}>Untitled</em>}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14 }}>
          <button onClick={saveOrder} disabled={orderSaving} style={saveBtn}>
            {orderSaving ? 'Saving…' : 'Save order'}
          </button>
          {orderStatus && (
            <span style={{ color: orderStatus.startsWith('Error') ? '#c00' : '#2a7a2a', fontSize: 13 }}>{orderStatus}</span>
          )}
        </div>
      </div>

      <h1 style={{ margin: '0 0 32px', fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
        {editingId ? form.title || 'Edit book' : 'New book'}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: 16, marginBottom: 32 }}>
        <Field label="Title">
          <input value={form.title} onChange={(e) => setField('title', e.target.value)} />
        </Field>
        <Field label="Meta">
          <input value={form.meta} onChange={(e) => setField('meta', e.target.value)} placeholder="Picture book · Out now" />
        </Field>
        <Field label="Cover alt text">
          <input value={form.cover} onChange={(e) => setField('cover', e.target.value)} />
        </Field>
        <Field label="Cover image URL">
          <input value={form.coverImage} onChange={(e) => setField('coverImage', e.target.value)} placeholder="https://…" />
        </Field>
        <Field label="Description" style={{ gridColumn: '1 / -1' }}>
          <textarea value={form.desc} onChange={(e) => setField('desc', e.target.value)} rows={4} style={{ resize: 'vertical' }} />
        </Field>
        <Field label="">
          <label style={checkLabel}>
            <input type="checkbox" checked={form.live} onChange={(e) => setField('live', e.target.checked)} />
            Live (out now)
          </label>
        </Field>
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#1a1a1a' }}>Purchase sections</h2>
      {form.purchaseSections.map((section, si) => (
        <div key={section.label} style={{ marginBottom: 16, padding: 20, border: '1px solid #e0ddd8', borderRadius: 8, background: '#fff' }}>
          <div style={{ fontWeight: 600, marginBottom: 14, color: '#1a1a1a' }}>{section.icon} {section.label}</div>
          {section.links.map((link, li) => (
            <div key={li} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '0 0 min(180px, 100%)' }}>
                <select
                  value={link.isCustom ? '__custom__' : link.name}
                  onChange={(e) => setLink(si, li, 'select', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select…</option>
                  {SECTION_PRESETS[section.label].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="__custom__">Add new…</option>
                </select>
                {link.isCustom && (
                  <input
                    style={inputStyle}
                    placeholder="Custom name"
                    value={link.name}
                    onChange={(e) => setLink(si, li, 'name', e.target.value)}
                  />
                )}
              </div>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="https://…"
                value={link.href}
                onChange={(e) => setLink(si, li, 'href', e.target.value)}
              />
              <button onClick={() => removeLink(si, li)} style={removeBtn}>✕</button>
            </div>
          ))}
          <button onClick={() => addLink(si)} style={addLinkBtn}>+ Add link</button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}>
        <button onClick={save} disabled={saving} style={saveBtn}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        {editingId && (
          <button onClick={deleteBook} style={deleteBtn}>Delete</button>
        )}
        {status && (
          <span style={{ color: status.startsWith('Error') ? '#c00' : '#2a7a2a', fontSize: 13 }}>{status}</span>
        )}
      </div>
    </main>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={style}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#444' }}>{label}</label>}
      {React.cloneElement(children, {
        style: { ...inputStyle, width: '100%', boxSizing: 'border-box', ...children.props.style },
      })}
    </div>
  );
}

const inputStyle = {
  padding: '8px 10px',
  border: '1px solid #d0cdc8',
  borderRadius: 6,
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box',
  background: '#fff',
  color: '#1a1a1a',
};
const checkLabel = { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#1a1a1a' };
const removeBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 16, padding: '6px 4px', lineHeight: 1 };
const addLinkBtn = { fontSize: 13, color: '#555', background: 'none', border: '1px dashed #ccc', borderRadius: 4, padding: '5px 12px', cursor: 'pointer', marginTop: 4 };
const saveBtn = { padding: '10px 28px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 };
const deleteBtn = { padding: '10px 28px', background: 'none', color: '#c00', border: '1px solid #c00', borderRadius: 6, cursor: 'pointer', fontSize: 14 };
