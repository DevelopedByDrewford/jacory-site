import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, setDoc, addDoc, deleteDoc, query, orderBy, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

function LinkRow({ row, onField, onSave, onDelete, saving, isDragging, isDragOver, dragHandlers }) {
  const canSave = row._dirty && row.ic.trim() && row.label.trim() && row.href.trim();
  const [focused, setFocused] = useState(null);

  const inputStyle = (name, extra = {}) => ({
    height: 36,
    padding: '0 10px',
    border: `1px solid ${focused === name ? '#999' : '#d8d5d0'}`,
    borderRadius: 6,
    fontSize: 13,
    color: '#1a1a1a',
    background: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
    ...extra,
  });

  return (
    <div
      {...dragHandlers}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px',
        background: '#fff',
        border: `1px solid ${isDragOver ? '#1a1a1a' : row._dirty ? '#c4bdb5' : '#e0ddd8'}`,
        borderRadius: 8,
        marginBottom: 6,
        opacity: isDragging ? 0.4 : 1,
        boxShadow: isDragOver ? '0 0 0 1px #1a1a1a' : 'none',
        transition: 'border-color 0.1s, opacity 0.12s',
      }}
    >
      {/* Drag handle */}
      <div style={{ cursor: row._new ? 'default' : 'grab', opacity: row._new ? 0.25 : 1, flexShrink: 0, display: 'flex', alignItems: 'flex-start', paddingTop: 10 }}>
        <svg width="10" height="14" viewBox="0 0 10 14">
          <circle cx="2" cy="2.5" r="1.3" fill="#c8c5c0" />
          <circle cx="8" cy="2.5" r="1.3" fill="#c8c5c0" />
          <circle cx="2" cy="7" r="1.3" fill="#c8c5c0" />
          <circle cx="8" cy="7" r="1.3" fill="#c8c5c0" />
          <circle cx="2" cy="11.5" r="1.3" fill="#c8c5c0" />
          <circle cx="8" cy="11.5" r="1.3" fill="#c8c5c0" />
        </svg>
      </div>

      <div className="contact-link-body">
        {/* Inputs */}
        <div className="contact-link-fields">
          <input
            value={row.ic}
            maxLength={2}
            onChange={(e) => onField('ic', e.target.value)}
            onFocus={() => setFocused('ic')}
            onBlur={() => setFocused(null)}
            placeholder="@"
            style={inputStyle('ic', { width: 48, textAlign: 'center', fontWeight: 600, fontSize: 14 })}
          />
          <span className="contact-link-counter" style={{
            fontSize: 10, flexShrink: 0, width: 20, textAlign: 'right', userSelect: 'none',
            color: row.ic.length === 2 ? '#1a1a1a' : '#ccc',
            fontWeight: row.ic.length === 2 ? 600 : 400,
          }}>
            {row.ic.length}/2
          </span>
          <input
            value={row.label}
            maxLength={20}
            onChange={(e) => onField('label', e.target.value)}
            onFocus={() => setFocused('label')}
            onBlur={() => setFocused(null)}
            placeholder="Label"
            className="contact-label-input"
            style={inputStyle('label', {})}
          />
          <span className="contact-link-counter" style={{
            fontSize: 10, flexShrink: 0, width: 28, textAlign: 'right', userSelect: 'none',
            color: row.label.length === 20 ? '#1a1a1a' : row.label.length > 15 ? '#b07700' : '#ccc',
            fontWeight: row.label.length === 20 ? 600 : 400,
          }}>
            {row.label.length}/20
          </span>
          <input
            value={row.href}
            type="url"
            onChange={(e) => onField('href', e.target.value)}
            onFocus={() => setFocused('href')}
            onBlur={() => setFocused(null)}
            placeholder="https://…"
            className="contact-href-input"
            style={inputStyle('href', {})}
          />
        </div>

        {/* Buttons */}
        <div className="contact-link-btns">
          <button
            onClick={onSave}
            disabled={!canSave || saving}
            style={{
              height: 36, padding: '0 16px', minWidth: 56,
              borderRadius: 6, border: 'none',
              background: canSave ? '#1a1a1a' : '#f0ede8',
              color: canSave ? '#fff' : '#c0bbb5',
              fontWeight: 600, fontSize: 12, letterSpacing: '0.01em',
              cursor: canSave && !saving ? 'pointer' : 'default',
              transition: 'background 0.15s, color 0.15s',
              fontFamily: 'inherit',
            }}
          >
            {saving ? '…' : row._new ? 'Add' : 'Save'}
          </button>
          <button
            onClick={onDelete}
            style={{
              width: 36, height: 36, flexShrink: 0,
              borderRadius: 6, border: '1px solid #e0ddd8',
              background: 'none', color: '#c8c5c0', fontSize: 13,
              cursor: 'pointer', display: 'grid', placeItems: 'center',
              transition: 'border-color 0.15s, color 0.15s, background 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ffa39e'; e.currentTarget.style.color = '#cf1322'; e.currentTarget.style.background = '#fff1f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e0ddd8'; e.currentTarget.style.color = '#c8c5c0'; e.currentTarget.style.background = 'none'; }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageContact() {
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState({});
  const [status, setStatus] = useState('');
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [orderSaving, setOrderSaving] = useState(false);

  const fetchLinks = async () => {
    const snap = await getDocs(query(collection(db, 'contactLinks'), orderBy('order')));
    setRows(snap.docs.map((d) => ({ _key: d.id, id: d.id, ...d.data(), _dirty: false, _new: false })));
  };

  useEffect(() => { fetchLinks(); }, []);

  const setField = (_key, field, value) => {
    setRows((prev) => prev.map((r) => r._key === _key ? { ...r, [field]: value, _dirty: true } : r));
  };

  const saveRow = async (row) => {
    setSaving((s) => ({ ...s, [row._key]: true }));
    setStatus('');
    try {
      const data = { ic: row.ic.trim(), label: row.label.trim(), href: row.href.trim(), order: row.order ?? rows.length - 1 };
      if (row._new) {
        const ref = await addDoc(collection(db, 'contactLinks'), data);
        setRows((prev) => prev.map((r) => r._key === row._key ? { ...r, id: ref.id, _key: ref.id, _new: false, _dirty: false } : r));
      } else {
        await setDoc(doc(db, 'contactLinks', row.id), data);
        setRows((prev) => prev.map((r) => r._key === row._key ? { ...r, _dirty: false } : r));
      }
      setStatus('Saved.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setSaving((s) => ({ ...s, [row._key]: false }));
    }
  };

  const deleteRow = async (row) => {
    if (row._new) { setRows((prev) => prev.filter((r) => r._key !== row._key)); return; }
    if (!window.confirm(`Delete "${row.label}"?`)) return;
    setStatus('');
    try {
      await deleteDoc(doc(db, 'contactLinks', row.id));
      setRows((prev) => prev.filter((r) => r._key !== row._key));
      setStatus('Deleted.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const addNew = () => {
    const tempKey = `_new_${Date.now()}`;
    setRows((prev) => [...prev, { _key: tempKey, id: null, ic: '', label: '', href: '', order: prev.length, _dirty: true, _new: true }]);
  };

  // Drag reorder (only for saved rows)
  const handleDragStart = (e, i) => { setDragIndex(i); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e, i) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (dragOverIndex !== i) setDragOverIndex(i); };
  const handleDragEnd = () => { setDragIndex(null); setDragOverIndex(null); };
  const handleDrop = async (e, i) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) { setDragIndex(null); setDragOverIndex(null); return; }
    const next = [...rows];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(i, 0, moved);
    const reordered = next.map((r, idx) => ({ ...r, order: idx }));
    setRows(reordered);
    setDragIndex(null); setDragOverIndex(null);

    // Persist order immediately (only for saved rows)
    const savedRows = reordered.filter((r) => !r._new);
    if (savedRows.length === 0) return;
    setOrderSaving(true);
    try {
      const batch = writeBatch(db);
      savedRows.forEach((r) => batch.update(doc(db, 'contactLinks', r.id), { order: r.order }));
      await batch.commit();
    } catch (err) {
      setStatus(`Error saving order: ${err.message}`);
    } finally {
      setOrderSaving(false);
    }
  };

  return (
    <main className="manage-main">
      <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>Contact Links</h1>
      <p style={{ margin: '0 0 32px', fontSize: 13, color: '#777' }}>
        Manage the links shown in the booking section. Drag to reorder.
      </p>

      {/* Column labels */}
      {rows.length > 0 && (
        <div className="contact-col-labels">
          <div style={{ width: 10, flexShrink: 0 }} />
          <div style={{ width: 48, fontSize: 11, fontWeight: 600, color: '#aaa', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Btn</div>
          <div style={{ width: 20 }} />
          <div style={{ width: 152, fontSize: 11, fontWeight: 600, color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Label</div>
          <div style={{ width: 28 }} />
          <div style={{ flex: 1, fontSize: 11, fontWeight: 600, color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Link</div>
        </div>
      )}

      {/* Rows */}
      <div
        onDragLeave={() => setDragOverIndex(null)}
        style={{ marginBottom: 8 }}
      >
        {rows.map((row, i) => (
          <LinkRow
            key={row._key}
            row={row}
            onField={(field, val) => setField(row._key, field, val)}
            onSave={() => saveRow(row)}
            onDelete={() => deleteRow(row)}
            saving={!!saving[row._key]}
            isDragging={dragIndex === i}
            isDragOver={dragOverIndex === i && dragIndex !== i}
            dragHandlers={row._new ? {} : {
              draggable: true,
              onDragStart: (e) => handleDragStart(e, i),
              onDragOver: (e) => handleDragOver(e, i),
              onDrop: (e) => handleDrop(e, i),
              onDragEnd: handleDragEnd,
            }}
          />
        ))}
      </div>

      <button
        onClick={addNew}
        style={{
          fontSize: 13, color: '#555', background: 'none',
          border: '1px dashed #ccc', borderRadius: 6,
          padding: '8px 16px', cursor: 'pointer', marginBottom: 24,
        }}
      >
        + Add link
      </button>

      {(status || orderSaving) && (
        <p style={{ margin: 0, fontSize: 13, color: orderSaving ? '#888' : status.startsWith('Error') ? '#c00' : '#2a7a2a' }}>
          {orderSaving ? 'Saving order…' : status}
        </p>
      )}
    </main>
  );
}
