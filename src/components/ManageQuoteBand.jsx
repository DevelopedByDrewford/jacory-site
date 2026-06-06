import React, { useState, useEffect, useRef } from 'react';
import { collection, doc, getDocs, setDoc, addDoc, deleteDoc, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const VIEWPORTS = {
  desktop: { w: 1440, h: 720 },
  mobile: { w: 390, h: 560 },
};

function QuoteBandSimulation({ url, mode }) {
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

  return (
    <div style={{
      width: displayW, height: displayH,
      overflow: 'hidden', flexShrink: 0,
      borderRadius: 6,
      border: '1px solid rgba(232,216,190,0.14)',
      boxShadow: '0 40px 80px -24px rgba(0,0,0,0.8)',
    }}>
      <div style={{
        width: w, height: h,
        transform: `scale(${scale})`, transformOrigin: 'top left',
        background: '#16130f', overflow: 'hidden', position: 'relative',
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
        color: '#f4ede0',
        display: 'flex', alignItems: 'center',
      }}>
        {/* Background image */}
        <div style={{ position: 'absolute', inset: '-12% 0', height: '124%' }}>
          <img
            src={url}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Diagonal veil — same as .band-veil */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, rgba(16,13,10,0.92) 0%, rgba(16,13,10,0.55) 55%, rgba(16,13,10,0.7) 100%)',
        }} />

        {/* Quote content */}
        <div style={{ position: 'relative', zIndex: 3, padding: `0 ${hPad}px`, maxWidth: 1280, width: '100%', margin: '0 auto' }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 300, fontStyle: 'italic',
            fontSize: isDesktop ? 54 : 30,
            lineHeight: 1.22,
            color: '#f4ede0',
            maxWidth: '20ch',
            margin: '0 0 28px',
          }}>
            <span style={{ color: '#d9a55b' }}>"</span>You don't need to see the pitch coming to be ready to swing.
            You just have to believe it's yours.<span style={{ color: '#d9a55b' }}>"</span>
          </p>
          <p style={{
            fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
            fontSize: isDesktop ? 12 : 10,
            letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9c9082',
            margin: 0,
          }}>
            Jacory Wiley
          </p>
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
        background: 'rgba(10,8,5,0.88)', backdropFilter: 'blur(10px)',
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
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '6px 16px', borderRadius: 5, border: 'none', cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif', fontSize: 12, fontWeight: 600,
              background: mode === m ? '#fff' : 'none',
              color: mode === m ? '#1a1a1a' : '#888',
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
      <QuoteBandSimulation url={img.url} mode={mode} />
      <p style={{ marginTop: 14, fontFamily: 'system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
        {img.url}
      </p>
    </div>
  );
}

export default function ManageQuoteBand() {
  const [images, setImages] = useState([]);
  const [activeUrl, setActiveUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [status, setStatus] = useState('');
  const [previewImg, setPreviewImg] = useState(null);

  const fetchImages = async () => {
    const snap = await getDocs(query(collection(db, 'quoteBandImages'), orderBy('addedAt', 'desc')));
    setImages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchActive = async () => {
    const snap = await getDoc(doc(db, 'config', 'quoteBand'));
    if (snap.exists()) setActiveUrl(snap.data().activeUrl || '');
  };

  useEffect(() => { fetchImages(); fetchActive(); }, []);

  const handleAdd = async () => {
    const url = urlInput.trim();
    if (!url) return;
    setStatus('');
    try {
      await addDoc(collection(db, 'quoteBandImages'), { url, addedAt: Date.now() });
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
      await setDoc(doc(db, 'config', 'quoteBand'), { activeUrl: img.url });
      setActiveUrl(img.url);
      setStatus('Live image updated.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const deleteImage = async (img) => {
    if (!window.confirm('Remove this image?')) return;
    try {
      await deleteDoc(doc(db, 'quoteBandImages', img.id));
      if (activeUrl === img.url) {
        await setDoc(doc(db, 'config', 'quoteBand'), { activeUrl: '' });
        setActiveUrl('');
      }
      await fetchImages();
      setStatus('Removed.');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 14, color: '#1a1a1a' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>Quote Band</h1>
      <p style={{ margin: '0 0 32px', fontSize: 13, color: '#777' }}>Add image URLs, preview them in context, and choose which one is live.</p>

      <div style={{ marginBottom: 32, padding: '20px 24px', background: '#fff', border: '1px solid #e0ddd8', borderRadius: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Add image URL</div>
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

      {status && <p style={{ margin: '0 0 20px', fontSize: 13, color: status.startsWith('Error') ? '#c00' : '#2a7a2a' }}>{status}</p>}

      {images.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: 13 }}>No images added yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {images.map((img) => {
            const isLive = img.url === activeUrl;
            return (
              <div key={img.id} style={{
                background: '#fff', borderRadius: 8, overflow: 'hidden',
                border: `1px solid ${isLive ? '#1a1a1a' : '#e0ddd8'}`,
                boxShadow: isLive ? '0 0 0 1px #1a1a1a' : 'none',
              }}>
                {/* 16:9 thumbnail — matches the wide cinematic ratio */}
                <div onClick={() => setPreviewImg(img)} style={{ position: 'relative', paddingTop: '56.25%', background: '#f0ede8', cursor: 'pointer' }}>
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
                    style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                  >✕</button>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>{new Date(img.addedAt).toLocaleDateString()}</div>
                  <button onClick={() => setLive(img)} disabled={isLive} style={{
                    width: '100%', padding: '7px 0',
                    background: isLive ? '#f0ede8' : '#1a1a1a',
                    color: isLive ? '#888' : '#fff',
                    border: 'none', borderRadius: 5,
                    cursor: isLive ? 'default' : 'pointer', fontWeight: 600, fontSize: 12,
                  }}>{isLive ? 'Live' : 'Set as live'}</button>
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
