import React, { useState, useEffect, useRef } from 'react';
import { collection, doc, getDocs, setDoc, addDoc, deleteDoc, updateDoc, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const VIEWPORTS = {
  desktop: { w: 1440, h: 1000 },
  mobile: { w: 390, h: 950 },
};

const TOPICS = [
  ['01', 'Dream Past What You Can See', "A keynote on chasing a goal when the odds — or your own body — tell you no."],
  ['02', 'Different Isn\'t Less', "For students and young audiences: disability, identity, and quiet confidence."],
  ['03', 'Swing Anyway', "Resilience from the beep baseball diamond — show up, prepared and unafraid."],
];

function SpeakingSimulation({ url, mode }) {
  const { w, h } = VIEWPORTS[mode];
  const isDesktop = mode === 'desktop';

  const maxW = isDesktop
    ? Math.min(window.innerWidth * 0.85, 920)
    : Math.min(window.innerWidth * 0.45, 390);
  const maxH = window.innerHeight * 0.72;
  const scale = Math.min(maxW / w, maxH / h);
  const displayW = Math.round(w * scale);
  const displayH = Math.round(h * scale);

  const hPad = isDesktop ? 80 : 24;
  const sectionPadTop = isDesktop ? 130 : 96;
  const wrapW = w - hPad * 2;
  const gap = isDesktop ? 90 : 0;
  const colW = isDesktop ? (wrapW - gap) / 2 : wrapW;
  const imgH = colW * (5 / 4);

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
      <div style={{
        width: w, height: h,
        transform: `scale(${scale})`, transformOrigin: 'top left',
        background: '#16130f', overflow: 'hidden', position: 'relative',
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
        color: '#f4ede0',
      }}>

        {/* Fake nav */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isDesktop ? `28px ${hPad}px` : `20px ${hPad}px`,
        }}>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '0.24em', textTransform: 'uppercase' }}>
            JACORY<span style={{ color: '#d9a55b' }}>.</span>
          </span>
          {isDesktop && (
            <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
              {['Books', 'Speaking', 'About'].map((l) => (
                <span key={l} style={{ fontSize: 13, letterSpacing: '0.04em', color: 'rgba(244,237,224,0.65)' }}>{l}</span>
              ))}
            </div>
          )}
        </div>

        {/* Section */}
        <div style={{ paddingTop: sectionPadTop, paddingLeft: hPad, paddingRight: hPad }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>

            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 34 }}>
              <span style={{ fontWeight: 600, fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#d9a55b' }}>
                Speaking
              </span>
              <span style={{ fontSize: 11, letterSpacing: '0.2em', color: '#6b6256' }}>02</span>
              <div style={{ width: 60, height: 1, background: 'rgba(232,216,190,0.12)' }} />
            </div>

            {/* Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
              gap: gap,
              alignItems: 'center',
            }}>
              {/* Left: text */}
              <div>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 300,
                  fontSize: isDesktop ? 52 : 36,
                  lineHeight: 1.1,
                  margin: `0 0 ${28}px`,
                  letterSpacing: '-0.01em',
                  maxWidth: '14ch',
                }}>
                  Talks that help people{' '}
                  <em style={{ fontStyle: 'italic', color: '#d9a55b' }}>dream louder</em>.
                </h2>
                {isDesktop && (
                  <p style={{ color: '#d8cdba', fontSize: 17, lineHeight: 1.75, margin: `0 0 ${32}px`, maxWidth: '46ch' }}>
                    Jacory speaks to schools, teams, and organizations about achieving your dreams in the face of adversity.
                  </p>
                )}
                <ul style={{ listStyle: 'none', padding: 0, margin: `0 0 ${isDesktop ? 40 : 24}px` }}>
                  {TOPICS.map(([n, t, d]) => (
                    <li key={n} style={{ display: 'flex', gap: 18, padding: `${isDesktop ? 18 : 14}px 0`, borderTop: '1px solid rgba(232,216,190,0.12)' }}>
                      <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: isDesktop ? 22 : 18, color: '#d9a55b', minWidth: 40 }}>{n}</span>
                      <div>
                        <h5 style={{ fontWeight: 600, fontSize: isDesktop ? 16 : 13, margin: `0 0 4px`, color: '#f4ede0' }}>{t}</h5>
                        {isDesktop && <p style={{ margin: 0, fontSize: 14, color: '#9c9082', lineHeight: 1.55 }}>{d}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
                {isDesktop && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    padding: '14px 28px', borderRadius: 100,
                    background: '#d9a55b', color: '#1a1206',
                    fontWeight: 600, fontSize: 13, letterSpacing: '0.02em',
                  }}>
                    Book Jacory to speak →
                  </div>
                )}
              </div>

              {/* Right: image */}
              {(isDesktop || true) && (
                <div style={{ position: 'relative', width: colW, height: imgH, marginTop: isDesktop ? 0 : 32 }}>
                  <img
                    src={url}
                    alt=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {isDesktop && (
                    <div style={{
                      position: 'absolute', left: -34, bottom: 48,
                      background: '#1f1a14', border: '1px solid rgba(232,216,190,0.12)',
                      padding: '24px 28px', maxWidth: 230,
                      boxShadow: '0 30px 60px -24px rgba(0,0,0,0.7)',
                    }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: 36, color: '#d9a55b', lineHeight: 1, marginBottom: 8 }}>
                        Any age.
                      </div>
                      <div style={{ fontSize: 13, color: '#d8cdba', lineHeight: 1.5 }}>
                        From kindergarten classrooms to corporate keynotes — in person or virtual.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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

      <SpeakingSimulation url={img.url} mode={mode} />

      <p style={{ marginTop: 14, fontFamily: 'system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
        {img.url}
      </p>
    </div>
  );
}

export default function ManageSpeaking() {
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
    const snap = await getDocs(query(collection(db, 'speakingImages'), orderBy('addedAt', 'desc')));
    setImages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchActive = async () => {
    const snap = await getDoc(doc(db, 'config', 'speaking'));
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
      await addDoc(collection(db, 'speakingImages'), { url, altText: altInput.trim(), addedAt: Date.now() });
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
      await setDoc(doc(db, 'config', 'speaking'), { activeUrl: img.url, activeAlt: img.altText || '' });
      setActiveUrl(img.url);
      setStatus('Live image updated.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const deleteImage = async (img) => {
    if (!window.confirm('Remove this image?')) return;
    try {
      await deleteDoc(doc(db, 'speakingImages', img.id));
      if (activeUrl === img.url) {
        await setDoc(doc(db, 'config', 'speaking'), { activeUrl: '', activeAlt: '' });
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
      await updateDoc(doc(db, 'speakingImages', img.id), { url, altText: editAlt.trim() });
      if (activeUrl === img.url) {
        await setDoc(doc(db, 'config', 'speaking'), { activeUrl: url, activeAlt: editAlt.trim() });
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
      <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>Speaking Photo</h1>
      <p style={{ margin: '0 0 32px', fontSize: 13, color: '#777' }}>Add image URLs, preview them in context, and choose which one is live.</p>

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
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
                {/* Thumbnail — 4:5 to match the actual section ratio */}
                <div
                  onClick={() => setPreviewImg(img)}
                  style={{ position: 'relative', paddingTop: '125%', background: '#f0ede8', cursor: 'pointer' }}
                >
                  <img
                    src={img.url}
                    alt=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
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
                  <div
                    style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = 0; e.currentTarget.style.background = 'none'; }}
                  >
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em' }}>Preview</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteImage(img); }}
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.55)', border: 'none',
                      color: '#fff', fontSize: 11, cursor: 'pointer',
                      display: 'grid', placeItems: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ padding: '10px 12px' }}>
                  {editingId === img.id ? (
                    <>
                      <input
                        type="url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', border: '1px solid #d0cdc8', borderRadius: 5, fontSize: 12, marginBottom: 8, boxSizing: 'border-box', fontFamily: 'inherit' }}
                      />
                      <input
                        type="text" placeholder="Alt text…" value={editAlt} onChange={(e) => setEditAlt(e.target.value)}
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
