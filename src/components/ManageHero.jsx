import React, { useState, useEffect, useRef } from 'react';
import { collection, doc, getDocs, setDoc, addDoc, deleteDoc, updateDoc, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const VIEWPORTS = {
  desktop: { w: 1440, h: 810 },
  mobile: { w: 390, h: 844 },
};

function HeroSimulation({ url, mode }) {
  const { w, h } = VIEWPORTS[mode];
  const isDesktop = mode === 'desktop';

  const maxW = isDesktop
    ? Math.min(window.innerWidth * 0.85, 900)
    : Math.min(window.innerWidth * 0.45, 380);
  const maxH = window.innerHeight * 0.72;
  const scale = Math.min(maxW / w, maxH / h);
  const displayW = Math.round(w * scale);
  const displayH = Math.round(h * scale);

  const fontSize = {
    quote: `${(isDesktop ? 5.2 : 2.8) * scale * (w / (isDesktop ? w : w))}rem`,
    eyebrow: `${0.72 * scale * (w / (isDesktop ? w : w))}rem`,
    attr: `${0.8 * scale * (w / (isDesktop ? w : w))}rem`,
    navMark: `${1 * scale}rem`,
    navLink: `${0.84 * scale}rem`,
  };

  return (
    <div style={{
      width: displayW,
      height: displayH,
      overflow: 'hidden',
      flexShrink: 0,
      borderRadius: 6,
      border: '1px solid rgba(232,216,190,0.14)',
      boxShadow: '0 40px 80px -24px rgba(0,0,0,0.8)',
      position: 'relative',
    }}>
      <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative', overflow: 'hidden', background: '#16130f' }}>

        {/* Fake nav */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isDesktop ? '28px 48px' : '20px 24px',
        }}>
          <span style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontWeight: 700, fontSize: fontSize.navMark, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#f4ede0' }}>
            JACORY<span style={{ color: '#d9a55b' }}>.</span>
          </span>
          {isDesktop && (
            <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
              {['Books', 'Speaking', 'About', 'Contact'].map((l) => (
                <span key={l} style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontWeight: 500, fontSize: fontSize.navLink, letterSpacing: '0.04em', color: 'rgba(244,237,224,0.7)' }}>{l}</span>
              ))}
              <span style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontWeight: 600, fontSize: `${0.82 * scale}rem`, color: '#f4ede0', border: '1px solid rgba(232,216,190,0.25)', padding: `${11 * scale}px ${22 * scale}px`, borderRadius: 100 }}>
                Book a talk
              </span>
            </div>
          )}
        </div>

        {/* Hero image */}
        <div style={{ position: 'absolute', inset: '-8% 0 0 0', height: '116%' }}>
          <img
            src={url}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Veil */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(75% 75% at 50% 45%, rgba(16,13,10,0.42) 0%, rgba(16,13,10,0.86) 100%), linear-gradient(to bottom, rgba(16,13,10,0.5) 0%, transparent 30%, transparent 60%, rgba(16,13,10,0.96) 100%)',
        }} />

        {/* Hero inner */}
        <div style={{
          position: 'relative', zIndex: 3, height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '0 8%',
        }}>
          <p style={{
            fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontWeight: 600,
            fontSize: fontSize.eyebrow, letterSpacing: '0.32em', textTransform: 'uppercase',
            color: '#d9a55b', margin: `0 0 ${42 * scale}px`,
          }}>
            The story of Jacory Wiley
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, color: '#f4ede0',
            fontSize: isDesktop ? `${5.2 * scale}rem` : `${2.8 * scale}rem`,
            lineHeight: 1.06, letterSpacing: '-0.01em', margin: 0, maxWidth: '16ch',
          }}>
            "I can't see it. So I learned to{' '}
            <em style={{ fontStyle: 'italic', color: '#d9a55b' }}>imagine</em> it."
          </h1>
          <p style={{
            margin: `${44 * scale}px 0 0`,
            fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontWeight: 500,
            fontSize: fontSize.attr, letterSpacing: '0.26em', textTransform: 'uppercase', color: '#9c9082',
          }}>
            Author · Speaker · Beep&nbsp;Baseball
          </p>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: 'absolute', bottom: 36 * scale, left: '50%', transform: 'translateX(-50%)', zIndex: 4,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale,
          fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
          fontSize: `${0.6 * scale}rem`, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9c9082',
        }}>
          <span>Begin</span>
          <div style={{ width: 1, height: 42 * scale, background: 'linear-gradient(#d9a55b, transparent)' }} />
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ img, onClose }) {
  const [mode, setMode] = useState('desktop');
  const backdropRef = useRef();

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,8,5,0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Controls bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: 960, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: 4 }}>
          {['desktop', 'mobile'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '6px 16px', borderRadius: 5, border: 'none', cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif', fontSize: 12, fontWeight: 600,
                letterSpacing: '0.04em', textTransform: 'capitalize',
                background: mode === m ? '#fff' : 'none',
                color: mode === m ? '#1a1a1a' : '#888',
                transition: 'all 0.15s',
              }}
            >
              {m === 'desktop' ? '🖥 Desktop' : '📱 Mobile'}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#aaa', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
            fontSize: 16, display: 'grid', placeItems: 'center',
          }}
        >
          ✕
        </button>
      </div>

      {/* Preview */}
      <HeroSimulation url={img.url} mode={mode} />

      <p style={{ marginTop: 14, fontFamily: 'system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
        {img.url}
      </p>
    </div>
  );
}

export default function ManageHero() {
  const [images, setImages] = useState([]);
  const [activeUrl, setActiveUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [altInput, setAltInput] = useState('');
  const [status, setStatus] = useState('');
  const [previewImg, setPreviewImg] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editUrl, setEditUrl] = useState('');
  const [editAlt, setEditAlt] = useState('');

  const fetchImages = async () => {
    const snap = await getDocs(query(collection(db, 'heroImages'), orderBy('addedAt', 'desc')));
    setImages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchActive = async () => {
    const snap = await getDoc(doc(db, 'config', 'hero'));
    if (snap.exists()) setActiveUrl(snap.data().activeUrl || '');
  };

  useEffect(() => {
    fetchImages();
    fetchActive();
  }, []);

  const handleAdd = async () => {
    const url = urlInput.trim();
    if (!url) return;
    setStatus('');
    try {
      await addDoc(collection(db, 'heroImages'), { url, altText: altInput.trim(), addedAt: Date.now() });
      await fetchImages();
      setUrlInput('');
      setAltInput('');
      setStatus('Image added.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const setLive = async (img) => {
    setStatus('');
    try {
      await setDoc(doc(db, 'config', 'hero'), { activeUrl: img.url, activeAlt: img.altText || '' });
      setActiveUrl(img.url);
      setStatus('Live image updated.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const deleteImage = async (img) => {
    if (!window.confirm('Remove this image?')) return;
    try {
      await deleteDoc(doc(db, 'heroImages', img.id));
      if (activeUrl === img.url) {
        await setDoc(doc(db, 'config', 'hero'), { activeUrl: '', activeAlt: '' });
        setActiveUrl('');
      }
      await fetchImages();
      setStatus('Removed.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const startEdit = (img) => { setEditingId(img.id); setEditUrl(img.url); setEditAlt(img.altText || ''); };

  const handleEditSave = async (img) => {
    const url = editUrl.trim();
    if (!url) return;
    try {
      await updateDoc(doc(db, 'heroImages', img.id), { url, altText: editAlt.trim() });
      if (activeUrl === img.url) {
        await setDoc(doc(db, 'config', 'hero'), { activeUrl: url, activeAlt: editAlt.trim() });
        setActiveUrl(url);
      }
      await fetchImages();
      setEditingId(null);
      setStatus('Image updated.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <main className="manage-main">
      <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>Hero Background</h1>
      <p style={{ margin: '0 0 32px', fontSize: 13, color: '#777' }}>Add image URLs, preview them in context, and choose which one is live.</p>

      {/* Add URL */}
      <div style={{ marginBottom: 32, padding: '20px 24px', background: '#fff', border: '1px solid #e0ddd8', borderRadius: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Add image URL</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <input
            type="url"
            placeholder="https://…"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #d0cdc8', borderRadius: 6, fontSize: 14, color: '#1a1a1a', background: '#fff', outline: 'none' }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Alt text</label>
          <input
            type="text"
            placeholder="Describe the image for screen readers…"
            value={altInput}
            onChange={(e) => setAltInput(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0cdc8', borderRadius: 6, fontSize: 13, color: '#1a1a1a', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!urlInput.trim()}
          style={{ padding: '8px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: urlInput.trim() ? 'pointer' : 'default', opacity: urlInput.trim() ? 1 : 0.4 }}
        >
          Add
        </button>
      </div>

      {status && (
        <p style={{ margin: '0 0 20px', fontSize: 13, color: status.startsWith('Error') ? '#c00' : '#2a7a2a' }}>{status}</p>
      )}

      {images.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: 13 }}>No images added yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {images.map((img) => {
            const isLive = img.url === activeUrl;
            return (
              <div
                key={img.id}
                style={{
                  background: '#fff',
                  border: `1px solid ${isLive ? '#1a1a1a' : '#e0ddd8'}`,
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: isLive ? '0 0 0 1px #1a1a1a' : 'none',
                }}
              >
                {/* Thumbnail */}
                <div
                  onClick={() => setPreviewImg(img)}
                  style={{ position: 'relative', paddingTop: '56.25%', background: '#f0ede8', cursor: 'pointer' }}
                >
                  <img
                    src={img.url}
                    alt=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Live badge */}
                  {isLive && (
                    <div style={{
                      position: 'absolute', top: 8, left: 8,
                      background: '#1a1a1a', color: '#fff',
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      padding: '3px 8px', borderRadius: 4,
                    }}>
                      Live
                    </div>
                  )}

                  {/* Preview hint */}
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0)', transition: 'background 0.15s',
                    opacity: 0,
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = 1;
                      e.currentTarget.style.background = 'rgba(0,0,0,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = 0;
                      e.currentTarget.style.background = 'rgba(0,0,0,0)';
                    }}
                  >
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em' }}>Preview</span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteImage(img); }}
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.55)', border: 'none',
                      color: '#fff', fontSize: 11, cursor: 'pointer',
                      display: 'grid', placeItems: 'center', lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Card footer */}
                <div style={{ padding: '10px 12px' }}>
                  {editingId === img.id ? (
                    <>
                      <input
                        type="url"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', border: '1px solid #d0cdc8', borderRadius: 5, fontSize: 12, marginBottom: 8, boxSizing: 'border-box', fontFamily: 'inherit' }}
                      />
                      <input
                        type="text"
                        placeholder="Alt text…"
                        value={editAlt}
                        onChange={(e) => setEditAlt(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', border: '1px solid #d0cdc8', borderRadius: 5, fontSize: 12, marginBottom: 8, boxSizing: 'border-box', fontFamily: 'inherit' }}
                      />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleEditSave(img)} style={{ flex: 1, padding: '6px 0', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 5, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: '6px 0', background: 'none', border: '1px solid #e0ddd8', color: '#888', borderRadius: 5, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>
                        {new Date(img.addedAt).toLocaleDateString()}
                      </div>
                      {img.altText ? (
                        <div style={{ fontSize: 11, color: '#777', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={img.altText}>{img.altText}</div>
                      ) : (
                        <div style={{ fontSize: 11, color: '#bbb', fontStyle: 'italic', marginBottom: 8 }}>No alt text</div>
                      )}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => setLive(img)}
                          disabled={isLive}
                          style={{
                            flex: 1, padding: '7px 0',
                            background: isLive ? '#f0ede8' : '#1a1a1a',
                            color: isLive ? '#888' : '#fff',
                            border: 'none', borderRadius: 5,
                            cursor: isLive ? 'default' : 'pointer',
                            fontWeight: 600, fontSize: 12,
                          }}
                        >
                          {isLive ? 'Live' : 'Set as live'}
                        </button>
                        <button onClick={() => startEdit(img)} style={{ padding: '7px 10px', background: 'none', border: '1px solid #e0ddd8', color: '#888', borderRadius: 5, fontSize: 12, cursor: 'pointer' }}>Edit</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {previewImg && <PreviewModal img={previewImg} onClose={() => setPreviewImg(null)} />}
    </main>
  );
}
