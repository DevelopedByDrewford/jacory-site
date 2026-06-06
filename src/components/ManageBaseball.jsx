import { useState, useEffect, useRef } from 'react';
import { collection, doc, getDocs, setDoc, addDoc, deleteDoc, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

/* ─── Viewport simulation ──────────────────────────────────────── */

const VIEWPORTS = {
  desktop: { w: 1440, h: 1000 },
  mobile:  { w: 390,  h: 900  },
};

function BaseballSimulation({ url, section, mode }) {
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
  const wrapW = w - hPad * 2;
  const gap = isDesktop ? 72 : 0;
  const colW = isDesktop ? (wrapW - gap) / 2 : wrapW;
  const imgH = colW * (3 / 4);

  const isChamp = section === 'champ';

  const textCol = (
    <div>
      <p style={{
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
        fontWeight: 600, fontSize: 11, letterSpacing: '0.28em',
        textTransform: 'uppercase', color: '#9c9082', margin: '0 0 14px',
      }}>
        {isChamp ? 'Championship' : 'Beep Baseball'}
      </p>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontWeight: 300, fontSize: isDesktop ? 42 : 28,
        lineHeight: 1.15, letterSpacing: '-0.01em',
        margin: `0 0 ${isDesktop ? 36 : 20}px`, color: '#f4ede0',
      }}>
        {isChamp
          ? <><em style={{ fontStyle: 'italic', color: '#d9a55b' }}>2022</em> — The year it all landed</>
          : <>The game that plays <em style={{ fontStyle: 'italic', color: '#d9a55b' }}>by sound</em></>
        }
      </h2>
      {isDesktop && (
        <>
          <p style={{ color: '#d8cdba', fontSize: 16, lineHeight: 1.75, margin: '0 0 18px', maxWidth: '50ch' }}>
            {isChamp
              ? "In 2022, Jacory's team took the field at the National Beep Baseball Association Championship."
              : <><strong style={{ color: '#f4ede0', fontWeight: 500 }}>Beep baseball</strong> is a full-contact sport designed for athletes who are blind or visually impaired.</>
            }
          </p>
          <p style={{ color: '#d8cdba', fontSize: 16, lineHeight: 1.75, margin: 0, maxWidth: '50ch' }}>
            {isChamp
              ? "He stopped waiting for permission to compete."
              : "Every swing is an act of pure faith — you can't see the pitch coming, only hear it."
            }
          </p>
        </>
      )}
    </div>
  );

  const imgCol = (
    <div style={{ width: isDesktop ? colW : wrapW, height: imgH, marginTop: isDesktop ? 0 : 28, overflow: 'hidden' }}>
      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  );

  return (
    <div style={{
      width: displayW, height: displayH,
      overflow: 'hidden', flexShrink: 0, borderRadius: 6,
      border: '1px solid rgba(232,216,190,0.14)',
      boxShadow: '0 40px 80px -24px rgba(0,0,0,0.8)',
    }}>
      <div style={{
        width: w, height: h,
        transform: `scale(${scale})`, transformOrigin: 'top left',
        background: '#100d0a', overflow: 'hidden', position: 'relative',
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif", color: '#f4ede0',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${isDesktop ? 28 : 20}px ${hPad}px`,
        }}>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '0.24em', textTransform: 'uppercase' }}>
            JACORY<span style={{ color: '#d9a55b' }}>.</span>
          </span>
          {isDesktop && (
            <div style={{ display: 'flex', gap: 36 }}>
              {['Books', 'Speaking', 'About', 'Baseball'].map((l) => (
                <span key={l} style={{ fontSize: 13, letterSpacing: '0.04em', color: l === 'Baseball' ? '#f4ede0' : 'rgba(244,237,224,0.65)' }}>{l}</span>
              ))}
            </div>
          )}
        </div>

        <div style={{ paddingTop: isDesktop ? 120 : 80, paddingLeft: hPad, paddingRight: hPad }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 50 }}>
              <span style={{ fontWeight: 600, fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#d9a55b' }}>Baseball</span>
              <span style={{ fontSize: 11, letterSpacing: '0.2em', color: '#6b6256' }}>04</span>
              <div style={{ width: 60, height: 1, background: 'rgba(232,216,190,0.12)' }} />
            </div>
            <div style={{
              display: isDesktop ? 'grid' : 'flex',
              gridTemplateColumns: '1fr 1fr',
              flexDirection: 'column',
              gap: isDesktop ? gap : 0,
              alignItems: 'center',
            }}>
              {isChamp ? <>{imgCol}{textCol}</> : <>{textCol}{imgCol}</>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ img, section, onClose }) {
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
        background: 'rgba(10,8,5,0.88)', backdropFilter: 'blur(10px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 960, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: 4 }}>
          {['desktop', 'mobile'].map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '6px 16px', borderRadius: 5, border: 'none', cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif', fontSize: 12, fontWeight: 600,
              background: mode === m ? '#fff' : 'none',
              color: mode === m ? '#1a1a1a' : '#888',
              transition: 'all 0.15s',
            }}>
              {m === 'desktop' ? '🖥 Desktop' : '📱 Mobile'}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
          color: '#aaa', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
          fontSize: 16, display: 'grid', placeItems: 'center',
        }}>✕</button>
      </div>
      <BaseballSimulation url={img.url} section={section} mode={mode} />
      <p style={{ marginTop: 14, fontFamily: 'system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
        {img.url}
      </p>
    </div>
  );
}

/* ─── Image section ─────────────────────────────────────────────── */

function ImageSection({ collectionName, configKey, sectionType }) {
  const [images, setImages] = useState([]);
  const [activeUrl, setActiveUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [status, setStatus] = useState('');
  const [previewImg, setPreviewImg] = useState(null);

  const fetchImages = async () => {
    const snap = await getDocs(query(collection(db, collectionName), orderBy('addedAt', 'desc')));
    setImages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchActive = async () => {
    const snap = await getDoc(doc(db, 'config', configKey));
    if (snap.exists()) setActiveUrl(snap.data().activeUrl || '');
  };

  useEffect(() => {
    fetchImages();
    fetchActive();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async () => {
    const url = urlInput.trim();
    if (!url) return;
    setStatus('');
    try {
      await addDoc(collection(db, collectionName), { url, addedAt: Date.now() });
      await fetchImages();
      setUrlInput('');
      setStatus('Image added.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const setLive = async (img) => {
    setStatus('');
    try {
      await setDoc(doc(db, 'config', configKey), { activeUrl: img.url });
      setActiveUrl(img.url);
      setStatus('Live image updated.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const deleteImage = async (img) => {
    if (!window.confirm('Remove this image?')) return;
    try {
      await deleteDoc(doc(db, collectionName, img.id));
      if (activeUrl === img.url) {
        await setDoc(doc(db, 'config', configKey), { activeUrl: '' });
        setActiveUrl('');
      }
      await fetchImages();
      setStatus('Removed.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 14 }}>Photo</div>

      <div style={{ marginBottom: 20, padding: '20px 24px', background: '#fff', border: '1px solid #e0ddd8', borderRadius: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 12, color: '#555', marginBottom: 10 }}>Add image URL</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="url" placeholder="https://…" value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #d0cdc8', borderRadius: 6, fontSize: 14, color: '#1a1a1a', background: '#fff', outline: 'none' }}
          />
          <button onClick={handleAdd} disabled={!urlInput.trim()} style={{
            padding: '8px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6,
            fontWeight: 600, fontSize: 13, cursor: urlInput.trim() ? 'pointer' : 'default', opacity: urlInput.trim() ? 1 : 0.4,
          }}>Add</button>
        </div>
      </div>

      {status && <p style={{ margin: '0 0 14px', fontSize: 13, color: status.startsWith('Error') ? '#c00' : '#2a7a2a' }}>{status}</p>}

      {images.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: 13 }}>No images added yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {images.map((img) => {
            const isLive = img.url === activeUrl;
            return (
              <div key={img.id} style={{
                background: '#fff', border: `1px solid ${isLive ? '#1a1a1a' : '#e0ddd8'}`,
                borderRadius: 8, overflow: 'hidden', boxShadow: isLive ? '0 0 0 1px #1a1a1a' : 'none',
              }}>
                <div onClick={() => setPreviewImg(img)} style={{ position: 'relative', paddingTop: '75%', background: '#f0ede8', cursor: 'pointer' }}>
                  <img src={img.url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isLive && (
                    <div style={{ position: 'absolute', top: 8, left: 8, background: '#1a1a1a', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4 }}>Live</div>
                  )}
                  <div
                    style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'all 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = 0; e.currentTarget.style.background = 'none'; }}
                  >
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em' }}>Preview</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteImage(img); }}
                    style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'grid', placeItems: 'center', lineHeight: 1 }}
                  >✕</button>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>{new Date(img.addedAt).toLocaleDateString()}</div>
                  <button onClick={() => setLive(img)} disabled={isLive} style={{
                    width: '100%', padding: '7px 0', background: isLive ? '#f0ede8' : '#1a1a1a',
                    color: isLive ? '#888' : '#fff', border: 'none', borderRadius: 5,
                    cursor: isLive ? 'default' : 'pointer', fontWeight: 600, fontSize: 12,
                  }}>
                    {isLive ? 'Live' : 'Set as live'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {previewImg && <PreviewModal img={previewImg} section={sectionType} onClose={() => setPreviewImg(null)} />}
    </div>
  );
}

/* ─── Text section ──────────────────────────────────────────────── */

function TextSection({ p1Placeholder, p2Placeholder, collectionName, configKey }) {
  const [drafts, setDrafts] = useState([]);
  const [activeDraftId, setActiveDraftId] = useState('');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [status, setStatus] = useState('');

  const fetchDrafts = async () => {
    const snap = await getDocs(query(collection(db, collectionName), orderBy('addedAt', 'desc')));
    setDrafts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchActive = async () => {
    const snap = await getDoc(doc(db, 'config', configKey));
    if (snap.exists()) setActiveDraftId(snap.data().activeDraftId || '');
  };

  useEffect(() => {
    fetchDrafts();
    fetchActive();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!p1.trim() && !p2.trim()) return;
    setStatus('');
    try {
      await addDoc(collection(db, collectionName), { p1: p1.trim(), p2: p2.trim(), addedAt: Date.now() });
      await fetchDrafts();
      setP1('');
      setP2('');
      setStatus('Draft saved.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const setLive = async (draft) => {
    setStatus('');
    try {
      await setDoc(doc(db, 'config', configKey), { activeDraftId: draft.id, p1: draft.p1, p2: draft.p2 });
      setActiveDraftId(draft.id);
      setStatus('Live text updated.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const deleteDraft = async (draft) => {
    if (!window.confirm('Delete this draft?')) return;
    try {
      await deleteDoc(doc(db, collectionName, draft.id));
      if (activeDraftId === draft.id) {
        await setDoc(doc(db, 'config', configKey), { activeDraftId: '', p1: '', p2: '' });
        setActiveDraftId('');
      }
      await fetchDrafts();
      setStatus('Deleted.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const canSave = p1.trim() || p2.trim();

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 14 }}>Text</div>

      <div style={{ marginBottom: 20, padding: '20px 24px', background: '#fff', border: '1px solid #e0ddd8', borderRadius: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 12, color: '#555', marginBottom: 14 }}>New draft</div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Paragraph 1</label>
          <textarea
            value={p1}
            onChange={(e) => setP1(e.target.value)}
            placeholder={p1Placeholder}
            rows={3}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0cdc8', borderRadius: 6, fontSize: 13, color: '#1a1a1a', background: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Paragraph 2</label>
          <textarea
            value={p2}
            onChange={(e) => setP2(e.target.value)}
            placeholder={p2Placeholder}
            rows={3}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0cdc8', borderRadius: 6, fontSize: 13, color: '#1a1a1a', background: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6 }}
          />
        </div>
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{ padding: '8px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: canSave ? 'pointer' : 'default', opacity: canSave ? 1 : 0.4 }}
        >
          Save draft
        </button>
      </div>

      {status && <p style={{ margin: '0 0 14px', fontSize: 13, color: status.startsWith('Error') ? '#c00' : '#2a7a2a' }}>{status}</p>}

      {drafts.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: 13 }}>No drafts saved yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {drafts.map((draft) => {
            const isLive = draft.id === activeDraftId;
            return (
              <div key={draft.id} style={{
                background: '#fff',
                border: `1px solid ${isLive ? '#1a1a1a' : '#e0ddd8'}`,
                borderRadius: 8, padding: '14px 16px',
                boxShadow: isLive ? '0 0 0 1px #1a1a1a' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {isLive && (
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff', background: '#1a1a1a', display: 'inline-block', padding: '2px 7px', borderRadius: 3, marginBottom: 8 }}>Live</div>
                    )}
                    <p style={{ margin: '0 0 6px', fontSize: 13, color: '#1a1a1a', lineHeight: 1.55 }}>{draft.p1}</p>
                    {draft.p2 && <p style={{ margin: 0, fontSize: 13, color: '#666', lineHeight: 1.55 }}>{draft.p2}</p>}
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>{new Date(draft.addedAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => setLive(draft)}
                      disabled={isLive}
                      style={{
                        padding: '6px 14px', fontSize: 12, fontWeight: 600,
                        background: isLive ? '#f0ede8' : '#1a1a1a',
                        color: isLive ? '#888' : '#fff',
                        border: 'none', borderRadius: 5,
                        cursor: isLive ? 'default' : 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isLive ? 'Live' : 'Set as live'}
                    </button>
                    <button
                      onClick={() => deleteDraft(draft)}
                      style={{ padding: '6px 10px', fontSize: 12, background: 'none', border: '1px solid #e0ddd8', color: '#888', borderRadius: 5, cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */

const divider = <div style={{ height: 1, background: '#e0ddd8', margin: '32px 0' }} />;

export default function ManageBaseball() {
  return (
    <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 14, color: '#1a1a1a' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>Baseball</h1>
      <p style={{ margin: '0 0 40px', fontSize: 13, color: '#777' }}>Manage photos and text for the Beep Baseball and Championship sections.</p>

      {/* ── Beep Baseball ── */}
      <h2 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 700, paddingBottom: 12, borderBottom: '1px solid #e0ddd8' }}>Beep Baseball</h2>

      <ImageSection
        collectionName="beepBaseballImages"
        configKey="beepBaseball"
        sectionType="beep"
      />

      {divider}

      <TextSection
        p1Placeholder="Beep baseball is a full-contact sport designed for athletes who are blind or visually impaired…"
        p2Placeholder="For Jacory, the diamond wasn't a consolation prize…"
        collectionName="beepBaseballDrafts"
        configKey="beepBaseballText"
      />

      <div style={{ height: 1, background: '#c8c4be', margin: '48px 0' }} />

      {/* ── Championship ── */}
      <h2 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 700, paddingBottom: 12, borderBottom: '1px solid #e0ddd8' }}>2022 Championship</h2>

      <ImageSection
        collectionName="championshipImages"
        configKey="championship"
        sectionType="champ"
      />

      {divider}

      <TextSection
        p1Placeholder="In 2022, Jacory's team took the field at the National Beep Baseball Association Championship…"
        p2Placeholder="It's the same year he started writing. The same year he stood in front of crowds…"
        collectionName="championshipDrafts"
        configKey="championshipText"
      />
    </main>
  );
}
